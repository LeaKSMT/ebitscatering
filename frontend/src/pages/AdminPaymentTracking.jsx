import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    CircleDollarSign,
    BadgeCheck,
    Clock3,
    ReceiptText,
    Search,
    Printer,
    CreditCard,
    X,
    ArrowRight,
} from "lucide-react";
import {
    getAllBookings,
    formatCurrency,
    formatDate,
    savePaymentRecord,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function normalizeNumber(value) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
}

function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase();
}

function getBookingTotalAmount(booking) {
    return normalizeNumber(
        booking?.totalAmount ||
        booking?.estimatedTotal ||
        booking?.totalPrice ||
        booking?.price ||
        booking?.amount ||
        0
    );
}

function getPossiblePaymentKeys(booking) {
    const keys = [
        "paymentRecords",
        "adminPaymentRecords",
        "clientPaymentHistory",
    ];

    if (booking?.ownerEmail) {
        keys.push(`clientPaymentHistory_${booking.ownerEmail}`);
    }

    if (booking?.email) {
        keys.push(`clientPaymentHistory_${booking.email}`);
    }

    if (booking?.clientEmail) {
        keys.push(`clientPaymentHistory_${booking.clientEmail}`);
    }

    return [...new Set(keys)];
}

function getPaymentsForBooking(booking) {
    const bookingId = String(booking?.bookingId || "").trim();

    if (!bookingId) return [];

    const keys = getPossiblePaymentKeys(booking);

    const merged = keys.flatMap((key) => {
        const value = safeParse(key, []);
        return Array.isArray(value) ? value : [];
    });

    const dedupedMap = new Map();

    merged.forEach((item, index) => {
        const uniqueKey =
            item?.id ||
            item?.paymentId ||
            item?.referenceNumber ||
            `${item?.bookingId || ""}_${item?.amount || 0}_${item?.createdAt || index}`;

        if (!dedupedMap.has(uniqueKey)) {
            dedupedMap.set(uniqueKey, item);
        }
    });

    return Array.from(dedupedMap.values()).filter((payment) => {
        return String(
            payment?.bookingId ||
            payment?.booking_id ||
            payment?.bookingCode ||
            ""
        ).trim() === bookingId;
    });
}

function getPaymentSummaryPerBooking(booking) {
    const payments = getPaymentsForBooking(booking);
    const totalAmount = getBookingTotalAmount(booking);

    const paid = payments.reduce((sum, item) => {
        return sum + normalizeNumber(item?.amount || item?.paymentAmount);
    }, 0);

    const sanitizedPaid = Math.min(paid, totalAmount);
    const balance = Math.max(totalAmount - sanitizedPaid, 0);

    let paymentStatus = "unpaid";
    if (sanitizedPaid > 0 && balance > 0) paymentStatus = "partial";
    if (totalAmount > 0 && balance === 0) paymentStatus = "paid";

    return {
        paid: sanitizedPaid,
        balance,
        paymentStatus,
        payments,
    };
}

function AdminPaymentTracking() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editTarget, setEditTarget] = useState(null);
    const [paymentInput, setPaymentInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const bookings = useMemo(() => getAllBookings(), [refreshKey]);

    const paymentRows = useMemo(() => {
        return bookings.map((booking) => {
            const summary = getPaymentSummaryPerBooking(booking);

            return {
                ...booking,
                totalAmount: getBookingTotalAmount(booking),
                paid: summary.paid,
                balance: summary.balance,
                paymentStatus: summary.paymentStatus,
                payments: summary.payments || [],
            };
        });
    }, [bookings, refreshKey]);

    const filteredRows = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return paymentRows;

        return paymentRows.filter((row) => {
            return (
                String(row.bookingId || "").toLowerCase().includes(keyword) ||
                String(row.fullName || "").toLowerCase().includes(keyword) ||
                String(row.eventType || "").toLowerCase().includes(keyword) ||
                String(row.paymentStatus || "").toLowerCase().includes(keyword)
            );
        });
    }, [paymentRows, searchTerm]);

    const totals = useMemo(() => {
        const collected = paymentRows.reduce(
            (sum, item) => sum + normalizeNumber(item.paid),
            0
        );

        const balance = paymentRows.reduce(
            (sum, item) => sum + normalizeNumber(item.balance),
            0
        );

        return { collected, balance };
    }, [paymentRows]);

    const statusCounts = useMemo(() => {
        return {
            paid: paymentRows.filter((item) => item.paymentStatus === "paid").length,
            partial: paymentRows.filter((item) => item.paymentStatus === "partial").length,
            unpaid: paymentRows.filter((item) => item.paymentStatus === "unpaid").length,
        };
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

        const amount = normalizeNumber(paymentInput);

        if (amount <= 0) {
            alert("Enter a valid payment amount.");
            return;
        }

        if (editTarget.balance <= 0) {
            alert("This booking is already fully paid.");
            return;
        }

        if (amount > editTarget.balance) {
            alert(`Payment exceeds the remaining balance of ${formatCurrency(editTarget.balance)}.`);
            return;
        }

        const paymentRecord = {
            id: `payment_${Date.now()}`,
            paymentId: `P${Date.now()}`,
            bookingId: editTarget.bookingId,
            ownerEmail: editTarget.ownerEmail || editTarget.email || editTarget.clientEmail || "",
            clientName: editTarget.fullName || "Client",
            paymentType: "Booking Payment",
            paymentMethod: "Manual Admin Entry",
            amount,
            referenceNumber: `REF-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: amount === editTarget.balance ? "Paid" : "Partial",
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
        if (status === "paid") {
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        }
        if (status === "partial") {
            return "bg-amber-50 text-amber-700 border border-amber-200";
        }
        return "bg-rose-50 text-rose-700 border border-rose-200";
    };

    return (
        <>
            <div className="space-y-6">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-[#0f4d3c] via-[#0c3f33] to-[#07241d] p-6 text-white shadow-[0_24px_80px_rgba(15,77,60,0.22)]"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_28%)]" />
                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f7e7a1] backdrop-blur">
                                <Wallet className="h-4 w-4" />
                                Admin Finance Control
                            </div>
                            <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                                Payment Tracking Dashboard
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">
                                Monitor booking payments, collected revenue, and outstanding balances
                                through a cleaner premium financial interface.
                            </p>
                        </div>

                        <button
                            onClick={handlePrintPayments}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f4d97a]/40 bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f2c24] transition hover:scale-[1.02] hover:bg-[#e0bc49]"
                        >
                            <Printer className="h-4 w-4" />
                            Generate PDF Report
                        </button>
                    </div>
                </motion.section>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Collected"
                        value={formatCurrency(totals.collected)}
                        icon={CircleDollarSign}
                        accent="emerald"
                        delay={0.05}
                    />
                    <StatCard
                        title="Outstanding Balance"
                        value={formatCurrency(totals.balance)}
                        icon={ReceiptText}
                        accent="rose"
                        delay={0.1}
                    />
                    <StatCard
                        title="Fully Paid"
                        value={statusCounts.paid}
                        icon={BadgeCheck}
                        accent="gold"
                        delay={0.15}
                    />
                    <StatCard
                        title="Partial / Unpaid"
                        value={statusCounts.partial + statusCounts.unpaid}
                        icon={Clock3}
                        accent="slate"
                        delay={0.2}
                    />
                </section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                    <div className="border-b border-gray-100 p-6">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-[#0f4d3c]">
                                    Booking Payment Records
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Review payment progress, balances, and booking status in one place.
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                                <div className="relative min-w-0 flex-1 xl:w-[320px]">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search booking, client, event, status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-2xl border border-gray-200 bg-[#f8fafc] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#d4af37] focus:bg-white"
                                    />
                                </div>

                                <div className="inline-flex items-center rounded-2xl border border-[#d4af37]/30 bg-[#fff8e6] px-4 py-3 text-sm font-semibold text-[#8d6a0e]">
                                    {filteredRows.length} record(s)
                                </div>
                            </div>
                        </div>
                    </div>

                    {filteredRows.length === 0 ? (
                        <div className="p-10">
                            <div className="rounded-[24px] border border-dashed border-[#d9e2ec] bg-[linear-gradient(135deg,#f8fafc,white)] p-10 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf5]">
                                    <Wallet className="h-8 w-8 text-[#0f766e]" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-[#0f4d3c]">
                                    No payment records found
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    There are currently no matching booking payments in the system.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1080px] text-sm">
                                <thead>
                                    <tr className="bg-[#fcfcfd] text-left text-[12px] uppercase tracking-[0.16em] text-gray-500">
                                        <th className="px-6 py-4 font-bold">Booking</th>
                                        <th className="px-6 py-4 font-bold">Client</th>
                                        <th className="px-6 py-4 font-bold">Event Date</th>
                                        <th className="px-6 py-4 font-bold">Total</th>
                                        <th className="px-6 py-4 font-bold">Paid</th>
                                        <th className="px-6 py-4 font-bold">Balance</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 text-center font-bold">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRows.map((row, index) => (
                                        <motion.tr
                                            key={row.id || row.bookingId}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.03 }}
                                            className="border-t border-gray-100 transition hover:bg-[#fcfdfd]"
                                        >
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-extrabold text-[#0f4d3c]">
                                                        {row.bookingId}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {row.eventType || "Booking record"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-semibold text-slate-700">
                                                        {row.fullName}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {row.email || row.ownerEmail || "No email"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 font-medium text-slate-600">
                                                {formatDate(row.eventDate)}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="font-bold text-[#0f4d3c]">
                                                    {formatCurrency(row.totalAmount)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="font-bold text-emerald-600">
                                                    {formatCurrency(row.paid)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`font-bold ${row.balance <= 0 ? "text-emerald-600" : "text-rose-500"
                                                        }`}
                                                >
                                                    {formatCurrency(row.balance)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
                                                        row.paymentStatus
                                                    )}`}
                                                >
                                                    {row.paymentStatus}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditClick(row)}
                                                    disabled={row.balance <= 0}
                                                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition ${row.balance <= 0
                                                            ? "cursor-not-allowed bg-emerald-600/70"
                                                            : "bg-[#0b4a3a] hover:-translate-y-0.5 hover:bg-[#09382d]"
                                                        }`}
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                    {row.balance <= 0 ? "Fully Paid" : "Add Payment"}
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.section>
            </div>

            <AnimatePresence>
                {editTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/55 px-4 backdrop-blur-[3px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 26, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.96 }}
                            transition={{ duration: 0.25 }}
                            className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(2,6,23,0.30)]"
                        >
                            <div className="bg-[linear-gradient(135deg,#0f4d3c,#09382d)] p-6 text-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                            <CreditCard className="h-7 w-7 text-[#f4d97a]" />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-black">Update Payment</h3>
                                            <p className="mt-1 text-sm text-white/75">
                                                Add a new payment record for this booking.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-5 p-6">
                                <div className="rounded-[24px] border border-[#f4ecd2] bg-[#fffaf0] p-4">
                                    <p className="text-sm font-bold text-[#0f4d3c]">
                                        {editTarget.fullName}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Booking ID: {editTarget.bookingId}
                                    </p>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <MiniInfo
                                            label="Total Amount"
                                            value={formatCurrency(editTarget.totalAmount)}
                                        />
                                        <MiniInfo
                                            label="Remaining Balance"
                                            value={formatCurrency(editTarget.balance)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-[#0f4d3c]">
                                        Amount Paid
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                            ₱
                                        </span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={editTarget.balance}
                                            placeholder="Enter payment amount"
                                            value={paymentInput}
                                            onChange={(e) => setPaymentInput(e.target.value)}
                                            className="w-full rounded-2xl border border-gray-200 bg-[#f8fafc] py-3 pl-10 pr-4 outline-none transition focus:border-[#d4af37] focus:bg-white"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Maximum allowed payment: {formatCurrency(editTarget.balance)}
                                    </p>
                                </div>

                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSavePayment}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b4a3a] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#09382d]"
                                    >
                                        Save Payment
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function StatCard({ title, value, icon: Icon, accent = "gold", delay = 0 }) {
    const accentMap = {
        emerald:
            "from-emerald-500/10 to-emerald-100/40 text-emerald-600 ring-emerald-200",
        rose: "from-rose-500/10 to-rose-100/40 text-rose-600 ring-rose-200",
        gold: "from-[#d4af37]/15 to-[#fff4cd] text-[#b99117] ring-[#ecd891]",
        slate: "from-slate-500/10 to-slate-100/40 text-slate-600 ring-slate-200",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            className="group rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-1"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0f4d3c]">
                        {value}
                    </h2>
                </div>

                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentMap[accent]} ring-1`}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </motion.div>
    );
}

function MiniInfo({ label, value }) {
    return (
        <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                {label}
            </p>
            <p className="mt-2 font-extrabold text-[#0f4d3c]">{value}</p>
        </div>
    );
}

export default AdminPaymentTracking;