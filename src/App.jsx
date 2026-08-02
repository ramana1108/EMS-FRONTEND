import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DepartmentEmployees from "./pages/DepartmentEmployees";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page & Unified Logins */}
        <Route path="/" element={<Login />} />
        <Route path="/login/employee" element={<Login />} />
        <Route path="/login/admin" element={<Login />} />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={<Dashboard />} />

        <Route
    path="/departments/:id"
    element={<DepartmentEmployees />}
/>

        {/* Unified Registration Page */}


      </Routes>
    </BrowserRouter>
  );
}

export default App;