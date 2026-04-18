import { useMemo } from "react";
import { Bell, ShieldCheck, Sparkles } from "lucide-react";

function AdminTopbar({ currentPath = "" }) {
    const adminUser =
        JSON.parse(localStorage.getItem("adminUser") || "null") || {
            name: "Admin User",
        };

    const pageTitles = {
        "/admin/dashboard": {
            title: "Admin Dashboard",
            subtitle: "Executive overview of bookings, revenue, and operational performance",
        },
        "/admin/inquiries": {
            title: "Inquiry Management",
            subtitle: "Manage client inquiries and owner replies",
        },
        "/admin/financial-management": {
            title: "Financial Management",
            subtitle: "Track revenue, expenses, profit, and forecasting",
        },
        "/admin/quotations": {
            title: "Quotation Management",
            subtitle: "Review and manage client quotation requests",
        },
        "/admin/event-management": {
            title: "Event Management",
            subtitle: "Manage event details and staff assignments",
        },
        "/admin/calendar": {
            title: "Event Calendar",
            subtitle: "Manage bookings and view schedules across months",
        },
        "/admin/packages": {
            title: "Package Content",
            subtitle: "View package content aligned with your home page offers",
        },
        "/admin/pricing": {
            title: "Package Breakdown & Pricing",
            subtitle: "Manage pricing for all services and add-ons",
        },
        "/admin/decorations": {
            title: "Decorations Management",
            subtitle: "Manage decoration themes and options",
        },
        "/admin/employees": {
            title: "Employee Management",
            subtitle: "Manage your team and staff assignments",
        },
        "/admin/payroll": {
            title: "Payroll Management",
            subtitle: "Manage employee salaries and payroll",
        },
        "/admin/inventory": {
            title: "Inventory Management",
            subtitle: "Track equipment and supplies availability",
        },
        "/admin/payment-tracking": {
            title: "Payment Tracking",
            subtitle: "Monitor all bookings and payment status",
        },
        "/admin/clients": {
            title: "Client Profiles",
            subtitle: "View complete current and past client records",
        },
        "/admin/reports": {
            title: "Business Reports",
            subtitle: "Analytics, forecasting, and downloadable PDF reports",
        },
    };

    const current = pageTitles[currentPath] || {
        title: "Admin Dashboard",
        subtitle: "Executive overview of bookings, revenue, and operational performance",
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    return (
        <header className="sticky top-0 z-30 border-b border-[#dbe7e2] bg-white/85 backdrop-blur-md">
            <div className="flex flex-col gap-4 px-5 py-4 md:px-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#e7efe9] bg-[#f7fbf9] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f4d3c]/75">
                        <Sparkles size={13} />
                        Defense Ready Admin Panel
                    </div>

                    <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-[#0f4d3c] md:text-[28px]">
                        {current.title}
                    </h1>
                    <p className="mt-1 max-w-3xl text-sm text-slate-500 md:text-[15px]">
                        {current.subtitle}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-[#e2ebe6] bg-white px-4 py-3 text-[#0f4d3c] shadow-sm">
                        <Bell size={17} />
                        <span className="text-sm font-semibold">System Active</span>
                    </div>

                    <div className="flex items-center gap-3 rounded-[20px] border border-[#e2ebe6] bg-white px-4 py-3 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                            <ShieldCheck size={20} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                {greeting}
                            </p>
                            <p className="max-w-[180px] truncate text-sm font-bold text-[#0f4d3c]">
                                {adminUser.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default AdminTopbar;