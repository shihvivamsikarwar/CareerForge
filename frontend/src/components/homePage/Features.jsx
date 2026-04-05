const features = [
  {
    icon: "📄",
    title: "Resume Analyzer",
    desc: "Upload your resume and get instant AI-powered analysis. Extract skills, experience gaps, and keyword optimization tips.",
    color: "from-blue-50 to-brand-50",
    iconBg: "bg-brand-100",
    tag: null,
  },
  {
    icon: "🎤",
    title: "Mock Interviews",
    desc: "Practice with AI-generated technical, HR, and behavioral questions tailored to your role, with difficulty progression.",
    color: "from-violet-50 to-purple-50",
    iconBg: "bg-violet-100",
    tag: null,
  },
  {
    icon: "📊",
    title: "Performance Tracking",
    desc: "Track scores, accuracy, and time spent across all sessions. Visualize your growth over time with actionable insights.",
    color: "from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100",
    tag: null,
  },
  {
    icon: "🔍",
    title: "Job Description Analyzer",
    desc: "Paste any job description to instantly see your match score, skill gaps, and AI-curated improvement suggestions.",
    color: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    tag: "USP",
    featured: true,
  },
  {
    icon: "🤖",
    title: "AI Career Guidance",
    desc: "Get intelligent career path recommendations, role suggestions, and a personalized learning roadmap based on your profile.",
    color: "from-brand-50 to-indigo-50",
    iconBg: "bg-indigo-100",
    tag: null,
  },
  {
    icon: "📝",
    title: "Resume Builder",
    desc: "Build ATS-optimized resumes with AI-assisted wording, keyword suggestions, and professional templates.",
    color: "from-rose-50 to-pink-50",
    iconBg: "bg-rose-100",
    tag: null,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-white">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-tag">
            <span>⚡</span> Core Features
          </span>
          <h2 className="section-title">
            Everything you need to{" "}
            <span className="gradient-text">land your dream job</span>
          </h2>
          <p className="section-sub">
            Six powerful tools, one unified platform. CareerForge gives you the
            AI advantage from resume to offer letter.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group cursor-default
                  ${
                    f.featured
                      ? "border-brand-300 shadow-md shadow-brand-100 bg-gradient-to-br from-brand-50 via-white to-violet-50"
                      : `border-slate-100 bg-gradient-to-br ${f.color} hover:border-slate-200`
                  }`}
            >
              {/* Featured badge */}
              {f.featured && (
                <div className="absolute -top-3 right-5">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-brand-600 to-violet-600 text-white text-xs font-bold rounded-full shadow-md">
                    ⭐ Top Feature
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 ${f.iconBg} rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                {f.icon}
              </div>

              {/* Content */}
              <h3
                className={`font-display font-bold text-lg mb-2 ${
                  f.featured ? "text-brand-800" : "text-slate-800"
                }`}
              >
                {f.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>

              {/* Arrow on hover */}
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                Learn more
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
