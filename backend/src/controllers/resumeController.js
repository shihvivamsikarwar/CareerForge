const Resume = require("../models/Resume");
const { extractTextFromBuffer } = require("../utils/fileExtractor");
const { analyzeResume } = require("../services/aiService");
const { calculateResumeScore } = require("../utils/scoreCalculator");

// ─────────────────────────────────────────────────────────────────────────
// @route   POST /api/resume/upload
// @desc    Upload a resume file, extract text, run AI analysis, save result
// @access  Protected (JWT)
// ─────────────────────────────────────────────────────────────────────────
const uploadResume = async (req, res) => {
  // 1. Confirm multer attached a file (multer errors are handled in middleware)
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded. Please attach a PDF or Word document.",
    });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  // 2. Enforce a 5 MB file size cap (multer limits defined in route but double-check)
  const MAX_BYTES = 5 * 1024 * 1024;
  if (size > MAX_BYTES) {
    return res.status(413).json({
      success: false,
      message: "File is too large. Maximum allowed size is 5 MB.",
    });
  }

  // 3. Determine extension for storage
  const fileType = mimetype.includes("pdf")
    ? "pdf"
    : mimetype.includes("msword") || mimetype.includes("wordprocessingml")
    ? mimetype.includes("msword")
      ? "doc"
      : "docx"
    : "unknown";

  // 4. Create a DB record immediately so the client knows an analysis is in progress
  let resume;
  try {
    resume = await Resume.create({
      userId: req.user._id,
      originalFileName: originalname,
      fileType,
      status: "processing",
    });
  } catch (dbErr) {
    console.error("uploadResume — DB create error:", dbErr);
    return res
      .status(500)
      .json({ success: false, message: "Database error. Please try again." });
  }

  // 5. Extract text
  let extractedText;
  try {
    extractedText = await extractTextFromBuffer(buffer, mimetype);

    if (extractedText.length < 50) {
      throw new Error(
        "The extracted text is too short to analyse. Please upload a more detailed resume."
      );
    }
  } catch (extractErr) {
    await Resume.findByIdAndUpdate(resume._id, {
      status: "failed",
      errorMessage: extractErr.message,
    });

    return res.status(422).json({
      success: false,
      message: extractErr.message,
    });
  }

  // 6. Run AI analysis
  let analysis;
  try {
    analysis = await analyzeResume(extractedText);
  } catch (aiErr) {
    // aiService already returns a fallback — this block only catches hard throws
    console.error("uploadResume — AI error:", aiErr);
    analysis = {
      skills: [],
      summary: "",
      strengths: [],
      weaknesses: [],
      suggestions: ["AI analysis failed. Please try re-uploading your resume."],
    };
  }

  // 7. Compute score
  const score = calculateResumeScore({
    ...analysis,
    extractedText,
  });

  // 8. Persist complete result
  try {
    resume = await Resume.findByIdAndUpdate(
      resume._id,
      {
        extractedText,
        skills: analysis.skills,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        score,
        status: "completed",
        analyzedAt: new Date(),
        errorMessage: null,
      },
      { new: true }
    );
  } catch (saveErr) {
    console.error("uploadResume — DB save error:", saveErr);
    return res
      .status(500)
      .json({ success: false, message: "Failed to save analysis results." });
  }

  console.log(`✅ Resume analysed for user ${req.user._id} — score: ${score}`);

  res.status(201).json({
    success: true,
    message: "Resume analysed successfully.",
    resume: resume.toPublicJSON(),
  });
};

// ─────────────────────────────────────────────────────────────────────────
// @route   GET /api/resume/my-resumes
// @desc    Get all resumes for the authenticated user (newest first)
// @access  Protected (JWT)
// ─────────────────────────────────────────────────────────────────────────
const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10); // Last 10 uploads

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes: resumes.map((r) => r.toPublicJSON()),
    });
  } catch (error) {
    console.error("getMyResumes error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch resume history." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   GET /api/resume/latest
// @desc    Get the most recent completed resume for the authenticated user
// @access  Protected (JWT)
// ─────────────────────────────────────────────────────────────────────────
const getLatestResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.user._id,
      status: "completed",
    }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No analysed resume found. Upload your resume to get started.",
      });
    }

    res.status(200).json({
      success: true,
      resume: resume.toPublicJSON(),
    });
  } catch (error) {
    console.error("getLatestResume error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch resume." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   GET /api/resume/:id
// @desc    Get a single resume by ID (must belong to the logged-in user)
// @access  Protected (JWT)
// ─────────────────────────────────────────────────────────────────────────
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id, // Ensures users can only access their own resumes
    });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found." });
    }

    res.status(200).json({ success: true, resume: resume.toPublicJSON() });
  } catch (error) {
    console.error("getResumeById error:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid resume ID." });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/resume/:id
// @desc    Delete a resume (must belong to the logged-in user)
// @access  Protected (JWT)
// ─────────────────────────────────────────────────────────────────────────
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found." });
    }

    res.status(200).json({ success: true, message: "Resume deleted." });
  } catch (error) {
    console.error("deleteResume error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  getLatestResume,
  getResumeById,
  deleteResume,
};
