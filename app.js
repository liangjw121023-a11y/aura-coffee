// Aura Artisan Coffee Interactive Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMenuFilters();
  initFinancialSimulator();
});

// Mobile Navigation Toggle
function initNavbar() {
  const toggle = document.getElementById('mobileToggle');
  const links = document.getElementById('navLinks');
  
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('active');
    });

    // Close menu when clicking nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        links.classList.remove('active');
      });
    });
  }
}

// Menu Category Filtering
function initMenuFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Interactive Financial Simulator
let scenarioChart = null;

function initFinancialSimulator() {
  const cupSlider = document.getElementById('cupSlider');
  const spendSlider = document.getElementById('spendSlider');
  const daySlider = document.getElementById('daySlider');

  const cupVal = document.getElementById('cupVal');
  const spendVal = document.getElementById('spendVal');
  const dayVal = document.getElementById('dayVal');

  function update() {
    const cups = parseInt(cupSlider.value, 10);
    const spend = parseInt(spendSlider.value, 10);
    const days = parseInt(daySlider.value, 10);

    cupVal.textContent = `${cups} 杯/天`;
    spendVal.textContent = `NT$ ${spend}`;
    dayVal.textContent = `${days} 天`;

    calculateFinancials(cups, spend, days);
  }

  cupSlider.addEventListener('input', update);
  spendSlider.addEventListener('input', update);
  daySlider.addEventListener('input', update);

  // Initialize Chart
  initChart();

  // Initial calculation
  update();
}

function calculateFinancials(cups, spend, days) {
  // Monthly Gross Revenue
  const monthlyRevenue = cups * spend * days;
  const dailyRevenue = cups * spend;

  // Cost of Goods Sold (approx 28% of revenue for coffee & pastry)
  const cogs = monthlyRevenue * 0.28;

  // Fixed & Semi-Fixed OPEX: Rent (40k) + Labor base (75k) + Utilities (18k) + Marketing/Misc/POS (25k)
  // Slight variable adjustment for busy hours
  let laborExtra = 0;
  if (cups > 90) {
    laborExtra = (cups - 90) * 15 * days * 0.15; // extra part-time barista hours
  }
  const fixedOpex = 120000 + laborExtra;
  const totalCost = cogs + fixedOpex;

  const netProfit = monthlyRevenue - totalCost;
  const marginPct = (netProfit / monthlyRevenue) * 100;

  // Payback calculation based on NT$ 1,000,000 capital
  let paybackMonths = 0;
  if (netProfit > 0) {
    paybackMonths = (1000000 / netProfit).toFixed(1);
  }

  // Update DOM Elements
  document.getElementById('calcRevenue').textContent = formatNTD(monthlyRevenue);
  document.getElementById('calcDailyRevenue').textContent = `每日平均營收: ${formatNTD(dailyRevenue)}`;
  
  const profitEl = document.getElementById('calcNetProfit');
  if (netProfit >= 0) {
    profitEl.textContent = `+${formatNTD(netProfit)}`;
    profitEl.className = 'kpi-number text-success';
  } else {
    profitEl.textContent = `-${formatNTD(Math.abs(netProfit))}`;
    profitEl.className = 'kpi-number text-danger';
  }

  document.getElementById('calcMarginPct').textContent = `${marginPct.toFixed(1)}%`;
  document.getElementById('calcTotalCost').textContent = formatNTD(totalCost);
  document.getElementById('calcCostBreakdown').textContent = 
    `食材銷貨: ${(cogs / 10000).toFixed(1)}萬 | 固定營運: ${(fixedOpex / 10000).toFixed(1)}萬`;

  const paybackEl = document.getElementById('calcPayback');
  if (netProfit <= 0) {
    paybackEl.textContent = '虧損中 (無法回本)';
    paybackEl.className = 'kpi-number text-danger';
  } else if (paybackMonths > 60) {
    paybackEl.textContent = '> 5 年';
    paybackEl.className = 'kpi-number text-gold';
  } else {
    paybackEl.textContent = `~${paybackMonths} 個月`;
    paybackEl.className = 'kpi-number text-gold';
  }

  // Update Chart
  updateChart(monthlyRevenue, totalCost, netProfit);
}

function initChart() {
  const ctx = document.getElementById('liveScenarioChart').getContext('2d');
  
  scenarioChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['月營業額 (Revenue)', '總營運成本 (OPEX)', '每月淨利 (Net Profit)'],
      datasets: [{
        label: '金額 (NT$)',
        data: [405000, 238000, 167000],
        backgroundColor: [
          'rgba(212, 163, 89, 0.85)',
          'rgba(239, 83, 80, 0.85)',
          'rgba(76, 175, 80, 0.85)'
        ],
        borderColor: [
          '#D4A359',
          '#EF5350',
          '#4CAF50'
        ],
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ' ' + formatNTD(context.raw);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: {
            color: '#AFA29A',
            callback: function(value) {
              return 'NT$ ' + (value / 1000) + 'k';
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#FAF5F0', font: { size: 12, weight: '500' } }
        }
      }
    }
  });
}

function updateChart(revenue, cost, profit) {
  if (scenarioChart) {
    scenarioChart.data.datasets[0].data = [
      Math.round(revenue),
      Math.round(cost),
      Math.round(profit)
    ];
    scenarioChart.update();
  }
}

// Preset Scenario Helper
window.applyPreset = function(cups, spend) {
  const cupSlider = document.getElementById('cupSlider');
  const spendSlider = document.getElementById('spendSlider');
  const daySlider = document.getElementById('daySlider');

  cupSlider.value = cups;
  spendSlider.value = spend;
  daySlider.value = 30;

  // trigger input
  cupSlider.dispatchEvent(new Event('input'));
};

function formatNTD(amount) {
  return 'NT$ ' + Math.round(amount).toLocaleString('zh-TW');
}
