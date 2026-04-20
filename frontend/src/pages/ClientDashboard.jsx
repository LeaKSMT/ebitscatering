import { useEffect, useMemo, useState } from "react";
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
    TrendingUp,
    CircleDashed,
    Clock3,
    CheckCircle2,
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
    const clientUser = getClientUser();
    return (
        localStorage.getItem("currentClientEmail") ||
        localStorage.getItem("clientEmail") ||
        clientUser?.email ||
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

function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase();
}

function normalizeQuotation(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        quotationId: item.quotation_id || `Q${item.id}`,
        clientName: item.full_name || item.owner_name || "",
        email: item.email || item.owner_email || "",
        eventType: item.event_type || "",
        eventDate: item.preferred_date || "",
        venue: item.venue || "",
        guests: Number(item.guests || 0),
        packageName: item.package_type || "",
        packageType: item.package_type || "",
        estimatedTotal: Number(item.estimated_total || 0),
        status: item.status || "Pending",
        createdAt: item.created_at || "",
    };
}

function normalizeBooking(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        bookingId: item.id,
        email: item.client_email || "",
        clientName: item.client_name || "",
        eventDate: item.event_date || "",
        time: item.event_time || "",
        venue: item.venue || "",
        guests: Number(item.guests || 0),
        packageName: item.package_name || "",
        totalAmount: Number(item.total_price || 0),
        status: item.booking_status || "Pending",
        eventType: item.event_type || "Event Booking",
        createdAt: item.created_at || "",
    };
}

function ClientDashboard() {
    const clientUser = getClientUser();
    const clientEmail = getCurrentClientEmail().toLowerCase().trim();
    const clientName = String(clientUser?.name || "").toLowerCase().trim();
    const token = getStoredToken();

    const [quotations, setQuotations] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [payments] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const headers = {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                };

                const [quotationRes, bookingRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/quotations`, {
                        method: "GET",
                        credentials: "include",
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/bookings`, {
                        method: "GET",
                        credentials: "include",
                        headers,
                    }),
                ]);

                const quotationData = await quotationRes.json().catch(() => []);
                const bookingData = await bookingRes.json().catch(() => []);

                if (!quotationRes.ok) {
                    throw new Error(
                        quotationData?.message || "Failed to fetch quotations."
                    );
                }

                if (!bookingRes.ok) {
                    throw new Error(
                        bookingData?.message || "Failed to fetch bookings."
                    );
                }

                const normalizedQuotations = Array.isArray(quotationData)
                    ? quotationData.map(normalizeQuotation).filter(Boolean)
                    : [];

                const normalizedBookings = Array.isArray(bookingData)
                    ? bookingData.map(normalizeBooking).filter(Boolean)
                    : [];

                const filteredQuotations = normalizedQuotations.filter((item) => {
                    const itemEmail = String(item.email || "").toLowerCase().trim();
                    const itemClientName = String(item.clientName || "")
                        .toLowerCase()
                        .trim();

                    return (
                        (clientEmail && itemEmail === clientEmail) ||
                        (clientName && itemClientName === clientName)
                    );
                });

                const filteredBookings = normalizedBookings.filter((item) => {
                    const itemEmail = String(item.email || "").toLowerCase().trim();
                    const itemClientName = String(item.clientName || "")
                        .toLowerCase()
                        .trim();

                    return (
                        (clientEmail && itemEmail === clientEmail) ||
                        (clientName && itemClientName === clientName)
                    );
                });

                filteredQuotations.sort((a, b) => {
                    const first = new Date(b.createdAt || 0).getTime();
                    const second = new Date(a.createdAt || 0).getTime();
                    return first - second;
                });

                filteredBookings.sort((a, b) => {
                    const first = new Date(b.eventDate || b.createdAt || 0).getTime();
                    const second = new Date(a.eventDate || a.createdAt || 0).getTime();
                    return first - second;
                });

                setQuotations(filteredQuotations);
                setBookings(filteredBookings);
            } catch (error) {
                console.error("Fetch client dashboard data error:", error);
                setQuotations([]);
                setBookings([]);
            }
        };

        if (!clientEmail && !clientName) {
            setQuotations([]);
            setBookings([]);
            return;
        }

        fetchDashboardData();
    }, [clientEmail, clientName, token]);

    const totalPayments = payments.reduce((sum, item) => {
        return sum + Number(item.amount || item.paymentAmount || 0);
    }, 0);

    const latestQuotation = quotations.length ? quotations[0] : null;
    const latestBooking = bookings.length ? bookings[0] : null;

    const hasQuotation = quotations.length > 0;
    const approvedQuotation = quotations.some((item) => {
        const status = normalizeStatus(item?.status);
        return (
            status.includes("approved") ||
            status.includes("accepted") ||
            status.includes("confirmed")
        );
    });

    const hasBooking = bookings.length > 0;
    const confirmedBooking = bookings.some((item) => {
        const status = normalizeStatus(item?.status);
        return (
            status.includes("confirmed") ||
            status.includes("approved") ||
            status.includes("scheduled") ||
            status.includes("paid")
        );
    });

    const hasPayment = payments.length > 0;
    const hasFullPayment = payments.some((item) => {
        const status = normalizeStatus(item?.status || item?.paymentStatus);
        return (
            status.includes("paid") ||
            status.includes("completed") ||
            status.includes("full")
        );
    });

    let portalProgress = 0;

    if (hasQuotation) portalProgress += 30;
    if (approvedQuotation) portalProgress += 20;
    if (hasBooking) portalProgress += 20;
    if (confirmedBooking) portalProgress += 15;
    if (hasPayment) portalProgress += 10;
    if (hasFullPayment) portalProgress += 5;

    if (portalProgress > 100) portalProgress = 100;

    let overviewTitle = "Getting started";
    let overviewLabel = "Portal journey";
    let overviewIcon = CircleDashed;
    let overviewIconWrap = "bg-white/15 text-white";
    let progressColor = "from-[#f4d35e] to-[#f0b429]";
    let nextStepText =
        "Start by creating your first quotation request to begin your catering process.";

    if (portalProgress >= 100) {
        overviewTitle = "Fully completed";
        overviewLabel = "Client journey";
        overviewIcon = CheckCircle2;
        overviewIconWrap = "bg-[#fff3c8] text-[#8f6a0f]";
        nextStepText =
            "Your quotation, booking, and payment flow has been successfully completed.";
    } else if (portalProgress >= 65) {
        overviewTitle = "Almost complete";
        overviewLabel = "Client journey";
        overviewIcon = BadgeCheck;
        overviewIconWrap = "bg-[#fff3c8] text-[#8f6a0f]";
        nextStepText =
            "Your account is progressing well. You are close to completing your full catering transaction.";
    } else if (portalProgress >= 30) {
        overviewTitle = "In progress";
        overviewLabel = "Client journey";
        overviewIcon = Clock3;
        overviewIconWrap = "bg-white/15 text-white";
        nextStepText =
            "You already have activity in the portal. Continue with booking confirmation and payment completion.";
    }

    const OverviewIcon = overviewIcon;

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

    const fadeUp = {
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0 },
    };

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
                            className="w-full max-w-[320px] rounded-[26px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)]"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                Current overview
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${overviewIconWrap}`}
                                >
                                    <OverviewIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-white/75">
                                        {overviewLabel}
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        {overviewTitle}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-white/70">
                                    <span>Portal completion</span>
                                    <span>{portalProgress}%</span>
                                </div>

                                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${portalProgress}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`h-full rounded-full bg-gradient-to-r ${progressColor} shadow-[0_0_18px_rgba(245,201,74,0.45)]`}
                                    />
                                </div>

                                <p className="mt-3 text-xs leading-5 text-white/75">
                                    {nextStepText}
                                </p>
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
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="group rounded-[26px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            {item.title}
                                        </p>
                                        <h2
                                            className={`mt-3 text-3xl font-extrabold ${item.valueClass}`}
                                        >
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

            <div className="grid gap-7 xl:grid-cols-[1.45fr_1fr]">
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
                            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#d4af37_0%,#f0cb58_100%)] px-5 py-3 text-sm font-bold text-[#143c2f] shadow-[0_12px_24px_rgba(212,175,55,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(212,175,55,0.35)]"
                        >
                            <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
                            <span className="relative">New Quotation</span>
                            <ArrowRight
                                size={16}
                                className="relative transition group-hover:translate-x-1"
                            />
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
                                    whileHover={{ y: -5, scale: 1.02 }}
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
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0d5c46]">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0d5c46]">
                                Recent Activity
                            </h2>
                            <p className="mt-1 text-slate-500">
                                A quick look at your latest records.
                            </p>
                        </div>
                    </div>

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
                                            latestBooking?.createdAt
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-dashed border-[#d8e7e1] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5">
                            <p className="text-sm font-bold text-[#0d5c46]">
                                Smart Insight
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {portalProgress >= 100
                                    ? "Your transaction flow is complete. You may review your records anytime in your client portal."
                                    : approvedQuotation && !hasBooking
                                        ? "Your quotation appears approved. You can now proceed with your booking confirmation."
                                        : hasBooking && !hasPayment
                                            ? "Your booking is already recorded. The next recommended step is payment settlement or payment monitoring."
                                            : hasQuotation
                                                ? "Your request is already in progress. Monitor your quotation status and wait for confirmation before proceeding to booking."
                                                : "You can begin by creating a new quotation so the system can prepare your catering request."}
                            </p>
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