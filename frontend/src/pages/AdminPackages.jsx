import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Pencil,
    X,
    Save,
    Loader2,
    AlertTriangle,
} from "lucide-react";

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (!envUrl) {
        return "https://ebitscatering-production.up.railway.app/api";
    }

    const cleaned = envUrl.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

const API_BASE = getApiBaseUrl();
const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

function getToken() {
    return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("clientToken") ||
        ""
    );
}

function formatPeso(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

function AdminPackageCard({ item, index = 0, onEdit }) {
    const features = Array.isArray(item.features) ? item.features : [];

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
                    {item.pax ? (
                        <p className="mt-2 text-sm text-slate-500">{item.pax}</p>
                    ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="rounded-2xl bg-[#0f4d3c] px-4 py-2 text-lg font-extrabold text-[#f5c94a] shadow-sm">
                        {item.price || formatPeso(item.rawPrice)}
                    </div>

                    <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce7e2] bg-[#f8fbfa] px-3 py-1.5 text-xs font-bold text-[#0f4d3c] transition hover:border-[#d4af37] hover:bg-[#fff8e6]"
                    >
                        <Pencil size={13} />
                        Edit Price
                    </motion.button>
                </div>
            </div>

            <div className="mt-5 h-[4px] w-16 rounded-full bg-[#d4af37]" />

            <div className="mt-5">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f4d3c]">
                    Full Inclusions
                </h4>

                {features.length === 0 ? (
                    <p className="mt-4 rounded-2xl border border-dashed border-[#dce7e2] bg-[#f8fbfa] px-4 py-3 text-sm text-slate-500">
                        No inclusions saved yet.
                    </p>
                ) : (
                    <ul className="mt-4 grid gap-3">
                        {features.map((feature, featureIndex) => (
                            <motion.li
                                key={`${item.id}-${featureIndex}`}
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
                )}
            </div>
        </motion.div>
    );
}

function SummaryCard({ label, value, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[22px] border border-[#f0e2b7] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b99117]">
                Summary
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
            <h2 className="mt-2 text-4xl font-extrabold text-[#0f4d3c]">
                {value}
            </h2>
        </motion.div>
    );
}

function EditPriceModal({
    editingPackage,
    editPrice,
    setEditPrice,
    saving,
    error,
    onClose,
    onSave,
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[5px]"
        >
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[460px] overflow-hidden rounded-[26px] border border-[#efe2a9] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
            >
                <div className="flex items-start justify-between gap-4 border-b border-[#edf2ef] bg-[linear-gradient(180deg,#fffdf6_0%,#f8fbfa_100%)] px-6 py-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b99117]">
                            Edit Package Price
                        </p>
                        <h3 className="mt-2 text-2xl font-extrabold text-[#0f4d3c]">
                            {editingPackage.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Current price: {editingPackage.price}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    {error ? (
                        <div className="mb-4 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <AlertTriangle size={18} />
                            <span>{error}</span>
                        </div>
                    ) : null}

                    <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                        New Price
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Enter new price"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                    />

                    <div className="mt-6 flex justify-end gap-3">
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-2xl border border-[#dce7e2] bg-white px-5 py-3 text-sm font-semibold text-[#0f4d3c] transition hover:bg-[#f8fbfa] disabled:opacity-60"
                        >
                            Cancel
                        </motion.button>

                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#0f4d3c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3f31] disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Price
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [editingPackage, setEditingPackage] = useState(null);
    const [editPrice, setEditPrice] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const fetchPackages = async () => {
        setLoading(true);
        setFetchError("");

        try {
            const res = await fetch(`${API_BASE}/packages`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to load packages.");
            }

            const data = await res.json();
            setPackages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch packages error:", err);
            setFetchError(err.message || "Failed to load packages.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const weddingPackages = useMemo(
        () => packages.filter((item) => item.packageGroup === "Wedding"),
        [packages]
    );

    const debutPackages = useMemo(
        () => packages.filter((item) => item.packageGroup === "Debut"),
        [packages]
    );

    const addOns = useMemo(
        () => packages.filter((item) => item.packageGroup === "Add-on"),
        [packages]
    );

    const openEditModal = (item) => {
        setEditingPackage(item);
        setEditPrice(String(item.rawPrice || "").replace(/[^\d.]/g, ""));
        setSaveError("");
    };

    const closeEditModal = () => {
        if (saving) return;
        setEditingPackage(null);
        setEditPrice("");
        setSaveError("");
    };

    const handleSavePrice = async () => {
        if (!editingPackage) return;

        const numericPrice = Number(editPrice);

        if (!numericPrice || numericPrice < 0) {
            setSaveError("Please enter a valid price.");
            return;
        }

        setSaving(true);
        setSaveError("");

        try {
            const token = getToken();

            const res = await fetch(`${API_BASE}/packages/${editingPackage.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    price: numericPrice,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Failed to update package price.");
            }

            await fetchPackages();
            closeEditModal();
        } catch (err) {
            console.error("Update package price error:", err);
            setSaveError(err.message || "Failed to update package price.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
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
                                Review, edit, and sync package prices across admin, client,
                                home, and quotation pages.
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
                        <SummaryCard label="Wedding Packages" value={weddingPackages.length} delay={0.04} />
                        <SummaryCard label="Debut Packages" value={debutPackages.length} delay={0.1} />
                        <SummaryCard label="Available Add-ons" value={addOns.length} delay={0.16} />
                    </div>
                </motion.section>

                {loading ? (
                    <div className="rounded-[28px] border border-[#dce7e2] bg-white p-10 text-center text-slate-500">
                        Loading packages...
                    </div>
                ) : fetchError ? (
                    <div className="rounded-[28px] border border-red-100 bg-red-50 p-10 text-center text-red-600">
                        {fetchError}
                    </div>
                ) : (
                    <>
                        <motion.section variants={fadeUp} transition={{ duration: 0.46, ease: "easeOut" }} className="space-y-6">
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
                                    <AdminPackageCard key={item.id} item={item} index={index} onEdit={openEditModal} />
                                ))}
                            </div>
                        </motion.section>

                        <motion.section variants={fadeUp} transition={{ duration: 0.46, ease: "easeOut" }} className="space-y-6">
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
                                    <AdminPackageCard key={item.id} item={item} index={index} onEdit={openEditModal} />
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
                                        key={item.id}
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
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#b99117]">
                                                    Add-on Service
                                                </p>
                                                <h3 className="mt-3 text-lg font-bold text-[#0f4d3c]">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-2 text-2xl font-extrabold text-[#b99117]">
                                                    {item.price}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => openEditModal(item)}
                                                className="rounded-xl border border-[#dce7e2] bg-white px-3 py-2 text-xs font-bold text-[#0f4d3c] transition hover:border-[#d4af37] hover:bg-[#fff8e6]"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    </>
                )}
            </motion.div>

            <AnimatePresence>
                {editingPackage && (
                    <EditPriceModal
                        editingPackage={editingPackage}
                        editPrice={editPrice}
                        setEditPrice={setEditPrice}
                        saving={saving}
                        error={saveError}
                        onClose={closeEditModal}
                        onSave={handleSavePrice}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminPackages;