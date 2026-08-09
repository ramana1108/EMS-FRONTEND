import React, { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ activeTab, setActiveTab, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px]">
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-xl lg:hidden">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Admin Portal</div>
                </div>

                <main className="min-h-screen px-4 py-8 sm:px-8 lg:px-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
