import React, { useState, useEffect } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
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
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden min-h-[60px]">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm border-0 cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 w-[320px]">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-none outline-none bg-transparent w-full text-sm text-black"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 font-bold text-black">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                            {getInitials(user?.name || "Akshaya Mehta")}
                        </div>
                        <span>{user?.name || "Akshaya Mehta"}</span>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 px-2">
                    <div className="page-header flex justify-between items-center mb-2">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 m-0">Announcements</h1>
                            <p className="text-sm text-slate-500 mt-1">Stay updated with company news and announcements</p>
                        </div>
                    </div>

                    {/* Search/Filters Row (matches the screenshot placement) */}
                    <div className="flex gap-3 my-6 flex-wrap">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
                            <Search size={16} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-none outline-none text-sm text-black w-[200px]"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 min-w-[120px]">
                            <Filter size={16} color="#64748b" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="border-none outline-none bg-transparent text-sm font-bold text-slate-900 w-full cursor-pointer"
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
                    <div className="p-8 bg-white rounded-xl border border-slate-200">
                        <div className="flex flex-col gap-5">
                            {loading ? (
                                <div className="text-center text-slate-500 p-10">Loading announcements...</div>
                            ) : filteredNotices.length === 0 ? (
                                <div className="text-center text-slate-500 p-10">No announcements found matching the criteria.</div>
                            ) : (
                                filteredNotices.map((notice) => {
                                    const meta = getAnnouncementMeta(notice.title || "");
                                    const IconComponent = meta.icon;

                                    return (
                                        <div
                                            key={notice._id}
                                            className="flex items-start gap-4 p-5 rounded-lg bg-white border border-slate-200 transition-shadow"
                                        >
                                            {/* Left Icon Pill */}
                                            <div
                                                className="flex items-center justify-center h-11 w-11 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: meta.bgColor, color: meta.color }}
                                            >
                                                <IconComponent size={20} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-slate-900 m-0">
                                                    {notice.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                    {notice.description}
                                                </p>
                                            </div>

                                            {/* Right Meta Column */}
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <span
                                                    className="px-2 py-1 rounded-md text-xs font-semibold"
                                                    style={{ backgroundColor: meta.bgColor, color: meta.textColor, border: `1px solid ${meta.borderColor}` }}
                                                >
                                                    {meta.category}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-500">
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
