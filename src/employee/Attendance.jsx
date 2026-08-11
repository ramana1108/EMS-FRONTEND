import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
    Calendar,
    CheckSquare,
    XSquare,
    Plane,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    Menu
} from "lucide-react";
import api from "../api";

export default function Attendance() {
    const [activeTab, setActiveTab] = useState("Attendance");
    const [isOpen, setIsOpen] = useState(false);
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Month-Year Filters
    const [selectedMonthYear, setSelectedMonthYear] = useState("All");
    const [monthYearOptions, setMonthYearOptions] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Stats Counters
    const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0 });

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(loggedInUser);

        const loadAttendance = async () => {
            setLoading(true);
            try {
                const res = await api.getMyAttendance();
                const list = Array.isArray(res) ? res : res?.attendance || [];

                const sortedRecords = [...list].sort((a, b) => {
                    return new Date(b.attendanceDate) - new Date(a.attendanceDate);
                });

                setRecords(sortedRecords);

                const uniqueMonthYears = new Set();
                sortedRecords.forEach((r) => {
                    const date = new Date(r.attendanceDate);
                    const monthName = date.toLocaleString("en-US", { month: "long" });
                    const year = date.getFullYear();
                    uniqueMonthYears.add(`${monthName} ${year}`);
                });
                setMonthYearOptions(["All", ...Array.from(uniqueMonthYears)]);

                let present = 0;
                let absent = 0;
                let leave = 0;
                sortedRecords.forEach((r) => {
                    if (r.status === "Present" || r.status === "Half Day") present++;
                    else if (r.status === "Absent") absent++;
                    else if (r.status === "Leave") leave++;
                });
                setStats({ present, absent, leave });
            } catch (err) {
                console.error("Failed to load attendance records:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAttendance();
    }, []);

    // Update filtered records upon dropdown selection
    useEffect(() => {
        let result = records;

        if (selectedMonthYear !== "All") {
            result = records.filter((r) => {
                const date = new Date(r.attendanceDate);
                const mName = date.toLocaleString("en-US", { month: "long" });
                const yr = date.getFullYear();
                return `${mName} ${yr}` === selectedMonthYear;
            });
        }

        setFilteredRecords(result);
        setCurrentPage(1); // Reset pagination
    }, [selectedMonthYear, records]);

    // Formatter Helpers
    const formatDateDay = (dateStr) => {
        if (!dateStr) return { dateStr: "", dayName: "" };
        const date = new Date(dateStr);
        const dateFormatted = date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        return { dateFormatted, dayName };
    };

    const formatHours = (hours) => {
        if (hours === undefined || hours === null || hours === 0) return "00h 00m";
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m.toString().padStart(2, "0")}m`;
    };

    // Pagination indexing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));

    const handlePageChange = (pageNo) => {
        if (pageNo >= 1 && pageNo <= totalPages) {
            setCurrentPage(pageNo);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] flex flex-col min-h-screen">

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

                {/* Page Content */}
                <div style={{ flex: 1, padding: "0 10px" }}>
                    <div className="page-header flex justify-between items-center mb-6">
                        <div>
                            <h1 className="dashboard-title text-3xl font-extrabold text-slate-900 dark:text-white m-0" style={{ color:"black", marginTop: "2rem"}}>Attendance</h1>
                            <p className="dashboard-subtitle text-sm text-slate-500 dark:text-slate-400 mt-1">Track your daily attendance and work hours</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="emp-stats-grid">
                        {/* Present */}
                        <div className="emp-stat-card stat-card-green">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-emerald-50 dark:bg-emerald-950/20 text-[#10b981]">
                                    <CheckSquare size={20} />
                                </div>
                                <span className="emp-stat-title">Present</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.present} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days</span>
                            </p>
                        </div>

                        {/* Absent */}
                        <div className="emp-stat-card stat-card-rose">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-red-50 dark:bg-red-950/20 text-[#ef4444]">
                                    <XSquare size={20} />
                                </div>
                                <span className="emp-stat-title">Absent</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.absent} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days</span>
                            </p>
                        </div>

                        {/* Leave */}
                        <div className="emp-stat-card stat-card-blue">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-blue-50 dark:bg-blue-950/20 text-[#3b82f6]">
                                    <Plane size={20} />
                                </div>
                                <span className="emp-stat-title">Leave</span>
                            </div>
                            <p className="emp-stat-value">
                                {stats.leave} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days</span>
                            </p>
                        </div>
                    </div>

                    {/* Attendance Records Box */}
                    <div className="employee-directory-card">
                        {/* Header controls bar */}
                        <div className="filters-row flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/5">
                            <h2 className="emp-card-title" style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#000000" }}>Attendance Records</h2>

                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <select
                                    value={selectedMonthYear}
                                    onChange={(e) => setSelectedMonthYear(e.target.value)}
                                    className="filter-select"
                                    style={{ border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", fontWeight: "700", color: "#0f172a", outline: "none", cursor: "pointer", backgroundColor: "#ffffff" }}
                                >
                                    {monthYearOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>

                                <button
                                    className="action-icon-btn"
                                    style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", fontWeight: "700", color: "#475569", cursor: "pointer" }}
                                >
                                    <Filter size={14} />
                                    <span>Filter</span>
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="employee-table" style={{ borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                        <th style={{ padding: "4px 8px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Date</th>
                                        <th style={{ padding: "4px 8px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Day</th>
                                        <th style={{ padding: "4px 8px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                                        <th style={{ padding: "4px 8px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Clock In</th>
                                        <th style={{ padding: "4px 8px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Clock Out</th>
                                        <th style={{ padding: "4px 8px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Worked Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>Loading attendance history...</td>
                                        </tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>No attendance records found.</td>
                                        </tr>
                                    ) : (
                                        currentItems.map((rec) => {
                                            const { dateFormatted, dayName } = formatDateDay(rec.attendanceDate);

                                            // Style status pills
                                            let statusBg = "#eff6ff";
                                            let statusText = "#1e40af";
                                            let statusBorder = "#bfdbfe";

                                            if (rec.status === "Present") {
                                                statusBg = "#ecfdf5";
                                                statusText = "#065f46";
                                                statusBorder = "#a7f3d0";
                                            } else if (rec.status === "Absent") {
                                                statusBg = "#fef2f2";
                                                statusText = "#991b1b";
                                                statusBorder = "#fca5a5";
                                            } else if (rec.status === "Leave") {
                                                statusBg = "#f0f9ff";
                                                statusText = "#0369a1";
                                                statusBorder = "#bae6fd";
                                            } else if (rec.status === "Weekly Off" || rec.status === "Holiday") {
                                                statusBg = "#f3f4f6";
                                                statusText = "#374151";
                                                statusBorder = "#e5e7eb";
                                            }

                                            return (
                                                <tr key={rec._id} className="employee-row" style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                    <td style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                                                        {dateFormatted}
                                                    </td>
                                                    <td style={{ padding: "4px 8px", color: "#475569", fontSize: "13px", fontWeight: "600" }}>
                                                        {dayName}
                                                    </td>
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
                                                            {rec.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "4px 8px", color: "#334155", fontSize: "13px" }}>
                                                        {rec.checkInTime || "—"}
                                                    </td>
                                                    <td style={{ padding: "4px 8px", color: "#334155", fontSize: "13px" }}>
                                                        {rec.checkOutTime || "—"}
                                                    </td>
                                                    <td className="table-center-col" style={{ color: "#0f172a", fontWeight: "700", fontSize: "13px" }}>
                                                        {formatHours(rec.workedHours)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredRecords.length > itemsPerPage && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
                                </span>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "8px",
                                            border: "1px solid #cbd5e1",
                                            backgroundColor: currentPage === 1 ? "#f8fafc" : "#ffffff",
                                            color: currentPage === 1 ? "#94a3b8" : "#475569",
                                            cursor: currentPage === 1 ? "default" : "pointer"
                                        }}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "8px",
                                                border: "1px solid #cbd5e1",
                                                backgroundColor: currentPage === p ? "#043e30" : "#ffffff",
                                                color: currentPage === p ? "#ffffff" : "#475569",
                                                fontWeight: "700",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "8px",
                                            border: "1px solid #cbd5e1",
                                            backgroundColor: currentPage === totalPages ? "#f8fafc" : "#ffffff",
                                            color: currentPage === totalPages ? "#94a3b8" : "#475569",
                                            cursor: currentPage === totalPages ? "default" : "pointer"
                                        }}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                        }

                    </div >
                </div >
            </div >
        </div >
    );
}
