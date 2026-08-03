import { useState, useEffect } from "react";
import "../App.css";
import api from "../api";
import {
    LayoutDashboard,
    Building2,
    Award,
    Users,
    ShieldCheck,
    Wallet,
    Settings,
    LogOut,
    Search,
    Bell,
    Plus,
    Eye,
    Edit,
    Trash2,
    Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const defaultEmployees = [
    {
        employeeId: "EMP-1001",
        name: "Alex Morgan",
        email: "alex.morgan@company.com",
        department: "IT",
        role: "Full-time",
        status: "Active",
        joiningDate: "2021-03-15"
    },
    {
        employeeId: "EMP-1002",
        name: "Jane Doe",
        email: "jane.doe@company.com",
        department: "Sales",
        role: "Full-time",
        status: "Active",
        joiningDate: "2022-06-10"
    },
    {
        employeeId: "EMP-1003",
        name: "John Smith",
        email: "john.smith@company.com",
        department: "Admin",
        role: "Part-time",
        status: "Inactive",
        joiningDate: "2020-01-20"
    },
    {
        employeeId: "EMP-1004",
        name: "Robert Lee",
        email: "robert.lee@company.com",
        department: "Production",
        role: "Full-time",
        status: "Active",
        joiningDate: "2023-11-05"
    }
];

export default function Employee() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [deptFilter, setDeptFilter] = useState("All Departments");
    const [currentUser] = useState(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.name) {
                    return {
                        name: parsed.name,
                        role: parsed.role || "ADMIN"
                    };
                }
            } catch (e) {
                console.error(e);
            }
        }
        return { name: "Prasanna Ramana", role: "ADMIN" };
    });

    useEffect(() => {
        let mounted = true;
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const res = await api.getAllEmployees();
                if (mounted) {
                    if (Array.isArray(res)) {
                        setEmployees(res.length > 0 ? res : defaultEmployees);
                    } else if (res && Array.isArray(res.employees)) {
                        setEmployees(res.employees.length > 0 ? res.employees : defaultEmployees);
                    } else if (res && res.success && Array.isArray(res.data)) {
                        setEmployees(res.data.length > 0 ? res.data : defaultEmployees);
                    } else {
                        setEmployees(defaultEmployees);
                    }
                }
            } catch (err) {
                console.error("Failed to load employees:", err);
                if (mounted) {
                    setEmployees(defaultEmployees);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        fetchEmployees();
        return () => {
            mounted = false;
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const getInitials = (name) => {
        if (!name) return "A";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Derive unique departments from real list for filters dropdown
    const departmentsList = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

    // Calculate Stat values Dynamically
    const totalEmployeesCount = employees.length;
    const activeStaffCount = employees.filter(e => e.status?.toLowerCase() === "active").length;
    const inactiveStaffCount = employees.filter(e => e.status?.toLowerCase() === "inactive" || e.status?.toLowerCase() === "on leave" || e.status?.toLowerCase() === "offboarded").length;
    const departmentsCountText = `${departmentsList.length} Active`;
    const departmentNamesText = departmentsList.length > 0 ? departmentsList.join(", ") : "IT, Sales, Admin & Production";

    // Filtered employees listing
    const filteredEmployees = employees.filter(e => {
        const nameMatches = e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const emailMatches = e.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const idMatches = e.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const roleMatches = e.role?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesSearch = nameMatches || emailMatches || idMatches || roleMatches;

        const matchesStatus = statusFilter === "All Statuses" || e.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesDept = deptFilter === "All Departments" || e.department?.toLowerCase() === deptFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesDept;
    });

    return (
        <div>
            {/* Top Header Bar */}
            <div className="top-header">
                <div className="search-box">
                    <Search size={18} color="#64748b" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, email, role..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="header-right">
                    <button className="icon-btn">
                        <Bell size={18} />
                    </button>
                    <div className="admin-profile-badge">
                        <div className="admin-avatar-small">{getInitials(currentUser.name)}</div>
                        <span>{currentUser.role.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Page Title Header */}
            <div className="page-header">
                <div>
                    <h1 className="dashboard-title">Employee Directory</h1>
                    <p className="dashboard-subtitle">Manage workforce records, roles, statuses and enroll new employees.</p>
                </div>
                <button className="btn-enroll-employee" style={{ backgroundColor: "#059669", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Plus size={16} />
                    <span>Enroll Employee</span>
                </button>
            </div>

            {/* ================= 4 STAT CARDS GRID ================= */}
            <div className="stats-grid">
                {/* Card 1: Total Employees */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box total-employees-icon">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="stat-label">Total Employees</p>
                            <p className="stat-value">{totalEmployeesCount}</p>
                        </div>
                    </div>
                    <p className="stat-description">Registered in database</p>
                </div>

                {/* Card 2: Active Staff */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box active-staff-icon">
                            <Users size={20} />
                            </div>
                            <div>
                                <p className="stat-label">Active Staff</p>
                                <p className="stat-value">{activeStaffCount}</p>
                            </div>
                        </div>
                        <p className="stat-description">Currently active</p>
                    </div>

                    {/* Card 3: Inactive Staff */}
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-box inactive-staff-icon">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="stat-label">Inactive Staff</p>
                                <p className="stat-value">{inactiveStaffCount}</p>
                            </div>
                        </div>
                        <p className="stat-description">Offboarded / On leave</p>
                    </div>

                    {/* Card 4: Departments */}
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-box depts-icon">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <p className="stat-label">Departments</p>
                                <p className="stat-value">{departmentsCountText}</p>
                            </div>
                        </div>
                        <p className="stat-description">{departmentNamesText}</p>
                    </div>
                </div>

                {/* ================= TABLE CARD / DIRECTORY SECTION ================= */}
                <div className="employee-directory-card">
                    {/* Filters Row */}
                    <div className="filters-row">
                        <div className="filters-left">
                            <span className="filters-label">
                                <Filter size={16} /> Filters:
                            </span>
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All Statuses">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <select
                                className="filter-select"
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                            >
                                <option value="All Departments">All Departments</option>
                                {departmentsList.map((d, index) => (
                                    <option key={index} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filters-right">
                            <span className="showing-indicator">
                                Showing {filteredEmployees.length} of {employees.length} employees
                            </span>
                        </div>
                    </div>

                    {/* Employee Directory Table */}
                    <div className="table-responsive">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>DEPARTMENT</th>
                                    <th>ROLE / EMPLOYMENT TYPE</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: "right", paddingRight: "24px" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "40px 0" }}>
                                            Loading employee records...
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "40px 0" }}>
                                            No employees match filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp, index) => (
                                        <tr key={index} className="employee-row">
                                            {/* Name & ID/Email */}
                                            <td>
                                                <div className="employee-avatar-wrapper">
                                                    <div className="employee-avatar-circle">
                                                        {getInitials(emp.name)}
                                                    </div>
                                                    <div>
                                                        <p className="employee-name-text">{emp.name}</p>
                                                        <p className="employee-meta-text">
                                                            {emp.employeeId || `EMP-${1000 + index}`} • {emp.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td>
                                                <span className="employee-dept-pill">
                                                    {emp.department || "IT"}
                                                </span>
                                            </td>

                                            {/* Role & Joining Date */}
                                            <td>
                                                <div>
                                                    <p className="employee-role-type">{emp.role || "Full-time"}</p>
                                                    <p className="employee-joining-date">
                                                        Joining: {emp.joiningDate || "2021-03-15"}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Status Pill */}
                                            <td>
                                                <span className={`employee-status-badge ${emp.status?.toLowerCase() === "active" ? "active" : "inactive"}`}>
                                                    <span className="bullet"></span>
                                                    {emp.status || "Active"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ textAlign: "right", paddingRight: "24px" }}>
                                                <div className="employee-action-buttons">
                                                    <button className="action-icon-btn" title="View details">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="action-icon-btn" title="Edit employee">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="action-icon-btn delete" title="Delete employee">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
        </div>
    );
}
