import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page & Unified Logins */}
        <Route path="/" element={<Login />} />
        <Route path="/login/employee" element={<Login />} />
        <Route path="/login/admin" element={<Login />} />

        {/* Unified Registration Page */}
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;