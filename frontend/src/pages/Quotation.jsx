import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quotationService } from "../services/quotationService.js";

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

    const name =
        localStorage.getItem("currentClientName") ||
        localStorage.getItem("clientName") ||
        user?.name ||
        "";

    return { email, name };
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

const PAX_RATE = 400;

const dynamicPerPaxPackages = [
    {
        id: "birthday-catering",
        name: "Birthday Catering Package",
        eventType: "Birthday",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
        includedPax: null,
        features: [
            "Flexible Catering Setup",
            "Classic Menu Selection",
            "Basic Buffet Setup",
            "Complete Cutleries",
            "Food Attendants",
        ],
    },
    {
        id: "anniversary-catering",
        name: "Anniversary Catering Package",
        eventType: "Anniversary",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
        includedPax: null,
        features: [
            "Flexible Catering Setup",
            "Classic Menu Selection",
            "Basic Buffet Setup",
            "Complete Cutleries",
            "Food Attendants",
        ],
    },
    {
        id: "baptismal-catering",
        name: "Baptismal Catering Package",
        eventType: "Baptismal",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
        includedPax: null,
        features: [
            "Flexible Catering Setup",
            "Classic Menu Selection",
            "Basic Buffet Setup",
            "Complete Cutleries",
            "Food Attendants",
        ],
    },
];

const debutPackages = [
    {
        id: "classic-debut",
        name: "Classic Debut",
        eventType: "Debut",
        pricingType: "fixed",
        price: 48000,
        includedPax: 100,
        features: [
            "Elegant Stage Backdrop",
            "Debutante’s Elegant Couch",
            "Red Carpet on the Aisle",
            "Flower Arch",
            "18 Candles Standee",
            "3 Main Course",
            "Soup / Pasta / Salad / Dessert",
            "Bottomless Iced Tea & Purified Water",
            "Complete Catering Set-up",
            "Tiffany Chairs with Cushion and Ribbons",
            "Round Tables with Cloth & Centerpiece",
            "Buffet Table with Chafing Dishes",
            "Cake & Gift Table Setup",
            "Complete Cutleries",
            "Waiters & Food Attendants",
            "18 Fresh Stemmed Roses",
            "18 Candles",
        ],
    },
    {
        id: "rising-star-debut",
        name: "Rising Star Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 55000,
        includedPax: 100,
        features: [
            "Elegant Stage Backdrop with Name",
            "Debutante’s Couch",
            "Red Carpet",
            "Flower Arch",
            "18 Candles Standee",
            "3 Main Course",
            "Soup / Pasta / Salad / Dessert",
            "Bottomless Drinks",
            "Complete Catering Set-up",
            "Tiffany Chairs",
            "Buffet & Table Setup",
            "Waiters & Attendants",
            "18 Roses",
            "18 Candles",
            "Wine for Toasting",
            "Basic Sounds and Lights",
        ],
    },
    {
        id: "all-star-debut",
        name: "All Star Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 70000,
        includedPax: 100,
        features: [
            "Elegant Stage Backdrop with Name",
            "Debutante’s Couch",
            "Red Carpet",
            "Flower Arch",
            "18 Candles Standee",
            "3 Main Course",
            "Full Catering Setup",
            "Bottomless Drinks",
            "Buffet Setup",
            "Waiters & Staff",
            "18 Roses",
            "18 Candles",
            "Wine for Toasting",
            "2-tier Debut Cake",
            "Photobooth (2 hrs)",
            "Customized Sintra Board",
            "Host with Program",
            "Sounds and Lights",
        ],
    },
    {
        id: "diamond-elite-debut",
        name: "Diamond Elite Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 80000,
        includedPax: 100,
        features: [
            "Elegant Backdrop with Name",
            "Debutante Couch",
            "Red Carpet",
            "Flower Arch",
            "18 Candles Standee",
            "4 Main Course",
            "Soup / Pasta / Salad / Dessert",
            "Bottomless Drinks",
            "Complete Catering Setup",
            "Tiffany Chairs",
            "Buffet Setup",
            "Waiters & Staff",
            "18 Roses",
            "18 Candles",
            "Wine for Toasting",
            "2-tier Cake",
            "Photobooth",
            "Customized Sintra Board",
            "Host with Program",
            "Sounds and Lights",
            "Projector with Screen",
            "Sweets Table",
            "Program Coordinator",
            "Debut Assistant",
            "Free use of Mannequin",
        ],
    },
];

const weddingPackages = [
    {
        id: "basic-wedding",
        name: "Basic Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 58000,
        includedPax: 100,
        features: [
            "2 Main Course",
            "Soup / Pasta / Salad / Dessert",
            "Round Tables with Cloth",
            "Charger Plates (VIP)",
            "Buffet Table Setup",
            "Complete Cutleries",
            "Waiters & Food Attendants",
            "Bottomless Drinks",
            "Elegant Couch",
            "Red Carpet",
            "Wedding Arch",
            "Backdrop",
            "Photo Booth (2 hrs)",
            "Host with Program",
            "Free Dove",
            "Free Bottle of Wine",
        ],
    },
    {
        id: "enhanced-wedding",
        name: "Enhanced Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 65000,
        includedPax: 100,
        features: [
            "2 Main Course",
            "Soup / Pasta / Dessert",
            "Table Setup",
            "Buffet Setup",
            "Waiters & Staff",
            "Bottomless Drinks",
            "Sounds & Lights",
            "Speakers",
            "Wireless Microphones",
            "DJ",
            "Photobooth (2 hrs)",
            "Host with Program",
            "Free Dove",
            "Free Bottle of Wine",
        ],
    },
    {
        id: "premium-wedding",
        name: "Premium Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 75000,
        includedPax: 100,
        features: [
            "3 Main Course",
            "Full Catering Setup",
            "VIP Charger Plates",
            "Buffet Setup",
            "Complete Cutleries",
            "Waiters & Staff",
            "Bottomless Drinks",
            "Sounds & Lights",
            "Host with Program",
            "Photo Coverage",
            "Unlimited Shots",
            "Flashdrive",
            "Cake (2-tier)",
            "Free Dove",
            "Free Wine",
        ],
    },
    {
        id: "elite-wedding",
        name: "Elite Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 82000,
        includedPax: 100,
        features: [
            "3 Main Course",
            "Full Catering Setup",
            "Buffet Setup",
            "Waiters & Staff",
            "Bottomless Drinks",
            "Sounds & Lights",
            "Host",
            "Photo Coverage",
            "Photobooth",
            "Cake",
            "HMUA (Hair & Make-up)",
            "Grooming",
            "Free Dove",
            "Free Wine",
            "Free Sash",
        ],
    },
    {
        id: "ultimate-wedding",
        name: "Ultimate Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 90000,
        includedPax: 100,
        features: [
            "3 Main Course",
            "Full Catering Setup",
            "Buffet Setup",
            "Waiters & Staff",
            "Bottomless Drinks",
            "Sounds & Lights",
            "Host",
            "Photo & Video Coverage",
            "MTV Highlights",
            "Photobooth",
            "Cake",
            "HMUA",
            "Grooming",
            "Free Dove",
            "Free Wine",
            "Free Sash",
            "Free Mannequin",
        ],
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

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

function Quotation({ mode = "public" }) {
    const navigate = useNavigate();
    const isClientMode = mode === "client";
    const currentClient = getCurrentClient();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedQuotation, setSubmittedQuotation] = useState(null);

    const [formData, setFormData] = useState({
        fullName: isClientMode ? currentClient.name : "",
        contactNumber: "",
        email: isClientMode ? currentClient.email : "",
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

    useEffect(() => {
        const savedPackage = JSON.parse(localStorage.getItem("selectedPackage") || "null");
        if (!savedPackage) return;

        setFormData((prev) => ({
            ...prev,
            eventType: savedPackage.eventType || prev.eventType,
            packageType: savedPackage.title || savedPackage.name || prev.packageType,
            guests: savedPackage.includedPax || savedPackage.pax?.includes("100") ? "100" : prev.guests,
        }));
    }, []);

    const availablePackages = useMemo(() => {
        if (!formData.eventType) return [];

        if (formData.eventType === "Wedding") return weddingPackages;
        if (formData.eventType === "Debut") return debutPackages;

        if (
            formData.eventType === "Birthday" ||
            formData.eventType === "Anniversary" ||
            formData.eventType === "Baptismal"
        ) {
            return dynamicPerPaxPackages.filter(
                (pkg) => pkg.eventType === formData.eventType
            );
        }

        return [];
    }, [formData.eventType]);

    const selectedPackage = useMemo(() => {
        return (
            allPackages.find(
                (pkg) =>
                    pkg.name === formData.packageType &&
                    pkg.eventType === formData.eventType
            ) || null
        );
    }, [formData.packageType, formData.eventType]);

    const addOnsTotal = useMemo(() => {
        return formData.addOns.reduce((sum, itemName) => {
            const matched = addOns.find((item) => item.name === itemName);
            return sum + Number(matched?.price || 0);
        }, 0);
    }, [formData.addOns]);

    const guestCount = Number(formData.guests || 0);
    const isPerPaxPackage = selectedPackage?.pricingType === "perPax";

    const excessGuests = useMemo(() => {
        if (!selectedPackage) return 0;
        if (selectedPackage.pricingType === "perPax") return 0;

        const included = Number(selectedPackage.includedPax || 0);
        return guestCount > included ? guestCount - included : 0;
    }, [selectedPackage, guestCount]);

    const excessCost = useMemo(() => {
        if (!selectedPackage) return 0;
        if (selectedPackage.pricingType === "perPax") return 0;

        return excessGuests * PAX_RATE;
    }, [selectedPackage, excessGuests]);

    const packagePrice = useMemo(() => {
        if (!selectedPackage) return 0;

        if (selectedPackage.pricingType === "perPax") {
            return guestCount * Number(selectedPackage.ratePerPax || 0);
        }

        const basePrice = Number(selectedPackage.price || 0);
        return basePrice + excessCost;
    }, [selectedPackage, guestCount, excessCost]);

    const estimatedTotal = packagePrice + addOnsTotal;

    const packageCoverageText = useMemo(() => {
        if (!selectedPackage) return "Not selected";

        if (selectedPackage.pricingType === "perPax") {
            return `₱${selectedPackage.ratePerPax}/pax × ${guestCount || 0} guest(s)`;
        }

        if (excessGuests > 0) {
            return `${selectedPackage.includedPax} pax included (+ ${excessGuests} excess guest(s) × ₱400)`;
        }

        return `${selectedPackage.includedPax} pax included`;
    }, [selectedPackage, guestCount, excessGuests]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
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

    const handleAddonChange = (addonName) => {
        setFormData((prev) => {
            const alreadySelected = prev.addOns.includes(addonName);

            return {
                ...prev,
                addOns: alreadySelected
                    ? prev.addOns.filter((item) => item !== addonName)
                    : [...prev.addOns, addonName],
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const currentClientData = getCurrentClient();
        const storageEmail = isClientMode
            ? currentClientData.email
            : (formData.email || "").trim().toLowerCase();

        const storageKey = getQuotationKey(storageEmail);
        const existing = safeParse(storageKey, []);

        const nextNumber = existing.length + 1;
        const displayId = `Q${String(nextNumber).padStart(2, "0")}`;

        const quotationData = {
            id: `quotation_${Date.now()}`,
            quotationId: displayId,
            ownerEmail: storageEmail,
            ownerName:
                (isClientMode ? currentClientData.name : formData.fullName) || "Client",
            ...formData,
            email: storageEmail || formData.email,
            fullName:
                (isClientMode ? currentClientData.name : formData.fullName) ||
                formData.fullName,
            packagePrice,
            addOnsTotal,
            estimatedTotal,
            includedPax: selectedPackage?.includedPax || null,
            pricingType: selectedPackage?.pricingType || "fixed",
            ratePerPax: selectedPackage?.ratePerPax || null,
            excessGuests,
            excessCost,
            packageInclusions: selectedPackage?.features || [],
            status: "Pending",
            createdAt: new Date().toLocaleString(),
        };

        localStorage.setItem(storageKey, JSON.stringify([quotationData, ...existing]));
        setSubmittedQuotation(quotationData);
        setShowSuccessModal(true);
        localStorage.removeItem("selectedPackage");
    };

    const handleViewMyQuotations = () => {
        setShowSuccessModal(false);
        navigate("/client/quotations");
    };

    const handleBackAfterSubmit = () => {
        setShowSuccessModal(false);
        if (isClientMode) {
            navigate("/client/dashboard");
        } else {
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f1e7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
                <div className="text-center mb-10">
                    <p className="uppercase tracking-[0.35em] text-[11px] text-[#b99117] font-semibold">
                        Ebit&apos;s Catering
                    </p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f4d3c] mt-3">
                        Get a <span className="text-[#d4af37]">Quotation</span>
                    </h1>
                    <p className="text-gray-600 mt-4 max-w-2xl mx-auto leading-7">
                        Fill out the form below and send us your event details so we can prepare
                        the most suitable catering offer for you.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[0.95fr_1.25fr] gap-8 items-start">
                    <div className="bg-gradient-to-br from-[#0b5a43] via-[#0c6048] to-[#094534] text-white rounded-[28px] p-7 sm:p-8 shadow-[0_18px_45px_rgba(11,90,67,0.18)] border border-white/10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-11 w-11 rounded-2xl bg-[#d4af37] text-[#0f4d3c] flex items-center justify-center text-xl font-extrabold shadow-md">
                                ✦
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                                    Event Planning
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold">
                                    Plan your event with us
                                </h2>
                            </div>
                        </div>

                        <p className="text-white/90 leading-8 mb-6">
                            Select your actual package, preferred classic menu, and add-ons so
                            we can prepare a more accurate quotation for your event.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                            {[
                                "Weddings",
                                "Debuts",
                                "Birthdays",
                                "Anniversaries",
                                "Baptismal celebrations",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/10 rounded-[22px] p-5 border border-white/10 mb-6">
                            <h3 className="text-xl font-bold text-[#f5c94a] mb-3">
                                Contact Information
                            </h3>
                            <div className="space-y-1.5 text-white/90 leading-7">
                                <p>Phone: 0917 679 0643</p>
                                <p>Facebook: facebook.com/ebitscateringandservices</p>
                                <p>Location: Dasmariñas City, Cavite</p>
                            </div>
                        </div>

                        <div className="bg-[#fff9ea] text-[#0f4d3c] rounded-[22px] p-5 border-2 border-[#efd67a] shadow-inner">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h3 className="text-xl font-extrabold">Estimated Summary</h3>
                                <span className="text-xs font-semibold bg-[#d4af37]/20 text-[#a47b00] px-3 py-1 rounded-full">
                                    Live Preview
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-gray-600">Selected Package</span>
                                    <span className="font-semibold text-right max-w-[190px]">
                                        {formData.packageType || "Not selected"}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-gray-600">Package Coverage</span>
                                    <span className="font-semibold text-right max-w-[190px]">
                                        {packageCoverageText}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-gray-600">Classic Menu</span>
                                    <span className="font-semibold text-right max-w-[190px]">
                                        {formData.classicMenu || "Not selected"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-gray-600">Package Price</span>
                                    <span className="font-semibold">
                                        {packagePrice ? formatCurrency(packagePrice) : "—"}
                                    </span>
                                </div>

                                {!isPerPaxPackage && excessGuests > 0 && (
                                    <>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-gray-600">Excess Guests</span>
                                            <span className="font-semibold">{excessGuests}</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-gray-600">Excess Cost</span>
                                            <span className="font-semibold">
                                                {formatCurrency(excessCost)}
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-gray-600">Add-ons Total</span>
                                    <span className="font-semibold">
                                        {addOnsTotal ? formatCurrency(addOnsTotal) : "₱0"}
                                    </span>
                                </div>

                                <div className="border-t border-[#e8cf7a] pt-4 flex items-center justify-between gap-4">
                                    <span className="font-bold text-base">Estimated Total</span>
                                    <span className="font-extrabold text-xl text-[#b99117]">
                                        {estimatedTotal ? formatCurrency(estimatedTotal) : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {selectedPackage?.features?.length > 0 && (
                            <div className="mt-6 bg-white/10 rounded-[22px] p-5 border border-white/10">
                                <h3 className="text-xl font-bold text-[#f5c94a] mb-3">
                                    Package Inclusions
                                </h3>
                                <ul className="space-y-2 text-sm text-white/90">
                                    {selectedPackage.features.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="mt-1.5 h-2 w-2 rounded-full bg-[#f5c94a] shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[28px] p-7 sm:p-8 shadow-[0_18px_45px_rgba(0,0,0,0.06)] border border-gray-100">
                        <div className="flex items-center justify-between gap-4 mb-8">
                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-[#b99117] font-semibold mb-2">
                                    Request Details
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f4d3c]">
                                    Quotation Request Form
                                </h2>
                            </div>

                            <div className="hidden md:flex items-center gap-2 rounded-full bg-[#f8f3e4] px-4 py-2 border border-[#ecd88d]">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#0f8a61]" />
                                <span className="text-sm font-medium text-[#0f4d3c]">
                                    Ready to submit
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your contact number"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Event Type
                                </label>
                                <select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
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
                                    value={formData.preferredDate}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Event Time
                                </label>
                                <input
                                    type="time"
                                    name="eventTime"
                                    value={formData.eventTime}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Venue / Location
                                </label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="Enter venue or event location"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Number of Guests
                                </label>
                                <input
                                    type="number"
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    placeholder="Enter number of guests"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Preferred Package
                                </label>
                                <select
                                    name="packageType"
                                    value={formData.packageType}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                    required
                                    disabled={!formData.eventType}
                                >
                                    <option value="">
                                        {formData.eventType ? "Select package" : "Select event type first"}
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
                                    value={formData.classicMenu}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
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
                                        const checked = formData.addOns.includes(item.name);

                                        return (
                                            <label
                                                key={item.name}
                                                className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 cursor-pointer transition ${checked
                                                    ? "border-[#d4af37] bg-[#fff8e6] shadow-sm"
                                                    : "border-gray-200 bg-white hover:border-[#d4af37]"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => handleAddonChange(item.name)}
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
                                    value={formData.themePreference}
                                    onChange={handleChange}
                                    placeholder="Enter preferred motif, theme, or style"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Special Requests
                                </label>
                                <textarea
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Add your preferred menu, setup, add-ons, or other requests"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition resize-none"
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#0f4d3c] text-white py-3.5 rounded-2xl font-bold hover:bg-[#0c3f31] transition shadow-md"
                                >
                                    Submit Request
                                </button>

                                {isClientMode ? (
                                    <Link
                                        to="/client/dashboard"
                                        className="flex-1 bg-[#d4af37] text-[#0b4a3a] py-3.5 rounded-2xl font-bold text-center hover:bg-[#c79f23] transition shadow-sm"
                                    >
                                        Back to Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        to="/"
                                        className="flex-1 bg-[#d4af37] text-[#0b4a3a] py-3.5 rounded-2xl font-bold text-center hover:bg-[#c79f23] transition shadow-sm"
                                    >
                                        Back to Home
                                    </Link>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showSuccessModal && submittedQuotation && (
                <div className="fixed inset-0 z-50 bg-[#06261d]/45 backdrop-blur-[3px] flex items-center justify-center px-4 py-6">
                    <div className="w-full max-w-2xl rounded-[30px] overflow-hidden bg-white shadow-[0_30px_80px_rgba(0,0,0,0.22)] border border-[#ead48d] animate-[fadeIn_.2s_ease-out]">
                        <div className="relative bg-gradient-to-r from-[#0b5a43] via-[#0e6a4f] to-[#0f4d3c] px-7 sm:px-8 py-7 text-white">
                            <button
                                type="button"
                                onClick={() => setShowSuccessModal(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition text-xl font-semibold"
                            >
                                ×
                            </button>

                            <div className="flex items-start gap-4 pr-10">
                                <div className="w-16 h-16 rounded-[20px] bg-[#f5c94a] text-[#0b4a3a] flex items-center justify-center text-3xl font-extrabold shadow-lg">
                                    ✓
                                </div>

                                <div>
                                    <p className="uppercase tracking-[0.28em] text-[11px] text-white/75 mb-1">
                                        Request Confirmed
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                                        Your quotation has been submitted successfully
                                    </h3>
                                    <p className="text-white/80 mt-2 leading-7 max-w-xl">
                                        Thank you for choosing Ebit&apos;s Catering. Your request is now
                                        recorded and ready for review by the admin.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-7 sm:p-8">
                            <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-5">
                                <div className="rounded-[24px] border border-[#ead48d] bg-[#fff9eb] p-5">
                                    <p className="text-xs uppercase tracking-[0.22em] text-[#b99117] font-semibold mb-3">
                                        Quotation Details
                                    </p>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-gray-500">Quotation ID</span>
                                            <span className="font-bold text-[#0f4d3c] text-base">
                                                {submittedQuotation.quotationId}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-gray-500">Client Name</span>
                                            <span className="font-semibold text-[#0f4d3c] text-right">
                                                {submittedQuotation.fullName}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-gray-500">Event Type</span>
                                            <span className="font-semibold text-[#0f4d3c]">
                                                {submittedQuotation.eventType}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-gray-500">Status</span>
                                            <span className="inline-flex items-center rounded-full bg-[#fff1c4] text-[#9b7400] px-3 py-1 text-xs font-bold">
                                                {submittedQuotation.status}
                                            </span>
                                        </div>

                                        <div className="border-t border-[#edd98e] pt-3 flex items-center justify-between gap-4">
                                            <span className="font-semibold text-[#0f4d3c]">
                                                Estimated Total
                                            </span>
                                            <span className="font-extrabold text-xl text-[#0f4d3c]">
                                                {formatCurrency(submittedQuotation.estimatedTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-[#dfe7e3] bg-[#f8fbfa] p-5">
                                    <p className="text-xs uppercase tracking-[0.22em] text-[#0f8a61] font-semibold mb-3">
                                        What happens next?
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#0f4d3c] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                                1
                                            </div>
                                            <p className="text-sm text-gray-600 leading-6">
                                                The admin will review your selected package, date,
                                                guest count, and add-ons.
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#d4af37] text-[#0f4d3c] flex items-center justify-center text-sm font-bold shrink-0">
                                                2
                                            </div>
                                            <p className="text-sm text-gray-600 leading-6">
                                                Your quotation status will appear in your client
                                                quotations page once updated.
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#e8f3ef] text-[#0f4d3c] border border-[#bcd7cb] flex items-center justify-center text-sm font-bold shrink-0">
                                                3
                                            </div>
                                            <p className="text-sm text-gray-600 leading-6">
                                                You may proceed to your portal to monitor the
                                                request and wait for confirmation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mt-7">
                                <button
                                    type="button"
                                    onClick={handleViewMyQuotations}
                                    className="w-full bg-[#0f4d3c] text-white py-3.5 rounded-2xl font-bold hover:bg-[#0c3f31] transition shadow-md"
                                >
                                    View My Quotations
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBackAfterSubmit}
                                    className="w-full bg-[#d4af37] text-[#0b4a3a] py-3.5 rounded-2xl font-bold hover:bg-[#c79f23] transition shadow-sm"
                                >
                                    {isClientMode ? "Back to Dashboard" : "Back to Home"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Quotation;