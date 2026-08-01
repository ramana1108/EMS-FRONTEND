import React from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Megaphone, Shield } from "lucide-react";

const notices = [
    {
        id: 1,
        title: "Payroll Processing Date",
        description: "Monthly payroll processing will begin on 26th Aug. Ensure all timesheets are approved.",
        icon: Bell,
        date: "1hr ago",
        category: "Urgent",
        categoryClass: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-105 dark:border-red-900/40"
    },
    {
        id: 2,
        title: "Independence Day Holiday",
        description: "The office will remain closed on August 15th in observance of Independence Day.",
        icon: Calendar,
        date: "Yesterday",
        category: "Holiday",
        categoryClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-105 dark:border-amber-900/40"
    },
    {
        id: 3,
        title: "Quarterly Review Meeting",
        description: "All hands meeting scheduled at 3:00 PM for the Q2 updates and performance evaluations.",
        icon: Megaphone,
        date: "2 days ago",
        category: "Event",
        categoryClass: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-105 dark:border-purple-900/40"
    },
    {
        id: 4,
        title: "New HR Remote Policy",
        description: "Please review the updated remote work and leave policy document shared on corporate EMS.",
        icon: Shield,
        date: "1 week ago",
        category: "Policy",
        categoryClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-105 dark:border-emerald-900/40"
    }
];

export default function NoticesCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] flex flex-col h-[400px] overflow-hidden"
        >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 flex-shrink-0 text-left">
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Company Notices</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest announcements & updates</p>
                </div>
                <button className="text-xs font-extrabold text-[#059669] dark:text-[#10b981] hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    View All
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {notices.map((notice, index) => {
                    const Icon = notice.icon;
                    return (
                        <div key={notice.id} className="group text-left">
                            <div className="flex gap-4">
                                {/* Glowing border wraps around notice category icon */}
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200/40 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform duration-200">
                                    <Icon size={18} className="stroke-[2]" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#059669] dark:group-hover:text-[#10b981] transition-colors duration-150-all leading-snug">
                                                {notice.title}
                                            </h3>
                                            {/* Notice Category Pill tags */}
                                            <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border mt-1.5 ${notice.categoryClass}`}>
                                                {notice.category}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-bold font-mono">{notice.date}</span>
                                    </div>
                                    <p className="text-xs text-slate-505 dark:text-slate-400 mt-2 leading-relaxed">
                                        {notice.description}
                                    </p>
                                </div>
                            </div>
                            {index < notices.length - 1 && (
                                <div className="h-px bg-slate-100 dark:bg-slate-800/40 my-4" />
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
