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
    AreaChart,
    Area,
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
    Crown,
    TrendingUp,
    Activity,
    BriefcaseBusiness,
    ReceiptText,
    CalendarDays,
    CircleDollarSign,
    Target,
    PartyPopper,
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

    const upcomingEventList = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return [...bookings]
            .filter((booking) => {
                const eventDate = new Date(booking.eventDate || "");
                if (Number.isNaN(eventDate.getTime())) return false;
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today;
            })
            .sort((a, b) => {
                const aDate = new Date(a.eventDate || 0).getTime();
                const bDate = new Date(b.eventDate || 0).getTime();
                return aDate - bDate;
            })
            .slice(0, 5);
    }, [bookings]);

    const recentQuotations = useMemo(() => {
        return [...quotations]
            .sort((a, b) => {
                const aTime = new Date(a.createdAt || a.dateCreated || 0).getTime();
                const bTime = new Date(b.createdAt || b.dateCreated || 0).getTime();
                return bTime - aTime;
            })
            .slice(0, 5);
    }, [quotations]);

    const collectionRate = useMemo(() => {
        if (stats.totalRevenue <= 0) return 0;
        return Math.min(
            100,
            Math.round((stats.totalCollected / stats.totalRevenue) * 100)
        );
    }, [stats.totalCollected, stats.totalRevenue]);

    const completionRate = useMemo(() => {
        if (stats.totalBookings <= 0) return 0;
        return Math.round((stats.completedEvents / stats.totalBookings) * 100);
    }, [stats.completedEvents, stats.totalBookings]);

    const confirmationRate = useMemo(() => {
        if (stats.totalBookings <= 0) return 0;
        return Math.round((stats.confirmedBookings / stats.totalBookings) * 100);
    }, [stats.confirmedBookings, stats.totalBookings]);

    return (
        <motion.div
            data-build="premium-admin-dashboard-v5-smooth"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.1 }}
            className="space-y-5"
        >
            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[34px] border border-[#dbe7e2] bg-white shadow-[0_22px_60px_rgba(14,61,47,0.08)]"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-16 right-[-40px] h-52 w-52 rounded-full bg-[#d4af37]/20 blur-3xl" />
                    <div className="absolute bottom-[-36px] left-[-24px] h-40 w-40 rounded-full bg-[#cde6dc]/35 blur-3xl" />
                    <div className="absolute top-1/2 right-1/3 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8 md:py-8">
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute right-6 top-6 hidden h-20 w-20 rounded-full border border-white/10 bg-white/5 blur-[1px] md:block"
                    />

                    <motion.div
                        animate={{ x: ["-30%", "130%"] }}
                        transition={{
                            duration: 7.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "linear",
                        }}
                        className="pointer-events-none absolute inset-y-0 left-[-30%] w-[28%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    />

                    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={13} />
                                Executive Overview
                            </div>

                            <h2 className="mt-4 text-3xl font-extrabold md:text-[46px] md:leading-[1.05]">
                                Premium Admin Dashboard
                            </h2>

                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                Monitor bookings, quotations, payments, revenue, and operational
                                performance through a polished executive workspace designed for
                                presentation, control, and visibility.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <HeroBadge
                                    icon={CircleDollarSign}
                                    label={`Collected ${collectionRate}% of revenue`}
                                />
                                <HeroBadge
                                    icon={Target}
                                    label={`Confirmation rate ${confirmationRate}%`}
                                />
                                <HeroBadge
                                    icon={PartyPopper}
                                    label={`${stats.upcomingEvents} upcoming events`}
                                />
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ y: -3, scale: 1.012 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.12)]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                                        <Crown size={13} className="text-[#f3d57a]" />
                                        Business Health
                                    </div>
                                    <p className="mt-2 text-3xl font-extrabold text-white">
                                        Stable
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                                        <ArrowUpRight size={15} />
                                        Strong visibility across active operations
                                    </div>
                                </div>

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#f5d36a]">
                                    <Activity size={26} />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <ProgressRow
                                    label="Collection Performance"
                                    value={collectionRate}
                                />
                                <ProgressRow
                                    label="Booking Completion"
                                    value={completionRate}
                                />
                                <ProgressRow
                                    label="Booking Confirmation"
                                    value={confirmationRate}
                                />
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
                        delay={0.04}
                    />
                    <StatCard
                        title="Total Bookings"
                        value={stats.totalBookings}
                        subtitle="All booking records in the system"
                        icon={ClipboardList}
                        delay={0.1}
                    />
                    <StatCard
                        title="Upcoming Events"
                        value={stats.upcomingEvents}
                        subtitle="Events scheduled from today onward"
                        icon={CalendarRange}
                        delay={0.16}
                    />
                    <StatCard
                        title="Guests Served"
                        value={stats.totalGuests}
                        subtitle="Combined guest count from bookings"
                        icon={Users}
                        delay={0.22}
                    />
                </div>
            </motion.section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <motion.div variants={fadeUp} transition={{ duration: 0.42, ease: "easeOut" }}>
                    <MiniMetricCard
                        title="Collected Payments"
                        value={formatCurrency(stats.totalCollected)}
                        icon={BadgeDollarSign}
                    />
                </motion.div>

                <motion.div variants={fadeUp} transition={{ duration: 0.42, ease: "easeOut" }}>
                    <MiniMetricCard
                        title="Pending Quotations"
                        value={stats.pendingQuotations}
                        icon={FileClock}
                    />
                </motion.div>

                <motion.div variants={fadeUp} transition={{ duration: 0.42, ease: "easeOut" }}>
                    <MiniMetricCard
                        title="Confirmed Bookings"
                        value={stats.confirmedBookings}
                        icon={CalendarClock}
                    />
                </motion.div>

                <motion.div variants={fadeUp} transition={{ duration: 0.42, ease: "easeOut" }}>
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
                    <div className="h-[310px]">
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
                    <div className="h-[310px]">
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
                    <div className="h-[310px]">
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
                    <div className="h-[310px]">
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
                                        outerRadius={98}
                                        innerRadius={56}
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

            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <DashboardCard
                    title="Revenue Flow Snapshot"
                    subtitle="Visual summary of monthly revenue movement."
                    variants={fadeUp}
                >
                    <div className="h-[300px]">
                        {monthlyRows.length === 0 ? (
                            <EmptyChartState message="No revenue flow data yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyRows}>
                                    <defs>
                                        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0f4d3c" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#0f4d3c" stopOpacity={0.03} />
                                        </linearGradient>
                                    </defs>
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
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue Flow"
                                        stroke="#0f4d3c"
                                        fill="url(#revFill)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Operational Snapshot"
                    subtitle="Quick executive summary of active business metrics."
                    variants={fadeUp}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <InsightTile
                            icon={BriefcaseBusiness}
                            label="Total Operations"
                            value={stats.totalBookings}
                            tone="green"
                        />
                        <InsightTile
                            icon={ReceiptText}
                            label="Quotation Pipeline"
                            value={stats.pendingQuotations}
                            tone="gold"
                        />
                        <InsightTile
                            icon={CalendarDays}
                            label="Upcoming Schedule"
                            value={stats.upcomingEvents}
                            tone="green"
                        />
                        <InsightTile
                            icon={CircleDollarSign}
                            label="Collection Rate"
                            value={`${collectionRate}%`}
                            tone="gold"
                        />
                    </div>
                </DashboardCard>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <DashboardCard
                    title="Upcoming Events"
                    subtitle="Nearest scheduled events from the booking list."
                    variants={fadeUp}
                >
                    {upcomingEventList.length === 0 ? (
                        <EmptyListState message="No upcoming events available yet." />
                    ) : (
                        <div className="space-y-3">
                            {upcomingEventList.map((booking, index) => (
                                <ListRow
                                    key={booking.id || booking._id || `${booking.clientName}-${index}`}
                                    title={booking.clientName || booking.fullName || "Client Event"}
                                    metaLeft={booking.eventType || "Event"}
                                    metaRight={formatEventDate(booking.eventDate)}
                                    status={booking.status || "Pending"}
                                    delay={index * 0.04}
                                />
                            ))}
                        </div>
                    )}
                </DashboardCard>

                <DashboardCard
                    title="Recent Quotations"
                    subtitle="Latest quotation activity recorded in the system."
                    variants={fadeUp}
                >
                    {recentQuotations.length === 0 ? (
                        <EmptyListState message="No quotations available yet." />
                    ) : (
                        <div className="space-y-3">
                            {recentQuotations.map((quotation, index) => (
                                <ListRow
                                    key={quotation.id || quotation._id || `${quotation.email}-${index}`}
                                    title={
                                        quotation.fullName ||
                                        quotation.clientName ||
                                        quotation.email ||
                                        "Quotation Request"
                                    }
                                    metaLeft={quotation.packageName || quotation.packageType || "Quotation"}
                                    metaRight={formatEventDate(
                                        quotation.createdAt || quotation.dateCreated
                                    )}
                                    status={quotation.status || "Pending"}
                                    delay={index * 0.04}
                                />
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </motion.div>
    );
}

function DashboardCard({ title, subtitle, children, variants }) {
    return (
        <motion.section
            variants={variants}
            transition={{ duration: 0.46, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[28px] border border-[#dce7e2] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-[0_12px_30px_rgba(14,61,47,0.06)] transition-shadow hover:shadow-[0_18px_38px_rgba(14,61,47,0.10)]"
        >
            <SectionHeader title={title} subtitle={subtitle} />
            {children}
        </motion.section>
    );
}

function HeroBadge({ icon: Icon, label }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md">
            <Icon size={14} className="text-[#f4d36d]" />
            <span>{label}</span>
        </div>
    );
}

function ProgressRow({ label, value }) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                    {label}
                </p>
                <p className="text-xs font-bold text-white">{value}%</p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,#f6df96_0%,#d4af37_100%)]"
                />
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    accent = "green",
    delay = 0,
}) {
    const iconStyle =
        accent === "gold"
            ? "bg-gradient-to-br from-[#fff8e3] to-[#ffefbf] text-[#b99117]"
            : "bg-gradient-to-br from-[#edf8f3] to-[#dff1e8] text-[#0f4d3c]";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay, ease: "easeOut" }}
            whileHover={{ y: -6, scale: 1.012 }}
            className="group rounded-[24px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm transition hover:shadow-[0_20px_40px_rgba(15,77,60,0.12)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: delay + 0.04, ease: "easeOut" }}
                        className="mt-3 text-3xl font-extrabold text-[#0f4d3c]"
                    >
                        {value}
                    </motion.h3>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{subtitle}</p>
                </div>

                <motion.div
                    whileHover={{ rotate: -6, scale: 1.05 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
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
            whileHover={{ y: -5, scale: 1.012 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-[24px] border border-[#dfe9e4] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 shadow-[0_10px_24px_rgba(14,61,47,0.05)] transition hover:shadow-[0_16px_34px_rgba(15,77,60,0.10)]"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ rotate: -8, scale: 1.05 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
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

function InsightTile({ icon: Icon, label, value, tone = "green" }) {
    const styles =
        tone === "gold"
            ? "border-[#f1e3b0] bg-[linear-gradient(180deg,#fffdf6_0%,#fff8e7_100%)] text-[#9b7510]"
            : "border-[#dfe9e4] bg-[linear-gradient(180deg,#f8fcfa_0%,#f1f8f5_100%)] text-[#0f4d3c]";

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.012 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`rounded-[22px] border p-4 shadow-sm transition ${styles}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                        {label}
                    </p>
                    <h4 className="mt-2 text-3xl font-extrabold">{value}</h4>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
                    <Icon size={20} />
                </div>
            </div>
        </motion.div>
    );
}

function ListRow({ title, metaLeft, metaRight, status, delay = 0 }) {
    const normalized = normalizeStatus(status);
    const statusClass =
        normalized === "confirmed" || normalized === "approved" || normalized === "completed"
            ? "bg-[#ecf8f2] text-[#0f7a51]"
            : normalized === "pending"
                ? "bg-[#fff8e8] text-[#b07d12]"
                : "bg-[#f1f5f9] text-[#64748b]";

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="flex flex-col gap-3 rounded-[22px] border border-[#e4ece8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="min-w-0">
                <h4 className="truncate text-base font-bold text-[#0f4d3c]">{title}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span>{metaLeft}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{metaRight}</span>
                </div>
            </div>

            <div
                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${statusClass}`}
            >
                {String(status || "Pending")}
            </div>
        </motion.div>
    );
}

function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e7efea] bg-[#f8fbf9] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a8f88]">
                <TrendingUp size={12} />
                Insights
            </div>
            <h2 className="text-[26px] font-extrabold text-[#0f4d3c] sm:text-[28px]">
                {title}
            </h2>
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

function EmptyListState({ message }) {
    return (
        <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-[#dce7e2] bg-[#f8fbf9] p-6 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}

function formatEventDate(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "No date available";

    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default AdminDashboard;