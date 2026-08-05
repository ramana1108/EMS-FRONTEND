import React, { useState, useEffect, useRef } from "react";
import "../App.css";
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
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{employee?.department || "Technology"}</span>
                                        </div >
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                            <span style={{ color: "#64748b", fontWeight: "600" }}>Role</span>
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{employee?.role || "Employee"}</span>
                                        </div >
                                    </div >
                                </div >

                                {/* Right Tabbed Form Cards Container */}
                                < div className="emp-card-box" style={{ padding: "24px", backgroundColor: "#ffffff" }}>

                                    {/* Form Tabs Drawer Header */}
                                    < div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                                        <button
                                            type="button"
                                            onClick={() => { setFormTab("personal"); setSuccess(""); setError(""); }}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                border: "none",
                                                backgroundColor: formTab === "personal" ? "#043e30" : "transparent",
                                                color: formTab === "personal" ? "#ffffff" : "#475569",
                                                fontWeight: "700",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            Personal Information
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setFormTab("contact"); setSuccess(""); setError(""); }}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                border: "none",
                                                backgroundColor: formTab === "contact" ? "#043e30" : "transparent",
                                                color: formTab === "contact" ? "#ffffff" : "#475569",
                                                fontWeight: "700",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            Contact Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setFormTab("bank"); setSuccess(""); setError(""); }}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                border: "none",
                                                backgroundColor: formTab === "bank" ? "#043e30" : "transparent",
                                                color: formTab === "bank" ? "#ffffff" : "#475569",
                                                fontWeight: "700",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            Bank & Emergency Info
                                        </button>
                                    </div >

                                    {/* Form Elements */}
                                    < form onSubmit={handleSave} >

                                        {/* TAB: Personal */}
                                        {
                                            formTab === "personal" && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                                                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Date of Birth</label>
                                                            <input
                                                                type="date"
                                                                name="dob"
                                                                value={formData.dob}
                                                                onChange={handleChange}
                                                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Gender</label>
                                                            <select
                                                                name="gender"
                                                                value={formData.gender}
                                                                onChange={handleChange}
                                                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", outline: "none", fontSize: "14px", color: "#000000" }}
                                                            >
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Nationality</label>
                                                        <input
                                                            type="text"
                                                            name="nationality"
                                                            value={formData.nationality}
                                                            onChange={handleChange}
                                                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        }

                                        {/* TAB: Contact */}
                                        {
                                            formTab === "contact" && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Primary Mobile Number</label>
                                                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", paddingLeft: "10px", backgroundColor: "#ffffff" }}>
                                                                <Phone size={16} color="#64748b" />
                                                                <input
                                                                    type="text"
                                                                    name="phone"
                                                                    value={formData.phone}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", border: "none", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Secondary Mobile Number</label>
                                                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", paddingLeft: "10px", backgroundColor: "#ffffff" }}>
                                                                <Phone size={16} color="#64748b" />
                                                                <input
                                                                    type="text"
                                                                    name="secondaryPhone"
                                                                    value={formData.secondaryPhone}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", border: "none", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                    placeholder="Optional"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Email Address</label>
                                                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", paddingLeft: "10px", backgroundColor: "#f8fafc" }}>
                                                            <Mail size={16} color="#94a3b8" />
                                                            <input
                                                                type="email"
                                                                value={formData.email}
                                                                disabled
                                                                style={{ width: "100%", padding: "10px 12px", border: "none", outline: "none", fontSize: "14px", color: "#94a3b8", cursor: "not-allowed" }}
                                                            />
                                                        </div>
                                                        <span style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", marginTop: "2px", display: "inline-block" }}>
                                                            Registered email cannot be modified.
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Permanent Address</label>
                                                        <div style={{ display: "flex", alignItems: "flex-start", border: "1px solid #cbd5e1", borderRadius: "8px", paddingLeft: "10px", backgroundColor: "#ffffff", paddingTop: "8px" }}>
                                                            <MapPin size={16} color="#64748b" style={{ marginTop: "4px" }} />
                                                            <textarea
                                                                name="permanentAddress"
                                                                value={formData.permanentAddress}
                                                                onChange={handleChange}
                                                                style={{ width: "100%", padding: "4px 12px 10px 12px", border: "none", outline: "none", fontSize: "14px", resize: "vertical", minHeight: "60px", color: "#000000" }}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Temporary / Current Address</label>
                                                        <div style={{ display: "flex", alignItems: "flex-start", border: "1px solid #cbd5e1", borderRadius: "8px", paddingLeft: "10px", backgroundColor: "#ffffff", paddingTop: "8px" }}>
                                                            <MapPin size={16} color="#64748b" style={{ marginTop: "4px" }} />
                                                            <textarea
                                                                name="temporaryAddress"
                                                                value={formData.temporaryAddress}
                                                                onChange={handleChange}
                                                                style={{ width: "100%", padding: "4px 12px 10px 12px", border: "none", outline: "none", fontSize: "14px", resize: "vertical", minHeight: "60px", color: "#000000" }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        {/* TAB: Bank & Emergency */}
                                        {
                                            formTab === "bank" && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                                    {/* SubSection: Bank */}
                                                    <div>
                                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#043e30", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>Bank Account Details</h4>

                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Bank Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="bankName"
                                                                    value={formData.bankName}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Account Holder</label>
                                                                <input
                                                                    type="text"
                                                                    name="accountHolder"
                                                                    value={formData.accountHolder}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Account Number</label>
                                                                <input
                                                                    type="text"
                                                                    name="accountNo"
                                                                    value={formData.accountNo}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>IFSC / Bank Code</label>
                                                                <input
                                                                    type="text"
                                                                    name="ifsc"
                                                                    value={formData.ifsc}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* SubSection: Emergency */}
                                                    <div>
                                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#043e30", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>Emergency Representative</h4>

                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Contact Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="emergencyName"
                                                                    value={formData.emergencyName}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Relationship</label>
                                                                <input
                                                                    type="text"
                                                                    name="emergencyRelation"
                                                                    value={formData.emergencyRelation}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>Phone Number</label>
                                                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", paddingLeft: "10px", backgroundColor: "#ffffff" }}>
                                                                <Phone size={16} color="#64748b" />
                                                                <input
                                                                    type="text"
                                                                    name="emergencyPhone"
                                                                    value={formData.emergencyPhone}
                                                                    onChange={handleChange}
                                                                    style={{ width: "100%", padding: "10px 12px", border: "none", outline: "none", fontSize: "14px", color: "#000000" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            )
                                        }

                                        {/* Form Footer Action */}
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

                                    </form >

                                </div >

                            </div >
                        )}

                </div >
            </div >
        </div >
    );
}
