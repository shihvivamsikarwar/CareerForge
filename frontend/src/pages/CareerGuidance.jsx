import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { careerApi } from "../services/api";

// ─── SVG icon helper ──────────────────────────────────────────────────────────
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

const I = {
  map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  target:
    "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  bulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  mic: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  arrow: "M13 7l5 5m0 0l-5 5m5-5H6",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  briefcase:
    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
};

// ─── Level & Priority Configs ────────────────────────────────────────────────
const LEVEL_CFG = {
  Expert: {
    glyph: "🏆",
    ring: "ring-violet-300",
    bg: "bg-violet-50",
    text: "text-violet-700",
    grad: "from-violet-600 to-purple-600",
  },
  Advanced: {
    glyph: "🚀",
    ring: "ring-brand-300",
    bg: "bg-brand-50",
    text: "text-brand-700",
    grad: "from-brand-600 to-violet-600",
  },
  Intermediate: {
    glyph: "📈",
    ring: "ring-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
    grad: "from-amber-500 to-orange-500",
  },
  Beginner: {
    glyph: "🌱",
    ring: "ring-slate-300",
    bg: "bg-slate-100",
    text: "text-slate-600",
    grad: "from-slate-500 to-slate-600",
  },
};

const PRIORITY = {
  High: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  Medium: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  Low: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
};

const STEP_TYPE = {
  Learn: {
    icon: I.book,
    bg: "bg-brand-100",
    text: "text-brand-700",
    label: "Learn",
  },
  Build: {
    icon: I.code,
    bg: "bg-violet-100",
    text: "text-violet-700",
    label: "Build",
  },
  Practice: {
    icon: I.mic,
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Practice",
  },
  Apply: {
    icon: I.briefcase,
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Apply",
  },
};

// Helpers
const lvlCfg = (l) => LEVEL_CFG[l] || LEVEL_CFG.Beginner;
const priCfg = (p) => PRIORITY[p] || PRIORITY.Medium;
const stepCfg = (t) => STEP_TYPE[t] || STEP_TYPE.Learn;
const readinessColor = (r) =>
  r >= 75 ? "#10b981" : r >= 55 ? "#4f46e5" : r >= 35 ? "#f59e0b" : "#ef4444";
const readinessGrad = (r) =>
  r >= 75
    ? "from-emerald-600 to-teal-600"
    : r >= 55
    ? "from-brand-600 to-violet-600"
    : r >= 35
    ? "from-amber-500 to-orange-500"
    : "from-slate-600 to-slate-700";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadinessRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={10}
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={readinessColor(score)}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-slate-900 leading-none">
          {score}
        </span>
        <span className="text-xs text-slate-400 font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function Section({ icon, iconBg, iconColor, title, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <Icon d={icon} className={`w-4 h-4 ${iconColor}`} />
          </div>
          <h3 className="font-display font-semibold text-slate-800">{title}</h3>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-slate-600 w-8 text-right flex-shrink-0">
        {value}%
      </span>
    </div>
  );
}

function DataNudge({ missingData, navigate }) {
  const items = {
    interviews: {
      icon: I.mic,
      label: "Mock Interviews",
      href: "/interviews",
      cta: "Start interview",
    },
    "job analyses": {
      icon: I.search,
      label: "Job Analyses",
      href: "/job-analyzer",
      cta: "Analyse a job",
    },
  };
  return (
    <div className="flex flex-wrap gap-3">
      {missingData.map((key) => {
        const item = items[key];
        if (!item) return null;
        return (
          <button
            key={key}
            onClick={() => navigate(item.href)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all shadow-sm"
          >
            <Icon d={item.icon} className="w-4 h-4" />
            <span>
              <span className="font-semibold">{item.cta}</span> — improves
              guidance
            </span>
            <Icon d={I.arrow} className="w-3.5 h-3.5 opacity-50" />
          </button>
        );
      })}
    </div>
  );
}

function Skeleton({ h = "h-32", className = "" }) {
  return (
    <div
      className={`bg-slate-100 rounded-2xl animate-pulse ${h} ${className}`}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CareerGuidance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    careerApi
      .getGuidance()
      .then((res) => setData(res))
      .catch((err) =>
        setError(err.message || "Failed to load career guidance.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading)
    return (
      <DashboardLayout
        pageTitle="Career Guidance"
        pageSubtitle="Building your personalised plan…"
      >
        <div className="max-w-5xl mx-auto space-y-5">
          <Skeleton h="h-52" />
          <div className="grid md:grid-cols-2 gap-5">
            <Skeleton h="h-64" />
            <Skeleton h="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout pageTitle="Career Guidance">
        <div className="max-w-md mx-auto text-center py-24">
          <Icon d={I.warn} className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );

  if (!data || !data.hasData || !data.data) {
    return (
      <DashboardLayout pageTitle="Career Guidance">
        <div className="max-w-lg mx-auto text-center py-24">
          <Icon d={I.map} className="w-16 h-16 text-brand-400 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-slate-800">
            Upload Your Resume First
          </h2>
          <p className="text-slate-500 mb-8">
            We need your resume to build a roadmap.
          </p>
          <button
            onClick={() => navigate("/resume")}
            className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg"
          >
            Upload Resume
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const guidance = data.data;
  const {
    currentLevel = "Beginner",
    jobReadiness = 0,
    confidenceLevel = "Low",
    timeToReady = "...",
    summary = "...",
    careerPaths = [],
    recommendedRoles = [],
    skillGaps = [],
    learningRoadmap = [],
  } = guidance;
  const DQ = data.dataQuality || {};
  const missingData = data.missingData || [];
  const lc = lvlCfg(currentLevel);

  return (
    <DashboardLayout
      pageTitle="Career Guidance"
      pageSubtitle={`${currentLevel} · ${jobReadiness}% Job Ready`}
    >
      <div className="max-w-5xl mx-auto space-y-5">
        {/* DATA NUDGE */}
        {missingData.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
              <Icon d={I.bulb} className="w-3.5 h-3.5" /> Complete your profile
              for better accuracy:
            </p>
            <DataNudge missingData={missingData} navigate={navigate} />
          </div>
        )}

        {/* HERO SECTION */}
        <div
          className={`bg-gradient-to-r ${readinessGrad(
            jobReadiness
          )} rounded-2xl p-6 text-white`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="bg-white/15 rounded-2xl p-4 flex-shrink-0">
              <ReadinessRing score={jobReadiness} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                  {lc.glyph} {currentLevel}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                  Confidence: {confidenceLevel}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">
                {jobReadiness >= 75
                  ? "Ready to apply!"
                  : "Your Roadmap is Ready"}
              </h2>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                {summary}
              </p>
              <div className="bg-white/15 px-4 py-2 rounded-xl w-fit flex items-center gap-2">
                <Icon d={I.clock} className="w-4 h-4" />
                <span className="text-sm font-semibold">{timeToReady}</span>
              </div>
            </div>
          </div>

          {/* Data quality strip */}
          <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap gap-4 text-xs text-white/70">
            <span className={DQ.hasResume ? "text-white/90" : "opacity-40"}>
              {DQ.hasResume ? "✅" : "❌"} Resume
            </span>
            <span className={DQ.hasInterviews ? "text-white/90" : "opacity-40"}>
              {DQ.hasInterviews
                ? `✅ ${DQ.interviewCount} interview(s)`
                : "❌ No interviews"}
            </span>
            <span
              className={DQ.hasJobAnalyses ? "text-white/90" : "opacity-40"}
            >
              {DQ.hasJobAnalyses
                ? `✅ ${DQ.jobAnalysisCount} job analysis`
                : "❌ No job analyses"}
            </span>
            <button
              onClick={load}
              className="ml-auto flex items-center gap-1 text-white/60 hover:text-white transition-colors"
            >
              <Icon d={I.refresh} className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* 2-COLUMN GRID */}
        <div className="grid md:grid-cols-2 gap-5">
          <Section
            icon={I.map}
            iconBg="bg-brand-50"
            iconColor="text-brand-600"
            title="Career Paths"
          >
            <div className="space-y-3">
              {careerPaths.map((path, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-all ${
                    path.fit >= 75
                      ? "border-brand-200 bg-brand-50/40"
                      : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{path.icon}</span>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {path.title}
                    </p>
                  </div>
                  <ProgressBar
                    value={path.fit}
                    color={readinessColor(path.fit)}
                  />
                  {path.description && (
                    <p className="text-xs text-slate-500 mt-2">
                      {path.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section
            icon={I.briefcase}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            title="Recommended Roles"
          >
            <div className="space-y-3">
              {recommendedRoles.map((role, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-100 p-4 hover:bg-violet-50/30"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {role.title}
                      </p>
                      <span className="mt-1 inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                        {role.level}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-lg font-bold"
                        style={{ color: readinessColor(role.matchPercent) }}
                      >
                        {role.matchPercent}%
                      </p>
                      <p className="text-xs text-slate-400">match</p>
                    </div>
                  </div>
                  {role.reason && (
                    <p className="text-xs text-slate-500">{role.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* SKILL GAPS */}
        <Section
          icon={I.warn}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          title="Skill Gaps"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillGaps.map((gap, i) => {
              const pc = priCfg(gap.priority);
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 flex flex-col gap-2.5 ${pc.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      {gap.skill}
                    </p>
                    <span className={`text-xs font-bold ${pc.text}`}>
                      {gap.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon d={I.clock} className="w-3.5 h-3.5" /> Est.{" "}
                    {gap.learningTime}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ROADMAP */}
        <Section
          icon={I.target}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          title="Learning Roadmap"
        >
          <div className="relative">
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-slate-100 hidden sm:block" />
            <div className="space-y-4">
              {learningRoadmap.map((step, i) => {
                const sc = stepCfg(step.type);
                const isLast = i === learningRoadmap.length - 1;
                return (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div
                      className={`w-10 h-10 ${sc.bg} rounded-xl flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm`}
                    >
                      <Icon d={sc.icon} className={`w-4 h-4 ${sc.text}`} />
                    </div>
                    <div
                      className={`flex-1 rounded-2xl border p-4 ${
                        isLast
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            Step {step.step}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
                          >
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Icon d={I.clock} className="w-3 h-3" />{" "}
                          {step.duration}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-50">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-white text-lg">Ready to start?</p>
            <p className="text-slate-400 text-sm">
              Follow your {learningRoadmap.length}-step roadmap to success.
            </p>
          </div>
          <button
            onClick={() => {
              const type = learningRoadmap[0]?.type;
              navigate(
                type === "Practice"
                  ? "/interviews"
                  : type === "Apply"
                  ? "/job-analyzer"
                  : "/resume"
              );
            }}
            className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 shadow-lg"
          >
            🚀 Start Step 1
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
