import { useState, useEffect } from "react";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
  Globe,
  Clock,
  Calendar,
  Coins,
  Laptop,
  Map,
  Hash,
  ChevronDown,
  Edit,
  RotateCcw
} from "lucide-react";
import api from "../api";
import React, { useState, useEffect } from "react";
// styles are loaded globally via src/index.css (Tailwind + custom styles)

export default function Settings() {
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    city: "",
    state: "",
    country: "India",
    website: "",
    postalCode: "",
    systemName: "",
    timeZone: "(GMT+05:30) Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR (₹)"
  });

  // Keep a copy of initial data to reset form
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const data = await api.getSettings();
      if (data && data.success) {
      const data = await api.getSettings();
      if (data && data.success) {
const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const settings = data.settings;
        setSettingsId(settings._id);
        const mappedData = {
          companyName: settings.companyName ?? "",
          companyEmail: settings.companyEmail ?? "",
          companyPhone: settings.companyPhone ?? "",
          companyAddress: settings.companyAddress ?? "",
          city: settings.city ?? "",
          state: settings.state ?? "",
          country: settings.country || "India",
          website: settings.website ?? "",
          postalCode: settings.postalCode ?? "",
          systemName: settings.systemName ?? "",
          timeZone: settings.timeZone || "(GMT+05:30) Asia/Kolkata",
          dateFormat: settings.dateFormat || "DD/MM/YYYY",
          currency: settings.currency || "INR (₹)"
        };
        setFormData(mappedData);
        setInitialData(mappedData);
      }
    } catch (error) {
      console.error("Unable to fetch company settings:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Numeric-only check for phone and postalCode if necessary
    if (name === "companyPhone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }
    if (name === "postalCode") {
      newValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        companyAddress: "",
        city: "",
        state: "",
        country: "India",
        website: "",
        postalCode: "",
        systemName: "",
        timeZone: "(GMT+05:30) Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        currency: "INR (₹)"
      });
    }
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required.";
    }
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = "Company Email is required.";
    }
    if (!formData.companyPhone.trim()) {
      newErrors.companyPhone = "Company Phone is required.";
    }
    if (!formData.companyAddress.trim()) {
      newErrors.companyAddress = "Company Address is required.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.companyEmail && !emailRegex.test(formData.companyEmail)) {
      newErrors.companyEmail = "Invalid Email Address";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (formData.companyPhone && !phoneRegex.test(formData.companyPhone)) {
      newErrors.companyPhone = "Phone must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setAlert({
        show: true,
        type: "error",
        message: "Please fix all validation errors.",
      });
      return;
    }

    setLoading(true);
    try {
      const isUpdate = Boolean(settingsId);
      const payload = {
        ...formData,
        adminPassword: "Verify@12345" // Backend requires adminPassword for first-time creation schema validation
      };

      let response;
      if (isUpdate) {
        response = await api.updateSettings(settingsId, payload);
      } else {
        response = await api.createSettings(payload);
      }
      let data;
      if (isUpdate) {
        data = await api.updateSettings(settingsId, payload);
      } else {
        data = await api.createSettings(payload);
      }
const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({
          show: true,
          type: "success",
          message: data.message,
        });

      if (response && response.success) {
        setAlert({ show: true, type: "success", message: response.message || "Settings saved successfully." });
        setSettingsId(response.settings?._id || settingsId);
        setInitialData(formData);

        // Hide alert after 4 seconds
        setTimeout(() => {
          setAlert({ show: false, type: "", message: "" });
        }, 4000);
      } else {
        setAlert({ show: true, type: "error", message: response?.message || "Something went wrong." });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Unable to connect to server.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 8px" }}>
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="dashboard-title">Company Settings</h1>
          <p className="dashboard-subtitle" style={{ fontSize: "14px", color: "#64748b" }}>
            Manage your company information and system preferences.
          </p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>
          <Edit size={16} />
          <span>Edit Settings</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "24px" }}>
        <button
          style={{
            padding: "8px 16px 12px 16px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#2563eb",
            borderBottom: "2px solid #2563eb",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer"
          }}
        >
          Company Information
        </button>
      </div>

      {alert.show && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "14px",
          backgroundColor: alert.type === "success" ? "#ecfdf5" : "#fef2f2",
          color: alert.type === "success" ? "#065f46" : "#b91c1c",
          border: `1px solid ${alert.type === "success" ? "#a7f3d0" : "#fca5a5"}`
        }}>
          {alert.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{alert.message}</span>
        </div>
      )}

      {fetching ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
          <Loader className="animate-spin" size={32} color="#2563eb" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-8 items-start mb-10">

          {/* Left Column: Form Panel */}
          <div className="employee-directory-card p-6" style={{ backgroundColor: "#ffffff" }}>
            <form onSubmit={handleSubmit}>

              {/* Section 1: Company Information */}
              <div style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>Company Information</h2>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Update your company details.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Company Name</label>
                    <div className="input-with-icon-container">
                      <Building className="input-icon-decorator" size={16} />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Acme Solutions Pvt. Ltd."
                        className="input-decorated"
                      />
                    </div>
                    {errors.companyName && <span style={{ fontSize: "11px", color: "#ef4444" }}>{errors.companyName}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Website</label>
                    <div className="input-with-icon-container">
                      <Globe className="input-icon-decorator" size={16} />
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://www.acmesolutions.com"
                        className="input-decorated"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Company Email</label>
                    <div className="input-with-icon-container">
                      <Mail className="input-icon-decorator" size={16} />
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        placeholder="info@acmesolutions.com"
                        className="input-decorated"
                      />
                    </div>
                    {errors.companyEmail && <span style={{ fontSize: "11px", color: "#ef4444" }}>{errors.companyEmail}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Company Phone</label>
                    <div className="input-with-icon-container">
                      <Phone className="input-icon-decorator" size={16} />
                      <input
                        type="text"
                        name="companyPhone"
                        maxLength={10}
                        value={formData.companyPhone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="input-decorated"
                      />
                    </div>
                    {errors.companyPhone && <span style={{ fontSize: "11px", color: "#ef4444" }}>{errors.companyPhone}</span>}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Address</label>
                  <div className="input-with-icon-container">
                    <MapPin className="input-icon-decorator" size={16} />
                    <input
                      type="text"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      placeholder="123, Business Park, 5th Floor, Sector 62"
                      className="input-decorated"
                    />
                  </div>
                  {errors.companyAddress && <span style={{ fontSize: "11px", color: "#ef4444" }}>{errors.companyAddress}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr", gap: "12px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>City</label>
                    <div className="input-with-icon-container">
                      <Building className="input-icon-decorator" size={16} style={{ color: "#94a3b8" }} />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Noida"
                        className="input-decorated"
                      />
                    </div>
                    {errors.city && <span style={{ fontSize: "11px", color: "#ef4444" }}>{errors.city}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>State</label>
                    <div className="input-with-icon-container">
                      <Map className="input-icon-decorator" size={16} style={{ color: "#94a3b8" }} />
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Uttar Pradesh"
                        className="input-decorated"
                      />
                    </div>
                    {errors.state && <span style={{ fontSize: "11px", color: "#ef4444" }}>{errors.state}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0, position: "relative" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Country</label>
                    <div className="input-with-icon-container">
                      <Globe className="input-icon-decorator" size={16} style={{ color: "#94a3b8" }} />
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="input-decorated appearance-none"
                        style={{ paddingRight: "30px" }}
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Postal Code</label>
                    <div className="input-with-icon-container">
                      <Hash className="input-icon-decorator" size={16} style={{ color: "#94a3b8" }} />
                      <input
                        type="text"
                        name="postalCode"
                        maxLength={6}
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="201301"
                        className="input-decorated"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Separator line */}
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "24px 0" }} />

              {/* Section 2: System Preferences */}
              <div style={{ marginBottom: "28px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>System Preferences</h2>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Configure system related settings.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>System Name</label>
                    <div className="input-with-icon-container">
                      <Laptop className="input-icon-decorator" size={16} />
                      <input
                        type="text"
                        name="systemName"
                        value={formData.systemName}
                        onChange={handleChange}
                        placeholder="Employee Management System"
                        className="input-decorated"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, position: "relative" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Time Zone</label>
                    <div className="input-with-icon-container">
                      <Clock className="input-icon-decorator" size={16} />
                      <select
                        name="timeZone"
                        value={formData.timeZone}
                        onChange={handleChange}
                        className="input-decorated appearance-none"
                        style={{ paddingRight: "30px" }}
                      >
                        <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                        <option value="(GMT+00:00) London">(GMT+00:00) London</option>
                        <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time</option>
                        <option value="(GMT-08:00) Pacific Time">(GMT-08:00) Pacific Time</option>
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ margin: 0, position: "relative" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Date Format</label>
                    <div className="input-with-icon-container">
                      <Calendar className="input-icon-decorator" size={16} />
                      <select
                        name="dateFormat"
                        value={formData.dateFormat}
                        onChange={handleChange}
                        className="input-decorated appearance-none"
                        style={{ paddingRight: "30px" }}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, position: "relative" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Currency</label>
                    <div className="input-with-icon-container">
                      <Coins className="input-icon-decorator" size={16} />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="input-decorated appearance-none"
                        style={{ paddingRight: "30px" }}
                      >
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-cancel"
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px" }}
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
                  }}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
{/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 items-start">
        {/* Profile Card */}
        <div className="employee-directory-card p-6">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
            <Building size={20} color="#0f766e" />
            <h2 className="emp-card-title" style={{ margin: 0 }}>Company Information</h2>
<div className={` ${darkMode ? 'dark' : ''}`}>
      <main className="p-6">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold">Company Settings</h1>
            <p className="text-sm text-slate-600">Manage your company information and application settings.</p>
          </div>

          {/* Right Column: Company Overview Preview */}
          <div className="employee-directory-card p-6" style={{ backgroundColor: "#ffffff" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>Company Overview</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>Preview of your company information.</p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", marginBottom: "20px" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "16px",
                border: "1px solid #dbeafe"
              }}>
                <Building size={36} style={{ color: "#2563eb" }} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "750", color: "#1e293b", margin: "0 0 4px 0", textAlign: "center" }}>
                {formData.companyName || "Company Name"}
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0, textAlign: "center" }}>
                {formData.systemName || "Employee Management System"}
              </p>
            </div>

            {/* Separator line */}
            <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "20px 0" }} />

            {/* Contact Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Mail size={16} style={{ color: "#64748b", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#475569" }}>
                  {formData.companyEmail || "info@company.com"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Phone size={16} style={{ color: "#64748b", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#475569" }}>
                  {formData.companyPhone || "+91 00000 00000"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Globe size={16} style={{ color: "#64748b", marginTop: "2px", flexShrink: 0 }} />
                {formData.website ? (
                  <a href={formData.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>
                    {formData.website}
                  </a>
                ) : (
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>No website configured</span>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <MapPin size={16} style={{ color: "#64748b", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#475569", lineHeight: "1.4" }}>
                  {formData.companyAddress ? (
                    <>
                      {formData.companyAddress}
                      {(formData.city || formData.state || formData.postalCode || formData.country) && ", "}
                      {formData.city}
                      {formData.state && `, ${formData.state}`}
                      {formData.postalCode && ` - ${formData.postalCode}`}
                      {formData.country && `, ${formData.country}`}
                    </>
                  ) : (
                    "No address configured"
                  )}
                </span>
              </div>
            </div>

            {/* Separator line */}
            <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "20px 0" }} />

            {/* Prefs Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "#64748b" }}>System Name</span>
                <span style={{ color: "#1e293b", textAlign: "right" }}>{formData.systemName || "Employee Management System"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "#64748b" }}>Time Zone</span>
                <span style={{ color: "#1e293b", textAlign: "right" }}>{formData.timeZone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "#64748b" }}>Date Format</span>
                <span style={{ color: "#1e293b", textAlign: "right" }}>{formData.dateFormat}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "#64748b" }}>Currency</span>
                <span style={{ color: "#1e293b", textAlign: "right" }}>{formData.currency}</span>
              </div>
            </div>

          </div>
        {/* Form Card */}
        <div className="employee-directory-card p-6">
          <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
            <h2 className="emp-card-title">{settingsId ? "Update Settings" : "Configure Settings"}</h2>
{alert.show && (
          <div className={`mb-4 ${alert.type === 'success' ? 'text-emerald-800 bg-emerald-50' : 'text-rose-700 bg-rose-50'} p-3 rounded-md`}> 
            <span>{alert.message}</span>
          </div>

          <form onSubmit={handleSubmit} className="enroll-form">
            <div className="form-group">
              <label>Company Name <span className="req">*</span></label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter Company Name"
              />
              {errors.companyName && (
                <div className="field-error">{errors.companyName}</div>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Company Email <span className="req">*</span></label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="Enter Email"
                />
                {errors.companyEmail && (
                  <div className="field-error">{errors.companyEmail}</div>
                )}
              </div>
              <div className="form-group">
                <label>Company Phone <span className="req">*</span></label>
                <input
                  type="text"
                  name="companyPhone"
                  maxLength={10}
                  value={formData.companyPhone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit number"
                />
                {errors.companyPhone && (
                  <div className="field-error">{errors.companyPhone}</div>
                )}
<div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Company Information</h3>
            </div>

            {fetching ? (
              <p>Loading...</p>
            ) : settingsData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Company Name</span>
                  <strong>{settingsData.companyName}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Email</span>
                  <strong>{settingsData.companyEmail}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Phone</span>
                  <strong>{settingsData.companyPhone}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Address</span>
                  <strong>{settingsData.companyAddress}</strong>
                </div>

                <div className="flex justify-between">
                  <span>City</span>
                  <strong>{settingsData.city}</strong>
                </div>

                <div className="flex justify-between">
                  <span>State</span>
                  <strong>{settingsData.state}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Country</span>
                  <strong>{settingsData.country}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span>Password</span>
                    <div>
                      <strong>{showPassword ? settingsData.adminPassword : '••••••••'}</strong>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 py-1 rounded-md bg-slate-100">{showPassword ? 'Hide' : 'View'}</button>
                </div>
              </div>
            ) : (
              <p>No Company Settings Found.</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{settingsId ? 'Update Company' : 'Create Company'}</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter Company Name" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                {errors.companyName && <small className="text-rose-600">{errors.companyName}</small>}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Company Email *</label>
                <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} placeholder="Enter Company Email" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                {errors.companyEmail && <small className="text-rose-600">{errors.companyEmail}</small>}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Company Phone *</label>
                <input type="text" name="companyPhone" maxLength={10} value={formData.companyPhone} onChange={handleChange} placeholder="Enter Phone Number" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                {errors.companyPhone && <small className="text-rose-600">{errors.companyPhone}</small>}
              </div>
            </div>

            <div className="form-group">
              <label>Company Address <span className="req">*</span></label>
              <textarea
                name="companyAddress"
                rows="2"
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="Enter Address"
                style={{ minHeight: "60px", resize: "vertical" }}
              />
              {errors.companyAddress && (
                <div className="field-error">{errors.companyAddress}</div>
              )}
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>City <span className="req">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
                {errors.city && (
                  <div className="field-error">{errors.city}</div>
                )}
              </div>
              <div className="form-group">
                <label>State <span className="req">*</span></label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
                {errors.state && (
                  <div className="field-error">{errors.state}</div>
                )}
              </div>
              <div className="form-group">
                <label>Country <span className="req">*</span></label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
                {errors.country && (
                  <div className="field-error">{errors.country}</div>
                )}
<div className="mb-3">
                <label className="block text-sm font-medium mb-1">Company Address *</label>
                <textarea name="companyAddress" rows="3" value={formData.companyAddress} onChange={handleChange} placeholder="Enter Company Address" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                {errors.companyAddress && <small className="text-rose-600">{errors.companyAddress}</small>}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter City" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                {errors.city && <small className="text-rose-600">{errors.city}</small>}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="Enter State" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                {errors.state && <small className="text-rose-600">{errors.state}</small>}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Enter Country" className="w-full px-3 py-2 rounded-md border border-slate-300" />
                {errors.country && <small className="text-rose-600">{errors.country}</small>}
              </div>
            </div>



            <button
              type="submit"
              className="btn-save"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", marginTop: "16px" }}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{settingsId ? "Update Settings" : "Configure Settings"}</span>
                </>
              )}
            </button>
          </form>
<div className="mb-3">
                <label className="block text-sm font-medium mb-1">Admin Password *</label>
                <div className="flex gap-2">
                  <input type={showPassword ? 'text' : 'password'} name="adminPassword" value={formData.adminPassword} onChange={handleChange} placeholder="Enter Admin Password" className="flex-1 px-3 py-2 rounded-md border border-slate-300" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 py-2 rounded-md bg-slate-100">{showPassword ? 'Hide' : 'View'}</button>
                </div>
                {errors.adminPassword && <small className="text-rose-600">{errors.adminPassword}</small>}
              </div>

              <div className="mb-3">
                <button type="submit" className="w-full py-2 rounded-md bg-emerald-700 text-white" disabled={loading}>
                  {loading ? 'Saving...' : settingsId ? 'Update Settings' : 'Create Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}