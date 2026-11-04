import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getAvatarUrl } from "../utils/avatar";
import "../styles/Chat.css";

function ChatSidebar({
    chats = [],
    selectedChat,
    onSelect,
    loading,
}) {
    const [search, setSearch] = useState("");

    const filteredChats = useMemo(() => {
        return (chats || []).filter(chat => {
            const name = chat?.chatUser?.name || "";
            const email = chat?.chatUser?.email || "";
            const q = search.toLowerCase();
            return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
        });
    }, [search, chats]);

    const formatTime = (date) => {
        if (!date) return "";
        try {
            const d = new Date(date);
            const now = new Date();
            const isToday = d.toDateString() === now.toDateString();

            if (isToday) {
                return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
            return d.toLocaleDateString([], { month: "short", day: "numeric" });
        } catch {
            return "";
        }
    };

    return (
        <aside className="chat-sidebar">
            <div className="chat-sidebar-header">
                <h2>Messages</h2>
                <p>Buyer & Seller Conversations</p>
            </div>

            <div className="chat-search">
                <Search size={16} className="chat-search-icon" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="chat-list">
                {loading ? (
                    <div className="chat-empty-list">
                        <div className="chat-loading-spinner" />
                        <p>Loading conversations...</p>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="chat-empty-list">
                        {search ? "No matching conversations found." : "No conversations yet."}
                    </div>
                ) : (
                    filteredChats.map(chat => (
                        <div
                            key={chat._id}
                            className={`chat-item ${selectedChat?._id === chat._id ? "active" : ""}`}
                            onClick={() => onSelect(chat)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    onSelect(chat);
                                }
                            }}
                        >
                            <div className="chat-avatar-wrapper">
                                <img
                                    src={getAvatarUrl(chat.chatUser)}
                                    alt={chat.chatUser?.name || "User"}
                                    className="chat-avatar"
                                />
                                {chat.online && <span className="online-dot" />}
                            </div>

                            <div className="chat-info">
                                <div className="chat-top-row">
                                    <h4>{chat.chatUser?.name || "Anonymous"}</h4>
                                    <span className="chat-time">
                                        {formatTime(chat.lastMessageAt || chat.updatedAt)}
                                    </span>
                                </div>

                                {chat.itemId?.title && (
                                    <div className="chat-item-pill">
                                        {chat.itemId.title}
                                    </div>
                                )}

                                <span className="chat-last-message">
                                    {chat.lastMessage || "Click to start chatting"}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

export default ChatSidebar;
