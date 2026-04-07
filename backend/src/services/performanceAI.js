"use strict";

const fetch = require("node-fetch");

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";

  if (!apiKey) {
    console.warn(
      "⚠️  OPENROUTER_API_KEY not set — returning mock performance analysis"
    );
    return getMock(digest);
  }

  const system = `You are a senior career coach and talent analyst.
Analyse the candidate's interview performance data and return ONLY a valid JSON object — no markdown, no preamble.

Required schema:
{
  "overallLevel": "Beginner | Intermediate | Advanced | Expert",
  "strongSkills": ["skill derived from strengths data"],
  "weakSkills":   ["specific gap derived from weaknesses"],
  "improvementPlan": ["concrete actionable step"],
  "careerSuggestions": ["specific job role or career path"],
  "trustScore": 0-100,
  "summary": "3-4 sentence overall career-readiness assessment"
}

Rules:
- overallLevel: 0-4=Beginner, 5-6=Intermediate, 7-8=Advanced, 9-10=Expert
- strongSkills: 3-6 evidence-backed skills
- weakSkills: 2-5 specific gaps
- improvementPlan: 4-6 prioritised actionable steps (not generic)
- careerSuggestions: 3-5 specific roles (e.g. "Frontend Engineer at a product startup")
- trustScore: start 100, subtract 15 per cheating incident, minimum 10
- summary: honest, constructive, motivating`;

  const user = `Performance digest:
- Total sessions: ${digest.totalInterviews}
- Average score: ${digest.averageScore}/10
- Best: ${digest.bestScore}/10  Worst: ${digest.worstScore}/10
- Score trend (oldest→newest): [${digest.scoreTrend.join(", ")}]
- Interview types: ${digest.interviewTypes.join(", ")}
- Suspected cheating sessions: ${digest.suspectedCheatingCount}

Top recurring strengths:
${digest.allStrengths
  .slice(0, 15)
  .map((s, i) => `${i + 1}. ${s}`)
  .join("\n")}

Top recurring weaknesses:
${digest.allWeaknesses
  .slice(0, 15)
  .map((w, i) => `${i + 1}. ${w}`)
  .join("\n")}`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://careerforge.app",
        "X-Title": "CareerForge Performance Analyser",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        max_tokens: 1800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok)
      throw new Error(
        `OpenRouter ${response.status}: ${await response.text()}`
      );

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    return parse(content, digest);
  } catch (err) {
    console.error("analyzePerformance error:", err.message);
    return getFallback(digest);
  }
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
