import OrderCard from "./OrderCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function PurchasesTab({ orders = [] }) {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <div className="empty-icon-wrap">
          <FontAwesomeIcon icon={faShoppingBag} size="2x" />
        </div>
        <h2>No Purchases Yet</h2>
        <p>
          You haven&apos;t sent any purchase requests yet. Browse the marketplace
          to discover items from local and independent sellers.
        </p>
        <button
          className="explore-btn"
          onClick={() => navigate("/marketplace")}
          type="button"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="orders-grid">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} type="purchase" />
      ))}
    </div>
  );
}

export default PurchasesTab;
