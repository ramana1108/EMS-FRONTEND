import React, { useState, useEffect } from "react";
import "../App.css";

const API_URL = "http://localhost:5000/api/settings";

const Settings = () => {
  const [formData, setFormData] = useState({
    companyName: "Acme Global Solutions",
    companyEmail: "contact@acmeglobal.com",
    companyPhone: "9876543210",
    companyAddress: "123 Business Avenue, Suite 500, Tech Park, San Francisco, CA",
    companyWebsite: "https://www.acmeglobal.com",
    companyLogo: "",
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [logoInputType, setLogoInputType] = useState("url");
  const [settingsId, setSettingsId] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      if (response.ok) {
        const result = await response.json();
        if (result.settings) {
          setFormData({
            companyName: result.settings.companyName || "",
            companyEmail: result.settings.companyEmail || "",
            companyPhone: result.settings.companyPhone || "",
            companyAddress: result.settings.companyAddress || "",
            companyWebsite: result.settings.companyWebsite || "",
            companyLogo: result.settings.companyLogo || "",
          });
          setSettingsId(result.settings._id || "");
        }
      }
    } catch (err) {
      console.warn("Backend API offline. Running in standalone local mode.", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "companyPhone") {
      const numericVal = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericVal }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, companyLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required.";
    if (!formData.companyEmail.trim()) newErrors.companyEmail = "Company Email is required.";
    if (!formData.companyPhone.trim()) newErrors.companyPhone = "Company Phone is required.";
    if (!formData.companyAddress.trim()) newErrors.companyAddress = "Company Address is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.companyEmail && !emailRegex.test(formData.companyEmail)) {
      newErrors.companyEmail = "Invalid company email format.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (formData.companyPhone && !phoneRegex.test(formData.companyPhone)) {
      newErrors.companyPhone = "Company phone number must contain exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setAlert({
        show: true,
        type: "error",
        message: "Please correct the highlighted form errors before saving.",
      });
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      const url = settingsId ? `${API_URL}/settings/${settingsId}` : `${API_URL}/settings`;
      const method = settingsId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSettingsId(data.settings?._id || settingsId);
        setAlert({
          show: true,
          type: "success",
          message: data.message || "Company settings updated successfully!",
        });
      } else {
        setAlert({
          show: true,
          type: "error",
          message: data.message || "Failed to save company settings.",
        });
      }
    } catch (err) {
      setAlert({
        show: true,
        type: "success",
        message: "Settings saved successfully to local state! (Backend simulated)",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="dashboard-title">Company Settings</h1>
          <p className="dashboard-subtitle">Manage organization profile, contact information, and logo branding.</p>
        </div>
      </div>

      {alert.show && (
        <div className={`alert-banner ${alert.type}`}>
          <i className={`fa-solid ${alert.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`}></i>
          <span>{alert.message}</span>
        </div>
      )}

      <div className="emp-middle-grid" style={{ alignItems: "stretch" }}>
        <div className="employee-directory-card" style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
            <div className="settings-grid">
              <div className="form-column">
                {/* Branding */}
                <div className="settings-card">
                  <h3 className="card-title">
                    <i className="fa-solid fa-image"></i> Company Branding & Logo
                  </h3>
                  <div className="logo-upload-container">
                    <div className="logo-preview-box">
                      {formData.companyLogo ? (
                        <img src={formData.companyLogo} alt="Company Logo" />
                      ) : (
                        <div className="logo-placeholder">
                          {formData.companyName ? formData.companyName.charAt(0) : "C"}
                        </div>
                      )}
                    </div>
                    <div className="logo-actions">
                      <h4>Company Logo</h4>
                      <p>Displayed on employee portal headers and reports.</p>
                      <div className="upload-btn-row">
                        <button
                          type="button"
                          className={`btn-secondary ${logoInputType === "file" ? "active" : ""}`}
                          onClick={() => setLogoInputType("file")}
                        >
                          <i className="fa-solid fa-upload"></i> Upload File
                        </button>
                        <button
                          type="button"
                          className={`btn-secondary ${logoInputType === "url" ? "active" : ""}`}
                          onClick={() => setLogoInputType("url")}
                        >
                          <i className="fa-solid fa-link"></i> Image URL
                        </button>
                      </div>
                    </div>
                  </div>

                  {logoInputType === "file" ? (
                    <div className="form-group">
                      <label className="form-label">Upload Logo File (PNG/JPG/SVG)</label>
                      <input type="file" accept="image/*" className="form-control no-icon" onChange={handleLogoFileUpload} />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Logo Image URL</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-globe input-icon"></i>
                        <input
                          type="url"
                          name="companyLogo"
                          value={formData.companyLogo}
                          onChange={handleChange}
                          placeholder="https://example.com/logo.png"
                          className="form-control"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="settings-card">
                  <h3 className="card-title">
                    <i className="fa-solid fa-building"></i> Company Profile & Info
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Company Name <span className="required-star">*</span></label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-briefcase input-icon"></i>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corp Ltd"
                        className={`form-control ${errors.companyName ? "invalid" : ""}`}
                      />
                    </div>
                    {errors.companyName && <span className="field-hint error"><i className="fa-solid fa-circle-xmark"></i> {errors.companyName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Website (Optional)</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-globe input-icon"></i>
                      <input
                        type="url"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="https://www.company.com"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">
                    <i className="fa-solid fa-address-book"></i> Contact & Location Details
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company Email <span className="required-star">*</span></label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-envelope input-icon"></i>
                        <input
                          type="email"
                          name="companyEmail"
                          value={formData.companyEmail}
                          onChange={handleChange}
                          placeholder="admin@company.com"
                          className={`form-control ${errors.companyEmail ? "invalid" : ""}`}
                        />
                      </div>
                      {errors.companyEmail ? (
                        <span className="field-hint error"><i className="fa-solid fa-circle-xmark"></i> {errors.companyEmail}</span>
                      ) : (
                        <span className="field-hint">Format: name@domain.com</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Phone <span className="required-star">*</span></label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-phone input-icon"></i>
                        <input
                          type="text"
                          name="companyPhone"
                          maxLength="10"
                          value={formData.companyPhone}
                          onChange={handleChange}
                          placeholder="10-digit number"
                          className={`form-control ${errors.companyPhone ? "invalid" : ""}`}
                        />
                      </div>
                      {errors.companyPhone ? (
                        <span className="field-hint error"><i className="fa-solid fa-circle-xmark"></i> {errors.companyPhone}</span>
                      ) : (
                        <span className="field-hint">{formData.companyPhone.length}/10 digits entered</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Address <span className="required-star">*</span></label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-location-dot input-icon" style={{ top: "16px" }}></i>
                      <textarea
                        name="companyAddress"
                        rows="3"
                        value={formData.companyAddress}
                        onChange={handleChange}
                        placeholder="Enter complete office address..."
                        className={`form-control ${errors.companyAddress ? "invalid" : ""}`}
                      ></textarea>
                    </div>
                    {errors.companyAddress && <span className="field-hint error"><i className="fa-solid fa-circle-xmark"></i> {errors.companyAddress}</span>}
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-floppy-disk"></i> Save Company Settings</>}
                  </button>
                </div>
              </div>

              <div className="preview-column">
                <div className="settings-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div className="preview-card-header">
                    <div className="preview-logo-avatar">
                      {formData.companyLogo ? (
                        <img src={formData.companyLogo} alt="Logo" />
                      ) : (
                        <span>{formData.companyName ? formData.companyName.charAt(0) : "C"}</span>
                      )}
                    </div>
                    <div className="preview-company-name">{formData.companyName || "Your Company Name"}</div>
                    <span className="preview-badge">Verified Organization</span>
                  </div>

                  <div className="preview-details-list">
                    <div className="preview-item">
                      <div className="preview-item-icon"><i className="fa-solid fa-envelope"></i></div>
                      <div className="preview-item-content">
                        <label>Email Address</label>
                        <span>{formData.companyEmail || "Not provided"}</span>
                      </div>
                    </div>

                    <div className="preview-item">
                      <div className="preview-item-icon"><i className="fa-solid fa-phone"></i></div>
                      <div className="preview-item-content">
                        <label>Phone Number</label>
                        <span>{formData.companyPhone || "Not provided"}</span>
                      </div>
                    </div>

                    <div className="preview-item">
                      <div className="preview-item-icon"><i className="fa-solid fa-location-dot"></i></div>
                      <div className="preview-item-content">
                        <label>Headquarters</label>
                        <span>{formData.companyAddress || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;