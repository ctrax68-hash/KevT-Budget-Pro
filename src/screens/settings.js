// ============================================================
// screens/settings.js
// Settings screen: budget, currency, theme, data management.
// ============================================================

import Components from '../components/components.js';
import Actions from '../state/actions.js';
import Utils from '../utils/utils.js';
import Categories from '../utils/categories.js';
import DarkMode from '../utils/darkmode.js';
import AccentColor from '../utils/accentcolor.js';
import FormValidation from '../utils/formvalidation.js';

const SettingsScreen = (() => {

  function render(state) {
    const { budgets, settings, ui } = state;
    const { currency, darkMode } = settings;
    const monthlyBudget = budgets.monthly || 0;
    const categoryBudgets = budgets.categories || {};

    const content = `
      <div class="screen-content">
        ${_renderHeader()}
        
        ${_renderMonthlyBudgetSection(monthlyBudget)}
        
        ${_renderCategoryBudgetsSection(categoryBudgets)}
        
        ${_renderSettingsSection(currency, darkMode)}
        
        ${_renderDataSection()}
      </div>

      ${_renderBudgetInputSheet()}
      ${_renderCategoryBudgetSheet()}
    `;

    // Initialize form setup after render
    setTimeout(() => {
      _initFormHandlers();
    }, 0);

    return content;
  }

  function _renderHeader() {
    return Components.Header('Settings', {
      subtitle: 'Manage your budget and preferences',
    });
  }

  function _renderMonthlyBudgetSection(monthlyBudget) {
    return `
      <div class="form-section px-lg">
        <h3 class="form-section-title">Monthly Budget</h3>
        
        <div class="budget-display-card">
          <div class="budget-amount">${Utils.formatCurrency(monthlyBudget)}</div>
          <div class="budget-label">Monthly Limit</div>
        </div>

        ${Components.Button('Edit Budget', {
          variant: 'primary',
          onClick: 'openBudgetInput()',
          className: 'w-full mt-lg',
        })}

        <div class="text-caption text-secondary mt-md">
          Set a target for your total monthly spending. Your home screen will show progress and remaining balance.
        </div>
      </div>
    `;
  }

  function _renderCategoryBudgetsSection(categoryBudgets) {
    const categories = Categories.getNames();
    const budgetsSet = Object.keys(categoryBudgets).length;

    return `
      <div class="form-section px-lg">
        <div class="flex items-center justify-between mb-lg">
          <h3 class="form-section-title">Category Budgets</h3>
          <span class="badge badge-secondary">${budgetsSet} set</span>
        </div>

        ${budgetsSet > 0 ? `
          <div class="category-budgets-list">
            ${Object.entries(categoryBudgets)
              .map(([cat, amount]) => `
                <div class="category-budget-item">
                  <div class="flex items-center gap-md flex-1">
                    <span class="text-lg">${Categories.getIcon(cat)}</span>
                    <div>
                      <div class="text-body-small font-semibold">${cat}</div>
                      <div class="text-caption text-secondary">${Utils.formatCurrency(amount)}</div>
                    </div>
                  </div>
                  <button class="btn btn-tertiary btn-small" onclick="editCategoryBudget('${cat}')">
                    ✏️ Edit
                  </button>
                </div>
              `)
              .join('')}
          </div>
        ` : `
          <div class="text-caption text-secondary">No category budgets set yet</div>
        `}

        ${Components.Button('Add Category Budget', {
          variant: 'primary',
          onClick: 'openCategoryBudgetInput()',
          className: 'w-full mt-lg',
        })}

        <div class="text-caption text-secondary mt-md">
          Set budgets for specific spending categories. You'll get alerts when you exceed them.
        </div>
      </div>
    `;
  }

  function _renderSettingsSection(currency, darkMode) {
    return `
      <div class="form-section px-lg">
        <h3 class="form-section-title">Preferences</h3>

        <div class="form-group">
          <label class="form-label">Currency</label>
          <select class="input" onchange="Actions.updateSettings({ currency: this.value })" style="appearance: auto;">
            <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD ($)</option>
            <option value="EUR" ${currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
            <option value="GBP" ${currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
            <option value="CAD" ${currency === 'CAD' ? 'selected' : ''}>CAD ($)</option>
            <option value="AUD" ${currency === 'AUD' ? 'selected' : ''}>AUD ($)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Dark Mode</label>
          <div class="flex items-center gap-md">
            ${Components.Toggle({
              name: 'darkMode',
              checked: darkMode || false,
              onChange: 'DarkMode.toggle()',
            })}
            <span class="text-body-small text-secondary">${darkMode ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div class="text-caption text-secondary mt-sm">Uses your system preference if disabled</div>
        </div>

        <div class="form-group">
          <label class="form-label">Accent Color</label>
          <div class="accent-color-grid">
            ${AccentColor.getColors()
              .map(color => `
                <button 
                  class="accent-color-button" 
                  style="background-color: ${color.hex}"
                  onclick="AccentColor.set('${color.name}')"
                  title="${color.label}"
                ></button>
              `)
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  function _renderDataSection() {
    return `
      <div class="form-section px-lg">
        <h3 class="form-section-title">Data</h3>

        ${Components.Button('Export as CSV', {
          variant: 'secondary',
          onClick: 'exportDataAsCSV()',
          className: 'w-full',
        })}

        ${Components.Button('Import from CSV', {
          variant: 'secondary',
          onClick: 'document.getElementById("csv-file-input").click()',
          className: 'w-full mt-md',
        })}

        ${Components.Button('Clear All Data', {
          variant: 'danger',
          onClick: 'clearAllDataConfirm()',
          className: 'w-full mt-md',
        })}

        <input type="file" id="csv-file-input" accept=".csv" style="display:none" onchange="importDataFromCSV(event)">

        <div class="text-caption text-secondary mt-lg">
          Export your transactions to backup or analyze. Import to restore from a file. Clearing data cannot be undone.
        </div>
      </div>
    `;
  }

  function _renderBudgetInputSheet() {
    return `
      <div id="budget-input-overlay" class="sheet-overlay" onclick="closeBudgetInput()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Set Monthly Budget</h2>
          
          <form id="budget-form" onsubmit="submitBudgetInput(event)">
            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'number',
                  name: 'monthly-budget',
                  placeholder: '0.00',
                  required: true,
                  icon: '$',
                  iconPosition: 'left',
                }),
                {
                  label: 'Monthly Budget',
                  help: 'Your total monthly spending limit',
                }
              )}
            </div>

            <div class="flex gap-md mt-2xl">
              ${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeBudgetInput()',
              })}
              ${Components.Button('Save', {
                variant: 'primary',
                onClick: '',
              })}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function _renderCategoryBudgetSheet() {
    return `
      <div id="category-budget-overlay" class="sheet-overlay" onclick="closeCategoryBudgetInput()">
        <div class="sheet" onclick="event.stopPropagation()">
          <div class="sheet-handle"></div>
          
          <h2 class="text-title mb-lg">Category Budget</h2>
          
          <form id="category-budget-form" onsubmit="submitCategoryBudgetInput(event)">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select name="cat-budget-category" class="input" required style="appearance: auto;">
                <option value="">Select category</option>
                ${Categories.getNames()
                  .map(cat => `<option value="${cat}">${Categories.getIcon(cat)} ${cat}</option>`)
                  .join('')}
              </select>
            </div>

            <div class="form-group">
              ${Components.FormGroup(
                Components.Input({
                  type: 'number',
                  name: 'cat-budget-amount',
                  placeholder: '0.00',
                  required: true,
                  icon: '$',
                  iconPosition: 'left',
                }),
                {
                  label: 'Budget',
                  help: 'Max spending for this category',
                }
              )}
            </div>

            <div class="flex gap-md mt-2xl">
              ${Components.Button('Cancel', {
                variant: 'secondary',
                onClick: 'closeCategoryBudgetInput()',
              })}
              ${Components.Button('Save', {
                variant: 'primary',
                onClick: '',
              })}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function _initFormHandlers() {
    FormValidation.setupAutoClear('budget-form');
    FormValidation.setupAutoClear('category-budget-form');
  }

  return { render };

})();

export default SettingsScreen;

  function _renderDataSection() {
    return `
      <div class="form-section px-lg">
        <h3 class="form-section-title">Data</h3>

        ${Components.Button('Export as CSV', {
          variant: 'secondary',
          onClick: 'exportDataAsCSV()',
          className: 'w-full',
        })}

        ${Components.Button('Import from CSV', {
          variant: 'secondary',
          onClick: 'document.getElementById("csv-file-input").click()',
          className: 'w-full mt-md',
        })}

        ${Components.Button('Clear All Data', {
          variant: 'danger',
          onClick: 'clearAllDataConfirm()',
          className: 'w-full mt-md',
        })}

        <input type="file" id="csv-file-input" accept=".csv" style="display:none" onchange="importDataFromCSV(event)">

        <div class="text-caption text-secondary mt-lg">
          Export your transactions to backup or analyze. Import to restore from a file. Clearing data cannot be undone.
        </div>
      </div>
    `;
  }
