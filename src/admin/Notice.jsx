import { useState, useEffect } from "react";
import "../App.css";
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

    const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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
                    <h1 className="dashboard-title">Announcements & Notices</h1>
                    <p className="dashboard-subtitle">Broadcasting corporate announcements and regulatory notifications.</p>
                </div>
            </div>

            {/* Stats Widget */}
            <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box depts-icon" style={{ backgroundColor: "#0284c7" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b91c1c", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div style={{ color: "#065f46", backgroundColor: "#ecfdf5", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    {success}
                </div>
            )}

            {/* Main Split Layout */}
            <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>

                {/* Notice Feed */}
                <div className="employee-directory-card" style={{ padding: "24px" }}>
                    <h2 className="emp-card-title" style={{ marginBottom: "20px" }}>Active Notices Feed</h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {loading ? (
                            <p style={{ textAlign: "center", color: "#64748b" }}>Loading announcements feed...</p>
                        ) : notices.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>No corporate notices published yet.</p>
                        ) : (
                            notices.map((notice) => (
                                <div
                                    key={notice._id}
                                    style={{
                                        padding: "20px",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        position: "relative",
                                        backgroundColor: "#f8fafc",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                                            {notice.title}
                                        </h3>
                                        <button
                                            onClick={() => handleDeleteNotice(notice._id)}
                                            style={{
                                                border: "none",
                                                background: "none",
                                                cursor: "pointer",
                                                color: "#ef4444",
                                                padding: "4px",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center"
                                            }}
                                            title="Delete Announcement"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0", whiteSpace: "pre-line" }}>
                                        {notice.description}
                                    </p>

                                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #cbd5e1", paddingTop: "12px", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <User size={14} color="#0d9488" />
                                            <span>{notice.postedBy?.employeeName || "System Administrator"} ({notice.postedBy?.employeeId || "N/A"})</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Calendar size={14} />
                                            <span>{formatDate(notice.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Publish Notice Form */}
                <div className="emp-card-box" style={{ padding: "24px" }}>
                    <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Publish Notice</h2>
                    <form onSubmit={handleAddNotice}>
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Notice Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                                placeholder="e.g. Town Hall Meeting Scheduled"
                            />
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Description Detail</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "100px", outline: "none", resize: "vertical", fontSize: "14px" }}
                                placeholder="Write announcements details here..."
                            />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Author / Posted By</label>
                            <select
                                value={postedBy}
                                onChange={(e) => setPostedBy(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", outline: "none", fontSize: "14px" }}
                            >
                                <option value="">Select Authoring Employee...</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            style={{ width: "100%", padding: "10px", backgroundColor: "#065f46", color: "#ffffff", outline: "none", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >
                            <Plus size={16} />
                            <span>Publish notice</span>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
