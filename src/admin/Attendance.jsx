import { useState, useEffect } from "react";
import "../App.css";
import {
    Calendar,
    Clock,
    UserCheck,
    MapPin,
    AlertCircle,
    Plus,
    Trash2,
    CheckCircle,
    FileSpreadsheet,
    FileText
} from "lucide-react";

export default function Attendance() {
    const [activeTab, setActiveTab] = useState("attendance");
    const [employees, setEmployees] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
    const [leaves, setLeaves] = useState([]);

    // Search/Filters
    const [filterEmpId, setFilterEmpId] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            const res = await fetch(`${API_BASE_URL}/api/leaves`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setLeaves(data.leaves || []);
            }
        } catch (err) {
            console.error(err);
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
            const res = await fetch(`${API_BASE_URL}/api/leaves`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    employeeId: leaveEmpId,
                    leaveType,
                    fromDate: leaveFrom,
                    toDate: leaveTo,
                    reason: leaveReason,
                }),
            });

            const data = await res.json();
            setLoading(false);
            if (res.ok) {
                setSuccess("Leave request submitted successfully.");
                setLeaveEmpId("");
                setLeaveFrom("");
                setLeaveTo("");
                setLeaveReason("");
                setLeaveType("Casual Leave");
                fetchLeaves();
            } else {
                setError(data.message || "Failed to submit leave request");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("An error occurred while submitting leave request.");
        }
    };

    const handleApproveLeave = async (id) => {
        if (!window.confirm("Approve this leave request?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ status: "Approved" }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Leave approved.");
                fetchLeaves();
                fetchAttendance();
            } else {
                setError(data.message || "Failed to approve leave");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to update leave status");
        }
    };

    const handleRejectLeave = async (id) => {
        if (!window.confirm("Reject this leave request?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ status: "Rejected" }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Leave rejected.");
                fetchLeaves();
            } else {
                setError(data.message || "Failed to reject leave");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to update leave status");
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

    const handleDeleteLeave = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leave request?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Leave request deleted successfully.");
                fetchLeaves();
            } else {
                setError(data.message || "Failed to delete leave request");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete leave request");
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

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
    const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset paging if filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterEmpId, filterDate, records]);

    // Calculate statistics
    const totalLeaves = records.filter(r => r.status === "Leave").length;
    const presentCount = records.filter(r => r.status === "Present").length;
    const absentCount = records.filter(r => r.status === "Absent").length;
    const halfDayCount = records.filter(r => r.status === "Half Day").length;

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 className="dashboard-title">Attendance & Leaves</h1>
                    <p className="dashboard-subtitle">Track clock-in times, worked hours, and log employee leave requests.</p>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: "flex", backgroundColor: "#e2e8f0", padding: "4px", borderRadius: "8px", gap: "4px" }}>
                    <button
                        onClick={() => setActiveTab("attendance")}
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
                        onClick={() => setActiveTab("leave")}
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
            </div>

            {/* Stats Widgets */}
            <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box active-staff-icon" style={{ backgroundColor: "#065f46" }}>
                            <UserCheck size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Present Logs</p>
                            <p className="stat-value">{presentCount}</p>
                        </div>
                    </div>
                    <p className="stat-description">Present status entries</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box depts-icon" style={{ backgroundColor: "#0891b2" }}>
                            <Clock size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Half Days</p>
                            <p className="stat-value">{halfDayCount}</p>
                        </div>
                    </div>
                    <p className="stat-description">Half-day shifts tracked</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box total-employees-icon" style={{ backgroundColor: "#b91c1c" }}>
                            <AlertCircle size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Absences</p>
                            <p className="stat-value">{absentCount}</p>
                        </div>
                    </div>
                    <p className="stat-description">Unexcused absence logs</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box depts-icon" style={{ backgroundColor: "#8b5cf6" }}>
                            <Calendar size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Total Leaves Taken</p>
                            <p className="stat-value">{totalLeaves}</p>
                        </div>
                    </div>
                    <p className="stat-description">Approved leave days</p>
                </div>
            </div>

            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b91c1c", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div style={{ color: "#065f46", backgroundColor: "#ecfdf5", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    {success}
                </div>
            )}

            {/* Conditional layouts based on active tabs */}
            {activeTab === "attendance" ? (
                <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "24px", alignItems: "start" }}>

                    {/* Logs View */}
                    <div className="employee-directory-card" style={{ padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                            <h2 className="emp-card-title" style={{ margin: 0 }}>Attendance Log Panel</h2>

                            {/* Search Filters */}
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input
                                    type="text"
                                    placeholder="Emp ID or Name..."
                                    value={filterEmpId}
                                    onChange={(e) => setFilterEmpId(e.target.value)}
                                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: "12px" }}>EMPLOYEE</th>
                                        <th style={{ padding: "12px" }}>DEPARTMENT</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>DATE</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>IN</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>OUT</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>HOURS</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>STATUS</th>
                                        <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", padding: "30px 0" }}>Loading logs...</td>
                                        </tr>
                                    ) : filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", padding: "30px 0" }}>No records registered matching search criteria.</td>
                                        </tr>
                                    ) : (
                                        paginatedRecords.map((rec) => (
                                            <tr key={rec._id} className="employee-row">
                                                <td style={{ padding: "12px" }}>
                                                    <div>
                                                        <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{rec.employeeName}</p>
                                                        <p style={{ fontSize: "11px", color: "#64748b" }}>{rec.employeeCode}</p>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>{rec.departmentName}</span>
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
                                                    {formatDate(rec.attendanceDate)}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>
                                                    {rec.checkInTime || "--:--"}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>
                                                    {rec.checkOutTime || "--:--"}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center", fontWeight: "700", color: "#0f766e" }}>
                                                    {rec.workedHours || 0}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
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
                                                <td style={{ padding: "12px", textAlign: "right" }}>
                                                    <button
                                                        onClick={() => handleDeleteRecord(rec._id)}
                                                        className="action-icon-btn delete"
                                                        style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", gap: "12px", flexWrap: "wrap" }}>
                            <div style={{ fontSize: "13px", color: "#475569" }}>
                                Showing {paginatedRecords.length} of {filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        backgroundColor: currentPage === 1 ? "#f8fafc" : "#ffffff",
                                        color: currentPage === 1 ? "#94a3b8" : "#0f172a",
                                        cursor: currentPage === 1 ? "not-allowed" : "pointer"
                                    }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: "13px", color: "#475569" }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        backgroundColor: currentPage === totalPages ? "#f8fafc" : "#ffffff",
                                        color: currentPage === totalPages ? "#94a3b8" : "#0f172a",
                                        cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Record Attendance Form */}
                    <div className="emp-card-box" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Log Attendance</h2>
                        <form onSubmit={handleAddAttendance}>

                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Employee*</label>
                                <select
                                    value={selectedEmpId}
                                    onChange={(e) => setSelectedEmpId(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                                >
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Attendance Date*</label>
                                <input
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                />
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Shift Status*</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                                >
                                    <option value="Present">Present</option>
                                    <option value="Half Day">Half Day</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                </select>
                            </div>

                            {(status === "Present" || status === "Half Day") && (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>In Time</label>
                                            <input
                                                type="time"
                                                value={checkInTime}
                                                onChange={(e) => setCheckInTime(e.target.value)}
                                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Out Time</label>
                                            <input
                                                type="time"
                                                value={checkOutTime}
                                                onChange={(e) => setCheckOutTime(e.target.value)}
                                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Worked Hours</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={workedHours}
                                            onChange={(e) => setWorkedHours(e.target.value)}
                                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                        />
                                    </div>
                                </>
                            )}

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Administrator Notes</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                    placeholder="e.g. Cleared by HR"
                                />
                            </div>

                            <button
                                type="submit"
                                style={{ width: "100%", padding: "10px", backgroundColor: "#065f46", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                            >
                                <Plus size={16} />
                                <span>Log Attendance</span>
                            </button>
                        </form>
                    </div>

                </div>
            ) : (
                /* Leave Tab */
                <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "24px", alignItems: "start" }}>

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
                        </div>
                    </div>

                    {/* Request / Record Leave Form */}
                    <div className="emp-card-box" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "8px" }}>Create Leave Request</h2>
                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>Submit a leave request on behalf of an employee, then approve or reject from the leave list.</p>
                        <form onSubmit={handleApplyLeave}>

                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Employee*</label>
                                <select
                                    value={leaveEmpId}
                                    onChange={(e) => setLeaveEmpId(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                                >
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Leave Type*</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                                >
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Earned Leave">Earned Leave</option>
                                    <option value="Maternity Leave">Maternity Leave</option>
                                    <option value="Paternity Leave">Paternity Leave</option>
                                    <option value="Emergency Leave">Emergency Leave</option>
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>From Date*</label>
                                    <input
                                        type="date"
                                        value={leaveFrom}
                                        onChange={(e) => setLeaveFrom(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>To Date*</label>
                                    <input
                                        type="date"
                                        value={leaveTo}
                                        onChange={(e) => setLeaveTo(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Reason for Leave*</label>
                                <textarea
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "80px", resize: "vertical" }}
                                    placeholder="e.g. Sickness, vacation, etc."
                                />
                            </div>

                            <button
                                type="submit"
                                style={{ width: "100%", padding: "10px", backgroundColor: "#065f46", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                            >
                                <CheckCircle size={16} />
                                <span>Submit Leave Request</span>
                            </button>
                        </form>
                    </div>

                </div>
            )}
        </div>
    );
}
