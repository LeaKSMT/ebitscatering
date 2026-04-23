import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    Mail,
    Phone,
    CalendarDays,
    FileText,
    MessageSquareQuote,
    Printer,
    UserRound,
    ChevronRight,
    BadgeCheck,
    LoaderCircle,
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
        minimumFractionDigits: 2,
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
        0
    );
}

function mapQuotationRecord(item) {
    const status = normalizeStatus(item.status || "pending");

    const fullName = item.fullName || item.clientName || item.name || "Client";
    const email = item.email || item.clientEmail || item.ownerEmail || "";
    const contactNumber = item.contactNumber || item.phone || item.mobile || "";
    const eventType = item.eventType || item.packageType || item.package_name || "Event";
    const preferredDate =
        item.preferredDate ||
        item.eventDate ||
        item.bookingDate ||
        item.date ||
        "";
    const guests = normalizeNumber(item.guests || item.guestCount || item.pax || 0);
    const estimatedTotal = getTotalAmount(item);
    const packageName = item.packageName || item.packageType || item.package_name || "";

    const inquiries = parseArrayField(item.inquiries);
    const payments = parseArrayField(item.payments);
    const assignedStaff = parseArrayField(item.assignedStaff);

    return {
        ...item,
        status,
        fullName,
        email,
        ownerEmail: item.ownerEmail || email,
        contactNumber,
        eventType,
        preferredDate,
        eventDate: item.eventDate || preferredDate,
        guests,
        guestCount: normalizeNumber(item.guestCount || guests),
        estimatedTotal,
        totalAmount: estimatedTotal,
        packageName,
        quotationId: getQuotationId(item),
        bookingId: getBookingId(item),
        venue: item.venue || item.location || item.address || "",
        inquiries,
        payments,
        assignedStaff,
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

function getClientKey(item) {
    return (
        String(item.ownerEmail || item.email || "").trim().toLowerCase() ||
        `${String(item.fullName || "client").trim().toLowerCase()}_${String(
            item.contactNumber || ""
        ).trim()}`
    );
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

function AdminClients() {
    const [theme, setTheme] = useState(getCurrentTheme);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
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

        async function loadClients() {
            setLoading(true);
            try {
                const data = await quotationService.getQuotations();
                const mapped = Array.isArray(data) ? data.map(mapQuotationRecord) : [];

                if (isMounted) {
                    setRecords(mapped);
                }
            } catch (error) {
                console.error("Failed to load client records:", error);
                if (isMounted) {
                    setRecords([]);
                    alert(error.message || "Failed to load client records.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadClients();

        return () => {
            isMounted = false;
        };
    }, []);

    const clients = useMemo(() => {
        const map = new Map();

        records.forEach((record) => {
            const key = getClientKey(record);

            if (!map.has(key)) {
                map.set(key, {
                    clientKey: key,
                    fullName: record.fullName || "Client",
                    email: record.email || record.ownerEmail || "",
                    contactNumber: record.contactNumber || "",
                    bookings: [],
                    quotations: [],
                    inquiries: [],
                });
            }

            const client = map.get(key);

            if (!client.email && (record.email || record.ownerEmail)) {
                client.email = record.email || record.ownerEmail || "";
            }

            if (!client.contactNumber && record.contactNumber) {
                client.contactNumber = record.contactNumber;
            }

            client.quotations.push({
                id: record.id,
                quotationId: record.quotationId,
                eventType: record.eventType,
                preferredDate: record.preferredDate,
                guests: record.guests,
                packageName: record.packageName,
                estimatedTotal: record.estimatedTotal,
                status: record.status,
            });

            if (record.isBookingLike) {
                client.bookings.push({
                    id: record.id,
                    bookingId: record.bookingId,
                    eventType: record.eventType,
                    eventDate: record.eventDate,
                    guestCount: record.guestCount,
                    venue: record.venue,
                    totalAmount: record.totalAmount,
                    status: record.status,
                });
            }

            if (Array.isArray(record.inquiries) && record.inquiries.length > 0) {
                record.inquiries.forEach((inq, index) => {
                    client.inquiries.push({
                        id: inq.id || `${record.id}_inq_${index}`,
                        inquiryId:
                            inq.inquiryId ||
                            inq.referenceNumber ||
                            `INQ-${record.id}-${index + 1}`,
                        eventType: inq.eventType || record.eventType || "Inquiry",
                        preferredDate:
                            inq.preferredDate ||
                            inq.eventDate ||
                            record.preferredDate ||
                            "",
                        guests: normalizeNumber(
                            inq.guests || inq.guestCount || record.guests || 0
                        ),
                        message:
                            inq.message ||
                            inq.notes ||
                            inq.specialRequests ||
                            "Inquiry record",
                        status: normalizeStatus(inq.status || "recorded"),
                    });
                });
            }
        });

        return [...map.values()]
            .map((client) => ({
                ...client,
                bookings: [...client.bookings].sort(
                    (a, b) => new Date(b.eventDate || 0) - new Date(a.eventDate || 0)
                ),
                quotations: [...client.quotations].sort(
                    (a, b) => new Date(b.preferredDate || 0) - new Date(a.preferredDate || 0)
                ),
                inquiries: [...client.inquiries].sort(
                    (a, b) => new Date(b.preferredDate || 0) - new Date(a.preferredDate || 0)
                ),
            }))
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
    }, [records]);

    const filteredClients = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return clients;

        return clients.filter((client) => {
            return (
                String(client.fullName || "").toLowerCase().includes(keyword) ||
                String(client.email || "").toLowerCase().includes(keyword) ||
                String(client.contactNumber || "").toLowerCase().includes(keyword)
            );
        });
    }, [clients, searchTerm]);

    useEffect(() => {
        if (!selectedClient && filteredClients.length > 0) {
            setSelectedClient(filteredClients[0]);
            return;
        }

        if (
            selectedClient &&
            !filteredClients.some((item) => item.clientKey === selectedClient.clientKey)
        ) {
            setSelectedClient(filteredClients[0] || null);
        }
    }, [filteredClients, selectedClient]);

    const stats = useMemo(() => {
        return {
            totalClients: clients.length,
            withBookings: clients.filter((item) => item.bookings.length > 0).length,
            withQuotations: clients.filter((item) => item.quotations.length > 0).length,
            withInquiries: clients.filter((item) => item.inquiries.length > 0).length,
        };
    }, [clients]);

    const handlePrintClients = () => {
        openPrintWindow({
            title: "Client Profiles Report",
            subtitle: "Current and past client information summary",
            summaryCards: [
                { label: "Total Clients", value: clients.length },
                {
                    label: "Clients with Bookings",
                    value: clients.filter((item) => item.bookings.length > 0).length,
                },
                {
                    label: "Clients with Quotations",
                    value: clients.filter((item) => item.quotations.length > 0).length,
                },
                {
                    label: "Clients with Inquiries",
                    value: clients.filter((item) => item.inquiries.length > 0).length,
                },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Client Records</h2>
                    ${buildPrintableTable(
                [
                    "Client Name",
                    "Email",
                    "Contact Number",
                    "Bookings",
                    "Quotations",
                    "Inquiries",
                ],
                clients.map((client) => [
                    client.fullName,
                    client.email || "—",
                    client.contactNumber || "—",
                    client.bookings.length,
                    client.quotations.length,
                    client.inquiries.length,
                ])
            )}
                </div>
            `,
        });
    };

    const isDark = theme === "dark";

    const shellCard = isDark
        ? "border-white/10 bg-[linear-gradient(180deg,rgba(8,28,22,0.96)_0%,rgba(9,34,26,0.96)_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.24)]"
        : "border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]";

    const panelBorder = isDark ? "border-white/10" : "border-gray-100";
    const titleColor = isDark ? "text-white" : "text-[#0f4d3c]";
    const softText = isDark ? "text-[#b4c8c0]" : "text-gray-500";
    const inputClass = isDark
        ? "border-white/10 bg-[rgba(255,255,255,0.04)] text-white placeholder:text-[#7da095] focus:border-[#d4af37] focus:bg-[rgba(255,255,255,0.06)]"
        : "border-gray-200 bg-[#f8fafc] text-[#17352d] placeholder:text-gray-400 focus:border-[#d4af37] focus:bg-white";
    const emptyBoxClass = isDark
        ? "border-white/10 bg-[rgba(255,255,255,0.03)] text-[#b4c8c0]"
        : "border-dashed border-gray-200 bg-[#fafafa] text-gray-500";

    return (
        <div className="space-y-6">
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-[#0f4d3c] via-[#0c3f33] to-[#07241d] p-6 text-white shadow-[0_24px_80px_rgba(15,77,60,0.22)]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.26),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_26%)]" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f7e7a1] backdrop-blur">
                            <Users className="h-4 w-4" />
                            Client Management
                        </div>
                        <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                            Client Profiles & History
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">
                            View the full client relationship timeline including bookings,
                            quotations, and inquiries in a more polished admin experience.
                        </p>
                    </div>

                    <button
                        onClick={handlePrintClients}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f4d97a]/40 bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f2c24] transition hover:scale-[1.02] hover:bg-[#e0bc49]"
                    >
                        <Printer className="h-4 w-4" />
                        Generate PDF Report
                    </button>
                </div>
            </motion.section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <TopStatCard theme={theme} title="Total Clients" value={stats.totalClients} icon={Users} delay={0.05} />
                <TopStatCard theme={theme} title="With Bookings" value={stats.withBookings} icon={CalendarDays} delay={0.1} />
                <TopStatCard theme={theme} title="With Quotations" value={stats.withQuotations} icon={FileText} delay={0.15} />
                <TopStatCard theme={theme} title="With Inquiries" value={stats.withInquiries} icon={MessageSquareQuote} delay={0.2} />
            </section>

            {loading ? (
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-[28px] border p-10 text-center ${shellCard}`}
                >
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-[rgba(34,197,139,0.10)]" : "bg-[#ecfdf5]"}`}>
                        <LoaderCircle className={`h-8 w-8 animate-spin ${isDark ? "text-[#98efcc]" : "text-[#0f766e]"}`} />
                    </div>
                    <h3 className={`mt-4 text-xl font-black ${titleColor}`}>
                        Loading client records
                    </h3>
                </motion.div>
            ) : clients.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-[28px] border p-10 text-center ${shellCard}`}
                >
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-[rgba(34,197,139,0.10)]" : "bg-[#ecfdf5]"}`}>
                        <Users className={`h-8 w-8 ${isDark ? "text-[#98efcc]" : "text-[#0f766e]"}`} />
                    </div>
                    <h3 className={`mt-4 text-xl font-black ${titleColor}`}>
                        No client records yet
                    </h3>
                    <p className={`mt-2 text-sm ${softText}`}>
                        Client information will appear here once quotations or related records are saved.
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <motion.section
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`overflow-hidden rounded-[28px] border ${shellCard}`}
                    >
                        <div className={`border-b p-6 ${panelBorder}`}>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className={`text-2xl font-black ${titleColor}`}>
                                        Client List
                                    </h2>
                                    <p className={`mt-1 text-sm ${softText}`}>
                                        Select a client to view their full profile history.
                                    </p>
                                </div>

                                <div className="relative">
                                    <Search className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-[#7da095]" : "text-gray-400"}`} />
                                    <input
                                        type="text"
                                        placeholder="Search client name, email, number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none transition ${inputClass}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[880px] space-y-3 overflow-y-auto p-4">
                            {filteredClients.map((client, index) => (
                                <motion.button
                                    key={client.clientKey}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.025 }}
                                    onClick={() => setSelectedClient(client)}
                                    className={`w-full rounded-[24px] border p-4 text-left transition ${selectedClient?.clientKey === client.clientKey
                                            ? isDark
                                                ? "border-[#d4af37] bg-[linear-gradient(135deg,rgba(212,175,55,0.10),rgba(255,255,255,0.04))] shadow-[0_12px_35px_rgba(212,175,55,0.10)]"
                                                : "border-[#d4af37] bg-[linear-gradient(135deg,#fff8e6,#fffdf7)] shadow-[0_12px_35px_rgba(212,175,55,0.15)]"
                                            : isDark
                                                ? "border-white/10 bg-[rgba(255,255,255,0.03)] hover:-translate-y-0.5 hover:border-white/15 hover:bg-[rgba(255,255,255,0.05)]"
                                                : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-[#d7e0e8] hover:bg-[#fcfcfd]"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h4 className={`truncate text-base font-black ${titleColor}`}>
                                                {client.fullName}
                                            </h4>
                                            <p className={`mt-1 truncate text-sm ${softText}`}>
                                                {client.email || "No email"}
                                            </p>
                                            <p className={`mt-1 text-xs ${isDark ? "text-[#90a8a0]" : "text-gray-400"}`}>
                                                {client.contactNumber || "No contact number"}
                                            </p>
                                        </div>

                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-[#f8fafc]"}`}>
                                            <ChevronRight className={`h-5 w-5 ${isDark ? "text-[#9bb3ab]" : "text-gray-400"}`} />
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <TinyCounter theme={theme} label="Bookings" value={client.bookings.length} />
                                        <TinyCounter theme={theme} label="Quotes" value={client.quotations.length} />
                                        <TinyCounter theme={theme} label="Inquiries" value={client.inquiries.length} />
                                    </div>
                                </motion.button>
                            ))}

                            {filteredClients.length === 0 && (
                                <div className={`rounded-[24px] border p-8 text-center text-sm ${emptyBoxClass}`}>
                                    No matching client found.
                                </div>
                            )}
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`overflow-hidden rounded-[28px] border ${shellCard}`}
                    >
                        {!selectedClient ? (
                            <div className={`flex min-h-[500px] items-center justify-center p-10 text-center ${softText}`}>
                                Select a client to view complete details.
                            </div>
                        ) : (
                            <div className="space-y-6 p-6">
                                <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f4d3c,#0b3a2f)] p-6 text-white shadow-[0_18px_50px_rgba(15,77,60,0.22)]">
                                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/10 ring-1 ring-white/15">
                                                <UserRound className="h-8 w-8 text-[#f4d97a]" />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-3xl font-black">
                                                    {selectedClient.fullName}
                                                </h3>
                                                <div className="mt-3 space-y-2 text-sm text-white/80">
                                                    <p className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-[#f4d97a]" />
                                                        <span className="truncate">
                                                            {selectedClient.email || "No email"}
                                                        </span>
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-[#f4d97a]" />
                                                        <span>
                                                            {selectedClient.contactNumber || "No contact number"}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#f7e7a1]">
                                            <BadgeCheck className="h-4 w-4" />
                                            Active Client Profile
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <MiniStat theme={theme} label="Bookings" value={selectedClient.bookings.length} />
                                    <MiniStat theme={theme} label="Quotations" value={selectedClient.quotations.length} />
                                    <MiniStat theme={theme} label="Inquiries" value={selectedClient.inquiries.length} />
                                </div>

                                <HistorySection theme={theme} title="Booking History" icon={CalendarDays}>
                                    {selectedClient.bookings.length === 0 ? (
                                        <EmptyMini theme={theme} text="No booking history." />
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedClient.bookings.map((booking) => (
                                                <RecordCard
                                                    theme={theme}
                                                    key={booking.id}
                                                    title={`${booking.bookingId} • ${booking.eventType}`}
                                                    subtitle={`${formatDate(booking.eventDate)} • ${booking.guestCount} guests`}
                                                    extra={booking.venue || "No venue"}
                                                    value={formatCurrency(booking.totalAmount)}
                                                    status={booking.status}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </HistorySection>

                                <HistorySection theme={theme} title="Quotation History" icon={FileText}>
                                    {selectedClient.quotations.length === 0 ? (
                                        <EmptyMini theme={theme} text="No quotation history." />
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedClient.quotations.map((quote) => (
                                                <RecordCard
                                                    theme={theme}
                                                    key={quote.id}
                                                    title={`${quote.quotationId} • ${quote.eventType}`}
                                                    subtitle={`${formatDate(quote.preferredDate)} • ${quote.guests} guests`}
                                                    extra={quote.packageName || "Quotation request"}
                                                    value={formatCurrency(quote.estimatedTotal)}
                                                    status={quote.status}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </HistorySection>

                                <HistorySection theme={theme} title="Inquiry History" icon={MessageSquareQuote}>
                                    {selectedClient.inquiries.length === 0 ? (
                                        <EmptyMini theme={theme} text="No inquiry history." />
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedClient.inquiries.map((inquiry) => (
                                                <RecordCard
                                                    theme={theme}
                                                    key={inquiry.id}
                                                    title={`${inquiry.inquiryId} • ${inquiry.eventType}`}
                                                    subtitle={`${formatDate(inquiry.preferredDate)} • ${inquiry.guests} guests`}
                                                    extra={inquiry.message || "Inquiry record"}
                                                    value={null}
                                                    status={inquiry.status}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </HistorySection>
                            </div>
                        )}
                    </motion.section>
                </div>
            )}
        </div>
    );
}

function TopStatCard({ theme, title, value, icon: Icon, delay = 0 }) {
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
                    <h2 className={`mt-3 text-3xl font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>{value}</h2>
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

function TinyCounter({ theme, label, value }) {
    const isDark = theme === "dark";

    return (
        <div className={`rounded-2xl border px-3 py-3 text-center ${isDark
                ? "border-white/10 bg-[rgba(255,255,255,0.03)]"
                : "border-white/70 bg-[#f8fafc]"
            }`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isDark ? "text-[#90a8a0]" : "text-gray-400"
                }`}>
                {label}
            </p>
            <p className={`mt-2 text-lg font-black ${isDark ? "text-white" : "text-[#0f4d3c]"
                }`}>{value}</p>
        </div>
    );
}

function MiniStat({ theme, label, value }) {
    const isDark = theme === "dark";

    return (
        <div className={`rounded-[24px] border p-4 shadow-sm ${isDark
                ? "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]"
                : "border-gray-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc)]"
            }`}>
            <p className={`text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>{label}</p>
            <h4 className={`mt-2 text-3xl font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>{value}</h4>
        </div>
    );
}

function HistorySection({ theme, title, icon: Icon, children }) {
    const isDark = theme === "dark";

    return (
        <div className={`rounded-[28px] border p-5 ${isDark
                ? "border-white/10 bg-[rgba(255,255,255,0.03)]"
                : "border-gray-100 bg-[#fcfcfd]"
            }`}>
            <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark
                        ? "bg-[rgba(212,175,55,0.14)] text-[#f4d97a]"
                        : "bg-[#fff8e6] text-[#b99117]"
                    }`}>
                    <Icon className="h-5 w-5" />
                </div>
                <h4 className={`text-xl font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>{title}</h4>
            </div>
            {children}
        </div>
    );
}

function RecordCard({ theme, title, subtitle, extra, value, status }) {
    const isDark = theme === "dark";

    return (
        <div className={`rounded-[24px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isDark
                ? "border-white/10 bg-[linear-gradient(180deg,rgba(7,25,19,0.96)_0%,rgba(10,31,24,0.96)_100%)]"
                : "border-gray-200 bg-white"
            }`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <p className={`font-black ${isDark ? "text-white" : "text-[#0f4d3c]"}`}>{title}</p>
                    <p className={`mt-1 text-sm ${isDark ? "text-[#b4c8c0]" : "text-gray-500"}`}>{subtitle}</p>
                    <p className={`mt-1 text-sm ${isDark ? "text-[#8ea59d]" : "text-gray-400"}`}>{extra}</p>
                </div>

                <div className="md:text-right">
                    {value ? (
                        <p className={`font-black ${isDark ? "text-[#98efcc]" : "text-[#10b981]"}`}>{value}</p>
                    ) : (
                        <p className={`font-bold ${isDark ? "text-[#8ea59d]" : "text-gray-400"}`}>—</p>
                    )}

                    <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${isDark
                            ? "bg-[rgba(255,255,255,0.05)] text-[#eef7f3] ring-white/10"
                            : "bg-[#f8fafc] text-[#0f4d3c] ring-gray-200"
                        }`}>
                        {status || "recorded"}
                    </p>
                </div>
            </div>
        </div>
    );
}

function EmptyMini({ theme, text }) {
    return (
        <p className={`text-sm ${theme === "dark" ? "text-[#b4c8c0]" : "text-gray-500"}`}>{text}</p>
    );
}

export default AdminClients;