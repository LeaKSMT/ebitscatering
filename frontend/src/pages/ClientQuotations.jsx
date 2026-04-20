import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    CalendarDays,
    MapPin,
    Users,
    Sparkles,
    BadgeCheck,
    Clock3,
    Mail,
    Phone,
    ScrollText,
    CircleDollarSign,
    Layers3,
    ShieldCheck,
    Star,
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

function getCurrentClientName() {
    const clientUser = getClientUser();
    return (
        localStorage.getItem("currentClientName") ||
        localStorage.getItem("clientName") ||
        clientUser?.name ||
        "Client"
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

function formatDate(dateString) {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatDateTime(dateString) {
    if (!dateString) return "No submission date";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatTime(timeString) {
    if (!timeString) return "Not specified";

    const parsed = new Date(`2000-01-01T${timeString}`);
    if (Number.isNaN(parsed.getTime())) return timeString;

    return parsed.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
    });
}

function getStatusClasses(status, isDark) {
    const normalized = (status || "pending").toLowerCase();

    if (
        normalized === "approved" ||
        normalized === "confirmed" ||
        normalized === "paid"
    ) {
        return isDark
            ? "bg-[rgba(21,90,60,0.34)] text-[#8df0bf] border border-emerald-400/20"
            : "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }

    if (normalized === "rejected" || normalized === "declined") {
        return isDark
            ? "bg-[rgba(120,34,55,0.28)] text-[#ff9bb0] border border-rose-400/20"
            : "bg-rose-100 text-rose-700 border border-rose-200";
    }

    if (normalized === "processing") {
        return isDark
            ? "bg-[rgba(34,74,120,0.28)] text-[#90c6ff] border border-blue-400/20"
            : "bg-blue-100 text-blue-700 border border-blue-200";
    }

    return isDark
        ? "bg-[rgba(125,95,28,0.3)] text-[#f5cf67] border border-amber-400/20"
        : "bg-amber-100 text-amber-700 border border-amber-200";
}

function normalizeQuotation(item) {
    if (!item || typeof item !== "object") return null;

    let parsedAddOns = [];
    let parsedInclusions = [];

    try {
        parsedAddOns = Array.isArray(item.add_ons)
            ? item.add_ons
            : JSON.parse(item.add_ons || "[]");
    } catch {
        parsedAddOns = [];
    }

    try {
        parsedInclusions = Array.isArray(item.package_inclusions)
            ? item.package_inclusions
            : JSON.parse(item.package_inclusions || "[]");
    } catch {
        parsedInclusions = [];
    }

    return {
        id: item.id,
        quotationId: item.quotation_id || "",
        displayQuotationId: `Q${String(item.id || 0).padStart(2, "0")}`,
        clientName: item.full_name || item.owner_name || "",
        fullName: item.full_name || item.owner_name || "",
        email: item.email || item.owner_email || "",
        contactNumber: item.contact_number || "",
        eventType: item.event_type || "",
        eventDate: item.preferred_date || "",
        eventTime: item.event_time || "",
        venue: item.venue || "",
        guests: Number(item.guests || 0),
        packageName: item.package_type || "",
        packageType: item.package_type || "",
        classicMenu: item.classic_menu || "",
        addOns: parsedAddOns,
        themePreference: item.theme_preference || "",
        specialRequests: item.special_requests || "",
        estimatedTotal: Number(item.estimated_total || 0),
        totalPrice: Number(item.estimated_total || 0),
        packagePrice: Number(item.package_price || 0),
        addOnsTotal: Number(item.add_ons_total || 0),
        includedPax: item.included_pax,
        pricingType: item.pricing_type || "",
        ratePerPax: item.rate_per_pax,
        excessGuests: Number(item.excess_guests || 0),
        excessCost: Number(item.excess_cost || 0),
        packageInclusions: parsedInclusions,
        status: item.status || "Pending",
        createdAt: item.created_at || "",
        submittedAt: item.created_at || "",
    };
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

function ClientQuotations() {
    const clientEmail = getCurrentClientEmail().toLowerCase().trim();
    const clientName = getCurrentClientName().toLowerCase().trim();
    const token = getStoredToken();

    const [theme, setTheme] = useState(
        () => localStorage.getItem("clientPortalTheme") || "light"
    );

    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        const fetchQuotations = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API_BASE_URL}/quotations`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json().catch(() => []);

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to fetch quotations.");
                }

                const normalized = Array.isArray(data)
                    ? data.map(normalizeQuotation).filter(Boolean)
                    : [];

                const filtered = normalized.filter((item) => {
                    const itemEmail = String(item.email || "").toLowerCase().trim();
                    const itemName = String(item.clientName || "").toLowerCase().trim();

                    return (
                        (clientEmail && itemEmail === clientEmail) ||
                        (clientName && itemName === clientName)
                    );
                });

                filtered.sort((a, b) => {
                    const first = new Date(b.createdAt || b.submittedAt || 0).getTime();
                    const second = new Date(a.createdAt || a.submittedAt || 0).getTime();
                    return first - second;
                });

                setQuotations(filtered);
            } catch (err) {
                console.error("Fetch client quotations error:", err);
                setError(err.message || "Failed to load quotations.");
                setQuotations([]);
            } finally {
                setLoading(false);
            }
        };

        if (!clientEmail && !clientName) {
            setQuotations([]);
            setLoading(false);
            setError("No client session found.");
            return;
        }

        fetchQuotations();
    }, [clientEmail, clientName, token]);

    const isDark = theme === "dark";

    const cardBase = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.96)_0%,rgba(13,40,32,0.96)_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        : "border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] shadow-sm";

    const softBlock = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(12,38,30,0.96)_0%,rgba(15,43,35,0.96)_100%)]"
        : "border border-[#e3ebe7] bg-[#f8fbfa]";

    const labelCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(12,38,30,0.96)_0%,rgba(15,43,35,0.96)_100%)]"
        : "bg-[#f8fbfa]";

    const summaryCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,42,34,0.98)_100%)]"
        : "border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)]";

    const titleColor = isDark ? "text-white" : "text-[#0d5c46]";
    const subtitleColor = isDark ? "text-white/72" : "text-slate-500";
    const bodyColor = isDark ? "text-white/80" : "text-slate-700";
    const softText = isDark ? "text-white/60" : "text-slate-500";
    const strongText = isDark ? "text-white/95" : "text-slate-800";

    const summary = useMemo(() => {
        const total = quotations.length;
        const pending = quotations.filter(
            (item) => (item.status || "pending").toLowerCase() === "pending"
        ).length;
        const approved = quotations.filter((item) =>
            ["approved", "confirmed", "paid"].includes(
                (item.status || "").toLowerCase()
            )
        ).length;
        const rejected = quotations.filter((item) =>
            ["rejected", "declined"].includes((item.status || "").toLowerCase())
        ).length;

        return { total, pending, approved, rejected };
    }, [quotations]);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-8"
        >
            <motion.div
                variants={fadeUp}
                className="portal-card-premium relative overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 right-[-30px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                    <div className="absolute left-[5%] top-[30%] h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-[-40px] left-[-25px] h-40 w-40 rounded-full bg-white/8 blur-3xl" />
                </div>

                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#073c2e_0%,#0b5641_28%,#0f6d51_58%,#14906b_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="absolute inset-0 opacity-[0.08]">
                        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:44px_44px]" />
                    </div>

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={14} />
                                Client Portal
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
                                My Quotations
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                Review all your submitted catering quotations, monitor
                                their status, and track event request details in one
                                elevated, premium workspace.
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90">
                                    <ShieldCheck size={16} className="text-[#f5c94a]" />
                                    Elegant quotation tracking and review
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-4 py-2.5 text-sm font-semibold text-white/80">
                                    <Star size={15} className="text-[#f5c94a]" />
                                    Built for premium client presentation
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                Logged in as
                            </p>
                            <p className="mt-2 text-lg font-bold text-white">
                                {getCurrentClientName()}
                            </p>
                            {clientEmail ? (
                                <p className="mt-1 text-sm text-white/75">{clientEmail}</p>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 md:px-8">
                    {[
                        { label: "Total", value: summary.total },
                        { label: "Pending", value: summary.pending },
                        { label: "Approved", value: summary.approved },
                        { label: "Rejected", value: summary.rejected },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`portal-panel-hover rounded-[28px] px-5 py-4 ${summaryCard}`}
                        >
                            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${softText}`}>
                                {item.label}
                            </p>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#98efcc]">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {loading ? (
                <motion.div
                    variants={fadeUp}
                    className="portal-card-premium px-6 py-16 text-center"
                >
                    <h2 className={`text-2xl font-bold ${titleColor}`}>
                        Loading quotations...
                    </h2>
                </motion.div>
            ) : error ? (
                <motion.div
                    variants={fadeUp}
                    className={`rounded-[32px] px-6 py-16 text-center ${cardBase}`}
                >
                    <h2 className="text-2xl font-bold text-red-400">
                        Failed to load quotations
                    </h2>
                    <p className={`mt-2 text-sm ${subtitleColor}`}>{error}</p>
                </motion.div>
            ) : quotations.length === 0 ? (
                <motion.div
                    variants={fadeUp}
                    className="portal-card-premium border-dashed px-6 py-16 text-center"
                >
                    <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark
                            ? "bg-[linear-gradient(135deg,rgba(21,64,50,0.95)_0%,rgba(24,77,60,0.95)_100%)] text-[#98efcc]"
                            : "bg-[#eef8f4] text-[#0d5c46]"
                            }`}
                    >
                        <FileText className="h-8 w-8" />
                    </div>
                    <h2 className={`mt-5 text-2xl font-bold ${titleColor}`}>
                        No quotations yet
                    </h2>
                    <p className={`mx-auto mt-2 max-w-xl text-sm leading-6 ${subtitleColor}`}>
                        You have not submitted any quotation requests yet. Once you
                        submit a quotation, it will appear here together with package
                        details, event information, and approval status.
                    </p>
                </motion.div>
            ) : (
                <div className="grid gap-6">
                    <AnimatePresence>
                        {quotations.map((quote, index) => {
                            const createdLabel =
                                quote.createdAt ||
                                quote.submittedAt ||
                                quote.dateSubmitted ||
                                "";

                            return (
                                <motion.div
                                    key={quote.id || `${quote.eventType}-${index}`}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, y: 20 }}
                                    whileHover={{ y: -4 }}
                                    className="portal-card-premium overflow-hidden transition"
                                >
                                    <div
                                        className={`px-6 py-5 ${isDark
                                            ? "border-b border-white/10 bg-[linear-gradient(90deg,rgba(13,38,31,0.98)_0%,rgba(23,58,45,0.96)_100%)]"
                                            : "border-b border-[#edf2ef] bg-[linear-gradient(90deg,#f3fbf8_0%,#fffaf0_100%)]"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className={`text-2xl font-extrabold tracking-tight ${strongText}`}>
                                                        {quote.displayQuotationId}
                                                    </h2>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
                                                            quote.status,
                                                            isDark
                                                        )}`}
                                                    >
                                                        {quote.status || "Pending"}
                                                    </span>
                                                </div>

                                                <p className={`mt-2 text-sm ${softText}`}>
                                                    Submitted on{" "}
                                                    <span className={`font-medium ${strongText}`}>
                                                        {formatDateTime(createdLabel)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.75fr_0.9fr]">
                                        <div className="space-y-5">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className={`rounded-[26px] px-4 py-4 ${labelCard}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <Layers3 className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Package
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-base font-bold ${strongText}`}>
                                                        {quote.packageName || "Not selected"}
                                                    </p>
                                                </div>

                                                <div className={`rounded-[26px] px-4 py-4 ${labelCard}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <Sparkles className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Theme Preference
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-base font-bold ${strongText}`}>
                                                        {quote.themePreference || "Not specified"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className={`rounded-[26px] px-4 py-4 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <CalendarDays className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Event Date
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-sm font-semibold ${strongText}`}>
                                                        {formatDate(quote.eventDate)}
                                                    </p>
                                                </div>

                                                <div className={`rounded-[26px] px-4 py-4 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <MapPin className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Venue
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-sm font-semibold ${strongText}`}>
                                                        {quote.venue || "No venue provided"}
                                                    </p>
                                                </div>

                                                <div className={`rounded-[26px] px-4 py-4 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <Users className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Guests
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-sm font-semibold ${strongText}`}>
                                                        {quote.guests || 0} pax
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`rounded-[28px] px-5 py-5 ${softBlock}`}>
                                                <p className={`text-xs font-semibold uppercase tracking-wide ${softText}`}>
                                                    Client Information
                                                </p>

                                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs ${softText}`}>
                                                            <BadgeCheck size={14} />
                                                            Full Name
                                                        </p>
                                                        <p className={`mt-2 text-sm font-semibold ${strongText}`}>
                                                            {quote.clientName || getCurrentClientName()}
                                                        </p>
                                                    </div>

                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs ${softText}`}>
                                                            <Mail size={14} />
                                                            Email
                                                        </p>
                                                        <p className={`mt-2 break-all text-sm font-semibold ${strongText}`}>
                                                            {quote.email ||
                                                                clientEmail ||
                                                                "No email provided"}
                                                        </p>
                                                    </div>

                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs ${softText}`}>
                                                            <Phone size={14} />
                                                            Contact Number
                                                        </p>
                                                        <p className={`mt-2 text-sm font-semibold ${strongText}`}>
                                                            {quote.contactNumber || "No contact number"}
                                                        </p>
                                                    </div>

                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs ${softText}`}>
                                                            <Clock3 size={14} />
                                                            Event Time
                                                        </p>
                                                        <p className={`mt-2 text-sm font-semibold ${strongText}`}>
                                                            {formatTime(quote.eventTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {Array.isArray(quote.addOns) &&
                                                quote.addOns.length > 0 && (
                                                    <div className={`rounded-[28px] px-5 py-5 ${softBlock}`}>
                                                        <p className={`text-xs font-semibold uppercase tracking-wide ${softText}`}>
                                                            Selected Add-ons
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {quote.addOns.map((addon, addonIndex) => (
                                                                <span
                                                                    key={`${addon}-${addonIndex}`}
                                                                    className={`rounded-full px-3 py-1 text-sm font-medium ${isDark
                                                                        ? "bg-[rgba(21,90,60,0.3)] text-[#98efcc]"
                                                                        : "bg-emerald-50 text-emerald-700"
                                                                        }`}
                                                                >
                                                                    {addon}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            {quote.specialRequests && (
                                                <div className={`rounded-[28px] px-5 py-5 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <ScrollText size={16} />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Special Requests
                                                        </p>
                                                    </div>
                                                    <p className={`mt-3 text-sm leading-6 ${bodyColor}`}>
                                                        {quote.specialRequests}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div
                                                className={`rounded-[30px] px-5 py-6 text-right ${isDark
                                                    ? "border border-[rgba(97,76,24,0.34)] bg-[linear-gradient(135deg,rgba(88,67,20,0.3)_0%,rgba(120,91,27,0.24)_100%)] shadow-[0_10px_22px_rgba(0,0,0,0.18)]"
                                                    : "bg-[linear-gradient(135deg,#fffaf0_0%,#fff3d0_100%)] shadow-sm"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-end gap-2 text-[#f5cf67]">
                                                    <CircleDollarSign size={18} />
                                                    <p className={`text-xs font-semibold uppercase tracking-widest ${softText}`}>
                                                        Estimated Total
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#f5cf67]">
                                                    {formatCurrency(quote.estimatedTotal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}

export default ClientQuotations;