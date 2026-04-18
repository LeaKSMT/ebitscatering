import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import { authService } from "../services/authService";

function ClientRegister() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const popupBase = {
        background: "#ffffff",
        color: "#0f172a",
        confirmButtonColor: "#0f4d3c",
        customClass: {
            popup: "rounded-[24px] shadow-2xl",
            title: "text-[#0f4d3c] font-bold",
            confirmButton: "rounded-xl px-5 py-2 font-semibold",
        },
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const trimmedFullName = fullName.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedContactNumber = contactNumber.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedFullName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
            Swal.fire({
                ...popupBase,
                icon: "warning",
                title: "Incomplete Details",
                text: "Please fill in all required fields before creating your account.",
                confirmButtonColor: "#d4af37",
            });
            return;
        }

        if (trimmedPassword !== trimmedConfirmPassword) {
            Swal.fire({
                ...popupBase,
                icon: "error",
                title: "Passwords Do Not Match",
                text: "Please make sure your password and confirm password are the same.",
                confirmButtonColor: "#dc2626",
            });
            return;
        }

        try {
            setIsLoading(true);

            const data = await authService.register({
                name: trimmedFullName,
                email: trimmedEmail,
                password: trimmedPassword,
                contactNumber: trimmedContactNumber,
            });

            await Swal.fire({
                ...popupBase,
                icon: "success",
                title: "Account Created Successfully",
                text: data.message || "Your account has been created. You may now sign in.",
                confirmButtonText: "Continue to Login",
                confirmButtonColor: "#0f4d3c",
                timer: 2600,
                timerProgressBar: true,
            });

            navigate("/login");
        } catch (error) {
            console.error("Register error:", error);

            Swal.fire({
                ...popupBase,
                icon: "error",
                title: "Registration Failed",
                text: error.message || "Something went wrong while creating your account. Please try again.",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#07352b] via-[#0f4d3c] to-[#19a56f] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md relative">
                <div className="absolute -top-8 -left-8 w-28 h-28 bg-[#d4af37]/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/10 blur-3xl rounded-full" />

                <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/95 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.18)] p-8">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#d4af37] via-[#f5d76e] to-[#0f4d3c]" />

                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f4d3c] to-[#1aa36f] flex items-center justify-center shadow-lg">
                            <UserPlus className="text-white" size={28} />
                        </div>

                        <h2 className="text-3xl font-extrabold text-[#0f4d3c] tracking-tight">
                            Create Account
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Register to access Ebit&apos;s Catering services
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <input
                                name="fullName"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full border border-gray-200 bg-white/80 px-4 py-3.5 rounded-2xl outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                            />
                        </div>

                        <div>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-200 bg-white/80 px-4 py-3.5 rounded-2xl outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                            />
                        </div>

                        <div>
                            <input
                                name="contactNumber"
                                placeholder="Contact Number"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                className="w-full border border-gray-200 bg-white/80 px-4 py-3.5 rounded-2xl outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                            />
                        </div>

                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-200 bg-white/80 px-4 py-3.5 pr-12 rounded-2xl outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0f4d3c] transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-200 bg-white/80 px-4 py-3.5 pr-12 rounded-2xl outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0f4d3c] transition"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-gradient-to-r from-[#d4af37] to-[#f0c94c] text-[#0f4d3c] py-3.5 rounded-2xl font-bold shadow-lg shadow-[#d4af37]/25 hover:scale-[1.01] hover:shadow-xl transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-[#0f4d3c]/30 border-t-[#0f4d3c] rounded-full animate-spin" />
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 size={18} />
                                    Register Now
                                </span>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-bold text-[#0f4d3c] hover:text-[#d4af37] transition"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ClientRegister;