import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        const adminEmail = "admin@ebits.com";
        const adminPassword = "admin123";

        if (email === adminEmail && password === adminPassword) {
            localStorage.setItem("adminAuth", "true");
            localStorage.setItem(
                "adminUser",
                JSON.stringify({
                    name: "Admin User",
                    email: adminEmail,
                    role: "admin",
                })
            );

            navigate("/admin/dashboard");
        } else {
            setError("Invalid admin credentials.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 shadow-md rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-[#0f4d3c] mb-2">Admin Login</h1>
                <p className="text-gray-500 mb-6">Sign in to access the admin panel</p>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#0f4d3c] mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#d4af37]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#0f4d3c] mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#d4af37]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#0f4d3c] hover:opacity-95 text-white font-semibold py-3 rounded-xl transition"
                    >
                        Login to Admin Panel
                    </button>
                </form>

                <div className="mt-6 rounded-xl border border-[#f1df9b] bg-[#fff8e6] px-4 py-3 text-sm text-[#7a6220]">
                    <p className="font-semibold mb-1">Demo Admin Credentials</p>
                    <p>Email: admin@ebits.com</p>
                    <p>Password: admin123</p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;