import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import "../styles/PurchaseRequestModal.css";

function PurchaseRequestModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  loading,
}) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(message);
    }
  };

  return (
    <div className="purchase-overlay" onClick={onClose}>
      <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="purchase-header">
          <div>
            <h2>Send Purchase Request</h2>
            <p className="purchase-text">
              Your request will be sent to the seller. If accepted, this item will be reserved for you.
            </p>
          </div>

          <button
            type="button"
            className="purchase-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="purchase-product">
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.title}
          />
          <div className="purchase-product-meta">
            <h3>{product.title}</h3>
            <span className="purchase-product-price">
              ₹{Number(product.price || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="purchase-message" className="purchase-label">
            Message to Seller (Optional)
          </label>

          <textarea
            id="purchase-message"
            rows={4}
            className="purchase-textarea"
            placeholder="Hi! I'm interested in buying this item. Is it available for pick-up this week?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="purchase-actions">
            <button
              type="button"
              className="purchase-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="purchase-btn-submit"
              disabled={loading}
            >
              <Send size={15} />
              <span>{loading ? "Sending..." : "Submit Request"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseRequestModal;
