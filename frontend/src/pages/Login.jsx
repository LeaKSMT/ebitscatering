import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
} from "firebase/auth";
import {
    Eye,
    EyeOff,
    ShieldCheck,
    Sparkles,
    UtensilsCrossed,
    ArrowRight,
    Crown,
    LockKeyhole,
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
        localStorage.removeItem("user");
        localStorage.removeItem("clientUser");
        localStorage.removeItem("clientName");
        localStorage.removeItem("clientEmail");
        localStorage.removeItem("currentClientName");
        localStorage.removeItem("currentClientEmail");
        localStorage.removeItem("isClientLoggedIn");
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("token");
        localStorage.removeItem("clientToken");
        localStorage.removeItem("authToken");
        localStorage.removeItem("adminToken");
    };

    const forceLightLoginTheme = () => {
        document.body.setAttribute("data-theme", "light");
        document.documentElement.style.colorScheme = "light";
        document.body.classList.remove("dark");
        document.documentElement.classList.remove("dark");
    };

    const saveClientSession = ({
        id = null,
        name,
        email,
        photo = "",
        token = "",
    }) => {
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

        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("clientToken", token);
            localStorage.setItem("authToken", token);
        }
    };

    const saveAdminSession = ({
        id = null,
        name,
        email,
        photo = "",
        token = "",
    }) => {
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
            localStorage.setItem("adminToken", token);
            localStorage.setItem("authToken", token);
        }
    };

    const swalBase = {
        background: "rgba(255, 255, 255, 0.96)",
        color: "#1f2937",
        confirmButtonColor: "#0f4d3c",
        customClass: {
            popup: "ebits-swal-popup",
            title: "text-2xl font-bold",
            confirmButton: "ebits-swal-confirm",
            cancelButton: "ebits-swal-cancel",
            actions: "ebits-swal-actions",
        },
    };

    const showErrorPopup = (message) => {
        Swal.fire({
            ...swalBase,
            icon: "error",
            title: "Invalid Credentials",
            text: message || "Please check your email and password.",
            confirmButtonText: "Okay",
        });
    };

    const finishGoogleLogin = async (googleUser) => {
        const data = await authService.googleLogin({
            email: googleUser.email,
            name: googleUser.displayName,
            photo: googleUser.photoURL,
        });

        if (!data?.user) {
            throw new Error("Google login failed.");
        }

        saveClientSession({
            id: data.user.id || null,
            name: data.user.name || googleUser.displayName || "",
            email: data.user.email || googleUser.email || "",
            photo: data.user.photo || googleUser.photoURL || "",
            token: data.token || "",
        });

        Swal.fire({
            ...swalBase,
            icon: "success",
            title: "Google Login Successful",
            text: "You are now signed in.",
            timer: 1400,
            showConfirmButton: false,
        });

        setTimeout(
            () => navigate(getRedirectAfterLogin("client"), { replace: true }),
            1000
        );
    };

    useEffect(() => {
        forceLightLoginTheme();
    }, []);

    useEffect(() => {
        const resolveRedirectLogin = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    setIsLoading(true);
                    await finishGoogleLogin(result.user);
                }
            } catch (err) {
                console.error("Google redirect login error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        resolveRedirectLogin();
    }, []);

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

            if (!data?.user) {
                showErrorPopup("Login failed.");
                return;
            }

            if (data.user.role === "admin") {
                saveAdminSession({
                    id: data.user.id || null,
                    name: data.user.name || "",
                    email: data.user.email || "",
                    photo: data.user.photo || "",
                    token: data.token || "",
                });

                await Swal.fire({
                    ...swalBase,
                    icon: "success",
                    title: "Welcome Back!",
                    text: `Hello ${data.user.name || "Admin"} 👋`,
                    timer: 1200,
                    showConfirmButton: false,
                });

                navigate("/admin/dashboard", { replace: true });
                return;
            }

            saveClientSession({
                id: data.user.id || null,
                name: data.user.name || "",
                email: data.user.email || "",
                photo: data.user.photo || "",
                token: data.token || "",
            });

            await Swal.fire({
                ...swalBase,
                icon: "success",
                title: "Welcome Back!",
                text: `Hello ${data.user.name || "User"} 👋`,
                timer: 1200,
                showConfirmButton: false,
            });

            navigate(getRedirectAfterLogin("client"), { replace: true });
        } catch (err) {
            showErrorPopup(err.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);

            try {
                const result = await signInWithPopup(auth, googleProvider);
                await finishGoogleLogin(result.user);
            } catch (popupErr) {
                console.error("Google popup login error:", popupErr);
                await signInWithRedirect(auth, googleProvider);
            }
        } catch (err) {
            console.error("Google login error:", err);
            showErrorPopup(err.message || "Google login failed.");
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const { value: forgotEmail } = await Swal.fire({
            title: "",
            html: `
                <div class="relative overflow-hidden rounded-[28px] px-2 pt-2">
                    <div class="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[#d4af37]/25 blur-3xl"></div>
                    <div class="absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-[#0f4d3c]/25 blur-3xl"></div>

                    <div class="relative z-10 text-center">
                        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-gradient-to-br from-[#0f4d3c] to-[#18a06c] shadow-lg">
                            <span class="text-2xl">🔐</span>
                        </div>

                        <p class="text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37]">
                            Account Recovery
                        </p>

                        <h2 class="mt-2 text-3xl font-extrabold text-[#0f172a]">
                            Forgot Password?
                        </h2>

                        <p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                            Enter your registered email and we’ll send secure reset instructions.
                        </p>
                    </div>
                </div>
            `,
            input: "email",
            inputPlaceholder: "Enter your email address",
            inputValue: email || "",
            showCancelButton: true,
            confirmButtonText: "Send Reset Link",
            cancelButtonText: "Cancel",
            background: "rgba(255,255,255,0.96)",
            color: "#1f2937",
            confirmButtonColor: "#0f4d3c",
            cancelButtonColor: "#94a3b8",
            backdrop: "rgba(3, 26, 20, 0.76)",
            customClass: {
                popup: "ebits-swal-popup",
                htmlContainer: "ebits-swal-html",
                input: "ebits-swal-input",
                confirmButton: "ebits-swal-confirm",
                cancelButton: "ebits-swal-cancel",
                actions: "ebits-swal-actions",
            },
            inputValidator: (value) => {
                if (!value) return "Email is required.";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return "Please enter a valid email.";
                return undefined;
            },
        });

        if (!forgotEmail) return;

        try {
            Swal.fire({
                title: "Sending reset link...",
                text: "Please wait while we process your request.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: "rgba(255,255,255,0.96)",
                color: "#1f2937",
                customClass: {
                    popup: "ebits-swal-popup",
                },
                didOpen: () => Swal.showLoading(),
            });

            const data = await authService.forgotPassword(
                forgotEmail.trim().toLowerCase()
            );

            await Swal.fire({
                ...swalBase,
                icon: "success",
                title: "Request Sent",
                text:
                    data?.message ||
                    "If your email exists in the system, reset instructions have been sent.",
                confirmButtonText: "Okay",
            });
        } catch (err) {
            await Swal.fire({
                ...swalBase,
                icon: "error",
                title: "Request Failed",
                text:
                    err.message ||
                    "Unable to process forgot password request right now.",
                confirmButtonText: "Okay",
            });
        }
    };

    const pageVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.55,
                staggerChildren: 0.12,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    const leftPanelVariants = {
        hidden: { opacity: 0, x: -50, scale: 0.98 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.75, ease: "easeOut" },
        },
    };

    const rightPanelVariants = {
        hidden: { opacity: 0, x: 50, scale: 0.98 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.75, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="login-page relative min-h-screen overflow-x-hidden bg-[#041f18]"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(24,160,108,0.22),transparent_34%),linear-gradient(135deg,#052d23,#0f4d3c_48%,#116d4d)]" />

            <motion.div
                animate={{
                    y: [0, -18, 0],
                    x: [0, 12, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#d4af37]/20 blur-3xl"
            />

            <motion.div
                animate={{
                    y: [0, 20, 0],
                    x: [0, -16, 0],
                    scale: [1, 1.08, 1],
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-[#20c987]/20 blur-3xl"
            />

            <motion.div
                animate={{
                    y: [0, -14, 0],
                    opacity: [0.35, 0.65, 0.35],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#f5d77b]/15 blur-3xl"
            />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

            <motion.div
                variants={itemVariants}
                className="relative z-10 px-4 pt-4 sm:px-6 sm:pt-6"
            >
                <Link
                    to="/"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 shadow-lg backdrop-blur-xl transition hover:border-[#d4af37]/40 hover:bg-white/15 hover:text-[#f5c94a] sm:text-base"
                >
                    <span className="transition group-hover:-translate-x-1">←</span>
                    <span>Back to Home</span>
                </Link>
            </motion.div>

            <div className="relative z-10 flex min-h-[calc(100vh-56px)] items-start justify-center px-3 pb-6 pt-3 sm:min-h-[calc(100vh-72px)] sm:px-4 sm:py-8 md:items-center">
                <motion.div
                    variants={itemVariants}
                    className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/15 bg-white/10 shadow-[0_35px_110px_rgba(0,0,0,0.40)] backdrop-blur-2xl lg:grid-cols-2 lg:rounded-[36px]"
                >
                    <motion.div
                        variants={leftPanelVariants}
                        className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#06291f]/95 via-[#0b3d31]/95 to-[#0f6a4d]/90 p-10 text-white lg:flex xl:p-14"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.12),transparent_34%)]" />
                        <div className="absolute inset-0 border-r border-white/10" />

                        <div className="relative z-10">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.03, y: -2 }}
                                className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/10 px-4 py-2 text-sm font-semibold text-[#f7d97b] shadow-lg backdrop-blur-xl"
                            >
                                <Sparkles size={16} />
                                Premium Catering Experience
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="mt-8 text-5xl font-black leading-tight tracking-tight xl:text-6xl"
                            >
                                Welcome Back to
                                <span className="block bg-gradient-to-r from-[#f7d97b] via-[#d4af37] to-[#fff2a8] bg-clip-text text-transparent">
                                    Ebit&apos;s Catering
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="mt-5 max-w-lg text-lg leading-8 text-white/78"
                            >
                                Sign in to manage bookings, quotations, client services,
                                payments, and catering operations in one premium workspace.
                            </motion.p>
                        </div>

                        <div className="relative z-10 grid gap-4">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -6, scale: 1.015 }}
                                className="group flex items-start gap-4 rounded-3xl border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-xl transition hover:border-[#d4af37]/40 hover:bg-white/15"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#f5c94a] ring-1 ring-[#d4af37]/30">
                                    <UtensilsCrossed size={21} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Professional workflow</h3>
                                    <p className="mt-1 text-sm leading-6 text-white/70">
                                        Smooth access for clients, staff, and administrators.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -6, scale: 1.015 }}
                                className="group flex items-start gap-4 rounded-3xl border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-xl transition hover:border-[#d4af37]/40 hover:bg-white/15"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#f5c94a] ring-1 ring-[#d4af37]/30">
                                    <ShieldCheck size={21} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Secure access</h3>
                                    <p className="mt-1 text-sm leading-6 text-white/70">
                                        Login safely with account credentials or Google.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={rightPanelVariants}
                        className="relative flex min-w-0 items-center justify-center overflow-hidden bg-[#fffdf7] px-4 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(15,77,60,0.12),transparent_34%)]" />

                        <div className="relative z-10 w-full max-w-md min-w-0">
                            <motion.div
                                variants={itemVariants}
                                className="mb-7 text-center lg:text-left"
                            >
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f4d3c] to-[#18a06c] text-white shadow-xl shadow-[#0f4d3c]/25 ring-1 ring-[#d4af37]/30">
                                    <Crown size={24} />
                                </div>

                                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d4af37] sm:text-sm">
                                    Sign In
                                </p>
                                <h2 className="mt-2 text-3xl font-black leading-tight text-[#0f172a] sm:text-4xl">
                                    Access Your Account
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                                    Login to continue to the catering management system.
                                </p>
                            </motion.div>

                            <motion.form
                                variants={pageVariants}
                                onSubmit={handleLogin}
                                className="space-y-5"
                                autoComplete="off"
                            >
                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-sm font-bold text-[#0f4d3c]">
                                        Email
                                    </label>
                                    <input
                                        key="login-email"
                                        type="email"
                                        name="login_email"
                                        autoComplete="off"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full min-w-0 rounded-2xl border border-[#0f4d3c]/15 bg-white/85 px-4 py-3.5 text-sm text-[#0f172a] shadow-sm placeholder:text-slate-400 caret-[#0f4d3c] outline-none transition focus:border-[#d4af37] focus:bg-white focus:ring-4 focus:ring-[#d4af37]/15 sm:text-base"
                                        style={{ WebkitTextFillColor: "#0f172a" }}
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-sm font-bold text-[#0f4d3c]">
                                        Password
                                    </label>

                                    <div className="relative min-w-0">
                                        <input
                                            key="login-password"
                                            type={showPassword ? "text" : "password"}
                                            name="login_password"
                                            autoComplete="new-password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full min-w-0 rounded-2xl border border-[#0f4d3c]/15 bg-white/85 px-4 py-3.5 pr-12 text-sm text-[#0f172a] shadow-sm placeholder:text-slate-400 caret-[#0f4d3c] outline-none transition focus:border-[#d4af37] focus:bg-white focus:ring-4 focus:ring-[#d4af37]/15 sm:text-base"
                                            style={{ WebkitTextFillColor: "#0f172a" }}
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#0b4d3b]"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    <div className="mt-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            className="group inline-flex items-center gap-1 text-sm font-bold text-[#b99117] transition hover:text-[#0f4d3c]"
                                        >
                                            <LockKeyhole size={14} />
                                            Forgot Password?
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f4d3c] via-[#11634b] to-[#18a06c] py-3.5 font-bold text-white shadow-xl shadow-[#0f4d3c]/25 transition hover:shadow-2xl hover:shadow-[#0f4d3c]/35 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>

                            <motion.div variants={itemVariants} className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#fffdf7] px-3 text-sm text-slate-400">
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
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#0f4d3c]/15 bg-white/90 px-4 py-3.5 font-semibold text-slate-700 shadow-sm transition hover:border-[#d4af37]/70 hover:bg-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
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
                                <p className="text-sm text-slate-500">
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="font-bold text-[#b99117] transition hover:text-[#0f4d3c]"
                                    >
                                        Register here
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Login;