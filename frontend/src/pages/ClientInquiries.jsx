import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Send,
    MessageSquare,
    Bot,
    UserCircle2,
    ShieldCheck,
    Clock3,
    CheckCircle2,
    MessageCircleMore,
} from "lucide-react";

const DEFAULT_ACKNOWLEDGMENT =
    "Thank you for your inquiry. Our admin has received your message and will respond as soon as possible.";

function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function getClientUser() {
    try {
        return (
            JSON.parse(localStorage.getItem("clientUser")) ||
            JSON.parse(localStorage.getItem("user")) ||
            {}
        );
    } catch {
        return {};
    }
}

function getCurrentClientEmail() {
    const clientUser = getClientUser();
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

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function buildAutoReply(messageText) {
    const text = (messageText || "").toLowerCase();

    if (
        text.includes("quotation") ||
        text.includes("quote") ||
        text.includes("presyo") ||
        text.includes("price")
    ) {
        return "Thank you for your message. Our admin has noted your quotation concern. Please wait for the review and confirmation of your request.";
    }

    if (
        text.includes("booking") ||
        text.includes("schedule") ||
        text.includes("calendar") ||
        text.includes("date")
    ) {
        return "Your schedule-related concern has been received. The admin will verify your preferred date and booking details soon.";
    }

    if (
        text.includes("payment") ||
        text.includes("bayad") ||
        text.includes("downpayment")
    ) {
        return "We have received your payment concern. The admin will check your payment record and update you as soon as possible.";
    }

    if (
        text.includes("package") ||
        text.includes("menu") ||
        text.includes("add-on") ||
        text.includes("addon")
    ) {
        return "Thank you for asking about our packages and add-ons. The admin will send you the available options and details shortly.";
    }

    return DEFAULT_ACKNOWLEDGMENT;
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.42, ease: "easeOut" },
    },
};

const staggerContainer = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

function ClientInquiries() {
    const clientUser = getClientUser();
    const email = getCurrentClientEmail();
    const storageKey = getScopedKey("clientInquiries", email);

    const [messages, setMessages] = useState(() => safeParse(storageKey, []));
    const [input, setInput] = useState("");
    const [isAdminTyping, setIsAdminTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const sortedMessages = useMemo(() => {
        return [...messages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
    }, [messages]);

    const messageSummary = useMemo(() => {
        const total = sortedMessages.length;
        const clientCount = sortedMessages.filter(
            (msg) => msg.sender === "client"
        ).length;
        const adminCount = sortedMessages.filter(
            (msg) => msg.sender === "admin"
        ).length;

        return { total, clientCount, adminCount };
    }, [sortedMessages]);

    const saveMessages = (updated) => {
        setMessages(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAdminTyping]);

    useEffect(() => {
        return () => {
            clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const syncMessages = () => {
            const latest = safeParse(storageKey, []);
            setMessages(latest);

            const hasRealAdminReply = latest.some(
                (msg) =>
                    msg.sender === "admin" &&
                    msg.text &&
                    msg.text !== DEFAULT_ACKNOWLEDGMENT
            );

            if (hasRealAdminReply) {
                setIsAdminTyping(false);
                clearTimeout(typingTimeoutRef.current);
            }
        };

        window.addEventListener("storage", syncMessages);
        const interval = setInterval(syncMessages, 1000);

        return () => {
            window.removeEventListener("storage", syncMessages);
            clearInterval(interval);
        };
    }, [storageKey]);

    const handleSendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const clientMessage = {
            id: `INQ-${Date.now()}`,
            sender: "client",
            senderName: clientUser?.name || "Client",
            email,
            text: trimmed,
            createdAt: new Date().toISOString(),
            status: "sent",
        };

        const updatedMessages = [...messages, clientMessage];
        saveMessages(updatedMessages);
        setInput("");

        const acknowledgmentText = buildAutoReply(trimmed);

        const hasAcknowledgmentAlready = updatedMessages.some(
            (msg) => msg.sender === "admin" && msg.text === acknowledgmentText
        );

        const hasAnyRealAdminReplyAlready = updatedMessages.some(
            (msg) =>
                msg.sender === "admin" &&
                msg.text &&
                msg.text !== DEFAULT_ACKNOWLEDGMENT &&
                msg.text !== acknowledgmentText
        );

        const hasDefaultAcknowledgmentAlready = updatedMessages.some(
            (msg) =>
                msg.sender === "admin" &&
                msg.text === DEFAULT_ACKNOWLEDGMENT
        );

        if (
            hasAcknowledgmentAlready ||
            hasAnyRealAdminReplyAlready ||
            hasDefaultAcknowledgmentAlready
        ) {
            setIsAdminTyping(false);
            return;
        }

        setIsAdminTyping(true);
        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            const latestMessages = safeParse(storageKey, []);

            const latestHasRealAdminReply = latestMessages.some(
                (msg) =>
                    msg.sender === "admin" &&
                    msg.text &&
                    msg.text !== DEFAULT_ACKNOWLEDGMENT
            );

            const latestHasAcknowledgment = latestMessages.some(
                (msg) =>
                    msg.sender === "admin" &&
                    msg.text === acknowledgmentText
            );

            if (latestHasRealAdminReply || latestHasAcknowledgment) {
                setIsAdminTyping(false);
                return;
            }

            const autoReply = {
                id: `ADM-${Date.now() + 1}`,
                sender: "admin",
                senderName: "Admin",
                email,
                text: acknowledgmentText,
                createdAt: new Date().toISOString(),
                status: "delivered",
                isAutoAcknowledgment: true,
            };

            const finalMessages = [...latestMessages, autoReply];
            localStorage.setItem(storageKey, JSON.stringify(finalMessages));
            setMessages(finalMessages);
            setIsAdminTyping(false);
        }, 1600);
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-7"
        >
            <motion.section
                variants={fadeUp}
                className="relative overflow-hidden rounded-[34px] border border-[#dbe6e1] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.08)]"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 right-[-20px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                    <div className="absolute bottom-[-30px] left-[-30px] h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0a5a43_0%,#0f6d51_55%,#138062_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                                <Sparkles size={14} />
                                Client Support
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
                                My Inquiries
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                Message the admin in a cleaner, more premium support
                                center designed for follow-ups, clarifications, and event
                                concerns.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px] lg:grid-cols-1">
                            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                                    Support Status
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div
                                        className={`h-2.5 w-2.5 rounded-full ${isAdminTyping
                                                ? "bg-[#f5c94a] shadow-[0_0_14px_rgba(245,201,74,0.8)]"
                                                : "bg-[#5df1a6] shadow-[0_0_14px_rgba(93,241,166,0.75)]"
                                            }`}
                                    />
                                    <p className="text-lg font-bold text-white">
                                        {isAdminTyping
                                            ? "Admin is typing..."
                                            : "Chat Support Active"}
                                    </p>
                                </div>
                                <p className="mt-1 text-sm text-white/75">
                                    Messages are saved in your account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
                    {[
                        {
                            label: "Total Messages",
                            value: messageSummary.total,
                            icon: MessageSquare,
                            iconWrap:
                                "bg-gradient-to-br from-[#edf8f3] to-[#dff1e8] text-[#0d5c46]",
                            valueClass: "text-[#0d5c46]",
                        },
                        {
                            label: "Your Messages",
                            value: messageSummary.clientCount,
                            icon: UserCircle2,
                            iconWrap:
                                "bg-gradient-to-br from-[#fff9e7] to-[#fff0bf] text-[#b99117]",
                            valueClass: "text-[#b99117]",
                        },
                        {
                            label: "Admin Replies",
                            value: messageSummary.adminCount,
                            icon: ShieldCheck,
                            iconWrap:
                                "bg-gradient-to-br from-[#eef6ff] to-[#dbeafe] text-[#2563eb]",
                            valueClass: "text-[#2563eb]",
                        },
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.label}
                                variants={fadeUp}
                                whileHover={{ y: -5, scale: 1.01 }}
                                className="group rounded-[26px] border border-[#e3ebe7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            {item.label}
                                        </p>
                                        <h2 className={`mt-3 text-3xl font-extrabold ${item.valueClass}`}>
                                            {item.value}
                                        </h2>
                                    </div>

                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition duration-300 group-hover:scale-110 ${item.iconWrap}`}
                                    >
                                        <Icon size={24} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                className="overflow-hidden rounded-[34px] border border-[#dce7e2] bg-white shadow-[0_16px_40px_rgba(14,61,47,0.07)]"
            >
                <div className="border-b border-[#edf2ef] bg-[linear-gradient(90deg,#f3fbf8_0%,#fff8ea_100%)] px-6 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                Inquiry Center
                            </p>
                            <h2 className="mt-1 text-2xl font-extrabold text-[#0d5c46] md:text-3xl">
                                Message the Admin
                            </h2>
                        </div>

                        <div className="rounded-2xl border border-[#f1d98a] bg-[#fff8e6] px-4 py-2 text-sm font-semibold text-[#b99117] shadow-sm">
                            {isAdminTyping
                                ? "Admin is typing..."
                                : "Admin usually replies here"}
                        </div>
                    </div>
                </div>

                <div className="relative min-h-[540px] max-h-[540px] overflow-y-auto bg-[linear-gradient(180deg,#f9fcfb_0%,#f5f8fc_100%)] p-5 md:p-6">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.045]">
                        <div
                            className="h-full w-full"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to right, rgba(11,90,67,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,90,67,0.18) 1px, transparent 1px)",
                                backgroundSize: "34px 34px",
                            }}
                        />
                    </div>

                    {sortedMessages.length === 0 && !isAdminTyping ? (
                        <div className="relative flex h-[430px] items-center justify-center">
                            <div className="max-w-xl text-center">
                                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#0f4d3c_0%,#127254_100%)] text-white shadow-[0_18px_35px_rgba(15,77,60,0.2)]">
                                    <MessageCircleMore size={34} />
                                </div>

                                <h3 className="text-2xl font-extrabold text-[#0f4d3c] md:text-3xl">
                                    No inquiries yet
                                </h3>
                                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 md:text-base">
                                    Start a conversation with the admin regarding your
                                    quotation, booking, payment, package, or event
                                    schedule. Your messages will appear here in a clean
                                    chat timeline.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative space-y-4">
                            <AnimatePresence initial={false}>
                                {sortedMessages.map((message) => {
                                    const isClient = message.sender === "client";

                                    return (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.28 }}
                                            className={`flex ${isClient
                                                    ? "justify-end"
                                                    : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[90%] md:max-w-[72%] rounded-[28px] px-4 py-4 shadow-sm md:px-5 ${isClient
                                                        ? "border border-[#e8c95e] bg-[linear-gradient(135deg,#d4af37_0%,#f0cb58_100%)] text-[#0f4d3c] shadow-[0_14px_28px_rgba(212,175,55,0.2)]"
                                                        : "border border-[#e3ebe7] bg-white text-slate-700 shadow-[0_12px_24px_rgba(14,61,47,0.05)]"
                                                    }`}
                                            >
                                                <div className="mb-3 flex items-center gap-2">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${isClient
                                                                ? "bg-white/30"
                                                                : "bg-[#edf8f3] text-[#0d5c46]"
                                                            }`}
                                                    >
                                                        {isClient ? (
                                                            <UserCircle2 size={16} />
                                                        ) : (
                                                            <Bot size={16} />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
                                                            {isClient
                                                                ? message.senderName || "You"
                                                                : message.senderName || "Admin"}
                                                        </p>
                                                        <p className="text-[11px] opacity-60">
                                                            {isClient
                                                                ? "Client message"
                                                                : message.isAutoAcknowledgment
                                                                    ? "Auto acknowledgment"
                                                                    : "Admin reply"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="whitespace-pre-wrap text-sm leading-7 md:text-[15px]">
                                                    {message.text}
                                                </p>

                                                <div className="mt-3 flex items-center justify-end gap-2 text-[11px] opacity-70">
                                                    {isClient ? (
                                                        <Clock3 size={12} />
                                                    ) : (
                                                        <CheckCircle2 size={12} />
                                                    )}
                                                    <span>{formatDateTime(message.createdAt)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {isAdminTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex justify-start"
                                    >
                                        <div className="max-w-[85%] rounded-[28px] border border-[#e3ebe7] bg-white px-4 py-4 text-slate-700 shadow-[0_12px_24px_rgba(14,61,47,0.05)] md:max-w-[70%] md:px-5">
                                            <div className="mb-3 flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#edf8f3] text-[#0d5c46]">
                                                    <Bot size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
                                                        Admin
                                                    </p>
                                                    <p className="text-[11px] opacity-60">
                                                        Preparing response
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0f6d51]" />
                                                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0f6d51] [animation-delay:0.15s]" />
                                                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0f6d51] [animation-delay:0.3s]" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="border-t border-[#edf2ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type your message here..."
                            className="flex-1 rounded-[22px] border border-[#d7e1dc] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#f6e8b9]"
                        />

                        <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleSendMessage}
                            className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#0f4d3c_0%,#127254_100%)] px-6 py-3.5 font-semibold text-white shadow-[0_14px_26px_rgba(15,77,60,0.2)] transition hover:shadow-[0_18px_32px_rgba(15,77,60,0.26)]"
                        >
                            <Send size={16} />
                            Send Message
                        </motion.button>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                        This chat saves your inquiries in the current client account.
                    </p>
                </div>
            </motion.section>
        </motion.div>
    );
}

export default ClientInquiries;