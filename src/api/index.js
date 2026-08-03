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

export default {
  getAdminDashboard,
  getEmployeeDashboard,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
