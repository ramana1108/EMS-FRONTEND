const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ems-backend-zby7.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/";
    }
  }

  return res.json();
}

export async function getAdminDashboard() {
  return request("/dashboard/admin");
}

export async function getEmployeeDashboard(employeeId) {
  return request(`/dashboard/employee/${employeeId}`);
}

export async function getCurrentEmployeeDashboard() {
  return request("/dashboard/employee/me");
}

export async function getAllEmployees() {
  return request("/employees");
}

export async function getEmployeeById(id) {
  return request(`/employees/${id}`);
}

export async function createEmployee(payload) {
  return request("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(id, payload) {
  return request(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployee(id) {
  return request(`/employees/${id}`, {
    method: "DELETE",
  });
}

export async function getDepartments() {
  return request("/departments");
}

export async function createDepartment(payload) {
  return request("/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDepartment(id, payload) {
  return request(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDepartment(id) {
  return request(`/departments/${id}`, {
    method: "DELETE",
  });
}

export async function getDepartmentEmployees(departmentId) {
  return request(`/departments/department/${departmentId}`);
}

export async function getDesignations() {
  return request("/designations");
}

export async function createDesignation(payload) {
  return request("/designations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDesignation(id, payload) {
  return request(`/designations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDesignation(id) {
  return request(`/designations/${id}`, {
    method: "DELETE",
  });
}

export async function getNotices() {
  return request("/notices");
}

export async function getPayrolls() {
  return request("/payrolls");
}

export async function getMyPayrolls() {
  return request("/payrolls/me");
}

export async function getRoles() {
  return request("/roles");
}

export async function createRole(payload) {
  return request("/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteRole(id) {
  return request(`/roles/${id}`, {
    method: "DELETE",
  });
}

export async function updateRole(id, payload) {
  return request(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAllUsers() {
  return request("/auth");
}

export async function updateUser(id, payload) {
  return request(`/auth/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getSettings() {
  return request("/settings");
}

export async function createSettings(payload) {
  return request("/settings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSettings(id, payload) {
  return request(`/settings/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAttendance() {
  return request("/attendance");
}

export async function getMyAttendance() {
  return request("/attendance/me");
}

export async function getMyLeaves() {
  return request("/leave/me");
}

export async function applyLeave(payload) {
  return request("/leave", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteLeave(id) {
  return request(`/leave/${id}`, {
    method: "DELETE",
  });
}

export async function getAllLeaves() {
  return request("/leave");
}

export async function updateLeaveStatus(id, payload) {
  return request(`/leave/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getNotifications() {
  return request("/notifications/me");
}

export async function markNotificationsRead(payload) {
  return request("/notifications/mark-read", {
    method: "PUT",
    body: JSON.stringify(payload || { markAll: true }),
  });
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
