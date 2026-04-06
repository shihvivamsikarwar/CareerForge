const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadResume,
  getMyResumes,
  getLatestResume,
  getResumeById,
  deleteResume,
} = require("../controllers/resumeController");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────
// Multer configuration — memory storage (no disk I/O)
// ─────────────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only PDF, DOC, and DOCX files are accepted."
      ),
      false
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // Keep file in RAM — no temp files
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB hard cap
  fileFilter,
});

// ─────────────────────────────────────────────────────────────────────────
// Multer error handler — converts multer errors into consistent JSON
// ─────────────────────────────────────────────────────────────────────────
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message;
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File is too large. Maximum allowed size is 5 MB.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message =
          err.message ||
          "Invalid file type. Only PDF, DOC, and DOCX are accepted.";
        break;
      default:
        message = `Upload error: ${err.message}`;
    }
    return res.status(400).json({ success: false, message });
  }
  next(err); // Pass non-multer errors to the global error handler
};

// ─────────────────────────────────────────────────────────────────────────
// Routes — all protected by JWT
// ─────────────────────────────────────────────────────────────────────────

// POST /api/resume/upload
// The field name in FormData must be "resume"
router.post(
  "/upload",
  protect,
  upload.single("resume"),
  handleMulterError,
  uploadResume
);

// GET /api/resume/my-resumes
router.get("/my-resumes", protect, getMyResumes);

// GET /api/resume/latest
router.get("/latest", protect, getLatestResume);

// GET /api/resume/:id
router.get("/:id", protect, getResumeById);

// DELETE /api/resume/:id
router.delete("/:id", protect, deleteResume);

module.exports = router;
