import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    CheckCircle2,
    Crown,
    Gift,
    Sparkles,
    UtensilsCrossed,
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
    { name: "Lights and Sounds", price: "₱4,000", icon: <Mic2 className="w-5 h-5" /> },
    { name: "Host", price: "₱3,500", icon: <PartyPopper className="w-5 h-5" /> },
    { name: "Cake", price: "₱2,000", icon: <Gift className="w-5 h-5" /> },
    { name: "Photo", price: "₱5,000", icon: <Camera className="w-5 h-5" /> },
    { name: "Photo/Video", price: "₱15,000", icon: <Camera className="w-5 h-5" /> },
    { name: "SDE", price: "₱27,000", icon: <Sparkles className="w-5 h-5" /> },
];

function PackageCard({ item, onQuote, badge }) {
    const visibleFeatures = item.features.slice(0, 8);
    const extraCount = item.features.length - visibleFeatures.length;

    return (
        <div className="rounded-[28px] border border-[#e7dfd1] bg-[#fffdf8] p-6 md:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full">
            <div className="flex items-start justify-between gap-4">
                <div>
                    {badge && (
                        <div className="inline-flex rounded-full bg-[#fff3c8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b7510] mb-4">
                            {badge}
                        </div>
                    )}

                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0b4d3b]/55">
                        {item.category}
                    </p>

                    <h3 className="mt-3 text-[24px] md:text-[28px] font-extrabold leading-tight text-[#0b4d3b]">
                        {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">{item.pax}</p>
                </div>

                <div className="text-right shrink-0">
                    <p className="text-[28px] md:text-[32px] font-extrabold text-[#d1a31d] leading-none">
                        {item.price}
                    </p>
                </div>
            </div>

            <div className="w-14 h-[3px] rounded-full bg-[#d1a31d] mt-5 mb-5" />

            <ul className="space-y-3 flex-1">
                {visibleFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-[15px] md:text-[16px] text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#c99d1a] shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}

                {extraCount > 0 && (
                    <li className="text-[14px] font-medium text-[#0b4d3b]/70 pt-1">
                        +{extraCount} more inclusions
                    </li>
                )}
            </ul>

            <button
                onClick={() => onQuote(item)}
                className="mt-6 inline-flex w-fit items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-[#0b4d3b] transition hover:bg-yellow-300"
            >
                Get Quotation
            </button>
        </div>
    );
}

function SectionTitle({ eyebrow, title, highlight, desc, light = false }) {
    return (
        <div className="text-center mb-12 md:mb-14">
            <p
                className={`text-[11px] md:text-xs font-semibold uppercase tracking-[0.35em] ${light ? "text-white/70" : "text-[#0b4d3b]/65"
                    }`}
            >
                {eyebrow}
            </p>
            <h2
                className={`mt-3 text-[34px] sm:text-[40px] md:text-[52px] leading-tight font-bold ${light ? "text-white" : "text-[#0b4d3b]"
                    }`}
            >
                {title} <span className="text-[#d4a514]">{highlight}</span>
            </h2>
            <p
                className={`mt-4 text-[15px] md:text-[17px] max-w-2xl mx-auto ${light ? "text-white/80" : "text-slate-500"
                    }`}
            >
                {desc}
            </p>
        </div>
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
        "block rounded-xl px-4 py-3 text-base font-semibold text-white hover:bg-white/10 transition";

    return (
        <div className="min-h-screen bg-[#f7f4ee]">
            <header className="sticky top-0 z-50 bg-[#0b4d3b] text-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 py-4">
                    <div>
                        <h1 className="text-[22px] md:text-[26px] font-extrabold text-[#f2bf2f]">
                            Ebit&apos;s Catering
                        </h1>
                        <p className="text-[11px] md:text-[13px] text-white/80">
                            For making parties better
                        </p>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-[15px]">
                        <Link to="/" className="font-semibold hover:text-[#f2bf2f] transition">
                            Home
                        </Link>
                        <Link to="/packages" className="font-semibold text-[#f2bf2f]">
                            Packages
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-xl border border-white px-5 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-[#0b4d3b] transition"
                        >
                            Login
                        </Link>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/20 p-2"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10 px-5 pb-4">
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
                                className="mt-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 font-semibold text-[#0b4d3b]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <section className="relative overflow-hidden bg-[#0c5a43] px-5 md:px-10 lg:px-20 py-16 md:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-10 items-center">
                        <div className="text-white">
                            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                                Ebit&apos;s Catering
                            </p>

                            <h2 className="mt-4 text-[40px] sm:text-[52px] md:text-[68px] font-extrabold leading-[1.02]">
                                Catering <span className="text-[#f2bf2f]">Packages</span>
                            </h2>

                            <p className="mt-5 max-w-2xl text-[16px] md:text-[18px] leading-8 text-white/85">
                                Explore our curated wedding and debut packages, complete
                                event inclusions, freebie offers, and optional add-ons
                                designed for elegant and memorable celebrations.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-xl bg-[#f2bf2f] px-6 py-3.5 font-semibold text-[#0b4d3b] hover:bg-[#f7c93c] transition"
                                >
                                    Book Your Event
                                </Link>

                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-semibold text-white hover:bg-white/15 transition"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {stats.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-[24px] border border-white/10 bg-white/10 backdrop-blur-sm px-6 py-5 text-white"
                                >
                                    <p className="text-sm text-white/70">{item.label}</p>
                                    <p className="mt-2 text-[26px] font-extrabold text-[#f2bf2f]">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 md:px-10 lg:px-20 py-16 bg-[#f7f4ee]">
                <div className="max-w-6xl mx-auto">
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
                            <div
                                key={rate.pax}
                                className={`rounded-[26px] p-8 text-center shadow-sm border ${index === 1
                                        ? "bg-[#0c5a43] text-white border-transparent"
                                        : "bg-white text-[#0b4d3b] border-[#e8e2d6]"
                                    }`}
                            >
                                <p className="text-sm uppercase tracking-[0.28em] font-semibold opacity-70">
                                    Guest Count
                                </p>
                                <h3 className="mt-3 text-4xl font-extrabold">{rate.pax}</h3>
                                <div className="mx-auto my-5 h-[3px] w-14 rounded-full bg-[#d7ad34]" />
                                <p className="text-4xl md:text-5xl font-extrabold text-[#d7ad34]">
                                    {rate.price}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 md:px-10 lg:px-20 pb-16 bg-[#f7f4ee]">
                <div className="max-w-5xl mx-auto rounded-[30px] border border-[#eadfbe] bg-[#fff9e8] p-8 md:p-10 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#f2bf2f]/20 flex items-center justify-center shrink-0">
                                <Gift className="w-7 h-7 text-[#b78a11]" />
                            </div>

                            <div>
                                <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.35em] text-[#0b4d3b]/55">
                                    Freebie
                                </p>
                                <h3 className="mt-3 text-[32px] md:text-[42px] font-extrabold text-[#0b4d3b]">
                                    Free <span className="text-[#d4a514]">Backdrop</span>
                                </h3>
                                <p className="mt-3 text-slate-600 leading-7 max-w-2xl">
                                    Selected package offers include a free backdrop to enhance
                                    the styling and overall presentation of your event.
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-[#0c5a43] px-5 py-3 text-sm font-bold text-white w-fit">
                            <Gift className="w-4 h-4 text-[#f2bf2f]" />
                            Included in selected offers
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 md:px-10 lg:px-20 py-16">
                <div className="max-w-7xl mx-auto">
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

            <section className="bg-[#0c5a43] px-5 md:px-10 lg:px-20 py-16">
                <div className="max-w-7xl mx-auto">
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
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f7f4ee] px-5 md:px-10 lg:px-20 py-16">
                <div className="max-w-6xl mx-auto">
                    <SectionTitle
                        eyebrow="Optional Services"
                        title="Available"
                        highlight="Add-ons"
                        desc="Optional services you can include to make your celebration more complete and special."
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {addOns.map((addon) => (
                            <div
                                key={addon.name}
                                className="rounded-[24px] border border-[#e8e2d6] bg-white p-6 shadow-sm hover:shadow-lg transition"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#fbf4df] flex items-center justify-center text-[#c99d1a] mb-5">
                                    {addon.icon}
                                </div>

                                <h3 className="text-xl font-extrabold text-[#0b4d3b]">
                                    {addon.name}
                                </h3>
                                <p className="mt-3 text-3xl font-extrabold text-[#d1a31d]">
                                    {addon.price}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#0b4d3b] px-5 md:px-10 lg:px-20 py-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="text-white">
                        <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                            Ready to Book
                        </p>
                        <h3 className="mt-3 text-[30px] md:text-[40px] font-extrabold leading-tight">
                            Plan your event with <span className="text-[#f2bf2f]">Ebit&apos;s Catering</span>
                        </h3>
                        <p className="mt-3 text-white/80 max-w-2xl leading-7">
                            Choose your preferred package and request a quotation for your celebration.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            handleGetQuotation({
                                id: "general-quotation",
                                title: "General Package Inquiry",
                            })
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#f2bf2f] px-6 py-3.5 font-semibold text-[#0b4d3b] hover:bg-[#f7c93c] transition"
                    >
                        Request Quotation
                        <ChevronRight size={18} />
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Packages;