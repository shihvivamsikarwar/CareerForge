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

// ─────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/settings
// @desc    Return the authenticated user's settings object
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    res.status(200).json({ success: true, settings: req.user.settings });
  } catch (error) {
    console.error("getSettings error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/auth/settings
// @desc    Deep-merge user's settings object
//          Body: any subset of the settings schema, e.g.
//          { "interview": { "questionCount": 10 }, "display": { "compactSidebar": true } }
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const allowedGroups = [
      "interview",
      "notifications",
      "privacy",
      "display",
      "ai",
    ];
    const updates = {};

    allowedGroups.forEach((group) => {
      if (req.body[group] && typeof req.body[group] === "object") {
        Object.keys(req.body[group]).forEach((key) => {
          updates[`settings.${group}.${key}`] = req.body[group][key];
        });
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings fields provided.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    console.log(
      `✅ Settings updated — user: ${req.user._id}, fields: ${Object.keys(
        updates
      ).join(", ")}`
    );

    res.status(200).json({
      success: true,
      message: "Settings saved.",
      settings: user.settings,
    });
  } catch (error) {
    console.error("updateSettings error:", error);
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(422).json({ success: false, message: msg });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error while saving settings." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/auth/change-password
// @desc    Change password — requires current password confirmation
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both currentPassword and newPassword are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(422).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(422).json({
        success: false,
        message: "New password must contain at least one number.",
      });
    }

    // Fetch password (normally excluded from queries)
    const user = await User.findById(req.user._id).select("+password");

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In and does not have a password.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    console.log(`✅ Password changed — user: ${req.user._id}`);

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/auth/account
// @desc    Permanently delete the user's account and all associated data
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const uid = req.user._id;

    // Verify password unless Google-only account
    const user = await User.findById(uid).select("+password");
    if (user.password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required to delete your account.",
        });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Password is incorrect." });
      }
    }

    // Delete all user data across every collection
    const Resume = require("../models/Resume");
    const Interview = require("../models/Interview");
    const JobAnalysis = require("../models/JobAnalysis");
    const CareerRecommendation = require("../models/CareerRecommendation");

    await Promise.all([
      Resume.deleteMany({ userId: uid }),
      Interview.deleteMany({ userId: uid }),
      JobAnalysis.deleteMany({ userId: uid }),
      CareerRecommendation.deleteMany({ userId: uid }),
      User.findByIdAndDelete(uid),
    ]);

    console.log(`✅ Account deleted — user: ${uid}`);

    res.status(200).json({
      success: true,
      message: "Account and all data permanently deleted.",
    });
  } catch (error) {
    console.error("deleteAccount error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting account.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount,
};
