import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { performanceApi } from "../services/api";

/**
 * ── SVG ICON HELPER ──────────────────────────────────────────────────────────
 * Centralized SVG component for consistent iconography across the dashboard.
 */
const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const I = {
  mic: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  trend: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  shield:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  shieldX:
    "M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01",
  check: "M5 13l4 4L19 7",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  bulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  bag: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  chevDown: "M19 9l-7 7-7-7",
};

// ── FORMATTERS ───────────────────────────────────────────────────────────────
const fmt = {
  date: (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—",
  dur: (s) => (s ? `${Math.floor(s / 60)}m ${s % 60}s` : "—"),
};

// ── STYLE HELPERS ─────────────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 8
    ? "text-emerald-600"
    : s >= 6
    ? "text-brand-600"
    : s >= 4
    ? "text-amber-600"
    : "text-red-600";

const scoreBg = (s) =>
  s >= 8
    ? "bg-emerald-50 border-emerald-200"
    : s >= 6
    ? "bg-brand-50 border-brand-200"
    : s >= 4
    ? "bg-amber-50 border-amber-200"
    : "bg-red-50 border-red-200";

const typeEmoji = {
  react: "⚛️",
  node: "🟢",
  hr: "🤝",
  dsa: "📊",
  python: "🐍",
  mixed: "🎯",
  behavioral: "🧠",
  technical: "⚙️",
};
const emoji = (t) => typeEmoji[t] || "📝";

const levelStyle = {
  Expert: {
    ring: "ring-violet-300",
    bg: "bg-violet-50",
    text: "text-violet-700",
    glyph: "🏆",
  },
  Advanced: {
    ring: "ring-brand-300",
    bg: "bg-brand-50",
    text: "text-brand-700",
    glyph: "🚀",
  },
  Intermediate: {
    ring: "ring-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
    glyph: "📈",
  },
  Beginner: {
    ring: "ring-slate-300",
    bg: "bg-slate-100",
    text: "text-slate-600",
    glyph: "🌱",
  },
};
const lStyle = (l) => levelStyle[l] || levelStyle.Beginner;

// ── COMPONENT PARTS ──────────────────────────────────────────────────────────

function StatCard({ icon, iconBg, iconColor, label, value, sub, accent }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 hover:shadow-md transition-all ${
        accent
          ? "bg-gradient-to-br from-brand-600 to-violet-600 border-transparent shadow-lg shadow-brand-500/25"
          : "bg-white border-slate-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            accent ? "bg-white/20" : iconBg
          }`}
        >
          <Icon
            d={icon}
            className={`w-5 h-5 ${accent ? "text-white" : iconColor}`}
          />
        </div>
        {sub && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              accent ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {sub}
          </span>
        )}
      </div>
      <div>
        <p
          className={`text-3xl font-display font-bold ${
            accent ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </p>
        <p
          className={`text-sm mt-0.5 ${
            accent ? "text-white/75" : "text-slate-500"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function TrendChart({ scores }) {
  if (!scores?.length)
    return (
      <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
        No data yet
      </div>
    );

  const W = 580,
    H = 170,
    PL = 32,
    PR = 12,
    PT = 16,
    PB = 28;
  const cW = W - PL - PR,
    cH = H - PT - PB;
  const minY = 0,
    maxY = 10;

  const px = (i) => PL + (i / Math.max(scores.length - 1, 1)) * cW;
  const py = (v) => PT + cH - ((v - minY) / (maxY - minY)) * cH;

  const line = scores.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const area = `${px(0)},${PT + cH} ${line} ${px(scores.length - 1)},${
    PT + cH
  }`;
  const grids = [0, 2, 4, 6, 8, 10];
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const lc = avgScore >= 7 ? "#10b981" : avgScore >= 5 ? "#4f46e5" : "#f59e0b";

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 280 }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lc} stopOpacity=".18" />
            <stop offset="100%" stopColor={lc} stopOpacity=".01" />
          </linearGradient>
        </defs>
        {grids.map((v) => (
          <g key={v}>
            <line
              x1={PL}
              y1={py(v)}
              x2={W - PR}
              y2={py(v)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={PL - 5}
              y={py(v) + 4}
              textAnchor="end"
              fontSize="9"
              fill="#94a3b8"
            >
              {v}
            </text>
          </g>
        ))}
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline
          points={line}
          fill="none"
          stroke={lc}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {scores.map((v, i) => (
          <g key={i}>
            <circle
              cx={px(i)}
              cy={py(v)}
              r={scores.length > 12 ? 3 : 5}
              fill="white"
              stroke={lc}
              strokeWidth="2.5"
            />
            {scores.length <= 10 && (
              <text
                x={px(i)}
                y={py(v) - 9}
                textAnchor="middle"
                fontSize="9"
                fill={lc}
                fontWeight="600"
              >
                {v}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function TrustRing({ score }) {
  const r = 42,
    circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  const c = score >= 80 ? "#10b981" : score >= 55 ? "#f59e0b" : "#ef4444";
  const lbl = score >= 80 ? "Trusted" : score >= 55 ? "Moderate" : "Low";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={c}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={off}
            style={{ transition: "stroke-dashoffset 1.1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold text-slate-900">
            {score}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      <span
        className="text-xs font-bold px-3 py-1 rounded-full border"
        style={{ color: c, background: `${c}14`, borderColor: `${c}30` }}
      >
        {lbl}
      </span>
    </div>
  );
}

function Card({ icon, iconBg, iconColor, title, right, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
          >
            <Icon d={icon} className={`w-4 h-4 ${iconColor}`} />
          </div>
          <h3 className="font-display font-semibold text-slate-800 text-sm">
            {title}
          </h3>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function BulletList({
  items,
  bulletBg,
  bulletIcon,
  bulletColor,
  numbered,
  emptyMsg,
}) {
  if (!items?.length)
    return (
      <p className="text-sm text-slate-400">{emptyMsg || "None listed."}</p>
    );
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          {numbered ? (
            <span
              className={`w-6 h-6 ${bulletBg} ${bulletColor} text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              {i + 1}
            </span>
          ) : (
            <div
              className={`w-5 h-5 ${bulletBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              <Icon d={bulletIcon} className={`w-3 h-3 ${bulletColor}`} />
            </div>
          )}
          <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  );
}

// ── MAIN PERFORMANCE PAGE ───────────────────────────────────────────────────

export default function Performance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    performanceApi
      .getSummary()
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading)
    return (
      <DashboardLayout
        pageTitle="Performance"
        pageSubtitle="Running AI analysis…"
      >
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-100 rounded-2xl animate-pulse h-32"
              />
            ))}
          </div>
          <div className="bg-slate-100 rounded-2xl animate-pulse h-64" />
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout pageTitle="Performance">
        <div className="max-w-md mx-auto text-center py-24">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon d={I.warn} className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">
            Something went wrong
          </p>
          <button onClick={load} className="btn-primary text-sm mt-6">
            <Icon d={I.refresh} className="w-4 h-4" /> Retry
          </button>
        </div>
      </DashboardLayout>
    );

  if (!data?.hasData)
    return (
      <DashboardLayout
        pageTitle="Performance"
        pageSubtitle="Complete interviews to unlock analytics"
      >
        <div className="max-w-lg mx-auto text-center py-24">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Icon d={I.chart} className="w-10 h-10 text-brand-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-800 mb-3">
            No Performance Data Yet
          </h2>
          <button
            onClick={() => navigate("/interviews")}
            className="btn-primary"
          >
            🎤 Start Your First Interview
          </button>
        </div>
      </DashboardLayout>
    );

  const { summary: S, history, aiInsights: AI } = data;
  const trendUp = S.slope > 0;
  const lvl = AI?.overallLevel || "Intermediate";
  const ls = lStyle(lvl);

  return (
    <DashboardLayout
      pageTitle="Performance Analytics"
      pageSubtitle={`${S.totalInterviews} sessions · Avg ${S.averageScore}/10`}
    >
      <div className="max-w-6xl mx-auto space-y-5">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            accent
            icon={I.mic}
            label="Total Interviews"
            value={S.totalInterviews}
            sub={
              S.suspectedCheatingCount > 0
                ? `${S.suspectedCheatingCount} flagged`
                : "all clean"
            }
          />
          <StatCard
            icon={I.chart}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            label="Average Score"
            value={`${S.averageScore}/10`}
            sub="all time"
          />
          <StatCard
            icon={I.star}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Best Score"
            value={`${S.bestScore}/10`}
            sub="peak"
          />
          <StatCard
            icon={I.trend}
            iconBg={trendUp ? "bg-emerald-50" : "bg-rose-50"}
            iconColor={trendUp ? "text-emerald-600" : "text-rose-600"}
            label="Recent Average"
            value={`${S.recentAverage}/10`}
            sub="last 7 sessions"
          />
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {["overview", "history", "insights"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "insights"
                ? "🤖 AI Insights"
                : t === "overview"
                ? "📊 Overview"
                : "📋 History"}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {tab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <Card
                icon={I.trend}
                iconBg="bg-brand-50"
                iconColor="text-brand-600"
                title="Score Trend"
                right={
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      trendUp
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-rose-700 bg-rose-50"
                    }`}
                  >
                    {trendUp ? "↑ Improving" : "→ Stable"}
                  </span>
                }
              >
                <TrendChart scores={S.scoreTrend} />
              </Card>
            </div>
            <div className="space-y-4">
              <Card
                icon={I.shield}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                title="Integrity Score"
              >
                <TrustRing score={S.trustScore} />
              </Card>
              {AI && (
                <div
                  className={`rounded-2xl border p-4 flex items-center gap-3 ${ls.bg} ring-1 ${ls.ring}`}
                >
                  <span className="text-3xl">{ls.glyph}</span>
                  <div>
                    <p className={`font-display font-bold ${ls.text}`}>
                      {lvl} Level
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Avg {S.averageScore}/10
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: HISTORY */}
        {tab === "history" && (
          <Card
            icon={I.mic}
            iconBg="bg-brand-50"
            iconColor="text-brand-600"
            title="Interview History"
          >
            <div className="space-y-1">
              {history.map((iv) => (
                <div
                  key={iv.id}
                  className="border border-slate-100 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpanded(expanded === iv.id ? null : iv.id)
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="text-xl w-8 text-center">
                      {emoji(iv.type)}
                    </span>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-semibold text-slate-800">
                        {iv.title}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold px-2.5 py-1 rounded-xl border ${scoreBg(
                        iv.score
                      )} ${scoreColor(iv.score)}`}
                    >
                      {iv.score}/10
                    </span>
                    <Icon
                      d={I.chevDown}
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        expanded === iv.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expanded === iv.id && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
                      {iv.overallFeedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB CONTENT: AI INSIGHTS */}
        {tab === "insights" && AI && (
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-6 ${ls.bg} ring-1 ${ls.ring}`}
            >
              <p className="text-slate-700 text-sm leading-relaxed">
                {AI.summary}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <Card
                icon={I.star}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                title="Strong Skills"
              >
                <BulletList
                  items={AI.strongSkills}
                  bulletBg="bg-emerald-100"
                  bulletIcon={I.check}
                  bulletColor="text-emerald-600"
                />
              </Card>
              <Card
                icon={I.warn}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                title="Areas to Improve"
              >
                <BulletList
                  items={AI.weakSkills}
                  bulletBg="bg-amber-100"
                  bulletIcon={I.warn}
                  bulletColor="text-amber-600"
                />
              </Card>
            </div>
          </div>
        )}

        {/* FOOTER CTA */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Based on last {history.length} sessions.
          </p>
          <button
            onClick={() => navigate("/interviews")}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            🎤 New Interview →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
