"use strict";

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
// 1. Make sure to import getRecommendations here
const {
  getCareerGuidance,
  getRecommendations,
} = require("../controllers/careerController");

const router = express.Router();

// GET /api/career/guidance — full AI career guidance
router.get("/guidance", protect, getCareerGuidance);

// 2. Add this line to fix the 404 error
// This matches the frontend call: /api/career/recommendations
router.get("/recommendations", protect, getRecommendations);

module.exports = router;
