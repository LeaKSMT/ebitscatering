import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    getAdminInventory,
    saveAdminInventory,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";
import {
    Sparkles,
    Boxes,
    PackageCheck,
    TriangleAlert,
    PackageX,
    Trash2,
    FileSpreadsheet,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

function AdminInventory() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [form, setForm] = useState({
        itemName: "",
        category: "",
        quantity: "",
        unit: "",
        status: "In Stock",
    });

    const inventory = useMemo(() => getAdminInventory(), [refreshKey]);

    const totals = useMemo(() => {
        return {
            totalItems: inventory.length,
            inStock: inventory.filter((item) => item.status === "In Stock").length,
            lowStock: inventory.filter((item) => item.status === "Low Stock").length,
            outOfStock: inventory.filter((item) => item.status === "Out of Stock").length,
        };
    }, [inventory]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddItem = (e) => {
        e.preventDefault();

        const newItem = {
            id: `inventory_${Date.now()}`,
            itemName: form.itemName,
            category: form.category,
            quantity: Number(form.quantity || 0),
            unit: form.unit,
            status: form.status,
            createdAt: new Date().toISOString(),
        };

        saveAdminInventory([newItem, ...inventory]);
        setForm({
            itemName: "",
            category: "",
            quantity: "",
            unit: "",
            status: "In Stock",
        });
        setRefreshKey((prev) => prev + 1);
    };

    const handleDeleteItem = (id) => {
        const confirmed = window.confirm("Delete this inventory item?");
        if (!confirmed) return;

        const updated = inventory.filter((item) => item.id !== id);
        saveAdminInventory(updated);
        setRefreshKey((prev) => prev + 1);
    };

    const handlePrintInventory = () => {
        openPrintWindow({
            title: "Inventory Report",
            subtitle: "Current inventory stock records",
            summaryCards: [
                { label: "Total Items", value: totals.totalItems },
                { label: "In Stock", value: totals.inStock },
                { label: "Low Stock", value: totals.lowStock },
                { label: "Out of Stock", value: totals.outOfStock },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Inventory Records</h2>
                    ${buildPrintableTable(
                ["Item Name", "Category", "Quantity", "Unit", "Status"],
                inventory.map((item) => [
                    item.itemName,
                    item.category || "—",
                    item.quantity,
                    item.unit || "—",
                    item.status || "—",
                ])
            )}
                </div>
            `,
        });
    };

    const getStatusStyle = (status) => {
        if (status === "In Stock") {
            return "border border-emerald-300/60 bg-emerald-500/20 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
        }
        if (status === "Low Stock") {
            return "border border-amber-300/60 bg-amber-400/20 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
        }
        return "border border-rose-300/60 bg-rose-500/20 text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
    };

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
                className="overflow-hidden rounded-[30px] border border-[#1d5a48] bg-[rgba(6,27,22,0.92)] shadow-[0_18px_50px_rgba(14,61,47,0.18)]"
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
                            Inventory Management
                        </div>

                        <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                            Inventory & Stock Monitoring
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                            Monitor ingredients, utensils, supplies, and equipment in a
                            clean premium inventory workspace.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
                <SummaryCard icon={Boxes} title="Total Items" value={totals.totalItems} delay={0.04} />
                <SummaryCard icon={PackageCheck} title="In Stock" value={totals.inStock} delay={0.1} />
                <SummaryCard icon={TriangleAlert} title="Low Stock" value={totals.lowStock} delay={0.16} />
                <SummaryCard icon={PackageX} title="Out of Stock" value={totals.outOfStock} delay={0.22} />
            </motion.section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.46, ease: "easeOut" }}
                    className="rounded-[28px] border border-[#1d5a48] bg-[rgba(6,27,22,0.9)] p-6 shadow-[0_14px_36px_rgba(14,61,47,0.12)] backdrop-blur-sm"
                >
                    <h2 className="text-2xl font-extrabold text-white">
                        Add Inventory Item
                    </h2>

                    <form onSubmit={handleAddItem} className="mt-5 space-y-4">
                        <Field
                            label="Item Name"
                            name="itemName"
                            value={form.itemName}
                            onChange={handleChange}
                            required
                        />
                        <Field
                            label="Category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="Ingredient, Utensil, Equipment, etc."
                            required
                        />
                        <Field
                            label="Quantity"
                            name="quantity"
                            type="number"
                            min="0"
                            value={form.quantity}
                            onChange={handleChange}
                            required
                        />
                        <Field
                            label="Unit"
                            name="unit"
                            value={form.unit}
                            onChange={handleChange}
                            placeholder="pcs, kg, box, set, etc."
                            required
                        />

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-white">
                                Status
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-[#2a6a56] bg-[rgba(7,37,29,0.88)] px-4 py-3 text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                            >
                                <option value="In Stock" className="bg-[#0b2c23] text-white">
                                    In Stock
                                </option>
                                <option value="Low Stock" className="bg-[#0b2c23] text-white">
                                    Low Stock
                                </option>
                                <option value="Out of Stock" className="bg-[#0b2c23] text-white">
                                    Out of Stock
                                </option>
                            </select>
                        </div>

                        <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                        >
                            Add Item
                        </motion.button>
                    </form>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.46, ease: "easeOut" }}
                    className="rounded-[28px] border border-[#1d5a48] bg-[rgba(6,27,22,0.9)] p-6 shadow-[0_14px_36px_rgba(14,61,47,0.12)] backdrop-blur-sm"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-white">
                                Inventory Management
                            </h2>
                            <p className="mt-1 text-sm text-white/65">
                                Track equipment, utensils, ingredients, and supplies.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePrintInventory}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#0b8f68] px-5 py-3 font-bold text-white transition hover:bg-[#087c59]"
                        >
                            <FileSpreadsheet size={18} />
                            Generate PDF Report
                        </motion.button>
                    </div>

                    {inventory.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-[#2a6a56] bg-[rgba(255,255,255,0.03)] p-8 text-center text-white/60">
                            No inventory records yet.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {inventory.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.38, delay: index * 0.04, ease: "easeOut" }}
                                    whileHover={{ y: -3 }}
                                    className="rounded-2xl border border-[#1d5a48] bg-[linear-gradient(135deg,rgba(8,36,29,0.96)_0%,rgba(8,46,36,0.96)_100%)] p-4 transition-shadow hover:shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <h4 className="font-bold text-white">
                                                {item.itemName}
                                            </h4>
                                            <p className="mt-1 text-sm text-white/65">
                                                {item.category} • {item.quantity} {item.unit}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span
                                                className={`inline-flex min-w-[110px] justify-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>

                                            <motion.button
                                                whileHover={{ y: -2, scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </section>
        </motion.div>
    );
}

function SummaryCard({ icon: Icon, title, value, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[24px] border border-[#1d5a48] bg-[rgba(6,27,22,0.9)] p-5 shadow-[0_14px_36px_rgba(14,61,47,0.12)] backdrop-blur-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-sm text-white/60">{title}</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-white">
                        {value}
                    </h2>
                </div>
            </div>
        </motion.div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    type = "text",
    min,
    required = false,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-white">
                {label}
            </label>
            <input
                type={type}
                min={min}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-2xl border border-[#2a6a56] bg-[rgba(7,37,29,0.88)] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            />
        </div>
    );
}

export default AdminInventory;