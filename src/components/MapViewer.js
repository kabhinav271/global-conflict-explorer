/**
 * MapViewer Component
 * Diagnostic mode enabled for Step 1-6 inspection.
 */

import { getSeverityColor, normalizeCountryId } from '../utils/dataLoader.js';

export class MapViewer {
  constructor(containerId, topoData, countryIdToName, onCountrySelect) {
    this.container = document.getElementById(containerId);
    this.topoData = topoData;
    this.countryIdToName = countryIdToName;
    this.onCountrySelect = onCountrySelect;

    this.selectedCountryId = null;
    this.currentCountryDeaths = new Map();
    this.selectedSeverityFilter = 'all';

    this.initMap();
    this.initResizeListener();
  }

  initMap() {
    const width = this.container.clientWidth || 900;
    const height = this.container.clientHeight || 520;

    // Remove old SVG if present
    d3.select(this.container).selectAll('svg').remove();

    // Create SVG element
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // 1. Convert TopoJSON to GeoJSON FeatureCollection
    const countries = topojson.feature(this.topoData, this.topoData.objects.countries).features;
    this.countries = countries;

    const featureCollection = {
      type: 'FeatureCollection',
      features: countries
    };

    // 2. Projection & Path Generator
    this.projection = d3.geoNaturalEarth1()
      .fitSize([width, height], featureCollection);

    this.pathGenerator = d3.geoPath(this.projection);

    // Group for zoomable elements
    this.g = this.svg.append('g').attr('class', 'map-g');

    // Zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // 3. Render every country as an independent SVG path
    this.paths = this.g.selectAll('.country-path')
      .data(countries)
      .join('path')
      .attr('class', 'country-path')
      .attr('d', this.pathGenerator)
      .attr('data-id', d => normalizeCountryId(d.id))
      .style('fill', d => {
        const normId = normalizeCountryId(d.id);
        const deaths = this.currentCountryDeaths.get(normId) || 0;
        return getSeverityColor(deaths);
      })
      .attr('fill', d => {
        const normId = normalizeCountryId(d.id);
        const deaths = this.currentCountryDeaths.get(normId) || 0;
        return getSeverityColor(deaths);
      })
      .on('mouseover', (event, d) => this.handleMouseOver(event, d))
      .on('mousemove', (event) => this.handleMouseMove(event))
      .on('mouseout', () => this.handleMouseOut())
      .on('click', (event, d) => this.handleCountryClick(event, d));

    // Map control buttons
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.4);
    });

    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.7);
    });

    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      this.svg.transition().duration(500).call(
        this.zoom.transform,
        d3.zoomIdentity
      );
    });
  }

  initResizeListener() {
    window.addEventListener('resize', () => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.initMap();
        this.updateMap(this.currentCountryDeaths, this.selectedSeverityFilter);
      }, 200);
    });
  }

  getDeathsForFeature(d) {
    if (!d || d.id === undefined || d.id === null) return 0;
    const normId = normalizeCountryId(d.id);
    return this.currentCountryDeaths.get(normId) || 0;
  }

  /**
   * Diagnostic updateMap execution for Steps 1-6
   */
  updateMap(countryDeathsMap, selectedSeverityFilter = 'all') {
    this.currentCountryDeaths = countryDeathsMap || new Map();
    this.selectedSeverityFilter = selectedSeverityFilter;

    if (!this.paths) return;

    // Step 1: SVG Elements Count
    const svgCount = document.querySelectorAll("svg").length;
    console.log(`[Diagnostic Step 1] document.querySelectorAll("svg").length: ${svgCount}`);

    // Step 2: Country Paths Count
    const pathCount = document.querySelectorAll(".country-path").length;
    console.log(`[Diagnostic Step 2] document.querySelectorAll(".country-path").length: ${pathCount}`);

    // Step 3: Transition fill color
    this.paths.transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .style('fill', d => {
        const deaths = this.getDeathsForFeature(d);
        if (selectedSeverityFilter !== 'all') {
          const color = getSeverityColor(deaths);
          const isMatch = this.checkSeverityMatch(deaths, selectedSeverityFilter);
          return isMatch ? color : '#B8C1CC';
        }
        return getSeverityColor(deaths);
      })
      .attr('fill', d => {
        const deaths = this.getDeathsForFeature(d);
        if (selectedSeverityFilter !== 'all') {
          const color = getSeverityColor(deaths);
          const isMatch = this.checkSeverityMatch(deaths, selectedSeverityFilter);
          return isMatch ? color : '#B8C1CC';
        }
        return getSeverityColor(deaths);
      });

    // Step 3 Inspection for India (data-id="356")
    const india = document.querySelector('.country-path[data-id="356"]');
    if (india) {
      console.log(`[Diagnostic Step 3 Immediate] India (356) getAttribute("fill"):`, india.getAttribute("fill"));
      console.log(`[Diagnostic Step 3 Immediate] India (356) getComputedStyle().fill:`, getComputedStyle(india).fill);

      // Step 6: Verify visible SVG containment
      const containerSvg = this.container.querySelector('svg');
      console.log(`[Diagnostic Step 6] India element inside container SVG?:`, containerSvg.contains(india));
    }

    // Step 4 Inspection after 500ms
    setTimeout(() => {
      if (india) {
        console.log(`[Diagnostic Step 4 at +500ms] India (356) getAttribute("fill"):`, india.getAttribute("fill"));
        console.log(`[Diagnostic Step 4 at +500ms] India (356) getComputedStyle().fill:`, getComputedStyle(india).fill);
      }
    }, 500);

    // Toggle active and selected CSS states
    this.paths
      .classed('active-conflict', d => this.getDeathsForFeature(d) > 0)
      .classed('selected', d => normalizeCountryId(d.id) === this.selectedCountryId);
  }

  checkSeverityMatch(deaths, filter) {
    if (!deaths || deaths <= 0) return false;
    if (filter === '10-100') return deaths >= 10 && deaths < 100;
    if (filter === '100-500') return deaths >= 100 && deaths < 500;
    if (filter === '500-1000') return deaths >= 500 && deaths < 1000;
    if (filter === '1000-5000') return deaths >= 1000 && deaths < 5000;
    if (filter === '5000+') return deaths >= 5000;
    return true;
  }

  handleMouseOver(event, d) {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;

    const normId = normalizeCountryId(d.id);
    const countryName = d.properties ? d.properties.name : (this.countryIdToName.get(normId) || 'Unknown Country');
    const deaths = this.getDeathsForFeature(d);
    const status = deaths > 0 ? 'Active Conflict' : 'No Conflict Data';

    tooltip.innerHTML = `
      <div class="tooltip-country">${countryName}</div>
      <div class="tooltip-metric">
        <span>Status:</span>
        <span class="value" style="color: ${deaths > 0 ? '#C62828' : '#5F6368'}">${status}</span>
      </div>
      <div class="tooltip-metric">
        <span>Battle Deaths:</span>
        <span class="value">${deaths.toLocaleString()}</span>
      </div>
    `;

    tooltip.classList.remove('hidden');
  }

  handleMouseMove(event) {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;

    const wrapperRect = this.container.getBoundingClientRect();
    const x = event.clientX - wrapperRect.left + 15;
    const y = event.clientY - wrapperRect.top + 15;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  handleMouseOut() {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) {
      tooltip.classList.add('hidden');
    }
  }

  handleCountryClick(event, d) {
    const normId = normalizeCountryId(d.id);
    this.selectedCountryId = normId;
    this.paths.classed('selected', p => normalizeCountryId(p.id) === this.selectedCountryId);

    const countryName = d.properties ? d.properties.name : (this.countryIdToName.get(normId) || 'Unknown Country');
    const deaths = this.getDeathsForFeature(d);

    if (this.onCountrySelect) {
      this.onCountrySelect(normId, countryName, deaths);
    }
  }
}
