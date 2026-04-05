import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const errorMessages = {
  google_failed: "Google sign-in was cancelled or failed. Please try again.",
  token_failed:
    "Could not create a session after Google sign-in. Please try again.",
};

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const errorCode = searchParams.get("error");

    // Google OAuth failure — backend redirected here with ?error=...
    if (errorCode) {
      setError(
        errorMessages[errorCode] || "Authentication failed. Please try again."
      );
      return;
    }

    if (!token) {
      setError("No authentication token received. Please try again.");
      return;
    }

    loginWithToken(token)
      .then(() => navigate("/dashboard", { replace: true }))
      .catch(() =>
        setError("Authentication failed. The token may be invalid or expired.")
      );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-violet-600 rounded-full" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-slate-800 text-lg">
            Signing you in…
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Completing Google authentication
          </p>
        </div>
      </div>
    </div>
  );
}
