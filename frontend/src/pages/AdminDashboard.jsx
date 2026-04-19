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

    return (
        <motion.div
            data-build="clean-admin-dashboard-v2"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-5"
        >
            <motion.section
                variants={fadeUp}
                className="relative overflow-hidden rounded-[30px] border border-[#dbe7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.08)]"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-14 right-[-40px] h-44 w-44 rounded-full bg-[#d4af37]/18 blur-3xl" />
                    <div className="absolute bottom-[-30px] left-[-20px] h-32 w-32 rounded-full bg-white/12 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0a4637_0%,#0d5e49_52%,#118164_100%)] px-6 py-7 text-white md:px-8 md:py-8">
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute right-6 top-6 hidden h-16 w-16 rounded-full border border-white/10 bg-white/5 blur-[1px] md:block"
                    />

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={13} />
                                Executive Overview
                            </div>

                            <h2 className="mt-4 text-3xl font-extrabold md:text-[44px]">
                                Premium Admin Dashboard
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                Monitor bookings, quotations, payments, revenue, and client event
                                activity through a premium executive interface.
                            </p>
                        </div>

                        <motion.div
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)]"
                        >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                                Business Health
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-white">
                                Stable
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                                <ArrowUpRight size={15} />
                                Strong visibility across active operations
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 md:px-6 xl:grid-cols-4">
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

            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <DashboardCard
                    title="Monthly Revenue Trend"
                    subtitle="Revenue and expenses based on real booking totals."
                    variants={fadeUp}
                >
                    <div className="h-[300px]">
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
                    <div className="h-[300px]">
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
                                        outerRadius={92}
                                        innerRadius={52}
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

            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <DashboardCard
                    title="Booking Trend"
                    subtitle="Number of bookings recorded per month."
                    variants={fadeUp}
                >
                    <div className="h-[300px]">
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
                    <div className="h-[300px]">
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
                                        outerRadius={95}
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
        </motion.div>
    );
}

function DashboardCard({ title, subtitle, children, variants }) {
    return (
        <motion.section
            variants={variants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.22 }}
            className="rounded-[26px] border border-[#dce7e2] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
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
            className="rounded-[24px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm"
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
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${iconStyle}`}
                >
                    <Icon size={22} />
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
            className="rounded-[24px] border border-[#dfe9e4] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 shadow-[0_10px_24px_rgba(14,61,47,0.05)]"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ rotate: -8, scale: 1.06 }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf8f3_0%,#dff1e8_100%)] text-[#0f4d3c] shadow-sm"
                >
                    <Icon size={20} />
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
        <div className="mb-4">
            <h2 className="text-[28px] font-extrabold text-[#0f4d3c]">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
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