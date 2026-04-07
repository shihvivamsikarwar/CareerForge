const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getInterviewTypes,
  startInterview,
  submitInterview,
  getInterviewHistory,
  getInterviewById,
  deleteInterview,
} = require("../controllers/interviewController");

const router = express.Router();

// All routes require a valid JWT ──────────────────────────────────────────

// GET  /api/interview/types    — metadata for the type-selection screen
router.get("/types", protect, getInterviewTypes);

// GET  /api/interview/history  — paginated past interviews
router.get("/history", protect, getInterviewHistory);

// POST /api/interview/start    — create session, get questions
router.post("/start", protect, startInterview);

// POST /api/interview/submit   — submit answers, get AI evaluation
router.post("/submit", protect, submitInterview);

// GET  /api/interview/:id      — single result (must come after named routes)
router.get("/:id", protect, getInterviewById);

// DELETE /api/interview/:id
router.delete("/:id", protect, deleteInterview);

module.exports = router;
