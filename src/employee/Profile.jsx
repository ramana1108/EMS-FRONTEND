import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import {
    Mail,
    Camera,
    CheckCircle,
    AlertCircle,
    Menu
} from "lucide-react";
import api from "../api";

export default function Profile() {
    const [activeTab, setActiveTab] = useState("Profile");
    const [isOpen, setIsOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [employee, setEmployee] = useState(null);
    const [user, setUser] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const fileInputRef = useRef(null);

    // Form Fields (aligned to backend Profile model)
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    const [formData, setFormData] = useState({
        employeeId: "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        email: "",
        phone: "",
        role: "Employee",
        departmentId: "",
        designationId: "",
        salary: "",
        joiningDate: "",
        employmentType: "Permanent",
        status: "Active",
        address: "",
        profileImage: ""
    });

    const handleCameraClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError("Image size should be less than 2MB");
            return;
        }

        setError("");
        setSuccess("");
        setSaving(true);

        const reader = new FileReader();
        reader.onload = async () => {
            const base64Data = reader.result;
            setPreviewImage(base64Data);

            if (employee?.employeeId) {
                try {
                    const updatePayload = { profileImage: base64Data };
                    const result = await api.updateProfile(employee.employeeId, updatePayload);
                    if (result && result.success) {
                        setSuccess("Profile photo updated successfully!");
                        setEmployee(result.profile || { ...employee, profileImage: base64Data });
                    } else {
                        setError(result.message || "Failed to update profile photo.");
                    }
                } catch (err) {
                    console.error("Failed to save profile photo:", err);
                    setError("Error saving profile photo to database.");
                } finally {
                    setSaving(false);
                }
            } else {
                setSaving(false);
                setSuccess("Profile photo updated locally.");
            }
        };
        reader.onerror = () => {
            setError("Failed to read image file.");
            setSaving(false);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(loggedInUser);

        const loadProfile = async () => {
            setLoading(true);
            setError("");
            try {
                // load reference lists
                const deps = await api.getDepartments();
                const desigs = await api.getDesignations();
                setDepartments(Array.isArray(deps) ? deps : deps?.departments || []);
                setDesignations(Array.isArray(desigs) ? desigs : desigs?.designations || []);

                // load profiles and match by email
                const all = await api.getProfiles();
                const list = Array.isArray(all) ? all : all?.profiles || [];

                let found = null;
                if (loggedInUser?.email) {
                    found = list.find((p) => p.email?.toLowerCase() === loggedInUser.email.toLowerCase());
                }

                if (found) {
                    setEmployee(found);
                    setFormData({
                        employeeId: found.employeeId || "",
                        firstName: found.firstName || "",
                        lastName: found.lastName || "",
                        dob: found.dob ? found.dob.split("T")[0] : "",
                        gender: found.gender || "Male",
                        email: found.email || "",
                        phone: found.phone || "",
                        role: found.role || "Employee",
                        departmentId: found.departmentId?._id || found.departmentId || "",
                        designationId: found.designationId?._id || found.designationId || "",
                        salary: found.salary || "",
                        joiningDate: found.joiningDate ? found.joiningDate.split("T")[0] : "",
                        employmentType: found.employmentType || "Permanent",
                        status: found.status || "Active",
                        address: found.address || "",
                        profileImage: found.profileImage || ""
                    });
                    setPreviewImage(found.profileImage || "");
                } else if (loggedInUser) {
                    setFormData((prev) => ({
                        ...prev,
                        firstName: loggedInUser.name?.split(" ")[0] || "",
                        lastName: loggedInUser.name?.split(" ")[1] || "",
                        email: loggedInUser.email || "",
                    }));
                }
            } catch (err) {
                console.error("Failed to load employee profile:", err);
                setError("Error loading profile details from backend.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Build update payload aligned with Profile model
            const updatePayload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                dob: formData.dob,
                phone: formData.phone,
                role: formData.role,
                departmentId: formData.departmentId,
                designationId: formData.designationId,
                salary: formData.salary,
                joiningDate: formData.joiningDate,
                employmentType: formData.employmentType,
                status: formData.status,
                address: formData.address,
                profileImage: formData.profileImage || employee?.profileImage || ""
            };

            let result;
            if (employee?.employeeId) {
                result = await api.updateProfile(employee.employeeId, updatePayload);
            } else {
                if (!formData.employeeId) {
                    throw new Error("Employee ID is required to save profile.");
                }
                const createPayload = {
                    ...updatePayload,
                    employeeId: formData.employeeId,
                    createdBy: user?.id || user?._id,
                    email: user?.email || formData.email,
                    password: "Password@123"
                };
                result = await api.createProfile(createPayload);
            }

            if (result && result.success) {
                setSuccess("Profile details saved successfully!");
                setEmployee(result.profile || { ...employee, ...updatePayload, employeeId: formData.employeeId });
                const updatedUser = { ...user, name: `${formData.firstName} ${formData.lastName}` };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("storage"));
            } else {
                setError(result.message || "Failed to save profile details.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while updating profile.");
        } finally {
            setSaving(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ minHeight: "60px" }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#043e30] text-white shadow-sm shadow-[#043e30]/10"
                        style={{ border: "none", cursor: "pointer" }}
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="emp-top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 10px" }}>
                    <div style={{ visibility: "hidden" }}>Placeholder</div>

                    <div className="emp-user-profile-badge" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", padding: "6px 14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#000000" }}>
                        <div className="emp-avatar-circle" style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#043e30", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                            {getInitials(formData.firstName + " " + formData.lastName)}
                        </div>
                        <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "0 10px" }}>

                    <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                            <h1 className="dashboard-title" style={{ fontSize: "32px", fontWeight: "800", color: "#000000", margin: 0 }}>My Profile</h1>
                            <p className="dashboard-subtitle" style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Manage your personal details and contact settings</p>
                        </div>
                    </div>

                    {
                        success && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#065f46", backgroundColor: "#ecfdf5", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600", border: "1px solid #a7f3d0" }}>
                                <CheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )
                    }

                    {
                        error && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b91c1c", backgroundColor: "#fef2f2", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600", border: "1px solid #fca5a5" }}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )
                    }

                    {
                        loading ? (
                            <div style={{ textAlign: "center", padding: "50px", color: "#64748b" }}>Loading profile...</div>
                        ) : (
                            <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 2.5fr", gap: "24px", alignItems: "start" }}>

                                {/* Left Profile Summary Card Container */}
                                <div className="emp-card-box" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#ffffff" }}>
                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <div
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                borderRadius: "50%",
                                                backgroundColor: "#043e30",
                                                color: "#ffffff",
                                                fontSize: "36px",
                                                fontWeight: "800",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "4px solid #10b981",
                                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                                overflow: "hidden"
                                            }}
                                        >
                                            {previewImage || employee?.profileImage ? (
                                                <img
                                                    src={previewImage || employee.profileImage}
                                                    alt="Profile"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                getInitials(formData.firstName + " " + formData.lastName)
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCameraClick}
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                right: 0,
                                                backgroundColor: "#10b981",
                                                color: "#ffffff",
                                                borderRadius: "50%",
                                                width: "32px",
                                                height: "32px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "2px solid #ffffff",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
                                            }}
                                            title="Change picture"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handlePhotoChange}
                                            accept="image/*"
                                            style={{ display: "none" }}
                                        />
                                    </div>

                                    <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                                        {formData.firstName} {formData.lastName}
                                    </h3>
                                    <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#64748b", fontWeight: "700" }}>
                                        {employee?.designation || "Software Engineer"}
                                    </p>

                                    <span
                                        style={{
                                            backgroundColor: "#ecfdf5",
                                            color: "#047857",
                                            border: "1px solid #a7f3d0",
                                            padding: "6px 16px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "800",
                                            marginBottom: "24px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <span style={{ width: "6px", height: "6px", backgroundColor: "#10b981", borderRadius: "50%" }} />
                                        Active Employee
                                    </span>

                                    <div style={{ width: "100%", borderTop: "1px solid #f1f5f9", paddingTop: "16px", fontSize: "13px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                            <span style={{ color: "#64748b", fontWeight: "600" }}>Employee ID</span>
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{employee?.employeeId || "EMP054"}</span>
                                        </div>
                                        <div style={{
                                            display: "flex", justifyContent: "space-between", padding: "8px 0"
                                        }
                                        }>
                                            <span style={{ color: "#64748b", fontWeight: "600" }}>Department</span>
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{employee?.departmentId?.departmentName || "Technology"}</span>
                                        </div >
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                            <span style={{ color: "#64748b", fontWeight: "600" }}>Role</span>
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{employee?.role || "Employee"}</span>
                                        </div >
                                    </div >
                                </div >

                                {/* Right Profile Form Container */}
                                <div className="emp-card-box" style={{ padding: "24px", backgroundColor: "#ffffff" }}>
                                    <form onSubmit={handleSave}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Employee ID</label>
                                                    <input
                                                        type="text"
                                                        name="employeeId"
                                                        value={formData.employeeId}
                                                        onChange={handleChange}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Role</label>
                                                    <select
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", outline: "none", fontSize: "14px", color: "#000000" }}
                                                    >
                                                        <option>Admin</option>
                                                        <option>Manager</option>
                                                        <option>Employee</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>First Name</label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Last Name</label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Phone</label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Gender</label>
                                                    <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", outline: "none", fontSize: "14px", color: "#000000" }}>
                                                        <option>Male</option>
                                                        <option>Female</option>
                                                        <option>Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Date of Birth</label>
                                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Department</label>
                                                    <select name="departmentId" value={formData.departmentId} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                                        <option value="">Select department</option>
                                                        {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Designation</label>
                                                    <select name="designationId" value={formData.designationId} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                                        <option value="">Select designation</option>
                                                        {designations.map(d => <option key={d._id} value={d._id}>{d.designationName}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Salary</label>
                                                    <input type="number" name="salary" value={formData.salary} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Joining Date</label>
                                                    <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Employment Type</label>
                                                    <select name="employmentType" value={formData.employmentType} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                                        <option>Permanent</option>
                                                        <option>Contract</option>
                                                        <option>Intern</option>
                                                        <option>Full-time</option>
                                                        <option>Part-time</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Status</label>
                                                    <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                                        <option>Active</option>
                                                        <option>Inactive</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Address</label>
                                                <textarea name="address" value={formData.address} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px" }} />
                                            </div>
                                        </div>

                                        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                style={{
                                                    backgroundColor: "#043e30",
                                                    color: "#ffffff",
                                                    border: "none",
                                                    borderRadius: "10px",
                                                    padding: "12px 24px",
                                                    fontSize: "14px",
                                                    fontWeight: "700",
                                                    cursor: saving ? "default" : "pointer",
                                                    transition: "all 0.2s",
                                                    opacity: saving ? 0.7 : 1
                                                }}
                                            >
                                                {saving ? "Saving Changes..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                            </div>
                        )}

                </div >
            </div >
        </div >
    );
}
