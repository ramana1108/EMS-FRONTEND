import React from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2 } from "lucide-react";

const initialEmployees = [
    {
        id: "EMP-1024",
        name: "Amit Patel",
        department: "IT",
        role: "Sr. Frontend Developer",
        status: "Active",
        date: "15 Jan 2024",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces&q=80"
    },
    {
        id: "EMP-1025",
        name: "Sneha Nair",
        department: "HR/Admin",
        role: "HR Executive",
        status: "Active",
        date: "02 Feb 2024",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces&q=80"
    },
    {
        id: "EMP-1026",
        name: "Vikram Malhotra",
        department: "Production",
        role: "Operations Lead",
        status: "On Leave",
        date: "18 Aug 2023",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80"
    },
    {
        id: "EMP-1027",
        name: "Rajesh Kumar",
        department: "Sales",
        role: "Business Lead",
        status: "Inactive",
        date: "10 Oct 2022",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces&q=80"
    },
    {
        id: "EMP-1028",
        name: "Divya Sharma",
        department: "IT",
        role: "DevOps Engineer",
        status: "Active",
        date: "01 Mar 2024",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces&q=80"
    },
];

export default function RecentEmployeesTable() {
    const getStatusBadge = (status) => {
        switch (status) {
            case "Active":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {status}
                    </span>
                );
            case "On Leave":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {status}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-205 dark:border-slate-700 shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {status}
                    </span>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden"
        >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-4 text-left">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Employees</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Manage and audit newly onboarded team members</p>
                </div>
                <button className="px-4.5 py-2.5 border border-emerald-650/80 text-[#059669] dark:text-[#10b981] dark:border-emerald-500/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-extrabold rounded-xl transition-all duration-200 shadow-sm hover:shadow-emerald-500/5">
                    View All Employees
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xxs font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joining Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {initialEmployees.map((emp, index) => (
                            <motion.tr
                                key={emp.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-all duration-150 group"
                            >
                                {/* Employee Name & Profile Row */}
                                <td className="px-6 py-4.5">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={emp.avatar}
                                            alt={emp.name}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200/80 dark:border-slate-800 shadow-sm"
                                        />
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#059669] dark:group-hover:text-[#10b981] transition-colors leading-snug">
                                                {emp.name}
                                            </p>
                                            <p className="text-[10px] text-slate-405 font-bold tracking-wide uppercase leading-none mt-0.5">{emp.role}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Employee ID */}
                                <td className="px-6 py-4.5 font-mono text-xs font-black text-[#059669] dark:text-[#10b981]">{emp.id}</td>

                                {/* Department */}
                                <td className="px-6 py-4.5 text-xs font-extrabold text-slate-505 dark:text-slate-400">
                                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        {emp.department}
                                    </span>
                                </td>

                                {/* Role */}
                                <td className="px-6 py-4.5 text-xs font-semibold text-slate-600 dark:text-slate-400">{emp.role}</td>

                                {/* Status Column */}
                                <td className="px-6 py-4.5">{getStatusBadge(emp.status)}</td>

                                {/* Joining date */}
                                <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 text-xs font-bold font-mono">{emp.date}</td>

                                {/* Actions */}
                                <td className="px-6 py-4.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button
                                            title="View Profile Details"
                                            className="p-2 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors duration-150 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/50"
                                        >
                                            <Eye size={15} />
                                        </button>
                                        <button
                                            title="Edit Record"
                                            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-150 border border-transparent"
                                        >
                                            <Edit size={15} />
                                        </button>
                                        <button
                                            title="Delete Record"
                                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors duration-150 border border-transparent"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
