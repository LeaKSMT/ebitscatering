import { useMemo } from "react";
import {
    getAllBookings,
    getAllPayments,
    getAllQuotations,
    getBookingPaymentSummary,
    getMonthlyFinancialRows,
    getDemandForecast,
    formatCurrency,
    formatDate,
    normalizeStatus,
} from "../utils/AdminData";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";

const CHART_COLORS = ["#0f4d3c", "#d4af37", "#22b67f", "#ef4444", "#64748b"];

function AdminDashboard() {
    const bookings = useMemo(() => getAllBookings(), []);
    const payments = useMemo(() => getAllPayments(), []);
    const quotations = useMemo(() => getAllQuotations(), []);
    const monthlyRows = useMemo(() => getMonthlyFinancialRows(), []);
    const demandForecast = useMemo(() => getDemandForecast(), []);

    const stats = useMemo(() => {
        const totalRevenue = bookings.reduce(
            (sum, booking) => sum + Number(booking.totalAmount || 0),
            0
        );

        const totalCollected = payments.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
        );

        const totalBookings = bookings.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = bookings.filter((booking) => {
            const eventDate = new Date(booking.eventDate || "");
            if (Number.isNaN(eventDate.getTime())) return false;
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
        }).length;

        const totalGuests = bookings.reduce(
            (sum, booking) => sum + Number(booking.guestCount || 0),
            0
        );

        const pendingQuotations = quotations.filter(
            (item) => normalizeStatus(item.status) === "pending"
        ).length;

        return {
            totalRevenue,
            totalCollected,
            totalBookings,
            upcomingEvents,
            totalGuests,
            pendingQuotations,
        };
    }, [bookings, payments, quotations]);

    const eventTypeChartData = useMemo(() => {
        return demandForecast
            .filter((item) => item.count > 0)
            .map((item) => ({
                name: item.type,
                value: item.count,
            }));
    }, [demandForecast]);

    const monthlyBookingTrend = useMemo(() => {
        const map = new Map();

        bookings.forEach((booking) => {
            const date = new Date(booking.eventDate || booking.createdAt || "");
            if (Number.isNaN(date.getTime())) return;

            const label = date.toLocaleDateString("en-PH", {
                month: "short",
                year: "numeric",
            });

            if (!map.has(label)) {
                map.set(label, { month: label, bookings: 0 });
            }

            map.get(label).bookings += 1;
        });

        return [...map.values()];
    }, [bookings]);

    const paymentStatusChartData = useMemo(() => {
        const summary = {
            Paid: 0,
            Partial: 0,
            Unpaid: 0,
        };

        bookings.forEach((booking) => {
            const paymentSummary = getBookingPaymentSummary(booking);
            const status = String(paymentSummary.paymentStatus || "unpaid").toLowerCase();

            if (status === "paid") summary.Paid += 1;
            else if (status === "partial") summary.Partial += 1;
            else summary.Unpaid += 1;
        });

        return [
            { name: "Paid", value: summary.Paid },
            { name: "Partial", value: summary.Partial },
            { name: "Unpaid", value: summary.Unpaid },
        ].filter((item) => item.value > 0);
    }, [bookings]);

    const recentBookings = useMemo(() => {
        return [...bookings]
            .sort((a, b) => new Date(b.createdAt || b.eventDate || 0) - new Date(a.createdAt || a.eventDate || 0))
            .slice(0, 5);
    }, [bookings]);

    return (
        <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <Card
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    subtitle="Approved and confirmed booking totals"
                />
                <Card
                    title="Total Bookings"
                    value={stats.totalBookings}
                    subtitle="All booking records in the system"
                />
                <Card
                    title="Upcoming Events"
                    value={stats.upcomingEvents}
                    subtitle="Events scheduled from today onward"
                />
                <Card
                    title="Total Guests Served"
                    value={stats.totalGuests}
                    subtitle="Combined guest count from bookings"
                />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                Monthly Revenue Trend
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Revenue performance based on real booking totals.
                            </p>
                        </div>
                    </div>

                    <div className="h-[320px]">
                        {monthlyRows.length === 0 ? (
                            <EmptyChartState message="No monthly revenue data yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyRows}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="label" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            borderRadius: "16px",
                                            border: "1px solid #e5e7eb",
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue"
                                        stroke="#0f4d3c"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expenses"
                                        name="Expenses"
                                        stroke="#d4af37"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">
                        Event Type Distribution
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                        Booking share by event category.
                    </p>

                    <div className="h-[320px]">
                        {eventTypeChartData.length === 0 ? (
                            <EmptyChartState message="No event type data yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={eventTypeChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        innerRadius={50}
                                        paddingAngle={3}
                                    >
                                        {eventTypeChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${entry.name}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} booking(s)`, name]}
                                        contentStyle={{
                                            borderRadius: "16px",
                                            border: "1px solid #e5e7eb",
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">
                        Booking Trend
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                        Number of bookings recorded per month.
                    </p>

                    <div className="h-[320px]">
                        {monthlyBookingTrend.length === 0 ? (
                            <EmptyChartState message="No booking trend data yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyBookingTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" allowDecimals={false} />
                                    <Tooltip
                                        formatter={(value) => [`${value} booking(s)`, "Bookings"]}
                                        contentStyle={{
                                            borderRadius: "16px",
                                            border: "1px solid #e5e7eb",
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="bookings"
                                        name="Bookings"
                                        radius={[10, 10, 0, 0]}
                                        fill="#0f4d3c"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">
                        Payment Status Overview
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                        Booking payment completion distribution.
                    </p>

                    <div className="h-[320px]">
                        {paymentStatusChartData.length === 0 ? (
                            <EmptyChartState message="No payment status data yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentStatusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={55}
                                        paddingAngle={4}
                                    >
                                        {paymentStatusChartData.map((entry, index) => (
                                            <Cell
                                                key={`payment-${entry.name}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} booking(s)`, name]}
                                        contentStyle={{
                                            borderRadius: "16px",
                                            border: "1px solid #e5e7eb",
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                Recent Bookings
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Latest booking activity from the system.
                            </p>
                        </div>
                    </div>

                    {recentBookings.length === 0 ? (
                        <p className="text-gray-500">No bookings yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-gray-500">
                                        <th className="py-3 font-semibold">Booking ID</th>
                                        <th className="py-3 font-semibold">Client</th>
                                        <th className="py-3 font-semibold">Event</th>
                                        <th className="py-3 font-semibold">Date</th>
                                        <th className="py-3 font-semibold">Guests</th>
                                        <th className="py-3 font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-gray-50">
                                            <td className="py-4 font-semibold text-[#0f4d3c]">
                                                {booking.bookingId}
                                            </td>
                                            <td className="py-4">{booking.fullName}</td>
                                            <td className="py-4">{booking.eventType}</td>
                                            <td className="py-4">{formatDate(booking.eventDate)}</td>
                                            <td className="py-4">{booking.guestCount}</td>
                                            <td className="py-4 font-semibold text-[#d4af37]">
                                                {formatCurrency(booking.totalAmount)}
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
                            Quick Admin Snapshot
                        </h2>
                        <div className="mt-5 space-y-4">
                            <SummaryLine
                                label="Total Collected"
                                value={formatCurrency(stats.totalCollected)}
                            />
                            <SummaryLine
                                label="Pending Quotations"
                                value={stats.pendingQuotations}
                            />
                            <SummaryLine
                                label="Confirmed Bookings"
                                value={
                                    bookings.filter(
                                        (item) => normalizeStatus(item.status) === "confirmed"
                                    ).length
                                }
                            />
                            <SummaryLine
                                label="Completed Events"
                                value={
                                    bookings.filter(
                                        (item) => normalizeStatus(item.status) === "completed"
                                    ).length
                                }
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                            Demand Forecast Snapshot
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
                                            className="h-full rounded-full bg-[#d4af37]"
                                            style={{ width: `${item.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Card({ title, value, subtitle }) {
    return (
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className="text-3xl font-extrabold text-[#0f4d3c] mt-2">{value}</h2>
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
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

function EmptyChartState({ message }) {
    return (
        <div className="h-full flex items-center justify-center rounded-2xl bg-[#f8fafc] text-gray-500 text-sm">
            {message}
        </div>
    );
}

export default AdminDashboard;
