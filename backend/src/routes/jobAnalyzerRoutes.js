const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  analyzeJobDescription,
  getJobAnalysisHistory,
  getJobAnalysisById,
} = require("../controllers/jobAnalyzerController");

const router = express.Router();

// All job analyzer routes require authentication
router.use(protect);

// POST /api/job-analyzer/analyze - Analyze job description against resume
router.post("/analyze", analyzeJobDescription);

// GET /api/job-analyzer/history - Get user's job analysis history
router.get("/history", getJobAnalysisHistory);

// GET /api/job-analyzer/:id - Get specific job analysis by ID
router.get("/:id", getJobAnalysisById);

module.exports = router;
