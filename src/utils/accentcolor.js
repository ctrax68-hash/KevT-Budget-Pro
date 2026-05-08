// ============================================================
// accentcolor.js
// Accent color manager with theme switching and persistence.
// ============================================================

import Actions from '../state/actions.js';
import Storage from '../storage/storage.js';

const AccentColor = (() => {

  // Available accent colors
  const COLORS = {
    green: '#34C759',
    blue: '#007AFF',
    orange: '#FF9500',
    pink: '#FF2D55',
  };

  // ── INITIALIZATION ────────────────────────────────────────

  function init() {
    // 1. Check localStorage for saved preference
    const saved = Storage.get('accentColor');
    if (saved && COLORS[saved]) {
      set(saved);
      return;
    }

    // 2. Default to green
    set('green');
  }

  // ── SET ACCENT COLOR ──────────────────────────────────────

  function set(colorName) {
    if (!COLORS[colorName]) {
      console.warn(`[AccentColor] Unknown color: ${colorName}`);
      return;
    }

    const hex = COLORS[colorName];

    // Update CSS custom property
    document.documentElement.style.setProperty('--accent-color', hex);

    // Persist choice
    Storage.set('accentColor', colorName);

    // Update state
    Actions.setAccentColor(hex);
  }

  // ── GET AVAILABLE COLORS ──────────────────────────────────

  function getColors() {
    return Object.entries(COLORS).map(([name, hex]) => ({
      name,
      hex,
      label: name.charAt(0).toUpperCase() + name.slice(1),
    }));
  }

  // ── GET CURRENT COLOR ────────────────────────────────────

  function getCurrent() {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    for (const [name, color] of Object.entries(COLORS)) {
      if (color === hex) return name;
    }
    return 'green';
  }

  return { init, set, getColors, getCurrent, COLORS };

})();

export default AccentColor;
