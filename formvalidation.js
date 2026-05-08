// ============================================================
// formvalidation.js
// Form validation display and error management.
// ============================================================

const FormValidation = (() => {

  /**
   * Display form errors inline under fields
   * @param {string} formId - ID of the form element
   * @param {object} errors - Errors object from validation { field: ['error1', 'error2'] }
   */
  function displayErrors(formId, errors) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Clear all previous error messages
    form.querySelectorAll('.form-error-message').forEach(el => el.remove());
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    // Display new errors
    if (!errors || Object.keys(errors).length === 0) return;

    for (const [fieldName, errorList] of Object.entries(errors)) {
      if (!errorList || errorList.length === 0) continue;

      // Find input by name (handle both regular and prefixed names)
      let input = form.querySelector(`[name="${fieldName}"]`);
      if (!input) {
        input = form.querySelector(`[name="edit-${fieldName}"]`);
      }
      if (!input) {
        input = form.querySelector(`[name="add-${fieldName}"]`);
      }

      if (!input) continue;

      // Add error class to input
      input.classList.add('input-error');

      // Find parent form-group
      let formGroup = input.closest('.form-group');
      if (!formGroup) {
        // If no form-group, create temporary wrapper
        formGroup = input.closest('div') || input.parentElement;
      }

      if (!formGroup) continue;

      // Insert error message after input
      const errorMessage = document.createElement('div');
      errorMessage.className = 'form-error-message';
      errorMessage.textContent = errorList[0]; // Show first error
      input.parentElement.insertBefore(errorMessage, input.nextSibling);
    }
  }

  /**
   * Clear errors from a specific field or all fields
   * @param {string} formId - ID of the form element
   * @param {string} fieldName - Optional field name to clear (if omitted, clears all)
   */
  function clearErrors(formId, fieldName) {
    const form = document.getElementById(formId);
    if (!form) return;

    if (fieldName) {
      // Clear specific field
      let input = form.querySelector(`[name="${fieldName}"]`);
      if (!input) input = form.querySelector(`[name="edit-${fieldName}"]`);
      if (!input) input = form.querySelector(`[name="add-${fieldName}"]`);

      if (input) {
        input.classList.remove('input-error');
        const errorMsg = input.parentElement.querySelector('.form-error-message');
        if (errorMsg) errorMsg.remove();
      }
    } else {
      // Clear all fields
      form.querySelectorAll('.form-error-message').forEach(el => el.remove());
      form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }
  }

  /**
   * Set up auto-clear on field input
   * @param {string} formId - ID of the form element
   */
  function setupAutoClear(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Add input event listeners to all inputs
    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => {
        clearErrors(formId, input.name);
      });

      input.addEventListener('change', () => {
        clearErrors(formId, input.name);
      });
    });
  }

  /**
   * Handle form submission with error display
   * @param {HTMLFormElement} form - The form element
   * @param {function} submitFn - Function to call with validation result
   * @param {function} onSuccess - Optional callback on success
   */
  function handleSubmit(form, submitFn, onSuccess) {
    // Get form ID
    const formId = form.id;

    // Call submit function (should return { success, errors? })
    const result = submitFn();

    if (result.success) {
      // Clear all errors
      clearErrors(formId);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    } else if (result.errors) {
      // Display field errors
      displayErrors(formId, result.errors);
    }
  }

  return {
    displayErrors,
    clearErrors,
    setupAutoClear,
    handleSubmit,
  };

})();

export default FormValidation;
