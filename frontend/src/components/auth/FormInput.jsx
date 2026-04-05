/**
 * Styled text/email/password input for auth forms.
 * Accepts all standard <input> props plus an optional `label` and `error`.
 */
export default function FormInput({ label, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400
            bg-slate-50 focus:bg-white outline-none transition-all duration-200
            ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            }`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
