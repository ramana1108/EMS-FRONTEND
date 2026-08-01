import React from "react";
import { motion } from "framer-motion";
import { Building2, Users, User, ShieldAlert } from "lucide-react";

const depts = [
    {
        name: "Production",
        count: 83,
        head: "Vikram Malhotra",
        role: "Operations Lead",
        color: "from-emerald-700 to-emerald-600",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/20",
        border: "border-emerald-100 dark:border-emerald-900/30",
        accent: "text-emerald-650 dark:text-emerald-400"
    },
    {
        name: "Sales",
        count: 50,
        head: "Rajesh Kumar",
        role: "Business Lead",
        color: "from-emerald-600 to-emerald-555",
        bgLight: "bg-emerald-50/50 dark:bg-emerald-900/10",
        border: "border-emerald-100/60 dark:border-emerald-800/20",
        accent: "text-emerald-600 dark:text-emerald-400"
    },
    {
        name: "IT",
        count: 50,
        head: "Kavya Menon",
        role: "IT Director",
        color: "from-teal-600 to-teal-500",
        bgLight: "bg-teal-50 dark:bg-teal-950/20",
        border: "border-teal-100 dark:border-teal-900/30",
        accent: "text-teal-650 dark:text-teal-400"
    },
    {
        name: "HR/Admin",
        count: 25,
        head: "Priya Sharma",
        role: "HR Director",
        color: "from-slate-600 to-slate-500",
        bgLight: "bg-slate-50 dark:bg-slate-900/30",
        border: "border-slate-100 dark:border-slate-800/40",
        accent: "text-slate-600 dark:text-slate-400"
    }
];

export default function DepartmentsTab() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Departments</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Review and analyze core departmental units and hierarchy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {depts.map((d, index) => (
                    <motion.div
                        key={d.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border ${d.border} rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.01]`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 bg-gradient-to-tr ${d.color} text-white rounded-xl flex items-center justify-center shadow-md`}>
                                    <Building2 size={22} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{d.name}</h3>
                                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">Corporate Unit</span>
                                </div>
                            </div>
                            <div className={`px-4 py-2 ${d.bgLight} rounded-xl border ${d.border} flex items-center gap-2`}>
                                <Users size={16} className={d.accent} />
                                <span className={`text-base font-black font-mono ${d.accent}`}>{d.count}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-105 dark:border-slate-800/40">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Department Head</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{d.head}</p>
                                    <p className="text-xs text-slate-405 dark:text-slate-400 mt-0.5">{d.role}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
