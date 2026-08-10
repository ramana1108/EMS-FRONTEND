import { useState, useEffect } from "react";
<<<<<<< HEAD
=======
// styles are loaded globally via src/index.css (Tailwind + custom styles)
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
import {
    Calendar,
    Clock,
    UserCheck,
    MapPin,
    AlertCircle,
    Plus,
    Trash2,
    CheckCircle,
    X,
    FileSpreadsheet,
    FileText
} from "lucide-react";

export default function Attendance() {
    const [activeTab, setActiveTab] = useState("attendance");
    const [employees, setEmployees] = useState([]);
    const [records, setRecords] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal Control States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    // Pagination
    const [currentAttendancePage, setCurrentAttendancePage] = useState(1);
    const [currentLeavePage, setCurrentLeavePage] = useState(1);
    const itemsPerPage = 10;

    // Attendance Form Fields
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
    const [status, setStatus] = useState("Present");
    const [checkInTime, setCheckInTime] = useState("09:00");
    const [checkOutTime, setCheckOutTime] = useState("17:00");
    const [workedHours, setWorkedHours] = useState("8");
    const [notes, setNotes] = useState("");

    // Leave Form Fields
    const [leaveEmpId, setLeaveEmpId] = useState("");
    const [leaveFrom, setLeaveFrom] = useState("");
    const [leaveTo, setLeaveTo] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [leaveType, setLeaveType] = useState("Casual Leave");

    // Search/Filters
    const [filterEmpId, setFilterEmpId] = useState("");
    const [filterDate, setFilterDate] = useState("");
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    function getHeaders() {
        const token = localStorage.getItem("token");
        return token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    }

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/employees`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setEmployees(data.employees || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAttendance = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/attendance`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setRecords(data.attendance || []);
            } else {
                setError(data.message || "Failed to fetch attendance logs");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to connect to data server");
        }
    };

    const fetchLeaves = async () => {
        try {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
            const res = await fetch(`${API_BASE_URL}/leave`, { headers: getHeaders() });
            const data = await res.json();
            if (res.ok) {
                setLeaves(data.leaves || []);
            } else {
                setError(data.message || "Failed to fetch leave logs");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to connect to leave endpoint");
<<<<<<< HEAD
=======
=======
            const res = await fetch(`${API_BASE_URL}/api/leaves`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setLeaves(data.leaves || []);
            }
        } catch (err) {
            console.error(err);
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError("");
        await Promise.all([fetchEmployees(), fetchAttendance(), fetchLeaves()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Compute worked hours automatically if check-in & check-out time change
    useEffect(() => {
        if (checkInTime && checkOutTime) {
            const [inH, inM] = checkInTime.split(":").map(Number);
            const [outH, outM] = checkOutTime.split(":").map(Number);
            let diff = (outH + outM / 60) - (inH + inM / 60);
            if (diff < 0) diff += 24; // Handle overnight shifts
            setWorkedHours(diff.toFixed(1));
        }
    }, [checkInTime, checkOutTime]);

    const handleAddAttendance = async (e) => {
        e.preventDefault();
        if (!selectedEmpId || !attendanceDate || !status) {
            setError("Employee, Date, and Status are required fields");
            return;
        }
        setError("");
        setSuccess("");
        try {
            const payload = {
                employeeId: selectedEmpId,
                attendanceDate: new Date(attendanceDate),
                status,
                checkInTime: status === "Present" || status === "Half Day" ? checkInTime : null,
                checkOutTime: status === "Present" || status === "Half Day" ? checkOutTime : null,
                workedHours: status === "Present" || status === "Half Day" ? Number(workedHours) : 0,
                notes,
            };

            const res = await fetch(`${API_BASE_URL}/attendance`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Attendance record created successfully!");
                setSelectedEmpId("");
                setNotes("");
                setIsAddModalOpen(false);
                setCurrentAttendancePage(1);
                fetchAttendance();
            } else {
                setError(data.message || "Failed to log attendance");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred during submission");
        }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        if (!leaveEmpId || !leaveFrom || !leaveTo || !leaveReason || !leaveType) {
            setError("All fields are required to request leave: Employee, Start Date, End Date, Type, Reason");
            return;
        }
        setError("");
        setSuccess("");

        const start = new Date(leaveFrom);
        const end = new Date(leaveTo);
        if (end < start) {
            setError("End Date cannot be before Start Date");
            return;
        }

        try {
            setLoading(true);
<<<<<<< HEAD
            const res = await fetch(`${API_BASE_URL}/leave`, {
=======
<<<<<<< HEAD
            const dates = [];
            let current = new Date(start);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            const requests = dates.map(dateStr => {
                return fetch(`${API_BASE_URL}/attendance`, {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        employeeId: leaveEmpId,
                        attendanceDate: dateStr,
                        status: "Leave",
                        checkInTime: null,
                        checkOutTime: null,
                        workedHours: 0,
                        notes: `Leave: ${leaveReason}`,
                    }),
                });
=======
            const res = await fetch(`${API_BASE_URL}/api/leaves`, {
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    employeeId: leaveEmpId,
                    leaveType,
                    fromDate: leaveFrom,
                    toDate: leaveTo,
                    reason: leaveReason,
                }),
<<<<<<< HEAD
=======
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
            });

            const data = await res.json();
            setLoading(false);
            if (res.ok) {
                setSuccess("Leave request submitted successfully.");
                setLeaveEmpId("");
                setLeaveFrom("");
                setLeaveTo("");
                setLeaveReason("");
<<<<<<< HEAD
                setLeaveType("Casual Leave");
                setIsLeaveModalOpen(false);
                setCurrentLeavePage(1);
                fetchLeaves();
=======
<<<<<<< HEAD
                setIsLeaveModalOpen(false);
                setCurrentLeavePage(1);
                fetchAttendance();
=======
                setLeaveType("Casual Leave");
                fetchLeaves();
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
            } else {
                setError(data.message || "Failed to submit leave request");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("An error occurred while submitting leave request.");
        }
    };

    const handleUpdateLeaveStatus = async (id, status) => {
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(`Leave ${status} successfully.`);
                fetchLeaves();
            } else {
                setError(data.message || `Failed to ${status.toLowerCase()} leave`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to ${status.toLowerCase()} leave`);
        }
    };

    const handleDeleteRecord = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/attendance/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Attendance record deleted successfully!");
                fetchAttendance();
            } else {
                setError(data.message || "Failed to delete record");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete record");
        }
    };

<<<<<<< HEAD
=======
<<<<<<< HEAD
    const handleUpdateLeaveStatus = async (id, status) => {
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(`Leave ${status} successfully.`);
                fetchLeaves();
            } else {
                setError(data.message || `Failed to ${status.toLowerCase()} leave`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to ${status.toLowerCase()} leave`);
        }
    };

=======
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
    const handleDeleteLeave = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leave request?")) return;
        setError("");
        setSuccess("");
        try {
<<<<<<< HEAD
            const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
                method: 'DELETE',
=======
<<<<<<< HEAD
            const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
                method: 'DELETE',
=======
            const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
                method: "DELETE",
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                setSuccess('Leave deleted successfully');
                fetchLeaves();
            } else {
                setError(data.message || 'Failed to delete leave');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to delete leave');
<<<<<<< HEAD
=======
=======
                setSuccess("Leave request deleted successfully.");
                fetchLeaves();
            } else {
                setError(data.message || "Failed to delete leave request");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete leave request");
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toISOString().split("T")[0];
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Filters computed logs
    const filteredRecords = records.filter(rec => {
        const matchesEmp = !filterEmpId || rec.employeeCode === filterEmpId || (rec.employeeName?.toLowerCase().includes(filterEmpId.toLowerCase()));
        const matchesDate = !filterDate || formatDate(rec.attendanceDate) === filterDate;
        return matchesEmp && matchesDate;
    });

<<<<<<< HEAD
    // Attendance stats
=======
    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterEmpId, filterDate, records]);

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
    const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Calculate statistics
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
    const totalLeaves = records.filter(r => r.status === "Leave").length;
    const presentCount = records.filter(r => r.status === "Present").length;
    const absentCount = records.filter(r => r.status === "Absent").length;
    const halfDayCount = records.filter(r => r.status === "Half Day").length;

    // Paginate attendance
    const attendanceTotalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const attendanceStartIndex = (currentAttendancePage - 1) * itemsPerPage;
    const paginatedRecords = filteredRecords.slice(attendanceStartIndex, attendanceStartIndex + itemsPerPage);

    // Paginate leaves
    const leaveTotalPages = Math.ceil(leaves.length / itemsPerPage);
    const leaveStartIndex = (currentLeavePage - 1) * itemsPerPage;
    const paginatedLeaves = leaves.slice(leaveStartIndex, leaveStartIndex + itemsPerPage);

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance & Leaves</h1>
                    <p className="text-sm text-slate-600">Track clock-in times, worked hours, and log employee leave requests.</p>
                </div>

<<<<<<< HEAD
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Tab Switcher */}
                    <div style={{ display: "flex", backgroundColor: "#e2e8f0", padding: "4px", borderRadius: "8px", gap: "4px" }}>
                        <button
                            onClick={() => {
                                setActiveTab("attendance");
                                setCurrentAttendancePage(1);
                            }}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: "none",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                backgroundColor: activeTab === "attendance" ? "#ffffff" : "transparent",
                                color: activeTab === "attendance" ? "#0f766e" : "#475569",
                                boxShadow: activeTab === "attendance" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                transition: "all 0.15s"
                            }}
                        >
                            Attendance Logs
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("leave");
                                setCurrentLeavePage(1);
                            }}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: "none",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                backgroundColor: activeTab === "leave" ? "#ffffff" : "transparent",
                                color: activeTab === "leave" ? "#0f766e" : "#475569",
                                boxShadow: activeTab === "leave" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                transition: "all 0.15s"
                            }}
                        >
                            Leave Management
                        </button>
                    </div>

                    <button
                        className="btn-enroll-employee"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            if (activeTab === "attendance") {
                                setIsAddModalOpen(true);
                            } else {
                                setIsLeaveModalOpen(true);
                            }
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <Plus size={16} />
                        <span>{activeTab === "attendance" ? "Log Attendance" : "Record Leave"}</span>
=======
                {/* Tab Switcher */}
                <div className="flex bg-slate-200 p-1 rounded-md gap-1">
                    <button
                        onClick={() => setActiveTab("attendance")}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition ${activeTab === "attendance" ? 'bg-white text-emerald-700 shadow' : 'text-slate-600'}`}
                    >
                        Attendance Logs
                    </button>
                    <button
                        onClick={() => setActiveTab("leave")}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition ${activeTab === "leave" ? 'bg-white text-emerald-700 shadow' : 'text-slate-600'}`}
                    >
                        Leave Management
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                    </button>
                </div>
            </div>

            {/* Stats Widgets */}
<<<<<<< HEAD
            <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card stat-card-green">
                    <div className="stat-header">
                        <div className="stat-icon-plain" style={{ color: "#065f46" }}>
                            <UserCheck size={22} />
=======
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-800">
                            <UserCheck size={18} color="#ffffff" />
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Present Logs</p>
                            <p className="text-lg font-bold">{presentCount}</p>
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
                <div className="stat-card stat-card-blue">
                    <div className="stat-header">
                        <div className="stat-icon-plain" style={{ color: "#0891b2" }}>
                            <Clock size={22} />
=======
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-500">
                            <Clock size={18} color="#ffffff" />
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Half Days</p>
                            <p className="text-lg font-bold">{halfDayCount}</p>
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
                <div className="stat-card stat-card-rose">
                    <div className="stat-header">
                        <div className="stat-icon-plain" style={{ color: "#b91c1c" }}>
                            <AlertCircle size={22} />
=======
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-700">
                            <AlertCircle size={18} color="#ffffff" />
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Absences</p>
                            <p className="text-lg font-bold">{absentCount}</p>
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
                <div className="stat-card stat-card-indigo">
                    <div className="stat-header">
                        <div className="stat-icon-plain" style={{ color: "#8b5cf6" }}>
                            <Calendar size={22} />
=======
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-600">
                            <Calendar size={18} color="#ffffff" />
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Leaves Taken</p>
                            <p className="text-lg font-bold">{totalLeaves}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-md mb-4 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="text-emerald-800 bg-emerald-50 p-3 rounded-md mb-4 text-sm">
                    {success}
                </div>
            )}

            {activeTab === "attendance" ? (
<<<<<<< HEAD
                <div className="w-full">
=======
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                    {/* Logs View */}
                    <div className="employee-directory-card lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                            <h2 className="text-lg font-semibold m-0">Attendance Log Panel</h2>

                            {/* Search Filters */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Emp ID or Name..."
                                    value={filterEmpId}
<<<<<<< HEAD
                                    onChange={(e) => {
                                        setFilterEmpId(e.target.value);
                                        setCurrentAttendancePage(1);
                                    }}
                                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
=======
                                    onChange={(e) => setFilterEmpId(e.target.value)}
                                    className="px-3 py-2 rounded-md border border-slate-300 text-sm"
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                />
                                <input
                                    type="date"
                                    value={filterDate}
<<<<<<< HEAD
                                    onChange={(e) => {
                                        setFilterDate(e.target.value);
                                        setCurrentAttendancePage(1);
                                    }}
                                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
=======
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="px-3 py-2 rounded-md border border-slate-300 text-sm"
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                />
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[520px] rounded-md border border-slate-100">
                            <table className="min-w-full divide-y">
                                <thead>
                                    <tr>
<<<<<<< HEAD
                                        <th>EMPLOYEE</th>
                                        <th>DEPARTMENT</th>
                                        <th className="table-center-col">DATE</th>
                                        <th className="table-center-col">IN</th>
                                        <th className="table-center-col">OUT</th>
                                        <th className="table-center-col">HOURS</th>
                                        <th className="table-center-col">STATUS</th>
                                        <th className="table-actions-col">ACTIONS</th>
=======
<<<<<<< HEAD
                                        <th style={{ padding: "4px 8px" }}>EMPLOYEE</th>
                                        <th style={{ padding: "4px 8px" }}>DEPARTMENT</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>DATE</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>IN</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>OUT</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>HOURS</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>STATUS</th>
                                        <th style={{ padding: "4px 8px", textAlign: "right" }}>ACTIONS</th>
=======
                                        <th className="px-3 py-3">EMPLOYEE</th>
                                        <th className="px-3 py-3">DEPARTMENT</th>
                                        <th className="px-3 py-3 text-center">DATE</th>
                                        <th className="px-3 py-3 text-center">IN</th>
                                        <th className="px-3 py-3 text-center">OUT</th>
                                        <th className="px-3 py-3 text-center">HOURS</th>
                                        <th className="px-3 py-3 text-center">STATUS</th>
                                        <th className="px-3 py-3 text-right">ACTIONS</th>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-8">Loading logs...</td>
                                        </tr>
                                    ) : paginatedRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-8">No records registered matching search criteria.</td>
                                        </tr>
                                    ) : (
<<<<<<< HEAD
                                        paginatedRecords.map((rec) => (
                                            <tr key={rec._id} className="employee-row">
                                                <td style={{ padding: "4px 8px" }}>
=======
                                        pagedRecords.map((rec) => (
                                            <tr key={rec._id} className="border-b last:border-b-0">
                                                <td className="px-4 py-3">
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{rec.employeeName}</p>
                                                        <p className="text-xs text-slate-500">{rec.employeeCode}</p>
                                                    </div>
                                                </td>
<<<<<<< HEAD
                                                <td style={{ padding: "4px 8px" }}>
                                                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>{rec.departmentName}</span>
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "center" }}>
                                                    {formatDate(rec.attendanceDate)}
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600" }}>
                                                    {rec.checkInTime || "--:--"}
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600" }}>
                                                    {rec.checkOutTime || "--:--"}
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "700", color: "#0f766e" }}>
                                                    {rec.workedHours || 0}
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "2px 8px",
                                                        fontSize: "11px",
                                                        fontWeight: "750",
                                                        borderRadius: "12px",
                                                        display: "inline-block",
                                                        backgroundColor:
                                                            rec.status === "Present" ? "#ecfdf5" :
                                                                rec.status === "Half Day" ? "#eff6ff" :
                                                                    rec.status === "Leave" ? "#f5f3ff" : "#fef2f2",
                                                        color:
                                                            rec.status === "Present" ? "#065f46" :
                                                                rec.status === "Half Day" ? "#1d4ed8" :
                                                                    rec.status === "Leave" ? "#6d28d9" : "#b91c1c"
                                                    }}>
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                                    <button
                                                        onClick={() => handleDeleteRecord(rec._id)}
                                                        className="action-icon-btn delete"
                                                        style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        title="Delete Record"
                                                    >
=======
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-medium text-slate-600">{rec.departmentName}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">{formatDate(rec.attendanceDate)}</td>
                                                <td className="px-4 py-3 text-center font-semibold">{rec.checkInTime || "--:--"}</td>
                                                <td className="px-4 py-3 text-center font-semibold">{rec.checkOutTime || "--:--"}</td>
                                                <td className="px-4 py-3 text-center font-bold text-emerald-700">{rec.workedHours || 0}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : rec.status === 'Half Day' ? 'bg-sky-50 text-sky-700' : rec.status === 'Leave' ? 'bg-violet-50 text-violet-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDeleteRecord(rec._id)} title="Delete Record" className="text-rose-600 hover:text-rose-800">
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
<<<<<<< HEAD

                        {/* Pagination controls for Attendance */}
                        {attendanceTotalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                                <span style={{ fontSize: "13px", color: "#64748b" }}>
                                    Showing {attendanceStartIndex + 1} to {Math.min(attendanceStartIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                                </span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        disabled={currentAttendancePage === 1}
                                        onClick={() => setCurrentAttendancePage(prev => Math.max(prev - 1, 1))}
                                        className="btn-close"
                                        style={{ padding: "6px 12.5px" }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ fontSize: "14px", fontWeight: "600", alignSelf: "center" }}>
                                        {currentAttendancePage} of {attendanceTotalPages}
                                    </span>
                                    <button
                                        disabled={currentAttendancePage === attendanceTotalPages}
                                        onClick={() => setCurrentAttendancePage(prev => Math.min(prev + 1, attendanceTotalPages))}
                                        className="btn-close"
                                        style={{ padding: "6px 12.5px" }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
=======
                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md border bg-white disabled:opacity-60">
                                    Previous
                                </button>
                                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md border bg-white disabled:opacity-60">
                                    Next
                                </button>
                                <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-600">Rows per page:</label>
                                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 rounded-md border">
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                    </div>
                </div>
            ) : (
                /* Leave Tab */
                <div className="w-full">
                    {/* Leaves Table */}
                    <div className="employee-directory-card" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Leave Logs</h2>

<<<<<<< HEAD
                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>EMPLOYEE</th>
                                        <th className="table-center-col">LEAVE DATE</th>
                                        <th>LEAVE REASON</th>
                                        <th className="table-center-col">STATUS</th>
                                        <th className="table-actions-col">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "30px 0" }}>Loading leave logs...</td>
                                        </tr>
                                    ) : paginatedLeaves.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "30px 0" }}>No approved leaves logged.</td>
                                        </tr>
                                    ) : (
                                        paginatedLeaves.map((rec) => (
                                            <tr key={rec._id} className="employee-row">
                                                <td style={{ padding: "4px 8px" }}>
                                                    <div>
                                                        <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{rec.employeeId?.firstName} {rec.employeeId?.lastName}</p>
                                                        <p style={{ fontSize: "11px", color: "#64748b" }}>{rec.employeeId?.employeeId}</p>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "center" }}>
                                                    {formatDate(rec.fromDate)}
                                                    {rec.toDate && rec.toDate !== rec.fromDate ? ` - ${formatDate(rec.toDate)}` : ''}
                                                </td>
                                                <td style={{ padding: "4px 8px", color: "#475569", fontSize: "13px" }}>
                                                    {rec.reason || "Personal reasons"}
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "2px 8px",
                                                        fontSize: "11px",
                                                        fontWeight: "750",
                                                        borderRadius: "12px",
                                                        display: "inline-block",
                                                        backgroundColor: rec.status === "Approved" ? "#ecfdf5" : rec.status === "Rejected" ? "#fef2f2" : "#fff7ed",
                                                        color: rec.status === "Approved" ? "#065f46" : rec.status === "Rejected" ? "#b91c1c" : "#ea580c"
                                                    }}>
                                                        {rec.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                        {rec.status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateLeaveStatus(rec._id, 'Approved')}
                                                                    className="action-icon-btn"
                                                                    title="Approve"
                                                                    style={{ border: "none", background: "none", cursor: "pointer", color: "#059669" }}
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateLeaveStatus(rec._id, 'Rejected')}
                                                                    className="action-icon-btn"
                                                                    title="Reject"
                                                                    style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteLeave(rec._id)}
                                                            className="action-icon-btn delete"
                                                            title="Delete Leave"
                                                            style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls for Leaves */}
                        {leaveTotalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                                <span style={{ fontSize: "13px", color: "#64748b" }}>
                                    Showing {leaveStartIndex + 1} to {Math.min(leaveStartIndex + itemsPerPage, leaves.length)} of {leaves.length} records
                                </span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        disabled={currentLeavePage === 1}
                                        onClick={() => setCurrentLeavePage(prev => Math.max(prev - 1, 1))}
                                        className="btn-close"
                                        style={{ padding: "6px 12.5px" }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ fontSize: "14px", fontWeight: "600", alignSelf: "center" }}>
                                        {currentLeavePage} of {leaveTotalPages}
                                    </span>
                                    <button
                                        disabled={currentLeavePage === leaveTotalPages}
                                        onClick={() => setCurrentLeavePage(prev => Math.min(prev + 1, leaveTotalPages))}
                                        className="btn-close"
                                        style={{ padding: "6px 12.5px" }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Log Attendance Modal */}
            {isAddModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-card-wide">
                        <div className="modal-header">
                            <div>
                                <h2>Log Attendance</h2>
                                <p className="modal-subtitle">Log quick daily shifts details.</p>
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddAttendance} className="enroll-form">
                            <div className="form-group">
                                <label>Employee <span className="req">*</span></label>
                                <select
                                    value={selectedEmpId}
                                    onChange={(e) => setSelectedEmpId(e.target.value)}
                                    required
                                >
=======
                    {/* Record Attendance Form */}
                    <div className="emp-card-box bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Log Attendance</h2>
                        <form onSubmit={handleAddAttendance}>

                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Employee*</label>
                                <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white">
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                                    ))}
                                </select>
                            </div>

<<<<<<< HEAD
                            <div className="form-group">
                                <label>Attendance Date <span className="req">*</span></label>
                                <input
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Shift Status <span className="req">*</span></label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    required
                                >
=======
                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Attendance Date*</label>
                                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>

                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Shift Status*</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white">
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                    <option value="Present">Present</option>
                                    <option value="Half Day">Half Day</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                </select>
                            </div>

                            {(status === "Present" || status === "Half Day") && (
                                <>
<<<<<<< HEAD
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        <div className="form-group">
                                            <label>In Time</label>
                                            <input
                                                type="time"
                                                value={checkInTime}
                                                onChange={(e) => setCheckInTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Out Time</label>
                                            <input
                                                type="time"
                                                value={checkOutTime}
                                                onChange={(e) => setCheckOutTime(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Worked Hours</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={workedHours}
                                            onChange={(e) => setWorkedHours(e.target.value)}
                                        />
=======
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">In Time</label>
                                            <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Out Time</label>
                                            <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Worked Hours</label>
                                        <input type="number" step="0.1" value={workedHours} onChange={(e) => setWorkedHours(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" />
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                    </div>
                                </>
                            )}

<<<<<<< HEAD
                            <div className="form-group">
                                <label>Administrator Notes</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Cleared by HR"
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsAddModalOpen(false)}
                                    style={{ padding: "8px 16px" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-enroll-employee"
                                >
                                    <Plus size={16} />
                                    <span>Log Attendance</span>
                                </button>
                            </div>
=======
                            <div className="mb-4">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Administrator Notes</label>
                                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" placeholder="e.g. Cleared by HR" />
                            </div>

                            <button type="submit" className="w-full px-4 py-2 bg-emerald-700 text-white rounded-md font-semibold flex items-center justify-center gap-2">
                                <Plus size={16} />
                                <span>Log Attendance</span>
                            </button>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                        </form>
                    </div>
                </div>
            )}

<<<<<<< HEAD
            {/* Record Leave Modal */}
            {isLeaveModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-card-wide">
                        <div className="modal-header">
                            <div>
                                <h2>Record Leave</h2>
                                <p className="modal-subtitle">Submit a leave request on behalf of an employee.</p>
=======
<<<<<<< HEAD
            {/* Record Leave Modal */}
            {isLeaveModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-card" style={{ maxWidth: "500px" }}>
                        <div className="modal-header">
                            <div>
                                <h2>Record Leave</h2>
                                <p className="modal-subtitle">Logs approved leave days for an employee.</p>
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => setIsLeaveModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
<<<<<<< HEAD
                        </div>

                        <form onSubmit={handleApplyLeave} className="enroll-form">
                            <div className="form-group">
                                <label>Employee <span className="req">*</span></label>
=======
=======
                    {/* Leaves Table */}
                    <div className="employee-directory-card" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Leave Requests</h2>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: "12px" }}>EMPLOYEE</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>DATES</th>
                                        <th style={{ padding: "12px" }}>REASON</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>TYPE</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>STATUS</th>
                                        <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: "center", padding: "30px 0" }}>Loading leave requests...</td>
                                        </tr>
                                    ) : leaves.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: "center", padding: "30px 0" }}>No leave requests found.</td>
                                        </tr>
                                    ) : (
                                        leaves.map((rec) => (
                                            <tr key={rec._id} className="employee-row">
                                                <td style={{ padding: "12px" }}>
                                                    <div>
                                                        <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{rec.employeeId?.firstName ? `${rec.employeeId.firstName} ${rec.employeeId.lastName}` : "Unknown"}</p>
                                                        <p style={{ fontSize: "11px", color: "#64748b" }}>{rec.employeeId?.employeeId || "-"}</p>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
                                                    {formatDateDisplay(rec.fromDate)} - {formatDateDisplay(rec.toDate)}
                                                </td>
                                                <td style={{ padding: "12px", color: "#475569", fontSize: "13px" }}>
                                                    {rec.reason}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#1f2937" }}>
                                                    {rec.leaveType}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "2px 8px",
                                                        fontSize: "11px",
                                                        fontWeight: "750",
                                                        borderRadius: "12px",
                                                        display: "inline-block",
                                                        backgroundColor:
                                                            rec.status === "Approved" ? "#ecfdf5" : rec.status === "Rejected" ? "#fef2f2" : "#eff6ff",
                                                        color:
                                                            rec.status === "Approved" ? "#065f46" : rec.status === "Rejected" ? "#b91c1c" : "#1d4ed8"
                                                    }}>
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                    {rec.status === "Pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveLeave(rec._id)}
                                                                className="action-icon-btn approve"
                                                                style={{ border: "none", background: "#22c55e", borderRadius: "8px", padding: "6px 10px", color: "#ffffff", cursor: "pointer" }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectLeave(rec._id)}
                                                                className="action-icon-btn reject"
                                                                style={{ border: "none", background: "#ef4444", borderRadius: "8px", padding: "6px 10px", color: "#ffffff", cursor: "pointer" }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteLeave(rec._id)}
                                                        className="action-icon-btn delete"
                                                        style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        title="Delete Leave Request"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                        </div>

<<<<<<< HEAD
                        <form onSubmit={handleApplyLeave} className="enroll-form">
                            <div className="form-group">
                                <label>Employee <span className="req">*</span></label>
=======
                    {/* Request / Record Leave Form */}
                    <div className="emp-card-box" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "8px" }}>Create Leave Request</h2>
                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>Submit a leave request on behalf of an employee, then approve or reject from the leave list.</p>
                        <form onSubmit={handleApplyLeave}>

                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Employee*</label>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                                <select
                                    value={leaveEmpId}
                                    onChange={(e) => setLeaveEmpId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

<<<<<<< HEAD
                            <div className="form-group">
                                <label>Leave Type <span className="req">*</span></label>
=======
<<<<<<< HEAD
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div className="form-group">
                                    <label>From Date <span className="req">*</span></label>
=======
                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Leave Type*</label>
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                >
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Earned Leave">Earned Leave</option>
                                    <option value="Maternity Leave">Maternity Leave</option>
                                    <option value="Paternity Leave">Paternity Leave</option>
                                    <option value="Emergency Leave">Emergency Leave</option>
                                </select>
                            </div>

<<<<<<< HEAD
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div className="form-group">
                                    <label>From Date <span className="req">*</span></label>
=======
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>From Date*</label>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                                    <input
                                        type="date"
                                        value={leaveFrom}
                                        onChange={(e) => setLeaveFrom(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>To Date <span className="req">*</span></label>
                                    <input
                                        type="date"
                                        value={leaveTo}
                                        onChange={(e) => setLeaveTo(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reason for Leave <span className="req">*</span></label>
                                <textarea
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                    style={{ minHeight: "80px", resize: "vertical" }}
                                    placeholder="e.g. Sickness, vacation, etc."
                                    required
                                />
                            </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsLeaveModalOpen(false)}
                                    style={{ padding: "8px 16px" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-enroll-employee"
                                >
                                    <CheckCircle size={16} />
                                    <span>Submit Leave Request</span>
                                </button>
                            </div>
<<<<<<< HEAD
=======
=======
                            <button
                                type="submit"
                                style={{ width: "100%", padding: "10px", backgroundColor: "#065f46", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                            >
                                <CheckCircle size={16} />
                                <span>Submit Leave Request</span>
                            </button>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
>>>>>>> 614e3dc5d896ce340e10987b715fcc5204d54c2f
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}