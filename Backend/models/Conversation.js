const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Product from which the conversation started
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One conversation per buyer-seller pair
conversationSchema.index(
  { buyer: 1, seller: 1 },
  { unique: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);