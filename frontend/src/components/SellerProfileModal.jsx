import { useNavigate } from "react-router-dom";
import { MapPin, MessageCircle, X } from "lucide-react";
import { startConversation } from "../services/chatService";
import { getAvatarUrl } from "../utils/avatar";
import "../styles/SellerProfileModal.css";

function SellerProfileModal({
  seller,
  productId,
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();

  if (!isOpen || !seller) return null;

  async function handleMessageSeller() {
    try {
      const res = await startConversation(seller._id, productId || null);
      onClose();
      navigate("/chat", {
        state: {
          conversationId: res.data._id,
          initialChat: res.data,
        },
      });
    } catch (err) {
      console.error("SellerProfileModal start chat error:", err);
    }
  }

  const joinedYear = seller.createdAt
    ? new Date(seller.createdAt).getFullYear()
    : "2025";

  return (
    <div className="seller-modal-overlay" onClick={onClose}>
      <div className="seller-modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="seller-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="seller-cover" />

        <div className="seller-top">
          <img
            className="seller-avatar"
            src={getAvatarUrl(seller)}
            alt={seller.name || "Seller"}
          />

          <h2>{seller.name || "Marketplace Seller"}</h2>

          <p className="seller-location">
            <MapPin size={15} />
            <span>{seller.location || "India"}</span>
          </p>
        </div>

        <div className="seller-stats">
          <div>
            <h3>Member</h3>
            <span>Since {joinedYear}</span>
          </div>
          <div>
            <h3>Verified</h3>
            <span>Community Seller</span>
          </div>
        </div>

        <div className="seller-bio-box">
          <h4>About Seller</h4>
          <p>{seller.bio || "This seller hasn't added a bio yet."}</p>
        </div>

        <div className="seller-modal-footer">
          <button
            type="button"
            className="seller-message-btn"
            onClick={handleMessageSeller}
          >
            <MessageCircle size={16} />
            <span>Chat with Seller</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerProfileModal;
