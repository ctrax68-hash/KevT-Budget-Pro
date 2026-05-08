// ============================================================
// screens/home.js
// Home screen: displays transactions, cash flow summary, add button.
// ============================================================

import Components from '../components/components.js';
import Actions from '../state/actions.js';
import Utils from '../utils/utils.js';
import Categories from '../utils/categories.js';
import Swipe from '../utils/swipe.js';
import Sorting from '../utils/sorting.js';
import FormValidation from '../utils/formvalidation.js';

const HomeScreen = (() => {

  function render(state) {
    const { transactions, budgets, ui, settings } = state;
    const { activeMonth, activeYear, sort = 'date-desc', filterCategory, filterType, searchQuery } = ui;

    // Get transactions for current month
    let monthTxns = Actions.getTransactions({ month: activeMonth, year: activeYear });

    // Apply filters
    monthTxns = Sorting.apply(monthTxns, {
      category: filterCategory,
      type: filterType,
      search: searchQuery,
    });

    // Apply sorting
    monthTxns = Sorting.sort(monthTxns, sort);

    // Calculate totals from FILTERED transactions
    const income = monthTxns
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const cashFlow = income - expenses;

    // Month label
    const monthLabel = new Date(activeYear, activeMonth).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    // Build content
    const content = `
      <div class="screen-content">
        ${_renderMonthPicker(activeMonth, activeYear)}
        
        ${_renderCashFlowCard(cashFlow, income, expenses, settings.currency)}
        
        ${_renderBudgetSummary(budgets, expenses, activeMonth)}
        
        <div class="section-title">Recent Transactions</div>
        
        ${_renderSortAndFilter(sort, filterCategory, filterType, searchQuery)}
        
        <div id="transaction-list" class="transaction-list">
          ${monthTxns.length > 0
            ? monthTxns.map(tx => _renderTransactionRow(tx)).join('')
            : Components.EmptyState({ 
                icon: '💸',
                title: 'No transactions',
                text: filterCategory || filterType || searchQuery ? 'Try adjusting your filters' : 'Add one to get started',
              })
          }
        </div>
      </div>

      ${_renderAddTransactionSheet()}

      ${_renderEditTransactionSheet()}
    `;

    // Store result in variable so we can initialize swipe after
    const result = content;

    // Initialize swipe handlers after a microtask so DOM is ready
    setTimeout(() => {
      _initSwipeHandlers();
    }, 0);

    return result;
  }

  function _renderMonthPicker(month, year) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const current = new Date();
    const isCurrentMonth = month === current.getMonth() && year === current.getFullYear();

    return `
      <div class="month-picker flex items-center justify-between p-lg">
        <button 
          class="btn btn-tertiary btn-small" 
          onclick="Actions.setActiveMonth(${(month - 1 + 12) % 12}); Actions.setActiveYear(${month === 0 ? year - 1 : year})"
        >
          ← Prev
        </button>
        <div class="text-center">
          <div class="text-secondary text-caption">VIEWING</div>
          <div class="text-primary font-semibold">${months[month]} ${year}</div>
        </div>
        <button 
          class="btn btn-tertiary btn-small" 
          onclick="Actions.setActiveMonth(${(month + 1) % 12}); Actions.setActiveYear(${month === 11 ? year + 1 : year})"
          ${isCurrentMonth ? 'disabled' : ''}
        >
          Next →
        </button>
      </div>
    `;
  }

  function _renderCashFlowCard(cf, inc, exp, currency) {
    const sign = cf >= 0 ? '+' : '';
    const color = cf >= 0 ? 'text-success' : 'text-danger';
    const cfFormatted = `${sign}${Utils.formatCurrency(cf, currency)}`;
    const incFormatted = Utils.formatCurrency(inc, currency);
    const expFormatted = Utils.formatCurrency(exp, currency);

    return Components.Card(`
      <div class="flex flex-col gap-lg">
        <div>
          <div class="text-secondary text-caption">CASH FLOW</div>
          <div class="text-title ${color} mt-sm">${cfFormatted}</div>
        </div>
        <div class="flex gap-lg">
          <div class="flex-1">
            <div class="text-secondary text-caption">INCOME</div>
            <div class="text-body text-success font-semibold mt-xs">+${incFormatted}</div>
          </div>
          <div class="flex-1">
            <div class="text-secondary text-caption">EXPENSES</div>
            <div class="text-body text-danger font-semibold mt-xs">−${expFormatted}</div>
          </div>
        </div>
      </div>
    `, { className: 'mx-lg mt-lg' });
  }

  function _renderSortAndFilter(sort, filterCategory, filterType, searchQuery) {
    const hasFilters = filterCategory || filterType || searchQuery;
    
    return `
      <div class="sort-filter-bar">
        <div class="sort-filter-controls">
          <select class="input sort-select" onchange="Actions.setSort(this.value)" style="appearance: auto;">
            ${Sorting.getOptionsList()
              .map(opt => `<option value="${opt.key}" ${opt.key === sort ? 'selected' : ''}>${opt.label}</option>`)
              .join('')}
          </select>
          
          <button class="btn btn-tertiary btn-small" onclick="document.getElementById('filter-sheet-overlay').classList.add('active'); document.body.style.overflow='hidden';">
            ⚙️ Filters
          </button>
          
          ${hasFilters ? `
            <button class="btn btn-tertiary btn-small" onclick="Actions.clearFilters()">
              ✕ Clear
            </button>
          ` : ''}
        </div>
        
        ${hasFilters ? `
          <div class="filter-tags">
            ${filterCategory ? `<span class="badge badge-secondary">${Categories.getIcon(filterCategory)} ${filterCategory}</span>` : ''}
            ${filterType ? `<span class="badge badge-secondary">${filterType === 'income' ? '📈 Income' : '📉 Expense'}</span>` : ''}
            ${searchQuery ? `<span class="badge badge-secondary">🔍 "${searchQuery}"</span>` : ''}
          </div>
        ` : ''}
      </div>
      
      ${_renderFilterSheet(filterCategory, filterType, searchQuery)}
    `;
  }

  function _renderFilterSheet(filterCategory, filterType, searchQuery) {
    return `
      <div id="filter-sheet-overlay" class="sheet-overlay" onclick="if(event.target.id === 'filter-sheet-overlay') { event.target.classList.remove('active'); document.body.style.overflow='auto'; }">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Filters</h2>
          
          <div class="form-group">
            <label class="form-label">Search</label>
            ${Components.Input({
              type: 'text',
              name: 'search',
              placeholder: 'Merchant or notes...',
              value: searchQuery || '',
              onChange: 'Actions.setSearchQuery(this.value)',
              icon: '🔍',
              iconPosition: 'left',
            })}
          </div>

          <div class="form-group">
            <label class="form-label">Transaction Type</label>
            <div class="filter-option-group">
              ${['income', 'expense', ''].map(type => `
                <label class="filter-option">
                  <input type="radio" name="type" value="${type}" ${filterType === type ? 'checked' : ''} onchange="Actions.setFilterType(this.value || null)">
                  <span>${type === 'income' ? '📈 Income' : type === 'expense' ? '📉 Expense' : 'All Types'}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="input" onchange="Actions.setFilterCategory(this.value || null)" style="appearance: auto;">
              <option value="">All Categories</option>
              ${Categories.getNames()
                .map(cat => `<option value="${cat}" ${filterCategory === cat ? 'selected' : ''}>${Categories.getIcon(cat)} ${cat}</option>`)
                .join('')}
            </select>
          </div>

          <div class="flex gap-md mt-2xl">
            ${Components.Button('Done', {
              variant: 'primary',
              onClick: "document.getElementById('filter-sheet-overlay').classList.remove('active'); document.body.style.overflow='auto';",
            })}
          </div>
        </div>
      </div>
    `;
  }

  function _renderBudgetSummary(budgets, spent, month) {
    const monthly = budgets.monthly || 0;
    const remaining = Math.max(0, monthly - spent);
    const isOverspent = spent > monthly;
    const percent = monthly > 0 ? Math.round((spent / monthly) * 100) : 0;

    if (monthly === 0) return '';

    return `
      <div class="px-lg mt-lg">
        <div class="text-secondary text-caption mb-md">MONTHLY BUDGET</div>
        
        ${_renderProgressBar(percent, monthly, spent, remaining, isOverspent)}
        
        ${isOverspent ? _renderOverspendAlert(spent - monthly) : ''}
      </div>
    `;
  }

  function _renderProgressBar(percent, budget, spent, remaining, isOverspent) {
    const displayPercent = Math.min(percent, 100);
    const progressColor = isOverspent ? 'var(--color-danger)' : 'var(--accent-color)';

    return `
      <div class="budget-progress-section">
        <div class="progress-container" style="background-color: var(--color-bg); height: 12px; border-radius: var(--radius-full); overflow: hidden;">
          <div class="progress-bar" style="background-color: ${progressColor}; height: 100%; width: ${displayPercent}%; transition: width var(--duration-slower) var(--timing-ease-out);"></div>
        </div>
        
        <div class="flex justify-between items-baseline mt-md gap-lg">
          <div>
            <div class="text-caption text-secondary">Spent</div>
            <div class="text-body font-semibold text-primary">${Utils.formatCurrency(spent)}</div>
          </div>
          <div class="text-center">
            <div class="text-caption text-secondary">${displayPercent}%</div>
          </div>
          <div class="text-right">
            <div class="text-caption text-secondary">Budget</div>
            <div class="text-body font-semibold text-primary">${Utils.formatCurrency(budget)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function _renderOverspendAlert(overAmount) {
    return `
      <div class="alert alert-danger mt-md">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Over Budget</div>
          <div class="alert-message">You've spent ${Utils.formatCurrency(overAmount)} more than your monthly limit</div>
        </div>
      </div>
    `;
  }

  function _renderTransactionRow(tx) {
    const date = Utils.formatDate(tx.date);
    const categoryData = Categories.getDisplay(tx.category);

    return Components.TransactionRow(
      {
        ...tx,
        date,
        categoryIcon: categoryData.icon,
        categoryColor: categoryData.color,
      },
      {
        onClick: `openEditTransaction('${tx.id}')`,
        onDelete: `Actions.deleteTransaction('${tx.id}')`,
      }
    );
  }

  function _renderEditTransactionSheet() {
    return `
      <div id="edit-transaction-overlay" class="sheet-overlay" onclick="closeEditTransaction()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Edit Transaction</h2>
          
          <form id="edit-transaction-form" onsubmit="submitEditTransaction(event)">
            ${_renderEditFormFields()}
            
            <div class="flex gap-md mt-2xl">
              ${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeEditTransaction()',
              })}
              ${Components.Button('Save Changes', {
                variant: 'primary',
                onClick: '',
              })}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function _renderEditFormFields() {
    return `
      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'number',
            name: 'edit-amount',
            placeholder: '0.00',
            required: true,
            icon: '$',
            iconPosition: 'left',
          }),
          {
            label: 'Amount',
            help: 'Use negative for expenses',
          }
        )}
      </div>

      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'text',
            name: 'edit-merchant',
            placeholder: 'Coffee Shop',
            required: true,
            icon: '🏪',
            iconPosition: 'left',
          }),
          {
            label: 'Merchant',
            help: 'Where did you spend or earn this?',
          }
        )}
      </div>

      <div class="form-group">
        <label class="form-label">Category</label>
        <select name="edit-category" class="input" required style="appearance: auto;">
          <option value="">Select category</option>
          ${Categories.getNames()
            .map(
              cat =>
                `<option value="${cat}">${Categories.getIcon(cat)} ${cat}</option>`
            )
            .join('')}
        </select>
      </div>

      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'date',
            name: 'edit-date',
            required: true,
          }),
          {
            label: 'Date',
          }
        )}
      </div>

      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'text',
            name: 'edit-notes',
            placeholder: 'Optional notes',
            icon: '📝',
            iconPosition: 'left',
          }),
          {
            label: 'Notes',
            help: 'Add any details',
          }
        )}
      </div>

      <div class="form-group mt-lg">
        <label class="form-label text-danger">Danger Zone</label>
        ${Components.Button('Delete This Transaction', {
          variant: 'danger',
          onClick: 'deleteCurrentTransaction()',
          className: 'w-full',
        })}
      </div>
    `;
  }
    return `
      <div id="add-transaction-overlay" class="sheet-overlay" onclick="closeAddTransaction()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Add Transaction</h2>
          
          <form id="add-transaction-form" onsubmit="submitAddTransaction(event)">
            ${_renderFormFields()}
            
            <div class="flex gap-md mt-2xl">
              ${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeAddTransaction()',
              })}
              ${Components.Button('Save', {
                variant: 'primary',
              })}
            </div>
          </form>
        </div>
      </div>

      ${_renderEditTransactionModal()}
    `;
  }

  function _renderEditTransactionModal() {
    return `
      <div id="edit-transaction-overlay" class="sheet-overlay" onclick="closeEditTransaction()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Edit Transaction</h2>
          
          <form id="edit-transaction-form" onsubmit="submitEditTransaction(event)">
            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'number',
                  name: 'edit-amount',
                  placeholder: '0.00',
                  required: true,
                  icon: '$',
                  iconPosition: 'left',
                }),
                {
                  label: 'Amount',
                  help: 'Use negative for expenses',
                }
              )}
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'text',
                  name: 'edit-merchant',
                  placeholder: 'Coffee Shop',
                  required: true,
                  icon: '🏪',
                  iconPosition: 'left',
                }),
                {
                  label: 'Merchant',
                  help: 'Where did you spend or earn this?',
                }
              )}
            </div>

            <div class="form-group">
              <label class="form-label">Category</label>
              <select name="edit-category" class="input" required style="appearance: auto;">
                <option value="">Select category</option>
                ${Categories.getNames()
                  .map(
                    cat =>
                      `<option value="${cat}">${Categories.getIcon(cat)} ${cat}</option>`
                  )
                  .join('')}
              </select>
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'date',
                  name: 'edit-date',
                  required: true,
                }),
                {
                  label: 'Date',
                }
              )}
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'text',
                  name: 'edit-notes',
                  placeholder: 'Optional notes',
                  icon: '📝',
                  iconPosition: 'left',
                }),
                {
                  label: 'Notes',
                  help: 'Add any details',
                }
              )}
            </div>

            <div class="flex gap-md mt-2xl">
              ${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeEditTransaction()',
              })}
              ${Components.Button('Update', {
                variant: 'primary',
              })}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function _initSwipeHandlers() {
    // Initialize swipe detector on transaction list
    Swipe.init('#transaction-list', (rowElement) => {
      Swipe.openRow(rowElement);
    });

    // Close all swipes when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.transaction-row') && !e.target.closest('.transaction-row-actions')) {
        Swipe.closeAll();
      }
    });

    // Setup form error auto-clear on input
    if (document.getElementById('add-transaction-form')) {
      FormValidation.setupAutoClear('add-transaction-form');
    }
    if (document.getElementById('edit-transaction-form')) {
      FormValidation.setupAutoClear('edit-transaction-form');
    }
  }

  function _renderFormFields() {
    return `
      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'number',
            name: 'amount',
            placeholder: '0.00',
            required: true,
            icon: '$',
            iconPosition: 'left',
          }),
          {
            label: 'Amount',
            help: 'Use negative for expenses',
          }
        )}
      </div>

      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'text',
            name: 'merchant',
            placeholder: 'Coffee Shop',
            required: true,
            icon: '🏪',
            iconPosition: 'left',
          }),
          {
            label: 'Merchant',
            help: 'Where did you spend or earn this?',
          }
        )}
      </div>

      <div class="form-group">
        <label class="form-label">Category</label>
        <select name="category" class="input" required style="appearance: auto;">
          <option value="">Select category</option>
          ${Categories.getNames()
            .map(
              cat =>
                `<option value="${cat}">${Categories.getIcon(cat)} ${cat}</option>`
            )
            .join('')}
        </select>
      </div>

      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'date',
            name: 'date',
            required: true,
          }),
          {
            label: 'Date',
          }
        )}
      </div>

      <div class="form-group">
        ${Components.FormGroup(
          Components.Input({
            type: 'text',
            name: 'notes',
            placeholder: 'Optional notes',
            icon: '📝',
            iconPosition: 'left',
          }),
          {
            label: 'Notes',
            help: 'Add any details',
          }
        )}
      </div>
    `;
  }

  return { render };

})();

export default HomeScreen;
