import { useState, useEffect } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
import {
    Calendar,
    Clock,
    UserCheck,
    AlertCircle,
    Plus,
    Trash2,
    CheckCircle,
    X
} from "lucide-react";
import api from "../api";

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

    // Pagination (shared page size, separate page per tab)
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

    const fetchEmployees = async () => {
        try {
            const res = await api.getAllEmployees();
            setEmployees(res.employees || res.data || []);
        } catch (err) {
            console.error("Failed to load employees:", err);
            setError("Unable to load employee list.");
        }
    };

    const fetchAttendance = async () => {
        try {
            const res = await api.getAttendance();
            setRecords(res.attendance || res.data || []);
        } catch (err) {
            console.error("Failed to fetch attendance:", err);
            setError("Failed to fetch attendance logs");
        }
    };

    const fetchLeaves = async () => {
        try {
            const res = await api.getAllLeaves();
            setLeaves(res.leaves || res.data || []);
        } catch (err) {
            console.error("Failed to fetch leaves:", err);
            setError("Failed to fetch leave logs");
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

    // Reset attendance page when filters or data change
    useEffect(() => {
        setCurrentAttendancePage(1);
    }, [filterEmpId, filterDate, records]);

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

            const data = await api.createAttendance(payload);
            if (data.success !== false) {
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
        if (!leaveEmpId) {
            setError("Please select an employee for this leave request.");
            return;
        }
        if (!leaveFrom) {
            setError("From Date is required.");
            return;
        }
        if (!leaveTo) {
            setError("To Date is required.");
            return;
        }
        if (!leaveType) {
            setError("Leave Type is required.");
            return;
        }
        if (!leaveReason || !leaveReason.trim()) {
            setError("Reason for leave is required.");
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

        setLoading(true);
        try {
            const data = await api.applyLeave({
                employeeId: leaveEmpId,
                leaveType,
                fromDate: leaveFrom,
                toDate: leaveTo,
                reason: leaveReason,
            });
            setLoading(false);
            if (data.success !== false) {
                setSuccess("Leave request submitted successfully.");
                setLeaveEmpId("");
                setLeaveFrom("");
                setLeaveTo("");
                setLeaveReason("");
                setLeaveType("Casual Leave");
                setIsLeaveModalOpen(false);
                setCurrentLeavePage(1);
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

    const handleUpdateLeaveStatus = async (id, newStatus) => {
        setError("");
        setSuccess("");
        try {
            const data = await api.updateLeaveStatus(id, { status: newStatus });
            if (data.success !== false) {
                setSuccess(`Leave ${newStatus.toLowerCase()} successfully.`);
                fetchLeaves();
            } else {
                setError(data.message || `Failed to ${newStatus.toLowerCase()} leave`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to ${newStatus.toLowerCase()} leave`);
        }
    };

    const handleDeleteRecord = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        setError("");
        setSuccess("");
        try {
            const data = await api.deleteAttendance(id);
            if (data.success) {
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
            const data = await api.deleteLeave(id);
            if (data.success !== false) {
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
        const employeeCode = rec.employeeId?.employeeId || rec.employeeCode || "";
        const employeeName = `${rec.employeeId?.firstName || ""} ${rec.employeeId?.lastName || ""}`.trim() || rec.employeeName || "";
        const matchesEmp = !filterEmpId || employeeCode === filterEmpId || employeeName.toLowerCase().includes(filterEmpId.toLowerCase());
        const matchesDate = !filterDate || formatDate(rec.attendanceDate) === filterDate;
        return matchesEmp && matchesDate;
    });

    // Calculate statistics
    const totalLeaves = leaves.length;
    const presentCount = records.filter(r => r.status === "Present").length;
    const absentCount = records.filter(r => r.status === "Absent").length;
    const halfDayCount = records.filter(r => r.status === "Half Day").length;

    // Paginate attendance
    const attendanceTotalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
    const attendanceStartIndex = (currentAttendancePage - 1) * itemsPerPage;
    const paginatedRecords = filteredRecords.slice(attendanceStartIndex, attendanceStartIndex + itemsPerPage);

    // Paginate leaves
    const leaveTotalPages = Math.max(1, Math.ceil(leaves.length / itemsPerPage));
    const leaveStartIndex = (currentLeavePage - 1) * itemsPerPage;
    const paginatedLeaves = leaves.slice(leaveStartIndex, leaveStartIndex + itemsPerPage);

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance &amp; Leaves</h1>
                    <p className="text-sm text-slate-600">Track clock-in times, worked hours, and log employee leave requests.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-200 p-1 rounded-lg gap-1">
                        <button
                            onClick={() => setActiveTab("attendance")}
                            className={`px-4 py-2 text-[13px] font-semibold rounded-md transition-colors ${activeTab === "attendance" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
                        >
                            Attendance Logs
                        </button>
                        <button
                            onClick={() => setActiveTab("leave")}
                            className={`px-4 py-2 text-[13px] font-semibold rounded-md transition-colors ${activeTab === "leave" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
                        >
                            Leave Management
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            if (activeTab === "attendance") {
                                setIsAddModalOpen(true);
                            } else {
                                setIsLeaveModalOpen(true);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-sm font-semibold"
                    >
                        <Plus size={16} />
                        <span>{activeTab === "attendance" ? "Log Attendance" : "Record Leave"}</span>
                    </button>
                </div>
            </div>

            {/* Stats Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-800">
                            <UserCheck size={18} color="#ffffff" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Present Logs</p>
                            <p className="text-lg font-bold">{presentCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-500">
                            <Clock size={18} color="#ffffff" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Half Days</p>
                            <p className="text-lg font-bold">{halfDayCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-700">
                            <AlertCircle size={18} color="#ffffff" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Absences</p>
                            <p className="text-lg font-bold">{absentCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-600">
                            <Calendar size={18} color="#ffffff" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Leave Requests</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Logs View */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm" style={{ minHeight: "500px", width: "92rem" }}>
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                            <h2 className="text-lg font-semibold m-0">Attendance Log Panel</h2>

                            {/* Search Filters */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Emp ID or Name..."
                                    value={filterEmpId}
                                    onChange={(e) => setFilterEmpId(e.target.value)}
                                    className="px-3 py-2 rounded-md border border-slate-300 text-sm"
                                />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="px-3 py-2 rounded-md border border-slate-300 text-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[520px] rounded-md border border-slate-100">
                            <table className="min-w-full divide-y table-fixed">
                                <thead>
                                    <tr>
                                        <th className="w-72 px-4 py-3 text-left">EMPLOYEE</th>
                                        <th className="w-48 px-4 py-3 text-left">DEPARTMENT</th>
                                        <th className="w-32 px-4 py-3 text-center">DATE</th>
                                        <th className="w-28 px-4 py-3 text-center">IN</th>
                                        <th className="w-28 px-4 py-3 text-center">OUT</th>
                                        <th className="w-24 px-4 py-3 text-center">HOURS</th>
                                        <th className="w-28 px-4 py-3 text-center">STATUS</th>
                                        <th className="w-24 px-4 py-3 text-right">ACTIONS</th>
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
                                        paginatedRecords.map((rec) => (
                                            <tr key={rec._id} className="border-b last:border-b-0">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            {rec.employeeId?.firstName ? `${rec.employeeId.firstName} ${rec.employeeId.lastName}` : rec.employeeName || "Unknown"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{rec.employeeId?.employeeId || rec.employeeCode || "-"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {rec.employeeId?.departmentId?.departmentName || rec.departmentName || "-"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">{formatDate(rec.attendanceDate)}</td>
                                                <td className="px-4 py-3 text-center font-semibold">{rec.checkInTime || "--:--"}</td>
                                                <td className="px-4 py-3 text-center font-semibold">{rec.checkOutTime || "--:--"}</td>
                                                <td className="px-4 py-3 text-center font-bold text-emerald-700">{rec.workedHours || 0}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${rec.status === "Present" ? "bg-emerald-50 text-emerald-700" : rec.status === "Half Day" ? "bg-sky-50 text-sky-700" : rec.status === "Leave" ? "bg-violet-50 text-violet-700" : "bg-rose-50 text-rose-700"}`}>
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDeleteRecord(rec._id)} title="Delete Record" className="text-rose-600 hover:text-rose-800">
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
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-[13px] text-slate-500">
                                    Showing {attendanceStartIndex + 1} to {Math.min(attendanceStartIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentAttendancePage === 1}
                                        onClick={() => setCurrentAttendancePage(prev => Math.max(prev - 1, 1))}
                                        className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-semibold self-center">
                                        {currentAttendancePage} of {attendanceTotalPages}
                                    </span>
                                    <button
                                        disabled={currentAttendancePage === attendanceTotalPages}
                                        onClick={() => setCurrentAttendancePage(prev => Math.min(prev + 1, attendanceTotalPages))}
                                        className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Record Attendance Form */}
                   
                </div>
            ) : (
                /* Leave Tab */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Leave Requests Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm" style={{ minHeight: "500px", width: "92rem" }}>
                        <h2 className="text-lg font-semibold mb-4">Leave Requests</h2>

                        <div className="overflow-auto max-h-[520px] rounded-md border border-slate-100">
                            <table className="min-w-full divide-y table-fixed">
                                <thead>
                                    <tr>
                                        <th className="table-col-3xl text-left">EMPLOYEE</th>
                                        <th className="table-col-lg text-center">DATES</th>
                                        <th className="table-col-3xl text-left">REASON</th>
                                        <th className="table-col-lg text-center">TYPE</th>
                                        <th className="table-col-lg text-center">STATUS</th>
                                        <th className="table-col-actions text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8">Loading leave requests...</td>
                                        </tr>
                                    ) : paginatedLeaves.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8">No leave requests found.</td>
                                        </tr>
                                    ) : (
                                        paginatedLeaves.map((rec) => (
                                            <tr key={rec._id} className="border-b last:border-b-0">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            {rec.employeeId?.firstName ? `${rec.employeeId.firstName} ${rec.employeeId.lastName}` : "Unknown"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{rec.employeeId?.employeeId || "-"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm">
                                                    {formatDateDisplay(rec.fromDate)} - {formatDateDisplay(rec.toDate)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{rec.reason || "Personal reasons"}</td>
                                                <td className="px-4 py-3 text-center text-sm font-semibold text-slate-800">{rec.leaveType}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${rec.status === "Approved" ? "bg-emerald-50 text-emerald-700" : rec.status === "Rejected" ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-600"}`}>
                                                        {rec.status || "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {rec.status === "Pending" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateLeaveStatus(rec._id, "Approved")}
                                                                    title="Approve"
                                                                    className="text-emerald-600 hover:text-emerald-800"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateLeaveStatus(rec._id, "Rejected")}
                                                                    title="Reject"
                                                                    className="text-rose-600 hover:text-rose-800"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteLeave(rec._id)}
                                                            title="Delete Leave Request"
                                                            className="text-rose-600 hover:text-rose-800"
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
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-[13px] text-slate-500">
                                    Showing {leaveStartIndex + 1} to {Math.min(leaveStartIndex + itemsPerPage, leaves.length)} of {leaves.length} records
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentLeavePage === 1}
                                        onClick={() => setCurrentLeavePage(prev => Math.max(prev - 1, 1))}
                                        className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-semibold self-center">
                                        {currentLeavePage} of {leaveTotalPages}
                                    </span>
                                    <button
                                        disabled={currentLeavePage === leaveTotalPages}
                                        onClick={() => setCurrentLeavePage(prev => Math.min(prev + 1, leaveTotalPages))}
                                        className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Request / Record Leave Form */}
                    
                </div>
            )}

            {/* Log Attendance Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
                    <div className="bg-white rounded-2xl w-[560px] max-w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="m-0 text-lg font-bold text-slate-900">Log Attendance</h2>
                                <p className="text-xs text-slate-500 mt-1">Log quick daily shift details.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddAttendance} className="p-6">
                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Employee*</label>
                                <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} required className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white">
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Attendance Date*</label>
                                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} required className="w-full px-3 py-2 rounded-md border border-slate-300" />
                            </div>

                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Shift Status*</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} required className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white">
                                    <option value="Present">Present</option>
                                    <option value="Half Day">Half Day</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                </select>
                            </div>

                            {(status === "Present" || status === "Half Day") && (
                                <>
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
                                    </div>
                                </>
                            )}

                            <div className="mb-4">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Administrator Notes</label>
                                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" placeholder="e.g. Cleared by HR" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-sm font-semibold"
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
                    <div className="bg-white rounded-2xl w-[500px] max-w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="m-0 text-lg font-bold text-slate-900">Record Leave</h2>
                                <p className="text-xs text-slate-500 mt-1">Submit a leave request on behalf of an employee.</p>
                            </div>
                            <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleApplyLeave} className="p-6">
                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Employee*</label>
                                <select value={leaveEmpId} onChange={(e) => setLeaveEmpId(e.target.value)} required className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white">
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Leave Type*</label>
                                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white">
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Earned Leave">Earned Leave</option>
                                    <option value="Maternity Leave">Maternity Leave</option>
                                    <option value="Paternity Leave">Paternity Leave</option>
                                    <option value="Emergency Leave">Emergency Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">From Date*</label>
                                    <input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} required className="w-full px-3 py-2 rounded-md border border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">To Date*</label>
                                    <input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} required className="w-full px-3 py-2 rounded-md border border-slate-300" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Reason for Leave*</label>
                                <textarea
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                    required
                                    placeholder="e.g. Sickness, vacation, etc."
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 min-h-[80px] resize-y"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsLeaveModalOpen(false)}
                                    className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-sm font-semibold"
                                >
                                    <CheckCircle size={16} />
                                    <span>Submit Leave Request</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}