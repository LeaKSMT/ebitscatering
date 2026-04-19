import { motion } from "framer-motion";
import {
    Sparkles,
    CircleDollarSign,
    BadgeDollarSign,
    ReceiptText,
} from "lucide-react";
import { ADD_ONS, formatCurrency } from "../utils/AdminData";

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

function PricingCard({ item, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[22px] border border-[#dce7e2] bg-[#f8fafc] p-5 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                <BadgeDollarSign size={20} />
            </div>

            <h3 className="mt-4 text-2xl font-bold text-[#0f4d3c]">
                {item.name}
            </h3>
            <p className="mt-4 text-4xl font-extrabold text-[#d4af37]">
                {formatCurrency(item.price)}
            </p>
        </motion.div>
    );
}

function AdminPricing() {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.1 }}
            className="space-y-6"
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
                            Pricing Control
                        </div>

                        <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                            Package Breakdown & Pricing
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                            Review the standard guest rate and all add-on service fees in a
                            premium pricing workspace for faster client quotation support.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="overflow-hidden rounded-[28px] border border-[#dce7e2] bg-white shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
            >
                <div className="bg-[#0b4a3a] px-6 py-4 text-2xl font-bold text-white">
                    Base Pricing
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.44, ease: "easeOut" }}
                    className="p-10 text-center"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf8f3] text-[#0f4d3c]">
                        <CircleDollarSign size={30} />
                    </div>
                    <p className="mt-5 text-2xl text-slate-500">Standard Rate Per Guest</p>
                    <h2 className="mt-4 text-6xl font-extrabold text-[#d4af37]">₱400</h2>
                    <p className="mt-3 text-slate-500">
                        Includes: Food, Table Setup, Service Staff
                    </p>
                </motion.div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="overflow-hidden rounded-[28px] border border-[#dce7e2] bg-white shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
            >
                <div className="bg-[#1db784] px-6 py-4 text-2xl font-bold text-white">
                    Add-ons Pricing
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">
                    {ADD_ONS.map((item, index) => (
                        <PricingCard key={item.name} item={item} index={index} />
                    ))}
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="rounded-[28px] border border-[#e9dec2] bg-[#fffaf0] p-6 shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1c2] text-[#b99117]">
                        <ReceiptText size={22} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-[#0f4d3c]">
                            Pricing Note
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                            This pricing page serves as the official admin reference for
                            quotation computations. The standard guest rate is fixed at
                            <span className="font-bold text-[#0f4d3c]"> ₱400 per pax</span>,
                            while all optional services are computed separately as add-ons.
                        </p>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}

export default AdminPricing;