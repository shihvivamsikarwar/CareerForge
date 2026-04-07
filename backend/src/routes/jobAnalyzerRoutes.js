const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { analyzeJobDescription } = require("../controllers/jobAnalyzerController");

const router = express.Router();

// All job analyzer routes require authentication
router.use(protect);

// POST /api/job-analyzer/analyze - Analyze job description against resume
router.post("/analyze", analyzeJobDescription);

module.exports = router;
