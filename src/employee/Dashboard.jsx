
import React, { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import {
  Search,
  Calendar,
  DollarSign,
  Gift,
  TrendingUp,
  Megaphone
} from "lucide-react";

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
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const api = await import("../api");

        // Try to find employee by matching email
        if (user?.email) {
          const all = await api.getAllEmployees();
          const list = Array.isArray(all) ? all : all?.employees || [];
          if (list && list.length > 0) {
            const found = list.find((e) => e.email === user.email || e.email === user.email.toLowerCase());
            if (found) {
              const res = await api.getEmployeeDashboard(found.employeeId);
              if (mounted && res && res.success) setDashboard(res.dashboard);
            }
          }
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
              <div className="emp-avatar-circle">S</div>
              <span>Sara Smith</span>
            </div>
          </div>

          <div className="emp-stats-grid">
            {loading && <div>Loading...</div>}
            {!loading && dashboard && (
              <>
                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Attendance %</span>
                    <div className="emp-stat-icon-box">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">{dashboard.attendancePercent || "—"}</p>
                  <span className="emp-stat-subtext">Current month</span>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Leave Balance</span>
                    <div className="emp-stat-icon-box">
                      <Calendar size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">{dashboard.employeeProfile?.leaveBalance ?? "—"}</p>
                  <span className="emp-stat-subtext">Available</span>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Current Salary</span>
                    <div className="emp-stat-icon-box">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">{dashboard.employeeProfile?.salary ? `$${dashboard.employeeProfile.salary}` : "—"}</p>
                  <span className="emp-stat-subtext">Latest payslip</span>
                </div>

                <div className="emp-stat-card">
                  <div className="emp-stat-top">
                    <span className="emp-stat-title">Upcoming Holiday</span>
                    <div className="emp-stat-icon-box">
                      <Gift size={18} />
                    </div>
                  </div>
                  <p className="emp-stat-value">{dashboard.upcomingHoliday || "—"}</p>
                  <span className="emp-stat-subtext">Next</span>
                </div>
              </>
            )}

            <div className="emp-stat-card">
              <div className="emp-stat-top">
                <span className="emp-stat-title">Leave Balance</span>
                <div className="emp-stat-icon-box">
                  <Calendar size={18} />
                </div>
              </div>
              <p className="emp-stat-value">14 Days</p>
              <span className="emp-stat-subtext">Available</span>
            </div>

            <div className="emp-stat-card">
              <div className="emp-stat-top">
                <span className="emp-stat-title">Current Salary</span>
                <div className="emp-stat-icon-box">
                  <DollarSign size={18} />
                </div>
              </div>
              <p className="emp-stat-value">$6,500</p>
              <span className="emp-stat-subtext">✓ Paid on Nov 30</span>
            </div>

            <div className="emp-stat-card">
              <div className="emp-stat-top">
                <span className="emp-stat-title">Upcoming Holiday</span>
                <div className="emp-stat-icon-box">
                  <Gift size={18} />
                </div>
              </div>
              <p className="emp-stat-value">Thanksgiving</p>
              <span className="emp-stat-subtext">Nov 28, 2026</span>
            </div>
          </div>

          <div className="emp-middle-grid">
            <div className="emp-card-box">
              <h2 className="emp-card-title">Attendance History & Leave Status</h2>
              <div className="current-status-row">
                <span className="current-status-label">Current status</span>
                <p className="current-status-value">Present</p>
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
                  <tr>
                    <td>Nov 5, 2026</td>
                    <td className="status-present">Present</td>
                    <td>14 hours</td>
                  </tr>
                  <tr>
                    <td>Dec 5, 2026</td>
                    <td className="status-present">Present</td>
                    <td>Two days</td>
                  </tr>
                  <tr>
                    <td>Dec 5, 2026</td>
                    <td className="status-present">Present</td>
                    <td>13 day</td>
                  </tr>
                  <tr>
                    <td>Nov 5, 2026</td>
                    <td className="status-present">Present</td>
                    <td>13 day</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="emp-card-box">
              <h2 className="emp-card-title">Company Announcements</h2>
              <div className="announcement-list">
                <div className="announcement-item">
                  <div className="announcement-icon">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <p className="announcement-title">Town Hall</p>
                    <p className="announcement-desc">Town Hall meeting list</p>
                  </div>
                  <span className="announcement-date">Dec 5</span>
                </div>
                <div className="announcement-item">
                  <div className="announcement-icon">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="announcement-title">Q4 Planning</p>
                    <p className="announcement-desc">Q4 Planning events</p>
                  </div>
                  <span className="announcement-date">Nov 30</span>
                </div>
                <div className="announcement-item">
                  <div className="announcement-icon">
                    <Gift size={18} />
                  </div>
                  <div>
                    <p className="announcement-title">Holiday Party</p>
                    <p className="announcement-desc">Holiday Party today</p>
                  </div>
                  <span className="announcement-date">Dec 15</span>
                </div>
              </div>
            </div>

            <div className="emp-card-box">
              <h2 className="emp-card-title">Profile Summary</h2>
              <div className="profile-card-content">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Sara Smith"
                  className="profile-avatar-large"
                />
                <p className="profile-name">Sara Smith</p>
                <p className="profile-role">Senior Developer</p>
                <div className="profile-dept-info">
                  <span>Department</span>
                  <span>Engineering</span>
                </div>
                <button className="btn-apply-leave">Apply Leave</button>
                <button className="btn-download-payslip">Download Payslip</button>
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
        