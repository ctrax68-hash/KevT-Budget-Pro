// ============================================================
// components.js
// Factory functions for building reusable UI components.
// All components are pure HTML strings — no DOM mutation.
// ============================================================

const Components = (() => {

  // ── BUTTON ────────────────────────────────────────────────
  function Button(label, options = {}) {
    const {
      variant = 'primary', // primary, secondary, tertiary, danger
      size = 'default', // default, small
      onClick = '',
      disabled = false,
      icon = '',
      iconPosition = 'left', // left, right
      className = '',
    } = options;

    const sizeClass = size === 'small' ? 'btn-small' : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const classes = `btn btn-${variant} ${sizeClass} ${className}`.trim();

    const content = icon
      ? iconPosition === 'left'
        ? `<span>${icon}</span><span>${label}</span>`
        : `<span>${label}</span><span>${icon}</span>`
      : label;

    return `
      <button class="${classes}" ${disabledAttr} ${onClick ? `onclick="${onClick}"` : ''}>
        ${content}
      </button>
    `;
  }

  // ── CARD ──────────────────────────────────────────────────
  function Card(content, options = {}) {
    const { variant = 'default', className = '' } = options; // default, elevated, subtle
    const variantClass = variant !== 'default' ? `card-${variant}` : '';
    const classes = `card ${variantClass} ${className}`.trim();

    return `
      <div class="${classes}">
        ${content}
      </div>
    `;
  }

  // ── INPUT ─────────────────────────────────────────────────
  function Input(options = {}) {
    const {
      type = 'text',
      name = '',
      placeholder = '',
      value = '',
      disabled = false,
      required = false,
      onChange = '',
      icon = '',
      iconPosition = 'left',
      className = '',
    } = options;

    const iconClass = icon
      ? iconPosition === 'left'
        ? 'input-icon-left'
        : 'input-icon-right'
      : '';
    const classes = `input ${iconClass} ${className}`.trim();
    const disabledAttr = disabled ? 'disabled' : '';
    const requiredAttr = required ? 'required' : '';

    const iconHtml = icon
      ? `<span class="input-icon">${icon}</span>`
      : '';

    return `
      <div style="position: relative;">
        ${iconHtml}
        <input
          class="${classes}"
          type="${type}"
          name="${name}"
          placeholder="${placeholder}"
          value="${value}"
          ${disabledAttr}
          ${requiredAttr}
          ${onChange ? `onchange="${onChange}"` : ''}
        />
      </div>
    `;
  }

  // ── TOGGLE ────────────────────────────────────────────────
  function Toggle(options = {}) {
    const { name = '', checked = false, onChange = '', disabled = false } = options;
    const checkedAttr = checked ? 'checked' : '';
    const disabledAttr = disabled ? 'disabled' : '';

    return `
      <label class="toggle-container">
        <input
          class="toggle-input"
          type="checkbox"
          name="${name}"
          ${checkedAttr}
          ${disabledAttr}
          ${onChange ? `onchange="${onChange}"` : ''}
        />
        <span class="toggle-switch"></span>
      </label>
    `;
  }

  // ── MODAL ─────────────────────────────────────────────────
  function Modal(content, options = {}) {
    const { id = 'modal', onClose = '' } = options;

    return `
      <div class="modal-overlay" id="${id}-overlay" ${onClose ? `onclick="${onClose}"` : ''}>
        <div class="modal" onclick="event.stopPropagation()">
          ${content}
        </div>
      </div>
    `;
  }

  // ── SHEET ─────────────────────────────────────────────────
  function Sheet(content, options = {}) {
    const { id = 'sheet', onClose = '', showHandle = true } = options;

    const handleHtml = showHandle ? '<div class="sheet-handle"></div>' : '';

    return `
      <div class="sheet-overlay" id="${id}-overlay" ${onClose ? `onclick="${onClose}"` : ''}>
        <div class="sheet" onclick="event.stopPropagation()">
          ${handleHtml}
          ${content}
        </div>
      </div>
    `;
  }

  // ── HEADER ────────────────────────────────────────────────
  function Header(title, options = {}) {
    const { subtitle = '', className = '' } = options;
    const classes = `header ${className}`.trim();

    const subtitleHtml = subtitle
      ? `<div class="header-subtitle">${subtitle}</div>`
      : '';

    return `
      <div class="${classes}">
        <h1 class="header-title">${title}</h1>
        ${subtitleHtml}
      </div>
    `;
  }

  // ── SECTION TITLE ─────────────────────────────────────────
  function SectionTitle(title, options = {}) {
    const { subtitle = '' } = options;

    const subtitleHtml = subtitle
      ? `<p class="section-subtitle">${subtitle}</p>`
      : '';

    return `
      <div class="section-title">
        ${title}
        ${subtitleHtml}
      </div>
    `;
  }

  // ── TRANSACTION ROW ───────────────────────────────────────
  function TransactionRow(tx, options = {}) {
    const { onClick = '', onDelete = '' } = options;

    const amountClass = tx.amount > 0 ? 'income' : 'expense';
    const amountSign = tx.amount > 0 ? '+' : '';
    const amountStr = `${amountSign}$${Math.abs(tx.amount).toFixed(2)}`;

    const deleteBtn = onDelete
      ? `<div class="transaction-row-actions" onclick="event.stopPropagation(); ${onDelete}">🗑</div>`
      : '';

    return `
      <div class="transaction-row" ${onClick ? `onclick="${onClick}"` : ''}>
        <div class="transaction-icon" style="background-color: ${tx.categoryColor || '#E5E5EA'}">
          ${tx.categoryIcon || '💰'}
        </div>
        <div class="transaction-content">
          <div class="transaction-merchant">${tx.merchant}</div>
          <div class="transaction-date">${tx.date}</div>
        </div>
        <div class="transaction-amount ${amountClass}">
          ${amountStr}
        </div>
        ${deleteBtn}
      </div>
    `;
  }

  // ── PROGRESS BAR ──────────────────────────────────────────
  function ProgressBar(percent, options = {}) {
    const { label = '', className = '' } = options;
    const classes = `progress-labeled ${className}`.trim();

    const labelHtml = label
      ? `
        <span class="progress-label">${label}</span>
        <div class="progress-container flex-1">
          <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
        <span class="progress-label">${percent}%</span>
      `
      : `
        <div class="progress-container w-full">
          <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
      `;

    return `<div class="${classes}">${labelHtml}</div>`;
  }

  // ── BADGE ─────────────────────────────────────────────────
  function Badge(text, options = {}) {
    const { variant = 'primary' } = options; // primary, secondary, danger, success
    return `<span class="badge badge-${variant}">${text}</span>`;
  }

  // ── DIVIDER ───────────────────────────────────────────────
  function Divider(options = {}) {
    const { text = '' } = options;
    return text
      ? `<div class="divider-text">${text}</div>`
      : `<div class="divider"></div>`;
  }

  // ── EMPTY STATE ───────────────────────────────────────────
  function EmptyState(options = {}) {
    const { icon = '📭', title = 'No items', text = 'Add something to get started' } = options;

    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-text">${text}</p>
      </div>
    `;
  }

  // ── FORM GROUP ────────────────────────────────────────────
  function FormGroup(input, options = {}) {
    const { label = '', help = '', error = '' } = options;

    const labelHtml = label ? `<label class="form-label">${label}</label>` : '';
    const helpHtml = help && !error ? `<small class="form-help">${help}</small>` : '';
    const errorHtml = error ? `<small class="form-error">${error}</small>` : '';

    return `
      <div class="form-group">
        ${labelHtml}
        ${input}
        ${helpHtml}
        ${errorHtml}
      </div>
    `;
  }

  return {
    Button,
    Card,
    Input,
    Toggle,
    Modal,
    Sheet,
    Header,
    SectionTitle,
    TransactionRow,
    ProgressBar,
    Badge,
    Divider,
    EmptyState,
    FormGroup,
  };

})();

export default Components;
