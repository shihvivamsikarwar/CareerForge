const Resume = require("../models/Resume");
const Interview = require("../models/Interview");
const { analyzeJobDescription, recommendJobs } = require("../services/jobAI");
const {
  analyzeJobWithMarket,
  recommendJobsEnhanced,
  getJobMarketData,
} = require("../services/jobAIEnhanced");

// POST /api/job/analyze - Analyze job description against user profile
const analyzeJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    // Validation
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    if (jobDescription.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Job description too long (max 3000 characters).",
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

    // Get user's interview performance
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate performance metrics
    const performanceData = {
      averageScore: 0,
      totalInterviews: interviews.length,
      hasCheating: false,
      weakAreas: [],
      recentScores: [],
    };

    if (interviews.length > 0) {
      const scores = interviews.map((i) => i.overallScore || 0);
      performanceData.averageScore =
        scores.reduce((a, b) => a + b, 0) / scores.length;
      performanceData.recentScores = scores.slice(-5);
      performanceData.hasCheating = interviews.some((i) => i.hasCheating);

      // Identify weak areas from feedback
      const weakSkills = new Set();
      interviews.forEach((interview) => {
        if (interview.feedback) {
          const feedback =
            typeof interview.feedback === "string"
              ? interview.feedback
              : JSON.stringify(interview.feedback);

          // Look for common weakness indicators
          if (
            feedback.toLowerCase().includes("technical") ||
            feedback.toLowerCase().includes("skills")
          ) {
            weakSkills.add("Technical Skills");
          }
          if (feedback.toLowerCase().includes("communication")) {
            weakSkills.add("Communication");
          }
          if (feedback.toLowerCase().includes("confidence")) {
            weakSkills.add("Confidence");
          }
        }
      });
      performanceData.weakAreas = Array.from(weakSkills);
    }

    // Prepare data for AI
    const userData = {
      skills: resume.skills || [],
      experience: resume.experience || "",
      education: resume.education || "",
      score: resume.score || 0,
      strengths: resume.strengths || [],
      weaknesses: resume.weaknesses || [],
      performance: performanceData,
    };

    // Analyze with Enhanced AI (includes market data)
    const analysis = await analyzeJobWithMarket(jobDescription, userData);

    // Adjust for cheating if detected
    if (performanceData.hasCheating) {
      analysis.readinessScore = Math.max(20, analysis.readinessScore - 20);
      analysis.suggestions.push(
        "Note: Some interview sessions had integrity concerns. Focus on genuine practice."
      );
    }

    res.status(200).json({
      success: true,
      analysis,
      hasCheating: performanceData.hasCheating,
    });
  } catch (error) {
    console.error("analyzeJob error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze job description.",
    });
  }
};

// GET /api/job/recommendations - Get job recommendations based on user profile
const getRecommendations = async (req, res) => {
  try {
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

    // Get user's interview performance
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate performance metrics
    const performanceData = {
      averageScore: 0,
      totalInterviews: interviews.length,
      hasCheating: false,
      weakAreas: [],
      recentScores: [],
    };

    if (interviews.length > 0) {
      const scores = interviews.map((i) => i.overallScore || 0);
      performanceData.averageScore =
        scores.reduce((a, b) => a + b, 0) / scores.length;
      performanceData.recentScores = scores.slice(-5);
      performanceData.hasCheating = interviews.some((i) => i.hasCheating);

      // Identify weak areas from feedback
      const weakSkills = new Set();
      interviews.forEach((interview) => {
        if (interview.feedback) {
          const feedback =
            typeof interview.feedback === "string"
              ? interview.feedback
              : JSON.stringify(interview.feedback);

          if (
            feedback.toLowerCase().includes("technical") ||
            feedback.toLowerCase().includes("skills")
          ) {
            weakSkills.add("Technical Skills");
          }
          if (feedback.toLowerCase().includes("communication")) {
            weakSkills.add("Communication");
          }
          if (feedback.toLowerCase().includes("confidence")) {
            weakSkills.add("Confidence");
          }
        }
      });
      performanceData.weakAreas = Array.from(weakSkills);
    }

    // Prepare data for AI
    const userData = {
      skills: resume.skills || [],
      experience: resume.experience || "",
      education: resume.education || "",
      score: resume.score || 0,
      strengths: resume.strengths || [],
      weaknesses: resume.weaknesses || [],
      performance: performanceData,
    };

    // Get enhanced recommendations from AI (includes market data)
    const recommendations = await recommendJobsEnhanced(userData);

    // Adjust for cheating if detected
    if (performanceData.hasCheating) {
      recommendations.confidenceLevel = "Medium";
      recommendations.reason +=
        " Note: Some performance data may need verification.";
    }

    res.status(200).json({
      success: true,
      recommendations,
      hasCheating: performanceData.hasCheating,
    });
  } catch (error) {
    console.error("getRecommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get job recommendations.",
    });
  }
};

// GET /api/job/market-data - Get current job market data
const getMarketData = async (req, res) => {
  try {
    const marketData = await getJobMarketData();

    res.status(200).json({
      success: true,
      marketData,
    });
  } catch (error) {
    console.error("getMarketData error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch market data.",
    });
  }
};

module.exports = {
  analyzeJob,
  getRecommendations,
  getMarketData,
};
