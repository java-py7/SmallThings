import OrderCard from "./OrderCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function SoldItemsTab({ orders = [], refreshOrders }) {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <div className="empty-icon-wrap">
          <FontAwesomeIcon icon={faStore} size="2x" />
        </div>
        <h2>No Sales Requests Yet</h2>
        <p>
          Nobody has requested to buy your products yet. Keep your listings active
          with high-quality photos and fair pricing to attract buyers.
        </p>
        <button
          className="explore-btn"
          onClick={() => navigate("/listings")}
          type="button"
        >
          View My Listings
        </button>
      </div>
    );
  }

  // Safely group orders by product
  const groupedProducts = {};

  orders.forEach((order) => {
    const productId = order.product?._id
      ? order.product._id.toString()
      : `archived_${order._id}`;

    if (!groupedProducts[productId]) {
      groupedProducts[productId] = [];
    }

    groupedProducts[productId].push(order);
  });

  return (
    <div className="orders-grid">
      {Object.entries(groupedProducts).map(([key, group]) => (
        <OrderCard
          key={key}
          orders={group}
          type="sold"
          refreshOrders={refreshOrders}
        />
      ))}
    </div>
  );
}

export default SoldItemsTab;
