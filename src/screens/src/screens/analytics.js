// ============================================================
// screens/analytics.js
// Analytics screen: charts, spending insights, category breakdown.
// ============================================================

import Components from '../components/components.js';
import Actions from '../state/actions.js';
import Utils from '../utils/utils.js';
import Categories from '../utils/categories.js';
import Charts from '../charts/charts.js';

const AnalyticsScreen = (() => {

  function render(state) {
    const { transactions, ui, settings } = state;
    const { activeMonth, activeYear } = ui;
    const { currency } = settings;

    // Get transactions for current month
    let monthTxns = Actions.getTransactions({ month: activeMonth, year: activeYear });

    // Calculate insights
    const income = monthTxns
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTxns
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryBreakdown = _calculateCategoryBreakdown(monthTxns);
    const topCategories = _getTopCategories(categoryBreakdown, 3);

    const content = `
      <div class="screen-content">
        ${_renderHeader()}
        
        ${_renderMonthPicker(activeMonth, activeYear)}
        
        ${_renderSummaryCards(income, expenses, currency)}
        
        ${_renderCategoryBreakdownChart(categoryBreakdown)}
        
        ${_renderIncomeVsExpenseChart(income, expenses)}
        
        ${_renderTopCategoriesInsight(topCategories)}
        
        ${_renderCategoryDetails(categoryBreakdown)}
      </div>
    `;

    // Initialize charts after render
    setTimeout(() => {
      _initCharts(categoryBreakdown, income, expenses);
    }, 100);

    return content;
  }

  function _renderHeader() {
    return Components.Header('Analytics', {
      subtitle: 'Spending insights and trends',
    });
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

  function _renderSummaryCards(income, expenses, currency) {
    const cashFlow = income - expenses;
    const incomeFormatted = Utils.formatCurrency(income, currency);
    const expensesFormatted = Utils.formatCurrency(expenses, currency);
    const flowFormatted = Utils.formatCurrency(cashFlow, currency);
    const flowSign = cashFlow >= 0 ? '+' : '';

    return `
      <div class="analytics-summary-grid px-lg mt-lg">
        <div class="summary-card">
          <div class="summary-icon">📈</div>
          <div class="summary-label">Income</div>
          <div class="summary-amount text-success">+${incomeFormatted}</div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">📉</div>
          <div class="summary-label">Expenses</div>
          <div class="summary-amount text-danger">−${expensesFormatted}</div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">💰</div>
          <div class="summary-label">Cash Flow</div>
          <div class="summary-amount ${cashFlow >= 0 ? 'text-success' : 'text-danger'}">${flowSign}${flowFormatted}</div>
        </div>
      </div>
    `;
  }

  function _renderCategoryBreakdownChart(breakdown) {
    return `
      <div class="chart-section px-lg mt-lg">
        <h3 class="section-title">Spending by Category</h3>
        <div id="category-pie-chart" class="chart-container">
          <canvas id="categoryPieCanvas"></canvas>
        </div>
      </div>
    `;
  }

  function _renderIncomeVsExpenseChart(income, expenses) {
    return `
      <div class="chart-section px-lg mt-lg">
        <h3 class="section-title">Income vs Expenses</h3>
        <div id="income-expense-chart" class="chart-container">
          <canvas id="incomeExpenseCanvas"></canvas>
        </div>
      </div>
    `;
  }

  function _renderTopCategoriesInsight(topCategories) {
    if (topCategories.length === 0) return '';

    return `
      <div class="insight-section px-lg mt-lg">
        <h3 class="section-title">Top Categories</h3>
        <div class="top-categories-list">
          ${topCategories.map((cat, idx) => `
            <div class="top-category-item">
              <div class="top-category-rank">#${idx + 1}</div>
              <div class="top-category-info">
                <div class="top-category-name">
                  ${Categories.getIcon(cat.name)} ${cat.name}
                </div>
                <div class="top-category-bar">
                  <div class="top-category-fill" style="width: ${(idx === 0 ? 100 : (cat.amount / topCategories[0].amount) * 100)}%"></div>
                </div>
              </div>
              <div class="top-category-amount">${Utils.formatCurrency(cat.amount)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function _renderCategoryDetails(breakdown) {
    if (breakdown.length === 0) return '';

    return `
      <div class="category-details-section px-lg mt-lg">
        <h3 class="section-title">Category Details</h3>
        <div class="category-details-list">
          ${breakdown.map(cat => `
            <div class="category-detail-item">
              <div class="category-detail-icon" style="background-color: ${Categories.getColor(cat.name)}30;">
                ${Categories.getIcon(cat.name)}
              </div>
              <div class="category-detail-info">
                <div class="category-detail-name">${cat.name}</div>
                <div class="category-detail-count">${cat.count} transaction${cat.count !== 1 ? 's' : ''}</div>
              </div>
              <div class="category-detail-amount">${Utils.formatCurrency(cat.amount)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function _calculateCategoryBreakdown(transactions) {
    const breakdown = {};

    transactions.forEach(tx => {
      if (tx.amount < 0) { // Only expenses
        if (!breakdown[tx.category]) {
          breakdown[tx.category] = { name: tx.category, amount: 0, count: 0 };
        }
        breakdown[tx.category].amount += Math.abs(tx.amount);
        breakdown[tx.category].count++;
      }
    });

    return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
  }

  function _getTopCategories(breakdown, limit) {
    return breakdown.slice(0, limit);
  }

  function _initCharts(breakdown, income, expenses) {
    _initCategoryPieChart(breakdown);
    _initIncomeExpenseChart(income, expenses);
  }

  function _initCategoryPieChart(breakdown) {
    const canvas = document.getElementById('categoryPieCanvas');
    if (!canvas) return;

    const colors = breakdown.map(cat => Categories.getColor(cat.name));
    const labels = breakdown.map(cat => cat.name);
    const data = breakdown.map(cat => cat.amount);

    Charts.createPieChart(canvas, {
      labels,
      datasets: [{
        label: 'Spending',
        data,
        backgroundColor: colors,
        borderColor: 'var(--color-card)',
        borderWidth: 2,
      }],
    });
  }

  function _initIncomeExpenseChart(income, expenses) {
    const canvas = document.getElementById('incomeExpenseCanvas');
    if (!canvas) return;

    Charts.createBarChart(canvas, {
      labels: ['Income', 'Expenses'],
      datasets: [{
        label: 'Amount',
        data: [income, expenses],
        backgroundColor: ['var(--color-success)', 'var(--color-danger)'],
        borderRadius: 8,
      }],
    });
  }

  return { render };

})();

export default AnalyticsScreen;
