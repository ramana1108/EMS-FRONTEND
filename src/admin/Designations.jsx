import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{activeView === "departments" ? "Departments" : "Designations"}</h1>
                    <p className="text-sm text-slate-600">{activeView === "departments" ? "Oversee organizational structures, heads, and descriptions." : "Manage and assign organizational job designations."}</p>
                </div>
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
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-semibold text-slate-700 px-2 py-1 bg-slate-100 rounded-full">{desig.departmentId?.departmentName || "Unassigned"}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDeleteDesignation(desig._id)} className="text-rose-600 hover:text-rose-800"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

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

                                <button type="submit" className="w-full px-4 py-2 bg-emerald-700 text-white rounded-md font-semibold flex items-center justify-center gap-2"><Plus size={16} /><span>Create Designation</span></button>
                            </form>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
