// ============================================================
// state.js
// Global application state. Single source of truth.
// All mutations go through setState(). Storage syncs here.
// ============================================================

import Storage from '../storage/storage.js';

const State = (() => {

  let _state = {
    transactions: [],
    budgets: {
      monthly: 0,
      categories: {},
    },
    goals: [],
    settings: {
      currency: 'USD',
      startOfMonth: 1,
      darkMode: false,
      accentColor: '#34C759',
      soundEnabled: false,
    },
    ui: {
      activeTab: 'home',
      activeMonth: new Date().getMonth(),
      activeYear: new Date().getFullYear(),
    },
  };

  // Subscribers notified on every state change
  const _subscribers = [];

  function getState() {
    return _state;
  }

  function setState(partial) {
    _state = _deepMerge(_state, partial);
    _persist();
    _notify();
  }

  function subscribe(fn) {
    _subscribers.push(fn);
  }

  function restore() {
    const saved = Storage.get('state');
    if (saved) {
      _state = _deepMerge(_state, saved);
      _notify();
    }
  }

  function reset() {
    _state = {
      transactions: [],
      budgets: { monthly: 0, categories: {} },
      goals: [],
      settings: {
        currency: 'USD',
        startOfMonth: 1,
        darkMode: false,
        accentColor: '#34C759',
        soundEnabled: false,
      },
      ui: {
        activeTab: 'home',
        activeMonth: new Date().getMonth(),
        activeYear: new Date().getFullYear(),
      },
    };
    Storage.remove('state');
    _notify();
  }

  function _persist() {
    Storage.set('state', _state);
  }

  function _notify() {
    _subscribers.forEach(fn => fn(_state));
  }

  function _deepMerge(target, source) {
    const out = Object.assign({}, target);
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        out[key] = _deepMerge(target[key] || {}, source[key]);
      } else {
        out[key] = source[key];
      }
    }
    return out;
  }

  return { getState, setState, subscribe, restore, reset };

})();

export default State;
