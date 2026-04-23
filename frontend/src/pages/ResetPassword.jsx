import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { authService } from "../services/authService";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Invalid Reset Link",
                text: "This password reset link is missing a valid token.",
                confirmButtonText: "Back to Login",
                background: "#ffffff",
                color: "#1f2937",
                confirmButtonColor: "#0f4d3c",
                customClass: {
                    popup: "rounded-[24px] shadow-2xl",
                    title: "text-2xl font-bold",
                    confirmButton: "rounded-xl px-6 py-2",
                },
            }).then(() => navigate("/login", { replace: true }));
            return;
        }

        if (!password || !confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Please fill in both password fields.",
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
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: "warning",
                title: "Weak Password",
                text: "Password must be at least 6 characters long.",
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
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Password Mismatch",
                text: "Your passwords do not match.",
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
            return;
        }

        try {
            setIsLoading(true);

            const data = await authService.resetPassword({
                token,
                password,
            });

            await Swal.fire({
                icon: "success",
                title: "Password Reset Successful",
                text: data?.message || "Your password has been updated successfully.",
                confirmButtonText: "Go to Login",
                background: "#ffffff",
                color: "#1f2937",
                confirmButtonColor: "#0f4d3c",
                customClass: {
                    popup: "rounded-[24px] shadow-2xl",
                    title: "text-2xl font-bold",
                    confirmButton: "rounded-xl px-6 py-2",
                },
            });

            navigate("/login", { replace: true });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Reset Failed",
                text: err.message || "Invalid or expired reset link.",
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#08392d] via-[#0f4d3c] to-[#169b62]"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#d4af37]/20 blur-3xl" />
                <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#f5d77b]/10 blur-3xl" />
            </div>

            <motion.div
                variants={itemVariants}
                className="relative z-10 px-4 pt-4 sm:px-6 sm:pt-6"
            >
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-[#f5c94a] sm:text-base"
                >
                    <span>←</span>
                    <span>Back to Login</span>
                </Link>
            </motion.div>

            <div className="relative z-10 flex min-h-[calc(100vh-56px)] items-start justify-center px-3 pb-6 pt-3 sm:min-h-[calc(100vh-72px)] sm:px-4 sm:py-8 md:items-center">
                <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.30)] backdrop-blur-md lg:grid-cols-2 lg:rounded-[32px]">
                    <motion.div
                        variants={leftPanelVariants}
                        className="relative hidden flex-col justify-between bg-gradient-to-br from-[#0b3d31]/95 via-[#0f4d3c]/90 to-[#136f50]/85 p-10 text-white lg:flex xl:p-14"
                    >
                        <div>
                            <motion.div
                                variants={itemVariants}
                                className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/10 px-4 py-2 text-sm font-medium text-[#f7d97b]"
                            >
                                <Sparkles size={16} />
                                Secure Password Recovery
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="mt-8 text-5xl font-extrabold leading-tight"
                            >
                                Reset Your
                                <span className="block text-[#f5c94a]">Account Password</span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="mt-5 max-w-lg text-lg leading-8 text-white/80"
                            >
                                Enter your new password below to regain secure access to your
                                Ebit&apos;s Catering account.
                            </motion.p>
                        </div>

                        <div className="grid gap-4">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.01 }}
                                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4"
                            >
                                <ShieldCheck className="mt-1 text-[#f5c94a]" size={20} />
                                <div>
                                    <h3 className="font-semibold">Protected reset flow</h3>
                                    <p className="text-sm text-white/75">
                                        Reset links are time-limited for better security.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.01 }}
                                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4"
                            >
                                <LockKeyhole className="mt-1 text-[#f5c94a]" size={20} />
                                <div>
                                    <h3 className="font-semibold">Set a strong password</h3>
                                    <p className="text-sm text-white/75">
                                        Use at least 6 characters for your new password.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={rightPanelVariants}
                        className="flex min-w-0 items-center justify-center bg-white px-4 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
                    >
                        <div className="w-full max-w-md min-w-0">
                            <motion.div
                                variants={itemVariants}
                                className="mb-7 text-center lg:text-left"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37] sm:text-sm">
                                    Reset Password
                                </p>
                                <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#0f172a] sm:text-4xl">
                                    Create a New Password
                                </h2>
                                <p className="mt-3 text-sm text-gray-500 sm:text-base">
                                    Enter and confirm your new password to continue.
                                </p>
                            </motion.div>

                            <motion.form
                                variants={pageVariants}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                                autoComplete="off"
                            >
                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                        New Password
                                    </label>

                                    <div className="relative min-w-0">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full min-w-0 rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 pr-12 text-sm text-[#0f172a] placeholder:text-gray-400 caret-[#0f4d3c] outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 sm:text-base"
                                            style={{ WebkitTextFillColor: "#0f172a" }}
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

                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                        Confirm Password
                                    </label>

                                    <div className="relative min-w-0">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full min-w-0 rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 pr-12 text-sm text-[#0f172a] placeholder:text-gray-400 caret-[#0f4d3c] outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 sm:text-base"
                                            style={{ WebkitTextFillColor: "#0f172a" }}
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0b4d3b]"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f4d3c] via-[#11634b] to-[#18a06c] py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            Resetting Password...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </motion.button>
                            </motion.form>

                            <motion.div variants={itemVariants} className="mt-6 text-center">
                                <p className="text-sm text-gray-500">
                                    Remembered your password?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-[#b99117] transition hover:text-[#8f6f0c]"
                                    >
                                        Back to Login
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

export default ResetPassword;