"use strict";

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper to ensure AI strings match your DB Enums
const VALID_LEVELS = ["Intern", "Junior", "Mid", "Senior", "Lead"];
const VALID_DIFFICULTY = ["Easy", "Medium", "Hard"];

const toLevel = (v) => {
  const f = v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : "";
  return VALID_LEVELS.includes(f) ? f : "Mid";
};

const toDiff = (v) => {
  const f = v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : "";
  return VALID_DIFFICULTY.includes(f) ? f : "Medium";
};

/**
 * generateRecommendations using Gemini
 */
const generateRecommendations = async (profile) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY missing in .env");
    return getFallback(profile);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
    You are a technical recruiter. Based on this profile, generate 8-12 job roles in JSON format.
    Skills: ${profile.skills.join(", ")}
    Resume Score: ${profile.resumeScore}
    
    JSON Schema:
    {
      "marketInsight": "string",
      "topCategory": "string",
      "roles": [
        {
          "title": "string",
          "company": "string",
          "level": "Intern|Junior|Mid|Senior|Lead",
          "category": "string",
          "matchScore": number,
          "salaryRange": "string (LPA)",
          "skills": ["string"],
          "missingSkills": ["string"],
          "whyMatch": "string",
          "difficulty": "Easy|Medium|Hard",
          "timeToReady": "string"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    const roles = data.roles.map((r) => ({
      ...r,
      level: toLevel(r.level),
      difficulty: toDiff(r.difficulty),
      saved: false,
    }));

    return {
      roles: roles.sort((a, b) => b.matchScore - a.matchScore),
      marketInsight: data.marketInsight || "Market is steady.",
      topCategory: data.topCategory || "Software Engineering",
      avgMatchScore: Math.round(
        roles.reduce((s, r) => s + r.matchScore, 0) / roles.length
      ),
    };
  } catch (err) {
    console.error("🔥 Gemini AI Error:", err.message);
    return getFallback(profile);
  }
};

const getFallback = (profile) => ({
  roles: [
    {
      title: "Full Stack Developer",
      company: "Startup",
      level: "Junior",
      category: "Full Stack",
      matchScore: 80,
      salaryRange: "₹6-10 LPA",
      skills: ["React", "Node.js"],
      missingSkills: [],
      whyMatch: "Matches your MERN stack focus.",
      difficulty: "Medium",
      timeToReady: "Ready now",
      saved: false,
    },
  ],
  marketInsight: "AI is briefly unavailable. Showing profile-based matches.",
  topCategory: "Web Development",
  avgMatchScore: 80,
});

module.exports = { generateRecommendations };
