import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileInfo, setShowProfileInfo] = useState(false);
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

        // fetch departments for distribution
        try {
          const deps = await api.getDepartments();
          if (deps && deps.departments) setDepartments(deps.departments);
          else if (Array.isArray(deps)) setDepartments(deps);
        } catch (err) {
          console.warn("Failed to load departments for dashboard:", err);
        }

        // fetch employee list for search suggestions
        try {
          const employeesRes = await api.getAllEmployees();
          let employeesList = [];
          if (Array.isArray(employeesRes)) {
            employeesList = employeesRes;
          } else if (employeesRes && Array.isArray(employeesRes.employees)) {
            employeesList = employeesRes.employees;
          } else if (employeesRes && Array.isArray(employeesRes.data)) {
            employeesList = employeesRes.data;
          }
          setAllEmployees(employeesList);
        } catch (err) {
          console.warn("Failed to load employees for search:", err);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);
  const searchItems = [
    { type: "page", label: "Employee Directory", path: "/admin/employee" },
    { type: "page", label: "Attendance", path: "/admin/attendance" },
    { type: "page", label: "Payroll", path: "/admin/payroll" },
    { type: "page", label: "Notices", path: "/admin/notices" },
    { type: "page", label: "Departments", path: "/admin/departments" },
    { type: "page", label: "Designations", path: "/admin/designations" },
    { type: "page", label: "Roles", path: "/admin/roles" },
    { type: "page", label: "Settings", path: "/admin/settings" },
  ];

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const pages = searchItems
      .filter((item) => item.label.toLowerCase().includes(query))
      .map((item) => ({ ...item, type: "page" }));

    const people = allEmployees
      .filter((emp) => {
        const name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim().toLowerCase();
        const email = (emp.email || "").toLowerCase();
        const id = (emp.employeeId || "").toLowerCase();
        return (
          name.includes(query) ||
          email.includes(query) ||
          id.includes(query)
        );
      })
      .slice(0, 6)
      .map((emp) => ({
        type: "employee",
        label: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.email || emp.employeeId || "Employee",
        path: "/admin/employee",
        query: emp.employeeId || emp.email || emp.firstName || "",
      }));

    return [...pages, ...people];
  }, [searchQuery, allEmployees]);

  const handleSearchSelect = (item) => {
    setSearchQuery("");
    if (item.type === "page") {
      navigate(item.path);
    } else if (item.type === "employee") {
      navigate(`${item.path}?search=${encodeURIComponent(item.query)}`);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchSuggestions.length > 0) {
      event.preventDefault();
      handleSearchSelect(searchSuggestions[0]);
    }
  };

  return (
    <div>
      {/* Top Header Bar */}
      <div className="top-header" style={{ position: "relative" }}>
        <div className="search-box" style={{ position: "relative" }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search employee or admin page..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                marginTop: "8px",
                zIndex: 20,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                maxHeight: "280px",
                overflowY: "auto"
              }}
            >
              {searchSuggestions.map((item, idx) => (
                <button
                  key={`${item.type}-${item.label}-${idx}`}
                  onClick={() => handleSearchSelect(item)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#0f172a"
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ color: "#475569", fontSize: "12px" }}>
                    {item.type === "page" ? "Page" : "Employee"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="header-right" style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => navigate("/admin/notices") }>
            <Bell size={18} />
          </button>
          <div
            className="admin-profile-badge"
            onClick={() => setShowProfileInfo((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <div className="admin-avatar-small">{getInitials(user.name)}</div>
            <span>{user.role || "ADMIN"}</span>
          </div>
          {showProfileInfo && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: "10px",
              width: "240px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
              padding: "16px",
              zIndex: 30
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#0f766e", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{getInitials(user.name)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user.name || "Admin"}</div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>{user.role || "Admin"}</div>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#334155", marginBottom: "12px" }}><strong>Email:</strong> {user.email || "-"}</div>
              <button
                style={{ width: "100%", border: "none", borderRadius: "10px", padding: "10px", background: "#0f766e", color: "#ffffff", cursor: "pointer" }}
                onClick={() => {
                  navigate("/admin/settings");
                  setShowProfileInfo(false);
                }}
              >
                View Profile Settings
              </button>
            </div>
          )}
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

            <div className="summary-card stat-card-blue">
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

            <div className="summary-card stat-card-indigo">
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

            <div className="summary-card stat-card-amber">
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
            <button
              className="btn-action"
              style={{ justifyContent: "space-between" }}
              onClick={() => navigate("/admin/employee")}
            >
              <span><Plus size={16} /> Add Employee</span>
              <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: "9999px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                {dashboard ? dashboard.totalEmployees : "--"}
              </span>
            </button>
            <button
              className="btn-action"
              style={{ justifyContent: "space-between" }}
              onClick={() => navigate("/admin/payroll")}
            >
              <span><Plus size={16} /> Create Payroll</span>
              <span style={{ background: "#ecfdf5", color: "#166534", borderRadius: "9999px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                {dashboard ? dashboard.totalPayrolls : "--"}
              </span>
            </button>
            <button
              className="btn-action"
              style={{ justifyContent: "space-between" }}
              onClick={() => navigate("/admin/roles")}
            >
              <span><Plus size={16} /> Create Manager</span>
              <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: "9999px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                {dashboard ? dashboard.totalManagers : "--"}
              </span>
            </button>
            <button
              className="btn-action"
              style={{ justifyContent: "space-between" }}
              onClick={() => navigate("/admin/notices")}
            >
              <span><FileText size={16} /> Create Notice</span>
              <span style={{ background: "#ede9fe", color: "#5b21b6", borderRadius: "9999px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                {dashboard ? dashboard.totalNotices : "--"}
              </span>
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
            {dashboard && dashboard.recentEmployees && dashboard.recentEmployees.length > 0 ? (
              dashboard.recentEmployees.map((emp, index) => (
                <div key={emp._id || index} className="manager-item">
                  <div>
                    <p className="manager-name">{`${emp.firstName || ""} ${emp.lastName || ""}`.trim()}</p>
                    <p className="manager-role">{emp.employeeId || ""}</p>
                  </div>
                  <button className="btn-contact">View</button>
                </div>
              ))
            ) : (
              managers.map((mgr, index) => (
                <div key={index} className="manager-item">
                  <div>
                    <p className="manager-name">{mgr.name.replace("Directory", "Employee").replace("Toster Manager", "Staff").replace("Director", "Staff").replace("Manager", "Staff")}</p>
                    <p className="manager-role">{mgr.role.replace("Manager Directory", "Staff").replace("Director", "Staff").replace("Toster Manager", "Staff").replace("Esstetor", "Staff")}</p>
                  </div>
                  <button className="btn-contact">View</button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. Bottom Section */}
      <div className="bottom-grid">

        {/* Attendance Analytics Bar Chart (breakdown for today) */}
        <div className="card-box">
          <h2 className="card-title">Attendance Analytics Bar Chart</h2>
          <div className="chart-bars-container" style={{ display: 'flex', gap: 12, padding: '16px 0' }}>
            {dashboard ? (
              (() => {
                const bars = [
                  { label: 'Present', value: dashboard.presentToday || 0, color: '#10B981' },
                  { label: 'Absent', value: dashboard.absentToday || 0, color: '#111827' },
                  { label: 'Leave', value: dashboard.leaveToday || 0, color: '#D97706' },
                ];
                const maxValue = Math.max(...bars.map(b => b.value), 1);
                const maxPx = 120; // max bar pixel height
                return bars.map((b, i) => {
                  const heightPx = Math.round((b.value / maxValue) * maxPx);
                  const pct = maxValue > 0 ? Math.round((b.value / ( (dashboard.presentToday||0) + (dashboard.absentToday||0) + (dashboard.leaveToday||0) )) * 100) : 0;
                  return (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: maxPx + 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div style={{ width: 40, height: heightPx || 6, background: b.color, borderRadius: 8, transition: 'height 300ms ease' }} />
                      </div>
                      <div style={{ marginTop: 8, fontWeight: 700 }}>{b.value || 0}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{b.label}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{pct}%</div>
                    </div>
                  );
                });
              })()
            ) : (
              <div style={{ padding: 20 }}>No attendance data</div>
            )}
          </div>
        </div>

        {/* Employee Distribution Pie Chart */}
        <div className="card-box">
          <h2 className="card-title">Employee Distribution Pie Chart</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
            <div style={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {(() => {
                const total = departments && departments.reduce ? departments.reduce((acc, d) => acc + (d.employeeCount || 0), 0) : 0;
                const slices = (departments && departments.length > 0 ? departments : []).slice(0, 6);
                const colors = ['#064E3B', '#F97316', '#059669', '#D97706', '#0EA5A4', '#10B981'];
                if (total <= 0 || slices.length === 0) {
                  return (
                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'conic-gradient(#10B981 0deg, #D1FAE5 360deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 22 }}>{total}</div>
                    </div>
                  );
                }

                // build conic-gradient stops
                let angleSoFar = 0;
                const stops = slices.map((d, i) => {
                  const pct = (d.employeeCount || 0) / total;
                  const start = angleSoFar;
                  const end = angleSoFar + pct * 360;
                  angleSoFar = end;
                  return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                }).join(', ');

                return (
                  <div style={{ width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(${stops})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', fontWeight: 700, fontSize: 22 }}>{total}</div>
                  </div>
                );
              })()}
            </div>

            <div className="donut-legend-grid" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {departments && departments.length > 0 ? (
                departments.slice(0,4).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: ['#064E3B','#F97316','#059669','#D97706'][i % 4] }}></span>
                    <span style={{ color: '#111827' }}>{d.departmentName} ({d.employeeCount || 0})</span>
                  </div>
                ))
              ) : (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#064E3B' }}></span> Production</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#F97316' }}></span> Sales</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#059669' }}></span> IT</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#D97706' }}></span> Admin</span>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}