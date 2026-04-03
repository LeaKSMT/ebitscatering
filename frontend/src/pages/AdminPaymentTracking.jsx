import { useMemo, useState } from "react";
import {
    getAllBookings,
    getBookingPaymentSummary,
    formatCurrency,
    formatDate,
    savePaymentRecord,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function AdminPaymentTracking() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editTarget, setEditTarget] = useState(null);
    const [paymentInput, setPaymentInput] = useState("");

    const bookings = useMemo(() => getAllBookings(), [refreshKey]);

    const paymentRows = useMemo(() => {
        return bookings.map((booking) => {
            const summary = getBookingPaymentSummary(booking);

            return {
                ...booking,
                paid: summary.paid,
                balance: summary.balance,
                paymentStatus: summary.paymentStatus,
                payments: summary.payments || [],
            };
        });
    }, [bookings]);

    const totals = useMemo(() => {
        const collected = paymentRows.reduce(
            (sum, item) => sum + Number(item.paid || 0),
            0
        );

        const balance = paymentRows.reduce(
            (sum, item) => sum + Number(item.balance || 0),
            0
        );

        return { collected, balance };
    }, [paymentRows]);

    const handleEditClick = (row) => {
        setEditTarget(row);
        setPaymentInput("");
    };

    const closeEditModal = () => {
        setEditTarget(null);
        setPaymentInput("");
    };

    const handleSavePayment = () => {
        if (!editTarget) return;

        const amount = Number(paymentInput || 0);

        if (amount <= 0) {
            alert("Enter a valid payment amount.");
            return;
        }

        const paymentRecord = {
            id: `payment_${Date.now()}`,
            paymentId: `P${Date.now()}`,
            bookingId: editTarget.bookingId,
            ownerEmail: editTarget.ownerEmail || editTarget.email || "",
            clientName: editTarget.fullName || "Client",
            paymentType: "Booking Payment",
            paymentMethod: "Manual Admin Entry",
            amount,
            referenceNumber: `REF-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        savePaymentRecord(paymentRecord);

        closeEditModal();
        setRefreshKey((prev) => prev + 1);
    };

    const handlePrintPayments = () => {
        openPrintWindow({
            title: "Payment Tracking Report",
            subtitle: "Booking payment status summary",
            summaryCards: [
                { label: "Bookings", value: paymentRows.length },
                { label: "Collected", value: formatCurrency(totals.collected) },
                { label: "Outstanding", value: formatCurrency(totals.balance) },
                {
                    label: "Paid Bookings",
                    value: paymentRows.filter((item) => item.paymentStatus === "paid").length,
                },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Booking Payment Status</h2>
                    ${buildPrintableTable(
                [
                    "Booking ID",
                    "Client",
                    "Event Date",
                    "Total Amount",
                    "Paid",
                    "Balance",
                    "Status",
                ],
                paymentRows.map((row) => [
                    row.bookingId,
                    row.fullName,
                    formatDate(row.eventDate),
                    formatCurrency(row.totalAmount),
                    formatCurrency(row.paid),
                    formatCurrency(row.balance),
                    row.paymentStatus,
                ])
            )}
                </div>
            `,
        });
    };

    const getStatusStyle = (status) => {
        if (status === "paid") return "bg-green-100 text-green-700";
        if (status === "partial") return "bg-[#fff8e6] text-[#b99117]";
        return "bg-red-100 text-red-600";
    };

    return (
        <>
            <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SummaryCard
                        title="Total Collected"
                        value={formatCurrency(totals.collected)}
                    />
                    <SummaryCard
                        title="Outstanding Balance"
                        value={formatCurrency(totals.balance)}
                    />
                </section>

                <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                Payment Tracking
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Monitor all bookings and payment status.
                            </p>
                        </div>

                        <button
                            onClick={handlePrintPayments}
                            className="rounded-2xl bg-[#0b4a3a] px-5 py-3 text-white font-bold hover:bg-[#09382d] transition"
                        >
                            Generate PDF Report
                        </button>
                    </div>

                    {paymentRows.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                            No payment records yet.
                        </div>
                    ) : (
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-gray-500">
                                        <th className="py-3 font-semibold">Booking ID</th>
                                        <th className="py-3 font-semibold">Client</th>
                                        <th className="py-3 font-semibold">Date</th>
                                        <th className="py-3 font-semibold">Total</th>
                                        <th className="py-3 font-semibold">Paid</th>
                                        <th className="py-3 font-semibold">Balance</th>
                                        <th className="py-3 font-semibold">Status</th>
                                        <th className="py-3 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paymentRows.map((row) => (
                                        <tr key={row.id} className="border-b border-gray-50">
                                            <td className="py-4 font-semibold text-[#0f4d3c]">
                                                {row.bookingId}
                                            </td>
                                            <td className="py-4">{row.fullName}</td>
                                            <td className="py-4">{formatDate(row.eventDate)}</td>
                                            <td className="py-4 font-semibold text-[#0f4d3c]">
                                                {formatCurrency(row.totalAmount)}
                                            </td>
                                            <td className="py-4 font-semibold text-[#10b981]">
                                                {formatCurrency(row.paid)}
                                            </td>
                                            <td className="py-4 font-semibold text-red-500">
                                                {formatCurrency(row.balance)}
                                            </td>
                                            <td className="py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                                                        row.paymentStatus
                                                    )}`}
                                                >
                                                    {row.paymentStatus}
                                                </span>
                                            </td>

                                            <td className="py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditClick(row)}
                                                    className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-bold text-white hover:bg-[#c79f23] transition"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
                    <div className="w-full max-w-md rounded-[28px] bg-white shadow-2xl border border-gray-100 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff8e6]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-[#b99117]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8c-2.21 0-4 1.79-4 4m8 0a4 4 0 10-8 0m8 0c0 2.21-1.79 4-4 4m4-4H8"
                                    />
                                </svg>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#0f4d3c]">
                                    Update Payment
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Add payment for <span className="font-semibold text-[#0f4d3c]">{editTarget.fullName}</span>.
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Booking ID: {editTarget.bookingId} • Balance: {formatCurrency(editTarget.balance)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Amount Paid
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Enter payment amount"
                                value={paymentInput}
                                onChange={(e) => setPaymentInput(e.target.value)}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePayment}
                                className="rounded-2xl bg-[#0b4a3a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#09382d] transition"
                            >
                                Save Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function SummaryCard({ title, value }) {
    return (
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className="text-3xl font-extrabold text-[#0f4d3c] mt-2">{value}</h2>
        </div>
    );
}

export default AdminPaymentTracking;