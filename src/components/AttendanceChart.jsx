import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const departmentData = {
    "All Departments": [
        { name: "Jan", Present: 180, Absent: 20 },
        { name: "Feb", Present: 185, Absent: 15 },
        { name: "Mar", Present: 195, Absent: 10 },
        { name: "Apr", Present: 188, Absent: 18 },
        { name: "May", Present: 192, Absent: 12 },
        { name: "Jun", Present: 190, Absent: 14 },
        { name: "Jul", Present: 198, Absent: 8 },
        { name: "Aug", Present: 186, Absent: 22 },
        { name: "Sep", Present: 192, Absent: 13 },
        { name: "Oct", Present: 195, Absent: 10 },
        { name: "Nov", Present: 197, Absent: 9 },
        { name: "Dec", Present: 201, Absent: 6 },
    ],
    "IT": [
        { name: "Jan", Present: 42, Absent: 3 },
        { name: "Feb", Present: 43, Absent: 2 },
        { name: "Mar", Present: 44, Absent: 1 },
        { name: "Apr", Present: 41, Absent: 4 },
        { name: "May", Present: 43, Absent: 2 },
        { name: "Jun", Present: 42, Absent: 3 },
        { name: "Jul", Present: 44, Absent: 1 },
        { name: "Aug", Present: 40, Absent: 5 },
        { name: "Sep", Present: 42, Absent: 3 },
        { name: "Oct", Present: 43, Absent: 2 },
        { name: "Nov", Present: 44, Absent: 1 },
        { name: "Dec", Present: 45, Absent: 0 },
    ],
    "HR/Admin": [
        { name: "Jan", Present: 22, Absent: 3 },
        { name: "Feb", Present: 23, Absent: 2 },
        { name: "Mar", Present: 24, Absent: 1 },
        { name: "Apr", Present: 21, Absent: 4 },
        { name: "May", Present: 23, Absent: 2 },
        { name: "Jun", Present: 23, Absent: 2 },
        { name: "Jul", Present: 24, Absent: 1 },
        { name: "Aug", Present: 22, Absent: 3 },
        { name: "Sep", Present: 23, Absent: 2 },
        { name: "Oct", Present: 24, Absent: 1 },
        { name: "Nov", Present: 24, Absent: 1 },
        { name: "Dec", Present: 25, Absent: 0 },
    ],
    "Production": [
        { name: "Jan", Present: 75, Absent: 10 },
        { name: "Feb", Present: 78, Absent: 7 },
        { name: "Mar", Present: 82, Absent: 3 },
        { name: "Apr", Present: 79, Absent: 6 },
        { name: "May", Present: 81, Absent: 4 },
        { name: "Jun", Present: 80, Absent: 5 },
        { name: "Jul", Present: 83, Absent: 2 },
        { name: "Aug", Present: 74, Absent: 11 },
        { name: "Sep", Present: 80, Absent: 5 },
        { name: "Oct", Present: 81, Absent: 4 },
        { name: "Nov", Present: 82, Absent: 3 },
        { name: "Dec", Present: 83, Absent: 2 },
    ],
    "Sales": [
        { name: "Jan", Present: 41, Absent: 4 },
        { name: "Feb", Present: 41, Absent: 4 },
        { name: "Mar", Present: 45, Absent: 5 },
        { name: "Apr", Present: 47, Absent: 4 },
        { name: "May", Present: 45, Absent: 4 },
        { name: "Jun", Present: 45, Absent: 4 },
        { name: "Jul", Present: 47, Absent: 4 },
        { name: "Aug", Present: 50, Absent: 3 },
        { name: "Sep", Present: 47, Absent: 3 },
        { name: "Oct", Present: 47, Absent: 3 },
        { name: "Nov", Present: 47, Absent: 4 },
        { name: "Dec", Present: 48, Absent: 4 },
    ],
};

// Custom Glassmorphic Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 shadow-xl text-left">
                <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2 font-sans">
                    {label} - Attendance
                </p>
                <div className="space-y-1.5 font-sans">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-emerald-600 to-[#10b981]" />
                        <span>Present: <b className="font-mono text-sm ml-1">{payload[0].value}</b></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-450 dark:text-emerald-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
                        <span>Absent: <b className="font-mono text-sm ml-1">{payload[1].value}</b></span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function AttendanceChart() {
    const [selectedDept, setSelectedDept] = useState("All Departments");
    const data = departmentData[selectedDept];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] flex flex-col h-[400px] relative overflow-hidden"
        >
            {/* Visual background lights */}
            <span className="absolute -left-20 -top-20 w-44 h-44 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-5 flex-shrink-0 relative z-10">
                <div className="text-left">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Attendance Analytics</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparative reporting for present vs. absent statuses</p>
                </div>
                <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-white/90 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-650/15 hover:border-slate-300 dark:hover:border-slate-750 transition-all cursor-pointer shadow-sm"
                >
                    <option value="All Departments">All Departments</option>
                    <option value="Production">Production</option>
                    <option value="Sales">Sales</option>
                    <option value="IT">IT</option>
                    <option value="HR/Admin">HR/Admin</option>
                </select>
            </div>

            <div className="flex-1 w-full text-xs font-semibold relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#059669" />
                                <stop offset="100%" stopColor="#34D399" />
                            </linearGradient>
                            <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#84F2C1" />
                                <stop offset="100%" stopColor="#D1FAE5" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            stroke="rgba(148, 163, 184, 0.8)"
                            fontSize={11}
                            dy={5}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            stroke="rgba(148, 163, 184, 0.8)"
                            fontSize={11}
                            dx={-5}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16, 185, 129, 0.04)" }} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{
                                fontSize: "12px",
                                fontFamily: "var(--sans)",
                                color: "#475569",
                                paddingBottom: "8px"
                            }}
                        />
                        <Bar
                            dataKey="Present"
                            fill="url(#presentGrad)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={16}
                            name="Present"
                        />
                        <Bar
                            dataKey="Absent"
                            fill="url(#absentGrad)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={16}
                            name="Absent"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
