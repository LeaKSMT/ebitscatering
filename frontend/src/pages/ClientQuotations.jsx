import { useMemo, useState } from "react";
import { FileText, CalendarDays, MapPin, Users, Trash2 } from "lucide-react";

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

function getCurrentClientName() {
    const clientUser = getClientUser();
    return (
        localStorage.getItem("currentClientName") ||
        localStorage.getItem("clientName") ||
        clientUser?.name ||
        "Client"
    );
}

function getScopedKey(baseKey, email) {
    return email ? `${baseKey}_${email}` : `${baseKey}_guest`;
}

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

function getStatusClasses(status) {
    const normalized = (status || "pending").toLowerCase();

    if (normalized === "approved" || normalized === "confirmed") {
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

function ClientQuotations() {
    const clientEmail = getCurrentClientEmail();
    const clientName = getCurrentClientName();
    const storageKey = getScopedKey("clientQuotations", clientEmail);

    const [quotations, setQuotations] = useState(() =>
        safeParse(storageKey, []).sort(
            (a, b) =>
                new Date(b.createdAt || b.submittedAt || 0) -
                new Date(a.createdAt || a.submittedAt || 0)
        )
    );

    const summary = useMemo(() => {
        const total = quotations.length;
        const pending = quotations.filter(
            (item) => (item.status || "pending").toLowerCase() === "pending"
        ).length;
        const approved = quotations.filter((item) =>
            ["approved", "confirmed"].includes(
                (item.status || "").toLowerCase()
            )
        ).length;
        const rejected = quotations.filter((item) =>
            ["rejected", "declined"].includes(
                (item.status || "").toLowerCase()
            )
        ).length;

        return { total, pending, approved, rejected };
    }, [quotations]);

    const handleDeleteQuotation = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this quotation?"
        );

        if (!confirmed) return;

        const updated = quotations.filter((quote) => quote.id !== id);
        setQuotations(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    return (
        <div className="space-y-8">
            <div className="rounded-[30px] bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-6 py-7 text-white shadow-lg">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-emerald-100">
                            Client Portal
                        </p>
                        <h1 className="mt-2 text-3xl font-extrabold">
                            My Quotations
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
                            Review all your submitted catering quotations, check
                            their current status, and monitor your event request
                            details in one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-emerald-100">
                                Total
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {summary.total}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-emerald-100">
                                Pending
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {summary.pending}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-emerald-100">
                                Approved
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {summary.approved}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-emerald-100">
                                Rejected
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {summary.rejected}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-white px-6 py-5 shadow-sm">
                <p className="text-sm text-slate-500">
                    Logged in as{" "}
                    <span className="font-semibold text-slate-700">
                        {clientName}
                    </span>
                    {clientEmail ? (
                        <>
                            {" "}
                            ·{" "}
                            <span className="text-slate-600">{clientEmail}</span>
                        </>
                    ) : null}
                </p>
            </div>

            {quotations.length === 0 ? (
                <div className="rounded-[30px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                        <FileText className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="mt-5 text-2xl font-bold text-slate-800">
                        No quotations yet
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        You have not submitted any quotation requests yet. Once
                        you submit a quotation, it will appear here together
                        with its package details, event information, and
                        approval status.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {quotations.map((quote, index) => {
                        const createdLabel =
                            quote.createdAt ||
                            quote.submittedAt ||
                            quote.dateSubmitted ||
                            "";

                        const guestCount =
                            quote.guestCount ||
                            quote.guests ||
                            quote.pax ||
                            0;

                        const estimatedTotal =
                            quote.totalPrice ||
                            quote.estimatedTotal ||
                            quote.total ||
                            0;

                        return (
                            <div
                                key={quote.id || `${quote.eventType}-${index}`}
                                className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="border-b border-slate-100 bg-gradient-to-r from-[#f0fdf4] to-[#fffbeb] px-6 py-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-bold text-slate-800">
                                                    {quote.eventType ||
                                                        "Custom Event"}
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
                                                    {formatDateTime(
                                                        createdLabel
                                                    )}
                                                </span>
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                handleDeleteQuotation(quote.id)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.6fr_1fr]">
                                    <div className="space-y-5">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl bg-slate-50 px-4 py-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Package
                                                </p>
                                                <p className="mt-2 text-base font-bold text-slate-800">
                                                    {quote.packageName ||
                                                        quote.packageType ||
                                                        "Not selected"}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-slate-50 px-4 py-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Theme Preference
                                                </p>
                                                <p className="mt-2 text-base font-bold text-slate-800">
                                                    {quote.themePreference ||
                                                        "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="rounded-2xl border border-slate-200 px-4 py-4">
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

                                            <div className="rounded-2xl border border-slate-200 px-4 py-4">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <MapPin className="h-4 w-4" />
                                                    <p className="text-xs font-semibold uppercase tracking-wide">
                                                        Venue
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                                    {quote.venue ||
                                                        quote.location ||
                                                        "No venue provided"}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 px-4 py-4">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Users className="h-4 w-4" />
                                                    <p className="text-xs font-semibold uppercase tracking-wide">
                                                        Guests
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                                    {guestCount || "0"} pax
                                                </p>
                                            </div>
                                        </div>

                                        {(quote.clientName ||
                                            quote.fullName ||
                                            quote.email ||
                                            quote.phone ||
                                            quote.contactNumber) && (
                                                <div className="rounded-2xl border border-slate-200 px-5 py-5">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Client Information
                                                    </p>

                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                        <div>
                                                            <p className="text-xs text-slate-500">
                                                                Full Name
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {quote.clientName ||
                                                                    quote.fullName ||
                                                                    clientName}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-slate-500">
                                                                Email
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {quote.email ||
                                                                    clientEmail ||
                                                                    "No email provided"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-slate-500">
                                                                Contact Number
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {quote.phone ||
                                                                    quote.contactNumber ||
                                                                    "No contact number"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-slate-500">
                                                                Event Time
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {quote.eventTime ||
                                                                    "Not specified"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        {Array.isArray(quote.addOns) &&
                                            quote.addOns.length > 0 && (
                                                <div className="rounded-2xl border border-slate-200 px-5 py-5">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Selected Add-ons
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {quote.addOns.map(
                                                            (addon, addonIndex) => (
                                                                <span
                                                                    key={`${addon}-${addonIndex}`}
                                                                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                                                                >
                                                                    {addon}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {quote.specialRequests && (
                                            <div className="rounded-2xl border border-slate-200 px-5 py-5">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Special Requests
                                                </p>
                                                <p className="mt-3 text-sm leading-6 text-slate-700">
                                                    {quote.specialRequests}
                                                </p>
                                            </div>
                                        )}

                                        {quote.notes && (
                                            <div className="rounded-2xl border border-slate-200 px-5 py-5">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Notes
                                                </p>
                                                <p className="mt-3 text-sm leading-6 text-slate-700">
                                                    {quote.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-[24px] bg-[#fffaf0] px-5 py-4 text-right">
                                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                                Estimated Total
                                            </p>
                                            <p className="mt-2 text-3xl font-extrabold text-[#b9911f]">
                                                {formatCurrency(estimatedTotal)}
                                            </p>
                                        </div>

                                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                                            <p className="text-sm font-bold text-slate-800">
                                                Status Overview
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {(() => {
                                                    const status = (
                                                        quote.status || "pending"
                                                    ).toLowerCase();

                                                    if (
                                                        status === "approved" ||
                                                        status === "confirmed"
                                                    ) {
                                                        return "Your quotation has been approved. Please monitor your bookings and payment instructions for the next steps.";
                                                    }

                                                    if (
                                                        status === "rejected" ||
                                                        status === "declined"
                                                    ) {
                                                        return "Your quotation was not approved at the moment. You may submit a new request with updated details.";
                                                    }

                                                    if (status === "processing") {
                                                        return "Your quotation is currently under review. Please wait for the admin confirmation.";
                                                    }

                                                    return "Your quotation is pending review. The admin will evaluate your request and update the status soon.";
                                                })()}
                                            </p>
                                        </div>

                                        <div className="rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50 px-5 py-5">
                                            <p className="text-sm font-bold text-emerald-800">
                                                Reminder
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-emerald-700">
                                                Final pricing may still change
                                                depending on your guest count,
                                                selected add-ons, and event
                                                requirements.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ClientQuotations;