// ============================================================
// storage.js
// LocalStorage adapter. Handles read, write, and clear.
// All keys namespaced under 'kevtbp_'.
// ============================================================

const Storage = (() => {

  const NAMESPACE = 'kevtbp_';

  function set(key, value) {
    try {
      localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
    } catch (e) {
      console.warn('[Storage] write failed:', e);
    }
  }

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NAMESPACE + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('[Storage] read failed:', e);
      return fallback;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(NAMESPACE + key);
    } catch (e) {
      console.warn('[Storage] remove failed:', e);
    }
  }

  function clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(NAMESPACE));
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('[Storage] clear failed:', e);
    }
  }

  return { set, get, remove, clear };

})();

export default Storage;
