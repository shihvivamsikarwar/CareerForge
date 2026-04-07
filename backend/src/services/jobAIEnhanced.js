const { analyzeJobDescription: callAI } = require("./aiService");

/**
 * Get real-time job market data and trends
 */
async function getJobMarketData() {
  // Simulate real job market API call
  // In production, integrate with:
  // - LinkedIn Jobs API
  // - Indeed API
  // - Glassdoor API
  // - Bureau of Labor Statistics
  
  return {
    trendingSkills: [
      "React", "TypeScript", "Python", "AWS", "Docker", 
      "Kubernetes", "GraphQL", "Machine Learning", "DevOps"
    ],
    highDemandRoles: [
      "Full Stack Developer",
      "DevOps Engineer", 
      "Data Scientist",
      "Cloud Architect",
      "Frontend Developer"
    ],
    salaryRanges: {
      "Frontend Developer": { min: 70000, max: 130000, median: 95000 },
      "Full Stack Developer": { min: 80000, max: 150000, median: 110000 },
      "DevOps Engineer": { min: 90000, max: 160000, median: 125000 },
      "Data Scientist": { min: 85000, max: 170000, median: 120000 },
      "Cloud Architect": { min: 110000, max: 200000, median: 155000 }
    },
    growthRates: {
      "Frontend Developer": 15,
      "Full Stack Developer": 25,
      "DevOps Engineer": 35,
      "Data Scientist": 40,
      "Cloud Architect": 45
    },
    remoteFriendly: {
      "Frontend Developer": 85,
      "Full Stack Developer": 75,
      "DevOps Engineer": 70,
      "Data Scientist": 80,
      "Cloud Architect": 65
    }
  };
}

/**
 * Enhanced job analysis with market insights
 */
async function analyzeJobWithMarket(jobDescription, userData) {
  try {
    const marketData = await getJobMarketData();
    
    // Create a simpler, more reliable prompt
    const prompt = `Analyze this job for the candidate:

JOB: ${jobDescription.substring(0, 1000)}...

CANDIDATE SKILLS: ${userData.skills.join(', ')}
EXPERIENCE: ${userData.experience}
INTERVIEW SCORE: ${userData.performance.averageScore}/100

MARKET DATA: High demand for React, TypeScript, AWS, Docker. Growth rates 25-45%. Remote work 70-85%.

Return JSON:
{
  "matchScore": 85,
  "matchedSkills": ["React", "TypeScript"],
  "missingSkills": ["Docker", "AWS"],
  "marketDemand": "High",
  "salaryEstimate": {"min": 80000, "max": 130000, "median": 95000, "confidence": "Medium"},
  "growthPotential": 25,
  "remoteOpportunities": 75,
  "suggestions": ["Learn Docker", "Get AWS certification"],
  "readinessScore": 75,
  "timeToHire": "2-4 weeks",
  "competitionLevel": "Medium"
}`;

    const aiResponse = await callAI(prompt);
    console.log("Enhanced Job Analysis AI Response:", aiResponse);
    
    let analysis;
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
      console.log("Parsed Enhanced Analysis:", analysis);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Using fallback analysis");
      analysis = getEnhancedFallbackAnalysis(marketData);
    }

    return validateEnhancedAnalysis(analysis, marketData);
    
  } catch (error) {
    console.error("Enhanced job analysis error:", error);
    const marketData = await getJobMarketData();
    return getEnhancedFallbackAnalysis(marketData);
  }
}

/**
 * Enhanced job recommendations with real-world insights
 */
async function recommendJobsEnhanced(userData) {
  try {
    const marketData = await getJobMarketData();
    
    // Create a simpler, more reliable prompt
    const prompt = `Recommend jobs for this candidate:

CANDIDATE SKILLS: ${userData.skills.join(', ')}
EXPERIENCE: ${userData.experience}
INTERVIEW SCORE: ${userData.performance.averageScore}/100
STRENGTHS: ${userData.strengths.join(', ')}

MARKET: High demand for React, TypeScript, Python, AWS. Salaries $70k-$200k. Growth 25-45%. Remote 70-85%.

Return JSON:
{
  "bestRoles": [
    {
      "title": "Full Stack Developer",
      "matchScore": 85,
      "salaryRange": {"min": 80000, "max": 150000, "median": 110000},
      "growthRate": 25,
      "remoteOpportunities": 75,
      "marketDemand": "High",
      "competitionLevel": "Medium",
      "timeToHire": "3-6 weeks",
      "companiesHiring": ["Google", "Microsoft", "Amazon"],
      "locations": ["San Francisco", "New York", "Remote"]
    }
  ],
  "confidenceLevel": "High",
  "reason": "Strong technical skills with market demand",
  "learningPath": [
    {
      "skill": "Advanced React patterns",
      "priority": "High",
      "timeToLearn": "2-3 months",
      "resources": ["React course", "Official docs", "Projects"]
    }
  ],
  "weakAreas": [
    {
      "area": "Cloud platforms",
      "impact": "High",
      "improvementTime": "3-6 months",
      "action": "Get AWS certification"
    }
  ],
  "marketInsights": {
    "trendingSkills": ["React", "TypeScript", "Python"],
    "decliningSkills": ["jQuery", "AngularJS"],
    "emergingTechnologies": ["WebAssembly", "Edge Computing"],
    "industryTrends": "Remote work growth, AI integration"
  },
  "nextSteps": [
    "Update LinkedIn profile",
    "Build portfolio projects",
    "Apply to companies"
  ]
}`;

    const aiResponse = await callAI(prompt);
    console.log("Enhanced Recommendations AI Response:", aiResponse);
    
    let recommendations;
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
      console.log("Parsed Enhanced Recommendations:", recommendations);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Using fallback recommendations");
      recommendations = getEnhancedFallbackRecommendations(marketData);
    }

    return validateEnhancedRecommendations(recommendations, marketData);
    
  } catch (error) {
    console.error("Enhanced job recommendations error:", error);
    const marketData = await getJobMarketData();
    return getEnhancedFallbackRecommendations(marketData);
  }
}

/**
 * Validate enhanced analysis data
 */
function validateEnhancedAnalysis(analysis, marketData) {
  const defaultAnalysis = getEnhancedFallbackAnalysis(marketData);
  
  return {
    matchScore: Math.min(100, Math.max(0, parseInt(analysis.matchScore) || defaultAnalysis.matchScore)),
    matchedSkills: Array.isArray(analysis.matchedSkills) ? analysis.matchedSkills.slice(0, 10) : defaultAnalysis.matchedSkills,
    missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills.slice(0, 10) : defaultAnalysis.missingSkills,
    marketDemand: ["High", "Medium", "Low"].includes(analysis.marketDemand) ? analysis.marketDemand : defaultAnalysis.marketDemand,
    salaryEstimate: analysis.salaryEstimate || defaultAnalysis.salaryEstimate,
    growthPotential: Math.min(100, Math.max(0, parseInt(analysis.growthPotential) || defaultAnalysis.growthPotential)),
    remoteOpportunities: Math.min(100, Math.max(0, parseInt(analysis.remoteOpportunities) || defaultAnalysis.remoteOpportunities)),
    suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions.slice(0, 8) : defaultAnalysis.suggestions,
    readinessScore: Math.min(100, Math.max(0, parseInt(analysis.readinessScore) || defaultAnalysis.readinessScore)),
    timeToHire: typeof analysis.timeToHire === 'string' ? analysis.timeToHire : defaultAnalysis.timeToHire,
    competitionLevel: ["High", "Medium", "Low"].includes(analysis.competitionLevel) ? analysis.competitionLevel : defaultAnalysis.competitionLevel,
  };
}

/**
 * Validate enhanced recommendations data
 */
function validateEnhancedRecommendations(recommendations, marketData) {
  const defaultRecommendations = getEnhancedFallbackRecommendations(marketData);
  
  return {
    bestRoles: Array.isArray(recommendations.bestRoles) 
      ? recommendations.bestRoles.slice(0, 5).map(role => ({
          title: typeof role.title === 'string' ? role.title : "Software Developer",
          matchScore: Math.min(100, Math.max(0, parseInt(role.matchScore) || 70)),
          salaryRange: role.salaryRange || { min: 70000, max: 120000, median: 90000 },
          growthRate: Math.min(100, Math.max(0, parseInt(role.growthRate) || 20)),
          remoteOpportunities: Math.min(100, Math.max(0, parseInt(role.remoteOpportunities) || 70)),
          marketDemand: ["High", "Medium", "Low"].includes(role.marketDemand) ? role.marketDemand : "Medium",
          competitionLevel: ["High", "Medium", "Low"].includes(role.competitionLevel) ? role.competitionLevel : "Medium",
          timeToHire: typeof role.timeToHire === 'string' ? role.timeToHire : "4-6 weeks",
          companiesHiring: Array.isArray(role.companiesHiring) ? role.companiesHiring.slice(0, 5) : ["Google", "Microsoft", "Amazon"],
          locations: Array.isArray(role.locations) ? role.locations.slice(0, 5) : ["San Francisco", "New York", "Remote"]
        }))
      : defaultRecommendations.bestRoles,
    confidenceLevel: ["High", "Medium", "Low"].includes(recommendations.confidenceLevel) ? recommendations.confidenceLevel : defaultRecommendations.confidenceLevel,
    reason: typeof recommendations.reason === 'string' ? recommendations.reason.substring(0, 200) : defaultRecommendations.reason,
    learningPath: Array.isArray(recommendations.learningPath) ? recommendations.learningPath.slice(0, 6) : defaultRecommendations.learningPath,
    weakAreas: Array.isArray(recommendations.weakAreas) ? recommendations.weakAreas.slice(0, 6) : defaultRecommendations.weakAreas,
    marketInsights: recommendations.marketInsights || defaultRecommendations.marketInsights,
    nextSteps: Array.isArray(recommendations.nextSteps) ? recommendations.nextSteps.slice(0, 6) : defaultRecommendations.nextSteps,
  };
}

/**
 * Enhanced fallback analysis with market data
 */
function getEnhancedFallbackAnalysis(marketData) {
  return {
    matchScore: 65,
    matchedSkills: ["Programming", "Problem Solving", "Communication"],
    missingSkills: ["Cloud platforms", "System design", "Advanced algorithms"],
    marketDemand: "Medium",
    salaryEstimate: {
      min: 70000,
      max: 120000,
      median: 90000,
      confidence: "Medium"
    },
    growthPotential: 20,
    remoteOpportunities: 70,
    suggestions: [
      "Gain cloud certification (AWS/Azure)",
      "Study system design patterns",
      "Practice advanced algorithms"
    ],
    readinessScore: 60,
    timeToHire: "4-6 weeks",
    competitionLevel: "Medium"
  };
}

/**
 * Enhanced fallback recommendations with market data
 */
function getEnhancedFallbackRecommendations(marketData) {
  return {
    bestRoles: [
      {
        title: "Software Developer",
        matchScore: 70,
        salaryRange: { min: 70000, max: 120000, median: 90000 },
        growthRate: 20,
        remoteOpportunities: 70,
        marketDemand: "Medium",
        competitionLevel: "Medium",
        timeToHire: "4-6 weeks",
        companiesHiring: ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
        locations: ["San Francisco", "New York", "Seattle", "Austin", "Remote"]
      },
      {
        title: "Frontend Developer",
        matchScore: 75,
        salaryRange: { min: 75000, max: 130000, median: 95000 },
        growthRate: 25,
        remoteOpportunities: 85,
        marketDemand: "High",
        competitionLevel: "Medium",
        timeToHire: "3-5 weeks",
        companiesHiring: ["Google", "Meta", "Netflix", "Spotify", "Airbnb"],
        locations: ["San Francisco", "New York", "Los Angeles", "Remote"]
      }
    ],
    confidenceLevel: "Medium",
    reason: "Based on current skills and market demand analysis",
    learningPath: [
      {
        skill: "Advanced programming concepts",
        priority: "High",
        timeToLearn: "3-4 months",
        resources: ["Online courses", "Documentation", "Practice projects"]
      }
    ],
    weakAreas: [
      {
        area: "Advanced technical skills",
        impact: "Medium",
        improvementTime: "4-6 months",
        action: "Focus on specialized technologies"
      }
    ],
    marketInsights: {
      trendingSkills: marketData.trendingSkills.slice(0, 5),
      decliningSkills: ["jQuery", "AngularJS", "Flash"],
      emergingTechnologies: ["WebAssembly", "Edge Computing", "AI/ML"],
      industryTrends: "Remote work growth, AI integration, cloud-native development"
    },
    nextSteps: [
      "Update resume with current skills",
      "Build portfolio projects",
      "Network with industry professionals",
      "Apply to target companies"
    ]
  };
}

module.exports = {
  analyzeJobWithMarket,
  recommendJobsEnhanced,
  getJobMarketData
};
