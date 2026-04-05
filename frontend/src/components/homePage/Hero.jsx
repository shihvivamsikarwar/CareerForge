import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ArrowRight = () => (
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
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-brand-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const dashboardStats = [
  {
    label: "Resume Score",
    value: "87",
    unit: "%",
    color: "from-brand-500 to-violet-500",
    progress: 87,
  },
  {
    label: "Interview Readiness",
    value: "72",
    unit: "%",
    color: "from-emerald-400 to-teal-500",
    progress: 72,
  },
  {
    label: "Skill Match",
    value: "91",
    unit: "%",
    color: "from-amber-400 to-orange-500",
    progress: 91,
  },
];

const recentActivity = [
  { icon: "📄", text: "Resume analyzed", time: "2m ago" },
  { icon: "🎤", text: "Mock interview done", time: "1h ago" },
  { icon: "📊", text: "Report generated", time: "3h ago" },
];

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const items = heroRef.current?.querySelectorAll(".animate-fade-up");
    items?.forEach((el, i) => {
      el.style.animationDelay = `${i * 0.12}s`;
    });
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50/60 to-transparent" />
      {/* Decorative orbs */}
      <div className="absolute top-32 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-200/25 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 text-brand-700 text-sm font-semibold rounded-full border border-brand-200 mb-6">
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                AI-Powered Career Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-[1.1] tracking-tight">
              Forge Your Career with{" "}
              <span className="gradient-text">AI-Powered</span> Preparation
            </h1>

            {/* Subheading */}
            <p className="animate-fade-up mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Analyze your resume, practice interviews, and get personalized
              career guidance — all in one intelligent platform built for your
              success.
            </p>

            {/* Trust bullets */}
            <ul className="animate-fade-up mt-6 space-y-2">
              {[
                "AI-generated mock interviews tailored to you",
                "Real-time performance insights & reports",
                "Job Description match scoring",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-slate-600"
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="animate-fade-up mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary gap-2 text-base">
                Get Started Free <ArrowRight />
              </Link>
              <Link to="/login" className="btn-secondary gap-2 text-base">
                <PlayIcon /> Try Demo
              </Link>
            </div>

            {/* Social proof */}
            <div className="animate-fade-up mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  "bg-brand-400",
                  "bg-violet-400",
                  "bg-emerald-400",
                  "bg-amber-400",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {["A", "B", "C", "D"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 text-amber-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700">4.9/5</span>{" "}
                  from 2,000+ users
                </p>
              </div>
            </div>
          </div>

          {/* Right – Dashboard Mockup */}
          <div className="relative animate-fade-up hidden lg:block">
            {/* Main card */}
            <div className="relative animate-float">
              <div className="bg-white rounded-3xl shadow-2xl shadow-brand-500/10 border border-slate-100 overflow-hidden">
                {/* Header bar */}
                <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-brand-100 text-xs font-medium">
                      Welcome back,
                    </p>
                    <p className="text-white font-semibold font-display">
                      Aryan Sharma 👋
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6 space-y-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Your Progress
                  </p>
                  {dashboardStats.map((stat) => (
                    <div key={stat.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-slate-600">
                          {stat.label}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {stat.value}
                          {stat.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Recent activity */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Recent Activity
                    </p>
                    <div className="space-y-2.5">
                      {recentActivity.map((item) => (
                        <div
                          key={item.text}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-sm">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">
                              {item.text}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA bar */}
                <div className="px-6 pb-5">
                  <button className="w-full py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">
                    Start Today's Interview →
                  </button>
                </div>
              </div>
            </div>

            {/* Floating badge 1 */}
            <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl animate-pulse-slow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-base">
                  ✅
                </div>
                <div>
                  <p className="text-xs text-slate-500">Interview Score</p>
                  <p className="text-sm font-bold text-slate-800">92/100</p>
                </div>
              </div>
            </div>

            {/* Floating badge 2 */}
            <div className="absolute -bottom-4 -left-6 glass rounded-2xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-base">
                  🤖
                </div>
                <div>
                  <p className="text-xs text-slate-500">AI Feedback</p>
                  <p className="text-sm font-bold text-slate-800">Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
