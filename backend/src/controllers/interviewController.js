const Interview = require("../models/Interview");
const { getQuestions, INTERVIEW_TYPES } = require("../data/questionBank");
const { evaluateInterview } = require("../services/interviewAI");

// ── Configuration ──────────────────────────────────────────────────────────
const CHEATING_THRESHOLD = 3; // total warnings before flagging
const nn = (v) => Math.max(0, parseInt(v) || 0); // clamp to non-negative

// ─────────────────────────────────────────────────────────────────────────
// @route   GET /api/interview/types
// ─────────────────────────────────────────────────────────────────────────
const getInterviewTypes = (req, res) => {
  res.status(200).json({ success: true, types: INTERVIEW_TYPES });
};

// ─────────────────────────────────────────────────────────────────────────
// @route   POST /api/interview/start
// ─────────────────────────────────────────────────────────────────────────
const startInterview = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type)
      return res
        .status(400)
        .json({ success: false, message: "Type required." });

    const typeMeta = INTERVIEW_TYPES.find((t) => t.id === type);
    if (!typeMeta)
      return res.status(400).json({ success: false, message: "Invalid type." });

    const questionStrings = getQuestions(type, typeMeta.questionCount || 7);
    const qa = questionStrings.map((q) => ({ question: q, answer: "" }));

    const interview = await Interview.create({
      userId: req.user._id,
      type,
      title: typeMeta.title || type,
      qa,
      status: "in_progress",
    });

    res
      .status(201)
      .json({ success: true, interview: interview.toPublicJSON() });
  } catch (error) {
    console.error("startInterview error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error starting interview." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   POST /api/interview/submit
// ─────────────────────────────────────────────────────────────────────────
const submitInterview = async (req, res) => {
  try {
    const { interviewId, answers, durationSeconds, integrityReport } = req.body;

    // 1. Validation
    if (!interviewId || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required data." });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    });
    if (!interview)
      return res.status(404).json({ success: false, message: "Not found." });
    if (interview.status === "evaluated")
      return res
        .status(409)
        .json({ success: false, message: "Already evaluated." });

    // 2. Process Integrity (Anti-Cheating)
    let integrity = {
      tabSwitches: 0,
      pasteAttempts: 0,
      copyAttempts: 0,
      rightClicks: 0,
      fullscreenExits: 0,
      inactivityFlags: 0,
      totalWarnings: 0,
    };
    let cheatingLog = [];
    let isCheatingSuspected = false;

    if (integrityReport?.events) {
      const events = integrityReport.events.slice(0, 200); // Cap for security

      events.forEach((ev) => {
        if (ev.type === "tab_switch") integrity.tabSwitches++;
        if (ev.type === "paste_attempt") integrity.pasteAttempts++;
        if (ev.type === "fullscreen_exit") integrity.fullscreenExits++;
        // Add other counts as needed...
      });

      cheatingLog = events.map((ev) => ({
        type: String(ev.type).slice(0, 50),
        timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
        detail: String(ev.detail || "").slice(0, 200),
      }));

      isCheatingSuspected =
        integrity.tabSwitches >= 3 ||
        integrity.pasteAttempts >= 2 ||
        integrity.tabSwitches + integrity.pasteAttempts >= CHEATING_THRESHOLD;
    }

    // 3. Merge Answers & Evaluate
    const questions = interview.qa.map((q) => q.question);
    const mergedAnswers = interview.qa.map((item, i) =>
      typeof answers[i] === "string" ? answers[i].trim() : "No answer provided"
    );

    let evaluation;
    try {
      evaluation = await evaluateInterview(
        questions,
        mergedAnswers,
        interview.type
      );
    } catch (aiErr) {
      evaluation = {
        score: 0,
        overallFeedback: "AI Error",
        perQuestion: questions.map(() => ({ questionScore: 0 })),
      };
    }

    // 4. Final Save
    const updatedQA = interview.qa.map((item, i) => ({
      ...item,
      answer: mergedAnswers[i],
      questionScore: evaluation.perQuestion[i]?.questionScore ?? 0,
      questionFeedback: evaluation.perQuestion[i]?.questionFeedback ?? "",
    }));

    const saved = await Interview.findByIdAndUpdate(
      interview._id,
      {
        qa: updatedQA,
        score: evaluation.score,
        feedback: {
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          suggestions: evaluation.suggestions,
          overallFeedback: evaluation.overallFeedback,
        },
        integrity,
        cheatingLog,
        isCheatingSuspected,
        status: "evaluated",
        durationSeconds: durationSeconds || null,
        evaluatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({ success: true, interview: saved.toPublicJSON() });
  } catch (error) {
    console.error("submitInterview error:", error);
    res.status(500).json({ success: false, message: "Evaluation failed." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// @route   GET /api/interview/history
// ─────────────────────────────────────────────────────────────────────────
const getInterviewHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      interviews: interviews.map((i) => i.toPublicJSON()),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "History fetch failed." });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Remaining standard routes
// ─────────────────────────────────────────────────────────────────────────
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Interview ID is required." 
      });
    }

    const interview = await Interview.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: "Interview not found." 
      });
    }

    res.status(200).json({ 
      success: true, 
      interview: interview.toPublicJSON() 
    });
  } catch (error) {
    console.error("getInterviewById error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching interview." 
    });
  }
};
const deleteInterview = async (req, res) => {
  /* logic here */
};

module.exports = {
  getInterviewTypes,
  startInterview,
  submitInterview,
  getInterviewHistory,
  getInterviewById,
  deleteInterview,
};
