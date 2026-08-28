import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Briefcase } from "lucide-react";
import loginImage from "../assets/login-image.png";

// Use a Vite-friendly env var and proxy it to the backend during development.
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ems-backend-zby7.onrender.com";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                const role = String(user.role || "").toLowerCase();
                if (role === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                } else if (role) {
                    navigate("/employee/dashboard", { replace: true });
                }
            } catch (err) {
                console.error("Invalid user stored in localStorage", err);
            }
        }
    }, [navigate]);

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

            // Guard against non-JSON responses (e.g. a 502 from Vite's proxy
            // when the backend is unreachable, or any other HTML/empty body).
            let data;
            try {
                data = await res.json();
            } catch (parseErr) {
                console.error("Response was not valid JSON:", parseErr);
                setError(
                    res.status === 502
                        ? "Cannot reach the server. Please make sure the backend is running."
                        : `Server error (${res.status}). Please try again.`
                );
                return;
            }

            if (!res.ok || !data.success) {
                setError(data.message || "Invalid credentials.");
                return;
            }

            setSuccess(`Sign in successful! Welcome back, ${data.user.name}.`);

            const normalizedUser = {
                ...data.user,
                permissions: Array.isArray(data.user.permissions) ? data.user.permissions : []
            };

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(normalizedUser));

            const roleName = normalizedUser.role?.toLowerCase?.() || "";
            const destination = roleName === "admin" ? "/admin/dashboard" : "/employee/dashboard";

            setTimeout(() => {
                navigate(destination);
            }, 500);
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Unable to reach server. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-container">
            {/* Left Decorative/Info Panel */}
            <div className="login-left-panel">
                <div className="login-left-branding">
                    <span className="text-sm font-black tracking-[0.25em] uppercase text-white/90">EMS PORTAL</span>
                </div>
                <div className="login-left-content">
                    <div className="mb-6">
                        <img src={loginImage} alt="SAP Employee Management System" className="w-full max-w-md h-auto object-contain rounded-2xl" />
                    </div>
                    {/* <h1 className="login-left-title">Employment Management System</h1> */}
                    <p className="login-left-desc">
                        A unified, premium-grade solution for team scheduling, role configuration, access controls, and real-time employee analytics.
                    </p>
                </div>
                <div className="text-xs text-white/50 font-bold tracking-wider">
                    © 2026 EMS Corporate. All rights reserved.
                </div>
            </div>

            {/* Right Authentication Panel */}
            <div className="login-right-panel">
                <div className="login-right-inner">
                    <div className="card">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex items-center justify-center">
                                <img src={loginImage} alt="Logo" className="h-14 max-w-[200px] object-contain" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-xs font-semibold text-[#64748B]">Enter your credentials to access your workspace.</p>
                        </div>

                        {error && (
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEECEC] px-4 py-3 text-xs md:text-sm font-semibold text-[#DC2626]">
                                <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#DC2626]" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#D5F2E9] bg-[#E8F8F3] px-4 py-3 text-xs md:text-sm font-semibold text-[#087F72]">
                                <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#087F72]" />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-container">
                                    <span className="input-icon">
                                        <User size={16} />
                                    </span>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="name@company.com"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="form-label mb-0!">Password</label>
                                    <a href="#" className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold transition-all">Forgot password?</a>
                                </div>
                                <div className="input-container">
                                    <span className="input-icon">
                                        <Lock size={16} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-input pr-12"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary mt-2 cursor-pointer w-full bg-[#2563EB] text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-[#1D4ED8] disabled:opacity-50"
                                disabled={loading}
                            >
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