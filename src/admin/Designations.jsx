import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";
import {
    Building2,
    Award,
    Plus,
    Trash2,
    MapPin,
    Users,
    Briefcase,
    AlertCircle
} from "lucide-react";

export default function Designations() {
    const location = useLocation();

    // Decide active view based on url route
    const getInitialView = () => {
        if (location.pathname.includes("departments")) {
            return "departments";
        }
        return "designations";
    };

    const [activeView, setActiveView] = useState(getInitialView);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Department Form fields
    const [deptName, setDeptName] = useState("");
    const [deptDesc, setDeptDesc] = useState("");
    const [deptHead, setDeptHead] = useState("");
    const [deptHeadDesignation, setDeptHeadDesignation] = useState("");

    // Designation Form fields
    const [desigName, setDesigName] = useState("");
    const [desigDeptId, setDesigDeptId] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

    function getHeaders() {
        const token = localStorage.getItem("token");
        return token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    }

    // Update active view when route changes
    useEffect(() => {
        if (location.pathname.includes("departments")) {
            setActiveView("departments");
        } else if (location.pathname.includes("designations")) {
            setActiveView("designations");
        }
    }, [location.pathname]);

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/departments`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setDepartments(data.departments || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDesignations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/designations`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setDesignations(data.designations || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        setError("");
        await Promise.all([fetchDepartments(), fetchDesignations()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!deptName || !deptDesc || !deptHead || !deptHeadDesignation) {
            setError("All department fields are required");
            return;
        }
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/departments`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    departmentName: deptName.trim(),
                    description: deptDesc.trim(),
                    headName: deptHead.trim(),
                    headDesignation: deptHeadDesignation.trim(),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Department created successfully!");
                setDeptName("");
                setDeptDesc("");
                setDeptHead("");
                setDeptHeadDesignation("");
                loadAll();
            } else {
                setError(data.message || "Failed to create department");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while creating department");
        }
    };

    const handleAddDesignation = async (e) => {
        e.preventDefault();
        if (!desigName || !desigDeptId) {
            setError("Designation Name and Department are required");
            return;
        }
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/designations`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    designationName: desigName.trim(),
                    departmentId: desigDeptId,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Designation created successfully!");
                setDesigName("");
                setDesigDeptId("");
                loadAll();
            } else {
                setError(data.message || "Failed to create designation");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while creating designation");
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Department deleted successfully!");
                loadAll();
            } else {
                setError(data.message || "Failed to delete department");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete department");
        }
    };

    const handleDeleteDesignation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this designation?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/designations/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Designation deleted successfully!");
                loadAll();
            } else {
                setError(data.message || "Failed to delete designation");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete designation");
        }
    };

    return (
        <div className="p-6">
            {/* Page Title & View Toggle */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 className="dashboard-title">
                        {activeView === "departments" ? "Departments" : "Designations"}
                    </h1>
                    <p className="dashboard-subtitle">
                        {activeView === "departments"
                            ? "Oversee organizational structures, heads, and descriptions."
                            : "Manage and assign organizational job designations."}
                    </p>
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

            {/* Main Grid View */}
            <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "24px", alignItems: "start" }}>

                {/* Render Departments View */}
                {activeView === "departments" && (
                    <>
                        {/* Departments Table */}
                        <div className="employee-directory-card" style={{ padding: "24px" }}>
                            <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Department List</h2>

                            <div className="table-responsive">
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th style={{ padding: "12px" }}>DEPARTMENT NAME</th>
                                            <th style={{ padding: "12px" }}>DESCRIPTION</th>
                                            <th style={{ padding: "12px" }}>DEPARTMENT HEAD</th>
                                            <th style={{ padding: "12px", textAlign: "center" }}>EMPLOYEES</th>
                                            <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: "center", padding: "30px 0" }}>Loading departments...</td>
                                            </tr>
                                        ) : departments.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: "center", padding: "30px 0" }}>No departments found. Create one.</td>
                                            </tr>
                                        ) : (
                                            departments.map((dept) => (
                                                <tr key={dept._id} className="employee-row">
                                                    <td style={{ padding: "16px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <Building2 size={16} color="#0d9488" />
                                                            <span style={{ fontWeight: "700", color: "#1f2937" }}>{dept.departmentName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "16px", color: "#64748b", fontSize: "13px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {dept.description}
                                                    </td>
                                                    <td style={{ padding: "16px" }}>
                                                        <div>
                                                            <p style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>{dept.headName}</p>
                                                            <p style={{ fontSize: "12px", color: "#8b5cf6" }}>{dept.headDesignation}</p>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "16px", textAlign: "center" }}>
                                                        <span style={{ fontWeight: "700", color: "#0f766e" }}>{dept.employeeCount || 0}</span>
                                                    </td>
                                                    <td style={{ padding: "16px", textAlign: "right" }}>
                                                        <button
                                                            onClick={() => handleDeleteDepartment(dept._id)}
                                                            className="action-icon-btn delete"
                                                            style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Add Department Form */}
                        <div className="emp-card-box" style={{ padding: "24px" }}>
                            <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Add Department</h2>
                            <form onSubmit={handleAddDepartment}>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Department Name</label>
                                    <input
                                        type="text"
                                        value={deptName}
                                        onChange={(e) => setDeptName(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                        placeholder="e.g. Human Resources"
                                    />
                                </div>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Description</label>
                                    <textarea
                                        value={deptDesc}
                                        onChange={(e) => setDeptDesc(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "60px", resize: "vertical" }}
                                        placeholder="Brief description..."
                                    />
                                </div>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Head of Department Name</label>
                                    <input
                                        type="text"
                                        value={deptHead}
                                        onChange={(e) => setDeptHead(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Head Designation</label>
                                    <input
                                        type="text"
                                        value={deptHeadDesignation}
                                        onChange={(e) => setDeptHeadDesignation(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                        placeholder="e.g. VP, HR Operations"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{ width: "100%", padding: "10px", backgroundColor: "#059669", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                >
                                    <Plus size={16} />
                                    <span>Create Department</span>
                                </button>
                            </form>
                        </div>
                    </>
                )}

                {/* Render Designations View */}
                {activeView === "designations" && (
                    <>
                        {/* Designations Table */}
                        <div className="employee-directory-card" style={{ padding: "24px" }}>
                            <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Designation List</h2>

                            <div className="table-responsive">
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th style={{ padding: "12px" }}>DESIGNATION</th>
                                            <th style={{ padding: "12px" }}>DEPARTMENT</th>
                                            <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: "center", padding: "30px 0" }}>Loading designations...</td>
                                            </tr>
                                        ) : designations.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: "center", padding: "30px 0" }}>No designations registered. Create one.</td>
                                            </tr>
                                        ) : (
                                            designations.map((desig) => (
                                                <tr key={desig._id} className="employee-row">
                                                    <td style={{ padding: "16px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <Award size={16} color="#8b5cf6" />
                                                            <span style={{ fontWeight: "600", color: "#1e293b" }}>{desig.designationName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "16px" }}>
                                                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", padding: "3px 8px", backgroundColor: "#f3f4f6", borderRadius: "12px" }}>
                                                            {desig.departmentId?.departmentName || "Unassigned"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "16px", textAlign: "right" }}>
                                                        <button
                                                            onClick={() => handleDeleteDesignation(desig._id)}
                                                            className="action-icon-btn delete"
                                                            style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Add Designation Form */}
                        <div className="emp-card-box" style={{ padding: "24px" }}>
                            <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Add Designation</h2>
                            <form onSubmit={handleAddDesignation}>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Designation Name</label>
                                    <input
                                        type="text"
                                        value={desigName}
                                        onChange={(e) => setDesigName(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                        placeholder="e.g. Lead Engineer"
                                    />
                                </div>

                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Department</label>
                                    <select
                                        value={desigDeptId}
                                        onChange={(e) => setDesigDeptId(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
                                    >
                                        <option value="">Select Department...</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    style={{ width: "100%", padding: "10px", backgroundColor: "#059669", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                >
                                    <Plus size={16} />
                                    <span>Create Designation</span>
                                </button>
                            </form>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
