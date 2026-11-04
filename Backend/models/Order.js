const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    offeredPrice: {
        type: Number,
        required: true
    },

    buyerMessage: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: [
            "requested",
            "reserved",
            "completed",
            "cancelled",
            "rejected"
        ],
        default: "requested"
    },

    reservedAt: Date,

    completedAt: Date

},
{
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);