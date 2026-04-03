import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    // Fixed single admin account
    const ADMIN_CREDENTIALS = {
        email: "admin@ebitscatering.com",
        password: "admin123",
        name: "Ebit's Admin",
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const inputEmail = formData.email.trim().toLowerCase();
        const inputPassword = formData.password.trim();

        if (
            inputEmail === ADMIN_CREDENTIALS.email &&
            inputPassword === ADMIN_CREDENTIALS.password
        ) {
            localStorage.setItem("adminAuth", "true");
            localStorage.setItem(
                "adminUser",
                JSON.stringify({
                    name: ADMIN_CREDENTIALS.name,
                    email: ADMIN_CREDENTIALS.email,
                    role: "admin",
                })
            );

            navigate("/admin/dashboard");
        } else {
            setError("Invalid admin email or password.");
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
                        className="w-full rounded-xl bg-[#d4af37] hover:bg-[#c79f22] text-[#0b4a3a] font-bold py-3 transition"
                    >
                        Sign In
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
                        Demo Admin Credentials
                    </p>
                    <p className="text-sm text-[#0b4a3a]">
                        <span className="font-semibold">Email:</span> admin@ebitscatering.com
                    </p>
                    <p className="text-sm text-[#0b4a3a]">
                        <span className="font-semibold">Password:</span> admin123
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;