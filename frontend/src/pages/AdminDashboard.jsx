import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
    BadgeDollarSign,
    CalendarClock,
    FileClock,
    CheckCircle2,
    TrendingUp,
    BriefcaseBusiness,
    ReceiptText,
    CalendarDays,
    CircleDollarSign,
} from "lucide-react";

const CHART_COLORS = ["#0f4d3c", "#d4af37", "#22b67f", "#ef4444", "#64748b"];

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

function getStoredToken() {
    return localStorage.getItem("token") || localStorage.getItem("clientToken") || "";
}

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (!envUrl) {
        console.warn("VITE_API_URL is missing. Using Railway fallback.");
        return "https://ebitscatering-production.up.railway.app/api";
    }

    const cleaned = envUrl.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

const API_BASE_URL = getApiBaseUrl();

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase();
}

function normalizeNumber(value) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
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

function normalizeQuotation(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        fullName: item.full_name || item.owner_name || "",
        email: item.email || item.owner_email || "",
        packageName: item.package_type || "",
        packageType: item.package_type || "",
        status: item.status || "Pending",
        createdAt: item.created_at || "",
        estimatedTotal: Number(item.estimated_total || 0),
        eventType: item.event_type || "",
        eventDate:
            item.preferred_date ||
            item.event_date ||
            item.preferredDate ||
            "",
        payments: item.payments || item.payment_records || [],
        payment_records: item.payment_records || item.payments || [],
        estimated_total: item.estimated_total || 0,
        total_price: item.total_price || 0,
    };
}

function normalizeBooking(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        clientName: item.client_name || "",
        email: item.client_email || "",
        eventDate: item.event_date || "",
        createdAt: item.created_at || "",
        eventType: item.event_type || "",
        guestCount: Number(item.guests || 0),
        totalAmount: Number(item.total_price || 0),
        status: item.booking_status || "Pending",
        paymentStatus: item.payment_status || "pending",
    };
}

function normalizePayment(item) {
    if (!item || typeof item !== "object") return null;

    return {
        id: item.id,
        amount: Number(item.amount || item.payment_amount || 0),
        status: item.status || item.payment_status || "pending",
        bookingId: item.booking_id || null,
        createdAt: item.created_at || "",
    };
}

function getQuotationPaymentSummary(item) {
    const payments = parseArrayField(item.payments || item.payment_records);

    const totalAmount = normalizeNumber(
        item.estimated_total ||
        item.total_price ||
        item.totalAmount ||
        item.estimatedTotal ||
        0
    );

    const totalPaidRaw = payments.reduce((sum, payment) => {
        return (
            sum +
            normalizeNumber(
                payment?.amount ||
                payment?.paymentAmount ||
                payment?.payment_amount
            )
        );
    }, 0);

    const totalPaid = Math.min(totalPaidRaw, totalAmount);
    const balance = Math.max(totalAmount - totalPaid, 0);

    let paymentStatus = "unpaid";
    if (totalPaid > 0 && balance > 0) paymentStatus = "partial";
    if (totalAmount > 0 && balance <= 0) paymentStatus = "paid";

    return {
        totalAmount,
        totalPaid,
        balance,
        paymentStatus,
    };
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

function AdminDashboard() {
    const token = getStoredToken();

    const [quotations, setQuotations] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const headers = {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                };

                const [quotationRes, bookingRes, paymentRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/quotations`, {
                        method: "GET",
                        credentials: "include",
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/bookings`, {
                        method: "GET",
                        credentials: "include",
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/payments`, {
                        method: "GET",
                        credentials: "include",
                        headers,
                    }).catch(() => null),
                ]);

                const quotationData = await quotationRes.json().catch(() => []);
                const bookingData = await bookingRes.json().catch(() => []);
                const paymentData = paymentRes
                    ? await paymentRes.json().catch(() => [])
                    : [];

                if (!quotationRes.ok) {
                    throw new Error(
                        quotationData?.message || "Failed to fetch quotations."
                    );
                }

                if (!bookingRes.ok) {
                    throw new Error(
                        bookingData?.message || "Failed to fetch bookings."
                    );
                }

                setQuotations(
                    Array.isArray(quotationData)
                        ? quotationData.map(normalizeQuotation).filter(Boolean)
                        : []
                );

                setBookings(
                    Array.isArray(bookingData)
                        ? bookingData.map(normalizeBooking).filter(Boolean)
                        : []
                );

                setPayments(
                    Array.isArray(paymentData)
                        ? paymentData.map(normalizePayment).filter(Boolean)
                        : []
                );
            } catch (error) {
                console.error("Fetch admin dashboard data error:", error);
                setQuotations([]);
                setBookings([]);
                setPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const monthlyRows = useMemo(() => {
        const map = new Map();

        quotations.forEach((quotation) => {
            const date = new Date(quotation.eventDate || quotation.createdAt || "");
            if (Number.isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const label = date.toLocaleDateString("en-PH", {
                month: "short",
                year: "numeric",
            });

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    label,
                    revenue: 0,
                    expenses: 0,
                });
            }

            const summary = getQuotationPaymentSummary(quotation);
            map.get(key).revenue += Number(summary.totalAmount || 0);
        });

        return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
    }, [quotations]);

    const demandForecast = useMemo(() => {
        const counts = {};

        quotations.forEach((quotation) => {
            const type = quotation.eventType || "Other";
            counts[type] = (counts[type] || 0) + 1;
        });

        return Object.entries(counts).map(([type, count]) => ({ type, count }));
    }, [quotations]);

    const stats = useMemo(() => {
        const totalRevenue = quotations.reduce((sum, quotation) => {
            const summary = getQuotationPaymentSummary(quotation);
            return sum + summary.totalAmount;
        }, 0);

        const totalCollected = quotations.reduce((sum, quotation) => {
            const summary = getQuotationPaymentSummary(quotation);
            return sum + summary.totalPaid;
        }, 0);

        const totalBookings = quotations.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = quotations.filter((quotation) => {
            const eventDate = new Date(quotation.eventDate || "");
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

        const confirmedBookings = bookings.filter((item) =>
            ["confirmed", "approved", "paid"].includes(normalizeStatus(item.status))
        ).length;

        const completedEvents = bookings.filter((item) =>
            ["completed", "done"].includes(normalizeStatus(item.status))
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
    }, [bookings, quotations]);

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

        quotations.forEach((quotation) => {
            const date = new Date(quotation.eventDate || quotation.createdAt || "");
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
    }, [quotations]);

    const paymentStatusChartData = useMemo(() => {
        const summary = {
            Paid: 0,
            Partial: 0,
            Unpaid: 0,
        };

        quotations.forEach((quotation) => {
            const paymentSummary = getQuotationPaymentSummary(quotation);
            const status = String(
                paymentSummary.paymentStatus || "unpaid"
            ).toLowerCase();

            if (status === "paid") summary.Paid += 1;
            else if (status === "partial") summary.Partial += 1;
            else summary.Unpaid += 1;
        });

        return [
            { name: "Paid", value: summary.Paid },
            { name: "Partial", value: summary.Partial },
            { name: "Unpaid", value: summary.Unpaid },
        ].filter((item) => item.value > 0);
    }, [quotations]);

    const upcomingEventList = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return [...quotations]
            .filter((quotation) => {
                const eventDate = new Date(quotation.eventDate || "");
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
    }, [quotations]);

    const recentQuotations = useMemo(() => {
        return [...quotations]
            .sort((a, b) => {
                const aTime = new Date(a.createdAt || 0).getTime();
                const bTime = new Date(b.createdAt || 0).getTime();
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

    return (
        <motion.div
            data-build="premium-admin-dashboard-v7-clean"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.1 }}
            className="admin-dashboard space-y-5"
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

                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-8 text-white md:px-8 md:py-10">
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

                    <div className="relative max-w-4xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                            Dashboard Overview
                        </div>

                        <h2 className="mt-4 text-3xl font-extrabold md:text-[44px] md:leading-[1.05]">
                            Admin Dashboard
                        </h2>

                        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                            Monitor bookings, quotations, payments, revenue, and overall
                            catering operations from one organized workspace.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/80">
                            <span className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                                {loading ? "Loading data..." : `${stats.totalBookings} total bookings`}
                            </span>
                            <span className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                                {loading ? "Loading..." : `${stats.upcomingEvents} upcoming events`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 md:px-6 xl:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        subtitle="Quotation-based total booking amounts"
                        icon={Wallet}
                        accent="gold"
                        delay={0.04}
                    />
                    <StatCard
                        title="Total Bookings"
                        value={stats.totalBookings}
                        subtitle="All quotation records in the system"
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
                    subtitle="Revenue and expenses based on real quotation totals."
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
                            {upcomingEventList.map((quotation, index) => (
                                <ListRow
                                    key={quotation.id || `${quotation.fullName}-${index}`}
                                    title={quotation.fullName || "Client Event"}
                                    metaLeft={quotation.eventType || "Event"}
                                    metaRight={formatEventDate(quotation.eventDate)}
                                    status={quotation.status || "Pending"}
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
                                    key={quotation.id || `${quotation.email}-${index}`}
                                    title={
                                        quotation.fullName ||
                                        quotation.email ||
                                        "Quotation Request"
                                    }
                                    metaLeft={
                                        quotation.packageName ||
                                        quotation.packageType ||
                                        "Quotation"
                                    }
                                    metaRight={formatEventDate(quotation.createdAt)}
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
        normalized === "confirmed" ||
            normalized === "approved" ||
            normalized === "completed"
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

export default AdminDashboard;