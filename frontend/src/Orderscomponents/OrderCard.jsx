import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faCheckCircle,
  faClock,
  faUser,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

function OrderCard({ order, orders, type, refreshOrders }) {
  const [processing, setProcessing] = useState(false);

  async function updateOrder(orderId, action) {
    try {
      setProcessing(true);
      const res = await api.put(`/orders/${orderId}/${action}`, {});
      toast.success(res.data?.msg || `Order ${action}ed successfully.`);
      if (refreshOrders) refreshOrders();
    } catch (err) {
      console.error("Order action error:", err);
      toast.error(err.response?.data?.msg || `Failed to ${action} order.`);
    } finally {
      setProcessing(false);
    }
  }

  /* ==========================================
     PURCHASE CARD (BUYER VIEW)
  ========================================== */
  if (type === "purchase" && order) {
    const product = order.product || {};
    const fallbackImg =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60";

    return (
      <div className="order-card">
        <img
          className="order-image"
          src={product.images?.[0] || fallbackImg}
          alt={product.title || "Product"}
          loading="lazy"
        />

        <div className="order-info">
          <div className="order-title-row">
            <h3>{product.title || "Product (Archived/Removed)"}</h3>
            <span className={`status ${order.status}`}>{order.status}</span>
          </div>

          <div className="order-price">₹{order.offeredPrice?.toLocaleString()}</div>

          <div className="order-details-grid">
            <p>
              <FontAwesomeIcon icon={faUser} className="detail-icon" />
              <strong>Seller:</strong> {order.seller?.name || "Marketplace Seller"}
            </p>

            <p>
              <FontAwesomeIcon icon={faClock} className="detail-icon" />
              <strong>Requested On:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

            {order.buyerMessage && (
              <p className="order-buyer-note">
                <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                <strong>Note to Seller:</strong> &ldquo;{order.buyerMessage}&rdquo;
              </p>
            )}
          </div>

          {order.status === "requested" && (
            <div className="order-card-actions">
              <button
                className="cancel-request-btn"
                onClick={() => updateOrder(order._id, "cancel")}
                disabled={processing}
                type="button"
              >
                Cancel Request
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================
     SOLD / GROUPED CARD (SELLER VIEW)
  ========================================== */
  if (!orders || orders.length === 0) return null;

  const product = orders[0]?.product || {
    title: "Product (Archived/Deleted)",
    price: orders[0]?.offeredPrice || 0,
    images: [],
  };

  const reservedOrder = orders.find((o) => o.status === "reserved");
  const completedOrder = orders.find((o) => o.status === "completed");
  const pendingOrders = orders.filter((o) => o.status === "requested");

  const fallbackImg =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60";

  return (
    <div className="order-card grouped-card">
      <div className="group-header">
        <img
          className="order-image"
          src={product.images?.[0] || fallbackImg}
          alt={product.title}
          loading="lazy"
        />

        <div className="group-info">
          <div className="group-title-row">
            <h3>{product.title}</h3>
            {reservedOrder ? (
              <span className="status reserved">Reserved</span>
            ) : completedOrder ? (
              <span className="status completed">Sale Completed</span>
            ) : (
              <span className="request-count">
                {pendingOrders.length} Pending Offer{pendingOrders.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <p className="order-price">₹{product.price?.toLocaleString()}</p>
        </div>
      </div>

      {/* RESERVED SECTION */}
      {reservedOrder && (
        <div className="reserved-section">
          <div className="reserved-badge-row">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Reserved for {reservedOrder.buyer?.name || "Buyer"}</span>
          </div>

          <div className="buyer-note-box">
            <p>
              <strong>Buyer Contact:</strong> {reservedOrder.buyer?.email || "Email protected"}
            </p>
            {reservedOrder.buyerMessage && (
              <p>
                <strong>Buyer Message:</strong> &ldquo;{reservedOrder.buyerMessage}&rdquo;
              </p>
            )}
          </div>

          <button
            className="complete-btn"
            onClick={() => updateOrder(reservedOrder._id, "complete")}
            disabled={processing}
            type="button"
          >
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8 }} />
            Mark As Sale Completed
          </button>
        </div>
      )}

      {/* PENDING BUYERS LIST */}
      {!reservedOrder && !completedOrder && pendingOrders.length > 0 && (
        <div className="buyer-list">
          <h4 className="buyer-list-title">Incoming Buyer Requests</h4>
          {pendingOrders.map((buyerOrder) => (
            <div className="buyer-row" key={buyerOrder._id}>
              <div className="buyer-info">
                <h4>{buyerOrder.buyer?.name || "Interested Buyer"}</h4>
                {buyerOrder.buyerMessage && (
                  <p className="buyer-message-text">
                    &ldquo;{buyerOrder.buyerMessage}&rdquo;
                  </p>
                )}
                <span className="buyer-timestamp">
                  {new Date(buyerOrder.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="buyer-actions">
                <button
                  className="reject-btn"
                  onClick={() => updateOrder(buyerOrder._id, "reject")}
                  disabled={processing}
                  type="button"
                >
                  <FontAwesomeIcon icon={faXmark} style={{ marginRight: 6 }} />
                  Decline
                </button>

                <button
                  className="accept-btn"
                  onClick={() => updateOrder(buyerOrder._id, "accept")}
                  disabled={processing}
                  type="button"
                >
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
                  Accept & Reserve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderCard;
