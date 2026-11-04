import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Package,
    PackageCheck,
    ShoppingCart,
    IndianRupee,
    CircleCheckBig,
    Plus,
    Heart,
    ClipboardList,
    ArrowRight,
    TrendingUp,
} from "lucide-react";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Overview.css";

function Overview() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    })();

    const getImageSrc = (image) => {
        if (!image) return "/placeholder.png";
        if (image.startsWith("data:image") || image.startsWith("http")) {
            return image;
        }
        return `http://localhost:5000/${image.replace(/^\//, "")}`;
    };

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/overview");
            setOverview(res.data);
        } catch (err) {
            console.error("Failed to load overview data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    if (loading) {
        return (
            <Layout>
                <div className="overview-loading">
                    <div className="chat-loading-spinner" />
                    <h2>Loading Dashboard...</h2>
                </div>
            </Layout>
        );
    }

    if (!overview) {
        return (
            <Layout>
                <div className="overview-empty">
                    <h2>Unable to load dashboard data.</h2>
                    <p>Please refresh the page or verify your session.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="overview-page">
                {/* Header Welcome */}
                <div className="overview-header-row">
                    <div>
                        <h1 className="overview-title">
                            Welcome back, {currentUser.name?.split(" ")[0] || "User"} 👋
                        </h1>
                        <p className="overview-subtitle">
                            Here is an overview of your active marketplace listings, sales, and purchases.
                        </p>
                    </div>
                    <Link to="/listings" className="overview-create-btn">
                        <Plus size={18} />
                        Create Listing
                    </Link>
                </div>

                {/* STATS */}
                <section className="stats-grid">
                    <div className="stat-card stat-blue">
                        <div className="stat-icon">
                            <Package size={26} />
                        </div>
                        <div className="stat-meta">
                            <h4>Total Listings</h4>
                            <h2>{overview.totalListings ?? 0}</h2>
                        </div>
                    </div>

                    <div className="stat-card stat-green">
                        <div className="stat-icon">
                            <PackageCheck size={26} />
                        </div>
                        <div className="stat-meta">
                            <h4>Active Listings</h4>
                            <h2>{overview.activeListings ?? 0}</h2>
                        </div>
                    </div>

                    <div className="stat-card stat-orange">
                        <div className="stat-icon">
                            <IndianRupee size={26} />
                        </div>
                        <div className="stat-meta">
                            <h4>Total Earnings</h4>
                            <h2>₹{Number(overview.earnings || 0).toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="stat-card stat-purple">
                        <div className="stat-icon">
                            <ShoppingCart size={26} />
                        </div>
                        <div className="stat-meta">
                            <h4>Purchases</h4>
                            <h2>{overview.purchases ?? 0}</h2>
                        </div>
                    </div>

                    <div className="stat-card stat-teal">
                        <div className="stat-icon">
                            <CircleCheckBig size={26} />
                        </div>
                        <div className="stat-meta">
                            <h4>Sold Items</h4>
                            <h2>{overview.soldListings ?? 0}</h2>
                        </div>
                    </div>
                </section>

                {/* QUICK ACTIONS */}
                <section className="quick-actions-section">
                    <div className="section-title">
                        <h2>Quick Actions</h2>
                        <p>Frequently used marketplace shortcuts</p>
                    </div>

                    <div className="action-grid">
                        <Link to="/listings" className="action-card">
                            <div className="action-icon">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3>Create Listing</h3>
                                <p>Sell an item in minutes</p>
                            </div>
                        </Link>

                        <Link to="/listings" className="action-card">
                            <div className="action-icon">
                                <Package size={24} />
                            </div>
                            <div>
                                <h3>My Listings</h3>
                                <p>Edit or manage your products</p>
                            </div>
                        </Link>

                        <Link to="/orders" className="action-card">
                            <div className="action-icon">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3>Orders</h3>
                                <p>Track buying & selling requests</p>
                            </div>
                        </Link>

                        <Link to="/saved" className="action-card">
                            <div className="action-icon">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3>Saved Items</h3>
                                <p>Your saved wishlist products</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* RECENT LISTINGS & RECENT PURCHASES */}
                <section className="overview-content">
                    {/* Recent Listings */}
                    <div className="overview-panel">
                        <div className="panel-header">
                            <div>
                                <h2>
                                    <Package size={20} />
                                    Recent Listings
                                </h2>
                                <p>Your latest uploaded products</p>
                            </div>

                            <Link to="/listings" className="view-all">
                                View All
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {overview.recentListings?.length > 0 ? (
                            <div className="activity-list">
                                {overview.recentListings.map((product) => (
                                    <div key={product._id} className="activity-card">
                                        <img
                                            src={getImageSrc(product.images?.[0])}
                                            alt={product.title}
                                            className="activity-thumb"
                                        />
                                        <div className="activity-info">
                                            <h3>{product.title}</h3>
                                            <p>₹{Number(product.price || 0).toLocaleString()}</p>
                                        </div>
                                        <span className={`status-badge ${product.status}`}>
                                            {product.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-panel-state">
                                <Package size={44} strokeWidth={1.5} />
                                <h3>No Listings Yet</h3>
                                <p>Create your first listing and start selling today.</p>
                                <Link to="/listings" className="empty-btn">
                                    Create Listing
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Purchases */}
                    <div className="overview-panel">
                        <div className="panel-header">
                            <div>
                                <h2>
                                    <ShoppingCart size={20} />
                                    Recent Purchases
                                </h2>
                                <p>Products you have completed purchasing</p>
                            </div>

                            <Link to="/orders" className="view-all">
                                View Orders
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {overview.recentPurchases?.length > 0 ? (
                            <div className="activity-list">
                                {overview.recentPurchases.map((order) => (
                                    <div key={order._id} className="activity-card">
                                        <img
                                            src={getImageSrc(order.product?.images?.[0])}
                                            alt={order.product?.title || "Product"}
                                            className="activity-thumb"
                                        />
                                        <div className="activity-info">
                                            <h3>{order.product?.title || "Marketplace Product"}</h3>
                                            <p>₹{Number(order.offeredPrice || 0).toLocaleString()}</p>
                                        </div>
                                        <span className="status-badge completed">
                                            Completed
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-panel-state">
                                <ShoppingCart size={44} strokeWidth={1.5} />
                                <h3>No Purchases Yet</h3>
                                <p>Explore the marketplace and make your first offer.</p>
                                <Link to="/marketplace" className="empty-btn">
                                    Browse Marketplace
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* TIPS & INSIGHTS */}
                <section className="overview-footer-tips">
                    <div className="tip-card">
                        <TrendingUp size={22} className="tip-icon" />
                        <div>
                            <h3>Keep Listings Accurate</h3>
                            <p>
                                Quality photos and honest condition descriptions result in 3x faster buyer conversions and fewer return disputes.
                            </p>
                        </div>
                    </div>

                    <div className="tip-card">
                        <IndianRupee size={22} className="tip-icon" />
                        <div>
                            <h3>Quick Response Times</h3>
                            <p>
                                Sellers who answer buyer chats within an hour close deals significantly faster in local peer-to-peer exchanges.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default Overview;
