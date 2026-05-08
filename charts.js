// ============================================================
// charts.js
// Chart.js wrapper with Apple-style defaults.
// ============================================================

import('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js').then(module => {
  window.Chart = module.default;
});

const Charts = (() => {

  const APPLE_DEFAULTS = {
    font: {
      family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
      size: 13,
      weight: 500,
    },
    colors: {
      text: 'var(--color-text-primary)',
      border: 'var(--color-border)',
      grid: 'rgba(0,0,0,0.05)',
    },
  };

  /**
   * Create a pie chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {object} config - Chart configuration
   * @returns {Chart} Chart instance
   */
  function createPieChart(canvas, config) {
    if (!window.Chart) {
      console.warn('Chart.js not loaded yet');
      return null;
    }

    return new window.Chart(canvas, {
      type: 'doughnut',
      data: config,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: APPLE_DEFAULTS.font,
              color: APPLE_DEFAULTS.colors.text,
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { ...APPLE_DEFAULTS.font, weight: 600 },
            bodyFont: APPLE_DEFAULTS.font,
            padding: 12,
            cornerRadius: 8,
            caretPadding: 10,
          },
        },
      },
    });
  }

  /**
   * Create a bar chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {object} config - Chart configuration
   * @returns {Chart} Chart instance
   */
  function createBarChart(canvas, config) {
    if (!window.Chart) {
      console.warn('Chart.js not loaded yet');
      return null;
    }

    return new window.Chart(canvas, {
      type: 'bar',
      data: config,
      options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { ...APPLE_DEFAULTS.font, weight: 600 },
            bodyFont: APPLE_DEFAULTS.font,
            padding: 12,
            cornerRadius: 8,
            caretPadding: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: APPLE_DEFAULTS.colors.grid,
              drawBorder: false,
            },
            ticks: {
              font: APPLE_DEFAULTS.font,
              color: APPLE_DEFAULTS.colors.text,
              callback: (value) => {
                return '$' + value.toFixed(0);
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: APPLE_DEFAULTS.font,
              color: APPLE_DEFAULTS.colors.text,
            },
          },
        },
      },
    });
  }

  /**
   * Create a line chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {object} config - Chart configuration
   * @returns {Chart} Chart instance
   */
  function createLineChart(canvas, config) {
    if (!window.Chart) {
      console.warn('Chart.js not loaded yet');
      return null;
    }

    return new window.Chart(canvas, {
      type: 'line',
      data: config,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: APPLE_DEFAULTS.font,
              color: APPLE_DEFAULTS.colors.text,
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { ...APPLE_DEFAULTS.font, weight: 600 },
            bodyFont: APPLE_DEFAULTS.font,
            padding: 12,
            cornerRadius: 8,
            caretPadding: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: APPLE_DEFAULTS.colors.grid,
              drawBorder: false,
            },
            ticks: {
              font: APPLE_DEFAULTS.font,
              color: APPLE_DEFAULTS.colors.text,
              callback: (value) => {
                return '$' + value.toFixed(0);
              },
            },
          },
          x: {
            grid: {
              color: APPLE_DEFAULTS.colors.grid,
              drawBorder: false,
            },
            ticks: {
              font: APPLE_DEFAULTS.font,
              color: APPLE_DEFAULTS.colors.text,
            },
          },
        },
      },
    });
  }

  return {
    createPieChart,
    createBarChart,
    createLineChart,
  };

})();

export default Charts;
