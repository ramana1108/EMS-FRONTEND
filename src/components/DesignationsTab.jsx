import React from "react";
import { motion } from "framer-motion";
import { Award, Briefcase, ChevronRight, Layers } from "lucide-react";

const designations = [
    { title: "IT Director", department: "IT", tier: "Director Level", access: "Total Control" },
    { title: "Operations Lead", department: "Production", tier: "Lead/Manager Level", access: "Limited Admin Control" },
    { title: "Business Lead", department: "Sales", tier: "Lead/Manager Level", access: "Limited Admin Control" },
    { title: "HR Executive", department: "HR/Admin", tier: "Executive Level", access: "Corporate Admin Control" },
    { title: "Sr. Frontend Developer", department: "IT", tier: "Senior Contributor", access: "Default User Portal" },
    { title: "DevOps Engineer", department: "IT", tier: "Senior Contributor", access: "Default User Portal" }
];

export default function DesignationsTab() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Designations</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Coordinate corporate titles, structural tiers, and operational permissions.</p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                                <th className="px-6 py-4">Title Designation</th>
                                <th className="px-6 py-4">Associated Department</th>
                                <th className="px-6 py-4">Job Structure Tier</th>
                                <th className="px-6 py-4">Data Access Tier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {designations.map((designation, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-all duration-150">
                                    <td className="px-6 py-4.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center">
                                                <Award size={16} />
                                            </div>
                                            <span className="font-bold text-slate-850 dark:text-slate-100">{designation.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-655 border border-slate-200 dark:border-slate-700">
                                            {designation.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4.5 text-xs font-semibold text-slate-555 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Layers size={14} className="opacity-60" />
                                            <span>{designation.tier}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4.5 text-xs font-black text-emerald-650 dark:text-emerald-400">{designation.access}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
