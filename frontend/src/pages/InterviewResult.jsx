import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { interviewApi } from "../services/api";

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
  check: "M5 13l4 4L19 7",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  lightbulb:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  speech:
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  chevDown: "M19 9l-7 7-7-7",
  shield:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  shieldX:
    "M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01",
};

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, max = 10 }) {
  const pct = score / max;
  const r = 54;
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

  const label =
    pct >= 0.8
      ? "Excellent"
      : pct >= 0.6
      ? "Good"
      : pct >= 0.4
      ? "Average"
      : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
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
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-slate-900">
            {score}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ {max}</span>
        </div>
      </div>
      <span
        className="text-sm font-bold px-4 py-1 rounded-full"
        style={{ color, background: `${color}18` }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Per-question score mini-bar ───────────────────────────────────────────────
function QScore({ score }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8
      ? "bg-emerald-500"
      : score >= 6
      ? "bg-brand-500"
      : score >= 4
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700 w-6 text-right flex-shrink-0">
        {score}
      </span>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function FeedbackCard({ icon, iconBg, iconColor, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div
          className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon d={icon} className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="font-display font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function InterviewResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // /interviews/result/:id (direct link)

  const [interview, setInterview] = useState(location.state?.interview || null);
  const [loading, setLoading] = useState(!location.state?.interview && !!id);
  const [error, setError] = useState("");
  const [expandedQ, setExpandedQ] = useState(null);

  // Fetch by ID if arrived via direct link
  useEffect(() => {
    if (!interview && id) {
      interviewApi
        .getById(id)
        .then((data) => setInterview(data.interview))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <DashboardLayout pageTitle="Interview Result">
        <div className="flex items-center justify-center min-h-64">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !interview) {
    return (
      <DashboardLayout pageTitle="Interview Result">
        <div className="max-w-md mx-auto text-center py-20">
          <p className="text-slate-500 mb-4">
            {error || "Interview result not found."}
          </p>
          <button
            onClick={() => navigate("/interviews")}
            className="btn-primary text-sm"
          >
            Back to Interviews
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const {
    qa = [],
    score = 0,
    feedback = {},
    title,
    type,
    durationSeconds,
    evaluatedAt,
    integrity,
    isCheatingSuspected,
  } = interview;
  const {
    strengths = [],
    weaknesses = [],
    suggestions = [],
    overallFeedback = "",
  } = feedback;

  const durationLabel = durationSeconds
    ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`
    : null;

  const dateLabel = evaluatedAt
    ? new Date(evaluatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Integrity totals
  const totalViolations = integrity
    ? (integrity.tabSwitches || 0) +
      (integrity.pasteAttempts || 0) +
      (integrity.fullscreenExits || 0) +
      (integrity.inactivityFlags || 0)
    : 0;

  return (
    <DashboardLayout
      pageTitle="Interview Result"
      pageSubtitle={`${title || type} · ${qa.length} questions`}
    >
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Hero result banner */}
        <div
          className={`rounded-2xl p-6 text-white bg-gradient-to-r ${
            score >= 8
              ? "from-emerald-600 to-teal-600"
              : score >= 6
              ? "from-brand-600 to-violet-600"
              : score >= 4
              ? "from-amber-500 to-orange-500"
              : "from-red-500 to-rose-500"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="bg-white/15 rounded-2xl p-4 flex-shrink-0">
              <ScoreRing score={score} />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-2xl">
                {title || "Interview"} Complete
              </h2>
              <p className="text-white/80 mt-1 text-sm leading-relaxed">
                {overallFeedback || "Your interview has been evaluated."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {durationLabel && (
                  <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-medium">
                    ⏱ {durationLabel}
                  </span>
                )}
                {dateLabel && (
                  <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-medium">
                    📅 {dateLabel}
                  </span>
                )}
                <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-medium">
                  ✅ {qa.filter((q) => q.answer?.trim()).length}/{qa.length}{" "}
                  answered
                </span>
                {/* Integrity status badge */}
                {isCheatingSuspected ? (
                  <span className="text-xs bg-red-900/40 border border-red-400/40 text-red-200 px-3 py-1 rounded-full font-semibold">
                    🚨 Suspicious Activity Detected
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-900/30 border border-emerald-400/30 text-emerald-200 px-3 py-1 rounded-full font-semibold">
                    ✔ Clean Attempt
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths / Weaknesses / Suggestions */}
        <div className="grid md:grid-cols-3 gap-4">
          <FeedbackCard
            icon={ICONS.star}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="Strengths"
          >
            {strengths.length > 0 ? (
              <ul className="space-y-2.5">
                {strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon
                        d={ICONS.check}
                        className="w-3 h-3 text-emerald-600"
                      />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No strengths recorded.</p>
            )}
          </FeedbackCard>

          <FeedbackCard
            icon={ICONS.warning}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            title="Areas to Improve"
          >
            {weaknesses.length > 0 ? (
              <ul className="space-y-2.5">
                {weaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon
                        d={ICONS.warning}
                        className="w-3 h-3 text-amber-600"
                      />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                No weaknesses identified.
              </p>
            )}
          </FeedbackCard>

          <FeedbackCard
            icon={ICONS.lightbulb}
            iconBg="bg-brand-50"
            iconColor="text-brand-600"
            title="Suggestions"
          >
            {suggestions.length > 0 ? (
              <ol className="space-y-2.5">
                {suggestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-brand-100 text-brand-700 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-400">
                No suggestions generated.
              </p>
            )}
          </FeedbackCard>
        </div>

        {/* ── Integrity / Anti-cheating Report ───────────────────────────── */}
        {integrity && (
          <div
            className={`rounded-2xl border shadow-sm overflow-hidden ${
              isCheatingSuspected
                ? "border-red-200 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div
              className={`px-5 py-4 border-b flex items-center gap-3 ${
                isCheatingSuspected ? "border-red-200" : "border-emerald-200"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCheatingSuspected ? "bg-red-100" : "bg-emerald-100"
                }`}
              >
                <Icon
                  d={isCheatingSuspected ? ICONS.shieldX : ICONS.shield}
                  className={`w-4 h-4 ${
                    isCheatingSuspected ? "text-red-600" : "text-emerald-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-display font-semibold ${
                    isCheatingSuspected ? "text-red-800" : "text-emerald-800"
                  }`}
                >
                  Integrity Report
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isCheatingSuspected ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {isCheatingSuspected
                    ? "Suspicious activity was detected during this session. This result may be reviewed."
                    : "No significant integrity violations detected. This appears to be a clean attempt."}
                </p>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  isCheatingSuspected
                    ? "bg-red-200 text-red-800"
                    : "bg-emerald-200 text-emerald-800"
                }`}
              >
                {isCheatingSuspected ? "❌ Suspicious" : "✔ Clean"}
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    label: "Tab Switches",
                    value: integrity.tabSwitches || 0,
                    bad: 2,
                  },
                  {
                    label: "Paste Attempts",
                    value: integrity.pasteAttempts || 0,
                    bad: 1,
                  },
                  {
                    label: "Copy Attempts",
                    value: integrity.copyAttempts || 0,
                    bad: 3,
                  },
                  {
                    label: "Right Clicks",
                    value: integrity.rightClicks || 0,
                    bad: 5,
                  },
                  {
                    label: "Fullscreen Exits",
                    value: integrity.fullscreenExits || 0,
                    bad: 2,
                  },
                  {
                    label: "Inactivity Flags",
                    value: integrity.inactivityFlags || 0,
                    bad: 1,
                  },
                ].map(({ label, value, bad }) => {
                  const isBad = value >= bad;
                  return (
                    <div
                      key={label}
                      className={`rounded-xl p-3 text-center border ${
                        isBad
                          ? "bg-red-100 border-red-200"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <p
                        className={`text-2xl font-display font-bold ${
                          isBad ? "text-red-700" : "text-slate-700"
                        }`}
                      >
                        {value}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isBad ? "text-red-600" : "text-slate-500"
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {isCheatingSuspected && (
                <p className="mt-4 text-xs text-red-600 bg-red-100 border border-red-200 rounded-xl px-4 py-2.5 leading-relaxed">
                  ⚠️ This session has been automatically flagged due to the
                  level of suspicious activity detected. The AI evaluation
                  result is still provided, but the integrity of this attempt is
                  in question. To get a clean result, please retake the
                  interview without switching tabs, pasting content, or exiting
                  fullscreen.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Per-question breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Icon d={ICONS.speech} className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="font-display font-semibold text-slate-800">
              Per-Question Breakdown
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {qa.map((item, i) => (
              <div key={i} className="px-5 py-4">
                {/* Question header row */}
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full flex items-start gap-3 text-left group"
                >
                  <span className="w-7 h-7 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 leading-snug pr-2">
                      {item.question}
                    </p>
                    <div className="mt-2 max-w-xs">
                      <QScore score={item.questionScore ?? 0} />
                    </div>
                  </div>
                  <Icon
                    d={ICONS.chevDown}
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform ${
                      expandedQ === i ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded answer + feedback */}
                {expandedQ === i && (
                  <div className="mt-4 ml-10 space-y-3">
                    {item.answer?.trim() ? (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Your Answer
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {item.answer}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <p className="text-sm text-red-600 font-medium">
                          No answer provided
                        </p>
                      </div>
                    )}
                    {item.questionFeedback && (
                      <div
                        className={`rounded-xl p-4 border ${
                          (item.questionScore ?? 0) >= 7
                            ? "bg-emerald-50 border-emerald-100"
                            : (item.questionScore ?? 0) >= 5
                            ? "bg-brand-50 border-brand-100"
                            : "bg-amber-50 border-amber-100"
                        }`}
                      >
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          AI Feedback
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {item.questionFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 items-center justify-between pt-2">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/interviews")}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold
                rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-500/20"
            >
              <Icon d={ICONS.refresh} className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => navigate("/interviews/history")}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium
                rounded-xl hover:bg-slate-50 transition-all"
            >
              <Icon d={ICONS.history} className="w-4 h-4" /> View History
            </button>
          </div>
          <button
            onClick={() => navigate("/resume")}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Improve Resume →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
