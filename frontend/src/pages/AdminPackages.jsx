import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Pencil,
    X,
    Save,
    Loader2,
    AlertTriangle,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Archive,
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

const PACKAGE_GROUPS = [
    { value: "Wedding", label: "Wedding Package", category: "Wedding Package" },
    { value: "Debut", label: "Debut Package", category: "Debut Package" },
    { value: "Birthday", label: "Birthday Package", category: "Birthday Package" },
    { value: "Corporate", label: "Corporate Package", category: "Corporate Package" },
    { value: "Anniversary", label: "Anniversary Package", category: "Anniversary Package" },
    { value: "Christening", label: "Christening Package", category: "Christening Package" },
    { value: "Add-on", label: "Add-on Service", category: "Add-on Service" },
    { value: "Custom", label: "Custom Package", category: "Custom Package" },
];

const emptyForm = {
    title: "",
    description: "",
    category: "Wedding Package",
    packageGroup: "Wedding",
    pax: "100 pax",
    price: "",
    features: [""],
    isActive: true,
    showOnClient: true,
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

function cleanFeatures(features) {
    return (Array.isArray(features) ? features : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean);
}

function getRawPrice(value) {
    return Number(String(value || "").replace(/[₱,\s]/g, "")) || 0;
}

function packageToForm(item) {
    return {
        title: item?.title || "",
        description: item?.description || "",
        category: item?.category || "Wedding Package",
        packageGroup: item?.packageGroup || "Wedding",
        pax: item?.pax || "",
        price: String(item?.rawPrice || getRawPrice(item?.price) || ""),
        features: Array.isArray(item?.features) && item.features.length ? item.features : [""],
        isActive: item?.isActive !== false,
        showOnClient: item?.showOnClient !== false,
    };
}
function isAddOnItem(item) {
    return item?.packageGroup === "Add-on" || item?.category === "Add-on Service";
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

function AdminPackageCard({ item, index = 0, onEdit, onArchive }) {
    const features = Array.isArray(item.features) ? item.features : [];
    const active = item.isActive !== false;
    const visible = item.showOnClient !== false;
    const isAddOn = isAddOnItem(item);

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.46, delay: index * 0.05, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className={`rounded-[28px] border p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)] transition-shadow hover:shadow-[0_18px_42px_rgba(14,61,47,0.10)] ${active
                ? "border-[#dce7e2] bg-white"
                : "border-slate-200 bg-slate-50 opacity-80"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b99117]">
                            {item.category}
                        </p>

                        <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-200 text-slate-600"
                                }`}
                        >
                            {active ? "Active" : "Inactive"}
                        </span>

                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${visible
                                ? "bg-[#fff7df] text-[#a57a10]"
                                : "bg-red-50 text-red-600"
                                }`}
                        >
                            {visible ? <Eye size={12} /> : <EyeOff size={12} />}
                            {visible ? "Client Visible" : "Hidden"}
                        </span>
                    </div>

                    <h3 className="mt-2 text-2xl font-extrabold text-[#0f4d3c]">
                        {item.title}
                    </h3>

                    {item.pax ? (
                        <p className="mt-2 text-sm text-slate-500">{item.pax}</p>
                    ) : null}

                    {item.description ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {item.description}
                        </p>
                    ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
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
                        {isAddOn ? "Edit Add-on" : "Edit Package"}
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => onArchive(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                        <Archive size={13} />
                        Archive
                    </motion.button>
                </div>
            </div>

            <div className="mt-5 h-[4px] w-16 rounded-full bg-[#d4af37]" />

            <div className="mt-5">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f4d3c]">
                    {isAddOn ? "Add-on Details" : "Full Inclusions"}
                </h4>

                {features.length === 0 ? (
                    <p className="mt-4 rounded-2xl border border-dashed border-[#dce7e2] bg-[#f8fbfa] px-4 py-3 text-sm text-slate-500">
                        {isAddOn ? "No add-on details saved yet." : "No inclusions saved yet."}
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

function PackageModal({
    mode,
    form,
    setForm,
    saving,
    error,
    onClose,
    onSave,
}) {
    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleGroupChange = (value) => {
        const selected = PACKAGE_GROUPS.find((item) => item.value === value);

        setForm((prev) => ({
            ...prev,
            packageGroup: value,
            category: selected?.category || prev.category,
        }));
    };

    const updateFeature = (index, value) => {
        setForm((prev) => {
            const next = [...prev.features];
            next[index] = value;
            return { ...prev, features: next };
        });
    };

    const addFeature = () => {
        setForm((prev) => ({
            ...prev,
            features: [...prev.features, ""],
        }));
    };

    const removeFeature = (index) => {
        setForm((prev) => {
            const next = prev.features.filter((_, i) => i !== index);
            return { ...prev, features: next.length ? next : [""] };
        });
    };

    const isAddOn = form.packageGroup === "Add-on";
    const itemLabel = isAddOn ? "Add-on" : "Package";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[5px]"
        >
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[92vh] w-full max-w-[820px] overflow-hidden rounded-[26px] border border-[#efe2a9] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
            >
                <div className="flex items-start justify-between gap-4 border-b border-[#edf2ef] bg-[linear-gradient(180deg,#fffdf6_0%,#f8fbfa_100%)] px-6 py-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b99117]">
                            {mode === "add" ? `Add New ${itemLabel}` : `Edit ${itemLabel}`}
                        </p>
                        <h3 className="mt-2 text-2xl font-extrabold text-[#0f4d3c]">
                            {mode === "add" ? `Create ${itemLabel}` : form.title || `${itemLabel} Details`}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {isAddOn
                                ? "Manage add-on details, pricing, inclusions, status, and client visibility."
                                : "Manage package details, pricing, inclusions, status, and client visibility."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-96px)] overflow-y-auto px-6 py-5">
                    {error ? (
                        <div className="mb-4 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <AlertTriangle size={18} />
                            <span>{error}</span>
                        </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                Type / Group
                            </label>
                            <select
                                value={form.packageGroup}
                                onChange={(e) => handleGroupChange(e.target.value)}
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                            >
                                {PACKAGE_GROUPS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                Category Label
                            </label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) => updateField("category", e.target.value)}
                                placeholder="Wedding Package"
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                {isAddOn ? "Add-on Name" : "Package Name"}
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder={isAddOn ? "Cake / Host / Photo" : "Basic Wedding Package"}
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                {isAddOn ? "Pax / Guest Count (Optional)" : "Pax / Guest Count"}
                            </label>
                            <input
                                type="text"
                                value={form.pax}
                                onChange={(e) => updateField("pax", e.target.value)}
                                placeholder="100 pax"
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                Price
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.price}
                                onChange={(e) => updateField("price", e.target.value)}
                                placeholder="58000"
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => updateField("isActive", !form.isActive)}
                                className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${form.isActive
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-50 text-slate-500"
                                    }`}
                            >
                                {form.isActive ? "Active" : "Inactive"}
                            </button>

                            <button
                                type="button"
                                onClick={() => updateField("showOnClient", !form.showOnClient)}
                                className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${form.showOnClient
                                    ? "border-[#f0e2b7] bg-[#fff8e6] text-[#9a7513]"
                                    : "border-red-100 bg-red-50 text-red-600"
                                    }`}
                            >
                                {form.showOnClient ? "Show on Client" : "Hidden"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            rows={3}
                            placeholder="Describe what this package includes or what type of event it is best for."
                            className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                        />
                    </div>

                    <div className="mt-5 rounded-3xl border border-[#e9dec2] bg-[#fffaf0] p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f4d3c]">
                                    {isAddOn ? "Add-on Details" : "Package Inclusions"}
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                    {isAddOn ? "Add details for this add-on service." : "Add each inclusion one by one."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addFeature}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#0f4d3c] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0b3f31]"
                            >
                                <Plus size={14} />
                                {isAddOn ? "Add Detail" : "Add Inclusion"}
                            </button>
                        </div>

                        <div className="grid gap-3">
                            {form.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        placeholder={isAddOn ? `Detail ${index + 1}` : `Inclusion ${index + 1}`}
                                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="rounded-2xl border border-red-100 bg-red-50 px-3 text-red-600 transition hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
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
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f4d3c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3f31] disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {mode === "add" ? `Save ${itemLabel}` : `Update ${itemLabel}`}
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
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [editingPackage, setEditingPackage] = useState(null);
    const [form, setForm] = useState(emptyForm);

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
            const list = Array.isArray(data) ? data : data?.packages || data?.data || [];
            setPackages(list);
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

    const activeCount = useMemo(
        () => packages.filter((item) => item.isActive !== false).length,
        [packages]
    );

    const visibleCount = useMemo(
        () => packages.filter((item) => item.showOnClient !== false && item.isActive !== false).length,
        [packages]
    );

    const groupedPackages = useMemo(() => {
        const order = PACKAGE_GROUPS.map((item) => item.value);
        const map = new Map();

        packages.forEach((item) => {
            const group = item.packageGroup || "Custom";

            if (!map.has(group)) {
                map.set(group, []);
            }

            map.get(group).push(item);
        });

        const orderedGroups = [];

        order.forEach((group) => {
            if (map.has(group)) {
                orderedGroups.push([group, map.get(group)]);
                map.delete(group);
            }
        });

        map.forEach((items, group) => {
            orderedGroups.push([group, items]);
        });

        return orderedGroups;
    }, [packages]);
    const openAddModal = () => {
        setModalMode("add");
        setEditingPackage(null);
        setForm(emptyForm);
        setSaveError("");
        setSuccessMessage("");
        setModalOpen(true);
    };
    const openAddOnModal = () => {
        setModalMode("add");
        setEditingPackage(null);
        setForm({
            ...emptyForm,
            title: "",
            description: "",
            category: "Add-on Service",
            packageGroup: "Add-on",
            pax: "",
            price: "",
            features: [""],
            isActive: true,
            showOnClient: true,
        });
        setSaveError("");
        setSuccessMessage("");
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode("edit");
        setEditingPackage(item);
        setForm(packageToForm(item));
        setSaveError("");
        setSuccessMessage("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingPackage(null);
        setForm(emptyForm);
        setSaveError("");
    };

    const validateForm = () => {
        const itemLabel = form.packageGroup === "Add-on" ? "Add-on" : "Package";

        if (!form.title.trim()) {
            return `${itemLabel} name is required.`;
        }

        if (!form.category.trim()) {
            return "Category is required.";
        }

        if (!form.packageGroup.trim()) {
            return `${itemLabel} group is required.`;
        }

        const numericPrice = Number(form.price);

        if (!numericPrice || numericPrice < 0) {
            return "Please enter a valid price.";
        }

        return "";
    };

    const handleSavePackage = async () => {
        const validationError = validateForm();

        if (validationError) {
            setSaveError(validationError);
            return;
        }

        setSaving(true);
        setSaveError("");
        setSuccessMessage("");

        try {
            const token = getToken();
            const isAdd = modalMode === "add";

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category.trim(),
                packageGroup: form.packageGroup.trim(),
                package_group: form.packageGroup.trim(),
                pax: form.pax.trim(),
                price: Number(form.price),
                features: cleanFeatures(form.features),
                isActive: Boolean(form.isActive),
                is_active: Boolean(form.isActive),
                showOnClient: Boolean(form.showOnClient),
                show_on_client: Boolean(form.showOnClient),
            };

            const url = isAdd
                ? `${API_BASE}/packages`
                : `${API_BASE}/packages/${editingPackage.id}`;

            const res = await fetch(url, {
                method: isAdd ? "POST" : "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    (isAdd ? "Failed to create package." : "Failed to update package.")
                );
            }

            await fetchPackages();
            closeModal();
            const itemLabel = form.packageGroup === "Add-on" ? "Add-on" : "Package";

            setSuccessMessage(
                isAdd
                    ? `${itemLabel} added successfully.`
                    : `${itemLabel} updated successfully.`
            );
        } catch (err) {
            console.error("Save package error:", err);
            setSaveError(err.message || "Failed to save package.");
        } finally {
            setSaving(false);
        }
    };

    const handleArchivePackage = async (item) => {
        const confirmed = window.confirm(
            `Archive "${item.title}"? This will hide it from the client packages page.`
        );

        if (!confirmed) return;

        setSaving(true);
        setFetchError("");
        setSuccessMessage("");

        try {
            const token = getToken();

            const res = await fetch(`${API_BASE}/packages/${item.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Failed to archive package.");
            }

            await fetchPackages();
            setSuccessMessage("Package archived successfully.");
        } catch (err) {
            console.error("Archive package error:", err);
            setFetchError(err.message || "Failed to archive package.");
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

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                                    <Sparkles size={13} />
                                    Admin Package Management
                                </div>

                                <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                                    Package Information Overview
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                    Add, edit, archive, and control client visibility for wedding,
                                    debut, birthday, corporate, add-on, and custom packages.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <motion.button
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={openAddModal}
                                    className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#f5c94a] px-5 py-3 text-sm font-extrabold text-[#0f4d3c] shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:bg-[#ffda67]"
                                >
                                    <Plus size={17} />
                                    Add Package
                                </motion.button>

                                <motion.button
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={openAddOnModal}
                                    className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:bg-white/20"
                                >
                                    <Plus size={17} />
                                    Add Add-on
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {successMessage ? (
                    <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                        {successMessage}
                    </div>
                ) : null}

                <motion.section
                    variants={fadeUp}
                    transition={{ duration: 0.46, ease: "easeOut" }}
                    className="rounded-[28px] border border-[#e9dec2] bg-[#fffaf0] p-6 shadow-sm"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        <SummaryCard label="Total Packages" value={packages.length} delay={0.04} />
                        <SummaryCard label="Active Packages" value={activeCount} delay={0.1} />
                        <SummaryCard label="Client Visible" value={visibleCount} delay={0.16} />
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
                ) : packages.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-[#dce7e2] bg-white p-10 text-center">
                        <h3 className="text-2xl font-extrabold text-[#0f4d3c]">
                            No packages found
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Click Add Package to create your first package.
                        </p>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0f4d3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b3f31]"
                        >
                            <Plus size={16} />
                            Add Package
                        </button>
                    </div>
                ) : (
                    groupedPackages.map(([group, items]) => (
                        <motion.section
                            key={group}
                            variants={fadeUp}
                            transition={{ duration: 0.46, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b99117]">
                                        {group === "Add-on" ? "Optional Services" : "Catering Packages"}
                                    </p>
                                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                                        {group === "Add-on" ? "Available Add-ons" : `${group} Packages`}
                                    </h2>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-sm font-semibold text-slate-500">
                                        {items.length} item{items.length > 1 ? "s" : ""}
                                    </p>

                                    {group === "Add-on" ? (
                                        <button
                                            type="button"
                                            onClick={openAddOnModal}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-[#0f4d3c] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3f31]"
                                        >
                                            <Plus size={15} />
                                            Add Add-on
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-2">
                                {items.map((item, index) => (
                                    <AdminPackageCard
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        onEdit={openEditModal}
                                        onArchive={handleArchivePackage}
                                    />
                                ))}
                            </div>
                        </motion.section>
                    ))
                )}
            </motion.div>

            <AnimatePresence>
                {modalOpen && (
                    <PackageModal
                        mode={modalMode}
                        form={form}
                        setForm={setForm}
                        saving={saving}
                        error={saveError}
                        onClose={closeModal}
                        onSave={handleSavePackage}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminPackages;