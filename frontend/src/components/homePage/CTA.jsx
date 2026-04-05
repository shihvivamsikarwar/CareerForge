import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/25 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-semibold rounded-full border border-white/20 mb-6">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Free to start — no credit card required
        </span>

        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
          Start Your Career Journey
          <br />
          <span className="text-brand-300">Today</span>
        </h2>

        <p className="text-lg text-slate-300 mt-5 max-w-xl mx-auto">
          Join 10,000+ professionals who transformed their career with
          CareerForge. Your next opportunity is one preparation away.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 active:scale-95 transition-all shadow-xl shadow-black/20 text-base"
          >
            🚀 Get Started Free
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 active:scale-95 transition-all text-base backdrop-blur-sm"
          >
            📝 Create Resume
          </Link>
        </div>

        {/* Trust items */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          {[
            "✓ No credit card needed",
            "✓ Free forever plan",
            "✓ Cancel anytime",
            "✓ 10,000+ users trust us",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
