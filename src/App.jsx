import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./admin/Dashboard.css";

import Login from "./auth/Login";
import AdminDashboard from "./admin/Dashboard";
import EmployeeDashboard from "./employee/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page & Unified Logins */}
        <Route path="/" element={<Login />} />
        <Route path="/login/employee" element={<Login />} />
        <Route path="/login/admin" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;