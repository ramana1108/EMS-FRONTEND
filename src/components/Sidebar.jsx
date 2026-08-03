import React from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Award,
    Users,
    Fingerprint,
    Clock,
    CalendarDays,
    Wallet,
    Megaphone,
    Briefcase,
    LogOut,
    X
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, permission: "dashboard", path: "/admin/dashboard" },
    { name: "Departments", icon: Building2, permission: "department", path: "/admin/departments" },
    { name: "Designations", icon: Award, permission: "designation", path: "/admin/designations" },
    { name: "Employees", icon: Users, permission: "employee", path: "/admin/employee" },
    { name: "Roles", icon: Fingerprint, permission: "role", path: "/admin/roles" },
    { name: "Attendance", icon: Clock, permission: "attendance", path: "/admin/attendance" },
    { name: "Payroll", icon: Wallet, permission: "payroll", path: "/admin/payroll" },
    { name: "Notices", icon: Megaphone, permission: "notice", path: "/admin/notices" },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const userName = user.name || "User";
    const userRole = user.role || "ADMIN";
    const roleName = typeof user.role === "string"
        ? user.role.trim().toLowerCase()
        : typeof user.role === "object" && user.role !== null && user.role.name
            ? String(user.role.name).trim().toLowerCase()
            : "";
    const rawPermissions = Array.isArray(user.permissions)
        ? user.permissions
        : typeof user.permissions === "string"
            ? user.permissions.split(",").map((perm) => perm.trim()).filter(Boolean)
            : [];
    const defaultPermissions = roleName === "admin"
        ? menuItems.map((item) => item.permission)
        : roleName === "hr"
            ? ["dashboard", "department", "designation", "employee", "attendance", "payroll", "notice"]
            : roleName === "manager"
                ? ["dashboard", "employee", "attendance", "notice"]
                : roleName === "employee"
                    ? ["dashboard", "attendance", "notice"]
                    : ["dashboard"];
    const permissions = rawPermissions.length > 0 ? rawPermissions : defaultPermissions;
    const visibleMenuItems = menuItems.filter((item) => item.permission ? permissions.includes(item.permission) : true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-45 bg-[#022c22]/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-gradient-to-b from-[#064E3B] to-[#022C22] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-[#065F46]/50 shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="h-[72px] px-6 border-b border-[#065f46]/40 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                            <Briefcase size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">EMS Portal</span>
                    </div>
                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-emerald-800/30 rounded-lg text-emerald-300 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-800/40">
                    {visibleMenuItems.length === 0 ? (
                        <div className="rounded-2xl border border-emerald-800/20 bg-emerald-950/10 p-4 text-sm text-emerald-100">
                            You do not have permissions for any menu items.
                        </div>
                    ) : visibleMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.name;

                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setActiveTab(item.name);
                                    navigate(item.path);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 relative group ${isActive
                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-950/20"
                                    : "text-emerald-100/70 hover:bg-[#065F46]/30 hover:text-white"
                                    }`}
                            >
                                {/* Glow ring on active */}
                                {isActive && (
                                    <span className="absolute -left-1.5 top-1/4 bottom-1/4 w-1 bg-emerald-300 rounded-full" />
                                )}
                                <Icon
                                    size={18}
                                    className={`transition-colors duration-150-all ${isActive ? "text-white" : "text-emerald-300/60 group-hover:text-emerald-200"
                                        }`}
                                />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Bottom Widget: Employees by Department */}
                <div className="px-5 py-4 bg-[#033B2B]/40 border-t border-[#065f46]/40 text-left">
                    <p className="text-[10px] font-bold tracking-wider text-emerald-300/60 uppercase mb-2.5">
                        Employees by Dept
                    </p>
                    <div className="space-y-1.5">
                        {[
                            { name: "Production", color: "bg-[#065F46]", val: "83" },
                            { name: "Sales", color: "bg-[#059669]", val: "50" },
                            { name: "IT", color: "bg-[#34D399]", val: "50" },
                            { name: "HR/Admin", color: "bg-[#0D9488]", val: "25" },
                        ].map((d) => (
                            <div key={d.name} className="flex items-center justify-between text-xs text-emerald-100/80">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${d.color}`} />
                                    <span className="font-semibold">{d.name}</span>
                                </div>
                                <span className="font-mono font-bold opacity-75">{d.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer Profile */}
                <div className="p-4 border-t border-[#065f46]/40 bg-[#033B2B]/60 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">{getInitials(userName)}</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{userName}</p>
                            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest leading-none mt-0.5">{userRole}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Log Out"
                        className="p-2 hover:bg-emerald-800/30 rounded-xl text-emerald-300 hover:text-white transition-colors"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
}
