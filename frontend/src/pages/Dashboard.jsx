import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

const stats = [
  {
    label: "Resume Score",
    value: "—",
    delta: "Upload",
    icon: "📄",
    color: "brand",
  },
  {
    label: "Interviews Done",
    value: "0",
    delta: "Start",
    icon: "🎤",
    color: "violet",
  },
  {
    label: "Interview Readiness",
    value: "—",
    delta: "Pending",
    icon: "📊",
    color: "emerald",
  },
  {
    label: "Job Match Avg.",
    value: "—",
    delta: "Pending",
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
    icon: "🚀",
    text: "Account created — welcome to CareerForge!",
    score: "New",
    time: "Just now",
  },
  {
    icon: "📄",
    text: "Upload your resume to get an AI analysis",
    score: "Todo",
    time: "",
  },
  {
    icon: "🎤",
    text: "Start a mock interview to test your skills",
    score: "Todo",
    time: "",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <DashboardLayout
      pageTitle={`Welcome back, ${user?.name?.split(" ")[0] || "there"} 👋`}
      pageSubtitle="Here's your career snapshot"
    >
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
                <span className="text-xs font-semibold text-slate-500 bg-white/70 px-2 py-0.5 rounded-full">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-display font-semibold text-slate-800">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((item) => (
              <div
                key={item.text}
                className="px-6 py-4 flex items-center gap-4"
              >
                <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {item.text}
                  </p>
                  {item.time && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  )}
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
                icon: "📄",
                label: "Analyse My Resume",
                color: "bg-brand-600 text-white hover:bg-brand-700",
                href: "/resume",
              },
              {
                icon: "🎤",
                label: "Start Mock Interview",
                color: "bg-violet-600 text-white hover:bg-violet-700",
                href: "/interviews",
              },
              {
                icon: "🔍",
                label: "Run Job Analyzer",
                color: "bg-emerald-600 text-white hover:bg-emerald-700",
                href: "/job-analyzer",
              },
              {
                icon: "📊",
                label: "View Full Report",
                color: "bg-slate-100 text-slate-700 hover:bg-slate-200",
                href: "/performance",
              },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${action.color} active:scale-[0.98] transition-all duration-150`}
              >
                <span className="text-base">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-brand-50 to-violet-50 rounded-xl border border-brand-100">
            <p className="text-xs font-semibold text-brand-700 mb-1">
              🤖 Getting started
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your resume first — the AI will score it and unlock
              personalised interview questions for your skills.
            </p>
          </div>
        </div>
      </div>

      {/* Skill progress placeholder */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-display font-semibold text-slate-800 mb-2">
          Skill Progress
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          Complete your first resume analysis to see your skill breakdown.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            "Data Structures & Algorithms",
            "System Design",
            "Behavioural / HR Rounds",
            "Domain Skills",
          ].map((skill) => (
            <div key={skill}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-slate-500">
                  {skill}
                </span>
                <span className="text-sm font-bold text-slate-400">—</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
