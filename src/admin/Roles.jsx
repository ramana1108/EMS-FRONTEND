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
  X,
  Search,
  MoreVertical
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

const PERMISSION_GRID_MAPPING = [
  {
    module: "Dashboard",
    key: "dashboard",
    actions: { view: true, create: false, edit: false, delete: false, export: false }
  },
  {
    module: "Departments",
    key: "department",
    actions: { view: true, create: true, edit: true, delete: true, export: false }
  },
  {
    module: "Designations",
    key: "designation",
    actions: { view: true, create: true, edit: true, delete: true, export: false }
  },
  {
    module: "Employees",
    key: "employee",
    actions: { view: true, create: true, edit: true, delete: true, export: true }
  },
  {
    module: "Roles",
    key: "role",
    actions: { view: true, create: true, edit: true, delete: true, export: false }
  },
  {
    module: "Attendance",
    key: "attendance",
    actions: { view: true, create: true, edit: true, delete: true, export: false }
  },
  {
    module: "Payroll",
    key: "payroll",
    actions: { view: true, create: true, edit: true, delete: true, export: false }
  },
  {
    module: "Notices",
    key: "notice",
    actions: { view: true, create: true, edit: true, delete: true, export: false }
  },
  {
    module: "Profile",
    key: "profile",
    actions: { view: true, create: false, edit: true, delete: false, export: false }
  }
];

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);

  // Employees Redesign Search and Menu States
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const rolesData = await api.getRoles();
      const usersData = await api.getAllUsers();
      const employeesData = await api.getAllEmployees();

      if (rolesData) setRoles(rolesData.roles || []);

      const loadedEmployees = employeesData?.employees || employeesData || [];
      const mapped = (usersData?.users || []).map((u, idx) => {
        const emp = loadedEmployees.find(e => e.email?.toLowerCase() === u.email?.toLowerCase());
        const defaultEmpId = `EMP${String(idx + 1).padStart(3, '0')}`;
        return {
          ...u,
          employeeId: emp?.employeeId || defaultEmpId,
          status: emp?.status || "Active",
          gender: emp?.gender || "Male",
          phone: emp?.phone || "",
          address: emp?.address || "",
          joiningDate: emp?.joiningDate || "",
          displayName: u.displayName || u.name || (emp ? `${emp.firstName} ${emp.lastName}`.trim() : "Unnamed"),
        };
      });
      setUsers(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Close actions dropdown when clicking elsewhere
    const handleOutsideClick = () => {
      setOpenMenuUserId(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const handleRemovePermissions = async (user) => {
    if (!user.role) {
      setError("This employee does not have an assigned role.");
      return;
    }
    const confirmMessage = `Are you sure you want to remove all permissions for role "${user.role.name}" assigned to ${user.displayName}? This will clear access permissions for this role.`;
    if (!window.confirm(confirmMessage)) return;

    setError("");
    setSuccess("");
    try {
      const data = await api.updateRole(user.role._id, {
        name: user.role.name,
        permissions: []
      });
      if (data && data.role) {
        setSuccess(`Permissions removed successfully for role ${user.role.name}.`);
        fetchData();
      } else {
        setError(data?.message || "Failed to remove permissions");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to remove permissions");
    }
  };

  const openEditPermissions = (role) => {
    setSelectedRole(role);
    let initialPerms = [...(role.permissions || [])];

    // Auto-populate helper sub-permissions if the role has the main permission key
    PERMISSION_GRID_MAPPING.forEach(item => {
      if (initialPerms.includes(item.key)) {
        Object.keys(item.actions).forEach(action => {
          if (item.actions[action]) {
            const subKey = `${item.key}:${action}`;
            if (!initialPerms.includes(subKey)) {
              initialPerms.push(subKey);
            }
          }
        });
      }
    });

    setEditPermissions(initialPerms);
    setIsEditModalOpen(true);
  };

  const toggleGridPermission = (moduleKey, action) => {
    const permString = `${moduleKey}:${action}`;
    let updated = [...editPermissions];

    if (updated.includes(permString)) {
      updated = updated.filter(p => p !== permString);
    } else {
      updated.push(permString);
    }

    // Manage top-level key matching backend expectations:
    // If any action for this module is checked, ensure the module key is inside the permissions list.
    // Otherwise, remove it.
    const hasAnyAction = updated.some(p => p.startsWith(`${moduleKey}:`));
    if (hasAnyAction) {
      if (!updated.includes(moduleKey)) {
        updated.push(moduleKey);
      }
    } else {
      updated = updated.filter(p => p !== moduleKey);
    }

    setEditPermissions(updated);
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

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesId = u.employeeId?.toLowerCase().includes(term);
    const matchesName = u.displayName?.toLowerCase().includes(term);
    const matchesEmail = u.email?.toLowerCase().includes(term);
    const matchesRole = u.role?.name?.toLowerCase().includes(term);
    return matchesId || matchesName || matchesEmail || matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
      <div className="page-header mb-6 gap-4">
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FCA5A5", backgroundColor: "#450A0A", border: "1px solid #991B1B", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          <AlertCircle size={16} className="text-[#EF4444]" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ color: "#5EEAD4", backgroundColor: "#123F43", border: "1px solid #0F766E", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
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
        {/* Employees Permissions Card */}
        <div className="employee-permissions-card card-box" style={{ borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px", width: "100%" }}>
            <div style={{ textAlign: "left" }}>
              <h2 className="dashboard-title" style={{ fontSize: "20px", fontWeight: "700", color: "#172033" }}>Employees</h2>
              <p className="dashboard-subtitle" style={{ margin: "4px 0 0 0", color: "#64748B" }}>View all employees and their role access.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="employee-table" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead className="permissions-table-header">
                <tr>
                  <th className="table-center-col" style={{ width: "50px" }}>#</th>
                  <th>EMPLOYEE ID</th>
                  <th>EMPLOYEE NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th className="table-center-col">STATUS</th>
                  <th className="table-actions-col" style={{ width: "80px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px 0" }}>Loading employees...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px 0" }}>No employees found matching criteria.</td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, idx) => (
                    <tr key={user._id} className="employee-row" style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td className="table-center-col" style={{ fontSize: "14px", fontWeight: "600", color: "#64748B" }}>
                        {startIndex + idx + 1}
                      </td>
                      <td className="employee-id-col" style={{ fontSize: "14px", fontWeight: "600", color: "#172033" }}>
                        {user.employeeId}
                      </td>
                      <td className="employee-name-col" style={{ fontSize: "14px", fontWeight: "700", color: "#172033" }}>
                        {user.displayName}
                      </td>
                      <td className="employee-email-col" style={{ fontSize: "13px", color: "#64748B" }}>
                        {user.email}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        <span className="employee-dept-pill">
                          {user.role?.name || "Employee"}
                        </span>
                      </td>
                      <td className="table-center-col">
                        <span className={`employee-status-badge ${user.status?.toLowerCase() === "active" ? "active" : "inactive"}`}>
                          {user.status || "Active"}
                        </span>
                      </td>
                      <td className="table-actions-col" style={{ position: "relative" }}>
                        <div className="actions-dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuUserId(openMenuUserId === user._id ? null : user._id);
                            }}
                            className="action-icon-btn"
                            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px", color: "#64748b" }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuUserId === user._id && (
                            <div className="action-dropdown-list">
                              <button
                                type="button"
                                className="action-dropdown-btn"
                                onClick={() => {
                                  setViewingUser(user);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                View Permissions
                              </button>
                              <button
                                type="button"
                                className="action-dropdown-btn"
                                onClick={() => {
                                  if (user.role) {
                                    openEditPermissions(user.role);
                                  } else {
                                    setError("This employee does not have an assigned role to edit.");
                                  }
                                }}
                              >
                                Edit Permissions
                              </button>
                              <button
                                type="button"
                                className="action-dropdown-btn-danger"
                                onClick={() => handleRemovePermissions(user)}
                              >
                                Remove Permissions
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "16px" }}>
            <p className="pagination-info" style={{ fontSize: "12px", color: "#64748b", textAlign: "left", marginBottom: "12px" }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} employees
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startItem={startIndex + 1}
              endItem={Math.min(startIndex + itemsPerPage, filteredUsers.length)}
              totalItems={filteredUsers.length}
            />
          </div>
        </div>
      </div>

      {/* Add Role Modal Dialog */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card-wide">
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
          <div className="modal-content-card-wide" style={{ maxWidth: "1100px" }}>
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
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                {/* Left: Employee list */}
                <div style={{ width: "22%", border: "1px solid #e6edf3", borderRadius: "8px", padding: "12px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "13px" }}>Select Employee</strong>
                    <button type="button" onClick={() => { /* placeholder for selecting none */ }} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>Clear</button>
                  </div>
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {users.length === 0 ? (
                      <div style={{ color: "#64748b", fontSize: "13px" }}>No users</div>
                    ) : (
                      users.map(u => {
                        const isAssigned = u.role && (u.role.name?.toLowerCase() === selectedRole.name?.toLowerCase() || u.role?._id === selectedRole._id);
                        return (
                          <div key={u._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "6px", background: isAssigned ? "#eef2ff" : "transparent", cursor: "pointer", marginBottom: "6px" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eef2f8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0f172a" }}>
                              {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div style={{ fontSize: "13px" }}>
                              <div style={{ fontWeight: 700 }}>{u.name || "Unnamed"}</div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>{u.email || u._id}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Center: Permission grid */}
                <div style={{ width: "52%", border: "1px solid #e6edf3", borderRadius: "8px", padding: "12px", background: "#fff", overflowX: "auto" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginTop: 0 }}>Choose Access</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: "600", color: "#475569" }}>Module / Field</th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: "600", color: "#475569" }}>View</th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: "600", color: "#475569" }}>Create</th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: "600", color: "#475569" }}>Edit</th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: "600", color: "#475569" }}>Delete</th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: "600", color: "#475569" }}>Export</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSION_GRID_MAPPING.map((item, idx) => (
                        <tr key={item.key} style={{ borderBottom: idx < PERMISSION_GRID_MAPPING.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <td style={{ textAlign: "left", padding: "12px 16px", fontWeight: "600", color: "#334155" }}>
                            {item.module}
                          </td>
                          {["view", "create", "edit", "delete", "export"].map((action) => {
                            const isAllowed = item.actions[action];
                            const isChecked = editPermissions.includes(`${item.key}:${action}`);
                            return (
                              <td key={action} style={{ textAlign: "center", padding: "12px 8px" }}>
                                {isAllowed ? (
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleGridPermission(item.key, action)}
                                    style={{
                                      accentColor: "#10b981",
                                      width: "16px",
                                      height: "16px",
                                      cursor: "pointer"
                                    }}
                                  />
                                ) : (
                                  <span style={{ color: "#cbd5e1", fontSize: "14px" }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right: Permission summary */}
                <div style={{ width: "24%", border: "1px solid #e6edf3", borderRadius: "8px", padding: "12px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "13px" }}>Permission Summary</strong>
                    <button type="button" onClick={() => setEditPermissions([])} style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer" }}>Clear All</button>
                  </div>
                  <div style={{ fontSize: "13px", color: "#334155", maxHeight: "320px", overflowY: "auto" }}>
                    {PERMISSION_GRID_MAPPING.map(item => {
                      const actions = ["view", "create", "edit", "delete", "export"].filter(a => editPermissions.includes(`${item.key}:${a}`));
                      return (
                        <div key={item.key} style={{ marginBottom: "10px" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.module}</div>
                          <div style={{ color: "#64748b", fontSize: "12px" }}>{actions.length > 0 ? actions.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ") : "No access"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
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
      {/* View Permissions Modal Dialog */}
      {isViewModalOpen && viewingUser && (
        <div className="modal-backdrop">
          <div className="modal-content-card-wide" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <div>
                <h2>View Permissions</h2>
                <p className="modal-subtitle">
                  Granted access permissions for Employee: <span style={{ fontWeight: "700" }}>{viewingUser.displayName}</span>
                </p>
              </div>
              <button
                className="btn-close"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingUser(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "16px 0" }}>
              <div style={{ marginBottom: "16px", textAlign: "left" }}>
                <strong>Role:</strong> <span className="role-pill-blue" style={{ marginLeft: "8px" }}>{viewingUser.role?.name || "None"}</span>
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: "600", color: "#475569" }}>Module</th>
                      <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: "600", color: "#475569" }}>Actions Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_GRID_MAPPING.map((item) => {
                      const permissions = viewingUser.role?.permissions || [];
                      const allowedActions = ["view", "create", "edit", "delete", "export"].filter(action =>
                        permissions.includes(`${item.key}:${action}`)
                      );

                      return (
                        <tr key={item.key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ textAlign: "left", padding: "10px 16px", fontWeight: "600", color: "#334155" }}>
                            {item.module}
                          </td>
                          <td style={{ textAlign: "left", padding: "10px 16px", color: "#64748b" }}>
                            {allowedActions.length > 0 ? (
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-start" }}>
                                {allowedActions.map(a => (
                                  <span key={a} style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", color: "#475569", textTransform: "capitalize" }}>
                                    {a}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>No access</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingUser(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
