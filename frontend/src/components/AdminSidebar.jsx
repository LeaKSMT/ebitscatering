import { useState } from "react";
import { NavLink } from "react-router-dom";
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
    X,
    Menu,
    ChevronRight,
    Sparkles,
} from "lucide-react";

function AdminSidebar({ theme = "light" }) {
    const [mobileOpen, setMobileOpen] = useState(false);

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

    const isDark = theme === "dark";

    const navContent = (
        <div
            className={`admin-sidebar relative flex h-full flex-col overflow-hidden border-r ${isDark
                    ? "border-white/10 bg-[linear-gradient(180deg,#031a15_0%,#06261f_20%,#083428_52%,#0b4e3b_78%,#0f6a50_100%)] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]"
                    : "border-white/10 bg-[linear-gradient(180deg,#042c23_0%,#083a2f_18%,#0b4d3c_44%,#0f6750_76%,#138261_100%)] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.10)]"
                }`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <div className="absolute left-0 top-0 h-40 w-full bg-gradient-to-b from-white/8 to-transparent" />
                <div className="absolute -top-16 right-[-55px] h-48 w-48 rounded-full bg-[#f5c94a]/18 blur-3xl" />
                <div className="absolute top-[20%] left-[-50px] h-36 w-36 rounded-full bg-[#20b486]/10 blur-3xl" />
                <div className="absolute bottom-[-40px] left-[-20px] h-32 w-32 rounded-full bg-white/8 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
            </div>

            <div className="relative shrink-0 border-b border-white/10 px-5 pb-5 pt-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_18px_35px_rgba(0,0,0,0.12)] backdrop-blur-sm"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-[22px] font-extrabold tracking-tight text-[#f5d36a]">
                                Ebit's Catering
                            </h1>
                            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/65">
                                Admin Workspace
                            </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#f5d36a]/20 bg-[linear-gradient(135deg,rgba(245,211,106,0.22)_0%,rgba(245,201,74,0.10)_100%)] text-[#f5d36a] shadow-[0_10px_25px_rgba(245,201,74,0.10)]">
                            <Sparkles size={16} />
                        </div>
                    </div>
                </motion.div>
            </div>

            <nav className="relative flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-2">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: index * 0.035,
                                    duration: 0.32,
                                    ease: "easeOut",
                                }}
                            >
                                <NavLink
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className="block"
                                >
                                    {({ isActive }) => (
                                        <motion.div
                                            whileHover={{
                                                x: 4,
                                                transition: { duration: 0.18 },
                                            }}
                                            whileTap={{ scale: 0.985 }}
                                            className={`group relative overflow-hidden rounded-[22px] border px-3.5 py-3.5 transition-all duration-300 ${isActive
                                                    ? "border-[#f5d36a]/85 bg-[linear-gradient(135deg,#fff6da_0%,#f5dd92_42%,#ebc65c_100%)] text-[#07372d] shadow-[0_18px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.45)]"
                                                    : "border-transparent bg-white/[0.03] text-white/95 hover:border-white/10 hover:bg-white/[0.08] hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]"
                                                }`}
                                        >
                                            <div
                                                className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${isActive
                                                        ? "opacity-100"
                                                        : "opacity-0 group-hover:opacity-100"
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute inset-y-0 left-0 w-[3px] rounded-r-full ${isActive
                                                            ? "bg-[#0a4638]"
                                                            : "bg-[#f5d36a]/60"
                                                        }`}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/8 to-transparent" />
                                            </div>

                                            <div className="relative flex items-center gap-3">
                                                <motion.div
                                                    whileHover={{ rotate: -4, scale: 1.04 }}
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border transition-all duration-300 ${isActive
                                                            ? "border-[#0b4a3a]/10 bg-[linear-gradient(135deg,#08382d_0%,#0c4b3c_100%)] text-[#f5d36a] shadow-[0_10px_22px_rgba(8,56,45,0.28)]"
                                                            : "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.05)_100%)] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] group-hover:border-[#f5d36a]/18 group-hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)] group-hover:text-[#ffe28a]"
                                                        }`}
                                                >
                                                    <Icon size={17} strokeWidth={2.15} />
                                                </motion.div>

                                                <div className="min-w-0 flex-1">
                                                    <span
                                                        className={`block truncate text-[14px] font-semibold tracking-[0.01em] transition-colors duration-300 ${isActive
                                                                ? "text-[#08382d]"
                                                                : "text-white/95 group-hover:text-white"
                                                            }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                </div>

                                                <ChevronRight
                                                    size={16}
                                                    className={`shrink-0 transition-all duration-300 ${isActive
                                                            ? "translate-x-0 text-[#08382d] opacity-100"
                                                            : "translate-x-[-3px] text-white/65 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#ffe28a]"
                                                        }`}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </NavLink>
                            </motion.div>
                        );
                    })}
                </div>
            </nav>

            <div className="relative shrink-0 border-t border-white/10 px-4 py-4">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                        Premium Admin
                    </p>
                    <p className="mt-1 text-xs font-medium text-white/80">
                        Elegant workspace for managing operations.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <motion.button
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dfe8e3] bg-white/95 text-[#0b4a3a] shadow-[0_10px_25px_rgba(15,77,60,0.14)] backdrop-blur lg:hidden"
            >
                <Menu size={18} />
            </motion.button>

            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[248px] lg:block">
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
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px]"
                        />

                        <motion.aside
                            initial={{ x: "-100%", opacity: 0.8 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0.8 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="fixed left-0 top-0 z-[60] h-screen w-[84%] max-w-[290px]"
                        >
                            <motion.button
                                whileHover={{ scale: 1.06, rotate: 90 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setMobileOpen(false)}
                                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
                            >
                                <X size={16} />
                            </motion.button>

                            {navContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminSidebar;