import { PrismaClient } from './generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.exam.deleteMany({})
    await prisma.subject.deleteMany({})
    await prisma.user.deleteMany({})
  } catch (error) {
    console.log('⚠️  No existing data to clear')
  }
  
  // Create subjects
  console.log('📚 Creating subjects...')
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      description: 'Pure and applied mathematics courses',
      semester: 1
    }
  })

  const physicsSubject = await prisma.subject.create({
    data: {
      name: 'Physics',
      description: 'Physics and engineering courses',
      semester: 1
    }
  })

  const computerScienceSubject = await prisma.subject.create({
    data: {
      name: 'Computer Science',
      description: 'Programming and computer science courses',
      semester: 2
    }
  })

  // Create test users
  console.log('👥 Creating users...')
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@test.com',
      name: 'Administrator',
      role: 'admin',
      password: 'admin',  // Simple password for testing
      loginType: 'local'
    }
  })

  const teacherUser = await prisma.user.create({
    data: {
      username: 'teacher',
      email: 'teacher@test.com',
      name: 'Test Teacher',
      role: 'teacher',
      password: 'password',  // Simple password for testing
      loginType: 'local'
    }
  })

  const studentUser = await prisma.user.create({
    data: {
      username: 'student',
      email: 'student@test.com',
      name: 'Test Student',
      role: 'student',
      password: 'password',  // Simple password for testing
      loginType: 'local'
    }
  })

  console.log('✅ Test users created:')
  console.log('   - admin / admin')
  console.log('   - teacher / password')
  console.log('   - student / password')

  // Create test exams with SUBJECTS included
  console.log('📝 Creating exams...')
  await prisma.exam.create({
    data: {
      title: 'Calculus Final Exam',
      description: 'Final examination covering differential and integral calculus',
      creatorId: teacherUser.id,
      subjectId: mathSubject.id, // Include subject
      examDate: new Date('2025-07-15T10:00:00'),
      duration: 120
    }
  })

  await prisma.exam.create({
    data: {
      title: 'Quantum Physics Midterm',
      description: 'Midterm examination on quantum mechanics principles',
      creatorId: teacherUser.id,
      subjectId: physicsSubject.id, // Include subject
      examDate: new Date('2025-07-20T14:00:00'),
      duration: 90
    }
  })

  await prisma.exam.create({
    data: {
      title: 'Data Structures Quiz',
      description: 'Quick quiz on arrays, linked lists, and trees',
      creatorId: adminUser.id,
      subjectId: computerScienceSubject.id, // Include subject
      examDate: new Date('2025-07-25T09:00:00'),
      duration: 60
    }
  })

  await prisma.exam.create({
    data: {
      title: 'Algebra Test',
      description: 'Basic algebra concepts and problem solving',
      creatorId: teacherUser.id,
      subjectId: mathSubject.id, // Include subject
      examDate: new Date('2025-08-01T11:00:00'),
      duration: 90
    }
  })

  await prisma.exam.create({
    data: {
      title: 'Programming Fundamentals',
      description: 'Introduction to programming concepts',
      creatorId: adminUser.id,
      subjectId: computerScienceSubject.id, // Include subject
      examDate: new Date('2025-08-05T15:30:00'),
      duration: 75
    }
  })

  await prisma.exam.create({
    data: {
      title: 'Thermodynamics Exam',
      description: 'Heat transfer and energy conservation principles',
      creatorId: teacherUser.id,
      subjectId: physicsSubject.id, // Include subject
      examDate: new Date('2025-08-10T13:00:00'),
      duration: 105
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('📊 Created:')
  console.log('   - 3 subjects')
  console.log('   - 3 users')
  console.log('   - 6 exams (all with subjects)')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })