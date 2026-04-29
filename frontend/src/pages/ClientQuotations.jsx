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
    Trash2,
    Lock,
    Pencil,
    X,
    Save,
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
    return localStorage.getItem("clientToken") || localStorage.getItem("token") || "";
}

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (!envUrl) {
        console.warn("VITE_API_URL is missing. Using Render fallback.");
        return "https://ebitscatering.onrender.com/api";
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

function formatSchedule(startTime, endTime, fallbackTime) {
    if (startTime && endTime) {
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    if (startTime) return `${formatTime(startTime)} - End time not set`;
    if (endTime) return `Start time not set - ${formatTime(endTime)}`;
    if (fallbackTime) return formatTime(fallbackTime);

    return "Not specified";
}

function getStatusClasses(status, isDark) {
    const normalized = String(status || "pending").toLowerCase();

    if (["approved", "confirmed", "paid"].includes(normalized)) {
        return isDark
            ? "bg-emerald-500/20 text-emerald-100 border border-emerald-300/40"
            : "bg-emerald-100 text-emerald-900 border border-emerald-300";
    }

    if (["rejected", "declined"].includes(normalized)) {
        return isDark
            ? "bg-rose-500/20 text-rose-100 border border-rose-300/40"
            : "bg-rose-100 text-rose-900 border border-rose-300";
    }

    if (normalized === "processing") {
        return isDark
            ? "bg-blue-500/20 text-blue-100 border border-blue-300/40"
            : "bg-blue-100 text-blue-900 border border-blue-300";
    }

    return isDark
        ? "bg-amber-500/20 text-amber-100 border border-amber-300/40"
        : "bg-amber-100 text-amber-900 border border-amber-300";
}

function normalizeQuotation(item) {
    if (!item || typeof item !== "object") return null;

    let parsedAddOns = [];

    try {
        parsedAddOns = Array.isArray(item.add_ons)
            ? item.add_ons
            : JSON.parse(item.add_ons || "[]");
    } catch {
        parsedAddOns = [];
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
        eventStartTime: item.event_start_time || item.eventStartTime || "",
        eventEndTime: item.event_end_time || item.eventEndTime || "",
        eventTime: item.event_time || "",
        venue: item.venue || "",
        guests: Number(item.guests || 0),
        packageName: item.package_type || "",
        classicMenu: item.classic_menu || "",
        addOns: parsedAddOns,
        themePreference: item.theme_preference || "",
        specialRequests: item.special_requests || "",
        estimatedTotal: Number(item.estimated_total || 0),
        status: item.status || "Pending",
        createdAt: item.created_at || "",
        submittedAt: item.created_at || "",
    };
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

export default function ClientQuotations() {
    const clientEmail = getCurrentClientEmail().toLowerCase().trim();
    const clientName = getCurrentClientName().toLowerCase().trim();
    const token = getStoredToken();

    const [theme, setTheme] = useState(
        () => localStorage.getItem("clientPortalTheme") || "light"
    );
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [editingQuote, setEditingQuote] = useState(null);
    const [editForm, setEditForm] = useState({
        fullName: "",
        email: "",
        contactNumber: "",
        eventType: "",
        eventDate: "",
        eventStartTime: "",
        eventEndTime: "",
        venue: "",
        guests: "",
        themePreference: "",
        specialRequests: "",
    });
    const [error, setError] = useState("");

    const isDark = theme === "dark";

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
        fetchQuotations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientEmail, clientName, token]);

    async function fetchQuotations() {
        try {
            if (!clientEmail && !clientName) {
                setQuotations([]);
                setLoading(false);
                setError("No client session found.");
                return;
            }

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
    }

    function openEditModal(quote) {
        const status = String(quote.status || "pending").toLowerCase();

        if (status !== "pending") {
            alert("Approved quotations can no longer be edited.");
            return;
        }

        setEditingQuote(quote);
        setEditForm({
            fullName: quote.fullName || quote.clientName || "",
            email: quote.email || "",
            contactNumber: quote.contactNumber || "",
            eventType: quote.eventType || "",
            eventDate: quote.eventDate ? String(quote.eventDate).slice(0, 10) : "",
            eventStartTime: quote.eventStartTime || quote.eventTime || "",
            eventEndTime: quote.eventEndTime || "",
            venue: quote.venue || "",
            guests: quote.guests || "",
            themePreference: quote.themePreference || "",
            specialRequests: quote.specialRequests || "",
        });
    }

    function closeEditModal() {
        setEditingQuote(null);
    }

    function handleEditChange(e) {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSaveEdit(e) {
        e.preventDefault();

        if (!editingQuote) return;

        const status = String(editingQuote.status || "pending").toLowerCase();

        if (status !== "pending") {
            alert("Approved quotations can no longer be edited.");
            return;
        }

        try {
            setSavingId(editingQuote.id);

            const payload = {
                full_name: editForm.fullName,
                email: editForm.email,
                contact_number: editForm.contactNumber,
                event_type: editForm.eventType,
                preferred_date: editForm.eventDate,
                event_start_time: editForm.eventStartTime,
                event_end_time: editForm.eventEndTime,
                event_time: editForm.eventStartTime,
                venue: editForm.venue,
                guests: Number(editForm.guests || 0),
                theme_preference: editForm.themePreference,
                special_requests: editForm.specialRequests,
            };

            const res = await fetch(`${API_BASE_URL}/quotations/${editingQuote.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Failed to update quotation.");
            }

            setQuotations((prev) =>
                prev.map((item) =>
                    item.id === editingQuote.id
                        ? {
                            ...item,
                            fullName: editForm.fullName,
                            clientName: editForm.fullName,
                            email: editForm.email,
                            contactNumber: editForm.contactNumber,
                            eventType: editForm.eventType,
                            eventDate: editForm.eventDate,
                            eventStartTime: editForm.eventStartTime,
                            eventEndTime: editForm.eventEndTime,
                            eventTime: editForm.eventStartTime,
                            venue: editForm.venue,
                            guests: Number(editForm.guests || 0),
                            themePreference: editForm.themePreference,
                            specialRequests: editForm.specialRequests,
                        }
                        : item
                )
            );

            closeEditModal();
        } catch (err) {
            console.error("Update quotation error:", err);
            alert(err.message || "Failed to update quotation.");
        } finally {
            setSavingId(null);
        }
    }

    async function handleDeleteQuotation(quote) {
        const status = String(quote.status || "pending").toLowerCase();

        if (status !== "pending") {
            alert("This quotation cannot be deleted because it is already approved.");
            return;
        }

        const confirmed = window.confirm(
            `Delete this quotation?\n\nQuotation ID: ${quote.displayQuotationId || quote.quotationId || quote.id
            }`
        );

        if (!confirmed) return;

        try {
            setDeletingId(quote.id);

            const res = await fetch(`${API_BASE_URL}/quotations/${quote.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Failed to delete quotation.");
            }

            setQuotations((prev) => prev.filter((item) => item.id !== quote.id));
        } catch (err) {
            console.error("Delete quotation error:", err);
            alert(err.message || "Failed to delete quotation.");
        } finally {
            setDeletingId(null);
        }
    }

    const cardBase = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.96)_0%,rgba(13,40,32,0.96)_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        : "border border-[#cfded8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] shadow-sm";

    const softBlock = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(12,38,30,0.96)_0%,rgba(15,43,35,0.96)_100%)] shadow-[0_10px_22px_rgba(0,0,0,0.16)]"
        : "border border-[#cfded8] bg-[#f8fbfa] shadow-sm";

    const labelCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(12,38,30,0.96)_0%,rgba(15,43,35,0.96)_100%)] shadow-[0_8px_18px_rgba(0,0,0,0.14)]"
        : "bg-white border border-[#cfded8] shadow-sm";

    const summaryCard = isDark
        ? "border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,42,34,0.98)_100%)]"
        : "border border-[#cfded8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)]";

    const titleColor = isDark ? "text-white" : "text-[#063f30]";
    const subtitleColor = isDark ? "text-white/85" : "text-[#374151]";
    const bodyColor = isDark ? "text-white/90" : "text-[#111827]";
    const softText = isDark ? "text-white/75" : "text-[#4b5563]";
    const strongText = isDark ? "text-white" : "text-[#111827]";

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

    const inputClass =
        "w-full rounded-2xl border border-[#cfded8] bg-white px-4 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15";

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-8"
        >
            <motion.div variants={fadeUp} className="portal-card-premium p-6">
                <h1 className={`text-3xl font-extrabold ${titleColor}`}>
                    My Quotations
                </h1>

                <p className={`mt-2 text-sm font-semibold ${subtitleColor}`}>
                    Track your quotation status and manage your requests.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4">
                    {[
                        ["Total", summary.total],
                        ["Pending", summary.pending],
                        ["Approved", summary.approved],
                        ["Rejected", summary.rejected],
                    ].map(([label, value]) => (
                        <div key={label} className={`rounded-xl p-4 ${summaryCard}`}>
                            <p className={`text-xs font-extrabold uppercase tracking-wide ${softText}`}>
                                {label}
                            </p>
                            <p className={`mt-1 text-2xl font-extrabold ${strongText}`}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {loading ? (
                <motion.div variants={fadeUp} className={`rounded-[28px] px-6 py-14 text-center ${cardBase}`}>
                    <h2 className={`text-2xl font-extrabold ${titleColor}`}>
                        Loading quotations...
                    </h2>
                </motion.div>
            ) : error ? (
                <motion.div variants={fadeUp} className={`rounded-[28px] px-6 py-14 text-center ${cardBase}`}>
                    <h2 className="text-2xl font-extrabold text-red-500">
                        Failed to load quotations
                    </h2>
                    <p className={`mt-2 text-sm font-semibold ${subtitleColor}`}>
                        {error}
                    </p>
                </motion.div>
            ) : quotations.length === 0 ? (
                <motion.div variants={fadeUp} className="portal-card-premium border-dashed px-6 py-16 text-center">
                    <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark
                                ? "bg-white/10 text-[#98efcc]"
                                : "bg-[#eef8f4] text-[#0d5c46]"
                            }`}
                    >
                        <FileText className="h-8 w-8" />
                    </div>

                    <h2 className={`mt-5 text-2xl font-extrabold ${titleColor}`}>
                        No quotations yet
                    </h2>

                    <p className={`mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 ${subtitleColor}`}>
                        You have not submitted any quotation requests yet.
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

                            const status = String(quote.status || "pending").toLowerCase();
                            const isPending = status === "pending";

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
                                                : "border-b border-[#dbe6e1] bg-[linear-gradient(90deg,#f3fbf8_0%,#fffaf0_100%)]"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className={`text-2xl font-extrabold tracking-tight ${strongText}`}>
                                                        {quote.displayQuotationId}
                                                    </h2>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${getStatusClasses(
                                                            quote.status,
                                                            isDark
                                                        )}`}
                                                    >
                                                        {quote.status || "Pending"}
                                                    </span>
                                                </div>

                                                <p className={`mt-2 text-sm font-semibold ${softText}`}>
                                                    Submitted on{" "}
                                                    <span className={`font-extrabold ${strongText}`}>
                                                        {formatDateTime(createdLabel)}
                                                    </span>
                                                </p>
                                            </div>

                                            {isPending ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(quote)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0d5c46] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0b4f3d]"
                                                    >
                                                        <Pencil size={16} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteQuotation(quote)}
                                                        disabled={deletingId === quote.id}
                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <Trash2 size={16} />
                                                        {deletingId === quote.id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-extrabold text-slate-600">
                                                    <Lock size={16} />
                                                    Approved / Locked
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.75fr_0.9fr]">
                                        <div className="space-y-5">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className={`rounded-[26px] px-4 py-4 ${labelCard}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <Layers3 className="h-4 w-4" />
                                                        <p className="text-xs font-extrabold uppercase tracking-wide">
                                                            Package
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-base font-extrabold ${strongText}`}>
                                                        {quote.packageName || "Not selected"}
                                                    </p>
                                                </div>

                                                <div className={`rounded-[26px] px-4 py-4 ${labelCard}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <Sparkles className="h-4 w-4" />
                                                        <p className="text-xs font-extrabold uppercase tracking-wide">
                                                            Theme Preference
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-base font-extrabold ${strongText}`}>
                                                        {quote.themePreference || "Not specified"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className={`rounded-[26px] px-4 py-4 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <CalendarDays className="h-4 w-4" />
                                                        <p className="text-xs font-extrabold uppercase tracking-wide">
                                                            Event Date
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-sm font-extrabold ${strongText}`}>
                                                        {formatDate(quote.eventDate)}
                                                    </p>
                                                </div>

                                                <div className={`rounded-[26px] px-4 py-4 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <Clock3 className="h-4 w-4" />
                                                        <p className="text-xs font-extrabold uppercase tracking-wide">
                                                            Event Schedule
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-sm font-extrabold ${strongText}`}>
                                                        {formatSchedule(
                                                            quote.eventStartTime,
                                                            quote.eventEndTime,
                                                            quote.eventTime
                                                        )}
                                                    </p>
                                                </div>

                                                <div className={`rounded-[26px] px-4 py-4 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <Users className="h-4 w-4" />
                                                        <p className="text-xs font-extrabold uppercase tracking-wide">
                                                            Guests
                                                        </p>
                                                    </div>
                                                    <p className={`mt-2 text-sm font-extrabold ${strongText}`}>
                                                        {quote.guests || 0} pax
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`rounded-[28px] px-5 py-5 ${softBlock}`}>
                                                <p className={`text-xs font-extrabold uppercase tracking-wide ${softText}`}>
                                                    Client Information
                                                </p>

                                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs font-bold ${softText}`}>
                                                            <BadgeCheck size={14} />
                                                            Full Name
                                                        </p>
                                                        <p className={`mt-2 text-sm font-extrabold ${strongText}`}>
                                                            {quote.clientName || getCurrentClientName()}
                                                        </p>
                                                    </div>

                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs font-bold ${softText}`}>
                                                            <Mail size={14} />
                                                            Email
                                                        </p>
                                                        <p className={`mt-2 break-all text-sm font-extrabold ${strongText}`}>
                                                            {quote.email || clientEmail || "No email provided"}
                                                        </p>
                                                    </div>

                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs font-bold ${softText}`}>
                                                            <Phone size={14} />
                                                            Contact Number
                                                        </p>
                                                        <p className={`mt-2 text-sm font-extrabold ${strongText}`}>
                                                            {quote.contactNumber || "No contact number"}
                                                        </p>
                                                    </div>

                                                    <div className={`rounded-2xl p-4 ${labelCard}`}>
                                                        <p className={`flex items-center gap-2 text-xs font-bold ${softText}`}>
                                                            <MapPin size={14} />
                                                            Venue
                                                        </p>
                                                        <p className={`mt-2 text-sm font-extrabold ${strongText}`}>
                                                            {quote.venue || "No venue provided"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {quote.specialRequests ? (
                                                <div className={`rounded-[28px] px-5 py-5 ${softBlock}`}>
                                                    <div className={`flex items-center gap-2 ${softText}`}>
                                                        <ScrollText size={16} />
                                                        <p className="text-xs font-extrabold uppercase tracking-wide">
                                                            Special Requests
                                                        </p>
                                                    </div>
                                                    <p className={`mt-3 text-sm font-semibold leading-6 ${bodyColor}`}>
                                                        {quote.specialRequests}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="space-y-4">
                                            <div
                                                className={`rounded-[30px] px-5 py-6 text-right ${isDark
                                                        ? "border border-[rgba(97,76,24,0.34)] bg-[linear-gradient(135deg,rgba(88,67,20,0.3)_0%,rgba(120,91,27,0.24)_100%)]"
                                                        : "border border-[#f2e1aa] bg-[linear-gradient(135deg,#fffaf0_0%,#fff3d0_100%)] shadow-sm"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-end gap-2">
                                                    <CircleDollarSign size={18} className="text-[#b7791f]" />
                                                    <p className={`text-xs font-extrabold uppercase tracking-widest ${softText}`}>
                                                        Estimated Total
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#047857]">
                                                    {formatCurrency(quote.estimatedTotal)}
                                                </p>
                                            </div>

                                            <div className={`rounded-[28px] px-5 py-5 ${softBlock}`}>
                                                <p className={`text-xs font-extrabold uppercase tracking-wide ${softText}`}>
                                                    Event Summary
                                                </p>

                                                <div className="mt-4 space-y-3 text-sm">
                                                    {[
                                                        ["Type", quote.eventType || "Not specified"],
                                                        ["Date", formatDate(quote.eventDate)],
                                                        [
                                                            "Time",
                                                            formatSchedule(
                                                                quote.eventStartTime,
                                                                quote.eventEndTime,
                                                                quote.eventTime
                                                            ),
                                                        ],
                                                        ["Venue", quote.venue || "No venue"],
                                                    ].map(([label, value]) => (
                                                        <div
                                                            key={label}
                                                            className="flex items-start justify-between gap-4"
                                                        >
                                                            <span className={`font-bold ${softText}`}>
                                                                {label}
                                                            </span>
                                                            <span className={`max-w-[180px] text-right font-extrabold ${strongText}`}>
                                                                {value}
                                                            </span>
                                                        </div>
                                                    ))}
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

            <AnimatePresence>
                {editingQuote ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
                    >
                        <motion.form
                            initial={{ scale: 0.95, y: 18 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 18 }}
                            onSubmit={handleSaveEdit}
                            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-[#dbe6e1] bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-[#063f30]">
                                        Edit Pending Quotation
                                    </h2>
                                    <p className="mt-1 text-sm font-semibold text-[#4b5563]">
                                        You can only edit quotations while they are still pending.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-2xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <input className={inputClass} name="fullName" value={editForm.fullName} onChange={handleEditChange} placeholder="Full Name" />
                                <input className={inputClass} name="email" value={editForm.email} onChange={handleEditChange} placeholder="Email" />
                                <input className={inputClass} name="contactNumber" value={editForm.contactNumber} onChange={handleEditChange} placeholder="Contact Number" />
                                <input className={inputClass} name="eventType" value={editForm.eventType} onChange={handleEditChange} placeholder="Event Type" />
                                <input className={inputClass} type="date" name="eventDate" value={editForm.eventDate} onChange={handleEditChange} />
                                <input className={inputClass} type="time" name="eventStartTime" value={editForm.eventStartTime} onChange={handleEditChange} />
                                <input className={inputClass} type="time" name="eventEndTime" value={editForm.eventEndTime} onChange={handleEditChange} />
                                <input className={inputClass} name="guests" value={editForm.guests} onChange={handleEditChange} placeholder="Guests" />
                                <input className={inputClass} name="venue" value={editForm.venue} onChange={handleEditChange} placeholder="Venue" />
                                <input className={inputClass} name="themePreference" value={editForm.themePreference} onChange={handleEditChange} placeholder="Theme Preference" />
                            </div>

                            <textarea
                                className={`${inputClass} mt-4 min-h-[120px] resize-none`}
                                name="specialRequests"
                                value={editForm.specialRequests}
                                onChange={handleEditChange}
                                placeholder="Special Requests"
                            />

                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingId === editingQuote.id}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-[#0d5c46] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#0b4f3d] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    {savingId === editingQuote.id ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    );
}