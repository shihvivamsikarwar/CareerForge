import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { settingsApi } from "../services/api";
import { useAuth } from "./AuthContext";

// ── Default settings (mirror the backend schema defaults) ─────────────────────
export const DEFAULT_SETTINGS = {
  interview: {
    questionCount: 7,
    timerMinutes: 45,
    inactivityTimeout: 120,
    warningThreshold: 3,
    enforceFullscreen: false,
    showTips: true,
  },
  notifications: {
    integrityWarnings: true,
    dataNudges: true,
    refreshReminders: true,
  },
  privacy: {
    hideCheatingStatus: false,
    publicProfile: false,
  },
  display: {
    compactSidebar: false,
    dateLocale: "en-IN",
  },
  ai: {
    preferredModel: "default",
    includeJobHistory: true,
  },
};

/**
 * Deep-merge two plain objects (settings patch helper).
 * Only one level deep — sufficient for our settings schema.
 */
const deepMerge = (base, patch) => {
  const result = { ...base };
  Object.keys(patch).forEach((key) => {
    if (
      patch[key] &&
      typeof patch[key] === "object" &&
      !Array.isArray(patch[key])
    ) {
      result[key] = { ...(base[key] || {}), ...patch[key] };
    } else {
      result[key] = patch[key];
    }
  });
  return result;
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();

  // Initialise from user object if already loaded (avoids a second round-trip on mount)
  const [settings, setSettings] = useState(() =>
    deepMerge(DEFAULT_SETTINGS, user?.settings || {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Re-sync whenever the authenticated user changes (login / logout / token restore)
  useEffect(() => {
    if (!user) {
      setSettings(deepMerge(DEFAULT_SETTINGS, {}));
      return;
    }
    if (user.settings) {
      setSettings(deepMerge(DEFAULT_SETTINGS, user.settings));
    }
  }, [user]);

  /**
   * save
   * ─────
   * Optimistically updates local state, then persists to the backend.
   * Rolls back on error.
   *
   * @param {object} patch  — subset of settings to merge, e.g. { interview: { questionCount: 10 } }
   * @returns {Promise<void>}
   */
  const save = useCallback(
    async (patch) => {
      const previous = settings;
      // Optimistic update
      setSettings((prev) => deepMerge(prev, patch));
      setError(null);
      setLoading(true);
      try {
        const res = await settingsApi.update(patch);
        // Sync with the authoritative server response
        setSettings(deepMerge(DEFAULT_SETTINGS, res.settings));
      } catch (err) {
        // Rollback
        setSettings(previous);
        setError(err.message || "Failed to save settings.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [settings]
  );

  /**
   * reset
   * ──────
   * Resets ALL settings to defaults and persists.
   */
  const reset = useCallback(async () => {
    const previous = settings;
    setSettings(DEFAULT_SETTINGS);
    setLoading(true);
    try {
      const res = await settingsApi.update(DEFAULT_SETTINGS);
      setSettings(deepMerge(DEFAULT_SETTINGS, res.settings));
    } catch (err) {
      setSettings(previous);
      setError(err.message || "Failed to reset settings.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{ settings, save, reset, loading, error, setError }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
};
