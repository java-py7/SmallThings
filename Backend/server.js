const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const { connectDB, getDbStatus } = require("./config/db");

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
   SOCKET.IO SETUP
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
   BASE MIDDLEWARE
=========================================================== */

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ===========================================================
   DATABASE CONNECTION ASSURANCE MIDDLEWARE
   Ensures Mongoose is connected before any route queries execute.
   Prevents buffering timeouts (Operation ... buffering timed out)
   and returns HTTP 503 if the database is temporarily unreachable.
=========================================================== */

app.use(async (req, res, next) => {
  // Allow health check endpoint to respond regardless of DB status
  if (req.path === "/api/health") {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(`[Database Middleware] Connection error for ${req.method} ${req.originalUrl}:`, err.message);
    return res.status(503).json({
      status: "error",
      code: "DATABASE_UNAVAILABLE",
      message: "Database connection unavailable. Please verify cluster accessibility or try again shortly.",
    });
  }
});

/* ===========================================================
   HEALTH & DIAGNOSTIC ENDPOINT
=========================================================== */

app.get("/api/health", async (req, res) => {
  let dbInfo = getDbStatus();

  // Attempt connection check if disconnected
  if (!dbInfo.isConnected) {
    try {
      await connectDB();
      dbInfo = getDbStatus();
    } catch {
      // getDbStatus() will reflect failure status
    }
  }

  const isHealthy = dbInfo.isConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    service: "SmallThings Marketplace API",
    database: {
      status: dbInfo.isConnected ? "connected" : "disconnected",
      state: dbInfo.stateLabel,
      name: dbInfo.database || "smallthings",
    },
    time: new Date().toISOString(),
  });
});

/* ===========================================================
   API ROUTES
=========================================================== */

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
      await connectDB();

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
   START SERVER (LOCAL DEVELOPMENT & TRADITIONAL HOSTING)
=========================================================== */

const PORT = process.env.PORT || 5000;

// Avoid starting unnecessary HTTP listeners in Vercel Serverless environment
if (!process.env.VERCEL) {
  connectDB().catch((err) => {
    console.error("[MongoDB] Initial connection error in local dev:", err.message);
  });

  server.listen(PORT, () => {
    console.log(`SmallThings API server running on http://localhost:${PORT}`);
  });
}

/* ===========================================================
   EXPORTS FOR VERCEL SERVERLESS FUNCTIONS
=========================================================== */

module.exports = app;
module.exports.server = server;
module.exports.connectDB = connectDB;
