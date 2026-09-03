import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import FooterNavigation from "../components/FooterNavigation";
import Header from "../components/Header";
import PredictiveSearchBar from "../components/PredictiveSearchBar";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
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

  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotices = (dashboard?.recentNotices || []).filter((notice) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const text = (notice.title || notice.description || "").toLowerCase();
    return text.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col">
      <Header />

      <main className="emp-main-content px-4 py-6 sm:px-6 lg:px-8 flex-1" style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] m-0">Employee Dashboard</h1>
              <p className="text-sm text-[#64748B] mt-1">Welcome back, {employeeName}.</p>
            </div>
            <PredictiveSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search Announcements..." />
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
              <h2 className="emp-card-title">
                Company Announcements
              </h2>
              <div className="announcement-list" style={{ maxHeight: "500px", overflowY: "auto", padding: "16px 0" }}>
                {filteredNotices.length ? (
                  filteredNotices.map((notice) => (
                    <div
                      key={notice._id || notice.title}
                      className="announcement-item"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        backgroundColor: "#FFFFFF",
                        padding: "16px",
                        borderRadius: "12px",
                        marginBottom: "12px",
                        border: "1px solid #E2E8F0"
                      }}
                    >
                  
                      <div
                        className="announcement-icon"
                        style={{ 
                          backgroundColor: "#EAF2FF",
                          color: "#2563EB",
                          padding: "10px",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <Megaphone size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                          <p className="announcement-title" style={{ color: "#172033", fontWeight: "700", fontSize: "14px", margin: 0 }}>
                            {notice.title}
                          </p>
                          <span className="announcement-date" style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "500", marginLeft: "8px" }}>
                            {new Date(notice.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="announcement-desc" style={{ color: "#64748B", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                          {notice.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#94A3B8", padding: "16px 0" }}>No announcements available.</p>
                )}
              </div>
            </div>

            <div className="emp-card-box">
              <h2 className="emp-card-title">
                Profile Summary
              </h2>
              <div className="profile-card-content space-y-4 flex flex-col items-center">
                <img
                  src={dashboard?.employeeProfile?.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                  alt={employeeName}
                  className="profile-avatar-large"
                  style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginTop: "3rem" }}
                />
                <div>
                  <p className="profile-name">{employeeName}</p>
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

      <FooterNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
