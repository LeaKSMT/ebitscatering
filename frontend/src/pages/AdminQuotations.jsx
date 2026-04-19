import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    CalendarDays,
    Users,
    MapPin,
    FileText,
    ChevronDown,
    ChevronUp,
    Sparkles,
    BadgeCheck,
    ClipboardList,
    PartyPopper,
} from "lucide-react";
import { quotationService } from "../services/quotationService";
import { bookingService } from "../services/bookingService";

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getStatusClasses(status) {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "approved" || normalized === "confirmed") {
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (normalized === "rejected") {
        return "bg-red-50 text-red-700 border border-red-200";
    }

    if (normalized === "cancelled" || normalized === "canceled") {
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }

    return "bg-[#fff8e6] text-[#b99117] border border-[#f1d98a]";
}

function normalizeQuotation(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        quotationId: item.quotation_id || item.quotationId || "",
        fullName: item.full_name || item.fullName || item.owner_name || item.ownerName || "",
        ownerName: item.owner_name || item.ownerName || item.full_name || item.fullName || "",
        ownerEmail: item.owner_email || item.ownerEmail || item.email || "",
        email: item.email || item.owner_email || item.ownerEmail || "",
        contactNumber: item.contact_number || item.contactNumber || "",
        eventType: item.event_type || item.eventType || "",
        preferredDate: item.preferred_date || item.preferredDate || "",
        eventTime: item.event_time || item.eventTime || "",
        venue: item.venue || "",
        guests: Number(item.guests || 0),
        packageType: item.package_type || item.packageType || "",
        classicMenu: item.classic_menu || item.classicMenu || "",
        addOns: Array.isArray(item.add_ons)
            ? item.add_ons
            : Array.isArray(item.addOns)
                ? item.addOns
                : [],
        themePreference: item.theme_preference || item.themePreference || "",
        specialRequests: item.special_requests || item.specialRequests || "",
        packagePrice: Number(item.package_price || item.packagePrice || 0),
        addOnsTotal: Number(item.add_ons_total || item.addOnsTotal || 0),
        estimatedTotal: Number(item.estimated_total || item.estimatedTotal || 0),
        includedPax: item.included_pax || item.includedPax || null,
        pricingType: item.pricing_type || item.pricingType || "fixed",
        ratePerPax: item.rate_per_pax || item.ratePerPax || null,
        excessGuests: Number(item.excess_guests || item.excessGuests || 0),
        excessCost: Number(item.excess_cost || item.excessCost || 0),
        packageInclusions: Array.isArray(item.package_inclusions)
            ? item.package_inclusions
            : Array.isArray(item.packageInclusions)
                ? item.packageInclusions
                : [],
        status: item.status || "Pending",
        createdAt: item.created_at || item.createdAt || "",
    };
}

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.04,
        },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const cardReveal = {
    hidden: { opacity: 0, y: 22, scale: 0.985 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: 16,
        scale: 0.985,
        transition: {
            duration: 0.24,
            ease: "easeInOut",
        },
    },
};

function AdminQuotations() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quotations, setQuotations] = useState([]);
    const [popup, setPopup] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const refresh = () => setRefreshKey((prev) => prev + 1);

    const openPopup = (type, title, message) => {
        setPopup({
            open: true,
            type,
            title,
            message,
        });
    };

    const closePopup = () => {
        setPopup({
            open: false,
            type: "success",
            title: "",
            message: "",
        });
    };

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                setLoading(true);
                const data = await quotationService.getQuotations();
                const normalized = Array.isArray(data)
                    ? data.map(normalizeQuotation).filter(Boolean)
                    : [];

                normalized.sort((a, b) => {
                    const aTime = new Date(a.createdAt || 0).getTime();
                    const bTime = new Date(b.createdAt || 0).getTime();
                    return bTime - aTime;
                });

                setQuotations(normalized);
            } catch (error) {
                console.error("Failed to fetch quotations:", error);
                openPopup(
                    "error",
                    "Load Failed",
                    error.message || "Failed to load quotations from the server."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchQuotations();
    }, [refreshKey]);

    const pendingCount = useMemo(() => {
        return quotations.filter(
            (item) => String(item.status || "Pending").toLowerCase() === "pending"
        ).length;
    }, [quotations]);

    const approvedCount = useMemo(() => {
        return quotations.filter(
            (item) => String(item.status || "").toLowerCase() === "approved"
        ).length;
    }, [quotations]);

    const handleApprove = async (quotation) => {
        try {
            await quotationService.updateQuotationStatus(quotation.id, "Approved");

            await bookingService.createBooking({
                client_name: quotation.fullName || quotation.ownerName || "Client",
                client_email: (quotation.email || quotation.ownerEmail || "").trim().toLowerCase(),
                contact_number: quotation.contactNumber || "",
                event_type: quotation.eventType || "",
                package_name: quotation.packageType || "",
                event_date: quotation.preferredDate || "",
                event_time: quotation.eventTime || "",
                venue: quotation.venue || "",
                guests: Number(quotation.guests || 0),
                total_price: Number(quotation.estimatedTotal || 0),
                payment_status: "pending",
                booking_status: "approved",
                notes: quotation.specialRequests || quotation.classicMenu || "",
            });

            refresh();
            openPopup(
                "success",
                "Quotation Approved",
                "The quotation was approved successfully and the booking record was created automatically."
            );
        } catch (error) {
            console.error("Approve quotation error:", error);
            openPopup(
                "error",
                "Approval Failed",
                error.message || "The quotation could not be approved."
            );
        }
    };

    const handleReject = async (quotation) => {
        try {
            await quotationService.updateQuotationStatus(quotation.id, "Rejected");

            refresh();
            openPopup(
                "error",
                "Quotation Rejected",
                "The quotation request was rejected successfully. No booking record was created."
            );
        } catch (error) {
            console.error("Reject quotation error:", error);
            openPopup(
                "error",
                "Reject Failed",
                error.message || "The quotation could not be rejected."
            );
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <motion.section
                variants={fadeUp}
                className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
            >
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8">
                    <div className="pointer-events-none absolute inset-0">
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.26, 0.18] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.16, 0.1] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                            className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl"
                        />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                            <Sparkles size={13} />
                            Quotation Management
                        </div>

                        <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                            Review Client Quotations
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                            Review submitted quotation requests, inspect full package
                            details, approve qualified submissions, and automatically
                            convert them into booking records.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 border-t border-[#e8efeb] bg-[#fbfdfc] px-5 py-5 md:grid-cols-3 md:px-6">
                    <SummaryCard
                        icon={ClipboardList}
                        label="Total Quotations"
                        value={quotations.length}
                    />
                    <SummaryCard
                        icon={PartyPopper}
                        label="Pending Requests"
                        value={pendingCount}
                    />
                    <SummaryCard
                        icon={BadgeCheck}
                        label="Approved Requests"
                        value={approvedCount}
                    />
                </div>
            </motion.section>

            {loading ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[28px] border border-[#dce7e2] bg-white p-10 text-center shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                >
                    <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                        Loading quotations...
                    </h2>
                    <p className="mt-3 text-sm text-slate-500">
                        Please wait while the records are being loaded.
                    </p>
                </motion.div>
            ) : quotations.length === 0 ? (
                <motion.div
                    variants={fadeUp}
                    className="rounded-[28px] border border-[#dce7e2] bg-white p-10 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf8f3] text-[#0f4d3c]">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 text-center text-3xl font-extrabold text-[#0f4d3c]">
                        No quotations yet
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-slate-500">
                        Submitted client quotations will appear here for admin review,
                        approval, and conversion into booking records.
                    </p>
                </motion.div>
            ) : (
                <div className="grid gap-5">
                    <AnimatePresence mode="popLayout">
                        {quotations.map((quote, index) => {
                            const status = quote.status || "Pending";
                            const isPending = status.toLowerCase() === "pending";
                            const currentId = quote.id || index;
                            const isExpanded = expandedId === currentId;

                            return (
                                <motion.div
                                    key={currentId}
                                    layout
                                    variants={cardReveal}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    whileHover={{ y: -4, scale: 1.003 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                                    className="overflow-hidden rounded-[28px] border border-[#dce7e2] bg-white shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className="text-2xl font-extrabold text-[#0f4d3c] md:text-3xl">
                                                        {quote.quotationId ||
                                                            `Q${String(index + 1).padStart(2, "0")}`}
                                                    </h2>
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                                                            status
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                    <InfoCard
                                                        icon={FileText}
                                                        label="Client"
                                                        value={quote.fullName || quote.ownerName || "—"}
                                                    />
                                                    <InfoCard
                                                        icon={CalendarDays}
                                                        label="Event Type"
                                                        value={quote.eventType || "—"}
                                                    />
                                                    <InfoCard
                                                        icon={Users}
                                                        label="Guests"
                                                        value={quote.guests || "0"}
                                                    />
                                                    <InfoCard
                                                        icon={CalendarDays}
                                                        label="Preferred Date"
                                                        value={formatDate(quote.preferredDate)}
                                                    />
                                                    <InfoCard
                                                        icon={MapPin}
                                                        label="Venue"
                                                        value={quote.venue || "—"}
                                                    />
                                                    <InfoCard
                                                        icon={BadgeCheck}
                                                        label="Package"
                                                        value={quote.packageType || "—"}
                                                    />
                                                </div>
                                            </div>

                                            <div className="xl:min-w-[220px] xl:text-right">
                                                <p className="text-sm text-slate-500">
                                                    Estimated Total
                                                </p>
                                                <p className="mt-2 text-3xl font-extrabold text-[#d4af37]">
                                                    {formatCurrency(quote.estimatedTotal || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-3 md:flex-row">
                                            {isPending ? (
                                                <>
                                                    <motion.button
                                                        whileTap={{ scale: 0.985 }}
                                                        onClick={() => handleApprove(quote)}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f4d3c] px-5 py-3 font-bold text-white transition hover:bg-[#0c3f31]"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                        Approve & Create Booking
                                                    </motion.button>

                                                    <motion.button
                                                        whileTap={{ scale: 0.985 }}
                                                        onClick={() => handleReject(quote)}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-600"
                                                    >
                                                        <XCircle size={18} />
                                                        Reject
                                                    </motion.button>
                                                </>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="flex-1 cursor-not-allowed rounded-2xl bg-gray-100 px-5 py-3 font-bold text-gray-500"
                                                >
                                                    This quotation is already {status.toLowerCase()}
                                                </button>
                                            )}

                                            <motion.button
                                                whileTap={{ scale: 0.985 }}
                                                onClick={() =>
                                                    setExpandedId(isExpanded ? null : currentId)
                                                }
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37] bg-[#fff8e6] px-5 py-3 font-bold text-[#0f4d3c] transition hover:bg-[#ffefbd] md:w-[220px]"
                                            >
                                                <motion.span
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.28, ease: "easeInOut" }}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp size={18} />
                                                    ) : (
                                                        <ChevronDown size={18} />
                                                    )}
                                                </motion.span>
                                                {isExpanded ? "Hide Details" : "View Full Details"}
                                            </motion.button>
                                        </div>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{
                                                    height: {
                                                        duration: 0.42,
                                                        ease: [0.22, 1, 0.36, 1],
                                                    },
                                                    opacity: { duration: 0.24 },
                                                }}
                                                className="border-t border-[#e8efeb] bg-[#fcfcfb]"
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 14 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.28, delay: 0.06 }}
                                                    className="grid gap-6 p-6 xl:grid-cols-[1fr_1fr]"
                                                >
                                                    <div className="rounded-[24px] border border-[#e5ece8] bg-white p-5 shadow-sm">
                                                        <h3 className="mb-4 text-xl font-extrabold text-[#0f4d3c]">
                                                            Quotation Information
                                                        </h3>

                                                        <div className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                                                            <DetailItem label="Full Name" value={quote.fullName} />
                                                            <DetailItem label="Contact Number" value={quote.contactNumber} />
                                                            <DetailItem
                                                                label="Email Address"
                                                                value={quote.email || quote.ownerEmail}
                                                            />
                                                            <DetailItem label="Event Type" value={quote.eventType} />
                                                            <DetailItem
                                                                label="Preferred Date"
                                                                value={formatDate(quote.preferredDate)}
                                                            />
                                                            <DetailItem label="Event Time" value={quote.eventTime} />
                                                            <DetailItem label="Venue / Location" value={quote.venue} />
                                                            <DetailItem label="Number of Guests" value={quote.guests} />
                                                            <DetailItem label="Preferred Package" value={quote.packageType} />
                                                            <DetailItem label="Classic Menu" value={quote.classicMenu} />
                                                            <DetailItem label="Theme / Style" value={quote.themePreference} />
                                                            <DetailItem
                                                                label="Status"
                                                                value={quote.status || "Pending"}
                                                            />
                                                            <DetailItem
                                                                label="Package Price"
                                                                value={formatCurrency(quote.packagePrice || 0)}
                                                            />
                                                            <DetailItem
                                                                label="Add-ons Total"
                                                                value={formatCurrency(quote.addOnsTotal || 0)}
                                                            />
                                                            <DetailItem
                                                                label="Estimated Total"
                                                                value={formatCurrency(quote.estimatedTotal || 0)}
                                                            />
                                                            <DetailItem
                                                                label="Package Coverage"
                                                                value={
                                                                    quote.includedPax
                                                                        ? `${quote.includedPax} pax included`
                                                                        : quote.ratePerPax
                                                                            ? `${formatCurrency(
                                                                                quote.ratePerPax
                                                                            )}/pax`
                                                                            : "—"
                                                                }
                                                            />
                                                        </div>

                                                        <div className="mt-5">
                                                            <p className="mb-2 text-sm font-semibold text-[#0f4d3c]">
                                                                Special Requests
                                                            </p>
                                                            <div className="rounded-2xl border border-[#e1ece8] bg-[#f8fbfa] p-4 text-sm leading-6 text-slate-600">
                                                                {quote.specialRequests || "No special requests."}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="rounded-[24px] border border-[#e5ece8] bg-white p-5 shadow-sm">
                                                            <h3 className="mb-4 text-xl font-extrabold text-[#0f4d3c]">
                                                                Selected Add-ons
                                                            </h3>

                                                            {Array.isArray(quote.addOns) &&
                                                                quote.addOns.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {quote.addOns.map((addon, i) => (
                                                                        <motion.span
                                                                            key={`${addon}-${i}`}
                                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            transition={{ duration: 0.22, delay: i * 0.03 }}
                                                                            className="rounded-full border border-[#e5d390] bg-[#fff8e6] px-3 py-1 text-sm font-medium text-[#0f4d3c]"
                                                                        >
                                                                            {addon}
                                                                        </motion.span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-slate-500">
                                                                    No add-ons selected.
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="rounded-[24px] border border-[#e5ece8] bg-white p-5 shadow-sm">
                                                            <h3 className="mb-4 text-xl font-extrabold text-[#0f4d3c]">
                                                                Package Inclusions
                                                            </h3>

                                                            {Array.isArray(quote.packageInclusions) &&
                                                                quote.packageInclusions.length > 0 ? (
                                                                <ul className="space-y-3">
                                                                    {quote.packageInclusions.map((item, i) => (
                                                                        <motion.li
                                                                            key={`${item}-${i}`}
                                                                            initial={{ opacity: 0, x: -8 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ duration: 0.24, delay: i * 0.03 }}
                                                                            className="flex items-start gap-3 text-sm text-slate-700"
                                                                        >
                                                                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d4af37]" />
                                                                            <span>{item}</span>
                                                                        </motion.li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm text-slate-500">
                                                                    No package inclusions recorded in this quotation.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {popup.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[3px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 26, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="w-full max-w-md overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
                        >
                            <div
                                className={`px-6 py-5 text-white ${popup.type === "success"
                                        ? "bg-gradient-to-r from-[#0f4d3c] via-[#11614c] to-[#22b67f]"
                                        : "bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#ef4444]"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        initial={{ scale: 0.85, rotate: -8 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15"
                                    >
                                        {popup.type === "success" ? (
                                            <CheckCircle2 size={30} />
                                        ) : (
                                            <XCircle size={30} />
                                        )}
                                    </motion.div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                                            System Update
                                        </p>
                                        <h3 className="mt-1 text-2xl font-extrabold">
                                            {popup.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-6">
                                <p className="text-[15px] leading-7 text-gray-600">
                                    {popup.message}
                                </p>

                                <motion.button
                                    whileTap={{ scale: 0.985 }}
                                    onClick={closePopup}
                                    className={`mt-6 w-full rounded-2xl px-5 py-3.5 font-bold text-white transition ${popup.type === "success"
                                            ? "bg-[#0f4d3c] hover:bg-[#0c3f31]"
                                            : "bg-red-500 hover:bg-red-600"
                                        }`}
                                >
                                    Okay
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SummaryCard({ icon: Icon, label, value }) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="rounded-[22px] border border-[#e2ebe7] bg-white p-4 shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf8f3_0%,#dff1e8_100%)] text-[#0f4d3c]">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {label}
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h3>
                </div>
            </div>
        </motion.div>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="rounded-[22px] border border-[#e4ece8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 shadow-sm"
        >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                <Icon size={18} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-base font-bold text-[#0f4d3c]">
                {value || "—"}
            </p>
        </motion.div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div>
            <p className="text-slate-500">{label}</p>
            <p className="mt-1 break-words font-semibold text-[#0f4d3c]">
                {value || "—"}
            </p>
        </div>
    );
}

export default AdminQuotations;