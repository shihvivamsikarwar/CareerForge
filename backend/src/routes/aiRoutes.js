const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { analyzeResumeEnhanced, evaluateInterviewEnhanced, analyzePerformanceEnhanced } = require("../services/aiServiceEnhanced");

const router = express.Router();

// All AI routes require authentication
router.use(protect);

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health and configuration
 * @access  Protected
 */
router.get("/health", (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";
  
  res.status(200).json({
    success: true,
    aiConfigured: !!apiKey,
    model,
    services: {
      resumeAnalysis: true,
      interviewEvaluation: true,
      performanceAnalysis: true,
    },
    message: apiKey ? "AI services configured and ready" : "AI services using fallback mode"
  });
});

/**
 * @route   POST /api/ai/test-resume
 * @desc    Test resume analysis AI service
 * @access  Protected
 */
router.post("/test-resume", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required and must be at least 50 characters"
      });
    }
    
    const result = await analyzeResumeEnhanced(text);
    
    res.status(200).json({
      success: true,
      result,
      message: "Resume analysis completed successfully"
    });
  } catch (error) {
    console.error("Test resume analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Resume analysis test failed",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/test-interview
 * @desc    Test interview evaluation AI service
 * @access  Protected
 */
router.post("/test-interview", async (req, res) => {
  try {
    const { questions, answers, type = "technical" } = req.body;
    
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Questions and answers arrays are required"
      });
    }
    
    if (questions.length !== answers.length) {
      return res.status(400).json({
        success: false,
        message: "Questions and answers must have the same length"
      });
    }
    
    const result = await evaluateInterviewEnhanced(questions, answers, type);
    
    res.status(200).json({
      success: true,
      result,
      message: "Interview evaluation completed successfully"
    });
  } catch (error) {
    console.error("Test interview evaluation error:", error);
    res.status(500).json({
      success: false,
      message: "Interview evaluation test failed",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/test-performance
 * @desc    Test performance analysis AI service
 * @access  Protected
 */
router.post("/test-performance", async (req, res) => {
  try {
    const { digest } = req.body;
    
    if (!digest || typeof digest !== "object") {
      return res.status(400).json({
        success: false,
        message: "Performance digest object is required"
      });
    }
    
    const result = await analyzePerformanceEnhanced(digest);
    
    res.status(200).json({
      success: true,
      result,
      message: "Performance analysis completed successfully"
    });
  } catch (error) {
    console.error("Test performance analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Performance analysis test failed",
      error: error.message
    });
  }
});

module.exports = router;
