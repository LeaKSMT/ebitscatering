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

    const navContent = (
        <div
            className={`admin-sidebar relative flex h-full flex-col overflow-hidden border-r ${theme === "dark"
                    ? "border-white/10 bg-[linear-gradient(180deg,#031f19_0%,#072c23_28%,#0a3e31_62%,#0d5a45_100%)] text-white"
                    : "border-white/10 bg-[linear-gradient(180deg,#042f25_0%,#0a4637_28%,#0d5b47_62%,#12785b_100%)] text-white"
                }`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 right-[-50px] h-44 w-44 rounded-full bg-[#f5c94a]/20 blur-3xl" />
                <div className="absolute bottom-[-40px] left-[-25px] h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative shrink-0 border-b border-white/10 px-5 py-5">
                <h1 className="text-[20px] font-extrabold tracking-tight text-[#f5d36a]">
                    Ebit's Catering
                </h1>
                <p className="mt-1 text-xs font-medium text-white/75">
                    Admin Workspace
                </p>
            </div>

            <nav className="relative flex-1 space-y-2 overflow-y-auto px-3 py-4">
                {navItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <NavLink
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-semibold transition-all duration-300 ${isActive
                                        ? "border-[#f5d36a] bg-[linear-gradient(135deg,#fff5d7_0%,#f1d57b_100%)] text-[#08382d] shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
                                        : "border-transparent text-white/95 hover:border-white/10 hover:bg-white/12 hover:text-white"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${isActive
                                                    ? "bg-[#08382d] text-[#f5d36a] shadow-[0_8px_18px_rgba(8,56,45,0.25)]"
                                                    : "bg-white/10 text-white group-hover:bg-white/20 group-hover:text-[#ffe28a]"
                                                }`}
                                        >
                                            <Icon size={17} strokeWidth={2.2} />
                                        </div>

                                        <span
                                            className={`flex-1 truncate font-semibold transition-colors duration-300 ${isActive
                                                    ? "text-[#08382d]"
                                                    : "text-white/95 group-hover:text-white"
                                                }`}
                                        >
                                            {item.label}
                                        </span>

                                        <ChevronRight
                                            size={15}
                                            className={`shrink-0 transition-all duration-300 ${isActive
                                                    ? "translate-x-0 text-[#08382d] opacity-100"
                                                    : "translate-x-[-2px] text-white/80 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
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
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dfe8e3] bg-white/95 text-[#0b4a3a] shadow-[0_10px_25px_rgba(15,77,60,0.14)] backdrop-blur lg:hidden"
            >
                <Menu size={18} />
            </button>

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
                            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
                        />

                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.25 }}
                            className="fixed left-0 top-0 z-[60] h-screen w-[80%] max-w-[280px]"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            >
                                <X size={16} />
                            </button>

                            {navContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminSidebar;