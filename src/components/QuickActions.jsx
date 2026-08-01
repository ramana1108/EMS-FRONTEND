import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Wallet, UserCheck, MessageSquare } from "lucide-react";

export default function QuickActions() {
    const actions = [
        {
            label: "Add New Employee",
            icon: UserPlus,
            desc: "Enroll a new team member",
            glowColor: "rgba(16, 185, 129, 0.4)"
        },
        {
            label: "Generate Payroll",
            icon: Wallet,
            desc: "Process monthly salaries",
            glowColor: "rgba(16, 185, 129, 0.4)"
        },
        {
            label: "Approve Managers",
            icon: UserCheck,
            desc: "Manage leadership profiles",
            glowColor: "rgba(16, 185, 129, 0.4)"
        },
        {
            label: "Broadcast Notice",
            icon: MessageSquare,
            desc: "Post priority HR bulletins",
            glowColor: "rgba(16, 185, 129, 0.4)"
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] flex flex-col h-[400px]"
        >
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800/60 text-left flex-shrink-0">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Quick Actions</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Perform operational triggers instantly</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3.5 mt-2">
                {actions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                        <motion.button
                            key={idx}
                            whileHover={{
                                scale: 1.03,
                                boxShadow: `0 12px 20px -8px ${action.glowColor}`
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-md transition-all duration-200 group text-left"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="bg-white/12 p-2 rounded-lg border border-white/10 text-white group-hover:rotate-6 transition-transform duration-250">
                                    <Icon size={18} className="stroke-[2.2]" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold tracking-wide leading-none">{action.label}</p>
                                    <p className="text-[10px] text-emerald-100/70 font-semibold mt-1 leading-none">{action.desc}</p>
                                </div>
                            </div>
                            <span className="text-emerald-105 group-hover:translate-x-1.5 transition-transform duration-200 font-extrabold text-base">&rarr;</span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}
