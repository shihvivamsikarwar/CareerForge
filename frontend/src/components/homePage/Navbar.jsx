import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BoltIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L10 22l9.91-10.96A1 1 0 0019 9.5h-5.5L13 2z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:shadow-brand-400/40 transition-shadow">
              <BoltIcon />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Career<span className="gradient-text">Forge</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-brand-600 px-4 py-2 rounded-lg hover:bg-brand-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">
              Sign Up Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-4 py-2.5 text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl font-medium transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-2">
            <Link
              to="/login"
              className="text-center py-2.5 text-slate-700 font-semibold hover:text-brand-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary justify-center text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
