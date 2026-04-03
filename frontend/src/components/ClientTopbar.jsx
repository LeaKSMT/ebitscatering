import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

function ClientTopbar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const clientUser = JSON.parse(localStorage.getItem("clientUser")) || {
        name: "Client",
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        localStorage.removeItem("clientUser");
        localStorage.removeItem("user");
        localStorage.removeItem("clientName");
        localStorage.removeItem("clientEmail");
        localStorage.removeItem("clientRole");
        localStorage.removeItem("clientPhoto");
        localStorage.removeItem("clientContactNumber");
        localStorage.removeItem("currentClientEmail");
        localStorage.removeItem("currentClientName");
        localStorage.removeItem("isClientLoggedIn");
        localStorage.removeItem("redirectAfterLogin");

        setShowLogoutModal(false);
        navigate("/login");
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    const navClass = ({ isActive }) =>
        `px-4 py-2 rounded-lg text-sm font-semibold transition ${isActive
            ? "bg-[#fff8e6] text-[#b99117] shadow-sm"
            : "text-white/90 hover:bg-white/10"
        }`;

    return (
        <>
            <header className="bg-[#0b4a3a] text-white shadow-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#f5c94a]">
                            Ebit&apos;s Catering
                        </h1>
                        <p className="text-sm text-white/80">Client Portal</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <NavLink to="/client/dashboard" className={navClass}>
                            Dashboard
                        </NavLink>

                        <NavLink to="/client/quotations" className={navClass}>
                            My Quotations
                        </NavLink>

                        <NavLink to="/client/bookings" className={navClass}>
                            My Bookings
                        </NavLink>

                        <NavLink to="/client/inquiries" className={navClass}>
                            Inquiries
                        </NavLink>

                        <NavLink to="/client/calendar" className={navClass}>
                            Calendar
                        </NavLink>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-white text-[#0b4a3a] font-semibold shadow-sm">
                            {clientUser.name}
                        </div>

                        <button
                            onClick={handleLogoutClick}
                            className="px-4 py-2 rounded-xl bg-[#f5c94a] text-[#0b4a3a] font-semibold hover:bg-[#eabf43] transition shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#f3e7b3] overflow-hidden animate-[fadeIn_.2s_ease-in-out]">
                        <div className="bg-[#0b4a3a] px-6 py-4">
                            <h2 className="text-xl font-bold text-[#f5c94a]">
                                Confirm Logout
                            </h2>
                            <p className="text-sm text-white/80 mt-1">
                                Are you sure you want to log out from your account?
                            </p>
                        </div>

                        <div className="px-6 py-6">
                            <div className="rounded-2xl bg-[#fffdf6] border border-[#f5e7a1] p-4 text-sm text-gray-700">
                                You will be redirected to the login page after logging out.
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={handleCancelLogout}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleConfirmLogout}
                                    className="px-5 py-2.5 rounded-xl bg-[#0b4a3a] text-white font-semibold hover:bg-[#08382c] transition"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ClientTopbar;