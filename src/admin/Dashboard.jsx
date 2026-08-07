import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
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
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
      <div className="top-header relative">
        <div className="search-box relative">
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
            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-2 z-20 shadow-lg max-h-72 overflow-y-auto">
              {searchSuggestions.map((item, idx) => (
                <button key={`${item.type}-${item.label}-${idx}`} onClick={() => handleSearchSelect(item)} className="w-full text-left px-4 py-3 flex justify-between gap-2 bg-transparent border-0 cursor-pointer text-slate-900">
                  <span>{item.label}</span>
                  <span className="text-slate-500 text-xs">{item.type === "page" ? "Page" : "Employee"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="header-right relative">
          <button className="icon-btn" onClick={() => navigate("/admin/notices") }>
            <Bell size={18} />
          </button>
          <div
            className="admin-profile-badge cursor-pointer flex items-center gap-2"
            onClick={() => setShowProfileInfo((prev) => !prev)}
          >
            <div className="admin-avatar-small">{getInitials(user.name)}</div>
            <span>{user.role || "ADMIN"}</span>
          </div>
          {showProfileInfo && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white border rounded-lg shadow-lg p-4 z-30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">{getInitials(user.name)}</div>
                <div>
                  <div className="font-bold">{user.name || "Admin"}</div>
                  <div className="text-xs text-slate-500">{user.role || "Admin"}</div>
                </div>
              </div>
              <div className="text-sm text-slate-700 mb-3"><strong>Email:</strong> {user.email || "-"}</div>
              <button className="w-full rounded-md py-2 bg-emerald-700 text-white" onClick={() => { navigate("/admin/settings"); setShowProfileInfo(false); }}>View Profile Settings</button>
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
          <h2 className="card-title mb-4">Quick Actions</h2>
          <div className="action-buttons-stack">
            <button className="btn-action flex justify-between items-center" onClick={() => navigate("/admin/employee") }>
              <span className="flex items-center gap-2"><Plus size={16} /> Add Employee</span>
              <span className="rounded-full px-2 py-1 text-xs font-bold bg-sky-100 text-sky-700">{dashboard ? dashboard.totalEmployees : "--"}</span>
            </button>
            <button className="btn-action flex justify-between items-center" onClick={() => navigate("/admin/payroll") }>
              <span className="flex items-center gap-2"><Plus size={16} /> Create Payroll</span>
              <span className="rounded-full px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700">{dashboard ? dashboard.totalPayrolls : "--"}</span>
            </button>
            <button className="btn-action flex justify-between items-center" onClick={() => navigate("/admin/roles") }>
              <span className="flex items-center gap-2"><Plus size={16} /> Create Manager</span>
              <span className="rounded-full px-2 py-1 text-xs font-bold bg-amber-100 text-amber-700">{dashboard ? dashboard.totalManagers : "--"}</span>
            </button>
            <button className="btn-action flex justify-between items-center" onClick={() => navigate("/admin/notices") }>
              <span className="flex items-center gap-2"><FileText size={16} /> Create Notice</span>
              <span className="rounded-full px-2 py-1 text-xs font-bold bg-violet-100 text-violet-700">{dashboard ? dashboard.totalNotices : "--"}</span>
            </button>
          </div>
        </div>

        {/* Managers / Recent Employees List */}
        <div className="card-box">
          <div className="card-header-row">
            <h2 className="card-title">Managers</h2>
            <span className="view-all-link">View All</span>
          </div>
          <div className="managers-list">
            {!dashboard && managers.map((mgr, index) => (
              <div key={index} className="manager-item">
                <div>
                  <p className="manager-name">{mgr.name}</p>
                  <p className="manager-role">{mgr.role}</p>
                </div>
                <button className="btn-contact">Contact</button>
              </div>
            ))}
            {dashboard && dashboard.recentEmployees && dashboard.recentEmployees.map((emp, idx) => (
              <div key={idx} className="manager-item">
                <div>
                  <p className="manager-name">{`${emp.firstName || ''} ${emp.lastName || ''}`.trim()}</p>
                  <p className="manager-role">{emp.employeeId || ''}</p>
                </div>
                <button className="btn-contact">Contact</button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Bottom Section */}
      <div className="bottom-grid">
        
        {/* Attendance Analytics Bar Chart (breakdown for today) */}
        <div className="card-box">
          <h2 className="card-title">Attendance Analytics Bar Chart</h2>
          <div className="chart-bars-container flex gap-3 py-4">
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
                    <div key={i} className="flex-1 text-center">
                      <div className="flex items-end justify-center" style={{ height: maxPx + 20 }}>
                        <div style={{ width: 40, height: heightPx || 6, background: b.color, borderRadius: 8, transition: 'height 300ms ease' }} />
                      </div>
                      <div className="mt-2 font-bold">{b.value || 0}</div>
                      <div className="text-xs text-slate-500">{b.label}</div>
                      <div className="text-xs text-slate-400">{pct}%</div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="p-5">No attendance data</div>
            )}
          </div>
        </div>

        {/* Employee Distribution Pie Chart */}
        <div className="card-box">
          <h2 className="card-title">Employee Distribution Pie Chart</h2>
          <div className="flex items-center gap-4 py-3">
            <div className="w-[150px] h-[150px] flex items-center justify-center relative">
              {(() => {
                const total = departments && departments.reduce ? departments.reduce((acc, d) => acc + (d.employeeCount || 0), 0) : 0;
                const slices = (departments && departments.length > 0 ? departments : []).slice(0, 6);
                const colors = ['#064E3B', '#F97316', '#059669', '#D97706', '#0EA5A4', '#10B981'];
                if (total <= 0 || slices.length === 0) {
                  return (
                    <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(#10B981 0deg, #D1FAE5 360deg)' }}>
                      <div className="font-bold text-[22px]">{total}</div>
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
                  <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${stops})` }}>
                    <div className="absolute font-bold text-[22px]">{total}</div>
                  </div>
                );
              })()}
            </div>

            <div className="donut-legend-grid flex flex-col gap-2">
              {departments && departments.length > 0 ? (
                departments.slice(0,4).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: ['#064E3B','#F97316','#059669','#D97706'][i % 4] }}></span>
                    <span className="text-slate-900">{d.departmentName} ({d.employeeCount || 0})</span>
                  </div>
                ))
              ) : (
                <>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: '#064E3B' }}></span> Production</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: '#F97316' }}></span> Sales</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: '#059669' }}></span> IT</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: '#D97706' }}></span> Admin</span>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}