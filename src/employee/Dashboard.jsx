import React, { useState, useEffect } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Megaphone,
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

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.getCurrentEmployeeDashboard();
        if (mounted && res?.success) {
          setDashboard(res.dashboard);
        }
      } catch (err) {
        console.error("Failed to load employee dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApplyLeave = () => navigate("/employee/leave");
  const handleDownloadPayslip = () => navigate("/employee/payroll");

  const employeeProfile = dashboard?.employeeProfile || {};
  const recentNotices = Array.isArray(dashboard?.recentNotices) ? dashboard.recentNotices : [];
  const attendanceHistory = Array.isArray(dashboard?.attendanceHistory) ? dashboard.attendanceHistory : [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

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
            <div className="emp-search-box">
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search Employee..."
                className="emp-search-input"
              />
            </div>

            <button
              className="icon-btn"
              title="View Notices"
              onClick={() => navigate("/employee/announcements")}
            >
              <Megaphone size={18} />
            </button>

            <div className="emp-user-profile-badge cursor-pointer" onClick={() => navigate("/employee/profile") }>
              <div className="emp-avatar-circle">
                {employeeProfile.firstName || employeeProfile.lastName
                  ? `${employeeProfile.firstName?.[0] || ""}${employeeProfile.lastName?.[0] || ""}`.toUpperCase()
                  : "U"}
              </div>
              <span>
                {employeeProfile.firstName || employeeProfile.lastName
                  ? `${employeeProfile.firstName || ""} ${employeeProfile.lastName || ""}`.trim()
                  : "Employee"}
              </span>
            </div>
          </div>

          <div className="emp-stats-grid">
            {loading && <div>Loading...</div>}
            {!loading && dashboard && (
              <>
                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Attendance</span>
                    <div className="emp-stat-icon-box">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">
                    {dashboard.todayAttendance?.status || "No record"}
                  </p>
                  <span className="emp-stat-subtext">Today&apos;s status</span>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Leave Balance</span>
                    <div className="emp-stat-icon-box">
                      <Calendar size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">
                    {employeeProfile.leaveBalance != null ? employeeProfile.leaveBalance : "—"}
                  </p>
                  <span className="emp-stat-subtext">Available</span>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Current Salary</span>
                    <div className="emp-stat-icon-box">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">
                    {employeeProfile.salary ? `$${employeeProfile.salary}` : "—"}
                  </p>
                  <span className="emp-stat-subtext">Base salary</span>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Recent Alerts</span>
                    <div className="emp-stat-icon-box">
                      <Megaphone size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">{recentNotices.length}</p>
                  <span className="emp-stat-subtext">Latest notices</span>
                </div>
              </>
            )}
          </div>

          <div className="emp-middle-grid">
            <div className="emp-card-box">
              <h2 className="emp-card-title">Attendance History & Leave Status</h2>
              <div className="current-status-row">
                <span className="current-status-label">Current status</span>
                <p className="current-status-value">
                  {dashboard?.todayAttendance?.status || "Unknown"}
                </p>
              </div>

              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.length > 0 ? (
                    attendanceHistory.map((record) => (
                      <tr key={record._id || record.attendanceDate}>
                        <td>{new Date(record.attendanceDate).toLocaleDateString()}</td>
                        <td
                          className={
                            record.status === "Present"
                              ? "status-present"
                              : record.status === "Absent"
                              ? "status-absent"
                              : "status-leave"
                          }
                        >
                          {record.status}
                        </td>
                        <td>{record.activity || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-5">
                        No attendance history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="emp-card-box">
              <h2 className="emp-card-title">Company Announcements</h2>
              <div className="announcement-list">
                {recentNotices.length > 0 ? (
                  recentNotices.map((notice) => (
                    <div key={notice._id || notice.title} className="announcement-item">
                      <div className="announcement-icon">
                        <Megaphone size={18} />
                      </div>
                      <div>
                        <p className="announcement-title">{notice.title}</p>
                        <p className="announcement-desc">{notice.description}</p>
                      </div>
                      <span className="announcement-date">
                        {new Date(notice.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 py-4">No announcements available.</p>
                )}
              </div>
            </div>

            <div className="emp-card-box">
              <h2 className="emp-card-title">Profile Summary</h2>
              <div className="profile-card-content">
                <img
                  src={employeeProfile.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                  alt={employeeProfile.firstName || "Employee"}
                  className="profile-avatar-large"
                />
                <p className="profile-name">
                  {employeeProfile.firstName || employeeProfile.lastName
                    ? `${employeeProfile.firstName || ""} ${employeeProfile.lastName || ""}`.trim()
                    : "Employee"}
                </p>
                <p className="profile-role">{employeeProfile.designationName || "Employee"}</p>
                <div className="profile-dept-info">
                  <span>Department</span>
                  <span>{employeeProfile.departmentName || "—"}</span>
                </div>
                <button className="btn-apply-leave" onClick={handleApplyLeave}>
                  Apply Leave
                </button>
                <button className="btn-download-payslip" onClick={handleDownloadPayslip}>
                  Download Payslip
                </button>
              </div>
            </div>
          </div>

          <div className="emp-chart-box">
            <div className="emp-chart-header">
              <h2 className="emp-card-title m-0">Monthly Attendance Overview</h2>
              <span className="text-sm font-bold text-slate-500">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>

            <div className="emp-chart-metrics">
              <span>
                Attendance %: <span className="metric-highlight">{dashboard?.attendancePercentage ?? 0}%</span>
              </span>
              <span>
                Approved leaves: <span className="metric-highlight">{dashboard?.leaves?.approved ?? 0}</span>
              </span>
              <span>
                Pending leaves: <span className="metric-highlight">{dashboard?.leaves?.pending ?? 0}</span>
              </span>
            </div>

            <div className="emp-chart-bars">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="emp-bar-pair">
                  <div className="emp-bar-blue" style={{ height: `${50 + index * 5}%` }}></div>
                  <div className="emp-bar-light" style={{ height: `${30 + index * 3}%` }}></div>
                </div>
              ))}
            </div>

            <div className="emp-chart-months">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
