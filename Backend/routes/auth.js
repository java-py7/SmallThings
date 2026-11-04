const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "smallthings_marketplace_jwt_secret_2026";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, phone, location, bio } = req.body;

  if (!name || !email || !password || !phone || !location) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      location: location.trim(),
      bio: (bio || "").trim(),
    });

    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.status(201).json({
        message: "Account created successfully!",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
        },
      });
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter both email and password." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({
        message: "Login successful!",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
        },
      });
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// GET /api/auth/me (Get current session user)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (err) {
    console.error("Auth Me Error:", err);
    res.status(500).json({ message: "Server error fetching user session." });
  }
});

module.exports = router;
