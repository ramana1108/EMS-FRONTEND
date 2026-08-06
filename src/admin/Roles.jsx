import { useState, useEffect } from "react";
import "../App.css";
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Users, 
  UserCheck, 
  Award,
  AlertCircle
} from "lucide-react";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
  
  function getHeaders() {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  }

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch Roles
      const rolesRes = await fetch(`${API_BASE_URL}/roles`, {
        headers: getHeaders(),
      });
      const rolesData = await rolesRes.json();
      
      // Fetch Users to count members per role
      const usersRes = await fetch(`${API_BASE_URL}/auth`, {
        headers: getHeaders(),
      });
      const usersData = await usersRes.json();

      if (rolesRes.ok) {
        setRoles(rolesData.roles || []);
      } else {
        setError(rolesData.message || "Failed to fetch roles");
      }

      if (usersRes.ok) {
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!roleName) {
      setError("Role name is required");
      return;
    }
    const blocked = ["hr", "manager"];
    if (blocked.includes(roleName.trim().toLowerCase())) {
      setError("Creating role 'hr' or 'manager' is not allowed.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name: roleName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Role added successfully!");
        setRoleName("");
        fetchData();
      } else {
        setError(data.message || "Failed to create role");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Make sure role name exists in permissions.");
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Role deleted successfully!");
        fetchData();
      } else {
        setError(data.message || "Failed to delete role");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete role");
    }
  };

  // Compute stats
  const getRoleUserCount = (roleNameStr) => {
    return users.filter(u => u.role && u.role.name?.toLowerCase() === roleNameStr?.toLowerCase()).length;
  };

  const getAdminCount = () => getRoleUserCount("admin");
  // HR and Manager roles removed from frontend stats
  const getEmployeeCount = () => getRoleUserCount("employee");

  return (
    <div className="p-6">
      {/* Top Header Bar */}
      <div className="page-header">
        <div>
          <h1 className="dashboard-title">Role Management</h1>
          <p className="dashboard-subtitle">Define and monitor system user roles and their active user count.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box total-employees-icon" style={{ backgroundColor: "#065F46" }}>
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <p className="stat-label">Admins</p>
              <p className="stat-value">{getAdminCount()}</p>
            </div>
          </div>
          <p className="stat-description">System administrators</p>
        </div>

        {/* HR and Manager cards removed per request */}

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box depts-icon" style={{ backgroundColor: "#059669" }}>
              <Users size={20} color="#ffffff" />
            </div>
            <div>
              <p className="stat-label">Employees</p>
              <p className="stat-value">{getEmployeeCount()}</p>
            </div>
          </div>
          <p className="stat-description">General staff members</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Roles Table */}
        <div className="employee-directory-card" style={{ padding: "24px" }}>
          <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>System Roles</h2>
          
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b91c1c", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ color: "#065f46", backgroundColor: "#ecfdf5", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
              {success}
            </div>
          )}

          <div className="table-responsive">
            <table className="employee-table">
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px" }}>ROLE NAME</th>
                  <th style={{ padding: "12px 16px" }}>PERMISSIONS GRANTED</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>MEMBERS</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "30px 0" }}>Loading roles...</td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "30px 0" }}>No roles registered yet.</td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role._id} className="employee-row">
                      <td style={{ padding: "16px" }}>
                        <span style={{ fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "#1f2937" }}>
                          {role.name}
                        </span>
                      </td>
                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        {role.permissions && role.permissions.length > 0 ? (
                          <div style={{ display: "grid", gap: "8px" }}>
                            {role.permissions.map((p, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 12px",
                                  borderRadius: "12px",
                                  border: "1px solid #d1d5db",
                                  backgroundColor: "#f8fafc",
                                  color: "#334155",
                                  fontSize: "13px",
                                  fontWeight: "600"
                                }}
                              >
                                <span style={{ width: "6px", height: "6px", borderRadius: "9999px", backgroundColor: "#0f766e" }} />
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "13px" }}>No permissions configured</span>
                        )}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f766e" }}>
                          {getRoleUserCount(role.name)}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteRole(role._id)}
                          className="action-icon-btn delete"
                          title="Delete Role"
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Role Card */}
        <div className="emp-card-box" style={{ padding: "24px", backgroundColor: "#ffffff", borderRadius: "16px" }}>
          <h2 className="emp-card-title" style={{ marginBottom: "8px" }}>Add New Role</h2>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
            Add a new system role. The configuration permissions will automatically match the configuration in standard permissions.
          </p>

          <form onSubmit={handleAddRole}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "6px" }}>
                Role Name
              </label>
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  color: "#1e293b",
                  backgroundColor: "#ffffff",
                  outline: "none"
                }}
              >
                <option value="">Select a system role...</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontStyle: "italic" }}>
                Note: Supported system roles: admin, employee.
              </p>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#059669",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
            >
              <Plus size={16} />
              <span>Create Role</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
