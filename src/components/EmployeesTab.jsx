import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, User, Briefcase, Mail, Calendar, CheckCircle } from "lucide-react";

const deptColors = {
    "Production": "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
    "Sales": "bg-emerald-100/70 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800/40",
    "IT": "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900/60",
    "HR/Admin": "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
};

const defaultEmployees = [
    {
        _id: "1",
        empId: "EMP-1024",
        name: "Amit Patel",
        email: "amit@gmail.com",
        department: "IT",
        role: "Sr. Frontend Developer",
        status: "Active",
        joiningDate: "2024-01-15",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80"
    },
    {
        _id: "2",
        empId: "EMP-1025",
        name: "Sneha Nair",
        email: "sneha@gmail.com",
        department: "HR/Admin",
        role: "HR Executive",
        status: "Active",
        joiningDate: "2024-02-02",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80"
    },
    {
        _id: "3",
        empId: "EMP-1026",
        name: "Vikram Malhotra",
        email: "vikram@gmail.com",
        department: "Production",
        role: "Operations Lead",
        status: "On Leave",
        joiningDate: "2023-08-18",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80"
    },
    {
        _id: "4",
        empId: "EMP-1027",
        name: "Rajesh Kumar",
        email: "rajesh@gmail.com",
        department: "Sales",
        role: "Business Lead",
        status: "Inactive",
        joiningDate: "2022-10-10",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80"
    },
    {
        _id: "5",
        empId: "EMP-1028",
        name: "Divya Sharma",
        email: "divya@gmail.com",
        department: "IT",
        role: "DevOps Engineer",
        status: "Active",
        joiningDate: "2024-03-01",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80"
    }
];

export default function EmployeesTab() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);

    // Form inputs
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "IT",
        role: "",
        status: "Active",
        joiningDate: ""
    });

    const API_URL = "http://localhost:5000/api/employees";

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
                localStorage.setItem("ems_employees", JSON.stringify(data));
            } else {
                throw new Error("HTTP error " + res.status);
            }
        } catch (err) {
            console.warn("Backend API not reachable. Using localStorage or defaults:", err);
            const local = localStorage.getItem("ems_employees");
            if (local) {
                setEmployees(JSON.parse(local));
            } else {
                setEmployees(defaultEmployees);
                localStorage.setItem("ems_employees", JSON.stringify(defaultEmployees));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpenAdd = () => {
        setEditingEmp(null);
        setFormData({
            name: "",
            email: "",
            department: "IT",
            role: "",
            status: "Active",
            joiningDate: new Date().toISOString().split("T")[0]
        });
        setError("");
        setIsModalOpen(true);
    };

    const handleOpenEdit = (emp) => {
        setEditingEmp(emp._id || emp.empId);
        setFormData({
            name: emp.name,
            email: emp.email,
            department: emp.department || "IT",
            role: emp.role || "",
            status: emp.status || "Active",
            joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : ""
        });
        setError("");
        setIsModalOpen(true);
    };

    const handleDelete = async (id, empId) => {
        if (!window.confirm("Are you sure you want to delete this employee record?")) return;

        try {
            const deleteId = id && id.length > 5 ? id : empId;
            const res = await fetch(`${API_URL}/${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            fetchEmployees();
        } catch (err) {
            console.warn("Delete API failed, removing locally:", err);
            const updated = employees.filter(e => e._id !== id && e.empId !== empId);
            setEmployees(updated);
            localStorage.setItem("ems_employees", JSON.stringify(updated));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.email || !formData.role || !formData.joiningDate) {
            setError("All fields except status are required.");
            return;
        }

        try {
            if (editingEmp) {
                // Update
                const res = await fetch(`${API_URL}/${editingEmp}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error("Update failed");
            } else {
                // Create
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error("Insert failed");
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (err) {
            console.warn("API write failed, working locally:", err);
            let updated;
            if (editingEmp) {
                updated = employees.map(emp => {
                    if (emp._id === editingEmp || emp.empId === editingEmp) {
                        return { ...emp, ...formData };
                    }
                    return emp;
                });
            } else {
                const nextNum = 1024 + employees.length + 1;
                const newEmp = {
                    _id: String(nextNum),
                    empId: `EMP-${nextNum}`,
                    ...formData,
                    avatar: `https://images.unsplash.com/photo-${1535713875002 + employees.length * 1000 % 9999}-d1d0cf377fde?w=100&h=100&fit=crop&q=80`
                };
                updated = [newEmp, ...employees];
            }
            setEmployees(updated);
            localStorage.setItem("ems_employees", JSON.stringify(updated));
            setIsModalOpen(false);
        }
    };

    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.empId.toLowerCase().includes(search.toLowerCase()) ||
        emp.role.toLowerCase().includes(search.toLowerCase()) ||
        emp.department.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusStyle = (status) => {
        if (status === "Active") return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60";
        if (status === "On Leave") return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60";
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Employee Directory</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and audit company-wide crew records.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all duration-200 text-sm"
                >
                    <Plus size={16} />
                    <span>Enroll Employee</span>
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, ID, role or department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-xl shadow-emerald-950/[0.015] overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-slate-500 dark:text-slate-400">Loading crew records...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 dark:text-slate-400">No records found matching search query.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800/60">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joining Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {filtered.map((emp) => (
                                    <tr key={emp.empId} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-all duration-150 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={emp.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80`}
                                                    alt={emp.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-205 dark:border-slate-800 shadow-sm"
                                                />
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                                        {emp.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-black text-emerald-650 dark:text-emerald-400">{emp.empId}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black border uppercase tracking-wider ${deptColors[emp.department] || "bg-slate-50 dark:bg-slate-800 text-slate-700 border-slate-200"}`}>
                                                {emp.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-350">{emp.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-inner ${getStatusStyle(emp.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "Active" ? "bg-emerald-500 animate-pulse" : emp.status === "On Leave" ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`} />
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-bold font-mono">
                                            {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEdit(emp)}
                                                    title="Edit Record"
                                                    className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors duration-150 border border-transparent"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp._id, emp.empId)}
                                                    title="Delete Record"
                                                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors duration-150 border border-transparent"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 text-left"
                        >
                            <div className="px-6 py-4.5 border-b border-slate-105 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                                    {editingEmp ? "Edit Employee Profile" : "Enroll New Employee"}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
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

                                {/* Row 1: Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-3 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter name"
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-3 text-slate-400" size={16} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter email"
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Dept & Role */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Department</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 cursor-pointer transition-colors dark:text-slate-100"
                                        >
                                            <option value="IT" className="dark:bg-slate-900">IT</option>
                                            <option value="HR/Admin" className="dark:bg-slate-900">HR/Admin</option>
                                            <option value="Production" className="dark:bg-slate-900">Production</option>
                                            <option value="Sales" className="dark:bg-slate-900">Sales</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Role Designation</label>
                                        <div className="relative flex items-center">
                                            <Briefcase className="absolute left-3 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                placeholder="e.g. Designer"
                                                className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Status & date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Account Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 cursor-pointer transition-colors dark:text-slate-100"
                                        >
                                            <option value="Active" className="dark:bg-slate-900">Active</option>
                                            <option value="On Leave" className="dark:bg-slate-900">On Leave</option>
                                            <option value="Inactive" className="dark:bg-slate-900">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Joining Date</label>
                                        <div className="relative flex items-center">
                                            <Calendar className="absolute left-3 text-slate-400" size={16} />
                                            <input
                                                type="date"
                                                value={formData.joiningDate}
                                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                                className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-black uppercase text-slate-650 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all text-xs uppercase"
                                    >
                                        Save Record
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
