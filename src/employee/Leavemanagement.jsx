import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getMyLeaves, applyLeave as applyLeaveRequest, deleteLeave as deleteLeaveRequest } from "../api";
import {
    Calendar,
    Briefcase,
    Clock,
    Plus,
    ExternalLink,
    X,
    AlertTriangle,
    Menu
} from "lucide-react";

export default function Leavemanagement() {
    const [activeTab, setActiveTab] = useState("Leave Management");
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Leave Requests state
    const [requests, setRequests] = useState([]);

    // Modal form states
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [leaveType, setLeaveType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [formError, setFormError] = useState("");

    // Detailed Modal view state
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
        setUser(loggedInUser);
        loadLeaves();
    }, []);

    const stats = {
        casual: requests.filter((item) => item.leaveType === "Casual Leave").reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0),
        sick: requests.filter((item) => item.leaveType === "Sick Leave").reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0),
        earned: requests.filter((item) => item.leaveType === "Earned Leave").reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0),
        remaining: Math.max(0, 36 - requests.reduce((total, item) => total + (item.status === "Approved" ? item.days : 0), 0)),
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
        if (!leaveType || !fromDate || !toDate || !reason.trim()) {
            setFormError("Frontend validation failed");
            return;
        }

        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (end < start) {
            setFormError("To Date cannot be earlier than From Date");
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
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033]">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ minHeight: "60px" }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-sm"
                        style={{ border: "none", cursor: "pointer" }}
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-[#172033]">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="emp-top-header flex justify-between items-center mb-8 px-2.5">
                    <div style={{ visibility: "hidden" }}>Placeholder</div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "0 10px" }}>
                    <div className="page-header flex justify-between items-center mb-6">
                        <div>
                            <h1 className="dashboard-title text-3xl font-extrabold m-0" style={{ color: "#172033" }}>
                                Leave Management
                            </h1>
                            <p className="dashboard-subtitle text-sm mt-1" style={{ color: "#64748B" }}>Apply for leave and track your requests</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="emp-stats-grid">
                        {/* Casual Leave */}
                        <div className="emp-stat-card stat-card-green">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box">
                                    <Calendar size={20} />
                                </div>
                                <span className="emp-stat-title">Casual Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.casual} <span className="text-sm font-medium text-[#64748B]">Days</span>
                            </p>
                        </div>

                        {/* Sick Leave */}
                        <div className="emp-stat-card stat-card-amber">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box">
                                    <Briefcase size={20} />
                                </div>
                                <span className="emp-stat-title">Sick Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.sick} <span className="text-sm font-medium text-[#64748B]">Days</span>
                            </p>
                        </div>

                        {/* Earned Leave */}
                        <div className="emp-stat-card stat-card-indigo">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box">
                                    <Calendar size={20} />
                                </div>
                                <span className="emp-stat-title">Earned Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.earned} <span className="text-sm font-medium text-[#64748B]">Days</span>
                            </p>
                        </div>

                        {/* Remaining Leave */}
                        <div className="emp-stat-card stat-card-blue">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box">
                                    <Clock size={20} />
                                </div>
                                <span className="emp-stat-title">Remaining Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.remaining} <span className="text-sm font-medium text-[#64748B]">Days</span>
                            </p>
                        </div>
                    </div>

                    {/* List display */}
                    <div className="employee-directory-card">
                        <div className="filters-row">
                            <h2 className="text-lg font-extrabold text-[#172033]" style={{ margin: 0 }}>
                                My Leave Requests
                            </h2>

                            <button
                                onClick={handleApplyClick}
                                style={{ border: "none", cursor: "pointer" }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-all active:scale-95 duration-200"
                            >
                                <Plus size={16} />
                                <span>Apply Leave</span>
                            </button>
                        </div>

                        <div className="table-responsive">
                            {loading ? (
                                <div style={{ padding: "24px", textAlign: "center", color: "#64748B" }}>Loading leave requests...</div>
                            ) : (
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th>Leave Type</th>
                                            <th>From Date</th>
                                            <th>To Date</th>
                                            <th className="table-center-col">Days</th>
                                            <th className="table-center-col">Status</th>
                                            <th>Applied On</th>
                                            <th className="table-actions-col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: "center", color: "#64748B", padding: "30px" }}>No leave requests found.</td>
                                            </tr>
                                        ) : (
                                            requests.map((req) => {
                                                let statusBg = "#FFF1D6";
                                                let statusText = "#B45309";
                                                let statusBorder = "#FDE7C0";

                                                if (req.status === "Approved") {
                                                    statusBg = "#E8F8F3";
                                                    statusText = "#087F72";
                                                    statusBorder = "#D5F2E9";
                                                } else if (req.status === "Rejected") {
                                                    statusBg = "#FEECEC";
                                                    statusText = "#DC2626";
                                                    statusBorder = "#FECACA";
                                                }

                                                return (
                                                    <tr key={req.id} className="employee-row">
                                                        <td style={{ fontWeight: "700", color: "#172033" }}>{req.leaveType}</td>
                                                        <td style={{ color: "#64748B" }}>{formatDateDisplay(req.fromDate)}</td>
                                                        <td style={{ color: "#64748B" }}>{formatDateDisplay(req.toDate)}</td>
                                                        <td className="table-center-col" style={{ fontWeight: "600", color: "#172033" }}>{req.days}</td>
                                                        <td className="table-center-col">
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
                                                        <td style={{ padding: "4px 8px", color: "#64748B", fontSize: "13px" }}>{formatDateDisplay(req.appliedOn)}</td>
                                                        <td style={{ padding: "4px 8px", textAlign: "right" }}>
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
                            )}
                        </div>
                    </div>
                </div >

                {/* Modal: Apply Leave */}
                {
                    showApplyModal && (
                        <div className="fixed inset-0 z-999 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-8 shadow-2xl border border-[#E2E8F0]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-extrabold text-[#172033] m-0">Apply for Leave</h3>
                                    <button onClick={() => setShowApplyModal(false)} className="bg-transparent border-0 cursor-pointer text-[#64748B] hover:text-[#172033]">
                                        <X size={20} />
                                    </button>
                                </div>

                                {formError && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-[#FEECEC] text-[#DC2626] rounded-xl text-sm font-semibold border border-[#FECACA] mb-5">
                                        <AlertTriangle size={16} />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmitLeave} className="space-y-5">
                                    <div className="form-group flex flex-col gap-2">
                                        <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">Leave Type <span className="text-red-500">*</span></label>
                                        <select
                                            value={leaveType}
                                            onChange={(e) => {
                                                setLeaveType(e.target.value);
                                                if (formError) setFormError("");
                                            }}
                                            required
                                            className="w-full bg-white border border-[#D8E0EA] rounded-xl px-4 py-3 text-sm font-semibold text-[#172033] outline-none focus:border-[#2563EB]"
                                        >
                                            <option value="" disabled>Select Leave Type</option>
                                            <option value="Casual Leave">Casual Leave</option>
                                            <option value="Sick Leave">Sick Leave</option>
                                            <option value="Earned Leave">Earned Leave</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="form-group flex flex-col gap-2">
                                            <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">From Date <span className="text-red-500">*</span></label>
                                            <input
                                                type="date"
                                                value={fromDate}
                                                onChange={(e) => {
                                                    setFromDate(e.target.value);
                                                    if (formError) setFormError("");
                                                }}
                                                required
                                                className="w-full bg-white border border-[#D8E0EA] rounded-xl px-4 py-3 text-sm font-semibold text-[#172033] outline-none focus:border-[#2563EB]"
                                            />
                                        </div>
                                        <div className="form-group flex flex-col gap-2">
                                            <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">To Date <span className="text-red-500">*</span></label>
                                            <input
                                                type="date"
                                                value={toDate}
                                                onChange={(e) => {
                                                    setToDate(e.target.value);
                                                    if (formError) setFormError("");
                                                }}
                                                required
                                                className="w-full bg-white border border-[#D8E0EA] rounded-xl px-4 py-3 text-sm font-semibold text-[#172033] outline-none focus:border-[#2563EB]"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group flex flex-col gap-2">
                                        <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">Reason / Notes <span className="text-red-500">*</span></label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => {
                                                setReason(e.target.value);
                                                if (formError) setFormError("");
                                            }}
                                            placeholder="Provide details about your leave request..."
                                            required
                                            rows="3"
                                            className="w-full bg-white border border-[#D8E0EA] rounded-xl px-4 py-3 text-sm font-semibold text-[#172033] outline-none focus:border-[#2563EB] resize-y"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowApplyModal(false)}
                                            className="btn-cancel"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-save"
                                        >
                                            Submit Request
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Modal: View Leave details */}
                {
                    selectedLeave && (
                        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
                            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", width: "420px", maxWidth: "90%", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
                                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#172033" }}>Leave Details</h3>
                                    <button onClick={() => setSelectedLeave(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F8FAFC", paddingBottom: "6px" }}>
                                        <span style={{ fontWeight: "700", color: "#64748B" }}>Type</span>
                                        <span style={{ fontWeight: "700", color: "#172033" }}>{selectedLeave.leaveType}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F8FAFC", paddingBottom: "6px" }}>
                                        <span style={{ fontWeight: "700", color: "#64748B" }}>Duration</span>
                                        <span style={{ fontWeight: "600", color: "#172033" }}>
                                            {formatDateDisplay(selectedLeave.fromDate)} to {formatDateDisplay(selectedLeave.toDate)} ({selectedLeave.days} days)
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F8FAFC", paddingBottom: "6px" }}>
                                        <span style={{ fontWeight: "700", color: "#64748B" }}>Applied On</span>
                                        <span style={{ color: "#334155" }}>{formatDateDisplay(selectedLeave.appliedOn)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F8FAFC", paddingBottom: "6px" }}>
                                        <span style={{ fontWeight: "700", color: "#64748B" }}>Status</span>
                                        <span
                                            style={{
                                                fontWeight: "700",
                                                color: selectedLeave.status === "Approved" ? "#087F72" : selectedLeave.status === "Rejected" ? "#DC2626" : "#B45309"
                                            }}
                                        >
                                            {selectedLeave.status}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{ fontWeight: "700", color: "#64748B" }}>Reason / Notes</span>
                                        <p style={{ margin: 0, padding: "10px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", color: "#334155", fontStyle: "italic", minHeight: "50px" }}>
                                            {selectedLeave.reason}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLeave(null)}
                                        style={{ padding: "8px 16px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "1px solid #2563EB", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
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
