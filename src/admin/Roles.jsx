import { useState, useEffect } from "react";
<<<<<<< HEAD
import api from "../api";
import Pagination from "../components/Pagination";
=======
// styles are loaded globally via src/index.css (Tailwind + custom styles)
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
import {
  ShieldCheck,
  Plus,
  Trash2,
  Users,
  UserCheck,
<<<<<<< HEAD
  Award,
  AlertCircle,
  Edit,
  X
=======
  AlertCircle
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
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
<<<<<<< HEAD
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);
=======
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

  function getHeaders() {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  }
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
<<<<<<< HEAD
      const rolesData = await api.getRoles();
      const usersData = await api.getAllUsers();

      if (rolesData) setRoles(rolesData.roles || []);
      if (usersData) setUsers(usersData.users || []);
=======
      const [rolesRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/roles`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/auth`, { headers: getHeaders() })
      ]);

      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();

      if (rolesRes.ok) {
        setRoles(rolesData.roles || []);
      } else {
        setError(rolesData.message || "Failed to fetch roles");
      }

      if (usersRes.ok) {
        setUsers(usersData.users || []);
      } else {
        setError(usersData.message || "Failed to fetch users");
      }
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const showUserSearchResults = users.length > 0 || searchSubmitted || userSearch.trim().length > 0;

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

<<<<<<< HEAD
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
=======
  const fetchUsers = async (query = "") => {
    setError("");
    try {
      const url = `${API_BASE_URL}/auth${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const noSearchResults = (searchSubmitted || userSearch.trim().length > 0) && filteredUsers.length === 0;

  const handleSearchUsers = () => {
    const query = userSearch.trim();
    setSearchSubmitted(true);
    setSelectedUser(null);
    if (query) {
      fetchUsers(query);
    }
  };

  const handleUserSearchChange = (value) => {
    setUserSearch(value);
    if (value.trim() === "") {
      setSearchSubmitted(false);
      fetchUsers();
    }
  };

  const availablePermissions = [
    "dashboard",
    "user",
    "role",
    "department",
    "designation",
    "employee",
    "attendance",
    "payroll",
    "notice",
    "settings",
    "leave",
    "profile"
  ];

  const getRolePermissions = (roleName) => {
    const role = roles.find((item) => item.name?.toLowerCase() === roleName?.toLowerCase());
    return role?.permissions || [];
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role?.name || "");
    const existingPermissions = Array.isArray(user.permissions) && user.permissions.length > 0
      ? user.permissions
      : user.role?.permissions || [];
    setSelectedPermissions(existingPermissions);
    setUserSearch("");
    setError("");
    setSuccess("");
  };

  const handleRoleSelection = (roleName) => {
    setSelectedRole(roleName);
    const defaultPermissions = getRolePermissions(roleName);
    setSelectedPermissions(defaultPermissions);
  };

  const togglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission]
    );
  };

  const handleSaveUserAccess = async () => {
    if (!selectedUser) {
      setError("Select a user to assign access.");
      return;
    }

    if (!selectedRole) {
      setError("Please select a role for the user.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/${selectedUser._id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedRole,
          permissions: selectedPermissions
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("User access successfully updated.");
        await fetchData();
        setSelectedUser(data.user);
      } else {
        setError(data.message || "Failed to update user.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update user access.");
    } finally {
      setLoading(false);
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
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
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-sm text-slate-600">Define and monitor system user roles and their active user count.</p>
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
<<<<<<< HEAD
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card stat-card-indigo">
          <div className="stat-header">
            <div className="stat-icon-box total-employees-icon">
              <ShieldCheck size={20} />
=======
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box total-employees-icon bg-emerald-800">
              <ShieldCheck size={20} color="#ffffff" />
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
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
<<<<<<< HEAD
            <div className="stat-icon-box depts-icon">
              <Users size={20} />
=======
            <div className="stat-icon-box depts-icon bg-emerald-600">
              <Users size={20} color="#ffffff" />
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
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
<<<<<<< HEAD
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
=======
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
        
        {/* Roles Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">System Roles</h2>

          {error && (
            <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-md mb-4">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-emerald-800 bg-emerald-50 p-3 rounded-md mb-4">{success}</div>
          )}
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3

          <div className="overflow-auto rounded-md border border-slate-100">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
<<<<<<< HEAD
                  <th>ROLE NAME</th>
                  <th>PERMISSIONS GRANTED</th>
                  <th>EMPLOYEE NAME(S)</th>
                  <th>FROM-TO DATE</th>
                  <th style={{ textAlign: "center" }}>MEMBERS</th>
                  <th style={{ textAlign: "right", paddingRight: "24px" }}>ACTIONS</th>
=======
                  <th className="px-4 py-3">ROLE NAME</th>
                  <th className="px-4 py-3">PERMISSIONS GRANTED</th>
                  <th className="px-4 py-3 text-center">MEMBERS</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
<<<<<<< HEAD
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
=======
                    <td colSpan="4" className="text-center py-8">Loading roles...</td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">No roles registered yet.</td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role._id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <span className="font-semibold uppercase tracking-wide text-slate-900">{role.name}</span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {role.permissions && role.permissions.length > 0 ? (
                          <div className="grid gap-2">
                            {role.permissions.map((p, idx) => (
                              <div key={idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">No permissions configured</span>
                        )}
                      </td>
<<<<<<< HEAD
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
=======
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-emerald-700">{getRoleUserCount(role.name)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteRole(role._id)} className="text-rose-600 hover:text-rose-800">
                          <Trash2 size={16} />
                        </button>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
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

<<<<<<< HEAD
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
=======
        {/* User Access Assignment Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Assign User Access</h2>
          <p className="text-sm text-slate-500 mb-4">Search users by name or email, choose a role, and grant permissions saved on the employee record.</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Search Existing Employee User</label>
            <div className="flex gap-2">
              <input type="text" value={userSearch} onChange={(e) => handleUserSearchChange(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); handleSearchUsers(); } }} placeholder="Type a user name or email" className="flex-1 px-3 py-2 rounded-md border border-slate-300 text-sm text-slate-900" />
              <button type="button" onClick={handleSearchUsers} className="px-3 py-2 rounded-md bg-emerald-600 text-white font-semibold">Search</button>
            </div>

            {showUserSearchResults && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-slate-200 rounded-md bg-slate-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button key={user._id} type="button" onClick={() => handleUserSelect(user)} className="w-full text-left px-3 py-2 hover:bg-slate-100">
                      <div className="flex justify-between gap-3">
                        <span>{user.name}</span>
                        <span className="text-sm text-slate-500">{user.email}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-slate-600">No matching users found. Make sure the user already exists in the system.</div>
                )}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="mb-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h3 className="mb-3 text-sm font-semibold">Selected User</h3>
              <div className="mb-2"><strong>Name:</strong> {selectedUser.name}</div>
              <div className="mb-2"><strong>Email:</strong> {selectedUser.email}</div>
              <div className="mb-4"><strong>Current role:</strong> {selectedUser.role?.name || "N/A"}</div>

              <div className="mb-4">
                <label className="block mb-2 text-xs font-semibold uppercase text-slate-600">Assign role</label>
                <select value={selectedRole} onChange={(e) => handleRoleSelection(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm">
                  <option value="">Select role...</option>
                  {roles.map((role) => (<option key={role._id} value={role.name}>{role.name}</option>))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-xs font-semibold uppercase text-slate-600">Grant permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((permission) => (
                    <button key={permission} type="button" onClick={() => togglePermission(permission)} className={`flex items-center justify-between px-3 py-2 rounded-md ${selectedPermissions.includes(permission) ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white'} border` }>
                      <span className="capitalize">{permission}</span>
                      <span>{selectedPermissions.includes(permission) ? '✓' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={handleSaveUserAccess} className="w-full py-2 rounded-md bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2">
                <UserCheck size={16} />
                <span>Save User Access</span>
              </button>
            </div>
          )}

          <hr className="border-slate-200 my-6" />

          <h2 className="text-lg font-semibold mb-2">Add New Role</h2>
          <p className="text-sm text-slate-500 mb-4">Add a new system role. The configuration permissions will automatically match the configuration in standard permissions.</p>

          <form onSubmit={handleAddRole}>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Role Name</label>
              <select value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm">
                <option value="">Select a system role...</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
              <p className="text-xs text-slate-500 mt-2 italic">Note: Supported system roles: admin, employee.</p>
            </div>

            <button type="submit" className="w-full py-2 rounded-md bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2">
              <Plus size={16} />
              <span>Create Role</span>
            </button>
          </form>
        </div>
      </div>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
    </div>
  );
}
