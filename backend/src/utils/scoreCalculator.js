/**
 * calculateResumeScore
 * ─────────────────────
 * Computes a 0–100 score for a resume based on:
 *  - Number and variety of skills detected       (max 35 pts)
 *  - Presence and length of summary              (max 15 pts)
 *  - Number of strengths identified              (max 20 pts)
 *  - Number of weaknesses (fewer = better)       (max 10 pts)
 *  - Number of actionable suggestions (fewer needed = better) (max 10 pts)
 *  - Length of extracted text (richness proxy)   (max 10 pts)
 *
 * @param {object} params
 * @param {string[]} params.skills
 * @param {string}   params.summary
 * @param {string[]} params.strengths
 * @param {string[]} params.weaknesses
 * @param {string[]} params.suggestions
 * @param {string}   params.extractedText
 * @returns {number} score between 0 and 100
 */
const calculateResumeScore = ({
  skills = [],
  summary = "",
  strengths = [],
  weaknesses = [],
  suggestions = [],
  extractedText = "",
}) => {
  let score = 0;

  // ── Skills (35 pts) ────────────────────────────────────────────────────
  // 0 skills = 0, 5+ = full marks, linear in between
  const skillScore = Math.min(skills.length / 10, 1) * 35;
  score += skillScore;

  // ── Summary quality (15 pts) ───────────────────────────────────────────
  const summaryWords = summary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 30) score += 15;
  else if (summaryWords >= 15) score += 10;
  else if (summaryWords >= 5) score += 5;

  // ── Strengths (20 pts) ─────────────────────────────────────────────────
  // 4+ strengths = full marks
  const strengthScore = Math.min(strengths.length / 4, 1) * 20;
  score += strengthScore;

  // ── Weaknesses — fewer is better (10 pts) ─────────────────────────────
  // 0 weaknesses = 10 pts, 3+ = 0 pts
  const weaknessPenalty = Math.min(weaknesses.length, 3);
  score += (1 - weaknessPenalty / 3) * 10;

  // ── Suggestions — fewer needed = better (10 pts) ──────────────────────
  // 0–1 suggestions = 10 pts, 4+ = 2 pts (some suggestions always fine)
  if (suggestions.length <= 1) score += 10;
  else if (suggestions.length === 2) score += 7;
  else if (suggestions.length === 3) score += 5;
  else score += 2;

  // ── Resume text richness (10 pts) ─────────────────────────────────────
  const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 500) score += 10;
  else if (wordCount >= 300) score += 7;
  else if (wordCount >= 150) score += 4;
  else if (wordCount >= 50) score += 2;

  return Math.round(Math.min(Math.max(score, 0), 100));
};

/**
 * getScoreLabel
 * ──────────────
 * Human-readable label and colour token for a given score.
 */
const getScoreLabel = (score) => {
  if (score >= 85) return { label: "Excellent", color: "emerald" };
  if (score >= 70) return { label: "Good", color: "brand" };
  if (score >= 55) return { label: "Average", color: "amber" };
  if (score >= 40) return { label: "Needs Work", color: "orange" };
  return { label: "Poor", color: "red" };
};

module.exports = { calculateResumeScore, getScoreLabel };
