import { useState, useEffect } from "react";
import api from "../api";
import { useLocation } from "react-router-dom";
=======
// styles are loaded globally via src/index.css (Tailwind + custom styles)
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
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
    X
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
    const [currentAssignedEmployees, setCurrentAssignedEmployees] = useState([]);

    // Modal Control State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
            return list || [];
        } catch (err) {
            console.error("Failed to load employees for designation matching:", err);
            return [];
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

    // Open Add modal and refresh employees in real-time
    const openAddModal = async () => {
        setError("");
        setSuccess("");
        await fetchEmployees();
        setEditingId(null);
        setDesigName("");
        setDesigDeptId("");
        setDesigEmployeeId("");
        setCurrentAssignedEmployees([]);
        setIsAddModalOpen(true);
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
                // If an employee is selected, assign that employee to the designation
                if (desigEmployeeId) {
                    await api.updateEmployee(desigEmployeeId, {
                        designationId: desigId,
                        departmentId: desigDeptId,
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

    const handleEditDesignationClick = async (desig) => {
        setError("");
        setSuccess("");
        const freshEmployees = await fetchEmployees();
        setEditingId(desig._id);
        setDesigName(desig.designationName);
        setDesigDeptId(desig.departmentId?._id || desig.departmentId || "");

        // Find if any employee is assigned to this designation
        const assigned = freshEmployees.filter(emp => {
            const empDesigId = emp.designationId?._id || emp.designationId;
            return String(empDesigId) === String(desig._id);
        });
        setCurrentAssignedEmployees(assigned);
        setDesigEmployeeId(assigned.length > 0 ? assigned[0]._id : "");
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{activeView === "departments" ? "Departments" : "Designations"}</h1>
                    <p className="text-sm text-slate-600">{activeView === "departments" ? "Oversee organizational structures, heads, and descriptions." : "Manage and assign organizational job designations."}</p>
                </div>
                <button
                    className="btn-enroll-employee"
                    onClick={openAddModal}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Plus size={16} />
                    <span>{activeView === "departments" ? "Add Department" : "Add Designation"}</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-md mb-4">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="text-emerald-800 bg-emerald-50 p-3 rounded-md mb-4">{success}</div>
            )}

<<<<<<< HEAD
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
{/* Main Grid View */}
            <div className="grid lg:grid-cols-[2.2fr_1fr] gap-6 items-start">

                {/* Render Departments View */}
                {activeView === "departments" && (
                    <>
                        {/* Departments Table */}
                        <div className="employee-directory-card bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Department List</h2>

                            <div className="overflow-auto rounded-md border border-slate-100">
                                <table className="min-w-full divide-y">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left">DEPARTMENT NAME</th>
                                            <th className="px-4 py-3 text-left">DESCRIPTION</th>
                                            <th className="px-4 py-3 text-left">DEPARTMENT HEAD</th>
                                            <th className="px-4 py-3 text-center">EMPLOYEES</th>
                                            <th className="px-4 py-3 text-right">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-8">Loading departments...</td>
                                            </tr>
                                        ) : departments.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-8">No departments found. Create one.</td>
                                            </tr>
                                        ) : (
                                            departments.map((dept) => (
                                                <tr key={dept._id} className="border-b last:border-b-0">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 size={16} color="#0d9488" />
                                                            <span className="font-semibold text-slate-900">{dept.departmentName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">{dept.description}</td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-700">{dept.headName}</p>
                                                            <p className="text-xs text-violet-600">{dept.headDesignation}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-semibold text-emerald-700">{dept.employeeCount || 0}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDeleteDepartment(dept._id)} className="text-rose-600 hover:text-rose-800">
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
                        <div className="emp-card-box bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Add Department</h2>
                            <form onSubmit={handleAddDepartment}>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Department Name</label>
                                    <input type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" placeholder="e.g. Human Resources" />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
                                    <textarea value={deptDesc} onChange={(e) => setDeptDesc(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 min-h-[60px] resize-vertical" placeholder="Brief description..." />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Head of Department Name</label>
                                    <input type="text" value={deptHead} onChange={(e) => setDeptHead(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" placeholder="e.g. John Doe" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Head Designation</label>
                                    <input type="text" value={deptHeadDesignation} onChange={(e) => setDeptHeadDesignation(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" placeholder="e.g. VP, HR Operations" />
                                </div>
                                <button type="submit" className="w-full px-4 py-2 bg-emerald-700 text-white rounded-md font-semibold flex items-center justify-center gap-2">
                                    <Plus size={16} />
                                    <span>Create Department</span>
                                </button>
                            </form>
                        </div>
                    </>
                )}

                {/* Render Designations View */}
                {activeView === "designations" && (
                    <div className="employee-directory-card" style={{ padding: "24px" }}>
                        <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Designation List</h2>

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
                                        designations.map((desig) => {
                                            const desigEmployees = employees.filter(emp => {
                                                const empDesigId = emp.designationId?._id || emp.designationId;
                                                return String(empDesigId) === String(desig._id);
                                            });
                                            const employeeNames = desigEmployees.map(emp => `${emp.firstName || ""} ${emp.lastName || ""}`.trim()).join(", ") || "—";
                                            return (
                                                <tr key={desig._id} className="employee-row">
                                                    <td style={{ padding: "4px 8px", color: "#475569", fontSize: "13px" }}>
                                                        {employeeNames}
                                                    </td>
                                                    <td style={{ padding: "4px 8px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
<>
                        {/* Designations Table */}
                        <div className="employee-directory-card bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Designation List</h2>

                            <div className="overflow-auto rounded-md border border-slate-100">
                                <table className="min-w-full divide-y">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3">DESIGNATION</th>
                                            <th className="px-4 py-3">DEPARTMENT</th>
                                            <th className="px-4 py-3 text-right">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-8">Loading designations...</td>
                                            </tr>
                                        ) : designations.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-8">No designations registered. Create one.</td>
                                            </tr>
                                        ) : (
                                            designations.map((desig) => (
                                                <tr key={desig._id} className="border-b last:border-b-0">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Award size={16} color="#8b5cf6" />
                                                            <span className="font-medium text-slate-900">{desig.designationName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "4px 8px" }}>
                                                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", padding: "3px 8px", backgroundColor: "#f3f4f6", borderRadius: "12px" }}>
                                                            {desig.departmentId?.departmentName || "Unassigned"}
                                                        </span>
                                                    </td>
                                                    <td className="table-actions-col">
                                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                            <button
                                                                onClick={() => handleEditDesignationClick(desig)}
                                                                className="action-icon-btn"
                                                                style={{ border: "none", background: "none", cursor: "pointer", color: "#4f46e5" }}
                                                                title="Edit designation"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDesignation(desig._id)}
                                                                className="action-icon-btn delete"
                                                                style={{ border: "none", background: "none", cursor: "pointer", color: "#b91c1c" }}
                                                                title="Delete designation"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
<td className="px-4 py-3">
                                                        <span className="text-sm font-semibold text-slate-700 px-2 py-1 bg-slate-100 rounded-full">{desig.departmentId?.departmentName || "Unassigned"}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDeleteDesignation(desig._id)} className="text-rose-600 hover:text-rose-800"><Trash2 size={16} /></button>
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
{/* Add Designation Form */}
                        <div className="emp-card-box bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Add Designation</h2>
                            <form onSubmit={handleAddDesignation}>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Designation Name</label>
                                    <input type="text" value={desigName} onChange={(e) => setDesigName(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300" placeholder="e.g. Lead Engineer" />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Department</label>
                                    <select value={desigDeptId} onChange={(e) => setDesigDeptId(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white">
                                        <option value="">Select Department...</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
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
                                        {(() => {
                                            const opts = [...employees];
                                            if (!opts || opts.length === 0) {
                                                return <option value="">No employees available</option>;
                                            }
                                            return opts.map((emp) => (
                                                <option key={emp._id} value={emp._id}>
                                                    {emp.firstName} {emp.lastName} ({emp.employeeId || emp._id})
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                </div>
<button type="submit" className="w-full px-4 py-2 bg-emerald-700 text-white rounded-md font-semibold flex items-center justify-center gap-2"><Plus size={16} /><span>Create Designation</span></button>
                            </form>
                        </div>
                    </>
                )}

                                {editingId && (
                                    <div style={{ marginTop: 8 }}>
                                        <label style={{ fontSize: 12, color: '#94a3b8' }}>Current assigned employees</label>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                                            {currentAssignedEmployees.length === 0 ? (
                                                <div style={{ color: '#64748b', fontSize: 13 }}>No employees assigned to this designation.</div>
                                            ) : (
                                                currentAssignedEmployees.map(emp => (
                                                    <span key={emp._id} style={{ background: '#0f172a', color: '#e6eef8', padding: '6px 10px', borderRadius: 999, fontSize: 13, border: '1px solid rgba(255,255,255,0.04)' }}>
                                                        {emp.firstName} {emp.lastName}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

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
