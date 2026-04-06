import { Link } from "react-router-dom";
import { FileText, BookOpenCheck, Wallet, ArrowRight } from "lucide-react";

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

    const statCards = [
        {
            title: "My Quotations",
            value: quotations.length,
            icon: FileText,
            valueClass: "text-[#0d5c46]",
            iconWrap: "bg-[#eef8f4] text-[#0d5c46]",
        },
        {
            title: "My Bookings",
            value: bookings.length,
            icon: BookOpenCheck,
            valueClass: "text-[#0d5c46]",
            iconWrap: "bg-[#eef8f4] text-[#0d5c46]",
        },
        {
            title: "Payments Made",
            value: formatCurrency(totalPayments),
            icon: Wallet,
            valueClass: "text-[#b99117]",
            iconWrap: "bg-[#fff7df] text-[#b99117]",
        },
    ];

    return (
        <div className="space-y-7">
            <section className="overflow-hidden rounded-[30px] border border-[#dfe8e4] bg-white shadow-sm">
                <div className="bg-gradient-to-r from-[#0b5a43] to-[#0f6d51] px-6 py-8 md:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                        Welcome Back
                    </p>
                    <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">
                        Hello, {clientUser?.name || "Client"}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm md:text-base leading-7 text-white/85">
                        Manage your quotations, bookings, and payments in one place.
                    </p>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
                    {statCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="rounded-[24px] border border-slate-200 bg-[#fcfcfc] p-5 transition hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {item.title}
                                        </p>
                                        <h2 className={`mt-3 text-3xl font-extrabold ${item.valueClass}`}>
                                            {item.value}
                                        </h2>
                                    </div>

                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconWrap}`}>
                                        <Icon size={22} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-[30px] border border-[#dfe8e4] bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0d5c46]">
                            Quick Actions
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Access your most important client actions quickly.
                        </p>
                    </div>

                    <Link
                        to="/client/quotation"
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#143c2f] transition hover:bg-[#caa22c]"
                    >
                        New Quotation
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <Link
                        to="/client/quotations"
                        className="rounded-[24px] border border-[#dfe8e4] bg-[#f9fbfa] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-[#0d5c46]">View Quotations</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Check your submitted requests and monitor their status.
                        </p>
                    </Link>

                    <Link
                        to="/client/bookings"
                        className="rounded-[24px] border border-[#dfe8e4] bg-[#f9fbfa] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-[#0d5c46]">View Bookings</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Review your event bookings, details, and updates.
                        </p>
                    </Link>

                    <Link
                        to="/client/calendar"
                        className="rounded-[24px] border border-[#dfe8e4] bg-[#f9fbfa] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-[#0d5c46]">Open Calendar</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            View scheduled events and upcoming booking dates.
                        </p>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default ClientDashboard;