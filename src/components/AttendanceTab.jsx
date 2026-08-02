import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, UserCheck, Play, Square } from "lucide-react";

const fallbackLogs = [];

export default function AttendanceTab() {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState(null);
    const [logs, setLogs] = useState(fallbackLogs);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAttendance = async () => {
            try {
                const response = await fetch("/api/attendance");
                if (!response.ok) throw new Error("Failed to load attendance");
                const data = await response.json();
                if (Array.isArray(data.attendance)) {
                    const normalized = data.attendance.map((item) => ({
                        _id: item._id,
                        attendanceDate: item.attendanceDate ? item.attendanceDate.split("T")[0] : "",
                        checkInTime: item.checkInTime || "--",
                        checkOutTime: item.checkOutTime || "--",
                        workedHours: item.workedHours ?? 0,
                        status: item.status,
                        employeeName: item.employeeName || "Unknown",
                    }));
                    setLogs(normalized);
                }
            } catch (err) {
                console.warn("Attendance API unavailable, showing fallback data:", err);
                setLogs(fallbackLogs);
            } finally {
                setLoading(false);
            }
        };

        loadAttendance();
    }, []);

    const handleClockToggle = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toISOString().split("T")[0];

        if (!isClockedIn) {
            setIsClockedIn(true);
            setClockInTime(timeStr);
        } else {
            setIsClockedIn(false);
            const newLog = {
                _id: `local-${Date.now()}`,
                attendanceDate: dateStr,
                checkInTime: clockInTime,
                checkOutTime: timeStr,
                workedHours: 8,
                status: "Present",
                employeeName: "You"
            };
            setLogs([newLog, ...logs]);
            setClockInTime(null);
        }
    };

    const presentDays = logs.filter((log) => log.status === "Present").length;
    const lateCheckIns = logs.filter((log) => log.status === "Absent").length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attendance Logs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">View live attendance records from your database and clock in/out locally.</p>
                </div>

                <button
                    onClick={handleClockToggle}
                    className={`flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm shadow-md ${isClockedIn
                            ? "bg-red-650 hover:bg-red-700 text-white shadow-red-900/10"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-emerald-900/10"
                        }`}
                >
                    {isClockedIn ? (
                        <>
                            <Square size={16} fill="white" />
                            <span>Clock Out</span>
                        </>
                    ) : (
                        <>
                            <Play size={16} fill="white" />
                            <span>Clock In</span>
                        </>
                    )}
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                        <Clock size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-505">Today's Session</span>
                        <p className="text-lg font-black text-slate-800 dark:text-white mt-1">
                            {isClockedIn ? `Clocked In at ${clockInTime}` : "Not Active"}
                        </p>
                    </div>
                </div>

                <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-505">Present Days</span>
                        <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{presentDays} Days <span className="text-xs text-emerald-500 font-semibold">({Math.round((presentDays / Math.max(logs.length, 1)) * 100)}%)</span></p>
                    </div>
                </div>

                <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-505">Late Check-ins</span>
                        <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{lateCheckIns} Incident{lateCheckIns === 1 ? "" : "s"}</p>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Session Date</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Worked Hours</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">Loading attendance data...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">No attendance records found in the database yet.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{log.employeeName}</td>
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-slate-700 dark:text-slate-350">{log.attendanceDate}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{log.checkInTime || "--"}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{log.checkOutTime || "--"}</td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350">{log.workedHours ? `${log.workedHours} hrs` : "--"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider ${log.status === "Present"
                                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300"
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}