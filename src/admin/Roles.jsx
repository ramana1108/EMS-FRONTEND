import { useState, useEffect } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
import {
  ShieldCheck,
  Plus,
  Trash2,
  Users,
  UserCheck,
  AlertCircle
} from "lucide-react";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
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
    }
  };

  // Compute stats
  const getRoleUserCount = (roleNameStr) => {
    return users.filter(u => u.role && u.role.name?.toLowerCase() === roleNameStr?.toLowerCase()).length;
  };

  const getAdminCount = () => getRoleUserCount("admin");
  const getEmployeeCount = () => getRoleUserCount("employee");

  return (
    <div className="p-6">
      {/* Top Header Bar */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-sm text-slate-600">Define and monitor system user roles and their active user count.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box total-employees-icon bg-emerald-800">
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <p className="stat-label">Admins</p>
              <p className="stat-value">{getAdminCount()}</p>
            </div>
          </div>
          <p className="stat-description">System administrators</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box depts-icon bg-emerald-600">
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

          <div className="overflow-auto rounded-md border border-slate-100">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="px-4 py-3">ROLE NAME</th>
                  <th className="px-4 py-3">PERMISSIONS GRANTED</th>
                  <th className="px-4 py-3 text-center">MEMBERS</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
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
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">No permissions configured</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-emerald-700">{getRoleUserCount(role.name)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteRole(role._id)} className="text-rose-600 hover:text-rose-800">
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
    </div>
  );
}
