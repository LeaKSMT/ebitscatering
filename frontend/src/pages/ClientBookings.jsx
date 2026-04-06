import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    MapPin,
    Users,
    Package,
    Receipt,
    Clock3,
    CircleCheckBig,
    ClipboardList,
} from "lucide-react";

function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

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

function getScopedKey(baseKey, email) {
    return email ? `${baseKey}_${email}` : `${baseKey}_guest`;
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

function normalizeBooking(item) {
    if (!item || typeof item !== "object") return null;

    return {
        ...item,
        id:
            item.id ||
            item.bookingId ||
            item.quotationId ||
            `booking_${Math.random().toString(36).slice(2, 9)}`,
        email: item.email || item.clientEmail || item.userEmail || "",
        clientName: item.clientName || item.fullName || item.name || "",
        date: item.date || item.preferredDate || item.eventDate || "",
        time: item.time || item.eventTime || "",
        venue: item.venue || item.location || "",
        guests: Number(item.guests || item.numberOfGuests || item.pax || 0),
        packageName: item.packageName || item.packageType || item.package || "",
        classicMenu: item.classicMenu || "",
        totalAmount:
            Number(
                item.totalAmount ||
                item.amount ||
                item.estimatedTotal ||
                item.packagePrice ||
                0
            ) || 0,
        status: item.status || "Pending",
        eventType: item.eventType || "Event Booking",
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

export default function ClientBookings() {
    const email = getCurrentClientEmail().toLowerCase();
    const clientName = getCurrentClientName().toLowerCase();

    const possibleBookingSources = [
        ...safeParse(getScopedKey("clientBookings", email), []),
        ...safeParse("clientBookings", []),
        ...safeParse(getScopedKey("approvedBookings", email), []),
        ...safeParse("approvedBookings", []),
        ...safeParse(getScopedKey("clientApprovedBookings", email), []),
        ...safeParse("clientApprovedBookings", []),
        ...safeParse(getScopedKey("clientQuotations", email), []),
        ...safeParse("clientQuotations", []),
    ];

    const bookings = useMemo(() => {
        const unique = [];
        const seen = new Set();

        possibleBookingSources.forEach((rawItem) => {
            const item = normalizeBooking(rawItem);
            if (!item) return;

            const itemEmail = String(item.email || "").toLowerCase();
            const itemName = String(item.clientName || "").toLowerCase();
            const status = String(item.status || "").toLowerCase();

            const belongsToCurrentUser =
                (email && itemEmail === email) ||
                (clientName && itemName === clientName);

            const allowedStatus =
                status === "confirmed" ||
                status === "approved" ||
                status === "ongoing" ||
                status === "upcoming" ||
                status === "paid" ||
                status === "pending" ||
                status === "";

            if (!belongsToCurrentUser) return;
            if (!allowedStatus) return;

            const uniqueKey = [
                item.id || "",
                item.date || "",
                item.eventType || "",
                item.venue || "",
                item.totalAmount || "",
            ].join("|");

            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                unique.push(item);
            }
        });

        return unique.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [email, clientName]);

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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-[#0d5c46]">
                        My Bookings
                    </h1>
                    <p className="mt-2 text-base text-slate-500">
                        View your confirmed, approved, and pending event bookings.
                    </p>
                </div>

                <Link
                    to="/client/quotation"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#0d5c46] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0b4f3d]"
                >
                    New Booking Request
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Bookings</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0d5c46]">
                        {summary.total}
                    </h2>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Confirmed</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-green-600">
                        {summary.confirmed}
                    </h2>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Pending</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-yellow-600">
                        {summary.pending}
                    </h2>
                </div>

                <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Estimated Total</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0d5c46]">
                        {formatCurrency(summary.totalSpent)}
                    </h2>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-[30px] border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef9f5] text-[#0d5c46]">
                        <ClipboardList size={28} />
                    </div>

                    <h2 className="mt-5 text-3xl font-extrabold text-[#0d5c46]">
                        No bookings yet
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-slate-500">
                        You do not have any booking records yet. Start by submitting a
                        quotation request for your event.
                    </p>

                    <Link
                        to="/client/quotation"
                        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#d4af37] px-6 py-3 text-sm font-bold text-[#143c2f] transition hover:bg-[#caa22c]"
                    >
                        Create New Quotation
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
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

                                <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-left lg:min-w-[220px]">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Total Amount
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-[#0d5c46]">
                                        {formatCurrency(booking.totalAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl bg-[#f8fafc] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <CalendarDays size={18} />
                                        <span className="text-sm font-bold">Date</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {formatDate(booking.date)}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#f8fafc] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <Clock3 size={18} />
                                        <span className="text-sm font-bold">Time</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {booking.time || "Not specified"}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#f8fafc] p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <MapPin size={18} />
                                        <span className="text-sm font-bold">Venue</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {booking.venue || "Not specified"}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#f8fafc] p-4">
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
                                <div className="rounded-2xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 text-[#0d5c46]">
                                        <Package size={18} />
                                        <span className="text-sm font-bold">Package</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {booking.packageName || "Not specified"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-gray-200 p-4">
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}