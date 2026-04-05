import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import FormInput from "../components/auth/FormInput";
import GoogleButton from "../components/auth/GoogleButton";
import { useAuth } from "../context/AuthContext";

const EyeIcon = ({ open }) =>
  open ? (
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ) : (
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
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );

const StrengthBar = ({ password }) => {
  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = {
      1: { label: "Weak", color: "bg-red-400" },
      2: { label: "Fair", color: "bg-amber-400" },
      3: { label: "Good", color: "bg-blue-400" },
      4: { label: "Strong", color: "bg-emerald-500" },
    };
    return { score, ...map[score] };
  };

  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i <= score ? color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs font-medium ${
          score <= 1
            ? "text-red-500"
            : score === 2
            ? "text-amber-500"
            : score === 3
            ? "text-blue-500"
            : "text-emerald-600"
        }`}
      >
        {label} password
      </p>
    </div>
  );
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    else if (form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account 🚀"
      subtitle="Start your AI-powered career journey for free"
    >
      {/* Google OAuth */}
      <GoogleButton label="Sign up with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">
          or register with email
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* API-level error */}
      {apiError && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
          <svg
            className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput
          label="Full Name"
          id="name"
          type="text"
          name="name"
          placeholder="Aryan Sharma"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
        />

        <FormInput
          label="Email address"
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        {/* Password with strength meter */}
        <div>
          <div className="relative">
            <FormInput
              label="Password"
              id="password"
              type={showPw ? "text" : "password"}
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          <StrengthBar password={form.password} />
        </div>

        {/* Terms */}
        <p className="text-xs text-slate-400 pt-1">
          By creating an account you agree to our{" "}
          <a href="#" className="text-brand-500 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-brand-500 hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 
            active:scale-[0.98] transition-all duration-200 shadow-lg shadow-brand-500/25
            disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account →"
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
