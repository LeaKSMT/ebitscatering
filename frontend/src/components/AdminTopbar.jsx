import { UserCircle2 } from "lucide-react";

function AdminTopbar({ currentPath = "" }) {
    const adminUser =
        JSON.parse(localStorage.getItem("adminUser") || "null") || {
            name: "Admin User",
        };

    const pageTitles = {
        "/admin/dashboard": {
            title: "Admin Dashboard",
            subtitle: "Manage your catering business",
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
        subtitle: "Manage your catering business",
    };

    return (
        <header className="bg-white border-b border-gray-200 px-5 md:px-7 py-5 flex items-center justify-between sticky top-0 z-30">
            <div>
                <h1 className="text-[20px] md:text-[22px] font-extrabold text-[#0f4d3c]">
                    {current.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{current.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[#0f4d3c] font-semibold shadow-sm">
                <UserCircle2 size={18} />
                <span>{adminUser.name}</span>
            </div>
        </header>
    );
}

export default AdminTopbar;