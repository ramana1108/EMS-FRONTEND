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
  RotateCcw
} from "lucide-react";
import api from "../api";

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
    <div className="w-full">
      {/* Header */}
      <div className="page-header mb-6">
        <div>
          <h1 className="dashboard-title">Company Settings</h1>
          <p className="dashboard-subtitle">
            Manage your company information and system preferences.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] mb-6">
        <button
          className="pb-3 px-1 border-b-2 border-[#2563EB] font-bold text-sm text-[#2563EB] cursor-pointer"
        >
          Company Information
        </button>
      </div>

      {alert.show && (
        <div className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-xs md:text-sm font-semibold ${
          alert.type === "success"
            ? "border-[#D5F2E9] bg-[#E8F8F3] text-[#087F72]"
            : "border-[#FECACA] bg-[#FEECEC] text-[#DC2626]"
        }`}>
          {alert.type === "success" ? <CheckCircle size={18} className="shrink-0 text-[#087F72]" /> : <AlertCircle size={18} className="shrink-0 text-[#DC2626]" />}
          <span>{alert.message}</span>
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-[#2563EB]" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">

          {/* Left Column: Form Panel */}
          <div className="lg:col-span-7 xl:col-span-8 card-box p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Section 1: Company Information */}
              <div>
                <h2 className="text-base font-extrabold text-[#172033] mb-1">Company Information</h2>
                <p className="text-xs font-semibold text-[#64748B] mb-5">Update your company details.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label">Company Name <span className="req">*</span></label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Building size={16} />
                      </span>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Acme Solutions Pvt. Ltd."
                        className={`form-input ${errors.companyName ? "input-error" : ""}`}
                      />
                    </div>
                    {errors.companyName && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.companyName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Globe size={16} />
                      </span>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://www.acmesolutions.com"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label">Company Email <span className="req">*</span></label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        placeholder="info@acmesolutions.com"
                        className={`form-input ${errors.companyEmail ? "input-error" : ""}`}
                      />
                    </div>
                    {errors.companyEmail && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.companyEmail}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Phone <span className="req">*</span></label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        name="companyPhone"
                        maxLength={10}
                        value={formData.companyPhone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className={`form-input ${errors.companyPhone ? "input-error" : ""}`}
                      />
                    </div>
                    {errors.companyPhone && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.companyPhone}</span>}
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Address <span className="req">*</span></label>
                  <div className="input-container">
                    <span className="input-icon">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      placeholder="123, Business Park, 5th Floor, Sector 62"
                      className={`form-input ${errors.companyAddress ? "input-error" : ""}`}
                    />
                  </div>
                  {errors.companyAddress && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.companyAddress}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="form-group">
                    <label className="form-label">City <span className="req">*</span></label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Building size={16} />
                      </span>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Noida"
                        className={`form-input ${errors.city ? "input-error" : ""}`}
                      />
                    </div>
                    {errors.city && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">State <span className="req">*</span></label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Map size={16} />
                      </span>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Uttar Pradesh"
                        className={`form-input ${errors.state ? "input-error" : ""}`}
                      />
                    </div>
                    {errors.state && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Country <span className="req">*</span></label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Globe size={16} />
                      </span>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`form-input appearance-none pr-10 ${errors.country ? "input-error" : ""}`}
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                    </div>
                    {errors.country && <span className="text-xs font-semibold text-red-500 mt-1 block">{errors.country}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Hash size={16} />
                      </span>
                      <input
                        type="text"
                        name="postalCode"
                        maxLength={6}
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="201301"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Separator line */}
              <div className="h-[1px] bg-[#E2E8F0] my-6" />

              {/* Section 2: System Preferences */}
              <div>
                <h2 className="text-base font-extrabold text-[#172033] mb-1">System Preferences</h2>
                <p className="text-xs font-semibold text-[#64748B] mb-5">Configure system related settings.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label">System Name</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Laptop size={16} />
                      </span>
                      <input
                        type="text"
                        name="systemName"
                        value={formData.systemName}
                        onChange={handleChange}
                        placeholder="Employee Management System"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time Zone</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Clock size={16} />
                      </span>
                      <select
                        name="timeZone"
                        value={formData.timeZone}
                        onChange={handleChange}
                        className="form-input appearance-none pr-10"
                      >
                        <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                        <option value="(GMT+00:00) London">(GMT+00:00) London</option>
                        <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time</option>
                        <option value="(GMT-08:00) Pacific Time">(GMT-08:00) Pacific Time</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Calendar size={16} />
                      </span>
                      <select
                        name="dateFormat"
                        value={formData.dateFormat}
                        onChange={handleChange}
                        className="form-input appearance-none pr-10"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <Coins size={16} />
                      </span>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="form-input appearance-none pr-10"
                      >
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-cancel"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
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
          </div>

          {/* Right Column: Company Overview Preview */}
          <div className="lg:col-span-5 xl:col-span-4 card-box p-6 sm:p-8">
            <h2 className="text-base font-extrabold text-[#172033] mb-1">Company Overview</h2>
            <p className="text-xs font-semibold text-[#64748B] mb-6">Preview of your company information.</p>

            <div className="flex flex-col items-center py-4 mb-4 text-center">
              <div className="w-20 h-20 rounded-full bg-[#EFF6FF] border border-[#D7E7FF] flex items-center justify-center mb-4 text-[#2563EB] shadow-xs">
                <Building size={36} />
              </div>
              <h3 className="text-lg font-extrabold text-[#172033] mb-1">
                {formData.companyName || "Company Name"}
              </h3>
              <p className="text-xs font-semibold text-[#64748B]">
                {formData.systemName || "Employee Management System"}
              </p>
            </div>

            {/* Separator line */}
            <div className="h-[1px] bg-[#E2E8F0] my-5" />

            {/* Contact Details */}
            <div className="space-y-3.5 mb-6">
              <div className="flex items-start gap-3 text-sm text-[#475569]">
                <Mail size={16} className="mt-0.5 shrink-0 text-[#64748B]" />
                <span className="break-all font-medium">{formData.companyEmail || "info@company.com"}</span>
              </div>

              <div className="flex items-start gap-3 text-sm text-[#475569]">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#64748B]" />
                <span className="font-medium">{formData.companyPhone || "+91 00000 00000"}</span>
              </div>

              <div className="flex items-start gap-3 text-sm text-[#475569]">
                <Globe size={16} className="mt-0.5 shrink-0 text-[#64748B]" />
                {formData.website ? (
                  <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline break-all font-semibold">
                    {formData.website}
                  </a>
                ) : (
                  <span className="text-[#94A3B8] font-medium">No website configured</span>
                )}
              </div>

              <div className="flex items-start gap-3 text-sm text-[#475569]">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#64748B]" />
                <span className="font-medium leading-relaxed">
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
            <div className="h-[1px] bg-[#E2E8F0] my-5" />

            {/* Prefs Summary */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#64748B]">System Name</span>
                <span className="font-semibold text-[#172033] text-right">{formData.systemName || "Employee Management System"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#64748B]">Time Zone</span>
                <span className="font-semibold text-[#172033] text-right">{formData.timeZone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#64748B]">Date Format</span>
                <span className="font-semibold text-[#172033] text-right">{formData.dateFormat}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#64748B]">Currency</span>
                <span className="font-semibold text-[#172033] text-right">{formData.currency}</span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}