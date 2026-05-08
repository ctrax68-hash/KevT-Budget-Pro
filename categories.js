// ============================================================
// categories.js
// Category definitions with icons, colors, and metadata.
// ============================================================

const Categories = (() => {

  const CATEGORIES = {
    'Food & Dining': {
      icon: '🍔',
      color: '#FF9500',
      label: 'Food & Dining',
      emoji: true,
    },
    'Transportation': {
      icon: '🚗',
      color: '#5AC8FA',
      label: 'Transportation',
      emoji: true,
    },
    'Shopping': {
      icon: '🛍️',
      color: '#FF2D55',
      label: 'Shopping',
      emoji: true,
    },
    'Entertainment': {
      icon: '🎬',
      color: '#AF52DE',
      label: 'Entertainment',
      emoji: true,
    },
    'Bills & Utilities': {
      icon: '⚡',
      color: '#FFCC00',
      label: 'Bills & Utilities',
      emoji: true,
    },
    'Health & Fitness': {
      icon: '💪',
      color: '#34C759',
      label: 'Health & Fitness',
      emoji: true,
    },
    'Work Income': {
      icon: '💼',
      color: '#007AFF',
      label: 'Work Income',
      emoji: true,
    },
    'Investments': {
      icon: '📈',
      color: '#34C759',
      label: 'Investments',
      emoji: true,
    },
    'Gifts & Charity': {
      icon: '🎁',
      color: '#FF2D55',
      label: 'Gifts & Charity',
      emoji: true,
    },
    'Other Income': {
      icon: '💰',
      color: '#34C759',
      label: 'Other Income',
      emoji: true,
    },
    'Travel': {
      icon: '✈️',
      color: '#00C7BE',
      label: 'Travel',
      emoji: true,
    },
    'Other': {
      icon: '📝',
      color: '#A2845E',
      label: 'Other',
      emoji: true,
    },
  };

  /**
   * Get category by name
   * @param {string} name - Category name
   * @returns {object} Category object with icon, color, label
   */
  function get(name) {
    return CATEGORIES[name] || CATEGORIES['Other'];
  }

  /**
   * Get all categories
   * @returns {object} All categories
   */
  function getAll() {
    return CATEGORIES;
  }

  /**
   * Get list of category names
   * @returns {array} Array of category names
   */
  function getNames() {
    return Object.keys(CATEGORIES);
  }

  /**
   * Get category icon
   * @param {string} name - Category name
   * @returns {string} Icon (emoji or character)
   */
  function getIcon(name) {
    const cat = get(name);
    return cat.icon;
  }

  /**
   * Get category color
   * @param {string} name - Category name
   * @returns {string} Hex color code
   */
  function getColor(name) {
    const cat = get(name);
    return cat.color;
  }

  /**
   * Get category label
   * @param {string} name - Category name
   * @returns {string} Display label
   */
  function getLabel(name) {
    const cat = get(name);
    return cat.label;
  }

  /**
   * Check if category is income (positive)
   * @param {string} name - Category name
   * @returns {boolean} True if income category
   */
  function isIncome(name) {
    const incomeCategories = ['Work Income', 'Other Income', 'Investments'];
    return incomeCategories.includes(name);
  }

  /**
   * Get category for display in transaction row
   * @param {string} name - Category name
   * @returns {object} { icon, color, label }
   */
  function getDisplay(name) {
    const cat = get(name);
    return {
      icon: cat.icon,
      color: cat.color,
      label: cat.label,
    };
  }

  return {
    get,
    getAll,
    getNames,
    getIcon,
    getColor,
    getLabel,
    isIncome,
    getDisplay,
    CATEGORIES,
  };

})();

export default Categories;
