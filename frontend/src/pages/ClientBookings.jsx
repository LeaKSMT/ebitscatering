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
    Trash2,
    Lock,
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
    return localStorage.getItem("clientToken") || localStorage.getItem("token") || "";
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
        console.warn("VITE_API_URL is missing. Using Render fallback.");
        return "https://ebitscatering.onrender.com/api";
    }

    const cleaned = envUrl.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

function getStatusClasses(status, isDark) {
    const normalized = String(status || "").toLowerCase();

    if (["approved", "confirmed", "paid"].includes(normalized)) {
        return isDark
            ? "bg-emerald-500/20 text-emerald-100 border-emerald-300/40"
            : "bg-emerald-100 text-emerald-800 border-emerald-300";
    }

    if (normalized === "pending") {
        return isDark
            ? "bg-amber-500/20 text-amber-100 border-amber-300/40"
            : "bg-amber-100 text-amber-800 border-amber-300";
    }

    if (["rejected", "cancelled", "canceled"].includes(normalized)) {
        return isDark
            ? "bg-rose-500/20 text-rose-100 border-rose-300/40"
            : "bg-rose-100 text-rose-800 border-rose-300";
    }

    return isDark
        ? "bg-white/10 text-white border-white/10"
        : "bg-slate-100 text-slate-800 border-slate-300";
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
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const isDark = theme === "dark";

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
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, clientName, token]);

    async function fetchBookings() {
        try {
            if (!email && !clientName) {
                setBookings([]);
                setLoading(false);
                setError("No client session found.");
                return;
            }

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
    }

    async function handleDeleteBooking(booking) {
        const normalizedStatus = String(booking.status || "").toLowerCase();

        if (normalizedStatus !== "pending") {
            alert("This booking cannot be deleted because it is already approved.");
            return;
        }

        const confirmed = window.confirm(
            `Delete this booking?\n\n${booking.eventType || "Event Booking"} - Booking ID: ${booking.bookingId || booking.id
            }`
        );

        if (!confirmed) return;

        try {
            setDeletingId(booking.id);

            const res = await fetch(`${API_BASE_URL}/bookings/${booking.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Failed to delete booking.");
            }

            setBookings((prev) => prev.filter((item) => item.id !== booking.id));
        } catch (err) {
            console.error("Delete booking error:", err);
            alert(err.message || "Failed to delete booking.");
        } finally {
            setDeletingId(null);
        }
    }

    const statCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.96)_0%,rgba(13,40,32,0.96)_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        : "border border-[#d8e4df] bg-white shadow-sm";

    const detailCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(12,38,30,0.96)_0%,rgba(15,43,35,0.96)_100%)]"
        : "border border-[#cfded8] bg-[#fbfdfc] shadow-sm";

    const outlineCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,42,34,0.98)_100%)]"
        : "border border-[#cfded8] bg-white shadow-sm";

    const titleColor = isDark ? "text-white" : "text-[#063f30]";
    const subtitleColor = isDark ? "text-white/85" : "text-slate-700";
    const bodyColor = isDark ? "text-white/90" : "text-slate-900";
    const labelColor = isDark ? "text-[#a7f3d0]" : "text-[#047857]";
    const strongText = isDark ? "text-white" : "text-slate-950";

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
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#073c2e_0%,#0b5641_28%,#0f6d51_58%,#14906b_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/90">
                                <Sparkles size={14} />
                                Booking Overview
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
                                My Bookings
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-white md:text-base">
                                View your confirmed, approved, and pending event bookings
                                with clearer details, readable records, and premium event tracking.
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur">
                                    <ShieldCheck size={16} className="text-[#f5c94a]" />
                                    Premium booking records and event tracking
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-4 py-2.5 text-sm font-bold text-white">
                                    <PartyPopper size={15} className="text-[#f5c94a]" />
                                    Organized for smoother client review
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/client/quotation"
                            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#d4af37_0%,#f0cb58_100%)] px-5 py-3 text-sm font-extrabold text-[#143c2f] shadow-[0_12px_24px_rgba(212,175,55,0.28)] transition duration-300 hover:-translate-y-0.5"
                        >
                            <span>New Booking Request</span>
                            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 md:px-8">
                    {[
                        ["Total Bookings", summary.total, "text-[#10b981]"],
                        ["Confirmed", summary.confirmed, "text-[#059669]"],
                        ["Pending", summary.pending, "text-[#d97706]"],
                        ["Estimated Total", formatCurrency(summary.totalSpent), "text-[#10b981]"],
                    ].map(([label, value, color]) => (
                        <div key={label} className={`portal-panel-hover rounded-[28px] p-5 ${statCard}`}>
                            <p className={`text-sm font-extrabold ${subtitleColor}`}>{label}</p>
                            <h2 className={`mt-2 text-3xl font-extrabold tracking-tight ${color}`}>
                                {value}
                            </h2>
                        </div>
                    ))}
                </div>
            </motion.div>

            {loading ? (
                <motion.div variants={fadeUp} className="portal-card-premium px-6 py-14 text-center">
                    <h2 className={`text-2xl font-extrabold ${titleColor}`}>Loading bookings...</h2>
                </motion.div>
            ) : error ? (
                <motion.div variants={fadeUp} className={`rounded-[32px] px-6 py-14 text-center ${outlineCard}`}>
                    <h2 className="text-2xl font-extrabold text-red-500">Failed to load bookings</h2>
                    <p className={`mt-3 font-semibold ${subtitleColor}`}>{error}</p>
                </motion.div>
            ) : bookings.length === 0 ? (
                <motion.div variants={fadeUp} className="portal-card-premium px-6 py-14 text-center">
                    <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-white/10 text-[#98efcc]" : "bg-[#eef9f5] text-[#0d5c46]"
                            }`}
                    >
                        <ClipboardList size={28} />
                    </div>

                    <h2 className={`mt-5 text-3xl font-extrabold tracking-tight ${titleColor}`}>
                        No bookings yet
                    </h2>

                    <p className={`mx-auto mt-3 max-w-xl font-semibold ${subtitleColor}`}>
                        Your booking records will appear here once your quotation is approved or confirmed.
                    </p>

                    <Link
                        to="/client/quotation"
                        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#d4af37] px-6 py-3 text-sm font-extrabold text-[#143c2f] transition hover:bg-[#caa22c]"
                    >
                        Create New Quotation
                    </Link>
                </motion.div>
            ) : (
                <div className="grid gap-5">
                    {bookings.map((booking, index) => {
                        const bookingStatus = String(booking.status || "pending").toLowerCase();
                        const canDeleteBooking = bookingStatus === "pending";

                        return (
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
                                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${getStatusClasses(
                                                    booking.status,
                                                    isDark
                                                )}`}
                                            >
                                                {booking.status || "Pending"}
                                            </span>
                                        </div>

                                        <p className={`mt-2 text-sm font-bold ${subtitleColor}`}>
                                            Booking ID:{" "}
                                            <span className={`font-extrabold ${strongText}`}>
                                                {booking.bookingId || booking.id}
                                            </span>
                                        </p>
                                    </div>

                                    <div
                                        className={`rounded-[26px] px-5 py-4 text-left lg:min-w-[240px] ${isDark
                                            ? "border border-[rgba(97,76,24,0.34)] bg-[linear-gradient(135deg,rgba(88,67,20,0.3)_0%,rgba(120,91,27,0.24)_100%)]"
                                            : "border border-[#fde68a] bg-[linear-gradient(135deg,#fffaf0_0%,#fff3d0_100%)] shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 text-[#b7791f]">
                                            <Wallet size={18} />
                                            <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
                                                Total Amount
                                            </p>
                                        </div>

                                        <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#047857]">
                                            {formatCurrency(booking.totalAmount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {[
                                        [CalendarDays, "Date", formatDate(booking.date)],
                                        [Clock3, "Time", formatTime(booking.time)],
                                        [MapPin, "Venue", booking.venue || "Not specified"],
                                        [Users, "Guests", `${booking.guests || 0} pax`],
                                    ].map(([Icon, label, value]) => (
                                        <div key={label} className={`rounded-[26px] p-4 ${detailCard}`}>
                                            <div className={`flex items-center gap-2 ${labelColor}`}>
                                                <Icon size={18} />
                                                <span className="text-sm font-extrabold">{label}</span>
                                            </div>
                                            <p className={`mt-2 text-sm font-bold leading-6 ${bodyColor}`}>
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className={`rounded-[26px] p-4 ${outlineCard}`}>
                                        <div className={`flex items-center gap-2 ${labelColor}`}>
                                            <Package size={18} />
                                            <span className="text-sm font-extrabold">Package</span>
                                        </div>
                                        <p className={`mt-2 text-sm font-bold leading-6 ${bodyColor}`}>
                                            {booking.packageName || "Not specified"}
                                        </p>
                                    </div>

                                    <div className={`rounded-[26px] p-4 ${outlineCard}`}>
                                        <div className={`flex items-center gap-2 ${labelColor}`}>
                                            <Receipt size={18} />
                                            <span className="text-sm font-extrabold">Menu / Notes</span>
                                        </div>
                                        <p className={`mt-2 text-sm font-bold leading-6 ${bodyColor}`}>
                                            {booking.classicMenu || "No menu details provided"}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}