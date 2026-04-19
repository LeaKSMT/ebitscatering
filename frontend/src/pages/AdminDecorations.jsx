import { motion } from "framer-motion";
import { Sparkles, Palette, Tag } from "lucide-react";
import { getAdminDecorations } from "../utils/AdminData";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

function DecorationCard({ item, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-[26px] border border-[#dce7e2] bg-white shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
        >
            <div className="bg-gradient-to-r from-[#d4af37] to-[#1db784] px-6 py-4 text-white">
                <h3 className="text-2xl font-extrabold">{item.name}</h3>
            </div>

            <div className="p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#0b4a3a] px-3 py-1 text-sm font-bold text-white">
                    <Tag size={14} />
                    {item.category}
                </div>

                <p className="mt-4 text-slate-500">
                    Available for {item.category} events
                </p>
            </div>
        </motion.div>
    );
}

function AdminDecorations() {
    const decorations = getAdminDecorations();

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-6"
        >
            <motion.section
                variants={fadeUp}
                className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
            >
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl" />
                        <div className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                            <Sparkles size={13} />
                            Decorations Management
                        </div>

                        <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                            Decorative Themes & Styling
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                            Review decorative concepts, event categories, and available
                            styling options in a modern premium visual overview.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                className="rounded-[28px] border border-[#e9dec2] bg-[#fffaf0] p-6 shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1c2] text-[#b99117]">
                        <Palette size={22} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                            Decorations Overview
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            This section helps the admin review available decorative setups
                            and event styling categories shown in the catering system.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
                {decorations.map((item, index) => (
                    <DecorationCard key={item.name} item={item} index={index} />
                ))}
            </motion.section>
        </motion.div>
    );
}

export default AdminDecorations;