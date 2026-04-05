import { Link } from "react-router-dom";

const BoltIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L10 22l9.91-10.96A1 1 0 0019 9.5h-5.5L13 2z" />
  </svg>
);

/**
 * Centered card layout shared by Login and Register.
 * Keeps brand identity consistent with the landing page.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/40 to-violet-50/30 flex flex-col">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Mini navbar */}
      <header className="relative z-10 w-full px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:shadow-brand-400/40 transition-shadow">
            <BoltIcon />
          </div>
          <span className="font-display font-bold text-xl text-slate-900">
            Career
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-violet-600">
              Forge
            </span>
          </span>
        </Link>
      </header>

      {/* Auth card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-500 via-violet-500 to-brand-400" />

            <div className="px-8 py-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-display font-bold text-slate-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-slate-500 text-sm mt-2">{subtitle}</p>
                )}
              </div>

              {children}
            </div>
          </div>

          {/* Back to landing */}
          <p className="text-center text-xs text-slate-400 mt-6">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              ← Back to CareerForge
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
