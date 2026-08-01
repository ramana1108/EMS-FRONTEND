import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, UserCheck, Play, Square } from "lucide-react";

export default function AttendanceTab() {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState(null);
    const [logs, setLogs] = useState([
        { date: "2026-08-01", checkIn: "08:58 AM", checkOut: "05:30 PM", hours: "8.5 hrs", status: "On Time" },
        { date: "2026-07-31", checkIn: "09:12 AM", checkOut: "06:00 PM", hours: "8.8 hrs", status: "Late Check-in" },
        { date: "2026-07-30", checkIn: "08:52 AM", checkOut: "05:30 PM", hours: "8.6 hrs", status: "On Time" },
        { date: "2026-07-29", checkIn: "09:05 AM", checkOut: "05:40 PM", hours: "8.5 hrs", status: "On Time" }
    ]);

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
                date: dateStr,
                checkIn: clockInTime,
                checkOut: timeStr,
                hours: "8.0 hrs",
                status: "On Time"
            };
            setLogs([newLog, ...logs]);
            setClockInTime(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attendance Logs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Verify login-logout audit stamps and simulate check-in active states.</p>
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
                        <p className="text-lg font-black text-slate-800 dark:text-white mt-1">18 Days <span className="text-xs text-emerald-500 font-semibold">(94%)</span></p>
                    </div>
                </div>

                <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-505">Late Check-ins</span>
                        <p className="text-lg font-black text-slate-800 dark:text-white mt-1">1 Incident</p>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                                <th className="px-6 py-4">Session Date</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Worked Hours</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {logs.map((log, index) => (
                                <tr key={index} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-slate-700 dark:text-slate-350">{log.date}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{log.checkIn}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{log.checkOut || "--"}</td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350">{log.hours}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider ${log.status === "On Time"
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
