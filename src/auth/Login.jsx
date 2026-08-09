import React, { useState, useEffect } from "react";
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
                    email: username.trim().toLowerCase(),
                    password
                })
            });

            const data = await res.json();

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
                    <Briefcase size={22} className="text-emerald-400" />
                    <span className="text-sm font-black tracking-[0.25em] uppercase">EMS PORTAL</span>
                </div>
                <div className="login-left-content">
                    <h1 className="login-left-title">Employment Management System</h1>
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
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                                <Briefcase size={24} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">Enter your credentials to access your workspace.</p>
                        </div>

                        {error && (
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-950/20 bg-red-50 dark:bg-red-950/10 px-4 py-3 text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-250 dark:border-emerald-950/25 bg-emerald-50 dark:bg-emerald-950/10 px-4 py-3 text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle size={16} className="mt-0.5 shrink-0" />
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
                                    <a href="#" className="text-xs text-slate-400 dark:text-slate-500 hover:text-emerald-500 font-bold transition-all">Forgot password?</a>
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
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary mt-2 cursor-pointer w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-emerald-500 disabled:opacity-50"
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