import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const fallbackMonthlyData = [];

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
    const [monthlyData, setMonthlyData] = useState(fallbackMonthlyData);
    const [departmentOptions, setDepartmentOptions] = useState(["All Departments"]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSummary = async () => {
            try {
                const response = await fetch("/api/attendance/summary");
                if (!response.ok) throw new Error("Failed to load summary");
                const data = await response.json();

                if (Array.isArray(data.monthlyStats) && data.monthlyStats.length > 0) {
                    const normalized = data.monthlyStats.map((entry) => ({
                        name: entry.name,
                        Present: entry.Present || 0,
                        Absent: entry.Absent || 0,
                        Leave: entry.Leave || 0,
                        "Half Day": entry["Half Day"] || 0,
                    }));
                    setMonthlyData(normalized);
                }

                if (Array.isArray(data.departmentStats)) {
                    const depts = data.departmentStats.map((entry) => entry.name).filter(Boolean);
                    setDepartmentOptions(["All Departments", ...depts]);
                }
            } catch (err) {
                console.warn("Attendance summary unavailable, using fallback data:", err);
                setMonthlyData(fallbackMonthlyData);
                setDepartmentOptions(["All Departments", "Production", "Sales", "IT", "HR/Admin"]);
            } finally {
                setLoading(false);
            }
        };

        loadSummary();
    }, []);

    const data = useMemo(() => {
        if (selectedDept === "All Departments") {
            return monthlyData;
        }

        return monthlyData.map((entry) => ({ ...entry }));
    }, [monthlyData, selectedDept]);

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
                    {departmentOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div className="flex-1 w-full text-xs font-semibold relative z-10">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading attendance analytics...</div>
                ) : data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No attendance analytics data is available yet.</div>
                ) : (
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
                )}
            </div>
        </motion.div>
    );
}