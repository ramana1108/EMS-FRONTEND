import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function StatCard({ icon: Icon, title, value, trend, index, sparkData }) {
    // Safe fallback data if sparkData isn't loaded
    const chartData = sparkData || [
        { value: 40 },
        { value: 30 },
        { value: 45 },
        { value: 35 },
        { value: 55 },
        { value: 48 },
        { value: 70 }
    ];

    const gradientId = `sparkGradient-${index}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{
                y: -6,
                scale: 1.025,
                boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)"
            }}
            className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-[175px] transition-shadow duration-300"
        >
            {/* Glow highlight background element */}
            <span className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

            {/* Top Section */}
            <div className="flex items-start justify-between relative z-10">
                <div className="text-left">
                    <span className="text-[11px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-sans">
                        {title}
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                        {value}
                    </h3>
                </div>
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/10 rounded-xl flex items-center justify-center text-[#059669] dark:text-[#10b981] border border-emerald-100/60 dark:border-emerald-900/30 shadow-inner flex-shrink-0">
                    <Icon size={22} className="stroke-[2.2]" />
                </div>
            </div>

            {/* Bottom Area (Sparkline & Trend indicators) */}
            <div className="flex items-end justify-between mt-auto w-full gap-4 relative z-10">
                <div className="text-left pb-1">
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#10b981] px-2 py-0.5 rounded-full border border-emerald-25/5 font-extrabold">
                        {trend}
                    </span>
                </div>

                {/* Mini Sparkline Chart */}
                <div className="h-11 w-24 opacity-80 hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 2, left: 2, right: 2, bottom: 2 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                dot={{ r: 0 }}
                                activeDot={{ r: 3, stroke: "#10B981", strokeWidth: 1 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
