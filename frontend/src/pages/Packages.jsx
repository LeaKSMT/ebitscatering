import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Gift,
    Sparkles,
    Camera,
    Mic2,
    PartyPopper,
    ChevronRight,
    Menu,
    X,
} from "lucide-react";

const weddingPackages = [
    {
        id: "basic-wedding",
        title: "Basic Wedding Package",
        price: "₱58,000",
        rawPrice: 58000,
        pax: "100 pax",
        includedPax: 100,
        category: "Wedding Package",
        eventType: "Wedding",
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
        title: "Enhanced Wedding Package",
        price: "₱65,000",
        rawPrice: 65000,
        pax: "100 pax",
        includedPax: 100,
        category: "Wedding Package",
        eventType: "Wedding",
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
        title: "Premium Wedding Package",
        price: "₱75,000",
        rawPrice: 75000,
        pax: "100 pax",
        includedPax: 100,
        category: "Wedding Package",
        eventType: "Wedding",
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
        title: "Elite Wedding Package",
        price: "₱82,000",
        rawPrice: 82000,
        pax: "100 pax",
        includedPax: 100,
        category: "Wedding Package",
        eventType: "Wedding",
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
        title: "Ultimate Wedding Package",
        price: "₱90,000",
        rawPrice: 90000,
        pax: "100 pax",
        includedPax: 100,
        category: "Wedding Package",
        eventType: "Wedding",
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

const debutPackages = [
    {
        id: "classic-debut",
        title: "Classic Debut",
        price: "₱48,000",
        rawPrice: 48000,
        pax: "100 pax",
        includedPax: 100,
        category: "Debut Package",
        eventType: "Debut",
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
        title: "Rising Star Package",
        price: "₱55,000",
        rawPrice: 55000,
        pax: "100 pax",
        includedPax: 100,
        category: "Debut Package",
        eventType: "Debut",
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
        title: "All Star Debut Package",
        price: "₱70,000",
        rawPrice: 70000,
        pax: "100 pax",
        includedPax: 100,
        category: "Debut Package",
        eventType: "Debut",
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
        title: "Diamond Elite Debut Package",
        price: "₱80,000",
        rawPrice: 80000,
        pax: "100 pax",
        includedPax: 100,
        category: "Debut Package",
        eventType: "Debut",
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

const addOns = [
    { name: "Lights and Sounds", price: "₱4,000", icon: <Mic2 className="h-5 w-5" /> },
    { name: "Host", price: "₱3,500", icon: <PartyPopper className="h-5 w-5" /> },
    { name: "Cake", price: "₱2,000", icon: <Gift className="h-5 w-5" /> },
    { name: "Photo", price: "₱5,000", icon: <Camera className="h-5 w-5" /> },
    { name: "Photo/Video", price: "₱15,000", icon: <Camera className="h-5 w-5" /> },
    { name: "SDE", price: "₱27,000", icon: <Sparkles className="h-5 w-5" /> },
];

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            delay: i * 0.08,
            ease: "easeOut",
        },
    }),
};

const softScale = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.55,
            ease: "easeOut",
        },
    },
};

function SectionTitle({ eyebrow, title, highlight, desc, light = false }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mb-10 text-center md:mb-12"
        >
            <p
                className={`text-[11px] font-semibold uppercase tracking-[0.35em] md:text-xs ${light ? "text-white/70" : "text-[#0b4d3b]/60"
                    }`}
            >
                {eyebrow}
            </p>
            <h2
                className={`mt-3 text-[30px] font-bold leading-tight sm:text-[36px] md:text-[44px] ${light ? "text-white" : "text-[#0b4d3b]"
                    }`}
            >
                {title} <span className="text-[#d4a514]">{highlight}</span>
            </h2>
            <p
                className={`mx-auto mt-4 max-w-2xl text-[15px] leading-7 md:text-[16px] ${light ? "text-white/80" : "text-slate-500"
                    }`}
            >
                {desc}
            </p>
        </motion.div>
    );
}

function PackageCard({ item, onQuote, badge, dark = false }) {
    const visibleFeatures = item.features.slice(0, 8);
    const extraCount = item.features.length - visibleFeatures.length;

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={softScale}
            whileHover={{ y: -6 }}
            className={`group relative flex h-full flex-col overflow-hidden rounded-[30px] border p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition duration-300 md:p-7 ${dark
                    ? "border-white/10 bg-white text-[#0b4d3b]"
                    : "border-[#e7dfd1] bg-[#fffdf8] text-[#0b4d3b]"
                }`}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#f2bf2f]/[0.06] opacity-0 transition duration-300 group-hover:opacity-100" />

            <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                    {badge && (
                        <div className="mb-4 inline-flex rounded-full bg-[#fff3c8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b7510]">
                            {badge}
                        </div>
                    )}

                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0b4d3b]/55">
                        {item.category}
                    </p>

                    <h3 className="mt-3 text-[22px] font-extrabold leading-tight md:text-[25px]">
                        {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">{item.pax}</p>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-[24px] font-extrabold leading-none text-[#d1a31d] md:text-[28px]">
                        {item.price}
                    </p>
                </div>
            </div>

            <div className="relative z-10 mb-5 mt-5 h-[3px] w-14 rounded-full bg-[#d1a31d]" />

            <ul className="relative z-10 flex-1 space-y-3">
                {visibleFeatures.map((feature, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-3 text-[14px] text-slate-700 md:text-[15px]"
                    >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c99d1a]" />
                        <span>{feature}</span>
                    </li>
                ))}

                {extraCount > 0 && (
                    <li className="pt-1 text-[13px] font-medium text-[#0b4d3b]/70">
                        +{extraCount} more inclusions
                    </li>
                )}
            </ul>

            <button
                onClick={() => onQuote(item)}
                className="relative z-10 mt-6 inline-flex w-fit items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-bold text-[#0b4d3b] shadow-[0_10px_24px_rgba(242,191,47,0.22)] transition hover:bg-yellow-300"
            >
                Get Quotation
            </button>
        </motion.div>
    );
}

function Packages() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const stats = useMemo(
        () => [
            { label: "Starting Rate", value: "₱20,000" },
            { label: "Guest Capacity", value: "50–100 pax" },
            { label: "Events Covered", value: "Weddings & Debuts" },
        ],
        []
    );

    const handleGetQuotation = (selectedPackage) => {
        const isClientLoggedIn = localStorage.getItem("isClientLoggedIn") === "true";
        const clientUser = JSON.parse(localStorage.getItem("clientUser") || "null");

        localStorage.setItem("selectedPackage", JSON.stringify(selectedPackage));

        if (isClientLoggedIn && clientUser) {
            navigate("/client/quotation");
        } else {
            localStorage.setItem("redirectAfterLogin", "/client/quotation");
            navigate("/login");
        }
    };

    const mobileLinkClass =
        "block rounded-2xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10";

    return (
        <div className="min-h-screen bg-[#f7f4ee]">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b4d3b]/92 text-white shadow-sm backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
                    <div>
                        <h1 className="text-[22px] font-extrabold text-[#f2bf2f] md:text-[26px]">
                            Ebit&apos;s Catering
                        </h1>
                        <p className="text-[11px] text-white/80 md:text-[13px]">
                            Premium catering for unforgettable celebrations
                        </p>
                    </div>

                    <nav className="hidden items-center gap-7 text-[15px] md:flex">
                        <Link to="/" className="font-semibold transition hover:text-[#f2bf2f]">
                            Home
                        </Link>
                        <Link to="/packages" className="font-semibold text-[#f2bf2f]">
                            Packages
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:bg-white hover:text-[#0b4d3b]"
                        >
                            Login
                        </Link>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="inline-flex items-center justify-center rounded-xl border border-white/20 p-2 md:hidden"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-white/10 px-5 pb-4 md:hidden">
                        <div className="flex flex-col gap-2 pt-4">
                            <Link
                                to="/"
                                className={mobileLinkClass}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/packages"
                                className={mobileLinkClass}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Packages
                            </Link>
                            <Link
                                to="/login"
                                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 font-semibold text-[#0b4d3b]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <section className="relative overflow-hidden bg-[#0c5a43] px-5 py-14 md:px-10 md:py-18 lg:px-20">
                <div className="hero-luxury-overlay absolute inset-0" />
                <div className="hero-vignette absolute inset-0" />
                <div className="hero-mesh absolute inset-0" />
                <div className="hero-glow hero-glow-1" />
                <div className="hero-glow hero-glow-2" />
                <div className="hero-glow hero-glow-3" />
                <div className="hero-shine" />

                <div className="relative z-10 mx-auto max-w-6xl">
                    <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr]">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            className="text-white"
                        >
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-white/90 backdrop-blur-sm md:text-sm">
                                <Sparkles size={14} className="text-[#f2bf2f]" />
                                Elegant package selections
                            </div>

                            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/65 md:text-xs">
                                Ebit&apos;s Catering
                            </p>

                            <h2 className="mt-4 text-[34px] font-extrabold leading-[1.04] sm:text-[44px] md:text-[56px]">
                                Curated <span className="text-[#f2bf2f]">Packages</span>
                                <br />
                                for Elegant Celebrations
                            </h2>

                            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-white/85 md:text-[17px]">
                                Explore our wedding and debut packages with thoughtfully
                                selected inclusions, optional add-ons, and flexible choices
                                designed for memorable events.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-4">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-2xl bg-[#f2bf2f] px-6 py-3.5 font-semibold text-[#0b4d3b] shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:bg-[#f7c93c]"
                                >
                                    Book Your Event
                                </Link>

                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={softScale}
                            className="grid gap-4"
                        >
                            {stats.map((item, index) => (
                                <div
                                    key={item.label}
                                    className={`rounded-[24px] border px-6 py-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.22)] ${index === 1
                                            ? "border-[#f2bf2f]/30 bg-white/14 text-white"
                                            : "border-white/15 bg-white/10 text-white"
                                        }`}
                                >
                                    <p className="text-sm text-white/65">{item.label}</p>
                                    <p className="mt-2 text-[22px] font-extrabold text-[#f2bf2f] md:text-[26px]">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-b from-[#f7f4ee] to-[#eef3ef] px-5 py-14 md:px-10 md:py-16 lg:px-20">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle
                        eyebrow="Quick Overview"
                        title="Quick"
                        highlight="Rates"
                        desc="Standard catering package rates based on guest count."
                    />

                    <div className="grid gap-5 md:grid-cols-3">
                        {[
                            { pax: "50 Pax", price: "₱20,000" },
                            { pax: "75 Pax", price: "₱30,000" },
                            { pax: "100 Pax", price: "₱40,000" },
                        ].map((rate, index) => (
                            <motion.div
                                key={rate.pax}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                custom={index}
                                variants={fadeUp}
                                whileHover={{ y: -5 }}
                                className={`rounded-[28px] border p-7 text-center shadow-[0_12px_28px_rgba(0,0,0,0.05)] transition ${index === 1
                                        ? "scale-[1.02] border-transparent bg-gradient-to-br from-[#0b4d3b] to-[#083c30] text-white shadow-xl"
                                        : "border-[#e8e2d6] bg-white text-[#0b4d3b]"
                                    }`}
                            >
                                <p className="text-sm font-semibold uppercase tracking-[0.28em] opacity-70">
                                    Guest Count
                                </p>
                                <h3 className="mt-3 text-[32px] font-extrabold md:text-[38px]">
                                    {rate.pax}
                                </h3>
                                <div className="mx-auto my-5 h-[3px] w-14 rounded-full bg-[#d7ad34]" />
                                <p className="text-[34px] font-extrabold text-[#d7ad34] md:text-[42px]">
                                    {rate.price}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-b from-[#eef3ef] to-[#f7f4ee] px-5 pb-14 md:px-10 md:pb-16 lg:px-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={softScale}
                    className="mx-auto max-w-5xl rounded-[32px] border border-[#eadfbe] bg-[#fff9e8] p-7 shadow-[0_14px_36px_rgba(0,0,0,0.06)] md:p-9"
                >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f2bf2f]/20">
                                <Gift className="h-7 w-7 text-[#b78a11]" />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0b4d3b]/55 md:text-xs">
                                    Freebie
                                </p>
                                <h3 className="mt-3 text-[28px] font-extrabold text-[#0b4d3b] md:text-[38px]">
                                    Free <span className="text-[#d4a514]">Backdrop</span>
                                </h3>
                                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                                    Selected package offers include a free backdrop to enhance
                                    the styling and overall presentation of your event.
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c5a43] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(12,90,67,0.2)]">
                            <Gift className="h-4 w-4 text-[#f2bf2f]" />
                            Included in selected offers
                        </div>
                    </div>
                </motion.div>
            </section>

            <section className="bg-white px-5 py-14 md:px-10 md:py-16 lg:px-20">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        eyebrow="Wedding Collection"
                        title="Wedding"
                        highlight="Packages"
                        desc="Choose from our curated wedding package offers for elegant and memorable celebrations."
                    />

                    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {weddingPackages.map((item, index) => (
                            <PackageCard
                                key={item.id}
                                item={item}
                                onQuote={handleGetQuotation}
                                badge={index === 2 ? "Popular Choice" : ""}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[#0c5a43] px-5 py-14 md:px-10 md:py-16 lg:px-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,191,47,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_18%)]" />

                <div className="relative z-10 mx-auto max-w-7xl">
                    <SectionTitle
                        eyebrow="Debut Collection"
                        title="Debut"
                        highlight="Packages"
                        desc="Elegant package selections crafted for unforgettable debut celebrations."
                        light
                    />

                    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {debutPackages.map((item, index) => (
                            <PackageCard
                                key={item.id}
                                item={item}
                                onQuote={handleGetQuotation}
                                badge={index === 1 ? "Recommended" : ""}
                                dark
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f7f4ee] px-5 py-14 md:px-10 md:py-16 lg:px-20">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle
                        eyebrow="Optional Services"
                        title="Available"
                        highlight="Add-ons"
                        desc="Optional services you can include to make your celebration more complete and special."
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {addOns.map((addon, index) => (
                            <motion.div
                                key={addon.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                custom={index}
                                variants={fadeUp}
                                whileHover={{ y: -5 }}
                                className="rounded-[24px] border border-[#e8e2d6] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition hover:shadow-lg"
                            >
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf4df] text-[#c99d1a]">
                                    {addon.icon}
                                </div>

                                <h3 className="text-lg font-extrabold text-[#0b4d3b] md:text-xl">
                                    {addon.name}
                                </h3>
                                <p className="mt-3 text-[28px] font-extrabold text-[#d1a31d]">
                                    {addon.price}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[#0b4d3b] px-5 py-12 md:px-10 lg:px-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,191,47,0.1),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_18%)]" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    className="relative z-10 mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center"
                >
                    <div className="text-white">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 md:text-xs">
                            Ready to Book
                        </p>
                        <h3 className="mt-3 text-[28px] font-extrabold leading-tight md:text-[38px]">
                            Plan your event with{" "}
                            <span className="text-[#f2bf2f]">Ebit&apos;s Catering</span>
                        </h3>
                        <p className="mt-3 max-w-2xl leading-7 text-white/80">
                            Choose your preferred package and request a quotation for your
                            celebration.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            handleGetQuotation({
                                id: "general-quotation",
                                title: "General Package Inquiry",
                            })
                        }
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#f2bf2f] px-6 py-3.5 font-semibold text-[#0b4d3b] shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:bg-[#f7c93c]"
                    >
                        Request Quotation
                        <ChevronRight size={18} />
                    </button>
                </motion.div>
            </section>
        </div>
    );
}

export default Packages;