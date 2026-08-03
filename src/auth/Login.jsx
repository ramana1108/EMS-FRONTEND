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

                <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Briefcase size={28} />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-900" style={{ color: "#0f172a" }}>
                                Sign In to EMS
                            </h2>
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
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
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