const testimonials = [
  {
    name: "Priya Nair",
    role: "Software Engineer @ Google",
    avatar: "PN",
    avatarColor: "from-brand-400 to-violet-500",
    rating: 5,
    content:
      "CareerForge was a game-changer for my Google interview prep. The AI mock interviews were incredibly realistic and the feedback was spot-on. I went from failing system design rounds to acing them in 3 weeks.",
    tag: "Got the offer 🎉",
  },
  {
    name: "Rahul Mehta",
    role: "Product Manager @ Flipkart",
    avatar: "RM",
    avatarColor: "from-emerald-400 to-teal-500",
    rating: 5,
    content:
      "The Job Description Analyzer is pure gold. I was applying blindly before — now I know exactly what gaps to fill before submitting. My response rate jumped from 5% to 35% after optimizing my resume with CareerForge.",
    tag: "7x response rate 📈",
  },
  {
    name: "Ananya Sharma",
    role: "Data Analyst @ Razorpay",
    avatar: "AS",
    avatarColor: "from-amber-400 to-orange-500",
    rating: 5,
    content:
      "As a fresher, I had no idea how to prepare. CareerForge's career roadmap told me exactly what to learn, in what order. The performance tracking kept me motivated. Landed my first job within 2 months!",
    tag: "First job in 2 months 🚀",
  },
];

const StarIcon = () => (
  <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const QuoteIcon = () => (
  <svg
    className="w-8 h-8 text-brand-200"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

export default function Testimonials() {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-tag">
            <span>💬</span> Success Stories
          </span>
          <h2 className="section-title">
            Loved by thousands of{" "}
            <span className="gradient-text">career achievers</span>
          </h2>
          <p className="section-sub">
            Real results from real people. See what CareerForge users say after
            landing their dream roles.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-14 text-center">
          {[
            { value: "10,000+", label: "Users Trained" },
            { value: "4.9/5", label: "Average Rating" },
            { value: "87%", label: "Interview Success" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 bg-brand-50 rounded-2xl border border-brand-100"
            >
              <p className="text-2xl font-display font-bold text-brand-700">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Quote mark */}
              <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-60 transition-opacity">
                <QuoteIcon />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                "{t.content}"
              </p>

              {/* Tag */}
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-100">
                  {t.tag}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
