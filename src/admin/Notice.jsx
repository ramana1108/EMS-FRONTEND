import { useState, useEffect } from "react";
import Pagination from "../components/Pagination";
import { Megaphone, Plus, Calendar, User, Trash2, AlertCircle, X } from "lucide-react";
import api from "../api";

export default function Notice() {
  const [notices, setNotices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.max(1, Math.ceil(notices.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotices = notices.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [notices]);

  // Modal Control State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postedBy, setPostedBy] = useState("");

  const fetchEmployees = async () => {
    try {
      const data = await api.getAllEmployees();
      setEmployees(data.employees || data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotices = async () => {
    try {
      const data = await api.getNotices();
      setNotices(data.notices || []);
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
      const data = await api.createNotice({
        title: title.trim(),
        description: description.trim(),
        postedBy,
      });
      if (data && (data.notice || data.message === "Notice Created Successfully")) {
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
      const data = await api.deleteNotice(id);
      if (data && (data.message === "Notice Deleted Successfully" || data.success)) {
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
          <h1 className="text-2xl font-bold" style={{color:"black"}}>Announcements & Notices</h1>
          <p className="text-sm text-slate-600">Broadcasting corporate announcements and regulatory notifications.</p>
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
        <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-md mb-5">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && <div className="text-emerald-800 bg-emerald-50 p-3 rounded-md mb-5">{success}</div>}

      {/* Full-width Layout */}
      <div className="w-full">
        {/* Notice Feed */}
        <div className="employee-directory-card">
          <div className="filters-row">
            <div className="filters-left">
              <span className="filters-label">Active Notices Feed</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflow: "visible" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "#64748b" }}>Loading announcements feed...</p>
            ) : notices.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", padding: "32px 0" }}>No corporate notices published yet.</p>
            ) : (
              paginatedNotices.map((notice) => (
                <div
                  key={notice._id}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    position: "relative",
                    backgroundColor: "#f8fafc",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{notice.title}</h3>
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
                        alignItems: "center",
                      }}
                      title="Delete Announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6", marginBottom: "12px", whiteSpace: "pre-line" }}>
                    {notice.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "12px",
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <User size={14} color="#0d9488" />
                      <span>
                        {notice.postedBy?.employeeName || "System Administrator"} ({notice.postedBy?.employeeId || "N/A"})
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar size={14} />
                      <span>{formatDate(notice.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notices.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startItem={startIndex + 1}
                endItem={Math.min(startIndex + itemsPerPage, notices.length)}
                totalItems={notices.length}
              />
            </div>
          )}
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
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="enroll-form">
              <div className="form-group">
                <label>
                  Notice Title <span className="req">*</span>
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Town Hall Meeting Scheduled" />
              </div>

              <div className="form-group">
                <label>
                  Description Detail <span className="req">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{ minHeight: "120px" }}
                  placeholder="Write announcements details here..."
                />
              </div>

              <div className="form-group">
                <label>
                  Author / Posted By <span className="req">*</span>
                </label>
                <select value={postedBy} onChange={(e) => setPostedBy(e.target.value)} required>
                  <option value="">Select Authoring Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
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