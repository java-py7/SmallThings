import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import CreateListingModal from "../components/CreateListingModal";
import DeleteListingModal from "../components/DeleteListingModal";
import api from "../services/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPen,
  faTrash,
  faEye,
  faBookmark,
  faTableCellsLarge,
  faList,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

import "../styles/Listings.css";

function Listings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/me/listings");
      setProducts(res.data);
    } catch (err) {
      console.error("Listings fetch error:", err);
      toast.error("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete}`);
      toast.success("Listing deleted successfully.");
      fetchListings();
    } catch (err) {
      console.error("Delete listing error:", err);
      toast.error(err.response?.data?.msg || "Failed to delete listing.");
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });

  return (
    <>
      <Layout onSellItem={() => { setEditingProduct(null); setListingModalOpen(true); }}>
        <div className="listings-page">
          {/* TOPBAR */}
          <div className="listings-topbar">
            <div className="listings-title">
              <h1>My Listings</h1>
              <p>Manage, edit, and track your marketplace inventory</p>
            </div>

            <div className="topbar-right">
              {/* Status Filter */}
              <div className="status-filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  All ({products.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === "available" ? "active" : ""}`}
                  onClick={() => setStatusFilter("available")}
                >
                  Available ({products.filter((p) => p.status === "available").length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === "reserved" ? "active" : ""}`}
                  onClick={() => setStatusFilter("reserved")}
                >
                  Reserved ({products.filter((p) => p.status === "reserved").length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === "sold" ? "active" : ""}`}
                  onClick={() => setStatusFilter("sold")}
                >
                  Sold ({products.filter((p) => p.status === "sold").length})
                </button>
              </div>

              {/* View Toggle */}
              <div className="view-toggle">
                <button
                  className={viewMode === "grid" ? "view-btn active" : "view-btn"}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  type="button"
                >
                  <FontAwesomeIcon icon={faTableCellsLarge} />
                </button>

                <button
                  className={viewMode === "list" ? "view-btn active" : "view-btn"}
                  onClick={() => setViewMode("list")}
                  title="List View"
                  type="button"
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>

              <button
                className="create-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setListingModalOpen(true);
                }}
                type="button"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Create Listing</span>
              </button>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="listings-loading">
              <div className="spinner-lg" />
              <p>Loading your listings...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <FontAwesomeIcon icon={faBoxOpen} size="2x" />
              </div>
              <h2>
                {statusFilter === "all"
                  ? "No Listings Yet"
                  : `No ${statusFilter} listings`}
              </h2>
              <p>
                {statusFilter === "all"
                  ? "Create your first listing to start selling to buyers on SmallThings."
                  : `You don't have any items currently marked as ${statusFilter}.`}
              </p>
              {statusFilter === "all" && (
                <button
                  className="create-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setListingModalOpen(true);
                  }}
                  style={{ marginTop: 16 }}
                  type="button"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create First Listing</span>
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === "grid" ? "listings-grid" : "listings-list"}>
              {filteredProducts.map((item) => (
                <div key={item._id} className={`listing-card ${viewMode}`}>
                  <div className="listing-image">
                    <img
                      src={
                        item.images?.[0] ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60"
                      }
                      alt={item.title}
                      loading="lazy"
                    />

                    <span className={`listing-status ${item.status || "available"}`}>
                      {item.status || "available"}
                    </span>
                  </div>

                  <div className="listing-content">
                    <h3>{item.title}</h3>
                    <p className="listing-category">{item.category}</p>

                    <div className="listing-price">₹{item.price?.toLocaleString()}</div>

                    <div className="listing-stats">
                      <span title="Views count">
                        <FontAwesomeIcon icon={faEye} />
                        {item.views || 0} views
                      </span>

                      <span title="Wishlist saves count">
                        <FontAwesomeIcon icon={faBookmark} />
                        {item.saves || 0} saves
                      </span>
                    </div>
                  </div>

                  <div className="listing-actions">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingProduct(item);
                        setListingModalOpen(true);
                      }}
                      title="Edit listing"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => {
                        setProductToDelete(item._id);
                        setDeleteModalOpen(true);
                      }}
                      title="Delete listing"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>

      <CreateListingModal
        isOpen={listingModalOpen}
        editingProduct={editingProduct}
        onClose={() => setListingModalOpen(false)}
        onListingCreated={fetchListings}
      />

      <DeleteListingModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default Listings;
