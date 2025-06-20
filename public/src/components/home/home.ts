import {
    createButtonElement,
    createFormElement,
    createInputElement,
    createSelectElement,
    createSeparator,
} from "../generals/createElements";
import { sendGetRequest } from "../generals/generalUse";
import { createExamPage } from "../createExam/createExam";

// Function to get user session data
function getUserSession() {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
        try {
            return JSON.parse(sessionData);
        } catch (error) {
            console.error('Error parsing session data:', error);
            return null;
        }
    }
    return null;
}

// Function to load planned exams from the backend with enhanced debugging
async function loadPlannedExams(userId?: number) {
    try {
        console.log('🔍 Loading all planned exams...');
        const response = await sendGetRequest('http://localhost:3000/api/exams');
        console.log('📡 Full API Response:', response);
        
        if (response && response.exams && Array.isArray(response.exams)) {
            console.log(`✅ Found ${response.exams.length} total exams in database`);
            
            // Log each exam with details
            response.exams.forEach((exam: any, index: number) => {
                const examDate = new Date(exam.examDate);
                const now = new Date();
                const isInFuture = examDate > now;
                const daysDiff = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                console.log(`📝 Exam ${index + 1}:`, {
                    title: exam.title,
                    subject: exam.subject?.name || 'No Subject',
                    date: exam.examDate,
                    formattedDate: examDate.toLocaleDateString(),
                    creator: exam.creator?.name || 'Unknown',
                    isInFuture: isInFuture,
                    daysDiff: daysDiff
                });
            });
            
            return response.exams;
        } else {
            console.warn('⚠️ No exams found in response or invalid format:', response);
            return [];
        }
    } catch (error) {
        console.error('❌ Error loading exams:', error);
        return [];
    }
}

// Function to determine exam urgency level based on your idee.txt requirements
function getExamUrgency(examDate: string): { urgency: string, color: string, daysDiff: number } {
    const exam = new Date(examDate);
    const now = new Date();
    const daysDiff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
        return { urgency: 'past', color: '#95a5a6', daysDiff }; // Gray for past exams
    } else if (daysDiff === 0) {
        return { urgency: 'today', color: '#000000', daysDiff }; // Black (giorno con esame -> nero)
    } else if (daysDiff <= 3) {
        return { urgency: 'urgent', color: '#e74c3c', daysDiff }; // Red (<= 3 giorni con esame -> rosso)
    } else if (daysDiff <= 5) {
        return { urgency: 'soon', color: '#f39c12', daysDiff }; // Orange (<= 5 giorni con esame -> arancione)
    } else {
        return { urgency: 'normal', color: '#2ecc71', daysDiff }; // Green (else -> verde)
    }
}

// Function to format exam display with all details
function formatExamItem(exam: any): string {
    try {
        const examDate = new Date(exam.examDate);
        const formattedDate = examDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = examDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        const subjectName = exam.subject?.name || 'No Subject';
        const creatorName = exam.creator?.name || exam.creator?.username || 'Unknown';
        
        return `${exam.title} | ${subjectName} | ${formattedDate} at ${formattedTime} | ${exam.duration}min | By: ${creatorName}`;
    } catch (error) {
        console.error('Error formatting exam item:', error);
        return `${exam.title || 'Unknown Exam'} - Error formatting details`;
    }
}

export async function createHomePage() {
    console.log('🏠 Creating home page...');
    
    // Import CSS
    if (!document.querySelector('link[href*="home.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/components/home/home.css';
        document.head.appendChild(link);
    }
    
    // Get user session data
    const userSession = getUserSession();
    console.log('👤 User session:', userSession);
    
    let homeDiv = document.createElement("div");
    homeDiv.id = "homeDiv";
    homeDiv.className = "home-container";

    // Top Navigation Bar
    let topNavBar = document.createElement("nav");
    topNavBar.id = "topNavBar";
    topNavBar.className = "top-nav";

    let homeButton = createButtonElement("homeButton", "Home", () => {
        createHomePage();
    });
    
    let profileButton = createButtonElement("profileButton", "Profile", () => {
        console.log("Navigate to profile");
    });
    
    let logoutButton = createButtonElement("logoutButton", "Logout", () => {
        localStorage.removeItem("userSession");
        localStorage.removeItem("userToken");
        window.location.reload();
    });

    topNavBar.appendChild(homeButton);
    topNavBar.appendChild(profileButton);
    topNavBar.appendChild(logoutButton);

    // Profile Section
    let profileSection = document.createElement("div");
    profileSection.id = "profileSection";

    let pfp = document.createElement("img");
    pfp.src = userSession?.picture || "https://empowher.org/wp-content/uploads/2021/03/image-placeholder-350x350-1.png";
    pfp.alt = "Profile Picture";
    pfp.className = "profile-picture";

    let infoDiv = document.createElement("div");
    infoDiv.className = "profile-info";
    let username = document.createElement("h1");
    username.textContent = userSession?.name ? `Welcome, ${userSession.name}!` : "Welcome, User!";
    username.className = "profile-username";
    let email = document.createElement("p");
    email.textContent = userSession?.email || "email@example.com";
    email.className = "profile-email";
    let role = document.createElement("p");
    role.textContent = `Role: ${userSession?.role || 'User'}`;
    role.className = "profile-role";

    profileSection.appendChild(pfp);
    infoDiv.appendChild(username);
    infoDiv.appendChild(email);
    infoDiv.appendChild(role);
    profileSection.appendChild(infoDiv);

    // Main Content Area
    let mainContent = document.createElement("main");
    mainContent.className = "main-content";
    
    // Quick Actions Section
    let actionsSection = document.createElement("section");
    actionsSection.className = "actions-section";
    
    let actionsTitle = document.createElement("h2");
    actionsTitle.textContent = "Quick Actions";
    actionsTitle.className = "section-title";
    
    let actionsGrid = document.createElement("div");
    actionsGrid.className = "actions-grid";
    
    // Action Cards
    let viewExamsButton = createButtonElement("viewExamsButton", "View Exams", () => {
        console.log("Navigate to exams view");
    });
    viewExamsButton.className = "action-card";
    
    let createExamsButton = createButtonElement("createExamsButton", "Create Exam", () => {
        createExamPage();
    });
    createExamsButton.className = "action-card";
    
    let reportsButton = createButtonElement("reportsButton", "Reports", () => {
        console.log("Navigate to reports");
    });
    reportsButton.className = "action-card";
    
    let settingsButton = createButtonElement("settingsButton", "Settings", () => {
        console.log("Navigate to settings");
    });
    settingsButton.className = "action-card";
    
    actionsGrid.appendChild(viewExamsButton);
    actionsGrid.appendChild(createExamsButton);
    actionsGrid.appendChild(reportsButton);
    actionsGrid.appendChild(settingsButton);
    
    actionsSection.appendChild(actionsTitle);
    actionsSection.appendChild(actionsGrid);
    
    // Planned Exams Section
    let plannedExamsSection = document.createElement("section");
    plannedExamsSection.className = "planned-exams-section";

    let plannedExamsTitle = document.createElement("h2");
    plannedExamsTitle.textContent = "All Planned Exams";
    plannedExamsTitle.className = "section-title";
    
    let plannedExamsList = document.createElement("ul");
    plannedExamsList.className = "planned-exams-list";

    // Show loading message
    let loadingItem = document.createElement("li");
    loadingItem.textContent = "Loading exams...";
    loadingItem.style.fontStyle = "italic";
    loadingItem.style.color = "#3498db";
    loadingItem.id = "loading-exams";
    plannedExamsList.appendChild(loadingItem);

    plannedExamsSection.appendChild(plannedExamsTitle);
    plannedExamsSection.appendChild(plannedExamsList);
    
    // Assemble the page first
    mainContent.appendChild(actionsSection);
    mainContent.appendChild(plannedExamsSection);
    
    homeDiv.appendChild(topNavBar);
    homeDiv.appendChild(profileSection);
    homeDiv.appendChild(mainContent);
    
    // Clear and append to content
    document.getElementById("content")!.innerHTML = "";
    document.getElementById("content")!.appendChild(homeDiv);

    // Load exams after page is rendered
    console.log('📡 Starting to load ALL exams...');
    try {
        const exams = await loadPlannedExams(userSession?.id);
        
        // Clear loading message
        plannedExamsList.innerHTML = '';
        
        if (exams && exams.length > 0) {
            console.log(`✅ Displaying ${exams.length} total exams`);
            
            // Sort exams by date (earliest first)
            exams.sort((a: any, b: any) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
            
            exams.forEach((exam: any, index: number) => {
                let examItem = document.createElement("li");
                examItem.textContent = formatExamItem(exam);
                
                // Get urgency info based on your idee.txt requirements
                const urgencyInfo = getExamUrgency(exam.examDate);
                examItem.classList.add(`exam-${urgencyInfo.urgency}`);
                
                // Apply color coding as per your idee.txt
                examItem.style.borderLeftColor = urgencyInfo.color;
                examItem.style.borderLeftWidth = "4px";
                examItem.style.borderLeftStyle = "solid";
                
                // Additional styling based on urgency
                switch(urgencyInfo.urgency) {
                    case 'past':
                        examItem.style.opacity = "0.6";
                        examItem.style.textDecoration = "line-through";
                        examItem.title = `Past exam (${Math.abs(urgencyInfo.daysDiff)} days ago)`;
                        break;
                    case 'today':
                        examItem.style.fontWeight = "bold";
                        examItem.style.backgroundColor = "#f8f9fa";
                        examItem.style.color = "#000000";
                        examItem.title = "Exam is TODAY!";
                        break;
                    case 'urgent':
                        examItem.style.fontWeight = "bold";
                        examItem.style.backgroundColor = "#fdf2f2";
                        examItem.title = `Urgent! Exam in ${urgencyInfo.daysDiff} days`;
                        break;
                    case 'soon':
                        examItem.style.backgroundColor = "#fffbf0";
                        examItem.title = `Coming soon - ${urgencyInfo.daysDiff} days`;
                        break;
                    default:
                        examItem.style.backgroundColor = "#f0fff4";
                        examItem.title = `${urgencyInfo.daysDiff} days until exam`;
                }
                
                plannedExamsList.appendChild(examItem);
            });
            
            // Add a summary at the top
            // let summaryItem = document.createElement("li");
            // summaryItem.style.fontWeight = "bold";
            // summaryItem.style.backgroundColor = "#e8f4fd";
            // summaryItem.style.borderLeftColor = "#3498db";
            // summaryItem.style.marginBottom = "1rem";
            // summaryItem.textContent = `📊 Total: ${exams.length} exams scheduled`;
            // plannedExamsList.insertBefore(summaryItem, plannedExamsList.firstChild);
            
        } else {
            console.log('ℹ️ No exams found, showing empty message');
            let noExamsItem = document.createElement("li");
            noExamsItem.textContent = "No exams scheduled yet. Click 'Create Exam' to add one!";
            noExamsItem.style.fontStyle = "italic";
            noExamsItem.style.color = "#7f8c8d";
            noExamsItem.style.textAlign = "center";
            noExamsItem.style.padding = "2rem";
            noExamsItem.style.backgroundColor = "#f8f9fa";
            noExamsItem.style.borderRadius = "8px";
            plannedExamsList.appendChild(noExamsItem);
        }
    } catch (error) {
        console.error('❌ Error loading planned exams:', error);
        // Clear loading message and show error
        plannedExamsList.innerHTML = '';
        let errorItem = document.createElement("li");
        errorItem.textContent = "Error loading exams. Please check the console and try again later.";
        errorItem.style.fontStyle = "italic";
        errorItem.style.color = "#e74c3c";
        errorItem.style.textAlign = "center";
        errorItem.style.padding = "2rem";
        errorItem.style.backgroundColor = "#fdf2f2";
        errorItem.style.borderRadius = "8px";
        plannedExamsList.appendChild(errorItem);
    }
}