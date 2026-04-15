import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { authService } from "../services/authService";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getRedirectAfterLogin = (role) => {
        const redirectPath = localStorage.getItem("redirectAfterLogin");

        if (redirectPath) {
            localStorage.removeItem("redirectAfterLogin");
            return redirectPath;
        }

        return role === "admin" ? "/admin/dashboard" : "/client/dashboard";
    };

    const clearSession = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("clientUser");
        localStorage.removeItem("clientName");
        localStorage.removeItem("clientEmail");
        localStorage.removeItem("currentClientName");
        localStorage.removeItem("currentClientEmail");
        localStorage.removeItem("isClientLoggedIn");
        localStorage.removeItem("adminAuth");
    };

    const saveClientSession = ({ id = null, name, email, photo = "" }) => {
        const finalName = name?.trim() || email.split("@")[0] || "Client";

        const userData = {
            id,
            name: finalName,
            email,
            photo,
            role: "client",
        };

        clearSession();
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("clientUser", JSON.stringify(userData));
        localStorage.setItem("clientName", finalName);
        localStorage.setItem("clientEmail", email);
        localStorage.setItem("currentClientName", finalName);
        localStorage.setItem("currentClientEmail", email);
        localStorage.setItem("isClientLoggedIn", "true");
    };

    const saveAdminSession = ({ id = null, name, email, photo = "" }, token = "") => {
        const finalName = name?.trim() || email.split("@")[0] || "Admin";

        const userData = {
            id,
            name: finalName,
            email,
            photo,
            role: "admin",
        };

        clearSession();
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("adminAuth", "true");

        if (token) {
            localStorage.setItem("token", token);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        try {
            setIsLoading(true);

            const data = await authService.login(normalizedEmail, trimmedPassword);
            console.log("LOGIN RESPONSE:", data);

            if (data?.user) {
                if (data.user.role === "admin") {
                    saveAdminSession(data.user, data.token);
                    navigate(getRedirectAfterLogin("admin"));
                    return;
                }

                saveClientSession({
                    id: data.user.id || null,
                    name: data.user.name || "",
                    email: data.user.email,
                    photo: "",
                });

                navigate(getRedirectAfterLogin("client"));
                return;
            }

            alert("Login failed. Please check your credentials.");
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            saveClientSession({
                id: null,
                name: user.displayName || "Client",
                email: user.email || "",
                photo: user.photoURL || "",
            });

            navigate(getRedirectAfterLogin("client"));
        } catch (error) {
            console.error("Google login error:", error);
            alert("Google login failed. Please check your Firebase configuration.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b4a3a] via-[#0f5b44] to-[#1aa36f]">
            <div className="px-4 sm:px-8 pt-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#f5c94a] transition"
                >
                    <span>←</span>
                    <span>Back to Home</span>
                </Link>
            </div>

            <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md rounded-[28px] border-2 border-[#d4af37] bg-white shadow-2xl px-8 py-10">
                    <div className="text-center mb-8">
                        <h1 className="text-[2.2rem] font-bold leading-tight">
                            <span className="text-[#d4af37]">Ebit&apos;s</span>{" "}
                            <span className="text-[#0f4d3c]">Catering</span>
                        </h1>
                        <p className="text-gray-500 mt-2 text-base">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0b4d3b]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-[#d4af37] text-[#0b4a3a] py-3.5 font-semibold hover:bg-[#c79f23] transition disabled:opacity-70"
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-sm text-gray-400">or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full rounded-xl border border-gray-300 bg-white py-3.5 px-4 font-medium text-gray-700 flex items-center justify-center gap-3 hover:border-[#d4af37] hover:shadow-sm transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.659 32.657 29.219 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
                            <path fill="#FF3D00" d="M6.306 14.691 12.88 19.51C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4c-7.682 0-14.347 4.337-17.694 10.691Z" />
                            <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.198 0-9.625-3.317-11.288-7.946l-6.525 5.025C9.5 39.556 16.227 44 24 44Z" />
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.57h.003l6.19 5.238C36.972 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
                        </svg>
                        Continue with Gmail
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-[#d4af37] hover:text-[#b9921c] transition"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;