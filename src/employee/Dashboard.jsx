
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Search,
  Calendar,
  DollarSign,
  Gift,
  TrendingUp,
  Megaphone
} from "lucide-react";
import api from "../api";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isOpen, setIsOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

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
            <div className="emp-search-box">
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search Employee..."
                className="emp-search-input"
              />
            </div>

            <div className="emp-user-profile-badge">
              <div className="emp-avatar-circle">E</div>
              <span>Employee</span>
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

          {!loading && dashboard && (
            <div className="emp-card-box mb-10">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="emp-card-title">Attendance Summary</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {dashboard.todayAttendance?.status || "No record"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-transparent p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Check-in time</p>
                  <p className="text-xl font-semibold text-slate-900 mt-2">
                    {dashboard.todayAttendance?.checkInTime || "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-transparent p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Check-out time</p>
                  <p className="text-xl font-semibold text-slate-900 mt-2">
                    {dashboard.todayAttendance?.checkOutTime || "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-transparent p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Worked hours</p>
                  <p className="text-xl font-semibold text-slate-900 mt-2">
                    {dashboard.todayAttendance?.workedHours != null ? `${dashboard.todayAttendance.workedHours} hr` : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-transparent p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Notes</p>
                  <p className="text-sm text-slate-700 mt-2 leading-6">
                    {dashboard.todayAttendance?.notes || "No additional notes."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="emp-middle-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="emp-card-box">
              <h2 className="emp-card-title">Company Announcements</h2>
              <div className="announcement-list">
                {dashboard?.recentNotices?.length ? (
                  dashboard.recentNotices.map((notice) => (
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
                  <p style={{ color: "#64748b", padding: "16px 0" }}>No announcements available.</p>
                )}
              </div>
            </div>

            <div className="emp-card-box">
              <h2 className="emp-card-title">Profile Summary</h2>
              <div className="profile-card-content space-y-4 flex flex-col items-center">
                <img
                  src={dashboard?.employeeProfile?.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                  alt={dashboard?.employeeProfile?.firstName || "Employee"}
                  className="profile-avatar-large"
                />
                <div>
                  <p className="profile-name">
                    {dashboard?.employeeProfile
                      ? `${dashboard.employeeProfile.firstName || ""} ${dashboard.employeeProfile.lastName || ""}`.trim()
                      : "Employee"}
                  </p>
                  <p className="profile-role">
                    {dashboard?.employeeProfile?.designationId?.designationName || "Employee"}
                  </p>
                </div>
                <div className="profile-dept-info w-full">
                  <span>Department</span>
                  <span>{dashboard?.employeeProfile?.departmentId?.departmentName || "—"}</span>
                </div>
                <div className="w-full space-y-3 pt-2">
                  <button className="btn-apply-leave">Apply Leave</button>
                  <button className="btn-download-payslip">Download Payslip</button>
                </div>
              </div>
            </div>
          </div>

          <div className="emp-chart-box">
            <div className="emp-chart-header">
              <h2 className="emp-card-title" style={{ margin: 0 }}>Monthly Attendance Overview</h2>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#64748b" }}>November 2026</span>
            </div>

            <div className="emp-chart-metrics">
              <span>Daily attendance: <span className="metric-highlight">96.5% ↑</span></span>
              <span>Key metrics: <span className="metric-highlight">391 ↑ 5.8%</span></span>
              <span>Bars count: <span className="metric-highlight">393</span></span>
            </div>

            <div className="emp-chart-bars">
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "85%" }}></div>
                <div className="emp-bar-light" style={{ height: "50%" }}></div>
              </div>
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "65%" }}></div>
                <div className="emp-bar-light" style={{ height: "35%" }}></div>
              </div>
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "90%" }}></div>
                <div className="emp-bar-light" style={{ height: "70%" }}></div>
              </div>
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "50%" }}></div>
                <div className="emp-bar-light" style={{ height: "30%" }}></div>
              </div>
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "75%" }}></div>
                <div className="emp-bar-light" style={{ height: "45%" }}></div>
              </div>
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "95%" }}></div>
                <div className="emp-bar-light" style={{ height: "65%" }}></div>
              </div>
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "80%" }}></div>
                <div className="emp-bar-light" style={{ height: "30%" }}></div>
              </div>
              <div className="emp-bar-pair">
                <div className="emp-bar-blue" style={{ height: "90%" }}></div>
                <div className="emp-bar-light" style={{ height: "55%" }}></div>
              </div>
            </div>

            <div className="emp-chart-months">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
