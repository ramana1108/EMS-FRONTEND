const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return { message: text || "Invalid JSON response" };
  }
}

export async function getAdminDashboard() {
  const token = localStorage.getItem("token");
  const path = token ? "/dashboard/admin" : "/dashboard/admin/public";
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getEmployeeDashboard(employeeId) {
  const res = await fetch(`${API_BASE_URL}/employeedashboard/${employeeId}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getCurrentEmployeeDashboard() {
  const res = await fetch(`${API_BASE_URL}/employeedashboard/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
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
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || "Failed to create department");
  }
  return data;
}

export async function updateDepartment(id, payload) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || "Failed to update department");
  }
  return data;
}

export async function deleteDepartment(id) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete department");
  }
  return data;
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

export async function createNotice(payload) {
  const res = await fetch(`${API_BASE_URL}/notices`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteNotice(id) {
  const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
    method: "DELETE",
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

export async function createPayroll(payload) {
  const res = await fetch(`${API_BASE_URL}/payrolls`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getPayrollById(id) {
  const res = await fetch(`${API_BASE_URL}/payrolls/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updatePayroll(id, payload) {
  const res = await fetch(`${API_BASE_URL}/payrolls/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deletePayroll(id) {
  const res = await fetch(`${API_BASE_URL}/payrolls/${id}`, {
    method: "DELETE",
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

export async function updateProfile(employeeId, payload) {
  const res = await fetch(`${API_BASE_URL}/profile/${employeeId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
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

export async function getAllUsers(query = "") {
  const url = `${API_BASE_URL}/auth${query ? `?q=${encodeURIComponent(query)}` : ""}`;
  const res = await fetch(url, {
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
  const res = await fetch(`${API_BASE_URL}/leaves/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function applyLeave(payload) {
  const res = await fetch(`${API_BASE_URL}/leaves`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteLeave(id) {
  const res = await fetch(`${API_BASE_URL}/leaves/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function getAllLeaves() {
  const res = await fetch(`${API_BASE_URL}/leaves`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateLeaveStatus(id, payload) {
  const res = await fetch(`${API_BASE_URL}/leaves/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Attendance helpers
export async function createAttendance(payload) {
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getAttendanceById(id) {
  const res = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateAttendance(id, payload) {
  const res = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteAttendance(id) {
  const res = await fetch(`${API_BASE_URL}/attendance/${id}`, {
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
  getCurrentUser,
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
  createNotice,
  deleteNotice,
  getPayrolls,
  createPayroll,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  getProfiles,
  createProfile,
  getProfileByEmployeeId,
  updateProfile,
  getMyProfile,
  updateMyProfile,
  getRoles,
  createRole,
  deleteRole,
  updateRole,
  getAllUsers,
  updateUser,
  getSettings,
  createSettings,
  updateSettings,
  getAttendance,
  getMyAttendance,
  getMyLeaves,
  applyLeave,
  deleteLeave,
  getAllLeaves,
  updateLeaveStatus,
  registerUser,
};