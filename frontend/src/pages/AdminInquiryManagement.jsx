import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquareText,
    Mail,
    Trash2,
    Send,
    UserRound,
    ShieldCheck,
    Sparkles,
    Clock3,
    ChevronRight,
    AlertTriangle,
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

function formatDateTime(dateString) {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getAllInquiryThreads() {
    const threads = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (!key || !key.startsWith("clientInquiries_")) continue;

        const messages = safeParse(key, []);
        if (!Array.isArray(messages) || messages.length === 0) continue;

        const clientMessages = messages.filter((msg) => msg.sender === "client");
        const adminMessages = messages.filter((msg) => msg.sender === "admin");

        const latestMessage =
            [...messages].sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            )[0] || null;

        const firstClientMessage = clientMessages[0] || messages[0] || null;

        const email =
            firstClientMessage?.email ||
            key.replace("clientInquiries_", "") ||
            "Unknown";

        const clientName =
            firstClientMessage?.senderName ||
            firstClientMessage?.name ||
            "Client";

        threads.push({
            storageKey: key,
            email,
            clientName,
            messages,
            clientMessageCount: clientMessages.length,
            adminMessageCount: adminMessages.length,
            latestMessage,
            latestAt: latestMessage?.createdAt || null,
        });
    }

    return threads.sort(
        (a, b) => new Date(b.latestAt || 0) - new Date(a.latestAt || 0)
    );
}

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

function AdminInquiryManagement() {
    const [threads, setThreads] = useState([]);
    const [selectedThreadKey, setSelectedThreadKey] = useState("");
    const [replyText, setReplyText] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const loadThreads = () => {
        const allThreads = getAllInquiryThreads();
        setThreads(allThreads);

        if (!selectedThreadKey && allThreads.length > 0) {
            setSelectedThreadKey(allThreads[0].storageKey);
            return;
        }

        if (
            selectedThreadKey &&
            !allThreads.some((thread) => thread.storageKey === selectedThreadKey)
        ) {
            setSelectedThreadKey(allThreads[0]?.storageKey || "");
        }
    };

    useEffect(() => {
        loadThreads();

        const interval = setInterval(() => {
            loadThreads();
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedThreadKey]);

    const selectedThread = useMemo(() => {
        return (
            threads.find((thread) => thread.storageKey === selectedThreadKey) || null
        );
    }, [threads, selectedThreadKey]);

    const pendingThreadCount = useMemo(() => {
        return threads.filter((thread) => thread.adminMessageCount === 0).length;
    }, [threads]);

    const repliedThreadCount = useMemo(() => {
        return threads.filter((thread) => thread.adminMessageCount > 0).length;
    }, [threads]);

    const handleSendReply = () => {
        const trimmed = replyText.trim();
        if (!trimmed || !selectedThread) return;

        const cleanedMessages = selectedThread.messages.filter(
            (message) =>
                !(
                    message.sender === "admin" &&
                    message.text === DEFAULT_ACKNOWLEDGMENT
                )
        );

        const updatedMessages = [
            ...cleanedMessages,
            {
                id: `ADM-${Date.now()}`,
                sender: "admin",
                senderName: "Ebit's Admin",
                email: selectedThread.email,
                text: trimmed,
                createdAt: new Date().toISOString(),
                status: "delivered",
            },
        ];

        localStorage.setItem(
            selectedThread.storageKey,
            JSON.stringify(updatedMessages)
        );

        setReplyText("");
        loadThreads();
    };

    const handleDeleteConversation = () => {
        if (!selectedThread) return;

        localStorage.removeItem(selectedThread.storageKey);

        setShowDeleteModal(false);
        setReplyText("");
        setSelectedThreadKey("");
        loadThreads();
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <motion.section
                variants={fadeUp}
                className="relative overflow-hidden rounded-[30px] border border-[#d9e6e0] bg-white shadow-[0_18px_45px_rgba(15,77,60,0.08)]"
            >
                <div className="pointer-events-none absolute inset-0">
                    <motion.div
                        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.22, 0.15] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-12 right-[-50px] h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.16, 0.08] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                        className="absolute bottom-[-30px] left-[-20px] h-32 w-32 rounded-full bg-[#22b67f]/10 blur-3xl"
                    />
                </div>

                <div className="relative bg-[linear-gradient(135deg,#0b5a43_0%,#0f6d51_55%,#138062_100%)] px-6 py-8 text-white md:px-8 md:py-9">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                                <Sparkles size={14} />
                                Executive View
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
                                Inquiry Management
                            </h1>

                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 md:text-base">
                                Review client concerns, manage conversation threads, and
                                send clean professional replies in one premium admin
                                workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <TopStatCard
                                icon={<MessageSquareText size={18} />}
                                label="Total Threads"
                                value={threads.length}
                            />
                            <TopStatCard
                                icon={<Clock3 size={18} />}
                                label="Waiting Reply"
                                value={pendingThreadCount}
                            />
                            <TopStatCard
                                icon={<ShieldCheck size={18} />}
                                label="Replied"
                                value={repliedThreadCount}
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            {threads.length === 0 ? (
                <motion.div
                    variants={fadeUp}
                    className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_14px_35px_rgba(15,77,60,0.06)]"
                >
                    <div className="px-6 py-14 text-center md:px-8">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f4d3c_0%,#138062_100%)] text-white shadow-lg">
                            <MessageSquareText className="h-9 w-9" />
                        </div>

                        <h2 className="mt-6 text-3xl font-extrabold text-[#0f4d3c]">
                            No inquiries yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                            Client messages will appear here once they send an inquiry.
                            This page will help you monitor, review, and respond to each
                            conversation professionally.
                        </p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
                    <motion.div
                        variants={fadeUp}
                        className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_14px_35px_rgba(15,77,60,0.06)]"
                    >
                        <div className="border-b border-[#edf2ef] bg-[linear-gradient(135deg,#0c5a43_0%,#106d50_100%)] px-5 py-5 text-white">
                            <h2 className="text-xl font-extrabold">Client Threads</h2>
                            <p className="mt-1 text-sm text-white/80">
                                Select a client conversation to review the full inquiry.
                            </p>
                        </div>

                        <div className="max-h-[700px] overflow-y-auto p-3">
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {threads.map((thread, index) => {
                                        const isActive =
                                            selectedThreadKey === thread.storageKey;
                                        const waitingReply = thread.adminMessageCount === 0;

                                        return (
                                            <motion.button
                                                layout
                                                key={thread.storageKey}
                                                variants={fadeUp}
                                                initial="hidden"
                                                animate="show"
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ delay: index * 0.02 }}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedThreadKey(thread.storageKey)
                                                }
                                                whileHover={{ y: -3, scale: 1.01 }}
                                                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${isActive
                                                        ? "border-[#d4af37] bg-[linear-gradient(135deg,#fff8e6_0%,#fffdf6_100%)] shadow-sm"
                                                        : "border-[#e6eeea] bg-white hover:border-[#cfe0d8] hover:bg-[#fbfdfc]"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-base font-bold text-[#0f4d3c]">
                                                                {thread.clientName}
                                                            </p>

                                                            {waitingReply && (
                                                                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 flex items-center gap-2 truncate text-xs text-slate-500">
                                                            <Mail size={12} />
                                                            {thread.email}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="inline-flex min-w-[34px] items-center justify-center rounded-full bg-[#0f4d3c] px-2.5 py-1 text-xs font-semibold text-white">
                                                            {thread.clientMessageCount}
                                                        </span>
                                                        <motion.div
                                                            animate={{
                                                                x: isActive ? 4 : 0,
                                                            }}
                                                            transition={{ duration: 0.22 }}
                                                        >
                                                            <ChevronRight
                                                                size={16}
                                                                className={`text-slate-400 transition ${isActive ? "text-[#0f4d3c]" : ""
                                                                    }`}
                                                            />
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                                    {thread.latestMessage?.text || "No message"}
                                                </p>

                                                <p className="mt-3 text-xs text-slate-400">
                                                    {formatDateTime(thread.latestAt)}
                                                </p>
                                            </motion.button>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_14px_35px_rgba(15,77,60,0.06)]"
                    >
                        {!selectedThread ? (
                            <div className="px-6 py-16 text-center text-slate-500">
                                Select a conversation to view messages.
                            </div>
                        ) : (
                            <>
                                <div className="border-b border-[#edf2ef] bg-[linear-gradient(135deg,#0b5a43_0%,#0f6b50_58%,#138062_100%)] px-6 py-6 text-white md:px-7">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                                                Active Conversation
                                            </p>
                                            <h2 className="mt-2 text-3xl font-extrabold">
                                                {selectedThread.clientName}
                                            </h2>
                                            <p className="mt-2 text-sm text-white/80">
                                                {selectedThread.email}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur-md">
                                                {selectedThread.clientMessageCount} client message(s) •{" "}
                                                {selectedThread.adminMessageCount} admin repl
                                                {selectedThread.adminMessageCount === 1
                                                    ? "y"
                                                    : "ies"}
                                            </div>

                                            <motion.button
                                                whileTap={{ scale: 0.985 }}
                                                type="button"
                                                onClick={() => setShowDeleteModal(true)}
                                                className="inline-flex items-center gap-2 rounded-[20px] bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-h-[520px] max-h-[520px] space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f8fbfa_0%,#f5f8f7_100%)] p-5 md:p-6">
                                    <AnimatePresence mode="popLayout">
                                        {selectedThread.messages.map((message) => {
                                            const isAdmin = message.sender === "admin";

                                            return (
                                                <motion.div
                                                    layout
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    transition={{
                                                        duration: 0.34,
                                                        ease: [0.22, 1, 0.36, 1],
                                                    }}
                                                    className={`flex ${isAdmin ? "justify-end" : "justify-start"
                                                        }`}
                                                >
                                                    <div
                                                        className={`max-w-[88%] rounded-[24px] px-4 py-4 shadow-sm md:max-w-[72%] ${isAdmin
                                                                ? "border border-[#e7d18c] bg-[linear-gradient(135deg,#fff4ca_0%,#f6dfa0_100%)] text-[#0f4d3c]"
                                                                : "border border-[#e6ece9] bg-white text-slate-700"
                                                            }`}
                                                    >
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <div
                                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${isAdmin
                                                                        ? "bg-[#0f4d3c] text-white"
                                                                        : "bg-[#eef5f1] text-[#0f4d3c]"
                                                                    }`}
                                                            >
                                                                {isAdmin ? (
                                                                    <ShieldCheck size={15} />
                                                                ) : (
                                                                    <UserRound size={15} />
                                                                )}
                                                            </div>

                                                            <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">
                                                                {isAdmin
                                                                    ? message.senderName || "Admin"
                                                                    : message.senderName || "Client"}
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
                                    </AnimatePresence>
                                </div>

                                <div className="border-t border-[#edf2ef] bg-white p-5 md:p-6">
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSendReply();
                                                    }
                                                }}
                                                placeholder="Type your reply here..."
                                                className="w-full rounded-[22px] border border-[#d5dfda] bg-[#fbfcfc] px-4 py-3.5 pr-12 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#f6e7b0]"
                                            />
                                            <Send
                                                size={17}
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.985 }}
                                            type="button"
                                            onClick={handleSendReply}
                                            className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#0f4d3c_0%,#137255_100%)] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <Send size={16} />
                                            Send Reply
                                        </motion.button>
                                    </div>

                                    <p className="mt-3 text-xs text-slate-400">
                                        Replies sent here will also appear in the client inquiry
                                        page.
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {showDeleteModal && selectedThread && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-[3px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-[0_30px_70px_rgba(0,0,0,0.28)]"
                        >
                            <div className="bg-[linear-gradient(135deg,#dc2626_0%,#ef4444_100%)] px-6 py-5 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                                        <AlertTriangle size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                                            Critical Action
                                        </p>
                                        <h2 className="mt-1 text-2xl font-extrabold">
                                            Delete Conversation
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="leading-7 text-slate-600">
                                    Are you sure you want to permanently remove the
                                    conversation of{" "}
                                    <span className="font-semibold text-[#0f4d3c]">
                                        {selectedThread.clientName}
                                    </span>
                                    ? This action cannot be undone.
                                </p>

                                <div className="mt-6 flex justify-end gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.985 }}
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="rounded-xl border border-gray-200 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.985 }}
                                        type="button"
                                        onClick={handleDeleteConversation}
                                        className="rounded-xl bg-red-500 px-5 py-2.5 font-semibold text-white transition hover:bg-red-600"
                                    >
                                        Delete
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function TopStatCard({ icon, label, value }) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                    {icon}
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-white">
                        {value}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default AdminInquiryManagement;