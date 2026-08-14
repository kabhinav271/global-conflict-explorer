/**
 * DataLoader & Country Lookup Layer Component
 * Ensures 100% robust string/number country ID normalization for Map matching.
 * Integrated with World Bank Population Dataset (API_SP.POP.TOTL_DS2_en_csv_v2_33112.csv).
 */

export function normalizeCountryId(id) {
  if (id === null || id === undefined) return '';
  const str = String(id).trim();
  if (str.length === 1) return '00' + str;
  if (str.length === 2) return '0' + str;
  return str;
}

// Standard ISO-3 Alpha-3 to Numeric ISO ID map (3-digit zero-padded)
export const ISO3_TO_NUMERIC = {
  'AFG': '004', 'ALB': '008', 'DZA': '012', 'AND': '020', 'AGO': '024', 'ATG': '028', 'ARG': '032', 'ARM': '051',
  'AUS': '036', 'AUT': '040', 'AZE': '031', 'BHS': '044', 'BHR': '048', 'BGD': '050', 'BRB': '052', 'BLR': '112',
  'BEL': '056', 'BLZ': '084', 'BEN': '204', 'BTN': '064', 'BOL': '068', 'BIH': '070', 'BWA': '072', 'BRA': '076',
  'BRN': '096', 'BGR': '100', 'BFA': '854', 'BDI': '108', 'KHM': '116', 'CMR': '120', 'CAN': '124', 'CPV': '132',
  'CAF': '140', 'TCD': '148', 'CHL': '152', 'CHN': '156', 'COL': '170', 'COM': '174', 'COG': '178', 'COD': '180',
  'CRI': '188', 'CIV': '384', 'HRV': '191', 'CUB': '192', 'CYP': '196', 'CZE': '203', 'DNK': '208', 'DJI': '262',
  'DMA': '212', 'DOM': '214', 'ECU': '218', 'EGY': '818', 'SLV': '222', 'GNQ': '226', 'ERI': '232', 'EST': '233',
  'ETH': '231', 'FJI': '242', 'FIN': '246', 'FRA': '250', 'GAB': '266', 'GMB': '270', 'GEO': '268', 'DEU': '276',
  'GHA': '288', 'GRC': '300', 'GRD': '308', 'GTM': '320', 'GIN': '324', 'GNB': '624', 'GUY': '328', 'HTI': '332',
  'HND': '340', 'HUN': '348', 'ISL': '352', 'IND': '356', 'IDN': '360', 'IRN': '364', 'IRQ': '368', 'IRL': '372',
  'ISR': '376', 'ITA': '380', 'JAM': '388', 'JPN': '392', 'JOR': '400', 'KAZ': '398', 'KEN': '404', 'KIR': '296',
  'PRK': '408', 'KOR': '410', 'KWT': '414', 'KGZ': '417', 'LAO': '418', 'LVA': '428', 'LBN': '422', 'LSO': '426',
  'LBR': '430', 'LBY': '434', 'LIE': '438', 'LTU': '440', 'LUX': '442', 'MKD': '807', 'MDG': '450', 'MWI': '454',
  'MYS': '458', 'MDV': '462', 'MLI': '466', 'MLT': '470', 'MHL': '584', 'MRT': '478', 'MUS': '480', 'MEX': '484',
  'FSM': '583', 'MDA': '498', 'MCO': '492', 'MNG': '496', 'MNE': '499', 'MAR': '504', 'MOZ': '508', 'MMR': '104',
  'NAM': '516', 'NRU': '520', 'NPL': '524', 'NLD': '528', 'NZL': '554', 'NIC': '558', 'NER': '562', 'NGA': '566',
  'NOR': '578', 'OMN': '512', 'PAK': '586', 'PLW': '585', 'PAN': '591', 'PNG': '598', 'PRY': '600', 'PER': '604',
  'PHL': '608', 'POL': '616', 'PRT': '620', 'QAT': '634', 'ROU': '642', 'RUS': '643', 'RWA': '646', 'KNA': '659',
  'LCA': '662', 'VCT': '670', 'WSM': '882', 'SMR': '674', 'STP': '678', 'SAU': '682', 'SEN': '686', 'SRB': '688',
  'SYC': '690', 'SLE': '694', 'SGP': '702', 'SVK': '703', 'SVN': '705', 'SLB': '090', 'SOM': '706', 'ZAF': '710',
  'SSD': '728', 'ESP': '724', 'LKA': '144', 'SDN': '729', 'SUR': '740', 'SWZ': '748', 'SWE': '752', 'CHE': '756',
  'SYR': '760', 'TWN': '158', 'TJK': '762', 'TZA': '834', 'THA': '764', 'TLS': '626', 'TGO': '768', 'TON': '776',
  'TTO': '780', 'TUN': '788', 'TUR': '792', 'TKM': '795', 'TUV': '798', 'UGA': '800', 'UKR': '804', 'ARE': '784',
  'GBR': '826', 'USA': '840', 'URY': '858', 'UZB': '860', 'VUT': '548', 'VEN': '862', 'VNM': '704', 'YEM': '887',
  'ZMB': '894', 'ZWE': '716'
};

// CSV Entity Name to ISO3 Mapping Table
export const NAME_TO_ISO3 = {
  'Afghanistan': 'AFG', 'Algeria': 'DZA', 'Angola': 'AGO', 'Argentina': 'ARG', 'Australia': 'AUS', 'Azerbaijan': 'AZE',
  'Bangladesh': 'BGD', 'Benin': 'BEN', 'Bosnia-Herzegovina': 'BIH', 'Bosnia and Herz.': 'BIH', 'Burkina Faso': 'BFA',
  'Burundi': 'BDI', 'Cambodia': 'KHM', 'Cambodia (Kampuchea)': 'KHM', 'Cameroon': 'CMR', 'Central African Republic': 'CAF',
  'Central African Rep.': 'CAF', 'Chad': 'TCD', 'China': 'CHN', 'Colombia': 'COL', 'Comoros': 'COM', 'Congo': 'COG',
  'DR Congo (Zaire)': 'COD', 'Democratic Republic of Congo': 'COD', 'Dem. Rep. Congo': 'COD', 'Costa Rica': 'CRI',
  'Croatia': 'HRV', 'Cuba': 'CUB', 'Djibouti': 'DJI', 'Dominican Republic': 'DOM', 'Dominican Rep.': 'DOM',
  'Ecuador': 'ECU', 'Egypt': 'EGY', 'Egypt, Arab Rep.': 'EGY', 'El Salvador': 'SLV', 'Equatorial Guinea': 'GNQ',
  'Eq. Guinea': 'GNQ', 'Eritrea': 'ERI', 'Ethiopia': 'ETH', 'France': 'FRA', 'Georgia': 'GEO', 'Ghana': 'GHA',
  'Guatemala': 'GTM', 'Guinea': 'GIN', 'Guinea-Bissau': 'GNB', 'Guyana': 'GUY', 'Haiti': 'HTI', 'Honduras': 'HND',
  'India': 'IND', 'Indonesia': 'IDN', 'Iran': 'IRN', 'Iran, Islamic Rep.': 'IRN', 'Iraq': 'IRQ', 'Israel': 'ISR',
  'Ivory Coast': 'CIV', "Cote d'Ivoire": 'CIV', "Côte d'Ivoire": 'CIV', 'Jordan': 'JOR', 'Kenya': 'KEN', 'Kuwait': 'KWT',
  'Kyrgyzstan': 'KGZ', 'Kyrgyz Republic': 'KGZ', 'Laos': 'LAO', 'Lao PDR': 'LAO', 'Lebanon': 'LBN', 'Lesotho': 'LSO',
  'Liberia': 'LBR', 'Libya': 'LBY', 'Macedonia': 'MKD', 'North Macedonia': 'MKD', 'Madagascar': 'MDG', 'Malaysia': 'MYS',
  'Mali': 'MLI', 'Mauritania': 'MRT', 'Mexico': 'MEX', 'Moldova': 'MDA', 'Morocco': 'MAR', 'Mozambique': 'MOZ',
  'Myanmar': 'MMR', 'Myanmar (Burma)': 'MMR', 'Nepal': 'NPL', 'Nicaragua': 'NIC', 'Niger': 'NER', 'Nigeria': 'NGA',
  'North Korea': 'PRK', 'Korea, Dem. People\'s Rep.': 'PRK', 'South Korea': 'KOR', 'Korea, Rep.': 'KOR',
  'Pakistan': 'PAK', 'Panama': 'PAN', 'Papua New Guinea': 'PNG', 'Paraguay': 'PRY', 'Peru': 'PER', 'Philippines': 'PHL',
  'Romania': 'ROU', 'Russia': 'RUS', 'Russian Federation': 'RUS', 'Russia (Soviet Union)': 'RUS', 'Rwanda': 'RWA',
  'Saudi Arabia': 'SAU', 'Senegal': 'SEN', 'Serbia': 'SRB', 'Sierra Leone': 'SLE', 'Somalia': 'SOM', 'Somalia, Fed. Rep.': 'SOM',
  'South Africa': 'ZAF', 'South Sudan': 'SSD', 'Spain': 'ESP', 'Sri Lanka': 'LKA', 'Sudan': 'SDN', 'Suriname': 'SUR',
  'Swaziland': 'SWZ', 'Eswatini': 'SWZ', 'Sweden': 'SWE', 'Switzerland': 'CHE', 'Syria': 'SYR', 'Syrian Arab Republic': 'SYR',
  'Tajikistan': 'TJK', 'Tanzania': 'TZA', 'Thailand': 'THA', 'Togo': 'TGO', 'Trinidad and Tobago': 'TTO', 'Tunisia': 'TUN',
  'Turkey': 'TUR', 'Turkiye': 'TUR', 'Turkmenistan': 'TKM', 'Uganda': 'UGA', 'Ukraine': 'UKR', 'United Arab Emirates': 'ARE',
  'United Kingdom': 'GBR', 'United States': 'USA', 'United States of America': 'USA', 'Uruguay': 'URY', 'Uzbekistan': 'UZB',
  'Venezuela': 'VEN', 'Venezuela, RB': 'VEN', 'Vietnam': 'VNM', 'Viet Nam': 'VNM', 'Yemen': 'YEM', 'Yemen, Rep.': 'YEM',
  'Zambia': 'ZMB', 'Zimbabwe': 'ZWE'
};

/**
 * Returns color code according to DESIGN_GUIDE.md severity scale
 */
export function getSeverityColor(deaths) {
  if (!deaths || deaths <= 0) return '#B8C1CC'; // No conflict: #B8C1CC
  if (deaths < 100) return '#FDECEC';   // 10–100: Very Light Red
  if (deaths < 500) return '#F7B7B7';   // 100–500: Light Red
  if (deaths < 1000) return '#EF6A6A';  // 500–1000: Medium Red
  if (deaths < 5000) return '#C62828';  // 1000–5000: Dark Red
  return '#5C0A0A';                     // 5000+: Deep Red
}

export function getSeverityCategory(deaths) {
  if (!deaths || deaths <= 0) return '0';
  if (deaths < 100) return '10-100';
  if (deaths < 500) return '100-500';
  if (deaths < 1000) return '500-1000';
  if (deaths < 5000) return '1000-5000';
  return '5000+';
}

export async function loadApplicationData() {
  try {
    // 1. Fetch official World Atlas countries-110m.json dataset
    const topoResponse = await fetch('countries-110m.json');
    const topoData = await topoResponse.json();

    // 2. Fetch CSV Battle Deaths data
    const csvResponse = await fetch('BattleDeaths_v26_1.csv');
    const csvText = await csvResponse.text();
    const rawRows = d3.csvParse(csvText);

    console.log(`✓ CSV loaded: ${rawRows.length} rows`);

    // 3. Process TopoJSON geometries & name maps with ID normalization
    const geoCountries = topojson.feature(topoData, topoData.objects.countries).features;
    
    const countryNameToId = new Map();
    const countryIdToName = new Map();
    const countryIdToFeature = new Map();

    geoCountries.forEach(feature => {
      const normId = normalizeCountryId(feature.id);
      const name = feature.properties ? feature.properties.name : null;
      if (name && normId) {
        countryNameToId.set(name, normId);
        countryIdToName.set(normId, name);
        countryIdToFeature.set(normId, feature);

        const iso3 = NAME_TO_ISO3[name];
        if (iso3) {
          countryNameToId.set(iso3, normId);
        }
      }
    });

    console.log(`✓ Number of countries: ${geoCountries.length}`);

    // 4. Parse & index CSV records with Country Lookup Layer
    const records = [];
    const yearIndex = new Map(); // year (int) -> Array of records
    const countryYearIndex = new Map(); // countryId -> Map(year -> { deaths, conflicts })
    
    const missingMappings = new Set();
    const matchedSvgIds = new Set();

    rawRows.forEach(row => {
      const year = parseInt(row.year, 10);
      const bdBest = parseInt(row.bd_best, 10) || 0;
      const bdLow = parseInt(row.bd_low, 10) || 0;
      const bdHigh = parseInt(row.bd_high, 10) || 0;

      // Extract locations
      const locString = row.location_inc || '';
      const locationNames = locString.split(',').map(s => s.trim()).filter(Boolean);

      const matchedCountryIds = [];
      locationNames.forEach(rawLoc => {
        const iso3 = NAME_TO_ISO3[rawLoc];
        let cid = null;

        if (iso3 && ISO3_TO_NUMERIC[iso3]) {
          cid = ISO3_TO_NUMERIC[iso3];
        } else if (countryNameToId.has(rawLoc)) {
          cid = countryNameToId.get(rawLoc);
        }

        if (cid) {
          const normCid = normalizeCountryId(cid);
          matchedCountryIds.push(normCid);
          matchedSvgIds.add(normCid);
        } else {
          missingMappings.add(rawLoc);
        }
      });

      const record = {
        conflictId: row.conflict_id,
        dyadId: row.dyad_id,
        year: year,
        locationInc: row.location_inc,
        matchedCountryIds: matchedCountryIds,
        sideA: row.side_a,
        sideB: row.side_b,
        incompatibility: row.incompatibility,
        territoryName: row.territory_name,
        typeOfConflict: row.type_of_conflict,
        battleLocation: row.battle_location,
        region: row.region,
        bdBest: bdBest,
        bdLow: bdLow,
        bdHigh: bdHigh
      };

      records.push(record);

      // Index by year
      if (!yearIndex.has(year)) {
        yearIndex.set(year, []);
      }
      yearIndex.get(year).push(record);

      // Index by country & year
      matchedCountryIds.forEach(cid => {
        if (!countryYearIndex.has(cid)) {
          countryYearIndex.set(cid, new Map());
        }
        const cYearMap = countryYearIndex.get(cid);
        if (!cYearMap.has(year)) {
          cYearMap.set(year, {
            totalDeaths: 0,
            conflicts: []
          });
        }
        const yearEntry = cYearMap.get(year);
        yearEntry.totalDeaths += bdBest;
        yearEntry.conflicts.push(record);
      });
    });

    // 5. Fetch & parse World Bank Population CSV (API_SP.POP.TOTL_DS2_en_csv_v2_33112.csv)
    const populationMap = new Map(); // countryId -> Map(year -> pop)
    try {
      const popResponse = await fetch('API_SP.POP.TOTL_DS2_en_csv_v2_33112.csv');
      const popText = await popResponse.text();

      const lines = popText.split(/\r?\n/).filter(line => line.trim().length > 0);
      let headerIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"Country Name"') || lines[i].includes('Country Name')) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex !== -1) {
        function parseLine(line) {
          const result = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(cur.trim());
              cur = '';
            } else {
              cur += char;
            }
          }
          result.push(cur.trim());
          return result;
        }

        const headers = parseLine(lines[headerIndex]);
        for (let i = headerIndex + 1; i < lines.length; i++) {
          const values = parseLine(lines[i]);
          if (values.length >= 5) {
            const rowObj = {};
            headers.forEach((h, idx) => {
              rowObj[h] = values[idx] || '';
            });

            const countryCode = rowObj['Country Code'];
            const countryName = rowObj['Country Name'];
            const iso3 = countryCode || NAME_TO_ISO3[countryName];
            let cid = null;

            if (iso3 && ISO3_TO_NUMERIC[iso3]) {
              cid = ISO3_TO_NUMERIC[iso3];
            } else if (countryNameToId.has(countryName)) {
              cid = countryNameToId.get(countryName);
            }

            if (cid) {
              const normCid = normalizeCountryId(cid);
              const yearMap = new Map();
              for (let yr = 1989; yr <= 2025; yr++) {
                const valStr = rowObj[String(yr)];
                if (valStr) {
                  const popVal = parseInt(valStr, 10);
                  if (!isNaN(popVal) && popVal > 0) {
                    yearMap.set(yr, popVal);
                  }
                }
              }
              if (yearMap.size > 0) {
                populationMap.set(normCid, yearMap);
              }
            }
          }
        }
      }
      console.log(`✓ World Bank population data loaded for ${populationMap.size} countries.`);
    } catch (popErr) {
      console.warn('Failed to load API_SP.POP.TOTL_DS2_en_csv_v2_33112.csv:', popErr);
    }

    const availableYears = Array.from(yearIndex.keys()).sort((a, b) => a - b);
    console.log(`✓ Years available: ${availableYears[0]} to ${availableYears[availableYears.length - 1]}`);

    return {
      topoData,
      geoCountries,
      countryNameToId,
      countryIdToName,
      countryIdToFeature,
      records,
      yearIndex,
      countryYearIndex,
      populationMap,
      earliestYear: availableYears[0] || 1989
    };

  } catch (error) {
    console.error('Failed to load application data:', error);
    throw error;
  }
}
