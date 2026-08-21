import { useState, useEffect } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
import {
    Building2,
    Award,
    Plus,
    Edit,
    Trash2,
    MapPin,
    Users,
    Briefcase,
    AlertCircle,
    X,
    Search
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
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
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
    const [desigEmployeeId, setDesigEmployeeId] = useState("");
    const [editingId, setEditingId] = useState(null);

    // Modal Control State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ems-backend-zby7.onrender.com";

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
            const data = await api.getDepartments();
            if (data) setDepartments(data.departments || data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDesignations = async () => {
        try {
            const data = await api.getDesignations();
            if (data) setDesignations(data.designations || data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const data = await api.getAllEmployees();
            let list = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (data && Array.isArray(data.employees)) {
                list = data.employees;
            } else if (data && data.success && Array.isArray(data.data)) {
                list = data.data;
            }
            setEmployees(list || []);
        } catch (err) {
            console.error("Failed to load employees for designation matching:", err);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        setError("");
        await Promise.all([fetchDepartments(), fetchDesignations(), fetchEmployees()]);
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
            const data = await api.createDepartment({
                departmentName: deptName.trim(),
                description: deptDesc.trim(),
                headName: deptHead.trim(),
                headDesignation: deptHeadDesignation.trim(),
            });
            if (data && data.department) {
                setSuccess("Department created successfully!");
                setDeptName("");
                setDeptDesc("");
                setDeptHead("");
                setDeptHeadDesignation("");
                setIsAddModalOpen(false);
                loadAll();
            } else {
                setError(data?.message || "Failed to create department");
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
            let data;
            if (editingId) {
                data = await api.updateDesignation(editingId, {
                    designationName: desigName.trim(),
                    departmentId: desigDeptId,
                });
            } else {
                data = await api.createDesignation({
                    designationName: desigName.trim(),
                    departmentId: desigDeptId,
                });
            }

            if (data && data.designation) {
                const desigId = data.designation._id;
                // If an employee is selected, assign them this designation
                if (desigEmployeeId) {
                    await api.updateEmployee(desigEmployeeId, {
                        designationId: desigId,
                        departmentId: desigDeptId
                    });
                }
                setSuccess(editingId ? "Designation updated successfully!" : "Designation created successfully!");
                setDesigName("");
                setDesigDeptId("");
                setDesigEmployeeId("");
                setEditingId(null);
                setIsAddModalOpen(false);
                loadAll();
            } else {
                setError(data?.message || `Failed to ${editingId ? 'update' : 'create'} designation`);
            }
        } catch (err) {
            console.error(err);
            setError(`An error occurred while ${editingId ? 'updating' : 'creating'} designation`);
        }
    };

    const handleEditDesignationClick = (desig) => {
        setError("");
        setSuccess("");
        setEditingId(desig._id);
        setDesigName(desig.designationName);
        setDesigDeptId(desig.departmentId?._id || desig.departmentId || "");

        // Find if any employee is assigned to this designation
        const assignedEmp = employees.find(emp => {
            const empDesigId = emp.designationId?._id || emp.designationId;
            return empDesigId === desig._id;
        });
        setDesigEmployeeId(assignedEmp ? assignedEmp._id : "");
        setIsAddModalOpen(true);
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        setError("");
        setSuccess("");
        try {
            const data = await api.deleteDepartment(id);
            if (data) {
                setSuccess("Department deleted successfully!");
                loadAll();
            } else {
                setError("Failed to delete department");
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
            const data = await api.deleteDesignation(id);
            if (data) {
                setSuccess("Designation deleted successfully!");
                loadAll();
            } else {
                setError("Failed to delete designation");
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <Search size={16} style={{ position: "absolute", left: "12px", color: "#64748b" }} />
                        <input
                            type="text"
                            placeholder="Search Designations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        className="btn-enroll-employee"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setIsAddModalOpen(true);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <Plus size={16} />
                        <span>{activeView === "departments" ? "Add Department" : "Add Designation"}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DC2626", backgroundColor: "#FEECEC", border: "1px solid #FECACA", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div style={{ color: "#087F72", backgroundColor: "#E8F8F3", border: "1px solid #D5F2E9", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
                    {success}
                </div>
            )}

            {/* Full-width container */}
            <div className="w-full">
                {/* Render Departments View */}
                {activeView === "departments" && (
                    <div className="employee-directory-card" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Department List</h2>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>DEPARTMENT NAME</th>
                                        <th>DESCRIPTION</th>
                                        <th>DEPARTMENT HEAD</th>
                                        <th className="table-center-col">EMPLOYEES</th>
                                        <th className="table-actions-col">ACTIONS</th>
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
                                                <td style={{ padding: "4px 8px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <Building2 size={16} color="#0d9488" />
                                                        <span style={{ fontWeight: "700", color: "#1f2937" }}>{dept.departmentName}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "4px 8px", color: "#64748b", fontSize: "13px", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {dept.description}
                                                </td>
                                                <td style={{ padding: "4px 8px" }}>
                                                    <div>
                                                        <p style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>{dept.headName}</p>
                                                        <p style={{ fontSize: "12px", color: "#8b5cf6" }}>{dept.headDesignation}</p>
                                                    </div>
                                                </td>
                                                <td className="table-center-col">
                                                    <span style={{ fontWeight: "700", color: "#0f766e" }}>{dept.employeeCount || 0}</span>
                                                </td>
                                                <td style={{ padding: "4px 8px", textAlign: "right" }}>
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
                )}

                {/* Render Designations View */}
                {activeView === "designations" && (
                    <div className="employee-directory-card" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "16px", color: "#172033", fontSize: "18px", fontWeight: "700" }}>Designation List</h2>

                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>EMPLOYEE NAME(S)</th>
                                        <th>DESIGNATION</th>
                                        <th>DEPARTMENT</th>
                                        <th className="table-actions-col">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: "center", padding: "30px 0" }}>Loading designations...</td>
                                        </tr>
                                    ) : designations.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: "center", padding: "30px 0" }}>No designations registered. Create one.</td>
                                        </tr>
                                    ) : (
                                        designations.filter((desig) => {
                                            if (!searchTerm.trim()) return true;
                                            const q = searchTerm.toLowerCase();
                                            const name = (desig.designationName || "").toLowerCase();
                                            const dept = (desig.departmentId?.departmentName || "").toLowerCase();
                                            const desigEmployees = employees.filter(emp => {
                                                const empDesigId = emp.designationId?._id || emp.designationId;
                                                return empDesigId === desig._id;
                                            });
                                            const empNames = desigEmployees.map(emp => `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase()).join(" ");
                                            return name.includes(q) || dept.includes(q) || empNames.includes(q);
                                        }).map((desig) => {
                                            const desigEmployees = employees.filter(emp => {
                                                const empDesigId = emp.designationId?._id || emp.designationId;
                                                return empDesigId === desig._id;
                                            });
                                            const employeeNames = desigEmployees.map(emp => `${emp.firstName || ""} ${emp.lastName || ""}`.trim()).join(", ") || "—";
                                            return (
                                                <tr key={desig._id} className="employee-row">
                                                    <td style={{ padding: "8px 12px", color: "#64748B", fontSize: "13px" }}>
                                                        {employeeNames}
                                                    </td>
                                                    <td style={{ padding: "8px 12px" }}>
                                                        <div style={{ display: "flex", items: "center", gap: "8px" }}>
                                                            <Award size={16} color="#7C3AED" />
                                                            <span style={{ fontWeight: "700", color: "#172033" }}>{desig.designationName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "8px 12px" }}>
                                                        <span className="employee-dept-pill">
                                                            {desig.departmentId?.departmentName || "Unassigned"}
                                                        </span>
                                                    </td>
                                                    <td className="table-actions-col">
                                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                            <button
                                                                onClick={() => handleEditDesignationClick(desig)}
                                                                className="action-icon-btn"
                                                                title="Edit designation"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDesignation(desig._id)}
                                                                className="action-icon-btn delete"
                                                                title="Delete designation"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Dialog Form popup */}
            {isAddModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-card-wide">
                        <div className="modal-header">
                            <div>
                                <h2>
                                    {activeView === "departments"
                                        ? "Add Department"
                                        : (editingId ? "Edit Designation" : "Add Designation")}
                                </h2>
                                <p className="modal-subtitle">
                                    {activeView === "departments"
                                        ? "Provide details to create new department."
                                        : (editingId ? "Update existing designation details." : "Provide details to create new designation.")}
                                </p>
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => { setIsAddModalOpen(false); setEditingId(null); setDesigName(""); setDesigDeptId(""); setDesigEmployeeId(""); }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {activeView === "departments" ? (
                            <form onSubmit={handleAddDepartment} className="enroll-form">
                                <div className="form-group">
                                    <label>Department Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        value={deptName}
                                        onChange={(e) => setDeptName(e.target.value)}
                                        placeholder="e.g. Human Resources"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description <span className="req">*</span></label>
                                    <textarea
                                        value={deptDesc}
                                        onChange={(e) => setDeptDesc(e.target.value)}
                                        placeholder="Brief description..."
                                        style={{ minHeight: "80px", resize: "vertical" }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Head of Department Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        value={deptHead}
                                        onChange={(e) => setDeptHead(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Head Designation <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        value={deptHeadDesignation}
                                        onChange={(e) => setDeptHeadDesignation(e.target.value)}
                                        placeholder="e.g. VP, HR Operations"
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => { setIsAddModalOpen(false); setEditingId(null); }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-save"
                                    >
                                        <Plus size={16} />
                                        <span>Create Department</span>
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleAddDesignation} className="enroll-form">
                                <div className="form-group">
                                    <label>Designation Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        value={desigName}
                                        onChange={(e) => setDesigName(e.target.value)}
                                        placeholder="e.g. Lead Engineer"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Department <span className="req">*</span></label>
                                    <select
                                        value={desigDeptId}
                                        onChange={(e) => setDesigDeptId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Department...</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Assign Employee (Optional)</label>
                                    <select
                                        value={desigEmployeeId}
                                        onChange={(e) => setDesigEmployeeId(e.target.value)}
                                    >
                                        <option value="">Select Employee...</option>
                                        {employees.map((emp) => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.firstName} {emp.lastName} ({emp.employeeId || emp._id})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => { setIsAddModalOpen(false); setEditingId(null); setDesigName(""); setDesigDeptId(""); setDesigEmployeeId(""); }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-save"
                                    >
                                        {editingId ? "Update Designation" : "Create Designation"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
