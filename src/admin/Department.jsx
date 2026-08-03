import React, { useState, useEffect } from "react";
//import "./Departments.css";

// Express Backend API URLs
const API_URL = "http://localhost:5000/departments";
const DASHBOARD_API = "http://localhost:5000/dashboard/admin";

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

const Departments = () => {
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
      const response = await fetch(DASHBOARD_API);
      if (response.ok) {
        const data = await response.json();
        if (data.dashboard) {
          setBackendTotalDepartments(data.dashboard.totalDepartments || 0);
          setBackendTotalEmployees(data.dashboard.totalEmployees || 0);
        }
      }
    } catch (error) {
      console.warn("Unable to load dashboard totals from backend:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        if (data.departments) {
          setDepartments(data.departments);
        }
      }
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
      const response = await fetch(`${API_URL}/department/${department._id}`);
      if (!response.ok) {
        throw new Error("Unable to fetch employees for department");
      }
      const data = await response.json();
      setSelectedDepartmentEmployees(data.employees || []);
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
      setErrorMsg(
        "Department Name, Description, Head Name, and Head Designation are required."
      );
      return;
    }

    if (editingId) {
      // PUT /api/departments/:id
      try {
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const data = await res.json();
          setDepartments((prev) =>
            prev.map((d) =>
              d._id === editingId ? data.department || { ...d, ...formData } : d
            )
          );
          fetchDashboardCounts();
        } else {
          setDepartments((prev) =>
            prev.map((d) => (d._id === editingId ? { ...d, ...formData } : d))
          );
        }
      } catch (err) {
        setDepartments((prev) =>
          prev.map((d) => (d._id === editingId ? { ...d, ...formData } : d))
        );
      }
    } else {
      // POST /api/departments
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const data = await res.json();
          setDepartments((prev) => [data.department, ...prev]);
          fetchDashboardCounts();
        } else {
          const newDept = {
            ...formData,
            _id: "65d8a" + Math.random().toString(36).substring(2, 9),
          };
          setDepartments((prev) => [newDept, ...prev]);
        }
      } catch (err) {
        const newDept = {
          ...formData,
          _id: "65d8a" + Math.random().toString(36).substring(2, 9),
        };
        setDepartments((prev) => [newDept, ...prev]);
      }
    }

    setIsModalOpen(false);
  };

  // DELETE /api/departments/:id
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchDashboardCounts();
    } catch (err) {
      console.warn("Offline delete fallback");
    } finally {
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    }
  };

  return (
    <div className="departments-page-container">
      {/* Top Search & Action Bar */}
      <div className="top-header">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="header-right">
          <button className="icon-btn" title="Notifications">
            🔔
          </button>
          <div className="admin-badge">
            <span className="badge-avatar">AB</span>
            <span className="badge-text">admin</span>
          </div>
          <button className="btn-add-dept" onClick={handleOpenAddModal}>
            + Add Department
          </button>
        </div>
      </div>

      {/* Page Heading */}
      <div className="page-header">
        <h1 className="page-title">Departments</h1>
        <p className="page-subtitle">
          Manage department structures, leadership, and team allocations.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrapper green">🏢</div>
          <div className="stat-info">
            <span className="stat-title">TOTAL DEPARTMENTS</span>
            <h2 className="stat-number">{displayedTotalDepartments}</h2>
            <span className="stat-subtext">Active organizational units</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper teal">👥</div>
          <div className="stat-info">
            <span className="stat-title">TOTAL EMPLOYEES</span>
            <h2 className="stat-number">{displayedTotalEmployees}</h2>
            <span className="stat-subtext">Across all departments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">👔</div>
          <div className="stat-info">
            <span className="stat-title">DEPARTMENT HEADS</span>
            <h2 className="stat-number">{totalHeads}</h2>
            <span className="stat-subtext">Assigned team leaders</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        <div className="table-header">
          <h3>All Departments List</h3>
          <span className="badge-dept-count">
            {displayedTotalDepartments} Departments
          </span>
        </div>

        <div className="table-wrapper">
          <table className="departments-table">
            <thead>
              <tr>
                <th>D_ID</th>
                <th>DEPARTMENT NAME</th>
                <th>HEAD NAME</th>
                <th>HEAD DESIGNATION</th>
                <th>DESCRIPTION</th>
                <th>NO. OF EMPLOYEES</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
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
                        <span className="id-badge" title={dept._id}>
                          {shortId}
                        </span>
                      </td>
                      <td className="font-bold text-dark">{dept.departmentName}</td>
                      <td className="font-semibold">{dept.headName}</td>
                      <td className="text-muted">{dept.headDesignation}</td>
                      <td className="description-cell">{dept.description}</td>
                      <td>
                        <span className="emp-count-pill">
                          👤 {dept.employeeCount || 0}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn-action edit"
                          onClick={() => handleEditClick(dept)}
                          title="Edit Department"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDeleteClick(dept._id)}
                          title="Delete Department"
                        >
                          🗑️
                        </button>
                        <button
                          className="btn-action view"
                          onClick={() => fetchDepartmentEmployees(dept)}
                          title="View Department Employees"
                        >
                          👥
                        </button>
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
        <div className="department-employees-panel">
          <div className="panel-header">
            <h3>Employees in {selectedDepartment.departmentName}</h3>
            <span className="badge-employee-count">
              {selectedDepartmentEmployees.length} employee
              {selectedDepartmentEmployees.length === 1 ? "" : "s"}
            </span>
          </div>

          {employeesLoading ? (
            <p>Loading employees...</p>
          ) : employeesError ? (
            <p className="error-message">{employeesError}</p>
          ) : selectedDepartmentEmployees.length === 0 ? (
            <p className="empty-row">
              No employees assigned to this department.
            </p>
          ) : (
            <div className="employees-table-wrapper">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Designation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDepartmentEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>{`${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "—"}</td>
                      <td>{employee.email || "—"}</td>
                      <td>{employee.phone || "—"}</td>
                      <td>{employee.designationId?.name || employee.designationId || "—"}</td>
                      <td>{employee.status || "—"}</td>
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
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingId ? "Edit Department" : "Add New Department"}</h3>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {errorMsg && <div className="error-message">{errorMsg}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>
                  Department Name <span className="text-red">*</span>
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

              <div className="form-grid-2">
                <div className="form-field">
                  <label>
                    Head Name <span className="text-red">*</span>
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

                <div className="form-field">
                  <label>
                    Head Designation <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="headDesignation"
                    value={formData.headDesignation}
                    onChange={handleInputChange}
                    placeholder="e.g. Manager, Director"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
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

              <div className="form-field">
                <label>
                  Description <span className="text-red">*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of department duties..."
                  required
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
                <button type="submit" className="btn-submit">
                  {editingId ? "Update Department" : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;