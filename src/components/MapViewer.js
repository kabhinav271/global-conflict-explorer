/**
 * MapViewer Component
 * Rebuilt using official World Atlas countries-110m.json map layer.
 * Dynamic Interstate Conflict Arrows: Frozen arrowhead angle at destination (no post-flight rotation/tilting).
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

    // Create SVG defs section for soft glow filter
    this.createArrowDefs();

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

    // Store center point of every country
    this.countryCenters = new Map();

    countries.forEach(feature => {
      const id = normalizeCountryId(feature.id);
      const centroid = this.pathGenerator.centroid(feature);
      if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
        this.countryCenters.set(id, {
          x: centroid[0],
          y: centroid[1]
        });
      }
    });

    // Group for zoomable elements
    this.g = this.svg.append('g').attr('class', 'map-g');

    // Layer for countries
    this.countryLayer = this.g
      .append("g")
      .attr("class", "country-layer");

    // Layer for interstate arrows
    this.arcLayer = this.g
      .append("g")
      .attr("class", "arc-layer");

    // Zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // 3. Render every country as an independent SVG path
    this.paths = this.countryLayer.selectAll('.country-path')
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

  /**
   * Creates SVG defs (Soft Glow Filter)
   */
  createArrowDefs() {
    let defs = this.svg.select('defs');
    if (defs.empty()) {
      defs = this.svg.append('defs');
    }

    // Subtle Glow Filter
    if (defs.select('#arrow-glow').empty()) {
      const filter = defs.append('filter')
        .attr('id', 'arrow-glow')
        .attr('x', '-20%')
        .attr('y', '-20%')
        .attr('width', '140%')
        .attr('height', '140%');

      filter.append('feGaussianBlur')
        .attr('stdDeviation', '2.5')
        .attr('result', 'blur');

      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'blur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }
  }

  /**
   * Helper: Calculates variable arrow stroke thickness based on Battle Deaths
   */
  getArrowWidth(totalBattleDeaths) {
    const deaths = totalBattleDeaths || 0;
    if (deaths < 100) return 2;
    if (deaths < 500) return 3;
    if (deaths < 1000) return 4;
    if (deaths < 5000) return 6;
    return 8;
  }

  /**
   * Helper: Animates path drawing with moving arrowhead.
   * Freezes rotation at destination using last valid angle.
   */
  animateArrow(pathElement, strokeWidth = 2, duration = 600) {
    const node = pathElement.node();
    const totalLength = node.getTotalLength();
    if (!totalLength || totalLength <= 0) return;

    // Create moving arrowhead element inside arcLayer
    const headScale = Math.max(0.7, strokeWidth / 3);
    const flyingHead = this.arcLayer.append("polygon")
      .attr("class", "moving-arrowhead")
      .attr("points", "-6,-5 6,0 -6,5")
      .attr("fill", "#7DD3FC")
      .attr("opacity", 0.95)
      .style("filter", "url(#arrow-glow)");

    // Set initial dasharray and offset
    pathElement
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength);

    let lastValidAngle = 0;

    // D3 transition moving the arrowhead along the curve
    pathElement
      .transition()
      .duration(duration)
      .ease(d3.easeCubicOut)
      .attrTween("stroke-dashoffset", () => {
        return (t) => {
          const currentLength = t * totalLength;
          const offset = totalLength - currentLength;

          // Clamp sampling length to prevent sampling beyond totalLength
          const safeLen = Math.min(currentLength, totalLength);

          if (safeLen < totalLength - 0.5) {
            const p0 = node.getPointAtLength(safeLen);
            const p1 = node.getPointAtLength(Math.min(safeLen + 1, totalLength));
            lastValidAngle = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI);
            flyingHead.attr("transform", `translate(${p0.x}, ${p0.y}) rotate(${lastValidAngle}) scale(${headScale})`);
          } else {
            // At destination: Freeze position at destination and preserve lastValidAngle
            const pEnd = node.getPointAtLength(totalLength);
            flyingHead.attr("transform", `translate(${pEnd.x}, ${pEnd.y}) rotate(${lastValidAngle}) scale(${headScale})`);
          }

          return offset;
        };
      })
      .on("end", () => {
        // Freeze final position at exact totalLength with lastValidAngle
        const pEnd = node.getPointAtLength(totalLength);
        flyingHead.attr("transform", `translate(${pEnd.x}, ${pEnd.y}) rotate(${lastValidAngle}) scale(${headScale})`);
      });
  }

  getDeathsForFeature(d) {
    if (!d || d.id === undefined || d.id === null) return 0;
    const normId = normalizeCountryId(d.id);
    return this.currentCountryDeaths.get(normId) || 0;
  }

  getCountryCenter(countryID) {
    return this.countryCenters.get(normalizeCountryId(countryID));
  }

  /**
   * Renders dynamic interstate conflict arrows for selected country and year.
   */
  drawInterstateArrows(selectedCountryId, currentYear, records) {
    // Always clear all previous arrows and head elements before evaluating
    this.arcLayer.selectAll("*").remove();

    if (!selectedCountryId || !records || !Array.isArray(records)) {
      console.log(`Selected Country: ${selectedCountryId || 'None'}`);
      console.log(`Selected Year: ${currentYear}`);
      console.log(`Number of interstate conflicts found after filtering: 0`);
      return;
    }

    const normSelectedId = normalizeCountryId(selectedCountryId);
    const targetYear = Number(currentYear);
    const countryName = this.countryIdToName.get(normSelectedId) || normSelectedId;

    // Strict 3-Way Filter
    const interstateConflicts = records.filter(record => {
      const isYearMatch = Number(record.year) === targetYear;
      const isInterstate = String(record.typeOfConflict) === '2';
      const isCountryMatch = record.matchedCountryIds.some(cid => normalizeCountryId(cid) === normSelectedId);
      return isYearMatch && isInterstate && isCountryMatch;
    });

    console.log(`Selected Country: ${countryName} (${normSelectedId})`);
    console.log(`Selected Year: ${targetYear}`);
    console.log(`Number of interstate conflicts found after filtering: ${interstateConflicts.length}`);

    if (interstateConflicts.length === 0) {
      return;
    }

    const drawnPairs = new Set();

    interstateConflicts.forEach(record => {
      console.log(`Year: ${record.year}`);
      console.log(`Type of Conflict: ${record.typeOfConflict}`);
      console.log(`Side A: ${record.sideA}`);
      console.log(`Side B: ${record.sideB}`);

      const opponentIds = record.matchedCountryIds
        .map(cid => normalizeCountryId(cid))
        .filter(cid => cid !== normSelectedId);

      const deaths = record.bdBest || 0;
      const strokeWidth = this.getArrowWidth(deaths);

      opponentIds.forEach(targetId => {
        const pairKey = [normSelectedId, targetId].sort().join('-');
        if (drawnPairs.has(pairKey)) return;
        drawnPairs.add(pairKey);

        const start = this.getCountryCenter(normSelectedId);
        const end = this.getCountryCenter(targetId);

        if (!start || !end) return;

        // Quadratic Bézier curve control point
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - 35;

        const pathString = `
          M ${start.x},${start.y}
          Q ${midX},${midY}
            ${end.x},${end.y}
        `;

        // Render arc path inside arcLayer with variable thickness & soft glow
        const arcPath = this.arcLayer.append("path")
          .attr("d", pathString)
          .attr("fill", "none")
          .attr("stroke", "#7DD3FC")
          .attr("stroke-width", strokeWidth)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .attr("opacity", 0.85)
          .style("filter", "url(#arrow-glow)");

        // Animate moving arrowhead along curve
        this.animateArrow(arcPath, strokeWidth, 600);
      });
    });
  }

  /**
   * Map update execution
   */
  updateMap(countryDeathsMap, selectedSeverityFilter = 'all') {
    this.currentCountryDeaths = countryDeathsMap || new Map();
    this.selectedSeverityFilter = selectedSeverityFilter;

    if (!this.paths) return;

    // Transition fill color smoothly using both style('fill', ...) and attr('fill', ...)
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
