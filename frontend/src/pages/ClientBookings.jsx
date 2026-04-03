import { useState } from "react";

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
    const clientUser = getClientUser();
    return (
        localStorage.getItem("currentClientEmail") ||
        localStorage.getItem("clientEmail") ||
        clientUser?.email ||
        ""
    );
}

function getScopedKey(baseKey, email) {
    return email ? `${baseKey}_${email}` : `${baseKey}_guest`;
}

function formatCurrency(value) {
    const num = Number(value || 0);
    return `₱${num.toLocaleString()}`;
}

function getStatusClasses(status) {
    const normalized = (status || "").toLowerCase();

    if (normalized === "approved" || normalized === "confirmed") {
        return "bg-green-50 text-green-700 border border-green-200";
    }

    if (normalized === "cancelled" || normalized === "canceled") {
        return "bg-red-50 text-red-700 border border-red-200";
    }

    if (normalized === "pending") {
        return "bg-[#fff8e6] text-[#b99117] border border-[#f1d98a]";
    }

    return "bg-gray-100 text-gray-700 border border-gray-200";
}

function ClientBookings() {
    const clientEmail = getCurrentClientEmail();
    const storageKey = getScopedKey("clientBookings", clientEmail);

    const [bookings, setBookings] = useState(() => safeParse(storageKey));
    const [cancelTarget, setCancelTarget] = useState(null);

    const saveBookings = (updated) => {
        setBookings(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const handleCancelBooking = () => {
        if (!cancelTarget) return;

        const updated = bookings.map((booking) => {
            if (booking.id !== cancelTarget.id) return booking;

            return {
                ...booking,
                status: "Cancelled",
                cancelledAt: new Date().toLocaleString(),
            };
        });

        saveBookings(updated);
        setCancelTarget(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-[#0f4d3c]">My Bookings</h1>
                <p className="text-gray-500 mt-1">Track your confirmed catering bookings.</p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 text-center">
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">No bookings yet</h2>
                    <p className="text-gray-500 mt-2">Your confirmed bookings will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking, index) => {
                        const displayId =
                            booking.bookingId || `B${String(index + 1).padStart(2, "0")}`;
                        const status = booking.status || "Confirmed";
                        const isPending = status === "Pending";

                        return (
                            <div
                                key={booking.id || index}
                                className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                            {displayId}
                                        </h2>
                                        <p className="text-gray-700 mt-1">
                                            {booking.eventType || "N/A"}
                                        </p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Event Date: {booking.eventDate || booking.preferredDate || "N/A"}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Guests: {booking.guests || booking.numberOfGuests || "N/A"}
                                        </p>
                                        {booking.venue && (
                                            <p className="text-gray-500 text-sm">
                                                Venue: {booking.venue}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getStatusClasses(
                                                status
                                            )}`}
                                        >
                                            {status}
                                        </span>
                                        <p className="text-2xl font-bold text-[#0f4d3c]">
                                            {formatCurrency(booking.amount || booking.totalAmount || 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    {isPending ? (
                                        <button
                                            type="button"
                                            onClick={() => setCancelTarget(booking)}
                                            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                                        >
                                            Request Cancellation
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
                                        >
                                            Booking can no longer be cancelled
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {cancelTarget && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-red-100 p-6">
                        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                            !
                        </div>

                        <h3 className="text-2xl font-extrabold text-center text-[#0f4d3c]">
                            Cancel this booking?
                        </h3>

                        <p className="text-gray-600 text-center mt-3 leading-7">
                            This action is only available while the booking is still pending.
                            Once cancelled, this booking will be marked as cancelled.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleCancelBooking}
                                className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                            >
                                Yes, Cancel Booking
                            </button>

                            <button
                                type="button"
                                onClick={() => setCancelTarget(null)}
                                className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                            >
                                Keep Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientBookings;