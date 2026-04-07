import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useAntiCheating
 * ────────────────
 * Custom hook that wires up all integrity monitoring for the interview session.
 * Completely isolated from UI — returns state and helpers that InterviewSession.jsx consumes.
 *
 * Detects:
 *  - Tab switches / window blur  (visibilitychange + blur/focus)
 *  - Paste attempts             (paste event on document)
 *  - Copy attempts              (copy event on document)
 *  - Right-click                (contextmenu event)
 *  - Fullscreen exit            (fullscreenchange)
 *  - Inactivity                 (no keystroke/mouse for INACTIVITY_TIMEOUT seconds)
 *
 * @param {object}  options
 * @param {number}  options.warningThreshold  - warnings before "critical" state (default 3)
 * @param {number}  options.inactivityTimeout - seconds of silence before flagging (default 120)
 * @param {boolean} options.enabled           - false = skip all hooks (e.g. during submission)
 *
 * @returns {{
 *   integrity:        object,   // live counters
 *   events:           array,    // timestamped event log
 *   totalWarnings:    number,
 *   isCritical:       boolean,  // >= warningThreshold
 *   lastEvent:        object|null,
 *   isFullscreen:     boolean,
 *   requestFullscreen: function,
 *   getIntegrityReport: function,
 *   dismissLastEvent: function,
 * }}
 */
export default function useAntiCheating({
  warningThreshold = 3,
  inactivityTimeout = 120,
  enabled = true,
} = {}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [integrity, setIntegrity] = useState({
    tabSwitches: 0,
    pasteAttempts: 0,
    copyAttempts: 0,
    rightClicks: 0,
    fullscreenExits: 0,
    inactivityFlags: 0,
  });
  const [events, setEvents] = useState([]); // full timestamped log
  const [totalWarnings, setTotalWarnings] = useState(0);
  const [lastEvent, setLastEvent] = useState(null); // drives the warning popup
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const inactivityTimer = useRef(null);
  const sessionActive = useRef(true); // false during submission overlay

  // ── Core: log a new event ──────────────────────────────────────────────────
  const logEvent = useCallback(
    (type, detail = "", countsAsWarning = true) => {
      if (!enabled || !sessionActive.current) return;

      const event = { type, timestamp: new Date().toISOString(), detail };

      setEvents((prev) => [...prev, event]);

      setIntegrity((prev) => {
        const next = { ...prev };
        if (type === "tab_switch") next.tabSwitches++;
        if (type === "paste_attempt") next.pasteAttempts++;
        if (type === "copy_attempt") next.copyAttempts++;
        if (type === "right_click") next.rightClicks++;
        if (type === "fullscreen_exit") next.fullscreenExits++;
        if (type === "inactivity") next.inactivityFlags++;
        return next;
      });

      if (countsAsWarning) {
        setTotalWarnings((n) => n + 1);
        setLastEvent(event);
      }
    },
    [enabled]
  );

  // ── Inactivity reset ───────────────────────────────────────────────────────
  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    if (!enabled || !sessionActive.current) return;
    inactivityTimer.current = setTimeout(() => {
      logEvent("inactivity", `No activity for ${inactivityTimeout}s`);
    }, inactivityTimeout * 1000);
  }, [enabled, inactivityTimeout, logEvent]);

  // ── Fullscreen helpers ─────────────────────────────────────────────────────
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
  }, []);

  const exitFullscreenCallback = useCallback(() => {
    const inFs =
      !!document.fullscreenElement ||
      !!document.webkitFullscreenElement ||
      !!document.mozFullScreenElement;
    setIsFullscreen(inFs);
    if (!inFs) logEvent("fullscreen_exit", "User exited fullscreen");
  }, [logEvent]);

  // ── Wire up all event listeners ────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // ── Tab switch / window blur ─────────────────────────────────────────
    const onVisibilityChange = () => {
      if (document.hidden)
        logEvent("tab_switch", "Tab hidden / window minimised");
    };
    const onWindowBlur = () => {
      // Guard: only fire if tab is still visible (blur from clicking another app)
      if (!document.hidden) logEvent("tab_switch", "Window lost focus");
    };

    // ── Paste ────────────────────────────────────────────────────────────
    const onPaste = (e) => {
      // Allow paste in non-textarea targets would break the answer box
      // We log but DO NOT call e.preventDefault() on textarea — that would break typing
      // Only block paste in general body context
      if (e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
        e.preventDefault();
      }
      logEvent("paste_attempt", `Target: ${e.target.tagName}`);
    };

    // ── Copy ─────────────────────────────────────────────────────────────
    const onCopy = (e) => {
      // Block copying of question text (anything outside textareas)
      if (e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        logEvent("copy_attempt", "Copy blocked (non-input)");
      } else {
        logEvent("copy_attempt", "Copy from answer box", false); // don't count as warning
      }
    };

    // ── Right click ───────────────────────────────────────────────────────
    const onContextMenu = (e) => {
      e.preventDefault();
      logEvent("right_click", `At (${e.clientX}, ${e.clientY})`, false); // low-severity
    };

    // ── Keyboard shortcuts block (Ctrl+C, Ctrl+V, Ctrl+A, F12, etc.) ─────
    const onKeyDown = (e) => {
      resetInactivity();
      const ctrl = e.ctrlKey || e.metaKey;
      // Block Ctrl+C (copy), Ctrl+U (view source), F12 (devtools)
      if (ctrl && e.key === "c") {
        // Let it pass through — handled by onCopy
        return;
      }
      if (ctrl && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    // ── Mouse / touch activity (resets inactivity timer) ─────────────────
    const onMouseMove = () => resetInactivity();
    const onTouchStart = () => resetInactivity();

    // ── Fullscreen change ─────────────────────────────────────────────────
    document.addEventListener("fullscreenchange", exitFullscreenCallback);
    document.addEventListener("webkitfullscreenchange", exitFullscreenCallback);
    document.addEventListener("mozfullscreenchange", exitFullscreenCallback);

    // Register all
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("paste", onPaste, true); // capture phase
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true });

    // Start inactivity clock
    resetInactivity();

    return () => {
      clearTimeout(inactivityTimer.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("fullscreenchange", exitFullscreenCallback);
      document.removeEventListener(
        "webkitfullscreenchange",
        exitFullscreenCallback
      );
      document.removeEventListener(
        "mozfullscreenchange",
        exitFullscreenCallback
      );
    };
  }, [enabled, logEvent, resetInactivity, exitFullscreenCallback]);

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Call before submission to pause detection */
  const pauseDetection = () => {
    sessionActive.current = false;
  };

  /** Dismiss the current warning popup without logging a new event */
  const dismissLastEvent = () => setLastEvent(null);

  /**
   * Build the integrity report object to send to the backend on submit.
   * Calling this also pauses detection.
   */
  const getIntegrityReport = useCallback(() => {
    pauseDetection();
    return {
      ...integrity,
      totalWarnings,
      events,
    };
  }, [integrity, totalWarnings, events]);

  const isCritical = totalWarnings >= warningThreshold;

  return {
    integrity,
    events,
    totalWarnings,
    isCritical,
    lastEvent,
    isFullscreen,
    requestFullscreen,
    getIntegrityReport,
    dismissLastEvent,
  };
}
