import { ArrowLeft, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../utils/avatar";
import "../styles/Chat.css";

function ChatHeader({ chat, onBack }) {
  const user = chat?.chatUser;
  const product = chat?.itemId;

  return (
    <div className="chat-header">
      <div className="chat-header-left">
        {onBack && (
          <button
            type="button"
            className="chat-back-btn"
            onClick={onBack}
            aria-label="Back to conversations"
            title="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="chat-header-avatar">
          <img
            src={getAvatarUrl(user)}
            alt={user?.name || "User"}
          />
          {chat?.online && <span className="online-dot" />}
        </div>

        <div className="chat-user-details">
          <h3>{user?.name || "Marketplace User"}</h3>
          <span className={`status ${chat?.online ? "online" : "offline"}`}>
            {chat?.online ? "Active Now" : (user?.location || "SmallThings Member")}
          </span>
        </div>
      </div>

      {product && (
        <div className="chat-header-product">
          <div className="chat-product-thumb">
            {product.images && product.images[0] ? (
              <img src={product.images[0]} alt={product.title} />
            ) : (
              <Package size={18} />
            )}
          </div>
          <div className="chat-product-info">
            <span className="chat-product-title">{product.title}</span>
            <span className="chat-product-price">₹{Number(product.price || 0).toLocaleString()}</span>
          </div>
          <Link
            to={`/product/${product._id}`}
            className="chat-view-item-btn"
            target="_blank"
            rel="noreferrer"
          >
            View
          </Link>
        </div>
      )}
    </div>
  );
}

export default ChatHeader;
