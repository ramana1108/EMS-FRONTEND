import { useState, useEffect } from "react";
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

    const fetchLeaves = async () => {
        try {
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
                setIsLeaveModalOpen(false);
                setCurrentLeavePage(1);
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

    const handleDeleteLeave = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leave request?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/leave/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Leave deleted successfully');
                fetchLeaves();
            } else {
                setError(data.message || 'Failed to delete leave');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to delete leave');
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

    // Attendance stats
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
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 className="dashboard-title">Attendance & Leaves</h1>
                    <p className="dashboard-subtitle">Track clock-in times, worked hours, and log employee leave requests.</p>
                </div>

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

            {activeTab === "attendance" ? (
                <div className="w-full">
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
                                    onChange={(e) => {
                                        setFilterEmpId(e.target.value);
                                        setCurrentAttendancePage(1);
                                    }}
                                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => {
                                        setFilterDate(e.target.value);
                                        setCurrentAttendancePage(1);
                                    }}
                                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: "4px 8px" }}>EMPLOYEE</th>
                                        <th style={{ padding: "4px 8px" }}>DEPARTMENT</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>DATE</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>IN</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>OUT</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>HOURS</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>STATUS</th>
                                        <th style={{ padding: "4px 8px", textAlign: "right" }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", padding: "30px 0" }}>Loading logs...</td>
                                        </tr>
                                    ) : paginatedRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", padding: "30px 0" }}>No records registered matching search criteria.</td>
                                        </tr>
                                    ) : (
                                        paginatedRecords.map((rec) => (
                                            <tr key={rec._id} className="employee-row">
                                                <td style={{ padding: "4px 8px" }}>
                                                    <div>
                                                        <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{rec.employeeName}</p>
                                                        <p style={{ fontSize: "11px", color: "#64748b" }}>{rec.employeeCode}</p>
                                                    </div>
                                                </td>
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
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

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
                    </div>
                </div>
            ) : (
                /* Leave Tab */
                <div className="w-full">
                    {/* Leaves Table */}
                    <div className="employee-directory-card" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Leave Logs</h2>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: "4px 8px" }}>EMPLOYEE</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>LEAVE DATE</th>
                                        <th style={{ padding: "4px 8px" }}>LEAVE REASON</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center" }}>STATUS</th>
                                        <th style={{ padding: "4px 8px", textAlign: "right" }}>ACTIONS</th>
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
                    <div className="modal-content-card" style={{ maxWidth: "500px" }}>
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
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                    <option value="Present">Present</option>
                                    <option value="Half Day">Half Day</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                </select>
                            </div>

                            {(status === "Present" || status === "Half Day") && (
                                <>
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
                                    </div>
                                </>
                            )}

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
                        </form>
                    </div>
                </div>
            )}

            {/* Record Leave Modal */}
            {isLeaveModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-card" style={{ maxWidth: "500px" }}>
                        <div className="modal-header">
                            <div>
                                <h2>Record Leave</h2>
                                <p className="modal-subtitle">Logs approved leave days for an employee.</p>
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => setIsLeaveModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleApplyLeave} className="enroll-form">
                            <div className="form-group">
                                <label>Employee <span className="req">*</span></label>
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

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div className="form-group">
                                    <label>From Date <span className="req">*</span></label>
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
                                    <span>Save Approved Leave</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
