import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader,
} from "lucide-react";
import api from "../api";

export default function Departments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
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
  const [loading, setLoading] = useState(false);

  // Form State corresponding to departmentController.js fields
  const [formData, setFormData] = useState({
    departmentName: "",
    headName: "",
    headDesignation: "",
    employeeCount: 0,
    description: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchDashboardCounts();
  }, []);

  const fetchDashboardCounts = async () => {
    try {
      const res = await api.getAdminDashboard();
      if (res?.dashboard) {
        setBackendTotalDepartments(res.dashboard.totalDepartments || 0);
        setBackendTotalEmployees(res.dashboard.totalEmployees || 0);
      }
    } catch (error) {
      console.warn("Unable to load dashboard totals from backend:", error);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      if (Array.isArray(res)) {
        setDepartments(res);
      } else if (res?.departments) {
        setDepartments(res.departments);
      } else if (res?.data) {
        setDepartments(res.data);
      }
    } catch (error) {
      console.warn("Backend API offline or failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentEmployees = async (department) => {
    if (!department?._id) return;

    setEmployeesLoading(true);
    setEmployeesError("");
    setSelectedDepartment(department);

    try {
      const res = await api.getDepartmentEmployees(department._id);
      if (Array.isArray(res)) {
        setSelectedDepartmentEmployees(res);
      } else {
        setSelectedDepartmentEmployees(res?.employees || res?.data || []);
      }
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
        const data = await api.updateDepartment(editingId, formData);
        if (data?.department) {
          await fetchDepartments();
          await fetchDashboardCounts();
        } else {
          setErrorMsg(data?.message || "Failed to update department.");
          return;
        }
      } catch (err) {
        setErrorMsg(err?.message || "Failed to update department.");
        return;
      }
    } else {
      try {
        const data = await api.createDepartment(formData);
        if (data?.department) {
          await fetchDepartments();
          await fetchDashboardCounts();
        } else {
          setErrorMsg(data?.message || "Failed to create department.");
          return;
        }
      } catch (err) {
        setErrorMsg(err?.message || "Failed to create department.");
        return;
      }
    }

    setIsModalOpen(false);
  };

  // DELETE /api/departments/:id
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await api.deleteDepartment(id);
      await fetchDepartments();
      await fetchDashboardCounts();
    } catch (err) {
      setErrorMsg(err?.message || "Failed to delete department.");
    }
  };

  return (
    <div className="departments-page-container">
      {/* Top Search & Action Bar */}
      <div className="top-header" style={{ marginBottom: "24px" }}>
        <div className="search-box" style={{ display: "flex", alignItems: "center" }}>
          <Search size={16} className="search-icon" style={{ marginRight: "8px" }} />
          <input
            type="text"
            placeholder="Search Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="header-right relative" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="icon-btn" title="Notifications" onClick={() => navigate("/admin/notices")} style={{ color: "black" }}>
            <Bell size={18} />
          </button>
          <div className="admin-badge cursor-pointer flex items-center gap-2" onClick={() => setShowProfileInfo((prev) => !prev)}>
            <span className="badge-avatar">AB</span>
            <span className="badge-text">admin</span>
          </div>
          {showProfileInfo && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">AB</div>
                <div>
                  <div className="font-bold">Admin</div>
                  <div className="text-xs text-slate-500">Administrator</div>
                </div>
              </div>
              <button
                className="w-full rounded-md py-2 bg-emerald-700 text-white"
                onClick={() => {
                  navigate("/admin/settings");
                  setShowProfileInfo(false);
                }}
              >
                View Profile Settings
              </button>
            </div>
          )}
          <button className="btn-add-dept" onClick={handleOpenAddModal} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Page Heading */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Departments</h1>
        <p className="page-subtitle">Manage department structures, leadership, and team allocations.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div className="stat-card stat-card-green">
          <div className="stat-icon-wrapper green" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">TOTAL DEPARTMENTS</span>
            <h2 className="stat-number">{displayedTotalDepartments}</h2>
            <span className="stat-subtext">Active organizational units</span>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-icon-wrapper teal" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">TOTAL EMPLOYEES</span>
            <h2 className="stat-number">{displayedTotalEmployees}</h2>
            <span className="stat-subtext">Across all departments</span>
          </div>
        </div>

        <div className="stat-card stat-card-teal">
          <div className="stat-icon-wrapper blue" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">DEPARTMENT HEADS</span>
            <h2 className="stat-number">{totalHeads}</h2>
            <span className="stat-subtext">Assigned team leaders</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card" style={{ padding: "24px" }}>
        <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0 , color: "black" }}>All Departments List</h3>
          <span
            className="badge-dept-count"
            style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: "#ecfdf5", color: "#065f46", fontSize: "12px", fontWeight: "700" }}
          >
            {displayedTotalDepartments} Departments
          </span>
        </div>

        <div className="table-wrapper">
          <table className="departments-table table-fixed">
            <thead>
              <tr>
                <th className="table-col-xs">D_ID</th>
                <th className="table-col-xl">DEPARTMENT NAME</th>
                <th className="table-col-lg">HEAD NAME</th>
                <th className="table-col-lg">HEAD DESIGNATION</th>
                <th className="table-col-xl">DESCRIPTION</th>
                <th className="table-col-sm">NO. OF EMPLOYEES</th>
                <th className="table-col-actions table-actions-col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-row" style={{ textAlign: "center", padding: "30px 0" }}>
                    Loading departments...
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
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
                      <td style={{ padding: "4px 8px" }}>
                        <span className="id-badge" title={dept._id}>
                          {shortId}
                        </span>
                      </td>
                      <td className="font-bold text-dark" style={{ padding: "4px 8px", fontWeight: "700" }}>
                        {dept.departmentName}
                      </td>
                      <td className="font-semibold" style={{ padding: "4px 8px", fontWeight: "600", color: "#9ea0a5" }}>
                        {dept.headName}
                      </td>
                      <td className="text-muted" style={{ padding: "4px 8px", color: "#64748b" }}>
                        {dept.headDesignation}
                      </td>
                      <td className="description-cell" style={{ padding: "4px 8px" }}>
                        {dept.description}
                      </td>
                      <td style={{ padding: "4px 8px" }}>
                        <span className="emp-count-pill" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <User size={12} /> {dept.employeeCount || 0}
                        </span>
                      </td>
                      <td className="text-right" style={{ padding: "4px 8px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            className="btn-action edit"
                            onClick={() => handleEditClick(dept)}
                            title="Edit Department"
                            style={{ padding: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-action delete"
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
            <span
              className="badge-employee-count"
              style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: "#ecfdf5", color: "#065f46", fontSize: "12px", fontWeight: "700" }}
            >
              {selectedDepartmentEmployees.length} employee{selectedDepartmentEmployees.length === 1 ? "" : "s"}
            </span>
          </div>

          {employeesLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "30px" }}>
              <Loader className="animate-spin" size={20} color="#0f766e" />
            </div>
          ) : employeesError ? (
            <p className="error-message" style={{ color: "#b91c1c", backgroundColor: "#fef2f2", padding: "10px", borderRadius: "6px" }}>
              {employeesError}
            </p>
          ) : selectedDepartmentEmployees.length === 0 ? (
            <p className="empty-row" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
              No employees assigned to this department.
            </p>
          ) : (
            <div className="employees-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              {selectedDepartmentEmployees.map((employee) => {
                const initials = `${(employee.firstName || "").charAt(0)}${(employee.lastName || "").charAt(0)}`.toUpperCase();
                return (
                  <div
                    key={employee._id}
                    className="employee-card"
                    style={{ background: "#fff", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12, display: "flex", gap: 12, alignItems: "center" }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "linear-gradient(135deg,#065f46,#10b981)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      {initials || "—"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a" }}>
                            {`${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "—"}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {employee.designationId?.name || employee.designationId || "—"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{employee.status || "—"}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 13, color: "#334155" }}>
                        <div>{employee.email || "—"}</div>
                        <div style={{ opacity: 0.9 }}>{employee.phone || "—"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Department Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-content-card-wide">
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Department" : "Add New Department"}</h2>
                <p className="modal-subtitle">Configure organizational groups and heads.</p>
              </div>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ color: "#b91c1c", backgroundColor: "#fef2f2", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="enroll-form" style={{backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px"}}>
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
                    placeholder="e.g. Manager..."
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
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
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