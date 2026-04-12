import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { settingsApi } from "../services/api";

// ─── Icon helper ──────────────────────────────────────────────────────────────
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
const I = {
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  mic: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  shield:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  monitor:
    "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  brain:
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  check: "M5 13l4 4L19 7",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  key: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
};

// ─── Reusable building blocks ─────────────────────────────────────────────────

function SectionCard({ icon, iconBg, iconColor, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div
          className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
        >
          <Icon d={icon} className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-slate-800 text-sm">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <div className="sm:w-52 flex-shrink-0">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {hint && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {hint}
          </p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 cursor-pointer
        ${checked ? "bg-brand-600" : "bg-slate-200"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200
        ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function NumberInput({ value, onChange, min, max, step = 1, suffix = "" }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-center font-semibold"
      />
      {suffix && (
        <span className="text-xs text-slate-400 font-medium">{suffix}</span>
      )}
    </div>
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none font-medium text-slate-700"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SaveBar({ saving, saved, error, onSave }) {
  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {saved && !error && (
        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
          <Icon d={I.check} className="w-3.5 h-3.5" /> Saved
        </span>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
      >
        {saving ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
            Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, save, reset, loading: settingsLoading } = useSettings();

  // ── Active tab ────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("profile");

  // ── Local draft state (mirrors settings until Save is clicked) ─────────────
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // ── Profile form ──────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErr, setProfileErr] = useState("");

  // ── Password form ─────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwErr, setPwErr] = useState("");

  // ── Delete account ────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePw, setDeletePw] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  // Seed draft from live settings
  useEffect(() => {
    if (settings) setDraft(JSON.parse(JSON.stringify(settings)));
  }, [settings]);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user]);

  if (!draft) {
    return (
      <DashboardLayout pageTitle="Settings">
        <div className="flex items-center justify-center min-h-64">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setDraftField = (group, key, val) =>
    setDraft((prev) => ({ ...prev, [group]: { ...prev[group], [key]: val } }));

  const flash = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  // ── Save handlers ──────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveErr("");
    try {
      await save(draft);
      flash(setSaved);
    } catch (err) {
      setSaveErr(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim() || profileName.trim().length < 2) {
      return setProfileErr("Name must be at least 2 characters.");
    }
    setProfileSaving(true);
    setProfileErr("");
    try {
      await settingsApi.updateProfile({ name: profileName.trim() });
      flash(setProfileSaved);
    } catch (err) {
      setProfileErr(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwErr("");
    if (!currentPw) return setPwErr("Current password is required.");
    if (newPw.length < 6)
      return setPwErr("New password must be at least 6 characters.");
    if (!/\d/.test(newPw))
      return setPwErr("New password must contain at least one number.");
    if (newPw !== confirmPw) return setPwErr("New passwords do not match.");
    setPwSaving(true);
    try {
      await settingsApi.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      flash(setPwSaved);
    } catch (err) {
      setPwErr(err.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE")
      return setDeleteErr("Type DELETE exactly to confirm.");
    setDeleting(true);
    setDeleteErr("");
    try {
      await settingsApi.deleteAccount({ password: deletePw || undefined });
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteErr(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all settings to defaults?")) return;
    try {
      await reset();
    } catch {}
  };

  // ─────────────────────────────────────────────────────────────────────────
  const TABS = [
    { key: "profile", label: "Profile", icon: I.user },
    { key: "interview", label: "Interview", icon: I.mic },
    { key: "notifications", label: "Notifications", icon: I.bell },
    { key: "privacy", label: "Privacy", icon: I.shield },
    { key: "display", label: "Display", icon: I.monitor },
    { key: "ai", label: "AI", icon: I.brain },
    { key: "danger", label: "Danger Zone", icon: I.trash },
  ];

  return (
    <DashboardLayout
      pageTitle="Settings"
      pageSubtitle="Manage your account and application preferences"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar tabs ───────────────────────────────────────────────── */}
          <nav className="lg:w-48 flex-shrink-0">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {TABS.map((t) => (
                <li key={t.key} className="flex-shrink-0 lg:flex-shrink">
                  <button
                    onClick={() => setTab(t.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap
                      ${
                        tab === t.key
                          ? t.key === "danger"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                          : t.key === "danger"
                          ? "text-red-500 hover:bg-red-50 hover:text-red-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                  >
                    <Icon d={t.icon} className="w-4 h-4 flex-shrink-0" />
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Content panels ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* ══ PROFILE ══════════════════════════════════════════════════ */}
            {tab === "profile" && (
              <SectionCard
                icon={I.user}
                iconBg="bg-brand-50"
                iconColor="text-brand-600"
                title="Profile"
                subtitle="Update your name and account information"
              >
                <FieldRow label="Display Name" hint="Shown across the app">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setProfileErr("");
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                    maxLength={60}
                  />
                </FieldRow>
                <FieldRow label="Email Address" hint="Cannot be changed">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
                  />
                </FieldRow>
                <FieldRow label="Account Type">
                  <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                    {user?.googleId
                      ? "🔵 Google Account"
                      : "📧 Email & Password"}
                  </span>
                </FieldRow>
                <FieldRow label="Member Since">
                  <span className="text-sm text-slate-500">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </FieldRow>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {profileErr && (
                    <p className="text-xs text-red-600 font-medium">
                      {profileErr}
                    </p>
                  )}
                  {profileSaved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <Icon d={I.check} className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                  <div className="ml-auto">
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                    >
                      {profileSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                          Saving…
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ══ PASSWORD ══════════════════════════════════════════════════ */}
            {tab === "profile" && !user?.googleId && (
              <SectionCard
                icon={I.key}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                title="Change Password"
                subtitle="Minimum 6 characters, must include a number"
              >
                <FieldRow label="Current Password">
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => {
                      setCurrentPw(e.target.value);
                      setPwErr("");
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </FieldRow>
                <FieldRow label="New Password">
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => {
                      setNewPw(e.target.value);
                      setPwErr("");
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </FieldRow>
                <FieldRow label="Confirm New Password">
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => {
                      setConfirmPw(e.target.value);
                      setPwErr("");
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </FieldRow>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {pwErr && (
                    <p className="text-xs text-red-600 font-medium">{pwErr}</p>
                  )}
                  {pwSaved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <Icon d={I.check} className="w-3.5 h-3.5" /> Password
                      changed
                    </span>
                  )}
                  <div className="ml-auto">
                    <button
                      onClick={handleChangePassword}
                      disabled={pwSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
                    >
                      {pwSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                          Saving…
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ══ INTERVIEW ════════════════════════════════════════════════ */}
            {tab === "interview" && (
              <SectionCard
                icon={I.mic}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                title="Interview Settings"
                subtitle="These values apply to every new interview session you start"
              >
                <FieldRow
                  label="Questions per session"
                  hint="How many questions are shown per session (3–15)"
                >
                  <NumberInput
                    value={draft.interview.questionCount}
                    onChange={(v) =>
                      setDraftField(
                        "interview",
                        "questionCount",
                        Math.max(3, Math.min(15, v))
                      )
                    }
                    min={3}
                    max={15}
                    suffix="questions"
                  />
                </FieldRow>
                <FieldRow
                  label="Timer duration"
                  hint="Total time allowed per session (10–120 min)"
                >
                  <NumberInput
                    value={draft.interview.timerMinutes}
                    onChange={(v) =>
                      setDraftField(
                        "interview",
                        "timerMinutes",
                        Math.max(10, Math.min(120, v))
                      )
                    }
                    min={10}
                    max={120}
                    suffix="minutes"
                  />
                </FieldRow>
                <FieldRow
                  label="Inactivity timeout"
                  hint="Seconds of no typing/mouse before flagging (30–300 s)"
                >
                  <NumberInput
                    value={draft.interview.inactivityTimeout}
                    onChange={(v) =>
                      setDraftField(
                        "interview",
                        "inactivityTimeout",
                        Math.max(30, Math.min(300, v))
                      )
                    }
                    min={30}
                    max={300}
                    step={10}
                    suffix="seconds"
                  />
                </FieldRow>
                <FieldRow
                  label="Warning threshold"
                  hint="Integrity warnings before the session is flagged suspicious (1–10)"
                >
                  <NumberInput
                    value={draft.interview.warningThreshold}
                    onChange={(v) =>
                      setDraftField(
                        "interview",
                        "warningThreshold",
                        Math.max(1, Math.min(10, v))
                      )
                    }
                    min={1}
                    max={10}
                    suffix="warnings"
                  />
                </FieldRow>
                <FieldRow
                  label="Enforce fullscreen"
                  hint="Automatically request fullscreen when a session starts"
                >
                  <Toggle
                    checked={draft.interview.enforceFullscreen}
                    onChange={(v) =>
                      setDraftField("interview", "enforceFullscreen", v)
                    }
                  />
                </FieldRow>
                <FieldRow
                  label="Show tips card"
                  hint="Display the 'Tips for better answers' card during sessions"
                >
                  <Toggle
                    checked={draft.interview.showTips}
                    onChange={(v) => setDraftField("interview", "showTips", v)}
                  />
                </FieldRow>
                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <SaveBar
                    saving={saving}
                    saved={saved}
                    error={saveErr}
                    onSave={handleSaveSettings}
                  />
                </div>
              </SectionCard>
            )}

            {/* ══ NOTIFICATIONS ════════════════════════════════════════════ */}
            {tab === "notifications" && (
              <SectionCard
                icon={I.bell}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                title="Notifications"
                subtitle="Control which alerts and banners appear in the app"
              >
                <FieldRow
                  label="Integrity warnings"
                  hint="Show ⚠️ warning popups when suspicious activity is detected during interviews"
                >
                  <Toggle
                    checked={draft.notifications.integrityWarnings}
                    onChange={(v) =>
                      setDraftField("notifications", "integrityWarnings", v)
                    }
                  />
                </FieldRow>
                <FieldRow
                  label="Profile completion nudges"
                  hint="Show 'add interviews / analyses' prompts on career and performance pages"
                >
                  <Toggle
                    checked={draft.notifications.dataNudges}
                    onChange={(v) =>
                      setDraftField("notifications", "dataNudges", v)
                    }
                  />
                </FieldRow>
                <FieldRow
                  label="Cache refresh reminders"
                  hint="Show 'recommendations cached X hours ago — refresh?' notes"
                >
                  <Toggle
                    checked={draft.notifications.refreshReminders}
                    onChange={(v) =>
                      setDraftField("notifications", "refreshReminders", v)
                    }
                  />
                </FieldRow>
                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <SaveBar
                    saving={saving}
                    saved={saved}
                    error={saveErr}
                    onSave={handleSaveSettings}
                  />
                </div>
              </SectionCard>
            )}

            {/* ══ PRIVACY ══════════════════════════════════════════════════ */}
            {tab === "privacy" && (
              <SectionCard
                icon={I.shield}
                iconBg="bg-brand-50"
                iconColor="text-brand-600"
                title="Privacy"
                subtitle="Control what data is visible in your results"
              >
                <FieldRow
                  label="Hide cheating status"
                  hint="Hides the 'Flagged / Clean' integrity badges from interview history and performance pages. The data still exists — it is only hidden from display."
                >
                  <Toggle
                    checked={draft.privacy.hideCheatingStatus}
                    onChange={(v) =>
                      setDraftField("privacy", "hideCheatingStatus", v)
                    }
                  />
                </FieldRow>
                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <SaveBar
                    saving={saving}
                    saved={saved}
                    error={saveErr}
                    onSave={handleSaveSettings}
                  />
                </div>
              </SectionCard>
            )}

            {/* ══ DISPLAY ══════════════════════════════════════════════════ */}
            {tab === "display" && (
              <SectionCard
                icon={I.monitor}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                title="Display"
                subtitle="Personalise how the app looks and formats data"
              >
                <FieldRow
                  label="Compact sidebar"
                  hint="Collapse the sidebar to icon-only mode, giving more screen space to content"
                >
                  <Toggle
                    checked={draft.display.compactSidebar}
                    onChange={(v) =>
                      setDraftField("display", "compactSidebar", v)
                    }
                  />
                </FieldRow>
                <FieldRow
                  label="Date format"
                  hint="How dates are displayed throughout the app"
                >
                  <SelectInput
                    value={draft.display.dateLocale}
                    onChange={(v) => setDraftField("display", "dateLocale", v)}
                    options={[
                      { value: "en-IN", label: "🇮🇳 DD Mon YYYY (India)" },
                      { value: "en-US", label: "🇺🇸 Mon DD, YYYY (US)" },
                      { value: "en-GB", label: "🇬🇧 DD/MM/YYYY (UK)" },
                    ]}
                  />
                </FieldRow>
                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <SaveBar
                    saving={saving}
                    saved={saved}
                    error={saveErr}
                    onSave={handleSaveSettings}
                  />
                </div>
              </SectionCard>
            )}

            {/* ══ AI ═══════════════════════════════════════════════════════ */}
            {tab === "ai" && (
              <SectionCard
                icon={I.brain}
                iconBg="bg-slate-800"
                iconColor="text-white"
                title="AI Preferences"
                subtitle="Tune how AI features behave across the platform"
              >
                <FieldRow
                  label="AI model"
                  hint="Affects all AI analyses: resume, interviews, job matching, career guidance"
                >
                  <SelectInput
                    value={draft.ai.preferredModel}
                    onChange={(v) => setDraftField("ai", "preferredModel", v)}
                    options={[
                      { value: "default", label: "⚖️  Balanced (recommended)" },
                      { value: "fast", label: "⚡ Fast (shorter responses)" },
                      {
                        value: "quality",
                        label: "🎯 Quality (richer responses)",
                      },
                    ]}
                  />
                </FieldRow>
                <FieldRow
                  label="Include job history in AI"
                  hint="When enabled, past job analyses are included as context in career guidance and recommendation AI calls for more personalised output"
                >
                  <Toggle
                    checked={draft.ai.includeJobHistory}
                    onChange={(v) =>
                      setDraftField("ai", "includeJobHistory", v)
                    }
                  />
                </FieldRow>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-bold text-slate-600 mb-1">
                    💡 How this works
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The AI model preference is stored in your profile and sent
                    to the backend with every AI request. "Fast" reduces
                    response depth. "Quality" increases context and detail — it
                    may take slightly longer. "Balanced" is the default and
                    works well for most users.
                  </p>
                </div>
                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <SaveBar
                    saving={saving}
                    saved={saved}
                    error={saveErr}
                    onSave={handleSaveSettings}
                  />
                </div>
              </SectionCard>
            )}

            {/* ══ DANGER ZONE ══════════════════════════════════════════════ */}
            {tab === "danger" && (
              <div className="space-y-5">
                {/* Reset settings */}
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-3 bg-amber-50">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon
                        d={I.refresh}
                        className="w-4.5 h-4.5 text-amber-600"
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-amber-800 text-sm">
                        Reset Settings to Defaults
                      </h3>
                      <p className="text-xs text-amber-600 mt-0.5">
                        All preferences will be reset. Your data is not
                        affected.
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <button
                      onClick={handleReset}
                      disabled={settingsLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Icon d={I.refresh} className="w-4 h-4" /> Reset All
                      Settings
                    </button>
                  </div>
                </div>

                {/* Delete account */}
                <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3 bg-red-50">
                    <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon d={I.trash} className="w-4.5 h-4.5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-red-800 text-sm">
                        Delete Account
                      </h3>
                      <p className="text-xs text-red-600 mt-0.5">
                        Permanently deletes your account, resume, interviews,
                        job analyses, and career data. This cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {!user?.googleId && (
                      <FieldRow
                        label="Your password"
                        hint="Required to confirm deletion"
                      >
                        <input
                          type="password"
                          value={deletePw}
                          onChange={(e) => {
                            setDeletePw(e.target.value);
                            setDeleteErr("");
                          }}
                          placeholder="Enter your current password"
                          className="w-full px-3 py-2 text-sm border border-red-200 rounded-xl bg-red-50/30 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
                        />
                      </FieldRow>
                    )}
                    <FieldRow
                      label='Type "DELETE"'
                      hint="Type the word DELETE in capitals to confirm"
                    >
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => {
                          setDeleteConfirm(e.target.value);
                          setDeleteErr("");
                        }}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 text-sm border border-red-200 rounded-xl bg-red-50/30 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none font-mono tracking-widest"
                      />
                    </FieldRow>
                    {deleteErr && (
                      <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                        <Icon
                          d={I.warn}
                          className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-red-700">{deleteErr}</p>
                      </div>
                    )}
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirm !== "DELETE"}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deleting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                          Deleting…
                        </>
                      ) : (
                        <>
                          <Icon d={I.trash} className="w-4 h-4" /> Permanently
                          Delete My Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
