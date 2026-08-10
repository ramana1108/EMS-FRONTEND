const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
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

<<<<<<< HEAD
=======
async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return { message: text || "Invalid JSON response" };
  }
}

>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
export async function createDepartment(payload) {
  const res = await fetch(`${API_BASE_URL}/departments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
<<<<<<< HEAD
  return res.json();
=======
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || "Failed to create department");
  }
  return data;
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
}

export async function updateDepartment(id, payload) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
<<<<<<< HEAD
  return res.json();
=======
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || "Failed to update department");
  }
  return data;
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
}

export async function deleteDepartment(id) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
<<<<<<< HEAD
  return res.json();
}

export async function getDepartmentEmployees(departmentId) {
  const res = await fetch(`${API_BASE_URL}/departments/department/${departmentId}`, {
    headers: authHeaders(),
  });
  return res.json();
=======
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete department");
  }
  return data;
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
}

export async function getDesignations() {
  const res = await fetch(`${API_BASE_URL}/designations`, {
    headers: authHeaders(),
  });
  return res.json();
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
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
<<<<<<< HEAD
=======
=======
export async function getDepartmentEmployees(departmentId) {
  const res = await fetch(`${API_BASE_URL}/departments/department/${departmentId}`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
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

<<<<<<< HEAD
export async function getProfiles() {
  const res = await fetch(`${API_BASE_URL}/profile`, {
=======
<<<<<<< HEAD
export async function getRoles() {
  const res = await fetch(`${API_BASE_URL}/roles`, {
=======
export async function getProfiles() {
  const res = await fetch(`${API_BASE_URL}/profile`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    headers: authHeaders(),
  });
  return res.json();
}

<<<<<<< HEAD
export async function createProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/profile`, {
=======
<<<<<<< HEAD
export async function createRole(payload) {
  const res = await fetch(`${API_BASE_URL}/roles`, {
=======
export async function createProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/profile`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

<<<<<<< HEAD
export async function getProfileByEmployeeId(employeeId) {
  const res = await fetch(`${API_BASE_URL}/profile/${employeeId}`, {
=======
<<<<<<< HEAD
export async function deleteRole(id) {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "DELETE",
=======
export async function getProfileByEmployeeId(employeeId) {
  const res = await fetch(`${API_BASE_URL}/profile/${employeeId}`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    headers: authHeaders(),
  });
  return res.json();
}

<<<<<<< HEAD
export async function updateProfile(employeeId, payload) {
  const res = await fetch(`${API_BASE_URL}/profile/${employeeId}`, {
    method: "PUT",
=======
<<<<<<< HEAD
export async function updateRole(id, payload) {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
=======
export async function getMyProfile() {
  const res = await fetch(`${API_BASE_URL}/profile/me`, {
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

<<<<<<< HEAD
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
=======
export async function updateMyProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/profile/me`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
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
<<<<<<< HEAD
=======
=======
export async function updateProfile(employeeId, payload) {
  const res = await fetch(`${API_BASE_URL}/profile/${employeeId}`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
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
<<<<<<< HEAD
  const res = await fetch(`${API_BASE_URL}/leave/me`, {
=======
<<<<<<< HEAD
  const res = await fetch(`${API_BASE_URL}/leave/me`, {
=======
  const res = await fetch(`${API_BASE_URL}/api/leaves/me`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    headers: authHeaders(),
  });
  return res.json();
}

export async function applyLeave(payload) {
<<<<<<< HEAD
  const res = await fetch(`${API_BASE_URL}/leave`, {
=======
<<<<<<< HEAD
  const res = await fetch(`${API_BASE_URL}/leave`, {
=======
  const res = await fetch(`${API_BASE_URL}/api/leaves`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteLeave(id) {
<<<<<<< HEAD
  const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
=======
<<<<<<< HEAD
  const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
=======
  const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
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

<<<<<<< HEAD
=======
=======
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
<<<<<<< HEAD
  getDepartmentEmployees,
=======
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getNotices,
  getPayrolls,
  getProfiles,
  createProfile,
  getProfileByEmployeeId,
  updateProfile,
<<<<<<< HEAD
=======
  getMyProfile,
  updateMyProfile,
  getAttendance,
  getMyAttendance,
  getMyLeaves,
  applyLeave,
  deleteLeave,
<<<<<<< HEAD
  updateLeaveStatus,
  registerUser,
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
  getRoles,
  createRole,
  deleteRole,
  updateRole,
  getAllUsers,
  updateUser,
  getSettings,
  createSettings,
  updateSettings,
<<<<<<< HEAD
  getAttendance,
  getMyAttendance,
  getMyLeaves,
  applyLeave,
  deleteLeave,
  getAllLeaves,
  updateLeaveStatus,
  registerUser,
};
=======
};
=======
  registerUser,
};
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
