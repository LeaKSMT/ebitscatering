import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
    Search,
    Clock3,
    Filter,
    ShieldCheck,
    AlertTriangle,
} from "lucide-react";
import { quotationService } from "../services/quotationService";

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

    if (normalized === "approved" || normalized === "confirmed" || normalized === "paid") {
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

function safeParseArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizeQuotation(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        quotationId: item.quotation_id || item.quotationId || "",
        displayQuotationId: `Q${String(item.id || 0).padStart(2, "0")}`,
        fullName:
            item.full_name ||
            item.fullName ||
            item.owner_name ||
            item.ownerName ||
            "",
        ownerName:
            item.owner_name ||
            item.ownerName ||
            item.full_name ||
            item.fullName ||
            "",
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
        addOns: safeParseArray(item.add_ons ?? item.addOns),
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
        packageInclusions: safeParseArray(
            item.package_inclusions ?? item.packageInclusions
        ),
        status: item.status || "Pending",
        createdAt: item.created_at || item.createdAt || "",
    };
}

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.03,
        },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const cardReveal = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: 12,
        scale: 0.99,
        transition: {
            duration: 0.22,
            ease: "easeInOut",
        },
    },
};

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

function PopupModal({ popup, closePopup }) {
    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {popup.open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[5px]"
                    onClick={closePopup}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
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
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 18,
                                    }}
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
        </AnimatePresence>,
        document.body
    );
}

function ConfirmModal({ confirmState, closeConfirm, onConfirm, loading }) {
    if (typeof document === "undefined") return null;

    const isApprove = confirmState.action === "approve";

    return createPortal(
        <AnimatePresence>
            {confirmState.open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[6px]"
                    onClick={loading ? undefined : closeConfirm}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 14, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.3)]"
                    >
                        <div className="border-b border-[#eef2ef] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfa_100%)] px-6 py-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isApprove
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-600"
                                        }`}
                                >
                                    {isApprove ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                                        Confirmation Required
                                    </p>
                                    <h3 className="mt-1 text-2xl font-extrabold text-[#0f4d3c]">
                                        {confirmState.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-7 text-slate-600">
                                        {confirmState.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {confirmState.quotation && (
                            <div className="grid gap-3 border-b border-[#eef2ef] bg-[#fbfdfc] px-6 py-5 sm:grid-cols-2">
                                <ConfirmMeta
                                    label="Quotation No."
                                    value={confirmState.quotation.displayQuotationId}
                                />
                                <ConfirmMeta
                                    label="Client"
                                    value={confirmState.quotation.fullName || "—"}
                                />
                                <ConfirmMeta
                                    label="Event"
                                    value={confirmState.quotation.eventType || "—"}
                                />
                                <ConfirmMeta
                                    label="Estimated Total"
                                    value={formatCurrency(confirmState.quotation.estimatedTotal || 0)}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row">
                            <button
                                onClick={closeConfirm}
                                disabled={loading}
                                className="flex-1 rounded-2xl border border-[#dce7e2] bg-white px-5 py-3.5 font-bold text-[#0f4d3c] transition hover:bg-[#f7fbf9] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 rounded-2xl px-5 py-3.5 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${isApprove
                                        ? "bg-[#0f4d3c] hover:bg-[#0c3f31]"
                                        : "bg-red-500 hover:bg-red-600"
                                    }`}
                            >
                                {loading
                                    ? "Processing..."
                                    : isApprove
                                        ? "Yes, Approve"
                                        : "Yes, Reject"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function AdminQuotations() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [popup, setPopup] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });
    const [confirmState, setConfirmState] = useState({
        open: false,
        action: null,
        quotation: null,
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

    const openConfirm = (action, quotation) => {
        const isApprove = action === "approve";

        setConfirmState({
            open: true,
            action,
            quotation,
            title: isApprove ? "Approve this quotation?" : "Reject this quotation?",
            message: isApprove
                ? "This will approve the request and may automatically create a booking record for the client."
                : "This will reject the quotation request. This action will not create any booking record.",
        });
    };

    const closeConfirm = () => {
        if (actionLoadingId) return;

        setConfirmState({
            open: false,
            action: null,
            quotation: null,
            title: "",
            message: "",
        });
    };

    useEffect(() => {
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;
        const hasActiveModal = popup.open || confirmState.open;

        if (hasActiveModal) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = previousHtmlOverflow || "";
            document.body.style.overflow = previousBodyOverflow || "";
        }

        return () => {
            document.documentElement.style.overflow = previousHtmlOverflow || "";
            document.body.style.overflow = previousBodyOverflow || "";
        };
    }, [popup.open, confirmState.open]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== "Escape") return;

            if (confirmState.open && !actionLoadingId) {
                closeConfirm();
                return;
            }

            if (popup.open) {
                closePopup();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [popup.open, confirmState.open, actionLoadingId]);

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
        return quotations.filter((item) =>
            ["approved", "confirmed", "paid"].includes(
                String(item.status || "").toLowerCase()
            )
        ).length;
    }, [quotations]);

    const rejectedCount = useMemo(() => {
        return quotations.filter(
            (item) => String(item.status || "").toLowerCase() === "rejected"
        ).length;
    }, [quotations]);

    const totalQuotationValue = useMemo(() => {
        return quotations.reduce((sum, item) => sum + Number(item.estimatedTotal || 0), 0);
    }, [quotations]);

    const filteredQuotations = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return quotations.filter((quote) => {
            const normalizedStatus = String(quote.status || "Pending").toLowerCase();

            const matchesFilter =
                activeFilter === "All"
                    ? true
                    : activeFilter === "Pending"
                        ? normalizedStatus === "pending"
                        : activeFilter === "Approved"
                            ? ["approved", "confirmed", "paid"].includes(normalizedStatus)
                            : activeFilter === "Rejected"
                                ? normalizedStatus === "rejected"
                                : true;

            const matchesSearch =
                !term ||
                [
                    quote.displayQuotationId,
                    quote.fullName,
                    quote.ownerName,
                    quote.email,
                    quote.ownerEmail,
                    quote.eventType,
                    quote.packageType,
                    quote.venue,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(term));

            return matchesFilter && matchesSearch;
        });
    }, [quotations, activeFilter, searchTerm]);

    const handleApprove = async (quotation) => {
        try {
            setActionLoadingId(quotation.id);

            const response = await quotationService.updateQuotationStatus(
                quotation.id,
                "Approved"
            );

            closeConfirm();
            refresh();
            openPopup(
                "success",
                "Quotation Approved",
                response?.bookingCreated
                    ? "The quotation was approved successfully and a booking record was created automatically."
                    : "The quotation was approved successfully."
            );
        } catch (error) {
            console.error("Approve quotation error:", error);
            openPopup(
                "error",
                "Approval Failed",
                error.message || "The quotation could not be approved."
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async (quotation) => {
        try {
            setActionLoadingId(quotation.id);

            await quotationService.updateQuotationStatus(quotation.id, "Rejected");

            closeConfirm();
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
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmState.quotation || !confirmState.action) return;

        if (confirmState.action === "approve") {
            await handleApprove(confirmState.quotation);
            return;
        }

        if (confirmState.action === "reject") {
            await handleReject(confirmState.quotation);
        }
    };

    return (
        <>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-5"
            >
                <motion.section
                    variants={fadeUp}
                    className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
                >
                    <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-5 py-6 text-white md:px-7 md:py-7">
                        <div className="pointer-events-none absolute inset-0">
                            <motion.div
                                animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.26, 0.18] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.16, 0.1] }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.4,
                                }}
                                className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl"
                            />
                        </div>

                        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                                    <Sparkles size={13} />
                                    Quotation Management
                                </div>

                                <h1 className="mt-3 text-2xl font-extrabold md:text-[38px]">
                                    Review Client Quotations
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                    Review requests, inspect package details, approve qualified
                                    submissions, and convert them into booking records.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                                <MiniStat label="Total" value={quotations.length} />
                                <MiniStat label="Pending" value={pendingCount} />
                                <MiniStat label="Approved" value={approvedCount} />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#e8efeb] bg-[#fbfdfc] px-4 py-4 md:px-6">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div className="relative w-full xl:max-w-md">
                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by quotation no., client, event, package..."
                                    className="w-full rounded-2xl border border-[#dce7e2] bg-white py-3 pl-11 pr-4 text-sm text-[#0f4d3c] outline-none transition placeholder:text-slate-400 focus:border-[#18a06c] focus:ring-4 focus:ring-[#18a06c]/10"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="mr-1 inline-flex items-center gap-2 rounded-2xl bg-[#eef7f3] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f4d3c]">
                                    <Filter size={14} />
                                    Filter
                                </div>

                                {FILTERS.map((filter) => {
                                    const isActive = activeFilter === filter;
                                    const count =
                                        filter === "All"
                                            ? quotations.length
                                            : filter === "Pending"
                                                ? pendingCount
                                                : filter === "Approved"
                                                    ? approvedCount
                                                    : rejectedCount;

                                    return (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${isActive
                                                    ? "bg-[#0f4d3c] text-white shadow-[0_10px_25px_rgba(15,77,60,0.18)]"
                                                    : "border border-[#dce7e2] bg-white text-[#0f4d3c] hover:bg-[#f6fbf9]"
                                                }`}
                                        >
                                            {filter} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-4">
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
                    <SummaryCard
                        icon={ShieldCheck}
                        label="Quotation Value"
                        value={formatCurrency(totalQuotationValue)}
                    />
                </motion.div>

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
                ) : filteredQuotations.length === 0 ? (
                    <motion.div
                        variants={fadeUp}
                        className="rounded-[28px] border border-[#dce7e2] bg-white p-10 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf8f3] text-[#0f4d3c]">
                            <FileText className="h-8 w-8" />
                        </div>
                        <h2 className="mt-5 text-center text-3xl font-extrabold text-[#0f4d3c]">
                            No quotations found
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-slate-500">
                            Try changing your filter or search keyword to find a quotation.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredQuotations.map((quote, index) => {
                                const status = quote.status || "Pending";
                                const isPending = status.toLowerCase() === "pending";
                                const currentId = quote.id || index;
                                const isExpanded = expandedId === currentId;
                                const isActing = actionLoadingId === quote.id;

                                return (
                                    <motion.div
                                        key={currentId}
                                        layout
                                        variants={cardReveal}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        transition={{ type: "spring", stiffness: 220, damping: 20 }}
                                        className="overflow-hidden rounded-[28px] border border-[#dce7e2] bg-white shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                                    >
                                        <div className="p-4 md:p-5">
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h2 className="text-[26px] font-extrabold leading-none text-[#0f4d3c]">
                                                            {quote.displayQuotationId}
                                                        </h2>
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                                                                status
                                                            )}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                        <CompactInfoCard
                                                            icon={FileText}
                                                            label="Client"
                                                            value={quote.fullName || quote.ownerName || "—"}
                                                        />
                                                        <CompactInfoCard
                                                            icon={CalendarDays}
                                                            label="Event"
                                                            value={quote.eventType || "—"}
                                                        />
                                                        <CompactInfoCard
                                                            icon={Users}
                                                            label="Guests"
                                                            value={quote.guests || "0"}
                                                        />
                                                        <CompactInfoCard
                                                            icon={MapPin}
                                                            label="Venue"
                                                            value={quote.venue || "—"}
                                                        />
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <InlineMeta
                                                            icon={Clock3}
                                                            text={formatDate(quote.preferredDate)}
                                                        />
                                                        <InlineMeta
                                                            icon={BadgeCheck}
                                                            text={quote.packageType || "No package"}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="rounded-[22px] border border-[#f0e2a8] bg-[linear-gradient(180deg,#fffdf5_0%,#fff7da_100%)] px-5 py-4 xl:min-w-[240px] xl:text-right">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7632]">
                                                        Estimated Total
                                                    </p>
                                                    <p className="mt-1 text-3xl font-extrabold text-[#b99117]">
                                                        {formatCurrency(quote.estimatedTotal || 0)}
                                                    </p>
                                                    <p className="mt-2 text-xs text-[#8d7632]">
                                                        Package + add-ons summary
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-[24px] border border-[#edf2ef] bg-[#fbfdfc] p-3">
                                                <div className="flex flex-col gap-3 lg:flex-row">
                                                    {isPending ? (
                                                        <>
                                                            <motion.button
                                                                whileTap={{ scale: 0.985 }}
                                                                onClick={() => openConfirm("approve", quote)}
                                                                disabled={isActing}
                                                                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold text-white transition ${isActing
                                                                        ? "cursor-not-allowed bg-[#0f4d3c]/70"
                                                                        : "bg-[#0f4d3c] hover:bg-[#0c3f31]"
                                                                    }`}
                                                            >
                                                                <CheckCircle2 size={18} />
                                                                {isActing
                                                                    ? "Processing..."
                                                                    : "Approve & Create Booking"}
                                                            </motion.button>

                                                            <motion.button
                                                                whileTap={{ scale: 0.985 }}
                                                                onClick={() => openConfirm("reject", quote)}
                                                                disabled={isActing}
                                                                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold text-white transition ${isActing
                                                                        ? "cursor-not-allowed bg-red-400"
                                                                        : "bg-red-500 hover:bg-red-600"
                                                                    }`}
                                                            >
                                                                <XCircle size={18} />
                                                                Reject
                                                            </motion.button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="flex-1 cursor-not-allowed rounded-2xl bg-gray-100 px-5 py-3.5 font-bold text-gray-500"
                                                        >
                                                            This quotation is already {status.toLowerCase()}
                                                        </button>
                                                    )}

                                                    <motion.button
                                                        whileTap={{ scale: 0.985 }}
                                                        onClick={() =>
                                                            setExpandedId(isExpanded ? null : currentId)
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37] bg-[#fff8e6] px-5 py-3.5 font-bold text-[#0f4d3c] transition hover:bg-[#ffefbd] lg:w-[230px]"
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
                                                            duration: 0.4,
                                                            ease: [0.22, 1, 0.36, 1],
                                                        },
                                                        opacity: { duration: 0.22 },
                                                    }}
                                                    className="border-t border-[#e8efeb] bg-[#fcfcfb]"
                                                >
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        transition={{ duration: 0.26, delay: 0.04 }}
                                                        className="grid gap-5 p-4 md:p-5 xl:grid-cols-[1.1fr_0.9fr]"
                                                    >
                                                        <div className="rounded-[24px] border border-[#e5ece8] bg-white p-5 shadow-sm">
                                                            <h3 className="mb-4 text-xl font-extrabold text-[#0f4d3c]">
                                                                Quotation Information
                                                            </h3>

                                                            <div className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                                                                <DetailItem label="Reference No." value={quote.displayQuotationId} />
                                                                <DetailItem label="Full Name" value={quote.fullName} />
                                                                <DetailItem label="Contact Number" value={quote.contactNumber} />
                                                                <DetailItem label="Email Address" value={quote.email || quote.ownerEmail} />
                                                                <DetailItem label="Event Type" value={quote.eventType} />
                                                                <DetailItem label="Preferred Date" value={formatDate(quote.preferredDate)} />
                                                                <DetailItem label="Event Time" value={quote.eventTime} />
                                                                <DetailItem label="Venue / Location" value={quote.venue} />
                                                                <DetailItem label="Number of Guests" value={quote.guests} />
                                                                <DetailItem label="Preferred Package" value={quote.packageType} />
                                                                <DetailItem label="Classic Menu" value={quote.classicMenu} />
                                                                <DetailItem label="Theme / Style" value={quote.themePreference} />
                                                                <DetailItem label="Status" value={quote.status || "Pending"} />
                                                                <DetailItem label="Package Price" value={formatCurrency(quote.packagePrice || 0)} />
                                                                <DetailItem label="Add-ons Total" value={formatCurrency(quote.addOnsTotal || 0)} />
                                                                <DetailItem label="Estimated Total" value={formatCurrency(quote.estimatedTotal || 0)} />
                                                                <DetailItem
                                                                    label="Package Coverage"
                                                                    value={
                                                                        quote.includedPax
                                                                            ? `${quote.includedPax} pax included`
                                                                            : quote.ratePerPax
                                                                                ? `${formatCurrency(quote.ratePerPax)}/pax`
                                                                                : "—"
                                                                    }
                                                                />
                                                                <DetailItem
                                                                    label="Excess Guests"
                                                                    value={quote.excessGuests || 0}
                                                                />
                                                                <DetailItem
                                                                    label="Excess Cost"
                                                                    value={formatCurrency(quote.excessCost || 0)}
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

                                                        <div className="space-y-5">
                                                            <div className="rounded-[24px] border border-[#e5ece8] bg-white p-5 shadow-sm">
                                                                <h3 className="mb-4 text-xl font-extrabold text-[#0f4d3c]">
                                                                    Selected Add-ons
                                                                </h3>

                                                                {Array.isArray(quote.addOns) && quote.addOns.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {quote.addOns.map((addon, i) => (
                                                                            <motion.span
                                                                                key={`${addon}-${i}`}
                                                                                initial={{ opacity: 0, scale: 0.92 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{
                                                                                    duration: 0.2,
                                                                                    delay: i * 0.02,
                                                                                }}
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
                                                                                transition={{
                                                                                    duration: 0.22,
                                                                                    delay: i * 0.02,
                                                                                }}
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
            </motion.div>

            <ConfirmModal
                confirmState={confirmState}
                closeConfirm={closeConfirm}
                onConfirm={handleConfirmAction}
                loading={
                    !!actionLoadingId &&
                    confirmState.quotation &&
                    actionLoadingId === confirmState.quotation.id
                }
            />

            <PopupModal popup={popup} closePopup={closePopup} />
        </>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                {label}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white">{value}</p>
        </div>
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
                <div className="min-w-0">
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

function CompactInfoCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-[20px] border border-[#e4ece8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-3 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                <Icon size={17} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-bold text-[#0f4d3c]">
                {value || "—"}
            </p>
        </div>
    );
}

function InlineMeta({ icon: Icon, text }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dce7e2] bg-[#f8fbfa] px-3 py-2 text-xs font-semibold text-[#0f4d3c]">
            <Icon size={14} />
            <span>{text || "—"}</span>
        </div>
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

function ConfirmMeta({ label, value }) {
    return (
        <div className="rounded-2xl border border-[#e3ece7] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-bold text-[#0f4d3c]">
                {value || "—"}
            </p>
        </div>
    );
}

export default AdminQuotations;