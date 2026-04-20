import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    MessageSquare,
    CalendarDays,
    LogOut,
    Menu,
    X,
    Sparkles,
    ShieldCheck,
    ChevronRight,
    Bell,
    Moon,
    Sun,
    User,
    CheckCircle2,
} from "lucide-react";

function getSafeJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function getClientUserSafe() {
    try {
        return (
            JSON.parse(localStorage.getItem("clientUser")) ||
            JSON.parse(localStorage.getItem("user")) || {
                name: "Client",
                email: "",
            }
        );
    } catch {
        return { name: "Client", email: "" };
    }
}

function getCurrentClientEmailSafe() {
    const clientUser = getClientUserSafe();
    return (
        localStorage.getItem("currentClientEmail") ||
        localStorage.getItem("clientEmail") ||
        clientUser?.email ||
        ""
    );
}

function getScopedKey(baseKey, email) {
    return email ? `${baseKey}_${email}` : `${baseKey}_guest`;
}

function formatNotificationTime(dateValue) {
    if (!dateValue) return "Just now";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Just now";

    return date.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function buildNotifications({ quotations, bookings, inquiries }) {
    const notificationItems = [];

    quotations.slice(0, 3).forEach((item) => {
        notificationItems.push({
            id: `quotation-${item.id}-${item.createdAt || ""}`,
            title: "Quotation update",
            message:
                item?.eventType ||
                item?.packageName ||
                item?.packageType ||
                "New quotation activity",
            meta: item?.status || "Pending",
            createdAt: item?.createdAt || new Date().toISOString(),
            to: "/client/quotations",
        });
    });

    bookings.slice(0, 3).forEach((item) => {
        notificationItems.push({
            id: `booking-${item.id}-${item.createdAt || item.date || ""}`,
            title: "Booking activity",
            message: item?.eventType || item?.packageName || "Booking record",
            meta: item?.status || "Pending",
            createdAt: item?.createdAt || item?.date || new Date().toISOString(),
            to: "/client/bookings",
        });
    });

    inquiries
        .filter((item) => item?.sender === "admin")
        .slice(-3)
        .reverse()
        .forEach((item, index) => {
            notificationItems.push({
                id: `inquiry-${item.id || index}`,
                title: "Admin reply received",
                message: String(item?.text || "New reply").slice(0, 72),
                meta: "Support",
                createdAt: item?.createdAt || new Date().toISOString(),
                to: "/client/inquiries",
            });
        });

    return notificationItems
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
}

function ClientTopbar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const profileRef = useRef(null);
    const notificationsRef = useRef(null);

    const clientUser = useMemo(() => getClientUserSafe(), []);
    const clientEmail = useMemo(
        () => String(getCurrentClientEmailSafe()).toLowerCase().trim(),
        []
    );

    const notificationSeenKey = useMemo(
        () => getScopedKey("clientSeenNotifications", clientEmail),
        [clientEmail]
    );

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("clientPortalTheme") || "light";
    });

    const [seenNotificationIds, setSeenNotificationIds] = useState(() => {
        return getSafeJson(notificationSeenKey, []);
    });

    useEffect(() => {
        setSeenNotificationIds(getSafeJson(notificationSeenKey, []));
    }, [notificationSeenKey]);

    useEffect(() => {
        localStorage.setItem(notificationSeenKey, JSON.stringify(seenNotificationIds));
    }, [notificationSeenKey, seenNotificationIds]);

    useEffect(() => {
        localStorage.setItem("clientPortalTheme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        window.dispatchEvent(new Event("client-theme-change"));
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }

            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const quotations = useMemo(() => {
        const all = getSafeJson("clientQuotations", []);
        const scoped = getSafeJson(getScopedKey("clientQuotations", clientEmail), []);
        return scoped.length ? scoped : all;
    }, [clientEmail]);

    const bookings = useMemo(() => {
        const all = getSafeJson("clientBookings", []);
        const scoped = getSafeJson(getScopedKey("clientBookings", clientEmail), []);
        return scoped.length ? scoped : all;
    }, [clientEmail]);

    const inquiries = useMemo(() => {
        return getSafeJson(getScopedKey("clientInquiries", clientEmail), []);
    }, [clientEmail]);

    const notifications = useMemo(() => {
        return buildNotifications({ quotations, bookings, inquiries });
    }, [quotations, bookings, inquiries]);

    useEffect(() => {
        const validIds = notifications.map((item) => item.id);
        setSeenNotificationIds((prev) => prev.filter((id) => validIds.includes(id)));
    }, [notifications]);

    const unreadNotifications = useMemo(() => {
        return notifications.filter((item) => !seenNotificationIds.includes(item.id));
    }, [notifications, seenNotificationIds]);

    const unreadCount = unreadNotifications.length;

    const markNotificationsAsSeen = (ids = []) => {
        if (!ids.length) return;
        setSeenNotificationIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const handleOpenNotifications = () => {
        const nextOpen = !showNotifications;
        setShowNotifications(nextOpen);
        setShowProfileDropdown(false);

        if (nextOpen) {
            markNotificationsAsSeen(notifications.map((item) => item.id));
        }
    };

    const handleConfirmLogout = () => {
        localStorage.removeItem("clientUser");
        localStorage.removeItem("user");
        localStorage.removeItem("clientName");
        localStorage.removeItem("clientEmail");
        localStorage.removeItem("clientRole");
        localStorage.removeItem("clientPhoto");
        localStorage.removeItem("clientContactNumber");
        localStorage.removeItem("currentClientEmail");
        localStorage.removeItem("currentClientName");
        localStorage.removeItem("isClientLoggedIn");
        localStorage.removeItem("redirectAfterLogin");

        setShowLogoutModal(false);
        setMobileMenuOpen(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
        navigate("/login");
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const navItems = [
        { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/client/quotations", label: "Quotations", icon: FileText },
        { to: "/client/bookings", label: "Bookings", icon: BookOpen },
        { to: "/client/inquiries", label: "Inquiries", icon: MessageSquare },
        { to: "/client/calendar", label: "Calendar", icon: CalendarDays },
    ];

    const navClass = ({ isActive }) =>
        `client-topbar-link ${isActive ? "client-topbar-link-active" : "client-topbar-link-idle"
        }`;

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(135deg,rgba(7,62,47,0.96)_0%,rgba(10,87,65,0.96)_58%,rgba(15,117,88,0.96)_100%)] text-white shadow-[0_18px_48px_rgba(6,40,31,0.22)] backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-16 top-[-60px] h-40 w-40 rounded-full bg-[#d4af37]/12 blur-3xl" />
                    <div className="absolute right-[-80px] top-0 h-44 w-44 rounded-full bg-white/8 blur-3xl" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-[1380px] px-3 sm:px-5 lg:px-6">
                    <div className="flex min-h-[76px] items-center justify-between gap-3 py-3 xl:min-h-[84px] xl:py-4">
                        <motion.div
                            initial={{ opacity: 0, x: -18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45 }}
                            className="min-w-0 pr-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.12)] backdrop-blur">
                                    <Sparkles size={18} className="text-[#f5c94a]" />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="truncate text-[1.35rem] font-extrabold leading-none tracking-tight text-[#f5c94a] sm:text-[1.8rem]">
                                        Ebit&apos;s Catering
                                    </h1>
                                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-sm normal-case">
                                        <ShieldCheck size={14} className="text-white/70" />
                                        <span>Client Portal</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="hidden min-w-0 flex-1 items-center justify-center px-3 min-[1450px]:flex">
                            <nav className="flex h-[54px] items-center rounded-full border border-white/10 bg-white/8 px-2 shadow-[0_14px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                                <div className="flex items-center gap-1.5">
                                    {navItems.map(({ to, label, icon: Icon }) => (
                                        <NavLink key={to} to={to} className={navClass}>
                                            <Icon size={15} className="shrink-0" />
                                            <span>{label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </nav>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45 }}
                            className="hidden items-center self-center gap-2.5 pl-2 min-[1450px]:flex"
                        >
                            <div ref={notificationsRef} className="relative">
                                <button
                                    onClick={handleOpenNotifications}
                                    className="relative inline-flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition hover:bg-white/15"
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 ? (
                                        <span className="absolute -right-1 -top-1 inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#f5c94a] px-1.5 text-[11px] font-extrabold text-[#0b5a43] shadow-[0_10px_18px_rgba(245,201,74,0.35)]">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    ) : null}
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[360px] overflow-hidden rounded-[28px] border border-[#dfe8e4] bg-white text-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.18)]"
                                        >
                                            <div className="border-b border-[#edf2ef] bg-[linear-gradient(90deg,#f3fbf8_0%,#fffaf0_100%)] px-5 py-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                            Notifications
                                                        </p>
                                                        <h3 className="mt-1 text-lg font-extrabold text-[#0d5c46]">
                                                            Activity Updates
                                                        </h3>
                                                    </div>
                                                    <div className="rounded-full bg-[#eef8f3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d5c46]">
                                                        {unreadCount} items
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="max-h-[380px] overflow-y-auto p-3">
                                                {notifications.length === 0 ? (
                                                    <div className="rounded-[22px] border border-dashed border-[#d8e3de] bg-[#fbfdfc] px-4 py-8 text-center">
                                                        <Bell size={24} className="mx-auto text-slate-400" />
                                                        <p className="mt-3 text-sm font-semibold text-slate-600">
                                                            No notifications yet
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            New activity will appear here.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {notifications.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => {
                                                                    markNotificationsAsSeen([item.id]);
                                                                    setShowNotifications(false);
                                                                    navigate(item.to);
                                                                }}
                                                                className="w-full rounded-[22px] border border-[#e8efeb] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 text-left transition hover:border-[#d4af37]/40 hover:shadow-sm"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0d5c46]">
                                                                        <CheckCircle2 size={18} />
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <p className="truncate text-sm font-bold text-[#0d5c46]">
                                                                                {item.title}
                                                                            </p>
                                                                            <span className="shrink-0 text-[11px] text-slate-400">
                                                                                {formatNotificationTime(item.createdAt)}
                                                                            </span>
                                                                        </div>

                                                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                                                            {item.message}
                                                                        </p>

                                                                        <div className="mt-2 inline-flex rounded-full bg-[#fff8e6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f6a0f]">
                                                                            {item.meta}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => {
                                        setShowProfileDropdown((prev) => !prev);
                                        setShowNotifications(false);
                                    }}
                                    className="flex h-[50px] max-w-[210px] items-center gap-2 rounded-2xl border border-white/10 bg-white/95 px-4 py-2.5 text-sm font-bold text-[#0b5a43] shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] text-xs font-extrabold text-white">
                                        {String(clientUser?.name || "C").charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate">{clientUser?.name || "Client"}</span>
                                    <ChevronRight
                                        size={15}
                                        className={`shrink-0 transition ${showProfileDropdown ? "rotate-90" : ""
                                            }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {showProfileDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[280px] overflow-hidden rounded-[28px] border border-[#dfe8e4] bg-white text-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.18)]"
                                        >
                                            <div className="bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] px-5 py-5 text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-base font-extrabold text-[#f5c94a]">
                                                        {String(clientUser?.name || "C").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-bold">
                                                            {clientUser?.name || "Client"}
                                                        </p>
                                                        <p className="truncate text-sm text-white/75">
                                                            {clientEmail || "No email"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3">
                                                <button
                                                    onClick={() => {
                                                        setShowProfileDropdown(false);
                                                        navigate("/client/dashboard");
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#f7fbf9]"
                                                >
                                                    <User size={17} className="text-[#0d5c46]" />
                                                    <span>Profile Overview</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        toggleTheme();
                                                        setShowProfileDropdown(false);
                                                    }}
                                                    className="mt-1 flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#f7fbf9]"
                                                >
                                                    {theme === "light" ? (
                                                        <Moon size={17} className="text-[#0d5c46]" />
                                                    ) : (
                                                        <Sun size={17} className="text-[#0d5c46]" />
                                                    )}
                                                    <span>
                                                        {theme === "light"
                                                            ? "Switch to Dark Mode"
                                                            : "Switch to Light Mode"}
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setShowProfileDropdown(false);
                                                        setShowLogoutModal(true);
                                                    }}
                                                    className="mt-2 flex w-full items-center gap-3 rounded-[20px] bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] px-4 py-3 text-left text-sm font-bold text-white transition hover:opacity-95"
                                                >
                                                    <LogOut size={17} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition hover:bg-white/15 min-[1450px]:hidden"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 z-50 bg-[#03120d]/60 backdrop-blur-[4px] min-[1450px]:hidden"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.32, ease: "easeOut" }}
                            className="fixed right-0 top-0 z-[60] h-full w-[88%] max-w-sm overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf9_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.22)] min-[1450px]:hidden"
                        >
                            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_58%,#138062_100%)] px-5 py-5 text-white">
                                <div className="pointer-events-none absolute inset-0">
                                    <div className="absolute -right-8 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                                    <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#d4af37]/20 blur-2xl" />
                                </div>

                                <div className="relative flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-2xl font-extrabold text-[#f5c94a]">
                                            Ebit&apos;s Catering
                                        </h2>
                                        <p className="mt-1 text-sm text-white/80">
                                            Premium Client Portal
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="relative mt-5 rounded-[24px] border border-white/10 bg-white/95 px-4 py-4 text-[#0b5a43] shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b5a43]/60">
                                        Signed in as
                                    </p>
                                    <p className="mt-1 truncate text-base font-bold">
                                        {clientUser?.name || "Client"}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-end">
                                    <button
                                        onClick={() => {
                                            const nextOpen = !showNotifications;
                                            setShowNotifications(nextOpen);
                                            setShowProfileDropdown(false);

                                            if (nextOpen) {
                                                markNotificationsAsSeen(
                                                    notifications.map((item) => item.id)
                                                );
                                            }
                                        }}
                                        className="relative inline-flex h-[50px] w-[50px] items-center justify-center rounded-[18px] border border-white/10 bg-white/10 text-white"
                                    >
                                        <Bell size={18} />
                                        {unreadCount > 0 ? (
                                            <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#f5c94a] px-1 text-[10px] font-extrabold text-[#0b5a43]">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        ) : null}
                                    </button>
                                </div>
                            </div>

                            <div className="p-5">
                                <nav className="space-y-2">
                                    {navItems.map(({ to, label, icon: Icon }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                `group flex items-center justify-between rounded-[22px] border px-4 py-3 text-sm font-semibold transition ${isActive
                                                    ? "border-[#f1d98a] bg-[linear-gradient(135deg,#fff8e6_0%,#fff2c5_100%)] text-[#8a6710] shadow-sm"
                                                    : "border-transparent bg-white text-slate-700 hover:border-[#dfe8e4] hover:bg-[#f7fbf9]"
                                                }`
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f1f7f4] text-[#0b5a43]">
                                                    <Icon size={18} />
                                                </div>
                                                <span>{label}</span>
                                            </div>
                                            <ChevronRight
                                                size={16}
                                                className="opacity-60 transition group-hover:translate-x-0.5"
                                            />
                                        </NavLink>
                                    ))}
                                </nav>

                                <div className="mt-5 rounded-[24px] border border-[#e3ebe7] bg-white p-4 shadow-sm">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Quick Profile
                                    </p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0d5c46] font-extrabold text-white">
                                            {String(clientUser?.name || "C").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[#0d5c46]">
                                                {clientUser?.name || "Client"}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {clientEmail || "No email"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {showNotifications ? (
                                    <div className="mt-5 rounded-[24px] border border-[#e3ebe7] bg-white p-3 shadow-sm">
                                        <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Notifications
                                        </p>

                                        <div className="mt-2 space-y-2">
                                            {notifications.length === 0 ? (
                                                <div className="rounded-[18px] border border-dashed border-[#d8e3de] bg-[#fbfdfc] px-4 py-6 text-center">
                                                    <p className="text-sm font-semibold text-slate-600">
                                                        No notifications yet
                                                    </p>
                                                </div>
                                            ) : (
                                                notifications.slice(0, 4).map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            markNotificationsAsSeen([item.id]);
                                                            setMobileMenuOpen(false);
                                                            setShowNotifications(false);
                                                            navigate(item.to);
                                                        }}
                                                        className="w-full rounded-[18px] border border-[#e8efeb] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-3 text-left"
                                                    >
                                                        <p className="text-sm font-bold text-[#0d5c46]">
                                                            {item.title}
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                            {item.message}
                                                        </p>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                <div className="mt-5 rounded-[24px] border border-[#e3ebe7] bg-white p-3 shadow-sm">
                                    <button
                                        onClick={toggleTheme}
                                        className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#f7fbf9]"
                                    >
                                        {theme === "light" ? (
                                            <Moon size={17} className="text-[#0d5c46]" />
                                        ) : (
                                            <Sun size={17} className="text-[#0d5c46]" />
                                        )}
                                        <span>
                                            {theme === "light"
                                                ? "Switch to Dark Mode"
                                                : "Switch to Light Mode"}
                                        </span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] px-4 py-3.5 font-bold text-white shadow-[0_14px_26px_rgba(11,90,67,0.18)] transition hover:-translate-y-0.5 hover:bg-[#084633]"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLogoutModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[4px]"
                        />

                        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                                transition={{ duration: 0.25 }}
                                className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#efe2a9] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.24)]"
                            >
                                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] px-6 py-5">
                                    <div className="pointer-events-none absolute inset-0">
                                        <div className="absolute -top-8 right-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                                        <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-[#d4af37]/20 blur-2xl" />
                                    </div>

                                    <div className="relative">
                                        <h2 className="text-xl font-bold text-[#f5c94a]">
                                            Confirm Logout
                                        </h2>
                                        <p className="mt-1 text-sm text-white/80">
                                            Are you sure you want to log out from your account?
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 py-6">
                                    <div className="rounded-[22px] border border-[#f4e6a5] bg-[linear-gradient(180deg,#fffdf6_0%,#fff8e8_100%)] p-4 text-sm leading-6 text-slate-600">
                                        You will be redirected to the login page after logging out.
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowLogoutModal(false)}
                                            className="rounded-2xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleConfirmLogout}
                                            className="rounded-2xl bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_100%)] px-5 py-2.5 font-semibold text-white shadow-[0_12px_24px_rgba(11,90,67,0.18)] transition hover:bg-[#084633]"
                                        >
                                            Yes, Logout
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default ClientTopbar;