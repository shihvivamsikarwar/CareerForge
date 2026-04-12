"use strict";

const mongoose = require("mongoose");

const careerRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimized for faster profile lookups
    },
    skillsSnapshot: [String], // Skills used by Gemini to generate these roles
    avgInterviewScore: {
      type: Number,
      default: 0,
    },
    totalRoles: {
      type: Number,
      default: 0,
    },
    topCategory: {
      type: String,
      default: "Software Development",
    },
    avgMatchScore: {
      type: Number,
      default: 0,
    },
    marketInsight: {
      type: String,
      trim: true,
    },
    roles: [
      {
        title: { type: String, required: true },
        company: { type: String, default: "Tech Industry" },
        level: { 
          type: String, 
          enum: ["Intern", "Junior", "Mid", "Senior", "Lead"],
          default: "Junior" 
        },
        category: { type: String },
        matchScore: { type: Number, default: 0 },
        salaryRange: { type: String },
        skills: [String],
        missingSkills: [String],
        whyMatch: { type: String },
        difficulty: { 
          type: String, 
          enum: ["Easy", "Medium", "Hard"],
          default: "Medium" 
        },
        timeToReady: { type: String },
        saved: { type: Boolean, default: false }
      },
    ],
  },
  {
    timestamps: true, // Tracks when recommendations were last generated
  }
);

// Index to ensure we can quickly clear old recommendations for a specific user
careerRecommendationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("CareerRecommendation", careerRecommendationSchema);