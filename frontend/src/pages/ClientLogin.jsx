import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, UserRound, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function ClientLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const demoClient = {
        email: "client@example.com",
        password: "client",
        role: "client",
        fullName: "Demo Client",
        contactNumber: "09123456789",
    };

    const formatNameFromEmail = (email) => {
        if (!email) return "Client User";

        return email
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const saveClientSession = ({
        name = "",
        email,
        role,
        provider = "local",
        photo = "",
        contactNumber = "",
    }) => {
        const finalName = name?.trim() || formatNameFromEmail(email);

        const userData = {
            name: finalName,
            email,
            role,
            provider,
            photo,
            contactNumber,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("clientUser", JSON.stringify(userData));
        localStorage.setItem("clientName", finalName);
        localStorage.setItem("clientEmail", email);
        localStorage.setItem("clientRole", role);
        localStorage.setItem("clientPhoto", photo);
        localStorage.setItem("clientContactNumber", contactNumber);
        localStorage.setItem("isClientLoggedIn", "true");
        localStorage.setItem("currentClientEmail", email);
        localStorage.setItem("currentClientName", finalName);
    };

    const getRedirectAfterLogin = () => {
        const redirectPath = localStorage.getItem("redirectAfterLogin");

        if (redirectPath) {
            localStorage.removeItem("redirectAfterLogin");
            return redirectPath;
        }

        return "/client/dashboard";
    };

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true);
            setError("");
            setSuccess("");

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Call backend to authenticate/register the Google user
            const response = await fetch(`${import.meta.env.VITE_API_URL || "https://ebitscatering-production.up.railway.app/api"}/auth/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName,
                    photo: user.photoURL,
                    provider: "google"
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Google authentication failed");
            }

            // Save user data to localStorage
            saveClientSession({
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                provider: "google",
                photo: data.user.photo || "",
                contactNumber: "",
            });

            // Save token
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("clientToken", data.token);
            }

            setSuccess("Google sign-in successful. Redirecting...");

            setTimeout(() => {
                navigate(getRedirectAfterLogin());
            }, 700);
        } catch (err) {
            console.error(err);
            setError("Google login failed. Please try again.");
            setSuccess("");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError("");
        setSuccess("");
    };

    const handleLogin = (e) => {
        e.preventDefault();

        const email = formData.email.trim().toLowerCase();
        const password = formData.password.trim();

        if (!email || !password) {
            setError("Please enter your email and password.");
            setSuccess("");
            return;
        }

        const users = JSON.parse(localStorage.getItem("registeredClients")) || [];

        const foundUser = users.find(
            (u) =>
                (u.email || "").trim().toLowerCase() === email &&
                (u.password || "").trim() === password
        );

        if (foundUser) {
            saveClientSession({
                name: foundUser.fullName || "",
                email: foundUser.email,
                role: foundUser.role || "client",
                provider: "local",
                photo: "",
                contactNumber: foundUser.contactNumber || "",
            });

            setSuccess("Login successful. Redirecting...");
            setError("");

            setTimeout(() => {
                navigate(getRedirectAfterLogin());
            }, 700);
            return;
        }

        if (email === demoClient.email && password === demoClient.password) {
            saveClientSession({
                name: demoClient.fullName,
                email: demoClient.email,
                role: demoClient.role,
                provider: "local",
                photo: "",
                contactNumber: demoClient.contactNumber,
            });

            setSuccess("Login successful. Redirecting...");
            setError("");

            setTimeout(() => {
                navigate(getRedirectAfterLogin());
            }, 700);
            return;
        }

        setError("Invalid email or password.");
        setSuccess("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b3b2e] via-[#0b4b37] to-[#18b87a] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white mb-5 hover:text-yellow-300 transition"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm md:text-base">Back to Home</span>
                </Link>

                <div className="bg-[#f8f8f8] rounded-3xl border-2 border-yellow-500 shadow-2xl p-6 md:p-7">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                            <UserRound className="w-8 h-8 text-[#0b4b37]" />
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight">
                            <span className="text-yellow-500">Ebit&apos;s</span>{" "}
                            <span className="text-[#0b4b37]">Catering</span>
                        </h1>

                        <p className="text-slate-500 mt-2 text-lg">
                            Sign in to your client account
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full mb-4 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-yellow-400"
                        />

                        <div className="relative mb-4">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pr-12 border rounded-xl outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0b4b37]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-3 rounded-xl bg-red-100 text-red-700 px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-3 rounded-xl bg-green-100 text-green-700 px-4 py-3 text-sm">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#d4af37] hover:bg-[#c79f1e] text-[#0b3b2e] font-bold py-3 rounded-xl transition"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="my-4 flex items-center gap-3">
                        <div className="h-px bg-slate-300 flex-1" />
                        <span className="text-slate-400 text-sm">or</span>
                        <div className="h-px bg-slate-300 flex-1" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="group w-full border border-[#d4af37] bg-white text-slate-700 font-semibold py-3 rounded-xl
                                   flex items-center justify-center gap-2
                                   transition-all duration-300
                                   hover:bg-gradient-to-r hover:from-white hover:to-slate-100
                                   hover:shadow-lg hover:shadow-[#d4af37]/30
                                   hover:-translate-y-[2px] hover:scale-[1.02]
                                   disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
                    >
                        <Mail
                            size={18}
                            className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                        />
                        <span className="transition-all duration-300 group-hover:tracking-wide">
                            {isGoogleLoading ? "Signing in with Gmail..." : "Continue with Gmail"}
                        </span>
                    </button>

                    <p className="text-center text-sm text-slate-600 mt-5">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/client-register"
                            className="font-semibold text-[#0b4b37] hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ClientLogin;