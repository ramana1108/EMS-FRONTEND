import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Megaphone, Calendar, Shield, Plus, X, FileText } from "lucide-react";

const catClasses = {
    "Urgent": "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40",
    "Holiday": "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60",
    "Event": "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40",
    "Policy": "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
};

const getIcon = (cat) => {
    switch (cat) {
        case "Urgent": return Bell;
        case "Holiday": return Calendar;
        case "Event": return Megaphone;
        default: return Shield;
    }
};

const defaultNotices = [
    {
        _id: "1",
        title: "Payroll Processing Date",
        description: "Monthly payroll processing will begin on 26th Aug. Ensure all timesheets are approved.",
        category: "Urgent",
        date: "1hr ago"
    },
    {
        _id: "2",
        title: "Independence Day Holiday",
        description: "The office will remain closed on August 15th in observance of Independence Day.",
        category: "Holiday",
        date: "Yesterday"
    },
    {
        _id: "3",
        title: "Quarterly Review Meeting",
        description: "All hands meeting scheduled at 3:00 PM for the Q2 updates and performance evaluations.",
        category: "Event",
        date: "2 days ago"
    },
    {
        _id: "4",
        title: "New HR Remote Policy",
        description: "Please review the updated remote work and leave policy document shared on corporate EMS.",
        category: "Policy",
        date: "1 week ago"
    }
];

export default function NoticesTab() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    // Form inputs
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("Policy");
    const [error, setError] = useState("");

    const API_URL = "http://localhost:5000/api/notices";

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setNotices(data);
                localStorage.setItem("ems_notices", JSON.stringify(data));
            } else {
                throw new Error("HTTP error " + res.status);
            }
        } catch (err) {
            console.warn("Backend API notices not reachable, using fallback:", err);
            const local = localStorage.getItem("ems_notices");
            if (local) {
                setNotices(JSON.parse(local));
            } else {
                setNotices(defaultNotices);
                localStorage.setItem("ems_notices", JSON.stringify(defaultNotices));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title || !desc) {
            setError("Both title and notice content are required.");
            return;
        }

        const newNoticeData = {
            title,
            description: desc,
            category,
            date: "Just now"
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newNoticeData)
            });
            if (!res.ok) throw new Error("Insert failed");
            setIsPublishing(false);
            fetchNotices();
            setTitle("");
            setDesc("");
        } catch (err) {
            console.warn("API write notice failed, working locally:", err);
            const nextNotice = {
                _id: String(notices.length + 1),
                ...newNoticeData
            };
            const updated = [nextNotice, ...notices];
            setNotices(updated);
            localStorage.setItem("ems_notices", JSON.stringify(updated));
            setIsPublishing(false);
            setTitle("");
            setDesc("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Company Announcements</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Coordinate corporate notifications, policy updates, and holiday plans.</p>
                </div>

                <button
                    onClick={() => { setError(""); setIsPublishing(true); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all duration-200 text-sm"
                >
                    <Plus size={16} />
                    <span>Publish Announcement</span>
                </button>
            </div>

            {/* Timeline List of Notices */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-950/[0.015] space-y-6">
                {loading ? (
                    <div className="py-12 text-center text-slate-555">Loading announcements...</div>
                ) : notices.length === 0 ? (
                    <div className="py-12 text-center text-slate-555">No announcements listed.</div>
                ) : (
                    <div className="space-y-6">
                        {notices.map((notice, index) => {
                            const IconComp = getIcon(notice.category);
                            return (
                                <div key={notice._id || index} className="group">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform duration-200">
                                            <IconComp size={18} className="stroke-[2]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2.5">
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                                        {notice.title}
                                                    </h3>
                                                    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border mt-1.5 ${catClasses[notice.category] || catClasses["Policy"]}`}>
                                                        {notice.category}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-450 dark:text-slate-500 whitespace-nowrap font-bold font-mono">{notice.date}</span>
                                            </div>
                                            <p className="text-xs text-slate-555 dark:text-slate-400 mt-2.5 leading-relaxed">
                                                {notice.description}
                                            </p>
                                        </div>
                                    </div>
                                    {index < notices.length - 1 && (
                                        <div className="h-px bg-slate-100 dark:bg-slate-800/40 my-5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Publisher Modal Form */}
            <AnimatePresence>
                {isPublishing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                            onClick={() => setIsPublishing(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 text-left animate-in"
                        >
                            <div className="px-6 py-4.5 border-b border-slate-105 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="text-emerald-500" size={20} />
                                    <span>Publish Announcement</span>
                                </h3>
                                <button
                                    onClick={() => setIsPublishing(false)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-750 dark:text-red-300 rounded-xl text-xs font-black">
                                        {error}
                                    </div>
                                )}

                                {/* Notice Title */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Announcement Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Annual Budget Audit Scheduled"
                                        className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100"
                                    />
                                </div>

                                {/* Announcement Category select */}
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Topic Categorization</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 cursor-pointer transition-colors dark:text-slate-100"
                                    >
                                        <option value="Urgent" className="dark:bg-slate-900">Urgent Notification</option>
                                        <option value="Policy" className="dark:bg-slate-900">Policy Update</option>
                                        <option value="Holiday" className="dark:bg-slate-900">Holiday Closure</option>
                                        <option value="Event" className="dark:bg-slate-900">Corporate Event</option>
                                    </select>
                                </div>

                                {/* Announcement Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Notice Content Details</label>
                                    <textarea
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        rows={4}
                                        placeholder="Write description content of your company update..."
                                        className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100 resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsPublishing(false)}
                                        className="px-5 py-2.5 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-black uppercase text-slate-650 dark:text-slate-350"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all text-xs uppercase"
                                    >
                                        Disseminate Notice
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
