import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import sapLogo from "../assets/image.png";

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
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
            {/* Left Section: Dark Navy Background with ONLY image.png */}
            <div className="w-full lg:w-[55%] bg-[#0B1D33] p-6 sm:p-12 flex items-center justify-center min-h-[300px] lg:min-h-screen relative overflow-hidden">
                <img
                    src={sapLogo}
                    alt="SAP"
                    className="w-full max-w-lg sm:max-w-xl max-h-[85vh] object-contain rounded-3xl"
                    style={{
                        maskImage: "radial-gradient(ellipse at center, black 60%, transparent 98%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 98%)"
                    }}
                />
            </div>

            {/* Right Section: Intact Authentication Form Panel */}
            <div className="w-full lg:w-[45%] p-6 sm:p-12 lg:p-16 flex flex-col items-center justify-center bg-[#F8FAFC]">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-[#E2E8F0] space-y-6">
                    
                    {/* Header Logo & Welcome text */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-3">
                            <img src={sapLogo} alt="SAP Logo" className="h-12 w-auto object-contain rounded-xl shadow-xs" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
                            Enter your credentials to access your workspace.
                        </p>
                    </div>

                    {/* Alert Banners */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEECEC] p-4 text-xs sm:text-sm font-semibold text-[#DC2626] animate-fade-in">
                            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#DC2626]" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-start gap-3 rounded-2xl border border-[#D5F2E9] bg-[#E8F8F3] p-4 text-xs sm:text-sm font-semibold text-[#087F72] animate-fade-in">
                            <CheckCircle size={18} className="mt-0.5 shrink-0 text-[#087F72]" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#334155]">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-[#94A3B8] pointer-events-none">
                                    <User size={18} />
                                </span>
                                <input
                                    type="email"
                                    className="w-full bg-white border border-[#D8E0EA] focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/15 text-[#0F172A] pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all placeholder:text-[#94A3B8]"
                                    placeholder="name@company.com"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#334155]">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-[#94A3B8] pointer-events-none">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-white border border-[#D8E0EA] focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/15 text-[#0F172A] pl-11 pr-12 py-3 rounded-xl text-sm font-medium outline-none transition-all placeholder:text-[#94A3B8]"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default Login;