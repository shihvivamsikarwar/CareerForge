const capabilities = [
  {
    icon: "🧠",
    title: "Personalized Questions",
    desc: "AI reads your resume and generates interview questions specific to your skills, experience level, and target role.",
    stat: "500+",
    statLabel: "question patterns",
  },
  {
    icon: "💡",
    title: "Smart Suggestions",
    desc: "Real-time tips during practice sessions. Know what you're doing right and where to improve before the real interview.",
    stat: "98%",
    statLabel: "feedback accuracy",
  },
  {
    icon: "✨",
    title: "Resume Optimization",
    desc: "AI rewrites weak bullet points, improves phrasing, and suggests keywords that get past ATS filters.",
    stat: "3x",
    statLabel: "more ATS passes",
  },
  {
    icon: "🗺️",
    title: "Career Roadmap",
    desc: "Based on your skills and goals, get a clear, step-by-step roadmap with resources, timelines, and milestones.",
    stat: "100+",
    statLabel: "career paths mapped",
  },
];

export default function AISection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-semibold rounded-full border border-white/20 mb-4">
            <span>🤖</span> AI Intelligence Layer
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
            Powered by advanced AI,
            <br />
            <span className="text-brand-200">built for real results</span>
          </h2>
          <p className="text-lg text-brand-200 mt-4 max-w-2xl mx-auto">
            CareerForge's AI doesn't just test you — it learns your gaps and
            continuously adapts to accelerate your growth.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="group bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-6 
                           hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                {cap.icon}
              </div>

              {/* Stat */}
              <div className="mb-4">
                <span className="text-3xl font-display font-bold text-white">
                  {cap.stat}
                </span>
                <span className="text-brand-300 text-sm ml-2">
                  {cap.statLabel}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-display font-bold text-white text-base mb-2">
                {cap.title}
              </h3>
              <p className="text-brand-200 text-sm leading-relaxed">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            className="px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 active:scale-95 transition-all shadow-lg"
          >
            Experience AI Power →
          </a>
          <a
            href="#"
            className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 active:scale-95 transition-all"
          >
            See How AI Works
          </a>
        </div>
      </div>
    </section>
  );
}
