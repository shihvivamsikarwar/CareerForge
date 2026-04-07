const fetch = require("node-fetch");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * analyzeResume
 * ──────────────
 * Sends the extracted resume text to OpenRouter and parses the structured
 * JSON response into the fields we store in MongoDB.
 *
 * Returns an object with:
 *   { skills, summary, strengths, weaknesses, suggestions }
 *
 * Falls back to safe defaults if the AI response can't be parsed, so the
 * upload never fails hard due to an AI issue.
 *
 * @param {string} resumeText  - Plain text extracted from the uploaded file
 * @returns {Promise<object>}  - Structured analysis result
 */
const analyzeResume = async (resumeText) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";

  if (!apiKey) {
    console.warn("⚠️  OPENROUTER_API_KEY not set — returning mock analysis");
    return getMockAnalysis(resumeText);
  }

  // Truncate to ~4000 words to stay well within context limits
  const truncatedText = truncateText(resumeText, 4000);

  const systemPrompt = `You are an expert resume analyst and career coach with 15+ years of experience.
Your job is to analyze resumes and return ONLY a valid JSON object — no markdown, no explanation, no preamble.
The JSON must exactly match this schema:
{
  "skills": ["skill1", "skill2"],
  "summary": "2-3 sentence professional summary of the candidate",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["actionable suggestion1", "actionable suggestion2", "actionable suggestion3"]
}
Rules:
- skills: List ALL technical and soft skills found (max 20)
- summary: Concise, professional, third-person overview
- strengths: 3-5 specific strong points backed by evidence in the resume
- weaknesses: 2-3 honest gaps or areas that could be improved
- suggestions: 3-5 specific, actionable improvements (not generic advice)
- Return ONLY the JSON object. No other text.`;

  const userPrompt = `Analyze this resume and return structured JSON:\n\n${truncatedText}`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://careerforge.app",
        "X-Title": "CareerForge Resume Analyzer",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Low temperature → consistent, structured output
        max_tokens: 1500,
        response_format: { type: "json_object" }, // Supported by most OpenRouter models
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    return parseAIResponse(content);
  } catch (error) {
    console.error("analyzeResume AI error:", error.message);

    // Return a graceful fallback — the upload still succeeds, we just note
    // the AI couldn't fully analyse it
    return getFallbackAnalysis(resumeText);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * parseAIResponse
 * ────────────────
 * Safely extracts and validates the JSON from the AI message content.
 * Handles models that wrap JSON in markdown code fences.
 */
const parseAIResponse = (content) => {
  try {
    // Strip markdown code fences if present (some models ignore response_format)
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      skills: toStringArray(parsed.skills, 20),
      summary: toString(parsed.summary),
      strengths: toStringArray(parsed.strengths, 10),
      weaknesses: toStringArray(parsed.weaknesses, 10),
      suggestions: toStringArray(parsed.suggestions, 10),
    };
  } catch (err) {
    console.error(
      "Failed to parse AI JSON response:",
      err.message,
      "\nRaw:",
      content?.slice(0, 200)
    );
    return getFallbackAnalysis("");
  }
};

/** Coerce a value to a clean string, or return empty string */
const toString = (val) => (typeof val === "string" ? val.trim() : "");

/** Coerce a value to an array of strings, limited to maxItems */
const toStringArray = (val, maxItems = 20) => {
  if (!Array.isArray(val)) return [];
  return val
    .map((item) =>
      typeof item === "string" ? item.trim() : String(item).trim()
    )
    .filter(Boolean)
    .slice(0, maxItems);
};

/**
 * truncateText
 * ─────────────
 * Keeps the text under ~maxWords words by trimming from the end.
 * Preserves whole words.
 */
const truncateText = (text, maxWords = 4000) => {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return (
    words.slice(0, maxWords).join(" ") +
    "\n[...resume truncated for analysis...]"
  );
};

/**
 * getFallbackAnalysis
 * ────────────────────
 * Returns a minimal analysis based on simple text heuristics when the AI
 * call fails. Ensures the upload always returns something useful.
 */
const getFallbackAnalysis = (text) => {
  const lowerText = (text || "").toLowerCase();

  // Very basic skill keyword detection as a last resort
  const commonSkills = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "node.js",
    "nodejs",
    "express",
    "mongodb",
    "sql",
    "postgresql",
    "mysql",
    "html",
    "css",
    "git",
    "docker",
    "aws",
    "linux",
    "rest api",
    "graphql",
    "tailwind",
    "vue",
    "angular",
    "next.js",
    "redux",
    "c++",
    "c#",
    ".net",
    "php",
  ];

  const detectedSkills = commonSkills.filter((skill) =>
    lowerText.includes(skill)
  );

  return {
    skills: detectedSkills.length
      ? detectedSkills
      : ["Not detected — AI analysis unavailable"],
    summary:
      "AI analysis was temporarily unavailable. A basic scan has been saved. Please re-analyze to get full insights.",
    strengths: ["Resume uploaded successfully"],
    weaknesses: ["AI analysis unavailable — full assessment pending"],
    suggestions: [
      "Re-analyze your resume once the AI service is restored",
      "Ensure your resume is text-based (not a scanned image)",
    ],
  };
};

/**
 * getMockAnalysis
 * ────────────────
 * Returns rich mock data when no API key is configured.
 * Useful during local development without spending API credits.
 */
const getMockAnalysis = (text) => {
  const wordCount = text.split(/\s+/).length;

  return {
    skills: [
      "JavaScript",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "REST APIs",
      "Git",
      "HTML/CSS",
      "Problem Solving",
      "Team Collaboration",
    ],
    summary:
      "Experienced software developer with a strong foundation in full-stack JavaScript development. " +
      "Demonstrates proficiency in modern web technologies and has a track record of delivering " +
      "scalable, user-friendly applications. Shows commitment to clean code and continuous learning.",
    strengths: [
      "Strong technical skills in modern JavaScript ecosystem",
      "Practical experience with full-stack development",
      "Clear demonstration of project ownership and delivery",
      "Good balance of technical and collaborative skills",
    ],
    weaknesses: [
      "Limited mention of system design or architecture experience",
      "Cloud platform experience (AWS/GCP/Azure) not highlighted",
      "No measurable impact metrics on listed achievements",
    ],
    suggestions: [
      'Add quantifiable achievements (e.g., "reduced load time by 40%")',
      "Highlight any cloud platform experience or certifications",
      "Include links to GitHub profile and notable projects",
      'Add a dedicated "Projects" section with tech stack and impact',
      `Your resume is ${wordCount} words — aim for 400–700 words for optimal readability`,
    ],
  };
};

/**
 * analyzeJobDescription
 * ───────────────────
 * Sends job description and resume text to OpenRouter for match analysis.
 * Returns structured analysis with match scores and recommendations.
 *
 * @param {string} prompt - The complete analysis prompt
 * @returns {Promise<string>} - AI response as text
 */
const analyzeJobDescription = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";

  if (!apiKey) {
    console.warn("⚠️  OPENROUTER_API_KEY not set — returning mock job analysis");
    return JSON.stringify(getMockJobAnalysis());
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://careerforge.app",
        "X-Title": "CareerForge Job Analyzer",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are an expert career counselor and technical recruiter. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    return content;
  } catch (error) {
    console.error("analyzeJobDescription AI error:", error.message);
    return JSON.stringify(getMockJobAnalysis());
  }
};

/**
 * getMockJobAnalysis
 * ───────────────────
 * Returns mock job analysis when AI service is unavailable.
 */
const getMockJobAnalysis = () => ({
  matchScore: 75,
  breakdown: {
    technicalSkills: 80,
    experience: 70,
    keywords: 75,
  },
  missingSkills: [
    "Docker & Kubernetes",
    "System Design",
    "GraphQL"
  ],
  matchedSkills: [
    "React",
    "TypeScript",
    "REST APIs",
    "Node.js"
  ],
  actionPlan: [
    "Complete a Docker fundamentals course (2 weeks)",
    "Practice 3 system design problems per week",
    "Add GraphQL to your side project for hands-on XP"
  ],
});

module.exports = { analyzeResume, analyzeJobDescription };
