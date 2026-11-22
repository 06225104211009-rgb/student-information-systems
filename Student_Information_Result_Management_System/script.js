// Student Information & Result Management System
// This project uses browser LocalStorage, so data stays in this browser.

const sampleStudents = [
  { name: "Sabit Ahmed", id: "MIS-2021-001", department: "MIS", semester: "5th", email: "sabit@example.com", phone: "01700000001" },
  { name: "Raisa Kabir", id: "MIS-2021-002", department: "MIS", semester: "5th", email: "raisa@example.com", phone: "01700000002" },
  { name: "Rakibul Islam", id: "MIS-2021-003", department: "MIS", semester: "5th", email: "rakib@example.com", phone: "01700000003" },
  { name: "Monowar Hossain", id: "MIS-2021-004", department: "MIS", semester: "5th", email: "monowar@example.com", phone: "01700000004" },
  { name: "Amirul Islam", id: "MIS-2021-005", department: "MIS", semester: "5th", email: "amirul@example.com", phone: "01700000005" }
];
const sampleMarks = [
  { studentId: "MIS-2021-001", course: "Database Management", exam: "Final", marks: 88 },
  { studentId: "MIS-2021-002", course: "Operating System", exam: "Final", marks: 82 },
  { studentId: "MIS-2021-003", course: "Business Finance", exam: "Midterm", marks: 74 },
  { studentId: "MIS-2021-004", course: "Marketing", exam: "Final", marks: 61 },
  { studentId: "MIS-2021-005", course: "Web Development", exam: "Final", marks: 91 }
];

let students = JSON.parse(localStorage.getItem("kyauStudents")) || [...sampleStudents];
let marksList = JSON.parse(localStorage.getItem("kyauMarks")) || [...sampleMarks];
let editingStudentId = null;

function saveData() {
  localStorage.setItem("kyauStudents", JSON.stringify(students));
  localStorage.setItem("kyauMarks", JSON.stringify(marksList));
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === pageId));
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.page === pageId));
  document.getElementById("sidebar").classList.remove("open");
  if (pageId === "marksEntry") populateStudentOptions();
  renderAll();
  window.scrollTo(0, 0);
}
document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => goToPage(button.dataset.page)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => goToPage(button.dataset.go)));
document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("todayDate").textContent = "📅 Today: " + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function getGrade(marks) {
  if (marks >= 80) return { grade: "A+", gpa: 4.00 };
  if (marks >= 75) return { grade: "A", gpa: 3.75 };
  if (marks >= 70) return { grade: "A-", gpa: 3.50 };
  if (marks >= 65) return { grade: "B+", gpa: 3.25 };
  if (marks >= 60) return { grade: "B", gpa: 3.00 };
  if (marks >= 55) return { grade: "B-", gpa: 2.75 };
  if (marks >= 50) return { grade: "C+", gpa: 2.50 };
  if (marks >= 45) return { grade: "C", gpa: 2.25 };
  if (marks >= 40) return { grade: "D", gpa: 2.00 };
  return { grade: "F", gpa: 0.00 };
}
function getStudent(id) { return students.find(student => student.id === id); }
function getResultRows() {
  return marksList.map(mark => {
    const student = getStudent(mark.studentId);
    const result = getGrade(Number(mark.marks));
    return { ...mark, student, ...result };
  }).filter(row => row.student);
}
function renderDashboard() {
  const results = getResultRows();
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("totalCourses").textContent = 6;
  document.getElementById("totalResults").textContent = results.length;
  const avg = results.length ? results.reduce((sum, item) => sum + item.gpa, 0) / results.length : 0;
  document.getElementById("averageGpa").textContent = avg.toFixed(2);
  const recent = [...students].slice(-5).reverse();
  document.getElementById("recentStudents").innerHTML = recent.length ? recent.map((s, index) =>
    `<tr><td>${index + 1}</td><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.id)}</td><td>${escapeHTML(s.department)}</td><td>${escapeHTML(s.semester)}</td><td><button class="action-button view-btn" onclick="viewStudent('${escapeHTML(s.id)}')">View</button><button class="action-button edit-btn" onclick="editStudent('${escapeHTML(s.id)}')">Edit</button></td></tr>`
  ).join("") : emptyRow(6, "No students registered yet");
  document.getElementById("recentResults").innerHTML = results.length ? results.slice(-5).reverse().map(r =>
    `<tr><td>${escapeHTML(r.student.id)}</td><td>${escapeHTML(r.student.name)}</td><td>${r.gpa.toFixed(2)}</td><td><span class="${r.gpa > 0 ? "status-pass" : "status-fail"}">${r.gpa > 0 ? "Pass" : "Fail"}</span></td></tr>`
  ).join("") : emptyRow(4, "No results entered yet");
  const groups = [
    { label: "3.50–4.00", count: results.filter(r => r.gpa >= 3.5).length, color: "#4a91f3" },
    { label: "3.00–3.49", count: results.filter(r => r.gpa >= 3 && r.gpa < 3.5).length, color: "#35c49a" },
    { label: "2.00–2.99", count: results.filter(r => r.gpa >= 2 && r.gpa < 3).length, color: "#ffb63e" },
    { label: "Below 2.00", count: results.filter(r => r.gpa < 2).length, color: "#9a68e8" }
  ];
  const max = Math.max(1, ...groups.map(g => g.count));
  document.getElementById("gpaChart").innerHTML = groups.map(g =>
    `<div class="chart-item"><div class="chart-bar" style="height:${Math.max(5, g.count / max * 150)}px;background:${g.color}"><span>${g.count}</span></div><span>${g.label}</span></div>`
  ).join("");
}
function emptyRow(columns, message) { return `<tr><td colspan="${columns}" class="empty-state">${message}</td></tr>`; }
function renderStudents() {
  const search = (document.getElementById("studentSearch").value || "").toLowerCase();
  const department = document.getElementById("departmentFilter").value;
  const filtered = students.filter(s => `${s.name} ${s.id} ${s.department}`.toLowerCase().includes(search) && (!department || s.department === department));
  document.getElementById("studentTable").innerHTML = filtered.length ? filtered.map((s, index) =>
    `<tr><td>${index + 1}</td><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.id)}</td><td>${escapeHTML(s.department)}</td><td>${escapeHTML(s.semester)}</td><td>${escapeHTML(s.email || "-")}</td><td><button class="action-button view-btn" onclick="viewStudent('${escapeHTML(s.id)}')">View</button><button class="action-button edit-btn" onclick="editStudent('${escapeHTML(s.id)}')">Edit</button><button class="action-button delete-btn" onclick="deleteStudent('${escapeHTML(s.id)}')">Delete</button></td></tr>`
  ).join("") : emptyRow(7, "No matching students found");
}
function populateStudentOptions() {
  const select = document.getElementById("marksStudent");
  const previous = select.value;
  select.innerHTML = '<option value="">Select student</option>' + students.map(s => `<option value="${escapeHTML(s.id)}">${escapeHTML(s.name)} (${escapeHTML(s.id)})</option>`).join("");
  if (students.some(s => s.id === previous)) select.value = previous;
}
function renderMarks() {
  const rows = getResultRows().slice().reverse();
  document.getElementById("marksTable").innerHTML = rows.length ? rows.map(r =>
    `<tr><td>${escapeHTML(r.student.id)}</td><td>${escapeHTML(r.student.name)}</td><td>${escapeHTML(r.course)}</td><td>${escapeHTML(r.exam)}</td><td>${r.marks}</td><td>${r.grade}</td><td>${r.gpa.toFixed(2)}</td></tr>`
  ).join("") : emptyRow(7, "No marks entered yet");
}
function renderResults() {
  const search = (document.getElementById("resultSearch").value || "").toLowerCase();
  const rows = getResultRows().filter(r => `${r.student.name} ${r.student.id} ${r.course}`.toLowerCase().includes(search)).reverse();
  document.getElementById("resultsTable").innerHTML = rows.length ? rows.map(r =>
    `<tr><td>${escapeHTML(r.student.id)}</td><td>${escapeHTML(r.student.name)}</td><td>${escapeHTML(r.student.department)}</td><td>${escapeHTML(r.course)}</td><td>${r.marks}</td><td>${r.grade}</td><td>${r.gpa.toFixed(2)}</td><td><span class="${r.gpa > 0 ? "status-pass" : "status-fail"}">${r.gpa > 0 ? "Pass" : "Fail"}</span></td></tr>`
  ).join("") : emptyRow(8, "No matching results found");
}
function renderAll() {
  renderDashboard(); renderStudents(); populateStudentOptions(); renderMarks(); renderResults();
}
document.getElementById("studentForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const student = {
    name: document.getElementById("studentName").value.trim(),
    id: document.getElementById("studentId").value.trim(),
    department: document.getElementById("department").value,
    semester: document.getElementById("semester").value,
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim()
  };
  if (students.some(s => s.id.toLowerCase() === student.id.toLowerCase() && s.id !== editingStudentId)) {
    showToast("This Student ID already exists."); return;
  }
  if (editingStudentId) {
    students = students.map(s => s.id === editingStudentId ? student : s);
    marksList = marksList.map(m => m.studentId === editingStudentId ? { ...m, studentId: student.id } : m);
    showToast("Student information updated.");
    editingStudentId = null;
  } else {
    students.push(student); showToast("Student registered successfully.");
  }
  saveData(); this.reset(); document.querySelector("#studentForm button[type=submit]").textContent = "Save Student"; renderAll(); goToPage("studentList");
});
function editStudent(id) {
  const s = getStudent(id); if (!s) return;
  editingStudentId = id;
  document.getElementById("studentName").value = s.name;
  document.getElementById("studentId").value = s.id;
  document.getElementById("department").value = s.department;
  document.getElementById("semester").value = s.semester;
  document.getElementById("email").value = s.email || "";
  document.getElementById("phone").value = s.phone || "";
  document.querySelector("#studentForm button[type=submit]").textContent = "Update Student";
  goToPage("addStudent");
}
function viewStudent(id) {
  const s = getStudent(id); if (!s) return;
  alert(`Student Profile\n\nName: ${s.name}\nStudent ID: ${s.id}\nDepartment: ${s.department}\nSemester: ${s.semester}\nEmail: ${s.email || "-"}\nPhone: ${s.phone || "-"}`);
}
function deleteStudent(id) {
  const s = getStudent(id); if (!s) return;
  if (confirm(`Delete ${s.name} (${s.id}) and their results?`)) {
    students = students.filter(student => student.id !== id);
    marksList = marksList.filter(mark => mark.studentId !== id);
    saveData(); renderAll(); showToast("Student and related results deleted.");
  }
}
document.getElementById("studentSearch").addEventListener("input", renderStudents);
document.getElementById("departmentFilter").addEventListener("change", renderStudents);
document.getElementById("marksForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const studentId = document.getElementById("marksStudent").value;
  const course = document.getElementById("course").value;
  const marks = Number(document.getElementById("marks").value);
  const exam = document.getElementById("examType").value;
  if (!getStudent(studentId)) { showToast("Please select a student."); return; }
  if (marks < 0 || marks > 100) { showToast("Marks must be between 0 and 100."); return; }
  const existing = marksList.findIndex(m => m.studentId === studentId && m.course === course && m.exam === exam);
  if (existing >= 0) marksList[existing] = { studentId, course, marks, exam };
  else marksList.push({ studentId, course, marks, exam });
  saveData(); this.reset(); renderAll(); showToast("Marks saved and result calculated.");
});
document.getElementById("resultSearch").addEventListener("input", renderResults);
document.getElementById("printResults").addEventListener("click", () => window.print());
document.getElementById("exportData").addEventListener("click", () => {
  const data = JSON.stringify({ students, marksList }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "student-system-backup.json"; link.click();
  URL.revokeObjectURL(url); showToast("Backup file exported.");
});
document.getElementById("resetSample").addEventListener("click", () => {
  if (confirm("Restore the sample students and results? Current data will be replaced.")) {
    students = [...sampleStudents]; marksList = [...sampleMarks]; saveData(); renderAll(); showToast("Sample data restored.");
  }
});
document.getElementById("clearData").addEventListener("click", () => {
  if (confirm("Delete ALL students and results saved in this browser?")) {
    students = []; marksList = []; saveData(); renderAll(); showToast("All data deleted.");
  }
});
renderAll();
