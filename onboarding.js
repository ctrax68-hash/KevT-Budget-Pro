// ============================================================
// onboarding.js
// Onboarding tutorial and first-run experience.
// ============================================================

const Onboarding = (() => {

  const STEPS = [
    {
      id: 'welcome',
      title: 'Welcome to KevT Budget Pro',
      text: 'Track your spending, set budgets, and reach your financial goals.',
      icon: '💰',
      action: 'Next',
      highlight: null,
    },
    {
      id: 'add-transaction',
      title: 'Add Your First Transaction',
      text: 'Tap the + button to record a purchase or income. Categorize it and add notes.',
      icon: '📝',
      action: 'Next',
      highlight: '[data-tab="home"]',
    },
    {
      id: 'set-budget',
      title: 'Set Your Monthly Budget',
      text: 'Go to Settings and set a target for your monthly spending. We\'ll alert you when you\'re over.',
      icon: '💵',
      action: 'Next',
      highlight: '[data-tab="settings"]',
    },
    {
      id: 'view-analytics',
      title: 'Check Your Analytics',
      text: 'Tap Analytics to see spending by category, income vs expenses, and trends.',
      icon: '📊',
      action: 'Next',
      highlight: '[data-tab="analytics"]',
    },
    {
      id: 'create-goals',
      title: 'Create Savings Goals',
      text: 'Set targets like "Vacation Fund" or "Emergency Savings" and track progress.',
      icon: '🎯',
      action: 'Done',
      highlight: '[data-tab="goals"]',
    },
  ];

  /**
   * Check if user has completed onboarding
   * @returns {boolean} True if onboarding not yet completed
   */
  function shouldShow() {
    const shown = localStorage.getItem('kevtbp_onboarding_shown');
    return !shown;
  }

  /**
   * Mark onboarding as completed
   */
  function markComplete() {
    localStorage.setItem('kevtbp_onboarding_shown', 'true');
  }

  /**
   * Get all onboarding steps
   * @returns {array} Array of step objects
   */
  function getSteps() {
    return STEPS;
  }

  /**
   * Get specific step by ID
   * @param {string} id - Step ID
   * @returns {object|null} Step object or null
   */
  function getStep(id) {
    return STEPS.find(step => step.id === id) || null;
  }

  /**
   * Get next step ID
   * @param {string} currentId - Current step ID
   * @returns {string|null} Next step ID or null if last
   */
  function getNextStepId(currentId) {
    const idx = STEPS.findIndex(step => step.id === currentId);
    if (idx === -1 || idx === STEPS.length - 1) return null;
    return STEPS[idx + 1].id;
  }

  /**
   * Get step index (0-based)
   * @param {string} id - Step ID
   * @returns {number} Step index
   */
  function getStepIndex(id) {
    return STEPS.findIndex(step => step.id === id);
  }

  /**
   * Get total step count
   * @returns {number} Total steps
   */
  function getTotalSteps() {
    return STEPS.length;
  }

  return {
    shouldShow,
    markComplete,
    getSteps,
    getStep,
    getNextStepId,
    getStepIndex,
    getTotalSteps,
  };

})();

export default Onboarding;
