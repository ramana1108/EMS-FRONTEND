import React from "react";
import { motion } from "framer-motion";

const managers = [
    {
        id: 1,
        name: "Ramesh Kumar",
        role: "Operations Manager",
        department: "Operations",
        status: "online",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "HR Director",
        department: "HR",
        status: "online",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80"
    },
    {
        id: 3,
        name: "Arjun Nair",
        role: "Finance Principal",
        department: "Finance",
        status: "online",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80"
    },
    {
        id: 4,
        name: "Kavya Menon",
        role: "IT Director",
        department: "IT",
        status: "offline",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&q=80"
    }
];

export default function ManagersCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-lg shadow-emerald-950/[0.02] flex flex-col h-[400px] overflow-hidden"
        >
            <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/60 flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Managers</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Department Heads & Leaders</p>
                </div>
                <button className="text-sm font-bold text-[#059669] dark:text-[#10b981] hover:underline">
                    View All
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {managers.map((manager, index) => (
                    <div key={manager.id} className="group flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={manager.avatar}
                                    alt={manager.name}
                                    className="w-11 h-11 rounded-full object-cover border border-slate-200/80 dark:border-slate-800"
                                />
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${manager.status === "online" ? "bg-emerald-500" : "bg-slate-400"
                                    }`} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#059669] dark:group-hover:text-[#10b981] transition-colors duration-150-all">
                                    {manager.name}
                                </h3>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">{manager.role}</p>
                            </div>
                        </div>
                        <div className="bg-emerald-55/6 flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-[#059669] dark:text-[#10b981] bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                            {manager.department}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
