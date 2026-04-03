import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function ClientRegister() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault();

        const form = e.target;

        const fullName = form.fullName.value.trim();
        const email = form.email.value.trim();
        const contactNumber = form.contactNumber.value.trim();
        const password = form.password.value.trim();
        const confirmPassword = form.confirmPassword.value.trim();

        if (!fullName || !email || !password) {
            alert("Please fill all required fields");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // ✅ GET ALL USERS
        const users = JSON.parse(localStorage.getItem("registeredClients")) || [];

        // ✅ CHECK DUPLICATE
        const existing = users.find((u) => u.email === email);
        if (existing) {
            alert("Email already registered!");
            return;
        }

        const newUser = {
            fullName,
            email,
            password,
            contactNumber,
            role: "client",
        };

        users.push(newUser);

        localStorage.setItem("registeredClients", JSON.stringify(users));

        alert("Registered successfully!");

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b4a3a] via-[#0f5b44] to-[#1aa36f] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

                <h2 className="text-3xl font-bold text-center mb-6 text-[#0f4d3c]">
                    Create Account
                </h2>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input name="fullName" placeholder="Full Name" className="w-full border p-3 rounded-xl" />
                    <input name="email" type="email" placeholder="Email" className="w-full border p-3 rounded-xl" />
                    <input name="contactNumber" placeholder="Contact Number" className="w-full border p-3 rounded-xl" />

                    {/* PASSWORD */}
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full border p-3 rounded-xl pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* CONFIRM */}
                    <div className="relative">
                        <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="w-full border p-3 rounded-xl pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button className="w-full bg-[#d4af37] py-3 rounded-xl font-bold">
                        Register
                    </button>
                </form>

                <p className="text-center mt-4 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#0f4d3c] font-bold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ClientRegister;