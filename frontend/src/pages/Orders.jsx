import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import PurchasesTab from "../Orderscomponents/PurchasesTab";
import SoldItemsTab from "../Orderscomponents/SoldItemsTab";
import api from "../services/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faStore } from "@fortawesome/free-solid-svg-icons";

import "../styles/Orders.css";

function Orders() {
  const [activeTab, setActiveTab] = useState("purchases");
  const [purchases, setPurchases] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const [purchaseRes, soldRes] = await Promise.all([
        api.get("/orders/purchases"),
        api.get("/orders/sold"),
      ]);

      setPurchases(purchaseRes.data || []);
      setSoldItems(soldRes.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Layout>
      <div className="orders-page">
        <div className="orders-header">
          <h1>Order Activity</h1>
          <p>Track your purchase requests and manage incoming buyer offers</p>
        </div>

        <div className="orders-tabs">
          <button
            className={`tab ${activeTab === "purchases" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("purchases")}
            type="button"
          >
            <FontAwesomeIcon icon={faShoppingBag} style={{ marginRight: 8 }} />
            <span>My Purchases</span>
            <span className="tab-badge">{purchases.length}</span>
          </button>

          <button
            className={`tab ${activeTab === "sold" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("sold")}
            type="button"
          >
            <FontAwesomeIcon icon={faStore} style={{ marginRight: 8 }} />
            <span>Incoming Sale Requests</span>
            <span className="tab-badge">{soldItems.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="orders-loading">
            <div className="spinner-lg" />
            <p>Loading your orders...</p>
          </div>
        ) : activeTab === "purchases" ? (
          <PurchasesTab orders={purchases} />
        ) : (
          <SoldItemsTab orders={soldItems} refreshOrders={fetchOrders} />
        )}
      </div>
    </Layout>
  );
}

export default Orders;
