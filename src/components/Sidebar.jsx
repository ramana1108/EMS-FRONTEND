import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    { name: "Dashboard", icon: LayoutDashboard, permission: "dashboard", path: "/employee/dashboard" },
    { name: "Leave Management", icon: CalendarDays, permission: "leave", path: "/employee/leave" },
    { name: "Attendance", icon: Clock, permission: "attendance", path: "/employee/attendance" },
    { name: "Payrolls", icon: Wallet, permission: "payroll", path: "/employee/payroll" },
    { name: "Announcements", icon: Megaphone, permission: "notice", path: "/employee/announcements" },
    { name: "Profile", icon: Users, permission: "profile", path: "/employee/profile" },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const userName = user.name || "User";

    // user.role can be a plain string or a populated role object ({ name: "..." })
    // depending on which endpoint hydrated it, so handle both shapes.
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

    const userRole = roleName || String(user.role || "admin").trim().toLowerCase();

    // Role-based defaults when explicit permissions are absent.
    const rolePermissionMap = {
        admin: menuItems.map((i) => i.permission).filter(Boolean),
        employee: ["dashboard", "attendance", "notice", "leave", "payroll", "profile"],
    };

    const effectivePermissions = rawPermissions.length > 0
        ? (userRole === "admin"
            ? Array.from(new Set([...rawPermissions.map((perm) => String(perm).toLowerCase()), ...rolePermissionMap.admin]))
            : Array.from(new Set(rawPermissions.map((perm) => String(perm).toLowerCase())))
          )
        : (rolePermissionMap[userRole] || ["dashboard"]);

    const useEmployeeMenu = ["employee"].includes(userRole);
    const sidebarItems = useEmployeeMenu ? employeeMenuItems : menuItems;
    const visibleMenuItems = sidebarItems.filter((item) =>
        !item.permission || effectivePermissions.includes(item.permission)
    );

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
                <div className="h-[72px] px-6 border-b border-emerald-950/30 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 shadow-inner">
                            <Briefcase size={18} />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-white uppercase tracking-wider">EMS PORTAL</span>
                    </div>
                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 hover:bg-emerald-800/15 rounded-xl text-emerald-300 hover:text-white transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-none">
                    {visibleMenuItems.length === 0 ? (
                        <div className="rounded-2xl border border-emerald-950/20 bg-emerald-950/10 p-4 text-xs font-semibold text-emerald-200">
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
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/10"
                                    : "text-emerald-100/60 hover:bg-emerald-500/10 hover:text-white"
                                    }`}
                            >
                                {/* Glow ring on active */}
                                {isActive && (
                                    <span className="absolute -left-1.5 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-full shadow-lg" />
                                )}
                                <Icon
                                    size={18}
                                    className={`transition-colors duration-200 ${isActive ? "text-white" : "text-emerald-400 group-hover:text-emerald-300"
                                        }`}
                                />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Bottom Widget: Employees by Department */}
                <div className="px-5 py-4 bg-[#081512]/50 border-t border-emerald-950/30 text-left">
                    <p className="text-[10px] font-extrabold tracking-widest text-emerald-400/50 uppercase mb-3">
                        Employees by Dept
                    </p>
                    <div className="space-y-2">
                        {[
                            { name: "Production", color: "bg-emerald-500", val: "83" },
                            { name: "Sales", color: "bg-indigo-500", val: "50" },
                            { name: "IT", color: "bg-sky-400", val: "50" },
                            { name: "HR/Admin", color: "bg-rose-500", val: "25" },
                        ].map((d) => (
                            <div key={d.name} className="flex items-center justify-between text-xs text-emerald-100/70 font-semibold">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${d.color} shadow-sm`} />
                                    <span>{d.name}</span>
                                </div>
                                <span className="font-mono text-[10px] opacity-75">{d.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer Profile */}
                <div className="p-4 border-t border-emerald-950/30 bg-[#081512]/60 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-xs font-extrabold text-white">{getInitials(userName)}</span>
                        </div>
                        <div>
                            <p className="text-xs font-extrabold text-white line-clamp-1">{userName}</p>
                            <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest leading-none mt-1">{userRole}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Log Out"
                        className="p-2 hover:bg-emerald-800/15 rounded-xl text-emerald-300 hover:text-white transition-all cursor-pointer"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
}