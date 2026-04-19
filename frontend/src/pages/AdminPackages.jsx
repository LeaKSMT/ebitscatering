import { motion } from "framer-motion";
import {
    Sparkles,
    Package2,
    Gem,
    Gift,
    BadgeCheck,
} from "lucide-react";

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

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

function AdminPackageCard({ item, index = 0 }) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.46, delay: index * 0.06, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)] transition-shadow hover:shadow-[0_18px_42px_rgba(14,61,47,0.10)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b99117]">
                        {item.category}
                    </p>
                    <h3 className="mt-2 text-2xl font-extrabold text-[#0f4d3c]">
                        {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">{item.pax}</p>
                </div>

                <div className="rounded-2xl bg-[#0f4d3c] px-4 py-2 text-lg font-extrabold text-[#f5c94a] shadow-sm">
                    {item.price}
                </div>
            </div>

            <div className="mt-5 h-[4px] w-16 rounded-full bg-[#d4af37]" />

            <div className="mt-5">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f4d3c]">
                    Full Inclusions
                </h4>

                <ul className="mt-4 grid gap-3">
                    {item.features.map((feature, featureIndex) => (
                        <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.32,
                                delay: 0.06 + featureIndex * 0.018,
                                ease: "easeOut",
                            }}
                            className="flex items-start gap-3 text-sm text-slate-700"
                        >
                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d4af37]" />
                            <span>{feature}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

function SummaryCard({ icon: Icon, label, value, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[22px] border border-[#f0e2b7] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff6dc] text-[#0f4d3c]">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <h2 className="mt-1 text-3xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h2>
                </div>
            </div>
        </motion.div>
    );
}

function AdminPackages() {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.1 }}
            className="space-y-8"
        >
            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
            >
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl" />
                        <div className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                    </div>

                    <motion.div
                        animate={{ x: ["-30%", "130%"] }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "linear",
                        }}
                        className="pointer-events-none absolute inset-y-0 left-[-35%] w-[28%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                            <Sparkles size={13} />
                            Admin Package Management
                        </div>

                        <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                            Package Information Overview
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                            Review complete wedding and debut package offerings, compare
                            inclusions, and present your services in a clean premium admin
                            workspace.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="rounded-[28px] border border-[#e9dec2] bg-[#fffaf0] p-6 shadow-sm"
            >
                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        icon={Gem}
                        label="Wedding Packages"
                        value={weddingPackages.length}
                        delay={0.04}
                    />
                    <SummaryCard
                        icon={Package2}
                        label="Debut Packages"
                        value={debutPackages.length}
                        delay={0.1}
                    />
                    <SummaryCard
                        icon={Gift}
                        label="Available Add-ons"
                        value={addOns.length}
                        delay={0.16}
                    />
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="space-y-6"
            >
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b99117]">
                        Catering Packages
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        Wedding Packages
                    </h2>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    {weddingPackages.map((item, index) => (
                        <AdminPackageCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="space-y-6"
            >
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b99117]">
                        Celebration Packages
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        Debut Packages
                    </h2>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    {debutPackages.map((item, index) => (
                        <AdminPackageCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
            >
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b99117]">
                        Add-on Services
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        Available Add-ons
                    </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {addOns.map((item, index) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{
                                duration: 0.42,
                                delay: index * 0.06,
                                ease: "easeOut",
                            }}
                            whileHover={{ y: -4 }}
                            className="rounded-[22px] border border-[#dce7e2] bg-[#f8fbfa] p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                                <BadgeCheck size={20} />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-[#0f4d3c]">
                                {item.name}
                            </h3>
                            <p className="mt-2 text-2xl font-extrabold text-[#b99117]">
                                {item.price}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </motion.div>
    );
}

export default AdminPackages;