import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CalendarDays,
    MapPin,
    Users,
    Package,
    Receipt,
    Clock3,
    CircleCheckBig,
    ClipboardList,
    Sparkles,
    Wallet,
    ArrowRight,
    BadgeCheck,
    ShieldCheck,
    PartyPopper,
    CalendarClock,
} from "lucide-react";

function getClientUser() {
    try {
        return (
            JSON.parse(localStorage.getItem("clientUser")) ||
            JSON.parse(localStorage.getItem("user")) ||
            {}
        );
    } catch {
        return {};
    }
}

function getCurrentClientEmail() {
    const user = getClientUser();
    return (
        localStorage.getItem("currentClientEmail") ||
        localStorage.getItem("clientEmail") ||
        user?.email ||
        ""
    );
}

function getCurrentClientName() {
    const user = getClientUser();
    return (
        localStorage.getItem("currentClientName") ||
        localStorage.getItem("clientName") ||
        user?.name ||
        ""
    );
}

function getStoredToken() {
    return (
        localStorage.getItem("clientToken") ||
        localStorage.getItem("token") ||
        ""
    );
}

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

function formatDate(dateStr) {
    if (!dateStr) return "Not specified";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatTime(timeStr) {
    if (!timeStr) return "Not specified";

    const parsed = new Date(`2000-01-01T${timeStr}`);
    if (Number.isNaN(parsed.getTime())) return timeStr;

    return parsed.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
    });
}

function normalizeBooking(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        bookingId: item.id,
        email: item.client_email || "",
        clientName: item.client_name || "",
        date: item.event_date || "",
        time: item.event_time || "",
        venue: item.venue || "",
        guests: Number(item.guests || 0),
        packageName: item.package_name || "",
        classicMenu: item.notes || "",
        totalAmount: Number(item.total_price || 0),
        status: item.booking_status || "Pending",
        eventType: item.event_type || "Event Booking",
        createdAt: item.created_at || "",
    };
}

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (!envUrl) {
        console.warn("VITE_API_URL is missing. Using Railway fallback.");
        return "https://ebitscatering-production.up.railway.app/api";
    }

    const cleaned = envUrl.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

function getStatusClasses(status, isDark) {
    const normalized = String(status || "").toLowerCase();

    if (
        normalized === "approved" ||
        normalized === "confirmed" ||
        normalized === "paid"
    ) {
        return isDark
            ? "bg-[rgba(21,90,60,0.34)] text-[#8df0bf] border border-emerald-400/20"
            : "bg-green-50 text-green-700 border-green-200";
    }

    if (normalized === "pending") {
        return isDark
            ? "bg-[rgba(125,95,28,0.3)] text-[#f5cf67] border border-amber-400/20"
            : "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    if (
        normalized === "rejected" ||
        normalized === "cancelled" ||
        normalized === "canceled"
    ) {
        return isDark
            ? "bg-[rgba(120,34,55,0.28)] text-[#ff9bb0] border border-rose-400/20"
            : "bg-red-50 text-red-700 border-red-200";
    }

    if (normalized === "ongoing" || normalized === "upcoming") {
        return isDark
            ? "bg-[rgba(34,74,120,0.28)] text-[#90c6ff] border border-blue-400/20"
            : "bg-blue-50 text-blue-700 border-blue-200";
    }

    return isDark
        ? "bg-white/10 text-white/80 border border-white/10"
        : "bg-gray-50 text-gray-700 border-gray-200";
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

const API_BASE_URL = getApiBaseUrl();

export default function ClientBookings() {
    const email = getCurrentClientEmail().toLowerCase().trim();
    const clientName = getCurrentClientName().toLowerCase().trim();
    const token = getStoredToken();

    const [theme, setTheme] = useState(
        () => localStorage.getItem("clientPortalTheme") || "light"
    );

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const syncTheme = () => {
            setTheme(localStorage.getItem("clientPortalTheme") || "light");
        };

        window.addEventListener("storage", syncTheme);
        window.addEventListener("client-theme-change", syncTheme);

        return () => {
            window.removeEventListener("storage", syncTheme);
            window.removeEventListener("client-theme-change", syncTheme);
        };
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API_BASE_URL}/bookings`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json().catch(() => []);

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to fetch bookings.");
                }

                const normalized = Array.isArray(data)
                    ? data.map(normalizeBooking).filter(Boolean)
                    : [];

                const filtered = normalized.filter((item) => {
                    const itemEmail = String(item.email || "").toLowerCase().trim();
                    const itemName = String(item.clientName || "").toLowerCase().trim();

                    return (
                        (email && itemEmail === email) ||
                        (clientName && itemName === clientName)
                    );
                });

                filtered.sort((a, b) => {
                    const first = new Date(a.date || a.createdAt || 0).getTime();
                    const second = new Date(b.date || b.createdAt || 0).getTime();
                    return first - second;
                });

                setBookings(filtered);
            } catch (err) {
                console.error("Fetch bookings error:", err);
                setError(err.message || "Failed to load bookings.");
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        if (!email && !clientName) {
            setBookings([]);
            setLoading(false);
            setError("No client session found.");
            return;
        }

        fetchBookings();
    }, [email, clientName, token]);

    const isDark = theme === "dark";

    const statCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.96)_0%,rgba(13,40,32,0.96)_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        : "border border-[#e3ebe7] bg-white shadow-sm";

    const detailCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(12,38,30,0.96)_0%,rgba(15,43,35,0.96)_100%)]"
        : "border border-[#e3ebe7] bg-[#f8fbfa]";

    const outlineCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,42,34,0.98)_100%)]"
        : "border border-[#e3ebe7] bg-white";

    const titleColor = isDark ? "text-white" : "text-[#0d5c46]";
    const subtitleColor = isDark ? "text-white/72" : "text-slate-500";
    const bodyColor = isDark ? "text-white/80" : "text-slate-600";
    const strongText = isDark ? "text-white/95" : "text-slate-700";

    const summary = useMemo(() => {
        const total = bookings.length;
        const confirmed = bookings.filter((item) =>
            ["approved", "confirmed", "paid"].includes(
                String(item.status || "").toLowerCase()
            )
        ).length;
        const pending = bookings.filter(
            (item) => String(item.status || "").toLowerCase() === "pending"
        ).length;
        const totalSpent = bookings.reduce(
            (sum, item) => sum + Number(item.totalAmount || 0),
            0
        );

        return { total, confirmed, pending, totalSpent };
    }, [bookings]);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-6"
        >
            <motion.div
                variants={fadeUp}
                className="portal-card-premium relative overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 right-[-30px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                    <div className="absolute bottom-[-45px] left-[-30px] h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#073c2e_0%,#0b5641_28%,#0f6d51_58%,#14906b_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="absolute inset-0 opacity-[0.08]">
                        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:44px_44px]" />
                    </div>

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={14} />
                                Booking Overview
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
                                My Bookings
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                View your confirmed, approved, and pending event bookings
                                with a cleaner, more premium, and more elegant presentation.
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur">
                                    <ShieldCheck size={16} className="text-[#f5c94a]" />
                                    Premium booking records and event tracking
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-4 py-2.5 text-sm font-semibold text-white/80">
                                    <PartyPopper size={15} className="text-[#f5c94a]" />
                                    Organized for smoother client review
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/client/quotation"
                            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#d4af37_0%,#f0cb58_100%)] px-5 py-3 text-sm font-bold text-[#143c2f] shadow-[0_12px_24px_rgba(212,175,55,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(212,175,55,0.35)]"
                        >
                            <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
                            <span className="relative">New Booking Request</span>
                            <ArrowRight
                                size={16}
                                className="relative transition group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 md:px-8">
                    <div className={`portal-panel-hover rounded-[28px] p-5 ${statCard}`}>
                        <p className={`text-sm font-medium ${subtitleColor}`}>Total Bookings</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#98efcc]">
                            {summary.total}
                        </h2>
                    </div>

                    <div className={`portal-panel-hover rounded-[28px] p-5 ${statCard}`}>
                        <p className={`text-sm font-medium ${subtitleColor}`}>Confirmed</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#8df0bf]">
                            {summary.confirmed}
                        </h2>
                    </div>

                    <div className={`portal-panel-hover rounded-[28px] p-5 ${statCard}`}>
                        <p className={`text-sm font-medium ${subtitleColor}`}>Pending</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#f5cf67]">
                            {summary.pending}
                        </h2>
                    </div>

                    <div className={`portal-panel-hover rounded-[28px] p-5 ${statCard}`}>
                        <p className={`text-sm font-medium ${subtitleColor}`}>Estimated Total</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#98efcc]">
                            {formatCurrency(summary.totalSpent)}
                        </h2>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <motion.div
                    variants={fadeUp}
                    className="portal-card-premium px-6 py-14 text-center"
                >
                    <h2 className={`text-2xl font-extrabold ${titleColor}`}>
                        Loading bookings...
                    </h2>
                </motion.div>
            ) : error ? (
                <motion.div
                    variants={fadeUp}
                    className={`rounded-[32px] px-6 py-14 text-center ${outlineCard}`}
                >
                    <h2 className="text-2xl font-extrabold text-red-400">
                        Failed to load bookings
                    </h2>
                    <p className={`mt-3 ${subtitleColor}`}>{error}</p>
                </motion.div>
            ) : bookings.length === 0 ? (
                <motion.div
                    variants={fadeUp}
                    className="portal-card-premium px-6 py-14 text-center"
                >
                    <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark
                            ? "bg-[linear-gradient(135deg,rgba(21,64,50,0.95)_0%,rgba(24,77,60,0.95)_100%)] text-[#98efcc]"
                            : "bg-[#eef9f5] text-[#0d5c46]"
                            }`}
                    >
                        <ClipboardList size={28} />
                    </div>

                    <h2 className={`mt-5 text-3xl font-extrabold tracking-tight ${titleColor}`}>
                        No bookings yet
                    </h2>
                    <p className={`mx-auto mt-3 max-w-xl ${subtitleColor}`}>
                        You do not have any booking records yet. Your booking will appear
                        here once your quotation is approved or confirmed by the admin.
                    </p>

                    <Link
                        to="/client/quotation"
                        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#d4af37] px-6 py-3 text-sm font-bold text-[#143c2f] transition hover:bg-[#caa22c]"
                    >
                        Create New Quotation
                    </Link>
                </motion.div>
            ) : (
                <div className="grid gap-5">
                    {bookings.map((booking, index) => (
                        <motion.div
                            key={booking.id || index}
                            variants={fadeUp}
                            whileHover={{ y: -5, scale: 1.005 }}
                            className="portal-card-premium p-6 transition"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className={`text-2xl font-extrabold tracking-tight ${titleColor}`}>
                                            {booking.eventType || "Event Booking"}
                                        </h2>

                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                booking.status,
                                                isDark
                                            )}`}
                                        >
                                            {booking.status || "Pending"}
                                        </span>
                                    </div>

                                    <p className={`mt-2 text-sm ${subtitleColor}`}>
                                        Booking ID:{" "}
                                        <span className={`font-semibold ${strongText}`}>
                                            {booking.bookingId || booking.id}
                                        </span>
                                    </p>
                                </div>

                                <div
                                    className={`px-5 py-4 text-left lg:min-w-[240px] rounded-[26px] ${isDark
                                        ? "border border-[rgba(97,76,24,0.34)] bg-[linear-gradient(135deg,rgba(88,67,20,0.3)_0%,rgba(120,91,27,0.24)_100%)] shadow-[0_10px_22px_rgba(0,0,0,0.18)]"
                                        : "bg-[linear-gradient(135deg,#fffaf0_0%,#fff3d0_100%)] shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 text-[#f5cf67]">
                                        <Wallet size={18} />
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                                            Total Amount
                                        </p>
                                    </div>
                                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#98efcc]">
                                        {formatCurrency(booking.totalAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className={`rounded-[26px] p-4 ${detailCard}`}>
                                    <div className="flex items-center gap-2 text-[#98efcc]">
                                        <CalendarDays size={18} />
                                        <span className="text-sm font-bold">Date</span>
                                    </div>
                                    <p className={`mt-2 text-sm ${bodyColor}`}>
                                        {formatDate(booking.date)}
                                    </p>
                                </div>

                                <div className={`rounded-[26px] p-4 ${detailCard}`}>
                                    <div className="flex items-center gap-2 text-[#98efcc]">
                                        <Clock3 size={18} />
                                        <span className="text-sm font-bold">Time</span>
                                    </div>
                                    <p className={`mt-2 text-sm ${bodyColor}`}>
                                        {formatTime(booking.time)}
                                    </p>
                                </div>

                                <div className={`rounded-[26px] p-4 ${detailCard}`}>
                                    <div className="flex items-center gap-2 text-[#98efcc]">
                                        <MapPin size={18} />
                                        <span className="text-sm font-bold">Venue</span>
                                    </div>
                                    <p className={`mt-2 text-sm ${bodyColor}`}>
                                        {booking.venue || "Not specified"}
                                    </p>
                                </div>

                                <div className={`rounded-[26px] p-4 ${detailCard}`}>
                                    <div className="flex items-center gap-2 text-[#98efcc]">
                                        <Users size={18} />
                                        <span className="text-sm font-bold">Guests</span>
                                    </div>
                                    <p className={`mt-2 text-sm ${bodyColor}`}>
                                        {booking.guests || 0} pax
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className={`rounded-[26px] p-4 ${outlineCard}`}>
                                    <div className="flex items-center gap-2 text-[#98efcc]">
                                        <Package size={18} />
                                        <span className="text-sm font-bold">Package</span>
                                    </div>
                                    <p className={`mt-2 text-sm ${bodyColor}`}>
                                        {booking.packageName || "Not specified"}
                                    </p>
                                </div>

                                <div className={`rounded-[26px] p-4 ${outlineCard}`}>
                                    <div className="flex items-center gap-2 text-[#98efcc]">
                                        <Receipt size={18} />
                                        <span className="text-sm font-bold">Menu / Notes</span>
                                    </div>
                                    <p className={`mt-2 text-sm ${bodyColor}`}>
                                        {booking.classicMenu || "No menu details provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <Link
                                    to="/client/calendar"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-[#0d5c46] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b4f3d]"
                                >
                                    <CalendarClock size={16} />
                                    View in Calendar
                                </Link>

                                <span
                                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${isDark
                                        ? "bg-[rgba(21,90,60,0.3)] text-[#98efcc]"
                                        : "bg-[#eef9f5] text-[#0d5c46]"
                                        }`}
                                >
                                    <CircleCheckBig size={16} />
                                    Keep checking this page for booking updates
                                </span>

                                <span
                                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${isDark
                                        ? "bg-[rgba(97,76,24,0.34)] text-[#f5cf67]"
                                        : "bg-[#fff8e6] text-[#8f6a0f]"
                                        }`}
                                >
                                    <BadgeCheck size={16} />
                                    Premium record view
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}