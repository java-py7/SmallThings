import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Bookmark,
    MessageCircle,
    Trash2,
    ExternalLink,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import Layout from "../components/Layout";
import { getSavedProducts, unsaveProduct } from "../services/savedService";
import { startConversation } from "../services/chatService";
import "../styles/Saved.css";

function Saved() {
    const navigate = useNavigate();
    const [savedProducts, setSavedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [productToRemove, setProductToRemove] = useState(null);
    const [removing, setRemoving] = useState(false);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    })();
    const currentUserId = currentUser?.id || currentUser?._id;

    const fetchSavedProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getSavedProducts();
            // Filter out any corrupted/deleted products
            const list = (res.data?.products || []).filter((p) => p && p._id);
            setSavedProducts(list);
        } catch (err) {
            console.error("Failed to load saved items:", err);
            toast.error("Failed to load saved products");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedProducts();
    }, [fetchSavedProducts]);

    const filteredProducts = useMemo(() => {
        return savedProducts.filter((product) => {
            const matchesSearch =
                !searchTerm ||
                product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !category || product.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [savedProducts, searchTerm, category]);

    async function handleRemove(productId) {
        try {
            setRemoving(true);
            await unsaveProduct(productId);
            setSavedProducts((prev) => prev.filter((p) => p._id !== productId));
            toast.success("Removed from saved items");
            setProductToRemove(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Failed to remove product.");
        } finally {
            setRemoving(false);
        }
    }

    async function handleMessageSeller(product) {
        if (!product?.seller) {
            toast.error("Seller information is unavailable");
            return;
        }

        const sellerId = typeof product.seller === "object" ? product.seller._id : product.seller;
        if (sellerId === currentUserId) {
            toast.error("You are the seller of this listing.");
            return;
        }

        try {
            const res = await startConversation(sellerId, product._id);
            navigate("/chat", {
                state: {
                    conversationId: res.data._id,
                },
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Unable to start conversation.");
        }
    }

    return (
        <Layout
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={category}
            setCategory={setCategory}
        >
            <div className="saved-page">
                <div className="saved-header-row">
                    <div>
                        <h1 className="saved-title">Saved Items</h1>
                        <p className="saved-subtitle">
                            Products you have bookmarked for later consideration
                        </p>
                    </div>
                    {savedProducts.length > 0 && (
                        <span className="saved-count-pill">
                            {savedProducts.length} {savedProducts.length === 1 ? "Item" : "Items"}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="saved-loading">
                        <div className="chat-loading-spinner" />
                        <h2>Loading saved items...</h2>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="saved-empty">
                        <div className="saved-empty-icon-wrap">
                            <Bookmark size={36} />
                        </div>
                        <h2>{searchTerm || category ? "No matching saved items" : "No Saved Products Yet"}</h2>
                        <p>
                            {searchTerm || category
                                ? "Try resetting your search or filter criteria."
                                : "Click the heart icon on any product in the marketplace to save it here."}
                        </p>
                        <Link to="/marketplace" className="saved-browse-btn">
                            Explore Marketplace
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="saved-grid">
                        {filteredProducts.map((product) => {
                            const isSold = product.status === "sold";
                            const sellerId = typeof product.seller === "object" ? product.seller?._id : product.seller;
                            const isOwnProduct = Boolean(currentUserId && sellerId === currentUserId);

                            return (
                                <div className="saved-card" key={product._id}>
                                    <div className="saved-image-box">
                                        <span className={`saved-badge ${isSold ? "sold" : "available"}`}>
                                            {isSold ? "Sold" : "Available"}
                                        </span>

                                        <img
                                            src={product.images?.[0] || "/placeholder.png"}
                                            alt={product.title}
                                            className="saved-image"
                                        />
                                    </div>

                                    <div className="saved-content">
                                        <div className="saved-top">
                                            <h3 className="saved-item-title">{product.title}</h3>
                                            <span className="saved-price">
                                                ₹{Number(product.price || 0).toLocaleString()}
                                            </span>
                                        </div>

                                        <p className="saved-category">
                                            {product.category || "General"}
                                        </p>

                                        <div className="saved-actions">
                                            <button
                                                type="button"
                                                className="saved-action-btn view"
                                                onClick={() => navigate(`/product/${product._id}`)}
                                                title="View Product"
                                            >
                                                <ExternalLink size={15} />
                                                <span>View</span>
                                            </button>

                                            {!isSold && !isOwnProduct && (
                                                <button
                                                    type="button"
                                                    className="saved-action-btn message"
                                                    onClick={() => handleMessageSeller(product)}
                                                    title="Message Seller"
                                                >
                                                    <MessageCircle size={15} />
                                                    <span>Chat</span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="saved-action-btn remove"
                                                onClick={() => setProductToRemove(product)}
                                                title="Remove from saved"
                                            >
                                                <Trash2 size={15} />
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Remove Confirmation Modal */}
            {productToRemove && (
                <div
                    className="modal-backdrop"
                    onClick={() => !removing && setProductToRemove(null)}
                >
                    <div
                        className="modal-box modal-box-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div className="modal-header-icon danger">
                                <AlertCircle size={22} />
                            </div>
                            <div>
                                <h3 className="modal-title">Remove from Saved?</h3>
                                <p className="modal-subtitle">
                                    "{productToRemove.title}" will be removed from your wishlist.
                                </p>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="modal-btn modal-btn-secondary"
                                onClick={() => setProductToRemove(null)}
                                disabled={removing}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="modal-btn modal-btn-danger"
                                onClick={() => handleRemove(productToRemove._id)}
                                disabled={removing}
                            >
                                {removing ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default Saved;
