const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Settings sub-schema ────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema(
  {
    // ── Interview behaviour ────────────────────────────────────────────────
    interview: {
      questionCount: { type: Number, min: 3, max: 15, default: 7 },
      timerMinutes: { type: Number, min: 10, max: 120, default: 45 },
      inactivityTimeout: { type: Number, min: 30, max: 300, default: 120 }, // seconds
      warningThreshold: { type: Number, min: 1, max: 10, default: 3 },
      enforceFullscreen: { type: Boolean, default: false },
      showTips: { type: Boolean, default: true },
    },

    // ── Notification toggles ───────────────────────────────────────────────
    notifications: {
      integrityWarnings: { type: Boolean, default: true },
      dataNudges: { type: Boolean, default: true }, // "add interviews" prompts
      refreshReminders: { type: Boolean, default: true },
    },

    // ── Privacy ────────────────────────────────────────────────────────────
    privacy: {
      hideCheatingStatus: { type: Boolean, default: false }, // hides "Flagged" badges in history
      publicProfile: { type: Boolean, default: false },
    },

    // ── Display ────────────────────────────────────────────────────────────
    display: {
      compactSidebar: { type: Boolean, default: false },
      dateLocale: {
        type: String,
        default: "en-IN",
        enum: ["en-IN", "en-US", "en-GB"],
      },
    },

    // ── AI preferences ─────────────────────────────────────────────────────
    ai: {
      preferredModel: { type: String, default: "default" }, // 'default' | 'fast' | 'quality'
      includeJobHistory: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    avatar: { type: String },

    isEmailVerified: { type: Boolean, default: false },

    lastLogin: { type: Date },

    // ── Embedded settings ──────────────────────────────────────────────────
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ googleId: 1 }, { sparse: true });

// ── Pre-save: hash password ────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance methods ───────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar || null,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
    settings: this.settings,
  };
};

module.exports = mongoose.model("User", userSchema);
