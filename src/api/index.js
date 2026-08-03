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

export async function getAllEmployees() {
  const res = await fetch(`${API_BASE_URL}/employee`, {
    headers: authHeaders(),
  });
  return res.json();
}

export default { getAdminDashboard, getEmployeeDashboard, getAllEmployees };
