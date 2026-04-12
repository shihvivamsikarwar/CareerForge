"use strict";

const fetch = require("node-fetch");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ── Type helpers ──────────────────────────────────────────────────────────────
const clamp = (n, lo, hi) =>
  Math.min(Math.max(Number.isFinite(n) ? n : lo, lo), hi);
const toInt = (v, fb) => {
  const n = parseInt(v);
  return Number.isFinite(n) ? clamp(n, 0, 100) : fb;
};
const toStr = (v, fb = "") =>
  typeof v === "string" && v.trim() ? v.trim() : fb;
const toArr = (v, max) => {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => (typeof s === "string" ? s.trim() : String(s).trim()))
    .filter(Boolean)
    .slice(0, max);
};

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const toLevel = (raw, avgScore) => {
  if (LEVELS.includes(raw)) return raw;
  if (avgScore >= 9) return "Expert";
  if (avgScore >= 7) return "Advanced";
  if (avgScore >= 5) return "Intermediate";
  return "Beginner";
};

const CONFIDENCE = ["Low", "Medium", "High", "Very High"];
const toConf = (raw) => (CONFIDENCE.includes(raw) ? raw : "Medium");

/**
 * generateCareerGuidance
 * ───────────────────────
 * Aggregates all user data into a career guidance package via OpenRouter.
 *
 * @param {object} profile
 * @param {string[]}  profile.skills           — from latest resume
 * @param {string[]}  profile.resumeStrengths  — from latest resume
 * @param {string[]}  profile.resumeWeaknesses — from latest resume
 * @param {number}    profile.resumeScore       — resume quality score (0-100)
 * @param {number}    profile.avgInterviewScore — average interview score (0-10)
 * @param {number}    profile.totalInterviews   — count of completed interviews
 * @param {string[]}  profile.interviewStrengths
 * @param {string[]}  profile.interviewWeaknesses
 * @param {string[]}  profile.interviewTypes    — types attempted
 * @param {object[]}  profile.jobHistory        — [{ jobTitle, matchScore, missingSkills }]
 * @param {boolean}   profile.hasResume
 * @param {boolean}   profile.hasInterviews
 *
 * @returns {Promise<{
 *   careerPaths, recommendedRoles, currentLevel, skillGaps,
 *   learningRoadmap, jobReadiness, timeToReady, confidenceLevel, summary
 * }>}
 */

const generateCareerGuidance = async (profile) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";

  if (!apiKey) {
    console.warn(
      "⚠️ OPENROUTER_API_KEY not set — returning mock career guidance"
    );
    return getMock(profile);
  }

  // ── System prompt (keep your existing system prompt variable here) ──
  const system = `...`;

  // ── User prompt with updated safety guards ──
  const jobHistorySummary =
    (profile.jobHistory || [])
      .slice(0, 5)
      .map((j) => `  • "${j.jobTitle || "Unknown"}" — match ${j.matchScore}%`)
      .join("\n") || "  • None yet";

  const user = `CANDIDATE PROFILE:

Resume (${profile.hasResume ? "uploaded" : "NOT uploaded"}):
- Quality score: ${profile.resumeScore}/100
- Skills: ${(profile.skills || []).join(", ") || "None detected"}
- Strengths: ${(profile.resumeStrengths || []).slice(0, 5).join("; ") || "None"}
- Weaknesses: ${
    (profile.resumeWeaknesses || []).slice(0, 3).join("; ") || "None"
  }

Interviews (${
    profile.hasInterviews ? `${profile.totalInterviews} completed` : "None yet"
  }):
- Average score: ${
    profile.hasInterviews ? `${profile.avgInterviewScore}/10` : "N/A"
  }
- Types attempted: ${(profile.interviewTypes || []).join(", ") || "None"}
- Recurring strengths: ${
    (profile.interviewStrengths || []).slice(0, 5).join("; ") || "None"
  }
- Recurring weaknesses: ${
    (profile.interviewWeaknesses || []).slice(0, 5).join("; ") || "None"
  }

Job Analysis History (${(profile.jobHistory || []).length} analyses):
${jobHistorySummary}

Generate a complete, personalised career guidance report.`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://careerforge.app",
        "X-Title": "CareerForge Career Guidance",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.35,
        max_tokens: 2400,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter ${response.status}: ${body}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenRouter");

    return parse(content, profile);
  } catch (err) {
    console.error("generateCareerGuidance AI error:", err.message);
    return getFallback(profile);
  }
};

// ── Parser ────────────────────────────────────────────────────────────────────

const parse = (content, profile) => {
  try {
    const raw = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    const p = JSON.parse(raw);

    // careerPaths — normalise each entry
    const careerPaths = toArr(p.careerPaths, 5).map((cp) => ({
      title: toStr(cp.title, "Software Developer"),
      fit: toInt(cp.fit, 50),
      description: toStr(cp.description, ""),
      icon: toStr(cp.icon, "💻"),
    }));

    // recommendedRoles
    const recommendedRoles = toArr(p.recommendedRoles, 5).map((r) => ({
      title: toStr(r.title, "Software Engineer"),
      level: ["Junior", "Mid", "Senior"].includes(r.level) ? r.level : "Mid",
      matchPercent: toInt(r.matchPercent, 50),
      reason: toStr(r.reason, ""),
    }));

    // skillGaps
    const skillGaps = toArr(p.skillGaps, 8).map((g) => ({
      skill: toStr(g.skill, "Unknown skill"),
      priority: ["High", "Medium", "Low"].includes(g.priority)
        ? g.priority
        : "Medium",
      learningTime: toStr(g.learningTime, "1-2 weeks"),
    }));

    // learningRoadmap
    const learningRoadmap = toArr(p.learningRoadmap, 8).map((step, i) => ({
      step: Number.isFinite(parseInt(step.step)) ? parseInt(step.step) : i + 1,
      title: toStr(step.title, `Step ${i + 1}`),
      description: toStr(step.description, ""),
      duration: toStr(step.duration, "1 week"),
      type: ["Learn", "Build", "Practice", "Apply"].includes(step.type)
        ? step.type
        : "Learn",
    }));

    return {
      currentLevel: toLevel(p.currentLevel, profile.avgInterviewScore),
      jobReadiness: toInt(p.jobReadiness, 40),
      confidenceLevel: toConf(p.confidenceLevel),
      timeToReady: toStr(p.timeToReady, "A few weeks of focused practice"),
      summary: toStr(p.summary, ""),
      careerPaths: careerPaths.length ? careerPaths : getFallbackPaths(profile),
      recommendedRoles: recommendedRoles.length
        ? recommendedRoles
        : getFallbackRoles(profile),
      skillGaps: skillGaps.length ? skillGaps : getFallbackGaps(profile),
      learningRoadmap: learningRoadmap.length
        ? learningRoadmap
        : getFallbackRoadmap(profile),
    };
  } catch (err) {
    console.error(
      "careerAI parse failed:",
      err.message,
      "\nRaw:",
      content?.slice(0, 200)
    );
    return getFallback(profile);
  }
};

// ── Fallbacks ─────────────────────────────────────────────────────────────────

const getFallbackPaths = (profile) => [
  {
    title: "Frontend Developer",
    fit: 70,
    description: "Leverage your UI skills to build modern web apps.",
    icon: "🎨",
  },
  {
    title: "Full Stack Developer",
    fit: 60,
    description: "Expand into backend to become a versatile engineer.",
    icon: "⚡",
  },
  {
    title: "Backend Developer",
    fit: 55,
    description: "Deepen server-side and database expertise.",
    icon: "🛠️",
  },
];

const getFallbackRoles = (profile) => [
  {
    title: "Junior Software Engineer",
    level: "Junior",
    matchPercent: 65,
    reason: "Good foundation for entry-level roles.",
  },
  {
    title: "Frontend Developer",
    level: "Mid",
    matchPercent: 60,
    reason: "Strong alignment with frontend interview types.",
  },
];

const getFallbackGaps = (profile) => {
  const gaps = [
    ...profile.interviewWeaknesses.slice(0, 3).map((w) => ({
      skill: w.slice(0, 50),
      priority: "High",
      learningTime: "1-2 weeks",
    })),
    { skill: "System Design", priority: "High", learningTime: "3-4 weeks" },
    {
      skill: "Data Structures & Algo",
      priority: "Medium",
      learningTime: "2-3 weeks",
    },
  ];
  return gaps.slice(0, 5);
};

const getFallbackRoadmap = (profile) => [
  {
    step: 1,
    title: "Solidify core skills",
    description: "Review and practice your weakest interview topics daily.",
    duration: "1 week",
    type: "Learn",
  },
  {
    step: 2,
    title: "Build a portfolio project",
    description: "Create one full-stack project showcasing your top skills.",
    duration: "2 weeks",
    type: "Build",
  },
  {
    step: 3,
    title: "Practice mock interviews",
    description:
      "Complete 3 mock interviews per week across different categories.",
    duration: "2 weeks",
    type: "Practice",
  },
  {
    step: 4,
    title: "Learn system design basics",
    description:
      "Study scalability, load balancing, caching, and database patterns.",
    duration: "1 week",
    type: "Learn",
  },
  {
    step: 5,
    title: "Update resume and apply",
    description:
      "Tailor your resume for each role and begin applying to 5+ jobs/week.",
    duration: "Ongoing",
    type: "Apply",
  },
];

const getFallback = (profile) => ({
  currentLevel: toLevel("", profile.avgInterviewScore || 0),
  jobReadiness:
    profile.hasResume && profile.hasInterviews
      ? 50
      : profile.hasResume
      ? 35
      : 20,
  confidenceLevel:
    profile.hasResume && profile.hasInterviews ? "Medium" : "Low",
  timeToReady:
    profile.hasResume && profile.hasInterviews ? "4-6 weeks" : "2-3 months",
  summary:
    "AI guidance is temporarily unavailable. Based on your profile data, we have generated estimated recommendations. Upload your resume and complete more interviews for a richer, AI-personalised plan.",
  careerPaths: getFallbackPaths(profile),
  recommendedRoles: getFallbackRoles(profile),
  skillGaps: getFallbackGaps(profile),
  learningRoadmap: getFallbackRoadmap(profile),
});

// ── Development mock (no API key) ─────────────────────────────────────────────
const getMock = (profile) => {
  const level = toLevel("", profile.avgInterviewScore || 5);
  const hasData = profile.hasResume || profile.hasInterviews;
  const readiness =
    profile.hasResume && profile.hasInterviews
      ? Math.round(45 + (profile.avgInterviewScore || 5) * 5)
      : profile.hasResume
      ? 35
      : 25;

  return {
    currentLevel: level,
    jobReadiness: clamp(readiness, 10, 92),
    confidenceLevel:
      readiness >= 70 ? "High" : readiness >= 50 ? "Medium" : "Low",
    timeToReady:
      readiness >= 75
        ? "You are ready to apply now!"
        : readiness >= 55
        ? "3-4 weeks of focused practice"
        : "2-3 months of consistent learning",
    summary: `You are currently at ${level} level${
      profile.hasInterviews
        ? ` with an average interview score of ${profile.avgInterviewScore}/10`
        : ""
    }. ${
      profile.hasResume
        ? "Your resume demonstrates solid foundational skills."
        : "Uploading your resume will significantly improve the accuracy of this analysis."
    } ${
      readiness >= 60
        ? "You are well on your way to landing a solid engineering role."
        : "Consistent practice on your weak areas will accelerate your job readiness significantly."
    }`,
    careerPaths: [
      {
        title: "Frontend Developer",
        fit: 80,
        description:
          "Strong match — your JavaScript and React skills align well with frontend roles.",
        icon: "🎨",
      },
      {
        title: "Full Stack Developer",
        fit: 72,
        description:
          "Good fit — combine your frontend skills with backend knowledge for versatile roles.",
        icon: "⚡",
      },
      {
        title: "Backend Developer",
        fit: 60,
        description:
          "Achievable with 4-6 weeks focused on Node.js and database design.",
        icon: "🛠️",
      },
      {
        title: "React Native Developer",
        fit: 55,
        description:
          "Leverage React knowledge to transition into mobile development.",
        icon: "📱",
      },
    ],
    recommendedRoles: [
      {
        title: "React Developer at a product startup",
        level: "Mid",
        matchPercent: 78,
        reason:
          "Your React and component skills are well-suited for fast-moving startup environments.",
      },
      {
        title: "Junior Full Stack Engineer at a SaaS company",
        level: "Junior",
        matchPercent: 70,
        reason:
          "Good foundational skills; SaaS companies offer structured mentorship for juniors.",
      },
      {
        title: "Frontend Engineer at a digital agency",
        level: "Mid",
        matchPercent: 65,
        reason:
          "Agencies value frontend speed — a great place to build a diverse portfolio quickly.",
      },
      {
        title: "Software Engineer at a mid-size tech company",
        level: "Junior",
        matchPercent: 60,
        reason:
          "Broader exposure to engineering practices and team collaboration.",
      },
    ],
    skillGaps: [
      {
        skill: "System Design & Scalability",
        priority: "High",
        learningTime: "3-4 weeks",
      },
      {
        skill: "Data Structures & Algorithms",
        priority: "High",
        learningTime: "2-3 weeks",
      },
      { skill: "TypeScript", priority: "Medium", learningTime: "1 week" },
      {
        skill: "Docker & Containerisation",
        priority: "Medium",
        learningTime: "1-2 weeks",
      },
      {
        skill: "Database Optimisation (SQL)",
        priority: "Low",
        learningTime: "2 weeks",
      },
    ],
    learningRoadmap: [
      {
        step: 1,
        title: "Close the DSA gap",
        description:
          "Solve 2 LeetCode problems daily — focus on arrays, hashmaps, and trees.",
        duration: "2 weeks",
        type: "Practice",
      },
      {
        step: 2,
        title: "Learn system design fundamentals",
        description:
          "Study load balancing, caching, and database sharding using free YouTube resources.",
        duration: "1 week",
        type: "Learn",
      },
      {
        step: 3,
        title: "Add TypeScript to a project",
        description:
          "Migrate one existing JavaScript project to TypeScript to demonstrate modern skills.",
        duration: "1 week",
        type: "Build",
      },
      {
        step: 4,
        title: "Build a full-stack capstone",
        description:
          "Create a complete project (React + Node + MongoDB) with auth and deploy it online.",
        duration: "2 weeks",
        type: "Build",
      },
      {
        step: 5,
        title: "Complete 10 mock interviews",
        description:
          "Alternate between technical and HR interview types — aim for 8+/10 consistently.",
        duration: "2 weeks",
        type: "Practice",
      },
      {
        step: 6,
        title: "Optimise your resume & apply",
        description:
          "Tailor your resume to 3 target roles and apply to 5-10 companies per week.",
        duration: "Ongoing",
        type: "Apply",
      },
    ],
  };
};

module.exports = { generateCareerGuidance };
