import { useMemo, useState } from "react";
import {
    getAdminInventory,
    saveAdminInventory,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

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
        if (status === "In Stock") return "bg-green-100 text-green-700";
        if (status === "Low Stock") return "bg-[#fff8e6] text-[#b99117]";
        return "bg-red-100 text-red-600";
    };

    return (
        <div className="space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <SummaryCard title="Total Items" value={totals.totalItems} />
                <SummaryCard title="In Stock" value={totals.inStock} />
                <SummaryCard title="Low Stock" value={totals.lowStock} />
                <SummaryCard title="Out of Stock" value={totals.outOfStock} />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">
                        Add Inventory Item
                    </h2>

                    <form onSubmit={handleAddItem} className="mt-5 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Item Name
                            </label>
                            <input
                                type="text"
                                name="itemName"
                                value={form.itemName}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="Ingredient, Utensil, Equipment, etc."
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Unit
                            </label>
                            <input
                                type="text"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                placeholder="pcs, kg, box, set, etc."
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                            >
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] hover:bg-[#c79f23] transition"
                        >
                            Add Item
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                Inventory Management
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Track equipment, utensils, ingredients, and supplies.
                            </p>
                        </div>

                        <button
                            onClick={handlePrintInventory}
                            className="rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white hover:bg-[#09382d] transition"
                        >
                            Generate PDF Report
                        </button>
                    </div>

                    {inventory.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                            No inventory records yet.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {inventory.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-[#0f4d3c]">
                                                {item.itemName}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.category} • {item.quantity} {item.unit}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>

                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function SummaryCard({ title, value }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <h2 className="text-3xl font-extrabold text-[#0f4d3c] mt-2">{value}</h2>
        </div>
    );
}

export default AdminInventory;