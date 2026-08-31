import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import FooterNavigation from "../components/FooterNavigation";
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
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col">
            <Header />

            <div className="flex-1 flex flex-col px-4 py-6 sm:px-8 lg:px-10" style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "0 10px" }}>
                    <div className="page-header flex justify-between items-center mb-6" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h1 className="dashboard-title text-3xl font-extrabold m-0" style={{ color: "#172033" }}>Payrolls</h1>
                            <p className="dashboard-subtitle text-sm mt-1" style={{ color: "#64748B" }}>View your salary details and download payslips</p>
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
                                <div className="emp-stat-icon-box">
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
                                <div className="emp-stat-icon-box">
                                    <Coins size={20} />
                                </div>
                                <span className="emp-stat-title">Allowances</span>
                            </div>
                            <p className="emp-stat-value">
                                {formatCurrency(latestStats.allowance + latestStats.bonus)}
                            </p>
                            <div style={{ marginTop: "4px" }}>
                                <span className="emp-stat-subtext" style={{ color: "#087F72" }}>Includes HRA & Bonus</span>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="emp-stat-card stat-card-rose">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box">
                                    <CreditCard size={20} />
                                </div>
                                <span className="emp-stat-title">Deductions</span>
                            </div>
                            <p className="emp-stat-value">
                                {formatCurrency(latestStats.deductions + latestStats.tax)}
                            </p>
                            <div style={{ marginTop: "4px" }}>
                                <span className="emp-stat-subtext" style={{ color: "#DC2626" }}>Includes PF & Tax</span>
                            </div>
                        </div>

                        {/* Net Take Home */}
                        <div className="emp-stat-card stat-card-amber">
                            <div className="emp-stat-top">
                                <div className="emp-stat-icon-box">
                                    <Landmark size={20} />
                                </div>
                                <span className="emp-stat-title">Net Take Home</span>
                            </div>
                            <p className="emp-stat-value">
                                {formatCurrency(latestStats.netSalary)}
                            </p>
                            <div style={{ marginTop: "4px" }}>
                                <span className="emp-stat-subtext" style={{ color: "#2563EB" }}>Latest monthly payout</span>
                            </div>
                        </div>
                    </div>

                    {/* Payslip History Table */}
                    <div className="employee-directory-card" style={{ marginBottom: "24px" }}>
                        <div className="filters-row flex justify-between items-center px-6 py-5 border-b border-[#E2E8F0]">
                            <h2 className="text-lg font-extrabold text-[#172033]" style={{ margin: 0 }}>Payslip History</h2>
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
                                            <td colSpan="7" style={{ textAlign: "center", color: "#64748B", padding: "30px" }}>Loading payslips...</td>
                                        </tr>
                                    ) : payrolls.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", color: "#64748B", padding: "30px" }}>No payroll items found for your account.</td>
                                        </tr>
                                    ) : (
                                        payrolls.map((pay) => {
                                            const totalAllowances = (pay.allowance || 0) + (pay.bonus || 0);
                                            const totalDeductions = (pay.deductions || 0) + (pay.tax || 0);
                                            const isPaid = pay.paymentStatus === "Paid";

                                            return (
                                                <tr key={pay._id} className="employee-row">
                                                    <td style={{ fontWeight: "700", color: "#172033" }}>
                                                        {pay.month} {pay.year}
                                                    </td>
                                                    <td className="table-number-col" style={{ color: "#172033" }}>
                                                        {formatCurrency(pay.basicSalary)}
                                                    </td>
                                                    <td className="table-number-col" style={{ color: "#087F72" }}>
                                                        + {formatCurrency(totalAllowances)}
                                                    </td>
                                                    <td className="table-number-col" style={{ color: "#DC2626" }}>
                                                        - {formatCurrency(totalDeductions)}
                                                    </td>
                                                    <td className="table-number-col" style={{ fontWeight: "700", color: "#087F72" }}>
                                                        {formatCurrency(pay.netSalary)}
                                                    </td>
                                                    <td className="table-center-col">
                                                        <span
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                padding: "4px 10px",
                                                                borderRadius: "8px",
                                                                fontSize: "12px",
                                                                fontWeight: "700",
                                                                backgroundColor: isPaid ? "#E8F8F3" : "#FFF1D6",
                                                                color: isPaid ? "#087F72" : "#B45309",
                                                                border: isPaid ? "1px solid #D5F2E9" : "1px solid #FDE7C0"
                                                            }}
                                                        >
                                                            {pay.paymentStatus || "Paid"}
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

            <FooterNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}
