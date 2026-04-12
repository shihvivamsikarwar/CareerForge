import { useState, useEffect } from "react";
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
  bookmark: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  briefcase:
    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  arrow: "M13 7l5 5m0 0l-5 5m5-5H6",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  check: "M5 13l4 4L19 7",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
};

// ─── Colour helpers ───────────────────────────────────────────────────────────
const matchBg = (s) =>
  s >= 75
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : s >= 55
    ? "bg-brand-50 border-brand-200 text-brand-700"
    : s >= 35
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-red-50 border-red-200 text-red-700";

const diffStyle = {
  Easy: "text-emerald-700 bg-emerald-50",
  Medium: "text-amber-700 bg-amber-50",
  Hard: "text-red-700 bg-red-50",
};
const lvlStyle = {
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

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function SavedRoles() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    careerApi
      .getSavedRoles()
      .then((d) => setRoles(d.saved || []))
      .catch((e) => setError(e.message || "Failed to load saved roles."))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (roleId) => {
    setRemoving(roleId);
    try {
      await careerApi.toggleSave(roleId);
      setRoles((prev) => prev.filter((r) => r._id !== roleId));
    } catch (e) {
      setError(e.message);
    } finally {
      setRemoving(null);
    }
  };

  // Stats
  const avgMatch = roles.length
    ? Math.round(roles.reduce((s, r) => s + r.matchScore, 0) / roles.length)
    : 0;
  const readyNow = roles.filter((r) => r.timeToReady === "Ready now").length;
  const topCat = roles.length
    ? Object.entries(
        roles.reduce((acc, r) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Saved Roles"
        pageSubtitle="Your bookmarked career opportunities"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Saved Roles"
      pageSubtitle={
        roles.length
          ? `${roles.length} saved · Avg ${avgMatch}% match`
          : "No saved roles yet"
      }
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <Icon
              d={I.warn}
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {roles.length} saved role{roles.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => navigate("/career/recommendations")}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-500/20"
          >
            <Icon d={I.briefcase} className="w-4 h-4" /> Browse All Roles
          </button>
        </div>

        {/* Stats strip (only if roles exist) */}
        {roles.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "📊", label: "Avg Match", value: `${avgMatch}%` },
              { emoji: "✅", label: "Ready Now", value: readyNow },
              { emoji: "🏆", label: "Top Category", value: topCat || "—" },
            ].map(({ emoji, label, value }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center"
              >
                <p className="text-lg">{emoji}</p>
                <p className="text-base font-display font-bold text-slate-900 mt-0.5">
                  {value}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {roles.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-14 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon d={I.bookmark} className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="font-display font-semibold text-slate-700 text-lg mb-2">
              No saved roles yet
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Browse your personalised recommendations and bookmark roles you
              want to pursue.
            </p>
            <button
              onClick={() => navigate("/career/recommendations")}
              className="btn-primary text-sm"
            >
              🎯 View Recommendations
            </button>
          </div>
        )}

        {/* Saved roles list */}
        {roles.length > 0 && (
          <div className="space-y-4">
            {roles
              .sort((a, b) => b.matchScore - a.matchScore)
              .map((role) => (
                <div
                  key={role._id}
                  className="bg-white rounded-2xl border border-brand-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm">
                            {catIcon(role.category)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {role.category}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              lvlStyle[role.level] || lvlStyle.Mid
                            }`}
                          >
                            {role.level}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              diffStyle[role.difficulty] || diffStyle.Medium
                            }`}
                          >
                            {role.difficulty}
                          </span>
                          {role.timeToReady === "Ready now" && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Icon d={I.check} className="w-3 h-3" /> Ready now
                            </span>
                          )}
                        </div>

                        <h3 className="font-display font-bold text-slate-800 text-base leading-snug">
                          {role.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {role.company}
                        </p>

                        {/* Salary + time */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {role.salaryRange && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                              💰 {role.salaryRange}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Icon d={I.clock} className="w-3 h-3" />{" "}
                            {role.timeToReady}
                          </span>
                        </div>

                        {/* Why match */}
                        {role.whyMatch && (
                          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                            {role.whyMatch}
                          </p>
                        )}
                      </div>

                      {/* Match score + remove */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div
                          className={`text-center px-3 py-2 rounded-xl border ${matchBg(
                            role.matchScore
                          )}`}
                        >
                          <p className="text-xl font-display font-bold leading-none">
                            {role.matchScore}%
                          </p>
                          <p className="text-xs font-medium leading-none mt-0.5">
                            match
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(role._id)}
                          disabled={removing === role._id}
                          title="Remove from saved"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          {removing === role._id ? (
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Icon d={I.trash} className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Skills */}
                    {(role.skills?.length > 0 ||
                      role.missingSkills?.length > 0) && (
                      <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3">
                        {role.skills?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Required
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {role.skills.map((s, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-full"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {role.missingSkills?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">
                              Skill Gaps
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {role.missingSkills.map((s, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2.5 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full font-semibold"
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

                  {/* Action bar */}
                  <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      {role.missingSkills?.length
                        ? `Close ${role.missingSkills.length} skill gap${
                            role.missingSkills.length > 1 ? "s" : ""
                          } to improve your match`
                        : "You meet all requirements for this role!"}
                    </p>
                    <div className="flex gap-2">
                      {role.missingSkills?.length > 0 && (
                        <button
                          onClick={() => navigate("/career")}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                          View roadmap →
                        </button>
                      )}
                      <button
                        onClick={() => navigate("/job-analyzer")}
                        className="text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
                      >
                        Analyse JD →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Footer */}
        {roles.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Bookmark more roles from your recommendations.
            </p>
            <button
              onClick={() => navigate("/career/recommendations")}
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              <Icon d={I.briefcase} className="w-4 h-4" /> More Recommendations
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
