"use strict";

const mongoose = require("mongoose");
const Resume = require("../models/Resume");
const Interview = require("../models/Interview");
const JobAnalysis = require("../models/JobAnalysis");
const CareerRecommendation = require("../models/CareerRecommendation");
const { generateCareerGuidance } = require("../services/careerAI");
const { generateRecommendations } = require("../services/recommendationAI");

// ── Helpers ───────────────────────────────────────────────
const avg = (arr) =>
  arr && arr.length
    ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10
    : 0;

const dedupe = (arr) => [...new Set(arr)];

// ── Profile Builder ───────────────────────────────────────
const buildProfile = async (uid) => {
  if (!uid) throw new Error("User ID is required");

  // Optimized: Using lean() for faster read-only performance
  const resume = await Resume.findOne({ userId: uid, status: "completed" })
    .sort({ createdAt: -1 })
    .select("skills score strengths weaknesses")
    .lean();

  const interviews = await Interview.find({ userId: uid, status: "evaluated" })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const jobHistoryRaw = await JobAnalysis.find({ userId: uid })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    hasResume: !!resume,
    hasInterviews: interviews.length > 0,
    skills: resume?.skills?.slice(0, 20) || [],
    resumeScore: resume?.score || 0,
    resumeStrengths: resume?.strengths?.slice(0, 10) || [],
    resumeWeaknesses: resume?.weaknesses?.slice(0, 10) || [],
    avgInterviewScore: avg(interviews.map((i) => i.score || 0)),
    totalInterviews: interviews.length,
    interviewStrengths: dedupe(
      interviews.flatMap((i) => i.feedback?.strengths || [])
    ),
    interviewWeaknesses: dedupe(
      interviews.flatMap((i) => i.feedback?.weaknesses || [])
    ),
    interviewTypes: dedupe(interviews.map((i) => i.type || "General")),
    jobHistory: jobHistoryRaw.map((j) => ({
      jobTitle: j.jobTitle || "Unknown",
      matchScore: j.matchScore || 0,
      missingSkills: j.missingSkills?.slice(0, 5) || [],
    })),
  };
};

// ── Career Guidance ───────────────────────────────────────
const getCareerGuidance = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const profile = await buildProfile(userId);

    if (!profile.hasResume) {
      return res.json({
        success: true,
        hasData: false,
        message: "Upload resume first",
      });
    }

    const guidance = await generateCareerGuidance(profile);

    return res.json({
      success: true,
      hasData: true,
      data: guidance,
      dataQuality: {
        hasResume: profile.hasResume,
        hasInterviews: profile.hasInterviews,
        interviewCount: profile.totalInterviews,
      },
    });
  } catch (err) {
    console.error("DEBUG - Guidance Error:", err.stack);
    res.status(500).json({ message: "Error generating guidance" });
  }
};

// ── Recommendations ───────────────────────────────────────
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    // Safety Check for Model
    if (!CareerRecommendation || typeof CareerRecommendation.deleteMany !== 'function') {
        throw new Error("CareerRecommendation model not initialized properly");
    }

    const profile = await buildProfile(userId);
    const result = await generateRecommendations(profile);

    // AI Response Validation
    if (!result || !result.roles || !Array.isArray(result.roles)) {
      return res
        .status(422)
        .json({ success: false, message: "AI failed to generate roles structure" });
    }

    // Clean up old entries
    await CareerRecommendation.deleteMany({ userId });

    // Save New Recommendations
    const saved = await CareerRecommendation.create({
      userId,
      skillsSnapshot: profile.skills,
      avgInterviewScore: profile.avgInterviewScore,
      totalRoles: result.roles.length,
      topCategory: result.topCategory || "Software Development",
      avgMatchScore: avg(result.roles.map((r) => r.matchScore || 0)),
      roles: result.roles,
      marketInsight: result.marketInsight || "Market is stable.",
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error("DEBUG - Recommendation Error:", err.stack);
    res.status(500).json({
      message: "Error generating recommendations",
      error: err.message,
    });
  }
};

module.exports = { 
    getCareerGuidance, 
    getRecommendations 
};