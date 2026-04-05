const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect
 * ───────
 * Verifies the JWT from the Authorization header and attaches
 * the full user document to `req.user` for use in downstream handlers.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      const message =
        jwtError.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid token. Please log in again.";

      return res.status(401).json({ success: false, message });
    }

    // 3. Confirm the user still exists in the database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The account belonging to this token no longer exists.",
      });
    }

    // 4. Attach user to request and continue
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during authentication." });
  }
};

/**
 * restrictTo(...roles)
 * ──────────────────────
 * Role-based access control. Use AFTER `protect`.
 *
 * Example:
 *   router.delete('/users/:id', protect, restrictTo('admin'), deleteUser)
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };

module.exports = { protect, restrictTo };
