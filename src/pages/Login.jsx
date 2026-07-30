import React, { useState } from "react";//import react & usestate for s,u
import { Link, useNavigate } from "react-router-dom";// fornavigation b/w pages  
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Briefcase } from "lucide-react";//import the icond from lu...

function Login() {//login fn
    const [username, setUsername] = useState("");//set username
    const [password, setPassword] = useState("");// set passw..
    const [showPassword, setShowPassword] = useState(false);//decide whether to show pass
    const [error, setError] = useState("");//set err if fail login
    const [success, setSuccess] = useState("");//set success if login in done
    const navigate = useNavigate();//nav to other pgs

    const handleLogin = (e) => {//fn run when signin clicked
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !password) {
            setError("Please fill in all fields.");//if field not filled show err
            return;
        }

        const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");//retrieve user reg in local storage

        // no more role filtering - match on email across all registered users
        const matchedUser = registeredUsers.find(
            (u) => u.email.toLowerCase() === username.toLowerCase()
        );

        const isEmployeeDummy = username.toLowerCase() === "employee@gmail.com" && password === "password";
        const isAdminDummy = username.toLowerCase() === "admin@gmail.com" && password === "password";

        if (matchedUser && matchedUser.password === password) {
            setSuccess(`Sign in successful! Welcome back, ${matchedUser.fullName}.`);//condition true show success msg

        } else if (isEmployeeDummy) {
            setSuccess("Sign in successful! Welcome back, Demo Employee.");//check employee?

        } else if (isAdminDummy) {
            setSuccess("Sign in successful! Welcome back, Demo Admin.");//check admin?

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
        placeholder="e.g. name@gmail.com"
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
            placeholder="Enter password"
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
    <button type="submit" className="btn btn-primary" style={{ marginBottom: "1.25rem" }}>
         Sign In
    </button>
    </form>
    </div>
    </div>
    </div>
    </div>
    );
}

export default Login;