import { useEffect, useMemo, useRef, useState } from "react";

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
            (msg) =>
                msg.sender === "admin" &&
                msg.text === acknowledgmentText
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
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-[#0f4d3c]">My Inquiries</h1>
                    <p className="text-gray-500 mt-1">
                        Send questions and follow-ups to the admin.
                    </p>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-[#fff8e6] border border-[#f1d98a] text-[#b99117] font-semibold text-sm">
                    Chat Support
                </div>
            </div>

            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#0b5a43] to-[#0f6b50] px-6 py-5 text-white">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <p className="uppercase tracking-[0.22em] text-xs text-white/70">
                                Inquiry Center
                            </p>
                            <h2 className="text-2xl font-extrabold mt-1">
                                Message the Admin
                            </h2>
                        </div>

                        <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm">
                            {isAdminTyping ? "Admin is typing..." : "Admin usually replies here"}
                        </div>
                    </div>
                </div>

                <div className="bg-[#f8fafc] p-5 md:p-6 min-h-[460px] max-h-[460px] overflow-y-auto space-y-4">
                    {sortedMessages.length === 0 && !isAdminTyping ? (
                        <div className="h-[360px] flex items-center justify-center">
                            <div className="max-w-lg text-center">
                                <div className="w-16 h-16 rounded-full bg-[#0f4d3c] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                    💬
                                </div>
                                <h3 className="text-2xl font-bold text-[#0f4d3c]">
                                    No inquiries yet
                                </h3>
                                <p className="text-gray-500 mt-2 leading-7">
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
                                    <div
                                        key={message.id}
                                        className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] md:max-w-[70%] rounded-[24px] px-4 py-3 shadow-sm ${isClient
                                                    ? "bg-[#d4af37] text-[#0f4d3c]"
                                                    : "bg-white border border-gray-200 text-gray-700"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">
                                                    {isClient
                                                        ? message.senderName || "You"
                                                        : message.senderName || "Admin"}
                                                </p>
                                            </div>

                                            <p className="text-sm leading-7 whitespace-pre-wrap">
                                                {message.text}
                                            </p>

                                            <p className="text-[11px] mt-3 opacity-70 text-right">
                                                {formatDateTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {isAdminTyping && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] md:max-w-[70%] rounded-[24px] px-4 py-4 shadow-sm bg-white border border-gray-200 text-gray-700">
                                        <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80 mb-2">
                                            Admin
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce" />
                                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]" />
                                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-100 bg-white p-5">
                    <div className="flex flex-col md:flex-row gap-3">
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
                            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#f4e2a0]"
                        />

                        <button
                            type="button"
                            onClick={handleSendMessage}
                            className="px-6 py-3 rounded-2xl bg-[#0f4d3c] text-white font-semibold hover:bg-[#0c3f31] transition"
                        >
                            Send Message
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                        This chat saves your inquiries in the current client account.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ClientInquiries;