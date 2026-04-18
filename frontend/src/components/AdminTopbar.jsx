import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bell, ShieldCheck, Sparkles } from "lucide-react";

function AdminTopbar({ currentPath = "" }) {
    const adminUser =
        JSON.parse(localStorage.getItem("adminUser") || "null") || {
            name: "Admin User",
        };

    const pageTitles = {
        "/admin/dashboard": {
            title: "Admin Dashboard",
            subtitle: "Executive overview of bookings, revenue, payments, and overall business performance.",
        },
        "/admin/inquiries": {
            title: "Inquiry Management",
            subtitle: "Review and manage client concerns with a clean and professional workflow.",
        },
        "/admin/financial-management": {
            title: "Financial Management",
            subtitle: "Track revenue, expenses, and overall financial health in one place.",
        },
        "/admin/quotations": {
            title: "Quotation Management",
            subtitle: "Manage client quotation requests, pricing, and proposal flow.",
        },
        "/admin/event-management": {
            title: "Event Management",
            subtitle: "Monitor event details, scheduling, and staff coordination.",
        },
        "/admin/calendar": {
            title: "Event Calendar",
            subtitle: "View schedules, bookings, and date-based planning clearly.",
        },
        "/admin/packages": {
            title: "Package Content",
            subtitle: "Manage package inclusions aligned with your service offerings.",
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
        subtitle: "Executive overview of bookings, revenue, payments, and overall business performance.",
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    return (
        <header className="sticky top-0 z-30 border-b border-white/60 bg-[rgba(248,251,250,0.72)] backdrop-blur-xl">
            <div className="px-3 pb-3 pt-14 sm:px-4 md:px-5 lg:px-6 lg:pb-4 lg:pt-4">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="overflow-hidden rounded-[24px] border border-white/70 bg-[linear-gradient(135deg,rgba(11,74,58,0.97)_0%,rgba(15,93,73,0.97)_58%,rgba(22,132,101,0.96)_100%)] text-white shadow-[0_18px_45px_rgba(12,63,50,0.18)]"
                >
                    <div className="relative px-4 py-4 sm:px-5 md:px-6 lg:px-7 lg:py-5">
                        <motion.div
                            animate={{ x: ["-20%", "120%"] }}
                            transition={{
                                duration: 5.5,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "linear",
                            }}
                            className="pointer-events-none absolute inset-y-0 left-[-35%] w-[30%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        />

                        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#f3d57a]/18 blur-3xl" />

                        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
                                    <Sparkles size={12} />
                                    Executive View
                                </div>

                                <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-white sm:text-[28px] lg:text-[30px]">
                                    {current.title}
                                </h1>

                                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/80">
                                    {current.subtitle}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
                                <motion.div
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    className="hidden md:flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
                                        <Bell size={17} />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                            Status
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold text-white">
                                            System Active
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
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