import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import CreateListingModal from "../components/CreateListingModal";
import SkeletonCard from "../components/SkeletonCard";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faStore, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../styles/Marketplace.css";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Books & Media",
  "Sports & Outdoor",
  "Toys & Games",
];

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [listingModalOpen, setListingModalOpen] = useState(
    searchParams.get("action") === "sell"
  );

  const navigate = useNavigate();

  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.category && filters.category !== "All") {
        params.category = filters.category;
      }

      const res = await api.get("/products", { params });
      setProducts(res.data);
    } catch (err) {
      console.error("Marketplace fetch error:", err);
      setError("Unable to load products. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts({
      search: searchTerm,
      category: category,
    });
  }, [category, searchTerm, fetchProducts]);

  const handleSearch = () => {
    fetchProducts({
      search: searchTerm,
      category: category,
    });
  };

  const handleCategoryPillClick = (cat) => {
    const selected = cat === "All" ? "" : cat;
    setCategory(selected);
    if (selected) {
      setSearchParams({ category: selected });
    } else {
      setSearchParams({});
    }
  };

  const handleSellItem = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: { pathname: "/marketplace?action=sell" } } });
      return;
    }
    setListingModalOpen(true);
  };

  return (
    <>
      <Layout
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        category={category}
        setCategory={setCategory}
        onSearch={handleSearch}
        onSellItem={handleSellItem}
      >
        <div className="marketplace-container">
          {/* HEADER & FILTER BAR */}
          <div className="marketplace-header">
            <div>
              <h1 className="marketplace-title">Marketplace</h1>
              <p className="marketplace-subtitle">
                Discover pre-owned goods and unique products from verified community sellers
              </p>
            </div>

            <button
              className="sell-now-cta"
              onClick={handleSellItem}
              type="button"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>List An Item</span>
            </button>
          </div>

          {/* CATEGORY PILLS */}
          <div className="category-pills">
            {CATEGORIES.map((cat) => {
              const isActive = (!category && cat === "All") || category === cat;
              return (
                <button
                  key={cat}
                  className={`category-pill ${isActive ? "active" : ""}`}
                  onClick={() => handleCategoryPillClick(cat)}
                  type="button"
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {error && <div className="marketplace-error">{error}</div>}

          {/* PRODUCTS GRID */}
          <div className="items-grid">
            {loading ? (
              [...Array(8)].map((_, index) => <SkeletonCard key={index} />)
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="empty-icon-wrap">
                  <FontAwesomeIcon icon={faStore} size="2x" />
                </div>
                <h2>No Products Found</h2>
                <p>
                  {category
                    ? `There are currently no available items in "${category}".`
                    : "Try adjusting your search criteria or be the first to list an item."}
                </p>
                <button
                  className="sell-now-cta"
                  onClick={handleSellItem}
                  style={{ marginTop: 16 }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>List An Item Now</span>
                </button>
              </div>
            ) : (
              products.map((item) => (
                <div
                  key={item._id}
                  className="item-card"
                  onClick={() => navigate(`/product/${item._id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="item-image">
                    <span
                      className={`condition-badge ${(item.condition || "Used")
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.condition}
                    </span>

                    <img
                      src={
                        item.images?.[0] ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"
                      }
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="item-content">
                    <div className="item-header-row">
                      <h3 className="item-title">{item.title}</h3>
                      <span className="item-price">₹{item.price?.toLocaleString()}</span>
                    </div>

                    <div className="item-footer-row">
                      <span className="item-category">
                        <FontAwesomeIcon icon={faTag} style={{ marginRight: 5, fontSize: "0.75rem" }} />
                        {item.category}
                      </span>
                      {item.seller?.location && (
                        <span className="item-seller-location">
                          {item.seller.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>

      <CreateListingModal
        isOpen={listingModalOpen}
        onClose={() => setListingModalOpen(false)}
        onListingCreated={() => {
          setListingModalOpen(false);
          fetchProducts({ search: searchTerm, category });
        }}
      />
    </>
  );
}

export default Marketplace;
