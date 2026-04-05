import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
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

const oauthErrorMessages = {
  google_failed: "Google sign-in was cancelled or failed. Please try again.",
  token_failed:
    "Could not create a session after Google sign-in. Please try again.",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  // Surface any Google OAuth error passed back via query param
  const oauthError = searchParams.get("error");

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(
    oauthError ? oauthErrorMessages[oauthError] || "Google sign-in failed." : ""
  );
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
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back 👋"
      subtitle="Sign in to continue your career journey"
    >
      {/* Google OAuth */}
      <GoogleButton label="Continue with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">
          or sign in with email
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Error banner — covers both API errors and OAuth redirects */}
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

        <div className="relative">
          <FormInput
            label="Password"
            id="password"
            type={showPw ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
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

        <div className="text-right">
          <a
            href="#"
            className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700
            active:scale-[0.98] transition-all duration-200 shadow-lg shadow-brand-500/25
            disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In →"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
        >
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
}
