import { useCallback, useEffect, useMemo, useState } from "react";
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
    Pencil,
    Trash2,
    History,
    LoaderCircle,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import { quotationService } from "../services/quotationService.js";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function normalizeNumber(value) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
}

function normalizeStatus(status = "") {
    return String(status || "").trim().toLowerCase();
}

function formatCurrency(value) {
    const amount = normalizeNumber(value);
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function parseArrayField(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function getSafeTime(value) {
    const time = new Date(value || 0).getTime();
    return Number.isFinite(time) ? time : 0;
}

function mapQuotationToPaymentRow(item) {
    const payments = parseArrayField(item.payments || item.payment_records);

    const totalAmount = normalizeNumber(
        item.estimated_total ||
        item.total_price ||
        item.totalAmount ||
        item.estimatedTotal ||
        0
    );

    const paidRaw = payments.reduce((sum, payment) => {
        return (
            sum +
            normalizeNumber(
                payment?.amount ||
                payment?.paymentAmount ||
                payment?.payment_amount
            )
        );
    }, 0);

    const paid = Math.min(paidRaw, totalAmount);
    const balance = Math.max(totalAmount - paid, 0);

    let paymentStatus = "unpaid";
    if (paid > 0 && balance > 0) paymentStatus = "partial";
    if (totalAmount > 0 && balance <= 0) paymentStatus = "paid";

    return {
        ...item,
        bookingId:
            item.booking_id ||
            item.bookingId ||
            item.quotation_id ||
            `Q${item.id}`,
        fullName:
            item.full_name ||
            item.owner_name ||
            item.fullName ||
            item.client_name ||
            item.clientName ||
            "Client",
        email: item.email || item.owner_email || item.client_email || "",
        ownerEmail:
            item.owner_email || item.email || item.client_email || "",
        eventType: item.event_type || item.eventType || "Booking",
        eventDate:
            item.preferred_date ||
            item.event_date ||
            item.eventDate ||
            item.preferredDate ||
            "",
        totalAmount,
        paid,
        balance,
        paymentStatus,
        payments: [...payments].sort((a, b) => {
            const bTime = getSafeTime(
                b?.createdAt || b?.created_at || b?.updatedAt || b?.updated_at
            );
            const aTime = getSafeTime(
                a?.createdAt || a?.created_at || a?.updatedAt || a?.updated_at
            );
            return bTime - aTime;
        }),
        status: normalizeStatus(item.status || "pending"),
    };
}

async function updateQuotationRecord(id, payload) {
    if (typeof quotationService?.updateQuotation === "function") {
        return quotationService.updateQuotation(id, payload);
    }

    throw new Error(
        "quotationService.updateQuotation is not available. Add updateQuotation in quotationService.js."
    );
}

function getPaymentIdentity(payment, index = 0) {
    return (
        payment?.id ||
        payment?.paymentId ||
        payment?.referenceNumber ||
        `${payment?.bookingId || ""}_${payment?.amount || 0}_${payment?.createdAt || payment?.created_at || index}`
    );
}

function isSamePaymentRecord(source, target, sourceIndex = 0) {
    return getPaymentIdentity(source, sourceIndex) === getPaymentIdentity(target);
}

function AdminPaymentTracking() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalTarget, setModalTarget] = useState(null);
    const [paymentInput, setPaymentInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingPayment, setEditingPayment] = useState(null);
    const [editingAmount, setEditingAmount] = useState("");

    const [feedback, setFeedback] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const showFeedback = useCallback((type, title, message) => {
        setFeedback({
            open: true,
            type,
            title,
            message,
        });

        if (type === "success") {
            setTimeout(() => {
                setFeedback((prev) => ({ ...prev, open: false }));
            }, 2200);
        }
    }, []);

    const closeFeedback = () => {
        setFeedback((prev) => ({ ...prev, open: false }));
    };

    const loadRows = useCallback(async () => {
        setLoading(true);
        try {
            const data = await quotationService.getQuotations();
            const mapped = Array.isArray(data)
                ? data
                    .map(mapQuotationToPaymentRow)
                    .filter(
                        (item) =>
                            !["cancelled", "rejected"].includes(
                                normalizeStatus(item.status)
                            )
                    )
                : [];

            setRows(mapped);
        } catch (error) {
            console.error("Failed to load payment tracking rows:", error);
            showFeedback(
                "error",
                "Failed to Load Payments",
                error.message || "Failed to load payment tracking data."
            );
        } finally {
            setLoading(false);
        }
    }, [showFeedback]);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const filteredRows = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return rows;

        return rows.filter((row) => {
            return (
                String(row.bookingId || "").toLowerCase().includes(keyword) ||
                String(row.fullName || "").toLowerCase().includes(keyword) ||
                String(row.eventType || "").toLowerCase().includes(keyword) ||
                String(row.paymentStatus || "").toLowerCase().includes(keyword)
            );
        });
    }, [rows, searchTerm]);

    const totals = useMemo(() => {
        const collected = rows.reduce(
            (sum, item) => sum + normalizeNumber(item.paid),
            0
        );

        const balance = rows.reduce(
            (sum, item) => sum + normalizeNumber(item.balance),
            0
        );

        return { collected, balance };
    }, [rows]);

    const statusCounts = useMemo(() => {
        return {
            paid: rows.filter((item) => item.paymentStatus === "paid").length,
            partial: rows.filter((item) => item.paymentStatus === "partial").length,
            unpaid: rows.filter((item) => item.paymentStatus === "unpaid").length,
        };
    }, [rows]);

    const selectedRow = useMemo(() => {
        if (!modalTarget?.id) return null;
        return rows.find((item) => item.id === modalTarget.id) || null;
    }, [modalTarget, rows]);

    const currentEditableRemaining = useMemo(() => {
        if (!selectedRow || !editingPayment) return 0;

        const currentAmount = normalizeNumber(
            editingPayment?.amount ||
            editingPayment?.paymentAmount ||
            editingPayment?.payment_amount
        );

        return normalizeNumber(selectedRow.balance) + currentAmount;
    }, [selectedRow, editingPayment]);

    const handleOpenModal = (row) => {
        setModalTarget(row);
        setPaymentInput("");
        setEditingPayment(null);
        setEditingAmount("");
    };

    const closePaymentModal = () => {
        setModalTarget(null);
        setPaymentInput("");
        setEditingPayment(null);
        setEditingAmount("");
    };

    const handleSavePayment = async () => {
        if (!selectedRow) return;

        const amount = normalizeNumber(paymentInput);

        if (amount <= 0) {
            showFeedback("error", "Invalid Amount", "Enter a valid payment amount.");
            return;
        }

        if (selectedRow.balance <= 0) {
            showFeedback("error", "Already Fully Paid", "This booking is already fully paid.");
            return;
        }

        if (amount > selectedRow.balance) {
            showFeedback(
                "error",
                "Payment Exceeded",
                `Payment exceeds the remaining balance of ${formatCurrency(
                    selectedRow.balance
                )}.`
            );
            return;
        }

        const currentPayments = Array.isArray(selectedRow.payments)
            ? selectedRow.payments
            : [];

        const newPayment = {
            id: `payment_${Date.now()}`,
            paymentId: `P${Date.now()}`,
            bookingId: selectedRow.bookingId,
            amount,
            paymentAmount: amount,
            paymentType: "Booking Payment",
            paymentMethod: "Manual Admin Entry",
            referenceNumber: `REF-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: amount === selectedRow.balance ? "Paid" : "Partial",
            clientName: selectedRow.fullName || "Client",
            ownerEmail: selectedRow.ownerEmail || selectedRow.email || "",
        };

        try {
            setSaving(true);

            await updateQuotationRecord(selectedRow.id, {
                payments: [...currentPayments, newPayment],
                updatedAt: new Date().toISOString(),
            });

            setPaymentInput("");
            await loadRows();

            showFeedback(
                "success",
                "Payment Saved",
                `${formatCurrency(amount)} was successfully recorded for ${selectedRow.fullName}.`
            );
        } catch (error) {
            console.error("Failed to save payment:", error);
            showFeedback(
                "error",
                "Save Failed",
                error.message || "Failed to save payment."
            );
        } finally {
            setSaving(false);
        }
    };

    const startEditPayment = (payment) => {
        setEditingPayment(payment);
        setEditingAmount(
            String(
                normalizeNumber(
                    payment?.amount ||
                    payment?.paymentAmount ||
                    payment?.payment_amount
                )
            )
        );
    };

    const cancelEditPayment = () => {
        setEditingPayment(null);
        setEditingAmount("");
    };

    const handleUpdatePayment = async () => {
        if (!selectedRow || !editingPayment) return;

        const newAmount = normalizeNumber(editingAmount);

        if (newAmount <= 0) {
            showFeedback(
                "error",
                "Invalid Updated Amount",
                "Enter a valid updated payment amount."
            );
            return;
        }

        if (newAmount > currentEditableRemaining) {
            showFeedback(
                "error",
                "Amount Exceeded",
                `Updated payment exceeds the allowed amount of ${formatCurrency(
                    currentEditableRemaining
                )}.`
            );
            return;
        }

        const updatedPayments = (selectedRow.payments || []).map((item, index) => {
            if (isSamePaymentRecord(item, editingPayment, index)) {
                return {
                    ...item,
                    amount: newAmount,
                    paymentAmount: newAmount,
                    status:
                        newAmount === currentEditableRemaining ? "Paid" : "Partial",
                    updatedAt: new Date().toISOString(),
                };
            }
            return item;
        });

        try {
            setSaving(true);

            await updateQuotationRecord(selectedRow.id, {
                payments: updatedPayments,
                updatedAt: new Date().toISOString(),
            });

            setEditingPayment(null);
            setEditingAmount("");
            await loadRows();

            showFeedback(
                "success",
                "Payment Updated",
                "The payment record was updated successfully."
            );
        } catch (error) {
            console.error("Failed to update payment:", error);
            showFeedback(
                "error",
                "Update Failed",
                error.message || "Failed to update payment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePayment = async (payment) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this payment record?"
        );

        if (!confirmed || !selectedRow) return;

        const filteredPayments = (selectedRow.payments || []).filter((item, index) => {
            return !isSamePaymentRecord(item, payment, index);
        });

        try {
            setSaving(true);

            await updateQuotationRecord(selectedRow.id, {
                payments: filteredPayments,
                updatedAt: new Date().toISOString(),
            });

            setEditingPayment(null);
            setEditingAmount("");
            await loadRows();

            showFeedback(
                "success",
                "Payment Deleted",
                "The payment record was removed successfully."
            );
        } catch (error) {
            console.error("Failed to delete payment:", error);
            showFeedback(
                "error",
                "Delete Failed",
                error.message || "Failed to delete payment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePrintPayments = () => {
        openPrintWindow({
            title: "Payment Tracking Report",
            subtitle: "Booking payment status summary",
            summaryCards: [
                { label: "Bookings", value: rows.length },
                { label: "Collected", value: formatCurrency(totals.collected) },
                { label: "Outstanding", value: formatCurrency(totals.balance) },
                {
                    label: "Paid Bookings",
                    value: rows.filter((item) => item.paymentStatus === "paid").length,
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
                rows.map((row) => [
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
                                Monitor booking payments, collected revenue, and outstanding
                                balances through a cleaner premium financial interface.
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

                    {loading ? (
                        <div className="p-10">
                            <div className="rounded-[24px] border border-dashed border-[#d9e2ec] bg-[linear-gradient(135deg,#f8fafc,white)] p-10 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf5]">
                                    <LoaderCircle className="h-8 w-8 animate-spin text-[#0f766e]" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-[#0f4d3c]">
                                    Loading payment records
                                </h3>
                            </div>
                        </div>
                    ) : filteredRows.length === 0 ? (
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
                            <table className="w-full min-w-[1160px] text-sm">
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
                                                    className={`font-bold ${row.balance <= 0
                                                            ? "text-emerald-600"
                                                            : "text-rose-500"
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
                                                    onClick={() => handleOpenModal(row)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b4a3a] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#09382d]"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                    Manage Payment
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
                {feedback.open && (
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        className="fixed right-5 top-5 z-[70] w-full max-w-md"
                    >
                        <div
                            className={`overflow-hidden rounded-[24px] border shadow-[0_24px_70px_rgba(15,23,42,0.22)] ${feedback.type === "success"
                                    ? "border-emerald-200 bg-white"
                                    : "border-rose-200 bg-white"
                                }`}
                        >
                            <div
                                className={`flex items-start gap-4 p-5 ${feedback.type === "success"
                                        ? "bg-gradient-to-r from-emerald-50 to-white"
                                        : "bg-gradient-to-r from-rose-50 to-white"
                                    }`}
                            >
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${feedback.type === "success"
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "bg-rose-100 text-rose-600"
                                        }`}
                                >
                                    {feedback.type === "success" ? (
                                        <CheckCircle2 className="h-6 w-6" />
                                    ) : (
                                        <AlertTriangle className="h-6 w-6" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h4 className="text-base font-black text-[#0f172a]">
                                        {feedback.title}
                                    </h4>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {feedback.message}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeFeedback}
                                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedRow && (
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
                            className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(2,6,23,0.30)]"
                        >
                            <div className="bg-[linear-gradient(135deg,#0f4d3c,#09382d)] p-6 text-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                            <CreditCard className="h-7 w-7 text-[#f4d97a]" />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-black">
                                                Manage Payment
                                            </h3>
                                            <p className="mt-1 text-sm text-white/75">
                                                Add, edit, or remove payment records for this booking.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closePaymentModal}
                                        className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[calc(92vh-112px)] overflow-y-auto p-6">
                                <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
                                    <div className="space-y-5">
                                        <div className="rounded-[24px] border border-[#f4ecd2] bg-[#fffaf0] p-4">
                                            <p className="text-sm font-bold text-[#0f4d3c]">
                                                {selectedRow.fullName}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Booking ID: {selectedRow.bookingId}
                                            </p>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <MiniInfo
                                                    label="Total Amount"
                                                    value={formatCurrency(selectedRow.totalAmount)}
                                                />
                                                <MiniInfo
                                                    label="Current Paid"
                                                    value={formatCurrency(selectedRow.paid)}
                                                />
                                                <MiniInfo
                                                    label="Balance"
                                                    value={formatCurrency(selectedRow.balance)}
                                                />
                                                <MiniInfo
                                                    label="Status"
                                                    value={selectedRow.paymentStatus}
                                                />
                                            </div>
                                        </div>

                                        <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
                                            <div className="mb-4 flex items-center gap-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ecfdf5]">
                                                    <ArrowRight className="h-5 w-5 text-[#0f766e]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-[#0f4d3c]">
                                                        Add New Payment
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        Record an additional payment for this booking.
                                                    </p>
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
                                                        max={selectedRow.balance}
                                                        placeholder={
                                                            selectedRow.balance <= 0
                                                                ? "Booking already fully paid"
                                                                : "Enter payment amount"
                                                        }
                                                        value={paymentInput}
                                                        onChange={(e) =>
                                                            setPaymentInput(e.target.value)
                                                        }
                                                        disabled={selectedRow.balance <= 0 || saving}
                                                        className="w-full rounded-2xl border border-gray-200 bg-[#f8fafc] py-3 pl-10 pr-4 outline-none transition focus:border-[#d4af37] focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Maximum allowed payment:{" "}
                                                    {formatCurrency(selectedRow.balance)}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleSavePayment}
                                                disabled={selectedRow.balance <= 0 || saving}
                                                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${selectedRow.balance <= 0 || saving
                                                        ? "cursor-not-allowed bg-emerald-600/70"
                                                        : "bg-[#0b4a3a] hover:-translate-y-0.5 hover:bg-[#09382d]"
                                                    }`}
                                            >
                                                <CreditCard className="h-4 w-4" />
                                                {selectedRow.balance <= 0
                                                    ? "Fully Paid"
                                                    : saving
                                                        ? "Saving..."
                                                        : "Save Payment"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
                                            <div className="mb-4 flex items-center gap-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eff6ff]">
                                                    <History className="h-5 w-5 text-[#2563eb]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-[#0f4d3c]">
                                                        Payment History
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        Edit or delete recorded payments when deductions are wrong.
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedRow.payments.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-4 py-8 text-center text-sm text-gray-500">
                                                    No payment records yet for this booking.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {selectedRow.payments.map((payment, index) => {
                                                        const isEditing =
                                                            editingPayment &&
                                                            isSamePaymentRecord(
                                                                payment,
                                                                editingPayment,
                                                                index
                                                            );

                                                        const amountValue = normalizeNumber(
                                                            payment?.amount ||
                                                            payment?.paymentAmount ||
                                                            payment?.payment_amount
                                                        );

                                                        return (
                                                            <div
                                                                key={getPaymentIdentity(payment, index)}
                                                                className="rounded-[22px] border border-gray-100 bg-[#fcfcfd] p-4"
                                                            >
                                                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-extrabold text-[#0f4d3c]">
                                                                            {formatCurrency(amountValue)}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-gray-500">
                                                                            {payment?.referenceNumber ||
                                                                                payment?.paymentId ||
                                                                                "Manual payment record"}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-gray-400">
                                                                            {formatDate(
                                                                                payment?.createdAt ||
                                                                                payment?.created_at ||
                                                                                payment?.updatedAt ||
                                                                                payment?.updated_at
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    {!isEditing ? (
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    startEditPayment(payment)
                                                                                }
                                                                                className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#fff8e6] px-3 py-2 text-xs font-bold text-[#8d6a0e] transition hover:bg-[#fff1c5]"
                                                                            >
                                                                                <Pencil className="h-3.5 w-3.5" />
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleDeletePayment(payment)
                                                                                }
                                                                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full md:w-[280px]">
                                                                            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                                                                Edit payment amount
                                                                            </label>
                                                                            <div className="relative">
                                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                                                                    ₱
                                                                                </span>
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    max={currentEditableRemaining}
                                                                                    value={editingAmount}
                                                                                    onChange={(e) =>
                                                                                        setEditingAmount(
                                                                                            e.target.value
                                                                                        )
                                                                                    }
                                                                                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#d4af37]"
                                                                                />
                                                                            </div>
                                                                            <p className="mt-2 text-[11px] text-gray-500">
                                                                                Max allowed:{" "}
                                                                                {formatCurrency(
                                                                                    currentEditableRemaining
                                                                                )}
                                                                            </p>

                                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={handleUpdatePayment}
                                                                                    disabled={saving}
                                                                                    className="inline-flex items-center gap-2 rounded-xl bg-[#0b4a3a] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#09382d] disabled:opacity-60"
                                                                                >
                                                                                    Save Update
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={cancelEditPayment}
                                                                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={closePaymentModal}
                                        className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                                    >
                                        Close
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
            <p className="mt-2 font-extrabold capitalize text-[#0f4d3c]">
                {value}
            </p>
        </div>
    );
}

export default AdminPaymentTracking;