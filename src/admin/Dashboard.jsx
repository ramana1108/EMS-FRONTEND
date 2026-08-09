import React, { useEffect, useState } from "react";
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

// Stat Cards Data
const stats = [
  {
    label: "Total Employees",
    value: "208",
    icon: Users,
    description: "Review your employee roster and attendance at a glance."
  },
  {
    label: "Departments",
    value: "13",
    icon: Building2,
    description: "Manage department structures and team ownership."
  },
  {
    label: "Attendance Today",
    value: "186",
    icon: Users,
    description: "Track daily presence and absence summaries."
  },
  {
    label: "Monthly Payroll",
    value: "₹10,65,000",
    icon: Wallet,
    description: "Verify payroll processing and payment status."
  }
];

// Company Notices List
const notices = [
  "Annual Performance Review 2026 - Submit self-evaluations by Friday.",
  "Independence Day Holiday Notice - Office closed on August 15th.",
  "New Health Insurance Policy - Updated coverage forms in portal."
];

// Managers List
const managers = [
  { name: "Jumn Denner", role: "Manager Directory" },
  { name: "Brank Kahter", role: "Director" },
  { name: "Chris Shanter", role: "Toster Manager" },
  { name: "Mark Rooper", role: "Phahid Esstetor" }
];

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Normalize role to a displayable string if it's an object
        if (parsed && parsed.role && typeof parsed.role === "object") {
          parsed.role = parsed.role.name || parsed.role.role || JSON.stringify(parsed.role);
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return { name: "User", role: "ADMIN" };
  });

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const api = await import("../api");
        const res = await api.getAdminDashboard();
        if (mounted && res && res.success) setDashboard(res.dashboard);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);
  return (
    <div>
      {/* Top Header Bar */}
      <div className="top-header">
        <div className="search-box">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search Employee..."
            className="search-input"
          />
        </div>

        <div className="header-right">
          <button className="icon-btn">
            <Bell size={18} />
          </button>
            <div className="admin-profile-badge">
            <div className="admin-avatar-small">{getInitials(user.name)}</div>
            <span>{typeof user.role === "string" ? user.role : String(user.role || "ADMIN")}</span>
          </div>
        </div>
      </div>

      {/* Page Title Header (Black Text) */}
      <div className="page-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, Admin.</p>
        </div>
        <div className="status-badge">
          Ready to manage your team
        </div>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="dashboard-summary-cards">
        {loading && <div>Loading dashboard...</div>}
        {!loading && dashboard && (
          <>
            <div className="summary-card stat-card-green">
              <div className="stat-header">
                <div className="stat-icon-box" style={{ backgroundColor: "#075d31", color: "#065f46" }}>
                  <Users size={20} />
                </div>
                <div>
                  <p className="stat-label">Total Employees</p>
                  <p className="stat-value">{dashboard.totalEmployees}</p>
                </div>
              </div>
              <p className="stat-description">Review your employee roster and attendance at a glance.</p>
            </div>

            <div className="summary-card stat-card-blue">
              <div className="stat-header">
                <div className="stat-icon-box" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="stat-label">Departments</p>
                  <p className="stat-value">{dashboard.totalDepartments}</p>
                </div>
              </div>
              <p className="stat-description">Manage department structures and team ownership.</p>
            </div>

            <div className="summary-card stat-card-indigo">
              <div className="stat-header">
                <div className="stat-icon-box" style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>
                  <Users size={20} />
                </div>
                <div>
                  <p className="stat-label">Attendance Today</p>
                  <p className="stat-value">{dashboard.presentToday} Present</p>
                </div>
              </div>
              <p className="stat-description">Track daily presence and absence summaries.</p>
            </div>

            <div className="summary-card stat-card-amber">
              <div className="stat-header">
                <div className="stat-icon-box" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="stat-label">Notices</p>
                  <p className="stat-value">{dashboard.totalNotices}</p>
                </div>
              </div>
              <p className="stat-description">Recent company notices and announcements.</p>
            </div>
          </>
        )}
      </div>

      {/* 2. Middle Section */}
      <div className="middle-grid">

        {/* Company Notices */}
        <div className="card-box">
          <div className="card-header-row">
            <h2 className="card-title">Company  Notices</h2>
            <span className="view-all-link">View All</span>
          </div>
          <ul className="notices-list">
            {!dashboard && notices.map((notice, index) => (
              <li key={index} className="notice-item">{notice}</li>
            ))}
            {dashboard && dashboard.recentNotices && dashboard.recentNotices.map((n, i) => (
              <li key={i} className="notice-item">{n.title}</li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="card-box">
          <h2 className="card-title" style={{ marginBottom: "16px" }}>Quick  Actions</h2>
          <div className="action-buttons-stack">
            <button className="btn-action">
              <Plus size={16} /> Add Employee
            </button>
            <button className="btn-action">
              <Plus size={16} /> Create Payroll
            </button>
            <button className="btn-action">
              <Plus size={16} /> Create Manager
            </button>
            <button className="btn-action">
              <FileText size={16} /> Create Notice
            </button>
          </div>
        </div>

        {/* Employees List */}
        <div className="card-box">
          <div className="card-header-row">
            <h2 className="card-title">Employees</h2>
            <span className="view-all-link">View All</span>
          </div>
          <div className="managers-list">
            {dashboard && dashboard.recentEmployees && dashboard.recentEmployees.map((emp, index) => (
              <div key={emp._id || index} className="manager-item">
                <div>
                  <p className="manager-name">{emp.firstName} {emp.lastName}</p>
                  <p className="manager-role">{emp.employeeId}</p>
                </div>
                <button className="btn-contact">View</button>
              </div>
            ))}
            {(!dashboard || !dashboard.recentEmployees || dashboard.recentEmployees.length === 0) && managers.map((mgr, index) => (
              <div key={index} className="manager-item">
                <div>
                  <p className="manager-name">{mgr.name.replace("Directory", "Employee").replace("Toster Manager", "Staff").replace("Director", "Staff").replace("Manager", "Staff")}</p>
                  <p className="manager-role">{mgr.role.replace("Manager Directory", "Staff").replace("Director", "Staff").replace("Toster Manager", "Staff").replace("Esstetor", "Staff")}</p>
                </div>
                <button className="btn-contact">View</button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Bottom Section */}
      <div className="bottom-grid">

        {/* Attendance Analytics Bar Chart */}
        <div className="card-box">
          <h2 className="card-title">Attendance Analytics Bar Chart</h2>

          <div className="chart-bars-container">
            <div className="bar-pair">
              <div className="bar-dark" style={{ height: "60%" }}></div>
              <div className="bar-emerald" style={{ height: "40%" }}></div>
            </div>
            <div className="bar-pair">
              <div className="bar-dark" style={{ height: "75%" }}></div>
              <div className="bar-emerald" style={{ height: "30%" }}></div>
            </div>
            <div className="bar-pair">
              <div className="bar-dark" style={{ height: "90%" }}></div>
              <div className="bar-emerald" style={{ height: "50%" }}></div>
            </div>
            <div className="bar-pair">
              <div className="bar-dark" style={{ height: "50%" }}></div>
              <div className="bar-emerald" style={{ height: "45%" }}></div>
            </div>
            <div className="bar-pair">
              <div className="bar-dark" style={{ height: "85%" }}></div>
              <div className="bar-emerald" style={{ height: "60%" }}></div>
            </div>
          </div>

          <div className="chart-months-row">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
        </div>

        {/* Employee Distribution Pie Chart */}
        <div className="card-box">
          <h2 className="card-title">Employee Distribution Pie Chart</h2>

          <div className="donut-center-container">
            <div className="donut-graphic">
              208
            </div>
          </div>

          <div className="donut-legend-grid">
            <span><span className="dot dot-production"></span> Production</span>
            <span><span className="dot dot-sales"></span> Sales</span>
            <span><span className="dot dot-it"></span> IT</span>
            <span><span className="dot dot-admin"></span> Admin</span>
          </div>
        </div>

      </div>
    </div>
  );
}