import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faCommentAlt,
  faAngleDoubleLeft,
  faBookmark as faBookmarkFilled,
  faArrowLeft,
  faPen,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkEmpty } from "@fortawesome/free-regular-svg-icons";

import Layout from "../components/Layout";
import SellerProfileModal from "../components/SellerProfileModal";
import PurchaseRequestModal from "../components/PurchaseRequestModal";
import CreateListingModal from "../components/CreateListingModal";
import api from "../services/api";
import { startConversation } from "../services/chatService";
import { saveProduct, unsaveProduct, checkSaved } from "../services/savedService";
import "../styles/ProductDetail.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [isItemSaved, setIsItemSaved] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);

  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const isMyProduct =
    selectedProduct &&
    currentUser &&
    (selectedProduct.seller?._id === currentUser.id ||
      selectedProduct.seller?._id === currentUser._id ||
      selectedProduct.seller === currentUser.id);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/products/${id}`);
      setSelectedProduct(res.data);
      setActiveImage(0);

      if (token) {
        try {
          const savedRes = await checkSaved(id);
          setIsItemSaved(savedRes.data?.saved || false);

          const statusRes = await api.get(`/orders/check/${id}`);
          setRequestStatus(statusRes.data?.status || null);
        } catch {
          // Non-blocking
        }
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      setError(err.response?.data?.msg || "Product not found or has been removed.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleMessageSeller = async () => {
    if (!token) {
      toast.error("Please sign in to message the seller.");
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    if (isMyProduct) {
      toast.error("You cannot chat with yourself about your own product.");
      return;
    }

    try {
      const sellerId = selectedProduct?.seller?._id || selectedProduct?.seller;
      if (!sellerId) return;

      const res = await startConversation(sellerId, selectedProduct._id);
      navigate("/chat", {
        state: { conversationId: res.data._id, initialChat: res.data },
      });
    } catch (err) {
      console.error("Message seller error:", err);
      toast.error(err.response?.data?.message || "Failed to start conversation.");
    }
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Please sign in to save products.");
      navigate("/login");
      return;
    }

    if (isMyProduct) {
      toast.error("You cannot save your own product.");
      return;
    }

    try {
      if (isItemSaved) {
        await unsaveProduct(selectedProduct._id);
        setSelectedProduct((prev) => ({
          ...prev,
          saves: Math.max(0, (prev.saves || 1) - 1),
        }));
        setIsItemSaved(false);
        toast.success("Removed from saved items");
      } else {
        await saveProduct(selectedProduct._id);
        setSelectedProduct((prev) => ({
          ...prev,
          saves: (prev.saves || 0) + 1,
        }));
        setIsItemSaved(true);
        toast.success("Saved to your wishlist!");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.msg || "Something went wrong.");
    }
  };

  const handlePurchaseRequest = async (message = "") => {
    if (!token) {
      toast.error("Please sign in to send a purchase request.");
      navigate("/login");
      return;
    }

    try {
      setSendingRequest(true);
      await api.post("/orders/request", {
        productId: selectedProduct._id,
        buyerMessage: message,
      });

      toast.success("Purchase request sent to seller!");
      setRequestStatus("requested");
      setPurchaseModalOpen(false);
    } catch (err) {
      console.error("Purchase request error:", err);
      toast.error(err.response?.data?.msg || "Unable to send purchase request.");
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="product-loading-screen">
          <div className="spinner-lg" />
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !selectedProduct) {
    return (
      <Layout>
        <div className="product-error-container">
          <h2>Product Not Found</h2>
          <p>{error || "This item may have been deleted or is no longer available."}</p>
          <button className="back-to-market-btn" onClick={() => navigate("/marketplace")}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Marketplace</span>
          </button>
        </div>
      </Layout>
    );
  }

  const images = selectedProduct.images?.length
    ? selectedProduct.images
    : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"];

  return (
    <Layout>
      <div className="product-page">
        <button
          className="backBtn"
          onClick={() => navigate(-1)}
          title="Go back"
          type="button"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
          <span>Back</span>
        </button>

        <div className="product-detail">
          {/* IMAGE COLUMN */}
          <div className="product-images">
            <div className="carousel-container">
              {images.length > 1 && (
                <button
                  className="carousel-btn left"
                  onClick={() =>
                    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  aria-label="Previous image"
                  type="button"
                >
                  ❮
                </button>
              )}

              <div className="carousel-window">
                <div
                  className="carousel-track"
                  style={{
                    transform: `translateX(-${activeImage * 100}%)`,
                  }}
                >
                  {images.map((img, index) => (
                    <div key={index} className="main-image-wrapper">
                      <img className="main-image" src={img} alt={selectedProduct.title} />
                    </div>
                  ))}
                </div>
              </div>

              {images.length > 1 && (
                <button
                  className="carousel-btn right"
                  onClick={() =>
                    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  aria-label="Next image"
                  type="button"
                >
                  ❯
                </button>
              )}

              {images.length > 1 && (
                <div className="carousel-dots">
                  {images.map((_, index) => (
                    <span
                      key={index}
                      className={activeImage === index ? "dot active-dot" : "dot"}
                      onClick={() => setActiveImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnail-row">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt=""
                    className={activeImage === index ? "thumbnail active-thumbnail" : "thumbnail"}
                    onClick={() => setActiveImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO PANEL */}
          <div className="product-info">
            <div className="product-scroll">
              <div className="product-header-block">
                <div className="product-tags">
                  <span className="pd-condition-badge">{selectedProduct.condition || "Used"}</span>
                  <span className="pd-category">{selectedProduct.category}</span>
                  {selectedProduct.status !== "available" && (
                    <span className={`status-pill ${selectedProduct.status}`}>
                      {selectedProduct.status.toUpperCase()}
                    </span>
                  )}
                </div>

                <h1 className="pd-title">{selectedProduct.title}</h1>
                <div className="pd-price">₹{selectedProduct.price?.toLocaleString()}</div>
              </div>

              {/* SELLER CALLOUT */}
              <div
                className="seller-callout-card"
                onClick={() => setSellerModalOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div className="seller-callout-left">
                  <div className="seller-avatar-sm">
                    {selectedProduct.seller?.name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <div className="seller-label">Listed by Seller</div>
                    <div className="seller-name-link">
                      {selectedProduct.seller?.name || "Verified Seller"}
                    </div>
                  </div>
                </div>
                <span className="view-profile-tag">View Profile</span>
              </div>

              {/* METADATA SPECIFICATIONS */}
              <div className="product-meta">
                <div className="meta-row">
                  <span className="meta-title">Condition</span>
                  <span className="meta-value">{selectedProduct.condition}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-title">Category</span>
                  <span className="meta-value">{selectedProduct.category}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-title">Location</span>
                  <span className="meta-value">{selectedProduct.seller?.location || "India"}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-title">Views</span>
                  <span className="meta-value">{selectedProduct.views || 0}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-title">Saved</span>
                  <span className="meta-value">{selectedProduct.saves || 0} times</span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="product-description">
                <h3>Description</h3>
                <p className="pd-desc">
                  {selectedProduct.description || "No additional description provided by the seller."}
                </p>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="pd-actions">
              {isMyProduct ? (
                <div className="owner-action-box">
                  <div className="owner-notice">
                    <FontAwesomeIcon icon={faShieldAlt} />
                    <span>This is your active listing</span>
                  </div>
                  <button
                    className="edit-listing-btn"
                    onClick={() => setEditModalOpen(true)}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faPen} />
                    <span>Edit Listing Details</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="buyBtn"
                    disabled={
                      requestStatus === "requested" ||
                      requestStatus === "reserved" ||
                      selectedProduct.status !== "available"
                    }
                    onClick={() => {
                      if (!token) {
                        toast.error("Please sign in to buy items.");
                        navigate("/login");
                        return;
                      }
                      setPurchaseModalOpen(true);
                    }}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faCreditCard} />
                    <span>
                      {selectedProduct.status === "sold"
                        ? "Product Sold"
                        : selectedProduct.status === "reserved"
                        ? "Item Reserved"
                        : requestStatus === "requested"
                        ? "Request Sent — Waiting for Seller"
                        : requestStatus === "reserved"
                        ? "Reserved for You"
                        : "Send Purchase Request"}
                    </span>
                  </button>

                  <div className="secondary-actions">
                    <button
                      className={`saveActionBtn ${isItemSaved ? "saved-active" : ""}`}
                      onClick={handleSave}
                      type="button"
                    >
                      <FontAwesomeIcon icon={isItemSaved ? faBookmarkFilled : faBookmarkEmpty} />
                      <span>{isItemSaved ? "Saved" : "Save for Later"}</span>
                    </button>

                    <button
                      className="msgSellerBtn"
                      onClick={handleMessageSeller}
                      type="button"
                    >
                      <FontAwesomeIcon icon={faCommentAlt} />
                      <span>Message Seller</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <SellerProfileModal
        seller={selectedProduct.seller}
        productId={selectedProduct._id}
        isOpen={sellerModalOpen}
        onClose={() => setSellerModalOpen(false)}
      />

      <PurchaseRequestModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        product={selectedProduct}
        loading={sendingRequest}
        onSubmit={handlePurchaseRequest}
      />

      {isMyProduct && (
        <CreateListingModal
          isOpen={editModalOpen}
          editingProduct={selectedProduct}
          onClose={() => setEditModalOpen(false)}
          onListingCreated={() => {
            setEditModalOpen(false);
            fetchProduct();
          }}
        />
      )}
    </Layout>
  );
}

export default ProductDetails;
