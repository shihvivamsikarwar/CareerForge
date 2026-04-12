const express = require("express");
const { body } = require("express-validator");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

const router = express.Router();

// ── Validation rule sets ──────────────────────────────────────────────────

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// ── Public routes ─────────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", registerValidation, registerUser);

// POST /api/auth/login
router.post("/login", loginValidation, loginUser);

// ── Protected routes ──────────────────────────────────────────────────────

// GET /api/auth/me — restores session on frontend page load
router.get("/me", protect, getMe);

// PATCH /api/auth/update-profile
router.patch("/update-profile", protect, updateProfile);

// GET  /api/auth/settings
router.get("/settings", protect, getSettings);

// PATCH /api/auth/settings
router.patch("/settings", protect, updateSettings);

// PATCH /api/auth/change-password
router.patch("/change-password", protect, changePassword);

// DELETE /api/auth/account
router.delete("/account", protect, deleteAccount);

// ── Google OAuth routes ───────────────────────────────────────────────────

/**
 * GET /api/auth/google
 * ─────────────────────
 * Initiates the Google OAuth flow.
 * The browser is redirected to Google's consent screen.
 *
 * Guarded: if GOOGLE_CLIENT_ID is not set, returns a helpful 503 instead
 * of a cryptic Passport error, so the frontend shows a clear message.
 */
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message:
        "Google OAuth is not configured on this server. " +
        "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.",
    });
  }
  // Pass control to Passport — it will redirect to Google
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Always show account chooser
  })(req, res, next);
});

/**
 * GET /api/auth/google/callback
 * ──────────────────────────────
 * Google redirects here after the user grants (or denies) permission.
 *
 * On success:
 *   - Passport's verify function has already found/created the User
 *   - We sign a JWT and redirect to the frontend /auth/success?token=<jwt>
 *
 * On failure:
 *   - Redirect to frontend /login?error=google_failed
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    try {
      // req.user is set by Passport's verify function
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });

      console.log(`✅ Google OAuth success for: ${req.user.email}`);

      // Redirect to the React frontend — AuthSuccess.jsx reads the token
      res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error("Google callback JWT error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }
  }
);

module.exports = router;
