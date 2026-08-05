import React, { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import {
    Search,
    Megaphone,
    Building,
    Shield,
    Users,
    Home,
    UserPlus,
    Filter,
    Menu
} from "lucide-react";
import api from "../api";

export default function Announcements() {
    const [activeTab, setActiveTab] = useState("Announcements");
    const [isOpen, setIsOpen] = useState(false);
    const [notices, setNotices] = useState([]);
    const [filteredNotices, setFilteredNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(loggedInUser);

        const loadNotices = async () => {
            setLoading(true);
            try {
                const res = await api.getNotices();
                if (res?.notices && Array.isArray(res.notices)) {
                    setNotices(res.notices);
                    setFilteredNotices(res.notices);
                } else if (Array.isArray(res)) {
                    setNotices(res);
                    setFilteredNotices(res);
                }
            } catch (err) {
                console.error("Failed to load notices:", err);
            } finally {
                setLoading(false);
            }
        };
        loadNotices();
    }, []);

    const getAnnouncementMeta = (title) => {
        const t = title.toLowerCase();
        if (t.includes("office") || t.includes("closed") || t.includes("holiday")) {
            return {
                category: "Company News",
                color: "#2563eb",
                bgColor: "#eff6ff",
                textColor: "#1d4ed8",
                borderColor: "#bfdbfe",
                icon: Building,
            };
        } else if (t.includes("health") || t.includes("insurance") || t.includes("policy")) {
            return {
                category: "Policies",
                color: "#7c3aed",
                bgColor: "#f3e8ff",
                textColor: "#6d28d9",
                borderColor: "#e9d5ff",
                icon: Shield,
            };
        } else if (t.includes("outing") || t.includes("team") || t.includes("event") || t.includes("party")) {
            return {
                category: "Events",
                color: "#059669",
                bgColor: "#ecfdf5",
                textColor: "#047857",
                borderColor: "#a7f3d0",
                icon: Users,
            };
        } else if (t.includes("home") || t.includes("wfh") || t.includes("remote") || t.includes("work")) {
            return {
                category: "General",
                color: "#4b5563",
                bgColor: "#f3f4f6",
                textColor: "#374151",
                borderColor: "#e5e7eb",
                icon: Home,
            };
        } else if (t.includes("join") || t.includes("welcome") || t.includes("new")) {
            return {
                category: "Company News",
                color: "#db2777",
                bgColor: "#fdf2f8",
                textColor: "#be185d",
                borderColor: "#fbcfe8",
                icon: UserPlus,
            };
        } else {
            return {
                category: "General",
                color: "#0d9488",
                bgColor: "#f0fdfa",
                textColor: "#0f766e",
                borderColor: "#ccfbf1",
                icon: Megaphone,
            };
        }
    };

    useEffect(() => {
        let result = notices;

        if (searchTerm) {
            result = result.filter(
                (n) =>
                    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    n.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== "All") {
            result = result.filter((n) => {
                const meta = getAnnouncementMeta(n.title || "");
                return meta.category === categoryFilter;
            });
        }

        setFilteredNotices(result);
    }, [searchTerm, categoryFilter, notices]);

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ minHeight: "60px" }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#043e30] text-white shadow-sm shadow-[#043e30]/10"
                        style={{ border: "none", cursor: "pointer" }}
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="emp-top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 10px" }}>
                    <div className="emp-search-box" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "10px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", width: "320px" }}>
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="emp-search-input"
                            style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "14px", color: "#000000" }}
                        />
                    </div>

                    <div className="emp-user-profile-badge" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "6px 14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#000000" }}>
                        <div className="emp-avatar-circle" style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#043e30", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                            {getInitials(user?.name || "Akshaya Mehta")}
                        </div>
                        <span>{user?.name || "Akshaya Mehta"}</span>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "0 10px" }}>
                    <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div>
                            <h1 className="dashboard-title" style={{ fontSize: "32px", fontWeight: "800", color: "#000000", margin: 0 }}>Announcements</h1>
                            <p className="dashboard-subtitle" style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Stay updated with company news and announcements</p>
                        </div>
                    </div>

                    {/* Search/Filters Row (matches the screenshot placement) */}
                    <div style={{ display: "flex", gap: "12px", margin: "24px 0 16px 0", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "8px 16px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                            <Search size={16} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: "none", outline: "none", fontSize: "13px", color: "#000000", width: "200px" }}
                            />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "8px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", minWidth: "120px" }}>
                            <Filter size={16} color="#64748b" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "13px", fontWeight: "700", color: "#0f172a", width: "100%", cursor: "pointer" }}
                            >
                                <option value="All">All</option>
                                <option value="Company News">Company News</option>
                                <option value="Policies">Policies</option>
                                <option value="Events">Events</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                    </div>

                    {/* List display */}
                    <div className="emp-card-box" style={{ padding: "32px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <div className="announcement-list" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {loading ? (
                                <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Loading announcements...</div>
                            ) : filteredNotices.length === 0 ? (
                                <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>No announcements found matching the criteria.</div>
                            ) : (
                                filteredNotices.map((notice) => {
                                    const meta = getAnnouncementMeta(notice.title || "");
                                    const IconComponent = meta.icon;

                                    return (
                                        <div
                                            key={notice._id}
                                            className="announcement-item"
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: "16px",
                                                padding: "20px",
                                                borderRadius: "12px",
                                                backgroundColor: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                transition: "box-shadow 0.2s"
                                            }}
                                        >
                                            {/* Left Icon Pill */}
                                            <div
                                                className="announcement-icon"
                                                style={{
                                                    backgroundColor: meta.bgColor,
                                                    color: meta.color,
                                                    padding: "12px",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    height: "44px",
                                                    width: "44px",
                                                    flexShrink: 0
                                                }}
                                            >
                                                <IconComponent size={20} />
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1 }}>
                                                <h3 className="announcement-title" style={{ fontSize: "16px", fontWeight: "700", color: "#000000", margin: "0" }}>
                                                    {notice.title}
                                                </h3>
                                                <p className="announcement-desc" style={{ fontSize: "14px", color: "#475569", margin: "6px 0 0 0", lineHeight: "1.5" }}>
                                                    {notice.description}
                                                </p>
                                            </div>

                                            {/* Right Meta Column */}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                                                <span
                                                    className="employee-status-badge"
                                                    style={{
                                                        backgroundColor: meta.bgColor,
                                                        color: meta.textColor,
                                                        border: `1px solid ${meta.borderColor}`,
                                                        padding: "4px 10px",
                                                        borderRadius: "8px",
                                                        fontSize: "11px",
                                                        fontWeight: "700"
                                                    }}
                                                >
                                                    {meta.category}
                                                </span>
                                                <span className="announcement-date" style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                                                    {formatDate(notice.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
