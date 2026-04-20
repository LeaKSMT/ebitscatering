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

function getStatusClasses(status) {
    const normalized = String(status || "").toLowerCase();

    if (
        normalized === "approved" ||
        normalized === "confirmed" ||
        normalized === "paid"
    ) {
        return "bg-green-50 text-green-700 border-green-200";
    }

    if (normalized === "pending") {
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    if (
        normalized === "rejected" ||
        normalized === "cancelled" ||
        normalized === "canceled"
    ) {
        return "bg-red-50 text-red-700 border-red-200";
    }

    if (normalized === "ongoing" || normalized === "upcoming") {
        return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-gray-50 text-gray-700 border-gray-200";
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (!envUrl) {
        console.warn("VITE_API_URL is missing. Using Railway fallback.");
        return "https://ebitscatering-production.up.railway.app/api";
    }

    const cleaned = envUrl.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

const API_BASE_URL = getApiBaseUrl();

export default function ClientBookings() {
    const email = getCurrentClientEmail().toLowerCase().trim();
    const clientName = getCurrentClientName().toLowerCase().trim();
    const token = getStoredToken();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                className="relative overflow-hidden rounded-[32px] border border-[#dbe6e1] bg-white shadow-[0_14px_40px_rgba(14,61,47,0.08)]"
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-10 right-[-30px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_58%,#138062_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={14} />
                                Booking Overview
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
                                My Bookings
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                View your confirmed, approved, and pending event bookings
                                with a cleaner and more premium presentation.
                            </p>
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
                    <div className="rounded-[24px] border border-[#e3ebe7] bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total Bookings</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-[#0d5c46]">
                            {summary.total}
                        </h2>
                    </div>

                    <div className="rounded-[24px] border border-[#e3ebe7] bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Confirmed</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-green-600">
                            {summary.confirmed}
                        </h2>
                    </div>

                    <div className="rounded-[24px] border border-[#e3ebe7] bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Pending</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-yellow-600">
                            {summary.pending}
                        </h2>
                    </div>

                    <div className="rounded-[24px] border border-[#e3ebe7] bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Estimated Total</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-[#0d5c46]">
                            {formatCurrency(summary.totalSpent)}
                        </h2>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[32px] border border-[#dce7e2] bg-white px-6 py-14 text-center shadow-sm"
                >
                    <h2 className="text-2xl font-extrabold text-[#0d5c46]">
                        Loading bookings...
                    </h2>
                </motion.div>
            ) : error ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[32px] border border-red-200 bg-white px-6 py-14 text-center shadow-sm"
                >
                    <h2 className="text-2xl font-extrabold text-red-600">
                        Failed to load bookings
                    </h2>
                    <p className="mt-3 text-slate-500">{error}</p>
                </motion.div>
            ) : bookings.length === 0 ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[32px] border border-[#dce7e2] bg-white px-6 py-14 text-center shadow-sm"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef9f5] text-[#0d5c46]">
                        <ClipboardList size={28} />
                    </div>

                    <h2 className="mt-5 text-3xl font-extrabold text-[#0d5c46]">
                        No bookings yet
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-slate-500">
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
                            whileHover={{ y: -4 }}
                            className="rounded-[32px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)] transition"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-2xl font-extrabold text-[#0d5c46]">
                                            {booking.eventType || "Event Booking"}
                                        </h2>

                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                booking.status
                                            )}`}
                                        >
                                            {booking.status || "Pending"}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Booking ID:{" "}
                                        <span className="font-semibold text-slate-700">
                                            {booking.bookingId || booking.id}
                                        </span>
                                    </p>
                                </div>

                                <div className="rounded-[24px] bg-[linear-gradient(135deg,#fffaf0_0%,#fff3d0_100%)] px-5 py-4 text-left lg:min-w-[230px]">
                                    <div className="flex items-center gap-2 text-[#b99117]">
                                        <Wallet size={18} />
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                                            Total Amount
                                        </p>
                                    </div>
                                    <p className="mt-2 text-2xl font-extrabold text-[#0d5c46]">
                                        {formatCurrency(booking.totalAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-[24px] bg-[#f8fbfa] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <CalendarDays size={18} />
                                        <span className="text-sm font-bold">Date</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {formatDate(booking.date)}
                                    </p>
                                </div>

                                <div className="rounded-[24px] bg-[#f8fbfa] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <Clock3 size={18} />
                                        <span className="text-sm font-bold">Time</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {formatTime(booking.time)}
                                    </p>
                                </div>

                                <div className="rounded-[24px] bg-[#f8fbfa] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <MapPin size={18} />
                                        <span className="text-sm font-bold">Venue</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {booking.venue || "Not specified"}
                                    </p>
                                </div>

                                <div className="rounded-[24px] bg-[#f8fbfa] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <Users size={18} />
                                        <span className="text-sm font-bold">Guests</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {booking.guests || 0} pax
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-[24px] border border-[#e3ebe7] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <Package size={18} />
                                        <span className="text-sm font-bold">Package</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {booking.packageName || "Not specified"}
                                    </p>
                                </div>

                                <div className="rounded-[24px] border border-[#e3ebe7] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <Receipt size={18} />
                                        <span className="text-sm font-bold">Menu / Notes</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {booking.classicMenu || "No menu details provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <Link
                                    to="/client/calendar"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-[#0d5c46] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b4f3d]"
                                >
                                    <CalendarDays size={16} />
                                    View in Calendar
                                </Link>

                                <span className="inline-flex items-center gap-2 rounded-2xl bg-[#eef9f5] px-4 py-2.5 text-sm font-semibold text-[#0d5c46]">
                                    <CircleCheckBig size={16} />
                                    Keep checking this page for booking updates
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}