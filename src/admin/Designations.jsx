import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import {
  Building2,
  Award,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  X,
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
        setError(data?.message || `Failed to ${editingId ? "update" : "create"} designation`);
      }
    } catch (err) {
      console.error(err);
      setError(`An error occurred while ${editingId ? "updating" : "creating"} designation`);
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
    const assigned = freshEmployees.filter((emp) => {
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
          <h1 className="text-2xl font-bold" style={{color:"black"}}>{activeView === "departments" ? "Departments" : "Designations"}</h1>
          <p className="text-sm text-slate-600">
            {activeView === "departments"
              ? "Oversee organizational structures, heads, and descriptions."
              : "Manage and assign organizational job designations."}
          </p>
        </div>
        <button className="btn-enroll-employee" onClick={openAddModal} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

      {success && <div className="text-emerald-800 bg-emerald-50 p-3 rounded-md mb-4">{success}</div>}

      {/* Full-width container */}
      <div className="w-full">
        {/* Render Departments View */}
        {activeView === "departments" && (
          <div className="employee-directory-card" style={{ padding: "24px" }}>
            <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Department List</h2>

            <div className="table-responsive">
              <table className="employee-table table-fixed">
                <thead>
                  <tr>
                    <th className="table-col-xl">DEPARTMENT NAME</th>
                    <th className="table-col-3xl">DESCRIPTION</th>
                    <th className="table-col-lg">DEPARTMENT HEAD</th>
                    <th className="table-col-sm table-center-col">EMPLOYEES</th>
                    <th className="table-col-actions table-actions-col">ACTIONS</th>
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
                        <td
                          style={{
                            padding: "4px 8px",
                            color: "#64748b",
                            fontSize: "13px",
                            maxWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
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
            <h2 className="emp-card-title" style={{ marginBottom: "16px" }}>Designation List</h2>

            <div className="table-responsive">
              <table className="employee-table table-fixed">
                <thead>
                  <tr>
                    <th className="table-col-3xl">EMPLOYEE NAME(S)</th>
                    <th className="table-col-lg">DESIGNATION</th>
                    <th className="table-col-lg">DEPARTMENT</th>
                    <th className="table-col-actions table-actions-col">ACTIONS</th>
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
                      const desigEmployees = employees.filter((emp) => {
                        const empDesigId = emp.designationId?._id || emp.designationId;
                        return String(empDesigId) === String(desig._id);
                      });
                      const employeeNames =
                        desigEmployees.map((emp) => `${emp.firstName || ""} ${emp.lastName || ""}`.trim()).join(", ") || "—";
                      return (
                        <tr key={desig._id} className="employee-row">
                          <td style={{ padding: "4px 8px", color: "#475569", fontSize: "13px" }}>{employeeNames}</td>
                          <td style={{ padding: "4px 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Award size={16} color="#8b5cf6" />
                              <span style={{ fontWeight: "600", color: "#1f2937" }}>{desig.designationName}</span>
                            </div>
                          </td>
                          <td style={{ padding: "4px 8px" }}>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#374151",
                                padding: "3px 8px",
                                backgroundColor: "#f3f4f6",
                                borderRadius: "12px",
                              }}
                            >
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
                  {activeView === "departments" ? "Add Department" : editingId ? "Edit Designation" : "Add Designation"}
                </h2>
                <p className="modal-subtitle">
                  {activeView === "departments"
                    ? "Provide details to create new department."
                    : editingId
                    ? "Update existing designation details."
                    : "Provide details to create new designation."}
                </p>
              </div>
              <button
                className="btn-close"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingId(null);
                  setDesigName("");
                  setDesigDeptId("");
                  setDesigEmployeeId("");
                }}
              >
                <X size={20} />
              </button>
            </div>

            {activeView === "departments" ? (
              <form onSubmit={handleAddDepartment} className="enroll-form">
                <div className="form-group">
                  <label>
                    Department Name <span className="req">*</span>
                  </label>
                  <input type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. Human Resources" required />
                </div>
                <div className="form-group">
                  <label>
                    Description <span className="req">*</span>
                  </label>
                  <textarea
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    placeholder="Brief description..."
                    style={{ minHeight: "80px", resize: "vertical" }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Head of Department Name <span className="req">*</span>
                  </label>
                  <input type="text" value={deptHead} onChange={(e) => setDeptHead(e.target.value)} placeholder="e.g. John Doe" required />
                </div>
                <div className="form-group">
                  <label>
                    Head Designation <span className="req">*</span>
                  </label>
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
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    <Plus size={16} />
                    <span>Create Department</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddDesignation} className="enroll-form">
                <div className="form-group">
                  <label>
                    Designation Name <span className="req">*</span>
                  </label>
                  <input type="text" value={desigName} onChange={(e) => setDesigName(e.target.value)} placeholder="e.g. Lead Engineer" required style={{ minHeight: "40px", color:"black" }} />
                </div>

                <div className="form-group">
                  <label>
                    Department <span className="req">*</span>
                  </label>
                  <select value={desigDeptId} onChange={(e) => setDesigDeptId(e.target.value)} required style={{ minHeight: "40px", color:"black" }}>
                    <option value="" style={{ color: "gray" }}>
                      Select Department...
                    </option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign Employee (Optional)</label>
                  <select value={desigEmployeeId} onChange={(e) => setDesigEmployeeId(e.target.value)} style={{ minHeight: "40px", color:"black" }}>
                    <option value="" style={{ color: "gray" }}>
                      Select Employee...
                    </option>
                    {employees.length === 0 ? (
                      <option value="">No employees available</option>
                    ) : (
                      employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeId || emp._id})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {editingId && (
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 12, color: "#64748b" }}>Current assigned employees</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      {currentAssignedEmployees.length === 0 ? (
                        <div style={{ color: "#64748b", fontSize: 13 }}>No employees assigned to this designation.</div>
                      ) : (
                        currentAssignedEmployees.map((emp) => (
                          <span
                            key={emp._id}
                            style={{
                              background: "#f1f5f9",
                              color: "#0f172a",
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 13,
                              border: "1px solid #e2e8f0",
                            }}
                          >
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
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingId(null);
                      setDesigName("");
                      setDesigDeptId("");
                      setDesigEmployeeId("");
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
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