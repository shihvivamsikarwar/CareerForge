const Resume = require("../models/Resume");
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
    const analysis = await analyzeJobMatch(jobDescription, resume);

    console.log(`✅ Job analysis complete — user: ${req.user._id}`);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("analyzeJobDescription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze job description.",
    });
  }
};

module.exports = { analyzeJobDescription };
