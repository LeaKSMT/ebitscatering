import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    MapPin,
    Users,
    Package,
    Wallet,
    Clock3,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    CalendarClock,
    ShieldCheck,
    CalendarRange,
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

function formatShortDate(dateStr) {
    if (!dateStr) return "Not specified";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
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
        createdAt: item.created_at || "",
    };
}

function getStatusClasses(status, isDark) {
    const normalized = String(status || "").toLowerCase();

    if (
        normalized === "approved" ||
        normalized === "confirmed" ||
        normalized === "paid"
    ) {
        return isDark
            ? "border border-emerald-400/20 bg-[rgba(21,90,60,0.34)] text-[#8df0bf]"
            : "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalized === "pending") {
        return isDark
            ? "border border-amber-400/20 bg-[rgba(125,95,28,0.3)] text-[#f5cf67]"
            : "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (
        normalized === "cancelled" ||
        normalized === "canceled" ||
        normalized === "rejected"
    ) {
        return isDark
            ? "border border-rose-400/20 bg-[rgba(120,34,55,0.28)] text-[#ff9bb0]"
            : "border-rose-200 bg-rose-50 text-rose-700";
    }

    return isDark
        ? "border border-[rgba(97,76,24,0.34)] bg-[rgba(97,76,24,0.3)] text-[#f5cf67]"
        : "border-[#e2c15c] bg-[#fff4cc] text-[#8a6b00]";
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.42, ease: "easeOut" },
    },
};

const staggerContainer = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export default function ClientCalendar() {
    const email = getCurrentClientEmail().toLowerCase().trim();
    const clientName = getCurrentClientName().toLowerCase().trim();
    const token = getStoredToken();

    const [theme, setTheme] = useState(
        () => localStorage.getItem("clientPortalTheme") || "light"
    );

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [selectedDate, setSelectedDate] = useState(null);

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
                    .sort((a, b) => {
                        const aTime = new Date(a.date || a.createdAt || 0).getTime();
                        const bTime = new Date(b.date || b.createdAt || 0).getTime();
                        return aTime - bTime;
                    });

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
    }, [email, clientName, token]);

    const isDark = theme === "dark";

    const mainCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.96)_0%,rgba(13,40,32,0.96)_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        : "border border-[#dce7e2] bg-white shadow-[0_16px_40px_rgba(14,61,47,0.07)]";

    const softCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(12,38,30,0.96)_0%,rgba(15,43,35,0.96)_100%)]"
        : "border border-[#e8efeb] bg-[#f8fbfa]";

    const outlineCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,42,34,0.98)_100%)]"
        : "border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)]";

    const emptyCard = isDark
        ? "border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(10,33,27,0.98)_0%,rgba(13,40,32,0.98)_100%)] text-white/70"
        : "border border-dashed border-[#d8e3de] bg-[#fbfdfc] text-slate-500";

    const titleColor = isDark ? "text-white" : "text-[#0d5c46]";
    const subtitleColor = isDark ? "text-white/72" : "text-slate-500";
    const bodyColor = isDark ? "text-white/82" : "text-slate-700";
    const softText = isDark ? "text-white/58" : "text-slate-500";

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

    const totalBookedDays = useMemo(() => Object.keys(bookingMap).length, [bookingMap]);

    const selectedDateKey = selectedDate ? toDateKey(selectedDate) : "";
    const selectedDateLabel = selectedDate
        ? selectedDate.toLocaleDateString("en-PH", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "No date selected";

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

    const StatCard = ({ icon: Icon, label, value, subtext }) => (
        <div className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur-md md:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        {label}
                    </p>
                    <p className="mt-3 text-2xl font-extrabold leading-none text-white md:text-3xl">
                        {value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/75 md:text-sm">
                        {subtext}
                    </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-7"
        >
            <motion.section
                variants={fadeUp}
                className="relative overflow-hidden rounded-[34px] border border-[#dbe6e1] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.08)]"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 right-[-20px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                    <div className="absolute bottom-[-30px] left-[-30px] h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0a5a43_0%,#0f6d51_55%,#138062_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                                <Sparkles size={14} />
                                Event Calendar
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
                                My Calendar
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                View your scheduled event dates, upcoming bookings, and
                                selected schedule details with a cleaner and more polished
                                calendar experience.
                            </p>
                        </div>

                        <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[520px] xl:grid-cols-3">
                            <StatCard
                                icon={CalendarClock}
                                label="Upcoming Events"
                                value={loading ? "..." : upcomingBookings.length}
                                subtext="Your next confirmed or pending schedules."
                            />

                            <StatCard
                                icon={CheckCircle2}
                                label="Booked Days"
                                value={loading ? "..." : totalBookedDays}
                                subtext="Total dates already marked on your calendar."
                            />

                            <StatCard
                                icon={CalendarRange}
                                label="Selected Date"
                                value={selectedDate ? selectedDate.getDate() : "--"}
                                subtext={
                                    selectedDate
                                        ? selectedDate.toLocaleDateString("en-PH", {
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "Choose a calendar day"
                                }
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            {error ? (
                <motion.div
                    variants={fadeUp}
                    className={`rounded-[30px] p-6 ${outlineCard}`}
                >
                    <h3 className="text-xl font-extrabold text-red-400">
                        Failed to load calendar
                    </h3>
                    <p className={`mt-2 text-sm ${subtitleColor}`}>{error}</p>
                </motion.div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
                <motion.section
                    variants={fadeUp}
                    className={`overflow-hidden rounded-[34px] ${mainCard}`}
                >
                    <div className="border-b border-white/10 bg-[linear-gradient(135deg,#0f5e48_0%,#0b4d3c_100%)] px-4 py-5 text-white md:px-6">
                        <div className="flex items-center justify-between gap-3">
                            <motion.button
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </motion.button>

                            <h2 className="text-center text-lg font-extrabold md:text-3xl">
                                {monthLabel}
                            </h2>

                            <motion.button
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
                            >
                                Next
                                <ChevronRight size={16} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        <div className={`mb-5 grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] md:gap-3 md:text-sm ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        {loading ? (
                            <div className={`rounded-[24px] px-4 py-12 text-center ${emptyCard}`}>
                                Loading calendar bookings...
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2 md:gap-3">
                                {calendarDays.map((date, index) => {
                                    if (!date) {
                                        return (
                                            <div
                                                key={index}
                                                className="h-16 rounded-[22px] bg-transparent sm:h-20 md:h-24"
                                            />
                                        );
                                    }

                                    const booked = isBooked(date);
                                    const todayMatch = isToday(date);
                                    const selected =
                                        selectedDate &&
                                        toDateKey(date) === toDateKey(selectedDate);

                                    return (
                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={index}
                                            onClick={() => setSelectedDate(date)}
                                            className={`relative h-16 rounded-[22px] border text-sm font-bold transition sm:h-20 md:h-24 md:text-lg ${selected
                                                    ? isDark
                                                        ? "border-[#98efcc] bg-[linear-gradient(180deg,rgba(16,61,49,0.98)_0%,rgba(20,73,58,0.98)_100%)] text-[#98efcc] ring-2 ring-[#98efcc]/15 shadow-[0_12px_24px_rgba(0,0,0,0.22)]"
                                                        : "border-[#0d5c46] bg-[linear-gradient(180deg,#f3fbf8_0%,#eaf7f1_100%)] text-[#0d5c46] ring-2 ring-[#0d5c46]/15 shadow-[0_12px_24px_rgba(13,92,70,0.12)]"
                                                    : booked
                                                        ? isDark
                                                            ? "border-[rgba(97,76,24,0.34)] bg-[linear-gradient(180deg,rgba(88,67,20,0.34)_0%,rgba(120,91,27,0.26)_100%)] text-[#f5cf67] shadow-sm"
                                                            : "border-[#e5c96b] bg-[linear-gradient(180deg,#fff8e3_0%,#fff1c4_100%)] text-[#8a6b00] shadow-sm"
                                                        : todayMatch
                                                            ? isDark
                                                                ? "border-[#5dc6a0]/40 bg-[linear-gradient(180deg,rgba(16,54,44,0.98)_0%,rgba(18,62,49,0.98)_100%)] text-[#98efcc]"
                                                                : "border-[#89d2ba] bg-[linear-gradient(180deg,#f2fbf8_0%,#eaf7f1_100%)] text-[#0d5c46]"
                                                            : isDark
                                                                ? "border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(14,42,34,0.98)_100%)] text-white/82 hover:border-white/20"
                                                                : "border-[#edf2ef] bg-[#f8faf9] text-[#143c2f] hover:border-[#d5e2dc] hover:bg-white"
                                                }`}
                                        >
                                            <span>{date.getDate()}</span>

                                            {todayMatch && !selected && (
                                                <span className={`absolute left-2 top-2 h-2.5 w-2.5 rounded-full ${isDark ? "bg-[#98efcc]" : "bg-[#0d5c46]"}`} />
                                            )}

                                            {booked && !selected && (
                                                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#d4af37]" />
                                            )}

                                            {selected && (
                                                <span className={`absolute bottom-2 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full ${isDark ? "bg-[#98efcc]/90" : "bg-[#0d5c46]/80"}`} />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        <div className={`mt-6 flex flex-wrap items-center justify-center gap-4 text-sm md:gap-6 ${isDark ? "text-white/72" : "text-slate-600"}`}>
                            <div className="flex items-center gap-2">
                                <span className={`h-4 w-4 rounded border ${isDark ? "border-[rgba(97,76,24,0.34)] bg-[rgba(97,76,24,0.3)]" : "border-[#e5c96b] bg-[#fff4cc]"}`} />
                                Booked
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`h-4 w-4 rounded border ${isDark ? "border-[#5dc6a0]/40 bg-[rgba(21,90,60,0.24)]" : "border-[#89d2ba] bg-[#eef9f5]"}`} />
                                Today
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`h-4 w-4 rounded border-2 ${isDark ? "border-[#98efcc] bg-[rgba(16,61,49,0.98)]" : "border-[#0d5c46] bg-white"}`} />
                                Selected
                            </div>
                        </div>

                        <div className={`mt-6 rounded-[26px] p-4 md:p-5 ${outlineCard}`}>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-[#98efcc]/70" : "text-[#0d5c46]/70"}`}>
                                        Selected Date
                                    </p>
                                    <h3 className={`mt-1 text-lg font-extrabold md:text-2xl ${titleColor}`}>
                                        {selectedDateLabel}
                                    </h3>
                                    <p className={`mt-1 text-sm ${subtitleColor}`}>
                                        {selectedDate
                                            ? `${selectedBookings.length} booking${selectedBookings.length === 1 ? "" : "s"
                                            } found on this day.`
                                            : "Choose a date from the calendar to view its details."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className={`min-w-[120px] rounded-[20px] px-4 py-3 ${softCard}`}>
                                        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${softText}`}>
                                            Date Key
                                        </p>
                                        <p className={`mt-1 text-sm font-bold ${titleColor}`}>
                                            {selectedDateKey || "--"}
                                        </p>
                                    </div>

                                    <div className={`min-w-[120px] rounded-[20px] px-4 py-3 ${softCard}`}>
                                        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${softText}`}>
                                            Status
                                        </p>
                                        <p className={`mt-1 text-sm font-bold ${titleColor}`}>
                                            {selectedBookings.length > 0
                                                ? "Booked Day"
                                                : "No Booking"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="space-y-6">
                    <motion.section
                        variants={fadeUp}
                        className={`overflow-hidden rounded-[34px] ${mainCard}`}
                    >
                        <div className="bg-[linear-gradient(135deg,#1aa26f_0%,#22b47d_100%)] px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                                    <CalendarClock size={22} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold">
                                        Upcoming Events
                                    </h3>
                                    <p className="mt-1 text-sm text-white/90">
                                        Quickly view your upcoming confirmed bookings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            {loading ? (
                                <div className={`rounded-[22px] px-4 py-6 text-center ${emptyCard}`}>
                                    Loading upcoming bookings...
                                </div>
                            ) : upcomingBookings.length === 0 ? (
                                <div className={`rounded-[22px] px-4 py-6 text-center ${emptyCard}`}>
                                    No upcoming bookings found.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingBookings.map((booking, index) => (
                                        <motion.button
                                            whileHover={{ y: -3, scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            key={booking.id || `${booking.date}-${index}`}
                                            onClick={() => handleSelectUpcoming(booking.date)}
                                            className={`w-full rounded-[24px] p-4 text-left transition hover:shadow-md ${isDark
                                                    ? "border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(14,42,34,0.98)_100%)] hover:border-[#22b47d]/40"
                                                    : "border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] shadow-sm hover:border-[#22b47d]/40"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className={`truncate text-base font-bold ${titleColor}`}>
                                                        {booking.eventType || "Event Booking"}
                                                    </h4>
                                                    <p className={`mt-1 text-sm ${subtitleColor}`}>
                                                        {formatDate(booking.date)}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                        booking.status,
                                                        isDark
                                                    )}`}
                                                >
                                                    {booking.status || "Booked"}
                                                </span>
                                            </div>

                                            <div className={`mt-4 grid gap-2 text-sm ${bodyColor}`}>
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
                                                <p className={`pt-1 font-bold ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                    {formatCurrency(booking.totalAmount)}
                                                </p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>

                    <motion.section
                        variants={fadeUp}
                        className={`overflow-hidden rounded-[34px] ${mainCard}`}
                    >
                        <div className="bg-[linear-gradient(135deg,#0f5e48_0%,#0b4d3c_100%)] px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold">
                                        Booking Details
                                    </h3>
                                    <p className="mt-1 text-sm text-white/80">
                                        Focused details for your selected schedule.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            {!selectedDate ? (
                                <div className={`rounded-[22px] px-4 py-6 text-center ${emptyCard}`}>
                                    Select a date or choose an upcoming event to view booking details.
                                </div>
                            ) : selectedBookings.length === 0 ? (
                                <div className={`rounded-[22px] px-4 py-6 text-center ${emptyCard}`}>
                                    No booking found on {formatDate(toDateKey(selectedDate))}.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {selectedBookings.map((booking, index) => (
                                            <motion.div
                                                key={booking.id || `${booking.date}-${index}`}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                className={`rounded-[26px] p-5 ${outlineCard}`}
                                            >
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <h4 className={`text-lg font-bold ${titleColor}`}>
                                                                {booking.eventType || "Event Booking"}
                                                            </h4>
                                                            <p className={`mt-1 text-sm ${subtitleColor}`}>
                                                                {formatShortDate(booking.date)} •{" "}
                                                                {formatTime(booking.time)}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`inline-flex items-center self-start rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                                booking.status,
                                                                isDark
                                                            )}`}
                                                        >
                                                            {booking.status || "Booked"}
                                                        </span>
                                                    </div>

                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <div className={`rounded-[22px] p-4 ${softCard}`}>
                                                            <div className={`flex items-center gap-2 ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                                <CalendarDays size={16} />
                                                                <span className="text-sm font-semibold">
                                                                    Event Date
                                                                </span>
                                                            </div>
                                                            <p className={`mt-2 text-sm ${bodyColor}`}>
                                                                {formatDate(booking.date)}
                                                            </p>
                                                        </div>

                                                        <div className={`rounded-[22px] p-4 ${softCard}`}>
                                                            <div className={`flex items-center gap-2 ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                                <Clock3 size={16} />
                                                                <span className="text-sm font-semibold">
                                                                    Event Time
                                                                </span>
                                                            </div>
                                                            <p className={`mt-2 text-sm ${bodyColor}`}>
                                                                {formatTime(booking.time)}
                                                            </p>
                                                        </div>

                                                        <div className={`rounded-[22px] p-4 ${softCard}`}>
                                                            <div className={`flex items-center gap-2 ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                                <MapPin size={16} />
                                                                <span className="text-sm font-semibold">
                                                                    Venue
                                                                </span>
                                                            </div>
                                                            <p className={`mt-2 text-sm ${bodyColor}`}>
                                                                {booking.venue || "Not specified"}
                                                            </p>
                                                        </div>

                                                        <div className={`rounded-[22px] p-4 ${softCard}`}>
                                                            <div className={`flex items-center gap-2 ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                                <Users size={16} />
                                                                <span className="text-sm font-semibold">
                                                                    Guests
                                                                </span>
                                                            </div>
                                                            <p className={`mt-2 text-sm ${bodyColor}`}>
                                                                {booking.guests || 0}
                                                            </p>
                                                        </div>

                                                        <div className={`rounded-[22px] p-4 ${softCard}`}>
                                                            <div className={`flex items-center gap-2 ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                                <Package size={16} />
                                                                <span className="text-sm font-semibold">
                                                                    Package
                                                                </span>
                                                            </div>
                                                            <p className={`mt-2 text-sm ${bodyColor}`}>
                                                                {booking.packageName || "Not specified"}
                                                            </p>
                                                        </div>

                                                        <div className={`rounded-[22px] p-4 ${softCard}`}>
                                                            <div className={`flex items-center gap-2 ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                                <Wallet size={16} />
                                                                <span className="text-sm font-semibold">
                                                                    Total Amount
                                                                </span>
                                                            </div>
                                                            <p className={`mt-2 text-sm font-bold ${isDark ? "text-[#98efcc]" : "text-[#0d5c46]"}`}>
                                                                {formatCurrency(booking.totalAmount)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {booking.classicMenu ? (
                                                        <div className={`rounded-[22px] p-4 text-sm ${outlineCard}`}>
                                                            <p className={`font-semibold ${titleColor}`}>
                                                                Classic Menu / Notes
                                                            </p>
                                                            <p className={`mt-2 leading-6 ${bodyColor}`}>
                                                                {booking.classicMenu}
                                                            </p>
                                                        </div>
                                                    ) : null}

                                                    <div
                                                        className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${isDark
                                                                ? "bg-[rgba(21,90,60,0.3)] text-[#98efcc]"
                                                                : "bg-[#eef9f5] text-[#0d5c46]"
                                                            }`}
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Keep monitoring this booking for updates
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </motion.section>
                </div>
            </div>
        </motion.div>
    );
}