// ============================================================
// recurring.js
// Recurring transaction generation and management.
// ============================================================

const Recurring = (() => {

  const FREQUENCIES = {
    daily: {
      label: 'Daily',
      days: 1,
    },
    weekly: {
      label: 'Weekly',
      days: 7,
    },
    biweekly: {
      label: 'Every 2 Weeks',
      days: 14,
    },
    monthly: {
      label: 'Monthly',
      days: 30,
    },
    quarterly: {
      label: 'Quarterly',
      days: 90,
    },
    yearly: {
      label: 'Yearly',
      days: 365,
    },
  };

  /**
   * Generate recurring transactions for a date range
   * @param {object} recurringTx - Recurring transaction template
   * @param {date} startDate - Start of range
   * @param {date} endDate - End of range
   * @returns {array} Array of generated transactions
   */
  function generate(recurringTx, startDate, endDate) {
    const { frequency, amount, merchant, category, notes, startDate: txStart } = recurringTx;
    const freq = FREQUENCIES[frequency];

    if (!freq) {
      console.warn(`Unknown frequency: ${frequency}`);
      return [];
    }

    const transactions = [];
    let currentDate = new Date(txStart);

    while (currentDate <= endDate) {
      if (currentDate >= startDate) {
        transactions.push({
          amount,
          merchant,
          category,
          notes,
          date: currentDate.toISOString(),
          recurring: true,
        });
      }

      // Move to next occurrence
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + freq.days);
    }

    return transactions;
  }

  /**
   * Get all frequency options
   * @returns {object} Frequency options
   */
  function getFrequencies() {
    return FREQUENCIES;
  }

  /**
   * Get frequency names for UI
   * @returns {array} Array of { key, label } objects
   */
  function getFrequencyList() {
    return Object.entries(FREQUENCIES).map(([key, data]) => ({
      key,
      label: data.label,
    }));
  }

  /**
   * Calculate next occurrence date
   * @param {date} fromDate - Date to calculate from
   * @param {string} frequency - Frequency key
   * @returns {date} Next occurrence date
   */
  function nextOccurrence(fromDate, frequency) {
    const freq = FREQUENCIES[frequency];
    if (!freq) return null;

    const next = new Date(fromDate);
    next.setDate(next.getDate() + freq.days);
    return next;
  }

  /**
   * Check if transaction is recurring
   * @param {object} tx - Transaction object
   * @returns {boolean} True if transaction is marked as recurring
   */
  function isRecurring(tx) {
    return tx.recurring === true;
  }

  return {
    generate,
    getFrequencies,
    getFrequencyList,
    nextOccurrence,
    isRecurring,
  };

})();

export default Recurring;
