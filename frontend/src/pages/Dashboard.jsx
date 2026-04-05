import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Icons ──────────────────────────────────────────────────────────────────
const BoltIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L10 22l9.91-10.96A1 1 0 0019 9.5h-5.5L13 2z" />
  </svg>
);
const Icon = ({ d }) => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d={d}
    />
  </svg>
);

const navItems = [
  {
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    active: true,
  },
  {
    label: "Resume",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    label: "Interviews",
    icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  },
  {
    label: "Performance",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    label: "Job Analyzer",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

const stats = [
  {
    label: "Resume Score",
    value: "87%",
    delta: "+4%",
    icon: "📄",
    color: "brand",
  },
  {
    label: "Interviews Done",
    value: "12",
    delta: "+3",
    icon: "🎤",
    color: "violet",
  },
  {
    label: "Interview Readiness",
    value: "72%",
    delta: "+8%",
    icon: "📊",
    color: "emerald",
  },
  {
    label: "Job Match Avg.",
    value: "79%",
    delta: "+5%",
    icon: "🔍",
    color: "amber",
  },
];

const colorMap = {
  brand: { bg: "bg-brand-50", text: "text-brand-700", icon: "bg-brand-100" },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    icon: "bg-violet-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "bg-emerald-100",
  },
  amber: { bg: "bg-amber-50", text: "text-amber-700", icon: "bg-amber-100" },
};

const recentActivity = [
  {
    icon: "✅",
    text: "Mock HR Interview completed",
    score: "88/100",
    time: "2h ago",
  },
  {
    icon: "📄",
    text: "Resume re-analyzed after updates",
    score: "+4 pts",
    time: "5h ago",
  },
  {
    icon: "🔍",
    text: "Job analyzed: Senior Dev @ Stripe",
    score: "77%",
    time: "1d ago",
  },
  {
    icon: "📊",
    text: "Performance report generated",
    score: "Done",
    time: "2d ago",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed top-0 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col
        transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center text-white">
              <BoltIcon />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">
              Career
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-violet-600">
                Forge
              </span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  item.active
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
            >
              <Icon d={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-display font-bold text-slate-900">
                Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Here's your career snapshot for today
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </header>

        {/* Page body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const c = colorMap[stat.color];
              return (
                <div
                  key={stat.label}
                  className={`${c.bg} rounded-2xl p-5 border border-white hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 ${c.icon} rounded-xl flex items-center justify-center text-lg`}
                    >
                      {stat.icon}
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {stat.delta}
                    </span>
                  </div>
                  <p className={`text-2xl font-display font-bold ${c.text}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent activity */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display font-semibold text-slate-800">
                  Recent Activity
                </h2>
                <button className="text-xs text-brand-600 font-medium hover:underline">
                  View all
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {recentActivity.map((item) => (
                  <div
                    key={item.text}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {item.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-display font-semibold text-slate-800">
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  {
                    icon: "🎤",
                    label: "Start Mock Interview",
                    color: "bg-brand-600 text-white hover:bg-brand-700",
                  },
                  {
                    icon: "📄",
                    label: "Analyze My Resume",
                    color: "bg-violet-600 text-white hover:bg-violet-700",
                  },
                  {
                    icon: "🔍",
                    label: "Run Job Analyzer",
                    color: "bg-emerald-600 text-white hover:bg-emerald-700",
                  },
                  {
                    icon: "📊",
                    label: "View Full Report",
                    color: "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${action.color} active:scale-[0.98] transition-all duration-150`}
                  >
                    <span className="text-base">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>

              {/* AI tip */}
              <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-brand-50 to-violet-50 rounded-xl border border-brand-100">
                <p className="text-xs font-semibold text-brand-700 mb-1">
                  🤖 AI Insight
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your System Design score dropped last session. Practice 2–3
                  problems this week to recover your streak.
                </p>
              </div>
            </div>
          </div>

          {/* Progress section */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-display font-semibold text-slate-800 mb-5">
              Skill Progress
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  label: "Data Structures & Algorithms",
                  value: 78,
                  color: "bg-brand-500",
                },
                { label: "System Design", value: 54, color: "bg-violet-500" },
                {
                  label: "Behavioural / HR Rounds",
                  value: 90,
                  color: "bg-emerald-500",
                },
                { label: "Frontend / React", value: 85, color: "bg-amber-500" },
              ].map((skill) => (
                <div key={skill.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-slate-600">
                      {skill.label}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {skill.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.color} rounded-full transition-all duration-700`}
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
