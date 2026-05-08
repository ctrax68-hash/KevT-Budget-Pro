// ============================================================
// sorting.js
// Transaction sorting and filtering utilities.
// ============================================================

const Sorting = (() => {

  const SORT_OPTIONS = {
    'date-desc': {
      label: 'Newest First',
      fn: (a, b) => new Date(b.date) - new Date(a.date),
    },
    'date-asc': {
      label: 'Oldest First',
      fn: (a, b) => new Date(a.date) - new Date(b.date),
    },
    'amount-desc': {
      label: 'Largest Amount',
      fn: (a, b) => Math.abs(b.amount) - Math.abs(a.amount),
    },
    'amount-asc': {
      label: 'Smallest Amount',
      fn: (a, b) => Math.abs(a.amount) - Math.abs(b.amount),
    },
    'merchant-asc': {
      label: 'Merchant A-Z',
      fn: (a, b) => a.merchant.localeCompare(b.merchant),
    },
    'merchant-desc': {
      label: 'Merchant Z-A',
      fn: (a, b) => b.merchant.localeCompare(a.merchant),
    },
    'expense-first': {
      label: 'Expenses First',
      fn: (a, b) => Math.sign(a.amount) - Math.sign(b.amount),
    },
    'income-first': {
      label: 'Income First',
      fn: (a, b) => Math.sign(b.amount) - Math.sign(a.amount),
    },
  };

  /**
   * Get all sort options
   * @returns {object} Sort options object
   */
  function getOptions() {
    return SORT_OPTIONS;
  }

  /**
   * Get sort option by key
   * @param {string} key - Sort key
   * @returns {object} Sort option with label and comparator function
   */
  function get(key) {
    return SORT_OPTIONS[key] || SORT_OPTIONS['date-desc'];
  }

  /**
   * Sort transactions
   * @param {array} txns - Array of transactions
   * @param {string} sortKey - Sort key
   * @returns {array} Sorted copy of array
   */
  function sort(txns, sortKey) {
    const option = get(sortKey);
    return [...txns].sort(option.fn);
  }

  /**
   * Filter transactions by category
   * @param {array} txns - Array of transactions
   * @param {string} category - Category name
   * @returns {array} Filtered array
   */
  function filterByCategory(txns, category) {
    if (!category) return txns;
    return txns.filter(t => t.category === category);
  }

  /**
   * Filter transactions by type (income or expense)
   * @param {array} txns - Array of transactions
   * @param {string} type - 'income', 'expense', or null
   * @returns {array} Filtered array
   */
  function filterByType(txns, type) {
    if (!type) return txns;
    if (type === 'income') return txns.filter(t => t.amount > 0);
    if (type === 'expense') return txns.filter(t => t.amount < 0);
    return txns;
  }

  /**
   * Search transactions by merchant and notes
   * @param {array} txns - Array of transactions
   * @param {string} query - Search query
   * @returns {array} Filtered array
   */
  function search(txns, query) {
    if (!query || query.trim() === '') return txns;
    const lower = query.toLowerCase().trim();
    return txns.filter(
      t =>
        t.merchant.toLowerCase().includes(lower) ||
        (t.notes && t.notes.toLowerCase().includes(lower))
    );
  }

  /**
   * Apply multiple filters at once
   * @param {array} txns - Array of transactions
   * @param {object} filters - Filter object { category, type, search }
   * @returns {array} Filtered array
   */
  function apply(txns, filters = {}) {
    let result = txns;

    if (filters.category) {
      result = filterByCategory(result, filters.category);
    }

    if (filters.type) {
      result = filterByType(result, filters.type);
    }

    if (filters.search) {
      result = search(result, filters.search);
    }

    return result;
  }

  /**
   * Get sort option keys and labels for UI
   * @returns {array} Array of { key, label } objects
   */
  function getOptionsList() {
    return Object.entries(SORT_OPTIONS).map(([key, option]) => ({
      key,
      label: option.label,
    }));
  }

  return {
    getOptions,
    get,
    sort,
    filterByCategory,
    filterByType,
    search,
    apply,
    getOptionsList,
  };

})();

export default Sorting;
