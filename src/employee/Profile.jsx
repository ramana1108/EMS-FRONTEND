import React, { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
=======
// styles are loaded globally via src/index.css (Tailwind + custom styles)
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
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
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden min-h-[60px]">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm border-0 cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
<<<<<<< HEAD
                <div className="emp-top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 10px" }}>
                    <div style={{ visibility: "hidden" }}>Placeholder</div>
=======
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="invisible">Placeholder</div>

                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 font-bold text-black">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">{getInitials(formData.firstName + " " + formData.lastName)}</div>
                        <span>{formData.firstName} {formData.lastName}</span>
                    </div>
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                </div>

                {/* Page Content */}
                <div className="flex-1 px-2">

                    <div className="page-header flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 m-0">My Profile</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your personal details and contact settings</p>
                        </div>
                    </div>

                    {
                        success && (
                            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-4 py-3 rounded-lg mb-5 text-sm font-semibold border border-emerald-100">
                                <CheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )
                    }

                    {
                        error && (
                            <div className="flex items-center gap-2 text-rose-700 bg-rose-50 px-4 py-3 rounded-lg mb-5 text-sm font-semibold border border-rose-100">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )
                    }

                    {
                        loading ? (
                            <div className="text-center text-slate-500 p-12">Loading profile...</div>
                        ) : (
                            <div className="grid lg:grid-cols-[1.2fr_2.5fr] gap-6 items-start">

                                {/* Left Profile Summary Card Container */}
<<<<<<< HEAD
                                <div className="emp-card-box" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "var(--card-bg)" }}>
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
=======
                                <div className="bg-white p-6 rounded-xl flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <div className="w-[100px] h-[100px] rounded-full bg-emerald-900 text-white text-[36px] font-extrabold flex items-center justify-center border-4 border-emerald-500 shadow-lg overflow-hidden">
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                            {previewImage || employee?.profileImage ? (
                                                <img src={previewImage || employee.profileImage} alt="Profile" className="w-full h-full object-cover" />
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

<<<<<<< HEAD
                                {/* Right Tabbed Form Cards Container */}
                                <div className="emp-card-box">
                                    <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-6">
                                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white m-0">Personal Information</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your basic personal profile details</p>
                                    </div>

                                    {/* Form Elements */}
                                    <form onSubmit={handleSave} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="form-group flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">First Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                />
                                            </div>
                                            <div className="form-group flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="form-group flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dob"
                                                    value={formData.dob}
                                                    onChange={handleChange}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                />
                                            </div>
                                            <div className="form-group flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nationality</label>
                                            <input
                                                type="text"
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </div>

                                        {/* Form Footer Action */}
                                        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800/80">
=======
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
>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="btn-save"
                                            >
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
<<<<<<< HEAD
=======

>>>>>>> 819c511ce486a6353829f2805eb90ecdf071faa3
                            </div>
                        )}

                </div >
            </div >
        </div >
    );
}
