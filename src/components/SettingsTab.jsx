import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, CheckCircle, ShieldAlert } from "lucide-react";

export default function SettingsTab() {
    const [companyName, setCompanyName] = useState("EMS Enterprise Corp");
    const [systemEmail, setSystemEmail] = useState("admin@ems.com");
    const [currency, setCurrency] = useState("INR");
    const [checkInLimit, setCheckInLimit] = useState("09:00");
    const [saved, setSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Configure corporate metadata thresholds, security rules, and alert states.</p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] max-w-2xl">
                <form onSubmit={handleSave} className="space-y-5">
                    {saved && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-850 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span>System configurations updated successfully!</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Company Name Alias</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100 font-semibold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">System Notification Email Address</label>
                        <input
                            type="email"
                            value={systemEmail}
                            onChange={(e) => setSystemEmail(e.target.value)}
                            className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100 font-semibold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Default Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 cursor-pointer transition-colors dark:text-slate-100 font-semibold"
                            >
                                <option value="INR" className="dark:bg-slate-900">INR (₹)</option>
                                <option value="USD" className="dark:bg-slate-900">USD ($)</option>
                                <option value="EUR" className="dark:bg-slate-900">EUR (€)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Late Attendance Threshold</label>
                            <input
                                type="time"
                                value={checkInLimit}
                                onChange={(e) => setCheckInLimit(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100 font-semibold"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-800/40">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all text-xs uppercase"
                        >
                            <Save size={14} />
                            <span>Save System Modifications</span>
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
