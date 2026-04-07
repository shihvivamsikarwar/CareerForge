import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { interviewApi } from "../services/api";

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
  mic: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  plus: "M12 4v16m8-8H4",
  left: "M15 19l-7-7 7-7",
  right: "M9 5l7 7-7 7",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

const SCORE_STYLE = (score) =>
  score >= 8
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : score >= 6
    ? "text-brand-700 bg-brand-50 border-brand-200"
    : score >= 4
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";

const STATUS_STYLE = {
  evaluated: "text-emerald-600 bg-emerald-50",
  submitted: "text-amber-600 bg-amber-50",
  in_progress: "text-brand-600 bg-brand-50",
  failed: "text-red-600 bg-red-50",
};

const STATUS_LABEL = {
  evaluated: "Evaluated",
  submitted: "Pending",
  in_progress: "In Progress",
  failed: "Failed",
};

export default function InterviewHistory() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const load = (p = 1) => {
    setLoading(true);
    setError("");
    interviewApi
      .getHistory(p, 10)
      .then((data) => {
        setInterviews(data.interviews || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setPage(p);
      })
      .catch((err) => setError(err.message || "Failed to load history."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this interview record?")) return;
    setDeleting(id);
    try {
      await interviewApi.delete(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatDuration = (s) => (s ? `${Math.floor(s / 60)}m ${s % 60}s` : "—");

  return (
    <DashboardLayout
      pageTitle="Interview History"
      pageSubtitle={`${total} interview${total !== 1 ? "s" : ""} completed`}
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {total > 0
              ? `Showing ${interviews.length} of ${total} interviews`
              : "No interviews yet"}
          </p>
          <button
            onClick={() => navigate("/interviews")}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold
              rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-500/20"
          >
            <Icon d={ICONS.plus} className="w-4 h-4" /> New Interview
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && interviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon d={ICONS.mic} className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="font-display font-semibold text-slate-700 text-lg mb-2">
              No interviews yet
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Start your first mock interview to get AI-powered feedback on your
              answers.
            </p>
            <button
              onClick={() => navigate("/interviews")}
              className="btn-primary text-sm"
            >
              Start First Interview
            </button>
          </div>
        )}

        {/* Interview list */}
        {!loading && interviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                {/* Type icon */}
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                  {interview.type === "react"
                    ? "⚛️"
                    : interview.type === "node"
                    ? "🟢"
                    : interview.type === "hr"
                    ? "🤝"
                    : interview.type === "dsa"
                    ? "📊"
                    : interview.type === "python"
                    ? "🐍"
                    : interview.type === "mixed"
                    ? "🎯"
                    : interview.type === "behavioral"
                    ? "🧠"
                    : "⚙️"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {interview.title}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_STYLE[interview.status] || ""
                      }`}
                    >
                      {STATUS_LABEL[interview.status] || interview.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Icon d={ICONS.clock} className="w-3 h-3" />
                      {formatDate(interview.createdAt)}
                    </span>
                    {interview.durationSeconds && (
                      <span className="text-xs text-slate-400">
                        ⏱ {formatDuration(interview.durationSeconds)}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {interview.qa?.filter((q) => q.answer?.trim()).length ||
                        0}
                      /{interview.qa?.length || 0} answered
                    </span>
                  </div>
                </div>

                {/* Score badge */}
                {interview.score !== null &&
                  interview.score !== undefined &&
                  interview.status === "evaluated" && (
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-sm font-bold flex-shrink-0 ${SCORE_STYLE(
                        interview.score
                      )}`}
                    >
                      {interview.score}/10
                    </div>
                  )}

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {interview.status === "evaluated" && (
                    <button
                      onClick={() =>
                        navigate(`/interviews/result/${interview.id}`)
                      }
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View result"
                    >
                      <Icon d={ICONS.eye} className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(interview.id)}
                    disabled={deleting === interview.id}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    {deleting === interview.id ? (
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                    ) : (
                      <Icon d={ICONS.trash} className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => load(page - 1)}
              disabled={page === 1 || loading}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              <Icon d={ICONS.left} className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => load(page + 1)}
              disabled={page === totalPages || loading}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              <Icon d={ICONS.right} className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
