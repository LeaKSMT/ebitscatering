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
        return JSON.parse(localStorage.getItem("clientUser")) || {};
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

function getScopedKey(baseKey, email) {
    return email ? `${baseKey}_${email}` : `${baseKey}_guest`;
}

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function ClientCalendar() {
    const email = getCurrentClientEmail();
    const bookingKey = getScopedKey("clientBookings", email);
    const bookings = safeParse(bookingKey, []).filter(
        (item) => item.status === "Confirmed" || item.status === "Approved"
    );

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
            const key = new Date(booking.date).toISOString().split("T")[0];
            if (!map[key]) map[key] = [];
            map[key].push(booking);
        });
        return map;
    }, [bookings]);

    const selectedBookings = selectedDate
        ? bookingMap[selectedDate.toISOString().split("T")[0]] || []
        : [];

    const monthLabel = currentDate.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
    });

    const isToday = (date) => {
        if (!date) return false;
        return date.toDateString() === new Date().toDateString();
    };

    const isBooked = (date) => {
        if (!date) return false;
        const key = date.toISOString().split("T")[0];
        return Boolean(bookingMap[key]?.length);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.9fr] gap-6">
            <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#0d5c46] text-white px-6 py-5 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                        className="font-semibold"
                    >
                        ‹ Previous
                    </button>

                    <h2 className="text-3xl font-extrabold">{monthLabel}</h2>

                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                        className="font-semibold"
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
                                date.toDateString() === selectedDate.toDateString();

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(date)}
                                    className={`h-24 rounded-2xl border text-lg font-bold transition ${selected
                                            ? "border-[#0d5c46] ring-2 ring-[#0d5c46]"
                                            : booked
                                                ? "border-[#d4af37] bg-[#fff7db] text-[#8a6b00]"
                                                : todayMatch
                                                    ? "border-[#0d5c46] bg-[#eef9f5] text-[#0d5c46]"
                                                    : "border-gray-100 bg-[#f6f7f9] text-[#143c2f]"
                                        }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-[#fff7db] border border-[#d4af37]" />
                            Booked
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-[#eef9f5] border border-[#0d5c46]" />
                            Today
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm overflow-hidden h-fit">
                <div className="bg-[#22b47d] text-white px-6 py-5">
                    <h3 className="text-2xl font-extrabold">Booking Details</h3>
                </div>

                <div className="p-5">
                    {!selectedDate ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-gray-500 text-center">
                            Select a date to view your booking details.
                        </div>
                    ) : selectedBookings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-gray-500 text-center">
                            No booking found on {formatDate(selectedDate)}.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="rounded-2xl border border-gray-200 p-4 bg-[#fafafa]"
                                >
                                    <h4 className="text-lg font-bold text-[#0d5c46]">
                                        {booking.eventType}
                                    </h4>
                                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                                        <p><span className="font-semibold">Client:</span> {booking.clientName}</p>
                                        <p><span className="font-semibold">Date:</span> {formatDate(booking.date)}</p>
                                        <p><span className="font-semibold">Time:</span> {booking.time || "Not specified"}</p>
                                        <p><span className="font-semibold">Venue:</span> {booking.venue || "Not specified"}</p>
                                        <p><span className="font-semibold">Guests:</span> {booking.guests || 0}</p>
                                        <p><span className="font-semibold">Package:</span> {booking.packageName || "Not specified"}</p>
                                        <p><span className="font-semibold">Classic Menu:</span> {booking.classicMenu || "Not specified"}</p>
                                        <p><span className="font-semibold">Total:</span> {formatCurrency(booking.totalAmount)}</p>
                                        <p>
                                            <span className="font-semibold">Status:</span>{" "}
                                            <span className="text-green-700 font-bold">{booking.status}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}