import React, { useState, useMemo } from "react";
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
  return typeof role === "string" ? role.toLowerCase() : "";
}

function defaultRouteForUser(user) {
  const role = normalizeRole(user?.role);
  if (role === "admin") return "/admin/dashboard";
  if (["employee", "manager", "hr"].includes(role)) return "/employee/dashboard";
  return "/";
}

function isAllowedRole(user, allowedRoles = []) {
  const role = normalizeRole(user?.role);
  return allowedRoles.map(normalizeRole).includes(role);
}

function RequireRole({ allowedRoles = [], children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/" replace />;
  if (!isAllowedRole(user, allowedRoles)) {
    return <Navigate to={defaultRouteForUser(user)} replace />;
  }
  return children;
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
    }),
    []
  );

  React.useEffect(() => {
    const tab = routeToTab[location.pathname];
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.pathname, routeToTab]);

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
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <AdminDashboard />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Employee */}
      <Route
        path="/admin/employee"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <AdminEmployee />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Departments */}
      <Route
        path="/admin/departments"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Department />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Designations */}
      <Route
        path="/admin/designations"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Designations />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Roles */}
      <Route
        path="/admin/roles"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Roles />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Attendance */}
      <Route
        path="/admin/attendance"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Attendance />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Payroll */}
      <Route
        path="/admin/payroll"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Payroll />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Notices */}
      <Route
        path="/admin/notices"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Notice />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Admin Settings */}
      <Route
        path="/admin/settings"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <Settings />
            </AdminLayout>
          </RequireRole>
        }
      />

      {/* Department Employees */}
      <Route path="/departments/:id" element={<DepartmentEmployees />} />

      {/* Employee Dashboard */}
      <Route
        path="/employee/dashboard"
        element={
          <RequireRole allowedRoles={["employee", "manager", "hr"]}>
            <EmployeeDashboard />
          </RequireRole>
        }
      />

      {/* Employee Announcements */}
      <Route
        path="/employee/announcements"
        element={
          <RequireRole allowedRoles={["employee", "manager", "hr"]}>
            <EmployeeAnnouncements />
          </RequireRole>
        }
      />

      {/* Employee Attendance */}
      <Route
        path="/employee/attendance"
        element={
          <RequireRole allowedRoles={["employee", "manager", "hr"]}>
            <EmployeeAttendance />
          </RequireRole>
        }
      />

      {/* Employee Leave Management */}
      <Route
        path="/employee/leave"
        element={
          <RequireRole allowedRoles={["employee", "manager", "hr"]}>
            <EmployeeLeavemanagement />
          </RequireRole>
        }
      />

      {/* Employee Payroll */}
      <Route
        path="/employee/payroll"
        element={
          <RequireRole allowedRoles={["employee", "manager", "hr"]}>
            <EmployeePayrolls />
          </RequireRole>
        }
      />

      {/* Employee Profile */}
      <Route
        path="/employee/profile"
        element={
          <RequireRole allowedRoles={["employee", "manager", "hr"]}>
            <EmployeeProfile />
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