const fetch = require("node-fetch");
const { evaluateInterviewEnhanced } = require("./aiServiceEnhanced");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * evaluateInterview
 * ──────────────────
 * Sends the full Q&A transcript to OpenRouter and returns structured feedback.
 *
 * Returns:
 * {
 *   score: number (0–10),
 *   strengths: string[],
 *   weaknesses: string[],
 *   suggestions: string[],
 *   overallFeedback: string,
 *   perQuestion: Array<{ questionScore: number, questionFeedback: string }>
 * }
 *
 * Always returns something — falls back to mock/heuristic data if AI fails.
 *
 * @param {string[]} questions  - The questions that were asked
 * @param {string[]} answers    - The candidate's answers (same-index mapping)
 * @param {string}   type       - Interview type (e.g. 'react', 'hr')
 */
const evaluateInterview = async (questions, answers, type = "technical") => {
  // Use the enhanced AI service with better error handling and retries
  return await evaluateInterviewEnhanced(questions, answers, type);
};

// ─────────────────────────────────────────────────────────────────────────
// Parsers & helpers
// ─────────────────────────────────────────────────────────────────────────

const parseEvaluationResponse = (content, questionCount) => {
  try {
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    const p = JSON.parse(cleaned);

    // Normalise perQuestion — ensure length matches and fields are valid
    const perQuestion = Array.isArray(p.perQuestion)
      ? p.perQuestion.slice(0, questionCount).map((pq) => ({
          questionScore: clamp(Number(pq?.questionScore ?? 5), 0, 10),
          questionFeedback: toString(pq?.questionFeedback),
        }))
      : Array(questionCount).fill({
          questionScore: 5,
          questionFeedback: "No per-question feedback available.",
        });

    // Pad if AI returned fewer entries than questions
    while (perQuestion.length < questionCount) {
      perQuestion.push({
        questionScore: 5,
        questionFeedback: "No feedback available for this question.",
      });
    }

    return {
      score: clamp(Math.round(Number(p.score ?? 5)), 0, 10),
      strengths: toStringArray(p.strengths, 6),
      weaknesses: toStringArray(p.weaknesses, 6),
      suggestions: toStringArray(p.suggestions, 6),
      overallFeedback: toString(p.overallFeedback),
      perQuestion,
    };
  } catch (err) {
    console.error(
      "parseEvaluationResponse failed:",
      err.message,
      "\nRaw:",
      content?.slice(0, 300)
    );
    return getFallbackEvaluation([], []);
  }
};

// ── Type coercions ─────────────────────────────────────────────────────────

const toString = (val) => (typeof val === "string" ? val.trim() : "");

const toStringArray = (val, max = 6) => {
  if (!Array.isArray(val)) return [];
  return val
    .map((v) => (typeof v === "string" ? v.trim() : String(v).trim()))
    .filter(Boolean)
    .slice(0, max);
};

const clamp = (n, min, max) =>
  Math.min(Math.max(Number.isFinite(n) ? n : min, min), max);

// ── Fallbacks ──────────────────────────────────────────────────────────────

/**
 * Heuristic fallback when AI call fails at runtime.
 * Scores answers by length as a rough proxy for depth.
 */
const getFallbackEvaluation = (questions, answers) => {
  const answered = answers.filter((a) => a && a.trim().length > 20).length;
  const total = questions.length || 1;
  const ratio = answered / total;
  const score = Math.round(ratio * 6 + 1); // 1–7 range when AI is down

  const perQuestion = (questions.length ? questions : []).map((_, i) => {
    const ans = (answers[i] || "").trim();
    const qs =
      ans.length > 100 ? 7 : ans.length > 40 ? 5 : ans.length > 10 ? 3 : 1;
    return {
      questionScore: qs,
      questionFeedback: ans
        ? "Answer received — detailed AI feedback temporarily unavailable."
        : "No answer was provided for this question.",
    };
  });

  return {
    score,
    strengths: ["Attempted the interview session"],
    weaknesses: [
      "AI evaluation was temporarily unavailable — scores are estimates only",
    ],
    suggestions: [
      "Re-submit this interview once the AI service is restored for accurate feedback",
      "Ensure your answers are detailed and specific (aim for 3-5 sentences minimum)",
    ],
    overallFeedback:
      "AI evaluation was temporarily unavailable. Your session has been saved. " +
      "Please try again for a full assessment.",
    perQuestion,
  };
};

/**
 * Rich mock evaluation for development without an API key.
 */
const getMockEvaluation = (questions, answers) => {
  const answered = answers.filter((a) => a && a.trim().length > 30).length;
  const total = questions.length || 7;
  const score = Math.min(Math.round((answered / total) * 4 + 5), 9); // 5–9 range

  const perQuestion = (
    questions.length ? questions : new Array(7).fill("")
  ).map((_, i) => {
    const ans = (answers[i] || "").trim();
    return {
      questionScore: ans.length > 80 ? 8 : ans.length > 30 ? 6 : 3,
      questionFeedback:
        ans.length > 80
          ? "Good, detailed response that demonstrates understanding of the concept."
          : ans.length > 30
          ? "Reasonable answer but could benefit from a concrete example or more depth."
          : "Answer is too brief. Expand with specifics, examples, or code snippets where relevant.",
    };
  });

  return {
    score,
    strengths: [
      "Demonstrated willingness to engage with all questions",
      "Good use of technical terminology in several answers",
      "Structured responses that were easy to follow",
    ],
    weaknesses: [
      "Some answers lacked concrete examples from real projects",
      "A few concepts were described at a surface level without depth",
      "Time management across questions could be more balanced",
    ],
    suggestions: [
      "Use the STAR method (Situation, Task, Action, Result) for behavioural questions",
      "Back technical answers with specific project experience or code examples",
      "Study the topics where you answered briefly — aim for 3–5 sentence responses",
      "Practice mock interviews regularly to build confidence and answer fluency",
    ],
    overallFeedback:
      `You completed a ${total}-question interview with ${answered} substantive answers. ` +
      "Your responses show a foundational understanding of the topics. " +
      "Focus on adding depth and real-world examples to elevate your answers to a senior level.",
    perQuestion,
  };
};

module.exports = { evaluateInterview };
