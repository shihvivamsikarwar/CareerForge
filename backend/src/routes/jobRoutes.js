const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
  analyzeJob, 
  getRecommendations 
} = require("../controllers/jobController");

const router = express.Router();

// All job routes require authentication
router.use(protect);

// POST /api/job/analyze - Analyze job description against user profile
router.post("/analyze", analyzeJob);

// GET /api/job/recommendations - Get job recommendations based on user profile
router.get("/recommendations", getRecommendations);

module.exports = router;
