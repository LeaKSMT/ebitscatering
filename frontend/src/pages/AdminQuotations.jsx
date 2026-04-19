import { useMemo, useState } from "react";
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
    CircleDollarSign,
    ClipboardList,
    PartyPopper,
} from "lucide-react";

function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

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

function getAllScopedQuotations() {
    const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("clientQuotations_")
    );

    let all = [];

    keys.forEach((key) => {
        const items = safeParse(key, []);
        if (Array.isArray(items)) {
            const normalizedItems = items.map((item) => ({
                ...item,
                __storageKey: key,
            }));
            all = [...all, ...normalizedItems];
        }
    });

    return all.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
    });
}

function getStatusClasses(status) {
    const normalized = (status || "").toLowerCase();

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

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

function AdminQuotations() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [expandedId, setExpandedId] = useState(null);
    const [popup, setPopup] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const quotations = useMemo(() => {
        return getAllScopedQuotations();
    }, [refreshKey]);

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

    const handleApprove = (quotation) => {
        const ownerEmail =
            (quotation.ownerEmail || quotation.email || "").trim().toLowerCase() ||
            "guest@local";

        const quotationStorageKey =
            quotation.__storageKey || `clientQuotations_${ownerEmail}`;
        const bookingStorageKey = `clientBookings_${ownerEmail}`;

        const quotationItems = safeParse(quotationStorageKey, []);
        const updatedQuotations = quotationItems.map((item) => {
            if (item.id !== quotation.id) return item;

            return {
                ...item,
                status: "Approved",
                approvedAt: new Date().toLocaleString(),
            };
        });

        localStorage.setItem(
            quotationStorageKey,
            JSON.stringify(updatedQuotations)
        );

        const existingBookings = safeParse(bookingStorageKey, []);
        const alreadyExists = existingBookings.some(
            (booking) => booking.sourceQuotationId === quotation.id
        );

        if (!alreadyExists) {
            const nextNumber = existingBookings.length + 1;
            const bookingId = `B${String(nextNumber).padStart(2, "0")}`;

            const bookingRecord = {
                id: `booking_${Date.now()}`,
                bookingId,
                sourceQuotationId: quotation.id,
                quotationId: quotation.quotationId || null,

                ownerEmail,
                ownerName: quotation.fullName || quotation.ownerName || "Client",

                fullName: quotation.fullName || quotation.ownerName || "Client",
                contactNumber: quotation.contactNumber || "",
                email: ownerEmail,

                eventType: quotation.eventType || "",
                preferredDate: quotation.preferredDate || "",
                eventDate: quotation.preferredDate || "",
                eventTime: quotation.eventTime || "",
                venue: quotation.venue || "",

                guests: Number(quotation.guests || 0),
                guestCount: Number(quotation.guests || 0),

                packageType: quotation.packageType || "",
                classicMenu: quotation.classicMenu || "",
                addOns: Array.isArray(quotation.addOns) ? quotation.addOns : [],
                themePreference: quotation.themePreference || "",
                specialRequests: quotation.specialRequests || "",

                packagePrice: Number(quotation.packagePrice || 0),
                addOnsTotal: Number(quotation.addOnsTotal || 0),
                estimatedTotal: Number(quotation.estimatedTotal || 0),
                totalAmount: Number(quotation.estimatedTotal || 0),

                includedPax: quotation.includedPax || null,
                pricingType: quotation.pricingType || "fixed",
                ratePerPax: quotation.ratePerPax || null,
                excessGuests: Number(quotation.excessGuests || 0),
                excessCost: Number(quotation.excessCost || 0),

                packageInclusions: Array.isArray(quotation.packageInclusions)
                    ? quotation.packageInclusions
                    : [],

                assignedStaff: [],
                status: "Confirmed",
                source: "approved-quotation",
                createdAt: new Date().toLocaleString(),
            };

            localStorage.setItem(
                bookingStorageKey,
                JSON.stringify([bookingRecord, ...existingBookings])
            );
        }

        refresh();
        openPopup(
            "success",
            "Quotation Approved",
            "The quotation was approved successfully and the booking record was created automatically."
        );
    };

    const handleReject = (quotation) => {
        const ownerEmail =
            (quotation.ownerEmail || quotation.email || "").trim().toLowerCase() ||
            "guest@local";

        const quotationStorageKey =
            quotation.__storageKey || `clientQuotations_${ownerEmail}`;

        const quotationItems = safeParse(quotationStorageKey, []);
        const updatedQuotations = quotationItems.map((item) => {
            if (item.id !== quotation.id) return item;

            return {
                ...item,
                status: "Rejected",
                rejectedAt: new Date().toLocaleString(),
            };
        });

        localStorage.setItem(
            quotationStorageKey,
            JSON.stringify(updatedQuotations)
        );

        refresh();
        openPopup(
            "error",
            "Quotation Rejected",
            "The quotation request was rejected successfully. No booking record was created."
        );
    };

    const pendingCount = quotations.filter(
        (item) => (item.status || "Pending").toLowerCase() === "pending"
    ).length;

    const approvedCount = quotations.filter(
        (item) => (item.status || "").toLowerCase() === "approved"
    ).length;

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-6"
        >
            <motion.section
                variants={fadeUp}
                className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
            >
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl" />
                        <div className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
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

            {quotations.length === 0 ? (
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
                    <AnimatePresence>
                        {quotations.map((quote, index) => {
                            const status = quote.status || "Pending";
                            const isPending =
                                status.toLowerCase() === "pending";
                            const currentId = quote.id || index;
                            const isExpanded = expandedId === currentId;

                            return (
                                <motion.div
                                    key={currentId}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, y: 16 }}
                                    whileHover={{ y: -3 }}
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
                                                        value={
                                                            quote.fullName ||
                                                            quote.ownerName ||
                                                            "—"
                                                        }
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
                                                        value={formatDate(
                                                            quote.preferredDate
                                                        )}
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
                                                    {formatCurrency(
                                                        quote.estimatedTotal || 0
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-3 md:flex-row">
                                            {isPending ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(quote)}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f4d3c] px-5 py-3 font-bold text-white transition hover:bg-[#0c3f31]"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                        Approve & Create Booking
                                                    </button>

                                                    <button
                                                        onClick={() => handleReject(quote)}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-600"
                                                    >
                                                        <XCircle size={18} />
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="flex-1 rounded-2xl bg-gray-100 px-5 py-3 font-bold text-gray-500 cursor-not-allowed"
                                                >
                                                    This quotation is already{" "}
                                                    {status.toLowerCase()}
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    setExpandedId(
                                                        isExpanded ? null : currentId
                                                    )
                                                }
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37] bg-[#fff8e6] px-5 py-3 font-bold text-[#0f4d3c] transition hover:bg-[#ffefbd] md:w-[220px]"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                                {isExpanded
                                                    ? "Hide Details"
                                                    : "View Full Details"}
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="border-t border-[#e8efeb] bg-[#fcfcfb]"
                                            >
                                                <div className="grid gap-6 p-6 xl:grid-cols-[1fr_1fr]">
                                                    <div className="rounded-[24px] border border-[#e5ece8] bg-white p-5 shadow-sm">
                                                        <h3 className="mb-4 text-xl font-extrabold text-[#0f4d3c]">
                                                            Quotation Information
                                                        </h3>

                                                        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
                                                            <DetailItem
                                                                label="Full Name"
                                                                value={quote.fullName}
                                                            />
                                                            <DetailItem
                                                                label="Contact Number"
                                                                value={quote.contactNumber}
                                                            />
                                                            <DetailItem
                                                                label="Email Address"
                                                                value={
                                                                    quote.email ||
                                                                    quote.ownerEmail
                                                                }
                                                            />
                                                            <DetailItem
                                                                label="Event Type"
                                                                value={quote.eventType}
                                                            />
                                                            <DetailItem
                                                                label="Preferred Date"
                                                                value={formatDate(
                                                                    quote.preferredDate
                                                                )}
                                                            />
                                                            <DetailItem
                                                                label="Event Time"
                                                                value={quote.eventTime}
                                                            />
                                                            <DetailItem
                                                                label="Venue / Location"
                                                                value={quote.venue}
                                                            />
                                                            <DetailItem
                                                                label="Number of Guests"
                                                                value={quote.guests}
                                                            />
                                                            <DetailItem
                                                                label="Preferred Package"
                                                                value={quote.packageType}
                                                            />
                                                            <DetailItem
                                                                label="Classic Menu"
                                                                value={quote.classicMenu}
                                                            />
                                                            <DetailItem
                                                                label="Theme / Style"
                                                                value={quote.themePreference}
                                                            />
                                                            <DetailItem
                                                                label="Status"
                                                                value={
                                                                    quote.status || "Pending"
                                                                }
                                                            />
                                                            <DetailItem
                                                                label="Package Price"
                                                                value={formatCurrency(
                                                                    quote.packagePrice || 0
                                                                )}
                                                            />
                                                            <DetailItem
                                                                label="Add-ons Total"
                                                                value={formatCurrency(
                                                                    quote.addOnsTotal || 0
                                                                )}
                                                            />
                                                            <DetailItem
                                                                label="Estimated Total"
                                                                value={formatCurrency(
                                                                    quote.estimatedTotal || 0
                                                                )}
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
                                                                {quote.specialRequests ||
                                                                    "No special requests."}
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
                                                                    {quote.addOns.map(
                                                                        (addon, i) => (
                                                                            <span
                                                                                key={`${addon}-${i}`}
                                                                                className="rounded-full border border-[#e5d390] bg-[#fff8e6] px-3 py-1 text-sm font-medium text-[#0f4d3c]"
                                                                            >
                                                                                {addon}
                                                                            </span>
                                                                        )
                                                                    )}
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

                                                            {Array.isArray(
                                                                quote.packageInclusions
                                                            ) &&
                                                                quote.packageInclusions.length >
                                                                0 ? (
                                                                <ul className="space-y-3">
                                                                    {quote.packageInclusions.map(
                                                                        (item, i) => (
                                                                            <li
                                                                                key={`${item}-${i}`}
                                                                                className="flex items-start gap-3 text-sm text-slate-700"
                                                                            >
                                                                                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d4af37]" />
                                                                                <span>{item}</span>
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm text-slate-500">
                                                                    No package inclusions recorded
                                                                    in this quotation.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
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
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.96 }}
                            className="w-full max-w-md overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
                        >
                            <div
                                className={`px-6 py-5 text-white ${popup.type === "success"
                                        ? "bg-gradient-to-r from-[#0f4d3c] via-[#11614c] to-[#22b67f]"
                                        : "bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#ef4444]"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                                        {popup.type === "success" ? (
                                            <CheckCircle2 size={30} />
                                        ) : (
                                            <XCircle size={30} />
                                        )}
                                    </div>

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

                                <button
                                    onClick={closePopup}
                                    className={`mt-6 w-full rounded-2xl px-5 py-3.5 font-bold text-white transition ${popup.type === "success"
                                            ? "bg-[#0f4d3c] hover:bg-[#0c3f31]"
                                            : "bg-red-500 hover:bg-red-600"
                                        }`}
                                >
                                    Okay
                                </button>
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
        <div className="rounded-[22px] border border-[#e2ebe7] bg-white p-4 shadow-sm">
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
        </div>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-[22px] border border-[#e4ece8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                <Icon size={18} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-base font-bold text-[#0f4d3c]">
                {value || "—"}
            </p>
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

export default AdminQuotations;