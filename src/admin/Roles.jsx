import { useState, useEffect } from "react";
import api from "../api";
import Pagination from "../components/Pagination";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Users,
  UserCheck,
  Award,
  AlertCircle,
  Edit,
  X
} from "lucide-react";

const ALL_SYSTEM_PERMISSIONS = [
  "dashboard",
  "user",
  "role",
  "department",
  "designation",
  "employee",
  "attendance",
  "payroll",
  "notice",
  "profile"
];

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const rolesData = await api.getRoles();
      const usersData = await api.getAllUsers();

      if (rolesData) setRoles(rolesData.roles || []);
      if (usersData) setUsers(usersData.users || []);
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
    setError("");
    setSuccess("");
    try {
      const data = await api.createRole({ name: roleName.trim() });
      if (data && data.role) {
        setSuccess("Role added successfully!");
        setRoleName("");
        setIsAddModalOpen(false);
        fetchData();
      } else {
        setError(data?.message || "Failed to create role");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Make sure role name exists in permissions.");
    }
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError("");
    setSuccess("");
    try {
      const data = await api.updateRole(selectedRole._id, {
        name: selectedRole.name,
        permissions: editPermissions
      });
      if (data && data.role) {
        setSuccess("Permissions updated successfully!");
        setIsEditModalOpen(false);
        setSelectedRole(null);
        fetchData();
      } else {
        setError(data?.message || "Failed to update permissions");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update role permissions");
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    setError("");
    setSuccess("");
    try {
      const data = await api.deleteRole(id);
      if (data) {
        setSuccess("Role deleted successfully!");
        fetchData();
      } else {
        setError("Failed to delete role");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete role");
    }
  };

  const openEditPermissions = (role) => {
    setSelectedRole(role);
    setEditPermissions(role.permissions || []);
    setIsEditModalOpen(true);
  };

  const togglePermission = (permission) => {
    if (editPermissions.includes(permission)) {
      setEditPermissions(editPermissions.filter(p => p !== permission));
    } else {
      setEditPermissions([...editPermissions, permission]);
    }
  };

  // Compute stats
  const getRoleUserCount = (roleNameStr) => {
    return users.filter(u => u.role && u.role.name?.toLowerCase() === roleNameStr?.toLowerCase()).length;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    return new Date(isoString).toISOString().split("T")[0];
  };

  const getRoleUserNames = (roleNameStr) => {
    const roleUsers = users.filter(u => u.role && (u.role.name?.toLowerCase() === roleNameStr?.toLowerCase() || u.role?._id === roleNameStr));
    return roleUsers.map(u => u.name).join(", ") || "—";
  };

  const totalPages = Math.max(1, Math.ceil(roles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = roles.slice(startIndex, startIndex + itemsPerPage);

  const getRoleFromToDate = (role) => {
    if (!role.createdAt) return "—";
    const fromDate = formatDate(role.createdAt);
    const toDate = formatDate(role.updatedAt);
    return `${fromDate} to ${toDate}`;
  };

  const getAdminCount = () => getRoleUserCount("admin");
  const getEmployeeCount = () => getRoleUserCount("employee");

  return (
    <div>
      {/* Top Header Bar */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="dashboard-title">Role Management</h1>
          <p className="dashboard-subtitle">Define and monitor system user roles and their active user count.</p>
        </div>
        <button
          className="btn-add-dept"
          onClick={() => {
            setError("");
            setSuccess("");
            setIsAddModalOpen(true);
          }}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={16} />
          <span>Add Role</span>
        </button>
      </div>

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

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card stat-card-indigo">
          <div className="stat-header">
            <div className="stat-icon-box total-employees-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="stat-label">Admins</p>
              <p className="stat-value">{getAdminCount()}</p>
            </div>
          </div>
          <p className="stat-description">System administrators</p>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-header">
            <div className="stat-icon-box depts-icon">
              <Users size={20} />
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
      <div className="w-full">
        {/* Roles Table */}
        <div className="employee-directory-card">
          <div className="filters-row">
            <div className="filters-left">
              <span className="filters-label">
                System Roles
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>ROLE NAME</th>
                  <th>PERMISSIONS GRANTED</th>
                  <th>EMPLOYEE NAME(S)</th>
                  <th>FROM-TO DATE</th>
                  <th style={{ textAlign: "center" }}>MEMBERS</th>
                  <th style={{ textAlign: "right", paddingRight: "24px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px 0" }}>Loading roles...</td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px 0" }}>No roles registered yet.</td>
                  </tr>
                ) : (
                  paginatedRoles.map((role) => (
                    <tr key={role._id} className="employee-row">
                      <td>
                        <span style={{ fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {role.name}
                        </span>
                      </td>
                      <td>
                        {role.permissions && role.permissions.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {role.permissions.map((p, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                  border: "1px solid #d1d5db",
                                  backgroundColor: "#f8fafc",
                                  color: "#334155",
                                  fontSize: "12px",
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
                      <td style={{ color: "#475569", fontSize: "13px" }}>
                        {getRoleUserNames(role.name)}
                      </td>
                      <td style={{ color: "#475569", fontSize: "13px" }}>
                        {getRoleFromToDate(role)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f766e" }}>
                          {getRoleUserCount(role.name)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "24px" }}>
                        <div className="employee-action-buttons">
                          <button
                            onClick={() => openEditPermissions(role)}
                            className="action-icon-btn"
                            title="Edit Permissions"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role._id)}
                            className="action-icon-btn delete"
                            title="Delete Role"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startItem={startIndex + 1}
            endItem={Math.min(startIndex + itemsPerPage, roles.length)}
            totalItems={roles.length}
          />
        </div>
      </div>

      {/* Add Role Modal Dialog */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <div>
                <h2>Add New Role</h2>
                <p className="modal-subtitle">Configure system user role name.</p>
              </div>
              <button
                className="btn-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRole} className="enroll-form">
              <div className="form-group">
                <label>Role Name <span className="req">*</span></label>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                >
                  <option value="">Select a system role...</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                </select>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontStyle: "italic" }}>
                  Note: Supported system roles: admin, employee.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                >
                  <Plus size={16} />
                  <span>Create Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal Dialog */}
      {isEditModalOpen && selectedRole && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <div>
                <h2>Edit Permissions</h2>
                <p className="modal-subtitle">Configure access permissions for role: <span style={{ fontWeight: "700", textTransform: "uppercase" }}>{selectedRole.name}</span></p>
              </div>
              <button
                className="btn-close"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedRole(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="enroll-form">
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ marginBottom: "12px" }}>Select Permissions Granted</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const isChecked = editPermissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px",
                          border: `1px solid ${isChecked ? "#10b981" : "#e2e8f0"}`,
                          borderRadius: "8px",
                          backgroundColor: isChecked ? "#f0fdf4" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm)}
                          style={{ accentColor: "#10b981", width: "16px", height: "16px" }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: "600", textTransform: "capitalize", color: isChecked ? "#065f46" : "#475569" }}>
                          {perm}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedRole(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                >
                  <span>Save Permissions</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
