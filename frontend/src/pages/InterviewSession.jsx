import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { interviewApi } from "../services/api";
import useAntiCheating from "../hooks/useAntiCheating";
import { useSettings } from "../context/SettingsContext";

const INTERVIEW_DURATION_SECONDS = 45 * 60;
const WARNING_THRESHOLD = 3;
const INACTIVITY_TIMEOUT = 120;

const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const ICONS = {
  chevronLeft: "M15 19l-7-7 7-7",
  chevronRight: "M9 5l7 7-7 7",
  check: "M5 13l4 4L19 7",
  send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  shield:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  shieldX:
    "M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01",
  expand:
    "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  x: "M6 18L18 6M6 6l12 12",
};

function useCountdown(totalSeconds, onExpire) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1 && !expiredRef.current) {
          expiredRef.current = true;
          clearInterval(id);
          onExpire?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const elapsed = totalSeconds - remaining;
  const fmt = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sc = (s % 60).toString().padStart(2, "0");
    return `${m}:${sc}`;
  };
  return {
    remaining,
    elapsed,
    formatted: fmt(remaining),
    isLow: remaining < 300,
  };
}

function WarningPopup({
  event,
  totalWarnings,
  isCritical,
  onDismiss,
  warningThreshold,
}) {
  if (!event) return null;
  const label =
    {
      tab_switch: "⚠️ Tab Switch Detected",
      paste_attempt: "🚫 Paste Blocked",
      copy_attempt: "📋 Copy Detected",
      right_click: "🖱️ Right-Click Blocked",
      fullscreen_exit: "🖥️ Fullscreen Exited",
      inactivity: "💤 Inactivity Detected",
    }[event.type] || "⚠️ Suspicious Activity";
  const message =
    {
      tab_switch: "Switching tabs during an interview is not allowed.",
      paste_attempt:
        "Pasting external content is not permitted. All answers must be your own.",
      copy_attempt: "Copying content during the interview has been logged.",
      right_click: "Right-clicking is disabled during the interview.",
      fullscreen_exit:
        "Please remain in fullscreen mode for the duration of the interview.",
      inactivity: "Extended inactivity has been detected and flagged.",
    }[event.type] || "A suspicious activity was detected and has been logged.";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 px-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-2xl shadow-2xl border p-5 animate-fade-up
        ${
          isCritical
            ? "bg-red-50 border-red-300"
            : "bg-amber-50 border-amber-300"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isCritical ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            <Icon
              d={ICONS.shieldX}
              className={`w-5 h-5 ${
                isCritical ? "text-red-600" : "text-amber-600"
              }`}
            />
          </div>
          <div className="flex-1">
            <p
              className={`font-display font-bold text-base ${
                isCritical ? "text-red-800" : "text-amber-800"
              }`}
            >
              {label}
            </p>
            <p
              className={`text-sm mt-1 ${
                isCritical ? "text-red-700" : "text-amber-700"
              }`}
            >
              {message}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: warningThreshold }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < totalWarnings
                        ? isCritical
                          ? "bg-red-500"
                          : "bg-amber-500"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isCritical ? "text-red-700" : "text-amber-700"
                }`}
              >
                Warning {Math.min(totalWarnings, warningThreshold)}/
                {warningThreshold}
              </span>
            </div>
            {isCritical && (
              <p className="mt-2 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg">
                🚨 This interview may be marked as suspicious upon submission.
              </p>
            )}
          </div>
          <button
            onClick={onDismiss}
            className={`p-1.5 rounded-lg hover:bg-black/5 flex-shrink-0 ${
              isCritical ? "text-red-500" : "text-amber-500"
            }`}
          >
            <Icon d={ICONS.x} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function IntegrityBadge({ totalWarnings, isCritical }) {
  if (totalWarnings === 0) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
        <Icon d={ICONS.shield} className="w-3.5 h-3.5" /> Clean
      </div>
    );
  }
  return (
    <div
      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold
      ${
        isCritical
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      <Icon d={ICONS.shieldX} className="w-3.5 h-3.5" />
      {totalWarnings} {totalWarnings === 1 ? "warning" : "warnings"}
    </div>
  );
}

export default function InterviewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef(null);
  const interview = location.state?.interview;

  // ── Read live settings from context ────────────────────────────────────
  const { settings } = useSettings();
  const INTERVIEW_DURATION_SECONDS =
    (settings.interview.timerMinutes || 45) * 60;
  const WARNING_THRESHOLD = settings.interview.warningThreshold || 3;
  const INACTIVITY_TIMEOUT = settings.interview.inactivityTimeout || 120;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(() =>
    interview?.qa ? interview.qa.map(() => "") : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    integrity,
    totalWarnings,
    isCritical,
    lastEvent,
    isFullscreen,
    requestFullscreen,
    getIntegrityReport,
    dismissLastEvent,
  } = useAntiCheating({
    warningThreshold: WARNING_THRESHOLD,
    inactivityTimeout: INACTIVITY_TIMEOUT,
    enabled: !submitting && !!interview,
  });

  const {
    remaining,
    elapsed,
    formatted: timerFormatted,
    isLow,
  } = useCountdown(INTERVIEW_DURATION_SECONDS, () => {
    if (!submitting) handleSubmit(true);
  });

  useEffect(() => {
    if (!interview) navigate("/interviews", { replace: true });
  }, [interview, navigate]);
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [currentIdx]);

  if (!interview) return null;

  const questions = interview.qa || [];
  const total = questions.length;
  const answered = answers.filter((a) => a.trim().length > 0).length;
  const progress = Math.round((answered / total) * 100);
  const current = questions[currentIdx];

  const handleAnswer = (val) =>
    setAnswers((prev) => {
      const n = [...prev];
      n[currentIdx] = val;
      return n;
    });
  const goTo = (idx) => {
    if (idx >= 0 && idx < total) setCurrentIdx(idx);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    setShowConfirm(false);
    setSubmitting(true);
    setError("");
    const integrityReport = getIntegrityReport();
    try {
      const data = await interviewApi.submit(
        interview.id,
        answers,
        elapsed,
        integrityReport
      );
      navigate("/interviews/result", {
        state: { interview: data.interview },
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const unanswered = answers.reduce((acc, a, i) => {
    if (!a.trim()) acc.push(i + 1);
    return acc;
  }, []);

  return (
    <DashboardLayout
      pageTitle={interview.title || "Mock Interview"}
      pageSubtitle={`Q${
        currentIdx + 1
      }/${total} · ${answered}/${total} answered`}
    >
      <WarningPopup
        event={lastEvent}
        totalWarnings={totalWarnings}
        isCritical={isCritical}
        onDismiss={dismissLastEvent}
        warningThreshold={WARNING_THRESHOLD}
      />

      {submitting && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-5">
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-full" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-slate-900 text-xl">
              Evaluating your interview…
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Our AI is analysing all your answers. This may take 20–30 seconds.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center max-w-sm">
            {[
              "Reading answers",
              "Scoring responses",
              "Generating feedback",
              "Compiling integrity report",
            ].map((s) => (
              <span
                key={s}
                className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-lg">
              Submit Interview?
            </h3>
            {unanswered.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Icon
                  d={ICONS.warning}
                  className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-amber-700">
                  Q{unanswered.join(", Q")}{" "}
                  {unanswered.length === 1 ? "is" : "are"} unanswered — will
                  score 0.
                </p>
              </div>
            )}
            {totalWarnings > 0 && (
              <div
                className={`flex items-start gap-2 p-3 border rounded-xl ${
                  isCritical
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <Icon
                  d={ICONS.shieldX}
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    isCritical ? "text-red-500" : "text-amber-500"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isCritical ? "text-red-700" : "text-amber-700"
                  }`}
                >
                  {totalWarnings} integrity{" "}
                  {totalWarnings === 1 ? "warning" : "warnings"} will be
                  included in your report.
                  {isCritical && " This session may be flagged as suspicious."}
                </p>
              </div>
            )}
            {unanswered.length === 0 && totalWarnings === 0 && (
              <p className="text-sm text-slate-500">
                All {total} questions answered. Ready to submit?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm"
              >
                Review Answers
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className={`flex-1 py-2.5 text-white font-semibold rounded-xl text-sm ${
                  isCritical
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-brand-600 hover:bg-brand-700"
                }`}
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Status bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-mono font-bold ${
                isLow
                  ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <Icon
                d={ICONS.clock}
                className={`w-4 h-4 ${
                  isLow ? "text-red-500" : "text-slate-400"
                }`}
              />
              {timerFormatted}
              {isLow && (
                <span className="text-xs font-semibold text-red-500 ml-1">
                  LOW
                </span>
              )}
            </div>
            <span className="text-sm text-slate-500 font-medium">
              {answered}/{total} answered
            </span>
            <IntegrityBadge
              totalWarnings={totalWarnings}
              isCritical={isCritical}
            />
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex gap-1.5 flex-wrap items-center">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={`Q${i + 1}${answers[i]?.trim() ? " ✓" : ""}`}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  i === currentIdx
                    ? "bg-brand-600 text-white shadow-sm"
                    : answers[i]?.trim()
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={requestFullscreen}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg border border-slate-200 transition-colors"
            >
              <Icon d={ICONS.expand} className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isFullscreen ? "Fullscreen ✓" : "Fullscreen"}
              </span>
            </button>
          </div>
        </div>

        {/* Integrity summary bar */}
        {totalWarnings > 0 && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
              isCritical
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <Icon d={ICONS.shieldX} className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
              {integrity.tabSwitches > 0 && (
                <span>
                  Tab switches: <strong>{integrity.tabSwitches}</strong>
                </span>
              )}
              {integrity.pasteAttempts > 0 && (
                <span>
                  Paste attempts: <strong>{integrity.pasteAttempts}</strong>
                </span>
              )}
              {integrity.copyAttempts > 0 && (
                <span>
                  Copy attempts: <strong>{integrity.copyAttempts}</strong>
                </span>
              )}
              {integrity.fullscreenExits > 0 && (
                <span>
                  Fullscreen exits: <strong>{integrity.fullscreenExits}</strong>
                </span>
              )}
              {integrity.inactivityFlags > 0 && (
                <span>
                  Inactivity flags: <strong>{integrity.inactivityFlags}</strong>
                </span>
              )}
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isCritical
                  ? "bg-red-200 text-red-800"
                  : "bg-amber-200 text-amber-800"
              }`}
            >
              {totalWarnings} warning{totalWarnings !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                Q{currentIdx + 1} / {total}
              </span>
              {answers[currentIdx]?.trim() && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Icon d={ICONS.check} className="w-3 h-3" /> Answered
                </span>
              )}
            </div>
            <p className="text-base sm:text-lg font-display font-semibold text-slate-800 leading-relaxed select-none">
              {current?.question}
            </p>
          </div>
          <div className="p-5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Your Answer
            </label>
            <textarea
              ref={textareaRef}
              value={answers[currentIdx] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here… Be specific and use examples where possible. Aim for 3–5 sentences."
              rows={7}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all duration-200 resize-none"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {(answers[currentIdx] || "").length} characters
                {(answers[currentIdx] || "").length < 80 &&
                  (answers[currentIdx] || "").length > 0 && (
                    <span className="text-amber-500 ml-1">
                      · Write more for a better score
                    </span>
                  )}
              </p>
              {answers[currentIdx]?.trim() && (
                <button
                  onClick={() => handleAnswer("")}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="px-5 pb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => goTo(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Icon d={ICONS.chevronLeft} className="w-4 h-4" /> Previous
            </button>
            {currentIdx < total - 1 ? (
              <button
                onClick={() => goTo(currentIdx + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-500/20"
              >
                Next <Icon d={ICONS.chevronRight} className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-brand-700 hover:to-violet-700 active:scale-[0.98] transition-all shadow-md"
              >
                <Icon d={ICONS.send} className="w-4 h-4" /> Submit Interview
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <Icon
              d={ICONS.warning}
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-2xl p-4 text-white">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Icon d={ICONS.eye} className="w-3.5 h-3.5" /> Integrity Rules
            </p>
            <ul className="space-y-1.5">
              {[
                "Tab switching is monitored and logged",
                "Pasting from external sources is blocked",
                "Right-click menu is disabled",
                "Inactivity periods are flagged",
                "All violations are sent with your report",
              ].map((r) => (
                <li
                  key={r}
                  className="text-xs text-slate-300 flex items-start gap-1.5"
                >
                  <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{" "}
                  {r}
                </li>
              ))}
            </ul>
          </div>
          {settings.interview.showTips && (
            <div className="bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-brand-700 mb-2.5">
                💡 Tips for better answers
              </p>
              <ul className="space-y-1.5">
                {[
                  "Use STAR method: Situation, Task, Action, Result",
                  "Include specific examples from real projects",
                  'For technical Qs, explain the "why" not just "what"',
                  "Aim for 3–5 sentences per answer",
                ].map((t) => (
                  <li
                    key={t}
                    className="text-xs text-slate-600 flex items-start gap-1.5"
                  >
                    <span className="text-brand-400 mt-0.5 flex-shrink-0">
                      •
                    </span>{" "}
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
