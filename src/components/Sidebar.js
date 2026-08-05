/**
 * Sidebar Component
 * Manages KPI summary cards, Country details panel, Severity chips,
 * and Filter controls.
 */

export class Sidebar {
  constructor(onFilterChange, onSeverityChange) {
    this.onFilterChange = onFilterChange;
    this.onSeverityChange = onSeverityChange;

    this.initDOM();
  }

  initDOM() {
    // KPI Elements
    this.kpiYear = document.getElementById('kpi-year');
    this.kpiTotalDeaths = document.getElementById('kpi-total-deaths');
    this.kpiActiveCountries = document.getElementById('kpi-active-countries');
    this.kpiActiveConflicts = document.getElementById('kpi-active-conflicts');

    // Country Details Elements
    this.selectedCountryName = document.getElementById('selected-country-name');
    this.selectedCountryStatus = document.getElementById('selected-country-status');
    this.countryDetailsBody = document.getElementById('country-details-body');

    // Filter Dropdowns
    this.filterRegion = document.getElementById('filter-region');
    this.filterType = document.getElementById('filter-type');
    this.filterIncomp = document.getElementById('filter-incomp');
    this.btnResetFilters = document.getElementById('btn-reset-filters');

    // Severity Chips
    document.querySelectorAll('.severity-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.severity-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const severity = chip.dataset.severity;
        if (this.onSeverityChange) {
          this.onSeverityChange(severity);
        }
      });
    });

    // Dropdown change listeners
    [this.filterRegion, this.filterType, this.filterIncomp].forEach(select => {
      select?.addEventListener('change', () => {
        if (this.onFilterChange) {
          this.onFilterChange(this.getFilterState());
        }
      });
    });

    // Reset filters button
    this.btnResetFilters?.addEventListener('click', () => {
      if (this.filterRegion) this.filterRegion.value = 'all';
      if (this.filterType) this.filterType.value = 'all';
      if (this.filterIncomp) this.filterIncomp.value = 'all';
      
      document.querySelectorAll('.severity-chip').forEach(c => c.classList.remove('active'));
      document.querySelector('.severity-chip[data-severity="all"]')?.classList.add('active');

      if (this.onSeverityChange) this.onSeverityChange('all');
      if (this.onFilterChange) this.onFilterChange(this.getFilterState());
    });
  }

  getFilterState() {
    return {
      region: this.filterRegion?.value || 'all',
      type: this.filterType?.value || 'all',
      incomp: this.filterIncomp?.value || 'all'
    };
  }

  updateKPI(year, totalDeaths, activeCountriesCount, activeConflictsCount) {
    if (this.kpiYear) this.kpiYear.textContent = year;
    if (this.kpiTotalDeaths) this.kpiTotalDeaths.textContent = totalDeaths.toLocaleString();
    if (this.kpiActiveCountries) this.kpiActiveCountries.textContent = activeCountriesCount.toLocaleString();
    if (this.kpiActiveConflicts) this.kpiActiveConflicts.textContent = activeConflictsCount.toLocaleString();
  }

  updateCountryDetails(countryName, deaths, conflictList = []) {
    if (!this.selectedCountryName) return;

    this.selectedCountryName.textContent = countryName || 'Select a Country';
    
    if (deaths > 0) {
      if (this.selectedCountryStatus) {
        this.selectedCountryStatus.textContent = 'Active Conflict';
        this.selectedCountryStatus.className = 'status-badge active';
      }
      
      let html = `
        <div class="detail-row">
          <span class="label">Battle Deaths (${this.kpiYear?.textContent || ''}):</span>
          <span class="value">${deaths.toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Active Conflicts:</span>
          <span class="value">${conflictList.length}</span>
        </div>
      `;

      if (conflictList.length > 0) {
        html += `<div style="margin-top:12px; font-weight:600; font-size:12px; color:var(--text-primary);">Belligerents & Parties:</div>`;
        conflictList.forEach(c => {
          html += `
            <div style="background:var(--bg-main); padding:8px; border-radius:4px; margin-top:6px; border:1px solid var(--border-color);">
              <div style="font-weight:600; color:#C62828;">${c.sideA} vs ${c.sideB}</div>
              <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                Territory: ${c.territoryName || 'N/A'} | Deaths: ${c.bdBest.toLocaleString()}
              </div>
            </div>
          `;
        });
      }

      this.countryDetailsBody.innerHTML = html;
    } else {
      if (this.selectedCountryStatus) {
        this.selectedCountryStatus.textContent = 'No Conflict';
        this.selectedCountryStatus.className = 'status-badge inactive';
      }
      this.countryDetailsBody.innerHTML = `
        <p class="placeholder-text">No active battle deaths recorded for ${countryName} in ${this.kpiYear?.textContent || 'selected year'}.</p>
      `;
    }
  }
}
