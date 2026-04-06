const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },

    // ── Source file metadata ───────────────────────────────────────────────
    originalFileName: {
      type: String,
      trim: true,
      default: "resume",
    },

    fileType: {
      type: String,
      enum: ["pdf", "doc", "docx"],
    },

    // ── Raw extracted text (kept for re-analysis or search) ───────────────
    extractedText: {
      type: String,
      maxlength: [50000, "Extracted text exceeds maximum allowed length"],
    },

    // ── AI analysis results ────────────────────────────────────────────────
    skills: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    // ── Score (0–100) ──────────────────────────────────────────────────────
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ── Analysis status — lets frontend poll or show partial results ───────
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    // Error message when status === 'failed'
    errorMessage: {
      type: String,
      default: null,
    },

    // ── Track when AI was last run (user may re-analyse) ──────────────────
    analyzedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Compound index: one active resume per user (most recent wins) ──────────
resumeSchema.index({ userId: 1, createdAt: -1 });

// ── Instance method: return safe public object ─────────────────────────────
resumeSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    originalFileName: this.originalFileName,
    fileType: this.fileType,
    skills: this.skills,
    summary: this.summary,
    strengths: this.strengths,
    weaknesses: this.weaknesses,
    suggestions: this.suggestions,
    score: this.score,
    status: this.status,
    analyzedAt: this.analyzedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    // Intentionally omit extractedText — it can be large and is not needed by UI
  };
};

module.exports = mongoose.model("Resume", resumeSchema);
