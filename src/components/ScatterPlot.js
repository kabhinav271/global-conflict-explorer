/**
 * ScatterPlot Component — "Does more time in conflict mean more people die?"
 * Visualizes Years in Conflict vs. Average Battle Deaths per Year.
 * Encapsulated within .narrative-scatterplot-section namespace.
 * Displays clean bubbles only. Country name and details appear on hover via tooltip.
 */

import { normalizeCountryId } from '../utils/dataLoader.js';

export class ScatterPlot {
  constructor(containerId, appData) {
    this.container = document.getElementById(containerId);
    this.appData = appData;

    this.regionNames = {
      1: 'Europe',
      2: 'Middle East',
      3: 'Asia',
      4: 'Africa',
      5: 'Americas'
    };

    this.regionColors = {
      1: '#3B82F6', // Europe: Blue
      2: '#EF4444', // Middle East: Red
      3: '#10B981', // Asia: Green
      4: '#F59E0B', // Africa: Amber/Gold
      5: '#8B5CF6'  // Americas: Purple
    };

    this.activeRegionFilter = 'all';
    this.scatterData = [];

    this.init();
  }

  init() {
    if (!this.container) return;

    this.processData();
    this.renderSkeleton();
    this.renderChart();
    this.bindEvents();

    // Responsive resize listener
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => this.renderChart());
    });
  }

  processData() {
    const countryMap = new Map();

    for (const [year, records] of this.appData.yearIndex.entries()) {
      records.forEach(r => {
        const deaths = r.bdBest || 0;
        const region = r.region || 0;
        const conflictId = r.conflictId;

        if (r.matchedCountryIds && Array.isArray(r.matchedCountryIds)) {
          r.matchedCountryIds.forEach(cid => {
            const normId = normalizeCountryId(cid);
            const name = this.appData.countryIdToName.get(normId) || 'Unknown';

            if (!countryMap.has(normId)) {
              countryMap.set(normId, {
                id: normId,
                name,
                region,
                yearsSet: new Set(),
                totalDeaths: 0,
                conflictsSet: new Set()
              });
            }

            const stat = countryMap.get(normId);
            if (deaths > 0) {
              stat.yearsSet.add(year);
            }
            stat.totalDeaths += deaths;
            if (conflictId) {
              stat.conflictsSet.add(conflictId);
            }
          });
        }
      });
    }

    this.scatterData = [];
    for (const [id, stat] of countryMap.entries()) {
      const yearsInConflict = stat.yearsSet.size;
      if (yearsInConflict > 0) {
        const avgDeathsPerYear = Math.round(stat.totalDeaths / yearsInConflict);
        this.scatterData.push({
          id: stat.id,
          name: stat.name,
          region: stat.region,
          yearsInConflict,
          totalDeaths: stat.totalDeaths,
          avgDeathsPerYear,
          totalConflicts: stat.conflictsSet.size
        });
      }
    }
  }

  renderSkeleton() {
    this.container.innerHTML = `
      <div class="scatter-wrapper">
        
        <!-- Legend & Filter Bar -->
        <div class="scatter-controls-bar">
          <span class="scatter-legend-label">Filter Region:</span>
          <div class="scatter-region-chips">
            <button class="scatter-chip active" data-region="all">
              <span class="scatter-chip-dot" style="background: #475569"></span>
              All Regions
            </button>
            <button class="scatter-chip" data-region="1">
              <span class="scatter-chip-dot" style="background: ${this.regionColors[1]}"></span>
              Europe
            </button>
            <button class="scatter-chip" data-region="2">
              <span class="scatter-chip-dot" style="background: ${this.regionColors[2]}"></span>
              Middle East
            </button>
            <button class="scatter-chip" data-region="3">
              <span class="scatter-chip-dot" style="background: ${this.regionColors[3]}"></span>
              Asia
            </button>
            <button class="scatter-chip" data-region="4">
              <span class="scatter-chip-dot" style="background: ${this.regionColors[4]}"></span>
              Africa
            </button>
            <button class="scatter-chip" data-region="5">
              <span class="scatter-chip-dot" style="background: ${this.regionColors[5]}"></span>
              Americas
            </button>
          </div>
        </div>

        <!-- D3 SVG Chart Container -->
        <div class="scatter-chart-box" id="scatter-chart-box">
          <div class="scatter-tooltip hidden" id="scatter-tooltip"></div>
        </div>

        <!-- Footnote / Legend explanation -->
        <div class="scatter-footer-note">
          <span>Bubble size represents total distinct conflicts recorded (1989–2025). Hover over any bubble to see country details.</span>
        </div>

      </div>
    `;
  }

  bindEvents() {
    const chips = this.container.querySelectorAll('.scatter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeRegionFilter = chip.getAttribute('data-region');
        this.updateFilter();
      });
    });
  }

  updateFilter() {
    const svg = d3.select(this.container).select('svg');
    if (svg.empty()) return;

    svg.selectAll('.scatter-bubble')
      .transition()
      .duration(300)
      .style('opacity', d => {
        if (this.activeRegionFilter === 'all') return 0.82;
        return String(d.region) === String(this.activeRegionFilter) ? 0.92 : 0.12;
      });
  }

  renderChart() {
    const box = document.getElementById('scatter-chart-box');
    if (!box) return;

    box.querySelector('svg')?.remove();

    const width = box.clientWidth || 960;
    const height = Math.min(560, Math.max(400, width * 0.52));
    const margin = { top: 40, right: 40, bottom: 65, left: 80 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(box)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X-Scale: Years in Conflict (0 to 38 years)
    const xScale = d3.scaleLinear()
      .domain([0, 38])
      .range([0, innerWidth]);

    // Y-Scale: Average Battle Deaths per Year (Log scale)
    const minY = 1;
    const maxY = d3.max(this.scatterData, d => d.avgDeathsPerYear) || 50000;

    const yScale = d3.scaleLog()
      .domain([minY, maxY * 1.5])
      .range([innerHeight, 0])
      .nice();

    // Radius Scale: Number of Conflicts
    const maxConflicts = d3.max(this.scatterData, d => d.totalConflicts) || 10;
    const rScale = d3.scaleSqrt()
      .domain([1, maxConflicts])
      .range([6, 24]);

    // Grid lines
    const xGrid = d3.axisBottom(xScale).ticks(8).tickSize(-innerHeight).tickFormat('');
    const yGrid = d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat('');

    g.append('g')
      .attr('class', 'scatter-grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xGrid)
      .selectAll('line')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '3,3');

    g.append('g')
      .attr('class', 'scatter-grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(8)
      .tickFormat(d => `${d} yrs`);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5, '~s');

    g.append('g')
      .attr('class', 'scatter-axis x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', innerWidth / 2)
      .attr('y', 48)
      .attr('fill', '#475569')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('text-anchor', 'middle')
      .text('Years in Conflict (1989–2025)');

    g.append('g')
      .attr('class', 'scatter-axis y-axis')
      .call(yAxis)
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -56)
      .attr('fill', '#475569')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('text-anchor', 'middle')
      .text('Average Battle Deaths / Year (log scale)');

    const tooltip = d3.select(box).select('#scatter-tooltip');

    // Render Bubbles ONLY (no permanent text labels)
    const bubbles = g.selectAll('.scatter-bubble')
      .data(this.scatterData, d => d.id)
      .enter()
      .append('circle')
      .attr('class', 'scatter-bubble')
      .attr('cx', d => xScale(d.yearsInConflict))
      .attr('cy', d => yScale(Math.max(1, d.avgDeathsPerYear)))
      .attr('r', d => rScale(d.totalConflicts))
      .attr('fill', d => this.regionColors[d.region] || '#8E0A0A')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', '1.5px')
      .style('opacity', 0.82)
      .style('cursor', 'pointer')
      .style('transition', 'r 150ms ease, opacity 150ms ease, stroke-width 150ms ease');

    // Hover Interactions
    bubbles
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget)
          .attr('r', rScale(d.totalConflicts) + 5)
          .style('opacity', 1.0)
          .attr('stroke', '#0F172A')
          .attr('stroke-width', '2.5px');

        const regionName = this.regionNames[d.region] || 'Unknown';

        tooltip
          .html(`
            <div class="tt-header">
              <span class="tt-country">${d.name}</span>
              <span class="tt-region" style="background-color: ${this.regionColors[d.region]}">${regionName}</span>
            </div>
            <div class="tt-body">
              <div class="tt-row">
                <span class="tt-lbl">Years in Conflict:</span>
                <span class="tt-val red">${d.yearsInConflict} yrs</span>
              </div>
              <div class="tt-row">
                <span class="tt-lbl">Avg. Battle Deaths / Year:</span>
                <span class="tt-val">${d.avgDeathsPerYear.toLocaleString()}</span>
              </div>
              <div class="tt-row">
                <span class="tt-lbl">Total Battle Deaths:</span>
                <span class="tt-val">${d.totalDeaths.toLocaleString()}</span>
              </div>
              <div class="tt-row">
                <span class="tt-lbl">Recorded Conflicts:</span>
                <span class="tt-val">${d.totalConflicts}</span>
              </div>
            </div>
          `)
          .classed('hidden', false);
      })
      .on('mousemove', (event) => {
        const boxRect = box.getBoundingClientRect();
        const mouseX = event.clientX - boxRect.left;
        const mouseY = event.clientY - boxRect.top;

        // Smart edge detection so tooltip doesn't overflow container
        const ttNode = tooltip.node();
        const ttWidth = ttNode ? ttNode.offsetWidth : 200;
        let leftPos = mouseX + 16;
        if (leftPos + ttWidth > boxRect.width - 20) {
          leftPos = mouseX - ttWidth - 16;
        }

        tooltip
          .style('left', `${leftPos}px`)
          .style('top', `${mouseY - 12}px`);
      })
      .on('mouseleave', (event, d) => {
        d3.select(event.currentTarget)
          .attr('r', rScale(d.totalConflicts))
          .style('opacity', this.activeRegionFilter === 'all' || String(d.region) === String(this.activeRegionFilter) ? 0.82 : 0.12)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', '1.5px');

        tooltip.classed('hidden', true);
      });
  }
}
