import { useEffect, useMemo, useState } from "react";

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
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-[#0f4d3c]">
                    Inquiry Management
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage client inquiries and send replies in one place.
                </p>
            </div>

            {threads.length === 0 ? (
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#0f4d3c] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                        💬
                    </div>
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">
                        No inquiries yet
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Client messages will appear here once they send an inquiry.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-[#0f4d3c] text-white">
                            <h2 className="text-xl font-bold">Client Threads</h2>
                            <p className="text-sm text-white/80 mt-1">
                                Select a client conversation.
                            </p>
                        </div>

                        <div className="max-h-[680px] overflow-y-auto">
                            {threads.map((thread) => {
                                const isActive =
                                    selectedThreadKey === thread.storageKey;

                                return (
                                    <button
                                        key={thread.storageKey}
                                        type="button"
                                        onClick={() =>
                                            setSelectedThreadKey(thread.storageKey)
                                        }
                                        className={`w-full text-left px-5 py-4 border-b border-gray-100 transition ${isActive
                                                ? "bg-[#fff8e6]"
                                                : "bg-white hover:bg-[#f8fafc]"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-base font-bold text-[#0f4d3c] truncate">
                                                    {thread.clientName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-1">
                                                    {thread.email}
                                                </p>
                                            </div>

                                            <span className="px-2.5 py-1 rounded-full bg-[#0f4d3c] text-white text-xs font-semibold">
                                                {thread.clientMessageCount}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                            {thread.latestMessage?.text || "No message"}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-2">
                                            {formatDateTime(thread.latestAt)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                        {!selectedThread ? (
                            <div className="p-10 text-center text-gray-500">
                                Select a conversation to view messages.
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#0b5a43] to-[#0f6b50] text-white">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="uppercase tracking-[0.22em] text-xs text-white/70">
                                                Active Conversation
                                            </p>
                                            <h2 className="text-2xl font-extrabold mt-1">
                                                {selectedThread.clientName}
                                            </h2>
                                            <p className="text-sm text-white/80 mt-1">
                                                {selectedThread.email}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm">
                                                {selectedThread.clientMessageCount} client
                                                message(s) • {selectedThread.adminMessageCount} admin
                                                repl
                                                {selectedThread.adminMessageCount === 1
                                                    ? "y"
                                                    : "ies"}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteModal(true)}
                                                className="px-4 py-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#f8fafc] p-5 md:p-6 min-h-[500px] max-h-[500px] overflow-y-auto space-y-4">
                                    {selectedThread.messages.map((message) => {
                                        const isAdmin = message.sender === "admin";

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isAdmin
                                                        ? "justify-end"
                                                        : "justify-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[85%] md:max-w-[70%] rounded-[24px] px-4 py-3 shadow-sm ${isAdmin
                                                            ? "bg-[#d4af37] text-[#0f4d3c]"
                                                            : "bg-white border border-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80 mb-2">
                                                        {isAdmin
                                                            ? message.senderName || "Admin"
                                                            : message.senderName || "Client"}
                                                    </p>

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
                                </div>

                                <div className="border-t border-gray-100 bg-white p-5">
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) =>
                                                setReplyText(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSendReply();
                                                }
                                            }}
                                            placeholder="Type your reply here..."
                                            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#f4e2a0]"
                                        />

                                        <button
                                            type="button"
                                            onClick={handleSendReply}
                                            className="px-6 py-3 rounded-2xl bg-[#0f4d3c] text-white font-semibold hover:bg-[#0c3f31] transition"
                                        >
                                            Send Reply
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-3">
                                        Replies sent here will also appear in the client inquiry
                                        page.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showDeleteModal && selectedThread && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
                        <div className="bg-red-500 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">
                                Delete Conversation
                            </h2>
                            <p className="text-sm text-white/90 mt-1">
                                This will permanently remove this inquiry thread.
                            </p>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 leading-7">
                                Are you sure you want to delete the conversation of{" "}
                                <span className="font-semibold text-[#0f4d3c]">
                                    {selectedThread.clientName}
                                </span>
                                ? This action cannot be undone.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDeleteConversation}
                                    className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminInquiryManagement;