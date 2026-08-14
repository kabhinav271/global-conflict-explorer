/**
 * Calculator 02 — "What was the conflict risk during your lifetime?"
 * Component Module: Interactive Lifetime Conflict Exposure Calculator & Timeline Visualizer
 * Fully isolated within .narrative-calculator-02 namespace.
 */

import { normalizeCountryId } from '../utils/dataLoader.js';

export class Calculator02 {
  constructor(containerId, appData) {
    this.container = document.getElementById(containerId);
    this.appData = appData;

    // Default State: India ('356') and Birth Year 1995
    this.countryId = '356';
    this.birthYear = 1995;

    this.countryList = [];
    this.initCountryList();

    this.init();
  }

  initCountryList() {
    const listMap = new Map();
    for (const [id, name] of this.appData.countryIdToName.entries()) {
      if (name && !listMap.has(name)) {
        listMap.set(name, normalizeCountryId(id));
      }
    }
    this.countryList = Array.from(listMap.entries())
      .map(([name, id]) => ({ name, id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  init() {
    if (!this.container) return;

    this.renderSkeleton();
    this.bindEvents();
    this.updateCalculations();
  }

  renderSkeleton() {
    const defaultCountryName = this.appData.countryIdToName.get(this.countryId) || 'India';

    // Birth Year Options (1930 to 2025)
    let yearOptionsHTML = '';
    for (let y = 1930; y <= 2025; y++) {
      const selected = y === this.birthYear ? 'selected' : '';
      yearOptionsHTML += `<option value="${y}" ${selected}>${y}</option>`;
    }

    this.container.innerHTML = `
      <div class="calc2-container">
        
        <!-- Controls Panel -->
        <div class="calc2-controls-panel">
          
          <!-- Country Selector -->
          <div class="calc2-control-group country-select-group">
            <label for="calc2-country-input" class="calc2-control-label">SELECT YOUR COUNTRY</label>
            <div class="calc2-search-select" id="calc2-search-select">
              <input type="text" id="calc2-country-input" class="calc2-select-input" value="${defaultCountryName}" placeholder="Search for a country..." autocomplete="off">
              <svg class="calc2-select-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5F6368" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
              <div class="calc2-dropdown hidden" id="calc2-dropdown"></div>
            </div>
          </div>

          <!-- Birth Year Selector -->
          <div class="calc2-control-group year-select-group">
            <label for="calc2-birth-year-select" class="calc2-control-label">YOUR BIRTH YEAR</label>
            <div class="calc2-select-wrapper">
              <select id="calc2-birth-year-select" class="calc2-native-select">
                ${yearOptionsHTML}
              </select>
            </div>
          </div>

          <!-- Calculate Button -->
          <div class="calc2-control-group btn-group">
            <button id="calc2-submit-btn" class="calc2-btn-primary">CALCULATE EXPOSURE</button>
          </div>

        </div>

        <!-- Insufficient Data Warning (For birthYear > 2025) -->
        <div class="calc2-warning-card hidden" id="calc2-warning-card">
          <p class="calc2-warning-msg">Conflict data is available from 1989 to 2025. Please select a birth year within or prior to 2025.</p>
        </div>

        <!-- Main Hero Result Section -->
        <div class="calc2-result-card" id="calc2-result-card">
          
          <!-- Hero Header Text -->
          <div class="calc2-hero-header">
            <span class="calc2-eyebrow" id="calc2-result-country-badge">IN INDIA, YOU LIVED THROUGH</span>
            <h2 class="calc2-hero-title">
              <span class="calc2-hero-number red-accent" id="calc2-hero-years">18 YEARS</span>
            </h2>
            <span class="calc2-hero-subtitle">OF RECORDED CONFLICT</span>
          </div>

          <!-- Breakdown Metrics Grid -->
          <div class="calc2-metrics-grid">
            <div class="calc2-metric-box red-border">
              <span class="calc2-metric-num red-accent" id="calc2-stat-conflict-years">18</span>
              <span class="calc2-metric-lbl">Conflict Years</span>
            </div>

            <div class="calc2-metric-box neutral-border">
              <span class="calc2-metric-num" id="calc2-stat-peaceful-years">10</span>
              <span class="calc2-metric-lbl">Peaceful Years</span>
            </div>

            <div class="calc2-metric-box highlight-border">
              <span class="calc2-metric-num red-accent" id="calc2-stat-pct">64%</span>
              <span class="calc2-metric-lbl" id="calc2-stat-covered-lbl">of your covered lifetime (1989–2025)</span>
            </div>
          </div>

          <!-- Horizontal Lifetime Timeline Bar -->
          <div class="calc2-timeline-wrapper">
            <div class="calc2-timeline-header">
              <span class="calc2-timeline-start-year" id="calc2-timeline-start">1989</span>
              <span class="calc2-timeline-title">LIFETIME CONFLICT EXPOSURE TIMELINE</span>
              <span class="calc2-timeline-end-year">2025</span>
            </div>

            <!-- Block Strip Container -->
            <div class="calc2-timeline-strip" id="calc2-timeline-strip">
              <!-- Rendered dynamically -->
            </div>

            <div class="calc2-timeline-legend">
              <span class="calc2-legend-item">
                <span class="calc2-legend-box conflict"></span> Recorded Conflict Year
              </span>
              <span class="calc2-legend-item">
                <span class="calc2-legend-box peaceful"></span> No Recorded Conflict
              </span>
            </div>
          </div>

          <!-- Disclaimer Note -->
          <div class="calc2-disclaimer-wrap">
            <p class="calc2-disclaimer">
              This measures how many years of your covered lifetime coincided with recorded conflict in this country. It does not represent your individual probability of death.
            </p>
          </div>

        </div>

      </div>
    `;
  }

  bindEvents() {
    const inputCountry = document.getElementById('calc2-country-input');
    const dropdown = document.getElementById('calc2-dropdown');
    const selectYear = document.getElementById('calc2-birth-year-select');
    const btnSubmit = document.getElementById('calc2-submit-btn');

    // Country Search Input
    if (inputCountry && dropdown) {
      inputCountry.addEventListener('focus', () => this.showDropdown(dropdown, inputCountry));
      inputCountry.addEventListener('input', () => this.filterDropdown(dropdown, inputCountry.value));
    }

    // Birth Year Select
    if (selectYear) {
      selectYear.addEventListener('change', (e) => {
        this.birthYear = parseInt(e.target.value, 10);
        this.updateCalculations();
      });
    }

    // Submit Button
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        this.updateCalculations();
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#calc2-search-select')) {
        dropdown?.classList.add('hidden');
      }
    });
  }

  showDropdown(dropdown, input) {
    this.filterDropdown(dropdown, input.value);
  }

  filterDropdown(dropdown, query) {
    const q = (query || '').toLowerCase().trim();
    const matches = this.countryList.filter(c => c.name.toLowerCase().includes(q));

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="calc2-dropdown-item no-match">No country found</div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 15).map(c => `
        <div class="calc2-dropdown-item" data-id="${c.id}" data-name="${c.name}">${c.name}</div>
      `).join('');
    }

    dropdown.classList.remove('hidden');

    dropdown.querySelectorAll('.calc2-dropdown-item[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        this.countryId = el.getAttribute('data-id');
        const name = el.getAttribute('data-name');
        document.getElementById('calc2-country-input').value = name;
        dropdown.classList.add('hidden');
        this.updateCalculations();
      });
    });
  }

  updateCalculations() {
    const normId = normalizeCountryId(this.countryId);
    const countryName = this.appData.countryIdToName.get(normId) || 'Country';
    const warningCard = document.getElementById('calc2-warning-card');
    const resultCard = document.getElementById('calc2-result-card');

    if (this.birthYear > 2025) {
      if (warningCard) warningCard.classList.remove('hidden');
      if (resultCard) resultCard.classList.add('hidden');
      return;
    } else {
      if (warningCard) warningCard.classList.add('hidden');
      if (resultCard) resultCard.classList.remove('hidden');
    }

    // Dataset bounds: 1989 to 2025
    const startYear = Math.max(1989, this.birthYear);
    const endYear = 2025;
    const coveredYearsCount = endYear - startYear + 1;

    const cYearMap = this.appData.countryYearIndex.get(normId);

    const yearDetails = [];
    let conflictCount = 0;

    for (let y = startYear; y <= endYear; y++) {
      let isConflict = false;
      let deaths = 0;

      if (cYearMap && cYearMap.has(y)) {
        deaths = cYearMap.get(y).totalDeaths || 0;
        if (deaths > 0) {
          isConflict = true;
        }
      }

      if (isConflict) {
        conflictCount++;
      }

      yearDetails.push({ year: y, isConflict, deaths });
    }

    const peacefulCount = coveredYearsCount - conflictCount;
    const pct = Math.round((conflictCount / coveredYearsCount) * 100);

    // Update UI elements
    document.getElementById('calc2-result-country-badge').textContent = `IN ${countryName.toUpperCase()}, YOU LIVED THROUGH`;
    document.getElementById('calc2-hero-years').textContent = `${conflictCount} YEAR${conflictCount === 1 ? '' : 'S'}`;
    document.getElementById('calc2-stat-conflict-years').textContent = conflictCount;
    document.getElementById('calc2-stat-peaceful-years').textContent = peacefulCount;
    document.getElementById('calc2-stat-pct').textContent = `${pct}%`;
    document.getElementById('calc2-stat-covered-lbl').textContent = `of your covered lifetime (${startYear}–2025)`;
    document.getElementById('calc2-timeline-start').textContent = startYear;

    // Render Timeline Strip Blocks
    const strip = document.getElementById('calc2-timeline-strip');
    if (strip) {
      strip.innerHTML = yearDetails.map(item => `
        <div class="calc2-year-block ${item.isConflict ? 'conflict' : 'peaceful'}" 
             title="${item.year}: ${item.isConflict ? item.deaths.toLocaleString() + ' battle deaths' : 'No recorded battle deaths'}">
          <span class="calc2-block-label">${item.year}</span>
        </div>
      `).join('');
    }
  }
}
