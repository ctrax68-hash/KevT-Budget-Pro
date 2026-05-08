// ============================================================
// utils.js
// Pure utility functions. No side effects. No DOM access.
// ============================================================

import UUID from './uuid.js';

  // ── VALIDATION ENGINE ─────────────────────────────────────

  function validate(value, rules) {
    const errors = [];

    for (const rule of rules) {
      const { type, params, message } = rule;

      switch (type) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            errors.push(message || 'This field is required');
          }
          break;

        case 'min':
          if (typeof value === 'number' && value < params.min) {
            errors.push(message || `Must be at least ${params.min}`);
          }
          break;

        case 'max':
          if (typeof value === 'number' && value > params.max) {
            errors.push(message || `Must not exceed ${params.max}`);
          }
          break;

        case 'minLength':
          if (typeof value === 'string' && value.length < params.minLength) {
            errors.push(message || `Must be at least ${params.minLength} characters`);
          }
          break;

        case 'maxLength':
          if (typeof value === 'string' && value.length > params.maxLength) {
            errors.push(message || `Must not exceed ${params.maxLength} characters`);
          }
          break;

        case 'pattern':
          if (typeof value === 'string' && !params.pattern.test(value)) {
            errors.push(message || 'Invalid format');
          }
          break;

        case 'enum':
          if (!params.values.includes(value)) {
            errors.push(message || `Must be one of: ${params.values.join(', ')}`);
          }
          break;

        case 'custom':
          if (!params.fn(value)) {
            errors.push(message || 'Invalid value');
          }
          break;

        default:
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ── VALIDATION SCHEMAS ────────────────────────────────────

  const schemas = {
    transaction: {
      amount: [
        { type: 'required', message: 'Amount is required' },
        { type: 'min', params: { min: 0.01 }, message: 'Amount must be greater than 0' },
        { type: 'max', params: { max: 999999 }, message: 'Amount is too large' },
      ],
      merchant: [
        { type: 'required', message: 'Merchant is required' },
        { type: 'minLength', params: { minLength: 1 }, message: 'Merchant name is required' },
        { type: 'maxLength', params: { maxLength: 100 }, message: 'Merchant name too long' },
      ],
      category: [
        { type: 'required', message: 'Category is required' },
        // Category validation will be handled separately by Categories.getNames()
      ],
      date: [
        { type: 'required', message: 'Date is required' },
        {
          type: 'custom',
          params: {
            fn: d => !isNaN(new Date(d).getTime()),
          },
          message: 'Invalid date',
        },
      ],
      notes: [
        { type: 'maxLength', params: { maxLength: 500 }, message: 'Notes too long' },
      ],
    },

    budget: {
      amount: [
        { type: 'required', message: 'Budget amount is required' },
        { type: 'min', params: { min: 0 }, message: 'Budget must be 0 or greater' },
        { type: 'max', params: { max: 999999 }, message: 'Budget is too large' },
      ],
    },

    goal: {
      name: [
        { type: 'required', message: 'Goal name is required' },
        { type: 'minLength', params: { minLength: 1 }, message: 'Goal name required' },
        { type: 'maxLength', params: { maxLength: 100 }, message: 'Goal name too long' },
      ],
      target: [
        { type: 'required', message: 'Target amount is required' },
        { type: 'min', params: { min: 0.01 }, message: 'Target must be greater than 0' },
        { type: 'max', params: { max: 999999 }, message: 'Target is too large' },
      ],
      deadline: [
        { type: 'required', message: 'Deadline is required' },
        {
          type: 'custom',
          params: {
            fn: d => !isNaN(new Date(d).getTime()),
          },
          message: 'Invalid date',
        },
      ],
    },
  };

  function getSchema(type) {
    return schemas[type] || {};
  }

  function validateTransaction(tx) {
    const schema = schemas.transaction;
    const results = {};
    for (const field of Object.keys(schema)) {
      results[field] = validate(tx[field], schema[field]);
    }
    const valid = Object.values(results).every(r => r.valid);
    return { valid, errors: results };
  }

  function validateBudget(budget) {
    const schema = schemas.budget;
    const results = {};
    for (const field of Object.keys(schema)) {
      results[field] = validate(budget[field], schema[field]);
    }
    const valid = Object.values(results).every(r => r.valid);
    return { valid, errors: results };
  }

  function validateGoal(goal) {
    const schema = schemas.goal;
    const results = {};
    for (const field of Object.keys(schema)) {
      results[field] = validate(goal[field], schema[field]);
    }
    const valid = Object.values(results).every(r => r.valid);
    return { valid, errors: results };
  }

  // ── UUID ──────────────────────────────────────────────────
  function uuid() {
    return UUID.generate();
  }

  function uuidValidate(id) {
    return UUID.validate(id);
  }

  // ── Currency ──────────────────────────────────────────────
  function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // ── Date ──────────────────────────────────────────────────
  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function currentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function monthKey(year, month) {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }

  // ── Array helpers ─────────────────────────────────────────
  function groupBy(arr, keyFn) {
    return arr.reduce((acc, item) => {
      const k = keyFn(item);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {});
  }

  function sortBy(arr, keyFn, dir = 'asc') {
    return [...arr].sort((a, b) => {
      const ka = keyFn(a);
      const kb = keyFn(b);
      if (ka < kb) return dir === 'asc' ? -1 : 1;
      if (ka > kb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return {
    validate,
    getSchema,
    validateTransaction,
    validateBudget,
    validateGoal,
    uuid,
    uuidValidate,
    formatCurrency,
    formatDate,
    currentMonthKey,
    monthKey,
    groupBy,
    sortBy,
  };

})();

export default Utils;
