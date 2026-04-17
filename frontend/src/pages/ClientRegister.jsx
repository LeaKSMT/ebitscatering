import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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

    const handleRegister = async (e) => {
        e.preventDefault();

        const trimmedFullName = fullName.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedContactNumber = contactNumber.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedFullName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
            alert("Please fill all required fields.");
            return;
        }

        if (trimmedPassword !== trimmedConfirmPassword) {
            alert("Passwords do not match.");
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

            alert(data.message || "Registered successfully!");
            navigate("/login");
        } catch (error) {
            console.error("Register error:", error);
            alert(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b4a3a] via-[#0f5b44] to-[#1aa36f] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-center mb-6 text-[#0f4d3c]">
                    Create Account
                </h2>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        name="fullName"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />

                    <input
                        name="contactNumber"
                        placeholder="Contact Number"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                    />

                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                    <div className="relative">
                        <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#d4af37] py-3 rounded-xl font-bold disabled:opacity-70"
                    >
                        {isLoading ? "Registering..." : "Register"}
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