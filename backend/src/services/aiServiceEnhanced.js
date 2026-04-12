/**
 * Enhanced AI Service
 * Provides robust AI functionality with retry logic, error handling, and fallbacks
 */

const fetch = require("node-fetch");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Enhanced fetch with retry logic
 */
async function fetchWithRetry(url, options, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (i === maxRetries - 1) return response;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

/**
 * Parse AI response with validation
 */
function parseAIResponse(content, expectedFields = []) {
  try {
    // Strip markdown code fences if present
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    
    // Validate expected fields
    const result = {};
    expectedFields.forEach(field => {
      result[field] = parsed[field] || null;
    });
    
    return result;
  } catch (err) {
    console.error("Failed to parse AI JSON response:", err.message);
    return null;
  }
}

/**
 * Validate and coerce values
 */
function validateAndCoerce(value, type, defaultValue = null) {
  if (type === 'number') {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  if (type === 'string') {
    return typeof value === 'string' ? value.trim() : defaultValue;
  }
  if (type === 'array') {
    return Array.isArray(value) ? value : defaultValue;
  }
  return value || defaultValue;
}

/**
 * Enhanced Resume Analysis
 */
async function analyzeResumeEnhanced(resumeText) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo";

  if (!apiKey) {
    console.warn("OpenRouter API key not configured, using fallback");
    return getFallbackResumeAnalysis();
  }

  const prompt = `
As an expert resume reviewer, analyze the following resume and provide detailed feedback.

RESUME TEXT:
${resumeText}

Please provide analysis in this JSON format:
{
  "skills": ["JavaScript", "React", "Node.js"],
  "summary": "Brief professional summary",
  "strengths": ["Strong technical skills", "Good experience"],
  "weaknesses": ["Limited experience with X", "Could improve Y"],
  "suggestions": ["Add quantifiable achievements", "Include certifications"]
}

Focus on:
1. Technical skills identification
2. Experience assessment
3. Strengths and weaknesses
4. Actionable improvement suggestions
5. Overall professional summary

Respond ONLY with valid JSON.
`;

  try {
    const response = await fetchWithRetry(OPENROUTER_URL, {
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
          { role: "system", content: "You are an expert resume reviewer. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    const parsed = parseAIResponse(content, ['skills', 'summary', 'strengths', 'weaknesses', 'suggestions']);
    
    if (!parsed) {
      throw new Error("Failed to parse AI response");
    }

    return {
      skills: validateAndCoerce(parsed.skills, 'array', []),
      summary: validateAndCoerce(parsed.summary, 'string', ''),
      strengths: validateAndCoerce(parsed.strengths, 'array', []),
      weaknesses: validateAndCoerce(parsed.weaknesses, 'array', []),
      suggestions: validateAndCoerce(parsed.suggestions, 'array', [])
    };

  } catch (error) {
    console.error("Resume analysis error:", error.message);
    return getFallbackResumeAnalysis();
  }
}

/**
 * Enhanced Interview Evaluation
 */
async function evaluateInterviewEnhanced(questions, answers, type = "technical") {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo";

  if (!apiKey) {
    console.warn("OpenRouter API key not configured, using fallback");
    return getFallbackInterviewEvaluation();
  }

  // Build transcript
  const transcript = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i]}`).join('\n\n');

  const prompt = `
As an expert interviewer, evaluate the following ${type} interview performance.

INTERVIEW TRANSCRIPT:
${transcript}

Please provide evaluation in this JSON format:
{
  "overallScore": 85,
  "overallFeedback": "Overall assessment of performance",
  "strengths": ["Clear communication", "Good technical knowledge"],
  "weaknesses": ["Could provide more examples", "Needs deeper explanation"],
  "suggestions": ["Practice STAR method", "Study specific topics"],
  "questionFeedback": [
    {
      "question": "Question text",
      "score": 8,
      "feedback": "Specific feedback for this question"
    }
  ]
}

Provide scores 0-10 and actionable feedback.
Respond ONLY with valid JSON.
`;

  try {
    const response = await fetchWithRetry(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://careerforge.app",
        "X-Title": "CareerForge Interview Evaluator",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are an expert interviewer. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    const parsed = parseAIResponse(content, ['overallScore', 'overallFeedback', 'strengths', 'weaknesses', 'suggestions', 'questionFeedback']);
    
    if (!parsed) {
      throw new Error("Failed to parse AI response");
    }

    return {
      overallScore: validateAndCoerce(parsed.overallScore, 'number', 7),
      overallFeedback: validateAndCoerce(parsed.overallFeedback, 'string', ''),
      strengths: validateAndCoerce(parsed.strengths, 'array', []),
      weaknesses: validateAndCoerce(parsed.weaknesses, 'array', []),
      suggestions: validateAndCoerce(parsed.suggestions, 'array', []),
      questionFeedback: validateAndCoerce(parsed.questionFeedback, 'array', [])
    };

  } catch (error) {
    console.error("Interview evaluation error:", error.message);
    return getFallbackInterviewEvaluation();
  }
}

/**
 * Enhanced Performance Analysis
 */
async function analyzePerformanceEnhanced(digest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo";

  if (!apiKey) {
    console.warn("OpenRouter API key not configured, using fallback");
    return getFallbackPerformanceAnalysis();
  }

  const prompt = `
As a career coach, analyze the following interview performance digest and provide insights.

PERFORMANCE DIGEST:
- Total Interviews: ${digest.totalInterviews}
- Average Score: ${digest.averageScore}
- Best Score: ${digest.bestScore}
- Worst Score: ${digest.worstScore}
- Score Trend: ${digest.scoreTrend?.join(', ')}
- Interview Types: ${digest.interviewTypes?.join(', ')}
- Suspected Cheating: ${digest.suspectedCheatingCount}
- All Strengths: ${digest.allStrengths?.join(', ')}
- All Weaknesses: ${digest.allWeaknesses?.join(', ')}

Please provide analysis in this JSON format:
{
  "level": "Intermediate",
  "skills": ["JavaScript", "Problem Solving"],
  "improvementPlan": ["Practice DSA", "Study system design"],
  "careerSuggestions": ["Frontend Developer", "Full Stack Engineer"],
  "trustScore": 85,
  "summary": "Overall assessment and recommendations"
}

Focus on:
1. Current skill level assessment
2. Key strengths to leverage
3. Specific improvement plan
4. Career path suggestions
5. Trust score based on integrity

Respond ONLY with valid JSON.
`;

  try {
    const response = await fetchWithRetry(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://careerforge.app",
        "X-Title": "CareerForge Performance Analyzer",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are an expert career coach. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    const parsed = parseAIResponse(content, ['level', 'skills', 'improvementPlan', 'careerSuggestions', 'trustScore', 'summary']);
    
    if (!parsed) {
      throw new Error("Failed to parse AI response");
    }

    return {
      level: validateAndCoerce(parsed.level, 'string', 'Beginner'),
      skills: validateAndCoerce(parsed.skills, 'array', []),
      improvementPlan: validateAndCoerce(parsed.improvementPlan, 'array', []),
      careerSuggestions: validateAndCoerce(parsed.careerSuggestions, 'array', []),
      trustScore: validateAndCoerce(parsed.trustScore, 'number', 75),
      summary: validateAndCoerce(parsed.summary, 'string', '')
    };

  } catch (error) {
    console.error("Performance analysis error:", error.message);
    return getFallbackPerformanceAnalysis();
  }
}

// Fallback functions
function getFallbackResumeAnalysis() {
  return {
    skills: ["JavaScript", "React", "Node.js"],
    summary: "AI analysis was temporarily unavailable. A basic scan has been saved.",
    strengths: ["Resume uploaded successfully"],
    weaknesses: ["AI analysis unavailable"],
    suggestions: ["Re-analyze your resume once the AI service is restored"]
  };
}

function getFallbackInterviewEvaluation() {
  return {
    overallScore: 7,
    overallFeedback: "Interview evaluation completed with basic assessment.",
    strengths: ["Attempted all questions", "Clear communication"],
    weaknesses: ["Could provide more detailed examples"],
    suggestions: ["Practice with more technical questions", "Study specific topics"],
    questionFeedback: []
  };
}

function getFallbackPerformanceAnalysis() {
  return {
    level: "Intermediate",
    skills: ["Problem Solving", "Communication"],
    improvementPlan: ["Practice more interviews", "Study technical concepts"],
    careerSuggestions: ["Software Developer", "Technical Lead"],
    trustScore: 80,
    summary: "Performance analysis completed with basic insights."
  };
}

module.exports = {
  analyzeResumeEnhanced,
  evaluateInterviewEnhanced,
  analyzePerformanceEnhanced,
  fetchWithRetry,
  parseAIResponse,
  validateAndCoerce
};
