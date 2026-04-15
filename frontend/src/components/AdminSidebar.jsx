import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";

function AdminSidebar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        navigate("/login");
    };

    return (
        <>
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-white/10 bg-[#0b4a3a] text-white">
                <div className="shrink-0 border-b border-white/10 px-5 py-7">
                    <h1 className="text-[24px] leading-tight font-extrabold text-[#d4af37]">
                        Ebit&apos;s Catering
                    </h1>
                    <p className="mt-1 text-sm text-white/80">Admin Panel</p>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-all duration-200 ${isActive
                                        ? "bg-[#1a5d49] text-[#f5c94a] shadow-[inset_3px_0_0_0_#d4af37]"
                                        : "text-white hover:bg-[#145340]"
                                    }`
                                }
                            >
                                <Icon size={19} className="shrink-0" />
                                <span className="leading-5">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="shrink-0 border-t border-white/10 px-4 pb-5 pt-3">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 font-bold text-[#0b4a3a] transition hover:bg-gray-100"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between bg-[#0b4a3a] px-6 py-5 text-white">
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
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminSidebar;