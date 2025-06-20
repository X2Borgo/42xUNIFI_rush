import {
    createButtonElement,
    createInputElement,
    createFormElement,
    createSelectElement,
    createSeparator,
}	from "../generals/createElements";

import { sendPostRequest, sendGetRequest } from "../generals/generalUse";
import { createHomePage } from "../home/home";

// === FORM CREATION FUNCTIONS ===

function createTitleSection(): HTMLElement {
    let titleDiv = document.createElement("div");
    titleDiv.className = "input-group";

    let titleLabel = document.createElement("label");
    titleLabel.textContent = "Exam Title";
    titleLabel.className = "form-label";
    titleLabel.setAttribute("for", "titleInput");

    let titleInput = createInputElement("titleInput", "text", "Enter exam title (e.g., Mathematics Final Exam)");
    titleInput.className = "form-input";
    titleInput.required = true;

    titleDiv.appendChild(titleLabel);
    titleDiv.appendChild(titleInput);

    return titleDiv;
}

function createDescriptionSection(): HTMLElement {
    let descDiv = document.createElement("div");
    descDiv.className = "input-group";

    let descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Exam Description";
    descriptionLabel.className = "form-label";
    descriptionLabel.setAttribute("for", "descriptionInput");

    let descriptionInput = document.createElement("textarea");
    descriptionInput.id = "descriptionInput";
    descriptionInput.placeholder = "Enter a detailed description of the exam content and objectives";
    descriptionInput.required = true;
    descriptionInput.className = "form-textarea";
    descriptionInput.rows = 4;

    descDiv.appendChild(descriptionLabel);
    descDiv.appendChild(descriptionInput);

    return descDiv;
}

// New subject selection section
async function createSubjectSection(): Promise<HTMLElement> {
    let subjectDiv = document.createElement("div");
    subjectDiv.className = "input-group";

    let subjectLabel = document.createElement("label");
    subjectLabel.textContent = "Subject";
    subjectLabel.className = "form-label";
    subjectLabel.setAttribute("for", "subjectSelect");

    let subjectOptions: string[] = ["0|Select a subject..."];
    
    try {
        const response = await sendGetRequest('http://localhost:3000/api/subjects');
        if (response.subjects) {
            response.subjects.forEach((subject: any) => {
                subjectOptions.push(`${subject.id}|${subject.name}`);
            });
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
        // Add fallback options
        subjectOptions.push("1|Mathematics", "2|Physics", "3|Computer Science");
    }

    let subjectSelect = createSelectElement("subjectSelect", subjectOptions);
    subjectSelect.className = "form-select";
    subjectSelect.required = true;

    subjectDiv.appendChild(subjectLabel);
    subjectDiv.appendChild(subjectSelect);

    return subjectDiv;
}

// Update the createDurationSection function to use a select dropdown
function createDurationSection(): HTMLElement {
    let durationDiv = document.createElement("div");
    durationDiv.className = "input-group";

    let durationLabel = document.createElement("label");
    durationLabel.textContent = "Duration";
    durationLabel.className = "form-label";
    durationLabel.setAttribute("for", "durationSelect");

    // Generate duration options from 15 min to 2 hours (120 min) at 15-minute intervals
    let durationOptions: string[] = [];
    for (let minutes = 15; minutes <= 120; minutes += 15) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        let label;
        if (hours === 0) {
            label = `${minutes} minutes`;
        } else if (remainingMinutes === 0) {
            label = `${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            label = `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
        }
        
        durationOptions.push(`${minutes}|${label}`);
    }

    let durationSelect = createSelectElement("durationSelect", durationOptions);
    durationSelect.className = "form-select";
    durationSelect.required = true;
    // Set default to 60 minutes (1 hour)
    durationSelect.value = "60";

    durationDiv.appendChild(durationLabel);
    durationDiv.appendChild(durationSelect);

    return durationDiv;
}

async function createFormDiv(): Promise<HTMLElement> {
    let formDiv = document.createElement("div");
    formDiv.id = "formDiv";
    formDiv.className = "form-fields-left";

    formDiv.appendChild(createTitleSection());
    formDiv.appendChild(createDescriptionSection());
    formDiv.appendChild(await createSubjectSection());
    formDiv.appendChild(createDurationSection());
    
    return formDiv;
}

// === DATE AND TIME FUNCTIONS ===

function createDateSection(): HTMLElement {
    let dateInputDiv = document.createElement("div");
    dateInputDiv.className = "input-group";

    let dateLabel = document.createElement("label");
    dateLabel.textContent = "Exam Date";
    dateLabel.className = "form-label";
    dateLabel.setAttribute("for", "dateInput");

    let dateInput = createInputElement("dateInput", "date", "");
    dateInput.className = "form-input date-input";
    dateInput.required = true;
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.readOnly = true;

    dateInputDiv.appendChild(dateLabel);
    dateInputDiv.appendChild(dateInput);

    return dateInputDiv;
}

// Update the createTimeSection function to use a select dropdown
function createTimeSection(): HTMLElement {
    let timeInputDiv = document.createElement("div");
    timeInputDiv.className = "input-group";

    let timeLabel = document.createElement("label");
    timeLabel.textContent = "Exam Time";
    timeLabel.className = "form-label";
    timeLabel.setAttribute("for", "timeSelect");

    // Generate time options from 9:00 AM to 5:00 PM at 15-minute intervals
    let timeOptions: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            // Don't include times after 17:00 (5:00 PM)
            if (hour === 17 && minute > 0) break;
            
            const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayMinute = minute.toString().padStart(2, '0');
            const timeLabel = `${displayHour}:${displayMinute} ${ampm}`;
            
            timeOptions.push(`${timeValue}|${timeLabel}`);
        }
    }

    let timeSelect = createSelectElement("timeSelect", timeOptions);
    timeSelect.className = "form-select";
    timeSelect.required = true;
    // Set default to 10:00 AM
    timeSelect.value = "10:00";

    timeInputDiv.appendChild(timeLabel);
    timeInputDiv.appendChild(timeSelect);

    return timeInputDiv;
}

function createDateTimeContainer(): HTMLElement {
    let datetimeContainer = document.createElement("div");
    datetimeContainer.className = "datetime-container";

    datetimeContainer.appendChild(createDateSection());
    datetimeContainer.appendChild(createTimeSection());

    return datetimeContainer;
}

// === CALENDAR FUNCTIONS ===

let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let allExams: any[] = []; // Store all exams

// Enhanced calendar header with navigation
function createCalendarHeader(): HTMLElement {
    let calendarHeader = document.createElement("div");
    calendarHeader.className = "calendar-header";
    
    // Navigation container
    let navContainer = document.createElement("div");
    navContainer.className = "calendar-nav";
    
    // Previous month button
    let prevButton = document.createElement("button");
    prevButton.className = "calendar-nav-btn prev";
    prevButton.innerHTML = "‹";
    prevButton.title = "Previous month";
    prevButton.addEventListener('click', () => {
        navigateMonth(-1);
    });
    
    // Month/year display
    let monthDisplay = document.createElement("h4");
    monthDisplay.className = "calendar-month-display";
    monthDisplay.id = "calendarMonthDisplay";
    updateMonthDisplay(monthDisplay);
    
    // Next month button
    let nextButton = document.createElement("button");
    nextButton.className = "calendar-nav-btn next";
    nextButton.innerHTML = "›";
    nextButton.title = "Next month";
    nextButton.addEventListener('click', () => {
        navigateMonth(1);
    });
    
    navContainer.appendChild(prevButton);
    navContainer.appendChild(monthDisplay);
    navContainer.appendChild(nextButton);
    
    calendarHeader.appendChild(navContainer);

    return calendarHeader;
}

// Create calendar grid with day headers
function createCalendarGrid(): HTMLElement {
    let calendarGrid = document.createElement("div");
    calendarGrid.className = "calendar-grid";

    // Add day headers (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayHeaders.forEach(day => {
        let dayHeader = document.createElement("div");
        dayHeader.className = "calendar-day-header";
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Add calendar days
    addCalendarDays(calendarGrid);

    return calendarGrid;
}

// Function to navigate months
function navigateMonth(direction: number): void {
    currentCalendarMonth += direction;
    
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    } else if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    
    // Update the month display
    const monthDisplay = document.getElementById("calendarMonthDisplay");
    if (monthDisplay) {
        updateMonthDisplay(monthDisplay);
    }
    
    // Regenerate the calendar grid
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        // Clear existing content except headers
        const children = Array.from(calendarGrid.children);
        children.forEach((child, index) => {
            if (index >= 7) { // Keep the 7 day headers, remove everything else
                child.remove();
            }
        });
        
        // Add new calendar days for the current month
        addCalendarDays(calendarGrid as HTMLElement);
    }
}

// Function to update month display
function updateMonthDisplay(element: HTMLElement): void {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    element.textContent = `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
}

// Load exams from the backend
async function loadExams(): Promise<void> {
    try {
        console.log('📅 Loading exams for calendar...');
        const response = await sendGetRequest('http://localhost:3000/api/exams');
        
        if (response && response.exams) {
            allExams = response.exams;
            console.log(`✅ Loaded ${allExams.length} exams for calendar`);
            
            // Debug: Log exam dates to verify they're being parsed correctly
            allExams.forEach((exam, index) => {
                const examDate = new Date(exam.examDate);
                console.log(`Exam ${index + 1}: "${exam.title}"`);
                console.log(`  - Raw date: ${exam.examDate}`);
                console.log(`  - Parsed date: ${examDate}`);
                console.log(`  - Local date: ${examDate.getDate()}/${examDate.getMonth() + 1}/${examDate.getFullYear()}`);
                console.log(`  - UTC date: ${examDate.getUTCDate()}/${examDate.getUTCMonth() + 1}/${examDate.getUTCFullYear()}`);
            });
        } else {
            console.warn('⚠️ No exams found for calendar');
            allExams = [];
        }
    } catch (error) {
        console.error('❌ Error loading exams for calendar:', error);
        allExams = [];
    }
}

// Fix the getExamsForDate function to handle timezones correctly
function getExamsForDate(day: number, month: number, year: number): any[] {
    // Create target date in local timezone
    const targetDate = new Date(year, month, day);
    
    return allExams.filter(exam => {
        // Parse exam date and extract just the date part
        const examDate = new Date(exam.examDate);
        
        // Compare just the date parts (year, month, day) ignoring time and timezone
        const examYear = examDate.getFullYear();
        const examMonth = examDate.getMonth();
        const examDay = examDate.getDate();
        
        return examYear === year && examMonth === month && examDay === day;
    });
}

// Also fix the getExamProximity function
function getExamProximity(day: number, month: number, year: number): {
    withinThreeDays: boolean;
    withinFiveDays: boolean;
    closestExam: any | null;
    daysToClosestExam: number;
} {
    // Create target date at midnight local time
    const targetDate = new Date(year, month, day);
    const targetTime = targetDate.getTime();
    
    let closestExam = null;
    let minDistance = Infinity;
    
    // Check all exams to find the closest one
    allExams.forEach(exam => {
        // Create exam date at midnight local time for comparison
        const examDate = new Date(exam.examDate);
        const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
        const examTime = examDateOnly.getTime();
        
        const distance = Math.abs(examTime - targetTime);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestExam = exam;
        }
    });
    
    const daysToClosestExam = Math.ceil(minDistance / (1000 * 60 * 60 * 24));
    
    return {
        withinThreeDays: daysToClosestExam <= 3 && daysToClosestExam > 0,
        withinFiveDays: daysToClosestExam <= 5 && daysToClosestExam > 3,
        closestExam,
        daysToClosestExam
    };
}

// Enhanced addCalendarDays function to show exams
function addCalendarDays(calendarGrid: HTMLElement): void {
    const today = new Date();
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Add empty cells for days before the month starts
    for (let i = 0; i < startDay; i++) {
        let emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day empty";
        calendarGrid.appendChild(emptyDay);
    }

    // Add ALL days of the month with exam information
    for (let day = 1; day <= daysInMonth; day++) {
        let dayElement = createCalendarDay(day, currentCalendarMonth, currentCalendarYear, today);
        calendarGrid.appendChild(dayElement);
    }

    // Add empty cells at the end to complete the grid (42 cells total = 6 rows × 7 days)
    const totalCellsUsed = startDay + daysInMonth;
    const totalCells = 42; // 6 rows × 7 days
    const emptyCellsAtEnd = totalCells - totalCellsUsed;
    
    for (let i = 0; i < emptyCellsAtEnd; i++) {
        let emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day empty";
        calendarGrid.appendChild(emptyDay);
    }
}

// Enhanced calendar day creation with proximity-based color coding
function createCalendarDay(day: number, currentMonth: number, currentYear: number, today: Date): HTMLElement {
    let dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    
    // Create day number
    let dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day.toString();
    
    // Create exam indicators container
    let examIndicators = document.createElement("div");
    examIndicators.className = "exam-indicators";
    
    const dayDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get exams for this date
    const dayExams = getExamsForDate(day, currentMonth, currentYear);
    
    // Determine the color and clickability based on exam proximity
    const proximityInfo = getExamProximity(day, currentMonth, currentYear);
    
    // Apply styling based on proximity rules
    if (dayExams.length > 0) {
        // Day HAS an exam - BLACK and NOT clickable
        dayElement.classList.add("has-exam-today");
        dayElement.style.backgroundColor = "#2c3e50"; // Black/dark
        dayElement.style.color = "#ffffff";
        dayElement.style.cursor = "not-allowed";
        dayElement.title = `Exam day - Cannot schedule another exam`;
        
        // Add exam indicators for visual feedback
        dayExams.forEach((exam, index) => {
            let indicator = document.createElement("div");
            indicator.className = "exam-dot exam-today";
            indicator.title = `${exam.title} - ${exam.subject?.name || 'No Subject'}`;
            examIndicators.appendChild(indicator);
        });
        
    } else {
        // Day has NO exam - check proximity to other exams
        if (proximityInfo.withinThreeDays) {
            // Within 3 days of an exam - RED but clickable
            dayElement.classList.add("exam-proximity-close");
            dayElement.style.backgroundColor = "#e74c3c"; // Red
            dayElement.style.color = "#ffffff";
            dayElement.style.cursor = "pointer";
            dayElement.title = `Warning: Exam within 3 days (${proximityInfo.closestExam?.title})`;
            
        } else if (proximityInfo.withinFiveDays) {
            // Within 5 days of an exam - ORANGE but clickable
            dayElement.classList.add("exam-proximity-medium");
            dayElement.style.backgroundColor = "#f39c12"; // Orange
            dayElement.style.color = "#ffffff";
            dayElement.style.cursor = "pointer";
            dayElement.title = `Notice: Exam within 5 days (${proximityInfo.closestExam?.title})`;
            
        } else {
            // More than 5 days from any exam - GREEN and clickable
            dayElement.classList.add("exam-proximity-safe");
            dayElement.style.backgroundColor = "#27ae60"; // Green
            dayElement.style.color = "#ffffff";
            dayElement.style.cursor = "pointer";
            dayElement.title = `Safe to schedule exam`;
        }
        
        // Add click event only to days without exams
        if (dayDate >= todayDate) { // Only future dates
            dayElement.addEventListener('click', () => {
                handleCalendarDayClick(dayElement, day, currentMonth, currentYear);
            });
        }
    }
    
    // Handle past dates
    if (dayDate < todayDate) {
        dayElement.classList.add("past");
        dayElement.style.opacity = "0.4";
        dayElement.style.cursor = "not-allowed";
        dayElement.title = "Past date - Cannot schedule exam";
        // Remove click events for past dates
        dayElement.replaceWith(dayElement.cloneNode(true));
    }
    
    // Highlight today with a border
    if (dayDate.getTime() === todayDate.getTime()) {
        dayElement.classList.add("today");
        dayElement.style.border = "3px solid #ffffff";
        dayElement.style.boxShadow = "0 0 10px rgba(255,255,255,0.5)";
    }
    
    dayElement.appendChild(dayNumber);
    dayElement.appendChild(examIndicators);

    return dayElement;
}

// Also fix the click handler to ensure proper date handling
function handleCalendarDayClick(dayElement: HTMLElement, day: number, currentMonth: number, currentYear: number): void {
    // Don't allow selection of past dates
    if (dayElement.classList.contains('past')) {
        return;
    }
    
    // Don't allow selection of days with existing exams
    if (dayElement.classList.contains('has-exam-today')) {
        alert('Cannot schedule an exam on a day that already has an exam!');
        return;
    }
    
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
        // Reset the border for previously selected days
        if (!el.classList.contains('today')) {
            el.style.border = '';
            el.style.boxShadow = '';
        }
    });
    
    // Select this day
    dayElement.classList.add('selected');
    dayElement.style.border = "3px solid #ffffff";
    dayElement.style.boxShadow = "0 0 15px rgba(255,255,255,0.8)";
    
    // Update the date input with proper formatting
    const year = currentYear;
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    const dateInput = document.getElementById('dateInput') as HTMLInputElement;
    if (dateInput) {
        dateInput.value = dateString;
    }
    
    // Debug logging to check the date values
    console.log('Calendar click debug:');
    console.log('- Selected day:', day);
    console.log('- Calendar month (0-based):', currentMonth);
    console.log('- Calendar year:', currentYear);
    console.log('- Date string for input:', dateString);
    console.log('- Exams for this date:', getExamsForDate(day, currentMonth, currentYear));
    
    // Show proximity warning if needed
    const proximityInfo = getExamProximity(day, currentMonth, currentYear);
    if (proximityInfo.withinThreeDays) {
        const daysText = proximityInfo.daysToClosestExam === 1 ? 'day' : 'days';
        const confirmMessage = `Warning: You are scheduling an exam only ${proximityInfo.daysToClosestExam} ${daysText} away from "${proximityInfo.closestExam?.title}". Are you sure you want to continue?`;
        
        if (!confirm(confirmMessage)) {
            // User cancelled, deselect the date
            dayElement.classList.remove('selected');
            dayElement.style.border = '';
            dayElement.style.boxShadow = '';
            if (dateInput) {
                dateInput.value = '';
            }
            return;
        }
    } else if (proximityInfo.withinFiveDays) {
        const daysText = proximityInfo.daysToClosestExam === 1 ? 'day' : 'days';
        alert(`Notice: You are scheduling an exam ${proximityInfo.daysToClosestExam} ${daysText} away from "${proximityInfo.closestExam?.title}".`);
    }
    
    console.log(`Selected date: ${dateString}`);
}

// Update the createCalendarPlaceholder function to load exams
async function createCalendarPlaceholder(): Promise<HTMLElement> {
    let calendarDiv = document.createElement("div");
    calendarDiv.className = "calendar-placeholder";
    
    // Load exams before creating the calendar
    await loadExams();
    
    calendarDiv.appendChild(createCalendarHeader());
    calendarDiv.appendChild(createCalendarGrid());

    return calendarDiv;
}

// Update the createDateDiv function to be async
async function createDateDiv(): Promise<HTMLElement> {
    let dateDiv = document.createElement("div");
    dateDiv.id = "dateDiv";
    dateDiv.className = "form-fields-right";

    dateDiv.appendChild(createDateTimeContainer());
    dateDiv.appendChild(await createCalendarPlaceholder());

    return dateDiv;
}

// Create action buttons
function createActionButtons(): HTMLElement {
    let actionsDiv = document.createElement("div");
    actionsDiv.className = "form-actions";

    let submitButton = createButtonElement("submitExamButton", "Create Exam", submitExam);
    submitButton.className = "btn-submit";

    let cancelButton = createButtonElement("cancelExamButton", "Cancel", () => {
        if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
            createHomePage();
        }
    });
    cancelButton.className = "btn-cancel";

    actionsDiv.appendChild(submitButton);
    actionsDiv.appendChild(cancelButton);

    return actionsDiv;
}

// Create top navigation
function createTopNavigation(): HTMLElement {
    let topNav = document.createElement("nav");
    topNav.className = "top-nav";

    let homeButton = createButtonElement("homeButton", "← Back to Home", () => {
        createHomePage();
    });

    topNav.appendChild(homeButton);

    return topNav;
}

// Create page header
function createPageHeader(): HTMLElement {
    let header = document.createElement("header");
    header.className = "exam-header";

    let title = document.createElement("h1");
    title.textContent = "Create New Exam";
    title.className = "exam-title";

    let subtitle = document.createElement("p");
    subtitle.textContent = "Fill in the details below to schedule a new exam";
    subtitle.className = "exam-subtitle";

    header.appendChild(title);
    header.appendChild(subtitle);

    return header;
}

// Update the createMainForm function
async function createMainForm(): Promise<HTMLElement> {
    let examForm = createFormElement("examForm", "Exam Details");
    examForm.className = "exam-form";

    // Create horizontal container for formDiv and dateDiv
    let horizontalContainer = document.createElement("div");
    horizontalContainer.className = "form-horizontal-container";

    horizontalContainer.appendChild(await createFormDiv());
    horizontalContainer.appendChild(await createDateDiv()); // Make this async too

    // Separator
    let separator = createSeparator("2px", "#e0e0e0");
    separator.style.margin = "2rem 0";

    examForm.appendChild(horizontalContainer);
    examForm.appendChild(separator);
    examForm.appendChild(createActionButtons());

    return examForm;
}

async function createMainContent(): Promise<HTMLElement> {
    let mainContent = document.createElement("main");
    mainContent.className = "exam-main-content";

    mainContent.appendChild(await createMainForm());

    return mainContent;
}

// === UTILITY FUNCTIONS ===

function importCSS(): void {
    if (!document.querySelector('link[href*="createExam.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/components/createExam/createExam.css';
        document.head.appendChild(link);
    }
}

function getUserSession(): { id: number } {
    const userSession = localStorage.getItem('userSession');
    let creatorId = 1; // Default fallback
    
    if (userSession) {
        try {
            const session = JSON.parse(userSession);
            creatorId = session.id;
        } catch (error) {
            console.error('Error parsing user session:', error);
        }
    }

    return { id: creatorId };
}

// Update the getFormData function to handle select elements including subject
function getFormData(): { 
    dateInput: HTMLInputElement, 
    timeSelect: HTMLSelectElement, 
    titleInput: HTMLInputElement, 
    descriptionInput: HTMLTextAreaElement, 
    durationSelect: HTMLSelectElement,
    subjectSelect: HTMLSelectElement
} {
    return {
        dateInput: document.getElementById("dateInput") as HTMLInputElement,
        timeSelect: document.getElementById("timeSelect") as HTMLSelectElement,
        titleInput: document.getElementById("titleInput") as HTMLInputElement,
        descriptionInput: document.getElementById("descriptionInput") as HTMLTextAreaElement,
        durationSelect: document.getElementById("durationSelect") as HTMLSelectElement,
        subjectSelect: document.getElementById("subjectSelect") as HTMLSelectElement
    };
}

// Update the validateFormData function for select elements including subject
function validateFormData(formData: ReturnType<typeof getFormData>): boolean {
    const { titleInput, descriptionInput, dateInput, timeSelect, subjectSelect } = formData;
    
    if (!titleInput.value || !descriptionInput.value || !dateInput.value || !timeSelect.value) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    if (subjectSelect.value === "0") {
        alert('Please select a subject.');
        return false;
    }
    
    return true;
}

// Update the createExamData function to include subject_id
function createExamData(formData: ReturnType<typeof getFormData>, creatorId: number): object {
    const { titleInput, descriptionInput, dateInput, timeSelect, durationSelect, subjectSelect } = formData;
    
    const examDateTime = `${dateInput.value}T${timeSelect.value}:00`;

    return {
        title: titleInput.value,
        description: descriptionInput.value,
        creator_id: creatorId,
        subject_id: parseInt(subjectSelect.value) || null, // Include subject_id
        exam_date: examDateTime,
        duration: parseInt(durationSelect.value) || 60,
    };
}

function setSubmitButtonState(disabled: boolean, text: string): void {
    const submitButton = document.getElementById("submitExamButton") as HTMLButtonElement;
    if (submitButton) {
        submitButton.disabled = disabled;
        submitButton.textContent = text;
    }
}

// === MAIN SUBMISSION FUNCTION ===

async function submitExam(event: Event): Promise<void> {
    if (event) event.preventDefault();
        
    const userSession = getUserSession();
    const formData = getFormData();

    if (!validateFormData(formData)) {
        return;
    }

    const examData = createExamData(formData, userSession.id);

    try {
        console.log('Sending exam data:', examData);
        
        setSubmitButtonState(true, "Creating...");
        
        const response = await sendPostRequest('http://localhost:3000/api/exams', examData, "application/json");
        
        if (response.exam) {
            alert(`Exam "${response.exam.title}" created successfully!`);
            createHomePage();
        } else {
            alert('Failed to create exam: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating exam:', error);
        alert('An error occurred while creating the exam. Please try again.');
    } finally {
        setSubmitButtonState(false, "Create Exam");
    }
}

// === MAIN EXPORT FUNCTION ===

export async function createExamPage(): Promise<void> {
    importCSS();

    let examDiv = document.createElement("div");
    examDiv.id = "examDiv";
    examDiv.className = "exam-container";

    examDiv.appendChild(createTopNavigation());
    examDiv.appendChild(createPageHeader());
    examDiv.appendChild(await createMainContent());

    // Clear and append to content
    document.getElementById("content")!.innerHTML = "";
    document.getElementById("content")!.appendChild(examDiv);
}