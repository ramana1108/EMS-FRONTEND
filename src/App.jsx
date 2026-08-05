import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./auth/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import AdminEmployee from "./admin/Employee";
import EmployeeDashboard from "./employee/Dashboard";
import Roles from "./admin/Roles";
import Designations from "./admin/Designations";
import Notice from "./admin/Notice";
import Payroll from "./admin/Payroll";
import Attendance from "./admin/Attendance";
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

function AppContent() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const location = useLocation();

  // Determine activeTab based on current route
  const routeToTab = useMemo(() => ({
    "/admin/dashboard": "Dashboard",
    "/admin/departments": "Departments",
    "/admin/designations": "Designations",
    "/admin/employee": "Employees",
    "/admin/roles": "Roles",
    "/admin/attendance": "Attendance",
    "/admin/payroll": "Payroll",
    "/admin/notices": "Notices",
  }), []);

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
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AdminDashboard />
          </AdminLayout>
        }
      />

      {/* Admin Employee */}
      <Route
        path="/admin/employee"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AdminEmployee />
          </AdminLayout>
        }
      />

      {/* Admin Departments */}
      <Route
        path="/admin/departments"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Designations />
          </AdminLayout>
        }
      />

      {/* Admin Designations */}
      <Route
        path="/admin/designations"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Designations />
          </AdminLayout>
        }
      />

      {/* Admin Roles */}
      <Route
        path="/admin/roles"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Roles />
          </AdminLayout>
        }
      />

      {/* Admin Attendance */}
      <Route
        path="/admin/attendance"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Attendance />
          </AdminLayout>
        }
      />

      {/* Admin Payroll */}
      <Route
        path="/admin/payroll"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Payroll />
          </AdminLayout>
        }
      />

      {/* Admin Notices */}
      <Route
        path="/admin/notices"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Notice />
          </AdminLayout>
        }
      />

      {/* Employee Dashboard */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

      {/* Employee Announcements */}
      <Route path="/employee/announcements" element={<EmployeeAnnouncements />} />

      {/* Employee Attendance */}
      <Route path="/employee/attendance" element={<EmployeeAttendance />} />

      {/* Employee Leave Management */}
      <Route path="/employee/leave" element={<EmployeeLeavemanagement />} />

      {/* Employee Payroll */}
      <Route path="/employee/payroll" element={<EmployeePayrolls />} />

      {/* Employee Profile */}
      <Route path="/employee/profile" element={<EmployeeProfile />} />
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