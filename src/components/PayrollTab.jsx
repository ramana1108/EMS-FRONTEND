import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Check, AlertCircle, DollarSign, ArrowUpRight } from "lucide-react";

export default function PayrollTab() {
    const [payroll, setPayroll] = useState([
        { id: 1, name: "Amit Patel", role: "Sr. Frontend Developer", base: 85000, allowances: 15000, deductions: 5000, status: "Processed" },
        { id: 2, name: "Sneha Nair", role: "HR Executive", base: 60000, allowances: 10000, deductions: 3000, status: "Processed" },
        { id: 3, name: "Vikram Malhotra", role: "Operations Lead", base: 90000, allowances: 20000, deductions: 8000, status: "Pending" },
        { id: 4, name: "Rajesh Kumar", role: "Business Lead", base: 95050, allowances: 25000, deductions: 9000, status: "Pending" },
        { id: 5, name: "Divya Sharma", role: "DevOps Engineer", base: 80000, allowances: 12000, deductions: 4000, status: "Pending" }
    ]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    const handleDisburse = (id) => {
        setPayroll(payroll.map(item => item.id === id ? { ...item, status: "Processed" } : item));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Payroll Registry</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Process salaries, compute monthly payouts, and disburse base payments.</p>
            </div>

            {/* List */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                                <th className="px-6 py-4">Employee Details</th>
                                <th className="px-6 py-4">Base Pay</th>
                                <th className="px-6 py-4">Allowances</th>
                                <th className="px-6 py-4">Deductions</th>
                                <th className="px-6 py-4">Net Salary</th>
                                <th className="px-6 py-4">Payment State</th>
                                <th className="px-6 py-4 text-right">Action Gate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {payroll.map((item) => {
                                const net = item.base + item.allowances - item.deductions;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-850 dark:text-slate-100">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wide mt-0.5">{item.role}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{formatCurrency(item.base)}</td>
                                        <td className="px-6 py-4 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(item.allowances)}</td>
                                        <td className="px-6 py-4 text-xs font-bold font-mono text-red-500">- {formatCurrency(item.deductions)}</td>
                                        <td className="px-6 py-4 text-xs font-extrabold font-mono text-[#059669] dark:text-[#10b981]">{formatCurrency(net)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-inner ${item.status === "Processed"
                                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
                                                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Processed" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.status === "Pending" ? (
                                                <button
                                                    onClick={() => handleDisburse(item.id)}
                                                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold rounded-lg text-xs uppercase tracking-wide shadow-sm"
                                                >
                                                    Disburse
                                                </button>
                                            ) : (
                                                <span className="text-[10px] uppercase font-black text-slate-400">Paid</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
