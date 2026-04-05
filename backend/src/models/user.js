const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      // Not required at schema level — Google OAuth users won't have one
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never returned in queries unless explicitly requested
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ── OAuth fields (populated when Google login is added) ──
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values (sparse unique index)
      unique: true,
    },

    avatar: {
      type: String, // URL from Google profile photo
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
// email is already indexed via `unique: true`
userSchema.index({ googleId: 1 }, { sparse: true });

// ── Pre-save hook: hash password before saving ─────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash if password field was actually modified
  if (!this.isModified("password") || !this.password) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds — good balance of speed vs security
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare a plain-text password against the hash ─────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  // `this.password` may not be selected by default — caller must use .select('+password')
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: return a safe public-facing object (no password) ───────
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar || null,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
