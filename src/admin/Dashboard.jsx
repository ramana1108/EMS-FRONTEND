import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Award,
  Users,
  ShieldCheck,
  Wallet,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  FileText
} from "lucide-react";
import api from "../api";
import NotificationBell from "../components/NotificationBell";

// Fallback Stat Cards Data
const defaultDashboardData = {
  totalEmployees: 208,
  totalDepartments: 13,
  presentToday: 186,
  totalNotices: 3,
  recentNotices: [
    { title: "Annual Performance Review 2026 - Submit self-evaluations by Friday." },
    { title: "Independence Day Holiday Notice - Office closed on August 15th." },
    { title: "New Health Insurance Policy - Updated coverage forms in portal." }
  ],
  recentEmployees: [
    { firstName: "John", lastName: "Doe", employeeId: "EMP-001" },
    { firstName: "Jane", lastName: "Smith", employeeId: "EMP-002" },
    { firstName: "Robert", lastName: "Johnson", employeeId: "EMP-003" },
    { firstName: "Emily", lastName: "Davis", employeeId: "EMP-004" }
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return { name: "User", role: "ADMIN" };
  });

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getRoleText = (role) => {
    if (!role) return "ADMIN";
    if (typeof role === "string") return role.toUpperCase();
    if (typeof role === "object" && role.name) return String(role.name).toUpperCase();
    return "ADMIN";
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminDashboard();
        if (mounted && res && res.success) setDashboard(res.dashboard);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const activeData = dashboard || {
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    totalNotices: 0,
    recentEmployees: [],
    recentNotices: [],
  };
  const userName = typeof user?.name === "string" ? user.name : "Admin";

  const displayEmployees = (activeData.recentEmployees || []).filter((emp) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const name = (emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`).toLowerCase();
    const id = (emp.employeeId || "").toLowerCase();
    const email = (emp.email || "").toLowerCase();
    return name.includes(q) || id.includes(q) || email.includes(q);
  });

  const displayNotices = (activeData.recentNotices || []).filter((n) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const text = (n.title || n.description || "").toLowerCase();
    return text.includes(q);
  });

  return (
    <div>
      {/* Top Header Bar */}
      <div className="top-header">
        <div className="search-box" style={{ backgroundColor: "white" }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search Employees, Notices..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="header-right">
          <NotificationBell />
          <div className="admin-profile-badge">
            <div className="admin-avatar-small">{getInitials(userName)}</div>
            <span>{getRoleText(user?.role)}</span>
          </div>
        </div>
      </div>

      {/* Page Title Header */}
      <div className="page-header">
        <div>
          <h1 className="dashboard-title" style={{ color: "black" }}>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, Admin.</p>
        </div>
        <div className="status-badge">
          Ready to manage your team
        </div>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="dashboard-summary-cards">
        <div className="summary-card stat-card-green">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Users size={20} />
            </div>
            <div>
              <p className="stat-label">Total Employees</p>
              <p className="stat-value">{loading ? "..." : (activeData.totalEmployees ?? 0)}</p>
            </div>
          </div>
          <p className="stat-description">Review your employee roster and attendance at a glance.</p>
        </div>

        <div className="summary-card stat-card-blue">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Building2 size={20} />
            </div>
            <div>
              <p className="stat-label">Departments</p>
              <p className="stat-value">{loading ? "..." : (activeData.totalDepartments ?? 0)}</p>
            </div>
          </div>
          <p className="stat-description">Manage department structures and team ownership.</p>
        </div>

        <div className="summary-card stat-card-indigo">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Users size={20} />
            </div>
            <div>
              <p className="stat-label">Attendance Today</p>
              <p className="stat-value">{loading ? "..." : `${activeData.presentToday ?? 0} Present`}</p>
            </div>
          </div>
          <p className="stat-description">Track daily presence and absence summaries.</p>
        </div>

        <div className="summary-card stat-card-amber">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Wallet size={20} />
            </div>
            <div>
              <p className="stat-label">Notices</p>
              <p className="stat-value">{loading ? "..." : (activeData.totalNotices ?? 0)}</p>
            </div>
          </div>
          <p className="stat-description">Recent company notices and announcements.</p>
        </div>
      </div>

      {/* 2. Middle Section */}
      <div className="middle-grid">

        {/* Company Notices */}
        <div className="card-box">
          <div className="card-header-row">
            <h2 className="card-title" style={{ color: "black" }}>Company Notices</h2>
            <span className="view-all-link" onClick={() => navigate("/admin/notices")}>View All</span>
          </div>
          <ul className="notices-list">
            {displayNotices.length > 0
              ? displayNotices.map((n, i) => (
                <li key={i} className="notice-item" style={{ color: "black", backgroundColor: "rgb(204 242 229)", border: "none" }}>
                  {n.title || n}
                </li>
              ))
              : <li className="notice-item" style={{ color: "#64748b", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>No notices found.</li>
            }
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="card-box">
          <h2 className="card-title" style={{ marginBottom: "16px", color: "black" }}>Quick Actions</h2>
          <div className="action-buttons-stack">
            <button className="btn-action" onClick={() => navigate("/admin/employee")}>
              <Plus size={16} /> Add Employee
            </button>
            <button className="btn-action" onClick={() => navigate("/admin/payroll")}>
              <Plus size={16} /> Create Payroll
            </button>
            <button className="btn-action" onClick={() => navigate("/admin/roles")}>
              <Plus size={16} /> Create Manager
            </button>
            <button className="btn-action" onClick={() => navigate("/admin/notices")}>
              <FileText size={16} /> Create Notice
            </button>
          </div>
        </div>

        {/* Employees List */}
        <div className="card-box">
          <div className="card-header-row">
            <h2 className="card-title" style={{ color: "black" }}>Employees</h2>
            <span className="view-all-link" onClick={() => navigate("/admin/employee")}>View All</span>
          </div>
          <div className="managers-list">
            {displayEmployees.length > 0
              ? displayEmployees.map((emp, index) => (
                <div key={emp._id || index} className="manager-item">
                  <div>
                    <p className="manager-name" style={{ color: "black" }}>
                      {emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Staff Member"}
                    </p>
                    <p className="manager-role" style={{ color: "black" }}>
                      {emp.employeeId || (typeof emp.role === "string" ? emp.role : (emp.role?.name || "Employee"))}
                    </p>
                  </div>
                  <button className="btn-contact" onClick={() => navigate("/admin/employee")}>View</button>
                </div>
              ))
              : <div style={{ color: "#64748b", padding: "12px", textAlign: "center" }}>No employees found.</div>
            }
          </div>
        </div>

      </div>
    </div>
  );
}