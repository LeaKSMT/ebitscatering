import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    CalendarDays,
    MapPin,
    Users,
    Sparkles,
    BadgeCheck,
    Wallet,
    Clock3,
    Mail,
    Phone,
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

function getStatusClasses(status) {
    const normalized = (status || "pending").toLowerCase();

    if (
        normalized === "approved" ||
        normalized === "confirmed" ||
        normalized === "paid"
    ) {
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }

    if (normalized === "rejected" || normalized === "declined") {
        return "bg-rose-100 text-rose-700 border border-rose-200";
    }

    if (normalized === "processing") {
        return "bg-blue-100 text-blue-700 border border-blue-200";
    }

    return "bg-amber-100 text-amber-700 border border-amber-200";
}

function getStatusMessage(status) {
    const normalized = (status || "pending").toLowerCase();

    if (
        normalized === "approved" ||
        normalized === "confirmed" ||
        normalized === "paid"
    ) {
        return "Your quotation has been approved. Please monitor your booking and payment updates for the next steps.";
    }

    if (normalized === "rejected" || normalized === "declined") {
        return "Your quotation was not approved at the moment. You may submit a new request with updated event details.";
    }

    if (normalized === "processing") {
        return "Your quotation is currently under review. Please wait for the admin confirmation and system update.";
    }

    return "Your quotation is pending review. The admin will evaluate your request and update the status soon.";
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

    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                className="relative overflow-hidden rounded-[32px] border border-[#dbe6e1] bg-white shadow-[0_14px_40px_rgba(14,61,47,0.08)]"
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-10 right-[-30px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_58%,#138062_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={14} />
                                Client Portal
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
                                My Quotations
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                Review all your submitted catering quotations, monitor
                                their status, and track event request details in one
                                premium workspace.
                            </p>
                        </div>

                        <div className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
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
                            className="rounded-[24px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] px-5 py-4 shadow-sm"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {item.label}
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-[#0d5c46]">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {loading ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[32px] border border-[#dce7e2] bg-white px-6 py-16 text-center shadow-sm"
                >
                    <h2 className="text-2xl font-bold text-[#0d5c46]">
                        Loading quotations...
                    </h2>
                </motion.div>
            ) : error ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[32px] border border-red-200 bg-white px-6 py-16 text-center shadow-sm"
                >
                    <h2 className="text-2xl font-bold text-red-600">
                        Failed to load quotations
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">{error}</p>
                </motion.div>
            ) : quotations.length === 0 ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[32px] border border-dashed border-[#d7e3de] bg-white px-6 py-16 text-center shadow-sm"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef8f4] text-[#0d5c46]">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 text-2xl font-bold text-[#0d5c46]">
                        No quotations yet
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
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
                                    className="overflow-hidden rounded-[32px] border border-[#dce7e2] bg-white shadow-[0_12px_30px_rgba(14,61,47,0.06)] transition"
                                >
                                    <div className="border-b border-[#edf2ef] bg-[linear-gradient(90deg,#f2fbf7_0%,#fff9ea_100%)] px-6 py-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className="text-2xl font-extrabold text-[#153f31]">
                                                        {quote.displayQuotationId}
                                                    </h2>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
                                                            quote.status
                                                        )}`}
                                                    >
                                                        {quote.status || "Pending"}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm text-slate-500">
                                                    Submitted on{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {formatDateTime(createdLabel)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.55fr_1fr]">
                                        <div className="space-y-5">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="rounded-[24px] bg-[#f8fbfa] px-4 py-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Package
                                                    </p>
                                                    <p className="mt-2 text-base font-bold text-slate-800">
                                                        {quote.packageName || "Not selected"}
                                                    </p>
                                                </div>

                                                <div className="rounded-[24px] bg-[#f8fbfa] px-4 py-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Theme Preference
                                                    </p>
                                                    <p className="mt-2 text-base font-bold text-slate-800">
                                                        {quote.themePreference || "Not specified"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className="rounded-[24px] border border-[#e3ebe7] px-4 py-4">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <CalendarDays className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Event Date
                                                        </p>
                                                    </div>
                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        {formatDate(quote.eventDate)}
                                                    </p>
                                                </div>

                                                <div className="rounded-[24px] border border-[#e3ebe7] px-4 py-4">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <MapPin className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Venue
                                                        </p>
                                                    </div>
                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        {quote.venue || "No venue provided"}
                                                    </p>
                                                </div>

                                                <div className="rounded-[24px] border border-[#e3ebe7] px-4 py-4">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Users className="h-4 w-4" />
                                                        <p className="text-xs font-semibold uppercase tracking-wide">
                                                            Guests
                                                        </p>
                                                    </div>
                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        {quote.guests || 0} pax
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="rounded-[24px] border border-[#e3ebe7] px-5 py-5">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Client Information
                                                </p>

                                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                    <div className="rounded-2xl bg-[#f8fbfa] p-4">
                                                        <p className="flex items-center gap-2 text-xs text-slate-500">
                                                            <BadgeCheck size={14} />
                                                            Full Name
                                                        </p>
                                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                                            {quote.clientName || getCurrentClientName()}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-[#f8fbfa] p-4">
                                                        <p className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Mail size={14} />
                                                            Email
                                                        </p>
                                                        <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                                                            {quote.email || clientEmail || "No email provided"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-[#f8fbfa] p-4">
                                                        <p className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Phone size={14} />
                                                            Contact Number
                                                        </p>
                                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                                            {quote.contactNumber || "No contact number"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-[#f8fbfa] p-4">
                                                        <p className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Clock3 size={14} />
                                                            Event Time
                                                        </p>
                                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                                            {formatTime(quote.eventTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {Array.isArray(quote.addOns) &&
                                                quote.addOns.length > 0 && (
                                                    <div className="rounded-[24px] border border-[#e3ebe7] px-5 py-5">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Selected Add-ons
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {quote.addOns.map((addon, addonIndex) => (
                                                                <span
                                                                    key={`${addon}-${addonIndex}`}
                                                                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                                                                >
                                                                    {addon}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            {quote.specialRequests && (
                                                <div className="rounded-[24px] border border-[#e3ebe7] px-5 py-5">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Special Requests
                                                    </p>
                                                    <p className="mt-3 text-sm leading-6 text-slate-700">
                                                        {quote.specialRequests}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="rounded-[28px] bg-[linear-gradient(135deg,#fffaf0_0%,#fff3d0_100%)] px-5 py-5 text-right shadow-sm">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                                    Estimated Total
                                                </p>
                                                <p className="mt-2 text-3xl font-extrabold text-[#b9911f]">
                                                    {formatCurrency(quote.estimatedTotal)}
                                                </p>
                                            </div>

                                            <div className="rounded-[28px] border border-[#e3ebe7] bg-[#f8fbfa] px-5 py-5">
                                                <p className="text-sm font-bold text-slate-800">
                                                    Status Overview
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {getStatusMessage(quote.status)}
                                                </p>
                                            </div>

                                            <div className="rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50 px-5 py-5">
                                                <p className="text-sm font-bold text-emerald-800">
                                                    Smart Reminder
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-emerald-700">
                                                    Final pricing may still change depending on
                                                    your guest count, selected add-ons, and event
                                                    requirements.
                                                </p>
                                            </div>

                                            <div className="rounded-[28px] border border-[#e3ebe7] bg-white px-5 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0d5c46]">
                                                        <Wallet size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">
                                                            Next Recommended Step
                                                        </p>
                                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                                            Keep checking this quotation page for
                                                            approval and booking progress updates.
                                                        </p>
                                                    </div>
                                                </div>
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