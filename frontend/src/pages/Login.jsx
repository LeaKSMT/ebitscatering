import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
            title: "Account Created!",
            text: "Your account has been registered successfully.",
            confirmButtonText: "Go to Login",
            background: "#ffffff",
            color: "#1f2937",
            confirmButtonColor: "#0f766e",
            customClass: {
                popup: "rounded-2xl shadow-2xl",
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
            title: "Account Already Exists",
            text: "This email is already registered. Please use another email or log in instead.",
            confirmButtonText: "Go to Login",
            showCancelButton: true,
            cancelButtonText: "Close",
            background: "#ffffff",
            color: "#1f2937",
            confirmButtonColor: "#b45309",
            cancelButtonColor: "#6b7280",
            customClass: {
                popup: "rounded-2xl shadow-2xl",
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
                popup: "rounded-2xl shadow-2xl",
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

        try {
            setLoading(true);

            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
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
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#ecfdf5] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                    <p className="text-gray-500 mt-2">
                        Register to access the system
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-semibold py-3 shadow-lg hover:scale-[1.01] transition disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ClientRegister;