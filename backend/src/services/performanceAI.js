"use strict";

const fetch = require("node-fetch");
const { analyzePerformanceEnhanced } = require("./aiServiceEnhanced");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const clamp = (n, lo, hi) =>
  Math.min(Math.max(Number.isFinite(n) ? n : lo, lo), hi);
const toString = (v) => (typeof v === "string" ? v.trim() : "");
const toStringArray = (v, max) => {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => (typeof s === "string" ? s.trim() : String(s).trim()))
    .filter(Boolean)
    .slice(0, max);
};
const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const toLevel = (raw, avg) => {
  if (VALID_LEVELS.includes(raw)) return raw;
  if (avg >= 9) return "Expert";
  if (avg >= 7) return "Advanced";
  if (avg >= 5) return "Intermediate";
  return "Beginner";
};
const trustFromCheating = (flagged, total) => {
  if (!total) return 100;
  return Math.max(10, Math.round(100 - (flagged / total) * 60 - flagged * 3));
};

const analyzePerformance = async (digest) => {
  // Use the enhanced AI service with better error handling and retries
  return await analyzePerformanceEnhanced(digest);
};

const parse = (content, digest) => {
  try {
    const p = JSON.parse(
      content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/```\s*$/, "")
        .trim()
    );
    return {
      overallLevel: toLevel(p.overallLevel, digest.averageScore),
      strongSkills: toStringArray(p.strongSkills, 8),
      weakSkills: toStringArray(p.weakSkills, 8),
      improvementPlan: toStringArray(p.improvementPlan, 8),
      careerSuggestions: toStringArray(p.careerSuggestions, 6),
      trustScore:
        clamp(Number(p.trustScore), 10, 100) ||
        trustFromCheating(
          digest.suspectedCheatingCount,
          digest.totalInterviews
        ),
      summary: toString(p.summary),
    };
  } catch (err) {
    console.error("parse failed:", err.message);
    return getFallback(digest);
  }
};

const getFallback = (digest) => ({
  overallLevel: toLevel("", digest.averageScore),
  strongSkills: (digest.allStrengths || [])
    .slice(0, 4)
    .map((s) => s.slice(0, 80)),
  weakSkills: (digest.allWeaknesses || [])
    .slice(0, 3)
    .map((w) => w.slice(0, 80)),
  improvementPlan: [
    "Take mock interviews regularly — aim for 2 sessions per week",
    "Review AI feedback from your best sessions and replicate that approach",
    "Focus on the specific weaknesses flagged across your recent sessions",
    "Practice articulating your thought process clearly before coding or answering",
  ],
  careerSuggestions: [
    "Software Developer roles matching your strongest interview categories",
    "Target roles that align with the interview types you score highest in",
  ],
  trustScore: trustFromCheating(
    digest.suspectedCheatingCount,
    digest.totalInterviews
  ),
  summary:
    "AI analysis was temporarily unavailable. Your statistics are compiled from your interview history. Complete more sessions for a richer analysis.",
});

const getMock = (digest) => {
  const level = toLevel("", digest.averageScore);
  const trust = trustFromCheating(
    digest.suspectedCheatingCount,
    digest.totalInterviews
  );
  return {
    overallLevel: level,
    strongSkills: [
      "JavaScript fundamentals and modern ES6+ patterns",
      "React component architecture and hooks",
      "Communicating technical concepts clearly",
      "Problem-solving approach and logical reasoning",
    ],
    weakSkills: [
      "System design and scalability thinking",
      "Data structures and algorithmic complexity",
      "Database optimisation and query design",
    ],
    improvementPlan: [
      "Complete 2 DSA sessions this week — focus on arrays and binary search",
      "Study system design: caching, load balancing, and horizontal scaling",
      'Read "Designing Data-Intensive Applications" — 1 chapter per week',
      "Practice thinking out loud before writing code in every session",
      "Build one open-source project for real-world system experience",
      "Do a mock HR round every 2 weeks to sharpen communication",
    ],
    careerSuggestions: [
      "Frontend Engineer at a product startup (React / TypeScript)",
      "Full-Stack Developer at a SaaS company (Node.js + React)",
      "Junior Software Engineer at a mid-size tech company",
      "Backend Developer — invest 3 months in system design depth first",
    ],
    trustScore: trust,
    summary: `You are at ${level} level with an average of ${
      digest.averageScore
    }/10 across ${digest.totalInterviews} interview${
      digest.totalInterviews !== 1 ? "s" : ""
    }. Your strongest areas are frontend and communication. Focus on system design and algorithms to level up. With consistent practice you are well-positioned to land a solid engineering role within 2–3 months.`,
  };
};

module.exports = { analyzePerformance };
