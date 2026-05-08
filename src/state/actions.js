// ============================================================
// actions.js
// Public API for all state mutations.
// Every action wraps setState() with type-safe mutation.
// No direct setState() calls from screens.
// ============================================================

import State from './state.js';
import Utils from '../utils/utils.js';
import Categories from '../utils/categories.js';

const Actions = (() => {

  // ── TRANSACTIONS ──────────────────────────────────────────

  function updateTransaction(id, updates) {
    const { getState } = State;
    const validation = Utils.validateTransaction(updates);

    // Validate category is in the allowed list
    if (updates.category && !Categories.getNames().includes(updates.category)) {
      validation.errors.category = ['Invalid category'];
      validation.valid = false;
    }

    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const txns = getState().transactions;
    const txIndex = txns.findIndex(t => t.id === id);

    if (txIndex === -1) {
      return { success: false, errors: { general: ['Transaction not found'] } };
    }

    const updated = {
      ...txns[txIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const newTxns = [...txns];
    newTxns[txIndex] = updated;

    State.setState({ transactions: newTxns });
    return { success: true, transaction: updated };
  }

  function updateTransaction(id, updates) {
    const { getState } = State;
    const txn = getState().transactions.find(t => t.id === id);
    if (!txn) return { success: false, errors: { id: ['Transaction not found'] } };

    const merged = { ...txn, ...updates };
    const validation = Utils.validateTransaction(merged);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const txns = getState().transactions.map(t =>
      t.id === id ? merged : t
    );
    State.setState({ transactions: txns });
    return { success: true, transaction: merged };
  }

  function deleteTransaction(id) {
    const { getState } = State;
    const txns = getState().transactions.filter(t => t.id !== id);
    State.setState({ transactions: txns });
  }

  function getTransactions(filters = {}) {
    const { getState } = State;
    let txns = getState().transactions;

    if (filters.month !== undefined && filters.year !== undefined) {
      txns = txns.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === filters.month && d.getFullYear() === filters.year;
      });
    }

    if (filters.category) {
      txns = txns.filter(t => t.category === filters.category);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      txns = txns.filter(t =>
        (t.merchant || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      );
    }

    return txns;
  }

  // ── BUDGETS ───────────────────────────────────────────────

  function setMonthlyBudget(amount) {
    const validation = Utils.validateBudget({ amount });
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    State.setState({ budgets: { monthly: amount } });
    return { success: true };
  }

  function setCategoryBudget(category, amount) {
    if (!category || typeof category !== 'string') {
      return { success: false, errors: { category: ['Category is required'] } };
    }
    if (!Categories.getNames().includes(category)) {
      return { success: false, errors: { category: ['Invalid category'] } };
    }
    const validation = Utils.validateBudget({ amount });
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    const { getState } = State;
    const cats = getState().budgets.categories;
    State.setState({
      budgets: {
        categories: { ...cats, [category]: amount },
      },
    });
    return { success: true };
  }

  function getBudget() {
    return State.getState().budgets;
  }

  // ── GOALS ─────────────────────────────────────────────────

  function addGoal(goal) {
    const validation = Utils.validateGoal(goal);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    const { getState } = State;
    const goals = getState().goals;
    const newGoal = {
      id: Utils.uuid(),
      ...goal,
      createdAt: new Date().toISOString(),
      current: 0,
    };
    State.setState({ goals: [...goals, newGoal] });
    return { success: true, goal: newGoal };
  }

  function updateGoal(id, updates) {
    const { getState } = State;
    const goal = getState().goals.find(g => g.id === id);
    if (!goal) return { success: false, errors: { id: ['Goal not found'] } };

    const merged = { ...goal, ...updates };
    const validation = Utils.validateGoal(merged);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const goals = getState().goals.map(g =>
      g.id === id ? merged : g
    );
    State.setState({ goals });
    return { success: true, goal: merged };
  }

  function deleteGoal(id) {
    const { getState } = State;
    const goals = getState().goals.filter(g => g.id !== id);
    State.setState({ goals });
  }

  function getGoals() {
    return State.getState().goals;
  }

  // ── SETTINGS ──────────────────────────────────────────────

  function updateSettings(partial) {
    const { getState } = State;
    const settings = getState().settings;
    State.setState({ settings: { ...settings, ...partial } });
  }

  function getSettings() {
    return State.getState().settings;
  }

  function toggleDarkMode() {
    const { getState } = State;
    const { darkMode } = getState().settings;
    updateSettings({ darkMode: !darkMode });
  }

  function setAccentColor(color) {
    updateSettings({ accentColor: color });
  }

  // ── UI STATE ──────────────────────────────────────────────

  function setActiveTab(tab) {
    State.setState({ ui: { activeTab: tab } });
  }

  function setActiveMonth(month) {
    State.setState({ ui: { activeMonth: month } });
  }

  function setActiveYear(year) {
    State.setState({ ui: { activeYear: year } });
  }

  function setSort(sortKey) {
    State.setState({ ui: { sort: sortKey } });
  }

  function setFilterCategory(category) {
    State.setState({ ui: { filterCategory: category } });
  }

  function setFilterType(type) {
    State.setState({ ui: { filterType: type } });
  }

  function setSearchQuery(query) {
    State.setState({ ui: { searchQuery: query } });
  }

  function clearFilters() {
    State.setState({
      ui: {
        filterCategory: null,
        filterType: null,
        searchQuery: '',
      },
    });
  }

  function getCurrentMonth() {
    const { ui } = State.getState();
    return ui.activeMonth;
  }

  function getCurrentYear() {
    const { ui } = State.getState();
    return ui.activeYear;
  }

  // ── BATCH OPERATIONS ──────────────────────────────────────

  function importTransactions(txns) {
    const { getState } = State;
    const existing = getState().transactions;
    const withIds = txns.map(t => ({
      id: Utils.uuid(),
      ...t,
      createdAt: new Date().toISOString(),
    }));
    State.setState({ transactions: [...existing, ...withIds] });
  }

  function clearAllData() {
    State.reset();
  }

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactions,
    setMonthlyBudget,
    setCategoryBudget,
    getBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoals,
    updateSettings,
    getSettings,
    toggleDarkMode,
    setAccentColor,
    setActiveTab,
    setActiveMonth,
    setActiveYear,
    setSort,
    setFilterCategory,
    setFilterType,
    setSearchQuery,
    clearFilters,
    getCurrentMonth,
    getCurrentYear,
    importTransactions,
    clearAllData,
  };

})();

export default Actions;
