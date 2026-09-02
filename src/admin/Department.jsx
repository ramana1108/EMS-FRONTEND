import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Building2,
  Users,
  Briefcase,
  User,
  Edit,
  Trash2,
  X,
  Plus,
  Loader
} from "lucide-react";
import api from "../api";
import PredictiveSearchBar from "../components/PredictiveSearchBar";

// Initial Demo Data matching your exact layout
const INITIAL_DEMO_DATA = [
  {
    _id: "65d8a1f2e4b01234567890a1",
    departmentName: "Production",
    headName: "Brank Kahter",
    headDesignation: "Director",
    description: "Responsible for manufacturing, quality control, and assembly line management.",
    employeeCount: 83,
  },
  {
    _id: "65d8a1f2e4b01234567890a2",
    departmentName: "Sales",
    headName: "Jumn Denner",
    headDesignation: "Manager",
    description: "Handles customer acquisition, client partnerships, and revenue growth.",
    employeeCount: 50,
  },
  {
    _id: "65d8a1f2e4b01234567890a3",
    departmentName: "IT",
    headName: "Chris Shanter",
    headDesignation: "Foster Manager",
    description: "Maintains IT infrastructure, software systems, network security, and support.",
    employeeCount: 50,
  },
  {
    _id: "65d8a1f2e4b01234567890a4",
    departmentName: "HR / Admin",
    headName: "Mark Rooper",
    headDesignation: "Phahid Manager",
    description: "Oversees recruitment, employee relations, payroll support, and HR policies.",
    employeeCount: 25,
  },
];

export default function Departments() {
  const [departments, setDepartments] = useState(INITIAL_DEMO_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [backendTotalDepartments, setBackendTotalDepartments] = useState(null);
  const [backendTotalEmployees, setBackendTotalEmployees] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDepartmentEmployees, setSelectedDepartmentEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");

  // Form State corresponding to departmentController.js fields
  const [formData, setFormData] = useState({
    departmentName: "",
    headName: "",
    headDesignation: "",
    employeeCount: 0,
    description: "",
  });

  // Fetch Departments from Express API
  useEffect(() => {
    fetchDepartments();
    fetchDashboardCounts();
  }, []);

  const fetchDashboardCounts = async () => {
    try {
      const data = await api.getAdminDashboard();
      if (data && data.dashboard) {
        setBackendTotalDepartments(data.dashboard.totalDepartments || 0);
        setBackendTotalEmployees(data.dashboard.totalEmployees || 0);
      }
    } catch (error) {
      console.warn("Unable to load dashboard totals from backend:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments();
      if (data) setDepartments(data.departments || data.data || []);
    } catch (error) {
      console.warn("Backend API offline. Using local demo state.", error);
    }
  };

  const fetchDepartmentEmployees = async (department) => {
    if (!department?._id) return;

    setEmployeesLoading(true);
    setEmployeesError("");
    setSelectedDepartment(department);

    try {
      const data = await api.getDepartmentEmployees(department._id);
      setSelectedDepartmentEmployees(data.employees || data.data || []);
    } catch (error) {
      console.warn(error);
      setEmployeesError("Could not load department employees.");
      setSelectedDepartmentEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Stat Counters
  const totalDepartments = departments.length;
  const totalEmployees = departments.reduce(
    (acc, item) => acc + Number(item.employeeCount || 0),
    0
  );
  const totalHeads = departments.filter((d) => d.headName).length;
  const displayedTotalDepartments = backendTotalDepartments || totalDepartments;
  const displayedTotalEmployees = backendTotalEmployees || totalEmployees;

  // Search Filter
  const filteredDepartments = departments.filter((dept) => {
    const q = searchQuery.toLowerCase();
    return (
      dept.departmentName?.toLowerCase().includes(q) ||
      dept.headName?.toLowerCase().includes(q) ||
      dept.headDesignation?.toLowerCase().includes(q) ||
      dept.description?.toLowerCase().includes(q)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "employeeCount" ? Number(value) : value,
    }));
  };
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      departmentName: "",
      headName: "",
      headDesignation: "",
      employeeCount: 0,
      description: "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleEditClick = (dept) => {
    setEditingId(dept._id);
    setFormData({
      departmentName: dept.departmentName || "",
      headName: dept.headName || "",
      headDesignation: dept.headDesignation || "",
      employeeCount: dept.employeeCount || 0,
      description: dept.description || "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Create (POST) or Update (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.departmentName ||
      !formData.description ||
      !formData.headName ||
      !formData.headDesignation
    ) {
      setErrorMsg("Department Name, Description, Head Name and Head Designation are required");
      return;
    }

    if (editingId) {
      try {
        const res = await api.updateDepartment(editingId, formData);
        if (res && res.department) {
          setDepartments((prev) => prev.map((d) => (d._id === editingId ? res.department : d)));
          fetchDashboardCounts();
        } else {
          setDepartments((prev) => prev.map((d) => (d._id === editingId ? { ...d, ...formData } : d)));
        }
      } catch (err) {
        setDepartments((prev) => prev.map((d) => (d._id === editingId ? { ...d, ...formData } : d)));
      }
    } else {
      try {
        const res = await api.createDepartment(formData);
        if (res && res.department) {
          setDepartments((prev) => [res.department, ...prev]);
          fetchDashboardCounts();
        } else {
          const newDept = { ...formData, _id: "temp-" + Math.random().toString(36).substring(2, 9) };
          setDepartments((prev) => [newDept, ...prev]);
        }
      } catch (err) {
        const newDept = { ...formData, _id: "temp-" + Math.random().toString(36).substring(2, 9) };
        setDepartments((prev) => [newDept, ...prev]);
      }
    }

    setIsModalOpen(false);
  };

  // DELETE /api/departments/:id
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await api.deleteDepartment(id);
      if (res) fetchDashboardCounts();
    } catch (err) {
      console.warn("Offline delete fallback");
    } finally {
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    }
  };

  return (
    <div className="departments-page-container">
      {/* Page Heading */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="page-title" style={{ color: "#172033" }}>Departments</h1>
          <p className="page-subtitle" style={{ color: "#64748B", fontSize: "14px" }}>
            Manage department structures, leadership, and team allocations.
          </p>
        </div>
        <PredictiveSearchBar placeholder="Search Employees, Notices, Departments..." />
        <button className="btn-add-dept" onClick={handleOpenAddModal} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="stat-card stat-card-green">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Building2 size={22} />
            </div>
            <div>
              <p className="stat-label">TOTAL DEPARTMENTS</p>
              <p className="stat-value">{displayedTotalDepartments}</p>
            </div>
          </div>
          <p className="stat-description">Active organizational units</p>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Users size={22} />
            </div>
            <div>
              <p className="stat-label">TOTAL EMPLOYEES</p>
              <p className="stat-value">{displayedTotalEmployees}</p>
            </div>
          </div>
          <p className="stat-description">Across all departments</p>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Briefcase size={22} />
            </div>
            <div>
              <p className="stat-label">DEPARTMENT HEADS</p>
              <p className="stat-value">{totalHeads}</p>
            </div>
          </div>
          <p className="stat-description">Assigned team leaders</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card" style={{ padding: "24px" }}>
        <div className="table-header flex justify-between items-center mb-4">
          <h3 style={{ margin: 0, color: "#172033", fontSize: "18px", fontWeight: "700" }}>All Departments List</h3>
          <span className="badge-dept-count" style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: "#EAF2FF", color: "#2563EB", fontSize: "12px", fontWeight: "700", border: "1px solid #D7E7FF" }}>
            {displayedTotalDepartments} Departments
          </span>
        </div>

        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr style={{ fontSize: "14px", fontWeight: "600" }}>
                <th style={{ width: "80px" }}>D_ID</th>
                <th>DEPARTMENT NAME</th>
                <th>HEAD NAME</th>
                <th>HEAD DESIGNATION</th>
                <th>DESCRIPTION</th>
                <th className="table-number-col">NO. OF EMPLOYEES</th>
                <th className="table-actions-col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row" style={{ textAlign: "center", padding: "30px 0" }}>
                    No departments found. Click "+ Add Department" to add a new department.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => {
                  const shortId = dept._id
                    ? `D-${dept._id.substring(dept._id.length - 6).toUpperCase()}`
                    : "D-NEW";

                  return (
                    <tr key={dept._id}>
                      <td>
                        <span className="employee-dept-pill" title={dept._id}>
                          {shortId}
                        </span>
                      </td>
                      <td className="font-bold text-[#172033]">{dept.departmentName}</td>
                      <td className="font-semibold">{dept.headName}</td>
                      <td className="text-[#64748B]">{dept.headDesignation}</td>
                      <td className="description-cell text-[#64748B]">{dept.description}</td>
                      <td className="table-number-col">
                        <span className="employee-dept-pill" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <User size={12} /> {dept.employeeCount || 0}
                        </span>
                      </td>
                      <td className="table-actions-col">
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            className="action-icon-btn"
                            onClick={() => handleEditClick(dept)}
                            title="Edit Department"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="action-icon-btn delete"
                            onClick={() => handleDeleteClick(dept._id)}
                            title="Delete Department"
                            style={{ padding: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            className="btn-action view"
                            onClick={() => fetchDepartmentEmployees(dept)}
                            title="View Department Employees"
                            style={{ padding: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Users size={14} />
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

      {selectedDepartment && (
        <div className="department-employees-panel" style={{ marginTop: "24px" }}>
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>Employees in {selectedDepartment.departmentName}</h3>
            <span className="badge-employee-count" style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: "#ecfdf5", color: "#065f46", fontSize: "12px", fontWeight: "700" }}>
              {selectedDepartmentEmployees.length} employee
              {selectedDepartmentEmployees.length === 1 ? "" : "s"}
            </span>
          </div>

          {employeesLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "30px" }}>
              <Loader className="animate-spin" size={20} color="#0f766e" />
            </div>
          ) : employeesError ? (
            <p className="error-message" style={{ color: "#b91c1c", backgroundColor: "#fef2f2", padding: "10px", borderRadius: "6px" }}>{employeesError}</p>
          ) : selectedDepartmentEmployees.length === 0 ? (
            <p className="empty-row" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
              No employees assigned to this department.
            </p>
          ) : (
            <div className="employees-table-wrapper">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th style={{ padding: "4px 8px" }}>Name</th>
                    <th style={{ padding: "4px 8px" }}>Email</th>
                    <th style={{ padding: "4px 8px" }}>Phone</th>
                    <th style={{ padding: "4px 8px" }}>Designation</th>
                    <th style={{ padding: "4px 8px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDepartmentEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td style={{ padding: "4px 8px" }}>{`${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "—"}</td>
                      <td style={{ padding: "4px 8px" }}>{employee.email || "—"}</td>
                      <td style={{ padding: "4px 8px" }}>{employee.phone || "—"}</td>
                      <td style={{ padding: "4px 8px" }}>{employee.designationId?.name || employee.designationId || "—"}</td>
                      <td style={{ padding: "4px 8px" }}>{employee.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Department Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card-wide">
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Department" : "Add New Department"}</h2>
                <p className="modal-subtitle">Configure organizational groups and heads.</p>
              </div>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ color: "#b91c1c", backgroundColor: "#fef2f2", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="enroll-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Department Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleInputChange}
                    placeholder="e.g. Production, Sales, IT"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Number of Employees</label>
                  <input
                    type="number"
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Head Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="headName"
                    value={formData.headName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Head Designation <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="headDesignation"
                    value={formData.headDesignation}
                    onChange={handleInputChange}
                    placeholder="e.g. Manager... "
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Description <span className="req">*</span>
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of department duties..."
                  required
                  style={{ minHeight: "60px", resize: "vertical" }}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Plus size={16} />
                  <span>{editingId ? "Update Department" : "Save Department"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}