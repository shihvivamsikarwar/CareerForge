import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { jobApi } from "../services/api";
import { useNavigate } from "react-router-dom";

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
  briefcase:
    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  target: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  skills:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  arrowRight: "M9 5l7 7-7 7",
};

// Match Score Ring Component
const MatchScoreRing = ({ score, size = "small" }) => {
  const radius = size === "small" ? 30 : 50;
  const strokeWidth = size === "small" ? 6 : 10;
  const pct = score / 100;
  const circ = 2 * Math.PI * radius;
  const offset = circ - pct * circ;

  const color =
    pct >= 0.8
      ? "#10b981"
      : pct >= 0.6
      ? "#4f46e5"
      : pct >= 0.4
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative">
      <svg
        className={`${size === "small" ? "w-16 h-16" : "w-20 h-20"}`}
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
        <span
          className={`font-display font-bold text-slate-900 ${
            size === "small" ? "text-lg" : "text-2xl"
          }`}
        >
          {score}%
        </span>
      </div>
    </div>
  );
};

export default function JobAnalysisHistory() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await jobAnalyzerApi.getHistory();
      setAnalyses(response.analyses || []);
    } catch (err) {
      setError(err.message || "Failed to fetch job analysis history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMatchStatusColor = (score) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-brand-600 bg-brand-50";
    if (score >= 40) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getMatchStatusText = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Low Match";
  };

  // Calculate skill gaps across all analyses
  const getCommonSkillGaps = () => {
    const skillCounts = {};
    analyses.forEach((analysis) => {
      analysis.missingSkills?.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  };

  const commonSkillGaps = getCommonSkillGaps();

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Job Analysis History"
        pageSubtitle="Your career insights and skill gaps"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        pageTitle="Job Analysis History"
        pageSubtitle="Your career insights and skill gaps"
      >
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Job Analysis History"
      pageSubtitle="Your career insights and skill gaps"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        {analyses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                  <Icon
                    d={ICONS.briefcase}
                    className="w-5 h-5 text-brand-600"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Analyses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analyses.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon d={ICONS.target} className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Avg Match Score</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(
                      analyses.reduce((sum, a) => sum + a.matchScore, 0) /
                        analyses.length
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon d={ICONS.skills} className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Skill Gaps</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {commonSkillGaps.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Icon
                    d={ICONS.calendar}
                    className="w-5 h-5 text-violet-600"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Analysis</p>
                  <p className="text-sm font-bold text-slate-900">
                    {analyses.length > 0
                      ? formatDate(analyses[0].createdAt)
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common Skill Gaps */}
        {commonSkillGaps.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Icon d={ICONS.skills} className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-display font-semibold text-slate-800">
                Common Skill Gaps
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {commonSkillGaps.map(({ skill, count }) => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {skill}
                  </span>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-semibold">
                    {count} {count === 1 ? "job" : "jobs"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-slate-800">
                Analysis History
              </h3>
              <button
                onClick={() => navigate("/job-analyzer")}
                className="btn-primary text-sm px-4 py-2"
              >
                New Analysis
              </button>
            </div>
          </div>

          {analyses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon d={ICONS.briefcase} className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">
                No job analyses yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                Start analyzing job descriptions to see your match scores and
                identify skill gaps.
              </p>
              <button
                onClick={() => navigate("/job-analyzer")}
                className="btn-primary"
              >
                Analyze Your First Job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MatchScoreRing
                          score={analysis.matchScore}
                          size="small"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {analysis.jobTitle || "Job Analysis"}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {formatDate(analysis.createdAt)}
                            {analysis.resumeId?.originalFileName &&
                              ` · ${analysis.resumeId.originalFileName}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchStatusColor(
                            analysis.matchScore
                          )}`}
                        >
                          {getMatchStatusText(analysis.matchScore)}
                        </span>
                        {analysis.missingSkills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {analysis.missingSkills?.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">
                            +{analysis.missingSkills.length - 3} more
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2">
                        {analysis.jobDescription}
                      </p>
                    </div>

                    <Icon
                      d={ICONS.arrowRight}
                      className="w-5 h-5 text-slate-400 flex-shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analysis Detail Modal */}
        {selectedAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-slate-800 text-lg">
                    Analysis Details
                  </h3>
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Icon d="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <MatchScoreRing score={selectedAnalysis.matchScore} />
                  <p className="text-lg font-semibold text-slate-800 mt-2">
                    {getMatchStatusText(selectedAnalysis.matchScore)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brand-600">
                      {selectedAnalysis.breakdown?.technicalSkills || 0}%
                    </p>
                    <p className="text-sm text-slate-500">Technical Skills</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-violet-600">
                      {selectedAnalysis.breakdown?.experience || 0}%
                    </p>
                    <p className="text-sm text-slate-500">Experience</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedAnalysis.breakdown?.keywords || 0}%
                    </p>
                    <p className="text-sm text-slate-500">Keywords</p>
                  </div>
                </div>

                {selectedAnalysis.missingSkills?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Missing Skills
                    </h4>
                    <div className="space-y-2">
                      {selectedAnalysis.missingSkills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-2 p-2 bg-red-50 rounded-lg"
                        >
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-sm text-slate-700">
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAnalysis.matchedSkills?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Matched Skills
                    </h4>
                    <div className="space-y-2">
                      {selectedAnalysis.matchedSkills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg"
                        >
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span className="text-sm text-slate-700">
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAnalysis.actionPlan?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Action Plan
                    </h4>
                    <div className="space-y-2">
                      {selectedAnalysis.actionPlan.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-3 p-3 bg-brand-50 rounded-lg"
                        >
                          <span className="w-6 h-6 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
