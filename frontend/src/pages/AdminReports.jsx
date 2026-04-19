import { useMemo } from "react";
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
} from "lucide-react";
import {
    getAllBookings,
    getAllPayments,
    getAllExpenses,
    getAllQuotations,
    getAllInquiries,
    getMonthlyFinancialRows,
    getDemandForecast,
    getBookingPaymentSummary,
    formatCurrency,
    formatDate,
    normalizeStatus,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function AdminReports() {
    const bookings = useMemo(() => getAllBookings(), []);
    const payments = useMemo(() => getAllPayments(), []);
    const expenses = useMemo(() => getAllExpenses(), []);
    const quotations = useMemo(() => getAllQuotations(), []);
    const inquiries = useMemo(() => getAllInquiries(), []);
    const monthlyRows = useMemo(() => getMonthlyFinancialRows(), []);
    const demandForecast = useMemo(() => getDemandForecast(), []);

    const summary = useMemo(() => {
        const totalRevenue = bookings.reduce(
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
        const approvedQuotations = quotations.filter(
            (item) => normalizeStatus(item.status) === "approved"
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
        return bookings.map((booking) => {
            const paymentSummary = getBookingPaymentSummary(booking);

            return [
                booking.bookingId,
                booking.fullName,
                booking.eventType,
                formatDate(booking.eventDate),
                booking.guestCount,
                formatCurrency(booking.totalAmount),
                formatCurrency(paymentSummary.paid),
                formatCurrency(paymentSummary.balance),
                booking.status,
            ];
        });
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
                        {demandForecast.length === 0 ? (
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

                {monthlyRows.length === 0 ? (
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