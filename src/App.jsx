import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./auth/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import AdminEmployee from "./admin/Employee";
import Department from "./admin/Department";
import EmployeeDashboard from "./employee/Dashboard";
import Roles from "./admin/Roles";
import Designations from "./admin/Designations";
import Notice from "./admin/Notice";
import Payroll from "./admin/Payroll";
import Attendance from "./admin/Attendance";
import Settings from "./admin/Settings";
import DepartmentEmployees from "./auth/DepartmentEmployees";
import EmployeeAnnouncements from "./employee/Announcements";
import EmployeeAttendance from "./employee/Attendance";
import EmployeeLeavemanagement from "./employee/Leavemanagement";
import EmployeePayrolls from "./employee/Payrolls";
import EmployeeProfile from "./employee/Profile";
import { getCurrentUser } from "./api/index";

// Placeholder components for other admin sections
const AdminPlaceholder = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-gray-600 mt-2">Coming soon...</p>
  </div>
);

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  if (typeof role === "string") return role.toLowerCase();
  if (typeof role === "object" && role !== null) {
    if (typeof role.name === "string") return role.name.toLowerCase();
    if (typeof role.role === "string") return role.role.toLowerCase();
  }
  return "";
}

function userHasAdminPermissions(user) {
  const permissions = getUserPermissions(user);
  const adminOnlyPermissions = ["department", "designation", "employee", "role", "settings"];
  return permissions.some((perm) => adminOnlyPermissions.includes(perm));
}

function defaultRouteForUser(user) {
  const role = normalizeRole(user?.role);
  if (role === "admin" || userHasAdminPermissions(user)) return "/admin/dashboard";
  if (role === "employee") return "/employee/dashboard";
  return "/";
}

function getUserPermissions(user) {
  if (!user) return [];
  const explicitPermissions = Array.isArray(user.permissions)
    ? user.permissions
    : typeof user.permissions === "string"
      ? user.permissions.split(",").map((perm) => perm.trim()).filter(Boolean)
      : [];
  const rolePermissions = Array.isArray(user.role?.permissions)
    ? user.role.permissions
    : [];
  const permissions = [...explicitPermissions, ...rolePermissions];
  return Array.from(new Set(permissions.map((perm) => String(perm).trim().toLowerCase()).filter(Boolean)));
}

function hasAnyPermission(user, allowedPermissions = []) {
  if (!user || !allowedPermissions.length) return false;
  const userPermissions = getUserPermissions(user);

  function permissionMatches(key, perms) {
    if (!key) return true;
    const k = String(key).toLowerCase();
    return perms.some((p) => {
      const perm = String(p || "").toLowerCase();
      if (!perm) return false;
      if (perm === k) return true;
      if (perm.startsWith(k + ":")) return true;
      return false;
    });
  }

  return allowedPermissions.some((perm) => permissionMatches(perm, userPermissions));
}

function isAllowedRole(user, allowedRoles = []) {
  const role = normalizeRole(user?.role);
  return allowedRoles.map(normalizeRole).includes(role);
}

function RequireAccess({ allowedRoles = [], allowedPermissions = [], children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/" replace />;
  if (isAllowedRole(user, allowedRoles) || hasAnyPermission(user, allowedPermissions)) {
    return children;
  }
  return <Navigate to={defaultRouteForUser(user)} replace />;
}

function RequireRole({ allowedRoles = [], children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/" replace />;
  if (isAllowedRole(user, allowedRoles)) {
    return children;
  }
  return <Navigate to={defaultRouteForUser(user)} replace />;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const location = useLocation();

  const routeToTab = useMemo(
    () => ({
      "/admin/dashboard": "Dashboard",
      "/admin/departments": "Departments",
      "/admin/designations": "Designations",
      "/admin/employee": "Employees",
      "/admin/roles": "Roles",
      "/admin/attendance": "Attendance",
      "/admin/payroll": "Payroll",
      "/admin/notices": "Notices",
      "/admin/settings": "Settings",
      "/employee/dashboard": "Dashboard",
      "/employee/leave": "Leave Management",
      "/employee/attendance": "Attendance",
      "/employee/payroll": "Payrolls",
      "/employee/announcements": "Announcements",
      "/employee/profile": "Profile",
    }),
    []
  );

  React.useEffect(() => {
    const tab = routeToTab[location.pathname];
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.pathname, routeToTab]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return;

    let stopped = false;

    const normalizeUserFromData = (dataUser) => {
      const mergedPermissions = [
        ...(Array.isArray(dataUser.permissions) ? dataUser.permissions : []),
        ...(Array.isArray(dataUser.role?.permissions) ? dataUser.role.permissions : []),
      ];
      const normalizedPermissions = Array.from(
        new Set(
          mergedPermissions
            .map((p) => String(p || "").trim().toLowerCase())
            .filter(Boolean)
        )
      );
      return {
        ...dataUser,
        permissions: normalizedPermissions,
      };
    };

    const refreshUser = async () => {
      try {
        const data = await getCurrentUser();
        if (stopped) return;
        if (data?.success && data.user) {
          const normalizedUser = normalizeUserFromData(data.user);

          const currentRaw = getStoredUser() || {};
          const currentPerms = Array.isArray(currentRaw.permissions) ? currentRaw.permissions.map(p=>String(p).toLowerCase()) : [];
          const newPerms = Array.isArray(normalizedUser.permissions) ? normalizedUser.permissions.map(p=>String(p).toLowerCase()) : [];

          const permsChanged = currentPerms.length !== newPerms.length ||
            currentPerms.some((p) => !newPerms.includes(p)) ||
            newPerms.some((p) => !currentPerms.includes(p));

          if (permsChanged || JSON.stringify(currentRaw.role) !== JSON.stringify(normalizedUser.role)) {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
            // notify other parts of the app
            window.dispatchEvent(new Event("userChanged"));
            // Some libraries rely on storage event for cross-tab; also trigger it
            window.dispatchEvent(new Event("storage"));
          }
        }
      } catch (error) {
        console.error("Unable to refresh current user:", error);
      }
    };

    // Initial refresh, then poll every 30s
    refreshUser();
    const id = setInterval(refreshUser, 30000);

    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, []);

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />
      <Route path="/login/admin" element={<Login />} />
      <Route path="/login/employee" element={<Login />} />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["dashboard"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <AdminDashboard />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Employee */}
      <Route
        path="/admin/employee"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["employee"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <AdminEmployee />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Departments */}
      <Route
        path="/admin/departments"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["department"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Department />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Designations */}
      <Route
        path="/admin/designations"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["designation"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Designations />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Roles */}
      <Route
        path="/admin/roles"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["role"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Roles />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Attendance */}
      <Route
        path="/admin/attendance"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["attendance"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Attendance />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Payroll */}
      <Route
        path="/admin/payroll"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["payroll"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Payroll />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Notices */}
      <Route
        path="/admin/notices"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["notice"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Notice />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Admin Settings */}
      <Route
        path="/admin/settings"
        element={
          <RequireAccess allowedRoles={["admin"]} allowedPermissions={["settings"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Settings />
            </AdminLayout>
          </RequireAccess>
        }
      />

      {/* Department Employees */}
      <Route path="/departments/:id" element={<DepartmentEmployees />} />

      {/* Employee Dashboard */}
      <Route
        path="/employee/dashboard"
        element={
          <RequireRole allowedRoles={["employee"]}>
            <RequireAccess allowedPermissions={["dashboard"]}>
              <EmployeeDashboard />
            </RequireAccess>
          </RequireRole>
        }
      />

      {/* Employee Announcements */}
      <Route
        path="/employee/announcements"
        element={
          <RequireRole allowedRoles={["employee"]}>
            <RequireAccess allowedPermissions={["notice"]}>
              <EmployeeAnnouncements />
            </RequireAccess>
          </RequireRole>
        }
      />

      {/* Employee Attendance */}
      <Route
        path="/employee/attendance"
        element={
          <RequireRole allowedRoles={["employee"]}>
            <RequireAccess allowedPermissions={["attendance"]}>
              <EmployeeAttendance />
            </RequireAccess>
          </RequireRole>
        }
      />

      {/* Employee Leave Management */}
      <Route
        path="/employee/leave"
        element={
          <RequireRole allowedRoles={["employee"]}>
            <RequireAccess allowedPermissions={["leave"]}>
              <EmployeeLeavemanagement />
            </RequireAccess>
          </RequireRole>
        }
      />

      {/* Employee Payroll */}
      <Route
        path="/employee/payroll"
        element={
          <RequireRole allowedRoles={["employee"]}>
            <RequireAccess allowedPermissions={["payroll"]}>
              <EmployeePayrolls />
            </RequireAccess>
          </RequireRole>
        }
      />

      {/* Employee Profile */}
      <Route
        path="/employee/profile"
        element={
          <RequireRole allowedRoles={["employee"]}>
            <RequireAccess allowedPermissions={["profile"]}>
              <EmployeeProfile />
            </RequireAccess>
          </RequireRole>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={getStoredUser() ? defaultRouteForUser(getStoredUser()) : "/"}
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;