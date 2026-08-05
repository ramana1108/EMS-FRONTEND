import React, { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import {
    Calendar,
    Briefcase,
    Clock,
    Plus,
    ExternalLink,
    X,
    Check,
    AlertTriangle,
    Menu
} from "lucide-react";

const DEFAULT_LEAVE_REQUESTS = [
    {
        id: "1",
        leaveType: "Casual Leave",
        fromDate: "2025-05-20",
        toDate: "2025-05-21",
        days: 2,
        status: "Pending",
        appliedOn: "2025-05-15",
        reason: "Family function",
    },
    {
        id: "2",
        leaveType: "Sick Leave",
        fromDate: "2025-05-05",
        toDate: "2025-05-05",
        days: 1,
        status: "Approved",
        appliedOn: "2025-05-01",
        reason: "Fever and cold",
    },
    {
        id: "3",
        leaveType: "Earned Leave",
        fromDate: "2025-04-15",
        toDate: "2025-04-17",
        days: 3,
        status: "Approved",
        appliedOn: "2025-04-10",
        reason: "Personal work",
    },
    {
        id: "4",
        leaveType: "Casual Leave",
        fromDate: "2025-03-28",
        toDate: "2025-03-28",
        days: 1,
        status: "Rejected",
        appliedOn: "2025-03-25",
        reason: "Operational exigencies",
    },
    {
        id: "5",
        leaveType: "Sick Leave",
        fromDate: "2025-03-12",
        toDate: "2025-03-13",
        days: 2,
        status: "Approved",
        appliedOn: "2025-03-11",
        reason: "Dental checkup",
    },
];

export default function Leavemanagement() {
    const [activeTab, setActiveTab] = useState("Leave Management");
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Leave Requests state
    const [requests, setRequests] = useState([]);

    // Modal form states
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [formError, setFormError] = useState("");

    // Detailed Modal view state
    const [selectedLeave, setSelectedLeave] = useState(null);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(loggedInUser);

        // Retrieve storage based on email prefix to isolate users
        const emailKey = loggedInUser?.email ? `leaves_${loggedInUser.email}` : "leaves_default";
        const stored = localStorage.getItem(emailKey);
        if (stored) {
            setRequests(JSON.parse(stored));
        } else {
            setRequests(DEFAULT_LEAVE_REQUESTS);
            localStorage.setItem(emailKey, JSON.stringify(DEFAULT_LEAVE_REQUESTS));
        }
    }, []);

    // Sync state to local storage helper
    const saveRequests = (updatedList) => {
        setRequests(updatedList);
        const emailKey = user?.email ? `leaves_${user.email}` : "leaves_default";
        localStorage.setItem(emailKey, JSON.stringify(updatedList));
    };

    // Stats Counters (matches mockup values precisely if untouched, or adjusts dynamically)
    const stats = {
        casual: 12,
        sick: 6,
        earned: 18,
        remaining: 36,
    };

    // Calculate actual dynamically if changes are made:
    // Let's deduce Remaining leaves
    const getDynamicRemaining = () => {
        let approvedDays = 0;
        requests.forEach((r) => {
            if (r.status === "Approved") approvedDays += r.days;
        });
        // Starting total allowance is 36 + approved days in DEFAULT (which totals 6 approved days: Sick 1, Earned 3, Sick 2. Total = 6)
        // So starting remaining leave is 36.
        return 36 - approvedDays + 6;
    };

    const handleApplyClick = () => {
        setFormError("");
        setLeaveType("Casual Leave");
        setFromDate("");
        setToDate("");
        setReason("");
        setShowApplyModal(true);
    };

    const handleSubmitLeave = (e) => {
        e.preventDefault();
        if (!fromDate || !toDate || !reason.trim()) {
            setFormError("All fields are required");
            return;
        }

        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (end < start) {
            setFormError("To Date cannot be earlier than From Date");
            return;
        }

        // Compute diff in days
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const newRequest = {
            id: Date.now().toString(),
            leaveType,
            fromDate,
            toDate,
            days: diffDays,
            status: "Pending",
            appliedOn: new Date().toISOString().split("T")[0],
            reason: reason.trim(),
        };

        saveRequests([newRequest, ...requests]);
        setShowApplyModal(false);
    };

    const cancelRequest = (id) => {
        if (!window.confirm("Are you sure you want to cancel / delete this request?")) return;
        const updated = requests.filter((r) => r.id !== id);
        saveRequests(updated);
        if (selectedLeave && selectedLeave.id === id) {
            setSelectedLeave(null);
        }
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="emp-dashboard-app">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="emp-main-content" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", flex: 1 }}>

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ minHeight: "60px" }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#043e30] text-white shadow-sm shadow-[#043e30]/10"
                        style={{ border: "none", cursor: "pointer" }}
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="emp-top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 10px" }}>
                <div style={{ visibility: "hidden" }}>Placeholder</div>

                <div className="emp-user-profile-badge" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "6px 14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#000000" }}>
                    <div className="emp-avatar-circle" style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#043e30", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                    {getInitials(user?.name || "Akshaya Mehta")}
                </div>
                <span>{user?.name || "Akshaya Mehta"}</span>
            </div>
        </div>

        {/* Page Content */ }
    <div style={{ flex: 1, padding: "0 10px" }}>
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
            <h1 className="dashboard-title" style={{ fontSize: "32px", fontWeight: "800", color: "#000000", margin: 0 }}>Leave Management</h1>
            <p className="dashboard-subtitle" style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Apply for leave and track your requests</p>
        </div>
    </div>

    {/* Stats Grid */ }
    <div className="emp-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {/* Casual Leave */}
        <div className="emp-stat-card" style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="emp-stat-title" style={{ fontSize: "14px", fontWeight: "700", color: "#64748b" }}>Casual Leave</span>
                <div className="emp-stat-icon-box" style={{ backgroundColor: "#ecfdf5", color: "#10b981", padding: "8px", borderRadius: "10px" }}>
                    <Calendar size={20} />
                </div>
            </div>
            <p className="emp-stat-value" style={{ fontSize: "28px", fontWeight: "800", color: "#000000", margin: 0 }}>
                {stats.casual} <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>Days</span>
            </p>
        </div>

        {/* Sick Leave */}
        <div className="emp-stat-card" style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="emp-stat-title" style={{ fontSize: "14px", fontWeight: "700", color: "#64748b" }}>Sick Leave</span>
                <div className="emp-stat-icon-box" style={{ backgroundColor: "#fff7ed", color: "#ea580c", padding: "8px", borderRadius: "10px" }}>
                    <Briefcase size={20} />
                </div>
            </div>
            <p className="emp-stat-value" style={{ fontSize: "28px", fontWeight: "800", color: "#000000", margin: 0 }}>
                {stats.sick} <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>Days</span>
            </p>
        </div>

        {/* Earned Leave */}
        <div className="emp-stat-card" style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="emp-stat-title" style={{ fontSize: "14px", fontWeight: "700", color: "#64748b" }}>Earned Leave</span>
                <div className="emp-stat-icon-box" style={{ backgroundColor: "#ecfdf5", color: "#10b981", padding: "8px", borderRadius: "10px" }}>
                    <Calendar size={20} />
                </div>
            </div>
            <p className="emp-stat-value" style={{ fontSize: "28px", fontWeight: "800", color: "#000000", margin: 0 }}>
                {stats.earned} <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>Days</span>
            </p>
        </div>

        {/* Remaining Leave */}
        <div className="emp-stat-card" style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div className="emp-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="emp-stat-title" style={{ fontSize: "14px", fontWeight: "700", color: "#64748b" }}>Remaining Leave</span>
                <div className="emp-stat-icon-box" style={{ backgroundColor: "#faf5ff", color: "#a855f7", padding: "8px", borderRadius: "10px" }}>
                    <Clock size={20} />
                </div>
            </div>
            <p className="emp-stat-value" style={{ fontSize: "28px", fontWeight: "800", color: "#000000", margin: 0 }}>
                {getDynamicRemaining()} <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>Days</span>
            </p>
        </div>
    </div>

    {/* List display */ }
    <div className="employee-directory-card" style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div className="filters-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 className="emp-card-title" style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#000000" }}>My Leave Requests</h2>

            <button
                onClick={handleApplyClick}
                className="btn-enroll-employee"
                style={{
                    backgroundColor: "#043e30",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                <Plus size={16} />
                <span>Apply Leave</span>
            </button>
        </div>

        <div className="table-responsive">
            <table className="employee-table">
                <thead>
                    <tr>
                        <th style={{ padding: "14px 24px" }}>Leave Type</th>
                        <th style={{ padding: "14px 24px" }}>From Date</th>
                        <th style={{ padding: "14px 24px" }}>To Date</th>
                        <th style={{ padding: "14px 24px" }}>Days</th>
                        <th style={{ padding: "14px 24px" }}>Status</th>
                        <th style={{ padding: "14px 24px" }}>Applied On</th>
                        <th style={{ padding: "14px 24px", textAlign: "right" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>No leave requests found.</td>
                        </tr>
                    ) : (
                        requests.map((req) => {
                            let statusBg = "#fff7ed";
                            let statusText = "#ea580c";
                            let statusBorder = "#ffedd5";

                            if (req.status === "Approved") {
                                statusBg = "#ecfdf5";
                                statusText = "#047857";
                                statusBorder = "#a7f3d0";
                            } else if (req.status === "Rejected") {
                                statusBg = "#fef2f2";
                                statusText = "#b91c1c";
                                statusBorder = "#fca5a5";
                            }

                            return (
                                <tr key={req.id} className="employee-row">
                                    <td style={{ padding: "16px 24px", fontWeight: "700", color: "#0f172a" }}>{req.leaveType}</td>
                                    <td style={{ padding: "16px 24px", color: "#334155" }}>{formatDateDisplay(req.fromDate)}</td>
                                    <td style={{ padding: "16px 24px", color: "#334155" }}>{formatDateDisplay(req.toDate)}</td>
                                    <td style={{ padding: "16px 24px", fontWeight: "600", color: "#0f172a" }}>{req.days}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                padding: "4px 10px",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                backgroundColor: statusBg,
                                                color: statusText,
                                                border: `1px solid ${statusBorder}`,
                                            }}
                                        >
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 24px", color: "#64748b", fontSize: "13px" }}>{formatDateDisplay(req.appliedOn)}</td>
                                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                            <button
                                                onClick={() => setSelectedLeave(req)}
                                                className="action-icon-btn"
                                                title="View details"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <ExternalLink size={14} />
                                            </button>

                                            {req.status === "Pending" && (
                                                <button
                                                    onClick={() => cancelRequest(req.id)}
                                                    className="action-icon-btn delete"
                                                    title="Cancel Leave Request"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
        </div >

        {/* Modal: Apply Leave */ }
    {
        showApplyModal && (
            <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
                <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", width: "450px", maxWidth: "90%", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Apply for Leave</h3>
                        <button onClick={() => setShowApplyModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                            <X size={20} />
                        </button>
                    </div>

                    {formError && (
                        <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <AlertTriangle size={14} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmitLeave}>
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Leave Type</label>
                            <select
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", outline: "none", fontSize: "14px" }}
                            >
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Earned Leave">Earned Leave</option>
                            </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Reason / Notes</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Provide details about your leave request..."
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "80px", outline: "none", resize: "vertical", fontSize: "14px" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#475569" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{ padding: "8px 16px", backgroundColor: "#043e30", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    {/* Modal: View Leave details */ }
    {
        selectedLeave && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", width: "420px", maxWidth: "90%", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Leave Details</h3>
                <button onClick={() => setSelectedLeave(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "6px" }}>
                  <span style={{ fontWeight: "700", color: "#64748b" }}>Type</span>
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedLeave.leaveType}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "6px" }}>
                  <span style={{ fontWeight: "700", color: "#64748b" }}>Duration</span>
                  <span style={{ fontWeight: "600", color: "#0f172a" }}>
                    {formatDateDisplay(selectedLeave.fromDate)} to {formatDateDisplay(selectedLeave.toDate)} ({selectedLeave.days} days)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "6px" }}>
                  <span style={{ fontWeight: "700", color: "#64748b" }}>Applied On</span>
                  <span style={{ color: "#334155" }}>{formatDateDisplay(selectedLeave.appliedOn)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f8fafc", paddingBottom: "6px"
    }
}>
                  <span style={{ fontWeight: "700", color: "#64748b" }}>Status</span>
                  <span
                    style={{
                      fontWeight: "700",
                      color: selectedLeave.status === "Approved" ? "#047857" : selectedLeave.status === "Rejected" ? "#b91c1c" : "#ea580c"
                    }}
                  >
                    {selectedLeave.status}
                  </span>
                </div >
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontWeight: "700", color: "#64748b" }}>Reason / Notes</span>
        <p style={{ margin: 0, padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#334155", fontStyle: "italic", minHeight: "50px" }}>
            {selectedLeave.reason}
        </p>
    </div>
              </div >

    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <button
            type="button"
            onClick={() => setSelectedLeave(null)}
            style={{ padding: "8px 16px", backgroundColor: "#043e30", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
        >
            Close
        </button>
    </div>
            </div >
          </div >
        )}

      </div >
    </div >
  );
}
