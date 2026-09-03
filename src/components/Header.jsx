import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Settings, ChevronRight } from "lucide-react";
import NotificationBell from "./NotificationBell";
import sapLogo from "../assets/image.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userName = user.name || user.firstName || "Admin";

  const isProfileOrSettings = 
    location.pathname.toLowerCase().includes("settings") || 
    location.pathname.toLowerCase().includes("profile");

  const getRoleText = (role) => {
    if (!role) return "ADMIN";
    if (typeof role === "string") return role.toUpperCase();
    if (typeof role === "object" && role.name) return String(role.name).toUpperCase();
    return "ADMIN";
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleProfileClick = () => {
    const roleStr = getRoleText(user?.role).toLowerCase();
    if (roleStr === "admin") {
      navigate("/admin/settings");
    } else {
      navigate("/employee/profile");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-2.5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4 transition-all">
      {/* EMS PORTAL Branding */}
      <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate("/")}>
        <img
          src={sapLogo}
          alt="SAP Logo"
          className="w-9 h-9 object-contain rounded-lg flex-shrink-0"
        />
        <span className="text-base sm:text-lg font-black tracking-tight text-[#0F172A] uppercase">
          SAP
        </span>
      </div>



      {/* Header Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationBell />

        <div className="h-6 w-[1px] bg-[#E2E8F0] mx-0.5 hidden sm:block" />

        {/* Interactive Profile Badge */}
        <button
          onClick={handleProfileClick}
          title="Click to manage Profile & Settings"
          className="group flex items-center gap-2.5 bg-gradient-to-r from-white via-slate-50 to-blue-50/40 hover:to-blue-100/50 border border-slate-200 hover:border-blue-300 p-1 pl-1.5 pr-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer active:scale-95 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2563EB] via-indigo-600 to-[#3B82F6] text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 flex-shrink-0 transition-all">
            {getInitials(userName)}
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-tight">
              {userName}
            </span>
            <span className="text-[9px] font-black text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full uppercase tracking-wider leading-none mt-0.5 w-fit">
              {getRoleText(user?.role)}
            </span>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
