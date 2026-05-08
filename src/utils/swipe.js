// ============================================================
// swipe.js
// Touch swipe handler for mobile interactions.
// Detects left swipe on transaction rows to reveal delete action.
// ============================================================

const Swipe = (() => {

  const SWIPE_THRESHOLD = 50; // Minimum pixels to consider a swipe
  const SWIPE_TIME_THRESHOLD = 300; // Maximum milliseconds for a swipe

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  /**
   * Initialize swipe handlers on a container
   * @param {string} containerSelector - CSS selector for the container
   * @param {function} onSwipeLeft - Callback when swiped left
   */
  function init(containerSelector, onSwipeLeft) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('touchstart', e => _handleTouchStart(e), false);
    container.addEventListener('touchmove', e => _handleTouchMove(e), false);
    container.addEventListener('touchend', e => _handleTouchEnd(e, onSwipeLeft), false);
  }

  function _handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }

  function _handleTouchMove(e) {
    // Prevent default scrolling behavior if swiping
    const touchCurrentX = e.touches[0].clientX;
    const diffX = touchStartX - touchCurrentX;

    // Only prevent default if swiping horizontally (left)
    if (Math.abs(diffX) > 10) {
      e.preventDefault();
    }
  }

  function _handleTouchEnd(e, onSwipeLeft) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);
    const timeDiff = touchEndTime - touchStartTime;

    // Detect left swipe (positive diffX means swiped left)
    const isSwipeLeft = diffX > SWIPE_THRESHOLD && diffY < 50 && timeDiff < SWIPE_TIME_THRESHOLD;

    if (isSwipeLeft) {
      // Find the transaction row that was swiped
      let target = e.target;
      while (target && !target.classList.contains('transaction-row')) {
        target = target.parentElement;
      }

      if (target && onSwipeLeft) {
        onSwipeLeft(target);
      }
    }
  }

  /**
   * Open (swipe reveal) a transaction row
   * @param {HTMLElement} rowElement - The transaction row element
   */
  function openRow(rowElement) {
    // Close other open rows first
    document.querySelectorAll('.transaction-row.swiped').forEach(row => {
      if (row !== rowElement) {
        closeRow(row);
      }
    });

    rowElement.classList.add('swiped');
  }

  /**
   * Close (reset) a transaction row
   * @param {HTMLElement} rowElement - The transaction row element
   */
  function closeRow(rowElement) {
    rowElement.classList.remove('swiped');
  }

  /**
   * Toggle row swipe state
   * @param {HTMLElement} rowElement - The transaction row element
   */
  function toggleRow(rowElement) {
    if (rowElement.classList.contains('swiped')) {
      closeRow(rowElement);
    } else {
      openRow(rowElement);
    }
  }

  /**
   * Close all open rows
   */
  function closeAll() {
    document.querySelectorAll('.transaction-row.swiped').forEach(row => {
      closeRow(row);
    });
  }

  return { init, openRow, closeRow, toggleRow, closeAll };

})();

export default Swipe;
