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

    // Search/Filters
    const [filterEmpId, setFilterEmpId] = useState("");
    const [filterDate, setFilterDate] = useState("");

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

    const loadData = async () => {
        setLoading(true);
        setError("");
        await Promise.all([fetchEmployees(), fetchAttendance()]);
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
        if (!leaveEmpId || !leaveFrom || !leaveTo || !leaveReason) {
            setError("All fields are required to request leave: Employee, Start Date, End Date, Reason");
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
            // Generate individual attendance records for each date in the range
            const dates = [];
            let current = new Date(start);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            // Chain requests sequentially or fire in parallel
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
            });

            const results = await Promise.all(requests);
            setLoading(false);

            const failedCount = results.filter(r => !r.ok).length;
            if (failedCount === 0) {
                setSuccess(`Leave recorded successfully for ${dates.length} day(s)!`);
                setLeaveEmpId("");
                setLeaveFrom("");
                setLeaveTo("");
                setLeaveReason("");
                fetchAttendance();
            } else {
                setError(`Failed to apply leave for some days. Please try again.`);
                fetchAttendance();
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("An error occurred while saving leave logs.");
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

    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toISOString().split("T")[0];
    };

    // Filters computed logs
    const filteredRecords = records.filter(rec => {
        const matchesEmp = !filterEmpId || rec.employeeCode === filterEmpId || (rec.employeeName?.toLowerCase().includes(filterEmpId.toLowerCase()));
        const matchesDate = !filterDate || formatDate(rec.attendanceDate) === filterDate;
        return matchesEmp && matchesDate;
    });

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
                                        filteredRecords.map((rec) => (
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
                        <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Leave Logs</h2>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: "12px" }}>EMPLOYEE</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>LEAVE DATE</th>
                                        <th style={{ padding: "12px" }}>LEAVE REASON</th>
                                        <th style={{ padding: "12px", textAlign: "center" }}>STATUS</th>
                                        <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "30px 0" }}>Loading leave logs...</td>
                                        </tr>
                                    ) : records.filter(r => r.status === "Leave").length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "30px 0" }}>No approved leaves logged.</td>
                                        </tr>
                                    ) : (
                                        records.filter(r => r.status === "Leave").map((rec) => (
                                            <tr key={rec._id} className="employee-row">
                                                <td style={{ padding: "12px" }}>
                                                    <div>
                                                        <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{rec.employeeName}</p>
                                                        <p style={{ fontSize: "11px", color: "#64748b" }}>{rec.employeeCode}</p>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
                                                    {formatDate(rec.attendanceDate)}
                                                </td>
                                                <td style={{ padding: "12px", color: "#475569", fontSize: "13px" }}>
                                                    {rec.notes || "Personal reasons"}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "2px 8px",
                                                        fontSize: "11px",
                                                        fontWeight: "750",
                                                        borderRadius: "12px",
                                                        display: "inline-block",
                                                        backgroundColor: "#ecfdf5",
                                                        color: "#065f46"
                                                    }}>
                                                        Approved
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "right" }}>
                                                    <button
                                                        onClick={() => handleDeleteRecord(rec._id)}
                                                        className="action-icon-btn delete"
                                                        style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        title="Delete Leave Day"
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
                        <h2 className="emp-card-title" style={{ marginBottom: "8px" }}>Record Leave</h2>
                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>Logs approved leave days for an employee across a specified date range.</p>
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
                                <span>Save Approved Leave</span>
                            </button>
                        </form>
                    </div>

                </div>
            )}
        </div>
    );
}
