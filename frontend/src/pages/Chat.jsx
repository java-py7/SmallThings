import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import ChatSidebar from "../chatComponents/ChatSidebar";
import ChatHeader from "../chatComponents/ChatHeader";
import ChatMessages from "../chatComponents/ChatMessages";
import ChatInput from "../chatComponents/ChatInput";
import ChatEmpty from "../chatComponents/ChatEmpty";
import {
    getConversations,
    getMessages,
    sendMessage,
} from "../services/chatService";
import socket, { connectSocket, disconnectSocket } from "../socket";
import "../styles/Chat.css";

function Chat() {
    const [currentUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    });

    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);

    const location = useLocation();
    const currentUserId = currentUser?.id || currentUser?._id;

    const selectedChatRef = useRef(null);
    const hasAutoOpenedRef = useRef(false);
    const targetConversationId = location.state?.conversationId;
    const initialChatFromState = location.state?.initialChat;

    // Keep selectedChatRef synchronized without causing re-renders
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    /*
    ========================================
    CONNECT SOCKET (ONCE ON MOUNT)
    ========================================
    */
    useEffect(() => {
        connectSocket();
        return () => {
            disconnectSocket();
        };
    }, []);

    /*
    ========================================
    OPEN CHAT (STABLE CALLBACK, NO RE-RENDERS)
    ========================================
    */
    const openConversation = useCallback(async (chat) => {
        if (!chat || !chat._id) return;

        // If clicking the currently open chat, avoid reloading messages
        if (selectedChatRef.current?._id === chat._id && messages.length > 0) {
            return;
        }

        try {
            if (selectedChatRef.current && selectedChatRef.current._id !== chat._id) {
                socket.emit("leaveConversation", selectedChatRef.current._id);
            }

            socket.emit("joinConversation", chat._id);
            setSelectedChat(chat);
            selectedChatRef.current = chat;
            setLoadingMessages(true);

            const res = await getMessages(chat._id);
            setMessages(res.data || []);
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setLoadingMessages(false);
        }
    }, [messages.length]);

    /*
    ========================================
    LOAD CONVERSATIONS (RUNS ONCE ON MOUNT)
    ========================================
    */
    useEffect(() => {
        let isMounted = true;

        async function initConversations() {
            try {
                setLoadingChats(true);
                const res = await getConversations();
                if (!isMounted) return;

                let conversations = (res.data || []).map((conversation) => {
                    const buyerId = conversation.buyer?._id || conversation.buyer;
                    const isBuyer = buyerId === currentUserId;
                    const chatUser = isBuyer ? conversation.seller : conversation.buyer;

                    return {
                        ...conversation,
                        chatUser,
                    };
                });

                // If navigated with initialChat, ensure it is in the list
                if (initialChatFromState && !conversations.some((c) => c._id === initialChatFromState._id)) {
                    const buyerId = initialChatFromState.buyer?._id || initialChatFromState.buyer;
                    const isBuyer = buyerId === currentUserId;
                    const chatUser = isBuyer ? initialChatFromState.seller : initialChatFromState.buyer;
                    conversations = [{ ...initialChatFromState, chatUser }, ...conversations];
                }

                setChats(conversations);

                // Auto-open target conversation ONCE
                if (targetConversationId && !hasAutoOpenedRef.current) {
                    hasAutoOpenedRef.current = true;
                    const target = conversations.find((c) => c._id === targetConversationId);
                    if (target) {
                        openConversation(target);
                    } else if (initialChatFromState) {
                        openConversation(initialChatFromState);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch conversations:", err);
            } finally {
                if (isMounted) {
                    setLoadingChats(false);
                }
            }
        }

        initConversations();

        return () => {
            isMounted = false;
        };
    }, [currentUserId, targetConversationId, initialChatFromState, openConversation]);

    /*
    ========================================
    SOCKET EVENTS
    ========================================
    */
    useEffect(() => {
        function receiveMessage(message) {
            if (selectedChatRef.current && message.conversationId === selectedChatRef.current._id) {
                setMessages((prev) => {
                    const exists = prev.some((m) => m._id === message._id);
                    if (exists) return prev;
                    return [...prev, message];
                });
            }

            setChats((prev) => {
                const updated = prev.map((chat) =>
                    chat._id === message.conversationId
                        ? {
                              ...chat,
                              lastMessage: message.text,
                              lastMessageAt: message.createdAt,
                          }
                        : chat
                );

                return updated.sort(
                    (a, b) =>
                        new Date(b.lastMessageAt || 0) -
                        new Date(a.lastMessageAt || 0)
                );
            });
        }

        socket.on("newMessage", receiveMessage);

        return () => {
            socket.off("newMessage", receiveMessage);
        };
    }, []);

    /*
    ========================================
    SEND MESSAGE
    ========================================
    */
    async function handleSend(text) {
        if (!selectedChatRef.current) return;
        const currentChatId = selectedChatRef.current._id;

        try {
            const res = await sendMessage(currentChatId, text);

            setMessages((prev) => {
                const exists = prev.some((m) => m._id === res.data._id);
                if (exists) return prev;
                return [...prev, res.data];
            });

            setChats((prev) => {
                const updated = prev.map((chat) =>
                    chat._id === currentChatId
                        ? {
                              ...chat,
                              lastMessage: res.data.text,
                              lastMessageAt: res.data.createdAt,
                          }
                        : chat
                );

                return updated.sort(
                    (a, b) =>
                        new Date(b.lastMessageAt || 0) -
                        new Date(a.lastMessageAt || 0)
                );
            });
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    }

    return (
        <Layout>
            <div className="chat-page-wrapper">
                <div className={`chat-page ${selectedChat ? "has-active-chat" : ""}`}>
                    <ChatSidebar
                        chats={chats}
                        loading={loadingChats}
                        selectedChat={selectedChat}
                        onSelect={openConversation}
                    />

                    <div className="chat-main">
                        {selectedChat ? (
                            <>
                                <ChatHeader
                                    chat={selectedChat}
                                    onBack={() => {
                                        setSelectedChat(null);
                                        selectedChatRef.current = null;
                                    }}
                                />
                                <ChatMessages
                                    chat={selectedChat}
                                    messages={messages}
                                    loading={loadingMessages}
                                    currentUser={currentUser}
                                />
                                <ChatInput onSend={handleSend} />
                            </>
                        ) : (
                            <ChatEmpty />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Chat;
