const mongoose = require("mongoose");

// ── Sub-schema: one Q&A pair with per-question AI feedback ─────────────────
const questionAnswerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    questionScore: { type: Number, min: 0, max: 10, default: null },
    questionFeedback: { type: String, default: "" },
  },
  { _id: false }
);

// ── Sub-schema: a single timestamped cheating event ───────────────────────
const cheatingEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // 'tab_switch' | 'paste_attempt' | 'fullscreen_exit' | 'copy_attempt' | 'right_click' | 'inactivity'
    timestamp: { type: Date, default: Date.now },
    detail: { type: String, default: "" }, // optional extra context
  },
  { _id: false }
);

// ── Main Interview schema ──────────────────────────────────────────────────
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },

    type: {
      type: String,
      enum: [
        "technical",
        "hr",
        "behavioral",
        "mixed",
        "react",
        "node",
        "python",
        "dsa",
      ],
      required: [true, "Interview type is required"],
    },

    title: { type: String, default: "" },

    qa: { type: [questionAnswerSchema], default: [] },

    score: { type: Number, min: 0, max: 10, default: null },

    feedback: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      suggestions: { type: [String], default: [] },
      overallFeedback: { type: String, default: "" },
    },

    durationSeconds: { type: Number, default: null },

    status: {
      type: String,
      enum: ["in_progress", "submitted", "evaluated", "failed"],
      default: "in_progress",
    },

    evaluatedAt: { type: Date },

    // ── Anti-cheating fields ───────────────────────────────────────────────

    /** Aggregated counts — fast to query / display */
    integrity: {
      tabSwitches: { type: Number, default: 0 },
      pasteAttempts: { type: Number, default: 0 },
      copyAttempts: { type: Number, default: 0 },
      rightClicks: { type: Number, default: 0 },
      fullscreenExits: { type: Number, default: 0 },
      inactivityFlags: { type: Number, default: 0 },
      totalWarnings: { type: Number, default: 0 },
    },

    /** Full timestamped event log */
    cheatingLog: { type: [cheatingEventSchema], default: [] },

    /**
     * Set to true by the backend when totalWarnings exceeds the threshold.
     * Frontend also sends an `isCheatingSuspected` flag, but backend re-derives
     * it authoritatively from the log so the client can't fake a clean result.
     */
    isCheatingSuspected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
interviewSchema.index({ userId: 1, createdAt: -1 });

// ── toPublicJSON ───────────────────────────────────────────────────────────
interviewSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    type: this.type,
    title: this.title,
    qa: this.qa,
    score: this.score,
    feedback: this.feedback,
    durationSeconds: this.durationSeconds,
    status: this.status,
    evaluatedAt: this.evaluatedAt,
    integrity: this.integrity,
    cheatingLog: this.cheatingLog,
    isCheatingSuspected: this.isCheatingSuspected,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Interview", interviewSchema);
