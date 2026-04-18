import { NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    MessageSquare,
    CalendarDays,
    LogOut,
    Menu,
    X,
    Sparkles,
} from "lucide-react";

function ClientTopbar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        setMobileMenuOpen(false);
        navigate("/login");
    };

    const navItems = [
        { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/client/quotations", label: "My Quotations", icon: FileText },
        { to: "/client/bookings", label: "My Bookings", icon: BookOpen },
        { to: "/client/inquiries", label: "Inquiries", icon: MessageSquare },
        { to: "/client/calendar", label: "Calendar", icon: CalendarDays },
    ];

    const navClass = ({ isActive }) =>
        `inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isActive
            ? "bg-[#fff3c8] text-[#8a6710] shadow-[0_10px_25px_rgba(212,175,55,0.22)]"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        }`;

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_55%,#11785a_100%)] text-white shadow-[0_12px_35px_rgba(11,90,67,0.18)] backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 py-4 xl:py-5">
                        <motion.div
                            initial={{ opacity: 0, x: -18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45 }}
                            className="min-w-0"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} className="text-[#f5c94a]" />
                                <h1 className="truncate text-[1.55rem] sm:text-[2rem] leading-none font-extrabold tracking-tight text-[#f5c94a]">
                                    Ebit&apos;s Catering
                                </h1>
                            </div>
                            <p className="mt-1 text-sm font-medium text-white/75">
                                Client Portal
                            </p>
                        </motion.div>

                        <div className="hidden 2xl:flex flex-1 justify-center px-4 min-w-0">
                            <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-sm">
                                {navItems.map(({ to, label, icon: Icon }) => (
                                    <NavLink key={to} to={to} className={navClass}>
                                        <Icon size={16} className="shrink-0" />
                                        <span>{label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45 }}
                            className="hidden 2xl:flex items-center gap-3"
                        >
                            <div className="max-w-[190px] truncate rounded-2xl border border-white/10 bg-white px-4 py-2.5 text-sm font-bold text-[#0b5a43] shadow-sm">
                                {clientUser?.name || "Client"}
                            </div>

                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#f5c94a] px-4 py-2.5 text-sm font-bold text-[#0b5a43] shadow-[0_10px_22px_rgba(245,201,74,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ebbf41]"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </motion.div>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="2xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 z-50 bg-[#061d16]/55 backdrop-blur-[2px] 2xl:hidden"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="fixed right-0 top-0 z-[60] h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl 2xl:hidden"
                        >
                            <div className="bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] px-5 py-5 text-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-2xl font-extrabold text-[#f5c94a]">
                                            Ebit&apos;s Catering
                                        </h2>
                                        <p className="mt-1 text-sm text-white/80">
                                            Client Portal
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="mt-5 rounded-2xl border border-white/10 bg-white px-4 py-3 text-[#0b5a43] shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b5a43]/60">
                                        Signed in as
                                    </p>
                                    <p className="mt-1 truncate text-base font-bold">
                                        {clientUser?.name || "Client"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5">
                                <nav className="space-y-2">
                                    {navItems.map(({ to, label, icon: Icon }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive
                                                    ? "bg-[#fff5d8] text-[#9a7614]"
                                                    : "text-slate-700 hover:bg-[#f5f8f7]"
                                                }`
                                            }
                                        >
                                            <Icon size={18} />
                                            <span>{label}</span>
                                        </NavLink>
                                    ))}
                                </nav>

                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b5a43] px-4 py-3 font-bold text-white transition hover:bg-[#084633]"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogoutModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[2px]"
                        />

                        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                                transition={{ duration: 0.25 }}
                                className="w-full max-w-md overflow-hidden rounded-[30px] border border-[#efe2a9] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.22)]"
                            >
                                <div className="bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] px-6 py-5">
                                    <h2 className="text-xl font-bold text-[#f5c94a]">
                                        Confirm Logout
                                    </h2>
                                    <p className="mt-1 text-sm text-white/80">
                                        Are you sure you want to log out from your account?
                                    </p>
                                </div>

                                <div className="px-6 py-6">
                                    <div className="rounded-2xl border border-[#f4e6a5] bg-[#fffaf0] p-4 text-sm leading-6 text-slate-600">
                                        You will be redirected to the login page after logging out.
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowLogoutModal(false)}
                                            className="rounded-2xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleConfirmLogout}
                                            className="rounded-2xl bg-[#0b5a43] px-5 py-2.5 font-semibold text-white transition hover:bg-[#084633]"
                                        >
                                            Yes, Logout
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default ClientTopbar;