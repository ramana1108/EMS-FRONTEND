import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Briefcase } from "lucide-react";

// Use a Vite-friendly env var and proxy it to the backend during development.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: username,
                    password
                })
            });

            const data = await res.json();

<<<<<<< HEAD
            if (!res.ok || !data.success) {
                setError(data.message || "Invalid credentials.");
                return;
            }

            setSuccess(`Sign in successful! Welcome back, ${data.user.name}.`);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setTimeout(() => {
                const roleName = data.user.role?.toLowerCase?.() || "";
                if (roleName === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/employee/dashboard");
                }
            }, 800);
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Unable to reach server. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <div className="flex min-h-screen flex-col lg:flex-row">
                <div className="relative flex flex-1 items-end justify-start overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-8 py-12 text-white lg:px-16 lg:py-20">
                    <div className="absolute inset-0 bg-[url('/office_bg.png')] bg-cover bg-center opacity-25" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-emerald-900/20 to-transparent" />
                    <div className="relative z-10 max-w-xl">
                        <div className="mb-6 flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                            <Briefcase size={20} className="text-emerald-200" />
                            <span className="text-sm font-semibold tracking-[0.2em] uppercase">EMS Portal</span>
                        </div>
                        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Employment Management System</h1>
                        <p className="mt-4 text-sm leading-7 text-emerald-50/90 sm:text-base">
                            A unified, modern solution for workforce scheduling, role configuration, access control, and employee records management.
                        </p>
                    </div>
                </div>

<<<<<<< HEAD
    {/* Right side panel (Login card) */}
    <div className="login-right-panel">
    <div className="login-right-inner">
    {/* Mobile Display Branding Header (Visible on Mobile only) */}
    <div className="login-mobile-header" style={{ width: "100%", textAlign: "center", marginBottom: "2rem" }}>
    <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.3rem",
                background: "var(--accent-bg)",
                borderRadius: "50%",
                marginBottom: "0.5rem"
                }}>
    <Briefcase size={28} style={{ color: "var(--accent)" }} />
    </div>
    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Sign In to EMS</h2>
    <p style={{ fontSize: "0.85rem", color: "var(--text)" }}>Enter your credentials to access your workspace.</p>
    </div>
=======
        if (matchedUser && matchedUser.password === password) {
            setSuccess(`Sign in successful! Welcome back, ${matchedUser.fullName}.`);//condition true show success msg
            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        } else if (isEmployeeDummy) {
            setSuccess("Sign in successful! Welcome back, Demo Employee.");//check employee?
            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        } else if (isAdminDummy) {
            setSuccess("Sign in successful! Welcome back, Demo Admin.");//check admin?
            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        } else {
            setError("Invalid credentials. Try using admin@gmail.com or employee@gmail.com / password, or register a new account.");
        }//others show error
    };

    return (
        <div className="login-split-container fade-in">
            <div className="login-left-panel" style={{ backgroundImage: "url('/office_bg.png')" }}>
                <div className="login-left-branding">
                    <Briefcase size={24} style={{ color: "var(--accent)" }} />
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.5px" }}>EMS Portal</span>
                </div>
                <div className="login-left-content">
                    <h1 className="login-left-title">EMPLOYMENT MANAGEMENT SYSTEM</h1>
                    <p className="login-left-desc">
                        A unified, modern solution for workplace scheduling, role configuration, access control, and employee records management.
                    </p>
                </div>
                <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem" }}>
                    &copy; {new Date().getFullYear()}  EMS. Version 0.0.1
                </div>
            </div>
>>>>>>> 62509eb (admin-view)

            {/* Right side panel (Login card) */}
            <div className="login-right-panel">
                <div className="login-right-inner">
                    {/* Mobile Display Branding Header (Visible on Mobile only) */}
                    <div className="login-mobile-header" style={{ width: "100%", textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0.3rem",
                            background: "var(--accent-bg)",
                            borderRadius: "50%",
                            marginBottom: "0.5rem"
                        }}>
                            <Briefcase size={28} style={{ color: "var(--accent)" }} />
                        </div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Sign In to EMS</h2>
                        <p style={{ fontSize: "0.85rem", color: "var(--text)" }}>Enter your credentials to access your workspace.</p>
                    </div>

                    {/* Core Sign-In Card */}
                    <div className="card" style={{ width: "100%", padding: "1rem 2rem", margin: 0 }}>

                        {error && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: "8px",
                                color: "#ef4444",
                                fontSize: "0.85rem",
                                marginBottom: "1.25rem",
                                textAlign: "left"
                            }}>
                                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                <span>{error}</span>
                            </div>
                        )}

<<<<<<< HEAD
    <form onSubmit={handleLogin}>
    {/* Email Input */}
    <div className="form-group">
    <label className="form-label">Email</label>
    <div className="input-container">
    <span className="input-icon">
    <User size={18} />
    </span>
    <input
        type="text"
        className="form-input"
        placeholder="Enter your email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
    />
    </div>
    </div>
    {/* Password Input */}
    <div className="form-group" style={{ marginBottom: "1.75rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
    <a href="#" style={{ fontSize: "0.75rem", color: "var(--text)" }}>Forgot password?</a>
    </div>
    <div className="input-container">
    <span className="input-icon">
           <Lock size={18} />
    </span>
    <input
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingRight: "2.75rem" }}
        />
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
                position: "absolute",
                right: "1rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text)",
                opacity: 0.7,
                display: "flex",
                alignItems: "center"
                    }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    </div>
    </div>
    {/* Sign In CTA */}
    <button type="submit" className="btn btn-primary" style={{ marginBottom: "1.25rem" }} disabled={loading}>
         {loading ? "Signing In..." : "Sign In"}
    </button>
    </form>
    </div>
    </div>
    </div>
    </div>
=======
                        {success && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                background: "rgba(16, 185, 129, 0.1)",
                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                borderRadius: "8px",
                                color: "var(--accent)",
                                fontSize: "0.85rem",
                                marginBottom: "1.25rem",
                                textAlign: "left"
                            }}>
                                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            {/* Email Input */}
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <div className="input-container">
                                    <span className="input-icon">
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter your email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Password Input */}
                            <div className="form-group" style={{ marginBottom: "1.75rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                                    <a href="#" style={{ fontSize: "0.75rem", color: "var(--text)" }}>Forgot password?</a>
                                </div>
                                <div className="input-container">
                                    <span className="input-icon">
=======
                <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Briefcase size={28} />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-900">Sign In to EMS</h2>
                            <p className="mt-2 text-sm text-slate-500">Enter your credentials to access your workspace.</p>
                        </div>

                        {error && (
                            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                                <CheckCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                        placeholder="Enter your email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700">Password</label>
                                    <a href="#" className="text-sm text-slate-500 hover:text-emerald-600">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
>>>>>>> dcc57df32a52b92dd6d69c2e9df329c4a799a36c
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
<<<<<<< HEAD
                                        className="form-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingRight: "2.75rem" }}
=======
                                        className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
>>>>>>> dcc57df32a52b92dd6d69c2e9df329c4a799a36c
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                                        style={{
                                            position: "absolute",
                                            right: "1rem",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "var(--text)",
                                            opacity: 0.7,
                                            display: "flex",
                                            alignItems: "center"
                                        }}>
=======
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
>>>>>>> dcc57df32a52b92dd6d69c2e9df329c4a799a36c
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
<<<<<<< HEAD
                            {/* Sign In CTA */}
                            <button type="submit" className="btn btn-primary" style={{ marginBottom: "1.25rem" }}>
                                Sign In
=======

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={loading}
                            >
                                {loading ? "Signing In..." : "Sign In"}
>>>>>>> dcc57df32a52b92dd6d69c2e9df329c4a799a36c
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
<<<<<<< HEAD
>>>>>>> 62509eb (admin-view)
=======
>>>>>>> dcc57df32a52b92dd6d69c2e9df329c4a799a36c
    );
}

export default Login;