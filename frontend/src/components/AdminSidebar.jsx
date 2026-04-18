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
} from "lucide-react";

function AdminSidebar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        {
            label: "Inquiry Management",
            path: "/admin/inquiries",
            icon: MessageSquareQuote,
        },
        {
            label: "Financial Management",
            path: "/admin/financial-management",
            icon: TrendingUp,
        },
        { label: "Quotations", path: "/admin/quotations", icon: FileText },
        {
            label: "Event Management",
            path: "/admin/event-management",
            icon: CalendarCheck2,
        },
        { label: "Calendar", path: "/admin/calendar", icon: CalendarDays },
        { label: "Package Content", path: "/admin/packages", icon: Package2 },
        { label: "Pricing", path: "/admin/pricing", icon: PhilippinePeso },
        { label: "Decorations", path: "/admin/decorations", icon: Palette },
        { label: "Employees", path: "/admin/employees", icon: Users },
        { label: "Payroll", path: "/admin/payroll", icon: WalletCards },
        { label: "Inventory", path: "/admin/inventory", icon: Boxes },
        {
            label: "Payment Tracking",
            path: "/admin/payment-tracking",
            icon: CreditCard,
        },
        { label: "Client Profiles", path: "/admin/clients", icon: UserRound },
        { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    ];

    const confirmLogout = () => {
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLogoutModal(false);
        setMobileOpen(false);
        navigate("/login");
    };

    const navContent = (
        <div className="flex h-full flex-col border-r border-white/10 bg-[linear-gradient(180deg,#0a4637_0%,#0d5744_55%,#10614b_100%)] text-white shadow-[12px_0_35px_rgba(8,40,31,0.15)]">
            <div className="shrink-0 border-b border-white/10 px-5 py-6">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#f5c94a]" />
                    <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-[#f5c94a]">
                        Ebit&apos;s Catering
                    </h1>
                </div>
                <p className="mt-1 text-sm text-white/80">Executive Admin Panel</p>

                <div className="mt-5 rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff3c8] text-[#8a6710]">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                                Access Level
                            </p>
                            <p className="text-sm font-bold text-white">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-[20px] px-4 py-3 text-[15px] font-medium transition-all duration-200 ${isActive
                                    ? "bg-[linear-gradient(135deg,#fff3c8_0%,#f4db86_100%)] text-[#0b4a3a] shadow-[0_14px_30px_rgba(212,175,55,0.18)]"
                                    : "text-white/90 hover:bg-white/10 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="leading-5">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="shrink-0 border-t border-white/10 px-4 pb-5 pt-4">
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-white px-4 py-3 font-bold text-[#0b4a3a] shadow-sm transition hover:bg-gray-100"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dce7e2] bg-white text-[#0b4a3a] shadow-sm lg:hidden"
            >
                <Menu size={20} />
            </button>

            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] lg:block">
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
                            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] lg:hidden"
                        />

                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="fixed left-0 top-0 z-[60] h-screen w-[88%] max-w-[320px] lg:hidden"
                        >
                            <div className="relative h-full">
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                                >
                                    <X size={18} />
                                </button>
                                {navContent}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]">
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.97 }}
                            className="w-full max-w-md overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between bg-[linear-gradient(135deg,#0b4a3a_0%,#0f5d49_100%)] px-6 py-5 text-white">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
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
                                        className="w-full rounded-2xl bg-[#d4af37] py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
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