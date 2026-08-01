import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Calendar, AlertCircle, FileText } from "lucide-react";

export default function LeaveTab() {
    const [requests, setRequests] = useState([
        { id: 1, name: "Amit Patel", type: "Sick Leave", duration: "2 Days", dates: "12 Aug - 13 Aug", reason: "Fever and medical rest prescription.", status: "Pending" },
        { id: 2, name: "Sneha Nair", type: "Casual Leave", duration: "1 Day", dates: "20 Aug", reason: "Family event engagement.", status: "Pending" },
        { id: 3, name: "Vikram Malhotra", type: "Earned Leave", duration: "5 Days", dates: "01 Sep - 05 Sep", reason: "Annual relocation/vacation.", status: "Approved" },
        { id: 4, name: "Rajesh Kumar", type: "Maternity/Paternity", duration: "10 Days", dates: "10 Oct - 20 Oct", reason: "Family child care leave request.", status: "Rejected" }
    ]);

    const handleAction = (id, newStatus) => {
        setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Leave Management</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Approve, reject, or audit employee holiday and sick leave applications.</p>
            </div>

            {/* List */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Dates Range</th>
                                <th className="px-6 py-4">Reason Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{req.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-slate-655 uppercase tracking-wide">
                                            {req.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-350">{req.duration}</td>
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-slate-705 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="opacity-60" />
                                            <span>{req.dates}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-505 dark:text-slate-400 max-w-xs truncate" title={req.reason}>
                                        {req.reason}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider ${req.status === "Approved"
                                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                                : req.status === "Rejected"
                                                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-300"
                                                    : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300"
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === "Pending" ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleAction(req.id, "Approved")}
                                                    title="Approve Leave"
                                                    className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 rounded-lg text-xs font-black uppercase tracking-wider border border-emerald-100 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, "Rejected")}
                                                    title="Reject Leave"
                                                    className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-black uppercase tracking-wider border border-red-100 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] uppercase font-black text-slate-400">Processed</span>
                                        )}
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
