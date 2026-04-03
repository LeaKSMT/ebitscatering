import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const PAX_RATE = 400;

const dynamicPerPaxPackages = [
    {
        name: "Birthday Catering Package",
        eventType: "Birthday",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
    },
    {
        name: "Anniversary Catering Package",
        eventType: "Anniversary",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
    },
    {
        name: "Baptismal Catering Package",
        eventType: "Baptismal",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
    },
];

const debutPackages = [
    {
        name: "Classic Debut",
        eventType: "Debut",
        pricingType: "fixed",
        price: 48000,
        includedPax: 100,
    },
    {
        name: "Rising Star Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 55000,
        includedPax: 100,
    },
    {
        name: "All Star Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 70000,
        includedPax: 100,
    },
    {
        name: "Diamond Elite Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 80000,
        includedPax: 100,
    },
];

const weddingPackages = [
    {
        name: "Basic Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 58000,
        includedPax: 100,
    },
    {
        name: "Enhanced Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 65000,
        includedPax: 100,
    },
    {
        name: "Premium Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 75000,
        includedPax: 100,
    },
    {
        name: "Elite Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 82000,
        includedPax: 100,
    },
    {
        name: "Ultimate Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 90000,
        includedPax: 100,
    },
];

const classicMenus = ["Classic A", "Classic B", "Classic C", "Classic D"];

const addOns = [
    { name: "Lights and Sounds", price: 4000 },
    { name: "Host", price: 3500 },
    { name: "Cake", price: 2000 },
    { name: "Photo", price: 5000 },
    { name: "Photo Video", price: 15000 },
    { name: "SDE", price: 27000 },
    { name: "Clown", price: 3000 },
];

const allPackages = [
    ...dynamicPerPaxPackages,
    ...debutPackages,
    ...weddingPackages,
];

function getCurrentClient() {
    const user =
        JSON.parse(localStorage.getItem("clientUser")) ||
        JSON.parse(localStorage.getItem("user")) ||
        null;

    const email =
        localStorage.getItem("currentClientEmail") ||
        localStorage.getItem("clientEmail") ||
        user?.email ||
        "";

    return { email };
}

function getQuotationKey(email) {
    return email ? `clientQuotations_${email}` : "clientQuotations_guest";
}

function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function formatCurrency(value) {
    const num = Number(value || 0);
    return num ? `₱${num.toLocaleString()}` : "Pending";
}

function getStatusClasses(status) {
    const normalized = (status || "").toLowerCase();

    if (normalized === "approved" || normalized === "confirmed") {
        return "bg-green-50 text-green-700 border border-green-200";
    }

    if (normalized === "cancelled" || normalized === "canceled") {
        return "bg-red-50 text-red-700 border border-red-200";
    }

    if (normalized === "rejected") {
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }

    return "bg-[#fff8e6] text-[#b99117] border border-[#f1d98a]";
}

function ClientQuotations() {
    const currentClient = getCurrentClient();
    const storageKey = getQuotationKey(currentClient.email);

    const [quotations, setQuotations] = useState(() => safeParse(storageKey));
    const [editingQuote, setEditingQuote] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const [editForm, setEditForm] = useState({
        fullName: "",
        contactNumber: "",
        email: "",
        eventType: "",
        preferredDate: "",
        eventTime: "",
        venue: "",
        guests: "",
        packageType: "",
        classicMenu: "",
        addOns: [],
        themePreference: "",
        specialRequests: "",
    });

    const sortedQuotations = useMemo(() => {
        return [...quotations];
    }, [quotations]);

    const availablePackages = useMemo(() => {
        if (!editForm.eventType) return [];

        if (editForm.eventType === "Wedding") return weddingPackages;
        if (editForm.eventType === "Debut") return debutPackages;

        if (
            editForm.eventType === "Birthday" ||
            editForm.eventType === "Anniversary" ||
            editForm.eventType === "Baptismal"
        ) {
            return dynamicPerPaxPackages.filter(
                (pkg) => pkg.eventType === editForm.eventType
            );
        }

        return [];
    }, [editForm.eventType]);

    const selectedEditPackage = useMemo(() => {
        return (
            allPackages.find(
                (pkg) =>
                    pkg.name === editForm.packageType &&
                    pkg.eventType === editForm.eventType
            ) || null
        );
    }, [editForm.packageType, editForm.eventType]);

    const editAddOnsTotal = useMemo(() => {
        return editForm.addOns.reduce((sum, itemName) => {
            const matched = addOns.find((item) => item.name === itemName);
            return sum + Number(matched?.price || 0);
        }, 0);
    }, [editForm.addOns]);

    const editGuestCount = Number(editForm.guests || 0);
    const isEditPerPaxPackage = selectedEditPackage?.pricingType === "perPax";

    const editExcessGuests = useMemo(() => {
        if (!selectedEditPackage) return 0;
        if (selectedEditPackage.pricingType === "perPax") return 0;

        const included = Number(selectedEditPackage.includedPax || 0);
        return editGuestCount > included ? editGuestCount - included : 0;
    }, [selectedEditPackage, editGuestCount]);

    const editExcessCost = useMemo(() => {
        if (!selectedEditPackage) return 0;
        if (selectedEditPackage.pricingType === "perPax") return 0;

        return editExcessGuests * PAX_RATE;
    }, [selectedEditPackage, editExcessGuests]);

    const editPackagePrice = useMemo(() => {
        if (!selectedEditPackage) return 0;

        if (selectedEditPackage.pricingType === "perPax") {
            return editGuestCount * Number(selectedEditPackage.ratePerPax || 0);
        }

        const basePrice = Number(selectedEditPackage.price || 0);
        return basePrice + editExcessCost;
    }, [selectedEditPackage, editGuestCount, editExcessCost]);

    const editEstimatedTotal = editPackagePrice + editAddOnsTotal;

    const editPackageCoverageText = useMemo(() => {
        if (!selectedEditPackage) return "Not selected";

        if (selectedEditPackage.pricingType === "perPax") {
            return `₱${selectedEditPackage.ratePerPax}/pax × ${editGuestCount || 0} guest(s)`;
        }

        if (editExcessGuests > 0) {
            return `${selectedEditPackage.includedPax} pax included (+ ${editExcessGuests} excess guest(s) × ₱400)`;
        }

        return `${selectedEditPackage.includedPax} pax included`;
    }, [selectedEditPackage, editGuestCount, editExcessGuests]);

    const saveQuotations = (updated) => {
        setQuotations(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const handleOpenEdit = (quote) => {
        if ((quote.status || "Pending") !== "Pending") return;

        setEditingQuote(quote);
        setEditForm({
            fullName: quote.fullName || "",
            contactNumber: quote.contactNumber || "",
            email: quote.email || "",
            eventType: quote.eventType || "",
            preferredDate: quote.preferredDate || "",
            eventTime: quote.eventTime || "",
            venue: quote.venue || "",
            guests: quote.guests || "",
            packageType: quote.packageType || "",
            classicMenu: quote.classicMenu || "",
            addOns: Array.isArray(quote.addOns) ? quote.addOns : [],
            themePreference: quote.themePreference || "",
            specialRequests: quote.specialRequests || "",
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            if (name === "eventType") {
                updated.packageType = "";
            }

            return updated;
        });
    };

    const handleEditAddonChange = (addonName) => {
        setEditForm((prev) => {
            const alreadySelected = prev.addOns.includes(addonName);

            return {
                ...prev,
                addOns: alreadySelected
                    ? prev.addOns.filter((item) => item !== addonName)
                    : [...prev.addOns, addonName],
            };
        });
    };

    const handleSaveEdit = () => {
        if (!editingQuote) return;

        const updated = quotations.map((quote) => {
            if (quote.id !== editingQuote.id) return quote;

            return {
                ...quote,
                ...editForm,
                packagePrice: editPackagePrice,
                addOnsTotal: editAddOnsTotal,
                estimatedTotal: editEstimatedTotal,
                includedPax: selectedEditPackage?.includedPax || null,
                pricingType: selectedEditPackage?.pricingType || "fixed",
                ratePerPax: selectedEditPackage?.ratePerPax || null,
                excessGuests: editExcessGuests,
                excessCost: editExcessCost,
                updatedAt: new Date().toLocaleString(),
            };
        });

        saveQuotations(updated);
        setEditingQuote(null);
    };

    const handleCancelQuotation = () => {
        if (!cancelTarget) return;

        const updated = quotations.map((quote) => {
            if (quote.id !== cancelTarget.id) return quote;

            return {
                ...quote,
                status: "Cancelled",
                cancelledAt: new Date().toLocaleString(),
            };
        });

        saveQuotations(updated);
        setCancelTarget(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-[#0f4d3c]">My Quotations</h1>
                    <p className="text-gray-500 mt-1">Track your submitted quotation requests.</p>
                </div>

                <Link
                    to="/client/quotation"
                    className="px-5 py-3 rounded-2xl bg-[#0f4d3c] text-white font-semibold hover:bg-[#0c3f31] transition shadow-sm"
                >
                    New Quotation
                </Link>
            </div>

            {sortedQuotations.length === 0 ? (
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 text-center">
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">No quotations yet</h2>
                    <p className="text-gray-500 mt-2 mb-6">
                        You have not submitted any quotation request yet.
                    </p>
                    <Link
                        to="/client/quotation"
                        className="inline-block px-5 py-3 rounded-2xl bg-[#d4af37] text-[#0b4a3a] font-semibold hover:bg-[#c79f23] transition"
                    >
                        Create New Quotation
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedQuotations.map((quote, index) => {
                        const displayId =
                            quote.quotationId || `Q${String(index + 1).padStart(2, "0")}`;
                        const status = quote.status || "Pending";
                        const isPending = status === "Pending";

                        return (
                            <div
                                key={quote.id || index}
                                className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                            {displayId}
                                        </h2>
                                        <p className="text-gray-700 mt-1">
                                            {quote.eventType || "No event type"}
                                        </p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Preferred Date: {quote.preferredDate || "N/A"}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Guests: {quote.guests || quote.numberOfGuests || "N/A"}
                                        </p>
                                        {quote.packageType && (
                                            <p className="text-gray-500 text-sm">
                                                Package: {quote.packageType}
                                            </p>
                                        )}
                                        {quote.themePreference && (
                                            <p className="text-gray-500 text-sm">
                                                Theme: {quote.themePreference}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getStatusClasses(
                                                status
                                            )}`}
                                        >
                                            {status}
                                        </span>
                                        <p className="text-2xl font-bold text-[#d4af37]">
                                            {formatCurrency(
                                                quote.totalAmount || quote.amount || quote.estimatedTotal
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {Array.isArray(quote.addOns) && quote.addOns.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {quote.addOns.map((addon, i) => (
                                            <span
                                                key={`${addon}-${i}`}
                                                className="px-3 py-1 rounded-full border border-gray-200 bg-[#f8fafc] text-sm text-[#0f4d3c]"
                                            >
                                                {addon}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {quote.specialRequests && (
                                    <div className="mt-4 rounded-2xl bg-[#f8fbfa] border border-[#e1ece8] p-4">
                                        <p className="text-sm font-semibold text-[#0f4d3c] mb-1">
                                            Special Requests
                                        </p>
                                        <p className="text-sm text-gray-600 leading-6">
                                            {quote.specialRequests}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                    {isPending ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(quote)}
                                                className="flex-1 px-4 py-3 rounded-2xl bg-[#0f4d3c] text-white font-semibold hover:bg-[#0c3f31] transition"
                                            >
                                                Edit Request
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setCancelTarget(quote)}
                                                className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                                            >
                                                Cancel Request
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
                                        >
                                            Editing and cancellation are only available while pending
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {editingQuote && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4 py-6 overflow-y-auto">
                    <div className="w-full max-w-5xl bg-white rounded-[28px] shadow-2xl border border-[#ead48d] overflow-hidden">
                        <div className="bg-gradient-to-r from-[#0b5a43] to-[#0f6b50] px-6 py-5 text-white flex items-center justify-between">
                            <div>
                                <p className="uppercase tracking-[0.24em] text-xs text-white/75">
                                    Update Quotation
                                </p>
                                <h3 className="text-2xl font-extrabold mt-1">
                                    Edit Pending Request
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingQuote(null)}
                                className="text-2xl font-semibold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
                                <div className="bg-gradient-to-br from-[#0b5a43] via-[#0c6048] to-[#094534] text-white rounded-[24px] p-6 border border-white/10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="h-11 w-11 rounded-2xl bg-[#d4af37] text-[#0f4d3c] flex items-center justify-center text-xl font-extrabold">
                                            ✦
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                                                Live Preview
                                            </p>
                                            <h4 className="text-2xl font-extrabold">
                                                Updated Summary
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="bg-[#fff9ea] text-[#0f4d3c] rounded-[22px] p-5 border-2 border-[#efd67a]">
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-gray-600">Selected Package</span>
                                                <span className="font-semibold text-right max-w-[180px]">
                                                    {editForm.packageType || "Not selected"}
                                                </span>
                                            </div>

                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-gray-600">Package Coverage</span>
                                                <span className="font-semibold text-right max-w-[180px]">
                                                    {editPackageCoverageText}
                                                </span>
                                            </div>

                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-gray-600">Classic Menu</span>
                                                <span className="font-semibold text-right max-w-[180px]">
                                                    {editForm.classicMenu || "Not selected"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-gray-600">Package Price</span>
                                                <span className="font-semibold">
                                                    {editPackagePrice ? formatCurrency(editPackagePrice) : "—"}
                                                </span>
                                            </div>

                                            {!isEditPerPaxPackage && editExcessGuests > 0 && (
                                                <>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-600">Excess Guests</span>
                                                        <span className="font-semibold">{editExcessGuests}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-600">Excess Cost</span>
                                                        <span className="font-semibold">
                                                            {formatCurrency(editExcessCost)}
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-gray-600">Add-ons Total</span>
                                                <span className="font-semibold">
                                                    {editAddOnsTotal ? formatCurrency(editAddOnsTotal) : "₱0"}
                                                </span>
                                            </div>

                                            <div className="border-t border-[#e8cf7a] pt-4 flex items-center justify-between gap-4">
                                                <span className="font-bold text-base">Estimated Total</span>
                                                <span className="font-extrabold text-xl text-[#b99117]">
                                                    {editEstimatedTotal ? formatCurrency(editEstimatedTotal) : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={editForm.fullName}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Contact Number
                                        </label>
                                        <input
                                            type="text"
                                            name="contactNumber"
                                            value={editForm.contactNumber}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Event Type
                                        </label>
                                        <select
                                            name="eventType"
                                            value={editForm.eventType}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        >
                                            <option value="">Select event type</option>
                                            <option value="Wedding">Wedding</option>
                                            <option value="Debut">Debut</option>
                                            <option value="Birthday">Birthday</option>
                                            <option value="Anniversary">Anniversary</option>
                                            <option value="Baptismal">Baptismal</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            name="preferredDate"
                                            value={editForm.preferredDate}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Event Time
                                        </label>
                                        <input
                                            type="time"
                                            name="eventTime"
                                            value={editForm.eventTime}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Venue / Location
                                        </label>
                                        <input
                                            type="text"
                                            name="venue"
                                            value={editForm.venue}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Number of Guests
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            name="guests"
                                            value={editForm.guests}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Preferred Package
                                        </label>
                                        <select
                                            name="packageType"
                                            value={editForm.packageType}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                            disabled={!editForm.eventType}
                                        >
                                            <option value="">
                                                {editForm.eventType ? "Select package" : "Select event type first"}
                                            </option>

                                            {availablePackages.map((pkg, index) => (
                                                <option
                                                    key={`${pkg.eventType}-${pkg.name}-${index}`}
                                                    value={pkg.name}
                                                >
                                                    {pkg.pricingType === "perPax"
                                                        ? `${pkg.name} (₱${pkg.ratePerPax}/pax)`
                                                        : `${pkg.name} (${formatCurrency(pkg.price)} • ${pkg.includedPax} pax included)`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Classic Menu
                                        </label>
                                        <select
                                            name="classicMenu"
                                            value={editForm.classicMenu}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        >
                                            <option value="">Select classic menu</option>
                                            {classicMenus.map((menu) => (
                                                <option key={menu} value={menu}>
                                                    {menu}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-3">
                                            Add-ons
                                        </label>

                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {addOns.map((item) => {
                                                const checked = editForm.addOns.includes(item.name);

                                                return (
                                                    <label
                                                        key={item.name}
                                                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition ${checked
                                                            ? "border-[#d4af37] bg-[#fff8e6] shadow-sm"
                                                            : "border-gray-200 bg-white hover:border-[#d4af37]"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => handleEditAddonChange(item.name)}
                                                                className="accent-[#0f4d3c]"
                                                            />
                                                            <span className="font-medium text-[#0f4d3c]">
                                                                {item.name}
                                                            </span>
                                                        </div>

                                                        <span className="text-[#b99117] font-bold">
                                                            {formatCurrency(item.price)}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Theme / Style Preference
                                        </label>
                                        <input
                                            type="text"
                                            name="themePreference"
                                            value={editForm.themePreference}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Special Requests
                                        </label>
                                        <textarea
                                            rows="4"
                                            name="specialRequests"
                                            value={editForm.specialRequests}
                                            onChange={handleEditChange}
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37] resize-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveEdit}
                                            className="flex-1 px-4 py-3 rounded-2xl bg-[#0f4d3c] text-white font-semibold hover:bg-[#0c3f31] transition"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingQuote(null)}
                                            className="flex-1 px-4 py-3 rounded-2xl bg-[#d4af37] text-[#0b4a3a] font-semibold hover:bg-[#c79f23] transition"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {cancelTarget && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-red-100 p-6">
                        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                            !
                        </div>
                        <h3 className="text-2xl font-extrabold text-center text-[#0f4d3c]">
                            Cancel quotation?
                        </h3>
                        <p className="text-gray-600 text-center mt-3 leading-7">
                            This will mark your quotation request as cancelled. You can no longer
                            edit it once cancelled.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleCancelQuotation}
                                className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                            >
                                Yes, Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setCancelTarget(null)}
                                className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                            >
                                Keep Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientQuotations;