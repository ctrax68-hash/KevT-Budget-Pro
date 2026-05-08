// ============================================================
// ui.js
// DOM rendering layer. Builds and updates all UI.
// Receives state, returns nothing (pure side effects on DOM).
// ============================================================

import HomeScreen from '../screens/home.js';
import AnalyticsScreen from '../screens/analytics.js';
import GoalsScreen from '../screens/goals.js';
import SettingsScreen from '../screens/settings.js';

const UI = (() => {

  // ── Mount ─────────────────────────────────────────────────
  // Called once on app boot to set up the shell DOM
  function mount(rootEl) {
    rootEl.innerHTML = _shell();
    _bindNav();
    _bindSheets();
  }

  // ── Render ────────────────────────────────────────────────
  // Called on every state change
  function render(state) {
    _renderActiveTab(state);
    _renderHomeScreen(state);
    _renderAnalyticsScreen(state);
    _renderGoalsScreen(state);
    _renderSettingsScreen(state);
  }

  // ── Tab navigation ────────────────────────────────────────
  function _bindNav() {
    const items = document.querySelectorAll('.tab-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        document.dispatchEvent(new CustomEvent('tabchange', { detail: { tab } }));
      });
    });
  }

  function _renderActiveTab(state) {
    const { activeTab } = state.ui;
    document.querySelectorAll('.tab-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === activeTab);
    });
    document.querySelectorAll('[data-screen]').forEach(el => {
      el.classList.toggle('active', el.dataset.screen === activeTab);
    });
  }

  // ── Sheet management ──────────────────────────────────────
  function _bindSheets() {
    document.addEventListener('click', e => {
      // Close sheet when clicking overlay background
      if (e.target.classList.contains('sheet-overlay')) {
        e.target.classList.remove('active');
      }
    });
  }

  function openSheet(id) {
    const overlay = document.getElementById(`${id}-overlay`);
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSheet(id) {
    const overlay = document.getElementById(`${id}-overlay`);
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  // ── Home screen ───────────────────────────────────────────
  function _renderHomeScreen(state) {
    const homeScreen = document.querySelector('[data-screen="home"]');
    if (homeScreen) {
      homeScreen.innerHTML = HomeScreen.render(state);
      _bindSheets();
    }
  }

  // ── Settings screen ────────────────────────────────────────
  function _renderSettingsScreen(state) {
    const settingsScreen = document.querySelector('[data-screen="settings"]');
    if (settingsScreen) {
      settingsScreen.innerHTML = SettingsScreen.render(state);
      _bindSheets();
    }
  }

  // ── Analytics screen ───────────────────────────────────────
  function _renderAnalyticsScreen(state) {
    const analyticsScreen = document.querySelector('[data-screen="analytics"]');
    if (analyticsScreen) {
      analyticsScreen.innerHTML = AnalyticsScreen.render(state);
      _bindSheets();
    }
  }

  // ── Goals screen ───────────────────────────────────────────
  function _renderGoalsScreen(state) {
    const goalsScreen = document.querySelector('[data-screen="goals"]');
    if (goalsScreen) {
      goalsScreen.innerHTML = GoalsScreen.render(state);
      _bindSheets();
    }
  }

  // ── Shell HTML ────────────────────────────────────────────
  // Skeleton only — screens filled in per task
  function _shell() {
    return `
      <div class="app-shell">
        <main class="screen-container">
          <div class="screen active" data-screen="home"></div>
          <div class="screen" data-screen="analytics"></div>
          <div class="screen" data-screen="goals"></div>
          <div class="screen" data-screen="settings"></div>
        </main>
        <nav class="tab-bar">
          <button class="tab-item active" data-tab="home">
            <span class="tab-icon">🏠</span>
            <span class="tab-label">Home</span>
          </button>
          <button class="tab-item" data-tab="analytics">
            <span class="tab-icon">📊</span>
            <span class="tab-label">Analytics</span>
          </button>
          <button class="tab-item" data-tab="goals">
            <span class="tab-icon">🎯</span>
            <span class="tab-label">Goals</span>
          </button>
          <button class="tab-item" data-tab="settings">
            <span class="tab-icon">⚙️</span>
            <span class="tab-label">Settings</span>
          </button>
        </nav>
      </div>

      <!-- Onboarding Overlay -->
      <div id="onboarding-overlay" class="onboarding-overlay">
        <div class="onboarding-backdrop"></div>
        <div class="onboarding-container">
          <div id="onboarding-progress"></div>
          <div id="onboarding-content"></div>
        </div>
      </div>
    `;
  }

  return { mount, render, openSheet, closeSheet };

})();

export default UI;

  // ── Onboarding ────────────────────────────────────────────
  function showOnboarding() {
    const Onboarding = window.Onboarding;
    if (!Onboarding || !Onboarding.shouldShow()) return;

    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      overlay.classList.add('active');
      _showOnboardingStep('welcome');
    }
  }

  function _showOnboardingStep(stepId) {
    const Onboarding = window.Onboarding;
    const step = Onboarding.getStep(stepId);
    if (!step) return;

    const content = document.getElementById('onboarding-content');
    const progress = document.getElementById('onboarding-progress');
    const idx = Onboarding.getStepIndex(stepId);
    const total = Onboarding.getTotalSteps();

    if (content) {
      content.innerHTML = \`
        <div class="onboarding-card">
          <div class="onboarding-icon">\${step.icon}</div>
          <h2 class="onboarding-title">\${step.title}</h2>
          <p class="onboarding-text">\${step.text}</p>
          
          <div class="flex gap-md mt-2xl">
            \${idx > 0 ? \`<button class="btn btn-secondary flex-1" onclick="window.previousOnboardingStep('\${stepId}')">Back</button>\` : ''}
            <button class="btn btn-primary flex-1" onclick="window.nextOnboardingStep('\${stepId}')">\${step.action}</button>
          </div>
        </div>
      \`;
    }

    if (progress) {
      progress.innerHTML = \`
        <div class="onboarding-progress-bar">
          <div class="onboarding-progress-fill" style="width: \${((idx + 1) / total) * 100}%"></div>
        </div>
        <div class="onboarding-progress-text">\${idx + 1} of \${total}</div>
      \`;
    }
  }

  window.nextOnboardingStep = (currentId) => {
    const Onboarding = window.Onboarding;
    const nextId = Onboarding.getNextStepId(currentId);
    
    if (nextId) {
      _showOnboardingStep(nextId);
    } else {
      // Last step - mark complete and close
      Onboarding.markComplete();
      const overlay = document.getElementById('onboarding-overlay');
      if (overlay) {
        overlay.classList.remove('active');
      }
    }
  };

  window.previousOnboardingStep = (currentId) => {
    const Onboarding = window.Onboarding;
    const steps = Onboarding.getSteps();
    const idx = Onboarding.getStepIndex(currentId);
    if (idx > 0) {
      _showOnboardingStep(steps[idx - 1].id);
    }
  };
