const { analyzeJobDescription: callAI } = require("./aiService");

/**
 * Analyze job description against user profile
 */
async function analyzeJobDescription(jobDescription, userData) {
  try {
    const prompt = `
As an expert career counselor and technical recruiter, analyze the following job description against the candidate's profile and provide a comprehensive assessment.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
Skills: ${userData.skills.join(", ")}
Experience: ${userData.experience}
Education: ${userData.education}
Resume Score: ${userData.score}/100
Strengths: ${userData.strengths.join(", ")}
Weaknesses: ${userData.weaknesses.join(", ")}

PERFORMANCE DATA:
Average Interview Score: ${userData.performance.averageScore}/100
Total Interviews: ${userData.performance.totalInterviews}
Recent Scores: ${userData.performance.recentScores.join(", ")}
Weak Areas: ${userData.performance.weakAreas.join(", ")}

Provide a comprehensive analysis in the following JSON format:
{
  "matchScore": 85,
  "matchedSkills": ["React", "TypeScript", "Node.js"],
  "missingSkills": ["Docker", "AWS", "GraphQL"],
  "suggestions": [
    "Learn Docker and containerization",
    "Get AWS certification",
    "Practice GraphQL APIs"
  ],
  "readinessScore": 75
}

Analysis criteria:
1. Match Score (0-100): Overall compatibility percentage
2. Matched Skills: Skills from resume that match job requirements
3. Missing Skills: Required skills not found in candidate profile
4. Suggestions: Specific recommendations to improve candidacy
5. Readiness Score (0-100): How ready candidate is for this role

Consider both resume skills and interview performance in your assessment.
Respond ONLY with valid JSON. No explanations or additional text.
`;

    // Call AI service
    const aiResponse = await callAI(prompt);
    console.log("Job Analysis AI Response:", aiResponse);

    // Parse and validate the response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
      console.log("Parsed Job Analysis:", analysis);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysis = getFallbackAnalysis();
    }

    // Validate and sanitize the analysis
    return validateAnalysis(analysis);
  } catch (error) {
    console.error("Job analysis error:", error);
    return getFallbackAnalysis();
  }
}

/**
 * Recommend job roles based on user profile
 */
async function recommendJobs(userData) {
  try {
    const prompt = `
As an expert career counselor, analyze the candidate's profile and recommend the best job roles for them.

CANDIDATE PROFILE:
Skills: ${userData.skills.join(", ")}
Experience: ${userData.experience}
Education: ${userData.education}
Resume Score: ${userData.score}/100
Strengths: ${userData.strengths.join(", ")}
Weaknesses: ${userData.weaknesses.join(", ")}

PERFORMANCE DATA:
Average Interview Score: ${userData.performance.averageScore}/100
Total Interviews: ${userData.performance.totalInterviews}
Recent Scores: ${userData.performance.recentScores.join(", ")}
Weak Areas: ${userData.performance.weakAreas.join(", ")}

Provide job recommendations in the following JSON format:
{
  "bestRoles": [
    "Frontend Developer",
    "Full Stack Developer",
    "Technical Lead"
  ],
  "confidenceLevel": "High",
  "reason": "Strong technical skills with good performance history",
  "learningPath": [
    "Advanced React patterns",
    "System design",
    "Team leadership"
  ],
  "weakAreas": [
    "Cloud platforms",
    "System architecture"
  ]
}

Recommendation criteria:
1. Best Roles: 3-5 most suitable job titles
2. Confidence Level: High/Medium/Low based on profile strength
3. Reason: Brief explanation for recommendations
4. Learning Path: Skills to develop for career growth
5. Weak Areas: Areas needing improvement

Consider both skills and interview performance in your recommendations.
Respond ONLY with valid JSON. No explanations or additional text.
`;

    // Call AI service
    const aiResponse = await callAI(prompt);
    console.log("Job Recommendations AI Response:", aiResponse);

    // Parse and validate the response
    let recommendations;
    try {
      recommendations = JSON.parse(aiResponse);
      console.log("Parsed Job Recommendations:", recommendations);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      recommendations = getFallbackRecommendations();
    }

    // Validate and sanitize the recommendations
    return validateRecommendations(recommendations);
  } catch (error) {
    console.error("Job recommendations error:", error);
    return getFallbackRecommendations();
  }
}

/**
 * Validate and sanitize analysis data
 */
function validateAnalysis(analysis) {
  const defaultAnalysis = getFallbackAnalysis();

  return {
    matchScore: Math.min(
      100,
      Math.max(0, parseInt(analysis.matchScore) || defaultAnalysis.matchScore)
    ),
    matchedSkills: Array.isArray(analysis.matchedSkills)
      ? analysis.matchedSkills.slice(0, 10)
      : defaultAnalysis.matchedSkills,
    missingSkills: Array.isArray(analysis.missingSkills)
      ? analysis.missingSkills.slice(0, 10)
      : defaultAnalysis.missingSkills,
    suggestions: Array.isArray(analysis.suggestions)
      ? analysis.suggestions.slice(0, 8)
      : defaultAnalysis.suggestions,
    readinessScore: Math.min(
      100,
      Math.max(
        0,
        parseInt(analysis.readinessScore) || defaultAnalysis.readinessScore
      )
    ),
  };
}

/**
 * Validate and sanitize recommendations data
 */
function validateRecommendations(recommendations) {
  const defaultRecommendations = getFallbackRecommendations();

  return {
    bestRoles: Array.isArray(recommendations.bestRoles)
      ? recommendations.bestRoles.slice(0, 5)
      : defaultRecommendations.bestRoles,
    confidenceLevel: ["High", "Medium", "Low"].includes(
      recommendations.confidenceLevel
    )
      ? recommendations.confidenceLevel
      : defaultRecommendations.confidenceLevel,
    reason:
      typeof recommendations.reason === "string"
        ? recommendations.reason.substring(0, 200)
        : defaultRecommendations.reason,
    learningPath: Array.isArray(recommendations.learningPath)
      ? recommendations.learningPath.slice(0, 6)
      : defaultRecommendations.learningPath,
    weakAreas: Array.isArray(recommendations.weakAreas)
      ? recommendations.weakAreas.slice(0, 6)
      : defaultRecommendations.weakAreas,
  };
}

/**
 * Fallback analysis when AI fails
 */
function getFallbackAnalysis() {
  return {
    matchScore: 65,
    matchedSkills: ["Programming", "Problem Solving", "Communication"],
    missingSkills: ["Cloud platforms", "System design", "Advanced algorithms"],
    suggestions: [
      "Gain cloud certification (AWS/Azure)",
      "Study system design patterns",
      "Practice advanced algorithms",
    ],
    readinessScore: 60,
  };
}

/**
 * Fallback recommendations when AI fails
 */
function getFallbackRecommendations() {
  return {
    bestRoles: ["Software Developer", "Junior Developer", "Technical Support"],
    confidenceLevel: "Medium",
    reason: "Based on current skills and experience level",
    learningPath: [
      "Advanced programming concepts",
      "System architecture",
      "Professional development",
    ],
    weakAreas: [
      "Advanced technical skills",
      "Leadership experience",
      "Industry certifications",
    ],
  };
}

module.exports = {
  analyzeJobDescription,
  recommendJobs,
};
