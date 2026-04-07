import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { jobApi } from "../services/api";

// Icons
const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  target: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  skills: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  trend: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  check: "M5 13l4 4L19 7",
  lightbulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

// Progress Bar Component
const ProgressBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}%</span>
    </div>
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// Score Ring Component
const ScoreRing = ({ score, label, color, size = "medium" }) => {
  const radius = size === "small" ? 30 : size === "medium" ? 40 : 50;
  const strokeWidth = size === "small" ? 4 : size === "medium" ? 6 : 8;
  const pct = score / 100;
  const circ = 2 * Math.PI * radius;
  const offset = circ - pct * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          className={size === "small" ? "w-16 h-16" : size === "medium" ? "w-24 h-24" : "w-32 h-32"}
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display font-bold text-slate-900 ${size === "small" ? "text-lg" : size === "medium" ? "text-2xl" : "text-3xl"}`}>
            {score}%
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 mt-2">{label}</span>
    </div>
  );
};

export default function JobRecommendation() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState("");
  const [hasCheating, setHasCheating] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const response = await jobApi.getRecommendations();
      setRecommendations(response.recommendations);
      setHasCheating(response.hasCheating || false);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    if (jobDescription.length > 3000) {
      setError("Job description is too long (max 3000 characters)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await jobApi.analyze(jobDescription);
      setAnalysis(result.analysis);
      setHasCheating(result.hasCheating || false);
    } catch (err) {
      setError(err.message || "Failed to analyze job description");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-brand-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-brand-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getConfidenceColor = (level) => {
    switch (level) {
      case "High": return "bg-emerald-100 text-emerald-800";
      case "Medium": return "bg-amber-100 text-amber-800";
      case "Low": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <DashboardLayout
      pageTitle="Job Recommendations"
      pageSubtitle="AI-powered career guidance based on your profile"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Job Input Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <Icon d={ICONS.search} className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="font-display font-semibold text-slate-800">
              Analyze Job Description
            </h3>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to analyze your match..."
            className="w-full h-32 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm text-slate-700 placeholder-slate-400"
            maxLength={3000}
          />

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500">
              {jobDescription.length}/3000 characters
            </span>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
              <Icon d={ICONS.warning} className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="mt-4 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Icon d={ICONS.target} className="w-4 h-4" />
                Analyze Job Match
              </>
            )}
          </button>
        </div>

        {/* Cheating Warning */}
        {hasCheating && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Icon d={ICONS.warning} className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800">Performance Note</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Some interview sessions had integrity concerns. Focus on genuine practice for accurate assessments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon d={ICONS.check} className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-display font-semibold text-slate-800">
                  Analysis Results
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScoreRing
                  score={analysis.matchScore}
                  label="Match Score"
                  color={analysis.matchScore >= 80 ? "#10b981" : analysis.matchScore >= 60 ? "#4f46e5" : analysis.matchScore >= 40 ? "#f59e0b" : "#ef4444"}
                />
                <ScoreRing
                  score={analysis.readinessScore}
                  label="Readiness Score"
                  color={analysis.readinessScore >= 80 ? "#10b981" : analysis.readinessScore >= 60 ? "#4f46e5" : analysis.readinessScore >= 40 ? "#f59e0b" : "#ef4444"}
                />
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Icon d={ICONS.check} className="w-4 h-4 text-emerald-600" />
                    Matched Skills
                  </h4>
                  <div className="space-y-2">
                    {analysis.matchedSkills?.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-sm text-slate-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Icon d={ICONS.warning} className="w-4 h-4 text-amber-600" />
                    Missing Skills
                  </h4>
                  <div className="space-y-2">
                    {analysis.missingSkills?.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span className="text-sm text-slate-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Icon d={ICONS.lightbulb} className="w-4 h-4 text-brand-600" />
                    Improvement Suggestions
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-brand-50 rounded-lg">
                        <span className="w-6 h-6 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm text-slate-700">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Recommendations */}
        {recommendations && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                    <Icon d={ICONS.briefcase} className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-800">
                    Career Recommendations
                  </h3>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getConfidenceColor(recommendations.confidenceLevel)}`}>
                  {recommendations.confidenceLevel} Confidence
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Reason */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Why These Roles?</h4>
                <p className="text-sm text-slate-600">{recommendations.reason}</p>
              </div>

              {/* Best Roles */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon d={ICONS.trend} className="w-4 h-4 text-violet-600" />
                  Recommended Roles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recommendations.bestRoles?.map((role) => (
                    <div key={role} className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Icon d={ICONS.briefcase} className="w-4 h-4 text-violet-600" />
                        <span className="font-medium text-slate-800">{role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Path */}
              {recommendations.learningPath?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Icon d={ICONS.chart} className="w-4 h-4 text-emerald-600" />
                    Learning Path
                  </h4>
                  <div className="space-y-2">
                    {recommendations.learningPath.map((step, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-emerald-50 rounded-lg">
                        <span className="w-6 h-6 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm text-slate-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Areas */}
              {recommendations.weakAreas?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Icon d={ICONS.warning} className="w-4 h-4 text-amber-600" />
                    Areas to Improve
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.weakAreas.map((area) => (
                      <span key={area} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingRecs && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your career recommendations...</p>
          </div>
        )}

        {/* Empty State */}
        {!recommendations && !loadingRecs && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon d={ICONS.briefcase} className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">
              No Recommendations Available
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Upload your resume and complete some interviews to get personalized job recommendations.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
