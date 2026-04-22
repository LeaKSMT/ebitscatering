import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getAllPayments,
    getAllExpenses,
    getBookingPaymentSummary,
    formatCurrency,
    formatDate,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";
import {
    Wallet,
    BadgeDollarSign,
    ReceiptText,
    Landmark,
    Sparkles,
    TrendingUp,
    CircleDollarSign,
    BriefcaseBusiness,
    CalendarRange,
    BarChart3,
    FileSpreadsheet,
    PlusCircle,
    CheckCircle2,
} from "lucide-react";

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.04,
        },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

function safeParse(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
}

function normalizeStatus(status = "") {
    return String(status || "").trim().toLowerCase();
}

function isApprovedLikeStatus(status = "") {
    return ["approved", "confirmed", "paid", "upcoming", "ongoing"].includes(
        normalizeStatus(status)
    );
}

function getAllLocalStorageArraysByPrefixes(prefixes = []) {
    const collected = [];

    try {
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (!key) continue;

            const matched = prefixes.some(
                (prefix) => key === prefix || key.startsWith(`${prefix}_`)
            );

            if (!matched) continue;

            try {
                const parsed = JSON.parse(localStorage.getItem(key) || "[]");
                if (Array.isArray(parsed)) {
                    collected.push(...parsed);
                }
            } catch {
                continue;
            }
        }
    } catch {
        return [];
    }

    return collected;
}

function normalizeBookingRecord(item, index = 0) {
    if (!item || typeof item !== "object") return null;

    const bookingId =
        item.bookingId ||
        item.booking_id ||
        item.id ||
        item.quotationId ||
        item.quotation_id ||
        `booking_${index + 1}`;

    const totalAmount = Number(
        item.totalAmount ??
        item.total_price ??
        item.estimatedTotal ??
        item.estimated_total ??
        item.packagePrice ??
        item.package_price ??
        0
    );

    return {
        id: item.id || bookingId,
        bookingId: String(bookingId),
        fullName:
            item.fullName ||
            item.full_name ||
            item.clientName ||
            item.client_name ||
            item.owner_name ||
            item.name ||
            "Client",
        eventType:
            item.eventType ||
            item.event_type ||
            item.type ||
            "Event",
        totalAmount,
        date:
            item.date ||
            item.eventDate ||
            item.event_date ||
            item.preferred_date ||
            item.preferredDate ||
            "",
        status:
            item.status ||
            item.booking_status ||
            item.paymentStatus ||
            item.payment_status ||
            "Pending",
        createdAt: item.createdAt || item.created_at || "",
    };
}

function getFallbackBookings() {
    const directBookingKeys = [
        "adminManualBookings",
        "clientBookings",
        "bookings",
        "adminBookings",
        "approvedBookings",
    ];

    const directQuotationKeys = [
        "clientQuotations",
        "quotations",
        "adminQuotations",
    ];

    const directBookings = directBookingKeys.flatMap((key) => safeParse(key));
    const scopedBookings = getAllLocalStorageArraysByPrefixes([
        "clientBookings",
        "adminBookings",
        "approvedBookings",
        "bookings",
    ]);

    const directQuotations = directQuotationKeys.flatMap((key) => safeParse(key));
    const scopedQuotations = getAllLocalStorageArraysByPrefixes([
        "clientQuotations",
        "adminQuotations",
        "quotations",
    ]);

    const approvedQuotations = [...directQuotations, ...scopedQuotations]
        .filter((item) => isApprovedLikeStatus(item.status))
        .map((item, index) =>
            normalizeBookingRecord(
                {
                    id:
                        item.id ||
                        item.quotationId ||
                        item.quotation_id ||
                        item.bookingId ||
                        `Q${index + 1}`,
                    bookingId:
                        item.bookingId ||
                        item.quotationId ||
                        item.quotation_id ||
                        item.id ||
                        `Q${index + 1}`,
                    fullName:
                        item.fullName ||
                        item.full_name ||
                        item.clientName ||
                        item.client_name ||
                        item.owner_name ||
                        item.name,
                    eventType:
                        item.eventType ||
                        item.event_type ||
                        item.type,
                    totalAmount:
                        item.totalAmount ||
                        item.total_price ||
                        item.estimatedTotal ||
                        item.estimated_total ||
                        item.packagePrice ||
                        item.package_price ||
                        0,
                    date:
                        item.date ||
                        item.eventDate ||
                        item.event_date ||
                        item.preferred_date ||
                        item.preferredDate,
                    status: item.status,
                    createdAt: item.createdAt || item.created_at,
                },
                index
            )
        )
        .filter(Boolean);

    const merged = [...directBookings, ...scopedBookings, ...approvedQuotations]
        .map((item, index) => normalizeBookingRecord(item, index))
        .filter(Boolean);

    const map = new Map();

    merged.forEach((item) => {
        const key = String(item.bookingId || item.id);
        if (!map.has(key)) {
            map.set(key, item);
        }
    });

    return Array.from(map.values()).filter((item) =>
        isApprovedLikeStatus(item.status)
    );
}

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (!envUrl) {
        return "https://ebitscatering-production.up.railway.app/api";
    }

    const cleaned = envUrl.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

function getStoredToken() {
    return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("clientToken") ||
        localStorage.getItem("token") ||
        ""
    );
}

function useAdminTheme() {
    const getTheme = () => {
        if (typeof document === "undefined") return "light";
        return document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
    };

    const [theme, setTheme] = useState(getTheme);

    useEffect(() => {
        if (typeof document === "undefined") return;

        const observer = new MutationObserver(() => {
            setTheme(getTheme());
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        setTheme(getTheme());

        return () => observer.disconnect();
    }, []);

    return theme;
}

function HeaderMiniCard({ icon: Icon, label, value }) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        {label}
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}

function SummaryCard({ icon: Icon, title, value, subtitle, isDark }) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className={`rounded-[24px] border p-5 ${isDark
                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(7,25,19,0.96)_0%,rgba(10,31,24,0.96)_100%)] shadow-[0_14px_36px_rgba(0,0,0,0.22)]"
                    : "border-[#dce7e2] bg-white shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className={`text-sm ${isDark ? "text-[#b7cbc3]" : "text-slate-500"}`}>
                        {title}
                    </p>
                    <h2
                        className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                            }`}
                    >
                        {value}
                    </h2>
                    <p
                        className={`mt-2 text-xs ${isDark ? "text-white/35" : "text-slate-400"
                            }`}
                    >
                        {subtitle}
                    </p>
                </div>

                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark
                            ? "border border-[#22c58b]/18 bg-[linear-gradient(135deg,rgba(16,96,69,0.45)_0%,rgba(22,146,102,0.24)_100%)] text-[#98efcc]"
                            : "bg-[linear-gradient(135deg,#edf8f3_0%,#dff1e8_100%)] text-[#0f4d3c]"
                        }`}
                >
                    <Icon size={22} />
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ title, description, isDark }) {
    return (
        <div
            className={`rounded-[24px] border border-dashed px-6 py-12 text-center ${isDark
                    ? "border-white/10 bg-[rgba(255,255,255,0.02)]"
                    : "border-[#d9e5e0] bg-[#fbfdfc]"
                }`}
        >
            <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-white/10 text-[#98efcc]" : "bg-[#edf8f3] text-[#0f4d3c]"
                    }`}
            >
                <CircleDollarSign className="h-8 w-8" />
            </div>
            <h3
                className={`mt-4 text-2xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                    }`}
            >
                {title}
            </h3>
            <p
                className={`mx-auto mt-2 max-w-2xl text-sm leading-7 ${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                    }`}
            >
                {description}
            </p>
        </div>
    );
}

function AdminFinancialManagement() {
    const theme = useAdminTheme();
    const isDark = theme === "dark";

    const [refreshKey, setRefreshKey] = useState(0);
    const [apiBookings, setApiBookings] = useState([]);
    const [expenseForm, setExpenseForm] = useState({
        bookingId: "",
        clientName: "",
        eventType: "",
        category: "",
        amount: "",
    });
    const [popup, setPopup] = useState({
        open: false,
        title: "",
        message: "",
    });

    const API_BASE_URL = getApiBaseUrl();
    const token = getStoredToken();

    useEffect(() => {
        const refreshData = () => setRefreshKey((prev) => prev + 1);

        window.addEventListener("storage", refreshData);
        window.addEventListener("focus", refreshData);
        document.addEventListener("visibilitychange", refreshData);

        return () => {
            window.removeEventListener("storage", refreshData);
            window.removeEventListener("focus", refreshData);
            document.removeEventListener("visibilitychange", refreshData);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchBookings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/bookings`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json().catch(() => []);

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to fetch bookings.");
                }

                const normalized = Array.isArray(data)
                    ? data
                        .map((item, index) => normalizeBookingRecord(item, index))
                        .filter(Boolean)
                    : [];

                if (isMounted) {
                    setApiBookings(normalized);
                }
            } catch (error) {
                console.error("Financial bookings fetch error:", error);
                if (isMounted) {
                    setApiBookings([]);
                }
            }
        };

        fetchBookings();

        return () => {
            isMounted = false;
        };
    }, [API_BASE_URL, token, refreshKey]);

    const bookings = useMemo(() => {
        const fallback = getFallbackBookings();
        const map = new Map();

        [...apiBookings, ...fallback].forEach((item) => {
            const normalized = normalizeBookingRecord(item);
            if (!normalized) return;

            const key = String(normalized.bookingId || normalized.id);
            const existing = map.get(key);

            if (!existing) {
                map.set(key, normalized);
                return;
            }

            const existingApproved = isApprovedLikeStatus(existing.status);
            const currentApproved = isApprovedLikeStatus(normalized.status);

            if (!existingApproved && currentApproved) {
                map.set(key, normalized);
                return;
            }

            const existingAmount = Number(existing.totalAmount || 0);
            const currentAmount = Number(normalized.totalAmount || 0);

            if (currentAmount > existingAmount) {
                map.set(key, normalized);
                return;
            }

            const existingCreated = new Date(
                existing.createdAt || existing.date || 0
            ).getTime();
            const currentCreated = new Date(
                normalized.createdAt || normalized.date || 0
            ).getTime();

            if (currentCreated > existingCreated) {
                map.set(key, normalized);
            }
        });

        return Array.from(map.values()).filter((item) =>
            isApprovedLikeStatus(item.status)
        );
    }, [apiBookings, refreshKey]);

    const payments = useMemo(() => getAllPayments(), [refreshKey]);
    const expenses = useMemo(() => getAllExpenses(), [refreshKey]);

    const financialRows = useMemo(() => {
        return bookings.map((booking) => {
            const paymentSummary = getBookingPaymentSummary(booking);
            const bookingExpenses = expenses.filter(
                (expense) =>
                    String(expense.bookingId || "") === String(booking.bookingId || "")
            );

            const totalExpenses = bookingExpenses.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );

            const revenue = Number(booking.totalAmount || 0);
            const profit = revenue - totalExpenses;
            const margin =
                revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0.0";

            return {
                ...booking,
                paid: Number(paymentSummary?.paid || 0),
                balance: Number(paymentSummary?.balance || 0),
                paymentStatus: paymentSummary?.paymentStatus || "Unpaid",
                totalExpenses,
                profit,
                margin,
            };
        });
    }, [bookings, expenses]);

    const summary = useMemo(() => {
        const totalRevenue = financialRows.reduce(
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

        const netProfit = totalRevenue - totalExpenses;

        return {
            totalRevenue,
            totalCollected,
            totalExpenses,
            netProfit,
        };
    }, [financialRows, payments, expenses]);

    const monthlyRows = useMemo(() => {
        const monthsMap = new Map();

        bookings.forEach((booking) => {
            const rawDate = booking.date || booking.createdAt;
            const date = new Date(rawDate);
            if (Number.isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const label = date.toLocaleDateString("en-PH", {
                month: "short",
                year: "numeric",
            });

            if (!monthsMap.has(key)) {
                monthsMap.set(key, { label, revenue: 0, expenses: 0 });
            }

            monthsMap.get(key).revenue += Number(booking.totalAmount || 0);
        });

        expenses.forEach((expense) => {
            const date = new Date(expense.createdAt);
            if (Number.isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const label = date.toLocaleDateString("en-PH", {
                month: "short",
                year: "numeric",
            });

            if (!monthsMap.has(key)) {
                monthsMap.set(key, { label, revenue: 0, expenses: 0 });
            }

            monthsMap.get(key).expenses += Number(expense.amount || 0);
        });

        return [...monthsMap.values()].map((row) => {
            const profit = row.revenue - row.expenses;
            const margin = row.revenue > 0 ? (profit / row.revenue) * 100 : 0;

            return {
                ...row,
                profit,
                margin,
            };
        });
    }, [bookings, expenses]);

    const demandForecast = useMemo(() => {
        const total = bookings.length;
        const eventTypes = ["Birthday", "Wedding", "Debut", "Baptismal", "Anniversary"];

        return eventTypes.map((type) => {
            const count = bookings.filter((item) => item.eventType === type).length;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return { type, count, percent };
        });
    }, [bookings]);

    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        setExpenseForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBookingSelect = (e) => {
        const selectedId = e.target.value;
        const booking = bookings.find(
            (item) => String(item.bookingId) === String(selectedId)
        );

        if (!booking) {
            setExpenseForm((prev) => ({
                ...prev,
                bookingId: selectedId,
                clientName: "",
                eventType: "",
            }));
            return;
        }

        setExpenseForm((prev) => ({
            ...prev,
            bookingId: selectedId,
            clientName: booking.fullName || "",
            eventType: booking.eventType || "",
        }));
    };

    const handleAddExpense = (e) => {
        e.preventDefault();

        const existing = JSON.parse(localStorage.getItem("adminExpenses") || "[]");
        const newExpense = {
            id: `expense_${Date.now()}`,
            bookingId: expenseForm.bookingId,
            clientName: expenseForm.clientName,
            eventType: expenseForm.eventType,
            category: expenseForm.category,
            amount: Number(expenseForm.amount || 0),
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
            "adminExpenses",
            JSON.stringify([newExpense, ...existing])
        );

        setExpenseForm({
            bookingId: "",
            clientName: "",
            eventType: "",
            category: "",
            amount: "",
        });

        setRefreshKey((prev) => prev + 1);
        setPopup({
            open: true,
            title: "Expense Saved",
            message: "The expense entry has been added successfully.",
        });
    };

    const handlePrintFinancialSummary = () => {
        const table = buildPrintableTable(
            [
                "Booking ID",
                "Client",
                "Event Type",
                "Revenue",
                "Collected",
                "Expenses",
                "Profit",
                "Margin",
            ],
            financialRows.map((row) => [
                row.bookingId,
                row.fullName,
                row.eventType,
                formatCurrency(row.totalAmount),
                formatCurrency(row.paid),
                formatCurrency(row.totalExpenses),
                formatCurrency(row.profit),
                `${row.margin}%`,
            ])
        );

        openPrintWindow({
            title: "Financial Management Report",
            subtitle: "Revenue, expenses, and profitability overview",
            summaryCards: [
                { label: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
                { label: "Collected", value: formatCurrency(summary.totalCollected) },
                { label: "Expenses", value: formatCurrency(summary.totalExpenses) },
                { label: "Net Profit", value: formatCurrency(summary.netProfit) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Profit Analysis Per Event</h2>
                    ${table}
                </div>
            `,
        });
    };

    const sectionCardClass = isDark
        ? "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,25,19,0.96)_0%,rgba(10,31,24,0.96)_100%)] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.22)]"
        : "rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]";

    const tableHeadClass = isDark
        ? "border-b border-white/10 text-left text-[#b7cbc3]"
        : "border-b border-[#e8efeb] text-left text-slate-500";

    const tableRowClass = isDark
        ? "border-b border-white/10 transition hover:bg-white/[0.03]"
        : "border-b border-[#f1f5f3] transition hover:bg-[#fbfdfc]";

    const inputClass = isDark
        ? "w-full rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
        : "w-full rounded-2xl border border-gray-300 px-4 py-3 text-[#0f4d3c] outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20";

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <motion.section
                variants={fadeUp}
                className={`overflow-hidden rounded-[30px] border ${isDark
                        ? "border-white/10 bg-[linear-gradient(180deg,rgba(7,25,19,0.96)_0%,rgba(10,31,24,0.96)_100%)] shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
                        : "border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
                    }`}
            >
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8">
                    <div className="pointer-events-none absolute inset-0">
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.26, 0.18] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.16, 0.1] }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.4,
                            }}
                            className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl"
                        />
                    </div>

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                                <Sparkles size={13} />
                                Executive View
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                                Financial Management
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                Track revenue, collections, expenses, profitability, and
                                financial performance in one premium management workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px]">
                            <HeaderMiniCard
                                icon={TrendingUp}
                                label="Financial Health"
                                value={summary.netProfit >= 0 ? "Stable" : "Needs Attention"}
                            />
                            <HeaderMiniCard
                                icon={FileSpreadsheet}
                                label="Records"
                                value={`${financialRows.length} Event${financialRows.length === 1 ? "" : "s"
                                    }`}
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
                <SummaryCard
                    icon={Wallet}
                    title="Total Revenue"
                    value={formatCurrency(summary.totalRevenue)}
                    subtitle="Based on booking totals"
                    isDark={isDark}
                />
                <SummaryCard
                    icon={BadgeDollarSign}
                    title="Total Collected"
                    value={formatCurrency(summary.totalCollected)}
                    subtitle="Based on recorded payments"
                    isDark={isDark}
                />
                <SummaryCard
                    icon={ReceiptText}
                    title="Total Expenses"
                    value={formatCurrency(summary.totalExpenses)}
                    subtitle="Admin-recorded expenses"
                    isDark={isDark}
                />
                <SummaryCard
                    icon={Landmark}
                    title="Net Profit"
                    value={formatCurrency(summary.netProfit)}
                    subtitle="Revenue minus expenses"
                    isDark={isDark}
                />
            </motion.section>

            <motion.section variants={fadeUp} className={sectionCardClass}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p
                            className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? "text-[#f5cf67]" : "text-[#b99117]"
                                }`}
                        >
                            Financial Overview
                        </p>
                        <h2
                            className={`mt-1 text-2xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                }`}
                        >
                            Revenue and Profit Snapshot
                        </h2>
                        <p
                            className={`mt-2 text-sm ${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                                }`}
                        >
                            Real-time financial summary based on your current booking,
                            payment, and expense records.
                        </p>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.985 }}
                        onClick={handlePrintFinancialSummary}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#09382d]"
                    >
                        <FileSpreadsheet size={18} />
                        Generate PDF Report
                    </motion.button>
                </div>
            </motion.section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <motion.div variants={fadeUp} className={sectionCardClass}>
                    <div className="mb-5 flex items-center gap-3">
                        <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark
                                    ? "border border-[#22c58b]/18 bg-[linear-gradient(135deg,rgba(16,96,69,0.45)_0%,rgba(22,146,102,0.24)_100%)] text-[#98efcc]"
                                    : "bg-[#edf8f3] text-[#0f4d3c]"
                                }`}
                        >
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2
                                className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                    }`}
                            >
                                Profit Analysis Per Event
                            </h2>
                            <p
                                className={`text-sm ${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                                    }`}
                            >
                                Revenue, expenses, collections, and computed margin per booking
                            </p>
                        </div>
                    </div>

                    {financialRows.length === 0 ? (
                        <EmptyState
                            title="No financial records yet"
                            description="Approved bookings and recorded expenses will appear here once your financial data becomes available."
                            isDark={isDark}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-sm">
                                <thead>
                                    <tr className={tableHeadClass}>
                                        <th className="py-3 font-semibold">Booking ID</th>
                                        <th className="py-3 font-semibold">Client</th>
                                        <th className="py-3 font-semibold">Event</th>
                                        <th className="py-3 font-semibold">Revenue</th>
                                        <th className="py-3 font-semibold">Collected</th>
                                        <th className="py-3 font-semibold">Expenses</th>
                                        <th className="py-3 font-semibold">Profit</th>
                                        <th className="py-3 font-semibold">Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financialRows.map((row) => (
                                        <motion.tr
                                            key={row.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={tableRowClass}
                                        >
                                            <td
                                                className={`py-4 font-bold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                                    }`}
                                            >
                                                {row.bookingId}
                                            </td>
                                            <td
                                                className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                    }`}
                                            >
                                                {row.fullName}
                                            </td>
                                            <td
                                                className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                    }`}
                                            >
                                                {row.eventType}
                                            </td>
                                            <td
                                                className={`py-4 font-bold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                                    }`}
                                            >
                                                {formatCurrency(row.totalAmount)}
                                            </td>
                                            <td className="py-4 font-bold text-emerald-400">
                                                {formatCurrency(row.paid)}
                                            </td>
                                            <td
                                                className={`py-4 font-bold ${isDark ? "text-[#f5cf67]" : "text-[#c79f23]"
                                                    }`}
                                            >
                                                {formatCurrency(row.totalExpenses)}
                                            </td>
                                            <td className="py-4 font-bold text-[#22c58b]">
                                                {formatCurrency(row.profit)}
                                            </td>
                                            <td className="py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark
                                                            ? "border border-[#d4af37]/18 bg-[rgba(133,102,26,0.24)] text-[#f5cf67]"
                                                            : "bg-[#fff8e6] text-[#b99117]"
                                                        }`}
                                                >
                                                    {row.margin}%
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                <div className="space-y-6">
                    <motion.div variants={fadeUp} className={sectionCardClass}>
                        <div className="mb-5 flex items-center gap-3">
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark
                                        ? "border border-[#d4af37]/18 bg-[rgba(133,102,26,0.24)] text-[#f5cf67]"
                                        : "bg-[#fff7e3] text-[#b99117]"
                                    }`}
                            >
                                <PlusCircle size={20} />
                            </div>
                            <div>
                                <h2
                                    className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                        }`}
                                >
                                    Add Expense
                                </h2>
                                <p
                                    className={`text-sm ${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                                        }`}
                                >
                                    Record operational or event-based expenses
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label
                                    className={`mb-2 block text-sm font-semibold ${isDark ? "text-[#dce9e4]" : "text-[#0f4d3c]"
                                        }`}
                                >
                                    Booking ID
                                </label>
                                <select
                                    value={expenseForm.bookingId}
                                    onChange={handleBookingSelect}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">
                                        {bookings.length === 0
                                            ? "No approved bookings found"
                                            : "Select booking"}
                                    </option>
                                    {bookings.map((booking) => (
                                        <option key={booking.id} value={booking.bookingId}>
                                            {booking.bookingId} — {booking.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    className={`mb-2 block text-sm font-semibold ${isDark ? "text-[#dce9e4]" : "text-[#0f4d3c]"
                                        }`}
                                >
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={expenseForm.clientName}
                                    onChange={handleExpenseChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    className={`mb-2 block text-sm font-semibold ${isDark ? "text-[#dce9e4]" : "text-[#0f4d3c]"
                                        }`}
                                >
                                    Event Type
                                </label>
                                <input
                                    type="text"
                                    name="eventType"
                                    value={expenseForm.eventType}
                                    onChange={handleExpenseChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    className={`mb-2 block text-sm font-semibold ${isDark ? "text-[#dce9e4]" : "text-[#0f4d3c]"
                                        }`}
                                >
                                    Expense Category
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={expenseForm.category}
                                    onChange={handleExpenseChange}
                                    placeholder="Food, transportation, decoration, etc."
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    className={`mb-2 block text-sm font-semibold ${isDark ? "text-[#dce9e4]" : "text-[#0f4d3c]"
                                        }`}
                                >
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="amount"
                                    value={expenseForm.amount}
                                    onChange={handleExpenseChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.985 }}
                                type="submit"
                                className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                            >
                                Save Expense
                            </motion.button>
                        </form>
                    </motion.div>

                    <motion.div variants={fadeUp} className={sectionCardClass}>
                        <div className="mb-5 flex items-center gap-3">
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark
                                        ? "border border-[#22c58b]/18 bg-[linear-gradient(135deg,rgba(16,96,69,0.45)_0%,rgba(22,146,102,0.24)_100%)] text-[#98efcc]"
                                        : "bg-[#edf8f3] text-[#0f4d3c]"
                                    }`}
                            >
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h2
                                    className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                        }`}
                                >
                                    Demand Forecast
                                </h2>
                                <p
                                    className={`text-sm ${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                                        }`}
                                >
                                    Event demand based on current booking distribution
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {demandForecast.map((item, index) => (
                                <motion.div
                                    key={item.type}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span
                                            className={`font-semibold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                                }`}
                                        >
                                            {item.type}
                                        </span>
                                        <span
                                            className={`${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                                                }`}
                                        >
                                            {item.count} booking(s) • {item.percent}%
                                        </span>
                                    </div>

                                    <div
                                        className={`h-3 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-[#edf2ef]"
                                            }`}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percent}%` }}
                                            transition={{
                                                duration: 0.9,
                                                ease: [0.22, 1, 0.36, 1],
                                                delay: index * 0.05,
                                            }}
                                            className="h-full rounded-full bg-[linear-gradient(90deg,#0f4d3c_0%,#22b67f_100%)]"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <motion.section variants={fadeUp} className={sectionCardClass}>
                <div className="mb-5 flex items-center gap-3">
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark
                                ? "border border-[#22c58b]/18 bg-[linear-gradient(135deg,rgba(16,96,69,0.45)_0%,rgba(22,146,102,0.24)_100%)] text-[#98efcc]"
                                : "bg-[#edf8f3] text-[#0f4d3c]"
                            }`}
                    >
                        <CalendarRange size={20} />
                    </div>
                    <div>
                        <h2
                            className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                }`}
                        >
                            Monthly Financial Summary
                        </h2>
                        <p
                            className={`text-sm ${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                                }`}
                        >
                            Revenue, expenses, profit, and monthly margin overview
                        </p>
                    </div>
                </div>

                {monthlyRows.length === 0 ? (
                    <EmptyState
                        title="No monthly data yet"
                        description="Monthly financial summaries will appear here as soon as the system has enough revenue and expense records."
                        isDark={isDark}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className={tableHeadClass}>
                                    <th className="py-3 font-semibold">Month</th>
                                    <th className="py-3 font-semibold">Revenue</th>
                                    <th className="py-3 font-semibold">Expenses</th>
                                    <th className="py-3 font-semibold">Profit</th>
                                    <th className="py-3 font-semibold">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyRows.map((row) => (
                                    <motion.tr
                                        key={row.label}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={tableRowClass}
                                    >
                                        <td
                                            className={`py-4 font-bold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                                }`}
                                        >
                                            {row.label}
                                        </td>
                                        <td
                                            className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                }`}
                                        >
                                            {formatCurrency(row.revenue)}
                                        </td>
                                        <td
                                            className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                }`}
                                        >
                                            {formatCurrency(row.expenses)}
                                        </td>
                                        <td className="py-4 font-semibold text-[#22c58b]">
                                            {formatCurrency(row.profit)}
                                        </td>
                                        <td className="py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark
                                                        ? "border border-[#22c58b]/18 bg-[rgba(16,131,94,0.24)] text-[#98efcc]"
                                                        : "bg-[#ecfdf5] text-[#0f766e]"
                                                    }`}
                                            >
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

            <motion.section variants={fadeUp} className={sectionCardClass}>
                <div className="mb-5 flex items-center gap-3">
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark
                                ? "border border-[#d4af37]/18 bg-[rgba(133,102,26,0.24)] text-[#f5cf67]"
                                : "bg-[#fff7e3] text-[#b99117]"
                            }`}
                    >
                        <BriefcaseBusiness size={20} />
                    </div>
                    <div>
                        <h2
                            className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                }`}
                        >
                            Recent Expenses
                        </h2>
                        <p
                            className={`text-sm ${isDark ? "text-[#b7cbc3]" : "text-slate-500"
                                }`}
                        >
                            Latest admin-recorded operating and event expenses
                        </p>
                    </div>
                </div>

                {expenses.length === 0 ? (
                    <EmptyState
                        title="No expense records yet"
                        description="Recorded expenses will appear here once you start adding expense entries from the form."
                        isDark={isDark}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-sm">
                            <thead>
                                <tr className={tableHeadClass}>
                                    <th className="py-3 font-semibold">Booking ID</th>
                                    <th className="py-3 font-semibold">Client</th>
                                    <th className="py-3 font-semibold">Event Type</th>
                                    <th className="py-3 font-semibold">Category</th>
                                    <th className="py-3 font-semibold">Amount</th>
                                    <th className="py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {expenses.map((expense) => (
                                        <motion.tr
                                            layout
                                            key={expense.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.26 }}
                                            className={tableRowClass}
                                        >
                                            <td
                                                className={`py-4 font-bold ${isDark ? "text-white" : "text-[#0f4d3c]"
                                                    }`}
                                            >
                                                {expense.bookingId || "—"}
                                            </td>
                                            <td
                                                className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                    }`}
                                            >
                                                {expense.clientName || "—"}
                                            </td>
                                            <td
                                                className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                    }`}
                                            >
                                                {expense.eventType || "—"}
                                            </td>
                                            <td
                                                className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                    }`}
                                            >
                                                {expense.category || "—"}
                                            </td>
                                            <td
                                                className={`py-4 font-bold ${isDark ? "text-[#f5cf67]" : "text-[#b99117]"
                                                    }`}
                                            >
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td
                                                className={`py-4 ${isDark ? "text-[#dce9e4]" : "text-slate-700"
                                                    }`}
                                            >
                                                {formatDate(expense.createdAt)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.section>

            <AnimatePresence>
                {popup.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[3px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className={`w-full max-w-md overflow-hidden rounded-[28px] border shadow-[0_25px_60px_rgba(0,0,0,0.2)] ${isDark
                                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(10,33,27,0.99)_0%,rgba(13,40,32,0.99)_100%)]"
                                    : "border-gray-100 bg-white"
                                }`}
                        >
                            <div className="bg-[linear-gradient(135deg,#0f4d3c_0%,#137255_100%)] px-6 py-5 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                                        <CheckCircle2 size={30} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                                            System Update
                                        </p>
                                        <h3 className="mt-1 text-2xl font-extrabold">
                                            {popup.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-6">
                                <p
                                    className={`text-[15px] leading-7 ${isDark ? "text-[#dce9e4]" : "text-gray-600"
                                        }`}
                                >
                                    {popup.message}
                                </p>

                                <motion.button
                                    whileTap={{ scale: 0.985 }}
                                    onClick={() =>
                                        setPopup({ open: false, title: "", message: "" })
                                    }
                                    className="mt-6 w-full rounded-2xl bg-[#0f4d3c] px-5 py-3.5 font-bold text-white transition hover:bg-[#0c3f31]"
                                >
                                    Okay
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default AdminFinancialManagement;