import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { resumeApi, interviewApi, performanceApi } from "../services/api";

const getInitialStats = () => [
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

const getInitialRecentActivity = () => [
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
  const [stats, setStats] = useState(getInitialStats());
  const [recentActivity, setRecentActivity] = useState(
    getInitialRecentActivity()
  );
  const [skillProgress, setSkillProgress] = useState([
    { name: "Data Structures & Algorithms", value: 0 },
    { name: "System Design", value: 0 },
    { name: "Behavioural / HR Rounds", value: 0 },
    { name: "Domain Skills", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [resumeData, interviewHistory, performanceData] = await Promise.all(
        [
          resumeApi.getLatest().catch(() => null),
          interviewApi.getHistory(1, 50).catch(() => null),
          performanceApi.getSummary().catch(() => null),
        ]
      );

      // Update stats with real data
      const newStats = getInitialStats();

      // Resume Score
      if (resumeData?.resume?.score) {
        newStats[0].value = resumeData.resume.score.toString();
        newStats[0].delta = resumeData.resume.score >= 70 ? "Good" : "Improve";
      }

      // Interviews Done
      const completedInterviews =
        interviewHistory?.interviews?.filter((i) => i.status === "evaluated")
          .length || 0;
      newStats[1].value = completedInterviews.toString();
      newStats[1].delta = completedInterviews > 0 ? "View" : "Start";

      // Interview Readiness
      if (performanceData?.hasData && performanceData.summary) {
        const avgScore = performanceData.summary.averageScore || 0;
        newStats[2].value = Math.round(avgScore).toString();
        newStats[2].delta =
          avgScore >= 70 ? "Ready" : avgScore >= 50 ? "Practice" : "Need Work";
      }

      // Job Match Average (placeholder - would need job matching API)
      newStats[3].value = "—";
      newStats[3].delta = "Coming Soon";

      setStats(newStats);

      // Update recent activity with real data
      const activities = getInitialRecentActivity();
      const realActivities = [];

      // Add resume upload activity
      if (resumeData?.resume) {
        realActivities.push({
          icon: "📄",
          text: `Resume analyzed with score ${resumeData.resume.score}`,
          score: resumeData.resume.score >= 70 ? "Good" : "Review",
          time: getRelativeTime(resumeData.resume.analyzedAt),
        });
      }

      // Add recent interview activities
      if (interviewHistory?.interviews) {
        interviewHistory.interviews.slice(0, 3).forEach((interview) => {
          if (interview.status === "evaluated") {
            realActivities.push({
              icon: "🎤",
              text: `Completed ${interview.type} interview`,
              score: interview.score
                ? Math.round(interview.score).toString()
                : "Done",
              time: getRelativeTime(
                interview.evaluatedAt || interview.createdAt
              ),
            });
          }
        });
      }

      // Combine default activities with real ones, prioritize real ones
      const combinedActivities = [
        ...realActivities,
        ...activities.slice(0, 3 - realActivities.length),
      ];
      setRecentActivity(combinedActivities);

      // Update skill progress with performance data
      if (performanceData?.hasData && performanceData.summary?.typeBreakdown) {
        const skills = [
          { name: "Data Structures & Algorithms", value: 0 },
          { name: "System Design", value: 0 },
          { name: "Behavioural / HR Rounds", value: 0 },
          { name: "Domain Skills", value: 0 },
        ];

        performanceData.summary.typeBreakdown.forEach((type) => {
          if (type.type === "technical") {
            skills[0].value = Math.round(type.averageScore || 0);
            skills[1].value = Math.round(type.averageScore || 0);
          } else if (type.type === "behavioral") {
            skills[2].value = Math.round(type.averageScore || 0);
          } else if (type.type === "domain") {
            skills[3].value = Math.round(type.averageScore || 0);
          }
        });

        setSkillProgress(skills);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <DashboardLayout
        pageTitle={`Welcome back, ${user?.name?.split(" ")[0] || "there"} 👋`}
        pageSubtitle="Loading your career snapshot..."
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle={`Welcome back, ${user?.name?.split(" ")[0] || "there"} 👋`}
      pageSubtitle={
        error ? "Error loading data" : "Here's your career snapshot"
      }
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
                icon: "📋",
                label: "Interview History",
                color: "bg-emerald-600 text-white hover:bg-emerald-700",
                href: "/interviews/history",
              },
              {
                icon: "📊",
                label: "View Full Report",
                color: "bg-slate-100 text-slate-700 hover:bg-slate-200",
                href: "/performance",
              },
              {
                icon: "🚀",
                label: "Career Guidance",
                color:
                  "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700",
                href: "/career",
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

      {/* Skill progress */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-display font-semibold text-slate-800 mb-2">
          Skill Progress
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          {skillProgress.some((s) => s.value > 0)
            ? "Your performance across different skill areas"
            : "Complete your first interview to see your skill breakdown."}
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {skillProgress.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-slate-500">
                  {skill.name}
                </span>
                <span
                  className={`text-sm font-bold ${
                    skill.value > 0 ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {skill.value > 0 ? `${skill.value}%` : "No data"}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                {skill.value > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(skill.value, 100)}%` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
