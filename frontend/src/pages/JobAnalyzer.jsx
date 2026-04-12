import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { jobApi } from "../services/api";

// ── Icons ─────────────────────────────────────────────────────────────────────
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
  upload:
    "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  check: "M5 13l4 4L19 7",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  lightbulb:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  target: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

// ── Progress Bar Component ─────────────────────────────────────────────────────
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

// ── Match Score Ring ───────────────────────────────────────────────────────────
const MatchScoreRing = ({ score }) => {
  const pct = score / 100;
  const r = 50;
  const circ = 2 * Math.PI * r;
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
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.2s ease-in-out" }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-slate-900">
            {score}%
          </span>
          <p className="text-xs text-slate-500">Match</p>
        </div>
      </div>
    </div>
  );
};

export default function JobAnalyzer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("match");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await jobAnalyzerApi.analyze(jobDescription);
      console.log("Analysis result from API:", result);
      // Extract the actual analysis from the response
      setAnalysis(result.analysis || result);
    } catch (err) {
      setError(err.message || "Failed to analyze job description");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      pageTitle="Job Analyzer"
      pageSubtitle="Compare your resume against job descriptions"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Input Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <Icon d={ICONS.search} className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="font-display font-semibold text-slate-800">
              Job Description
            </h3>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-40 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm text-slate-700 placeholder-slate-400"
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
              <Icon d={ICONS.warning} className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Icon d={ICONS.target} className="w-4 h-4" />
                Analyze Match
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/job-analyzer/history")}
            className="mt-3 inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl 
                   border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50 active:scale-95 transition-all duration-200"
          >
            <Icon d={ICONS.history} className="w-5 h-5" />
            <span>View Analysis History</span>
            <Icon d="M9 5l7 7-7 7" className="w-4 h-4 ml-auto" />
          </button>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon d={ICONS.check} className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-display font-semibold text-slate-800">
                  Analysis Results
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                Analyzed ✓
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {[
                { key: "match", label: "Match Score" },
                { key: "skills", label: "Missing Skills" },
                { key: "plan", label: "Action Plan" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200
                    ${
                      activeTab === tab.key
                        ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50/50"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "match" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <MatchScoreRing score={analysis.matchScore} />
                    <p className="text-sm text-slate-500 mt-2">
                      {analysis.matchScore >= 80
                        ? "Excellent match!"
                        : analysis.matchScore >= 60
                        ? "Good match — a few gaps to address"
                        : analysis.matchScore >= 40
                        ? "Moderate match — significant gaps"
                        : "Low match — consider different role"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <ProgressBar
                      label="Technical Skills"
                      value={analysis.breakdown?.technicalSkills || 0}
                      color="bg-brand-500"
                    />
                    <ProgressBar
                      label="Experience Level"
                      value={analysis.breakdown?.experience || 0}
                      color="bg-violet-500"
                    />
                    <ProgressBar
                      label="Keyword Coverage"
                      value={analysis.breakdown?.keywords || 0}
                      color="bg-emerald-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Skills present in job description but missing from your
                    resume:
                  </p>

                  {analysis.missingSkills?.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.missingSkills.map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl"
                        >
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {skill}
                          </span>
                          <span className="ml-auto text-xs text-red-500 font-semibold">
                            Missing
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                      <Icon
                        d={ICONS.check}
                        className="w-5 h-5 text-emerald-500"
                      />
                      <span className="text-sm text-emerald-700">
                        All required skills are present in your resume!
                      </span>
                    </div>
                  )}

                  {analysis.matchedSkills?.length > 0 && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="text-sm text-emerald-700">
                        <strong>Matched skills:</strong>{" "}
                        {analysis.matchedSkills.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "plan" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    AI-generated action plan to close your skill gaps:
                  </p>

                  {analysis.actionPlan?.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.actionPlan.map((item, i) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3.5 bg-brand-50 border border-brand-100 rounded-xl"
                        >
                          <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-sm text-slate-500">
                        No action plan needed - you're a great match!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon d={ICONS.search} className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">
              Ready to analyze your match?
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Paste a job description above to get instant feedback on how well
              your resume matches the requirements.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
