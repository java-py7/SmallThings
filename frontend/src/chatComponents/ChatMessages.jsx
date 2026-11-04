import { useEffect, useRef } from "react";
import { getAvatarUrl } from "../utils/avatar";
import "../styles/Chat.css";

function ChatMessages({
    chat,
    messages = [],
    currentUser,
    loading,
}) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const formatTime = (date) => {
        if (!date) return "";
        try {
            return new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        try {
            const today = new Date();
            const d = new Date(date);
            if (today.toDateString() === d.toDateString()) return "Today";

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (yesterday.toDateString() === d.toDateString()) return "Yesterday";

            return d.toLocaleDateString([], {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "";
        }
    };

    if (loading) {
        return (
            <div className="chat-messages loading-messages">
                <div className="chat-loading-spinner" />
                <p>Loading conversation...</p>
            </div>
        );
    }

    if (!messages.length) {
        return (
            <div className="chat-messages empty-chat">
                <div className="chat-date-divider">
                    <span>Direct Buyer-Seller Channel</span>
                </div>
                <div className="empty-message-box">
                    <p>No messages yet.</p>
                    <span>Say hello or make an offer on this listing!</span>
                </div>
            </div>
        );
    }

    const currentUserId = currentUser?.id || currentUser?._id;

    return (
        <div className="chat-messages">
            {messages.map((message, index) => {
                const senderId =
                    typeof message.sender === "object"
                        ? message.sender?._id
                        : message.sender;

                const isMe = Boolean(currentUserId && senderId === currentUserId);
                const currentDate = formatDate(message.createdAt);
                const prevDate = index > 0 ? formatDate(messages[index - 1]?.createdAt) : null;
                const showDate = currentDate !== prevDate;

                return (
                    <div key={message._id || index} className="message-group">
                        {showDate && (
                            <div className="chat-date-divider">
                                <span>{currentDate}</span>
                            </div>
                        )}

                        <div className={`message-row ${isMe ? "sent" : "received"}`}>
                            {!isMe && (
                                <img
                                    src={getAvatarUrl(chat?.chatUser)}
                                    alt={chat?.chatUser?.name || "User"}
                                    className="message-avatar"
                                />
                            )}

                            <div className="message-content">
                                <div className={`message-bubble ${isMe ? "sent-bubble" : "received-bubble"}`}>
                                    {message.text}
                                </div>
                                <span className="message-time">
                                    {formatTime(message.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}

export default ChatMessages;
