const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * ==========================================
 * DASHBOARD OVERVIEW
 * GET /api/overview
 * ==========================================
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    /* Listings */
    const totalListings = await Product.countDocuments({
      seller: userId,
    });

    const activeListings = await Product.countDocuments({
      seller: userId,
      status: "available",
    });

    const soldListings = await Product.countDocuments({
      seller: userId,
      status: "sold",
    });

    /* Purchases */
    const purchases = await Order.countDocuments({
      buyer: userId,
      status: "completed",
    });

    /* Earnings */
    const soldProducts = await Product.find({
      seller: userId,
      status: "sold",
    });

    const earnings = soldProducts.reduce(
      (sum, product) => sum + Number(product.price || 0),
      0
    );

    /* Recent Listings */
    const recentListings = await Product.find({
      seller: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title price status images category createdAt");

    /* Recent Purchases */
    const recentPurchasesRaw = await Order.find({
      buyer: userId,
      status: "completed",
    })
      .populate("product", "title price images")
      .sort({ completedAt: -1 })
      .limit(5);

    const recentPurchases = recentPurchasesRaw.filter(
      (order) => order.product !== null
    );

    res.json({
      totalListings,
      activeListings,
      soldListings,
      purchases,
      earnings,
      recentListings,
      recentPurchases,
    });
  } catch (err) {
    console.error("Overview Error:", err);
    res.status(500).json({
      msg: "Failed to load overview.",
    });
  }
});

module.exports = router;
