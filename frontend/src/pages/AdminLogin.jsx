import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../services/authService";

function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const applyLightTheme = () => {
        localStorage.setItem("adminTheme", "light");

        document.documentElement.setAttribute("data-theme", "light");
        document.body.setAttribute("data-theme", "light");

        document.documentElement.classList.remove("admin-dark", "admin-light");
        document.body.classList.remove("admin-dark", "admin-light");

        document.documentElement.classList.add("admin-light");
        document.body.classList.add("admin-light");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError("");

            const inputEmail = formData.email.trim().toLowerCase();
            const inputPassword = formData.password.trim();

            const data = await authService.login(inputEmail, inputPassword);

            if (!data?.token || !data?.user) {
                throw new Error("Invalid login response from server.");
            }

            if (data.user.role !== "admin") {
                throw new Error("This account does not have admin access.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("adminAuth", "true");
            localStorage.setItem("adminUser", JSON.stringify(data.user));
            localStorage.setItem("user", JSON.stringify(data.user));

            applyLightTheme();

            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Admin login error:", err);
            setError(err.message || "Login failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b4a3a] via-[#0f6a52] to-[#148564] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-[#d4af37]/20 px-6 py-8 sm:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-[2.2rem] font-extrabold leading-tight">
                        <span className="text-[#d4af37]">Ebit&apos;s</span>{" "}
                        <span className="text-[#0b4a3a]">Catering</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Admin sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-[#0b4a3a] mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your admin email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#0b4a3a] mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0b4a3a]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full rounded-xl font-bold py-3 transition ${isSubmitting
                                ? "bg-[#d4af37]/70 text-[#0b4a3a] cursor-not-allowed"
                                : "bg-[#d4af37] hover:bg-[#c79f22] text-[#0b4a3a]"
                            }`}
                    >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-sm font-medium text-[#0b4a3a] hover:text-[#d4af37] transition"
                    >
                        Back to Home
                    </Link>
                </div>

                <div className="mt-6 rounded-2xl bg-[#f8fafc] border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Admin Account
                    </p>
                    <p className="text-sm text-[#0b4a3a]">
                        Use your admin account stored in the database.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;