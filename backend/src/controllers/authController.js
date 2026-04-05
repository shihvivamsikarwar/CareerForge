const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// ── Helper: sign a JWT and return it ──────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Helper: send a standardised token response ────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
};

// ── Helper: extract and return express-validator errors ───────────────────
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return null; // no errors
};

// ─────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    // 1. Run validation rules (defined in the route file)
    const validationError = handleValidationErrors(req, res);
    if (validationError) return; // response already sent

    const { name, email, password } = req.body;

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 3. Create user — password is hashed automatically by the pre-save hook
    const user = await User.create({ name, email, password });

    // 4. Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`✅ New user registered: ${user.email}`);

    // 5. Respond with token
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("registerUser error:", error);

    // Mongoose duplicate key (race condition — two concurrent requests with same email)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login with email + password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    // 1. Validate inputs
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    // 2. Find user; explicitly select password (it's hidden by default via `select: false`)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      // Use a generic message — don't reveal whether the email exists
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Ensure this account uses password auth (not OAuth-only)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    // 4. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 5. Update lastLogin
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`✅ User logged in: ${user.email}`);

    // 6. Respond with token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("loginUser error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get the currently authenticated user's profile
// @access  Protected (requires valid JWT)
// ─────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is already attached by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user.toPublicJSON(),
    });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/auth/update-profile
// @desc    Update name or avatar for the logged-in user
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "avatar"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, // Return the updated document
      runValidators: true,
    });

    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile.",
    });
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
