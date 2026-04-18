import { useMemo } from "react";
import { motion } from "framer-motion";
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
import {
    Wallet,
    CalendarRange,
    ClipboardList,
    Users,
    TrendingUp,
    Sparkles,
    ArrowUpRight,
} from "lucide-react";

const CHART_COLORS = ["#0f4d3c", "#d4af37", "#22b67f", "#ef4444", "#64748b"];

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

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
            .sort(
                (a, b) =>
                    new Date(b.createdAt || b.eventDate || 0) -
                    new Date(a.createdAt || a.eventDate || 0)
            )
            .slice(0, 5);
    }, [bookings]);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-6"
        >
            <motion.section
                variants={fadeUp}
                className="relative overflow-hidden rounded-[32px] border border-[#dbe7e2] bg-white shadow-[0_14px_40px_rgba(14,61,47,0.08)]"
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-12 right-[-30px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_58%,#138062_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={14} />
                                Executive Overview
                            </div>

                            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
                                Premium Admin Dashboard
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 md:text-base">
                                Monitor revenue, event demand, quotations, payments,
                                and operational activity through a high-end management view.
                            </p>
                        </div>

                        <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                Business Health
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-white">
                                Stable
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                                <ArrowUpRight size={16} />
                                Strong admin visibility across active operations
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 md:px-8">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        subtitle="Approved and confirmed booking totals"
                        icon={Wallet}
                        accent="gold"
                    />
                    <StatCard
                        title="Total Bookings"
                        value={stats.totalBookings}
                        subtitle="All booking records in the system"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Upcoming Events"
                        value={stats.upcomingEvents}
                        subtitle="Events scheduled from today onward"
                        icon={CalendarRange}
                    />
                    <StatCard
                        title="Guests Served"
                        value={stats.totalGuests}
                        subtitle="Combined guest count from bookings"
                        icon={Users}
                    />
                </div>
            </motion.section>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <motion.section
                    variants={fadeUp}
                    className="rounded-[30px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                >
                    <SectionHeader
                        title="Monthly Revenue Trend"
                        subtitle="Revenue performance based on real booking totals."
                    />

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
                </motion.section>

                <motion.section
                    variants={fadeUp}
                    className="rounded-[30px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                >
                    <SectionHeader
                        title="Event Type Distribution"
                        subtitle="Booking share by event category."
                    />

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
                </motion.section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <motion.section
                    variants={fadeUp}
                    className="rounded-[30px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                >
                    <SectionHeader
                        title="Booking Trend"
                        subtitle="Number of bookings recorded per month."
                    />

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
                </motion.section>

                <motion.section
                    variants={fadeUp}
                    className="rounded-[30px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                >
                    <SectionHeader
                        title="Payment Status Overview"
                        subtitle="Booking payment completion distribution."
                    />

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
                </motion.section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <motion.section
                    variants={fadeUp}
                    className="rounded-[30px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                >
                    <SectionHeader
                        title="Recent Bookings"
                        subtitle="Latest booking activity from the system."
                    />

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
                </motion.section>

                <div className="space-y-6">
                    <motion.section
                        variants={fadeUp}
                        className="rounded-[30px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                    >
                        <SectionHeader
                            title="Quick Admin Snapshot"
                            subtitle="Fast access to important business figures."
                        />

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
                    </motion.section>

                    <motion.section
                        variants={fadeUp}
                        className="rounded-[30px] border border-[#dce7e2] bg-white p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
                    >
                        <SectionHeader
                            title="Demand Forecast Snapshot"
                            subtitle="Most requested event types in the system."
                        />

                        <div className="mt-5 space-y-4">
                            {demandForecast.map((item) => (
                                <div key={item.type}>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-medium text-[#0f4d3c]">
                                            {item.type}
                                        </span>
                                        <span className="text-gray-500">
                                            {item.count} booking(s) • {item.percent}%
                                        </span>
                                    </div>

                                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-[#d4af37]"
                                            style={{ width: `${item.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </div>
        </motion.div>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, accent = "green" }) {
    const iconStyle =
        accent === "gold"
            ? "bg-gradient-to-br from-[#fff8e3] to-[#ffefbf] text-[#b99117]"
            : "bg-gradient-to-br from-[#edf8f3] to-[#dff1e8] text-[#0f4d3c]";

    return (
        <div className="rounded-[26px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <h3 className="mt-3 text-3xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
                </div>

                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${iconStyle}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-[#0f4d3c]">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}

function SummaryLine({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-[#e8efeb] bg-[#f8fbfa] px-4 py-3">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-bold text-[#0f4d3c]">{value}</span>
        </div>
    );
}

function EmptyChartState({ message }) {
    return (
        <div className="flex h-full items-center justify-center rounded-2xl bg-[#f8fafc] text-sm text-gray-500">
            {message}
        </div>
    );
}

export default AdminDashboard;