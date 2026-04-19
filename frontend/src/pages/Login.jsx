import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import {
    Eye,
    EyeOff,
    ShieldCheck,
    Sparkles,
    UtensilsCrossed,
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
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
        localStorage.removeItem("adminUser");
    };

    const saveClientSession = ({ id = null, name, email, photo = "" }) => {
        const safeEmail = email?.trim().toLowerCase() || "";
        const finalName = name?.trim() || safeEmail.split("@")[0] || "Client";

        const userData = {
            id,
            name: finalName,
            email: safeEmail,
            photo,
            role: "client",
        };

        clearSession();
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("clientUser", JSON.stringify(userData));
        localStorage.setItem("clientName", finalName);
        localStorage.setItem("clientEmail", safeEmail);
        localStorage.setItem("currentClientName", finalName);
        localStorage.setItem("currentClientEmail", safeEmail);
        localStorage.setItem("isClientLoggedIn", "true");
    };

    const saveAdminSession = ({ id = null, name, email, photo = "" }, token = "") => {
        const safeEmail = email?.trim().toLowerCase() || "";
        const finalName = name?.trim() || safeEmail.split("@")[0] || "Admin";

        const userData = {
            id,
            name: finalName,
            email: safeEmail,
            photo,
            role: "admin",
        };

        clearSession();
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("adminUser", JSON.stringify(userData));
        localStorage.setItem("adminAuth", "true");

        if (token) {
            localStorage.setItem("token", token);
        }
    };

    const showErrorPopup = (message) => {
        Swal.fire({
            icon: "error",
            title: "Invalid Credentials",
            text: message || "Please check your email and password.",
            confirmButtonText: "Okay",
            background: "#ffffff",
            color: "#1f2937",
            confirmButtonColor: "#0f4d3c",
            customClass: {
                popup: "rounded-[24px] shadow-2xl",
                title: "text-2xl font-bold",
                confirmButton: "rounded-xl px-6 py-2",
            },
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            showErrorPopup("Please enter your email and password.");
            return;
        }

        try {
            setIsLoading(true);

            const data = await authService.login(
                email.trim().toLowerCase(),
                password.trim()
            );

            if (data?.user) {
                Swal.fire({
                    icon: "success",
                    title: "Welcome Back!",
                    text: `Hello ${data.user.name || "User"} 👋`,
                    timer: 1500,
                    showConfirmButton: false,
                    background: "#ffffff",
                    color: "#1f2937",
                    customClass: {
                        popup: "rounded-[24px] shadow-2xl",
                        title: "text-2xl font-bold",
                    },
                });

                if (data.user.role === "admin") {
                    saveAdminSession(data.user, data.token);
                    setTimeout(() => navigate(getRedirectAfterLogin("admin")), 1000);
                    return;
                }

                saveClientSession({
                    id: data.user.id || null,
                    name: data.user.name || "",
                    email: data.user.email,
                    photo: "",
                });

                setTimeout(() => navigate(getRedirectAfterLogin("client")), 1000);
                return;
            }

            showErrorPopup("Login failed.");
        } catch (err) {
            showErrorPopup(err.message || "Login failed. Please try again.");
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
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
            });

            Swal.fire({
                icon: "success",
                title: "Google Login Successful",
                text: "You are now signed in.",
                timer: 1400,
                showConfirmButton: false,
                background: "#ffffff",
                color: "#1f2937",
                customClass: {
                    popup: "rounded-[24px] shadow-2xl",
                    title: "text-2xl font-bold",
                },
            });

            setTimeout(() => navigate("/client/dashboard"), 1000);
        } catch {
            showErrorPopup("Google login failed.");
        }
    };

    const pageVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.12,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.55, ease: "easeOut" },
        },
    };

    const leftPanelVariants = {
        hidden: { opacity: 0, x: -40 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    const rightPanelVariants = {
        hidden: { opacity: 0, x: 40 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-br from-[#08392d] via-[#0f4d3c] to-[#169b62] relative overflow-hidden"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#d4af37]/20 blur-3xl" />
                <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#f5d77b]/10 blur-3xl" />
            </div>

            <motion.div
                variants={itemVariants}
                className="relative z-10 px-4 sm:px-8 pt-6"
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white/90 font-semibold hover:text-[#f5c94a] transition"
                >
                    <span>←</span>
                    <span>Back to Home</span>
                </Link>
            </motion.div>

            <div className="relative z-10 min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.30)] border border-white/10 bg-white/10 backdrop-blur-md">
                    <motion.div
                        variants={leftPanelVariants}
                        className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#0b3d31]/95 via-[#0f4d3c]/90 to-[#136f50]/85 text-white relative"
                    >
                        <div>
                            <motion.div
                                variants={itemVariants}
                                className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/10 px-4 py-2 text-sm font-medium text-[#f7d97b]"
                            >
                                <Sparkles size={16} />
                                Premium Catering Experience
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="mt-8 text-5xl font-extrabold leading-tight"
                            >
                                Welcome Back to
                                <span className="block text-[#f5c94a]">Ebit&apos;s Catering</span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="mt-5 max-w-lg text-white/80 text-lg leading-8"
                            >
                                Sign in to manage bookings, quotations, client services,
                                and admin operations in one elegant catering platform.
                            </motion.p>
                        </div>

                        <div className="grid gap-4">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.01 }}
                                className="rounded-2xl bg-white/10 border border-white/10 p-4 flex items-start gap-3"
                            >
                                <UtensilsCrossed className="mt-1 text-[#f5c94a]" size={20} />
                                <div>
                                    <h3 className="font-semibold">Professional workflow</h3>
                                    <p className="text-sm text-white/75">
                                        Smooth access for clients and administrators.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.01 }}
                                className="rounded-2xl bg-white/10 border border-white/10 p-4 flex items-start gap-3"
                            >
                                <ShieldCheck className="mt-1 text-[#f5c94a]" size={20} />
                                <div>
                                    <h3 className="font-semibold">Secure access</h3>
                                    <p className="text-sm text-white/75">
                                        Login securely with your account credentials or Google.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={rightPanelVariants}
                        className="bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12"
                    >
                        <div className="mx-auto w-full max-w-md">
                            <motion.div
                                variants={itemVariants}
                                className="text-center lg:text-left mb-8"
                            >
                                <p className="text-sm font-semibold tracking-[0.18em] text-[#d4af37] uppercase">
                                    Sign In
                                </p>
                                <h2 className="mt-2 text-4xl font-extrabold text-[#0f172a]">
                                    Access Your Account
                                </h2>
                                <p className="mt-3 text-gray-500">
                                    Login to continue to the catering management system.
                                </p>
                            </motion.div>

                            <motion.form
                                variants={pageVariants}
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 transition"
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 pr-12 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 transition"
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
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-2xl bg-gradient-to-r from-[#0f4d3c] via-[#11634b] to-[#18a06c] text-white py-3.5 font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </motion.button>
                            </motion.form>

                            <motion.div variants={itemVariants} className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-3 text-sm text-gray-400">
                                        or continue with
                                    </span>
                                </div>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.01, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full rounded-2xl border border-gray-300 bg-white py-3.5 px-4 font-medium text-gray-700 flex items-center justify-center gap-3 hover:border-[#d4af37] hover:shadow-sm transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.659 32.657 29.219 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
                                    <path fill="#FF3D00" d="M6.306 14.691 12.88 19.51C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4c-7.682 0-14.347 4.337-17.694 10.691Z" />
                                    <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.198 0-9.625-3.317-11.288-7.946l-6.525 5.025C9.5 39.556 16.227 44 24 44Z" />
                                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.57h.003l6.19 5.238C36.972 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
                                </svg>
                                Continue with Gmail
                            </motion.button>

                            <motion.div
                                variants={itemVariants}
                                className="mt-6 text-center"
                            >
                                <p className="text-sm text-gray-500">
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="font-semibold text-[#b99117] hover:text-[#8f6f0c] transition"
                                    >
                                        Register here
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default Login;