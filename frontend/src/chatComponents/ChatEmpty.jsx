import { MessageSquare, ShieldCheck, Zap } from "lucide-react";
import "../styles/Chat.css";

function ChatEmpty() {
  return (
    <div className="chat-empty">
      <div className="chat-empty-icon">
        <MessageSquare size={36} />
      </div>

      <h2>Your Messages</h2>
      <p>
        Select a conversation from the left to start negotiating, asking product questions, or coordinating local pick-up.
      </p>

      <div className="chat-empty-cards-grid">
        <div className="chat-empty-card">
          <div className="chat-empty-card-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4>Safe Direct Messaging</h4>
            <span>Communicate safely with verified buyers and sellers in your community.</span>
          </div>
        </div>

        <div className="chat-empty-card">
          <div className="chat-empty-card-icon">
            <Zap size={20} />
          </div>
          <div>
            <h4>Real-Time Sync</h4>
            <span>Instant delivery powered by WebSockets so you never miss a counter-offer.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatEmpty;
