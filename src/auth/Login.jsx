import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Calendar,
    ShieldCheck,
    BarChart3,
    ArrowRight,
    Users,
    Briefcase
} from "lucide-react";
import loginImage from "../assets/login-image.png";
import sapLogo from "../assets/image.png";

// Use a Vite-friendly env var and proxy it to the backend during development.
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ems-backend-zby7.onrender.com";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
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
        <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#F7F9FC] font-sans antialiased overflow-x-hidden">
            {/* LEFT SIDE — BRANDING / PRODUCT INTRO */}
            <div className="w-full lg:w-[56%] bg-[#061A35] relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white overflow-hidden select-none min-h-[480px] lg:min-h-screen">
                {/* Ambient Decorative Background Waves & Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#051329] via-[#092244] to-[#0A1A33] z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-blue-600/20 via-blue-500/5 to-transparent pointer-events-none z-0"></div>

                {/* Background Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

                {/* Top Branding Bar */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <Users size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-black tracking-[0.2em] text-white uppercase leading-tight">EMS</div>
                            <div className="text-xs font-black tracking-[0.2em] text-blue-400 uppercase leading-tight">PORTAL</div>
                            <div className="w-5 h-[2px] bg-blue-500 rounded-full mt-1"></div>
                        </div>
                    </div>
                    <div className="hidden sm:block text-[11px] font-semibold uppercase tracking-widest text-slate-400/80 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        Enterprise Edition
                    </div>
                </div>

                {/* Center Banner / Logo & Features */}
                <div className="relative z-10 my-auto py-8 text-center flex flex-col items-center justify-center">
                    {/* Metallic 3D Logo Section */}
                    <div className="relative group max-w-md mx-auto mb-6 flex flex-col items-center">
                        <div className="absolute -inset-6 rounded-full bg-blue-500/15 blur-3xl group-hover:bg-blue-500/25 transition-all duration-500"></div>

                        <div className="relative flex flex-col items-center">
                            {/* SAP Brand Typography */}
                            <div className="flex items-center justify-center mb-1">
                                <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] font-serif italic">
                                    S<span className="text-blue-400 not-italic font-sans inline-block transform -skew-x-6">A</span>P
                                </span>
                            </div>

                            <div className="text-xs sm:text-sm lg:text-base font-extrabold tracking-[0.35em] text-slate-200 uppercase mt-1 drop-shadow-md">
                                EMPLOYEE
                            </div>

                            {/* Sub-bar Divider */}
                            <div className="flex items-center gap-3 w-full my-2.5 max-w-[280px]">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-blue-300 uppercase">MANAGEMENT SYSTEM</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* Glassmorphism Feature Cards Bar */}
                    <div className="w-full max-w-xl mx-auto mt-4 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-3 sm:gap-0">
                            {/* 1. Team Scheduling */}
                            <div className="flex flex-col items-center justify-center p-2 text-center group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                    <Calendar size={18} />
                                </div>
                                <span className="text-xs font-bold text-slate-200 tracking-tight">Team Scheduling</span>
                            </div>

                            {/* 2. Role Configuration */}
                            <div className="flex flex-col items-center justify-center p-2 text-center group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                    <Briefcase size={18} />
                                </div>
                                <span className="text-xs font-bold text-slate-200 tracking-tight">Role Configuration</span>
                            </div>

                            {/* 3. Access Controls */}
                            <div className="flex flex-col items-center justify-center p-2 text-center group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                    <Lock size={18} />
                                </div>
                                <span className="text-xs font-bold text-slate-200 tracking-tight">Access Controls</span>
                            </div>

                            {/* 4. Real-time Analytics */}
                            <div className="flex flex-col items-center justify-center p-2 text-center group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                    <BarChart3 size={18} />
                                </div>
                                <span className="text-xs font-bold text-slate-200 tracking-tight">Real-time Analytics</span>
                            </div>
                        </div>
                    </div>

                    {/* Description Text */}
                    <p className="mt-7 text-xs sm:text-sm text-slate-300/80 max-w-md mx-auto leading-relaxed font-medium">
                        A unified, premium-grade solution for team scheduling, role configuration, access controls, and real-time employee analytics.
                    </p>
                </div>

                {/* Left Footer */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400/70 font-semibold pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-blue-400/90" />
                        <span>© 2026 EMS Corporate. All rights reserved.</span>
                    </div>
                    <span className="hidden md:inline text-[11px] text-slate-500">v2.4.0 High Sec</span>
                </div>
            </div>

            {/* RIGHT SIDE — LOGIN CARD */}
            <div className="w-full lg:w-[44%] bg-[#F7F9FC] relative flex flex-col items-center justify-center p-5 sm:p-10 lg:p-12 min-h-screen overflow-y-auto">
                {/* Subtle Dotted Matrix Pattern & Decorative Background Flares */}
                <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Floating White Login Card */}
                <div className="w-full max-w-[460px] bg-white rounded-3xl p-7 sm:p-10 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-slate-100/90 relative z-10 my-auto">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#081B33] p-2.5 flex items-center justify-center shadow-md mb-4 ring-4 ring-blue-500/10">
                            <img src={sapLogo} alt="SAP Logo" className="w-full h-full object-contain filter brightness-125" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500">
                            Sign in to access your workspace
                        </p>
                    </div>

                    {/* Feedback Alerts */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs sm:text-sm font-semibold text-red-600 animate-fade-in">
                            <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-700 animate-fade-in">
                            <CheckCircle size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 tracking-wider uppercase mb-2 block">
                                EMAIL ADDRESS
                            </label>
                            <div className="relative flex items-center">
                                <Mail size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-bold text-slate-600 tracking-wider uppercase block">
                                    PASSWORD
                                </label>
                            </div>
                            <div className="relative flex items-center">
                                <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                        >
                            <span>{loading ? "Signing in..." : "Sign In"}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;