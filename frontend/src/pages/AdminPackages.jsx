const weddingPackages = [
    {
        id: "basic-wedding",
        title: "Basic Wedding Package",
        price: "₱58,000",
        pax: "100 pax",
        category: "Wedding Package",
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
        pax: "100 pax",
        category: "Wedding Package",
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
        pax: "100 pax",
        category: "Wedding Package",
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
        pax: "100 pax",
        category: "Wedding Package",
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
        pax: "100 pax",
        category: "Wedding Package",
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
        pax: "100 pax",
        category: "Debut Package",
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
        pax: "100 pax",
        category: "Debut Package",
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
        pax: "100 pax",
        category: "Debut Package",
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
        pax: "100 pax",
        category: "Debut Package",
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

function AdminPackageCard({ item }) {
    return (
        <div className="rounded-[26px] border border-[#0f4d3c]/10 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b99117]">
                        {item.category}
                    </p>
                    <h3 className="mt-2 text-2xl font-extrabold text-[#0f4d3c]">
                        {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{item.pax}</p>
                </div>

                <div className="rounded-2xl bg-[#0f4d3c] px-4 py-2 text-lg font-extrabold text-[#f5c94a]">
                    {item.price}
                </div>
            </div>

            <div className="mt-5 h-[4px] w-16 rounded-full bg-[#d4af37]" />

            <div className="mt-5">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f4d3c]">
                    Full Inclusions
                </h4>

                <ul className="mt-4 grid gap-3">
                    {item.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#d4af37] shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function AdminPackages() {
    return (
        <div className="space-y-8">
            <section className="rounded-[28px] bg-gradient-to-r from-[#0f4d3c] via-[#0e5b46] to-[#137255] p-7 text-white shadow-[0_18px_40px_rgba(15,77,60,0.15)]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-semibold">
                    Admin Package Management
                </p>
                <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">
                    Package Information Overview
                </h1>
                <p className="mt-3 max-w-3xl text-white/85 leading-7">
                    This page shows the complete details of every wedding and debut package
                    offered in the system so the owner can review the full inclusions shown
                    to clients during quotation and booking.
                </p>
            </section>

            <section className="rounded-[28px] border border-[#e9dec2] bg-[#fffaf0] p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[22px] bg-white p-5 border border-[#f0e2b7]">
                        <p className="text-sm text-gray-500">Wedding Packages</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                            {weddingPackages.length}
                        </h2>
                    </div>

                    <div className="rounded-[22px] bg-white p-5 border border-[#f0e2b7]">
                        <p className="text-sm text-gray-500">Debut Packages</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                            {debutPackages.length}
                        </h2>
                    </div>

                    <div className="rounded-[22px] bg-white p-5 border border-[#f0e2b7]">
                        <p className="text-sm text-gray-500">Available Add-ons</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                            {addOns.length}
                        </h2>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#b99117] font-semibold">
                        Catering Packages
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        Wedding Packages
                    </h2>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    {weddingPackages.map((item) => (
                        <AdminPackageCard key={item.id} item={item} />
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#b99117] font-semibold">
                        Celebration Packages
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        Debut Packages
                    </h2>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    {debutPackages.map((item) => (
                        <AdminPackageCard key={item.id} item={item} />
                    ))}
                </div>
            </section>

            <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#b99117] font-semibold">
                        Add-on Services
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        Available Add-ons
                    </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {addOns.map((item) => (
                        <div
                            key={item.name}
                            className="rounded-[22px] border border-[#0f4d3c]/10 bg-[#f8fbfa] p-5"
                        >
                            <h3 className="text-lg font-bold text-[#0f4d3c]">{item.name}</h3>
                            <p className="mt-2 text-2xl font-extrabold text-[#b99117]">
                                {item.price}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default AdminPackages;