const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  category: String,
  condition: String,
  description: String,
  images: [String],

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // status: {
  //   type: String,
  //   enum: ["active", "sold"],
  //   default: "active"
  // },

  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available"
},

reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},

  views: { type: Number, default: 0 },
  saves: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
