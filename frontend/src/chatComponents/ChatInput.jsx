import { useState, useRef } from "react";
import { Send } from "lucide-react";
import "../styles/Chat.css";

function ChatInput({ onSend }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const textareaRef = useRef(null);

    async function handleSend() {
        const text = message.trim();
        if (!text || sending) return;

        try {
            setSending(true);
            await onSend(text);
            setMessage("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleChange(e) {
        setMessage(e.target.value);
        // Auto-grow height up to 120px
        const el = e.target;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }

    return (
        <form
            className="chat-input-container"
            onSubmit={(e) => {
                e.preventDefault();
                handleSend();
            }}
        >
            <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                rows={1}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />

            <button
                className="chat-send-btn"
                type="submit"
                disabled={!message.trim() || sending}
                title="Send Message"
                aria-label="Send Message"
            >
                <Send size={18} />
            </button>
        </form>
    );
}

export default ChatInput;
