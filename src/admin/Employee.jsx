import { useState, useEffect } from "react";
import api from "../api";
import {
    Building2,
    Users,
    Plus,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    Filter,
    Search,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Fallback when backend returns no employees
const defaultEmployees = [];

export default function Employee() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [departmentsOptions, setDepartmentsOptions] = useState([]);
    const [designationsOptions, setDesignationsOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [deptFilter, setDeptFilter] = useState("All Departments");

    // Modal Control States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewingEmployee, setViewingEmployee] = useState(null);
    const [formError, setFormError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formErrors, setFormErrors] = useState({});
    const [currentUser] = useState(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.name) {
                    return {
                        id: parsed._id || parsed.id || "admin-01",
                        name: parsed.name,
                        role: parsed.role || "ADMIN"
                    };
                }
            } catch (e) {
                console.error(e);
            }
        }
        return { id: "admin-01", name: "Prasanna Ramana", role: "ADMIN" };
    });

    // Form State corresponding EXACTLY to employeeController.js required fields
    const [formData, setFormData] = useState({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gender: "Male",
        role: "employee",
        dob: "",
        address: "",
        joiningDate: "",
        departmentId: "",
        designationId: "",
        salary: "",
        employmentType: "Full-time",
        status: "Active",
        createdBy: currentUser.id || "admin-01"
    });
    // Fetch employees from backend and set state
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.getAllEmployees();
            console.debug("[Employee] fetched /employees =>", res);
            let list = [];
            if (Array.isArray(res)) {
                list = res;
            } else if (res && Array.isArray(res.employees)) {
                list = res.employees;
            } else if (res && res.success && Array.isArray(res.data)) {
                list = res.data;
            }

            if (list && list.length > 0) {
                const formatted = list.map(emp => ({
                    ...emp,
                    name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
                    department: emp.departmentId && typeof emp.departmentId === 'object' ? emp.departmentId.departmentName : (emp.department || emp.departmentId || 'General'),
                    departmentId: emp.departmentId && typeof emp.departmentId === 'object' ? emp.departmentId._id : emp.departmentId,
                    designation: emp.designationId && typeof emp.designationId === 'object' ? emp.designationId.designationName : (emp.designation || emp.designationId || ''),
                    designationId: emp.designationId && typeof emp.designationId === 'object' ? emp.designationId._id : emp.designationId,
                    role: emp.employmentType || emp.role || 'Full-time'
                }));
                setEmployees(formatted);
            } else {
                setEmployees(defaultEmployees);
            }
        } catch (err) {
            console.error("Failed to load employees:", err);
            setEmployees(defaultEmployees);
        } finally {
            setLoading(false);
        }
    };

    // Fetch departments and designations for form selects
    const fetchDepartmentsAndDesignations = async () => {
        try {
            const deps = await api.getDepartments();
            console.debug("[Employee] fetched /departments =>", deps);
            if (deps) setDepartmentsOptions(deps.departments || deps.data || deps || []);
        } catch (e) {
            console.warn("Failed to load departments for form", e);
        }

        try {
            const des = await api.getDesignations();
            console.debug("[Employee] fetched /designations =>", des);
            if (des) setDesignationsOptions(des.designations || des.data || des || []);
        } catch (e) {
            console.warn("Failed to load designations for form", e);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchDepartmentsAndDesignations();
    }, []);
    const getInitials = (name) => {
        if (!name) return "A";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Open Modal for New Employee Enrollment
    const handleOpenEnrollModal = () => {
        setEditingId(null);
        setFormError("");
        setFormErrors({});
        setFormData({
            employeeId: `EMP-${1001 + employees.length}`,
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            gender: "Male",
            role: "employee",
            dob: "",
            address: "",
            joiningDate: new Date().toISOString().split("T")[0],
            departmentId: departmentsOptions[0]?._id || departmentsOptions[0]?.departmentName || "",
            designationId: designationsOptions[0]?._id || "",
            salary: "",
            employmentType: "Permanent",
            status: "Active",
            createdBy: currentUser.id || "admin-01"
        });
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleEditClick = (emp) => {
        setEditingId(emp._id || emp.employeeId);
        setFormError("");
        setFormErrors({});
        setFormData({
            employeeId: emp.employeeId || "",
            firstName: emp.firstName || emp.name?.split(" ")[0] || "",
            lastName: emp.lastName || emp.name?.split(" ").slice(1).join(" ") || "",
            email: emp.email || "",
            password: "",
            confirmPassword: "",
            phone: emp.phone || "",
            gender: emp.gender || "Male",
            role: emp.role || "employee",
            dob: emp.dob || "",
            address: emp.address || "",
            joiningDate: emp.joiningDate || "",
            departmentId: emp.departmentId || emp.department || "",
            designationId: emp.designationId || emp.designationId || "",
            salary: emp.salary || "",
            employmentType: emp.employmentType || emp.role || "Permanent",
            status: emp.status || "Active",
            createdBy: emp.createdBy?._id || emp.createdBy || currentUser.id || "admin-01"
        });
        setIsModalOpen(true);
    };

    // Open View Modal
    const handleViewClick = (emp) => {
        setViewingEmployee(emp);
        setIsViewModalOpen(true);
    };

    // Form Input Change Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // clear per-field error when user edits the field
        setFormErrors(prev => {
            if (!prev || !prev[name]) return prev;
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });
    };

    // Submit Employee Enrollment Form (Validates backend requirements)
    const handleFormSubmit = async (e) => {
        console.log("Form Submitted");
        e.preventDefault();
        setFormError("");
        setFormErrors({});

        // Client-side field validations and duplicate checks
        const errors = {};
        if (!formData.employeeId) errors.employeeId = "Employee ID is required";
        if (!formData.firstName) errors.firstName = "First Name is required";
        if (!formData.lastName) errors.lastName = "Last Name is required";
        if (!formData.email) errors.email = "Email is required";
        if (!formData.phone) errors.phone = "Phone Number is required";
        if (!formData.gender) errors.gender = "Gender is required";
        if (!formData.role) errors.role = "Role is required";
        if (!formData.dob) errors.dob = "Date of Birth is required";
        if (!formData.address) errors.address = "Address is required";
        if (!formData.joiningDate) errors.joiningDate = "Joining Date is required";
        if (!formData.departmentId) errors.departmentId = "Department is required";
        if (!formData.salary && formData.salary !== 0) errors.salary = "Salary is required";
        if (!formData.employmentType) errors.employmentType = "Employment Type is required";
        if (!formData.status) errors.status = "Status is required";
        if (!formData.createdBy) errors.createdBy = "Created By is required";

        // Duplicate checks against loaded employees (allow same value when editing the same record)
        if (formData.email) {
            const emailLower = formData.email.toLowerCase();
            const found = employees.find(emp => emp.email && emp.email.toLowerCase() === emailLower);
            if (found && !(editingId && (found._id === editingId || found.employeeId === editingId))) {
                errors.email = "An account with this email already exists.";
            }
        }
        if (formData.employeeId) {
            const foundId = employees.find(emp => emp.employeeId && emp.employeeId === formData.employeeId);
            if (foundId && !(editingId && (foundId._id === editingId || foundId.employeeId === editingId))) {
                errors.employeeId = "Employee ID already exists.";
            }
        }

        // Phone validation (simple numeric + optional +, spaces, dashes)
        if (formData.phone) {
            const phoneRe = /^\+?[0-9\s-]{7,20}$/;
            if (!phoneRe.test(formData.phone)) {
                errors.phone = "Please enter a valid phone number (digits, optional +, 7-20 chars).";
            }
        }

        // When creating (not editing), require password fields for user account creation
        if (!editingId) {
            const pwd = formData.password || "";
            const confirm = formData.confirmPassword || "";
            const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!pwd) errors.password = "Password is required";
            else if (!pwdRe.test(pwd)) errors.password = "Password must be 8+ chars including upper, lower, number, special";
            if (!confirm) errors.confirmPassword = "Confirm your password";
            else if (pwd && confirm && pwd !== confirm) errors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setFormError("Please fix the highlighted errors and try again.");
            return;
        }

        const newEmployeeRecord = {
            ...formData,
            _id: editingId || `emp_${Date.now()}`,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            department: formData.departmentName || formData.department || formData.departmentId,
            role: formData.employmentType
        };

        if (editingId) {
            try {
                if (api.updateEmployee) {
                    const updatePayload = { ...formData };
                    delete updatePayload.password;
                    delete updatePayload.confirmPassword;
                    const updateRes = await api.updateEmployee(editingId, updatePayload);
                    console.debug("[Employee] update response =>", updateRes);
                    if (updateRes && updateRes.employee) {
                        // ok
                    } else if (updateRes && updateRes.message) {
                        setFormError(updateRes.message);
                    }
                }
            } catch (err) {
                console.warn("API update failed, updating state locally", err);
            }

            await fetchEmployees();
            setEmployees(prev => prev.map(emp => (emp._id === editingId || emp.employeeId === editingId) ? newEmployeeRecord : emp));
        } else {
            try {
                console.log("Sending Data:", formData);

                // Register user account first (auth)
                let registerRes = null;
                try {
                    registerRes = await api.registerUser({
                        name: `${formData.firstName} ${formData.lastName}`.trim(),
                        email: formData.email,
                        password: formData.password,
                        role: formData.role
                    });
                } catch (err) {
                    console.warn("Auth register failed:", err);
                }

                if (registerRes && registerRes.success === false) {
                    setFormError(registerRes.message || "Failed to create user account");
                    setFormErrors({ general: registerRes.message || "Failed to create user account" });
                    return;
                }

                // Prepare employee payload without auth fields
                const employeePayload = { ...formData };
                delete employeePayload.password;
                delete employeePayload.confirmPassword;

                const createRes = await api.createEmployee(employeePayload);
                console.log("Backend Response:", createRes);
                if (createRes && createRes.employee) {
                    setEmployees(prev => [createRes.employee, ...prev]);
                } else {
                    setEmployees(prev => [newEmployeeRecord, ...prev]);
                }

                await fetchEmployees();
            } catch (err) {
                console.log(err);
                setFormError(err?.message || "Failed to create employee");
            }
        }

        setFormError("");
        setFormErrors({});
        setIsModalOpen(false);
    };

    // Delete Handler
    const handleDeleteClick = async (empId) => {
        if (!window.confirm("Are you sure you want to delete this employee record?")) return;

        try {
            if (api.deleteEmployee) {
                await api.deleteEmployee(empId);
                await fetchEmployees();
            }
        } catch (err) {
            console.warn("API delete failed, removing locally", err);
        } finally {
            setEmployees(prev => prev.filter(e => e._id !== empId && e.employeeId !== empId));
        }
    };

    // Departments list for filter dropdown
    const departmentsList = Array.from(
        new Set(employees.map(e => e.department || e.departmentId).filter(Boolean))
    );
    if (departmentsList.length === 0) {
        departmentsList.push("IT", "Sales", "Admin", "Production");
    }

    // Dynamic Calculations
    const totalEmployeesCount = employees.length;
    const activeStaffCount = employees.filter(e => e.status?.toLowerCase() === "active").length;
    const inactiveStaffCount = employees.filter(e => e.status?.toLowerCase() === "inactive" || e.status?.toLowerCase() === "on leave" || e.status?.toLowerCase() === "offboarded").length;
    const departmentsCountText = `${departmentsList.length} Active`;
    const departmentNamesText = departmentsList.length > 0 ? departmentsList.join(", ") : "IT, Sales, Admin & Production";

    const filteredEmployees = employees.filter(e => {
        const nameMatches = e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const emailMatches = e.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const idMatches = e.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const roleMatches = (e.role || e.employmentType)?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesSearch = nameMatches || emailMatches || idMatches || roleMatches;

        const matchesStatus = statusFilter === "All Statuses" || e.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesDept = deptFilter === "All Departments" || (e.department || e.departmentId)?.toLowerCase() === deptFilter.toLowerCase();

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

            </div>

            {/* Page Title Header */}
            <div className="page-header">
                <div>
                    <h1 className="dashboard-title">Employee Directory</h1>
                    <p className="dashboard-subtitle">Manage workforce records, roles, statuses and enroll new employees.</p>
                </div>
                <button
                    className="btn-add-dept"
                    onClick={handleOpenEnrollModal}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                    <Plus size={16} />
                    <span>Add Employee</span>
                </button>
            </div>



            {/* Table Directory Section */}
            <div className="employee-directory-card">
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

                {/* Table */}
                <div className="table-responsive">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>DEPARTMENT</th>
                                <th>ROLE / EMPLOYMENT TYPE</th>
                                <th className="table-center-col">STATUS</th>
                                <th className="table-actions-col">ACTIONS</th>
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

                                        <td>
                                            <span className="employee-dept-pill">
                                                {emp.department || emp.departmentId || "IT"}
                                            </span>
                                        </td>

                                        <td>
                                            <div>
                                                <p className="employee-role-type">{emp.employmentType || emp.role || "Full-time"}</p>
                                                <p className="employee-joining-date">
                                                    Joining: {emp.joiningDate || "2021-03-15"}
                                                </p>
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`employee-status-badge ${emp.status?.toLowerCase() === "active" ? "active" : "inactive"}`}>
                                                <span className="bullet"></span>
                                                {emp.status || "Active"}
                                            </span>
                                        </td>

                                        <td className="table-actions-col">
                                            <div className="employee-action-buttons">
                                                <button className="action-icon-btn" title="View details" onClick={() => handleViewClick(emp)}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="action-icon-btn" title="Edit employee" onClick={() => handleEditClick(emp)}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="action-icon-btn delete" title="Delete employee" onClick={() => handleDeleteClick(emp._id || emp.employeeId)}>
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

            {/* ================= ENROLL / EDIT EMPLOYEE MODAL DIALOG ================= */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-card-wide">
                        <div className="modal-header">
                            <div>
                                <h2>{editingId ? "Edit Employee Record" : "Enroll New Employee"}</h2>
                                <p className="modal-subtitle">Fill in all required fields matching Employee Controller backend.</p>
                            </div>
                            <button className="btn-close" onClick={() => { setIsModalOpen(false); setFormError(""); setFormErrors({}); }}>
                                <X size={20} />
                            </button>
                        </div>

                        {formError && <div className="error-alert-banner">{formError}</div>}

                        <form onSubmit={handleFormSubmit} className="enroll-form">
                            {/* Grid Row 1: Employee ID & Created By */}
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Employee ID <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleInputChange}
                                        className={formErrors.employeeId ? 'input-error' : ''}
                                        placeholder="e.g. EMP-1005"
                                        required
                                    />
                                    {formErrors.employeeId && <div className="field-error">{formErrors.employeeId}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Created By <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="createdBy"
                                        value={formData.createdBy}
                                        onChange={handleInputChange}
                                        className={formErrors.createdBy ? 'input-error' : ''}
                                        placeholder="Admin Name"
                                        required
                                    />
                                    {formErrors.createdBy && <div className="field-error">{formErrors.createdBy}</div>}
                                </div>
                            </div>

                            {/* Grid Row 2: First Name & Last Name */}
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>First Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={formErrors.firstName ? 'input-error' : ''}
                                        placeholder="e.g. John"
                                        required
                                    />
                                    {formErrors.firstName && <div className="field-error">{formErrors.firstName}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Last Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={formErrors.lastName ? 'input-error' : ''}
                                        placeholder="e.g. Doe"
                                        required
                                    />
                                    {formErrors.lastName && <div className="field-error">{formErrors.lastName}</div>}
                                </div>
                            </div>

                            {/* Grid Row 3: Email & Phone */}
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Email Address <span className="req">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={formErrors.email ? 'input-error' : ''}
                                        placeholder="john.doe@company.com"
                                        required
                                    />
                                    {formErrors.email && <div className="field-error">{formErrors.email}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Phone Number <span className="req">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={formErrors.phone ? 'input-error' : ''}
                                        placeholder="+1 555-0199"
                                        required
                                    />
                                    {formErrors.phone && <div className="field-error">{formErrors.phone}</div>}
                                </div>
                            </div>

                            {/* Grid Row 4: Gender & Date of Birth */}
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Role <span className="req">*</span></label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className={formErrors.role ? 'input-error' : ''}
                                        required
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {formErrors.role && <div className="field-error">{formErrors.role}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Gender <span className="req">*</span></label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className={formErrors.gender ? 'input-error' : ''}
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {formErrors.gender && <div className="field-error">{formErrors.gender}</div>}
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Password <span className="req">*</span></label>
                                    <div className="password-input-wrap">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={formErrors.password ? 'input-error' : ''}
                                            placeholder="Min 8 chars, upper, lower, number, special"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {formErrors.password && <div className="field-error">{formErrors.password}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password <span className="req">*</span></label>
                                    <div className="password-input-wrap">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={formErrors.confirmPassword ? 'input-error' : ''}
                                            placeholder="Re-enter password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {formErrors.confirmPassword && <div className="field-error">{formErrors.confirmPassword}</div>}
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Date of Birth <span className="req">*</span></label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className={formErrors.dob ? 'input-error' : ''}
                                        required
                                    />
                                    {formErrors.dob && <div className="field-error">{formErrors.dob}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Address <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={formErrors.address ? 'input-error' : ''}
                                        placeholder="Full residential address..."
                                        required
                                    />
                                    {formErrors.address && <div className="field-error">{formErrors.address}</div>}
                                </div>
                            </div>

                            {/* Grid Row 5: Department & Salary */}
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Department <span className="req">*</span></label>
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleInputChange}
                                        className={formErrors.departmentId ? 'input-error' : ''}
                                        required
                                    >
                                        <option value="">Select department</option>
                                        {departmentsOptions && departmentsOptions.length > 0 ? (
                                            departmentsOptions.map((d) => (
                                                <option key={d._id} value={d._id}>{d.departmentName}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="IT">IT</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Production">Production</option>
                                                <option value="Admin">Admin</option>
                                                <option value="HR">HR</option>
                                            </>
                                        )}
                                    </select>
                                    {formErrors.departmentId && <div className="field-error">{formErrors.departmentId}</div>}
                                    <label style={{ marginTop: 8 }}>Designation</label>
                                    <select
                                        name="designationId"
                                        value={formData.designationId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select designation (optional)</option>
                                        {designationsOptions && designationsOptions.length > 0 ? (
                                            designationsOptions.map((ds) => (
                                                <option key={ds._id} value={ds._id}>{ds.designationName}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="IT">Software Engineer</option>
                                                <option value="Sales">HR Manager</option>
                                                <option value="Production">Project Manager</option>
                                                <option value="Admin">Senior Software Engineer</option>
                                                <option value="HR">Accountant</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Salary ($ / year) <span className="req">*</span></label>
                                    <input
                                        type="number"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleInputChange}
                                        className={formErrors.salary ? 'input-error' : ''}
                                        placeholder="e.g. 65000"
                                        required
                                    />
                                    {formErrors.salary && <div className="field-error">{formErrors.salary}</div>}
                                </div>
                            </div>

                            {/* Grid Row 6: Joining Date, Employment Type & Status */}
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Joining Date <span className="req">*</span></label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                        className={formErrors.joiningDate ? 'input-error' : ''}
                                        required
                                    />
                                    {formErrors.joiningDate && <div className="field-error">{formErrors.joiningDate}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Employment Type <span className="req">*</span></label>
                                    <select
                                        name="employmentType"
                                        value={formData.employmentType}
                                        onChange={handleInputChange}
                                        className={formErrors.employmentType ? 'input-error' : ''}
                                        required
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                    {formErrors.employmentType && <div className="field-error">{formErrors.employmentType}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Status <span className="req">*</span></label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={formErrors.status ? 'input-error' : ''}
                                        required
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                    {formErrors.status && <div className="field-error">{formErrors.status}</div>}
                                </div>
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => { setIsModalOpen(false); setFormError(""); setFormErrors({}); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingId ? "Update Employee Record" : "Enroll Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= VIEW EMPLOYEE DETAILS MODAL ================= */}
            {isViewModalOpen && viewingEmployee && (
                <div className="modal-backdrop">
                    <div className="modal-content-card view-card">
                        <div className="modal-header">
                            <div>
                                <h2>Employee Profile Details</h2>
                                <p className="modal-subtitle">Full record for {viewingEmployee.name}</p>
                            </div>
                            <button className="btn-close" onClick={() => setIsViewModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="profile-details-grid">
                            <div className="detail-item"><strong>ID:</strong> {viewingEmployee.employeeId}</div>
                            <div className="detail-item"><strong>Name:</strong> {viewingEmployee.name}</div>
                            <div className="detail-item"><strong>Email:</strong> {viewingEmployee.email}</div>
                            <div className="detail-item"><strong>Phone:</strong> {viewingEmployee.phone || "N/A"}</div>
                            <div className="detail-item"><strong>Gender:</strong> {viewingEmployee.gender || "N/A"}</div>
                            <div className="detail-item"><strong>Date of Birth:</strong> {viewingEmployee.dob || "N/A"}</div>
                            <div className="detail-item"><strong>Department:</strong> {viewingEmployee.department || viewingEmployee.departmentId}</div>
                            <div className="detail-item"><strong>Employment Type:</strong> {viewingEmployee.employmentType || viewingEmployee.role}</div>
                            <div className="detail-item"><strong>Joining Date:</strong> {viewingEmployee.joiningDate}</div>
                            <div className="detail-item"><strong>Salary:</strong> ${viewingEmployee.salary || "N/A"}</div>
                            <div className="detail-item"><strong>Status:</strong> {viewingEmployee.status}</div>
                            <div className="detail-item"><strong>Created By:</strong> {viewingEmployee.createdBy || "Admin"}</div>
                            <div className="detail-item full-width"><strong>Address:</strong> {viewingEmployee.address || "N/A"}</div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}