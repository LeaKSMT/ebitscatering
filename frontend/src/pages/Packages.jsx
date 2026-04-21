import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    Crown,
    Star,
    ArrowRight,
    HeartHandshake,
    ShieldCheck,
    Gem,
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
    hidden: { opacity: 0, y: 34 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            delay: i * 0.07,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

const softScale = {
    hidden: { opacity: 0, scale: 0.965 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const cardReveal = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            delay: i * 0.05,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

function SectionTitle({ eyebrow, title, highlight, desc, light = false }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mb-10 text-center md:mb-14"
        >
            <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${light
                        ? "border-white/15 bg-white/10 text-white/80"
                        : "border-[#e7dcc6] bg-[#fffaf0] text-[#0b4d3b]/70"
                    }`}
            >
                <Sparkles className="h-3.5 w-3.5 text-[#d4a514]" />
                {eyebrow}
            </div>

            <h2
                className={`mt-5 text-[32px] font-black leading-tight sm:text-[40px] md:text-[52px] ${light ? "text-white" : "text-[#0b4d3b]"
                    }`}
            >
                {title} <span className="text-[#d4a514]">{highlight}</span>
            </h2>

            <p
                className={`mx-auto mt-4 max-w-3xl text-[15px] leading-7 md:text-[16px] ${light ? "text-white/80" : "text-slate-600"
                    }`}
            >
                {desc}
            </p>
        </motion.div>
    );
}

function FloatingOrb({ className, delay = 0, duration = 8 }) {
    return (
        <motion.div
            className={className}
            animate={{ y: [0, -18, 0], x: [0, 12, 0], scale: [1, 1.05, 1] }}
            transition={{
                duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay,
            }}
        />
    );
}

function HeroParticle({ className, delay = 0, duration = 7 }) {
    return (
        <motion.div
            className={className}
            animate={{ y: [0, -24, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
        />
    );
}

function GlowButton({ children, onClick, icon }) {
    return (
        <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#f2bf2f] px-7 py-4 font-bold text-[#0b4d3b] shadow-[0_18px_36px_rgba(0,0,0,0.22)] transition"
        >
            <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <span className="absolute -left-10 top-0 h-full w-16 rotate-[20deg] bg-white/35 blur-md transition duration-700 group-hover:left-[110%]" />
            </span>
            <span className="relative z-10">{children}</span>
            {icon ? <span className="relative z-10">{icon}</span> : null}
        </motion.button>
    );
}

function PackageCard({ item, onQuote, badge, featured = false, dark = false }) {
    const visibleFeatures = item.features.slice(0, 8);
    const extraCount = item.features.length - visibleFeatures.length;

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={softScale}
            whileHover={{ y: -10 }}
            className={`group relative flex h-full flex-col overflow-hidden rounded-[32px] border p-6 transition duration-300 md:p-7 ${featured
                    ? dark
                        ? "border-[#f2bf2f]/35 bg-white text-[#0b4d3b] shadow-[0_26px_70px_rgba(0,0,0,0.22)]"
                        : "border-[#f2bf2f]/40 bg-[linear-gradient(180deg,#fffdf8_0%,#fff8e8_100%)] text-[#0b4d3b] shadow-[0_24px_64px_rgba(191,151,39,0.14)]"
                    : dark
                        ? "border-white/10 bg-white text-[#0b4d3b] shadow-[0_16px_38px_rgba(0,0,0,0.18)]"
                        : "border-[#e7dfd1] bg-white text-[#0b4d3b] shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
                }`}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,165,20,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(11,77,59,0.06),transparent_22%)] opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-[#f2bf2f]/10 blur-2xl" />
            <div className="pointer-events-none absolute left-[-35%] top-0 h-full w-[30%] rotate-[18deg] bg-white/20 opacity-0 blur-xl transition duration-700 group-hover:left-[115%] group-hover:opacity-100" />

            <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    {badge ? (
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff3c8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b7510]">
                            <Crown className="h-3.5 w-3.5" />
                            {badge}
                        </div>
                    ) : (
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f5f7f6] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0b4d3b]/60">
                            <Gem className="h-3.5 w-3.5 text-[#d4a514]" />
                            Signature Offer
                        </div>
                    )}

                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0b4d3b]/50">
                        {item.category}
                    </p>

                    <h3 className="mt-3 text-[24px] font-black leading-tight md:text-[28px]">
                        {item.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f5f7f6] px-3 py-1 text-xs font-semibold text-[#0b4d3b]/75">
                            {item.pax}
                        </span>
                        <span className="rounded-full bg-[#fff4cf] px-3 py-1 text-xs font-semibold text-[#9b7510]">
                            Elegant setup included
                        </span>
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Starting at
                    </p>
                    <p className="mt-2 text-[26px] font-black leading-none text-[#d1a31d] md:text-[32px]">
                        {item.price}
                    </p>
                </div>
            </div>

            <div className="relative z-10 my-6 h-px w-full bg-gradient-to-r from-[#d4a514] via-[#ecd796] to-transparent" />

            <ul className="relative z-10 flex-1 space-y-3">
                {visibleFeatures.map((feature, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-3 text-[14px] text-slate-700 md:text-[15px]"
                    >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fff3cf]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#c99d1a]" />
                        </div>
                        <span>{feature}</span>
                    </li>
                ))}

                {extraCount > 0 && (
                    <li className="pt-2 text-[13px] font-semibold text-[#0b4d3b]/70">
                        +{extraCount} more premium inclusions
                    </li>
                )}
            </ul>

            <div className="relative z-10 mt-7 flex flex-col gap-3 sm:flex-row">
                <GlowButton onClick={() => onQuote(item)} icon={<ArrowRight className="h-4 w-4" />}>
                    Get Quotation
                </GlowButton>

                <div className="inline-flex items-center justify-center rounded-2xl border border-[#e8dfce] bg-[#faf8f2] px-4 py-3 text-sm font-semibold text-[#0b4d3b]/70">
                    Best for {item.eventType}
                </div>
            </div>
        </motion.div>
    );
}

function StatCard({ item, index, featured = false }) {
    return (
        <motion.div
            custom={index}
            variants={cardReveal}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, scale: 1.01 }}
            className={`relative overflow-hidden rounded-[24px] border px-5 py-5 ${featured
                    ? "border-[#f2bf2f]/25 bg-[#fff9e6]/95 text-[#0b4d3b] shadow-[0_10px_20px_rgba(242,191,47,0.06)]"
                    : "border-white/12 bg-white/12 text-white"
                }`}
        >
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-5 -translate-y-5 rounded-full bg-[#f2bf2f]/10 blur-2xl" />
            <p className={`relative z-10 text-sm ${featured ? "text-[#0b4d3b]/65" : "text-white/65"}`}>
                {item.label}
            </p>
            <p
                className={`relative z-10 mt-2 text-[22px] font-black leading-tight md:text-[26px] ${featured ? "text-[#0b4d3b]" : "text-[#f2bf2f]"
                    }`}
            >
                {item.value}
            </p>
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
            { label: "Event Styles", value: "Wedding & Debut" },
            { label: "Luxury Touch", value: "Premium Setup" },
        ],
        []
    );

    const highlights = useMemo(
        () => [
            {
                icon: <Crown className="h-5 w-5 text-[#f2bf2f]" />,
                label: "Elegant Styling",
            },
            {
                icon: <ShieldCheck className="h-5 w-5 text-[#f2bf2f]" />,
                label: "Trusted Service",
            },
            {
                icon: <HeartHandshake className="h-5 w-5 text-[#f2bf2f]" />,
                label: "Memorable Experience",
            },
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
        <div className="min-h-screen overflow-x-hidden bg-[#f6f3ec] text-[#0b4d3b]">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b4d3b]/90 text-white shadow-sm backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
                    <div>
                        <h1 className="text-[22px] font-black tracking-tight text-[#f2bf2f] md:text-[27px]">
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

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-white/10 px-5 pb-4 md:hidden"
                        >
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#072f25_0%,#0b4d3b_45%,#10624a_100%)] px-5 pb-20 pt-14 md:px-10 md:pb-24 md:pt-20 lg:px-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,191,47,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.07),transparent_20%)]" />
                <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:34px_34px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent,rgba(0,0,0,0.08))]" />

                <FloatingOrb className="absolute left-[4%] top-[14%] h-36 w-36 rounded-full bg-[#f2bf2f]/10 blur-3xl" />
                <FloatingOrb
                    className="absolute right-[8%] top-[10%] h-44 w-44 rounded-full bg-white/8 blur-3xl"
                    delay={1}
                    duration={10}
                />
                <FloatingOrb
                    className="absolute bottom-[10%] left-[38%] h-36 w-36 rounded-full bg-[#f2bf2f]/10 blur-3xl"
                    delay={0.7}
                    duration={9}
                />

                <HeroParticle className="absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-white/50" delay={0.4} />
                <HeroParticle className="absolute left-[30%] top-[14%] h-1.5 w-1.5 rounded-full bg-[#f2bf2f]/70" delay={1} duration={6} />
                <HeroParticle className="absolute right-[24%] top-[26%] h-2 w-2 rounded-full bg-white/50" delay={0.7} duration={8} />
                <HeroParticle className="absolute right-[14%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-[#f2bf2f]/70" delay={0.3} duration={7} />

                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            className="text-white"
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/90 shadow-[0_8px_20px_rgba(0,0,0,0.14)] backdrop-blur-sm md:text-sm">
                                <Sparkles size={14} className="text-[#f2bf2f]" />
                                Premium packages crafted for once-in-a-lifetime moments
                            </div>

                            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60 md:text-xs">
                                Ebit&apos;s Catering Collection
                            </p>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-4 max-w-4xl text-[38px] font-black leading-[0.98] sm:text-[52px] md:text-[68px]"
                            >
                                Luxury Event
                                <span className="mt-1 block bg-gradient-to-r from-[#f8d35a] via-[#f2bf2f] to-[#d4a514] bg-clip-text text-transparent">
                                    Packages That Impress
                                </span>
                            </motion.h2>

                            <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/82 md:text-[17px]">
                                Discover beautifully curated wedding and debut packages with
                                premium styling, elegant inclusions, optional add-ons, and a
                                polished presentation that feels aligned with your best pages.
                            </p>

                            <div className="mt-9 flex flex-wrap gap-4">
                                <GlowButton
                                    onClick={() =>
                                        handleGetQuotation({
                                            id: "general-quotation",
                                            title: "General Package Inquiry",
                                        })
                                    }
                                    icon={<ArrowRight size={18} />}
                                >
                                    Get Quotation
                                </GlowButton>

                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 font-bold text-white shadow-[0_18px_36px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15"
                                >
                                    Back to Home
                                    <ChevronRight size={18} />
                                </Link>
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                {highlights.map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        custom={index}
                                        variants={cardReveal}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        className="rounded-[24px] border border-white/12 bg-white/10 px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-lg"
                                    >
                                        <div className="mb-3">{item.icon}</div>
                                        <p className="text-sm font-semibold text-white/90">
                                            {item.label}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={softScale}
                            className="relative"
                        >
                            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[#f2bf2f]/16 blur-3xl" />
                            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/12 blur-3xl" />

                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                                className="relative rounded-[36px] border border-white/12 bg-white/10 p-4 shadow-[0_30px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
                            >
                                <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] p-5 md:p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
                                                Featured Collection
                                            </p>
                                            <h3 className="mt-3 text-[28px] font-black leading-tight text-white md:text-[34px]">
                                                Signature
                                                <span className="mt-1 block text-[#f2bf2f]">
                                                    Celebration Packages
                                                </span>
                                            </h3>
                                        </div>

                                        <div className="rounded-2xl border border-[#f2bf2f]/20 bg-[#f2bf2f]/14 p-3 shadow-[0_10px_24px_rgba(242,191,47,0.12)]">
                                            <Gem className="h-7 w-7 text-[#f2bf2f]" />
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        {stats.map((item, index) => (
                                            <StatCard
                                                key={item.label}
                                                item={item}
                                                index={index}
                                                featured={index === 0 || index === 3}
                                            />
                                        ))}
                                    </div>

                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="mt-5 rounded-[24px] border border-white/12 bg-[#082f25]/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-[#f2bf2f]/15 p-3">
                                                <Star className="h-5 w-5 text-[#f2bf2f]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Designed for presentation-ready impact
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-white/70">
                                                    Cleaner hierarchy, richer depth, premium motion,
                                                    and a more luxurious visual balance.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="relative bg-[linear-gradient(180deg,#f6f3ec_0%,#f0f4f1_100%)] px-5 py-16 md:px-10 md:py-20 lg:px-20">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle
                        eyebrow="Quick Rate Guide"
                        title="Starting"
                        highlight="Rates"
                        desc="A clean overview of standard catering package rates based on guest count."
                    />

                    <div className="grid gap-5 md:grid-cols-3">
                        {[
                            { pax: "50 Pax", price: "₱20,000", note: "Ideal for intimate celebrations" },
                            { pax: "75 Pax", price: "₱30,000", note: "Balanced and flexible setup" },
                            { pax: "100 Pax", price: "₱40,000", note: "Best for bigger memorable events" },
                        ].map((rate, index) => (
                            <motion.div
                                key={rate.pax}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                custom={index}
                                variants={cardReveal}
                                whileHover={{ y: -7, scale: 1.01 }}
                                className={`relative overflow-hidden rounded-[30px] border p-7 text-center transition ${index === 1
                                        ? "border-transparent bg-[linear-gradient(180deg,#0b4d3b_0%,#08392d_100%)] text-white shadow-[0_20px_50px_rgba(11,77,59,0.25)]"
                                        : "border-[#e8dfd1] bg-white text-[#0b4d3b] shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                                    }`}
                            >
                                <div className="absolute right-0 top-0 h-28 w-28 translate-x-6 -translate-y-6 rounded-full bg-[#f2bf2f]/10 blur-2xl" />

                                <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.28em] opacity-70">
                                    Guest Count
                                </p>
                                <h3 className="relative z-10 mt-3 text-[32px] font-black md:text-[40px]">
                                    {rate.pax}
                                </h3>
                                <div className="relative z-10 mx-auto my-5 h-[3px] w-14 rounded-full bg-[#d7ad34]" />
                                <p className="relative z-10 text-[34px] font-black text-[#d7ad34] md:text-[44px]">
                                    {rate.price}
                                </p>
                                <p
                                    className={`relative z-10 mt-4 text-sm leading-6 ${index === 1 ? "text-white/75" : "text-slate-500"
                                        }`}
                                >
                                    {rate.note}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f0f4f1] px-5 pb-16 md:px-10 md:pb-20 lg:px-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={softScale}
                    className="mx-auto max-w-6xl rounded-[34px] border border-[#eadfbe] bg-[linear-gradient(135deg,#fffaf0_0%,#fff4d9_100%)] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.08)] md:p-9"
                >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f2bf2f]/20">
                                <Gift className="h-7 w-7 text-[#b78a11]" />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0b4d3b]/55 md:text-xs">
                                    Special Inclusion
                                </p>
                                <h3 className="mt-3 text-[28px] font-black text-[#0b4d3b] md:text-[40px]">
                                    Free <span className="text-[#d4a514]">Backdrop</span>
                                </h3>
                                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                                    Selected offers include a complimentary backdrop to elevate
                                    the styling, ambiance, and overall presentation of your
                                    celebration.
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c5a43] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(12,90,67,0.2)]">
                            <Gift className="h-4 w-4 text-[#f2bf2f]" />
                            Included in selected packages
                        </div>
                    </div>
                </motion.div>
            </section>

            <section className="bg-white px-5 py-16 md:px-10 md:py-20 lg:px-20">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        eyebrow="Wedding Collection"
                        title="Wedding"
                        highlight="Packages"
                        desc="Curated wedding package offers designed for elegant, polished, and memorable celebrations."
                    />

                    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {weddingPackages.map((item, index) => (
                            <PackageCard
                                key={item.id}
                                item={item}
                                onQuote={handleGetQuotation}
                                badge={
                                    index === 2
                                        ? "Popular Choice"
                                        : index === 4
                                            ? "Ultimate"
                                            : ""
                                }
                                featured={index === 2 || index === 4}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0b4d3b_0%,#082f25_100%)] px-5 py-16 md:px-10 md:py-20 lg:px-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,191,47,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_18%)]" />
                <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:42px_42px]" />

                <div className="relative z-10 mx-auto max-w-7xl">
                    <SectionTitle
                        eyebrow="Debut Collection"
                        title="Debut"
                        highlight="Packages"
                        desc="Premium selections crafted for glamorous and unforgettable debut celebrations."
                        light
                    />

                    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {debutPackages.map((item, index) => (
                            <PackageCard
                                key={item.id}
                                item={item}
                                onQuote={handleGetQuotation}
                                badge={
                                    index === 1
                                        ? "Recommended"
                                        : index === 3
                                            ? "Elite Choice"
                                            : ""
                                }
                                featured={index === 1 || index === 3}
                                dark
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f6f3ec] px-5 py-16 md:px-10 md:py-20 lg:px-20">
                <div className="mx-auto max-w-6xl">
                    <SectionTitle
                        eyebrow="Optional Services"
                        title="Available"
                        highlight="Add-ons"
                        desc="Optional enhancements you can include to make your celebration even more complete and premium."
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {addOns.map((addon, index) => (
                            <motion.div
                                key={addon.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                custom={index}
                                variants={cardReveal}
                                whileHover={{ y: -7, scale: 1.01 }}
                                className="group relative overflow-hidden rounded-[26px] border border-[#e8e2d6] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition hover:shadow-[0_18px_40px_rgba(0,0,0,0.09)]"
                            >
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-[#f2bf2f]/10 blur-2xl" />
                                <div className="absolute left-[-35%] top-0 h-full w-[30%] rotate-[18deg] bg-white/30 opacity-0 blur-xl transition duration-700 group-hover:left-[115%] group-hover:opacity-100" />

                                <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf4df] text-[#c99d1a]">
                                    {addon.icon}
                                </div>

                                <h3 className="relative z-10 text-lg font-black text-[#0b4d3b] md:text-xl">
                                    {addon.name}
                                </h3>
                                <p className="relative z-10 mt-3 text-[28px] font-black text-[#d1a31d]">
                                    {addon.price}
                                </p>
                                <p className="relative z-10 mt-3 text-sm leading-6 text-slate-500">
                                    A premium add-on that enhances the event atmosphere and guest
                                    experience.
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[linear-gradient(135deg,#082f25_0%,#0b4d3b_55%,#0f6b50_100%)] px-5 py-14 md:px-10 md:py-16 lg:px-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,191,47,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_18%)]" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    className="relative z-10 mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[32px] border border-white/10 bg-white/10 p-7 backdrop-blur-xl md:flex-row md:items-center md:p-8"
                >
                    <div className="text-white">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 md:text-xs">
                            Ready to Book
                        </p>
                        <h3 className="mt-3 text-[30px] font-black leading-tight md:text-[42px]">
                            Plan your event with{" "}
                            <span className="text-[#f2bf2f]">Ebit&apos;s Catering</span>
                        </h3>
                        <p className="mt-3 max-w-2xl leading-7 text-white/80">
                            Choose your preferred package and request a quotation for your
                            celebration. Elegant, polished, and ready for presentation.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <GlowButton
                            onClick={() =>
                                handleGetQuotation({
                                    id: "general-quotation",
                                    title: "General Package Inquiry",
                                })
                            }
                            icon={<ArrowRight size={18} />}
                        >
                            Get Quotation
                        </GlowButton>

                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 font-bold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15"
                        >
                            Back to Home
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

export default Packages;