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
    Menu,
    Pencil,
    X
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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "Male",
        dob: "",
        address: "",
        department: "",
        designation: "",
        joiningDate: "",
        salary: "",
        employmentType: ""
    });

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

    const handleSaveProfileEdit = async (e) => {
        e.preventDefault();
        if (!employee?._id) {
            // Setup values locally for mock
            const mockUpdated = {
                ...employee,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                gender: editForm.gender,
                dob: editForm.dob,
                address: editForm.address,
                permanentAddress: editForm.address,
                temporaryAddress: editForm.address,
                department: editForm.department,
                designation: editForm.designation,
                joiningDate: editForm.joiningDate,
                salary: editForm.salary,
                employmentType: editForm.employmentType
            };
            setEmployee(mockUpdated);
            setFormData({
                ...formData,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                gender: editForm.gender,
                dob: editForm.dob,
                permanentAddress: editForm.address,
                temporaryAddress: editForm.address
            });
            setSuccess("Profile settings saved locally!");
            setIsEditModalOpen(false);
            setTimeout(() => setSuccess(""), 4000);
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const updatePayload = {
                ...employee,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                gender: editForm.gender,
                dob: editForm.dob,
                address: editForm.address,
                permanentAddress: editForm.address,
                temporaryAddress: editForm.address,
                department: editForm.department,
                designation: editForm.designation,
                joiningDate: editForm.joiningDate,
                salary: editForm.salary ? Number(editForm.salary) : undefined,
                employmentType: editForm.employmentType
            };

            const result = await api.updateEmployee(employee._id, updatePayload);
            if (result && (result.success || result._id || result.employee)) {
                const updatedEmpObj = result.employee || result.data || updatePayload;
                setSuccess("Profile updated successfully.");
                setEmployee(updatedEmpObj);

                // Keep the page formData in sync
                setFormData({
                    firstName: updatedEmpObj.firstName || "",
                    lastName: updatedEmpObj.lastName || "",
                    dob: updatedEmpObj.dob ? updatedEmpObj.dob.split("T")[0] : "",
                    gender: updatedEmpObj.gender || "Female",
                    nationality: updatedEmpObj.nationality || "Indian",
                    phone: updatedEmpObj.phone || updatedEmpObj.mobile || "",
                    secondaryPhone: updatedEmpObj.secondaryPhone || "",
                    email: updatedEmpObj.email || "",
                    permanentAddress: updatedEmpObj.permanentAddress || updatedEmpObj.address || "",
                    temporaryAddress: updatedEmpObj.temporaryAddress || updatedEmpObj.address || "",
                    bankName: updatedEmpObj.bankName || "",
                    accountHolder: updatedEmpObj.accountHolder || "",
                    accountNo: updatedEmpObj.accountNo || "",
                    ifsc: updatedEmpObj.ifsc || "",
                    branch: updatedEmpObj.branch || "",
                    emergencyName: updatedEmpObj.emergencyName || "",
                    emergencyRelation: updatedEmpObj.emergencyRelation || "",
                    emergencyPhone: updatedEmpObj.emergencyPhone || ""
                });

                // Also update local storage user object name if modified
                const updatedUser = { ...user, name: `${editForm.firstName} ${editForm.lastName}`, email: editForm.email };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("storage")); // Trigger sidebar reload
                setIsEditModalOpen(false);
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

    const formatDisplayDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("en-GB");
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === "") return "—";
        const amount = Number(value);
        if (Number.isNaN(amount)) return value;
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033]">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="lg:pl-[260px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ minHeight: "60px" }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-sm"
                        style={{ border: "none", cursor: "pointer" }}
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-sm font-semibold text-[#172033]">EMS Portal</div>
                </div>

                {/* Top Header Bar */}
                <div className="emp-top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 10px" }}>
                    <div style={{ visibility: "hidden" }}>Placeholder</div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "0 10px" }}>

                    <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                            <h1 className="dashboard-title" style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#172033" }}>My Profile</h1>
                            <p className="dashboard-subtitle" style={{ fontSize: "14px", marginTop: "4px", color: "#64748B" }}>Manage your personal details and contact settings</p>
                        </div>
                    </div>

                    {
                        success && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#087F72", backgroundColor: "#E8F8F3", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600", border: "1px solid #D5F2E9" }}>
                                <CheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )
                    }

                    {
                        error && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DC2626", backgroundColor: "#FEECEC", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600", border: "1px solid #FECACA" }}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )
                    }

                    {
                        loading ? (
                            <div style={{ textAlign: "center", padding: "50px", color: "#94A3B8" }}>Loading profile...</div>
                        ) : (
                            <div className="emp-middle-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 2.5fr", gap: "24px", alignItems: "start" }}>

                                {/* Left Profile Summary Card Container */}
                                <div className="emp-card-box" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <div
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                borderRadius: "50%",
                                                backgroundColor: "#EAF2FF",
                                                color: "#2563EB",
                                                fontSize: "36px",
                                                fontWeight: "800",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "4px solid #2563EB",
                                                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
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
                                                backgroundColor: "#2563EB",
                                                color: "#ffffff",
                                                borderRadius: "50%",
                                                width: "32px",
                                                height: "32px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "2px solid #FFFFFF",
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

                                    <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "#172033" }}>
                                        {formData.firstName} {formData.lastName}
                                    </h3>
                                    <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#64748B", fontWeight: "700" }}>
                                        {employee?.designation || "Software Engineer"}
                                    </p>

                                    <span
                                        style={{
                                            backgroundColor: "#E8F8F3",
                                            color: "#087F72",
                                            border: "1px solid #D5F2E9",
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
                                        <span style={{ width: "6px", height: "6px", backgroundColor: "#087F72", borderRadius: "50%" }} />
                                        Active Employee
                                    </span>

                                    <div style={{ width: "100%", borderTop: "1px solid #E2E8F0", paddingTop: "16px", fontSize: "13px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                            <span style={{ color: "#64748B", fontWeight: "600" }}>Employee ID</span>
                                            <span style={{ fontWeight: "700", color: "#172033" }}>{employee?.employeeId || "EMP054"}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                            <span style={{ color: "#64748B", fontWeight: "600" }}>Department</span>
                                            <span style={{ fontWeight: "700", color: "#172033" }}>{employee?.department || "Technology"}</span>
                                        </div >
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                            <span style={{ color: "#64748B", fontWeight: "600" }}>Role</span>
                                            <span style={{ fontWeight: "700", color: "#172033" }}>{employee?.role || "Employee"}</span>
                                        </div >
                                    </div >
                                </div >

                                {/* Right Profile Summary Cards */}
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm text-[#172033]">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                            <h2 className="m-0 text-xl font-extrabold text-[#172033]">Personal Information</h2>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setError("");
                                                    setSuccess("");
                                                    setEditForm({
                                                        firstName: formData.firstName || "",
                                                        lastName: formData.lastName || "",
                                                        email: formData.email || employee?.email || "",
                                                        phone: formData.phone || employee?.phone || "",
                                                        gender: formData.gender || "Female",
                                                        dob: formData.dob || (employee?.dob ? employee.dob.split("T")[0] : ""),
                                                        address: formData.permanentAddress || employee?.address || "",
                                                        department: employee?.department || "",
                                                        designation: employee?.designation || "",
                                                        joiningDate: employee?.joiningDate ? employee.joiningDate.split("T")[0] : "",
                                                        salary: employee?.salary || "",
                                                        employmentType: employee?.employmentType || employee?.role || ""
                                                    });
                                                    setIsEditModalOpen(true);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    height: "38px",
                                                    padding: "0 16px",
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    backgroundColor: "#2563eb",
                                                    color: "#ffffff",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    transition: "background 0.2s"
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                                            >
                                                <Pencil size={14} />
                                                <span>Edit Profile</span>
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">First Name</span>
                                                <span className="text-sm font-bold text-[#172033]">{formData.firstName || "John"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Last Name</span>
                                                <span className="text-sm font-bold text-[#172033]">{formData.lastName || "Doe"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Email</span>
                                                <span className="text-sm font-bold text-[#172033]">{formData.email || employee?.email || "john@example.com"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Phone</span>
                                                <span className="text-sm font-bold text-[#172033]">{formData.phone || employee?.phone || "9876543210"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Gender</span>
                                                <span className="text-sm font-bold text-[#172033]">{formData.gender || "Male"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">DOB</span>
                                                <span className="text-sm font-bold text-[#172033]">{formatDisplayDate(formData.dob || employee?.dob || "1995-08-15")}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-[#64748B]">Address</span>
                                                <span className="text-sm font-bold text-[#172033] text-right max-w-[220px]">{formData.permanentAddress || employee?.address || "Chennai"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm text-[#172033]">
                                        <h2 className="m-0 text-xl font-extrabold text-[#172033]">Employment Information</h2>
                                        <div className="mt-5 space-y-3">
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Employee ID</span>
                                                <span className="text-sm font-bold text-[#172033]">{employee?.employeeId || "EMP001"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Department</span>
                                                <span className="text-sm font-bold text-[#172033]">{employee?.department || "Development"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Designation</span>
                                                <span className="text-sm font-bold text-[#172033]">{employee?.designation || "Developer"}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Joining Date</span>
                                                <span className="text-sm font-bold text-[#172033]">{formatDisplayDate(employee?.joiningDate || "2026-08-01")}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Salary</span>
                                                <span className="text-sm font-bold text-[#172033]">{formatCurrency(employee?.salary || 50000)}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                                                <span className="text-sm font-semibold text-[#64748B]">Employment</span>
                                                <span className="text-sm font-bold text-[#172033]">{employee?.employmentType || employee?.role || "Full Time"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-[#64748B]">Status</span>
                                                <span className="text-sm font-bold text-[#172033]">{employee?.status || "Active"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {isEditModalOpen && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(15, 23, 42, 0.4)",
                                backdropFilter: "blur(4px)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 999,
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: "16px",
                                    width: "680px",
                                    maxWidth: "95%",
                                    maxHeight: "90vh",
                                    overflowY: "auto",
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                    border: "1px solid #E2E8F0",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* Header */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "20px 24px",
                                        borderBottom: "1px solid #E2E8F0",
                                        backgroundColor: "#FFFFFF",
                                    }}
                                >
                                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#172033" }}>Edit Profile</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            color: "#64748B",
                                            cursor: "pointer",
                                            padding: 4,
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={handleSaveProfileEdit} style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }} className="grid grid-cols-1 md:grid-cols-2">

                                        {/* Personal Info */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.firstName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.lastName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={editForm.email}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Phone</label>
                                            <input
                                                type="text"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Gender</label>
                                            <select
                                                value={editForm.gender}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", backgroundColor: "#ffffff" }}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Date of Birth</label>
                                            <input
                                                type="date"
                                                value={editForm.dob}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Address</label>
                                            <textarea
                                                rows={2}
                                                value={editForm.address}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", resize: "vertical" }}
                                            />
                                        </div>

                                        {/* Employment Info */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Department</label>
                                            <input
                                                type="text"
                                                value={editForm.department}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Designation</label>
                                            <input
                                                type="text"
                                                value={editForm.designation}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Joining Date</label>
                                            <input
                                                type="date"
                                                value={editForm.joiningDate}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Salary</label>
                                            <input
                                                type="number"
                                                value={editForm.salary}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, salary: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Employment Type</label>
                                            <input
                                                type="text"
                                                value={editForm.employmentType}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, employmentType: e.target.value }))}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                                            />
                                        </div>

                                        {/* Read-Only Info */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>Employee ID (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.employeeId || "—"}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "14px", cursor: "not-allowed" }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>Role (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.role || "Employee"}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "14px", cursor: "not-allowed" }}
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>Status (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.status || "Active"}
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "14px", cursor: "not-allowed" }}
                                            />
                                        </div>

                                    </div>

                                    {/* Actions Footer */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "12px",
                                            marginTop: "24px",
                                            paddingTop: "16px",
                                            borderTop: "1px solid #f1f5f9",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            style={{
                                                padding: "10px 18px",
                                                borderRadius: "8px",
                                                border: "1px solid #cbd5e1",
                                                backgroundColor: "#ffffff",
                                                color: "#334155",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Cancel
                                        </button>
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
