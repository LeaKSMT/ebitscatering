import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    FileBarChart2,
    Printer,
    CalendarRange,
    Wallet,
    ReceiptText,
    PieChart,
    FileText,
    MessageSquareQuote,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    Sparkles,
    LoaderCircle,
} from "lucide-react";
import { quotationService } from "../services/quotationService.js";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function normalizeStatus(status = "") {
    return String(status || "").trim().toLowerCase();
}

function normalizeNumber(value) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
}

function formatCurrency(value) {
    const amount = normalizeNumber(value);
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
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

function getQuotationId(item) {
    return (
        item.quotationId ||
        item.quotation_code ||
        item.referenceNumber ||
        `Q-${item.id}`
    );
}

function getBookingId(item) {
    return (
        item.bookingId ||
        item.booking_code ||
        item.bookingCode ||
        item.referenceNumber ||
        `BK-${item.id}`
    );
}

function getTotalAmount(item) {
    return normalizeNumber(
        item.totalAmount ||
        item.estimatedTotal ||
        item.totalPrice ||
        item.price ||
        item.amount ||
        0
    );
}

function getPaymentsTotal(payments = []) {
    return payments.reduce((sum, item) => {
        return sum + normalizeNumber(item?.amount || item?.paymentAmount);
    }, 0);
}

function mapRecord(item) {
    const status = normalizeStatus(item.status || "pending");
    const payments = parseArrayField(item.payments);
    const expenses = parseArrayField(item.expenses);
    const inquiries = parseArrayField(item.inquiries);

    const totalAmount = getTotalAmount(item);
    const paid = Math.min(getPaymentsTotal(payments), totalAmount);
    const balance = Math.max(totalAmount - paid, 0);

    return {
        ...item,
        status,
        quotationId: getQuotationId(item),
        bookingId: getBookingId(item),
        fullName: item.fullName || item.clientName || item.name || "Client",
        eventType: item.eventType || item.packageType || item.package_name || "Event",
        preferredDate:
            item.preferredDate ||
            item.eventDate ||
            item.bookingDate ||
            item.date ||
            "",
        eventDate:
            item.eventDate ||
            item.preferredDate ||
            item.bookingDate ||
            item.date ||
            "",
        guests: normalizeNumber(item.guests || item.guestCount || item.pax || 0),
        guestCount: normalizeNumber(item.guestCount || item.guests || item.pax || 0),
        estimatedTotal: totalAmount,
        totalAmount,
        payments,
        expenses,
        inquiries,
        paid,
        balance,
        isBookingLike: [
            "approved",
            "confirmed",
            "paid",
            "upcoming",
            "ongoing",
            "completed",
        ].includes(status),
    };
}

function AdminReports() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadReportsData() {
            setLoading(true);
            try {
                const data = await quotationService.getQuotations();
                const mapped = Array.isArray(data) ? data.map(mapRecord) : [];

                if (isMounted) {
                    setRecords(mapped);
                }
            } catch (error) {
                console.error("Failed to load reports data:", error);
                if (isMounted) {
                    setRecords([]);
                    alert(error.message || "Failed to load reports data.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadReportsData();

        return () => {
            isMounted = false;
        };
    }, []);

    const bookings = useMemo(() => {
        return records.filter((item) => item.isBookingLike);
    }, [records]);

    const quotations = useMemo(() => {
        return records;
    }, [records]);

    const payments = useMemo(() => {
        return records.flatMap((record) =>
            (record.payments || []).map((payment, index) => ({
                ...payment,
                bookingId: payment.bookingId || record.bookingId,
                clientName: payment.clientName || record.fullName,
                paymentType: payment.paymentType || "Booking Payment",
                paymentMethod: payment.paymentMethod || "Recorded Payment",
                amount: normalizeNumber(payment.amount || payment.paymentAmount),
                createdAt: payment.createdAt || payment.updatedAt || record.eventDate,
                paymentId:
                    payment.paymentId ||
                    payment.referenceNumber ||
                    `P-${record.id}-${index + 1}`,
            }))
        );
    }, [records]);

    const expenses = useMemo(() => {
        return records.flatMap((record) =>
            (record.expenses || []).map((expense, index) => ({
                ...expense,
                bookingId: expense.bookingId || record.bookingId || "—",
                clientName: expense.clientName || record.fullName || "—",
                eventType: expense.eventType || record.eventType || "—",
                category: expense.category || expense.type || "Expense",
                amount: normalizeNumber(expense.amount),
                createdAt: expense.createdAt || expense.updatedAt || record.eventDate,
                expenseId: expense.expenseId || `EXP-${record.id}-${index + 1}`,
            }))
        );
    }, [records]);

    const inquiries = useMemo(() => {
        return records.flatMap((record) =>
            (record.inquiries || []).map((inquiry, index) => ({
                ...inquiry,
                inquiryId:
                    inquiry.inquiryId ||
                    inquiry.referenceNumber ||
                    `INQ-${record.id}-${index + 1}`,
                fullName: inquiry.fullName || record.fullName,
                eventType: inquiry.eventType || record.eventType || "Inquiry",
                preferredDate:
                    inquiry.preferredDate ||
                    inquiry.eventDate ||
                    record.preferredDate ||
                    "",
                guests: normalizeNumber(
                    inquiry.guests || inquiry.guestCount || record.guests || 0
                ),
                status: normalizeStatus(inquiry.status || "recorded"),
            }))
        );
    }, [records]);

    const summary = useMemo(() => {
        const totalRevenue = bookings.reduce(
            (sum, item) => sum + normalizeNumber(item.totalAmount),
            0
        );

        const totalCollected = payments.reduce(
            (sum, item) => sum + normalizeNumber(item.amount),
            0
        );

        const totalExpenses = expenses.reduce(
            (sum, item) => sum + normalizeNumber(item.amount),
            0
        );

        const approvedQuotations = quotations.filter((item) =>
            ["approved", "confirmed", "paid"].includes(normalizeStatus(item.status))
        ).length;

        const pendingQuotations = quotations.filter(
            (item) => normalizeStatus(item.status) === "pending"
        ).length;

        const repliedInquiries = inquiries.filter(
            (item) => normalizeStatus(item.status) === "replied"
        ).length;

        return {
            totalBookings: bookings.length,
            totalRevenue,
            totalCollected,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            approvedQuotations,
            pendingQuotations,
            totalInquiries: inquiries.length,
            repliedInquiries,
        };
    }, [bookings, payments, expenses, quotations, inquiries]);

    const bookingReportRows = useMemo(() => {
        return bookings.map((booking) => [
            booking.bookingId,
            booking.fullName,
            booking.eventType,
            formatDate(booking.eventDate),
            booking.guestCount,
            formatCurrency(booking.totalAmount),
            formatCurrency(booking.paid),
            formatCurrency(booking.balance),
            booking.status,
        ]);
    }, [bookings]);

    const quotationReportRows = useMemo(() => {
        return quotations.map((item) => [
            item.quotationId,
            item.fullName,
            item.eventType,
            formatDate(item.preferredDate),
            item.guests,
            formatCurrency(item.estimatedTotal),
            item.status,
        ]);
    }, [quotations]);

    const paymentReportRows = useMemo(() => {
        return payments.map((item) => [
            item.paymentId,
            item.bookingId || "—",
            item.clientName,
            item.paymentType,
            item.paymentMethod,
            formatCurrency(item.amount),
            formatDate(item.createdAt),
        ]);
    }, [payments]);

    const expenseReportRows = useMemo(() => {
        return expenses.map((item) => [
            item.bookingId || "—",
            item.clientName || "—",
            item.eventType || "—",
            item.category || "—",
            formatCurrency(item.amount),
            formatDate(item.createdAt),
        ]);
    }, [expenses]);

    const inquiryReportRows = useMemo(() => {
        return inquiries.map((item) => [
            item.inquiryId,
            item.fullName,
            item.eventType,
            formatDate(item.preferredDate),
            item.guests,
            item.status,
        ]);
    }, [inquiries]);

    const monthlyRows = useMemo(() => {
        const bucket = new Map();

        records.forEach((record) => {
            const rawDate = record.eventDate || record.preferredDate;
            const date = new Date(rawDate);
            if (Number.isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const label = date.toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
            });

            if (!bucket.has(key)) {
                bucket.set(key, {
                    key,
                    label,
                    revenue: 0,
                    expenses: 0,
                });
            }

            const row = bucket.get(key);

            if (record.isBookingLike) {
                row.revenue += normalizeNumber(record.totalAmount);
            }

            row.expenses += (record.expenses || []).reduce(
                (sum, item) => sum + normalizeNumber(item.amount),
                0
            );
        });

        return [...bucket.values()]
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((row) => {
                const profit = row.revenue - row.expenses;
                const margin = row.revenue > 0 ? (profit / row.revenue) * 100 : 0;

                return {
                    ...row,
                    profit,
                    margin,
                };
            });
    }, [records]);

    const demandForecast = useMemo(() => {
        const counter = new Map();

        bookings.forEach((item) => {
            const type = item.eventType || "Other";
            counter.set(type, (counter.get(type) || 0) + 1);
        });

        const total = bookings.length || 1;

        return [...counter.entries()]
            .map(([type, count]) => ({
                type,
                count,
                percent: ((count / total) * 100).toFixed(1),
            }))
            .sort((a, b) => b.count - a.count);
    }, [bookings]);

    const handlePrintOverview = () => {
        openPrintWindow({
            title: "Business Overview Report",
            subtitle: "Summary of bookings, revenue, quotations, inquiries, and profit",
            summaryCards: [
                { label: "Bookings", value: summary.totalBookings },
                { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
                { label: "Expenses", value: formatCurrency(summary.totalExpenses) },
                { label: "Net Profit", value: formatCurrency(summary.netProfit) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Overview Summary</h2>
                    ${buildPrintableTable(
                ["Metric", "Value"],
                [
                    ["Total Bookings", summary.totalBookings],
                    ["Total Revenue", formatCurrency(summary.totalRevenue)],
                    ["Total Collected", formatCurrency(summary.totalCollected)],
                    ["Total Expenses", formatCurrency(summary.totalExpenses)],
                    ["Net Profit", formatCurrency(summary.netProfit)],
                    ["Approved Quotations", summary.approvedQuotations],
                    ["Pending Quotations", summary.pendingQuotations],
                    ["Total Inquiries", summary.totalInquiries],
                    ["Replied Inquiries", summary.repliedInquiries],
                ]
            )}
                </div>
            `,
        });
    };

    const handlePrintBookings = () => {
        openPrintWindow({
            title: "Bookings Report",
            subtitle: "All booking records currently saved in the system",
            summaryCards: [
                { label: "Total Bookings", value: summary.totalBookings },
                { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
                { label: "Collected", value: formatCurrency(summary.totalCollected) },
                { label: "Net Profit", value: formatCurrency(summary.netProfit) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Booking Records</h2>
                    ${buildPrintableTable(
                [
                    "Booking ID",
                    "Client",
                    "Event Type",
                    "Event Date",
                    "Guests",
                    "Total",
                    "Paid",
                    "Balance",
                    "Status",
                ],
                bookingReportRows
            )}
                </div>
            `,
        });
    };

    const handlePrintQuotations = () => {
        openPrintWindow({
            title: "Quotation Report",
            subtitle: "All quotation requests currently saved in the system",
            summaryCards: [
                { label: "Total Quotations", value: quotations.length },
                { label: "Approved", value: summary.approvedQuotations },
                { label: "Pending", value: summary.pendingQuotations },
                { label: "Bookings", value: summary.totalBookings },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Quotation Records</h2>
                    ${buildPrintableTable(
                [
                    "Quotation ID",
                    "Client",
                    "Event Type",
                    "Preferred Date",
                    "Guests",
                    "Estimated Total",
                    "Status",
                ],
                quotationReportRows
            )}
                </div>
            `,
        });
    };

    const handlePrintPayments = () => {
        openPrintWindow({
            title: "Payment Report",
            subtitle: "All payment records currently saved in the system",
            summaryCards: [
                { label: "Payments", value: payments.length },
                { label: "Collected", value: formatCurrency(summary.totalCollected) },
                { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
                { label: "Expenses", value: formatCurrency(summary.totalExpenses) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Payment Records</h2>
                    ${buildPrintableTable(
                [
                    "Payment ID",
                    "Booking ID",
                    "Client",
                    "Payment Type",
                    "Method",
                    "Amount",
                    "Date",
                ],
                paymentReportRows
            )}
                </div>
            `,
        });
    };

    const handlePrintExpenses = () => {
        openPrintWindow({
            title: "Expense Report",
            subtitle: "All admin-recorded expenses currently saved in the system",
            summaryCards: [
                { label: "Expenses", value: expenses.length },
                { label: "Total Expenses", value: formatCurrency(summary.totalExpenses) },
                { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
                { label: "Net Profit", value: formatCurrency(summary.netProfit) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Expense Records</h2>
                    ${buildPrintableTable(
                [
                    "Booking ID",
                    "Client",
                    "Event Type",
                    "Category",
                    "Amount",
                    "Date",
                ],
                expenseReportRows
            )}
                </div>
            `,
        });
    };

    const handlePrintInquiries = () => {
        openPrintWindow({
            title: "Inquiry Report",
            subtitle: "All inquiry records currently saved in the system",
            summaryCards: [
                { label: "Total Inquiries", value: summary.totalInquiries },
                { label: "Replied", value: summary.repliedInquiries },
                { label: "Quotations", value: quotations.length },
                { label: "Bookings", value: bookings.length },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Inquiry Records</h2>
                    ${buildPrintableTable(
                [
                    "Inquiry ID",
                    "Client",
                    "Event Type",
                    "Preferred Date",
                    "Guests",
                    "Status",
                ],
                inquiryReportRows
            )}
                </div>
            `,
        });
    };

    const handlePrintMonthlyFinancial = () => {
        openPrintWindow({
            title: "Monthly Financial Report",
            subtitle: "Monthly revenue, expenses, and profit summary",
            summaryCards: [
                { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
                { label: "Expenses", value: formatCurrency(summary.totalExpenses) },
                { label: "Collected", value: formatCurrency(summary.totalCollected) },
                { label: "Profit", value: formatCurrency(summary.netProfit) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Monthly Financial Summary</h2>
                    ${buildPrintableTable(
                ["Month", "Revenue", "Expenses", "Profit", "Margin"],
                monthlyRows.map((row) => [
                    row.label,
                    formatCurrency(row.revenue),
                    formatCurrency(row.expenses),
                    formatCurrency(row.profit),
                    `${row.margin.toFixed(1)}%`,
                ])
            )}
                </div>
            `,
        });
    };

    const handlePrintForecast = () => {
        openPrintWindow({
            title: "Demand Forecast Report",
            subtitle: "Demand overview based on current booking distribution",
            summaryCards: [
                { label: "Bookings", value: summary.totalBookings },
                { label: "Quotations", value: quotations.length },
                { label: "Inquiries", value: summary.totalInquiries },
                { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Demand Forecast</h2>
                    ${buildPrintableTable(
                ["Event Type", "Bookings", "Demand Share"],
                demandForecast.map((item) => [
                    item.type,
                    item.count,
                    `${item.percent}%`,
                ])
            )}
                </div>
            `,
        });
    };

    return (
        <div className="space-y-6">
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-[#0f4d3c] via-[#0c3f33] to-[#07241d] p-6 text-white shadow-[0_24px_80px_rgba(15,77,60,0.22)]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_25%)]" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f7e7a1] backdrop-blur">
                            <FileBarChart2 className="h-4 w-4" />
                            Executive Reporting Center
                        </div>
                        <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                            Admin Reports & Analytics
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">
                            Generate clean business reports and view operational snapshots from
                            your live admin data with a more premium executive dashboard feel.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/85">
                        <Sparkles className="h-4 w-4 text-[#f4d97a]" />
                        Real-time system-based report previews
                    </div>
                </div>
            </motion.section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard title="Total Bookings" value={summary.totalBookings} icon={CalendarRange} delay={0.05} />
                <SummaryCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon={Wallet} delay={0.1} />
                <SummaryCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={ReceiptText} delay={0.15} />
                <SummaryCard title="Net Profit" value={formatCurrency(summary.netProfit)} icon={TrendingUp} delay={0.2} />
            </section>

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            >
                <div className="border-b border-gray-100 p-6">
                    <h2 className="text-2xl font-black text-[#0f4d3c]">
                        Generate PDF Reports
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        These reports use only the current real data saved in your system.
                    </p>
                </div>

                <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                    <ReportButton label="Business Overview" onClick={handlePrintOverview} icon={PieChart} />
                    <ReportButton label="Bookings Report" onClick={handlePrintBookings} icon={CalendarRange} />
                    <ReportButton label="Quotation Report" onClick={handlePrintQuotations} icon={FileText} />
                    <ReportButton label="Payment Report" onClick={handlePrintPayments} icon={Wallet} />
                    <ReportButton label="Expense Report" onClick={handlePrintExpenses} icon={ReceiptText} />
                    <ReportButton label="Inquiry Report" onClick={handlePrintInquiries} icon={MessageSquareQuote} />
                    <ReportButton label="Monthly Financial" onClick={handlePrintMonthlyFinancial} icon={BarChart3} />
                    <ReportButton label="Demand Forecast" onClick={handlePrintForecast} icon={TrendingUp} />
                </div>
            </motion.section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff8e6] text-[#b99117]">
                            <PieChart className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#0f4d3c]">
                                Report Summary
                            </h2>
                            <p className="text-sm text-gray-500">
                                Executive snapshot of current business metrics.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <SummaryLine label="Approved Quotations" value={summary.approvedQuotations} />
                        <SummaryLine label="Pending Quotations" value={summary.pendingQuotations} />
                        <SummaryLine label="Total Inquiries" value={summary.totalInquiries} />
                        <SummaryLine label="Replied Inquiries" value={summary.repliedInquiries} />
                        <SummaryLine label="Total Collected" value={formatCurrency(summary.totalCollected)} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#0f766e]">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#0f4d3c]">
                                Demand Forecast Snapshot
                            </h2>
                            <p className="text-sm text-gray-500">
                                Current event demand based on booking distribution.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {loading ? (
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Loading demand forecast...
                            </div>
                        ) : demandForecast.length === 0 ? (
                            <p className="text-sm text-gray-500">No demand forecast data yet.</p>
                        ) : (
                            demandForecast.map((item) => (
                                <div key={item.type}>
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                        <span className="font-bold text-[#0f4d3c]">{item.type}</span>
                                        <span className="text-gray-500">
                                            {item.count} • {item.percent}%
                                        </span>
                                    </div>

                                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percent}%` }}
                                            transition={{ duration: 0.7 }}
                                            className="h-full rounded-full bg-[linear-gradient(90deg,#d4af37,#f0cd66)]"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </section>

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            >
                <div className="border-b border-gray-100 p-6">
                    <h2 className="text-2xl font-black text-[#0f4d3c]">
                        Monthly Financial Preview
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Revenue, expenses, profit, and margin overview by month.
                    </p>
                </div>

                {loading ? (
                    <div className="p-6 text-gray-500">Loading monthly data...</div>
                ) : monthlyRows.length === 0 ? (
                    <div className="p-6 text-gray-500">No monthly data yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-sm">
                            <thead>
                                <tr className="bg-[#fcfcfd] text-left text-[12px] uppercase tracking-[0.16em] text-gray-500">
                                    <th className="px-6 py-4 font-bold">Month</th>
                                    <th className="px-6 py-4 font-bold">Revenue</th>
                                    <th className="px-6 py-4 font-bold">Expenses</th>
                                    <th className="px-6 py-4 font-bold">Profit</th>
                                    <th className="px-6 py-4 font-bold">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyRows.map((row, index) => (
                                    <motion.tr
                                        key={row.label}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.28, delay: index * 0.03 }}
                                        className="border-t border-gray-100 transition hover:bg-[#fcfdfd]"
                                    >
                                        <td className="px-6 py-5 font-black text-[#0f4d3c]">
                                            {row.label}
                                        </td>
                                        <td className="px-6 py-5 font-medium text-slate-700">
                                            {formatCurrency(row.revenue)}
                                        </td>
                                        <td className="px-6 py-5 font-medium text-slate-700">
                                            {formatCurrency(row.expenses)}
                                        </td>
                                        <td className="px-6 py-5 font-bold text-[#10b981]">
                                            {formatCurrency(row.profit)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#0f766e] ring-1 ring-emerald-200">
                                                {row.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.section>
        </div>
    );
}

function SummaryCard({ title, value, icon: Icon, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            className="rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.07)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h2 className="mt-3 text-3xl font-black text-[#0f4d3c]">{value}</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(212,175,55,0.16),rgba(255,248,230,1))] text-[#b99117] ring-1 ring-[#ecd891]">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </motion.div>
    );
}

function SummaryLine({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-[20px] border border-gray-100 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] px-4 py-4 shadow-sm">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-black text-[#0f4d3c]">{value}</span>
        </div>
    );
}

function ReportButton({ label, onClick, icon: Icon }) {
    return (
        <button
            onClick={onClick}
            className="group rounded-[24px] border border-[#dce5eb] bg-[linear-gradient(135deg,#ffffff,#f8fafc)] p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f4d3c] text-white transition group-hover:bg-[#d4af37] group-hover:text-[#0f2c24]">
                        <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-black text-[#0f4d3c]">{label}</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        Generate and export this report as PDF.
                    </p>
                </div>

                <div className="mt-1 text-[#0f4d3c] transition group-hover:translate-x-1">
                    <ArrowUpRight className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff8e6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b7510]">
                <Printer className="h-3.5 w-3.5" />
                Export
            </div>
        </button>
    );
}

export default AdminReports;