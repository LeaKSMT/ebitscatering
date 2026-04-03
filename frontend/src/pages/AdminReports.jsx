import { useMemo } from "react";
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
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <SummaryCard title="Total Bookings" value={summary.totalBookings} />
                <SummaryCard
                    title="Total Revenue"
                    value={formatCurrency(summary.totalRevenue)}
                />
                <SummaryCard
                    title="Total Expenses"
                    value={formatCurrency(summary.totalExpenses)}
                />
                <SummaryCard
                    title="Net Profit"
                    value={formatCurrency(summary.netProfit)}
                />
            </section>

            <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <h2 className="text-2xl font-bold text-[#0f4d3c]">
                    Generate PDF Reports
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    These reports use only the current real data saved in your system.
                </p>

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                    <ReportButton
                        label="Business Overview"
                        onClick={handlePrintOverview}
                    />
                    <ReportButton
                        label="Bookings Report"
                        onClick={handlePrintBookings}
                    />
                    <ReportButton
                        label="Quotation Report"
                        onClick={handlePrintQuotations}
                    />
                    <ReportButton
                        label="Payment Report"
                        onClick={handlePrintPayments}
                    />
                    <ReportButton
                        label="Expense Report"
                        onClick={handlePrintExpenses}
                    />
                    <ReportButton
                        label="Inquiry Report"
                        onClick={handlePrintInquiries}
                    />
                    <ReportButton
                        label="Monthly Financial"
                        onClick={handlePrintMonthlyFinancial}
                    />
                    <ReportButton
                        label="Demand Forecast"
                        onClick={handlePrintForecast}
                    />
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c] mb-4">
                        Report Summary
                    </h2>

                    <div className="space-y-4">
                        <SummaryLine
                            label="Approved Quotations"
                            value={summary.approvedQuotations}
                        />
                        <SummaryLine
                            label="Pending Quotations"
                            value={summary.pendingQuotations}
                        />
                        <SummaryLine
                            label="Total Inquiries"
                            value={summary.totalInquiries}
                        />
                        <SummaryLine
                            label="Replied Inquiries"
                            value={summary.repliedInquiries}
                        />
                        <SummaryLine
                            label="Total Collected"
                            value={formatCurrency(summary.totalCollected)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c] mb-4">
                        Demand Forecast Snapshot
                    </h2>

                    <div className="space-y-4">
                        {demandForecast.map((item) => (
                            <div key={item.type}>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="font-medium text-[#0f4d3c]">
                                        {item.type}
                                    </span>
                                    <span className="text-gray-500">
                                        {item.count} • {item.percent}%
                                    </span>
                                </div>

                                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-[#d4af37]"
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <h2 className="text-2xl font-bold text-[#0f4d3c] mb-4">
                    Monthly Financial Preview
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

function SummaryLine({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] px-4 py-3">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-bold text-[#0f4d3c]">{value}</span>
        </div>
    );
}

function ReportButton({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="rounded-2xl bg-[#0b4a3a] px-4 py-4 text-left font-bold text-white hover:bg-[#09382d] transition"
        >
            {label}
        </button>
    );
}

export default AdminReports;