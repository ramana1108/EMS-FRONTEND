import { useState, useEffect } from "react";
import "../App.css";
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Users, 
  UserCheck, 
  Award,
  AlertCircle,
  Edit
} from "lucide-react";

const ALL_PERMISSIONS = [
  "dashboard",
  "profile",
  "department",
  "designation",
  "employee",
  "attendance",
  "payroll",
  "notice",
  "settings",
  "leave",
  "user",
  "role"
];

const DEFAULT_ROLE_PERMISSIONS = {
  admin: [...ALL_PERMISSIONS],
  employee: ["dashboard", "profile", "department", "designation", "attendance", "notice", "leave", "payroll"]
};

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
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

  useEffect(() => {
    if (!editingRoleId) {
      setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS[roleName.toLowerCase()] || []);
    }
  }, [roleName, editingRoleId]);

  const togglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission]
    );
  };

  const handleEditRole = (role) => {
    setEditingRoleId(role._id);
    setRoleName(role.name);
    setSelectedPermissions(Array.isArray(role.permissions) ? role.permissions : []);
    setPermissionSearch("");
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setRoleName("");
    setSelectedPermissions([]);
    setPermissionSearch("");
    setError("");
    setSuccess("");
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!roleName) {
      setError("Role name is required");
      return;
    }
    if (selectedPermissions.length === 0) {
      setError("Please select at least one permission for this role.");
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
      const method = editingRoleId ? "PUT" : "POST";
      const url = editingRoleId ? `${API_BASE_URL}/roles/${editingRoleId}` : `${API_BASE_URL}/roles`;
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ name: roleName.trim(), permissions: selectedPermissions }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editingRoleId ? "Role updated successfully!" : "Role added successfully!");
        setRoleName("");
        setSelectedPermissions([]);
        setEditingRoleId(null);
        fetchData();
      } else {
        setError(data.message || (editingRoleId ? "Failed to update role" : "Failed to create role"));
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while saving role permissions.");
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
                          onClick={() => handleEditRole(role)}
                          className="action-icon-btn edit"
                          title="Edit Role"
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#2563eb", marginRight: "12px" }}
                        >
                          <Edit size={16} />
                        </button>
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

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "6px" }}>
                Search Permissions
              </label>
              <input
                type="text"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search permissions..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  color: "#1e293b",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "10px" }}>
                Permissions
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {ALL_PERMISSIONS.filter((perm) =>
                  perm.toLowerCase().includes(permissionSearch.toLowerCase())
                ).map((permission) => {
                  const active = selectedPermissions.includes(permission);
                  return (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => togglePermission(permission)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "9999px",
                        border: active ? "1px solid #059669" : "1px solid #cbd5e1",
                        backgroundColor: active ? "#e0f2fe" : "#f8fafc",
                        color: active ? "#034d63" : "#334155",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {permission}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
                Select which permissions should be granted to this role. These permissions control access across the EMS.
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
              <span>{editingRoleId ? "Update Role" : "Create Role"}</span>
            </button>
            {editingRoleId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#f8fafc",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
