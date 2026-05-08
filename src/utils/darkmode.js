// ============================================================
// darkmode.js
// Dark mode manager with system preference detection and persistence.
// ============================================================

import Actions from '../state/actions.js';
import Storage from '../storage/storage.js';

const DarkMode = (() => {

  // ── INITIALIZATION ────────────────────────────────────────

  function init() {
    // 1. Check localStorage for saved preference
    const saved = Storage.get('darkMode');
    if (saved !== null) {
      set(saved);
      return;
    }

    // 2. Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    set(prefersDark);

    // 3. Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      set(e.matches);
    });
  }

  // ── SET DARK MODE ─────────────────────────────────────────

  function set(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }

    // Update color scheme meta tag for mobile browsers
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.setAttribute('content', isDark ? 'dark light' : 'light dark');
    }

    // Persist choice
    Storage.set('darkMode', isDark);

    // Update state
    Actions.updateSettings({ darkMode: isDark });
  }

  // ── TOGGLE ────────────────────────────────────────────────

  function toggle() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    set(!isDark);
  }

  // ── GET CURRENT STATE ─────────────────────────────────────

  function isDarkMode() {
    return document.documentElement.classList.contains('dark-mode');
  }

  return { init, set, toggle, isDarkMode };

})();

export default DarkMode;
