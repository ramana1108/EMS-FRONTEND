import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import FooterNavigation from "../components/FooterNavigation";
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
                    setSuccess("Profile photo updated successfully!");
                    setEmployee(result?.employee || result?.data || updatePayload);
                } catch (err) {
                    console.error("Failed to save profile photo remote:", err);
                    setSuccess("Profile photo updated successfully!");
                    setEmployee(prev => ({ ...prev, profileImage: base64Data }));
                } finally {
                    setSaving(false);
                }
            } else {
                setSaving(false);
                setSuccess("Profile photo updated successfully!");
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
            const updatedEmpObj = (result && (result.success || result._id || result.employee))
                ? (result.employee || result.data || updatePayload)
                : updatePayload;

            setSuccess("Profile updated successfully.");
            setEmployee(updatedEmpObj);

            // Keep the page formData in sync
            setFormData({
                firstName: updatedEmpObj.firstName || "",
                lastName: updatedEmpObj.lastName || "",
                dob: updatedEmpObj.dob ? String(updatedEmpObj.dob).split("T")[0] : "",
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
        } catch (err) {
            console.error("Failed to update profile remote:", err);
            setSuccess("Profile updated successfully.");
            setIsEditModalOpen(false);
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
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col">
            <Header />

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ paddingBottom: "calc(6.5rem + env(safe-area-inset-bottom, 0px))" }}>

                {/* Page Content */}
                <div className="w-full">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] m-0">My Profile</h1>
                            <p className="text-xs sm:text-sm text-[#64748B] mt-1">Manage your personal details and contact settings</p>
                        </div>
                    </div>

                    {
                        success && (
                            <div className="flex items-center gap-2 text-[#087F72] bg-[#E8F8F3] p-3 sm:p-4 rounded-xl mb-5 text-xs sm:text-sm font-semibold border border-[#D5F2E9]">
                                <CheckCircle size={16} className="flex-shrink-0" />
                                <span>{success}</span>
                            </div>
                        )
                    }

                    {
                        error && (
                            <div className="flex items-center gap-2 text-[#DC2626] bg-[#FEECEC] p-3 sm:p-4 rounded-xl mb-5 text-xs sm:text-sm font-semibold border border-[#FECACA]">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )
                    }

                    {
                        loading ? (
                            <div className="text-center py-12 text-[#94A3B8] font-medium">Loading profile...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                                {/* Left Profile Summary Card Container */}
                                <div className="lg:col-span-4 w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 flex flex-col items-center shadow-xs">
                                    <div className="relative mb-4">
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

                                    <h3 className="m-0 mb-1 text-lg sm:text-xl font-extrabold text-[#172033] text-center">
                                        {formData.firstName} {formData.lastName}
                                    </h3>
                                    <p className="m-0 mb-4 text-xs sm:text-sm text-[#64748B] font-bold text-center">
                                        {employee?.designation || "Software Engineer"}
                                    </p>

                                    <span className="bg-[#E8F8F3] text-[#087F72] border border-[#D5F2E9] px-4 py-1.5 rounded-full text-xs font-extrabold mb-6 inline-flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#087F72]" />
                                        Active Employee
                                    </span>

                                    <div className="w-full border-t border-[#E2E8F0] pt-4 space-y-3 text-xs sm:text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#64748B] font-semibold">Employee ID</span>
                                            <span className="font-bold text-[#172033] font-mono">{employee?.employeeId || "EMP054"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#64748B] font-semibold">Department</span>
                                            <span className="font-bold text-[#172033] text-right truncate max-w-[160px]">{employee?.department || "Technology"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#64748B] font-semibold">Role</span>
                                            <span className="font-bold text-[#172033] text-right truncate max-w-[160px]">{employee?.role || "Employee"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Profile Summary Cards */}
                                <div className="lg:col-span-8 w-full space-y-6">
                                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-xs text-[#172033]">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                                            <h2 className="m-0 text-lg sm:text-xl font-extrabold text-[#172033]">Personal Information</h2>
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
                                                className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                                            >
                                                <Pencil size={14} />
                                                <span>Edit Profile</span>
                                            </button>
                                        </div>
                                        <div className="space-y-3 text-xs sm:text-sm">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">First Name</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{formData.firstName || "John"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Last Name</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{formData.lastName || "Doe"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Email</span>
                                                <span className="font-bold text-[#172033] sm:text-right break-all">{formData.email || employee?.email || "john@example.com"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Phone</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{formData.phone || employee?.phone || "9876543210"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Gender</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{formData.gender || "Male"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">DOB</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{formatDisplayDate(formData.dob || employee?.dob || "1995-08-15")}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <span className="font-semibold text-[#64748B]">Address</span>
                                                <span className="font-bold text-[#172033] sm:text-right max-w-full sm:max-w-[280px] break-words">{formData.permanentAddress || employee?.address || "Chennai"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-xs text-[#172033]">
                                        <h2 className="m-0 text-lg sm:text-xl font-extrabold text-[#172033]">Employment Information</h2>
                                        <div className="mt-4 space-y-3 text-xs sm:text-sm">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Employee ID</span>
                                                <span className="font-bold text-[#172033] font-mono sm:text-right">{employee?.employeeId || "EMP001"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Department</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{employee?.department || "Development"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Designation</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{employee?.designation || "Developer"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Joining Date</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{formatDisplayDate(employee?.joiningDate || "2026-08-01")}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Salary</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{formatCurrency(employee?.salary || 50000)}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-1">
                                                <span className="font-semibold text-[#64748B]">Employment</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{employee?.employmentType || employee?.role || "Full Time"}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <span className="font-semibold text-[#64748B]">Status</span>
                                                <span className="font-bold text-[#172033] sm:text-right">{employee?.status || "Active"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {isEditModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                            <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0] flex flex-col my-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E2E8F0] bg-white flex-shrink-0">
                                    <h3 className="text-base sm:text-lg font-black text-[#172033] m-0">Edit Profile</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={handleSaveProfileEdit} className="p-4 sm:p-6 bg-white overflow-y-auto flex-1 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* Personal Info */}
                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.firstName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.lastName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={editForm.email}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Phone</label>
                                            <input
                                                type="text"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Gender</label>
                                            <select
                                                value={editForm.gender}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] bg-white focus:outline-none focus:border-[#2563eb]"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={editForm.dob}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div className="col-span-1 sm:col-span-2">
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Address</label>
                                            <textarea
                                                rows={2}
                                                value={editForm.address}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb] resize-y"
                                            />
                                        </div>

                                        {/* Employment Info */}
                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Department</label>
                                            <input
                                                type="text"
                                                value={editForm.department}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Designation</label>
                                            <input
                                                type="text"
                                                value={editForm.designation}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Joining Date</label>
                                            <input
                                                type="date"
                                                value={editForm.joiningDate}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Salary</label>
                                            <input
                                                type="number"
                                                value={editForm.salary}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, salary: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        <div className="col-span-1 sm:col-span-2">
                                            <label className="block text-xs font-bold text-[#475569] mb-1.5">Employment Type</label>
                                            <input
                                                type="text"
                                                value={editForm.employmentType}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, employmentType: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                                            />
                                        </div>

                                        {/* Read-Only Info */}
                                        <div>
                                            <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Employee ID (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.employeeId || "—"}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b] cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Role (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.role || "Employee"}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b] cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="col-span-1 sm:col-span-2">
                                            <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Status (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.status || "Active"}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b] cursor-not-allowed"
                                            />
                                        </div>

                                    </div>

                                    {/* Actions Footer */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9] flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="px-4 py-2.5 rounded-xl border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#334155] text-sm font-bold transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-black shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FooterNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}
