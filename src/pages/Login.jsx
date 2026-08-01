import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

            if (!res.ok || !data.success) {
                // Matches your backend's messages: "Email not found",
                // "Incorrect Password", "Please enter a valid email address", etc.
                setError(data.message || "Invalid credentials.");
                setLoading(false);
                return;
            }

            setSuccess(`Sign in successful! Welcome back, ${data.user.name}.`);

            // Persist auth so protected routes / axios calls can use it later
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Route based on role from the backend (matches your Role model's `name`)
            setTimeout(() => {
                if (data.user.role === "Admin") {
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
    );
}

export default Login;