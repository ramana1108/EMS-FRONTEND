const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function getAdminDashboard() {
  const res = await fetch(`${API_BASE_URL}/dashboard/admin`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getEmployeeDashboard(employeeId) {
  const res = await fetch(`${API_BASE_URL}/dashboard/employee/${employeeId}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getCurrentEmployeeDashboard() {
  const res = await fetch(`${API_BASE_URL}/dashboard/employee/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getAllEmployees() {
  const res = await fetch(`${API_BASE_URL}/employees`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getEmployeeById(id) {
  const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createEmployee(payload) {
  const res = await fetch(`${API_BASE_URL}/employees`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateEmployee(id, payload) {
  const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function getDepartments() {
  const res = await fetch(`${API_BASE_URL}/departments`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getDesignations() {
  const res = await fetch(`${API_BASE_URL}/designations`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getDepartmentEmployees(departmentId) {
  const res = await fetch(`${API_BASE_URL}/departments/department/${departmentId}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getNotices() {
  const res = await fetch(`${API_BASE_URL}/notices`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getPayrolls() {
  const res = await fetch(`${API_BASE_URL}/payrolls`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getProfiles() {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getProfileByEmployeeId(employeeId) {
  const res = await fetch(`${API_BASE_URL}/profile/${employeeId}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getMyProfile() {
  const res = await fetch(`${API_BASE_URL}/profile/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateMyProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/profile/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateProfile(employeeId, payload) {
  const res = await fetch(`${API_BASE_URL}/profile/${employeeId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getAttendance() {
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getMyAttendance() {
  const res = await fetch(`${API_BASE_URL}/attendance/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getMyLeaves() {
  const res = await fetch(`${API_BASE_URL}/api/leaves/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function applyLeave(payload) {
  const res = await fetch(`${API_BASE_URL}/api/leaves`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteLeave(id) {
  const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export default {
  getAdminDashboard,
  getEmployeeDashboard,
  getCurrentEmployeeDashboard,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  getDepartmentEmployees,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  getDesignations,
  getNotices,
  getPayrolls,
  getProfiles,
  getProfileByEmployeeId,
  createProfile,
  updateProfile,
  getMyProfile,
  updateMyProfile,
  getAttendance,
  getMyAttendance,
  getMyLeaves,
  applyLeave,
  deleteLeave,
  registerUser,
};