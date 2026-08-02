import React, { useState } from "react";
import { Users, Building2, UserCheck, Wallet, Construction } from "lucide-react";

// Import components
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import NoticesCard from "../components/NoticesCard";
import QuickActions from "../components/QuickActions";
import ManagersCard from "../components/ManagersCard";
import AttendanceChart from "../components/AttendanceChart";
import DistributionChart from "../components/DistributionChart";
import RecentEmployeesTable from "../components/RecentEmployeesTable";

// Import new dynamic tabs
import EmployeesTab from "../components/EmployeesTab";
import DepartmentsTab from "../components/DepartmentsTab";
import DesignationsTab from "../components/DesignationsTab";
import RolesTab from "../components/RolesTab";
import AttendanceTab from "../components/AttendanceTab";
import LeaveTab from "../components/LeaveTab";
import PayrollTab from "../components/PayrollTab";
import NoticesTab from "../components/NoticesTab";
import ReportsTab from "../components/ReportsTab";
import SettingsTab from "../components/SettingsTab";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("Dashboard");

    // Sparkline data sets for each statistic card
    const sparkDataSets = [
        [
            { value: 185 },
            { value: 188 },
            { value: 192 },
            { value: 196 },
            { value: 200 },
            { value: 204 },
            { value: 208 }
        ],
        [
            { value: 12 },
            { value: 12 },
            { value: 12 },
            { value: 12 },
            { value: 13 },
            { value: 13 },
            { value: 13 }
        ],
        [
            { value: 170 },
            { value: 185 },
            { value: 178 },
            { value: 192 },
            { value: 180 },
            { value: 190 },
            { value: 186 }
        ],
        [
            { value: 8.5 },
            { value: 9.2 },
            { value: 9.8 },
            { value: 10.1 },
            { value: 10.3 },
            { value: 10.5 },
            { value: 10.65 }
        ]
    ];

    // Stats data configuration mapping
    const stats = [
        { title: "Total Employees", value: "208", trend: "+12 this month", icon: Users, sparkData: sparkDataSets[0] },
        { title: "Departments", value: "13", trend: "+1 new", icon: Building2, sparkData: sparkDataSets[1] },
        { title: "Present Today", value: "186", trend: "89% attendance", icon: UserCheck, sparkData: sparkDataSets[2] },
        { title: "Monthly Payroll", value: "₹10,65,000", trend: "Processed", icon: Wallet, sparkData: sparkDataSets[3] }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "Dashboard":
                return (
                    <div className="space-y-6 md:space-y-8">
                        {/* Row 1 - Statistic Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4.5 md:gap-6">
                            {stats.map((stat, idx) => (
                                <StatCard
                                    key={idx}
                                    index={idx}
                                    title={stat.title}
                                    value={stat.value}
                                    trend={stat.trend}
                                    icon={stat.icon}
                                    sparkData={stat.sparkData}
                                />
                            ))}
                        </div>

                        {/* Row 2 - Notices, Actions & Managers (3 Columns) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <NoticesCard />
                            <QuickActions />
                            <ManagersCard />
                        </div>

                        {/* Row 3 - Attendance Analytics (2/3) & Distribution (1/3) */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2">
                                <AttendanceChart />
                            </div>
                            <div className="xl:col-span-1">
                                <DistributionChart />
                            </div>
                        </div>

                        {/* Row 4 - Recent Employees Table */}
                        <RecentEmployeesTable />
                    </div>
                );
            case "Employees":
                return <EmployeesTab />;
            case "Departments":
                return <DepartmentsTab />;
            case "Designations":
                return <DesignationsTab />;
            case "Roles":
                return <RolesTab />;
            case "Attendance":
                return <AttendanceTab />;
            case "Leave Management":
                return <LeaveTab />;
            case "Payroll":
                return <PayrollTab />;
            case "Notices":
                return <NoticesTab />;
            case "Reports":
                return <ReportsTab />;
            case "Settings":
                return <SettingsTab />;
            default:
                return (
                    <div
                        key={activeTab}
                        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl p-10 text-center max-w-2xl mx-auto my-12 shadow-xl shadow-emerald-950/[0.01]"
                    >
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-955/40 text-[#059669] dark:text-[#10b981] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
                            <Construction size={32} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">{activeTab} Section</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6 font-medium">
                            The {activeTab.toLowerCase()} management features are currently being synchronized with the master API ERP layer.
                        </p>
                        <button
                            onClick={() => setActiveTab("Dashboard")}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all duration-200 text-xs tracking-wider uppercase"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                );
        }
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* Title Header */}
            {activeTab === "Dashboard" && (
                <div className="text-left mb-6.5">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                        Welcome back, Admin. Here is today's workforce overview.
                    </p>
                </div>
            )}

            {/* Main Page Area */}
            {renderContent()}
        </AdminLayout>
    );
}