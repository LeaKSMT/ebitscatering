import { useMemo, useState } from "react";
import {
    CheckCircle2,
    XCircle,
    CalendarDays,
    Users,
    MapPin,
    FileText,
    CircleDollarSign,
    ChevronDown,
    ChevronUp,
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
        return "bg-green-50 text-green-700 border border-green-200";
    }

    if (normalized === "rejected") {
        return "bg-red-50 text-red-700 border border-red-200";
    }

    if (normalized === "cancelled" || normalized === "canceled") {
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }

    return "bg-[#fff8e6] text-[#b99117] border border-[#f1d98a]";
}

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

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] bg-gradient-to-r from-[#0f4d3c] via-[#0e5b46] to-[#137255] p-7 text-white shadow-[0_18px_40px_rgba(15,77,60,0.15)]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-semibold">
                    Quotation Management
                </p>
                <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">
                    Review Client Quotations
                </h1>
                <p className="mt-3 max-w-3xl text-white/85 leading-7">
                    Review submitted quotation requests, inspect full package details,
                    and approve them to automatically create booking records for the
                    calendar, event management, and financial modules.
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SummaryCard
                    title="Total Quotations"
                    value={quotations.length}
                    subtitle="All submitted quotation requests"
                />
                <SummaryCard
                    title="Pending Requests"
                    value={
                        quotations.filter(
                            (item) => (item.status || "Pending") === "Pending"
                        ).length
                    }
                    subtitle="Waiting for admin review"
                />
                <SummaryCard
                    title="Approved Requests"
                    value={
                        quotations.filter(
                            (item) => (item.status || "").toLowerCase() === "approved"
                        ).length
                    }
                    subtitle="Already converted to booking"
                />
            </section>

            {quotations.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
                    <h2 className="text-3xl font-extrabold text-[#0f4d3c]">
                        Quotations
                    </h2>
                    <p className="mt-4 text-gray-500">No quotations yet.</p>
                </div>
            ) : (
                <div className="grid gap-5">
                    {quotations.map((quote, index) => {
                        const status = quote.status || "Pending";
                        const isPending = status === "Pending";
                        const isExpanded = expandedId === (quote.id || index);

                        return (
                            <div
                                key={quote.id || index}
                                className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                                                    {quote.quotationId || `Q${String(index + 1).padStart(2, "0")}`}
                                                </h2>
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(
                                                        status
                                                    )}`}
                                                >
                                                    {status}
                                                </span>
                                            </div>

                                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-3 text-sm">
                                                <InfoRow
                                                    icon={<FileText size={16} />}
                                                    label="Client"
                                                    value={quote.fullName || quote.ownerName || "—"}
                                                />
                                                <InfoRow
                                                    icon={<CalendarDays size={16} />}
                                                    label="Event Type"
                                                    value={quote.eventType || "—"}
                                                />
                                                <InfoRow
                                                    icon={<Users size={16} />}
                                                    label="Guests"
                                                    value={quote.guests || "0"}
                                                />
                                                <InfoRow
                                                    icon={<CalendarDays size={16} />}
                                                    label="Preferred Date"
                                                    value={formatDate(quote.preferredDate)}
                                                />
                                                <InfoRow
                                                    icon={<MapPin size={16} />}
                                                    label="Venue"
                                                    value={quote.venue || "—"}
                                                />
                                                <InfoRow
                                                    icon={<FileText size={16} />}
                                                    label="Package"
                                                    value={quote.packageType || "—"}
                                                />
                                            </div>
                                        </div>

                                        <div className="xl:text-right">
                                            <p className="text-sm text-gray-500">Estimated Total</p>
                                            <p className="mt-1 text-3xl font-extrabold text-[#d4af37]">
                                                {formatCurrency(quote.estimatedTotal || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-col md:flex-row gap-3">
                                        {isPending ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(quote)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f4d3c] px-5 py-3 font-bold text-white hover:bg-[#0c3f31] transition"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    Approve & Create Booking
                                                </button>

                                                <button
                                                    onClick={() => handleReject(quote)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold text-white hover:bg-red-600 transition"
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
                                                This quotation is already {status.toLowerCase()}
                                            </button>
                                        )}

                                        <button
                                            onClick={() =>
                                                setExpandedId(isExpanded ? null : quote.id || index)
                                            }
                                            className="md:w-[220px] inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37] bg-[#fff8e6] px-5 py-3 font-bold text-[#0f4d3c] hover:bg-[#ffefbd] transition"
                                        >
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            {isExpanded ? "Hide Details" : "View Full Details"}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-[#fcfcfb] p-6">
                                        <div className="grid xl:grid-cols-[1fr_1fr] gap-6">
                                            <div className="rounded-[22px] border border-[#e5ece8] bg-white p-5">
                                                <h3 className="text-xl font-bold text-[#0f4d3c] mb-4">
                                                    Quotation Information
                                                </h3>

                                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
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
                                                                    ? `${formatCurrency(quote.ratePerPax)}/pax`
                                                                    : "—"
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-5">
                                                    <p className="text-sm font-semibold text-[#0f4d3c] mb-2">
                                                        Special Requests
                                                    </p>
                                                    <div className="rounded-2xl bg-[#f8fbfa] border border-[#e1ece8] p-4 text-sm text-gray-600 leading-6">
                                                        {quote.specialRequests || "No special requests."}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="rounded-[22px] border border-[#e5ece8] bg-white p-5">
                                                    <h3 className="text-xl font-bold text-[#0f4d3c] mb-4">
                                                        Selected Add-ons
                                                    </h3>

                                                    {Array.isArray(quote.addOns) && quote.addOns.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {quote.addOns.map((addon, i) => (
                                                                <span
                                                                    key={`${addon}-${i}`}
                                                                    className="rounded-full border border-[#e5d390] bg-[#fff8e6] px-3 py-1 text-sm font-medium text-[#0f4d3c]"
                                                                >
                                                                    {addon}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No add-ons selected.</p>
                                                    )}
                                                </div>

                                                <div className="rounded-[22px] border border-[#e5ece8] bg-white p-5">
                                                    <h3 className="text-xl font-bold text-[#0f4d3c] mb-4">
                                                        Package Inclusions
                                                    </h3>

                                                    {Array.isArray(quote.packageInclusions) &&
                                                        quote.packageInclusions.length > 0 ? (
                                                        <ul className="space-y-3">
                                                            {quote.packageInclusions.map((item, i) => (
                                                                <li
                                                                    key={`${item}-${i}`}
                                                                    className="flex items-start gap-3 text-sm text-gray-700"
                                                                >
                                                                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#d4af37] shrink-0" />
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">
                                                            No package inclusions recorded in this quotation.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {popup.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4">
                    <div className="w-full max-w-md rounded-[28px] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden animate-[fadeIn_.2s_ease-out]">
                        <div
                            className={`px-6 py-5 text-white ${popup.type === "success"
                                    ? "bg-gradient-to-r from-[#0f4d3c] via-[#11614c] to-[#22b67f]"
                                    : "bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#ef4444]"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-white/15 flex items-center justify-center">
                                    {popup.type === "success" ? (
                                        <CheckCircle2 size={30} />
                                    ) : (
                                        <XCircle size={30} />
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/80 font-semibold">
                                        System Update
                                    </p>
                                    <h3 className="mt-1 text-2xl font-extrabold">
                                        {popup.title}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6">
                            <p className="text-gray-600 leading-7 text-[15px]">
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
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ title, value, subtitle }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <h2 className="text-3xl font-extrabold text-[#0f4d3c] mt-2">{value}</h2>
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-2 text-gray-600">
            <span className="text-[#0f4d3c]">{icon}</span>
            <span className="font-medium">{label}:</span>
            <span>{value || "—"}</span>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div>
            <p className="text-gray-500">{label}</p>
            <p className="mt-1 font-semibold text-[#0f4d3c] break-words">
                {value || "—"}
            </p>
        </div>
    );
}

export default AdminQuotations;