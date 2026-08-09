import { useState, useEffect } from "react";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";
import api from "../api";

export default function Settings() {
  const [settingsData, setSettingsData] = useState(null);
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
    country: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const data = await api.getSettings();
      if (data && data.success) {
        const settings = data.settings;
        setSettingsData(settings);
        setSettingsId(settings._id);
        setFormData({
          companyName: settings.companyName ?? "",
          companyEmail: settings.companyEmail ?? "",
          companyPhone: settings.companyPhone ?? "",
          companyAddress: settings.companyAddress ?? "",
          city: settings.city ?? "",
          state: settings.state ?? "",
          country: settings.country ?? "",
        });
        setAlert({ show: true, type: "success", message: data.message });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Unable to fetch company settings.",
      });
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "companyPhone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
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
      newErrors.companyPhone = "Phone number must contain exactly 10 digits";
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
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        companyAddress: formData.companyAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      };

      let data;
      if (isUpdate) {
        data = await api.updateSettings(settingsId, payload);
      } else {
        data = await api.createSettings(payload);
      }

      if (data && data.success) {
        setAlert({ show: true, type: "success", message: data.message });
        fetchSettings();
      } else {
        setAlert({ show: true, type: "error", message: data?.message || "Something went wrong." });
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
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="dashboard-title">Company Settings</h1>
          <p className="dashboard-subtitle">Manage your company profile details and administrative credentials.</p>
        </div>
      </div>

      {alert.show && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px",
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

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 items-start">
        {/* Profile Card */}
        <div className="employee-directory-card p-6">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
            <Building size={20} color="#0f766e" />
            <h2 className="emp-card-title" style={{ margin: 0 }}>Company Information</h2>
          </div>

          {fetching ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
              <Loader className="animate-spin" size={24} color="#0f766e" />
            </div>
          ) : settingsData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "600", fontSize: "13px" }}>COMPANY NAME</span>
                <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{settingsData.companyName}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "600", fontSize: "13px" }}>EMAIL ADDRESS</span>
                <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={14} color="#64748b" />
                  {settingsData.companyEmail}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "600", fontSize: "13px" }}>PHONE NUMBER</span>
                <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} color="#64748b" />
                  {settingsData.companyPhone}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "600", fontSize: "13px" }}>ADDRESS</span>
                <span style={{ fontWeight: "750", color: "#475569", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={14} color="#64748b" />
                  {settingsData.companyAddress}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                <div>
                  <span style={{ display: "block", color: "#64748b", fontWeight: "600", fontSize: "11px", marginBottom: "4px" }}>CITY</span>
                  <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "13px" }}>{settingsData.city}</span>
                </div>
                <div>
                  <span style={{ display: "block", color: "#64748b", fontWeight: "600", fontSize: "11px", marginBottom: "4px" }}>STATE</span>
                  <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "13px" }}>{settingsData.state}</span>
                </div>
                <div>
                  <span style={{ display: "block", color: "#64748b", fontWeight: "600", fontSize: "11px", marginBottom: "4px" }}>COUNTRY</span>
                  <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "13px" }}>{settingsData.country}</span>
                </div>
              </div>

            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#64748b", margin: "20px 0" }}>No settings configured yet.</p>
          )}
        </div>

        {/* Form Card */}
        <div className="employee-directory-card p-6">
          <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
            <h2 className="emp-card-title">{settingsId ? "Update Settings" : "Configure Settings"}</h2>
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
        </div>
      </div>
    </div>
  );
}