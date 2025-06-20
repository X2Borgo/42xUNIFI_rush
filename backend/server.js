// Import the framework and instantiate it
import Fastify from 'fastify'
import { PrismaClient } from '../generated/prisma/index.js'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true
})

// Initialize Prisma Client
const prisma = new PrismaClient()

// Register CORS
await fastify.register(cors, {
  origin: true // Allow all origins in development
})

// Add Prisma to Fastify context
fastify.decorate('prisma', prisma)

// Graceful shutdown
fastify.addHook('onClose', async (instance) => {
  await instance.prisma.$disconnect()
})

// Health check route
fastify.get('/', async function handler(request, reply) {
  return { 
    hello: 'world', 
    database: 'connected with Prisma',
    timestamp: new Date().toISOString()
  }
})

// User routes
fastify.get('/api/users', async function (request, reply) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLogin: true
      }
    })
    return { users }
  } catch (error) {
    reply.code(500).send({ error: error.message })
  }
})

fastify.post('/api/users', async function (request, reply) {
  try {
    const { username, email, password, role = 'student', name } = request.body
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        name,
        role
      }
    })
    
    return { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      name: user.name,
      role: user.role,
      message: 'User created successfully' 
    }
  } catch (error) {
    if (error.code === 'P2002') {
      reply.code(400).send({ error: 'Username or email already exists' })
    } else {
      reply.code(500).send({ error: error.message })
    }
  }
})

// Enhanced Google login route
fastify.post('/api/auth/google', async function (request, reply) {
  try {
    const { 
      google_id, 
      email, 
      name, 
      picture, 
      access_token 
    } = request.body
    
    console.log('Google auth request:', { email, name })
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    let user
    let isNewUser = false
    
    if (existingUser) {
      // User exists - update login info
      user = await prisma.user.update({
        where: { email },
        data: {
          lastLogin: new Date(),
          accessToken: access_token,
          picture: picture,
          // Update Google ID if it wasn't set before
          googleId: existingUser.googleId || google_id
        }
      })
      console.log('Existing user logged in:', user.email)
    } else {
      // New user - create account
      user = await prisma.user.create({
        data: {
          email,
          name,
          picture,
          googleId: google_id,
          loginType: 'google',
          accessToken: access_token,
          username: email.split('@')[0], // Generate username from email
          role: 'student' // Default role for new users
        }
      })
      isNewUser = true
      console.log('New user created:', user.email)
    }
    
    return { 
      success: true, 
      isNewUser: isNewUser,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        username: user.username
      },
      message: isNewUser ? 'Account created successfully' : 'Welcome back!'
    }
  } catch (error) {
    console.error('Google auth error:', error)
    reply.code(500).send({ 
      success: false, 
      error: error.message || 'Authentication failed' 
    })
  }
})

// Login route
fastify.post('/api/auth/login', async function (request, reply) {
  try {
    const { username, password } = request.body
    
    console.log('Login attempt:', { username, password: password ? 'provided' : 'missing' })
    
    // Validate required fields
    if (!username || !password) {
      reply.code(400).send({ 
        success: false, 
        error: 'Username and password are required' 
      })
      return
    }
    
    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    })
    
    if (!user) {
      console.log('User not found:', username)
      reply.code(401).send({ 
        success: false, 
        error: 'Invalid username or password' 
      })
      return
    }
    
    // Check password (in production, you should hash passwords!)
    if (user.password !== password) {
      console.log('Invalid password for user:', username)
      reply.code(401).send({ 
        success: false, 
        error: 'Invalid username or password' 
      })
      return
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })
    
    console.log('Login successful for user:', user.username)
    
    return { 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      },
      message: 'Login successful'
    }
    
  } catch (error) {
    console.error('Login error:', error)
    reply.code(500).send({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Registration route
fastify.post('/api/auth/register', async function (request, reply) {
  try {
    const { username, email, password, name } = request.body
    
    console.log('Registration attempt:', { username, email, name })
    
    // Validate required fields
    if (!username || !email || !password) {
      reply.code(400).send({ 
        success: false, 
        error: 'Username, email, and password are required' 
      })
      return
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    })
    
    if (existingUser) {
      reply.code(400).send({ 
        success: false, 
        error: 'Username or email already exists' 
      })
      return
    }
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password, // In production, hash this!
        name: name || username,
        role: 'student',
        loginType: 'local'
      }
    })
    
    console.log('User registered successfully:', user.username)
    
    return { 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Registration successful'
    }
    
  } catch (error) {
    console.error('Registration error:', error)
    reply.code(500).send({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Subject routes
fastify.get('/api/subjects', async function (request, reply) {
  try {
    console.log('📚 Fetching subjects...');
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    console.log(`✅ Found ${subjects.length} subjects`);
    return { subjects };
  } catch (error) {
    console.error('❌ Error fetching subjects:', error);
    reply.code(500).send({ 
      error: 'Failed to fetch subjects',
      details: error.message 
    });
  }
})

fastify.post('/api/subjects', async function (request, reply) {
  try {
    const { name, description, semester = 1 } = request.body
    
    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        semester
      }
    })
    
    return { 
      subject,
      message: 'Subject created successfully' 
    }
  } catch (error) {
    if (error.code === 'P2002') {
      reply.code(400).send({ error: 'Subject name already exists' })
    } else {
      reply.code(500).send({ error: error.message })
    }
  }
})

fastify.get('/api/subjects/:id', async function (request, reply) {
  try {
    const { id } = request.params
    
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: {
        exams: {
          include: {
            creator: {
              select: {
                username: true,
                name: true
              }
            }
          }
        }
      }
    })
    
    if (!subject) {
      reply.code(404).send({ error: 'Subject not found' })
      return
    }
    
    return { subject }
  } catch (error) {
    reply.code(500).send({ error: error.message })
  }
})

// Exam routes
fastify.get('/api/exams', async function (request, reply) {
  try {
    console.log('📡 API Request: Fetching all exams from database...');
    const exams = await prisma.exam.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            semester: true
          }
        }
      },
      orderBy: {
        examDate: 'asc'
      }
    });
    
    console.log(`✅ Found ${exams.length} exams in database`);
    exams.forEach((exam, index) => {
      console.log(`📝 Exam ${index + 1}: "${exam.title}" - ${exam.examDate} - Subject: ${exam.subject?.name || 'None'} - Creator: ${exam.creator?.name || 'Unknown'}`);
    });
    
    return { exams };
  } catch (error) {
    console.error('❌ Error fetching exams:', error);
    reply.code(500).send({ 
      error: 'Failed to fetch exams',
      details: error.message 
    });
  }
})

fastify.post('/api/exams', async function (request, reply) {
  try {
    console.log('📝 Creating exam with data:', request.body);
    
    const { title, description, creator_id, subject_id, exam_date, duration = 60 } = request.body;
    
    // Validate required fields
    if (!title || !description || !creator_id || !exam_date) {
      console.error('❌ Missing required fields:', { title: !!title, description: !!description, creator_id: !!creator_id, exam_date: !!exam_date });
      reply.code(400).send({ error: 'Missing required fields' });
      return;
    }
    
    // Validate creator exists
    const creator = await prisma.user.findUnique({
      where: { id: parseInt(creator_id) }
    });
    
    if (!creator) {
      console.error('❌ Creator not found:', creator_id);
      reply.code(400).send({ error: 'Creator not found' });
      return;
    }
    
    // Validate subject exists (if provided)
    if (subject_id) {
      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(subject_id) }
      });
      
      if (!subject) {
        console.error('❌ Subject not found:', subject_id);
        reply.code(400).send({ error: 'Subject not found' });
        return;
      }
    }
    
    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        creatorId: parseInt(creator_id),
        subjectId: subject_id ? parseInt(subject_id) : null,
        examDate: new Date(exam_date),
        duration: parseInt(duration)
      },
      include: {
        creator: {
          select: {
            username: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('✅ Exam created successfully:', exam.title);
    
    return { 
      exam,
      message: 'Exam created successfully' 
    };
  } catch (error) {
    console.error('❌ Error creating exam:', error);
    reply.code(500).send({ 
      error: 'Failed to create exam',
      details: error.message 
    });
  }
})

fastify.get('/api/exams/:id', async function (request, reply) {
  try {
    const { id } = request.params
    
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: {
            username: true,
            name: true
          }
        },
        subject: {
          select: {
            name: true
          }
        }
      }
    })
    
    if (!exam) {
      reply.code(404).send({ error: 'Exam not found' })
      return
    }
    
    return { exam }
  } catch (error) {
    reply.code(500).send({ error: error.message })
  }
})

// Run the server
try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' })
  console.log('🚀 Server running on http://localhost:3000')
  console.log('📊 Prisma Studio: npx prisma studio')
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}