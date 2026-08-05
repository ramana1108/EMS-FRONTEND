const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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

export async function updateEmployee(id, data) {
  const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export default {
  getAdminDashboard,
  getEmployeeDashboard,
  getCurrentEmployeeDashboard,
  getAllEmployees,
  getNotices,
  getPayrolls,
  getAttendance,
  getMyAttendance,
  updateEmployee,
};
