const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/*
========================================
GET ALL CONVERSATIONS
========================================
*/
router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }],
    })
      .populate("buyer", "name email avatar")
      .populate("seller", "name email avatar")
      .populate("itemId", "title price images status")
      .sort({ lastMessageAt: -1 });

    // Filter out conversations where user was deleted or corrupted
    const valid = conversations.filter(
      (c) => c.buyer !== null && c.seller !== null
    );

    res.json(valid);
  } catch (err) {
    console.error("Fetch conversations error:", err);
    res.status(500).json({ message: "Failed to fetch conversations." });
  }
});

/*
========================================
START CHAT
========================================
*/
router.post("/start", auth, async (req, res) => {
  try {
    const { sellerId, itemId } = req.body;

    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Valid seller ID required." });
    }

    if (sellerId.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "You cannot chat with yourself." });
    }

    let conversation = await Conversation.findOne({
      $or: [
        { buyer: req.user.id, seller: sellerId },
        { buyer: sellerId, seller: req.user.id },
      ],
    });

    if (!conversation) {
      conversation = await Conversation.create({
        buyer: req.user.id,
        seller: sellerId,
        itemId: itemId && mongoose.Types.ObjectId.isValid(itemId) ? itemId : null,
      });
    } else if (itemId && mongoose.Types.ObjectId.isValid(itemId) && !conversation.itemId) {
      conversation.itemId = itemId;
      await conversation.save();
    }

    conversation = await Conversation.findById(conversation._id)
      .populate("buyer", "name email avatar")
      .populate("seller", "name email avatar")
      .populate("itemId", "title price images status");

    res.json(conversation);
  } catch (err) {
    console.error("Start chat error:", err);
    res.status(500).json({ message: "Failed to start conversation." });
  }
});

/*
========================================
GET MESSAGES
========================================
*/
router.get("/:conversationId/messages", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID." });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const isBuyer = conversation.buyer.toString() === req.user.id;
    const isSeller = conversation.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: "Unauthorized access to conversation." });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

/*
========================================
SEND MESSAGE
========================================
*/
router.post("/:conversationId/message", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID." });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const isBuyer = conversation.buyer.toString() === req.user.id;
    const isSeller = conversation.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: "Unauthorized to send messages here." });
    }

    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      text: text.trim(),
      type: "text",
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name email avatar")
      .lean();

    populated.conversationId = conversationId;

    if (req.io) {
      req.io.to(`conversation:${conversationId}`).emit("newMessage", populated);
    }

    res.json(populated);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;
