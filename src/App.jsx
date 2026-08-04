import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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


  const routeToTab = useMemo(() => ({
    "/admin/dashboard": "Dashboard",
    "/admin/departments": "Departments",
    "/admin/designations": "Designations",
    "/admin/employee": "Employees",
    "/admin/roles": "Roles",
    "/admin/attendance": "Attendance",
    "/admin/payroll": "Payroll",
    "/admin/notices": "Notices",
    "/admin/settings": "Settings",
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
            <Department />
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

      {/* Admin Settings */}
      <Route
        path="/admin/settings"
        element={
          <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Settings />
          </AdminLayout>
        }
      />

      {/* Department Employees */}
      <Route path="/departments/:id" element={<DepartmentEmployees />} />

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