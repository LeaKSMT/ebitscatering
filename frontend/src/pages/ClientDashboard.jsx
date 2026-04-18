import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FileText,
    BookOpenCheck,
    Wallet,
    ArrowRight,
    CalendarClock,
    Sparkles,
    BadgeCheck,
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

function formatDate(dateValue) {
    if (!dateValue) return "No date yet";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0 },
};

function ClientDashboard() {
    const clientUser = getClientUser();
    const clientEmail = getCurrentClientEmail();

    const quotations = safeParse(getScopedKey("clientQuotations", clientEmail));
    const bookings = safeParse(getScopedKey("clientBookings", clientEmail));
    const payments = safeParse(getScopedKey("clientPaymentHistory", clientEmail));

    const totalPayments = payments.reduce((sum, item) => {
        return sum + Number(item.amount || item.paymentAmount || 0);
    }, 0);

    const latestQuotation = quotations.length
        ? quotations[quotations.length - 1]
        : null;

    const latestBooking = bookings.length
        ? bookings[bookings.length - 1]
        : null;

    const statCards = [
        {
            title: "My Quotations",
            value: quotations.length,
            subtitle: "Submitted requests",
            icon: FileText,
            valueClass: "text-[#0d5c46]",
            iconWrap:
                "bg-gradient-to-br from-[#edf8f3] to-[#dff1e8] text-[#0d5c46]",
        },
        {
            title: "My Bookings",
            value: bookings.length,
            subtitle: "Scheduled events",
            icon: BookOpenCheck,
            valueClass: "text-[#0d5c46]",
            iconWrap:
                "bg-gradient-to-br from-[#edf8f3] to-[#dff1e8] text-[#0d5c46]",
        },
        {
            title: "Payments Made",
            value: formatCurrency(totalPayments),
            subtitle: "Total payments recorded",
            icon: Wallet,
            valueClass: "text-[#b99117]",
            iconWrap:
                "bg-gradient-to-br from-[#fff9e7] to-[#fff0bf] text-[#b99117]",
        },
    ];

    const quickActions = [
        {
            to: "/client/quotations",
            title: "View Quotations",
            description: "Check your submitted requests and monitor their status.",
            icon: FileText,
        },
        {
            to: "/client/bookings",
            title: "View Bookings",
            description: "Review your event bookings, details, and updates.",
            icon: BookOpenCheck,
        },
        {
            to: "/client/calendar",
            title: "Open Calendar",
            description: "View scheduled events and upcoming booking dates.",
            icon: CalendarClock,
        },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12 }}
            className="space-y-7"
        >
            <motion.section
                variants={fadeUp}
                className="relative overflow-hidden rounded-[32px] border border-[#dbe6e1] bg-white shadow-[0_14px_40px_rgba(14,61,47,0.08)]"
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-16 right-[-40px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                    <div className="absolute bottom-[-30px] left-[-20px] h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_58%,#138062_100%)] px-6 py-8 md:px-8 md:py-10">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
                                <Sparkles size={14} />
                                Welcome Back
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold text-white md:text-5xl">
                                Hello, {clientUser?.name || "Client"}
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                Manage your quotations, bookings, and payments in one
                                elegant and organized client portal.
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.45 }}
                            className="rounded-[26px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)]"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                Current overview
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3c8] text-[#8f6a0f]">
                                    <BadgeCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-white/75">
                                        Client account status
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        Active and ready
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
                    {statCards.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.title}
                                variants={fadeUp}
                                transition={{ delay: index * 0.06 }}
                                whileHover={{ y: -5, scale: 1.01 }}
                                className="group rounded-[26px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            {item.title}
                                        </p>
                                        <h2 className={`mt-3 text-3xl font-extrabold ${item.valueClass}`}>
                                            {item.value}
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition duration-300 group-hover:scale-110 ${item.iconWrap}`}
                                    >
                                        <Icon size={24} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            <div className="grid gap-7 xl:grid-cols-[1.5fr_1fr]">
                <motion.section
                    variants={fadeUp}
                    className="rounded-[32px] border border-[#dbe6e1] bg-white p-6 shadow-[0_14px_40px_rgba(14,61,47,0.08)] md:p-8"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0d5c46] md:text-3xl">
                                Quick Actions
                            </h2>
                            <p className="mt-2 text-slate-500">
                                Access your most important client actions quickly.
                            </p>
                        </div>

                        <Link
                            to="/client/quotation"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#d4af37_0%,#f0cb58_100%)] px-5 py-3 text-sm font-bold text-[#143c2f] shadow-[0_12px_24px_rgba(212,175,55,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(212,175,55,0.35)]"
                        >
                            New Quotation
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {quickActions.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={item.title}
                                    variants={fadeUp}
                                    transition={{ delay: index * 0.06 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Link
                                        to={item.to}
                                        className="group block h-full rounded-[26px] border border-[#dfe8e4] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5 shadow-sm transition duration-300 hover:border-[#d4af37]/40 hover:shadow-md"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0d5c46] transition duration-300 group-hover:scale-110 group-hover:bg-[#e6f5ee]">
                                            <Icon size={22} />
                                        </div>

                                        <h3 className="mt-4 text-lg font-bold text-[#0d5c46]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {item.description}
                                        </p>

                                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b99117]">
                                            Open
                                            <ArrowRight
                                                size={15}
                                                className="transition group-hover:translate-x-1"
                                            />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                <motion.section
                    variants={fadeUp}
                    className="rounded-[32px] border border-[#dbe6e1] bg-white p-6 shadow-[0_14px_40px_rgba(14,61,47,0.08)] md:p-8"
                >
                    <h2 className="text-2xl font-extrabold text-[#0d5c46]">
                        Recent Activity
                    </h2>
                    <p className="mt-2 text-slate-500">
                        A quick look at your latest quotation and booking details.
                    </p>

                    <div className="mt-6 space-y-4">
                        <div className="rounded-[24px] border border-[#e3ebe7] bg-[#f8fbfa] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0d5c46]">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Latest Quotation
                                    </p>
                                    <p className="text-base font-bold text-[#0d5c46]">
                                        {latestQuotation?.eventType ||
                                            latestQuotation?.packageName ||
                                            latestQuotation?.packageType ||
                                            "No quotation yet"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-slate-500">
                                <p>
                                    Status:{" "}
                                    <span className="font-semibold text-[#b99117]">
                                        {latestQuotation?.status || "No status yet"}
                                    </span>
                                </p>
                                <p className="mt-1">
                                    Date:{" "}
                                    <span className="font-semibold text-slate-700">
                                        {formatDate(
                                            latestQuotation?.createdAt ||
                                            latestQuotation?.dateSubmitted ||
                                            latestQuotation?.eventDate
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-[#e3ebe7] bg-[#f8fbfa] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7df] text-[#b99117]">
                                    <CalendarClock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Latest Booking
                                    </p>
                                    <p className="text-base font-bold text-[#0d5c46]">
                                        {latestBooking?.eventType ||
                                            latestBooking?.packageName ||
                                            "No booking yet"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-slate-500">
                                <p>
                                    Status:{" "}
                                    <span className="font-semibold text-[#0d5c46]">
                                        {latestBooking?.status || "No status yet"}
                                    </span>
                                </p>
                                <p className="mt-1">
                                    Event Date:{" "}
                                    <span className="font-semibold text-slate-700">
                                        {formatDate(
                                            latestBooking?.eventDate ||
                                            latestBooking?.date ||
                                            latestBooking?.createdAt
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/client/bookings"
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#0d5c46] transition hover:text-[#084633]"
                        >
                            View full booking details
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
}

export default ClientDashboard;