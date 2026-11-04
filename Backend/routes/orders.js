const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

/**
 * ==========================================
 * REQUEST PURCHASE
 * POST /api/orders/request
 * ==========================================
 */
router.post("/request", auth, async (req, res) => {
  try {
    const { productId, buyerMessage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid product ID." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: "Product not found." });
    }

    if (product.status !== "available") {
      return res.status(400).json({ msg: "Product is not available for purchase." });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({
        msg: "You cannot request to buy your own product.",
      });
    }

    const existing = await Order.findOne({
      product: product._id,
      buyer: req.user.id,
      status: {
        $in: ["requested", "reserved"],
      },
    });

    if (existing) {
      return res.status(400).json({
        msg: "You have already sent a request for this product.",
      });
    }

    const order = await Order.create({
      product: product._id,
      buyer: req.user.id,
      seller: product.seller,
      offeredPrice: product.price,
      buyerMessage: (buyerMessage || "").trim(),
      status: "requested",
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Order request error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * MY PURCHASES
 * GET /api/orders/purchases
 * ==========================================
 */
router.get("/purchases", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user.id,
    })
      .populate("product")
      .populate("seller", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Purchases fetch error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * MY SOLD ITEMS
 * GET /api/orders/sold
 * ==========================================
 */
router.get("/sold", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      seller: req.user.id,
    })
      .populate("product")
      .populate("buyer", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Sold items fetch error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * ACCEPT REQUEST
 * PUT /api/orders/:id/accept
 * ==========================================
 */
router.put("/:id/accept", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid order ID." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: "Request not found." });
    }

    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized." });
    }

    if (order.status !== "requested") {
      return res.status(400).json({ msg: "Only pending requests can be accepted." });
    }

    const product = await Product.findById(order.product);

    if (!product) {
      return res.status(404).json({ msg: "Product no longer exists." });
    }

    if (product.status !== "available") {
      return res.status(400).json({ msg: "Product is already reserved or sold." });
    }

    order.status = "reserved";
    order.reservedAt = new Date();
    await order.save();

    product.status = "reserved";
    product.reservedBy = order.buyer;
    await product.save();

    // Reject other pending requests for this item
    await Order.updateMany(
      {
        product: product._id,
        _id: { $ne: order._id },
        status: "requested",
      },
      {
        status: "rejected",
      }
    );

    res.json({ msg: "Purchase request accepted. Item is now reserved." });
  } catch (err) {
    console.error("Accept order error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * REJECT REQUEST
 * PUT /api/orders/:id/reject
 * ==========================================
 */
router.put("/:id/reject", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid order ID." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: "Request not found." });
    }

    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized." });
    }

    if (order.status !== "requested") {
      return res.status(400).json({ msg: "Only pending requests can be rejected." });
    }

    order.status = "rejected";
    await order.save();

    res.json({ msg: "Purchase request rejected." });
  } catch (err) {
    console.error("Reject order error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * COMPLETE SALE
 * PUT /api/orders/:id/complete
 * ==========================================
 */
router.put("/:id/complete", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid order ID." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: "Order not found." });
    }

    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized." });
    }

    if (order.status !== "reserved") {
      return res.status(400).json({ msg: "Order must be reserved before completing." });
    }

    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    const product = await Product.findById(order.product);
    if (product) {
      product.status = "sold";
      await product.save();
    }

    res.json({ msg: "Sale completed successfully!" });
  } catch (err) {
    console.error("Complete sale error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * CANCEL REQUEST (BUYER)
 * PUT /api/orders/:id/cancel
 * ==========================================
 */
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid order ID." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: "Order not found." });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized." });
    }

    if (order.status !== "requested") {
      return res.status(400).json({ msg: "Only pending requests can be cancelled." });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ msg: "Request cancelled." });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * CHECK REQUEST STATUS
 * GET /api/orders/check/:productId
 * ==========================================
 */
router.get("/check/:productId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.json({ canRequest: false, status: null });
    }

    const order = await Order.findOne({
      product: req.params.productId,
      buyer: req.user.id,
    }).sort({ createdAt: -1 });

    if (!order) {
      return res.json({ canRequest: true, status: null });
    }

    if (order.status === "requested" || order.status === "reserved") {
      return res.json({ canRequest: false, status: order.status });
    }

    return res.json({ canRequest: true, status: order.status });
  } catch (err) {
    console.error("Check order status error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
