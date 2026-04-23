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
    ShieldCheck,
} from "lucide-react";

function AdminSidebar({ theme = "light" }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const isDark = theme === "dark";

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

    const navContent = (
        <div
            className={`relative flex h-full flex-col overflow-hidden border-r ${isDark
                    ? "border-white/10 bg-[linear-gradient(180deg,#021611_0%,#05231c_18%,#083127_42%,#0b4837_72%,#10654d_100%)] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.22)]"
                    : "border-white/10 bg-[linear-gradient(180deg,#03231c_0%,#063229_18%,#0a4638_42%,#0f5d48_72%,#147a5c_100%)] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.08),0_20px_40px_rgba(0,0,0,0.14)]"
                }`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <div className="absolute left-0 top-0 h-36 w-full bg-gradient-to-b from-white/8 to-transparent" />
                <div className="absolute -top-16 right-[-55px] h-48 w-48 rounded-full bg-[#f5cf67]/18 blur-3xl" />
                <div className="absolute top-[18%] left-[-52px] h-36 w-36 rounded-full bg-[#1fb687]/10 blur-3xl" />
                <div className="absolute bottom-[-42px] left-[-18px] h-32 w-32 rounded-full bg-white/8 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
            </div>

            <div className="relative shrink-0 border-b border-white/10 px-4 pb-4 pt-5">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-4 shadow-[0_18px_35px_rgba(0,0,0,0.16)] backdrop-blur-sm"
                >
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#f5cf67]/12 blur-2xl" />
                        <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-white/6 blur-2xl" />
                    </div>

                    <div className="relative flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-[22px] font-extrabold tracking-tight text-[#f5d36a]">
                                Ebit's Catering
                            </h1>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                                Admin Workspace
                            </p>

                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#f5d36a]/20 bg-[rgba(245,211,106,0.10)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f8df8c]">
                                <ShieldCheck size={12} />
                                Premium Control Panel
                            </div>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-[#f5d36a]/18 bg-[linear-gradient(135deg,rgba(245,211,106,0.22)_0%,rgba(245,201,74,0.08)_100%)] text-[#f5d36a] shadow-[0_12px_28px_rgba(245,201,74,0.10)]">
                            <Sparkles size={16} />
                        </div>
                    </div>
                </motion.div>
            </div>

            <nav className="relative flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-2.5">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, x: -14 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: index * 0.03,
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
                                                x: 5,
                                                transition: { duration: 0.18 },
                                            }}
                                            whileTap={{ scale: 0.985 }}
                                            className={`group relative overflow-hidden rounded-[22px] border px-3.5 py-3.5 transition-all duration-300 ${isActive
                                                    ? "border-[#f5d36a]/80 bg-[linear-gradient(135deg,#fff8df_0%,#f6df97_40%,#eac55b_100%)] text-[#07372d] shadow-[0_18px_34px_rgba(0,0,0,0.18),0_0_22px_rgba(245,211,106,0.18),inset_0_1px_0_rgba(255,255,255,0.45)]"
                                                    : "border-transparent bg-white/[0.035] text-white/95 hover:border-white/10 hover:bg-white/[0.085] hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]"
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
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/18 via-white/6 to-transparent" />
                                            </div>

                                            <div className="relative flex items-center gap-3">
                                                <motion.div
                                                    whileHover={{ rotate: -5, scale: 1.04 }}
                                                    transition={{ duration: 0.18 }}
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border transition-all duration-300 ${isActive
                                                            ? "border-[#0b4a3a]/10 bg-[linear-gradient(135deg,#08382d_0%,#0c4b3c_100%)] text-[#f5d36a] shadow-[0_10px_22px_rgba(8,56,45,0.28)]"
                                                            : "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_100%)] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] group-hover:border-[#f5d36a]/18 group-hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)] group-hover:text-[#ffe28a]"
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
                <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.035)_100%)] px-4 py-3 backdrop-blur-sm shadow-[0_12px_26px_rgba(0,0,0,0.10)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                        Defense Ready
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-white/80">
                        Elegant and professional workspace for managing operations.
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

            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[252px] lg:block">
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
                            className="fixed left-0 top-0 z-[60] h-screen w-[84%] max-w-[292px]"
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