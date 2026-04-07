/**
 * Job Analyzer AI Service
 * Analyzes job descriptions against user resumes to provide match scores and recommendations
 */

const { analyzeJobDescription } = require("./aiService");

/**
 * Analyze job description against resume
 * @param {string} jobDescription - The job description text
 * @param {Object} resume - The resume document from database
 * @returns {Object} Analysis results with match score, skills, and recommendations
 */
async function analyzeJobMatch(jobDescription, resume) {
  try {
    // Create the prompt for AI analysis
    const prompt = `
As an expert career counselor and technical recruiter, analyze the following job description against the candidate's resume and provide a detailed match analysis.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resume.extractedText || "Resume content not available"}

Please provide a comprehensive analysis in the following JSON format:
{
  "matchScore": 85,
  "breakdown": {
    "technicalSkills": 90,
    "experience": 80,
    "keywords": 85
  },
  "missingSkills": [
    "Docker & Kubernetes",
    "System Design",
    "GraphQL"
  ],
  "matchedSkills": [
    "React",
    "TypeScript",
    "REST APIs",
    "Node.js"
  ],
  "actionPlan": [
    "Complete a Docker fundamentals course (2 weeks)",
    "Practice 3 system design problems per week",
    "Add GraphQL to your side project for hands-on XP"
  ]
}

Analysis criteria:
1. Match Score (0-100): Overall compatibility percentage
2. Technical Skills: How well technical requirements match
3. Experience: Years and relevance of experience
4. Keywords: Important keywords from JD found in resume
5. Missing Skills: Required skills not found in resume
6. Matched Skills: Skills that align well
7. Action Plan: Specific, actionable steps to improve candidacy

Respond ONLY with valid JSON. No explanations or additional text.
`;

    // Call AI service
    const aiResponse = await analyzeJobDescription(prompt);
    console.log("AI Response:", aiResponse);
    
    // Parse and validate the response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
      console.log("Parsed AI analysis:", analysis);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Using fallback analysis due to parse error");
      // Return fallback analysis
      analysis = getFallbackAnalysis();
    }

    // Validate and sanitize the analysis
    const validatedAnalysis = validateAnalysis(analysis);
    console.log("Final validated analysis:", validatedAnalysis);
    return validatedAnalysis;
    
  } catch (error) {
    console.error("Job analysis error:", error);
    return getFallbackAnalysis();
  }
}

/**
 * Validate and sanitize analysis data
 */
function validateAnalysis(analysis) {
  const defaultAnalysis = getFallbackAnalysis();
  
  return {
    matchScore: Math.min(100, Math.max(0, parseInt(analysis.matchScore) || defaultAnalysis.matchScore)),
    breakdown: {
      technicalSkills: Math.min(100, Math.max(0, parseInt(analysis.breakdown?.technicalSkills) || defaultAnalysis.breakdown.technicalSkills)),
      experience: Math.min(100, Math.max(0, parseInt(analysis.breakdown?.experience) || defaultAnalysis.breakdown.experience)),
      keywords: Math.min(100, Math.max(0, parseInt(analysis.breakdown?.keywords) || defaultAnalysis.breakdown.keywords)),
    },
    missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : defaultAnalysis.missingSkills,
    matchedSkills: Array.isArray(analysis.matchedSkills) ? analysis.matchedSkills : defaultAnalysis.matchedSkills,
    actionPlan: Array.isArray(analysis.actionPlan) ? analysis.actionPlan : defaultAnalysis.actionPlan,
  };
}

/**
 * Fallback analysis when AI fails
 */
function getFallbackAnalysis() {
  return {
    matchScore: 65,
    breakdown: {
      technicalSkills: 70,
      experience: 60,
      keywords: 65,
    },
    missingSkills: [
      "Cloud platforms (AWS/Azure/GCP)",
      "DevOps practices",
      "System design principles"
    ],
    matchedSkills: [
      "Programming languages",
      "Web development",
      "Problem solving"
    ],
    actionPlan: [
      "Gain cloud certification (AWS/Azure)",
      "Learn Docker and Kubernetes basics",
      "Study system design patterns and best practices"
    ],
  };
}

module.exports = { analyzeJobMatch };
