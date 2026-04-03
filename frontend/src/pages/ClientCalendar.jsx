import { useMemo, useState } from "react";

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
        ...item,
        id: item.id || item.bookingId || item.quotationId || `booking_${Math.random()}`,
        email: item.email || item.clientEmail || item.userEmail || "",
        clientName: item.clientName || item.fullName || item.name || "",
        date: item.date || item.preferredDate || item.eventDate || "",
        time: item.time || item.eventTime || "",
        venue: item.venue || item.location || "",
        guests: Number(item.guests || item.pax || 0),
        packageName: item.packageName || item.packageType || item.package || "",
        classicMenu: item.classicMenu || "",
        totalAmount:
            Number(
                item.totalAmount ||
                item.estimatedTotal ||
                item.packagePrice ||
                0
            ) || 0,
        status: item.status || "Booked",
        eventType: item.eventType || "Event Booking",
    };
}

export default function ClientCalendar() {
    const email = getCurrentClientEmail().toLowerCase();
    const clientName = getCurrentClientName().toLowerCase();

    const possibleBookingSources = [
        ...safeParse(getScopedKey("clientBookings", email), []),
        ...safeParse("clientBookings", []),
        ...safeParse(getScopedKey("approvedBookings", email), []),
        ...safeParse("approvedBookings", []),
        ...safeParse(getScopedKey("clientApprovedBookings", email), []),
        ...safeParse("clientApprovedBookings", []),

        // dagdag para kahit quotations muna ang source mo, mabasa pa rin
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
    }, [email, clientName, possibleBookingSources]);

    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(null);
    }
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
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
            <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#0d5c46] text-white px-6 py-5 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                        className="font-semibold hover:opacity-90"
                    >
                        ‹ Previous
                    </button>

                    <h2 className="text-3xl font-extrabold">{monthLabel}</h2>

                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                        className="font-semibold hover:opacity-90"
                    >
                        Next ›
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 gap-3 mb-4 text-center font-bold text-[#0d5c46]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {calendarDays.map((date, index) => {
                            if (!date) {
                                return (
                                    <div
                                        key={index}
                                        className="h-24 rounded-2xl bg-transparent"
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
                                    className={`relative h-24 rounded-2xl border text-lg font-bold transition ${selected
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
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-[#fff4cc] border border-[#d4af37]" />
                            Booked
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-[#eef9f5] border border-[#0d5c46]" />
                            Today
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-[#22b47d] text-white px-6 py-5">
                        <h3 className="text-2xl font-extrabold">Upcoming Events</h3>
                        <p className="text-sm text-white/90 mt-1">
                            Quickly view your upcoming confirmed bookings.
                        </p>
                    </div>

                    <div className="p-5">
                        {upcomingBookings.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-gray-500 text-center">
                                No upcoming bookings found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingBookings.map((booking, index) => (
                                    <button
                                        key={booking.id || `${booking.date}-${index}`}
                                        onClick={() => handleSelectUpcoming(booking.date)}
                                        className="w-full text-left rounded-2xl border border-gray-200 bg-[#fafafa] p-4 hover:border-[#22b47d] hover:shadow-sm transition"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h4 className="text-base font-bold text-[#0d5c46]">
                                                    {booking.eventType || "Event Booking"}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatDate(booking.date)}
                                                </p>
                                            </div>

                                            <span className="inline-flex items-center rounded-full bg-[#fff4cc] px-3 py-1 text-xs font-bold text-[#8a6b00] border border-[#e2c15c]">
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
                                            <p className="text-[#0d5c46] font-bold pt-1">
                                                {formatCurrency(booking.totalAmount)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-[#0d5c46] text-white px-6 py-5">
                        <h3 className="text-2xl font-extrabold">Booking Details</h3>
                    </div>

                    <div className="p-5">
                        {!selectedDate ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-gray-500 text-center">
                                Select a date or choose an upcoming event to view booking details.
                            </div>
                        ) : selectedBookings.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-gray-500 text-center">
                                No booking found on {formatDate(toDateKey(selectedDate))}.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedBookings.map((booking, index) => (
                                    <div
                                        key={booking.id || `${booking.date}-${index}`}
                                        className="rounded-2xl border border-gray-200 p-4 bg-[#fafafa]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="text-lg font-bold text-[#0d5c46]">
                                                {booking.eventType || "Event Booking"}
                                            </h4>

                                            <span className="inline-flex items-center rounded-full bg-[#fff4cc] px-3 py-1 text-xs font-bold text-[#8a6b00] border border-[#e2c15c]">
                                                {booking.status || "Booked"}
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                                            <p>
                                                <span className="font-semibold">Client:</span>{" "}
                                                {booking.clientName || "Not specified"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Date:</span>{" "}
                                                {formatDate(booking.date)}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Time:</span>{" "}
                                                {booking.time || "Not specified"}
                                            </p>
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
                                            <p>
                                                <span className="font-semibold">Classic Menu:</span>{" "}
                                                {booking.classicMenu || "Not specified"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Total:</span>{" "}
                                                {formatCurrency(booking.totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}