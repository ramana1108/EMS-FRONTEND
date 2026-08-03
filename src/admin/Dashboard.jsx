import React, { useEffect, useState } from "react";
import "../App.css"; // Clean separate CSS file imported here
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
    <div className="dashboard-app">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div>
          {/* Logo */}
          <div className="sidebar-logo-box">
            <div className="logo-badge">EMS</div>
            <span className="logo-text">EMS Portal</span>
          </div>

          {/* Navigation Links */}
          <nav className="nav-list">
            <button className="nav-item active">
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button className="nav-item">
              <Building2 size={20} />
              Departments
            </button>
            <button className="nav-item">
              <Award size={20} />
              Designation
            </button>
            <button className="nav-item">
              <Users size={20} />
              Employees
            </button>
            <button className="nav-item">
              <ShieldCheck size={20} />
              Roles
            </button>
            <button className="nav-item">
              <Wallet size={20} />
              Payrolls
            </button>
            <button className="nav-item">
              <Settings size={20} />
              Settings
            </button>
            <button className="nav-item">
              <LogOut size={20} />
              Logout
            </button>
          </nav>

          <hr className="sidebar-divider" />

          {/* Employees by Department Legend */}
          <div>
            <p className="dept-legend-title">Employees by Department</p>
            <div>
              <div className="dept-legend-item">
                <span><span className="dot dot-production"></span> Production</span>
                <span>83</span>
              </div>
              <div className="dept-legend-item">
                <span><span className="dot dot-sales"></span> Sales</span>
                <span>50</span>
              </div>
              <div className="dept-legend-item">
                <span><span className="dot dot-it"></span> IT</span>
                <span>50</span>
              </div>
              <div className="dept-legend-item">
                <span><span className="dot dot-admin"></span> Admin</span>
                <span>25</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Info at Bottom */}
        <div className="sidebar-user">
          <div className="user-avatar-badge">PR</div>
          <div>
            <p className="user-name">Prasanna Ramana</p>
            <p className="user-role">ADMIN</p>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="main-content">
        
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
              <div className="admin-avatar-small">A</div>
              <span>Admin</span>
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
        <div className="stats-grid">
          {loading && <div>Loading dashboard...</div>}
          {!loading && dashboard && (
            <>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="stat-label">Total Employees</p>
                    <p className="stat-value">{dashboard.totalEmployees}</p>
                  </div>
                </div>
                <p className="stat-description">Review your employee roster and attendance at a glance.</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="stat-label">Departments</p>
                    <p className="stat-value">{dashboard.totalDepartments}</p>
                  </div>
                </div>
                <p className="stat-description">Manage department structures and team ownership.</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="stat-label">Attendance Today</p>
                    <p className="stat-value">{dashboard.presentToday} Present</p>
                  </div>
                </div>
                <p className="stat-description">Track daily presence and absence summaries.</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box">
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
              <h2 className="card-title">Company Notices</h2>
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
            <h2 className="card-title" style={{ marginBottom: "16px" }}>Quick Actions</h2>
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

          {/* Managers List */}
          <div className="card-box">
            <div className="card-header-row">
              <h2 className="card-title">Managers</h2>
              <span className="view-all-link">View All</span>
            </div>
            <div className="managers-list">
              {managers.map((mgr, index) => (
                <div key={index} className="manager-item">
                  <div>
                    <p className="manager-name">{mgr.name}</p>
                    <p className="manager-role">{mgr.role}</p>
                  </div>
                  <button className="btn-contact">Contact</button>
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

      </main>
    </div>
  );
}