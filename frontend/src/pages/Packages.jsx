import { useNavigate, Link } from "react-router-dom";

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
    { name: "Lights and Sounds", price: "₱4,000" },
    { name: "Host", price: "₱3,500" },
    { name: "Cake", price: "₱2,000" },
    { name: "Photo", price: "₱5,000" },
    { name: "Photo/Video", price: "₱15,000" },
    { name: "SDE", price: "₱27,000" },
];

function PackageCard({ item, onQuote }) {
    return (
        <div className="rounded-[28px] bg-[#0b6b4b] border border-[#caa63a]/30 shadow-[0_14px_30px_rgba(0,0,0,0.12)] p-6 md:p-7 text-white min-h-[320px] flex flex-col">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-[24px] md:text-[28px] font-extrabold leading-tight">
                        {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-white/90">{item.pax}</p>
                    <p className="text-sm text-white/90">{item.category}</p>
                </div>

                <div className="text-[#d7ad34] text-[26px] md:text-[28px] font-extrabold whitespace-nowrap">
                    {item.price}
                </div>
            </div>

            <div className="w-16 h-[4px] rounded-full bg-[#d7ad34] mt-4 mb-5" />

            <ul className="space-y-3 flex-1">
                {item.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-[15px] md:text-[16px]">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[#d7ad34] shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onQuote(item)}
                className="mt-6 inline-flex w-fit items-center justify-center rounded-2xl bg-[#d7ad34] px-6 py-3 text-sm font-bold text-[#0b5d45] transition hover:brightness-95"
            >
                Get Quotation
            </button>
        </div>
    );
}

function Packages() {
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen bg-[#f4f0e8]">
            <header className="sticky top-0 z-30 bg-[#0b5d45] text-white shadow-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-[20px] md:text-[22px] font-extrabold text-[#f2bf2f]">
                            Ebit&apos;s Catering
                        </h1>
                        <p className="text-xs text-white/80">For making parties better</p>
                    </div>

                    <nav className="flex items-center gap-3 md:gap-5">
                        <Link to="/" className="text-sm font-semibold hover:text-[#f2bf2f]">
                            Home
                        </Link>
                        <Link to="/packages" className="text-sm font-semibold text-[#f2bf2f]">
                            Packages
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#0b5d45] hover:bg-[#f7f7f7]"
                        >
                            Login
                        </Link>
                    </nav>
                </div>
            </header>

            <section className="bg-[#0b5d45] px-6 py-16 text-center text-white">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">
                    Ebit&apos;s Catering
                </p>
                <h2 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
                    Catering <span className="text-[#d7ad34]">Packages</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-white/90">
                    Explore our complete packages, classic menu selections, freebies, and add-ons
                    designed to make your celebration memorable and elegant.
                </p>
            </section>

            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#0b5d45]/80">
                            Ebit&apos;s Catering
                        </p>
                        <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-[#0b5d45]">
                            Quick <span className="text-[#d7ad34]">Rates</span>
                        </h2>
                        <p className="mt-3 text-[#355a57]">
                            Standard catering package rates based on guest count
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {[
                            { pax: "50 Pax", price: "₱20,000" },
                            { pax: "75 Pax", price: "₱30,000" },
                            { pax: "100 Pax", price: "₱40,000" },
                        ].map((rate) => (
                            <div
                                key={rate.pax}
                                className="rounded-[28px] bg-[#0b6b4b] p-8 text-center text-white shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
                            >
                                <h3 className="text-4xl font-extrabold">{rate.pax}</h3>
                                <div className="mx-auto my-5 h-[4px] w-16 rounded-full bg-[#d7ad34]" />
                                <p className="text-5xl font-extrabold text-[#d7ad34]">{rate.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-6 py-16">
                <div className="mx-auto max-w-7xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#0b5d45]/80">
                        Ebit&apos;s Catering
                    </p>
                    <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-[#0b5d45]">
                        Free <span className="text-[#d7ad34]">Freebie</span>
                    </h2>
                    <p className="mt-3 text-[#355a57]">Included free item for selected offers</p>

                    <div className="mt-10 inline-flex rounded-full bg-[#0b6b4b] px-10 py-5 text-xl font-extrabold text-white shadow-md">
                        Backdrop
                    </div>
                </div>
            </section>

            <section className="bg-[#f4f0e8] px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#0b5d45]/80">
                            Ebit&apos;s Catering
                        </p>
                        <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-[#0b5d45]">
                            Wedding <span className="text-[#d7ad34]">Packages</span>
                        </h2>
                        <p className="mt-3 text-[#355a57]">
                            Choose from our wedding package offers
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 lg:grid-cols-2">
                        {weddingPackages.map((item) => (
                            <PackageCard
                                key={item.id}
                                item={item}
                                onQuote={handleGetQuotation}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#0b5d45] px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center text-white">
                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">
                            Ebit&apos;s Catering
                        </p>
                        <h2 className="mt-3 text-4xl md:text-5xl font-extrabold">
                            Debut <span className="text-[#d7ad34]">Packages</span>
                        </h2>
                        <p className="mt-3 text-white/85">
                            Choose from our debut celebration package offers
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 lg:grid-cols-2">
                        {debutPackages.map((item) => (
                            <PackageCard
                                key={item.id}
                                item={item}
                                onQuote={handleGetQuotation}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#0b5d45]/80">
                            Ebit&apos;s Catering
                        </p>
                        <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-[#0b5d45]">
                            Available <span className="text-[#d7ad34]">Add-ons</span>
                        </h2>
                        <p className="mt-3 text-[#355a57]">
                            Optional services you can add to your selected package
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {addOns.map((addon) => (
                            <div
                                key={addon.name}
                                className="rounded-[24px] border border-[#0b5d45]/10 bg-[#f8f6f1] p-6 shadow-sm"
                            >
                                <h3 className="text-xl font-extrabold text-[#0b5d45]">{addon.name}</h3>
                                <p className="mt-3 text-3xl font-extrabold text-[#d7ad34]">{addon.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Packages;