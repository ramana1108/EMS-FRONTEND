import React, { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ activeTab, setActiveTab, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px]">
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/10"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">Admin Dashboard</div>
                </div>

                <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
