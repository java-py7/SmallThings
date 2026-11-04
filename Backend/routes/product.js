const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * ==========================================
 * GET MY LISTINGS
 * GET /api/products/me/listings
 * ==========================================
 */
router.get("/me/listings", auth, async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (err) {
    console.error("Fetch listings error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * GET MARKETPLACE PRODUCTS
 * GET /api/products
 * ==========================================
 */
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;

    const query = {
      status: "available",
    };

    if (search && search.trim()) {
      query.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (category && category !== "all" && category.trim()) {
      query.category = category.trim();
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate("seller", "name email avatar location")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("Fetch marketplace error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * GET SINGLE PRODUCT
 * GET /api/products/:id
 * ==========================================
 */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ msg: "Product not found." });
    }

    const product = await Product.findById(req.params.id).populate(
      "seller",
      "-password"
    );

    if (!product) {
      return res.status(404).json({ msg: "Product not found." });
    }

    // Safely increment view count
    product.views = (product.views || 0) + 1;
    await product.save();

    res.json(product);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * CREATE PRODUCT
 * POST /api/products
 * ==========================================
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, price, category, condition, description, images } = req.body;

    if (!title || price === undefined || !category || !condition) {
      return res.status(400).json({ msg: "Please provide all required fields." });
    }

    const product = new Product({
      title: title.trim(),
      price: Number(price),
      category: category.trim(),
      condition: condition.trim(),
      description: (description || "").trim(),
      images: Array.isArray(images) ? images : [],
      seller: req.user.id,
      status: "available",
      views: 0,
      saves: 0,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * UPDATE PRODUCT
 * PUT /api/products/:id
 * ==========================================
 */
router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ msg: "Product not found." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found." });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized." });
    }

    if (product.status !== "available") {
      return res
        .status(400)
        .json({ msg: "Reserved or sold products cannot be edited." });
    }

    const { title, price, category, condition, description, images } = req.body;

    if (title !== undefined) product.title = title.trim();
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category.trim();
    if (condition !== undefined) product.condition = condition.trim();
    if (description !== undefined) product.description = description.trim();
    if (images !== undefined) product.images = images;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * ==========================================
 * DELETE PRODUCT
 * DELETE /api/products/:id
 * ==========================================
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ msg: "Product not found." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found." });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized." });
    }

    if (product.status === "reserved") {
      return res
        .status(400)
        .json({ msg: "Reserved products cannot be deleted." });
    }

    await product.deleteOne();

    res.json({ msg: "Product deleted." });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
