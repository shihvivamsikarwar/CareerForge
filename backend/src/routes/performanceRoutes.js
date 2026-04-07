const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getPerformanceSummary, getTypeBreakdown } = require("../controllers/performanceController");

const router = express.Router();

// All performance routes require authentication
router.use(protect);

// GET /api/performance/summary - Get complete performance analytics
router.get("/summary", getPerformanceSummary);

// GET /api/performance/type-breakdown - Get performance breakdown by interview type
router.get("/type-breakdown", getTypeBreakdown);

module.exports = router;
