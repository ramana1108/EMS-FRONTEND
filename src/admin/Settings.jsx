import React, { useState, useEffect } from "react";
import "../App.css";

const API_URL = "http://localhost:5000/settings";

const Settings = () => {
  const [settingsData, setSettingsData] = useState(null);
  const [settingsId, setSettingsId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [darkMode] = useState(localStorage.getItem("theme") === "dark");

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
    adminPassword: "",
  });

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    setFetching(true);

    try {
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
          adminPassword: settings.adminPassword ?? "",
        });

        setAlert({
          show: true,
          type: "success",
          message: data.message,
        });
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

    if (!formData.adminPassword.trim()) {
      newErrors.adminPassword = "Password is required.";
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
      const url = isUpdate ? `${API_URL}/${settingsId}` : API_URL;
      const method = isUpdate ? "PUT" : "POST";

      const payload = {
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        companyAddress: formData.companyAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        adminPassword: formData.adminPassword,
      };

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

        fetchSettings();
      } else {
        setAlert({
          show: true,
          type: "error",
          message: data.message || "Something went wrong.",
        });
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

  const handleEditClick = () => {
    if (!settingsData) return;

    setFormData({
      companyName: settingsData.companyName ?? "",
      companyEmail: settingsData.companyEmail ?? "",
      companyPhone: settingsData.companyPhone ?? "",
      companyAddress: settingsData.companyAddress ?? "",
      city: settingsData.city ?? "",
      state: settingsData.state ?? "",
      country: settingsData.country ?? "",
      adminPassword: settingsData.adminPassword ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={`settings-page ${darkMode ? "dark-theme" : ""}`}>
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="dashboard-title">Company Settings</h1>
            <p className="dashboard-subtitle">
              Manage your company information and application settings.
            </p>
          </div>
        </div>

        {alert.show && (
          <div className={`ems-alert-banner ${alert.type}`}>
            <i
              className={`fa-solid ${
                alert.type === "success"
                  ? "fa-circle-check"
                  : "fa-circle-exclamation"
              }`}
            ></i>
            <span>{alert.message}</span>
          </div>
        )}

        <div className="middle-grid">
          <div className="table-card">
            <div className="card-header">
              <h3 style={{color:"black"}}>Company Information</h3>
            </div>

            {fetching ? (
              <p>Loading...</p>
            ) : settingsData ? (
              <div className="company-profile">
                <div className="profile-row">
                  <span>Company Name</span>
                  <strong>{settingsData.companyName}</strong>
                </div>

                <div className="profile-row">
                  <span>Email</span>
                  <strong>{settingsData.companyEmail}</strong>
                </div>

                <div className="profile-row">
                  <span>Phone</span>
                  <strong>{settingsData.companyPhone}</strong>
                </div>

                <div className="profile-row">
                  <span>Address</span>
                  <strong>{settingsData.companyAddress}</strong>
                </div>

                <div className="profile-row">
                  <span>City</span>
                  <strong>{settingsData.city}</strong>
                </div>

                <div className="profile-row">
                  <span>State</span>
                  <strong>{settingsData.state}</strong>
                </div>

                <div className="profile-row">
                  <span>Country</span>
                  <strong>{settingsData.country}</strong>
                </div>

                <div className="profile-row">
                  <span>Password</span>
                  <strong>
                    {showPassword ? settingsData.adminPassword : "••••••••"}
                  </strong>
                  <button
                    type="button"
                    className="btn-contact"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "View"}
                  </button>
                </div>
              </div>
            ) : (
              <p>No Company Settings Found.</p>
            )}
          </div>

          <div className="card-box">
            <h3 className="card-title">
              {settingsId ? "Update Company" : "Create Company"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter Company Name"
                />
                {errors.companyName && (
                  <small className="text-danger">{errors.companyName}</small>
                )}
              </div>

              <div className="form-group">
                <label>Company Email *</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter Company Email"
                />
                {errors.companyEmail && (
                  <small className="text-danger">{errors.companyEmail}</small>
                )}
              </div>

              <div className="form-group">
                <label>Company Phone *</label>
                <input
                  type="text"
                  name="companyPhone"
                  maxLength={10}
                  value={formData.companyPhone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter Phone Number"
                />
                {errors.companyPhone && (
                  <small className="text-danger">{errors.companyPhone}</small>
                )}
              </div>

              <div className="form-group">
                <label>Company Address *</label>
                <textarea
                  name="companyAddress"
                  rows="3"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter Company Address"
                />
                {errors.companyAddress && (
                  <small className="text-danger">
                    {errors.companyAddress}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter City"
                />
                {errors.city && (
                  <small className="text-danger">{errors.city}</small>
                )}
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter State"
                />
                {errors.state && (
                  <small className="text-danger">{errors.state}</small>
                )}
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter Country"
                />
                {errors.country && (
                  <small className="text-danger">{errors.country}</small>
                )}
              </div>

              <div className="form-group">
                <label>Admin Password *</label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter Admin Password"
                  />
                  <button
                    type="button"
                    className="btn-contact"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "View"}
                  </button>
                </div>
                {errors.adminPassword && (
                  <small className="text-danger">
                    {errors.adminPassword}
                  </small>
                )}
              </div>

              <div className="form-group">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : settingsId ? (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i> Update
                      Settings
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus"></i> Create Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;