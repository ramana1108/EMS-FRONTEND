import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, RefreshCw, CheckCircle, FileSpreadsheet, FileText } from "lucide-react";

export default function ReportsTab() {
    const [generating, setGenerating] = useState(false);
    const [lastGen, setLastGen] = useState(null);

    const handleGenerate = (type) => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setLastGen(type);
        }, 1500);
    };

    const reportsList = [
        { name: "Monthly Attendance Summary", type: "CSV", size: "142 KB" },
        { name: "Q2 Financial Payroll Audit", type: "PDF", size: "2.1 MB" },
        { name: "Crew Performance Distribution", type: "CSV", size: "85 KB" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reports & Audits</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Export system telemetry logs, operational audits, and employee summaries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generation Block */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-850 dark:text-slate-100">Compile Report</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-505 uppercase font-black">Ad-hoc Generator</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed font-semibold mb-6">
                            Construct real-time system metrics telemetry audits for corporate attendance timelines and payroll records.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {generating ? (
                            <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 animate-pulse">
                                <RefreshCw className="animate-spin" size={16} />
                                <span>Generating dynamic report...</span>
                            </div>
                        ) : lastGen ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                <span>Successfully downloaded the <b>{lastGen}</b> spreadsheet!</span>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                disabled={generating}
                                onClick={() => handleGenerate("Attendance_August")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold rounded-xl text-xs uppercase shadow-md shadow-emerald-900/10 transition-all disabled:opacity-50"
                            >
                                <Download size={14} />
                                <span>Attendance CSV</span>
                            </button>
                            <button
                                disabled={generating}
                                onClick={() => handleGenerate("Payroll_Quarter2")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-extrabold border border-slate-205 dark:border-slate-700 rounded-xl text-xs uppercase transition-all disabled:opacity-50"
                            >
                                <Download size={14} />
                                <span>Payroll PDF</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Library Block */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">Archived Reports Library</h3>
                    <div className="space-y-3">
                        {reportsList.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    {item.type === "CSV" ? (
                                        <FileSpreadsheet className="text-emerald-550" size={20} />
                                    ) : (
                                        <FileText className="text-red-500" size={20} />
                                    )}
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-bold uppercase">{item.size} &bull; {item.type} Spreadsheet</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleGenerate(item.name)}
                                    className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-505 transition-colors shadow-sm"
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
