const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    bio: {
      type: String,
      default: ""
    },

    avatar: {
      type: String,
      default: "" // future: uploaded image or gravatar
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);
