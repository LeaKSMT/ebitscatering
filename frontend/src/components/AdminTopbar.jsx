import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bell, ShieldCheck, Sparkles, Crown, Dot } from "lucide-react";

function AdminTopbar({ currentPath = "" }) {
    const adminUser =
        JSON.parse(localStorage.getItem("adminUser") || "null") || {
            name: "Admin User",
        };

    const pageTitles = {
        "/admin/dashboard": {
            title: "Admin Dashboard",
            subtitle: "Executive overview of bookings, revenue, payments, and day-to-day business performance.",
        },
        "/admin/inquiries": {
            title: "Inquiry Management",
            subtitle: "Review, organize, and respond to client concerns with a clean professional workflow.",
        },
        "/admin/financial-management": {
            title: "Financial Management",
            subtitle: "Track revenue, expenses, profitability, and overall financial health in one place.",
        },
        "/admin/quotations": {
            title: "Quotation Management",
            subtitle: "Manage quotation requests, pricing decisions, and client proposals efficiently.",
        },
        "/admin/event-management": {
            title: "Event Management",
            subtitle: "Coordinate event details, staff assignments, and operational readiness.",
        },
        "/admin/calendar": {
            title: "Event Calendar",
            subtitle: "View booking schedules, event timelines, and date-based planning across the system.",
        },
        "/admin/packages": {
            title: "Package Content",
            subtitle: "Manage package inclusions and keep your service offerings aligned with the public site.",
        },
        "/admin/pricing": {
            title: "Package Breakdown & Pricing",
            subtitle: "Control package rates, add-ons, and service pricing with clarity and consistency.",
        },
        "/admin/decorations": {
            title: "Decorations Management",
            subtitle: "Organize themes, styling options, and decorative service selections.",
        },
        "/admin/employees": {
            title: "Employee Management",
            subtitle: "Handle staff records, workforce visibility, and operational assignments.",
        },
        "/admin/payroll": {
            title: "Payroll Management",
            subtitle: "Review salaries, payroll details, and employee compensation records.",
        },
        "/admin/inventory": {
            title: "Inventory Management",
            subtitle: "Monitor supplies, equipment, and availability of operational resources.",
        },
        "/admin/payment-tracking": {
            title: "Payment Tracking",
            subtitle: "Monitor balances, payment progress, and financial completion across bookings.",
        },
        "/admin/clients": {
            title: "Client Profiles",
            subtitle: "Access client information, event history, and long-term customer records.",
        },
        "/admin/reports": {
            title: "Business Reports",
            subtitle: "Analyze performance, generate insights, and prepare downloadable management reports.",
        },
    };

    const current = pageTitles[currentPath] || {
        title: "Admin Dashboard",
        subtitle: "Executive overview of bookings, revenue, payments, and day-to-day business performance.",
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    return (
        <header className="sticky top-0 z-30 border-b border-white/60 bg-[rgba(248,251,250,0.72)] backdrop-blur-xl">
            <div className="px-3 pb-3 pt-16 sm:px-4 md:px-5 lg:px-7 lg:pb-4 lg:pt-5">
                <motion.div
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(11,74,58,0.96)_0%,rgba(15,93,73,0.96)_58%,rgba(18,122,93,0.95)_100%)] text-white shadow-[0_18px_45px_rgba(12,63,50,0.18)]"
                >
                    <div className="relative px-4 py-5 sm:px-5 md:px-6 lg:px-7 lg:py-6">
                        <motion.div
                            animate={{ x: ["-10%", "110%"] }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "linear",
                            }}
                            className="pointer-events-none absolute inset-y-0 left-[-30%] w-[28%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        />

                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f3d57a]/18 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/8 blur-2xl" />

                        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/85"
                                    >
                                        <Sparkles size={13} />
                                        Defense Ready Admin Panel
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.18 }}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#f8e4a1]/25 bg-[#f5c94a]/12 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.20em] text-[#fff0bf]"
                                    >
                                        <Crown size={13} />
                                        Premium UI
                                    </motion.div>
                                </div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.12 }}
                                    className="mt-4 text-[26px] font-extrabold tracking-tight text-white sm:text-[30px] lg:text-[34px]"
                                >
                                    {current.title}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-2 max-w-3xl text-sm leading-7 text-white/80 md:text-[15px]"
                                >
                                    {current.subtitle}
                                </motion.p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                <motion.div
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.22 }}
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    className="hidden md:flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                                        <Bell size={18} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                                            Status
                                        </p>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                                            <Dot size={18} className="text-[#86efac]" />
                                            System Active
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff3c8_0%,#f2cf63_100%)] text-[#8a6710] shadow-sm">
                                        <ShieldCheck size={21} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                            {greeting}
                                        </p>
                                        <p className="max-w-[190px] truncate text-sm font-bold text-white sm:max-w-[220px]">
                                            {adminUser.name}
                                        </p>
                                        <p className="text-xs text-white/65">Administrator Access</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </header>
    );
}

export default AdminTopbar;