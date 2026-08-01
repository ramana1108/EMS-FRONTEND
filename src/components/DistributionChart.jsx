import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
    { name: "Production", value: 83, color: "#064E3B", percentage: 40 }, // Deep Dark Emerald
    { name: "Sales", value: 50, color: "#059669", percentage: 24 },      // Emerald
    { name: "IT", value: 50, color: "#10B981", percentage: 24 },         // Accent Green
    { name: "HR/Admin", value: 25, color: "#34D399", percentage: 12 }    // Teal-Mint
];

// Custom Tooltip for Glassmorphism
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-3.5 shadow-xl text-left font-sans">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        {data.name}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Count: <b className="font-mono text-sm text-[#059669] dark:text-[#10b981] ml-0.5">{data.value}</b> Enrolled
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Share: <b className="font-mono text-sm text-[#059669] dark:text-[#10b981] ml-0.5">{data.percentage}%</b> of total
                </p>
            </div>
        );
    }
    return null;
};

// Premium Custom Legend Component
const RenderLegend = (props) => {
    const { payload } = props;
    return (
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 mt-2.5 px-3">
            {payload.map((entry, index) => {
                const item = entry.payload;
                return (
                    <div key={`legend-item-${index}`} className="flex items-center gap-2 group cursor-pointer">
                        <span className="w-2 h-2 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                        <div className="text-left font-sans leading-tight">
                            <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                                {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold font-mono">
                                {item.value} ({item.percentage}%)
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function DistributionChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] flex flex-col h-[400px] relative overflow-hidden"
        >
            {/* Decorative Blur Dot */}
            <span className="absolute -right-20 -bottom-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-3 text-left flex-shrink-0 relative z-10">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Employee Distribution</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Workforce segmentation structure</p>
            </div>

            <div className="flex-1 w-full relative min-h-[220px] relative z-10">
                {/* Center Text inside Donut Chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                    <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">208</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold mt-0.5">Employees</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="43%"
                            innerRadius={70}
                            outerRadius={92}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<RenderLegend />} verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
