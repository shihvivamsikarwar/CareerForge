import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { resumeApi } from "../services/api";

// ─── Small reusable icons ─────────────────────────────────────────────────────
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
  upload: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  file: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  brain:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  lightbulb:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  chevronDown: "M19 9l-7 7-7-7",
};

// ─── Score ring component ─────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 54;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 85
      ? "#10b981" // emerald
      : score >= 70
      ? "#4f46e5" // brand-600
      : score >= 55
      ? "#f59e0b" // amber
      : score >= 40
      ? "#f97316" // orange
      : "#ef4444"; // red

  const label =
    score >= 85
      ? "Excellent"
      : score >= 70
      ? "Good"
      : score >= 55
      ? "Average"
      : score >= 40
      ? "Needs Work"
      : "Poor";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-slate-900">
            {score}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ color, background: `${color}18` }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Upload zone component ────────────────────────────────────────────────────
function UploadZone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(null);

  const ACCEPTED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      alert("Only PDF, DOC, and DOCX files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB.");
      return;
    }
    setSelected(file);
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const sizeLabel = selected
    ? selected.size < 1024 * 1024
      ? `${(selected.size / 1024).toFixed(1)} KB`
      : `${(selected.size / (1024 * 1024)).toFixed(1)} MB`
    : "";

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        !disabled && setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-4 transition-all duration-200 cursor-pointer
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${
          dragging
            ? "border-brand-400 bg-brand-50 scale-[1.01]"
            : selected
            ? "border-emerald-300 bg-emerald-50"
            : "border-slate-200 hover:border-brand-300 hover:bg-brand-50/40"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={disabled}
      />

      {selected ? (
        <>
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Icon d={ICONS.file} className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-800 text-sm truncate max-w-xs">
              {selected.name}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {sizeLabel} · Click to change
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <Icon d={ICONS.check} className="w-4 h-4" /> File ready to upload
          </div>
        </>
      ) : (
        <>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
            ${dragging ? "bg-brand-200" : "bg-brand-50"}`}
          >
            <Icon d={ICONS.upload} className="w-7 h-7 text-brand-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700">
              {dragging
                ? "Drop your resume here"
                : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, DOC, DOCX · Max 5 MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Result section card ──────────────────────────────────────────────────────
function ResultCard({ icon, iconBg, iconColor, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div
          className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon d={icon} className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="font-display font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── History item row ─────────────────────────────────────────────────────────
function HistoryRow({ resume, onSelect, isActive }) {
  const date = new Date(resume.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const scoreColor =
    resume.score >= 70
      ? "text-emerald-600 bg-emerald-50"
      : resume.score >= 50
      ? "text-amber-600 bg-amber-50"
      : "text-red-600 bg-red-50";

  return (
    <button
      onClick={() => onSelect(resume)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
        ${
          isActive ? "bg-brand-50 border border-brand-200" : "hover:bg-slate-50"
        }`}
    >
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon d={ICONS.file} className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">
          {resume.originalFileName}
        </p>
        <p className="text-xs text-slate-400">{date}</p>
      </div>
      <span
        className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${scoreColor}`}
      >
        {resume.score}
      </span>
    </button>
  );
}

// ─── Main Resume page ─────────────────────────────────────────────────────────
export default function Resume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // current displayed resume
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const resultRef = useRef(null);

  // Load latest resume on mount
  useEffect(() => {
    resumeApi
      .getLatest()
      .then((data) => setResult(data.resume))
      .catch(() => {}); // 404 is fine — user hasn't uploaded yet
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const data = await resumeApi.upload(file);
      setResult(data.resume);
      setFile(null);
      // Scroll to results smoothly
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100
      );
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLoadHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const data = await resumeApi.getMyResumes();
      setHistory(data.resumes || []);
      setShowHistory(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this resume analysis?")) return;
    try {
      await resumeApi.delete(id);
      if (result?.id === id) setResult(null);
      setHistory((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout
      pageTitle="Resume Analyzer"
      pageSubtitle="Upload your resume and get AI-powered insights in seconds"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Upload card ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
              <Icon d={ICONS.brain} className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-slate-800">
                Upload Your Resume
              </h2>
              <p className="text-xs text-slate-400">
                AI will extract skills, score it, and give you actionable
                feedback
              </p>
            </div>
          </div>

          <UploadZone onFile={setFile} disabled={uploading} />

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <Icon
                d={ICONS.x}
                className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3 items-center justify-between">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl
                hover:bg-brand-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-brand-500/25
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analysing with AI…
                </>
              ) : (
                <>
                  <Icon d={ICONS.brain} className="w-4 h-4" />
                  Analyse Resume
                </>
              )}
            </button>

            <button
              onClick={handleLoadHistory}
              disabled={loadingHistory}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600
                hover:bg-slate-100 rounded-xl transition-all"
            >
              {loadingHistory ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              ) : (
                <Icon d={ICONS.history} className="w-4 h-4" />
              )}
              {showHistory ? "Hide history" : "View history"}
              <Icon
                d={ICONS.chevronDown}
                className={`w-3.5 h-3.5 transition-transform ${
                  showHistory ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* History panel */}
          {showHistory && (
            <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5 max-h-60 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No previous resumes found.
                </p>
              ) : (
                history.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <HistoryRow
                        resume={r}
                        isActive={result?.id === r.id}
                        onSelect={(resume) => {
                          setResult(resume);
                          setShowHistory(false);
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete"
                    >
                      <Icon d={ICONS.trash} className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Results ────────────────────────────────────────────────────── */}
        {result && (
          <div ref={resultRef} className="space-y-5 animate-fade-up">
            {/* File banner */}
            <div className="flex items-center gap-3 px-5 py-3 bg-brand-50 border border-brand-100 rounded-2xl">
              <Icon
                d={ICONS.file}
                className="w-5 h-5 text-brand-500 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-800 truncate">
                  {result.originalFileName}
                </p>
                <p className="text-xs text-brand-500">
                  Analysed{" "}
                  {result.analyzedAt
                    ? new Date(result.analyzedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </p>
              </div>
              <span className="text-xs font-semibold text-brand-600 bg-brand-100 px-3 py-1 rounded-full capitalize flex-shrink-0">
                {result.fileType || "resume"}
              </span>
            </div>

            {/* Score + Summary row */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Score */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center gap-4">
                <h3 className="font-display font-semibold text-slate-800 text-sm">
                  Resume Score
                </h3>
                <ScoreRing score={result.score} />
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Based on skills, summary quality, content depth, and areas of
                  improvement
                </p>
              </div>

              {/* Summary */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                    <Icon d={ICONS.brain} className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="font-display font-semibold text-slate-800">
                    AI Summary
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {result.summary || "No summary generated."}
                </p>

                {/* Skill pills */}
                {result.skills?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Detected Skills ({result.skills.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Strengths, Weaknesses, Suggestions */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Strengths */}
              <ResultCard
                icon={ICONS.star}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                title="Strengths"
              >
                {result.strengths?.length > 0 ? (
                  <ul className="space-y-3">
                    {result.strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon
                            d={ICONS.check}
                            className="w-3 h-3 text-emerald-600"
                          />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">
                    No strengths identified.
                  </p>
                )}
              </ResultCard>

              {/* Weaknesses */}
              <ResultCard
                icon={ICONS.warning}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                title="Areas to Improve"
              >
                {result.weaknesses?.length > 0 ? (
                  <ul className="space-y-3">
                    {result.weaknesses.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon
                            d={ICONS.warning}
                            className="w-3 h-3 text-amber-600"
                          />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">
                    No weaknesses identified.
                  </p>
                )}
              </ResultCard>

              {/* Suggestions */}
              <ResultCard
                icon={ICONS.lightbulb}
                iconBg="bg-brand-50"
                iconColor="text-brand-600"
                title="AI Suggestions"
              >
                {result.suggestions?.length > 0 ? (
                  <ol className="space-y-3">
                    {result.suggestions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-400">
                    No suggestions generated.
                  </p>
                )}
              </ResultCard>
            </div>

            {/* Re-analyse CTA */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600
                  hover:bg-slate-100 rounded-xl transition-all"
              >
                <Icon d={ICONS.refresh} className="w-4 h-4" />
                Upload a new resume
              </button>
            </div>
          </div>
        )}

        {/* ── Empty state (no previous result) ──────────────────────────── */}
        {!result && !uploading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon d={ICONS.file} className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="font-display font-semibold text-slate-700 text-lg mb-2">
              No resume analysed yet
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Upload your PDF or Word resume above and our AI will score it,
              extract your skills, and give you personalised suggestions to
              stand out.
            </p>
          </div>
        )}

        {/* ── Processing overlay inside results area ─────────────────────── */}
        {uploading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-violet-600 rounded-full" />
              </div>
            </div>
            <p className="font-display font-semibold text-slate-800 text-lg">
              Analysing your resume…
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Extracting text, running AI analysis, calculating score
            </p>
            <div className="mt-5 flex justify-center gap-1.5">
              {[
                "Parsing file",
                "Extracting skills",
                "AI analysis",
                "Scoring",
              ].map((step, i) => (
                <span
                  key={step}
                  className="text-xs px-2.5 py-1 bg-brand-50 text-brand-600 rounded-full font-medium"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
