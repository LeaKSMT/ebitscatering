import { Link } from "react-router-dom";

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

function ClientDashboard() {
    const clientUser = getClientUser();
    const clientEmail = getCurrentClientEmail();

    const quotations = safeParse(getScopedKey("clientQuotations", clientEmail));
    const bookings = safeParse(getScopedKey("clientBookings", clientEmail));
    const payments = safeParse(getScopedKey("clientPaymentHistory", clientEmail));

    const totalPayments = payments.reduce((sum, item) => {
        return sum + Number(item.amount || item.paymentAmount || 0);
    }, 0);

    return (
        <div className="space-y-8">
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                <h1 className="text-4xl font-bold text-[#0f4d3c]">
                    Welcome, {clientUser?.name || "Client"}
                </h1>
                <p className="text-gray-500 mt-2">
                    Manage your quotations, bookings, payments, and upcoming events here.
                </p>
            </section>

            <section className="grid md:grid-cols-3 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-sm text-gray-500">My Quotations</p>
                    <h2 className="text-4xl font-bold text-[#0f4d3c] mt-2">{quotations.length}</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-sm text-gray-500">My Bookings</p>
                    <h2 className="text-4xl font-bold text-[#0f4d3c] mt-2">{bookings.length}</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-sm text-gray-500">Payments Made</p>
                    <h2 className="text-3xl font-bold text-[#10b981] mt-2">
                        {formatCurrency(totalPayments)}
                    </h2>
                </div>
            </section>

            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <h2 className="text-3xl font-bold text-[#0f4d3c]">Quick Actions</h2>
                    <Link
                        to="/client/quotation"
                        className="px-5 py-3 rounded-xl bg-[#d4af37] text-[#0b4a3a] font-semibold hover:bg-[#c79f23] transition"
                    >
                        + New Quotation
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <Link
                        to="/client/quotations"
                        className="rounded-2xl bg-[#0f4d3c] text-white p-5 font-semibold hover:bg-[#0c3f31] transition"
                    >
                        View Quotations
                    </Link>

                    <Link
                        to="/client/bookings"
                        className="rounded-2xl bg-[#d4af37] text-[#0b4a3a] p-5 font-semibold hover:bg-[#c79f23] transition"
                    >
                        View Bookings
                    </Link>

                    <Link
                        to="/client/calendar"
                        className="rounded-2xl bg-gray-100 text-gray-700 p-5 font-semibold hover:bg-gray-200 transition"
                    >
                        Open Calendar
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default ClientDashboard;