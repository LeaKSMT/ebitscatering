import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    Sparkles,
    ArrowUpRight,
    Crown,
    ChevronDown,
    Moon,
    SunMedium,
    LogOut,
    X,
    BellRing,
    Stars,
} from "lucide-react";

function AdminTopbar({ currentPath = "", theme = "light", onToggleTheme }) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [profileOpen, setProfileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isDark = theme === "dark";

    const getSafeJson = (key) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };

    const adminUser =
        getSafeJson("adminUser") ||
        getSafeJson("user") || {
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-2xl">
                <div className="px-3 pb-3 pt-14 sm:px-4 md:px-5 lg:px-6 lg:pb-4 lg:pt-4">
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className={`relative overflow-visible rounded-[32px] border text-white ${isDark
                                ? "border-white/10 bg-[linear-gradient(135deg,#063126_0%,#0a4637_32%,#0f6550_68%,#148366_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.26)]"
                                : "border-white/20 bg-[linear-gradient(135deg,#0a4637_0%,#0d5c48_38%,#13735b_72%,#1a8a6b_100%)] shadow-[0_24px_60px_rgba(10,70,55,0.18)]"
                            }`}
                    >
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
                            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <div className="absolute left-0 top-0 h-28 w-full bg-gradient-to-b from-white/10 to-transparent" />
                            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f3d57a]/18 blur-3xl" />
                            <div className="absolute left-[-30px] top-[25%] h-24 w-24 rounded-full bg-white/8 blur-3xl" />
                            <div className="absolute bottom-[-25px] right-[24%] h-20 w-20 rounded-full bg-white/6 blur-2xl" />
                            <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
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
                                        transition={{
                                            delay: 0.08,
                                            duration: 0.3,
                                        }}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                                    >
                                        <Sparkles size={12} />
                                        Executive View
                                    </motion.div>

                                    <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-white sm:text-[28px] lg:text-[33px]">
                                        {current.title}
                                    </h1>

                                    <p className="mt-1 max-w-3xl text-sm leading-6 text-white/80 md:text-[15px]">
                                        {current.subtitle}
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <div
                                        className="relative"
                                        ref={dropdownRef}
                                    >
                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.985 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() =>
                                                setProfileOpen((prev) => !prev)
                                            }
                                            className="group flex min-w-[255px] items-center gap-3 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.06)_100%)] px-3.5 py-3 text-left shadow-[0_16px_32px_rgba(0,0,0,0.12)] backdrop-blur-md transition duration-300 hover:border-white/15 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0.08)_100%)]"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#fff3c8_0%,#f2cf63_100%)] text-[#8a6710] shadow-[0_10px_24px_rgba(242,207,99,0.20)]">
                                                <ShieldCheck
                                                    size={18}
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                                                    {greeting}
                                                </p>
                                                <p className="truncate text-sm font-bold text-white">
                                                    {adminUser.name}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/72">
                                                    <Crown
                                                        size={12}
                                                        className="text-[#f3d57a]"
                                                    />
                                                    <span>
                                                        Administrator Access
                                                    </span>
                                                    <ArrowUpRight
                                                        size={12}
                                                    />
                                                </div>
                                            </div>

                                            <ChevronDown
                                                size={16}
                                                className={`shrink-0 text-white/85 transition duration-300 ${profileOpen
                                                        ? "rotate-180"
                                                        : ""
                                                    }`}
                                            />
                                        </motion.button>

                                        <AnimatePresence>
                                            {profileOpen && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                        scale: 0.97,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: 8,
                                                        scale: 0.97,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                        ease: "easeOut",
                                                    }}
                                                    className={`absolute right-0 top-[calc(100%+10px)] z-[120] w-[332px] overflow-hidden rounded-[26px] border shadow-[0_30px_70px_rgba(0,0,0,0.26)] ${isDark
                                                            ? "border-white/10 bg-[linear-gradient(180deg,rgba(7,27,21,0.98)_0%,rgba(10,36,29,0.98)_100%)]"
                                                            : "border-[#dfe8e3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,252,251,0.98)_100%)]"
                                                        }`}
                                                >
                                                    <div
                                                        className={`px-5 py-4 ${isDark
                                                                ? "border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]"
                                                                : "border-b border-[#ebf1ee] bg-[linear-gradient(135deg,#fdfbf3_0%,#f7f1d8_100%)]"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#fff3c8_0%,#f2cf63_100%)] text-[#8a6710] shadow-sm">
                                                                <ShieldCheck
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p
                                                                    className={`truncate text-sm font-bold ${isDark
                                                                            ? "text-white"
                                                                            : "text-[#08382d]"
                                                                        }`}
                                                                >
                                                                    {adminUser.name ||
                                                                        "Admin User"}
                                                                </p>
                                                                <p
                                                                    className={`mt-0.5 truncate text-xs ${isDark
                                                                            ? "text-white/70"
                                                                            : "text-[#58756c]"
                                                                        }`}
                                                                >
                                                                    Administrator
                                                                    Access
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`mt-4 grid grid-cols-2 gap-2 rounded-[18px] border px-3 py-3 ${isDark
                                                                    ? "border-white/10 bg-white/[0.03]"
                                                                    : "border-[#e7efea] bg-white/75"
                                                                }`}
                                                        >
                                                            <div>
                                                                <p
                                                                    className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark
                                                                            ? "text-white/45"
                                                                            : "text-[#7e958d]"
                                                                        }`}
                                                                >
                                                                    Role
                                                                </p>
                                                                <div
                                                                    className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${isDark
                                                                            ? "text-[#f6d97e]"
                                                                            : "text-[#8a6710]"
                                                                        }`}
                                                                >
                                                                    <Crown
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                    Admin
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p
                                                                    className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark
                                                                            ? "text-white/45"
                                                                            : "text-[#7e958d]"
                                                                        }`}
                                                                >
                                                                    Status
                                                                </p>
                                                                <div
                                                                    className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${isDark
                                                                            ? "text-[#98efcc]"
                                                                            : "text-[#0f7a51]"
                                                                        }`}
                                                                >
                                                                    <BellRing
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                    Active
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="px-3 pb-3 pt-2">
                                                        <div className="space-y-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    onToggleTheme?.();
                                                                    setProfileOpen(
                                                                        false
                                                                    );
                                                                }}
                                                                className={`flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-semibold transition ${isDark
                                                                        ? "text-white hover:bg-white/8"
                                                                        : "text-[#08382d] hover:bg-[#f3f7f5]"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark
                                                                            ? "bg-white/8 text-[#f6d97e]"
                                                                            : "bg-[#edf8f3] text-[#0f4d3c]"
                                                                        }`}
                                                                >
                                                                    {theme ===
                                                                        "dark" ? (
                                                                        <SunMedium
                                                                            size={
                                                                                17
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <Moon
                                                                            size={
                                                                                17
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span>
                                                                        {theme ===
                                                                            "dark"
                                                                            ? "Switch to Light Mode"
                                                                            : "Switch to Dark Mode"}
                                                                    </span>
                                                                </div>
                                                                <Stars
                                                                    size={14}
                                                                    className={
                                                                        isDark
                                                                            ? "text-white/40"
                                                                            : "text-[#90a79f]"
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setProfileOpen(
                                                                        false
                                                                    );
                                                                    setShowLogoutModal(
                                                                        true
                                                                    );
                                                                }}
                                                                className={`flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-semibold transition ${isDark
                                                                        ? "text-[#ffb4b4] hover:bg-[rgba(239,68,68,0.10)]"
                                                                        : "text-[#c73a3a] hover:bg-[#fff1f1]"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark
                                                                            ? "bg-[rgba(239,68,68,0.10)] text-[#fca5a5]"
                                                                            : "bg-[#fff1f1] text-[#dc2626]"
                                                                        }`}
                                                                >
                                                                    <LogOut
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </div>
                                                                <span>
                                                                    Logout
                                                                </span>
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
                    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[4px]">
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.97 }}
                            className={`w-full max-w-md overflow-hidden rounded-[30px] border shadow-[0_30px_70px_rgba(0,0,0,0.22)] ${isDark
                                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(8,28,22,0.99)_0%,rgba(10,34,26,0.99)_100%)]"
                                    : "border-[#dfe8e3] bg-white"
                                }`}
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
                                        onClick={() =>
                                            setShowLogoutModal(false)
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-6">
                                <p
                                    className={`leading-7 ${isDark
                                            ? "text-[#dce9e4]"
                                            : "text-[#50645e]"
                                        }`}
                                >
                                    Are you sure you want to log out of the
                                    admin panel?
                                </p>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() =>
                                            setShowLogoutModal(false)
                                        }
                                        className={`w-full rounded-2xl border py-3 font-bold transition ${isDark
                                                ? "border-white/10 text-white hover:bg-white/6"
                                                : "border-[#dfe8e3] text-[#0b4a3a] hover:bg-[#f5faf7]"
                                            }`}
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