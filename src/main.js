/**
 * Application Main Controller
 * Initializes DataLoader, MapViewer, TimelineControls, and Sidebar.
 * Rebuilt using official World Atlas countries-110m.json map layer.
 * Integrated with dynamic Interstate Conflict Arrows (Strict Year Filtering).
 */

import { loadApplicationData, normalizeCountryId } from './utils/dataLoader.js';
import { MapViewer } from './components/MapViewer.js';
import { TimelineControls } from './components/TimelineControls.js';
import { Sidebar } from './components/Sidebar.js';

class AppController {
  constructor() {
    this.appData = null;
    this.currentYear = 1989;
    this.currentSeverity = 'all';
    this.currentFilters = { region: 'all', type: 'all', incomp: 'all' };

    this.selectedCountryId = null;
    this.selectedCountryName = null;

    this.init();
  }

  async init() {
    try {
      console.log('--- Initializing Global Conflict Explorer (countries-110m.json) ---');
      this.appData = await loadApplicationData();

      // Automatically select the earliest year with data (1989)
      this.currentYear = this.appData.earliestYear || 1989;

      // Initialize UI Components
      this.sidebar = new Sidebar(
        (filters) => this.handleFilterChange(filters),
        (severity) => this.handleSeverityChange(severity)
      );

      // Reconnect MapViewer with official countries-110m.json topology
      this.mapViewer = new MapViewer(
        'map-container',
        this.appData.topoData,
        this.appData.countryIdToName,
        (countryId, name, deaths) => this.handleCountrySelect(countryId, name, deaths)
      );

      this.timelineControls = new TimelineControls(
        (year) => this.handleYearChange(year)
      );

      // Set timeline slider to earliest year
      this.timelineControls.setYear(this.currentYear, true);

      // Setup Search Bar Listener
      this.initSearch();

      // Initial Render with active default data
      this.updateView();

    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }

  initSearch() {
    const searchInput = document.getElementById('country-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) return;

      // Find matching country
      for (const [name, id] of this.appData.countryNameToId.entries()) {
        if (name.toLowerCase() === query || name.toLowerCase().includes(query)) {
          const deaths = this.getCountryDeathsForYear(id, this.currentYear);
          this.handleCountrySelect(id, name, deaths);
          break;
        }
      }
    });
  }

  handleYearChange(year) {
    this.currentYear = year;
    this.updateView();
  }

  handleSeverityChange(severity) {
    this.currentSeverity = severity;
    this.updateView();
  }

  handleFilterChange(filters) {
    this.currentFilters = filters;
    this.updateView();
  }

  handleCountrySelect(countryId, countryName, deaths) {
    this.selectedCountryId = normalizeCountryId(countryId);
    this.selectedCountryName = countryName;

    const conflicts = this.getCountryConflictsForYear(this.selectedCountryId, this.currentYear);
    this.sidebar.updateCountryDetails(countryName, deaths, conflicts);

    // Draw dynamic interstate conflict arrows for selected country & current year
    if (this.appData && this.appData.records) {
      this.mapViewer.drawInterstateArrows(this.selectedCountryId, this.currentYear, this.appData.records);
    }
  }

  getCountryDeathsForYear(countryId, year) {
    const normId = normalizeCountryId(countryId);
    const cMap = this.appData.countryYearIndex.get(normId);
    if (!cMap || !cMap.has(year)) return 0;
    return cMap.get(year).totalDeaths || 0;
  }

  getCountryConflictsForYear(countryId, year) {
    const normId = normalizeCountryId(countryId);
    const cMap = this.appData.countryYearIndex.get(normId);
    if (!cMap || !cMap.has(year)) return [];
    
    const yearData = cMap.get(year);
    return yearData.conflicts.filter(c => this.matchesFilters(c));
  }

  matchesFilters(record) {
    const { region, type, incomp } = this.currentFilters;

    if (region !== 'all' && String(record.region) !== String(region)) return false;
    if (type !== 'all' && String(record.typeOfConflict) !== String(type)) return false;
    if (incomp !== 'all' && String(record.incompatibility) !== String(incomp)) return false;

    return true;
  }

  updateView() {
    if (!this.appData) return;

    // 1. Filter year records
    const yearRecords = (this.appData.yearIndex.get(this.currentYear) || [])
      .filter(record => this.matchesFilters(record));

    // 2. Compute battle deaths per country using normalized keys
    const countryDeathsMap = new Map();
    let totalDeathsInYear = 0;
    const activeConflictsSet = new Set();

    yearRecords.forEach(record => {
      totalDeathsInYear += record.bdBest;
      activeConflictsSet.add(record.conflictId);

      record.matchedCountryIds.forEach(cid => {
        const normId = normalizeCountryId(cid);
        const prev = countryDeathsMap.get(normId) || 0;
        countryDeathsMap.set(normId, prev + record.bdBest);
      });
    });

    const activeCountriesCount = countryDeathsMap.size;
    const activeConflictsCount = activeConflictsSet.size;

    console.log(`=== Step 1: Battle Deaths Totals for Year ${this.currentYear} ===`);
    countryDeathsMap.forEach((deaths, cid) => {
      const cName = this.appData.countryIdToName.get(cid) || 'Country';
      console.log(`${cName} ${cid} ${deaths}`);
    });

    // 3. Update Map
    this.mapViewer.updateMap(countryDeathsMap, this.currentSeverity);

    // 4. Update Interstate Arrows using ONLY current year data
    if (this.appData && this.appData.records) {
      this.mapViewer.drawInterstateArrows(this.selectedCountryId, this.currentYear, this.appData.records);
    }

    // 5. Update Sidebar KPIs
    this.sidebar.updateKPI(
      this.currentYear,
      totalDeathsInYear,
      activeCountriesCount,
      activeConflictsCount
    );

    // 6. Update Selected Country Card if active
    if (this.selectedCountryId) {
      const deaths = countryDeathsMap.get(this.selectedCountryId) || 0;
      const conflicts = this.getCountryConflictsForYear(this.selectedCountryId, this.currentYear);
      this.sidebar.updateCountryDetails(this.selectedCountryName, deaths, conflicts);
    }
  }
}

// Instantiate application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
