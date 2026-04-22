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
    Sparkles,
    Menu,
    ChevronRight,
} from "lucide-react";

function AdminSidebar() {
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

    const navContent = (
        <div className="admin-sidebar relative flex h-full flex-col overflow-hidden border-r text-white shadow-[18px_0_45px_rgba(8,45,35,0.20)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 right-[-50px] h-44 w-44 rounded-full bg-[#f5c94a]/18 blur-3xl" />
                <div className="absolute bottom-[-40px] left-[-25px] h-32 w-32 rounded-full bg-white/8 blur-3xl" />
                <div className="absolute left-[-20px] top-[28%] h-20 w-20 rounded-full bg-white/6 blur-2xl" />
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
                                        : "text-white/88 hover:translate-x-[3px] hover:bg-white/10 hover:text-white"
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
        </>
    );
}

export default AdminSidebar;