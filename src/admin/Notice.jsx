import { useState, useEffect } from "react";
import Pagination from "../components/Pagination";
import { Megaphone, Plus, Calendar, User, Trash2, AlertCircle, X, Search } from "lucide-react";

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const filteredNotices = notices.filter(n => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        const titleText = (n.title || "").toLowerCase();
        const descText = (n.description || "").toLowerCase();
        const posterText = (n.postedBy || "").toLowerCase();
        return titleText.includes(q) || descText.includes(q) || posterText.includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(filteredNotices.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [notices]);

    // Modal Control State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [postedBy, setPostedBy] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ems-backend-zby7.onrender.com";

    function getHeaders() {
        const token = localStorage.getItem("token");
        return token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    }

    const customFetch = async (url, options = {}) => {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...getHeaders(),
                ...(options.headers || {})
            }
        });
        if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return res;
    };

    const fetchEmployees = async () => {
        try {
            const res = await customFetch(`${API_BASE_URL}/employees`);
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
            const res = await customFetch(`${API_BASE_URL}/notices`);
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
            const res = await customFetch(`${API_BASE_URL}/notices`, {
                method: "POST",
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
                setIsModalOpen(false);
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
            const res = await customFetch(`${API_BASE_URL}/notices/${id}`, {
                method: "DELETE",
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
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 className="dashboard-title">Announcements & Notices</h1>
                    <p className="dashboard-subtitle">Broadcasting corporate announcements and regulatory notifications.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <Search size={16} style={{ position: "absolute", left: "12px", color: "#64748b" }} />
                        <input
                            type="text"
                            placeholder="Search notices..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: "8px 14px 8px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "14px",
                                backgroundColor: "#ffffff",
                                color: "#0f172a",
                                outline: "none",
                                width: "220px"
                            }}
                        />
                    </div>
                    <button
                        className="btn-add-dept"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setIsModalOpen(true);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <Plus size={16} />
                        <span>Publish Notice</span>
                    </button>
                </div>
            </div>

            {/* Stats Widget */}
            <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card stat-card-green">
                    <div className="stat-header">
                        <div className="stat-icon-box depts-icon">
                            <Megaphone size={20} />
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

            {/* Full-width Layout */}
            <div className="w-full">
                {/* Notice Feed */}
                <div className="employee-directory-card">
                    <div className="filters-row">
                        <div className="filters-left">
                            <span className="filters-label">
                                Active Notices Feed
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflow: "visible" }}>
                        {loading ? (
                            <p style={{ textAlign: "center", color: "#64748b" }}>Loading announcements feed...</p>
                        ) : notices.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>No corporate notices published yet.</p>
                        ) : (
                            paginatedNotices.map((notice) => (
                                <div
                                    key={notice._id}
                                    style={{
                                        padding: "20px",
                                        borderRadius: "12px",
                                        border: "1px solid #E2E8F0",
                                        position: "relative",
                                        backgroundColor: "#F8FAFC",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#172033" }}>
                                            {notice.title}
                                        </h3>
                                        <button
                                            onClick={() => handleDeleteNotice(notice._id)}
                                            style={{
                                                border: "none",
                                                background: "none",
                                                cursor: "pointer",
                                                color: "#DC2626",
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
                                    <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0", whiteSpace: "pre-line" }}>
                                        {notice.description}
                                    </p>

                                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "12px", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <User size={14} color="#2563EB" />
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
            </div>

            {/* Publish Notice Modal */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-card-wide">
                        <div className="modal-header">
                            <div>
                                <h2>Publish Notice</h2>
                                <p className="modal-subtitle">Configure notice details and select author.</p>
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddNotice} className="enroll-form">
                            <div className="form-group">
                                <label>Notice Title <span className="req">*</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="e.g. Town Hall Meeting Scheduled"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description Detail <span className="req">*</span></label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    style={{ minHeight: "120px" }}
                                    placeholder="Write announcements details here..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Author / Posted By <span className="req">*</span></label>
                                <select
                                    value={postedBy}
                                    onChange={(e) => setPostedBy(e.target.value)}
                                    required
                                >
                                    <option value="">Select Authoring Employee...</option>
                                    {employees.map((emp) => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                >
                                    <Plus size={16} />
                                    <span>Publish Notice</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
