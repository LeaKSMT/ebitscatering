import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    MessageSquareQuote,
    TrendingUp,
    FileText,
    CalendarCheck2,
    CalendarDays,
    Package2,
    PhilippinePeso,
    Palette,
    Users,
    WalletCards,
    Boxes,
    CreditCard,
    UserRound,
    BarChart3,
    LogOut,
    X,
    Sparkles,
    ShieldCheck,
    Menu,
    ChevronRight,
    Crown,
} from "lucide-react";

function AdminSidebar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const adminUser =
        JSON.parse(localStorage.getItem("adminUser") || "null") || {
            name: "Admin User",
        };

    const navItems = [
        { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Inquiries", path: "/admin/inquiries", icon: MessageSquareQuote },
        { label: "Financial", path: "/admin/financial-management", icon: TrendingUp },
        { label: "Quotations", path: "/admin/quotations", icon: FileText },
        { label: "Events", path: "/admin/event-management", icon: CalendarCheck2 },
        { label: "Calendar", path: "/admin/calendar", icon: CalendarDays },
        { label: "Packages", path: "/admin/packages", icon: Package2 },
        { label: "Pricing", path: "/admin/pricing", icon: PhilippinePeso },
        { label: "Decor", path: "/admin/decorations", icon: Palette },
        { label: "Employees", path: "/admin/employees", icon: Users },
        { label: "Payroll", path: "/admin/payroll", icon: WalletCards },
        { label: "Inventory", path: "/admin/inventory", icon: Boxes },
        { label: "Payments", path: "/admin/payment-tracking", icon: CreditCard },
        { label: "Clients", path: "/admin/clients", icon: UserRound },
        { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    ];

    const confirmLogout = () => {
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLogoutModal(false);
        setMobileOpen(false);
        navigate("/admin-login");
    };

    const navContent = (
        <div className="relative flex h-full flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,#042f25_0%,#0a4637_28%,#0d5b47_62%,#12785b_100%)] text-white shadow-[18px_0_45px_rgba(8,45,35,0.20)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 right-[-50px] h-44 w-44 rounded-full bg-[#f5c94a]/18 blur-3xl" />
                <div className="absolute bottom-[-40px] left-[-25px] h-32 w-32 rounded-full bg-white/8 blur-3xl" />
                <div className="absolute top-[28%] left-[-20px] h-20 w-20 rounded-full bg-white/6 blur-2xl" />
            </div>

            <div className="relative shrink-0 border-b border-white/10 px-4 pb-4 pt-5">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#f5c94a]" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                            Premium Panel
                        </p>
                    </div>

                    <h1 className="mt-2 text-[20px] font-extrabold leading-tight tracking-tight text-[#f5d36a]">
                        Ebit&apos;s Catering
                    </h1>

                    <p className="mt-1 text-xs text-white/75">
                        Executive Admin Workspace
                    </p>

                    <motion.div
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-white/10 p-3 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff3c8_0%,#f3d06a_100%)] text-[#8a6710] shadow-[0_10px_20px_rgba(0,0,0,0.10)]">
                                <ShieldCheck size={18} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                    Logged In
                                </p>
                                <p className="truncate text-sm font-bold text-white">
                                    {adminUser.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/65">
                                    <Crown size={12} className="text-[#f5d36a]" />
                                    Administrator Access
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <nav className="relative flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
                {navItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03 * index, duration: 0.28 }}
                        >
                            <NavLink
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-[18px] px-3 py-3 text-[14px] font-medium transition-all duration-200 ${isActive
                                        ? "bg-[linear-gradient(135deg,#fff3c8_0%,#f4db86_100%)] text-[#0b4a3a] shadow-[0_14px_30px_rgba(212,175,55,0.22)]"
                                        : "text-white/88 hover:bg-white/10 hover:text-white hover:translate-x-[3px]"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${isActive
                                                    ? "bg-white/55 text-[#0b4a3a] shadow-sm"
                                                    : "bg-white/8 text-white/90 group-hover:bg-white/12"
                                                }`}
                                        >
                                            <Icon size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate leading-5">
                                                {item.label}
                                            </span>
                                        </div>

                                        <ChevronRight
                                            size={15}
                                            className={`transition ${isActive
                                                    ? "translate-x-0 text-[#0b4a3a]"
                                                    : "-translate-x-1 text-white/45 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                                }`}
                                        />
                                    </>
                                )}
                            </NavLink>
                        </motion.div>
                    );
                })}
            </nav>

            <div className="relative shrink-0 border-t border-white/10 px-3 pb-4 pt-3">
                <motion.button
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/15 bg-white px-4 py-3 font-bold text-[#0b4a3a] shadow-[0_10px_25px_rgba(0,0,0,0.10)] transition hover:bg-[#f8faf9]"
                >
                    <LogOut size={17} />
                    Logout
                </motion.button>
            </div>
        </div>
    );

    return (
        <>
            <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-[#0b4a3a] shadow-[0_10px_24px_rgba(15,77,60,0.12)] backdrop-blur-md lg:hidden"
            >
                <Menu size={19} />
            </motion.button>

            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] lg:block">
                {navContent}
            </aside>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px] lg:hidden"
                        />

                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="fixed left-0 top-0 z-[60] h-screen w-[82%] max-w-[300px] lg:hidden"
                        >
                            <div className="relative h-full">
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                                >
                                    <X size={17} />
                                </button>
                                {navContent}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]">
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.97 }}
                            className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
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
                                <p className="leading-7 text-gray-600">
                                    Are you sure you want to log out of the admin panel?
                                </p>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowLogoutModal(false)}
                                        className="w-full rounded-2xl border border-gray-200 py-3 font-bold text-[#0b4a3a] transition hover:bg-gray-50"
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

export default AdminSidebar;