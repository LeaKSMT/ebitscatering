import { useEffect, useState } from "react";
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
    ShieldCheck,
    ChevronRight,
    ReceiptText,
    Star,
    Activity,
    CircleDollarSign,
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

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0 },
};

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
    let progressColor = "from-[#f4d35e] via-[#f0c34d] to-[#dea41d]";
    let nextStepText =
        "Start by creating your first quotation request to begin your catering process.";
    let heroAccent = "Your premium client workspace is ready.";

    if (portalProgress >= 100) {
        overviewTitle = "Fully completed";
        overviewLabel = "Client journey";
        overviewIcon = CheckCircle2;
        overviewIconWrap = "bg-[#fff3c8] text-[#8f6a0f]";
        nextStepText =
            "Your quotation, booking, and payment flow has been successfully completed.";
        heroAccent = "Your full catering transaction has been completed successfully.";
    } else if (portalProgress >= 65) {
        overviewTitle = "Almost complete";
        overviewLabel = "Client journey";
        overviewIcon = BadgeCheck;
        overviewIconWrap = "bg-[#fff3c8] text-[#8f6a0f]";
        nextStepText =
            "Your account is progressing well. You are close to completing your full catering transaction.";
        heroAccent = "You are now in the advanced stage of your booking journey.";
    } else if (portalProgress >= 30) {
        overviewTitle = "In progress";
        overviewLabel = "Client journey";
        overviewIcon = Clock3;
        overviewIconWrap = "bg-white/15 text-white";
        nextStepText =
            "You already have activity in the portal. Continue with booking confirmation and payment completion.";
        heroAccent = "Your records are now being tracked in the system.";
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
            badge: "Tracked",
            glow: "group-hover:shadow-[0_20px_40px_rgba(13,92,70,0.14)]",
        },
        {
            title: "My Bookings",
            value: bookings.length,
            subtitle: "Scheduled events",
            icon: BookOpenCheck,
            valueClass: "text-[#0d5c46]",
            iconWrap:
                "bg-gradient-to-br from-[#edf8f3] to-[#dff1e8] text-[#0d5c46]",
            badge: "Active",
            glow: "group-hover:shadow-[0_20px_40px_rgba(13,92,70,0.14)]",
        },
        {
            title: "Payments Made",
            value: formatCurrency(totalPayments),
            subtitle: "Total payments recorded",
            icon: Wallet,
            valueClass: "text-[#b99117]",
            iconWrap:
                "bg-gradient-to-br from-[#fff9e7] to-[#fff0bf] text-[#b99117]",
            badge: "Financial",
            glow: "group-hover:shadow-[0_20px_40px_rgba(185,145,23,0.16)]",
        },
    ];

    const quickActions = [
        {
            to: "/client/quotations",
            title: "View Quotations",
            description:
                "Check your submitted requests and monitor every status update clearly.",
            icon: FileText,
            tag: "Records",
        },
        {
            to: "/client/bookings",
            title: "View Bookings",
            description:
                "Review your event bookings, booking status, and full event details.",
            icon: BookOpenCheck,
            tag: "Events",
        },
        {
            to: "/client/calendar",
            title: "Open Calendar",
            description:
                "Browse scheduled event dates and upcoming booking timelines in one place.",
            icon: CalendarClock,
            tag: "Schedule",
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
                className="portal-card-premium relative overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 right-[-60px] h-64 w-64 rounded-full bg-[#d4af37]/20 blur-3xl" />
                    <div className="absolute bottom-[-45px] left-[-30px] h-48 w-48 rounded-full bg-white/12 blur-2xl" />
                    <div className="absolute right-[20%] top-[16%] h-24 w-24 rounded-full border border-white/10 bg-white/5 blur-sm" />
                    <div className="absolute left-[12%] top-[8%] h-14 w-14 rounded-full border border-white/10 bg-white/5" />
                </div>

                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#073c2e_0%,#0b5641_28%,#0f6d51_58%,#14906b_100%)] px-6 py-8 md:px-8 md:py-10">
                    <div className="absolute inset-0 opacity-[0.08]">
                        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:42px_42px]" />
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.12),transparent_24%)]" />

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur"
                            >
                                <Sparkles size={14} />
                                Welcome Back
                            </motion.div>

                            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl xl:text-[3.35rem] xl:leading-[1.05]">
                                Hello, {clientUser?.name || "Client"}
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                Manage your quotations, bookings, and payments in one
                                elegant, premium, and organized client portal designed
                                for a smoother end-to-end catering experience.
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur">
                                    <ShieldCheck size={16} className="text-[#f5c94a]" />
                                    {heroAccent}
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-4 py-2.5 text-sm font-semibold text-white/80 backdrop-blur">
                                    <Star size={15} className="text-[#f5c94a]" />
                                    Defense-ready premium workspace
                                </div>

                                <Link
                                    to="/client/quotations"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 text-sm font-bold text-[#0d5c46] shadow-[0_10px_25px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.16)]"
                                >
                                    Open Records
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 18, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.45 }}
                            className="w-full max-w-[380px] rounded-[30px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-md shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                        Current overview
                                    </p>
                                    <p className="mt-1 text-sm text-white/75">
                                        Progress snapshot
                                    </p>
                                </div>
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${overviewIconWrap}`}
                                >
                                    <OverviewIcon size={20} />
                                </div>
                            </div>

                            <div className="mt-4 rounded-[24px] border border-white/10 bg-black/10 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-white/75">{overviewLabel}</p>
                                        <p className="mt-1 text-2xl font-bold text-white">
                                            {overviewTitle}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-center">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                                            Score
                                        </p>
                                        <p className="text-lg font-extrabold text-white">
                                            {portalProgress}%
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
                                            transition={{ duration: 0.85, ease: "easeOut" }}
                                            className={`h-full rounded-full bg-gradient-to-r ${progressColor} shadow-[0_0_18px_rgba(245,201,74,0.45)]`}
                                        />
                                    </div>

                                    <p className="mt-3 text-xs leading-5 text-white/75">
                                        {nextStepText}
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
                                whileHover={{ y: -8, scale: 1.018 }}
                                className={`portal-panel-hover group relative overflow-hidden rounded-[30px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm transition ${item.glow}`}
                            >
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_30%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent opacity-0 transition group-hover:opacity-100" />

                                <div className="relative flex items-start justify-between gap-4">
                                    <div>
                                        <div className="inline-flex rounded-full bg-[#f4f8f6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                            {item.badge}
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-500">
                                            {item.title}
                                        </p>
                                        <h2
                                            className={`mt-3 text-3xl font-extrabold tracking-tight ${item.valueClass}`}
                                        >
                                            {item.value}
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3 ${item.iconWrap}`}
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
                    className="portal-card-premium p-6 md:p-8"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef8f3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d5c46]">
                                <Sparkles size={12} />
                                Action Center
                            </div>

                            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0d5c46] md:text-3xl">
                                Quick Actions
                            </h2>
                            <p className="mt-2 text-slate-500">
                                Access your most important client actions quickly in one
                                polished workspace.
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
                                    whileHover={{ y: -6, scale: 1.015 }}
                                >
                                    <Link
                                        to={item.to}
                                        className="portal-panel-hover group relative block h-full overflow-hidden rounded-[30px] border border-[#dfe8e4] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5 shadow-sm transition duration-300 hover:border-[#d4af37]/40 hover:shadow-md"
                                    >
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_28%)] opacity-0 transition duration-300 group-hover:opacity-100" />

                                        <div className="relative">
                                            <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                                                {item.tag}
                                            </div>

                                            <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0d5c46] transition duration-300 group-hover:scale-110 group-hover:bg-[#e6f5ee] group-hover:rotate-3">
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
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                <motion.section
                    variants={fadeUp}
                    className="portal-card-premium p-6 md:p-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0d5c46]">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-[#0d5c46]">
                                Recent Activity
                            </h2>
                            <p className="mt-1 text-slate-500">
                                A quick look at your latest records and updates.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="portal-panel-hover rounded-[28px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#fbfdfc_0%,#f7fbf9_100%)] p-5">
                            <div className="flex items-start justify-between gap-4">
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

                                <div className="rounded-full bg-[#eef8f3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d5c46]">
                                    Record
                                </div>
                            </div>

                            <div className="mt-4 grid gap-2 text-sm text-slate-500">
                                <p>
                                    Status:{" "}
                                    <span className="font-semibold text-[#b99117]">
                                        {latestQuotation?.status || "No status yet"}
                                    </span>
                                </p>
                                <p>
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

                        <div className="portal-panel-hover rounded-[28px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#fbfdfc_0%,#f7fbf9_100%)] p-5">
                            <div className="flex items-start justify-between gap-4">
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

                                <div className="rounded-full bg-[#fff8e6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f6a0f]">
                                    Event
                                </div>
                            </div>

                            <div className="mt-4 grid gap-2 text-sm text-slate-500">
                                <p>
                                    Status:{" "}
                                    <span className="font-semibold text-[#0d5c46]">
                                        {latestBooking?.status || "No status yet"}
                                    </span>
                                </p>
                                <p>
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

                        <div className="rounded-[28px] border border-dashed border-[#d8e7e1] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#0d5c46]">
                                    <ReceiptText size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0d5c46]">
                                        Smart Insight
                                    </p>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                        System guidance
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
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

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[24px] border border-[#e3ebe7] bg-white p-4">
                                <div className="flex items-center gap-2 text-[#0d5c46]">
                                    <Activity size={17} />
                                    <span className="text-sm font-bold">Journey Status</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">
                                    {overviewTitle}
                                </p>
                            </div>

                            <div className="rounded-[24px] border border-[#e3ebe7] bg-white p-4">
                                <div className="flex items-center gap-2 text-[#b99117]">
                                    <CircleDollarSign size={17} />
                                    <span className="text-sm font-bold">Recorded Payments</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">
                                    {formatCurrency(totalPayments)}
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