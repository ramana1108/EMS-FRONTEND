import React, { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ activeTab, setActiveTab, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-[#172033] transition-colors duration-300">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] w-full max-w-full overflow-x-hidden min-h-screen flex flex-col">
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E2E8F0] bg-white/90 px-4 sm:px-6 py-3.5 backdrop-blur-xl lg:hidden">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md transition-all cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-bold text-[#172033] uppercase tracking-wider">Admin Portal</div>
                </div>

                <main className="flex-1 px-4 py-6 sm:px-8 lg:px-10 w-full max-w-full overflow-x-hidden" style={{ backgroundColor: "#F8FAFC" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
