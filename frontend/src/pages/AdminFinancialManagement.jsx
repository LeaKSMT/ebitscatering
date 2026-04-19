import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import {
    Wallet,
    BadgeDollarSign,
    ReceiptText,
    Landmark,
    Sparkles,
    TrendingUp,
    CircleDollarSign,
    BriefcaseBusiness,
    CalendarRange,
    BarChart3,
    FileSpreadsheet,
    PlusCircle,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0 },
};

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

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={13} />
                                Executive View
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                                Financial Management
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                Track revenue, collections, expenses, profitability, and
                                financial performance in one premium management workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px]">
                            <HeaderMiniCard
                                icon={TrendingUp}
                                label="Financial Health"
                                value={
                                    summary.netProfit >= 0 ? "Stable" : "Needs Attention"
                                }
                            />
                            <HeaderMiniCard
                                icon={FileSpreadsheet}
                                label="Records"
                                value={`${financialRows.length} Event${financialRows.length === 1 ? "" : "s"
                                    }`}
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
                <SummaryCard
                    icon={Wallet}
                    title="Total Revenue"
                    value={formatCurrency(summary.totalRevenue)}
                    subtitle="Based on booking totals"
                />
                <SummaryCard
                    icon={BadgeDollarSign}
                    title="Total Collected"
                    value={formatCurrency(summary.totalCollected)}
                    subtitle="Based on recorded payments"
                />
                <SummaryCard
                    icon={ReceiptText}
                    title="Total Expenses"
                    value={formatCurrency(summary.totalExpenses)}
                    subtitle="Admin-recorded expenses"
                />
                <SummaryCard
                    icon={Landmark}
                    title="Net Profit"
                    value={formatCurrency(summary.netProfit)}
                    subtitle="Revenue minus expenses"
                />
            </motion.section>

            <motion.section
                variants={fadeUp}
                className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b99117]">
                            Financial Overview
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold text-[#0f4d3c]">
                            Revenue and Profit Snapshot
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Real-time financial summary based on your current booking,
                            payment, and expense records.
                        </p>
                    </div>

                    <button
                        onClick={handlePrintFinancialSummary}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#09382d]"
                    >
                        <FileSpreadsheet size={18} />
                        Generate PDF Report
                    </button>
                </div>
            </motion.section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <motion.div
                    variants={fadeUp}
                    className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                >
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                                Profit Analysis Per Event
                            </h2>
                            <p className="text-sm text-slate-500">
                                Revenue, expenses, collections, and computed margin per booking
                            </p>
                        </div>
                    </div>

                    {financialRows.length === 0 ? (
                        <EmptyState
                            title="No financial records yet"
                            description="Approved bookings and recorded expenses will appear here once your financial data becomes available."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#e8efeb] text-left text-slate-500">
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
                                        <tr
                                            key={row.id}
                                            className="border-b border-[#f1f5f3] transition hover:bg-[#fbfdfc]"
                                        >
                                            <td className="py-4 font-bold text-[#0f4d3c]">
                                                {row.bookingId}
                                            </td>
                                            <td className="py-4 text-slate-700">{row.fullName}</td>
                                            <td className="py-4 text-slate-700">{row.eventType}</td>
                                            <td className="py-4 font-bold text-[#0f4d3c]">
                                                {formatCurrency(row.totalAmount)}
                                            </td>
                                            <td className="py-4 font-bold text-emerald-600">
                                                {formatCurrency(row.paid)}
                                            </td>
                                            <td className="py-4 font-bold text-[#c79f23]">
                                                {formatCurrency(row.totalExpenses)}
                                            </td>
                                            <td className="py-4 font-bold text-[#0f7a51]">
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
                </motion.div>

                <div className="space-y-6">
                    <motion.div
                        variants={fadeUp}
                        className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e3] text-[#b99117]">
                                <PlusCircle size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                                    Add Expense
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Record operational or event-based expenses
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                    Booking ID
                                </label>
                                <select
                                    value={expenseForm.bookingId}
                                    onChange={handleBookingSelect}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
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
                                <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={expenseForm.clientName}
                                    onChange={handleExpenseChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                    Event Type
                                </label>
                                <input
                                    type="text"
                                    name="eventType"
                                    value={expenseForm.eventType}
                                    onChange={handleExpenseChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                    Expense Category
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={expenseForm.category}
                                    onChange={handleExpenseChange}
                                    placeholder="Food, transportation, decoration, etc."
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="amount"
                                    value={expenseForm.amount}
                                    onChange={handleExpenseChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                            >
                                Save Expense
                            </button>
                        </form>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                                    Demand Forecast
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Event demand based on current booking distribution
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {demandForecast.map((item) => (
                                <div key={item.type}>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-[#0f4d3c]">
                                            {item.type}
                                        </span>
                                        <span className="text-slate-500">
                                            {item.count} booking(s) • {item.percent}%
                                        </span>
                                    </div>

                                    <div className="h-3 overflow-hidden rounded-full bg-[#edf2ef]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percent}%` }}
                                            transition={{ duration: 0.7, ease: "easeOut" }}
                                            className="h-full rounded-full bg-[linear-gradient(90deg,#0f4d3c_0%,#22b67f_100%)]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <motion.section
                variants={fadeUp}
                className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
            >
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                        <CalendarRange size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                            Monthly Financial Summary
                        </h2>
                        <p className="text-sm text-slate-500">
                            Revenue, expenses, profit, and monthly margin overview
                        </p>
                    </div>
                </div>

                {monthlyRows.length === 0 ? (
                    <EmptyState
                        title="No monthly data yet"
                        description="Monthly financial summaries will appear here as soon as the system has enough revenue and expense records."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b border-[#e8efeb] text-left text-slate-500">
                                    <th className="py-3 font-semibold">Month</th>
                                    <th className="py-3 font-semibold">Revenue</th>
                                    <th className="py-3 font-semibold">Expenses</th>
                                    <th className="py-3 font-semibold">Profit</th>
                                    <th className="py-3 font-semibold">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyRows.map((row) => (
                                    <tr
                                        key={row.label}
                                        className="border-b border-[#f1f5f3] transition hover:bg-[#fbfdfc]"
                                    >
                                        <td className="py-4 font-bold text-[#0f4d3c]">
                                            {row.label}
                                        </td>
                                        <td className="py-4 text-slate-700">
                                            {formatCurrency(row.revenue)}
                                        </td>
                                        <td className="py-4 text-slate-700">
                                            {formatCurrency(row.expenses)}
                                        </td>
                                        <td className="py-4 font-semibold text-[#0f7a51]">
                                            {formatCurrency(row.profit)}
                                        </td>
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
            </motion.section>

            <motion.section
                variants={fadeUp}
                className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
            >
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e3] text-[#b99117]">
                        <BriefcaseBusiness size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                            Recent Expenses
                        </h2>
                        <p className="text-sm text-slate-500">
                            Latest admin-recorded operating and event expenses
                        </p>
                    </div>
                </div>

                {expenses.length === 0 ? (
                    <EmptyState
                        title="No expense records yet"
                        description="Recorded expenses will appear here once you start adding expense entries from the form."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-sm">
                            <thead>
                                <tr className="border-b border-[#e8efeb] text-left text-slate-500">
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
                                    <tr
                                        key={expense.id}
                                        className="border-b border-[#f1f5f3] transition hover:bg-[#fbfdfc]"
                                    >
                                        <td className="py-4 font-bold text-[#0f4d3c]">
                                            {expense.bookingId || "—"}
                                        </td>
                                        <td className="py-4 text-slate-700">
                                            {expense.clientName || "—"}
                                        </td>
                                        <td className="py-4 text-slate-700">
                                            {expense.eventType || "—"}
                                        </td>
                                        <td className="py-4 text-slate-700">
                                            {expense.category || "—"}
                                        </td>
                                        <td className="py-4 font-bold text-[#b99117]">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td className="py-4 text-slate-700">
                                            {formatDate(expense.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
}

function HeaderMiniCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        {label}
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ icon: Icon, title, value, subtitle }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h2>
                    <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf8f3_0%,#dff1e8_100%)] text-[#0f4d3c]">
                    <Icon size={22} />
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ title, description }) {
    return (
        <div className="rounded-[24px] border border-dashed border-[#d9e5e0] bg-[#fbfdfc] px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf8f3] text-[#0f4d3c]">
                <CircleDollarSign className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-2xl font-extrabold text-[#0f4d3c]">{title}</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                {description}
            </p>
        </div>
    );
}

export default AdminFinancialManagement;