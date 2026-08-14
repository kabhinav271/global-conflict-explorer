/**
 * Application Main Controller
 * Initializes DataLoader, MapViewer, TimelineControls, Sidebar, Calculator01, and Calculator02.
 * Rebuilt using official World Atlas countries-110m.json map layer.
 * Integrated with dynamic Interstate Conflict Arrows (Strict Year Filtering).
 * Extended with Pudding-Style Narrative Chapters & Interactive Calculators.
 */

import { loadApplicationData, normalizeCountryId } from './utils/dataLoader.js';
import { MapViewer } from './components/MapViewer.js';
import { TimelineControls } from './components/TimelineControls.js';
import { Sidebar } from './components/Sidebar.js';
import { Calculator01 } from './components/Calculator01.js';
import { Calculator02 } from './components/Calculator02.js';
import { ScatterPlot } from './components/ScatterPlot.js';
import { CinematicIntro } from './components/CinematicIntro.js';

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

      // Initialize Calculator 01
      this.calculator01 = new Calculator01(
        'narrative-calculator-01',
        this.appData,
        (year) => this.handleCalculatorYearChange(year)
      );

      // Initialize Calculator 02 (Lifetime Conflict Risk Exposure Calculator)
      this.calculator02 = new Calculator02(
        'narrative-calculator-02',
        this.appData
      );

      // Initialize ScatterPlot ("Does more time in conflict mean more people die?")
      this.scatterPlot = new ScatterPlot(
        'scatterplot-container',
        this.appData
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
    if (this.calculator01) {
      this.calculator01.setYear(year);
    }
    this.updateView();
  }

  handleCalculatorYearChange(year) {
    this.currentYear = year;
    if (this.timelineControls) {
      this.timelineControls.setYear(year, true);
    }
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

  handleCountrySelect(countryId, name, deaths) {
    this.selectedCountryId = countryId;
    this.selectedCountryName = name;

    const conflicts = this.getCountryConflictsForYear(countryId, this.currentYear);
    this.sidebar.updateCountryDetails(name, deaths, conflicts);

    this.mapViewer.setSelectedCountry(countryId);
  }

  getCountryDeathsForYear(countryId, year) {
    const cYearMap = this.appData.countryYearIndex.get(countryId);
    if (!cYearMap) return 0;
    const entry = cYearMap.get(year);
    return entry ? entry.totalDeaths : 0;
  }

  getCountryConflictsForYear(countryId, year) {
    const cYearMap = this.appData.countryYearIndex.get(countryId);
    if (!cYearMap) return [];
    const entry = cYearMap.get(year);
    return entry ? entry.conflicts : [];
  }

  updateView() {
    if (!this.appData) return;

    // 1. Get filtered conflicts for current year from yearIndex
    const yearRecords = this.appData.yearIndex.get(this.currentYear) || [];

    const activeConflicts = yearRecords.filter(record => {
      // Region Filter
      if (this.currentFilters.region !== 'all' && String(record.region) !== String(this.currentFilters.region)) {
        return false;
      }

      // Conflict Type Filter
      if (this.currentFilters.type !== 'all' && String(record.typeOfConflict) !== String(this.currentFilters.type)) {
        return false;
      }

      // Incompatibility Filter
      if (this.currentFilters.incomp !== 'all' && String(record.incompatibility) !== String(this.currentFilters.incomp)) {
        return false;
      }

      // Severity Filter
      if (this.currentSeverity !== 'all') {
        const deaths = record.bdBest || 0;
        if (this.currentSeverity === '10-100' && (deaths < 10 || deaths > 100)) return false;
        if (this.currentSeverity === '100-500' && (deaths < 100 || deaths > 500)) return false;
        if (this.currentSeverity === '500-1000' && (deaths < 500 || deaths > 1000)) return false;
        if (this.currentSeverity === '1000-5000' && (deaths < 1000 || deaths > 5000)) return false;
        if (this.currentSeverity === '5000+' && deaths < 5000) return false;
      }

      return true;
    });

    // 2. Aggregate country battle deaths for current year
    const countryDeathsMap = new Map();
    const activeCountriesSet = new Set();
    const activeConflictsSet = new Set();

    let totalDeathsInYear = 0;

    activeConflicts.forEach(record => {
      const deaths = record.bdBest || 0;
      totalDeathsInYear += deaths;

      if (record.conflictId) activeConflictsSet.add(record.conflictId);

      if (record.matchedCountryIds && Array.isArray(record.matchedCountryIds)) {
        record.matchedCountryIds.forEach(cid => {
          activeCountriesSet.add(cid);
          countryDeathsMap.set(cid, (countryDeathsMap.get(cid) || 0) + deaths);
        });
      }
    });

    // 3. Render World Map & Update Color Fills
    this.mapViewer.render(countryDeathsMap, activeConflicts, this.currentYear);

    // 4. Render Interstate Conflict Flow Arrows
    this.mapViewer.drawInterstateArrows(this.selectedCountryId, this.currentYear, this.appData.records);

    // 5. Update Sidebar KPIs
    this.sidebar.updateKPI(
      this.currentYear,
      totalDeathsInYear,
      activeCountriesSet.size,
      activeConflictsSet.size
    );

    // 6. Update Selected Country Card if active
    if (this.selectedCountryId) {
      const deaths = countryDeathsMap.get(this.selectedCountryId) || 0;
      const conflicts = this.getCountryConflictsForYear(this.selectedCountryId, this.currentYear);
      this.sidebar.updateCountryDetails(this.selectedCountryName, deaths, conflicts);
    }
  }
}

/**
 * Scroll-Driven Sticky Storytelling Scene Controller
 * Keeps Section 04 text fixed in background while cards move smoothly upward over it.
 */
function initStickyCardStory() {
  const scrollTrack = document.getElementById('narrative-story-scroll');
  const cardLayer = document.getElementById('narrative-card-layer');

  if (!scrollTrack || !cardLayer) return;

  function onScroll() {
    const rect = scrollTrack.getBoundingClientRect();
    const trackHeight = scrollTrack.offsetHeight;
    const windowHeight = window.innerHeight;

    const totalDist = trackHeight - windowHeight;
    if (totalDist <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalDist));

    // Interpolate card transform from +110vh (below viewport) to -110vh (above viewport)
    const translateY = (1 - progress * 2) * 110;

    cardLayer.style.transform = `translate3d(0, ${translateY}vh, 0)`;
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(onScroll);
  }, { passive: true });

  onScroll();
}

/**
 * Chapter IntersectionObserver Reveals
 */
function initChapterReveals() {
  const chapters = [
    'cinematic-statement-section',
    'cinematic-title-section',
    'narrative-chapter-loss',
    'narrative-chapter-personal',
    'narrative-chapter-moment',
    'narrative-chapter-lifetime-question',
    'narrative-chapter-human-cost',
    'narrative-chapter-more-time',
    'narrative-scatterplot-section',
    'narrative-final-conclusion'
  ];

  chapters.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });

    observer.observe(el);
  });
}

/**
 * Continuous Blood Flow Transition Controller (Chapters 06 -> 07)
 * Connects the question mark '?' in Chapter 06 to the letter 't' in Chapter 07.
 * Accounts for font line-height bounding box padding to achieve EXACT visual contact with 0px gap!
 */
function initBloodFlowTransition() {
  const scene = document.getElementById('narrative-lifetime-scene');
  const svg = document.getElementById('blood-flow-svg');
  const path = document.getElementById('blood-flow-path');
  const secondaryPath = document.getElementById('blood-secondary-path');
  const originEl = document.getElementById('lifetime-question-mark');
  const targetEl = document.getElementById('lifetime-target-letter');

  if (!scene || !svg || !path || !originEl || !targetEl) return;

  function renderOrganicStream() {
    const sceneRect = scene.getBoundingClientRect();
    const originRect = originEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Exact Zero-gap Origin: Accounts for Inter 58px font line-height padding (0.81 factor connects to bottom dot of '?')
    const startX = (originRect.left + originRect.width / 2) - sceneRect.left;
    const startY = (originRect.top + originRect.height * 0.81) - sceneRect.top;

    // Exact Zero-gap Destination: Accounts for Inter 58px font line-height top padding (0.28 factor connects to top of 't')
    const endX = (targetRect.left + targetRect.width / 2) - sceneRect.left;
    const endY = (targetRect.top + targetRect.height * 0.28) - sceneRect.top;

    const windowHeight = window.innerHeight;
    const totalDist = sceneRect.height - windowHeight;

    if (totalDist <= 0) return;

    // Calculate scroll progress through the lifetime scene
    const scrolled = -sceneRect.top;
    const rawProgress = scrolled / totalDist;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // Map scroll progress to path reveal
    const drawProgress = Math.max(0, Math.min(1, (progress - 0.01) / 0.90));

    if (drawProgress <= 0) {
      path.setAttribute('d', '');
      if (secondaryPath) secondaryPath.setAttribute('d', '');
      targetEl.classList.remove('touched');
      return;
    }

    const totalSteps = 75;
    const activeSteps = Math.max(2, Math.floor(totalSteps * drawProgress));

    const dy = endY - startY;
    const dx = endX - startX;

    const points = [];
    for (let i = 0; i <= activeSteps; i++) {
      const t = i / totalSteps;

      // Base Bezier S-Curve interpolation
      const cp1x = startX + dx * 0.35 + (dy * 0.05);
      const cp1y = startY + dy * 0.30;
      const cp2x = startX + dx * 0.65 - (dy * 0.07);
      const cp2y = startY + dy * 0.70;

      const u = 1 - t;
      const bx = u*u*u*startX + 3*u*u*t*cp1x + 3*u*t*t*cp2x + t*t*t*endX;
      const by = u*u*u*startY + 3*u*u*t*cp1y + 3*u*t*t*cp2y + t*t*t*endY;

      // Organic hand-drawn liquid wiggles scaled by Math.sin(t * Math.PI) envelope so wiggles are 0 at t=0 and t=1
      const rawWiggle = Math.sin(t * Math.PI * 7) * 4.2 + Math.cos(t * Math.PI * 3.5) * 2.0;
      const envelope = Math.sin(t * Math.PI); // Exactly 0 at t=0 and t=1
      const wiggle = rawWiggle * envelope;

      const px = bx + wiggle;
      const py = by;

      // Organic variable thickness (1.8px to 4.2px)
      let width = 2.4 + Math.sin(t * Math.PI * 10) * 1.2 + Math.cos(t * Math.PI * 4) * 0.6;

      // Ensure start attaches smoothly to question mark tip
      if (t < 0.03) width = 2.2;
      if (i === activeSteps && drawProgress < 1) width *= 0.65;

      points.push({ x: px, y: py, width });
    }

    // Build ribbon contours
    const leftContour = [];
    const rightContour = [];

    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      let nx = 0, ny = 1;

      if (i < points.length - 1) {
        const next = points[i + 1];
        const vx = next.x - curr.x;
        const vy = next.y - curr.y;
        const len = Math.sqrt(vx * vx + vy * vy) || 1;
        nx = -vy / len;
        ny = vx / len;
      } else {
        const prev = points[i - 1];
        const vx = curr.x - prev.x;
        const vy = curr.y - prev.y;
        const len = Math.sqrt(vx * vx + vy * vy) || 1;
        nx = -vy / len;
        ny = vx / len;
      }

      const halfW = curr.width / 2;
      leftContour.push({ x: curr.x + nx * halfW, y: curr.y + ny * halfW });
      rightContour.push({ x: curr.x - nx * halfW, y: curr.y - ny * halfW });
    }

    // Generate main organic ribbon SVG path
    let d = `M ${leftContour[0].x.toFixed(1)},${leftContour[0].y.toFixed(1)}`;
    for (let i = 1; i < leftContour.length; i++) {
      d += ` L ${leftContour[i].x.toFixed(1)},${leftContour[i].y.toFixed(1)}`;
    }
    
    // Rounded liquid tip cap at leading edge
    const tip = points[points.length - 1];
    d += ` A ${(tip.width/2).toFixed(1)} ${(tip.width/2).toFixed(1)} 0 0 1 ${rightContour[rightContour.length - 1].x.toFixed(1)},${rightContour[rightContour.length - 1].y.toFixed(1)}`;

    for (let i = rightContour.length - 2; i >= 0; i--) {
      d += ` L ${rightContour[i].x.toFixed(1)},${rightContour[i].y.toFixed(1)}`;
    }
    d += ' Z';

    path.setAttribute('d', d);

    // Subtle secondary flow strand (very thin parallel liquid trace)
    if (secondaryPath && points.length > 15) {
      let secD = '';
      const startIdx = Math.floor(points.length * 0.3);
      const endIdx = Math.min(points.length - 2, Math.floor(points.length * 0.75));

      for (let i = startIdx; i <= endIdx; i++) {
        const p = points[i];
        const secX = (p.x + 4.5).toFixed(1);
        const secY = (p.y).toFixed(1);
        if (i === startIdx) {
          secD += `M ${secX},${secY}`;
        } else {
          secD += ` L ${secX},${secY}`;
        }
      }
      secondaryPath.setAttribute('d', secD);
    }

    // Trigger 't' letter color change when blood reaches destination (>= 96% progress)
    if (drawProgress >= 0.96) {
      targetEl.classList.add('touched');
    } else {
      targetEl.classList.remove('touched');
    }
  }

  // Recalculate on scroll, resize, or orientation change
  window.addEventListener('resize', () => {
    requestAnimationFrame(renderOrganicStream);
  });

  window.addEventListener('scroll', () => {
    requestAnimationFrame(renderOrganicStream);
  }, { passive: true });

  // Initial render
  setTimeout(() => {
    renderOrganicStream();
  }, 100);
}

/**
 * Narrative Section Arrow Navigation Handler
 * Consolidates pointer and touch interaction into ONE unified navigation function.
 * Fixes first-click/touch delay: executes navigation immediately on the first interaction.
 */
function initNarrativeArrowNavigation() {
  const sections = [
    document.getElementById('cinematic-intro-scroll-track'),
    document.getElementById('cinematic-statement-section'),
    document.getElementById('cinematic-title-section'),
    document.querySelector('.app-layout'),
    document.getElementById('narrative-story-scroll'),
    document.getElementById('narrative-chapter-loss'),
    document.getElementById('narrative-chapter-personal'),
    document.getElementById('narrative-calculator-01'),
    document.getElementById('narrative-lifetime-scene'),
    document.getElementById('narrative-calculator-02'),
    document.getElementById('narrative-chapter-human-cost'),
    document.getElementById('narrative-chapter-more-time'),
    document.getElementById('narrative-scatterplot-section'),
    document.getElementById('narrative-final-conclusion')
  ].filter(Boolean);

  function getCurrentSectionIndex() {
    const scrollY = window.scrollY || window.pageYOffset;
    let closestIndex = 0;
    let minDistance = Infinity;

    sections.forEach((sec, idx) => {
      const top = sec.offsetTop;
      const dist = Math.abs(scrollY - top);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    return closestIndex;
  }

  function handleArrowNavigation(direction) {
    const currentIndex = getCurrentSectionIndex();
    let targetIndex = currentIndex;

    if (direction === 'next' || direction === 'down' || direction === 'right' || direction === 1) {
      targetIndex = Math.min(sections.length - 1, currentIndex + 1);
    } else if (direction === 'prev' || direction === 'up' || direction === 'left' || direction === -1) {
      targetIndex = Math.max(0, currentIndex - 1);
    }

    if (sections[targetIndex]) {
      sections[targetIndex].scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Bind to all navigation arrow elements in the DOM
  const arrowElements = document.querySelectorAll('.narrative-arrow, .nav-arrow, .scroll-arrow, .arrow-nav, [data-nav-direction]');

  arrowElements.forEach(arrow => {
    const direction = arrow.getAttribute('data-nav-direction') || 
      (arrow.classList.contains('arrow-next') || arrow.classList.contains('arrow-down') || arrow.classList.contains('arrow-right') ? 'next' : 'prev');

    // Consolidated pointerup listener: works on first touch/click without double triggering
    arrow.addEventListener('pointerup', (event) => {
      event.preventDefault();
      handleArrowNavigation(direction);
    });

    // Suppress native click duplicate execution
    arrow.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });

  // Expose global handler
  window.handleArrowNavigation = handleArrowNavigation;
}

// Instantiate application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CinematicIntro('cinematic-intro-scroll-track');
  new AppController();
  initStickyCardStory();
  initChapterReveals();
  initBloodFlowTransition();
  initNarrativeArrowNavigation();
});

