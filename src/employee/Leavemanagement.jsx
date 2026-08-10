import React, { useState, useEffect } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router-dom";
import {
    getMyLeaves,
    applyLeave as applyLeaveRequest,
    deleteLeave as deleteLeaveRequest,
} from "../api";
import {
    Calendar,
    Briefcase,
    Clock,
    Plus,
    ExternalLink,
    X,
    AlertTriangle,
    Menu,
} from "lucide-react";

export default function Leavemanagement() {
    const [activeTab, setActiveTab] = useState("Leave Management");
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    // Leave Requests state
    const [requests, setRequests] = useState([]);

    // Modal form states
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [leaveType, setLeaveType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [formError, setFormError] = useState("");

    // Detailed modal view state
    const [selectedLeave, setSelectedLeave] = useState(null);

    const formatLeaveRecord = (record) => ({
        id: record._id || record.id,
        leaveType: record.leaveType,
        fromDate: record.fromDate?.split("T")[0] || record.fromDate,
        toDate: record.toDate?.split("T")[0] || record.toDate,
        days: record.totalDays || 1,
        status: record.status || "Pending",
        appliedOn: record.appliedOn?.split("T")[0] || record.appliedOn,
        reason: record.reason || "",
    });

    const loadLeaves = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setRequests([]);
            return;
        }

        try {
            setLoading(true);
            const data = await getMyLeaves();
            if (data?.success) {
                setRequests((data.leaves || []).map(formatLeaveRecord));
            } else {
                setRequests([]);
                setFormError(data?.message || "Unable to load your leave requests.");
            }
        } catch (error) {
            console.error("Failed to load leave requests", error);
            setRequests([]);
            setFormError("Unable to load your leave requests right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        if (!loggedInUser) return;

        setUser(loggedInUser);
        loadLeaves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Stats derived from live requests
    const stats = {
        casual: requests
            .filter((item) => item.leaveType === "Casual Leave")
            .reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0),
        sick: requests
            .filter((item) => item.leaveType === "Sick Leave")
            .reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0),
        earned: requests
            .filter((item) => item.leaveType === "Earned Leave")
            .reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0),
        remaining: Math.max(
            0,
            36 - requests.reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0)
        ),
    };

    const handleApplyClick = () => {
        setFormError("");
        setLeaveType("");
        setFromDate("");
        setToDate("");
        setReason("");
        setShowApplyModal(true);
    };

    const handleSubmitLeave = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!leaveType) {
            setFormError("Leave Type is required");
            return;
        }
        if (!fromDate) {
            setFormError("From Date is required");
            return;
        }
        if (!toDate) {
            setFormError("To Date is required");
            return;
        }
        if (!reason || !reason.trim()) {
            setFormError("Reason is required");
            return;
        }

        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            setFormError("Invalid date format");
            return;
        }
        if (from > to) {
            setFormError("From Date cannot be after To Date");
            return;
        }

        try {
            const data = await applyLeaveRequest({
                leaveType,
                fromDate,
                toDate,
                reason: reason.trim(),
            });

            if (!data?.success) {
                setFormError(data?.message || "Unable to submit leave request.");
                return;
            }

            setShowApplyModal(false);
            setFormError("");
            setLeaveType("");
            setFromDate("");
            setToDate("");
            setReason("");
            await loadLeaves();
        } catch (error) {
            console.error("Failed to apply leave", error);
            setFormError("Unable to submit leave request right now.");
        }
    };

    const cancelRequest = async (id) => {
        if (!window.confirm("Are you sure you want to cancel / delete this request?")) return;

        try {
            const data = await deleteLeaveRequest(id);
            if (!data?.success) {
                setFormError(data?.message || "Unable to delete leave request.");
                return;
            }

            await loadLeaves();
            if (selectedLeave && selectedLeave.id === id) {
                setSelectedLeave(null);
            }
        } catch (error) {
            console.error("Failed to delete leave request", error);
            setFormError("Unable to delete leave request right now.");
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
        <div className="min-h-screen bg-slate-100 text-slate-900">
            {/* Shared table theme — matches the Employees directory table */}
            <style>{`
                .ems-table-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }
                .ems-table-v2 { width: 100%; border-collapse: collapse; }
                .ems-table-v2 thead tr { background: #9aa1ac; }
                .ems-table-v2 thead th {
                    text-align: left;
                    padding: 14px 20px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: #ffffff;
                    white-space: nowrap;
                }
                .ems-table-v2 thead th.center { text-align: center; }
                .ems-table-v2 tbody td {
                    padding: 14px 20px;
                    font-size: 14px;
                    color: #1e293b;
                    border-bottom: 1px solid #f1f5f9;
                }
                .ems-table-v2 tbody td.center { text-align: center; }
                .ems-table-v2 tbody tr:last-child td { border-bottom: none; }
                .ems-table-v2 tbody tr:hover { background: #f8fafc; }
                .ems-table-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    border-top: 1px solid #f1f5f9;
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 600;
                }
            `}</style>

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] flex flex-col min-h-screen">
                {/* Mobile Header */}
                <div
                    className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden"
                    style={{ minHeight: "60px" }}
                >
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

                {/* Page Content */}
                <div style={{ flex: 1, padding: "24px 10px" }}>
                    <div className="page-header flex justify-between items-center mb-6">
                        <div>
                            <h1 className="dashboard-title text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                                Leave Management
                            </h1>
                            <p className="dashboard-subtitle text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Apply for leave and track your requests
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="emp-stats-grid">
                        {/* Casual Leave */}
                        <div className="emp-stat-card stat-card-green">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-emerald-50 dark:bg-emerald-950/20 text-[#10b981]">
                                    <Calendar size={20} />
                                </div>
                                <span className="emp-stat-title">Casual Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.casual} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days</span>
                            </p>
                        </div>

                        {/* Sick Leave */}
                        <div className="emp-stat-card stat-card-amber">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-orange-50 dark:bg-orange-950/20 text-[#ea580c]">
                                    <Briefcase size={20} />
                                </div>
                                <span className="emp-stat-title">Sick Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.sick} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days</span>
                            </p>
                        </div>

                        {/* Earned Leave */}
                        <div className="emp-stat-card stat-card-teal">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400">
                                    <Calendar size={20} />
                                </div>
                                <span className="emp-stat-title">Earned Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.earned} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days</span>
                            </p>
                        </div>

                        {/* Remaining Leave */}
                        <div className="emp-stat-card stat-card-indigo">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-purple-50 dark:bg-purple-950/20 text-[#a855f7]">
                                    <Clock size={20} />
                                </div>
                                <span className="emp-stat-title">Remaining Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.remaining} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days</span>
                            </p>
                        </div>
                    </div>

                    {/* List display */}
                    <div className="ems-table-card">
                        <div className="filters-row flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/5">
                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white" style={{ margin: 0 }}>
                                My Leave Requests
                            </h2>

                            <button
                                onClick={handleApplyClick}
                                style={{ border: "none", cursor: "pointer" }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-all active:scale-95 duration-200"
                            >
                                <Plus size={16} />
                                <span>Apply Leave</span>
                            </button>
                        </div>

                        <div className="table-responsive">
                            {loading ? (
                                <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>
                                    Loading leave requests...
                                </div>
                            ) : (
                                <table className="ems-table-v2">
                                    <thead>
                                        <tr>
                                            <th>Leave Type</th>
                                            <th>From Date</th>
                                            <th>To Date</th>
                                            <th className="center">Days</th>
                                            <th className="center">Status</th>
                                            <th>Applied On</th>
                                            <th className="center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>
                                                    No leave requests found.
                                                </td>
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
                                                    <tr key={req.id}>
                                                        <td style={{ fontWeight: "700", color: "#0f172a" }}>
                                                            {req.leaveType}
                                                        </td>
                                                        <td style={{ color: "#334155" }}>
                                                            {formatDateDisplay(req.fromDate)}
                                                        </td>
                                                        <td style={{ color: "#334155" }}>
                                                            {formatDateDisplay(req.toDate)}
                                                        </td>
                                                        <td className="center" style={{ fontWeight: "600", color: "#0f172a" }}>
                                                            {req.days}
                                                        </td>
                                                        <td className="center">
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
                                                        <td style={{ color: "#64748b", fontSize: "13px" }}>
                                                            {formatDateDisplay(req.appliedOn)}
                                                        </td>
                                                        <td className="center">
                                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
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
                            )}
                        </div>

                        {/* Footer */}
                        {!loading && requests.length > 0 && (
                            <div className="ems-table-footer">
                                <span>
                                    Showing 1 to {requests.length} of {requests.length} requests
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal: Apply Leave */}
                {showApplyModal && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white m-0">Apply for Leave</h3>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="bg-transparent border-0 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-950/30 mb-5">
                                    <AlertTriangle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmitLeave} className="space-y-5">
                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Leave Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={leaveType}
                                        onChange={(e) => {
                                            setLeaveType(e.target.value);
                                            if (formError) setFormError("");
                                        }}
                                        required
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    >
                                        <option value="" disabled>
                                            Select Leave Type
                                        </option>
                                        <option value="Casual Leave">Casual Leave</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Earned Leave">Earned Leave</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="form-group flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            From Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => {
                                                setFromDate(e.target.value);
                                                if (formError) setFormError("");
                                            }}
                                            required
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                    <div className="form-group flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            To Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => {
                                                setToDate(e.target.value);
                                                if (formError) setFormError("");
                                            }}
                                            required
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>

                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Reason / Notes <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            if (formError) setFormError("");
                                        }}
                                        placeholder="Provide details about your leave request..."
                                        required
                                        rows="3"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-y"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowApplyModal(false)} className="btn-cancel">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-save">
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: View Leave details */}
                {selectedLeave && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(15, 23, 42, 0.4)",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                borderRadius: "16px",
                                border: "1px solid #e2e8f0",
                                width: "420px",
                                maxWidth: "90%",
                                padding: "24px",
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "16px",
                                    borderBottom: "1px solid #f1f5f9",
                                    paddingBottom: "10px",
                                }}
                            >
                                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                                    Leave Details
                                </h3>
                                <button
                                    onClick={() => setSelectedLeave(null)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #f8fafc",
                                        paddingBottom: "6px",
                                    }}
                                >
                                    <span style={{ fontWeight: "700", color: "#64748b" }}>Type</span>
                                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{selectedLeave.leaveType}</span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #f8fafc",
                                        paddingBottom: "6px",
                                    }}
                                >
                                    <span style={{ fontWeight: "700", color: "#64748b" }}>Duration</span>
                                    <span style={{ fontWeight: "600", color: "#0f172a" }}>
                                        {formatDateDisplay(selectedLeave.fromDate)} to {formatDateDisplay(selectedLeave.toDate)} (
                                        {selectedLeave.days} days)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #f8fafc",
                                        paddingBottom: "6px",
                                    }}
                                >
                                    <span style={{ fontWeight: "700", color: "#64748b" }}>Applied On</span>
                                    <span style={{ color: "#334155" }}>{formatDateDisplay(selectedLeave.appliedOn)}</span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #f8fafc",
                                        paddingBottom: "6px",
                                    }}
                                >
                                    <span style={{ fontWeight: "700", color: "#64748b" }}>Status</span>
                                    <span
                                        style={{
                                            fontWeight: "700",
                                            color:
                                                selectedLeave.status === "Approved"
                                                    ? "#047857"
                                                    : selectedLeave.status === "Rejected"
                                                    ? "#b91c1c"
                                                    : "#ea580c",
                                        }}
                                    >
                                        {selectedLeave.status}
                                    </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <span style={{ fontWeight: "700", color: "#64748b" }}>Reason / Notes</span>
                                    <p
                                        style={{
                                            margin: 0,
                                            padding: "10px",
                                            backgroundColor: "#f8fafc",
                                            borderRadius: "8px",
                                            border: "1px solid #e2e8f0",
                                            color: "#334155",
                                            fontStyle: "italic",
                                            minHeight: "50px",
                                        }}
                                    >
                                        {selectedLeave.reason}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLeave(null)}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#043e30",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}