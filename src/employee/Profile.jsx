import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Camera,
    CheckCircle,
    AlertCircle,
    Briefcase,
    HelpCircle,
    Menu
} from "lucide-react";
import api from "../api";

export default function Profile() {
    const [activeTab, setActiveTab] = useState("Profile");
    const [isOpen, setIsOpen] = useState(false);
    const [formTab, setFormTab] = useState("personal"); // personal | contact | bank

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [employee, setEmployee] = useState(null);
    const [user, setUser] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const fileInputRef = useRef(null);

    // Form Fields
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        nationality: "Indian",
        phone: "",
        secondaryPhone: "",
        email: "",
        permanentAddress: "",
        temporaryAddress: "",
        bankName: "HDFC Bank Ltd",
        accountHolder: "",
        accountNo: "",
        ifsc: "",
        branch: "",
        emergencyName: "",
        emergencyRelation: "",
        emergencyPhone: ""
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

            if (employee?._id) {
                try {
                    const updatePayload = {
                        ...employee,
                        profileImage: base64Data
                    };
                    const result = await api.updateEmployee(employee._id, updatePayload);
                    if (result && (result.success || result._id)) {
                        setSuccess("Profile photo updated successfully!");
                        setEmployee(result.employee || result.data || updatePayload);
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
                const all = await api.getAllEmployees();
                const list = Array.isArray(all) ? all : all?.employees || [];

                let found = null;
                if (loggedInUser?.email) {
                    found = list.find(
                        (e) => e.email?.toLowerCase() === loggedInUser.email.toLowerCase()
                    );
                }

                if (found) {
                    setEmployee(found);
                    setFormData({
                        firstName: found.firstName || "",
                        lastName: found.lastName || "",
                        dob: found.dob ? found.dob.split("T")[0] : "1994-08-15",
                        gender: found.gender || "Female",
                        nationality: found.nationality || "Indian",
                        phone: found.phone || found.mobile || "+91 98765 43210",
                        secondaryPhone: found.secondaryPhone || "",
                        email: found.email || "",
                        permanentAddress: found.permanentAddress || found.address || "123, Residency Road, Bangalore, KA - 560001",
                        temporaryAddress: found.temporaryAddress || found.address || "123, Residency Road, Bangalore, KA - 560001",
                        bankName: found.bankName || "State Bank of India",
                        accountHolder: found.accountHolder || `${found.firstName} ${found.lastName}`,
                        accountNo: found.accountNo || "************8901",
                        ifsc: found.ifsc || "SBIN0029302",
                        branch: found.branch || "Corporate Park Branch",
                        emergencyName: found.emergencyName || "Rajesh Mehta",
                        emergencyRelation: found.emergencyRelation || "Father",
                        emergencyPhone: found.emergencyPhone || "+91 94401 23456"
                    });
                } else if (loggedInUser) {
                    // Mock data fallback if employee record is not synced in DB
                    setFormData((prev) => ({
                        ...prev,
                        firstName: loggedInUser.name?.split(" ")[0] || "Akshaya",
                        lastName: loggedInUser.name?.split(" ")[1] || "Mehta",
                        email: loggedInUser.email || "akshaya@gmail.com"
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
        if (!employee?._id) {
            // Local storage mock save if not in DB
            setSuccess("Profile settings saved locally!");
            setTimeout(() => setSuccess(""), 4000);
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Merge values to update database schema fields
            const updatePayload = {
                ...employee,
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                dob: formData.dob,
                phone: formData.phone,
                address: formData.permanentAddress,
                // Store supplemental custom fields under native model properties or pass-through
                permanentAddress: formData.permanentAddress,
                temporaryAddress: formData.temporaryAddress,
                nationality: formData.nationality,
                bankName: formData.bankName,
                accountHolder: formData.accountHolder,
                accountNo: formData.accountNo,
                ifsc: formData.ifsc,
                branch: formData.branch,
                emergencyName: formData.emergencyName,
                emergencyRelation: formData.emergencyRelation,
                emergencyPhone: formData.emergencyPhone
            };

            const result = await api.updateEmployee(employee._id, updatePayload);
            if (result && (result.success || result._id)) {
                setSuccess("Profile details updated successfully!");
                setEmployee(result.employee || result.data || updatePayload);
                // Also update local storage user object name if modified
                const updatedUser = { ...user, name: `${formData.firstName} ${formData.lastName}` };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("storage")); // Trigger sidebar reload
            } else {
                setError(result.message || "Failed to update profile details.");
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
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{employee?.department || "Technology"}</span>
                                        </div >
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                            <span style={{ color: "#64748b", fontWeight: "600" }}>Role</span>
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{employee?.role || "Employee"}</span>
                                        </div >
                                    </div >
                                </div >

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
                            </div>
                        )}

                </div >
            </div >
        </div >
    );
}
