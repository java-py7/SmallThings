const mongoose = require("mongoose");
const dns = require("dns");

// Configure public DNS resolvers to handle SRV record lookups reliably
// across various network environments and operating systems.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Gracefully continue if environment restricts custom DNS configuration
}

// Global cached connection for serverless function reuse (AWS Lambda / Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Sanitizes a MongoDB connection URI for safe console logging
 * by masking credentials.
 */
function sanitizeUri(uri) {
  if (!uri || typeof uri !== "string") return "unknown";
  return uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
}

/**
 * Resolves the MongoDB connection URI and target database name
 */
function getDbConfig() {
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const isPlaceholder =
    !rawUri ||
    rawUri.trim() === "YOUR_ATLAS_CONNECTION_STRING" ||
    rawUri.includes("<username>") ||
    rawUri.includes("<password>");

  const targetDbName = (process.env.MONGODB_DB_NAME || "smallthings").trim();

  let uri;
  if (isPlaceholder) {
    uri = "mongodb://127.0.0.1:27017/smallthings";
  } else {
    uri = rawUri.trim();
  }

  return {
    uri,
    targetDbName,
    isPlaceholder,
  };
}

/**
 * Establishes or reuses a cached Mongoose connection.
 * Compatible with both Vercel Serverless Functions and local Node server.
 */
async function connectDB() {
  // If already connected, return active connection immediately (0ms)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  // If a connection attempt is actively in flight, wait for it
  if (mongoose.connection.readyState === 2 && cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  const { uri, targetDbName, isPlaceholder } = getDbConfig();

  if (isPlaceholder) {
    console.warn(
      "[MongoDB] Warning: MONGODB_URI is not configured or contains placeholder credentials. Falling back to local MongoDB (smallthings)."
    );
  }

  const mongooseOptions = {
    dbName: targetDbName,
    serverSelectionTimeoutMS: 5000, // Fail fast in 5 seconds rather than hanging
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 0,
    bufferCommands: false, // Disable Mongoose command buffering so queries don't hang
  };

  // Turn off Mongoose command buffering globally
  mongoose.set("bufferCommands", false);

  if (!cached.promise || mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    const maskedUri = sanitizeUri(uri);

    cached.promise = mongoose
      .connect(uri, mongooseOptions)
      .then((m) => {
        const host = m.connection.host || "unknown-host";
        const dbName = m.connection.name || targetDbName;
        const isAtlas = host.includes("mongodb.net");
        console.log(
          `[MongoDB] Connected successfully to ${isAtlas ? "MongoDB Atlas" : "MongoDB"} host: ${host} (Database: ${dbName})`
        );
        cached.conn = m.connection;
        return m.connection;
      })
      .catch((err) => {
        console.error(`[MongoDB] Connection Error to ${maskedUri}:`, err.message);
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
}

/**
 * Diagnostic helper to get current database connection info
 */
function getDbStatus() {
  const stateLabels = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const state = mongoose.connection.readyState;
  return {
    isConnected: state === 1,
    readyState: state,
    stateLabel: stateLabels[state] || "unknown",
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
  };
}

module.exports = {
  connectDB,
  getDbStatus,
  sanitizeUri,
};

