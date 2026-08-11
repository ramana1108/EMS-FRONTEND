
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Megaphone
} from "lucide-react";
import api from "../api";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isOpen, setIsOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getCurrentEmployeeDashboard();
        if (mounted && res?.success) {
          setDashboard(res.dashboard);
        }
      } catch (err) {
        console.error("Failed to load employee dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const storedUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {};
  const employeeName =
    dashboard?.employeeProfile?.firstName || storedUser.firstName || storedUser.name
      ? `${dashboard?.employeeProfile?.firstName || storedUser.firstName || storedUser.name || ""} ${dashboard?.employeeProfile?.lastName || storedUser.lastName || ""}`.trim()
      : "Employee";
  const employeeRole =
    dashboard?.employeeProfile?.designationName || storedUser.role || "Employee";
  const employeeInitials = employeeName
    ? employeeName
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "E";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="lg:pl-[260px]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/10"
            aria-label="Open sidebar"
          >
            <span className="text-lg font-bold">☰</span>
          </button>
          <div className="text-sm font-semibold text-slate-900">Employee Dashboard</div>
        </div>

        <main className="emp-main-content px-4 py-6 sm:px-6 lg:px-8">
          <div className="emp-top-header">
<div className="emp-search-box" style={{ backgroundColor: "white" }}>
                <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search Employee..."
                className="emp-search-input"
              />
            </div>

            <div className="emp-user-profile-badge">
              <div className="emp-avatar-circle">{employeeInitials}</div>
              <span>{employeeName}</span>
            </div>
          </div>

          <div className="emp-stats-grid">
            {loading && <div>Loading...</div>}
            {!loading && dashboard && (
              <>
                <div className="emp-stat-card stat-card-green">
                  <div className="emp-stat-top">
                    <div className="emp-stat-icon-box">
                      <TrendingUp size={18} />
                    </div>
                    <span className="emp-stat-title">Attendance</span>
                  </div>
                  <p className="emp-stat-value">
                    {dashboard.todayAttendance?.status || "No record"}
                  </p>
                  <span className="emp-stat-subtext">Today&apos;s status</span>
                </div>

                <div className="emp-stat-card stat-card-blue">
                  <div className="emp-stat-top">
                    <div className="emp-stat-icon-box">
                      <Calendar size={18} />
                    </div>
                    <span className="emp-stat-title">Leave Balance</span>
                  </div>
                  <p className="emp-stat-value">
                    {dashboard.employeeProfile?.leaveBalance ?? "—"}
                  </p>
                  <span className="emp-stat-subtext">Available</span>
                </div>

                <div className="emp-stat-card stat-card-indigo">
                  <div className="emp-stat-top">
                    <div className="emp-stat-icon-box">
                      <DollarSign size={18} />
                    </div>
                    <span className="emp-stat-title">Current Salary</span>
                  </div>
                  <p className="emp-stat-value">
                    {dashboard.employeeProfile?.salary ? `$${dashboard.employeeProfile.salary}` : "—"}
                  </p>
                  <span className="emp-stat-subtext">Base salary</span>
                </div>

                <div className="emp-stat-card stat-card-amber">
                  <div className="emp-stat-top">
                    <div className="emp-stat-icon-box">
                      <Megaphone size={18} />
                    </div>
                    <span className="emp-stat-title">Recent Alerts</span>
                  </div>
                  <p className="emp-stat-value">
                    {dashboard.recentNotices?.length ?? 0}
                  </p>
                  <span className="emp-stat-subtext">Latest notices</span>
                </div>
              </>
            )}
          </div>

         

          <div className="emp-middle-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="emp-card-box">
              <h2 className="emp-card-title" style={{ color: "black" }}>
                Company Announcements
              </h2>
              <div className="announcement-list" style={{ maxHeight: "500px", overflowY: "auto", padding:"16px" }}>
                {dashboard?.recentNotices?.length ? (
                  dashboard.recentNotices.map((notice) => (
                    <div key={notice._id || notice.title} className="announcement-item" style={{ backgroundColor: "rgb(21, 155, 113)", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
                      <div className="announcement-icon">
                        <Megaphone size={18} />
                      </div>
                      <div>
                        <p className="announcement-title" style={{ color: "black" }}>
                          {notice.title}
                          </p>
                        <p className="announcement-desc" style={{ color: "black" }}>
                          {notice.description}
                        </p>
                      </div>
                      <span className="announcement-date" style={{ color: "black" }}>
                        {new Date(notice.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#64748b", padding: "16px 0" }}>No announcements available.</p>
                )}
              </div>
            </div>

            <div className="emp-card-box">
              <h2 className="emp-card-title" style={{ color: "black" }}>
                Profile Summary
              </h2>
              <div className="profile-card-content space-y-4 flex flex-col items-center">
                <img
                  src={dashboard?.employeeProfile?.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                  alt={employeeName}
                  className="profile-avatar-large"
                  style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginTop:"3rem" }}
                />
                <div>
                  <p className="profile-name" style={{color : "black"}}>{employeeName}</p>
                  <p className="profile-role">{employeeRole}</p>
                </div>
              
                <div className="w-full space-y-3 pt-2">
                  <button
                    className="btn-apply-leave"
                    type="button"
                    onClick={() => navigate('/employee/leave')}
                  >
                    Apply Leave
                  </button>
                  <button
                    className="btn-download-payslip"
                    type="button"
                    onClick={() => navigate('/employee/payroll')}
                  >
                    Download Payslip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
