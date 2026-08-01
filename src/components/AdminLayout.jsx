import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function AdminLayout({ children, activeTab, setActiveTab }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b0f19] flex w-full">
            {/* Sidebar Panel */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            {/* Main Panel Content Container */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300">
                {/* Top Header Navbar */}
                <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Pane */}
                <main className="flex-1 p-6 md:p-8 max-w-[1450px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
