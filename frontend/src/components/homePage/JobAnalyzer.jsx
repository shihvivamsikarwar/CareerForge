import { useState } from "react";

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

const missingSkills = ["Docker & Kubernetes", "System Design", "GraphQL"];
const suggestions = [
  "Complete a Docker fundamentals course (2 weeks)",
  "Practice 3 system design problems per week",
  "Add GraphQL to your side project for hands-on XP",
];

export default function JobAnalyzer() {
  const [activeTab, setActiveTab] = useState("match");

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <span className="section-tag">
              <span>🔍</span> #1 Feature
            </span>
            <h2 className="section-title">
              Apply Smart, <span className="gradient-text">Not Blindly</span>
            </h2>
            <p className="text-lg text-slate-500 mt-4 leading-relaxed">
              Stop guessing if you're a good fit. Paste any job description and
              our AI compares it against your resume to give you a data-driven
              match report.
            </p>

            {/* Benefits list */}
            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: "🎯",
                  title: "Instant Match Score",
                  desc: "Know your compatibility percentage before you even apply.",
                },
                {
                  icon: "📋",
                  title: "Missing Skills Report",
                  desc: "See exactly what skills you need to close the gap.",
                },
                {
                  icon: "💬",
                  title: "AI Action Plan",
                  desc: "Get a prioritized list of steps to improve your candidacy.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 font-display">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <a href="#" className="btn-primary mt-8 w-fit">
              Try Job Analyzer Free →
            </a>
          </div>

          {/* Right – Interactive mockup */}
          <div>
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
              {/* Top bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🔍</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Job Analyzer
                    </p>
                    <p className="text-xs text-slate-400">
                      Senior Frontend Developer @ Stripe
                    </p>
                  </div>
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

              {/* Tab content */}
              <div className="p-6">
                {activeTab === "match" && (
                  <div className="space-y-4">
                    {/* Big score */}
                    <div className="text-center py-4">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#e0e7ff"
                            strokeWidth="10"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="url(#grad)"
                            strokeWidth="10"
                            strokeDasharray="314"
                            strokeDashoffset="72"
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                          />
                          <defs>
                            <linearGradient
                              id="grad"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-3xl font-display font-bold text-slate-900">
                            77%
                          </span>
                          <p className="text-xs text-slate-500">Match</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        Good match — a few gaps to address
                      </p>
                    </div>
                    <ProgressBar
                      label="Technical Skills"
                      value={84}
                      color="bg-brand-500"
                    />
                    <ProgressBar
                      label="Experience Level"
                      value={75}
                      color="bg-violet-500"
                    />
                    <ProgressBar
                      label="Keyword Coverage"
                      value={68}
                      color="bg-emerald-500"
                    />
                  </div>
                )}

                {activeTab === "skills" && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 mb-4">
                      Skills present in the job description but missing from
                      your resume:
                    </p>
                    {missingSkills.map((skill, i) => (
                      <div
                        key={skill}
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
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-sm text-slate-600">
                        React, TypeScript, REST APIs —{" "}
                        <strong>all matched!</strong>
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "plan" && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 mb-4">
                      AI-generated action plan to close your skill gaps:
                    </p>
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3.5 bg-brand-50 border border-brand-100 rounded-xl"
                      >
                        <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700">{s}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
