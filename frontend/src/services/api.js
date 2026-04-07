const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Core fetch wrapper — throws a plain Error with the server's message
 * so callers can just catch and display err.message.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem("cf_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

/**
 * multipartRequest
 * ─────────────────
 * Like request() but does NOT set Content-Type — lets the browser set the
 * multipart/form-data boundary automatically when sending FormData.
 */
async function multipartRequest(path, formData) {
  const token = localStorage.getItem("cf_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // ⚠️  No Content-Type header — browser sets multipart boundary
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: ({ name, email, password }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request("/auth/me"),

  /** Full URL so the browser can do a hard redirect (OAuth flow). */
  googleLoginUrl: () => `${BASE_URL}/auth/google`,
};

// ─── Resume ──────────────────────────────────────────────────────────────────

export const resumeApi = {
  /**
   * Upload a resume file for AI analysis.
   * @param {File} file  - The PDF/DOC/DOCX file object from an <input type="file">
   */
  upload: (file) => {
    const formData = new FormData();
    formData.append("resume", file); // field name must match multer's upload.single('resume')
    return multipartRequest("/resume/upload", formData);
  },

  /** Fetch all resumes for the current user (newest first, max 10) */
  getMyResumes: () => request("/resume/my-resumes"),

  /** Fetch the most recent completed resume */
  getLatest: () => request("/resume/latest"),

  /** Fetch a single resume by ID */
  getById: (id) => request(`/resume/${id}`),

  /** Delete a resume by ID */
  delete: (id) => request(`/resume/${id}`, { method: "DELETE" }),
};

// ─── Interview ───────────────────────────────────────────────────────────────

export const interviewApi = {
  /** Fetch all available interview type metadata */
  getTypes: () => request("/interview/types"),

  /**
   * Start a new interview session.
   * @param {string} type  - Interview type id (e.g. 'react', 'hr')
   */
  start: (type) =>
    request("/interview/start", {
      method: "POST",
      body: JSON.stringify({ type }),
    }),

  /**
   * Submit answers for AI evaluation.
   * @param {string}   interviewId     - ID from startInterview response
   * @param {string[]} answers         - Answers in same order as questions
   * @param {number}   durationSeconds - Optional session duration
   * @param {object}   integrityReport - Anti-cheating data collected during session
   */
  submit: (
    interviewId,
    answers,
    durationSeconds = null,
    integrityReport = null
  ) =>
    request("/interview/submit", {
      method: "POST",
      body: JSON.stringify({
        interviewId,
        answers,
        durationSeconds,
        integrityReport,
      }),
    }),

  /** Paginated interview history */
  getHistory: (page = 1, limit = 10) =>
    request(`/interview/history?page=${page}&limit=${limit}`),

  /** Single interview result by ID */
  getById: (id) => request(`/interview/${id}`),

  /** Delete an interview record */
  delete: (id) => request(`/interview/${id}`, { method: "DELETE" }),
};

// ─── Performance ─────────────────────────────────────────────────────────────

export const performanceApi = {
  /** Get performance summary with trends, insights, and history */
  getSummary: () => request("/performance/summary"),
};

// ─── Job Analyzer ───────────────────────────────────────────────────────────

export const jobAnalyzerApi = {
  /** Analyze job description against user's resume */
  analyze: (jobDescription) =>
    request("/job-analyzer/analyze", {
      method: "POST",
      body: JSON.stringify({ jobDescription }),
    }),

  /** Get user's job analysis history */
  getHistory: () => request("/job-analyzer/history"),

  /** Get specific job analysis by ID */
  getById: (id) => request(`/job-analyzer/${id}`),
};

// Job Recommendation API
export const jobApi = {
  /** Analyze job description against user profile */
  analyze: (jobDescription) =>
    request("/job/analyze", {
      method: "POST",
      body: JSON.stringify({ jobDescription }),
    }),

  /** Get job recommendations based on user profile */
  getRecommendations: () => request("/job/recommendations"),

  /** Get current job market data */
  getMarketData: () => request("/job/market-data"),
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
  get: () => localStorage.getItem("cf_token"),
  set: (token) => localStorage.setItem("cf_token", token),
  clear: () => localStorage.removeItem("cf_token"),
  exists: () => Boolean(localStorage.getItem("cf_token")),
};
