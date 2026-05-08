// ============================================================
// app.js
// Entry point. Wires modules together. Owns the event loop.
// ============================================================

import State   from './src/state/state.js';
import Actions from './src/state/actions.js';
import Storage from './src/storage/storage.js';
import Utils   from './src/utils/utils.js';
import DarkMode from './src/utils/darkmode.js';
import AccentColor from './src/utils/accentcolor.js';
import FormValidation from './src/utils/formvalidation.js';
import Onboarding from './src/utils/onboarding.js';
import UI      from './src/components/ui.js';
import Charts  from './src/charts/charts.js';

// Export Actions globally so screens can call it
window.Actions = Actions;
window.DarkMode = DarkMode;
window.AccentColor = AccentColor;
window.State = State;
window.UI = UI;
window.Onboarding = Onboarding;

// ── Boot ──────────────────────────────────────────────────
function boot() {
  const root = document.getElementById('app');

  // Initialize theme and colors before anything renders
  DarkMode.init();
  AccentColor.init();

  // Restore state from localStorage
  State.restore();

  // Mount the shell DOM
  UI.mount(root);

  // Subscribe UI to state changes
  State.subscribe(state => UI.render(state));

  // Bind global events
  _bindEvents();

  // Initial render
  UI.render(State.getState());

  // Show onboarding if first run
  setTimeout(() => {
    UI.showOnboarding();
  }, 500);
}

// ── Global event bindings ─────────────────────────────────
function _bindEvents() {

  // Tab navigation
  document.addEventListener('tabchange', e => {
    Actions.setActiveTab(e.detail.tab);
  });

}

// ── Global sheet handlers ─────────────────────────────────

window.openAddTransaction = () => {
  UI.openSheet('add-transaction');
};

window.closeAddTransaction = () => {
  UI.closeSheet('add-transaction');
};

window.submitAddTransaction = (e) => {
  e.preventDefault();
  const form = document.getElementById('add-transaction-form');
  const formData = new FormData(form);

  const tx = {
    amount: parseFloat(formData.get('amount')),
    merchant: formData.get('merchant'),
    category: formData.get('category'),
    date: formData.get('date'),
    notes: formData.get('notes') || '',
  };

  const result = Actions.addTransaction(tx);
  
  if (result.success) {
    form.reset();
    FormValidation.clearErrors('add-transaction-form');
    UI.closeSheet('add-transaction');
  } else {
    // Display validation errors inline
    FormValidation.displayErrors('add-transaction-form', result.errors);
  }
};

window.openEditTransaction = (id) => {
  const state = State.getState();
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  // Populate edit form with transaction data
  const overlay = document.getElementById('edit-transaction-overlay');
  if (overlay) {
    const form = document.getElementById('edit-transaction-form');
    if (form) {
      form.elements['edit-amount'].value = Math.abs(tx.amount);
      form.elements['edit-merchant'].value = tx.merchant;
      form.elements['edit-category'].value = tx.category;
      form.elements['edit-date'].value = tx.date.split('T')[0];
      form.elements['edit-notes'].value = tx.notes || '';
      form.dataset.transactionId = id;
    }
    UI.openSheet('edit-transaction');
  }
};

window.closeEditTransaction = () => {
  UI.closeSheet('edit-transaction');
};

window.submitEditTransaction = (e) => {
  e.preventDefault();
  const form = document.getElementById('edit-transaction-form');
  const id = form.dataset.transactionId;

  if (!id) {
    console.error('No transaction ID');
    return;
  }

  const formData = new FormData(form);
  const updates = {
    amount: parseFloat(formData.get('edit-amount')),
    merchant: formData.get('edit-merchant'),
    category: formData.get('edit-category'),
    date: formData.get('edit-date'),
    notes: formData.get('edit-notes') || '',
  };

  const result = Actions.updateTransaction(id, updates);

  if (result.success) {
    FormValidation.clearErrors('edit-transaction-form');
    UI.closeSheet('edit-transaction');
    form.reset();
  } else {
    // Display validation errors inline
    FormValidation.displayErrors('edit-transaction-form', result.errors);
  }
};

window.deleteCurrentTransaction = () => {
  const form = document.getElementById('edit-transaction-form');
  const id = form.dataset.transactionId;

  if (!id) {
    console.error('No transaction ID');
    return;
  }

  const confirmed = confirm('Are you sure you want to delete this transaction? This cannot be undone.');
  if (confirmed) {
    Actions.deleteTransaction(id);
    UI.closeSheet('edit-transaction');
    form.reset();
  }
};

// ── Budget management handlers ──────────────────────────────

window.openBudgetInput = () => {
  const form = document.getElementById('budget-form');
  const state = State.getState();
  const monthly = state.budgets.monthly || 0;
  form.elements['monthly-budget'].value = monthly > 0 ? monthly : '';
  UI.openSheet('budget-input');
};

window.closeBudgetInput = () => {
  UI.closeSheet('budget-input');
};

window.submitBudgetInput = (e) => {
  e.preventDefault();
  const form = document.getElementById('budget-form');
  const amount = parseFloat(form.elements['monthly-budget'].value);

  const result = Actions.setMonthlyBudget(amount);

  if (result.success) {
    FormValidation.clearErrors('budget-form');
    UI.closeSheet('budget-input');
    form.reset();
  } else {
    FormValidation.displayErrors('budget-form', result.errors);
  }
};

window.openCategoryBudgetInput = () => {
  const form = document.getElementById('category-budget-form');
  form.elements['cat-budget-category'].value = '';
  form.elements['cat-budget-amount'].value = '';
  form.dataset.editCategory = null;
  UI.openSheet('category-budget');
};

window.editCategoryBudget = (category) => {
  const form = document.getElementById('category-budget-form');
  const state = State.getState();
  const amount = state.budgets.categories[category] || 0;
  form.elements['cat-budget-category'].value = category;
  form.elements['cat-budget-amount'].value = amount > 0 ? amount : '';
  form.dataset.editCategory = category;
  UI.openSheet('category-budget');
};

window.closeCategoryBudgetInput = () => {
  UI.closeSheet('category-budget');
};

window.submitCategoryBudgetInput = (e) => {
  e.preventDefault();
  const form = document.getElementById('category-budget-form');
  const category = form.elements['cat-budget-category'].value;
  const amount = parseFloat(form.elements['cat-budget-amount'].value);

  const result = Actions.setCategoryBudget(category, amount);

  if (result.success) {
    FormValidation.clearErrors('category-budget-form');
    UI.closeSheet('category-budget');
    form.reset();
  } else {
    FormValidation.displayErrors('category-budget-form', result.errors);
  }
};

// ── Goals management handlers ───────────────────────────────

window.openAddGoal = () => {
  const form = document.getElementById('add-goal-form');
  form.reset();
  UI.openSheet('add-goal');
};

window.closeAddGoal = () => {
  UI.closeSheet('add-goal');
};

window.submitAddGoal = (e) => {
  e.preventDefault();
  const form = document.getElementById('add-goal-form');
  const formData = new FormData(form);

  const goal = {
    name: formData.get('goal-name'),
    target: parseFloat(formData.get('goal-target')),
    deadline: formData.get('goal-deadline'),
    current: 0,
  };

  const result = Actions.addGoal(goal);

  if (result.success) {
    FormValidation.clearErrors('add-goal-form');
    UI.closeSheet('add-goal');
    form.reset();
  } else {
    FormValidation.displayErrors('add-goal-form', result.errors);
  }
};

window.editGoal = (idx) => {
  const state = State.getState();
  const goal = state.goals[idx];
  if (!goal) return;

  const form = document.getElementById('edit-goal-form');
  form.elements['edit-goal-name'].value = goal.name;
  form.elements['edit-goal-target'].value = goal.target;
  form.elements['edit-goal-deadline'].value = goal.deadline.split('T')[0];
  form.dataset.goalIndex = idx;
  UI.openSheet('edit-goal');
};

window.closeEditGoal = () => {
  UI.closeSheet('edit-goal');
};

window.submitEditGoal = (e) => {
  e.preventDefault();
  const form = document.getElementById('edit-goal-form');
  const idx = parseInt(form.dataset.goalIndex);

  const updates = {
    name: form.elements['edit-goal-name'].value,
    target: parseFloat(form.elements['edit-goal-target'].value),
    deadline: form.elements['edit-goal-deadline'].value,
  };

  const result = Actions.updateGoal(idx, updates);

  if (result.success) {
    FormValidation.clearErrors('edit-goal-form');
    UI.closeSheet('edit-goal');
    form.reset();
  } else {
    FormValidation.displayErrors('edit-goal-form', result.errors);
  }
};

window.deleteGoalConfirm = (idx) => {
  const state = State.getState();
  const goal = state.goals[idx];
  const confirmed = confirm(`Delete goal "${goal.name}"? This cannot be undone.`);
  if (confirmed) {
    Actions.deleteGoal(idx);
  }
};

window.openContributeGoal = (idx) => {
  // Task 31 - goal contribution tracking
  const form = document.getElementById('contribute-goal-form');
  form.elements['contribute-amount'].value = '';
  form.dataset.goalIndex = idx;
  UI.openSheet('contribute-goal');
};

window.closeContributeGoal = () => {
  UI.closeSheet('contribute-goal');
};

window.submitContributeGoal = (e) => {
  e.preventDefault();
  const form = document.getElementById('contribute-goal-form');
  const idx = parseInt(form.dataset.goalIndex);
  const amount = parseFloat(form.elements['contribute-amount'].value);

  const state = State.getState();
  const goal = state.goals[idx];
  if (!goal) return;

  const updated = { ...goal, current: goal.current + amount };
  const result = Actions.updateGoal(idx, updated);

  if (result.success) {
    FormValidation.clearErrors('contribute-goal-form');
    UI.closeSheet('contribute-goal');
    form.reset();
  } else {
    FormValidation.displayErrors('contribute-goal-form', result.errors);
  }
};

// ── Settings handlers ───────────────────────────────────────

window.exportDataAsCSV = () => {
  const state = State.getState();
  const { transactions } = state;
  
  if (transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // CSV headers
  const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Notes'];
  const rows = transactions.map(tx => [
    tx.date.split('T')[0],
    tx.merchant,
    tx.category,
    tx.amount,
    tx.notes || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

window.importDataFromCSV = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csv = e.target?.result;
      if (typeof csv !== 'string') return;

      const lines = csv.split('\n');
      if (lines.length < 2) {
        alert('Invalid CSV format');
        return;
      }

      const headers = lines[0].split(',');
      const transactions = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (assumes quoted fields)
        const cells = line.match(/"([^"]*)"|([^,]+)/g) || [];
        const row = cells.map(cell => cell.replace(/^"|"$/g, '').trim());

        if (row.length >= 4) {
          transactions.push({
            date: row[0],
            merchant: row[1],
            category: row[2],
            amount: parseFloat(row[3]),
            notes: row[4] || '',
          });
        }
      }

      // Import via Actions
      if (transactions.length > 0) {
        const result = Actions.importTransactions(transactions);
        if (result.success) {
          alert(`Imported ${transactions.length} transactions`);
        } else {
          alert('Some transactions failed validation');
        }
      }
    } catch (error) {
      console.error('CSV import error:', error);
      alert('Error importing CSV');
    }
  };
  reader.readAsText(file);
};

window.clearAllDataConfirm = () => {
  const confirmed = confirm('Delete ALL data? This cannot be undone. Please export first if needed.');
  if (confirmed) {
    const doubleConfirm = confirm('Are you absolutely sure? This will delete all transactions, budgets, and goals.');
    if (doubleConfirm) {
      Actions.clearAllData();
      alert('All data cleared');
    }
  }
};

// ── Start ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
