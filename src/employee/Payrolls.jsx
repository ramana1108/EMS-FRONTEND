import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import PaySlipModal from "../components/PaySlipModal";
import {
    Wallet,
    Coins,
    CreditCard,
    Landmark,
    Download,
    Eye,
    X,
    Printer,
    Menu
} from "lucide-react";
import api from "../api";
import NotificationBell from "../components/NotificationBell";

export default function Payrolls() {
    const [activeTab, setActiveTab] = useState("Payrolls");
    const [isOpen, setIsOpen] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

    // Latest payroll stats derived dynamically
    const [latestStats, setLatestStats] = useState({
        basicSalary: 0,
        allowance: 0,
        deductions: 0,
        netSalary: 0,
        tax: 0,
        bonus: 0
    });

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(loggedInUser);

        const loadPayrolls = async () => {
            setLoading(true);
            try {
                const res = await api.getMyPayrolls();
                const list = Array.isArray(res) ? res : res?.payrolls || [];
                const userPayrolls = list;

                // Sort by year and month descending (using a simple dictionary map for months)
                const monthWeight = {
                    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
                    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
                };

                const sortedPayrolls = userPayrolls.sort((a, b) => {
                    if (b.year !== a.year) return b.year - a.year;
                    return (monthWeight[b.month] || 0) - (monthWeight[a.month] || 0);
                });

                setPayrolls(sortedPayrolls);

                // Compute Latest Stats from the most recent month
                if (sortedPayrolls.length > 0) {
                    const latest = sortedPayrolls[0];
                    setLatestStats({
                        basicSalary: latest.basicSalary || 0,
                        allowance: latest.allowance || 0,
                        deductions: latest.deductions || 0,
                        netSalary: latest.netSalary || 0,
                        tax: latest.tax || 0,
                        bonus: latest.bonus || 0
                    });
                }
            } catch (err) {
                console.error("Failed to fetch payroll information:", err);
            } finally {
                setLoading(false);
            }
        };

        loadPayrolls();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    const handleOpenPayslip = (payroll) => {
        setSelectedSlip(payroll);
        setIsSlipModalOpen(true);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ minHeight: "60px" }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#043e30] text-white shadow-sm shadow-[#043e30]/10"
                        style={{ border: "none", cursor: "pointer" }}
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="emp-top-header flex justify-between items-center mb-8 px-2.5">
                    <div style={{ visibility: "hidden" }}>Placeholder</div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "0 10px" }}>
                    <div className="page-header flex justify-between items-center mb-6" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h1 className="dashboard-title text-3xl font-extrabold text-slate-900 dark:text-white m-0" style={{ color:"black"}}>Payrolls</h1>
                            <p className="dashboard-subtitle text-sm text-slate-500 dark:text-slate-400 mt-1">View your salary details and download payslips</p>
                        </div>
                        <div>
                            <NotificationBell />
                        </div>
                    </div>

                    {/* Stats Grid representing Current/Latest Payslip breakdown */}
                    <div className="emp-stats-grid">
                        {/* Basic Salary */}
                        <div className="emp-stat-card stat-card-green">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-emerald-50 dark:bg-emerald-950/20 text-[#10b981]">
                                    <Wallet size={20} />
                                </div>
                                <span className="emp-stat-title">Basic Salary</span>
                            </div>
                            <p className="emp-stat-value">
                                {formatCurrency(latestStats.basicSalary)}
                            </p>
                            <div style={{ marginTop: "4px" }}>
                                <span className="emp-stat-subtext">Base allowance structure</span>
                            </div>
                        </div>

                        {/* Allowances */}
                        <div className="emp-stat-card stat-card-blue">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-blue-50 dark:bg-blue-950/20 text-[#3b82f6]">
                                    <Coins size={20} />
                                </div>
                                <span className="emp-stat-title">Allowances</span>
                            </div>
                            <p className="emp-stat-value">
                                {formatCurrency(latestStats.allowance + latestStats.bonus)}
                            </p>
                            <div style={{ marginTop: "4px" }}>
                                <span className="emp-stat-subtext text-emerald-600 dark:text-emerald-400">Includes HRA & Bonus</span>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="emp-stat-card stat-card-rose">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-red-50 dark:bg-red-950/20 text-[#ef4444]">
                                    <CreditCard size={20} />
                                </div>
                                <span className="emp-stat-title">Deductions</span>
                            </div>
                            <p className="emp-stat-value">
                                {formatCurrency(latestStats.deductions + latestStats.tax)}
                            </p>
                            <div style={{ marginTop: "4px" }}>
                                <span className="emp-stat-subtext text-red-500">Includes PF & Tax</span>
                            </div>
                        </div>

                        {/* Net Salary */}
                        <div className="emp-stat-card stat-card-indigo">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box bg-purple-50 dark:bg-purple-950/20 text-[#a855f7]">
                                    <Landmark size={20} />
                                </div>
                                <span className="emp-stat-title">Net Salary</span>
                            </div>
                            <p className="emp-stat-value">
                                {formatCurrency(latestStats.netSalary)}
                            </p>
                            <div style={{ marginTop: "4px" }}>
                                <span className="emp-stat-subtext text-[#059669]">Deposited successfully</span>
                            </div>
                        </div>
                    </div>

                    {/* Payslip History Box */}
                    <div className="employee-directory-card">
                        <div className="filters-row flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/5">
                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white" style={{ margin: 0 , color:"black"}}>Payslip History</h2>
                        </div>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Month/Year</th>
                                        <th className="table-number-col">Basic Salary</th>
                                        <th className="table-number-col">Allowances</th>
                                        <th className="table-number-col">Deductions</th>
                                        <th className="table-number-col">Net Salary</th>
                                        <th className="table-center-col">Payment Status</th>
                                        <th className="table-actions-col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>Loading payslips...</td>
                                        </tr>
                                    ) : payrolls.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>No payroll items found for your account.</td>
                                        </tr>
                                    ) : (
                                        payrolls.map((pay) => {
                                            const totalAllowances = (pay.allowance || 0) + (pay.bonus || 0);
                                            const totalDeductions = (pay.deductions || 0) + (pay.tax || 0);
                                            const isPaid = pay.paymentStatus === "Paid";

                                            return (
                                                <tr key={pay._id} className="employee-row">
                                                    <td style={{ fontWeight: "700", color: "#0f172a" }}>
                                                        {pay.month} {pay.year}
                                                    </td>
                                                    <td className="table-number-col" style={{ color: "#334155" }}>
                                                        {formatCurrency(pay.basicSalary)}
                                                    </td>
                                                    <td className="table-number-col" style={{ color: "#059669" }}>
                                                        + {formatCurrency(totalAllowances)}
                                                    </td>
                                                    <td className="table-number-col" style={{ color: "#dc2626" }}>
                                                        - {formatCurrency(totalDeductions)}
                                                    </td>
                                                    <td className="table-number-col" style={{ fontWeight: "700", color: "#0f172a" }}>
                                                        {formatCurrency(pay.netSalary)}
                                                    </td>
                                                    <td className="table-center-col">
                                                        <span
                                                            className="employee-status-badge active"
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                padding: "4px 10px",
                                                                borderRadius: "8px",
                                                                fontSize: "12px",
                                                                fontWeight: "700",
                                                                backgroundColor: isPaid ? "#ecfdf5" : "#fef3c7",
                                                                color: isPaid ? "#047857" : "#d97706",
                                                                border: isPaid ? "1px solid #a7f3d0" : "1px solid #fde68a"
                                                            }}
                                                        >
                                                            <span
                                                                className="bullet"
                                                                style={{
                                                                    backgroundColor: isPaid ? "#10b981" : "#f59e0b",
                                                                    width: "6px",
                                                                    height: "6px",
                                                                    borderRadius: "50%",
                                                                    marginRight: "6px"
                                                                }}
                                                            />
                                                            {pay.paymentStatus}
                                                        </span>
                                                    </td>
                                                     <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                            <button
                                                                onClick={() => handleOpenPayslip(pay)}
                                                                className="action-icon-btn"
                                                                title="View Payslip"
                                                                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "6px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", color: "#334155", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                                                            >
                                                                <Eye size={14} />
                                                                <span>View</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenPayslip(pay)}
                                                                className="action-icon-btn"
                                                                title="Download Payslip PDF"
                                                                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "6px", backgroundColor: "#043e30", border: "none", color: "#ffffff", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                                                            >
                                                                <Download size={14} />
                                                                <span>Slip</span>
                                                            </button>
                                                        </div>
                                                     </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payslip Modal Component */}
                <PaySlipModal
                    payroll={selectedSlip}
                    user={user}
                    isOpen={isSlipModalOpen}
                    onClose={() => setIsSlipModalOpen(false)}
                />

            </div>
        </div>
    );
}
