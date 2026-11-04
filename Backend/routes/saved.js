const express = require("express");
const mongoose = require("mongoose");
const Saved = require("../models/Saved");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

/*
========================================
GET SAVED PRODUCTS
========================================
*/
router.get("/", auth, async (req, res) => {
  try {
    let saved = await Saved.findOne({
      user: req.user.id,
    }).populate("products");

    if (!saved) {
      saved = await Saved.create({
        user: req.user.id,
        products: [],
      });
    }

    // Filter out products that have been deleted
    const validProducts = (saved.products || []).filter(
      (p) => p !== null && p !== undefined
    );

    if (validProducts.length !== (saved.products || []).length) {
      saved.products = validProducts.map((p) => p._id);
      await saved.save();
    }

    res.json({
      ...saved.toObject(),
      products: validProducts,
    });
  } catch (err) {
    console.error("Get saved error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/*
========================================
SAVE PRODUCT
========================================
*/
router.post("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid product ID." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: "Product not found." });
    }

    if (product.status === "sold") {
      return res.status(400).json({ msg: "Product is no longer available." });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ msg: "You cannot save your own product." });
    }

    let saved = await Saved.findOne({ user: req.user.id });

    if (!saved) {
      saved = await Saved.create({
        user: req.user.id,
        products: [],
      });
    }

    const alreadySaved = saved.products.some(
      (id) => id.toString() === productId
    );

    if (alreadySaved) {
      return res.status(400).json({ msg: "Product already saved." });
    }

    saved.products.push(productId);
    product.saves = (product.saves || 0) + 1;

    await saved.save();
    await product.save();

    await saved.populate("products");
    res.json(saved);
  } catch (err) {
    console.error("Save product error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/*
========================================
UNSAVE PRODUCT
========================================
*/
router.delete("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid product ID." });
    }

    const saved = await Saved.findOne({ user: req.user.id });

    if (!saved) {
      return res.status(404).json({ msg: "Saved list not found." });
    }

    saved.products = saved.products.filter(
      (id) => id.toString() !== productId
    );

    await saved.save();

    const product = await Product.findById(productId);
    if (product && product.saves > 0) {
      product.saves -= 1;
      await product.save();
    }

    await saved.populate("products");
    res.json(saved);
  } catch (err) {
    console.error("Unsave product error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/*
========================================
CHECK SAVED STATUS
========================================
*/
router.get("/check/:productId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.json({ saved: false });
    }

    const saved = await Saved.findOne({ user: req.user.id });

    if (!saved) {
      return res.json({ saved: false });
    }

    const exists = saved.products.some(
      (id) => id.toString() === req.params.productId
    );

    res.json({ saved: exists });
  } catch (err) {
    console.error("Check saved error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
