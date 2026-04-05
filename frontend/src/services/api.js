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

// ─── Auth ───────────────────────────────────────────────────────────────────

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

// ─── Token helpers ──────────────────────────────────────────────────────────

export const tokenStorage = {
  get: () => localStorage.getItem("cf_token"),
  set: (token) => localStorage.setItem("cf_token", token),
  clear: () => localStorage.removeItem("cf_token"),
  exists: () => Boolean(localStorage.getItem("cf_token")),
};
