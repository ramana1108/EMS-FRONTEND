import { useState, useEffect } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
import { Megaphone, Plus, Calendar, User, Trash2, AlertCircle } from "lucide-react";

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [postedBy, setPostedBy] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    function getHeaders() {
        const token = localStorage.getItem("token");
        return token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    }

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/employees`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setEmployees(data.employees || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notices`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setNotices(data.notices || []);
            } else {
                setError(data.message || "Failed to fetch notices");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch notices from database");
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchNotices(), fetchEmployees()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddNotice = async (e) => {
        e.preventDefault();
        if (!title || !description || !postedBy) {
            setError("Title, Description, and Author (Posted By) are required");
            return;
        }
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/notices`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    postedBy,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Notice published successfully!");
                setTitle("");
                setDescription("");
                setPostedBy("");
                fetchNotices();
            } else {
                setError(data.message || "Failed to publish notice");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while publishing notice");
        }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Notice deleted successfully!");
                fetchNotices();
            } else {
                setError(data.message || "Failed to delete notice");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete notice");
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold">Announcements & Notices</h1>
                    <p className="text-sm text-slate-600">Broadcasting corporate announcements and regulatory notifications.</p>
                </div>
            </div>

            {/* Stats Widget */}
            <div className="stats-grid mb-6">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box bg-sky-600">
                            <Megaphone size={20} color="#ffffff" />
                        </div>
                        <div>
                            <p className="stat-label">Total Notices</p>
                            <p className="stat-value">{notices.length}</p>
                        </div>
                    </div>
                    <p className="stat-description">Currently active in employee boards</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-md mb-5"><AlertCircle size={16} /><span>{error}</span></div>
            )}

            {success && (
                <div className="text-emerald-800 bg-emerald-50 p-3 rounded-md mb-5">{success}</div>
            )}

            {/* Main Split Layout */}
            <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">

                {/* Notice Feed */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-5">Active Notices Feed</h2>

                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <p className="text-center text-slate-500">Loading announcements feed...</p>
                        ) : notices.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No corporate notices published yet.</p>
                        ) : (
                            notices.map((notice) => (
                                <div key={notice._id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="m-0 text-base font-semibold text-slate-900">{notice.title}</h3>
                                        <button onClick={() => handleDeleteNotice(notice._id)} title="Delete Announcement" className="text-rose-600 hover:text-rose-800 p-1 rounded-md">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-6 mb-3 whitespace-pre-line">{notice.description}</p>

                                    <div className="flex flex-wrap justify-between items-center border-t border-slate-200 pt-3 text-sm text-slate-500 font-semibold">
                                        <div className="flex items-center gap-2"><User size={14} color="#0d9488" /><span>{notice.postedBy?.employeeName || "System Administrator"} ({notice.postedBy?.employeeId || "N/A"})</span></div>
                                        <div className="flex items-center gap-2"><Calendar size={14} /><span>{formatDate(notice.createdAt)}</span></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Publish Notice Form */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Publish Notice</h2>
                    <form onSubmit={handleAddNotice}>
                        <div className="mb-3">
                            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Notice Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Town Hall Meeting Scheduled" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm" />
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Description Detail</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write announcements details here..." className="w-full px-3 py-2 rounded-md border border-slate-300 min-h-[100px] text-sm resize-vertical" />
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Author / Posted By</label>
                            <select value={postedBy} onChange={(e) => setPostedBy(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm">
                                <option value="">Select Authoring Employee...</option>
                                {employees.map((emp) => (<option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>))}
                            </select>
                        </div>

                        <button type="submit" className="w-full py-2 rounded-md bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2">
                            <Plus size={16} />
                            <span>Publish notice</span>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
