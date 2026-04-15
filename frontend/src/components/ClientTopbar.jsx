import { NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    MessageSquare,
    CalendarDays,
    LogOut,
} from "lucide-react";

function ClientTopbar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const clientUser = useMemo(() => {
        try {
            return (
                JSON.parse(localStorage.getItem("clientUser")) ||
                JSON.parse(localStorage.getItem("user")) || {
                    name: "Client",
                }
            );
        } catch {
            return { name: "Client" };
        }
    }, []);

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

    const navClass = ({ isActive }) =>
        `inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${isActive
            ? "bg-[#fff5d6] text-[#9a7614] shadow-sm"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        }`;

    const navItems = [
        { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/client/quotations", label: "My Quotations", icon: FileText },
        { to: "/client/bookings", label: "My Bookings", icon: BookOpen },
        { to: "/client/inquiries", label: "Inquiries", icon: MessageSquare },
        { to: "/client/calendar", label: "Calendar", icon: CalendarDays },
    ];

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b5a43] text-white shadow-[0_8px_30px_rgba(11,90,67,0.12)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-fit">
                            <h1 className="text-[2rem] leading-none font-extrabold tracking-tight text-[#f5c94a]">
                                Ebit&apos;s Catering
                            </h1>
                            <p className="mt-1 text-sm font-medium text-white/75">
                                Client Portal
                            </p>
                        </div>

                        <div className="flex-1 min-w-0 overflow-hidden">
                            <nav className="flex items-center gap-2 whitespace-nowrap xl:justify-center">
                                {navItems.map(({ to, label, icon: Icon }) => (
                                    <NavLink key={to} to={to} className={navClass}>
                                        <Icon size={16} className="shrink-0" />
                                        <span>{label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="max-w-[180px] truncate rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm font-bold text-[#0b5a43] shadow-sm">
                                {clientUser?.name || "Client"}
                            </div>

                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#f5c94a] px-4 py-2.5 text-sm font-bold text-[#0b5a43] shadow-sm transition hover:bg-[#ebbf41]"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#efe2a9] bg-white shadow-2xl">
                        <div className="bg-[#0b5a43] px-6 py-5">
                            <h2 className="text-xl font-bold text-[#f5c94a]">
                                Confirm Logout
                            </h2>
                            <p className="mt-1 text-sm text-white/80">
                                Are you sure you want to log out from your account?
                            </p>
                        </div>

                        <div className="px-6 py-6">
                            <div className="rounded-2xl border border-[#f4e6a5] bg-[#fffaf0] p-4 text-sm text-slate-600">
                                You will be redirected to the login page after logging out.
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleConfirmLogout}
                                    className="rounded-xl bg-[#0b5a43] px-5 py-2.5 font-semibold text-white transition hover:bg-[#084633]"
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