const mongoose = require("mongoose");

const jobAnalysisSchema = new mongoose.Schema(
  {
    // Ownership
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },

    // Job details
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },

    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [10000, "Job description exceeds maximum allowed length"],
    },

    // Analysis results
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    breakdown: {
      technicalSkills: { type: Number, min: 0, max: 100, default: 0 },
      experience: { type: Number, min: 0, max: 100, default: 0 },
      keywords: { type: Number, min: 0, max: 100, default: 0 },
    },

    missingSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    matchedSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    actionPlan: [
      {
        type: String,
        trim: true,
      },
    ],

    // Reference to the resume used for analysis
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    // Analysis metadata
    analysisVersion: {
      type: String,
      default: "1.0",
    },

    // Status tracking
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },

    // Error information if analysis failed
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for efficient queries
jobAnalysisSchema.index({ userId: 1, createdAt: -1 });
jobAnalysisSchema.index({ resumeId: 1, createdAt: -1 });

// Instance method: return safe public object
jobAnalysisSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    jobTitle: this.jobTitle,
    jobDescription: this.jobDescription,
    matchScore: this.matchScore,
    breakdown: this.breakdown,
    missingSkills: this.missingSkills,
    matchedSkills: this.matchedSkills,
    actionPlan: this.actionPlan,
    resumeId: this.resumeId,
    analysisVersion: this.analysisVersion,
    status: this.status,
    errorMessage: this.errorMessage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("JobAnalysis", jobAnalysisSchema);
