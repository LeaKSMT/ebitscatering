import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    Sparkles,
    Send,
    MessageSquare,
    Bot,
    UserCircle2,
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
    show: { opacity: 1, y: 0 },
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
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-6"
        >
            <motion.div
                variants={fadeUp}
                className="relative overflow-hidden rounded-[32px] border border-[#dbe6e1] bg-white shadow-[0_14px_40px_rgba(14,61,47,0.08)]"
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-10 right-[-30px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_58%,#138062_100%)] px-6 py-8 text-white md:px-8 md:py-10">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={14} />
                                Client Support
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
                                My Inquiries
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                                Send questions, follow-ups, and concerns to the admin
                                through a more premium and organized inquiry center.
                            </p>
                        </div>

                        <div className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                Support Status
                            </p>
                            <p className="mt-2 text-lg font-bold text-white">
                                {isAdminTyping ? "Admin is typing..." : "Chat Support Active"}
                            </p>
                            <p className="mt-1 text-sm text-white/75">
                                Messages are saved in your account
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={fadeUp}
                className="overflow-hidden rounded-[32px] border border-[#dce7e2] bg-white shadow-[0_12px_30px_rgba(14,61,47,0.06)]"
            >
                <div className="border-b border-[#edf2ef] bg-[linear-gradient(90deg,#f2fbf7_0%,#fff9ea_100%)] px-6 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Inquiry Center
                            </p>
                            <h2 className="mt-1 text-2xl font-extrabold text-[#0d5c46]">
                                Message the Admin
                            </h2>
                        </div>

                        <div className="rounded-2xl border border-[#f1d98a] bg-[#fff8e6] px-4 py-2 text-sm font-semibold text-[#b99117]">
                            {isAdminTyping ? "Admin is typing..." : "Admin usually replies here"}
                        </div>
                    </div>
                </div>

                <div className="min-h-[460px] max-h-[460px] space-y-4 overflow-y-auto bg-[#f8fafc] p-5 md:p-6">
                    {sortedMessages.length === 0 && !isAdminTyping ? (
                        <div className="flex h-[360px] items-center justify-center">
                            <div className="max-w-lg text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0f4d3c] text-white">
                                    <MessageSquare size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0f4d3c]">
                                    No inquiries yet
                                </h3>
                                <p className="mt-2 leading-7 text-gray-500">
                                    Start a conversation with the admin regarding your
                                    quotation, booking, payment, package, or event schedule.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {sortedMessages.map((message) => {
                                const isClient = message.sender === "client";

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isClient ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[85%] md:max-w-[70%] rounded-[26px] px-4 py-4 shadow-sm ${isClient
                                                    ? "bg-[linear-gradient(135deg,#d4af37_0%,#f0cb58_100%)] text-[#0f4d3c]"
                                                    : "border border-gray-200 bg-white text-gray-700"
                                                }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                {isClient ? (
                                                    <UserCircle2 size={16} className="opacity-80" />
                                                ) : (
                                                    <Bot size={16} className="opacity-80" />
                                                )}

                                                <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">
                                                    {isClient
                                                        ? message.senderName || "You"
                                                        : message.senderName || "Admin"}
                                                </p>
                                            </div>

                                            <p className="whitespace-pre-wrap text-sm leading-7">
                                                {message.text}
                                            </p>

                                            <p className="mt-3 text-right text-[11px] opacity-70">
                                                {formatDateTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {isAdminTyping && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] rounded-[26px] border border-gray-200 bg-white px-4 py-4 text-gray-700 shadow-sm md:max-w-[70%]">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Bot size={16} className="opacity-80" />
                                            <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">
                                                Admin
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-400" />
                                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.15s]" />
                                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.3s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-100 bg-white p-5">
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
                            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#f4e2a0]"
                        />

                        <button
                            type="button"
                            onClick={handleSendMessage}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f4d3c] px-6 py-3 font-semibold text-white transition hover:bg-[#0c3f31]"
                        >
                            <Send size={16} />
                            Send Message
                        </button>
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                        This chat saves your inquiries in the current client account.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default ClientInquiries;