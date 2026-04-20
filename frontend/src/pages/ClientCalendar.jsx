import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    CalendarDays,
    MapPin,
    Users,
    Package,
    Wallet,
    Clock3,
    Sparkles,
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
        localStorage.getItem("token") ||
        localStorage.getItem("clientToken") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("adminToken") ||
        ""
    );
}

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (!envUrl) {
        console.warn("VITE_API_URL is missing. Using localhost fallback.");
        return "http://localhost:5000/api";
    }

    const cleaned = envUrl.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

const API_BASE_URL = getApiBaseUrl();

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

function toDateKey(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeDateKey(value) {
    if (!value) return "";

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return toDateKey(date);
}

function normalizeBooking(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id || `booking_${Math.random().toString(36).slice(2, 9)}`,
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
    };
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

export default function ClientCalendar() {
    const email = getCurrentClientEmail().toLowerCase().trim();
    const clientName = getCurrentClientName().toLowerCase().trim();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const token = getStoredToken();

                if (!token) {
                    throw new Error("No token found. Please log in again.");
                }

                const res = await fetch(`${API_BASE_URL}/bookings`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json().catch(() => []);

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to fetch bookings.");
                }

                const normalized = Array.isArray(data)
                    ? data.map(normalizeBooking).filter(Boolean)
                    : [];

                const filtered = normalized
                    .filter((item) => {
                        const itemEmail = String(item.email || "").toLowerCase().trim();
                        const itemName = String(item.clientName || "")
                            .toLowerCase()
                            .trim();

                        return (
                            (email && itemEmail === email) ||
                            (clientName && itemName === clientName)
                        );
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                setBookings(filtered);
            } catch (err) {
                console.error("Fetch client calendar bookings error:", err);
                setError(err.message || "Failed to load calendar bookings.");
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
    }, [email, clientName]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) calendarDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(year, month, day));
    }

    const bookingMap = useMemo(() => {
        const map = {};

        bookings.forEach((booking) => {
            const key = normalizeDateKey(booking.date);
            if (!key) return;

            if (!map[key]) map[key] = [];
            map[key].push(booking);
        });

        return map;
    }, [bookings]);

    const selectedBookings = selectedDate
        ? bookingMap[toDateKey(selectedDate)] || []
        : [];

    const upcomingBookings = useMemo(() => {
        const nowKey = toDateKey(new Date());

        return bookings
            .filter((booking) => {
                const bookingDate = normalizeDateKey(booking.date);
                return bookingDate && bookingDate >= nowKey;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 6);
    }, [bookings]);

    const monthLabel = currentDate.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
    });

    const isToday = (date) => {
        if (!date) return false;
        return toDateKey(date) === toDateKey(new Date());
    };

    const isBooked = (date) => {
        if (!date) return false;
        return Boolean(bookingMap[toDateKey(date)]?.length);
    };

    const handleSelectUpcoming = (bookingDate) => {
        const parsed = new Date(bookingDate);
        if (Number.isNaN(parsed.getTime())) return;

        setCurrentDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
        setSelectedDate(parsed);
    };

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
                                Event Calendar
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
                                My Calendar
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                View your scheduled event dates, upcoming bookings,
                                and booking details in one premium calendar experience.
                            </p>
                        </div>

                        <div className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                Upcoming Events
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-white">
                                {loading ? "..." : upcomingBookings.length}
                            </p>
                            <p className="mt-1 text-sm text-white/75">
                                Active records found
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {error ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[28px] border border-red-200 bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                >
                    <h3 className="text-xl font-extrabold text-red-600">
                        Failed to load calendar
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{error}</p>
                </motion.div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
                <motion.div
                    variants={fadeUp}
                    className="overflow-hidden rounded-[32px] border border-[#dce7e2] bg-white shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                >
                    <div className="flex items-center justify-between bg-[#0d5c46] px-4 py-5 text-white md:px-6">
                        <button
                            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/15"
                        >
                            ‹ Previous
                        </button>

                        <h2 className="text-center text-xl font-extrabold md:text-3xl">
                            {monthLabel}
                        </h2>

                        <button
                            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/15"
                        >
                            Next ›
                        </button>
                    </div>

                    <div className="p-4 md:p-6">
                        <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-[#0d5c46] md:gap-3 md:text-sm">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        {loading ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-gray-500">
                                Loading calendar bookings...
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2 md:gap-3">
                                {calendarDays.map((date, index) => {
                                    if (!date) {
                                        return (
                                            <div
                                                key={index}
                                                className="h-16 rounded-2xl bg-transparent sm:h-20 md:h-24"
                                            />
                                        );
                                    }

                                    const booked = isBooked(date);
                                    const todayMatch = isToday(date);
                                    const selected =
                                        selectedDate &&
                                        toDateKey(date) === toDateKey(selectedDate);

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedDate(date)}
                                            className={`relative h-16 rounded-2xl border text-sm font-bold transition sm:h-20 md:h-24 md:text-lg ${selected
                                                ? "border-[#0d5c46] ring-2 ring-[#0d5c46] bg-[#eef9f5] text-[#0d5c46]"
                                                : booked
                                                    ? "border-[#d4af37] bg-[#fff4cc] text-[#8a6b00] shadow-sm"
                                                    : todayMatch
                                                        ? "border-[#0d5c46] bg-[#eef9f5] text-[#0d5c46]"
                                                        : "border-gray-100 bg-[#f6f7f9] text-[#143c2f]"
                                                }`}
                                        >
                                            <span>{date.getDate()}</span>

                                            {booked && !selected && (
                                                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#d4af37]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 md:gap-6">
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded bg-[#fff4cc] border border-[#d4af37]" />
                                Booked
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded bg-[#eef9f5] border border-[#0d5c46]" />
                                Today
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded bg-white border-2 border-[#0d5c46]" />
                                Selected
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-6">
                    <motion.div
                        variants={fadeUp}
                        className="overflow-hidden rounded-[32px] border border-[#dce7e2] bg-white shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                    >
                        <div className="bg-[linear-gradient(135deg,#1aa26f_0%,#22b47d_100%)] px-6 py-5 text-white">
                            <h3 className="text-2xl font-extrabold">Upcoming Events</h3>
                            <p className="mt-1 text-sm text-white/90">
                                Quickly view your upcoming confirmed bookings.
                            </p>
                        </div>

                        <div className="p-5">
                            {loading ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-gray-500">
                                    Loading upcoming bookings...
                                </div>
                            ) : upcomingBookings.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-gray-500">
                                    No upcoming bookings found.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingBookings.map((booking, index) => (
                                        <button
                                            key={booking.id || `${booking.date}-${index}`}
                                            onClick={() => handleSelectUpcoming(booking.date)}
                                            className="w-full rounded-[24px] border border-gray-200 bg-[#fafafa] p-4 text-left transition hover:border-[#22b47d] hover:shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="text-base font-bold text-[#0d5c46]">
                                                        {booking.eventType || "Event Booking"}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {formatDate(booking.date)}
                                                    </p>
                                                </div>

                                                <span className="inline-flex items-center rounded-full border border-[#e2c15c] bg-[#fff4cc] px-3 py-1 text-xs font-bold text-[#8a6b00]">
                                                    {booking.status || "Booked"}
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-1 text-sm text-gray-700">
                                                <p>
                                                    <span className="font-semibold">Venue:</span>{" "}
                                                    {booking.venue || "Not specified"}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">Guests:</span>{" "}
                                                    {booking.guests || 0}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">Package:</span>{" "}
                                                    {booking.packageName || "Not specified"}
                                                </p>
                                                <p className="pt-1 font-bold text-[#0d5c46]">
                                                    {formatCurrency(booking.totalAmount)}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="overflow-hidden rounded-[32px] border border-[#dce7e2] bg-white shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                    >
                        <div className="bg-[#0d5c46] px-6 py-5 text-white">
                            <h3 className="text-2xl font-extrabold">Booking Details</h3>
                        </div>

                        <div className="p-5">
                            {!selectedDate ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-gray-500">
                                    Select a date or choose an upcoming event to view booking details.
                                </div>
                            ) : selectedBookings.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-gray-500">
                                    No booking found on {formatDate(toDateKey(selectedDate))}.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedBookings.map((booking, index) => (
                                        <div
                                            key={booking.id || `${booking.date}-${index}`}
                                            className="rounded-[24px] border border-gray-200 bg-[#fafafa] p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className="text-lg font-bold text-[#0d5c46]">
                                                    {booking.eventType || "Event Booking"}
                                                </h4>

                                                <span className="inline-flex items-center rounded-full border border-[#e2c15c] bg-[#fff4cc] px-3 py-1 text-xs font-bold text-[#8a6b00]">
                                                    {booking.status || "Booked"}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-3 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays size={16} className="text-[#0d5c46]" />
                                                    <span>
                                                        <span className="font-semibold">Date:</span>{" "}
                                                        {formatDate(booking.date)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock3 size={16} className="text-[#0d5c46]" />
                                                    <span>
                                                        <span className="font-semibold">Time:</span>{" "}
                                                        {formatTime(booking.time)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-[#0d5c46]" />
                                                    <span>
                                                        <span className="font-semibold">Venue:</span>{" "}
                                                        {booking.venue || "Not specified"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-[#0d5c46]" />
                                                    <span>
                                                        <span className="font-semibold">Guests:</span>{" "}
                                                        {booking.guests || 0}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Package size={16} className="text-[#0d5c46]" />
                                                    <span>
                                                        <span className="font-semibold">Package:</span>{" "}
                                                        {booking.packageName || "Not specified"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Wallet size={16} className="text-[#0d5c46]" />
                                                    <span>
                                                        <span className="font-semibold">Total:</span>{" "}
                                                        {formatCurrency(booking.totalAmount)}
                                                    </span>
                                                </div>
                                            </div>

                                            {booking.classicMenu ? (
                                                <div className="mt-4 rounded-2xl border border-[#e3ebe7] bg-white p-4 text-sm text-slate-700">
                                                    <p className="font-semibold text-[#0d5c46]">
                                                        Classic Menu / Notes
                                                    </p>
                                                    <p className="mt-2 leading-6">
                                                        {booking.classicMenu}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}