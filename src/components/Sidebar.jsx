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
    { name: "Settings", icon: Briefcase, permission: "settings", path: "/admin/settings" },
];

const employeeMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
    { name: "Leave Management", icon: CalendarDays, permission: "leave", path: "/employee/leave" },
    { name: "Attendance", icon: Clock, permission: "attendance", path: "/employee/attendance" },
    { name: "Payrolls", icon: Wallet, permission: "payroll", path: "/employee/payroll" },
    { name: "Announcements", icon: Megaphone, permission: "notice", path: "/employee/announcements" },
    { name: "Profile", icon: Users, path: "/employee/profile" },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const userName = user.name || "User";

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
        : roleName === "employee"
            ? ["dashboard", "leave", "attendance", "payroll", "notice"]
            : ["dashboard"];
    const permissions = rawPermissions.length > 0 ? rawPermissions : defaultPermissions;
    const userRole = String(user.role || "ADMIN").toLowerCase();

    const isEmployeeRole = ["employee"].includes(userRole);
    const visibleMenuItems = isEmployeeRole
        ? (permissions.length === 0
            ? employeeMenuItems
            : employeeMenuItems.filter((item) => !item.permission || permissions.includes(item.permission)))
        : (permissions.length === 0
            ? menuItems
            : menuItems.filter((item) => !item.permission || permissions.includes(item.permission)));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const getInitials = (name) => {
        if (!name) return "A";
        const parts = name.trim().split(/\s+/);
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#090d16]/75 backdrop-blur-md lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-50 sidebar transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="h-[72px] px-6 border-b border-[#132A46] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#1E3A8A]/60 rounded-xl border border-[#3B82F6]/40 text-[#60A5FA] shadow-xs">
                            <Building2 size={18} />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-white uppercase tracking-wider">EMS PORTAL</span>
                    </div>
                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 hover:bg-[#132A46] rounded-xl text-[#94A3B8] hover:text-white transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-none">
                    {visibleMenuItems.length === 0 ? (
                        <div className="rounded-2xl border border-[#334155] bg-[#172A3D] p-4 text-xs font-semibold text-[#94A3B8]">
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
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative group cursor-pointer ${isActive
                                    ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/20"
                                    : "text-[#94A3B8] hover:bg-[#132A46] hover:text-white"
                                    }`}
                            >
                                {/* Glow ring on active */}
                                {isActive && (
                                    <span className="absolute -left-1.5 top-1/4 bottom-1/4 w-1 bg-[#3B82F6] rounded-full shadow-lg" />
                                )}
                                <Icon
                                    size={18}
                                    className={`transition-colors duration-200 ${isActive ? "text-white" : "text-[#94A3B8] group-hover:text-white"
                                        }`}
                                />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer Profile */}
                <div className="p-4 border-t border-[#173A5E] bg-[#0F2742] flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#2563EB] border border-[#3B82F6]/30 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-xs font-extrabold text-white">{getInitials(userName)}</span>
                        </div>
                        <div>
                            <p className="text-xs font-extrabold text-white line-clamp-1">{userName}</p>
                            <p className="text-[9px] font-extrabold text-[#60A5FA] uppercase tracking-widest leading-none mt-1">{userRole}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Log Out"
                        className="p-2 hover:bg-[#173A5E] rounded-xl text-[#A9B8C8] hover:text-white transition-all cursor-pointer"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
}