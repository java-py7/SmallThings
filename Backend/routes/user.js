const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// GET LOGGED-IN USER PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json(user);
  } catch (err) {
    console.error("User me error:", err);
    return res.status(500).json({ message: "Failed to load user profile." });
  }
});

// UPDATE PROFILE
router.put("/me", auth, async (req, res) => {
  try {
    const { name, phone, bio, location } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Failed to update profile." });
  }
});

module.exports = router;
