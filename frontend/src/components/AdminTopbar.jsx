import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    ShieldCheck,
    Sparkles,
    Activity,
    ArrowUpRight,
    Crown,
    ChevronDown,
    Moon,
    SunMedium,
    LogOut,
    UserCircle2,
    X,
} from "lucide-react";

function AdminTopbar({ currentPath = "", theme = "light", onToggleTheme }) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [profileOpen, setProfileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const adminUser =
        JSON.parse(localStorage.getItem("adminUser") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null") || {
            name: "Admin User",
        };

    const pageTitles = {
        "/admin/dashboard": {
            title: "Admin Dashboard",
            subtitle:
                "Executive overview of bookings, revenue, payments, and overall business performance.",
        },
        "/admin/inquiries": {
            title: "Inquiry Management",
            subtitle:
                "Review and manage client concerns with a clean and professional workflow.",
        },
        "/admin/financial-management": {
            title: "Financial Management",
            subtitle:
                "Track revenue, expenses, and overall financial health in one place.",
        },
        "/admin/quotations": {
            title: "Quotation Management",
            subtitle:
                "Manage client quotation requests, pricing, and proposal flow.",
        },
        "/admin/event-management": {
            title: "Event Management",
            subtitle:
                "Monitor event details, scheduling, and staff coordination.",
        },
        "/admin/calendar": {
            title: "Event Calendar",
            subtitle: "View schedules, bookings, and date-based planning clearly.",
        },
        "/admin/packages": {
            title: "Package Content",
            subtitle:
                "Manage package inclusions aligned with your service offerings.",
        },
        "/admin/pricing": {
            title: "Package Breakdown & Pricing",
            subtitle: "Control rates, service fees, and add-on pricing.",
        },
        "/admin/decorations": {
            title: "Decorations Management",
            subtitle: "Organize themes and decorative options for events.",
        },
        "/admin/employees": {
            title: "Employee Management",
            subtitle: "Handle staff visibility, records, and assignments.",
        },
        "/admin/payroll": {
            title: "Payroll Management",
            subtitle: "Review compensation, payroll records, and salary details.",
        },
        "/admin/inventory": {
            title: "Inventory Management",
            subtitle: "Monitor supplies, equipment, and available resources.",
        },
        "/admin/payment-tracking": {
            title: "Payment Tracking",
            subtitle: "Track balances, partial payments, and payment completion.",
        },
        "/admin/clients": {
            title: "Client Profiles",
            subtitle: "Access client records, history, and profile details.",
        },
        "/admin/reports": {
            title: "Business Reports",
            subtitle: "Analyze performance and prepare management-ready reports.",
        },
    };

    const current = pageTitles[currentPath] || {
        title: "Admin Dashboard",
        subtitle:
            "Executive overview of bookings, revenue, payments, and overall business performance.",
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const confirmLogout = () => {
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLogoutModal(false);
        setProfileOpen(false);
        navigate("/login");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header className="admin-topbar sticky top-0 z-30 border-b backdrop-blur-2xl">
                <div className="px-3 pb-3 pt-14 sm:px-4 md:px-5 lg:px-6 lg:pb-4 lg:pt-4">
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative overflow-hidden rounded-[30px] border bg-[linear-gradient(135deg,#0a4637_0%,#0d5c48_52%,#148266_100%)] text-white shadow-[0_20px_50px_rgba(10,70,55,0.22)]"
                    >
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f3d57a]/18 blur-3xl" />
                            <div className="absolute left-[-30px] top-[25%] h-24 w-24 rounded-full bg-white/8 blur-3xl" />
                            <div className="absolute bottom-[-25px] right-[24%] h-20 w-20 rounded-full bg-white/6 blur-2xl" />
                        </div>

                        <motion.div
                            animate={{ x: ["-30%", "135%"] }}
                            transition={{
                                duration: 6.2,
                                repeat: Infinity,
                                repeatDelay: 2.2,
                                ease: "linear",
                            }}
                            className="pointer-events-none absolute inset-y-0 left-[-35%] w-[28%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        />

                        <div className="relative px-4 py-4 sm:px-5 md:px-6 lg:px-7 lg:py-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="min-w-0">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.08, duration: 0.3 }}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-md"
                                    >
                                        <Sparkles size={12} />
                                        Executive View
                                    </motion.div>

                                    <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-white sm:text-[28px] lg:text-[32px]">
                                        {current.title}
                                    </h1>

                                    <p className="mt-1 max-w-3xl text-sm leading-6 text-white/80 md:text-[15px]">
                                        {current.subtitle}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
                                    <motion.div
                                        whileHover={{ y: -3, scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                        className="hidden items-center gap-3 rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md shadow-[0_14px_30px_rgba(0,0,0,0.10)] md:flex"
                                    >
                                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                                            <Bell size={18} />
                                            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#9ef2c9] shadow-[0_0_12px_rgba(158,242,201,0.9)]" />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                                Status
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-white">
                                                <Activity size={14} className="text-[#9ef2c9]" />
                                                <span>System Active</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="relative" ref={dropdownRef}>
                                        <motion.button
                                            whileHover={{ y: -3, scale: 1.02 }}
                                            whileTap={{ scale: 0.985 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() => setProfileOpen((prev) => !prev)}
                                            className="flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/10 px-4 py-3 text-left backdrop-blur-md shadow-[0_14px_30px_rgba(0,0,0,0.10)]"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff3c8_0%,#f2cf63_100%)] text-[#8a6710] shadow-sm">
                                                <ShieldCheck size={19} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                                    {greeting}
                                                </p>
                                                <p className="max-w-[180px] truncate text-sm font-bold text-white">
                                                    {adminUser.name}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/65">
                                                    <Crown size={12} className="text-[#f3d57a]" />
                                                    <span>Administrator Access</span>
                                                    <ArrowUpRight size={12} />
                                                </div>
                                            </div>

                                            <ChevronDown
                                                size={16}
                                                className={`shrink-0 text-white/80 transition ${profileOpen ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </motion.button>

                                        <AnimatePresence>
                                            {profileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="admin-profile-dropdown absolute right-0 top-[calc(100%+12px)] z-[80] w-[300px] overflow-hidden rounded-[28px] border shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
                                                >
                                                    <div className="admin-profile-dropdown-header px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff3c8_0%,#f2cf63_100%)] text-[#8a6710] shadow-sm">
                                                                <ShieldCheck size={18} />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold">
                                                                    {adminUser.name || "Admin User"}
                                                                </p>
                                                                <p className="mt-0.5 text-xs opacity-80">
                                                                    Administrator Access
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-3">
                                                        <div className="rounded-[22px] border border-black/5 bg-black/[0.03] px-4 py-3">
                                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">
                                                                Active Theme
                                                            </p>
                                                            <p className="mt-1 text-sm font-semibold">
                                                                {theme === "dark"
                                                                    ? "Dark Mode"
                                                                    : "Light Mode"}
                                                            </p>
                                                        </div>

                                                        <div className="mt-3 space-y-2">
                                                            <button
                                                                type="button"
                                                                className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition hover:bg-black/[0.05]"
                                                            >
                                                                <UserCircle2 size={18} />
                                                                <span>Profile Overview</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    onToggleTheme?.();
                                                                    setProfileOpen(false);
                                                                }}
                                                                className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition hover:bg-black/[0.05]"
                                                            >
                                                                {theme === "dark" ? (
                                                                    <SunMedium size={18} />
                                                                ) : (
                                                                    <Moon size={18} />
                                                                )}
                                                                <span>
                                                                    {theme === "dark"
                                                                        ? "Switch to Light Mode"
                                                                        : "Switch to Dark Mode"}
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setProfileOpen(false);
                                                                    setShowLogoutModal(true);
                                                                }}
                                                                className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition hover:bg-black/[0.05]"
                                                            >
                                                                <LogOut size={18} />
                                                                <span>Logout</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]">
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.97 }}
                            className="admin-logout-modal w-full max-w-md overflow-hidden rounded-[28px] border shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
                        >
                            <div className="bg-[linear-gradient(135deg,#0b4a3a_0%,#0f5d49_60%,#12785b_100%)] px-6 py-5 text-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-white/65">
                                            Confirmation
                                        </p>
                                        <h3 className="mt-1 text-2xl font-extrabold">
                                            Logout Admin
                                        </h3>
                                    </div>

                                    <button
                                        onClick={() => setShowLogoutModal(false)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-6">
                                <p className="admin-logout-text leading-7">
                                    Are you sure you want to log out of the admin panel?
                                </p>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowLogoutModal(false)}
                                        className="admin-logout-cancel w-full rounded-2xl border py-3 font-bold transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmLogout}
                                        className="w-full rounded-2xl bg-[linear-gradient(135deg,#e4bc41_0%,#d4af37_100%)] py-3 font-bold text-[#0b4a3a] transition hover:brightness-95"
                                    >
                                        Yes, Logout
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminTopbar;