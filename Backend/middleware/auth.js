const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "smallthings_marketplace_jwt_secret_2026";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication token missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    return res.status(401).json({ message: "Token is not valid." });
  }
};
