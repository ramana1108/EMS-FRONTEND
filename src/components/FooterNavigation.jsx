import React, { useEffect, useRef } from "react";
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
    LogOut
} from "lucide-react";

const adminMenuItems = [
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
    { name: "Leave", icon: CalendarDays, permission: "leave", path: "/employee/leave" },
    { name: "Attendance", icon: Clock, permission: "attendance", path: "/employee/attendance" },
    { name: "Payrolls", icon: Wallet, permission: "payroll", path: "/employee/payroll" },
    { name: "Notices", icon: Megaphone, permission: "notice", path: "/employee/announcements" },
    { name: "Profile", icon: Users, path: "/employee/profile" },
];

export default function FooterNavigation({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const location = useLocation();
    const itemRefs = useRef({});

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
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
        ? adminMenuItems.map((item) => item.permission)
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
            ? adminMenuItems
            : adminMenuItems.filter((item) => !item.permission || permissions.includes(item.permission)));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const isPathActive = (item) => {
        if (activeTab && activeTab === item.name) return true;
        if (location.pathname === item.path) return true;
        if (item.path === "/admin/dashboard" && (location.pathname === "/dashboard" || location.pathname === "/admin")) return true;
        if (item.path === "/admin/departments" && location.pathname === "/departments") return true;
        if (item.path === "/admin/designations" && location.pathname === "/designations") return true;
        if (item.path === "/admin/employee" && location.pathname === "/employees") return true;
        if (item.path === "/admin/roles" && location.pathname === "/roles") return true;
        if (item.path === "/admin/attendance" && location.pathname === "/attendance") return true;
        if (item.path === "/admin/payroll" && location.pathname === "/payroll") return true;
        if (item.path === "/admin/notices" && location.pathname === "/notices") return true;
        if (item.path === "/admin/settings" && location.pathname === "/settings") return true;
        return false;
    };

    useEffect(() => {
        const activeItem = visibleMenuItems.find((item) => isPathActive(item));
        if (activeItem && itemRefs.current[activeItem.name]) {
            try {
                itemRefs.current[activeItem.name].scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                });
            } catch (err) {
                // Fallback for browsers that don't support smooth scrollIntoView options
                itemRefs.current[activeItem.name].scrollIntoView();
            }
        }
    }, [location.pathname, activeTab]);

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] py-2 sm:py-2.5 px-2 sm:px-4 w-full max-w-full flex items-center justify-center"
            style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))" }}
            aria-label="Bottom Navigation"
        >
            <div className="w-full max-w-full flex items-center justify-start sm:justify-center gap-1.5 sm:gap-3.5 md:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory touch-pan-x py-1 px-1 sm:px-2">
                {visibleMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isPathActive(item);

                    return (
                        <button
                            key={item.name}
                            ref={(el) => (itemRefs.current[item.name] = el)}
                            onClick={() => {
                                if (setActiveTab) setActiveTab(item.name);
                                navigate(item.path);
                            }}
                            className={`flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer snap-center shrink-0 min-w-[64px] sm:min-w-[74px] select-none ${
                                isActive
                                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 font-bold scale-[1.02]"
                                    : "text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] font-medium"
                            }`}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className="mb-0.5 sm:mb-1" />
                            <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">
                                {item.name}
                            </span>
                        </button>
                    );
                })}

                {/* Vertical Separator */}
                <div className="h-7 sm:h-8 w-[1px] bg-[#E2E8F0] mx-0.5 sm:mx-1 shrink-0" />

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer snap-center shrink-0 min-w-[64px] sm:min-w-[74px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold select-none"
                >
                    <LogOut size={18} strokeWidth={1.8} className="mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">
                        Logout
                    </span>
                </button>
            </div>
        </nav>
    );
}

