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

export async function createDepartment(payload) {
  const res = await fetch(`${API_BASE_URL}/departments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateDepartment(id, payload) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteDepartment(id) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
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

export async function getDesignations() {
  const res = await fetch(`${API_BASE_URL}/designations`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createDesignation(payload) {
  const res = await fetch(`${API_BASE_URL}/designations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateDesignation(id, payload) {
  const res = await fetch(`${API_BASE_URL}/designations/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteDesignation(id) {
  const res = await fetch(`${API_BASE_URL}/designations/${id}`, {
    method: "DELETE",
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

export async function getMyPayrolls() {
  const res = await fetch(`${API_BASE_URL}/payrolls/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getRoles() {
  const res = await fetch(`${API_BASE_URL}/roles`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createRole(payload) {
  const res = await fetch(`${API_BASE_URL}/roles`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteRole(id) {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateRole(id, payload) {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getAllUsers() {
  const res = await fetch(`${API_BASE_URL}/auth`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API_BASE_URL}/auth/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}


export async function getSettings() {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createSettings(payload) {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateSettings(id, payload) {
  const res = await fetch(`${API_BASE_URL}/settings/${id}`, {
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
  const res = await fetch(`${API_BASE_URL}/leave/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function applyLeave(payload) {
  const res = await fetch(`${API_BASE_URL}/leave`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteLeave(id) {
  const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function getAllLeaves() {
  const res = await fetch(`${API_BASE_URL}/leave`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateLeaveStatus(id, payload) {
  const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
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

export async function getNotifications() {
  const res = await fetch(`${API_BASE_URL}/notifications/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function markNotificationsRead(payload) {
  const res = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload || { markAll: true }),
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
  updateEmployee,
  deleteEmployee,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentEmployees,
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getNotices,
  getPayrolls,
  getMyPayrolls,
  getAttendance,
  getMyAttendance,
  getMyLeaves,
  applyLeave,
  deleteLeave,
  updateLeaveStatus,
  registerUser,
  getRoles,
  createRole,
  deleteRole,
  updateRole,
  getAllUsers,
  updateUser,
  getSettings,
  createSettings,
  updateSettings,
  getNotifications,
  markNotificationsRead,
};
