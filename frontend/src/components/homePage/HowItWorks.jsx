const steps = [
  {
    step: "01",
    icon: "📤",
    title: "Upload Resume",
    desc: "Upload your PDF or DOC resume. Our AI parser extracts skills, experience, and education instantly.",
    color: "brand",
  },
  {
    step: "02",
    icon: "🔎",
    title: "Analyze Skills",
    desc: "Get a detailed skill map, strength analysis, and a personalized gap report in seconds.",
    color: "violet",
  },
  {
    step: "03",
    icon: "🎤",
    title: "Practice Interviews",
    desc: "Face AI-generated questions across technical, HR, and behavioral rounds. Adaptive difficulty levels.",
    color: "emerald",
  },
  {
    step: "04",
    icon: "📊",
    title: "Get Report",
    desc: "Receive comprehensive performance reports with scores, weak areas, and improvement highlights.",
    color: "amber",
  },
  {
    step: "05",
    icon: "🚀",
    title: "Improve & Apply",
    desc: "Follow the AI career roadmap, upskill with suggestions, and apply to matched roles with confidence.",
    color: "rose",
  },
];

const colorMap = {
  brand: {
    ring: "ring-brand-200",
    bg: "bg-brand-50",
    num: "text-brand-600",
    dot: "bg-brand-500",
    line: "from-brand-300",
  },
  violet: {
    ring: "ring-violet-200",
    bg: "bg-violet-50",
    num: "text-violet-600",
    dot: "bg-violet-500",
    line: "from-violet-300",
  },
  emerald: {
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    num: "text-emerald-600",
    dot: "bg-emerald-500",
    line: "from-emerald-300",
  },
  amber: {
    ring: "ring-amber-200",
    bg: "bg-amber-50",
    num: "text-amber-600",
    dot: "bg-amber-500",
    line: "from-amber-300",
  },
  rose: {
    ring: "ring-rose-200",
    bg: "bg-rose-50",
    num: "text-rose-600",
    dot: "bg-rose-500",
    line: "from-rose-300",
  },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      {/* Bg pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e0e7ff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">
            <span>🔄</span> How It Works
          </span>
          <h2 className="section-title">
            From resume to offer in{" "}
            <span className="gradient-text">5 simple steps</span>
          </h2>
          <p className="section-sub">
            A streamlined journey designed to maximize your preparation and
            career readiness.
          </p>
        </div>

        {/* Steps – desktop horizontal, mobile vertical */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-200 via-emerald-200 to-rose-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, i) => {
              const c = colorMap[step.color];
              return (
                <div
                  key={step.step}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Step icon circle */}
                  <div
                    className={`relative w-24 h-24 ${c.bg} ring-4 ${c.ring} rounded-3xl flex flex-col items-center justify-center mb-5 
                      group-hover:scale-105 transition-transform duration-300 shadow-sm z-10`}
                  >
                    <span className="text-3xl mb-1">{step.icon}</span>
                    <span className={`text-xs font-bold ${c.num} font-display`}>
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-slate-800 text-base mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed px-2">
                    {step.desc}
                  </p>

                  {/* Arrow between steps (mobile only) */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden mt-4 text-slate-300">
                      <svg
                        className="w-6 h-6 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
