import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { careerApi } from "../services/api";

// ─── Icon helper ──────────────────────────────────────────────────────────────
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
  briefcase:
    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  bookmark: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  filter:
    "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  check: "M5 13l4 4L19 7",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  x: "M6 18L18 6M6 6l12 12",
  arrow: "M13 7l5 5m0 0l-5 5m5-5H6",
  mic: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  trend: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
};

// ─── Colour helpers ───────────────────────────────────────────────────────────
const matchColor = (s) =>
  s >= 75 ? "#10b981" : s >= 55 ? "#4f46e5" : s >= 35 ? "#f59e0b" : "#ef4444";
const matchBg = (s) =>
  s >= 75
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : s >= 55
    ? "bg-brand-50 border-brand-200 text-brand-700"
    : s >= 35
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-red-50 border-red-200 text-red-700";

const diffColor = {
  Easy: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  Hard: "text-red-700 bg-red-50 border-red-200",
};
const lvlColor = {
  Intern: "bg-slate-100 text-slate-600",
  Junior: "bg-emerald-100 text-emerald-700",
  Mid: "bg-brand-100 text-brand-700",
  Senior: "bg-violet-100 text-violet-700",
  Lead: "bg-amber-100 text-amber-700",
};

const CATEGORY_ICONS = {
  Frontend: "🎨",
  Backend: "🛠️",
  "Full Stack": "⚡",
  DevOps: "☁️",
  Mobile: "📱",
  "Data Engineering": "📊",
  QA: "🧪",
  Cloud: "☁️",
};
const catIcon = (c) => CATEGORY_ICONS[c] || "💻";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ emoji, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-slate-100">
        {emoji}
      </div>
      <div>
        <p className="text-xl font-display font-bold text-slate-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────
function RoleCard({ role, onToggleSave, saving }) {
  const [expanded, setExpanded] = useState(false);
  const c = matchColor(role.matchScore);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md
      ${
        role.saved ? "border-brand-200 shadow-brand-100/50" : "border-slate-100"
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Category + level */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-sm">{catIcon(role.category)}</span>
              <span className="text-xs font-semibold text-slate-500">
                {role.category}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  lvlColor[role.level] || lvlColor.Mid
                }`}
              >
                {role.level}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  diffColor[role.difficulty] || diffColor.Medium
                }`}
              >
                {role.difficulty}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-display font-bold text-slate-800 leading-snug">
              {role.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{role.company}</p>
          </div>

          {/* Match score + save */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div
              className={`text-center px-3 py-1.5 rounded-xl border ${matchBg(
                role.matchScore
              )}`}
            >
              <p className="text-lg font-display font-bold leading-none">
                {role.matchScore}%
              </p>
              <p className="text-xs font-medium leading-none mt-0.5">match</p>
            </div>
            <button
              onClick={() => onToggleSave(role._id)}
              disabled={saving}
              title={role.saved ? "Remove from saved" : "Save role"}
              className={`p-1.5 rounded-lg transition-all ${
                role.saved
                  ? "text-brand-600 bg-brand-50 hover:bg-brand-100"
                  : "text-slate-400 hover:text-brand-600 hover:bg-brand-50"
              }`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin" />
              ) : (
                <Icon d={I.bookmark} className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Salary + time-to-ready */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {role.salaryRange && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              💰 {role.salaryRange}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Icon d={I.clock} className="w-3 h-3" />
            {role.timeToReady}
          </span>
        </div>

        {/* Why match */}
        {role.whyMatch && (
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            {role.whyMatch}
          </p>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
        >
          {expanded ? "↑ Less detail" : "↓ Skills detail"}
        </button>
      </div>

      {/* Expanded: required & missing skills */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3 bg-slate-50/50">
          {role.skills?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {role.skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {role.missingSkills?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-500 mb-1.5 uppercase tracking-wider">
                Your Skill Gaps
              </p>
              <div className="flex flex-wrap gap-1.5">
                {role.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-full font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = "h-44" }) {
  return <div className={`bg-slate-100 rounded-2xl animate-pulse ${h}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function CareerRecommendations() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null); // roleId being toggled

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [sortBy, setSortBy] = useState("match"); // match | level | difficulty
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const load = (refresh = false) => {
    setLoading(true);
    setError("");
    careerApi
      .getRecommendations(refresh)
      .then(setData)
      .catch((err) =>
        setError(err.message || "Failed to load recommendations.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(false);
  }, []);

  const handleToggleSave = async (roleId) => {
    setSaving(roleId);
    try {
      const res = await careerApi.toggleSave(roleId);
      // Optimistic update
      setData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          roles: prev.data.roles.map((r) =>
            r._id === roleId ? { ...r, saved: res.saved } : r
          ),
        },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────────
  const roles = data?.data?.roles || [];

  const categories = useMemo(
    () => ["All", ...new Set(roles.map((r) => r.category))],
    [roles]
  );
  const levels = useMemo(
    () => ["All", ...new Set(roles.map((r) => r.level))],
    [roles]
  );

  const filtered = useMemo(() => {
    let list = [...roles];
    if (showSavedOnly) list = list.filter((r) => r.saved);
    if (search)
      list = list.filter((r) =>
        `${r.title} ${r.category} ${r.company}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    if (filterLevel !== "All")
      list = list.filter((r) => r.level === filterLevel);
    if (filterCat !== "All")
      list = list.filter((r) => r.category === filterCat);
    if (filterDiff !== "All")
      list = list.filter((r) => r.difficulty === filterDiff);

    return list.sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "difficulty")
        return (
          ["Easy", "Medium", "Hard"].indexOf(a.difficulty) -
          ["Easy", "Medium", "Hard"].indexOf(b.difficulty)
        );
      if (sortBy === "level")
        return (
          ["Intern", "Junior", "Mid", "Senior", "Lead"].indexOf(b.level) -
          ["Intern", "Junior", "Mid", "Senior", "Lead"].indexOf(a.level)
        );
      return 0;
    });
  }, [
    roles,
    search,
    filterLevel,
    filterCat,
    filterDiff,
    sortBy,
    showSavedOnly,
  ]);

  const savedCount = roles.filter((r) => r.saved).length;
  const readyNow = roles.filter((r) => r.timeToReady === "Ready now").length;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Career Recommendations"
        pageSubtitle="Generating your personalised role matches…"
      >
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} h="h-20" />
            ))}
          </div>
          <Skeleton h="h-24" />
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} h="h-44" />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">
              AI is matching roles to your skills and performance…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout pageTitle="Career Recommendations">
        <div className="max-w-md mx-auto text-center py-24">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon d={I.warn} className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">
            Something went wrong
          </p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button onClick={() => load(false)} className="btn-primary text-sm">
            <Icon d={I.refresh} className="w-4 h-4" /> Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ─── No resume ────────────────────────────────────────────────────────────
  if (!data?.hasData) {
    return (
      <DashboardLayout
        pageTitle="Career Recommendations"
        pageSubtitle="Build your profile to unlock role matches"
      >
        <div className="max-w-lg mx-auto text-center py-24">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Icon d={I.briefcase} className="w-10 h-10 text-brand-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-800 mb-3">
            Upload Your Resume First
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            We need your resume skills to generate accurate, personalised job
            role recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/resume")}
              className="btn-primary text-sm"
            >
              <Icon d={I.doc} className="w-4 h-4" /> Upload Resume
            </button>
            <button
              onClick={() => navigate("/interviews")}
              className="btn-secondary text-sm"
            >
              <Icon d={I.mic} className="w-4 h-4" /> Start Interview
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { data: rec, cached, cachedAt, missingData } = data;

  return (
    <DashboardLayout
      pageTitle="Career Recommendations"
      pageSubtitle={`${roles.length} roles matched · Avg ${rec.avgMatchScore}% · Top: ${rec.topCategory}`}
    >
      <div className="max-w-5xl mx-auto space-y-5">
        {/* ── Improve accuracy nudge ───────────────────────────────────────── */}
        {missingData?.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <Icon d={I.warn} className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-700">
              Improve accuracy:
            </p>
            {missingData.includes("interviews") && (
              <button
                onClick={() => navigate("/interviews")}
                className="text-xs font-semibold text-amber-700 bg-white border border-amber-300 px-3 py-1 rounded-full hover:bg-amber-50 transition-all"
              >
                + Add Interviews
              </button>
            )}
            {missingData.includes("job analyses") && (
              <button
                onClick={() => navigate("/job-analyzer")}
                className="text-xs font-semibold text-amber-700 bg-white border border-amber-300 px-3 py-1 rounded-full hover:bg-amber-50 transition-all"
              >
                + Analyse a Job
              </button>
            )}
          </div>
        )}

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            emoji="🎯"
            label="Total Matches"
            value={roles.length}
            sub={rec.topCategory}
          />
          <StatCard
            emoji="📊"
            label="Avg Match"
            value={`${rec.avgMatchScore}%`}
            sub="across all roles"
          />
          <StatCard
            emoji="✅"
            label="Ready Now"
            value={readyNow}
            sub="can apply today"
          />
          <StatCard
            emoji="🔖"
            label="Saved Roles"
            value={savedCount}
            sub="bookmarked"
          />
        </div>

        {/* ── Market insight ───────────────────────────────────────────────── */}
        {rec.marketInsight && (
          <div className="bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl px-5 py-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
              🤖
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">
                AI Market Insight
              </p>
              <p className="text-sm text-white/85 leading-relaxed">
                {rec.marketInsight}
              </p>
            </div>
          </div>
        )}

        {/* ── Cache info + Refresh ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-slate-400">
            {cached && cachedAt
              ? `Using cached results from ${new Date(
                  cachedAt
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Freshly generated just now"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/career/saved")}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all"
            >
              <Icon d={I.bookmark} className="w-3.5 h-3.5" /> Saved (
              {savedCount})
            </button>
            <button
              onClick={() => load(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-all"
            >
              <Icon d={I.refresh} className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* ── Filters bar ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Icon
              d={I.search}
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, companies, categories…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Icon d={I.x} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter chips row */}
          <div className="flex flex-wrap gap-2 items-center">
            <Icon
              d={I.filter}
              className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
            />

            {/* Level */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-brand-400"
            >
              {levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-brand-400"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={filterDiff}
              onChange={(e) => setFilterDiff(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-brand-400"
            >
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-brand-400"
            >
              <option value="match">Sort: Match %</option>
              <option value="difficulty">Sort: Easiest first</option>
              <option value="level">Sort: Senior first</option>
            </select>

            {/* Saved toggle */}
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                ${
                  showSavedOnly
                    ? "bg-brand-600 text-white border-brand-600"
                    : "border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600"
                }`}
            >
              <Icon d={I.bookmark} className="w-3 h-3" />
              Saved only
            </button>

            {/* Clear filters */}
            {(search ||
              filterLevel !== "All" ||
              filterCat !== "All" ||
              filterDiff !== "All" ||
              showSavedOnly) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterLevel("All");
                  setFilterCat("All");
                  setFilterDiff("All");
                  setShowSavedOnly(false);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
              >
                <Icon d={I.x} className="w-3 h-3" /> Clear all
              </button>
            )}

            <span className="ml-auto text-xs text-slate-400">
              {filtered.length} of {roles.length}
            </span>
          </div>
        </div>

        {/* ── Role cards grid ──────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-slate-400 font-medium mb-2">
              No roles match your current filters
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilterLevel("All");
                setFilterCat("All");
                setFilterDiff("All");
                setShowSavedOnly(false);
              }}
              className="text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              Clear filters →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((role) => (
              <RoleCard
                key={role._id}
                role={role}
                onToggleSave={handleToggleSave}
                saving={saving === role._id}
              />
            ))}
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Recommendations refresh automatically after 24 hours as your profile
            grows.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/career")}
              className="text-sm text-slate-500 hover:text-brand-600 font-medium transition-colors"
            >
              🗺 Career Guidance →
            </button>
            <button
              onClick={() => navigate("/job-analyzer")}
              className="text-sm text-slate-500 hover:text-brand-600 font-medium transition-colors"
            >
              🔍 Analyse a Job →
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
