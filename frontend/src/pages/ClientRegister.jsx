import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Sparkles, UserPlus, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";

function ClientRegister() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const showSuccessPopup = () => {
        Swal.fire({
            icon: "success",
            title: "Account Created Successfully",
            text: "Your client account is ready. You can now sign in.",
            confirmButtonText: "Go to Login",
            background: "#ffffff",
            color: "#1f2937",
            confirmButtonColor: "#0f4d3c",
            customClass: {
                popup: "rounded-[24px] shadow-2xl",
                title: "text-2xl font-bold",
                confirmButton: "rounded-xl px-6 py-2",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                navigate("/login");
            }
        });
    };

    const showExistingPopup = () => {
        Swal.fire({
            icon: "warning",
            title: "Email Already Registered",
            text: "This email already has an account. Please log in instead.",
            confirmButtonText: "Go to Login",
            showCancelButton: true,
            cancelButtonText: "Close",
            background: "#ffffff",
            color: "#1f2937",
            confirmButtonColor: "#b99117",
            cancelButtonColor: "#6b7280",
            customClass: {
                popup: "rounded-[24px] shadow-2xl",
                title: "text-2xl font-bold",
                confirmButton: "rounded-xl px-6 py-2",
                cancelButton: "rounded-xl px-6 py-2",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                navigate("/login");
            }
        });
    };

    const showErrorPopup = (message) => {
        Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: message || "Something went wrong. Please try again.",
            confirmButtonText: "Okay",
            background: "#ffffff",
            color: "#1f2937",
            confirmButtonColor: "#dc2626",
            customClass: {
                popup: "rounded-[24px] shadow-2xl",
                title: "text-2xl font-bold",
                confirmButton: "rounded-xl px-6 py-2",
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
            return showErrorPopup("Please fill in all fields.");
        }

        if (form.password !== form.confirmPassword) {
            return showErrorPopup("Passwords do not match.");
        }

        if (form.password.length < 6) {
            return showErrorPopup("Password must be at least 6 characters.");
        }

        try {
            setLoading(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (
                    data.message?.toLowerCase().includes("already") ||
                    data.message?.toLowerCase().includes("exists")
                ) {
                    showExistingPopup();
                } else {
                    showErrorPopup(data.message);
                }
                return;
            }

            setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            showSuccessPopup();
        } catch (error) {
            showErrorPopup("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#08392d] via-[#0f4d3c] to-[#169b62] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#d4af37]/20 blur-3xl" />
                <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#f5d77b]/10 blur-3xl" />
                <div className="absolute bottom-10 right-1/4 h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl" />
            </div>

            <div className="relative z-10 px-4 sm:px-8 pt-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white/90 font-semibold hover:text-[#f5c94a] transition"
                >
                    <span>←</span>
                    <span>Back to Home</span>
                </Link>
            </div>

            <div className="relative z-10 min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.30)] border border-white/10 bg-white/10 backdrop-blur-md">
                    <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#0b3d31]/95 via-[#0f4d3c]/90 to-[#136f50]/85 text-white relative">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/10 px-4 py-2 text-sm font-medium text-[#f7d97b]">
                                <Sparkles size={16} />
                                Elegant Catering Portal
                            </div>

                            <h1 className="mt-8 text-5xl font-extrabold leading-tight">
                                Create Your
                                <span className="block text-[#f5c94a]">Client Account</span>
                            </h1>

                            <p className="mt-5 max-w-lg text-white/80 text-lg leading-8">
                                Register to request quotations, manage bookings, and access
                                your personalized catering services with ease.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 flex items-start gap-3">
                                <UserPlus className="mt-1 text-[#f5c94a]" size={20} />
                                <div>
                                    <h3 className="font-semibold">Fast account setup</h3>
                                    <p className="text-sm text-white/75">
                                        Create an account in just a few steps.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 flex items-start gap-3">
                                <ShieldCheck className="mt-1 text-[#f5c94a]" size={20} />
                                <div>
                                    <h3 className="font-semibold">Reliable access</h3>
                                    <p className="text-sm text-white/75">
                                        Securely access your quotations and booking details.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 flex items-start gap-3">
                                <CheckCircle2 className="mt-1 text-[#f5c94a]" size={20} />
                                <div>
                                    <h3 className="font-semibold">Modern client experience</h3>
                                    <p className="text-sm text-white/75">
                                        Smooth registration flow with instant feedback popups.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                        <div className="mx-auto w-full max-w-md">
                            <div className="text-center lg:text-left mb-8">
                                <p className="text-sm font-semibold tracking-[0.18em] text-[#d4af37] uppercase">
                                    Register New
                                </p>

                                <h2 className="mt-2 text-4xl font-extrabold text-[#0f172a]">
                                    Create Account
                                </h2>

                                <p className="mt-3 text-gray-500">
                                    Register to access the catering management system.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="w-full rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="w-full rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            className="w-full rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 pr-12 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 transition"
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

                                <div>
                                    <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            className="w-full rounded-2xl border border-gray-300 bg-[#fafafa] px-4 py-3.5 pr-12 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0b4d3b]"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-2xl bg-gradient-to-r from-[#0f4d3c] via-[#11634b] to-[#18a06c] text-white py-3.5 font-semibold shadow-lg hover:scale-[1.01] hover:shadow-xl transition disabled:opacity-70"
                                >
                                    {loading ? "Creating Account..." : "Register"}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-[#b99117] hover:text-[#8f6f0c] transition"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientRegister;