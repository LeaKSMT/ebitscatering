import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    BadgeCheck,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Mail,
    MapPin,
    Phone,
    Sparkles,
    Users,
    Wallet,
    X,
} from "lucide-react";
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

function formatTimeDisplay(value) {
    if (!value) return "Select event time";
    const parsed = new Date(`2000-01-01T${value}`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
    });
}

function parseDateParts(value) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
}

function dateFromInputValue(value) {
    const parts = parseDateParts(value);
    if (!parts) return null;
    return new Date(parts.year, parts.month - 1, parts.day);
}

function toInputDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(value) {
    const date = dateFromInputValue(value);
    if (!date) return "Select preferred date";
    return date.toLocaleDateString("en-PH", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function getCalendarDays(viewDate) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayIndex = firstDay.getDay();
    const startDate = new Date(year, month, 1 - startDayIndex);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });
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
    hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.58,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const softReveal = {
    hidden: { opacity: 0, y: 18, scale: 0.985 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

function Quotation({ mode = "public" }) {
    const navigate = useNavigate();
    const isClientMode = mode === "client";
    const currentClient = getCurrentClient();

    const [theme, setTheme] = useState(
        () => localStorage.getItem("clientPortalTheme") || "light"
    );

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedQuotation, setSubmittedQuotation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const savedPackage = JSON.parse(localStorage.getItem("selectedPackage") || "null");
        if (!savedPackage) return;

        setFormData((prev) => ({
            ...prev,
            eventType: savedPackage.eventType || prev.eventType,
            packageType: savedPackage.title || savedPackage.name || prev.packageType,
            guests:
                savedPackage.includedPax || savedPackage.pax?.includes("100")
                    ? "100"
                    : prev.guests,
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

    const selectedAddOnObjects = useMemo(() => {
        return addOns.filter((item) => formData.addOns.includes(item.name));
    }, [formData.addOns]);

    const completionStats = useMemo(() => {
        const fields = [
            formData.fullName,
            formData.contactNumber,
            formData.email,
            formData.eventType,
            formData.preferredDate,
            formData.venue,
            formData.guests,
            formData.packageType,
        ];

        const filled = fields.filter((value) => String(value || "").trim() !== "").length;
        const total = fields.length;
        const percent = Math.round((filled / total) * 100);

        return { filled, total, percent };
    }, [formData]);

    const heroCards = useMemo(() => {
        return [
            {
                icon: CalendarDays,
                label: "Event Schedule",
                value: formData.preferredDate ? "Date selected" : "No date set",
            },
            {
                icon: Users,
                label: "Guest Count",
                value: guestCount > 0 ? `${guestCount} guest(s)` : "No guests added",
            },
            {
                icon: Wallet,
                label: "Total Estimate",
                value: estimatedTotal > 0 ? formatCurrency(estimatedTotal) : "Not calculated",
            },
        ];
    }, [formData.preferredDate, guestCount, estimatedTotal]);

    const isDark = theme === "dark";

    const pageShell = isDark
        ? "min-h-screen bg-[linear-gradient(180deg,#071c16_0%,#0a241d_38%,#102d24_100%)]"
        : "min-h-screen bg-[linear-gradient(180deg,#f4f7f4_0%,#eef3f0_36%,#f8f2e7_100%)]";

    const shellCard = isDark
        ? "overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.98)_0%,rgba(13,40,32,0.98)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.24)]"
        : "overflow-hidden rounded-[34px] border border-[#dce7e2] bg-white shadow-[0_24px_70px_rgba(14,61,47,0.1)]";

    const softCard = isDark
        ? "rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.98)_0%,rgba(13,40,32,0.98)_100%)] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.18)]"
        : "rounded-[32px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]";

    const glassLine = isDark ? "border-white/10" : "border-[#edf2ef]";
    const strongText = isDark ? "text-white" : "text-[#0f4d3c]";
    const mutedText = isDark ? "text-white/70" : "text-slate-500";
    const mutedText2 = isDark ? "text-white/55" : "text-slate-400";
    const smartCard = isDark
        ? "mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,36,29,0.98)_0%,rgba(16,44,35,0.98)_100%)] p-5"
        : "mt-6 rounded-[28px] border border-[#e8efeb] bg-[linear-gradient(180deg,#fbfdfc_0%,#f7faf8_100%)] p-5";

    const actionAltButton =
        "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#e1b93e_0%,#d4af37_100%)] py-3.5 text-center font-bold text-[#0b4a3a] shadow-sm transition hover:-translate-y-0.5 hover:brightness-95";

    const inputClass = isDark
        ? "w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,43,35,0.98)_100%)] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
        : "w-full rounded-2xl border border-[#d7e1dc] bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f8f5_100%)] px-4 py-3.5 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]";

    const textareaClass = isDark
        ? "w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,43,35,0.98)_100%)] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 resize-none"
        : "w-full rounded-2xl border border-[#d7e1dc] bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f8f5_100%)] px-4 py-3.5 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 resize-none shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]";

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

    const handleTimeChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            eventTime: value,
        }));
    };

    const handleDateChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            preferredDate: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const currentClientData = getCurrentClient();
            const normalizedEmail = (
                isClientMode ? currentClientData.email : formData.email
            )
                .trim()
                .toLowerCase();

            const quotationId = `Q${Date.now()}`;

            const payload = {
                quotation_id: quotationId,
                owner_email: normalizedEmail,
                owner_name:
                    (isClientMode ? currentClientData.name : formData.fullName) || "Client",
                full_name:
                    (isClientMode ? currentClientData.name : formData.fullName) ||
                    formData.fullName,
                email: normalizedEmail,
                contact_number: formData.contactNumber,
                event_type: formData.eventType,
                preferred_date: formData.preferredDate,
                event_time: formData.eventTime || null,
                venue: formData.venue,
                guests: Number(formData.guests || 0),
                package_type: formData.packageType,
                classic_menu: formData.classicMenu || null,
                add_ons: formData.addOns,
                theme_preference: formData.themePreference || null,
                special_requests: formData.specialRequests || null,
                package_price: Number(packagePrice || 0),
                add_ons_total: Number(addOnsTotal || 0),
                estimated_total: Number(estimatedTotal || 0),
                included_pax: selectedPackage?.includedPax || null,
                pricing_type: selectedPackage?.pricingType || "fixed",
                rate_per_pax: selectedPackage?.ratePerPax || null,
                excess_guests: Number(excessGuests || 0),
                excess_cost: Number(excessCost || 0),
                package_inclusions: selectedPackage?.features || [],
                status: "Pending",
            };

            await quotationService.createQuotation(payload);

            setSubmittedQuotation({
                quotationId,
                fullName: payload.full_name,
                eventType: payload.event_type,
                status: payload.status,
                estimatedTotal: payload.estimated_total,
            });

            setShowSuccessModal(true);
            localStorage.removeItem("selectedPackage");
        } catch (error) {
            console.error("Quotation submit error:", error);
            alert(error.message || "Failed to submit quotation.");
        } finally {
            setIsSubmitting(false);
        }
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
        <div className={pageShell}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.35, 0.22] }}
                        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-[-90px] top-24 h-80 w-80 rounded-full bg-[#0f6b52]/10 blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.3, 0.18] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                        className="absolute right-[-110px] top-32 h-[26rem] w-[26rem] rounded-full bg-[#d4af37]/12 blur-3xl"
                    />
                    <motion.div
                        animate={{ y: [0, -12, 0], opacity: [0.15, 0.22, 0.15] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                        className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#0f4d3c]/8 blur-3xl"
                    />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
                    <motion.section variants={fadeUp} className={shellCard}>
                        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_26%,#0f6b52_68%,#18a06c_100%)] px-6 py-8 text-white md:px-8 md:py-10 lg:px-10 lg:py-11">
                            <div className="pointer-events-none absolute inset-0">
                                <motion.div
                                    animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -right-14 -top-10 h-56 w-56 rounded-full bg-[#f5c94a]/25 blur-3xl"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.16, 0.08] }}
                                    transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                    className="absolute -left-10 bottom-[-30px] h-40 w-40 rounded-full bg-white/10 blur-3xl"
                                />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_34%)]" />
                            </div>

                            <div className="relative grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-md">
                                        <Sparkles size={13} />
                                        Luxury Event Quotation
                                    </div>

                                    <h1 className="mt-5 max-w-4xl text-3xl font-extrabold leading-tight md:text-5xl">
                                        Build your <span className="text-[#f5c94a]">dream event</span> quotation with a premium experience
                                    </h1>

                                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                        Choose your package, customize your setup, and submit a polished quotation request that feels elegant, premium, and fully aligned with the Ebit’s Catering brand.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                    {heroCards.map((item) => (
                                        <MiniHeroCard
                                            key={item.label}
                                            icon={item.icon}
                                            label={item.label}
                                            value={item.value}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <div className="mt-8 grid gap-8 xl:grid-cols-[0.97fr_1.23fr]">
                        <motion.aside variants={softReveal} className="space-y-6">
                            <div className={isDark
                                ? "overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#0d5b44_0%,#0a4a39_100%)] p-6 text-white shadow-[0_22px_55px_rgba(0,0,0,0.25)] sm:p-7"
                                : "overflow-hidden rounded-[32px] border border-[#dce7e2] bg-[linear-gradient(180deg,#0d5b44_0%,#0a4a39_100%)] p-6 text-white shadow-[0_22px_55px_rgba(11,90,67,0.2)] sm:p-7"
                            }>
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        animate={{ rotate: [0, -6, 0], scale: [1, 1.04, 1] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#f5c94a] text-[#0b4a3a] shadow-lg"
                                    >
                                        <Sparkles size={24} />
                                    </motion.div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                                            Event Planning Suite
                                        </p>
                                        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                                            Design your event with confidence
                                        </h2>
                                        <p className="mt-3 text-sm leading-7 text-white/85">
                                            Select the right event type, match it with the best package, and let the system prepare a live estimate for your celebration.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    {[
                                        "Weddings",
                                        "Debuts",
                                        "Birthdays",
                                        "Anniversaries",
                                        "Baptismal celebrations",
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.28, delay: index * 0.04 }}
                                            whileHover={{ y: -2 }}
                                            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm"
                                        >
                                            {item}
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                                    <h3 className="text-lg font-extrabold text-[#f5c94a]">
                                        Contact Information
                                    </h3>
                                    <div className="mt-4 space-y-3 text-sm text-white/90">
                                        <ContactRow icon={Phone} text="0917 679 0643" />
                                        <ContactRow icon={Mail} text="facebook.com/ebitscateringandservices" />
                                        <ContactRow icon={MapPin} text="Dasmariñas City, Cavite" />
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                variants={softReveal}
                                className={isDark
                                    ? "overflow-hidden rounded-[32px] border border-[rgba(212,175,55,0.28)] bg-[linear-gradient(180deg,rgba(88,67,20,0.16)_0%,rgba(120,91,27,0.12)_100%)] shadow-[0_18px_42px_rgba(0,0,0,0.18)]"
                                    : "overflow-hidden rounded-[32px] border border-[#ead48d] bg-[linear-gradient(180deg,#fffdf7_0%,#fff7e5_100%)] shadow-[0_18px_42px_rgba(212,175,55,0.14)]"
                                }
                            >
                                <div className={isDark ? "border-b border-[rgba(212,175,55,0.22)] px-6 py-5" : "border-b border-[#ecd88d] px-6 py-5"}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b99117]">
                                                Live Preview
                                            </p>
                                            <h3 className={`mt-1 text-2xl font-extrabold ${strongText}`}>
                                                Estimated Summary
                                            </h3>
                                        </div>

                                        <div className={isDark
                                            ? "rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-bold text-[#f5cf67]"
                                            : "rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-bold text-[#9b7400]"
                                        }>
                                            Real Time
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 px-6 py-6 text-sm">
                                    <SummaryRow label="Selected Package" value={formData.packageType || "Not selected"} multiLine isDark={isDark} />
                                    <SummaryRow label="Package Coverage" value={packageCoverageText} multiLine isDark={isDark} />
                                    <SummaryRow label="Classic Menu" value={formData.classicMenu || "Not selected"} isDark={isDark} />
                                    <SummaryRow label="Package Price" value={packagePrice ? formatCurrency(packagePrice) : "—"} isDark={isDark} />

                                    {!isPerPaxPackage && excessGuests > 0 && (
                                        <>
                                            <SummaryRow label="Excess Guests" value={String(excessGuests)} isDark={isDark} />
                                            <SummaryRow label="Excess Cost" value={formatCurrency(excessCost)} isDark={isDark} />
                                        </>
                                    )}

                                    <SummaryRow label="Add-ons Total" value={addOnsTotal ? formatCurrency(addOnsTotal) : "₱0"} isDark={isDark} />

                                    <div className={isDark
                                        ? "rounded-[24px] border border-[rgba(212,175,55,0.22)] bg-[rgba(255,255,255,0.04)] px-4 py-4 shadow-sm"
                                        : "rounded-[24px] border border-[#ecd88d] bg-white/75 px-4 py-4 shadow-sm"
                                    }>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className={`text-base font-bold ${strongText}`}>
                                                Estimated Total
                                            </span>
                                            <span className="text-2xl font-extrabold text-[#b99117]">
                                                {estimatedTotal ? formatCurrency(estimatedTotal) : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={softReveal} className={softCard}>
                                <div className="flex items-center gap-3">
                                    <div className={isDark
                                        ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(21,64,50,0.78)] text-[#98efcc]"
                                        : "flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]"
                                    }>
                                        <BadgeCheck size={22} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b99117]">
                                            Submission Progress
                                        </p>
                                        <h3 className={`mt-1 text-xl font-extrabold ${strongText}`}>
                                            Form Completion
                                        </h3>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                        <span className={`font-semibold ${strongText}`}>
                                            {completionStats.filled} of {completionStats.total} key fields completed
                                        </span>
                                        <span className="font-bold text-[#b99117]">
                                            {completionStats.percent}%
                                        </span>
                                    </div>

                                    <div className={isDark ? "h-3 overflow-hidden rounded-full bg-white/10" : "h-3 overflow-hidden rounded-full bg-[#edf2ef]"}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionStats.percent}%` }}
                                            transition={{
                                                duration: 0.7,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            className="h-full rounded-full bg-[linear-gradient(90deg,#0f4d3c_0%,#22b67f_55%,#d4af37_100%)]"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <ProgressTag active={!!formData.eventType} label="Event type selected" isDark={isDark} />
                                    <ProgressTag active={!!formData.packageType} label="Package selected" isDark={isDark} />
                                    <ProgressTag active={guestCount > 0} label="Guest count added" isDark={isDark} />
                                    <ProgressTag active={!!formData.preferredDate} label="Preferred date chosen" isDark={isDark} />
                                </div>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {selectedPackage?.features?.length > 0 && (
                                    <motion.div
                                        key={selectedPackage.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.3 }}
                                        className={softCard}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={isDark
                                                ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(21,64,50,0.78)] text-[#98efcc]"
                                                : "flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]"
                                            }>
                                                <CheckCircle2 size={22} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b99117]">
                                                    Selected Package
                                                </p>
                                                <h3 className={`mt-1 text-2xl font-extrabold ${strongText}`}>
                                                    Package Inclusions
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-3">
                                            {selectedPackage.features.map((item, index) => (
                                                <motion.div
                                                    key={`${item}-${index}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.24, delay: index * 0.02 }}
                                                    className={isDark
                                                        ? "flex items-start gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(12,36,29,0.98)_0%,rgba(16,44,35,0.98)_100%)] px-4 py-3 shadow-sm"
                                                        : "flex items-start gap-3 rounded-2xl border border-[#edf2ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] px-4 py-3 shadow-sm"
                                                    }
                                                >
                                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0f4d3c] text-white">
                                                        <Check size={14} />
                                                    </span>
                                                    <span className={isDark ? "text-sm font-medium leading-6 text-white/82" : "text-sm font-medium leading-6 text-slate-700"}>
                                                        {item}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.aside>

                        <motion.section variants={softReveal} className={shellCard}>
                            <div className={isDark
                                ? "border-b border-white/10 bg-[linear-gradient(90deg,rgba(13,38,31,0.98)_0%,rgba(88,67,20,0.14)_100%)] px-6 py-6 sm:px-8"
                                : "border-b border-[#edf2ef] bg-[linear-gradient(90deg,#f8fbf9_0%,#fff8ea_100%)] px-6 py-6 sm:px-8"
                            }>
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b99117]">
                                            Request Details
                                        </p>
                                        <h2 className={`mt-2 text-2xl font-extrabold sm:text-3xl ${strongText}`}>
                                            Premium Quotation Workspace
                                        </h2>
                                        <p className={`mt-2 text-sm leading-7 ${mutedText}`}>
                                            Fill out your event information below and submit a clean,
                                            professional request ready for review.
                                        </p>
                                    </div>

                                    <div className={isDark
                                        ? "inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm"
                                        : "inline-flex items-center gap-2 self-start rounded-full border border-[#e6d69d] bg-white px-4 py-2 text-sm font-medium text-[#0f4d3c] shadow-sm"
                                    }>
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0f8a61]" />
                                        Ready to submit
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field label="Full Name" required filled={!!formData.fullName} isDark={isDark}>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className={inputClass}
                                            required
                                        />
                                    </Field>

                                    <Field label="Contact Number" required filled={!!formData.contactNumber} isDark={isDark}>
                                        <input
                                            type="text"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            placeholder="Enter your contact number"
                                            className={inputClass}
                                            required
                                        />
                                    </Field>

                                    <Field label="Email Address" required filled={!!formData.email} isDark={isDark}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email address"
                                            className={inputClass}
                                            required
                                        />
                                    </Field>

                                    <Field label="Event Type" required filled={!!formData.eventType} isDark={isDark}>
                                        <div className="relative">
                                            <select
                                                name="eventType"
                                                value={formData.eventType}
                                                onChange={handleChange}
                                                className={`${inputClass} appearance-none pr-12`}
                                                required
                                            >
                                                <option value="">Select event type</option>
                                                <option value="Wedding">Wedding</option>
                                                <option value="Debut">Debut</option>
                                                <option value="Birthday">Birthday</option>
                                                <option value="Anniversary">Anniversary</option>
                                                <option value="Baptismal">Baptismal</option>
                                            </select>
                                            <ChevronDown
                                                size={18}
                                                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/60" : "text-slate-500"}`}
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Preferred Date" required filled={!!formData.preferredDate} isDark={isDark}>
                                        <PremiumDatePicker
                                            value={formData.preferredDate}
                                            onChange={handleDateChange}
                                            isDark={isDark}
                                        />
                                    </Field>

                                    <Field label="Event Time" filled={!!formData.eventTime} isDark={isDark}>
                                        <PremiumTimePicker
                                            value={formData.eventTime}
                                            onChange={handleTimeChange}
                                            isDark={isDark}
                                        />
                                    </Field>

                                    <Field label="Venue / Location" required filled={!!formData.venue} isDark={isDark}>
                                        <input
                                            type="text"
                                            name="venue"
                                            value={formData.venue}
                                            onChange={handleChange}
                                            placeholder="Enter venue or event location"
                                            className={inputClass}
                                            required
                                        />
                                    </Field>

                                    <Field label="Number of Guests" required filled={!!formData.guests} isDark={isDark}>
                                        <input
                                            type="number"
                                            name="guests"
                                            value={formData.guests}
                                            onChange={handleChange}
                                            placeholder="Enter number of guests"
                                            className={inputClass}
                                            min="1"
                                            required
                                        />
                                    </Field>

                                    <Field label="Preferred Package" required filled={!!formData.packageType} isDark={isDark}>
                                        <div className="relative">
                                            <select
                                                name="packageType"
                                                value={formData.packageType}
                                                onChange={handleChange}
                                                className={`${inputClass} appearance-none pr-12`}
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
                                            <ChevronDown
                                                size={18}
                                                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/60" : "text-slate-500"}`}
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Classic Menu" filled={!!formData.classicMenu} isDark={isDark}>
                                        <div className="relative">
                                            <select
                                                name="classicMenu"
                                                value={formData.classicMenu}
                                                onChange={handleChange}
                                                className={`${inputClass} appearance-none pr-12`}
                                            >
                                                <option value="">Select classic menu</option>
                                                {classicMenus.map((menu) => (
                                                    <option key={menu} value={menu}>
                                                        {menu}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={18}
                                                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/60" : "text-slate-500"}`}
                                            />
                                        </div>
                                    </Field>

                                    <div className="md:col-span-2">
                                        <Field
                                            label="Add-ons"
                                            filled={formData.addOns.length > 0}
                                            caption={formData.addOns.length > 0 ? `${formData.addOns.length} selected` : ""}
                                            isDark={isDark}
                                        >
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {addOns.map((item, index) => {
                                                    const checked = formData.addOns.includes(item.name);

                                                    return (
                                                        <motion.label
                                                            key={item.name}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.24, delay: index * 0.02 }}
                                                            whileHover={{ y: -2 }}
                                                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 shadow-sm transition ${checked
                                                                ? isDark
                                                                    ? "border-[#d4af37] bg-[linear-gradient(180deg,rgba(97,76,24,0.22)_0%,rgba(120,91,27,0.15)_100%)]"
                                                                    : "border-[#d4af37] bg-[linear-gradient(180deg,#fffaf0_0%,#fff4d8_100%)]"
                                                                : isDark
                                                                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.98)_0%,rgba(13,40,32,0.98)_100%)] hover:border-[#d4af37]"
                                                                    : "border-[#e4ebe7] bg-[linear-gradient(180deg,#fbfdfc_0%,#f4f8f6_100%)] hover:border-[#d4af37]"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => handleAddonChange(item.name)}
                                                                    className="accent-[#0f4d3c]"
                                                                />
                                                                <span className={isDark ? "font-medium text-white" : "font-medium text-[#0f4d3c]"}>
                                                                    {item.name}
                                                                </span>
                                                            </div>

                                                            <span className="font-bold text-[#b99117]">
                                                                {formatCurrency(item.price)}
                                                            </span>
                                                        </motion.label>
                                                    );
                                                })}
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Field label="Theme / Style Preference" filled={!!formData.themePreference} isDark={isDark}>
                                            <input
                                                type="text"
                                                name="themePreference"
                                                value={formData.themePreference}
                                                onChange={handleChange}
                                                placeholder="Enter preferred motif, theme, or style"
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Field label="Special Requests" filled={!!formData.specialRequests} isDark={isDark}>
                                            <textarea
                                                name="specialRequests"
                                                value={formData.specialRequests}
                                                onChange={handleChange}
                                                rows="5"
                                                placeholder="Add your preferred menu, setup, add-ons, or other requests"
                                                className={textareaClass}
                                            />
                                        </Field>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {(selectedAddOnObjects.length > 0 || formData.themePreference || formData.specialRequests) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            className={smartCard}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={isDark
                                                    ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(21,64,50,0.78)] text-[#98efcc]"
                                                    : "flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]"
                                                }>
                                                    <Sparkles size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b99117]">
                                                        Smart Preview
                                                    </p>
                                                    <h3 className={`mt-1 text-lg font-extrabold ${strongText}`}>
                                                        Your current custom selections
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <div className={isDark
                                                    ? "rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.98)_0%,rgba(13,40,32,0.98)_100%)] p-4"
                                                    : "rounded-2xl border border-[#e3ebe7] bg-white p-4"
                                                }>
                                                    <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${mutedText2}`}>
                                                        Selected Add-ons
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {selectedAddOnObjects.length > 0 ? (
                                                            selectedAddOnObjects.map((item) => (
                                                                <span
                                                                    key={item.name}
                                                                    className={isDark
                                                                        ? "rounded-full border border-[rgba(212,175,55,0.24)] bg-[rgba(97,76,24,0.22)] px-3 py-1 text-sm font-semibold text-[#f5cf67]"
                                                                        : "rounded-full bg-[#fff8e6] px-3 py-1 text-sm font-semibold text-[#0f4d3c] border border-[#ecd88d]"
                                                                    }
                                                                >
                                                                    {item.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className={`text-sm ${mutedText}`}>
                                                                No add-ons selected yet
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={isDark
                                                    ? "rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.98)_0%,rgba(13,40,32,0.98)_100%)] p-4"
                                                    : "rounded-2xl border border-[#e3ebe7] bg-white p-4"
                                                }>
                                                    <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${mutedText2}`}>
                                                        Extra Preferences
                                                    </p>
                                                    <div className={`mt-3 space-y-2 text-sm ${mutedText}`}>
                                                        <p>
                                                            <span className={`font-semibold ${strongText}`}>Theme:</span>{" "}
                                                            {formData.themePreference || "Not specified"}
                                                        </p>
                                                        <p>
                                                            <span className={`font-semibold ${strongText}`}>Special Requests:</span>{" "}
                                                            {formData.specialRequests || "None"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className={`mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row ${glassLine}`}>
                                    <motion.button
                                        whileTap={{ scale: 0.985 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-[0_12px_30px_rgba(15,77,60,0.18)] transition ${isSubmitting
                                            ? "cursor-not-allowed bg-[#0f4d3c]/70"
                                            : "bg-[linear-gradient(135deg,#0f4d3c_0%,#126650_100%)] hover:-translate-y-0.5"
                                            }`}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Request"}
                                        {!isSubmitting && <ArrowRight size={18} />}
                                    </motion.button>

                                    {isClientMode ? (
                                        <Link to="/client/dashboard" className={actionAltButton}>
                                            Back to Dashboard
                                            <ChevronRight size={18} />
                                        </Link>
                                    ) : (
                                        <Link to="/" className={actionAltButton}>
                                            Back to Home
                                            <ChevronRight size={18} />
                                        </Link>
                                    )}
                                </div>
                            </form>
                        </motion.section>
                    </div>
                </div>

                <AnimatePresence>
                    {showSuccessModal && submittedQuotation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-[#06261d]/50 px-4 py-6 backdrop-blur-[4px]"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                                className={isDark
                                    ? "w-full max-w-3xl overflow-hidden rounded-[34px] border border-[rgba(212,175,55,0.28)] bg-[linear-gradient(180deg,rgba(10,33,27,0.99)_0%,rgba(13,40,32,0.99)_100%)] shadow-[0_35px_90px_rgba(0,0,0,0.38)]"
                                    : "w-full max-w-3xl overflow-hidden rounded-[34px] border border-[#ead48d] bg-white shadow-[0_35px_90px_rgba(0,0,0,0.24)]"
                                }
                            >
                                <div className="relative bg-[linear-gradient(135deg,#0b5a43_0%,#0e6a4f_46%,#0f4d3c_100%)] px-7 py-7 text-white sm:px-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowSuccessModal(false)}
                                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                                    >
                                        <X size={18} />
                                    </button>

                                    <div className="flex items-start gap-4 pr-10">
                                        <motion.div
                                            initial={{ scale: 0.9, rotate: -8 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 250, damping: 16 }}
                                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[#f5c94a] text-[#0b4a3a] shadow-lg"
                                        >
                                            <CheckCircle2 size={32} />
                                        </motion.div>

                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                                                Request Confirmed
                                            </p>
                                            <h3 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
                                                Your quotation has been submitted successfully
                                            </h3>
                                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                                                Thank you for choosing Ebit&apos;s Catering.
                                                Your quotation request is now recorded and ready
                                                for admin review.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-7 sm:p-8">
                                    <div className="grid gap-5 md:grid-cols-[1.12fr_0.88fr]">
                                        <div className={isDark
                                            ? "rounded-[28px] border border-[rgba(212,175,55,0.22)] bg-[linear-gradient(180deg,rgba(88,67,20,0.14)_0%,rgba(120,91,27,0.12)_100%)] p-5"
                                            : "rounded-[28px] border border-[#ead48d] bg-[linear-gradient(180deg,#fffdf7_0%,#fff6dd_100%)] p-5"
                                        }>
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b99117]">
                                                Quotation Details
                                            </p>

                                            <div className="mt-4 space-y-3 text-sm">
                                                <SummaryRow label="Quotation ID" value={submittedQuotation.quotationId} isDark={isDark} />
                                                <SummaryRow label="Client Name" value={submittedQuotation.fullName} multiLine isDark={isDark} />
                                                <SummaryRow label="Event Type" value={submittedQuotation.eventType} isDark={isDark} />

                                                <div className="flex items-center justify-between gap-4">
                                                    <span className={isDark ? "text-white/60" : "text-gray-500"}>Status</span>
                                                    <span className={isDark
                                                        ? "inline-flex items-center rounded-full bg-[rgba(97,76,24,0.34)] px-3 py-1 text-xs font-bold text-[#f5cf67]"
                                                        : "inline-flex items-center rounded-full bg-[#fff1c4] px-3 py-1 text-xs font-bold text-[#9b7400]"
                                                    }>
                                                        {submittedQuotation.status}
                                                    </span>
                                                </div>

                                                <div className={isDark
                                                    ? "rounded-[24px] border border-[rgba(212,175,55,0.22)] bg-white/5 px-4 py-4 shadow-sm"
                                                    : "rounded-[24px] border border-[#ecd88d] bg-white/70 px-4 py-4 shadow-sm"
                                                }>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className={`font-semibold ${strongText}`}>
                                                            Estimated Total
                                                        </span>
                                                        <span className={`text-xl font-extrabold ${strongText}`}>
                                                            {formatCurrency(submittedQuotation.estimatedTotal)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={isDark
                                            ? "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,36,29,0.98)_0%,rgba(16,44,35,0.98)_100%)] p-5"
                                            : "rounded-[28px] border border-[#dfe7e3] bg-[#f8fbfa] p-5"
                                        }>
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f8a61]">
                                                What happens next?
                                            </p>

                                            <div className="mt-4 space-y-4">
                                                <StepItem
                                                    number="1"
                                                    numberClass="bg-[#0f4d3c] text-white"
                                                    text="The admin will review your selected package, date, guest count, and add-ons."
                                                    isDark={isDark}
                                                />
                                                <StepItem
                                                    number="2"
                                                    numberClass="bg-[#d4af37] text-[#0f4d3c]"
                                                    text="Your quotation status will appear in your client quotations page once updated."
                                                    isDark={isDark}
                                                />
                                                <StepItem
                                                    number="3"
                                                    numberClass="border border-[#bcd7cb] bg-[#e8f3ef] text-[#0f4d3c]"
                                                    text="You may proceed to your portal to monitor the request and wait for confirmation."
                                                    isDark={isDark}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                        <motion.button
                                            whileTap={{ scale: 0.985 }}
                                            type="button"
                                            onClick={handleViewMyQuotations}
                                            className="w-full rounded-2xl bg-[linear-gradient(135deg,#0f4d3c_0%,#126650_100%)] py-3.5 font-bold text-white shadow-[0_12px_30px_rgba(15,77,60,0.18)] transition hover:brightness-95"
                                        >
                                            View My Quotations
                                        </motion.button>

                                        <motion.button
                                            whileTap={{ scale: 0.985 }}
                                            type="button"
                                            onClick={handleBackAfterSubmit}
                                            className="w-full rounded-2xl bg-[linear-gradient(135deg,#e1b93e_0%,#d4af37_100%)] py-3.5 font-bold text-[#0b4a3a] shadow-sm transition hover:brightness-95"
                                        >
                                            {isClientMode ? "Back to Dashboard" : "Back to Home"}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function PremiumDatePicker({ value, onChange, isDark }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const today = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);

    const selectedDate = useMemo(() => dateFromInputValue(value), [value]);

    const [viewDate, setViewDate] = useState(selectedDate || today);

    useEffect(() => {
        if (selectedDate) {
            setViewDate(selectedDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        const handleOutside = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const days = useMemo(() => getCalendarDays(viewDate), [viewDate]);
    const monthLabel = viewDate.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
    });

    const pickerButtonClass = isDark
        ? "flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,43,35,0.98)_100%)] px-4 py-3.5 text-left text-white shadow-sm transition hover:border-[#d4af37] focus:border-[#d4af37]"
        : "flex w-full items-center justify-between rounded-2xl border border-[#d7e1dc] bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f8f5_100%)] px-4 py-3.5 text-left text-slate-800 shadow-sm transition hover:border-[#d4af37] focus:border-[#d4af37]";

    const dropdownClass = isDark
        ? "absolute left-0 top-[calc(100%+10px)] z-30 w-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.99)_0%,rgba(13,40,32,0.99)_100%)] p-4 shadow-[0_24px_54px_rgba(0,0,0,0.28)]"
        : "absolute left-0 top-[calc(100%+10px)] z-30 w-full rounded-[24px] border border-[#dce7e2] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf9_100%)] p-4 shadow-[0_24px_54px_rgba(14,61,47,0.12)]";

    const weekdayLabelClass = isDark
        ? "text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45"
        : "text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400";

    const defaultDayClass = isDark
        ? "h-11 rounded-2xl text-sm font-semibold text-white/82 transition hover:bg-white/8"
        : "h-11 rounded-2xl text-sm font-semibold text-slate-700 transition hover:bg-[#edf8f3]";

    return (
        <div className="relative" ref={rootRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={pickerButtonClass}
            >
                <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-[#b99117]" />
                    <span className={value ? "" : isDark ? "text-white/35" : "text-slate-400"}>
                        {formatDateDisplay(value)}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={`transition ${open ? "rotate-180" : ""} ${isDark ? "text-white/65" : "text-slate-500"}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className={dropdownClass}
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? "text-white/50" : "text-slate-400"}`}>
                                    Preferred Date
                                </p>
                                <p className={`mt-1 text-sm font-bold ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                                    {formatDateDisplay(value)}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {value ? (
                                    <button
                                        type="button"
                                        onClick={() => onChange("")}
                                        className={isDark
                                            ? "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                                            : "rounded-full border border-[#e3ebe7] bg-[#fbfdfc] px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-[#f3fbf7]"
                                        }
                                    >
                                        Clear
                                    </button>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setViewDate(today);
                                        onChange(toInputDateValue(today));
                                    }}
                                    className={isDark
                                        ? "rounded-full border border-[rgba(212,175,55,0.24)] bg-[rgba(97,76,24,0.22)] px-3 py-1 text-xs font-semibold text-[#f5cf67] transition hover:brightness-110"
                                        : "rounded-full border border-[#ecd88d] bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#9b7400] transition hover:brightness-95"
                                    }
                                >
                                    Today
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                            <button
                                type="button"
                                onClick={() => {
                                    const next = new Date(viewDate);
                                    next.setMonth(viewDate.getMonth() - 1);
                                    setViewDate(next);
                                }}
                                className={isDark
                                    ? "flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10"
                                    : "flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white"
                                }
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className={`text-sm font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                                {monthLabel}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const next = new Date(viewDate);
                                    next.setMonth(viewDate.getMonth() + 1);
                                    setViewDate(next);
                                }}
                                className={isDark
                                    ? "flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10"
                                    : "flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white"
                                }
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                <div key={day} className={weekdayLabelClass}>
                                    {day}
                                </div>
                            ))}

                            {days.map((date) => {
                                const inCurrentMonth = date.getMonth() === viewDate.getMonth();
                                const selected = selectedDate ? isSameDay(date, selectedDate) : false;
                                const todayMatch = isSameDay(date, today);

                                let dayClass = defaultDayClass;

                                if (selected) {
                                    dayClass = "h-11 rounded-2xl bg-[linear-gradient(135deg,#0f4d3c_0%,#126650_100%)] text-sm font-bold text-white shadow-sm";
                                } else if (!inCurrentMonth) {
                                    dayClass = isDark
                                        ? "h-11 rounded-2xl text-sm font-medium text-white/28 transition hover:bg-white/5"
                                        : "h-11 rounded-2xl text-sm font-medium text-slate-300 transition hover:bg-[#f5f8f7]";
                                } else if (todayMatch) {
                                    dayClass = isDark
                                        ? "h-11 rounded-2xl border border-[rgba(212,175,55,0.28)] bg-[rgba(97,76,24,0.18)] text-sm font-bold text-[#f5cf67] transition hover:brightness-110"
                                        : "h-11 rounded-2xl border border-[#ecd88d] bg-[#fff8e6] text-sm font-bold text-[#9b7400] transition hover:brightness-95";
                                }

                                return (
                                    <button
                                        key={date.toISOString()}
                                        type="button"
                                        onClick={() => {
                                            onChange(toInputDateValue(date));
                                            setOpen(false);
                                        }}
                                        className={dayClass}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PremiumTimePicker({ value, onChange, isDark }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
    const periods = ["AM", "PM"];

    const parsed = useMemo(() => {
        if (!value || !/^\d{2}:\d{2}$/.test(value)) {
            return { hour: "07", minute: "00", period: "PM" };
        }

        const [hour24, minute] = value.split(":").map(Number);
        const period = hour24 >= 12 ? "PM" : "AM";
        let hour12 = hour24 % 12;
        if (hour12 === 0) hour12 = 12;

        return {
            hour: String(hour12).padStart(2, "0"),
            minute: String(minute).padStart(2, "0"),
            period,
        };
    }, [value]);

    const [selectedHour, setSelectedHour] = useState(parsed.hour);
    const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
    const [selectedPeriod, setSelectedPeriod] = useState(parsed.period);

    useEffect(() => {
        setSelectedHour(parsed.hour);
        setSelectedMinute(parsed.minute);
        setSelectedPeriod(parsed.period);
    }, [parsed.hour, parsed.minute, parsed.period]);

    useEffect(() => {
        const handleOutside = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const applyTime = (hour, minute, period) => {
        let hour24 = Number(hour);
        if (period === "AM") {
            if (hour24 === 12) hour24 = 0;
        } else {
            if (hour24 !== 12) hour24 += 12;
        }
        onChange(`${String(hour24).padStart(2, "0")}:${minute}`);
    };

    const pickerButtonClass = isDark
        ? "flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(11,35,28,0.98)_0%,rgba(15,43,35,0.98)_100%)] px-4 py-3.5 text-left text-white shadow-sm transition hover:border-[#d4af37] focus:border-[#d4af37]"
        : "flex w-full items-center justify-between rounded-2xl border border-[#d7e1dc] bg-[linear-gradient(180deg,#fbfdfc_0%,#f3f8f5_100%)] px-4 py-3.5 text-left text-slate-800 shadow-sm transition hover:border-[#d4af37] focus:border-[#d4af37]";

    const dropdownClass = isDark
        ? "absolute left-0 top-[calc(100%+10px)] z-30 w-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.99)_0%,rgba(13,40,32,0.99)_100%)] p-4 shadow-[0_24px_54px_rgba(0,0,0,0.28)]"
        : "absolute left-0 top-[calc(100%+10px)] z-30 w-full rounded-[24px] border border-[#dce7e2] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf9_100%)] p-4 shadow-[0_24px_54px_rgba(14,61,47,0.12)]";

    const columnClass = isDark
        ? "max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-2"
        : "max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-[#e6eeea] bg-[#fbfdfc] p-2";

    const itemClass = (active) =>
        active
            ? "w-full rounded-xl bg-[linear-gradient(135deg,#0f4d3c_0%,#126650_100%)] px-3 py-2 text-sm font-bold text-white"
            : isDark
                ? "w-full rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/8"
                : "w-full rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#eef8f4]";

    return (
        <div className="relative" ref={rootRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={pickerButtonClass}
            >
                <div className="flex items-center gap-3">
                    <Clock3 size={17} className="text-[#b99117]" />
                    <span className={value ? "" : isDark ? "text-white/35" : "text-slate-400"}>
                        {formatTimeDisplay(value)}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={`transition ${open ? "rotate-180" : ""} ${isDark ? "text-white/65" : "text-slate-500"}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className={dropdownClass}
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? "text-white/50" : "text-slate-400"}`}>
                                    Event Time
                                </p>
                                <p className={`mt-1 text-sm font-bold ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                                    {formatTimeDisplay(value)}
                                </p>
                            </div>

                            {value ? (
                                <button
                                    type="button"
                                    onClick={() => onChange("")}
                                    className={isDark
                                        ? "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                                        : "rounded-full border border-[#e3ebe7] bg-[#fbfdfc] px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-[#f3fbf7]"
                                    }
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? "text-white/45" : "text-slate-400"}`}>
                                    Hour
                                </p>
                                <div className={columnClass}>
                                    {hours.map((hour) => (
                                        <button
                                            key={hour}
                                            type="button"
                                            onClick={() => {
                                                setSelectedHour(hour);
                                                applyTime(hour, selectedMinute, selectedPeriod);
                                            }}
                                            className={itemClass(selectedHour === hour)}
                                        >
                                            {hour}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? "text-white/45" : "text-slate-400"}`}>
                                    Minute
                                </p>
                                <div className={columnClass}>
                                    {minutes.map((minute) => (
                                        <button
                                            key={minute}
                                            type="button"
                                            onClick={() => {
                                                setSelectedMinute(minute);
                                                applyTime(selectedHour, minute, selectedPeriod);
                                            }}
                                            className={itemClass(selectedMinute === minute)}
                                        >
                                            {minute}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? "text-white/45" : "text-slate-400"}`}>
                                    Period
                                </p>
                                <div className={columnClass}>
                                    {periods.map((period) => (
                                        <button
                                            key={period}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPeriod(period);
                                                applyTime(selectedHour, selectedMinute, period);
                                            }}
                                            className={itemClass(selectedPeriod === period)}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MiniHeroCard({ icon: Icon, label, value }) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        {label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}

function ContactRow({ icon: Icon, text }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon size={15} />
            </div>
            <span className="leading-6">{text}</span>
        </div>
    );
}

function Field({ label, required, filled, caption, children, isDark }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <label className={`block text-sm font-semibold ${isDark ? "text-white/92" : "text-[#0f4d3c]"}`}>
                    {label} {required ? <span className="text-red-500">*</span> : null}
                </label>

                {caption ? (
                    <span className={isDark
                        ? "hidden rounded-full bg-[rgba(21,64,50,0.82)] px-2.5 py-1 text-[11px] font-semibold text-[#98efcc] sm:inline-flex"
                        : "hidden rounded-full bg-[#eef8f4] px-2.5 py-1 text-[11px] font-semibold text-[#0f6b52] sm:inline-flex"
                    }>
                        {caption}
                    </span>
                ) : filled ? (
                    <span className={isDark
                        ? "hidden rounded-full bg-[rgba(21,64,50,0.82)] px-2.5 py-1 text-[11px] font-semibold text-[#98efcc] sm:inline-flex"
                        : "hidden rounded-full bg-[#eef8f4] px-2.5 py-1 text-[11px] font-semibold text-[#0f6b52] sm:inline-flex"
                    }>
                        Filled
                    </span>
                ) : null}
            </div>
            {children}
        </div>
    );
}

function ProgressTag({ active, label, isDark }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${active
                ? isDark
                    ? "border-[rgba(21,90,60,0.32)] bg-[rgba(21,90,60,0.14)] text-white"
                    : "border-[#cfe4d9] bg-[#f3fbf7] text-[#0f4d3c]"
                : isDark
                    ? "border-white/10 bg-white/5 text-white/60"
                    : "border-[#e9efec] bg-[#fafcfa] text-slate-500"
                }`}
        >
            <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${active
                    ? "bg-[#0f4d3c] text-white"
                    : isDark
                        ? "bg-white/10 text-white/45"
                        : "bg-[#edf2ef] text-slate-400"
                    }`}
            >
                {active ? <Check size={14} /> : "•"}
            </span>
            <span className="font-medium">{label}</span>
        </div>
    );
}

function SummaryRow({ label, value, multiLine = false, isDark }) {
    return (
        <div className={`flex ${multiLine ? "items-start" : "items-center"} justify-between gap-4`}>
            <span className={isDark ? "text-white/60" : "text-gray-500"}>{label}</span>
            <span className={`${isDark ? "text-white" : "text-[#0f4d3c]"} font-semibold ${multiLine ? "max-w-[220px] text-right" : ""}`}>
                {value}
            </span>
        </div>
    );
}

function StepItem({ number, numberClass, text, isDark }) {
    return (
        <div className="flex gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${numberClass}`}>
                {number}
            </div>
            <p className={`text-sm leading-6 ${isDark ? "text-white/70" : "text-gray-600"}`}>{text}</p>
        </div>
    );
}

export default Quotation;