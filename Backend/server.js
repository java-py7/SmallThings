require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const productRoutes = require("./routes/product");
const savedRoutes = require("./routes/saved");
const orderRoutes = require("./routes/orders");
const overviewRoutes = require("./routes/overview");

const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

const app = express();
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || "smallthings_marketplace_jwt_secret_2026";

/* ===========================================================
   SOCKET.IO
=========================================================== */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ===========================================================
   MIDDLEWARE
=========================================================== */

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ===========================================================
   API ROUTES
=========================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmallThings Marketplace API",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/products", productRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/overview", overviewRoutes);

/* ===========================================================
   SOCKET AUTH & EVENTS
=========================================================== */

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication failed: No token provided"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.user.id;
    next();
  } catch (err) {
    next(new Error("Authentication failed: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) return;
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("leaveConversation", (conversationId) => {
    if (!conversationId) return;
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { conversationId, text } = data;
      if (!conversationId || !text || !text.trim()) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isBuyer = conversation.buyer?.toString() === socket.userId;
      const isSeller = conversation.seller?.toString() === socket.userId;
      if (!isBuyer && !isSeller) return;

      const message = await Message.create({
        conversationId,
        sender: socket.userId,
        text: text.trim(),
        type: "text",
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
      });

      const populated = await Message.findById(message._id).populate(
        "sender",
        "name email avatar"
      );

      io.to(`conversation:${conversationId}`).emit("newMessage", populated);
    } catch (err) {
      console.error("Socket Error:", err);
    }
  });

  socket.on("disconnect", () => {
    // disconnected
  });
});

/* ===========================================================
   DATABASE (MongoDB Atlas / Production Database)
=========================================================== */

const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const isPlaceholder =
  !rawUri ||
  rawUri.trim() === "YOUR_ATLAS_CONNECTION_STRING" ||
  rawUri.includes("<username>") ||
  rawUri.includes("<password>");

if (isPlaceholder) {
  console.warn(
    "[MongoDB] Notice: MONGODB_URI in .env is currently a placeholder. Falling back to local MongoDB until your Atlas connection string is provided."
  );
}

const MONGODB_URI = isPlaceholder
  ? "mongodb://127.0.0.1:27017/rebuyzone"
  : rawUri.trim();

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then((conn) => {
    const host = conn.connection.host || "unknown-host";
    const dbName = conn.connection.name || "default";
    const isAtlas = host.includes("mongodb.net");
    console.log(
      `Connected to ${isAtlas ? "MongoDB Atlas" : "MongoDB"} successfully: ${host} (Database: ${dbName})`
    );
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    if (!isPlaceholder && MONGODB_URI.includes("mongodb.net")) {
      console.error(
        "Atlas Connection Tip: Verify that (1) your Atlas DB user and password are correct, and (2) Network Access in Atlas allows your current IP address (or 0.0.0.0/0 for all)."
      );
    }
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Runtime Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

/* ===========================================================
   START SERVER
=========================================================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`SmallThings API server running on http://localhost:${PORT}`);
});
