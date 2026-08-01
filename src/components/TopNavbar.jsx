import React, { useState } from "react";
import { Search, Bell, MessageSquare, Menu, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopNavbar({ onMenuClick }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    // Highlight date as of current time (from user context)
    const formatDate = () => {
        // Current date from user context: Aug 1, 2026
        const options = { weekday: "long", year: "numeric", month: "short", day: "numeric" };
        return new Date("2026-08-01").toLocaleDateString("en-US", options);
    };

    return (
        <header className="h-[72px] bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 flex items-center justify-between sticky top-0 z-40">
            {/* Left Area (Hamburger for mobile/tablet + Search bar) */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-350 transition-colors"
                    title="Toggle Navigation Menu"
                >
                    <Menu size={20} />
                </button>

                <div className="relative max-w-sm w-full hidden md:block">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search employee, ID or dept..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 rounded-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-600/10 transition-all font-semibold"
                    />
                </div>
            </div>

            {/* Right Area (Date, Notifications, Messages, Profile Dropdown) */}
            <div className="flex items-center gap-4.5">
                {/* Current Date Display */}
                <span className="hidden lg:block text-xs font-bold text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                    {formatDate()}
                </span>

                {/* Action Widgets */}
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 relative transition-colors">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 relative transition-colors">
                        <MessageSquare size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
                    </button>
                </div>

                {/* Accent divider */}
                <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group"
                    >
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80"
                                alt="Admin Avatar Icon"
                                className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200/80 dark:border-slate-700/60"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
                        </div>
                        <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
                    </button>

                    {/* Profile Dropdown Panel */}
                    {dropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-45"
                                onClick={() => setDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2.5 w-48 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50 text-left transition-all">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">Prasanna Ramana</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate leading-none mt-1">admin@gmail.com</p>
                                </div>
                                <button
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <User size={14} />
                                    <span>My Profile</span>
                                </button>
                                <button
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Settings size={14} />
                                    <span>Settings</span>
                                </button>
                                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800/60" />
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate("/");
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                >
                                    <LogOut size={14} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
