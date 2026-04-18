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
    Sparkles,
    ArrowUpRight,
    BadgeDollarSign,
    CalendarClock,
    FileClock,
    CheckCircle2,
} from "lucide-react";

const CHART_COLORS = ["#0f4d3c", "#d4af37", "#22b67f", "#ef4444", "#64748b"];

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
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

        const confirmedBookings = bookings.filter(
            (item) => normalizeStatus(item.status) === "confirmed"
        ).length;

        const completedEvents = bookings.filter(
            (item) => normalizeStatus(item.status) === "completed"
        ).length;

        return {
            totalRevenue,
            totalCollected,
            totalBookings,
            upcomingEvents,
            totalGuests,
            pendingQuotations,
            confirmedBookings,
            completedEvents,
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
                className="relative overflow-hidden rounded-[34px] border border-[#dbe7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.08)]"
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-14 right-[-40px] h-48 w-48 rounded-full bg-[#d4af37]/18 blur-3xl" />
                    <div className="absolute bottom-[-30px] left-[-20px] h-36 w-36 rounded-full bg-white/12 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0a4637_0%,#0d5e49_52%,#118164_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute right-6 top-6 hidden h-20 w-20 rounded-full border border-white/10 bg-white/5 blur-[1px] md:block"
                    />

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
                                Monitor bookings, payments, quotations, revenue, and client event activity through a polished and defense-ready executive interface.
                            </p>
                        </div>

                        <motion.div
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)]"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                Business Health
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-white">
                                Stable
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                                <ArrowUpRight size={16} />
                                Strong visibility across operations and financial activity
                            </div>
                        </motion.div>
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <motion.div variants={fadeUp}>
                    <MiniMetricCard
                        title="Collected Payments"
                        value={formatCurrency(stats.totalCollected)}
                        icon={BadgeDollarSign}
                    />
                </motion.div>

                <motion.div variants={fadeUp}>
                    <MiniMetricCard
                        title="Pending Quotations"
                        value={stats.pendingQuotations}
                        icon={FileClock}
                    />
                </motion.div>

                <motion.div variants={fadeUp}>
                    <MiniMetricCard
                        title="Confirmed Bookings"
                        value={stats.confirmedBookings}
                        icon={CalendarClock}
                    />
                </motion.div>

                <motion.div variants={fadeUp}>
                    <MiniMetricCard
                        title="Completed Events"
                        value={stats.completedEvents}
                        icon={CheckCircle2}
                    />
                </motion.div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <DashboardCard
                    title="Monthly Revenue Trend"
                    subtitle="Revenue and expenses based on real booking totals."
                    variants={fadeUp}
                >
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
                </DashboardCard>

                <DashboardCard
                    title="Event Type Distribution"
                    subtitle="Booking share by event category."
                    variants={fadeUp}
                >
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
                </DashboardCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <DashboardCard
                    title="Booking Trend"
                    subtitle="Number of bookings recorded per month."
                    variants={fadeUp}
                >
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
                </DashboardCard>

                <DashboardCard
                    title="Payment Status Overview"
                    subtitle="Booking payment completion distribution."
                    variants={fadeUp}
                >
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
                </DashboardCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <DashboardCard
                    title="Recent Bookings"
                    subtitle="Latest booking activity from the system."
                    variants={fadeUp}
                >
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
                                        <tr
                                            key={booking.id}
                                            className="border-b border-gray-50 transition hover:bg-[#f8fbfa]"
                                        >
                                            <td className="py-4 font-semibold text-[#0f4d3c]">
                                                {booking.bookingId}
                                            </td>
                                            <td className="py-4">{booking.fullName}</td>
                                            <td className="py-4">{booking.eventType}</td>
                                            <td className="py-4">{formatDate(booking.eventDate)}</td>
                                            <td className="py-4">{booking.guestCount}</td>
                                            <td className="py-4 font-semibold text-[#b99117]">
                                                {formatCurrency(booking.totalAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DashboardCard>

                <div className="space-y-6">
                    <DashboardCard
                        title="Quick Admin Snapshot"
                        subtitle="Fast access to important business figures."
                        variants={fadeUp}
                    >
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
                                value={stats.confirmedBookings}
                            />
                            <SummaryLine
                                label="Completed Events"
                                value={stats.completedEvents}
                            />
                        </div>
                    </DashboardCard>

                    <DashboardCard
                        title="Demand Forecast Snapshot"
                        subtitle="Most requested event types in the system."
                        variants={fadeUp}
                    >
                        <div className="mt-5 space-y-4">
                            {demandForecast.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No demand forecast data yet.
                                </p>
                            ) : (
                                demandForecast.map((item, index) => (
                                    <motion.div
                                        key={item.type}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.08 * index }}
                                    >
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-medium text-[#0f4d3c]">
                                                {item.type}
                                            </span>
                                            <span className="text-gray-500">
                                                {item.count} booking(s) • {item.percent}%
                                            </span>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percent}%` }}
                                                transition={{ duration: 0.9, delay: 0.1 * index }}
                                                className="h-full rounded-full bg-[linear-gradient(90deg,#d4af37_0%,#f0cd63_100%)]"
                                            />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </motion.div>
    );
}

function DashboardCard({ title, subtitle, children, variants }) {
    return (
        <motion.section
            variants={variants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.22 }}
            className="rounded-[30px] border border-[#dce7e2] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-6 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
        >
            <SectionHeader title={title} subtitle={subtitle} />
            {children}
        </motion.section>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, accent = "green" }) {
    const iconStyle =
        accent === "gold"
            ? "bg-gradient-to-br from-[#fff8e3] to-[#ffefbf] text-[#b99117]"
            : "bg-gradient-to-br from-[#edf8f3] to-[#dff1e8] text-[#0f4d3c]";

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ duration: 0.22 }}
            className="rounded-[26px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <h3 className="mt-3 text-3xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
                </div>

                <motion.div
                    whileHover={{ rotate: -6, scale: 1.06 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${iconStyle}`}
                >
                    <Icon size={24} />
                </motion.div>
            </div>
        </motion.div>
    );
}

function MiniMetricCard({ title, value, icon: Icon }) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.015 }}
            transition={{ duration: 0.22 }}
            className="rounded-[26px] border border-[#dfe9e4] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-[0_10px_24px_rgba(14,61,47,0.05)]"
        >
            <div className="flex items-center gap-4">
                <motion.div
                    whileHover={{ rotate: -8, scale: 1.06 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf8f3_0%,#dff1e8_100%)] text-[#0f4d3c] shadow-sm"
                >
                    <Icon size={24} />
                </motion.div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h3>
                </div>
            </div>
        </motion.div>
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
        <motion.div
            whileHover={{ x: 3 }}
            className="flex items-center justify-between rounded-2xl border border-[#e8efeb] bg-[#f8fbfa] px-4 py-3"
        >
            <span className="text-sm text-gray-600">{label}</span>
            <span className="font-bold text-[#0f4d3c]">{value}</span>
        </motion.div>
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