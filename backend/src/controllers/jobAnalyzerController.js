const Resume = require("../models/Resume");
const JobAnalysis = require("../models/JobAnalysis");
const { analyzeJobMatch } = require("../services/jobAnalyzerAI");

// ─────────────────────────────────────────────────────────────────────────
// @route   POST /api/job-analyzer/analyze
// ─────────────────────────────────────────────────────────────────────────
const analyzeJobDescription = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    // Get user's latest resume
    const resume = await Resume.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload a resume first.",
      });
    }

    // Analyze the match
    console.log("Starting job analysis for user:", req.user._id);
    console.log("Resume found:", resume.originalFileName);
    console.log("Resume has extracted text:", !!resume.extractedText);

    const analysis = await analyzeJobMatch(jobDescription, resume);

    console.log(`Job analysis complete for user: ${req.user._id}`);
    console.log(
      "Final analysis being sent to frontend:",
      JSON.stringify(analysis, null, 2)
    );

    // Save analysis to database
    const jobAnalysis = await JobAnalysis.create({
      userId: req.user._id,
      jobDescription: jobDescription,
      matchScore: analysis.matchScore,
      breakdown: analysis.breakdown,
      missingSkills: analysis.missingSkills,
      matchedSkills: analysis.matchedSkills,
      actionPlan: analysis.actionPlan,
      resumeId: resume._id,
    });

    console.log(`Job analysis saved to database with ID: ${jobAnalysis._id}`);

    res.status(200).json({
      success: true,
      analysis: jobAnalysis.toPublicJSON(),
    });
  } catch (error) {
    console.error("analyzeJobDescription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze job description.",
    });
  }
};

// Get job analysis history for a user
const getJobAnalysisHistory = async (req, res) => {
  try {
    const analyses = await JobAnalysis.find({ userId: req.user._id })
      .populate("resumeId", "originalFileName createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      analyses: analyses.map((analysis) => analysis.toPublicJSON()),
    });
  } catch (error) {
    console.error("getJobAnalysisHistory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job analysis history.",
    });
  }
};

// Get single job analysis by ID
const getJobAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await JobAnalysis.findOne({
      _id: id,
      userId: req.user._id,
    }).populate("resumeId", "originalFileName createdAt");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Job analysis not found.",
      });
    }

    res.status(200).json({
      success: true,
      analysis: analysis.toPublicJSON(),
    });
  } catch (error) {
    console.error("getJobAnalysisById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job analysis.",
    });
  }
};

module.exports = {
  analyzeJobDescription,
  getJobAnalysisHistory,
  getJobAnalysisById,
};
