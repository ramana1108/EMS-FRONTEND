import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./auth/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import AdminEmployee from "./admin/Employee";
import EmployeeDashboard from "./employee/Dashboard";

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
            <AdminPlaceholder title="Departments" />
          </AdminLayout>
        }
      />

      {/* Admin Designations */}
      <Route
        path="/admin/designations"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AdminPlaceholder title="Designations" />
          </AdminLayout>
        }
      />

      {/* Admin Roles */}
      <Route
        path="/admin/roles"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AdminPlaceholder title="Roles" />
          </AdminLayout>
        }
      />

      {/* Admin Attendance */}
      <Route
        path="/admin/attendance"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AdminPlaceholder title="Attendance" />
          </AdminLayout>
        }
      />

      {/* Admin Payroll */}
      <Route
        path="/admin/payroll"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AdminPlaceholder title="Payroll" />
          </AdminLayout>
        }
      />

      {/* Admin Notices */}
      <Route
        path="/admin/notices"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AdminPlaceholder title="Notices" />
          </AdminLayout>
        }
      />

      {/* Employee Dashboard */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
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