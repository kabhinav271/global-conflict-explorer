/**
 * Calculator 01 — "What was the risk of dying in conflict where you lived?"
 * Component Module: Interactive Narrative Calculator & Comparative Visualizer
 * Fully isolated within .narrative-calculator-01 namespace.
 */

import { normalizeCountryId } from '../utils/dataLoader.js';

export class Calculator01 {
  constructor(containerId, appData, onYearChangeCallback = null) {
    this.container = document.getElementById(containerId);
    this.appData = appData;
    this.onYearChangeCallback = onYearChangeCallback;

    // Default Selection: India ('356') & 1989 (or current year)
    this.countryIdA = '356'; // Default India
    this.countryIdB = null;  // Comparison country (null initially)
    this.selectedYear = appData.earliestYear || 1989;

    // Prepare list of available countries for searchable dropdown
    this.countryList = [];
    this.initCountryList();

    this.init();
  }

  initCountryList() {
    const listMap = new Map();
    // Use countryIdToName entries from dataLoader
    for (const [id, name] of this.appData.countryIdToName.entries()) {
      if (name && !listMap.has(name)) {
        listMap.set(name, normalizeCountryId(id));
      }
    }
    this.countryList = Array.from(listMap.entries()).map(([name, id]) => ({ name, id })).sort((a, b) => a.name.localeCompare(b.name));
  }

  init() {
    if (!this.container) return;

    this.renderSkeleton();
    this.bindEvents();
    this.updateCalculations();
  }

  renderSkeleton() {
    const defaultCountryNameA = this.appData.countryIdToName.get(this.countryIdA) || 'India';

    this.container.innerHTML = `
      <div class="calc-container">
        
        <!-- Section Introduction (Only supporting text) -->
        <div class="calc-header">
          <p class="calc-subtitle">
            Choose a country and year to see how large the conflict death rate was relative to the population living there.
          </p>
        </div>

        <!-- Calculator Controls -->
        <div class="calc-controls-panel">
          <div class="calc-control-group country-select-group">
            <label for="calc-country-a-input" class="calc-control-label">COUNTRY</label>
            <div class="calc-search-select" id="calc-search-select-a">
              <input type="text" id="calc-country-a-input" class="calc-select-input" value="${defaultCountryNameA}" placeholder="Search for a country..." autocomplete="off">
              <svg class="calc-select-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5F6368" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
              <div class="calc-dropdown hidden" id="calc-dropdown-a"></div>
            </div>
          </div>

          <div class="calc-control-group year-slider-group">
            <div class="calc-year-header">
              <label for="calc-year-slider" class="calc-control-label">YEAR</label>
              <span class="calc-year-badge" id="calc-year-badge">${this.selectedYear}</span>
            </div>
            <div class="calc-slider-wrapper">
              <input type="range" id="calc-year-slider" min="1989" max="2025" step="1" value="${this.selectedYear}">
              <div class="calc-slider-ticks">
                <span>1989</span>
                <span>2025</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hero Result Card (Country A) -->
        <div class="calc-result-card" id="calc-result-card-a">
          <div class="calc-card-badge" id="calc-badge-a"></div>

          <!-- Raw Metrics Grid -->
          <div class="calc-metrics-grid" id="calc-metrics-grid-a">
            <div class="calc-metric-item">
              <span class="calc-metric-val red-accent" id="calc-deaths-val-a">-</span>
              <span class="calc-metric-lbl">Battle deaths</span>
            </div>
            <div class="calc-metric-item">
              <span class="calc-metric-val" id="calc-pop-val-a">-</span>
              <span class="calc-metric-lbl">Population</span>
            </div>
          </div>

          <!-- Hero "1 in X" Output -->
          <div class="calc-hero-block" id="calc-hero-block-a">
            <span class="calc-hero-val red-accent" id="calc-ratio-val-a">-</span>
            <p class="calc-hero-desc" id="calc-ratio-desc-a">-</p>
            <span class="calc-secondary-pct" id="calc-pct-val-a">-</span>
          </div>

          <!-- Visual Population Scale Track -->
          <div class="calc-scale-track-wrapper" id="calc-scale-wrapper-a">
            <div class="calc-scale-track">
              <div class="calc-scale-bar" id="calc-scale-bar-a" style="width: 0%;"></div>
            </div>
            <div class="calc-scale-labels">
              <span>Battle Deaths</span>
              <span>Total Population</span>
            </div>
          </div>

          <!-- Message overlay for zero / no data -->
          <div class="calc-msg-overlay hidden" id="calc-msg-a"></div>
        </div>

        <!-- Secondary Comparison Section ("BUT IS THAT HIGH OR LOW?") -->
        <div class="calc-comparison-section">
          <div class="calc-comp-header">
            <h3 class="calc-comp-eyebrow">BUT IS THAT HIGH OR LOW?</h3>
            <p class="calc-comp-title">Compare another country.</p>
            <div class="calc-comp-select-wrap">
              <div class="calc-search-select" id="calc-search-select-b">
                <input type="text" id="calc-country-b-input" class="calc-select-input" placeholder="Choose another country..." autocomplete="off">
                <svg class="calc-select-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5F6368" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
                <div class="calc-dropdown hidden" id="calc-dropdown-b"></div>
              </div>
            </div>
          </div>

          <!-- Side-by-Side Comparison Cards Grid -->
          <div class="calc-comparison-grid hidden" id="calc-comp-grid">
            
            <!-- Country A Comparison Card -->
            <div class="calc-comp-card" id="calc-comp-card-a">
              <div class="calc-comp-card-name" id="calc-comp-name-a">COUNTRY A</div>
              <div class="calc-comp-card-year" id="calc-comp-year-a">2013</div>
              <div class="calc-comp-hero red-accent" id="calc-comp-ratio-a">-</div>
              <div class="calc-comp-deaths" id="calc-comp-deaths-a">- deaths</div>
              <div class="calc-comp-pop" id="calc-comp-pop-a">- Population</div>
            </div>

            <!-- Country B Comparison Card -->
            <div class="calc-comp-card" id="calc-comp-card-b">
              <div class="calc-comp-card-name" id="calc-comp-name-b">COUNTRY B</div>
              <div class="calc-comp-card-year" id="calc-comp-year-b">2013</div>
              <div class="calc-comp-hero red-accent" id="calc-comp-ratio-b">-</div>
              <div class="calc-comp-deaths" id="calc-comp-deaths-b">- deaths</div>
              <div class="calc-comp-pop" id="calc-comp-pop-b">- Population</div>
            </div>

          </div>
        </div>

        <!-- Statistical Disclaimer -->
        <div class="calc-disclaimer-wrap">
          <p class="calc-disclaimer">
            This is an estimated population-level rate based on recorded battle deaths. It does not represent an individual's personal probability of death.
          </p>
        </div>

      </div>
    `;
  }

  bindEvents() {
    const inputA = document.getElementById('calc-country-a-input');
    const dropdownA = document.getElementById('calc-dropdown-a');
    const inputB = document.getElementById('calc-country-b-input');
    const dropdownB = document.getElementById('calc-dropdown-b');
    const yearSlider = document.getElementById('calc-year-slider');

    // Year slider handler
    if (yearSlider) {
      yearSlider.addEventListener('input', (e) => {
        this.selectedYear = parseInt(e.target.value, 10);
        document.getElementById('calc-year-badge').textContent = this.selectedYear;
        this.updateCalculations();

        if (this.onYearChangeCallback) {
          this.onYearChangeCallback(this.selectedYear);
        }
      });
    }

    // Country A Search Input
    if (inputA && dropdownA) {
      inputA.addEventListener('focus', () => this.showDropdown(dropdownA, inputA, (id, name) => {
        this.countryIdA = id;
        inputA.value = name;
        this.updateCalculations();
      }));
      inputA.addEventListener('input', () => this.filterDropdown(dropdownA, inputA.value, (id, name) => {
        this.countryIdA = id;
        inputA.value = name;
        this.updateCalculations();
      }));
    }

    // Country B Search Input
    if (inputB && dropdownB) {
      inputB.addEventListener('focus', () => this.showDropdown(dropdownB, inputB, (id, name) => {
        this.countryIdB = id;
        inputB.value = name;
        this.updateCalculations();
      }));
      inputB.addEventListener('input', () => this.filterDropdown(dropdownB, inputB.value, (id, name) => {
        this.countryIdB = id;
        inputB.value = name;
        this.updateCalculations();
      }));
    }

    // Dismiss dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#calc-search-select-a')) {
        dropdownA?.classList.add('hidden');
      }
      if (!e.target.closest('#calc-search-select-b')) {
        dropdownB?.classList.add('hidden');
      }
    });
  }

  showDropdown(dropdown, input, selectCallback) {
    this.filterDropdown(dropdown, input.value, selectCallback);
  }

  filterDropdown(dropdown, query, selectCallback) {
    const q = (query || '').toLowerCase().trim();
    const matches = this.countryList.filter(c => c.name.toLowerCase().includes(q));

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="calc-dropdown-item no-match">No country found</div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 15).map(c => `
        <div class="calc-dropdown-item" data-id="${c.id}" data-name="${c.name}">${c.name}</div>
      `).join('');
    }

    dropdown.classList.remove('hidden');

    dropdown.querySelectorAll('.calc-dropdown-item[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const name = el.getAttribute('data-name');
        selectCallback(id, name);
        dropdown.classList.add('hidden');
      });
    });
  }

  setYear(year) {
    this.selectedYear = year;
    const yearSlider = document.getElementById('calc-year-slider');
    const yearBadge = document.getElementById('calc-year-badge');
    if (yearSlider) yearSlider.value = year;
    if (yearBadge) yearBadge.textContent = year;
    this.updateCalculations();
  }

  getCountryData(countryId, year) {
    const normId = normalizeCountryId(countryId);
    const name = this.appData.countryIdToName.get(normId) || 'Country';

    // Battle Deaths
    let deaths = 0;
    const cYearMap = this.appData.countryYearIndex.get(normId);
    if (cYearMap && cYearMap.has(year)) {
      deaths = cYearMap.get(year).totalDeaths || 0;
    }

    // Population
    let population = null;
    if (this.appData.populationMap && this.appData.populationMap.has(normId)) {
      population = this.appData.populationMap.get(normId).get(year) || null;
    }

    return { normId, name, deaths, population };
  }

  formatPopulation(num) {
    if (!num || isNaN(num)) return 'Unavailable';
    if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  }

  calculateMetrics(deaths, population) {
    if (deaths <= 0) {
      return {
        ratioStr: 'No recorded battle deaths',
        shortRatio: 'No deaths',
        descStr: '0 recorded battle deaths in this year.',
        pctStr: '0%',
        barPct: 0,
        isZero: true,
        isNoData: false
      };
    }

    if (!population || population <= 0) {
      return {
        ratioStr: 'Population data unavailable',
        shortRatio: 'No pop data',
        descStr: 'Population metrics for this year are unavailable in the dataset.',
        pctStr: '',
        barPct: 0,
        isZero: false,
        isNoData: true
      };
    }

    const ratio = population / deaths;
    const pct = (deaths / population) * 100;

    let humanCount = '';
    let ratioStr = '';
    let shortRatio = '';

    if (ratio >= 1e6) {
      const millionVal = ratio >= 1e7 ? Math.round(ratio / 1e6) : (ratio / 1e6).toFixed(1).replace(/\.0$/, '');
      ratioStr = `1 in ${millionVal} million`;
      shortRatio = `1 in ${millionVal}M`;
      humanCount = `${millionVal} million`;
    } else if (ratio >= 1000) {
      const roundedVal = Math.round(ratio / 1000) * 1000;
      ratioStr = `1 in ${roundedVal.toLocaleString()}`;
      shortRatio = `1 in ${(roundedVal / 1000).toFixed(0)}K`;
      humanCount = `${roundedVal.toLocaleString()}`;
    } else {
      const roundedVal = Math.round(ratio);
      ratioStr = `1 in ${roundedVal.toLocaleString()}`;
      shortRatio = `1 in ${roundedVal.toLocaleString()}`;
      humanCount = `${roundedVal.toLocaleString()}`;
    }

    const descStr = `About 1 person out of every ${humanCount} people was killed in battle that year.`;
    const pctStr = pct < 0.000001 ? `${pct.toExponential(2)}%` : `${pct.toFixed(6)}%`;
    const barPct = Math.min(100, Math.max(0.5, (pct * 200))); // Dynamic visual scale fill

    return { ratioStr, shortRatio, descStr, pctStr, barPct, isZero: false, isNoData: false };
  }

  updateCalculations() {
    // 1. Update Country A Hero Card
    const dataA = this.getCountryData(this.countryIdA, this.selectedYear);
    const resA = this.calculateMetrics(dataA.deaths, dataA.population);

    document.getElementById('calc-badge-a').textContent = `${dataA.name.toUpperCase()} · ${this.selectedYear}`;
    document.getElementById('calc-deaths-val-a').textContent = dataA.deaths.toLocaleString();
    document.getElementById('calc-pop-val-a').textContent = this.formatPopulation(dataA.population);

    const heroValA = document.getElementById('calc-ratio-val-a');
    const heroDescA = document.getElementById('calc-ratio-desc-a');
    const heroPctA = document.getElementById('calc-pct-val-a');
    const scaleBarA = document.getElementById('calc-scale-bar-a');

    heroValA.textContent = resA.ratioStr;
    heroDescA.textContent = resA.descStr;
    heroPctA.textContent = resA.pctStr;
    scaleBarA.style.width = `${resA.barPct}%`;

    // Handle Country A Zero / No Data Overlay state
    const msgA = document.getElementById('calc-msg-a');
    if (resA.isZero || resA.isNoData) {
      msgA.textContent = resA.isZero ? 'No recorded battle deaths for this country/year.' : 'Population data unavailable for this country/year.';
      msgA.classList.remove('hidden');
    } else {
      msgA.classList.add('hidden');
    }

    // 2. Update Comparison Section (Country B)
    const compGrid = document.getElementById('calc-comp-grid');
    if (this.countryIdB) {
      compGrid.classList.remove('hidden');

      const dataB = this.getCountryData(this.countryIdB, this.selectedYear);
      const resB = this.calculateMetrics(dataB.deaths, dataB.population);

      // Fill Country A comparison card
      document.getElementById('calc-comp-name-a').textContent = dataA.name.toUpperCase();
      document.getElementById('calc-comp-year-a').textContent = this.selectedYear;
      document.getElementById('calc-comp-ratio-a').textContent = resA.shortRatio;
      document.getElementById('calc-comp-deaths-a').textContent = `${dataA.deaths.toLocaleString()} deaths`;
      document.getElementById('calc-comp-pop-a').textContent = `${this.formatPopulation(dataA.population)} Population`;

      // Fill Country B comparison card
      document.getElementById('calc-comp-name-b').textContent = dataB.name.toUpperCase();
      document.getElementById('calc-comp-year-b').textContent = this.selectedYear;
      document.getElementById('calc-comp-ratio-b').textContent = resB.shortRatio;
      document.getElementById('calc-comp-deaths-b').textContent = `${dataB.deaths.toLocaleString()} deaths`;
      document.getElementById('calc-comp-pop-b').textContent = `${this.formatPopulation(dataB.population)} Population`;
    } else {
      compGrid.classList.add('hidden');
    }
  }
}
