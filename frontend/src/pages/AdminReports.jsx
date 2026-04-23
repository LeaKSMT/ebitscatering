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
    LoaderCircle,
    CheckCircle2,
    Clock3,
    Users,
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
        item.estimated_total ||
        item.total_price ||
        0
    );
}

function getPaymentsTotal(payments = []) {
    return payments.reduce((sum, item) => {
        return (
            sum +
            normalizeNumber(
                item?.amount || item?.paymentAmount || item?.payment_amount
            )
        );
    }, 0);
}

function mapRecord(item) {
    const status = normalizeStatus(item.status || "pending");
    const payments = parseArrayField(item.payments || item.payment_records);
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
        fullName:
            item.fullName ||
            item.full_name ||
            item.clientName ||
            item.client_name ||
            item.name ||
            "Client",
        email: item.email || item.client_email || "",
        eventType:
            item.eventType ||
            item.event_type ||
            item.packageType ||
            item.package_name ||
            "Event",
        preferredDate:
            item.preferredDate ||
            item.preferred_date ||
            item.eventDate ||
            item.event_date ||
            item.bookingDate ||
            item.date ||
            "",
        eventDate:
            item.eventDate ||
            item.event_date ||
            item.preferredDate ||
            item.preferred_date ||
            item.bookingDate ||
            item.date ||
            "",
        guests: normalizeNumber(item.guests || item.guestCount || item.pax || 0),
        guestCount: normalizeNumber(
            item.guestCount || item.guests || item.pax || 0
        ),
        totalAmount,
        estimatedTotal: totalAmount,
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

function getCurrentTheme() {
    if (typeof document === "undefined") return "light";

    const html = document.documentElement;
    const body = document.body;

    if (
        html.classList.contains("admin-dark") ||
        body.classList.contains("admin-dark") ||
        html.getAttribute("data-theme") === "dark" ||
        body.getAttribute("data-theme") === "dark"
    ) {
        return "dark";
    }

    return "light";
}

function AdminReports() {
    const [theme, setTheme] = useState(getCurrentTheme);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof document === "undefined") return undefined;

        const syncTheme = () => setTheme(getCurrentTheme());
        syncTheme();

        const observer = new MutationObserver(syncTheme);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });

        return () => observer.disconnect();
    }, []);

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

    const quotations = useMemo(() => records, [records]);

    const payments = useMemo(() => {
        return records.flatMap((record) =>
            (record.payments || []).map((payment, index) => ({
                ...payment,
                bookingId: payment.bookingId || record.bookingId,
                clientName: payment.clientName || record.fullName,
                paymentType: payment.paymentType || "Booking Payment",
                paymentMethod: payment.paymentMethod || "Recorded Payment",
                amount: normalizeNumber(
                    payment.amount ||
                    payment.paymentAmount ||
                    payment.payment_amount
                ),
                createdAt:
                    payment.createdAt || payment.updatedAt || record.eventDate,
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
                createdAt:
                    expense.createdAt || expense.updatedAt || record.eventDate,
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
            subtitle:
                "Summary of bookings, revenue, quotations, inquiries, and profit",
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
                {
                    label: "Total Expenses",
                    value: formatCurrency(summary.totalExpenses),
                },
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

    const reportCards = [
        {
            title: "Business Overview",
            description: "Printable executive summary of core system metrics.",
            icon: PieChart,
            onClick: handlePrintOverview,
        },
        {
            title: "Bookings Report",
            description: "Printable booking list with paid and balance summary.",
            icon: CalendarRange,
            onClick: handlePrintBookings,
        },
        {
            title: "Quotation Report",
            description: "Printable quotation request records.",
            icon: FileText,
            onClick: handlePrintQuotations,
        },
        {
            title: "Payment Report",
            description: "Printable payment transaction records.",
            icon: Wallet,
            onClick: handlePrintPayments,
        },
        {
            title: "Expense Report",
            description: "Printable expense monitoring report.",
            icon: ReceiptText,
            onClick: handlePrintExpenses,
        },
        {
            title: "Inquiry Report",
            description: "Printable inquiry summary and client requests.",
            icon: MessageSquareQuote,
            onClick: handlePrintInquiries,
        },
        {
            title: "Monthly Financial",
            description: "Printable monthly revenue, expense, and profit report.",
            icon: BarChart3,
            onClick: handlePrintMonthlyFinancial,
        },
        {
            title: "Demand Forecast",
            description: "Printable demand distribution by event type.",
            icon: TrendingUp,
            onClick: handlePrintForecast,
        },
    ];

    const isDark = theme === "dark";
    const shellCard = isDark
        ? "border-white/10 bg-[linear-gradient(180deg,rgba(8,28,22,0.96)_0%,rgba(9,34,26,0.96)_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.24)]"
        : "border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]";

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
                            Admin Reports
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">
                            Generate clean printable reports from your current
                            system data. This page is focused on report export,
                            not payment management.
                        </p>
                    </div>

                    <button
                        onClick={handlePrintOverview}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f4d97a]/40 bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f2c24] transition hover:scale-[1.02] hover:bg-[#e0bc49]"
                    >
                        <Printer className="h-4 w-4" />
                        Print Business Overview
                    </button>
                </div>
            </motion.section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    theme={theme}
                    title="Total Bookings"
                    value={summary.totalBookings}
                    icon={CalendarRange}
                    delay={0.05}
                />
                <SummaryCard
                    theme={theme}
                    title="Total Revenue"
                    value={formatCurrency(summary.totalRevenue)}
                    icon={Wallet}
                    delay={0.1}
                />
                <SummaryCard
                    theme={theme}
                    title="Total Inquiries"
                    value={summary.totalInquiries}
                    icon={Users}
                    delay={0.15}
                />
                <SummaryCard
                    theme={theme}
                    title="Net Profit"
                    value={formatCurrency(summary.netProfit)}
                    icon={TrendingUp}
                    delay={0.2}
                />
            </section>

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className={`overflow-hidden rounded-[28px] border ${shellCard}`}
            >
                <div className={`border-b p-6 ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                        Printable Report Generator
                    </h2>
                    <p className={`mt-1 text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                        Click any report card below to open a printable version.
                    </p>
                </div>

                {loading ? (
                    <div className="p-10 text-center">
                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-[rgba(34,197,139,0.10)]" : "bg-[#ecfdf5]"}`}>
                            <LoaderCircle className={`h-8 w-8 animate-spin ${isDark ? "text-[#98efcc]" : "text-[#0f766e]"}`} />
                        </div>
                        <p className={`mt-4 text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                            Loading report data...
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                        {reportCards.map((card, index) => (
                            <ReportButton
                                theme={theme}
                                key={card.title}
                                label={card.title}
                                description={card.description}
                                onClick={card.onClick}
                                icon={card.icon}
                                delay={index * 0.04}
                            />
                        ))}
                    </div>
                )}
            </motion.section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`rounded-[28px] border p-6 ${shellCard}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-[rgba(212,175,55,0.14)] text-[#f4d97a]" : "bg-[#fff8e6] text-[#b99117]"
                            }`}>
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                                Report Summary
                            </h2>
                            <p className={`text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                                Quick summary before printing.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <SummaryLine theme={theme} label="Approved Quotations" value={summary.approvedQuotations} />
                        <SummaryLine theme={theme} label="Pending Quotations" value={summary.pendingQuotations} />
                        <SummaryLine theme={theme} label="Total Collected" value={formatCurrency(summary.totalCollected)} />
                        <SummaryLine theme={theme} label="Total Expenses" value={formatCurrency(summary.totalExpenses)} />
                        <SummaryLine theme={theme} label="Replied Inquiries" value={summary.repliedInquiries} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`rounded-[28px] border p-6 ${shellCard}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-[rgba(34,197,139,0.12)] text-[#98efcc]" : "bg-[#ecfdf5] text-[#0f766e]"
                            }`}>
                            <Clock3 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                                Demand Forecast Snapshot
                            </h2>
                            <p className={`text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                                Event type distribution based on current bookings.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {loading ? (
                            <div className={`flex items-center gap-3 text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Loading demand forecast...
                            </div>
                        ) : demandForecast.length === 0 ? (
                            <p className={`text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                                No demand forecast data yet.
                            </p>
                        ) : (
                            demandForecast.map((item) => (
                                <div key={item.type}>
                                    <div className={`mb-2 flex items-center justify-between gap-3 text-sm`}>
                                        <span className={`font-bold ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                                            {item.type}
                                        </span>
                                        <span className={`${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                                            {item.count} • {item.percent}%
                                        </span>
                                    </div>

                                    <div className={`h-3 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
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
        </div>
    );
}

function SummaryCard({ theme, title, value, icon: Icon, delay = 0 }) {
    const isDark = theme === "dark";

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            className={`rounded-[26px] border p-5 ${isDark
                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(7,25,19,0.96)_0%,rgba(10,31,24,0.96)_100%)] shadow-[0_16px_50px_rgba(0,0,0,0.22)]"
                    : "border-white/70 bg-white/90 shadow-[0_16px_50px_rgba(15,23,42,0.07)]"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className={`text-sm font-medium ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>{title}</p>
                    <h2 className={`mt-3 text-3xl font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                        {value}
                    </h2>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark
                        ? "bg-[linear-gradient(135deg,rgba(212,175,55,0.18),rgba(212,175,55,0.08))] text-[#f4d97a] ring-1 ring-[#d4af37]/30"
                        : "bg-[linear-gradient(135deg,rgba(212,175,55,0.16),rgba(255,248,230,1))] text-[#b99117] ring-1 ring-[#ecd891]"
                    }`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </motion.div>
    );
}

function SummaryLine({ theme, label, value }) {
    const isDark = theme === "dark";

    return (
        <div className={`flex items-center justify-between rounded-[20px] border px-4 py-4 shadow-sm ${isDark
                ? "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]"
                : "border-gray-100 bg-[linear-gradient(135deg,#ffffff,#f8fafc)]"
            }`}>
            <span className={`text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-600"}`}>{label}</span>
            <span className={`font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>{value}</span>
        </div>
    );
}

function ReportButton({ theme, label, description, onClick, icon: Icon, delay = 0 }) {
    const isDark = theme === "dark";

    return (
        <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            onClick={onClick}
            className={`group rounded-[24px] border p-4 text-left shadow-sm transition hover:-translate-y-1 ${isDark
                    ? "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] hover:border-[#d4af37]/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                    : "border-[#dce5eb] bg-[linear-gradient(135deg,#ffffff,#f8fafc)] hover:border-[#d4af37] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${isDark
                            ? "bg-[rgba(34,197,139,0.12)] text-[#98efcc] group-hover:bg-[#d4af37] group-hover:text-[#0f2c24]"
                            : "bg-[#0f4d3c] text-white group-hover:bg-[#d4af37] group-hover:text-[#0f2c24]"
                        }`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <h3 className={`mt-4 text-base font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>
                        {label}
                    </h3>
                    <p className={`mt-1 text-xs leading-5 ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>
                        {description}
                    </p>
                </div>
            </div>

            <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${isDark
                    ? "bg-[rgba(212,175,55,0.12)] text-[#f4d97a]"
                    : "bg-[#fff8e6] text-[#9b7510]"
                }`}>
                <Printer className="h-3.5 w-3.5" />
                Print Report
            </div>
        </motion.button>
    );
}

export default AdminReports;