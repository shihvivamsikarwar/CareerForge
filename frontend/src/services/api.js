"use strict";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

/**
 * Core fetch wrapper
 * Logs backend details for easier debugging of 500 errors.
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
    // This will print the exact reason the backend crashed in your F12 console
    console.error(`🔥 Backend Error (${res.status}) at ${path}:`, data);
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

/**
 * multipartRequest
 * Handles binary file uploads for Resumes.
 */
async function multipartRequest(path, formData) {
  const token = localStorage.getItem("cf_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`🔥 Multipart Error (${res.status}) at ${path}:`, data);
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),
  googleLoginUrl: () => `${BASE_URL}/auth/google`,
};

// ─── Resume ──────────────────────────────────────────────────────────────────
export const resumeApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return multipartRequest("/resume/upload", formData);
  },
  getMyResumes: () => request("/resume/my-resumes"),
  getLatest: () => request("/resume/latest"),
  getById: (id) => request(`/resume/${id}`),
  delete: (id) => request(`/resume/${id}`, { method: "DELETE" }),
};

// ─── Career Guidance + Recommendations ───────────────────────────────────────
export const careerApi = {
  getGuidance: () => request("/career/guidance"),
  getRecommendations: (refresh = false) =>
    request(`/career/recommendations${refresh ? "?refresh=true" : ""}`),
  getSavedRoles: () => request("/career/recommendations/saved"),
  toggleSave: (roleId) =>
    request(`/career/recommendations/save/${roleId}`, { method: "PATCH" }),
};

// ─── Interview ───────────────────────────────────────────────────────────────
export const interviewApi = {
  getTypes: () => request("/interview/types"),
  start: (type, questionCount = null) =>
    request("/interview/start", {
      method: "POST",
      body: JSON.stringify({ type, ...(questionCount && { questionCount }) }),
    }),
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
  getHistory: (page = 1, limit = 10) =>
    request(`/interview/history?page=${page}&limit=${limit}`),
  getById: (id) => request(`/interview/${id}`),
  delete: (id) => request(`/interview/${id}`, { method: "DELETE" }),
};

// ─── Performance & Jobs ──────────────────────────────────────────────────────
export const performanceApi = {
  getSummary: () => request("/performance/summary"),
  getTypeBreakdown: () => request("/performance/type-breakdown"),
};

export const jobApi = {
  analyze: (jobDescription) =>
    request("/job/analyze", {
      method: "POST",
      body: JSON.stringify({ jobDescription }),
    }),
  getHistory: (page = 1, limit = 10) =>
    request(`/job/history?page=${page}&limit=${limit}`),
  getById: (id) => request(`/job/${id}`),
  delete: (id) => request(`/job/${id}`, { method: "DELETE" }),
};

// ─── Settings (Required by SettingsContext.jsx) ──────────────────────────────
export const settingsApi = {
  get: () => request("/auth/settings"),
  update: (patch) =>
    request("/auth/settings", { method: "PATCH", body: JSON.stringify(patch) }),
  changePassword: (payload) =>
    request("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updateProfile: (updates) =>
    request("/auth/update-profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  deleteAccount: (payload = {}) =>
    request("/auth/account", {
      method: "DELETE",
      body: JSON.stringify(payload),
    }),
};

export const tokenStorage = {
  get: () => localStorage.getItem("cf_token"),
  set: (token) => localStorage.setItem("cf_token", token),
  clear: () => localStorage.removeItem("cf_token"),
  exists: () => Boolean(localStorage.getItem("cf_token")),
};
