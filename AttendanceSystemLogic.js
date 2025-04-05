// Initialize variables for tracking attendance data
let students = [];
let attendanceData = {};

// DOM Elements
const currentDateInput = document.getElementById('currentDate');
const searchInput = document.getElementById('searchInput');
const studentsTableBody = document.getElementById('studentsTableBody');
const addStudentBtn = document.getElementById('addStudentBtn');
const exportBtn = document.getElementById('exportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const studentModal = document.getElementById('studentModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const studentNameInput = document.getElementById('studentName');
const studentRollNoInput = document.getElementById('studentRollNo');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const cancelBtn = document.getElementById('cancelBtn');
const errorMessage = document.getElementById('errorMessage');

// Summary elements
const presentCountElement = document.getElementById('presentCount');
const absentCountElement = document.getElementById('absentCount');
const lateCountElement = document.getElementById('lateCount');
const totalStudentsElement = document.getElementById('totalStudents');

// Set current date as default
const today = new Date();
const formattedDate = today.toISOString().split('T')[0];
currentDateInput.value = formattedDate;

// Load data from localStorage
function loadData() {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }

    const savedAttendance = localStorage.getItem('attendanceData');
    if (savedAttendance) {
        attendanceData = JSON.parse(savedAttendance);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    
    // Also save in the format needed by view-attendance.html
    const formattedData = students.map(student => {
        const attendanceHistory = [];
        
        // Convert date-based attendance to array format
        for (const date in attendanceData) {
            if (attendanceData[date][student.id]) {
                // Convert 'present' to 'Present' and 'absent' to 'Absent' for compatibility
                const status = attendanceData[date][student.id] === 'present' ? 'Present' : 'Absent';
                attendanceHistory.push(status);
            }
        }
        
        return {
            name: student.name,
            rollNo: student.rollNo,
            attendanceHistory: attendanceHistory
        };
    });
    
    localStorage.setItem('papyrusAttendanceData', JSON.stringify(formattedData));
}

// Add a new student
function addStudent(name, rollNo) {
    const student = {
        id: Date.now().toString(),
        name: name,
        rollNo: rollNo,
        attendance: {}
    };
    
    students.push(student);
    saveData();
    renderStudents();
}

// Mark attendance for a student
function markAttendance(studentId, status) {
    const date = currentDateInput.value;
    
    if (!attendanceData[date]) {
        attendanceData[date] = {};
    }
    
    attendanceData[date][studentId] = status;
    saveData();
    renderStudents();
}

// Calculate attendance percentage for a student
function calculateAttendancePercentage(studentId) {
    let totalDays = 0;
    let presentDays = 0;
    
    for (const date in attendanceData) {
        if (attendanceData[date][studentId]) {
            totalDays++;
            if (attendanceData[date][studentId] === 'present') {
                presentDays++;
            }
        }
    }
    
    if (totalDays === 0) return 0;
    return Math.round((presentDays / totalDays) * 100);
}

// Render students table
function renderStudents() {
    const date = currentDateInput.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    studentsTableBody.innerHTML = '';
    
    // Filter students based on search term
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) || 
        student.rollNo.toLowerCase().includes(searchTerm)
    );
    
    // If no data, show message
    if (filteredStudents.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `
            <td colspan="5" class="no-results">No students found. Add a student to get started.</td>
        `;
        studentsTableBody.appendChild(noDataRow);
        updateSummary();
        return;
    }
    
    // Add students to table
    filteredStudents.forEach(student => {
        const todayStatus = attendanceData[date] ? attendanceData[date][student.id] : null;
        const attendancePercentage = calculateAttendancePercentage(student.id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="student-name">${student.name}</td>
            <td>${student.rollNo}</td>
            <td class="attendance-actions">
                <div class="button-group">
                    <button class="btn ${todayStatus === 'present' ? 'btn-active' : ''} btn-present" 
                            onclick="markAttendance('${student.id}', 'present')">Present</button>
                    <button class="btn ${todayStatus === 'absent' ? 'btn-active' : ''} btn-absent" 
                            onclick="markAttendance('${student.id}', 'absent')">Absent</button>
                </div>
            </td>
            <td class="status-cell">
                ${renderStatusBadge(todayStatus)}
            </td>
            <td class="percentage-cell">
                <div class="percentage-bar-container">
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${attendancePercentage}%"></div>
                    </div>
                    <span class="percentage-text">${attendancePercentage}%</span>
                </div>
            </td>
        `;
        
        studentsTableBody.appendChild(row);
    });
    
    updateSummary();
}

// Render status badge
function renderStatusBadge(status) {
    if (!status) {
        return `<span class="status-badge status-not-marked">Not Marked</span>`;
    }
    
    return `<span class="status-badge status-${status}">${status}</span>`;
}

// Update summary counters
function updateSummary() {
    const date = currentDateInput.value;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    
    if (attendanceData[date]) {
        for (const studentId in attendanceData[date]) {
            const status = attendanceData[date][studentId];
            if (status === 'present') presentCount++;
            if (status === 'absent') absentCount++;
            if (status === 'late') lateCount++;
        }
    }
    
    presentCountElement.textContent = presentCount;
    absentCountElement.textContent = absentCount;
    lateCountElement.textContent = lateCount;
    totalStudentsElement.textContent = students.length;
}

// Export attendance data to Excel
function exportToExcel() {
    const data = [];
    
    // Create header row
    const headerRow = ['Name', 'Roll No'];
    const dates = Object.keys(attendanceData).sort();
    headerRow.push(...dates, 'Attendance %');
    
    data.push(headerRow);
    
    // Add student data
    students.forEach(student => {
        const studentRow = [student.name, student.rollNo];
        
        dates.forEach(date => {
            const status = attendanceData[date][student.id] || 'Not Marked';
            studentRow.push(status);
        });
        
        studentRow.push(`${calculateAttendancePercentage(student.id)}%`);
        data.push(studentRow);
    });
    
    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    
    // Save file
    XLSX.writeFile(wb, `Attendance_${currentDateInput.value}.xlsx`);
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        students = [];
        attendanceData = {};
        saveData();
        renderStudents();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderStudents();
    
    // Date change
    currentDateInput.addEventListener('change', renderStudents);
    
    // Search
    searchInput.addEventListener('input', renderStudents);
    
    // Add student button
    addStudentBtn.addEventListener('click', () => {
        studentModal.style.display = 'flex';
        studentNameInput.value = '';
        studentRollNoInput.value = '';
        errorMessage.style.display = 'none';
    });
    
    // Close modal
    closeModalBtn.addEventListener('click', () => {
        studentModal.style.display = 'none';
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', () => {
        studentModal.style.display = 'none';
    });
    
    // Confirm add button
    confirmAddBtn.addEventListener('click', () => {
        const name = studentNameInput.value.trim();
        const rollNo = studentRollNoInput.value.trim();
        
        if (!name || !rollNo) {
            errorMessage.textContent = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Check if roll number already exists
        const rollNoExists = students.some(student => student.rollNo === rollNo);
        if (rollNoExists) {
            errorMessage.textContent = 'Roll number already exists.';
            errorMessage.style.display = 'block';
            return;
        }
        
        addStudent(name, rollNo);
        studentModal.style.display = 'none';
    });
    
    // Export button
    exportBtn.addEventListener('click', exportToExcel);
    
    // Clear all button
    clearAllBtn.addEventListener('click', clearAllData);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === studentModal) {
            studentModal.style.display = 'none';
        }
    });
});

// Expose functions to global scope for onclick handlers
window.markAttendance = markAttendance;