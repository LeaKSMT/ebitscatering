import { useMemo, useState } from "react";
import {
    getAllBookings,
    getAllPayments,
    getAllExpenses,
    getBookingPaymentSummary,
    getMonthlyFinancialRows,
    getDemandForecast,
    formatCurrency,
    formatDate,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function AdminFinancialManagement() {
    const [expenseForm, setExpenseForm] = useState({
        bookingId: "",
        clientName: "",
        eventType: "",
        category: "",
        amount: "",
    });

    const bookings = useMemo(() => getAllBookings(), []);
    const payments = useMemo(() => getAllPayments(), []);
    const expenses = useMemo(() => getAllExpenses(), []);

    const financialRows = useMemo(() => {
        return bookings.map((booking) => {
            const paymentSummary = getBookingPaymentSummary(booking);
            const bookingExpenses = expenses.filter(
                (expense) => expense.bookingId === booking.bookingId
            );
            const totalExpenses = bookingExpenses.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );
            const revenue = Number(booking.totalAmount || 0);
            const profit = revenue - totalExpenses;
            const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0.0";

            return {
                ...booking,
                paid: paymentSummary.paid,
                balance: paymentSummary.balance,
                paymentStatus: paymentSummary.paymentStatus,
                totalExpenses,
                profit,
                margin,
            };
        });
    }, [bookings, expenses]);

    const summary = useMemo(() => {
        const totalRevenue = financialRows.reduce(
            (sum, item) => sum + Number(item.totalAmount || 0),
            0
        );

        const totalCollected = payments.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        const totalExpenses = expenses.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        const netProfit = totalRevenue - totalExpenses;

        return {
            totalRevenue,
            totalCollected,
            totalExpenses,
            netProfit,
        };
    }, [financialRows, payments, expenses]);

    const monthlyRows = useMemo(() => getMonthlyFinancialRows(), [expenses, bookings]);
    const demandForecast = useMemo(() => getDemandForecast(), [bookings]);

    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        setExpenseForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBookingSelect = (e) => {
        const selectedId = e.target.value;
        const booking = bookings.find((item) => item.bookingId === selectedId);

        if (!booking) {
            setExpenseForm((prev) => ({
                ...prev,
                bookingId: selectedId,
                clientName: "",
                eventType: "",
            }));
            return;
        }

        setExpenseForm((prev) => ({
            ...prev,
            bookingId: selectedId,
            clientName: booking.fullName || "",
            eventType: booking.eventType || "",
        }));
    };

    const handleAddExpense = (e) => {
        e.preventDefault();

        const existing = JSON.parse(localStorage.getItem("adminExpenses") || "[]");
        const newExpense = {
            id: `expense_${Date.now()}`,
            bookingId: expenseForm.bookingId,
            clientName: expenseForm.clientName,
            eventType: expenseForm.eventType,
            category: expenseForm.category,
            amount: Number(expenseForm.amount || 0),
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
            "adminExpenses",
            JSON.stringify([newExpense, ...existing])
        );

        setExpenseForm({
            bookingId: "",
            clientName: "",
            eventType: "",
            category: "",
            amount: "",
        });

        window.location.reload();
    };

    const handlePrintFinancialSummary = () => {
        const table = buildPrintableTable(
            [
                "Booking ID",
                "Client",
                "Event Type",
                "Revenue",
                "Collected",
                "Expenses",
                "Profit",
                "Margin",
            ],
            financialRows.map((row) => [
                row.bookingId,
                row.fullName,
                row.eventType,
                formatCurrency(row.totalAmount),
                formatCurrency(row.paid),
                formatCurrency(row.totalExpenses),
                formatCurrency(row.profit),
                `${row.margin}%`,
            ])
        );

        openPrintWindow({
            title: "Financial Management Report",
            subtitle: "Revenue, expenses, and profitability overview",
            summaryCards: [
                { label: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
                { label: "Collected", value: formatCurrency(summary.totalCollected) },
                { label: "Expenses", value: formatCurrency(summary.totalExpenses) },
                { label: "Net Profit", value: formatCurrency(summary.netProfit) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Profit Analysis Per Event</h2>
                    ${table}
                </div>
            `,
        });
    };

    return (
        <div className="space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <SummaryCard
                    title="Total Revenue"
                    value={formatCurrency(summary.totalRevenue)}
                    subtitle="Based on booking totals"
                />
                <SummaryCard
                    title="Total Collected"
                    value={formatCurrency(summary.totalCollected)}
                    subtitle="Based on recorded payments"
                />
                <SummaryCard
                    title="Total Expenses"
                    value={formatCurrency(summary.totalExpenses)}
                    subtitle="Admin-recorded expenses"
                />
                <SummaryCard
                    title="Net Profit"
                    value={formatCurrency(summary.netProfit)}
                    subtitle="Revenue minus expenses"
                />
            </section>

            <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                            Financial Overview
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Real-time financial summary based on current system records.
                        </p>
                    </div>

                    <button
                        onClick={handlePrintFinancialSummary}
                        className="rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white hover:bg-[#09382d] transition"
                    >
                        Generate PDF Report
                    </button>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c] mb-4">
                        Profit Analysis Per Event
                    </h2>

                    {financialRows.length === 0 ? (
                        <p className="text-gray-500">No financial records yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-gray-500">
                                        <th className="py-3 font-semibold">Booking ID</th>
                                        <th className="py-3 font-semibold">Client</th>
                                        <th className="py-3 font-semibold">Event</th>
                                        <th className="py-3 font-semibold">Revenue</th>
                                        <th className="py-3 font-semibold">Collected</th>
                                        <th className="py-3 font-semibold">Expenses</th>
                                        <th className="py-3 font-semibold">Profit</th>
                                        <th className="py-3 font-semibold">Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financialRows.map((row) => (
                                        <tr key={row.id} className="border-b border-gray-50">
                                            <td className="py-4 font-semibold text-[#0f4d3c]">
                                                {row.bookingId}
                                            </td>
                                            <td className="py-4">{row.fullName}</td>
                                            <td className="py-4">{row.eventType}</td>
                                            <td className="py-4 font-semibold text-[#0f4d3c]">
                                                {formatCurrency(row.totalAmount)}
                                            </td>
                                            <td className="py-4 font-semibold text-[#10b981]">
                                                {formatCurrency(row.paid)}
                                            </td>
                                            <td className="py-4 font-semibold text-[#d4af37]">
                                                {formatCurrency(row.totalExpenses)}
                                            </td>
                                            <td className="py-4 font-semibold text-[#10b981]">
                                                {formatCurrency(row.profit)}
                                            </td>
                                            <td className="py-4">
                                                <span className="inline-flex rounded-full bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#b99117]">
                                                    {row.margin}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                            Add Expense
                        </h2>

                        <form onSubmit={handleAddExpense} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Booking ID
                                </label>
                                <select
                                    value={expenseForm.bookingId}
                                    onChange={handleBookingSelect}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                >
                                    <option value="">Select booking</option>
                                    {bookings.map((booking) => (
                                        <option key={booking.id} value={booking.bookingId}>
                                            {booking.bookingId} — {booking.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={expenseForm.clientName}
                                    onChange={handleExpenseChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Event Type
                                </label>
                                <input
                                    type="text"
                                    name="eventType"
                                    value={expenseForm.eventType}
                                    onChange={handleExpenseChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Expense Category
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={expenseForm.category}
                                    onChange={handleExpenseChange}
                                    placeholder="Food, Transportation, Decoration, etc."
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="amount"
                                    value={expenseForm.amount}
                                    onChange={handleExpenseChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] hover:bg-[#c79f23] transition"
                            >
                                Save Expense
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                            Demand Forecast
                        </h2>

                        <div className="mt-5 space-y-4">
                            {demandForecast.map((item) => (
                                <div key={item.type}>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-medium text-[#0f4d3c]">
                                            {item.type}
                                        </span>
                                        <span className="text-gray-500">
                                            {item.count} booking(s) • {item.percent}%
                                        </span>
                                    </div>

                                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[#0b4a3a]"
                                            style={{ width: `${item.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <h2 className="text-2xl font-bold text-[#0f4d3c] mb-4">
                    Monthly Financial Summary
                </h2>

                {monthlyRows.length === 0 ? (
                    <p className="text-gray-500">No monthly data yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-gray-500">
                                    <th className="py-3 font-semibold">Month</th>
                                    <th className="py-3 font-semibold">Revenue</th>
                                    <th className="py-3 font-semibold">Expenses</th>
                                    <th className="py-3 font-semibold">Profit</th>
                                    <th className="py-3 font-semibold">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyRows.map((row) => (
                                    <tr key={row.label} className="border-b border-gray-50">
                                        <td className="py-4 font-semibold text-[#0f4d3c]">
                                            {row.label}
                                        </td>
                                        <td className="py-4">{formatCurrency(row.revenue)}</td>
                                        <td className="py-4">{formatCurrency(row.expenses)}</td>
                                        <td className="py-4">{formatCurrency(row.profit)}</td>
                                        <td className="py-4">
                                            <span className="inline-flex rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#0f766e]">
                                                {row.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <h2 className="text-2xl font-bold text-[#0f4d3c] mb-4">
                    Recent Expenses
                </h2>

                {expenses.length === 0 ? (
                    <p className="text-gray-500">No expense records yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-gray-500">
                                    <th className="py-3 font-semibold">Booking ID</th>
                                    <th className="py-3 font-semibold">Client</th>
                                    <th className="py-3 font-semibold">Event Type</th>
                                    <th className="py-3 font-semibold">Category</th>
                                    <th className="py-3 font-semibold">Amount</th>
                                    <th className="py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-gray-50">
                                        <td className="py-4 font-semibold text-[#0f4d3c]">
                                            {expense.bookingId || "—"}
                                        </td>
                                        <td className="py-4">{expense.clientName || "—"}</td>
                                        <td className="py-4">{expense.eventType || "—"}</td>
                                        <td className="py-4">{expense.category || "—"}</td>
                                        <td className="py-4 font-semibold text-[#d4af37]">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td className="py-4">{formatDate(expense.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function SummaryCard({ title, value, subtitle }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <h2 className="text-3xl font-extrabold text-[#0f4d3c] mt-2">{value}</h2>
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
        </div>
    );
}

export default AdminFinancialManagement;