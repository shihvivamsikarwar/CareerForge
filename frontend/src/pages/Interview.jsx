import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { interviewApi } from "../services/api";

// ── Color config for each type ────────────────────────────────────────────────
const TYPE_COLORS = {
  brand: {
    card: "border-brand-200 hover:border-brand-400 hover:bg-brand-50",
    badge: "bg-brand-100 text-brand-700",
    btn: "bg-brand-600 hover:bg-brand-700",
  },
  emerald: {
    card: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    btn: "bg-emerald-600 hover:bg-emerald-700",
  },
  violet: {
    card: "border-violet-200 hover:border-violet-400 hover:bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    btn: "bg-violet-600 hover:bg-violet-700",
  },
  amber: {
    card: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    btn: "bg-amber-600 hover:bg-amber-700",
  },
  rose: {
    card: "border-rose-200 hover:border-rose-400 hover:bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
    btn: "bg-rose-600 hover:bg-rose-700",
  },
  orange: {
    card: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
    btn: "bg-orange-600 hover:bg-orange-700",
  },
  teal: {
    card: "border-teal-200 hover:border-teal-400 hover:bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
    btn: "bg-teal-600 hover:bg-teal-700",
  },
  slate: {
    card: "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
    badge: "bg-slate-100 text-slate-700",
    btn: "bg-slate-700 hover:bg-slate-800",
  },
};

const DIFF_COLORS = {
  Easy: "text-emerald-600 bg-emerald-50",
  Medium: "text-amber-600 bg-amber-50",
  Intermediate: "text-brand-600 bg-brand-50",
  Hard: "text-red-600 bg-red-50",
};

export default function Interview() {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    interviewApi
      .getTypes()
      .then((data) => setTypes(data.types || []))
      .catch(() => setError("Failed to load interview types. Please refresh."))
      .finally(() => setFetching(false));
  }, []);

  const handleStart = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const data = await interviewApi.start(selected);
      // Navigate to the session page, passing interview data via state
      navigate("/interviews/session", { state: { interview: data.interview } });
    } catch (err) {
      setError(err.message || "Failed to start interview. Please try again.");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      pageTitle="Mock Interviews"
      pageSubtitle="Choose an interview type and get AI-evaluated feedback on your answers"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-brand-600 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              🎤
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">
                AI-Powered Mock Interviews
              </h2>
              <p className="text-brand-100 text-sm mt-1">
                Answer 7 questions per session. Our AI evaluates each answer and
                gives you a score, strengths, weaknesses, and actionable
                suggestions.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              "7 Questions per session",
              "AI-scored answers",
              "Per-question feedback",
              "Unlimited retries",
            ].map((f) => (
              <span
                key={f}
                className="text-xs font-medium bg-white/15 px-3 py-1 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Type grid */}
        {fetching ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-white rounded-2xl border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {types.map((type) => {
              const c = TYPE_COLORS[type.color] || TYPE_COLORS.slate;
              const isSelected = selected === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelected(type.id)}
                  className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? "border-brand-500 bg-brand-50 shadow-lg shadow-brand-100 scale-[1.02]"
                        : `border-slate-200 bg-white ${c.card}`
                    }`}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="text-3xl mb-3">{type.icon}</div>
                  <h3 className="font-display font-bold text-slate-800 text-sm leading-tight">
                    {type.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {type.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        DIFF_COLORS[type.difficulty] ||
                        "text-slate-600 bg-slate-100"
                      }`}
                    >
                      {type.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">
                      {type.questionCount} Qs
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Start button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={handleStart}
            disabled={!selected || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-brand-600 text-white
              font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all duration-200
              shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Starting…
              </>
            ) : (
              <>
                🚀 Start Interview
                {selected && types.find((t) => t.id === selected) && (
                  <span className="text-brand-200 font-normal">
                    — {types.find((t) => t.id === selected).title}
                  </span>
                )}
              </>
            )}
          </button>

          {!selected && (
            <p className="text-sm text-slate-400">
              Select an interview type above to begin
            </p>
          )}
        </div>

        {/* Recent history link */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => navigate("/interviews/history")}
            className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            View past interview results
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
