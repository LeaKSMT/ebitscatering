import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { Eye, EyeOff, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("clientUser");
        localStorage.removeItem("clientName");
        localStorage.removeItem("clientEmail");
        localStorage.removeItem("currentClientName");
        localStorage.removeItem("currentClientEmail");
        localStorage.removeItem("isClientLoggedIn");
        localStorage.removeItem("adminAuth");
    };

    const saveClientSession = ({ id = null, name, email, photo = "" }) => {
        const finalName = name?.trim() || email.split("@")[0] || "Client";

        const userData = {
            id,
            name: finalName,
            email,
            photo,
            role: "client",
        };

        clearSession();
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("clientUser", JSON.stringify(userData));
        localStorage.setItem("clientName", finalName);
        localStorage.setItem("clientEmail", email);
        localStorage.setItem("currentClientName", finalName);
        localStorage.setItem("currentClientEmail", email);
        localStorage.setItem("isClientLoggedIn", "true");
    };

    const saveAdminSession = ({ id = null, name, email, photo = "" }, token = "") => {
        const finalName = name?.trim() || email.split("@")[0] || "Admin";

        const userData = {
            id,
            name: finalName,
            email,
            photo,
            role: "admin",
        };

        clearSession();
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("adminAuth", "true");

        if (token) {
            localStorage.setItem("token", token);
        }
    };

    const showErrorPopup = (message) => {
        Swal.fire({
            icon: "error",
            title: "Invalid Credentials",
            text: message || "Please check your email and password.",
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
    };

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

            if (data?.user) {
                Swal.fire({
                    icon: "success",
                    title: "Welcome Back!",
                    text: `Hello ${data.user.name || "User"} 👋`,
                    timer: 1500,
                    showConfirmButton: false,
                    background: "#ffffff",
                    color: "#1f2937",
                    customClass: {
                        popup: "rounded-[24px] shadow-2xl",
                        title: "text-2xl font-bold",
                    },
                });

                if (data.user.role === "admin") {
                    saveAdminSession(data.user, data.token);
                    setTimeout(() => navigate(getRedirectAfterLogin("admin")), 1000);
                    return;
                }

                saveClientSession(data.user);
                setTimeout(() => navigate(getRedirectAfterLogin("client")), 1000);
                return;
            }

            showErrorPopup("Login failed.");
        } catch (err) {
            showErrorPopup(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            saveClientSession({
                id: null,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
            });

            Swal.fire({
                icon: "success",
                title: "Google Login Successful",
                timer: 1400,
                showConfirmButton: false,
            });

            setTimeout(() => navigate("/client/dashboard"), 1000);
        } catch {
            showErrorPopup("Google login failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#08392d] via-[#0f4d3c] to-[#169b62] flex items-center justify-center px-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md">

                {/* LEFT */}
                <div className="hidden lg:flex flex-col justify-between p-12 text-white">
                    <div>
                        <div className="inline-flex items-center gap-2 text-[#f7d97b]">
                            <Sparkles size={16} />
                            Premium Catering Experience
                        </div>

                        <h1 className="mt-6 text-5xl font-bold">
                            Welcome Back to
                            <span className="block text-[#f5c94a]">Ebit's Catering</span>
                        </h1>

                        <p className="mt-4 text-white/80">
                            Manage bookings, quotations, and services in one system.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <UtensilsCrossed />
                            <span>Professional workflow</span>
                        </div>
                        <div className="flex gap-3">
                            <ShieldCheck />
                            <span>Secure access</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="bg-white p-10">
                    <h2 className="text-3xl font-bold">Access Your Account</h2>

                    <form onSubmit={handleLogin} className="mt-6 space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-3 border rounded-xl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full p-3 border rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-700 text-white py-3 rounded-xl flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="my-4 text-center">or</div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full border py-3 rounded-xl"
                    >
                        Continue with Gmail
                    </button>

                    <p className="text-center mt-4">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-green-700 font-semibold">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;