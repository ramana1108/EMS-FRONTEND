import React from "react";
import Header from "./Header";
import FooterNavigation from "./FooterNavigation";

export default function AdminLayout({ activeTab, setActiveTab, children }) {
    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-[#172033] flex flex-col">
            <Header />

            <main className="flex-1 px-4 py-6 sm:px-8 lg:px-10 w-full max-w-full overflow-x-hidden" style={{ backgroundColor: "#F8FAFC", paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}>
                {children}
            </main>

            <FooterNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}
