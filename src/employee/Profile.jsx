import React, { useState, useEffect, useRef } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)
import Sidebar from "../components/Sidebar";
import {
    Camera,
    CheckCircle,
    AlertCircle,
    Menu,
    Pencil,
    X
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

    // Reference lists
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Edit modal state
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

    // Form Fields (aligned to backend Profile model)
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

                // load current user profile
                let found = null;
                const myProfileRes = await api.getMyProfile();
                if (myProfileRes?.success && myProfileRes.profile) {
                    found = myProfileRes.profile;
                } else {
                    const all = await api.getProfiles();
                    const list = Array.isArray(all) ? all : all?.profiles || [];

                    if (loggedInUser?.email) {
                        found = list.find((p) => p.email?.toLowerCase() === loggedInUser.email.toLowerCase());
                    }
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
                        email: loggedInUser.email || ""
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

    const handleSaveProfileEdit = async (e) => {
        e.preventDefault();

        if (!employee?._id) {
            // No backend record yet — apply changes locally
            const mockUpdated = {
                ...employee,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                gender: editForm.gender,
                dob: editForm.dob,
                address: editForm.address,
                department: editForm.department,
                designation: editForm.designation,
                joiningDate: editForm.joiningDate,
                salary: editForm.salary,
                employmentType: editForm.employmentType
            };
            setEmployee(mockUpdated);
            setFormData((prev) => ({
                ...prev,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                gender: editForm.gender,
                dob: editForm.dob,
                address: editForm.address
            }));
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
                department: editForm.department,
                designation: editForm.designation,
                joiningDate: editForm.joiningDate,
                salary: editForm.salary ? Number(editForm.salary) : undefined,
                employmentType: editForm.employmentType
            };

            const result = await api.updateMyProfile(updatePayload);
            if (result && result.success) {
                const updatedEmpObj = result.profile || updatePayload;
                setSuccess("Profile updated successfully.");
                setEmployee(updatedEmpObj);

                // Keep the page formData in sync
                setFormData((prev) => ({
                    ...prev,
                    firstName: updatedEmpObj.firstName || "",
                    lastName: updatedEmpObj.lastName || "",
                    dob: updatedEmpObj.dob ? updatedEmpObj.dob.split("T")[0] : "",
                    gender: updatedEmpObj.gender || "Male",
                    phone: updatedEmpObj.phone || updatedEmpObj.mobile || "",
                    email: updatedEmpObj.email || "",
                    address: updatedEmpObj.address || ""
                }));

                // Also update local storage user object name if modified
                const updatedUser = {
                    ...user,
                    name: `${editForm.firstName} ${editForm.lastName}`,
                    email: editForm.email,
                    permissions: user?.permissions ?? (user?.role?.permissions ?? []),
                    role: user?.role ?? user?.role,
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                // Trigger sidebar reload in this window and across other tabs
                window.dispatchEvent(new Event("userChanged"));
                window.dispatchEvent(new Event("storage"));
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

    const openEditModal = () => {
        setError("");
        setSuccess("");
        setEditForm({
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            email: formData.email || employee?.email || "",
            phone: formData.phone || employee?.phone || "",
            gender: formData.gender || "Male",
            dob: formData.dob || (employee?.dob ? employee.dob.split("T")[0] : ""),
            address: formData.address || employee?.address || "",
            department: employee?.departmentId?.departmentName || employee?.department || "",
            designation: employee?.designationId?.designationName || employee?.designation || "",
            joiningDate: employee?.joiningDate ? employee.joiningDate.split("T")[0] : "",
            salary: employee?.salary || "",
            employmentType: employee?.employmentType || employee?.role || ""
        });
        setIsEditModalOpen(true);
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

    const departmentName = employee?.departmentId?.departmentName || employee?.department || "—";
    const designationName = employee?.designationId?.designationName || employee?.designation || "—";

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

                {/* Page Content */}
                <div className="flex-1 px-2">

                    {/* Top Header Bar */}
                    <div className="flex justify-between items-center mb-8 px-2 pt-6">
                        <div className="invisible">Placeholder</div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 font-bold text-black">
                            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                                {getInitials(formData.firstName + " " + formData.lastName)}
                            </div>
                            <span>{formData.firstName} {formData.lastName}</span>
                        </div>
                    </div>

                    <div className="page-header flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 m-0">My Profile</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your personal details and contact settings</p>
                        </div>
                    </div>

                    {success && (
                        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-4 py-3 rounded-lg mb-5 text-sm font-semibold border border-emerald-100">
                            <CheckCircle size={16} />
                            <span>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-rose-700 bg-rose-50 px-4 py-3 rounded-lg mb-5 text-sm font-semibold border border-rose-100">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center text-slate-500 p-12">Loading profile...</div>
                    ) : (
                        <div className="grid lg:grid-cols-[1.2fr_2.5fr] gap-6 items-start">

                            {/* Left Profile Summary Card */}
                            <div className="bg-white p-6 rounded-xl flex flex-col items-center border border-slate-200 shadow-sm shadow-slate-200/70">
                                <div className="relative mb-4">
                                    <div className="w-[100px] h-[100px] rounded-full bg-emerald-900 text-white text-[36px] font-extrabold flex items-center justify-center border-4 border-emerald-500 shadow-lg overflow-hidden">
                                        {previewImage || employee?.profileImage ? (
                                            <img
                                                src={previewImage || employee.profileImage}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            getInitials(`${formData.firstName} ${formData.lastName}`)
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCameraClick}
                                        className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow cursor-pointer"
                                        title="Change picture"
                                    >
                                        <Camera size={14} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <h3 className="m-0 mb-1 text-xl font-extrabold text-slate-900">
                                    {formData.firstName} {formData.lastName}
                                </h3>
                                <p className="m-0 mb-4 text-sm font-bold text-slate-500">
                                    {designationName}
                                </p>

                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-extrabold">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    {employee?.status || "Active"} Employee
                                </span>
                            </div>

                            {/* Right Profile Summary Cards */}
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                                    <div className="flex justify-between items-center mb-5">
                                        <h2 className="m-0 text-xl font-extrabold text-slate-900">Personal Information</h2>
                                        <button
                                            type="button"
                                            onClick={openEditModal}
                                            className="flex items-center gap-1.5 h-[38px] px-4 rounded-lg text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 cursor-pointer transition-colors"
                                        >
                                            <Pencil size={14} />
                                            <span>Edit Profile</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">First Name</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.firstName || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Last Name</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.lastName || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Email</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.email || employee?.email || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Phone</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.phone || employee?.phone || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Gender</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.gender || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">DOB</span>
                                            <span className="text-sm font-bold text-slate-900">{formatDisplayDate(formData.dob || employee?.dob)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-500">Address</span>
                                            <span className="text-sm font-bold text-slate-900 text-right max-w-[220px]">{formData.address || employee?.address || "—"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                                    <h2 className="m-0 text-xl font-extrabold text-slate-900">Employment Information</h2>
                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Employee ID</span>
                                            <span className="text-sm font-bold text-slate-900">{employee?.employeeId || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Department</span>
                                            <span className="text-sm font-bold text-slate-900">{departmentName}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Designation</span>
                                            <span className="text-sm font-bold text-slate-900">{designationName}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Joining Date</span>
                                            <span className="text-sm font-bold text-slate-900">{formatDisplayDate(employee?.joiningDate)}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Salary</span>
                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(employee?.salary)}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <span className="text-sm font-semibold text-slate-500">Employment</span>
                                            <span className="text-sm font-bold text-slate-900">{employee?.employmentType || employee?.role || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-500">Status</span>
                                            <span className="text-sm font-bold text-slate-900">{employee?.status || "Active"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Profile Modal */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[999]">
                            <div className="bg-white rounded-2xl w-[680px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 flex flex-col">

                                {/* Header */}
                                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                                    <h3 className="m-0 text-lg font-extrabold text-slate-900">Edit Profile</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="border-0 bg-transparent text-slate-500 cursor-pointer p-1 flex items-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={handleSaveProfileEdit} className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.firstName}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.lastName}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={editForm.email}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone</label>
                                            <input
                                                type="text"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Gender</label>
                                            <select
                                                value={editForm.gender}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={editForm.dob}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, dob: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Address</label>
                                            <textarea
                                                rows={2}
                                                value={editForm.address}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm resize-y"
                                            />
                                        </div>

                                        {/* Employment Info */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Department</label>
                                            <input
                                                type="text"
                                                value={editForm.department}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Designation</label>
                                            <input
                                                type="text"
                                                value={editForm.designation}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, designation: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Joining Date</label>
                                            <input
                                                type="date"
                                                value={editForm.joiningDate}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, joiningDate: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Salary</label>
                                            <input
                                                type="number"
                                                value={editForm.salary}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, salary: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Employment Type</label>
                                            <input
                                                type="text"
                                                value={editForm.employmentType}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, employmentType: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
                                            />
                                        </div>

                                        {/* Read-Only Info */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Employee ID (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.employeeId || "—"}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Role (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.role || "Employee"}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Status (Read-only)</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={employee?.status || "Active"}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                                            />
                                        </div>

                                    </div>

                                    {/* Actions Footer */}
                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="px-[18px] py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className={`px-[18px] py-2.5 rounded-lg border-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold ${saving ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
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
        </div>
    );
}