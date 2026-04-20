import { Calculator, fmt, fmtSci } from '../calc-types';

// Helper to build a factor-based converter
function makeFactorConverter(
  id: string,
  name: string,
  description: string,
  keywords: string[],
  units: { label: string; value: string; factor: number }[],
  unitLabel: string
): Calculator {
  const unitOptions = units.map(u => ({ label: u.label, value: u.value }));
  return {
    id,
    name,
    description,
    keywords,
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Value', type: 'number', default: 1, min: 0 },
      { id: 'from', label: `From ${unitLabel}`, type: 'select', default: units[0].value, options: unitOptions },
      { id: 'to', label: `To ${unitLabel}`, type: 'select', default: units[1]?.value ?? units[0].value, options: unitOptions },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      const fromUnit = units.find(u => u.value === inputs.from);
      const toUnit = units.find(u => u.value === inputs.to);
      if (!fromUnit || !toUnit) return [{ label: 'Result', value: 'Select valid units' }];
      // Convert: value in 'from' -> base -> 'to'
      const baseValue = val * fromUnit.factor;
      const result = toUnit.factor === 0 ? 0 : baseValue / toUnit.factor;
      return [
        { label: 'Result', value: `${fmtSci(result)} ${toUnit.label}`, highlight: true },
        { label: 'Formula', value: `1 ${fromUnit.label} = ${fmtSci(fromUnit.factor / toUnit.factor)} ${toUnit.label}` },
      ];
    },
  };
}

export const conversionCalculators: Calculator[] = [

  // 1. Length Converter
  makeFactorConverter(
    'length-converter', 'Length Converter',
    'Convert between length units including meters, kilometers, miles, feet, inches, centimeters, millimeters, and yards. Essential for engineering, travel, and everyday measurements.',
    ['length converter', 'distance converter', 'meter to feet', 'km to miles', 'inch to cm', 'distance units', 'imperial metric', 'length conversion'],
    [
      { label: 'Meters (m)', value: 'm', factor: 1 },
      { label: 'Kilometers (km)', value: 'km', factor: 1000 },
      { label: 'Miles (mi)', value: 'mi', factor: 1609.344 },
      { label: 'Feet (ft)', value: 'ft', factor: 0.3048 },
      { label: 'Inches (in)', value: 'in', factor: 0.0254 },
      { label: 'Centimeters (cm)', value: 'cm', factor: 0.01 },
      { label: 'Millimeters (mm)', value: 'mm', factor: 0.001 },
      { label: 'Yards (yd)', value: 'yd', factor: 0.9144 },
    ],
    'Unit'
  ),

  // 2. Weight Converter
  makeFactorConverter(
    'weight-converter', 'Weight Converter',
    'Convert between weight and mass units including kilograms, pounds, ounces, grams, metric tons, and stone. Widely used in cooking, fitness, and shipping.',
    ['weight converter', 'mass converter', 'kg to lbs', 'pound to kilogram', 'oz to grams', 'stone to kg', 'weight units', 'mass conversion'],
    [
      { label: 'Kilograms (kg)', value: 'kg', factor: 1 },
      { label: 'Pounds (lb)', value: 'lb', factor: 0.453592 },
      { label: 'Ounces (oz)', value: 'oz', factor: 0.0283495 },
      { label: 'Grams (g)', value: 'g', factor: 0.001 },
      { label: 'Metric Tons (t)', value: 'ton', factor: 1000 },
      { label: 'Stone (st)', value: 'st', factor: 6.35029 },
    ],
    'Unit'
  ),

  // 3. Temperature Converter (special - not factor-based)
  {
    id: 'temperature-converter',
    name: 'Temperature Converter',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin temperature scales. Essential for cooking, weather, science, and engineering applications.',
    keywords: ['temperature converter', 'Celsius to Fahrenheit', 'Fahrenheit to Celsius', 'Kelvin converter', 'temperature scale', 'C F K', 'thermometer conversion', 'heat scale'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Value', type: 'number', default: 100 },
      { id: 'from', label: 'From', type: 'select', default: 'C', options: [
        { label: 'Celsius (°C)', value: 'C' },
        { label: 'Fahrenheit (°F)', value: 'F' },
        { label: 'Kelvin (K)', value: 'K' },
      ] },
      { id: 'to', label: 'To', type: 'select', default: 'F', options: [
        { label: 'Celsius (°C)', value: 'C' },
        { label: 'Fahrenheit (°F)', value: 'F' },
        { label: 'Kelvin (K)', value: 'K' },
      ] },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      const from = String(inputs.from);
      const to = String(inputs.to);
      // First convert to Celsius
      let celsius: number;
      if (from === 'C') celsius = val;
      else if (from === 'F') celsius = (val - 32) * 5 / 9;
      else celsius = val - 273.15; // K
      // Then convert from Celsius to target
      let result: number;
      let suffix: string;
      if (to === 'C') { result = celsius; suffix = '°C'; }
      else if (to === 'F') { result = celsius * 9 / 5 + 32; suffix = '°F'; }
      else { result = celsius + 273.15; suffix = 'K'; }
      return [
        { label: 'Result', value: `${fmt(result, 2)} ${suffix}`, highlight: true },
        { label: 'Celsius', value: `${fmt(celsius, 2)} °C` },
        { label: 'Fahrenheit', value: `${fmt(celsius * 9 / 5 + 32, 2)} °F` },
        { label: 'Kelvin', value: `${fmt(celsius + 273.15, 2)} K` },
      ];
    },
  },

  // 4. Volume Converter
  makeFactorConverter(
    'volume-converter', 'Volume Converter',
    'Convert between volume units including liters, gallons, quarts, pints, cups, fluid ounces, and milliliters. Perfect for cooking, chemistry, and liquid measurements.',
    ['volume converter', 'liquid converter', 'liters to gallons', 'cups to mL', 'fluid ounce', 'volume units', 'gallon to liter', 'cooking volume'],
    [
      { label: 'Liters (L)', value: 'L', factor: 1 },
      { label: 'US Gallons (gal)', value: 'gal', factor: 3.78541 },
      { label: 'US Quarts (qt)', value: 'qt', factor: 0.946353 },
      { label: 'US Pints (pt)', value: 'pt', factor: 0.473176 },
      { label: 'US Cups (cup)', value: 'cup', factor: 0.236588 },
      { label: 'US Fluid Ounces (fl oz)', value: 'floz', factor: 0.0295735 },
      { label: 'Milliliters (mL)', value: 'mL', factor: 0.001 },
    ],
    'Unit'
  ),

  // 5. Area Converter
  makeFactorConverter(
    'area-converter', 'Area Converter',
    'Convert between area units including square meters, square feet, acres, hectares, and square miles. Used in real estate, agriculture, and land surveying.',
    ['area converter', 'square meter', 'square feet', 'acres to hectares', 'land area', 'area units', 'sq ft to sq m', 'property area'],
    [
      { label: 'Square Meters (m²)', value: 'm2', factor: 1 },
      { label: 'Square Feet (ft²)', value: 'ft2', factor: 0.092903 },
      { label: 'Acres', value: 'acre', factor: 4046.86 },
      { label: 'Hectares (ha)', value: 'ha', factor: 10000 },
      { label: 'Square Miles (mi²)', value: 'mi2', factor: 2589988.11 },
      { label: 'Square Kilometers (km²)', value: 'km2', factor: 1000000 },
    ],
    'Unit'
  ),

  // 6. Speed Converter
  makeFactorConverter(
    'speed-converter', 'Speed Converter',
    'Convert between speed units including miles per hour, kilometers per hour, meters per second, and knots. Used in transportation, aviation, and sports.',
    ['speed converter', 'velocity converter', 'mph to kmh', 'knots to mph', 'm/s converter', 'speed units', 'pace converter', 'wind speed'],
    [
      { label: 'Miles per Hour (mph)', value: 'mph', factor: 0.44704 },
      { label: 'Kilometers per Hour (km/h)', value: 'kmh', factor: 0.277778 },
      { label: 'Meters per Second (m/s)', value: 'ms', factor: 1 },
      { label: 'Knots (kn)', value: 'kn', factor: 0.514444 },
    ],
    'Unit'
  ),

  // 7. Time Converter
  makeFactorConverter(
    'time-converter', 'Time Converter',
    'Convert between time units including seconds, minutes, hours, days, weeks, months, and years. Useful for scheduling, project planning, and time calculations.',
    ['time converter', 'time unit', 'seconds to minutes', 'hours to days', 'weeks to months', 'time conversion', 'duration converter', 'time calculation'],
    [
      { label: 'Seconds (s)', value: 's', factor: 1 },
      { label: 'Minutes (min)', value: 'min', factor: 60 },
      { label: 'Hours (hr)', value: 'hr', factor: 3600 },
      { label: 'Days', value: 'day', factor: 86400 },
      { label: 'Weeks', value: 'week', factor: 604800 },
      { label: 'Months (avg)', value: 'month', factor: 2629746 },
      { label: 'Years (avg)', value: 'year', factor: 31556952 },
    ],
    'Unit'
  ),

  // 8. Data Storage Converter
  makeFactorConverter(
    'data-storage-converter', 'Data Storage Converter',
    'Convert between digital storage units including bytes, kilobytes, megabytes, gigabytes, terabytes, and petabytes. Essential for IT, cloud storage, and data management.',
    ['data converter', 'byte converter', 'MB to GB', 'KB to MB', 'data storage', 'digital storage', 'storage units', 'TB to GB'],
    [
      { label: 'Bytes (B)', value: 'B', factor: 1 },
      { label: 'Kilobytes (KB)', value: 'KB', factor: 1024 },
      { label: 'Megabytes (MB)', value: 'MB', factor: 1048576 },
      { label: 'Gigabytes (GB)', value: 'GB', factor: 1073741824 },
      { label: 'Terabytes (TB)', value: 'TB', factor: 1099511627776 },
      { label: 'Petabytes (PB)', value: 'PB', factor: 1125899906842624 },
    ],
    'Unit'
  ),

  // 9. Energy Converter
  makeFactorConverter(
    'energy-converter', 'Energy Converter',
    'Convert between energy units including joules, calories, kilocalories, kilowatt-hours, BTU, and electronvolts. Used in physics, nutrition, and engineering.',
    ['energy converter', 'joule converter', 'calories to joules', 'kWh converter', 'BTU converter', 'energy units', 'food calories', 'electronvolt'],
    [
      { label: 'Joules (J)', value: 'J', factor: 1 },
      { label: 'Calories (cal)', value: 'cal', factor: 4.184 },
      { label: 'Kilocalories (kcal)', value: 'kcal', factor: 4184 },
      { label: 'Kilowatt-Hours (kWh)', value: 'kWh', factor: 3600000 },
      { label: 'BTU', value: 'BTU', factor: 1055.06 },
      { label: 'Electronvolts (eV)', value: 'eV', factor: 1.602176634e-19 },
    ],
    'Unit'
  ),

  // 10. Power Converter
  makeFactorConverter(
    'power-converter', 'Power Converter',
    'Convert between power units including watts, kilowatts, horsepower, and BTU per hour. Used in electrical engineering, automotive, and HVAC systems.',
    ['power converter', 'watt converter', 'hp to kW', 'horsepower converter', 'BTU per hour', 'power units', 'watt to horsepower', 'electrical power'],
    [
      { label: 'Watts (W)', value: 'W', factor: 1 },
      { label: 'Kilowatts (kW)', value: 'kW', factor: 1000 },
      { label: 'Horsepower (hp)', value: 'hp', factor: 745.7 },
      { label: 'BTU/hour', value: 'BTUhr', factor: 0.293071 },
      { label: 'Megawatts (MW)', value: 'MW', factor: 1000000 },
    ],
    'Unit'
  ),

  // 11. Pressure Converter
  makeFactorConverter(
    'pressure-converter', 'Pressure Converter',
    'Convert between pressure units including pascals, bar, atmospheres, PSI, and mmHg. Essential for meteorology, engineering, and medical blood pressure readings.',
    ['pressure converter', 'atmosphere converter', 'PSI to bar', 'pascal converter', 'mmHg converter', 'pressure units', 'atm to PSI', 'blood pressure units'],
    [
      { label: 'Pascals (Pa)', value: 'Pa', factor: 1 },
      { label: 'Bar', value: 'bar', factor: 100000 },
      { label: 'Atmospheres (atm)', value: 'atm', factor: 101325 },
      { label: 'PSI', value: 'psi', factor: 6894.76 },
      { label: 'mmHg (Torr)', value: 'mmHg', factor: 133.322 },
    ],
    'Unit'
  ),

  // 12. Force Converter
  makeFactorConverter(
    'force-converter', 'Force Converter',
    'Convert between force units including newtons, pound-force, dynes, and kilogram-force. Used in physics, mechanical engineering, and structural analysis.',
    ['force converter', 'newton converter', 'lbf to N', 'dyne converter', 'kgf converter', 'force units', 'pound force', 'kilogram force'],
    [
      { label: 'Newtons (N)', value: 'N', factor: 1 },
      { label: 'Pound-Force (lbf)', value: 'lbf', factor: 4.44822 },
      { label: 'Dynes (dyn)', value: 'dyn', factor: 0.00001 },
      { label: 'Kilogram-Force (kgf)', value: 'kgf', factor: 9.80665 },
    ],
    'Unit'
  ),

  // 13. Frequency Converter
  makeFactorConverter(
    'frequency-converter', 'Frequency Converter',
    'Convert between frequency units including hertz, kilohertz, megahertz, gigahertz, and RPM. Used in electronics, acoustics, and mechanical engineering.',
    ['frequency converter', 'hertz converter', 'Hz to kHz', 'MHz to GHz', 'RPM to Hz', 'frequency units', 'rotation speed', 'oscillation frequency'],
    [
      { label: 'Hertz (Hz)', value: 'Hz', factor: 1 },
      { label: 'Kilohertz (kHz)', value: 'kHz', factor: 1000 },
      { label: 'Megahertz (MHz)', value: 'MHz', factor: 1000000 },
      { label: 'Gigahertz (GHz)', value: 'GHz', factor: 1000000000 },
      { label: 'RPM', value: 'RPM', factor: 1 / 60 },
    ],
    'Unit'
  ),

  // 14. Angle Converter (special - degrees/radians)
  {
    id: 'angle-converter',
    name: 'Angle Converter',
    description: 'Convert between angle units including degrees, radians, gradians, arcminutes, and arcseconds. Essential for trigonometry, navigation, and astronomy.',
    keywords: ['angle converter', 'degree to radian', 'radian to degree', 'gradian converter', 'arcminute', 'arcsecond', 'angular units', 'trigonometry conversion'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Value', type: 'number', default: 180 },
      { id: 'from', label: 'From', type: 'select', default: 'deg', options: [
        { label: 'Degrees (°)', value: 'deg' },
        { label: 'Radians (rad)', value: 'rad' },
        { label: 'Gradians (grad)', value: 'grad' },
        { label: 'Arcminutes (arcmin)', value: 'arcmin' },
        { label: 'Arcseconds (arcsec)', value: 'arcsec' },
      ] },
      { id: 'to', label: 'To', type: 'select', default: 'rad', options: [
        { label: 'Degrees (°)', value: 'deg' },
        { label: 'Radians (rad)', value: 'rad' },
        { label: 'Gradians (grad)', value: 'grad' },
        { label: 'Arcminutes (arcmin)', value: 'arcmin' },
        { label: 'Arcseconds (arcsec)', value: 'arcsec' },
      ] },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      const from = String(inputs.from);
      const to = String(inputs.to);
      // Convert to degrees first
      let deg: number;
      if (from === 'deg') deg = val;
      else if (from === 'rad') deg = val * 180 / Math.PI;
      else if (from === 'grad') deg = val * 0.9;
      else if (from === 'arcmin') deg = val / 60;
      else deg = val / 3600; // arcsec
      // Then convert from degrees
      let result: number;
      let suffix: string;
      if (to === 'deg') { result = deg; suffix = '°'; }
      else if (to === 'rad') { result = deg * Math.PI / 180; suffix = 'rad'; }
      else if (to === 'grad') { result = deg / 0.9; suffix = 'grad'; }
      else if (to === 'arcmin') { result = deg * 60; suffix = 'arcmin'; }
      else { result = deg * 3600; suffix = 'arcsec'; }
      return [
        { label: 'Result', value: `${fmtSci(result)} ${suffix}`, highlight: true },
        { label: 'Degrees', value: `${fmt(deg, 6)}°` },
        { label: 'Radians', value: `${fmt(deg * Math.PI / 180, 6)} rad` },
      ];
    },
  },

  // 15. Fuel Consumption Converter
  {
    id: 'fuel-consumption-converter',
    name: 'Fuel Consumption Converter',
    description: 'Convert between fuel economy units including MPG (US/UK), L/100km, and km/L. Compare vehicle efficiency across different measurement standards.',
    keywords: ['fuel consumption', 'mpg converter', 'L/100km to MPG', 'fuel economy', 'gas mileage', 'km per liter', 'fuel efficiency', 'petrol consumption'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Value', type: 'number', default: 30 },
      { id: 'from', label: 'From', type: 'select', default: 'mpg_us', options: [
        { label: 'MPG (US)', value: 'mpg_us' },
        { label: 'MPG (UK)', value: 'mpg_uk' },
        { label: 'L/100km', value: 'L100km' },
        { label: 'km/L', value: 'kmL' },
      ] },
      { id: 'to', label: 'To', type: 'select', default: 'L100km', options: [
        { label: 'MPG (US)', value: 'mpg_us' },
        { label: 'MPG (UK)', value: 'mpg_uk' },
        { label: 'L/100km', value: 'L100km' },
        { label: 'km/L', value: 'kmL' },
      ] },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      const from = String(inputs.from);
      const to = String(inputs.to);
      if (val <= 0) return [{ label: 'Result', value: 'Enter a positive value' }];
      // Convert to km/L first
      let kmPerL: number;
      if (from === 'mpg_us') kmPerL = val * 0.425144;
      else if (from === 'mpg_uk') kmPerL = val * 0.354006;
      else if (from === 'L100km') kmPerL = 100 / val;
      else kmPerL = val;
      // Then convert from km/L
      let result: number;
      let suffix: string;
      if (to === 'mpg_us') { result = kmPerL / 0.425144; suffix = 'MPG (US)'; }
      else if (to === 'mpg_uk') { result = kmPerL / 0.354006; suffix = 'MPG (UK)'; }
      else if (to === 'L100km') { result = 100 / kmPerL; suffix = 'L/100km'; }
      else { result = kmPerL; suffix = 'km/L'; }
      return [
        { label: 'Result', value: `${fmt(result, 2)} ${suffix}`, highlight: true },
        { label: 'MPG (US)', value: fmt(kmPerL / 0.425144, 2) },
        { label: 'L/100km', value: fmt(100 / kmPerL, 2) },
        { label: 'km/L', value: fmt(kmPerL, 2) },
      ];
    },
  },

  // 16. Digital Image Resolution Converter
  {
    id: 'digital-image-resolution-converter',
    name: 'Image Resolution Converter',
    description: 'Convert between DPI (dots per inch) and PPI (pixels per inch) for print and digital image resolution. Calculate image dimensions at different resolutions.',
    keywords: ['DPI converter', 'PPI calculator', 'image resolution', 'dots per inch', 'pixels per inch', 'print resolution', 'screen resolution', 'image size calculator'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'widthPx', label: 'Image Width', type: 'number', default: 3000, min: 1, suffix: 'px' },
      { id: 'heightPx', label: 'Image Height', type: 'number', default: 2000, min: 1, suffix: 'px' },
      { id: 'resolution', label: 'Resolution', type: 'number', default: 300, min: 1, suffix: 'PPI' },
    ],
    compute: (inputs) => {
      const w = Number(inputs.widthPx);
      const h = Number(inputs.heightPx);
      const r = Number(inputs.resolution);
      if (w <= 0 || h <= 0 || r <= 0) return [{ label: 'Result', value: 'N/A' }];
      const printW = w / r;
      const printH = h / r;
      const totalPx = w * h;
      const megapixels = totalPx / 1000000;
      return [
        { label: 'Print Size', value: `${fmt(printW, 2)} × ${fmt(printH, 2)} inches`, highlight: true },
        { label: 'Print Size (cm)', value: `${fmt(printW * 2.54, 2)} × ${fmt(printH * 2.54, 2)} cm` },
        { label: 'Total Pixels', value: `${fmt(totalPx, 0)} px` },
        { label: 'Megapixels', value: `${fmt(megapixels, 1)} MP` },
        { label: 'Resolution', value: `${r} PPI / ${r} DPI` },
      ];
    },
  },

  // 17. Luminance Converter
  makeFactorConverter(
    'luminance-converter', 'Luminance Converter',
    'Convert between luminance units including candela per square meter, nits, and lamberts. Used in display technology, lighting design, and photometry.',
    ['luminance converter', 'brightness converter', 'nit to cd/m²', 'candela per square meter', 'lambert converter', 'luminance units', 'display brightness', 'photometric units'],
    [
      { label: 'Candela/m² (cd/m²)', value: 'cdm2', factor: 1 },
      { label: 'Nits (nt)', value: 'nit', factor: 1 },
      { label: 'Lamberts (L)', value: 'lambert', factor: 3183.09886 },
      { label: 'Foot-Lamberts (fL)', value: 'footlambert', factor: 3.42626 },
      { label: 'Stilb (sb)', value: 'stilb', factor: 10000 },
    ],
    'Unit'
  ),

  // 18. Radiation Converter
  makeFactorConverter(
    'radiation-converter', 'Radiation Converter',
    'Convert between radiation dose units including gray, rad, sievert, and rem. Used in radiology, nuclear safety, and radiation protection.',
    ['radiation converter', 'dosage converter', 'gray to sievert', 'rad to rem', 'radiation units', 'radiation dose', 'absorbed dose', 'equivalent dose'],
    [
      { label: 'Gray (Gy)', value: 'Gy', factor: 1 },
      { label: 'Rad', value: 'rad', factor: 0.01 },
      { label: 'Sievert (Sv)', value: 'Sv', factor: 1 },
      { label: 'Rem', value: 'rem', factor: 0.01 },
    ],
    'Unit'
  ),

  // 19. Viscosity Converter
  makeFactorConverter(
    'viscosity-converter', 'Viscosity Converter',
    'Convert between dynamic viscosity units including pascal-seconds, centipoise, and poise. Used in fluid dynamics, lubrication engineering, and chemical processing.',
    ['viscosity converter', 'fluid viscosity', 'centipoise converter', 'Pa·s to cP', 'poise converter', 'viscosity units', 'dynamic viscosity', 'fluid thickness'],
    [
      { label: 'Pascal-second (Pa·s)', value: 'Pas', factor: 1 },
      { label: 'Centipoise (cP)', value: 'cP', factor: 0.001 },
      { label: 'Poise (P)', value: 'P', factor: 0.1 },
      { label: 'Millipascal-second (mPa·s)', value: 'mPas', factor: 0.001 },
    ],
    'Unit'
  ),

  // 20. Torque Converter
  makeFactorConverter(
    'torque-converter', 'Torque Converter',
    'Convert between torque units including newton-meters, pound-feet, and kilogram-force meters. Essential for automotive, mechanical engineering, and tool specifications.',
    ['torque converter', 'moment converter', 'N·m to lb·ft', 'torque units', 'pound-foot torque', 'newton-meter torque', 'kgf·m converter', 'rotational force'],
    [
      { label: 'Newton-meter (N·m)', value: 'Nm', factor: 1 },
      { label: 'Pound-foot (lb·ft)', value: 'lbft', factor: 1.35582 },
      { label: 'Kilogram-force meter (kgf·m)', value: 'kgfm', factor: 9.80665 },
      { label: 'Dyne-centimeter (dyn·cm)', value: 'dyncm', factor: 0.0000001 },
    ],
    'Unit'
  ),

  // 21. Density Converter
  makeFactorConverter(
    'density-converter', 'Density Converter',
    'Convert between density units including kg/m³, g/cm³, and lb/ft³. Used in material science, fluid mechanics, and construction.',
    ['density converter', 'mass density', 'kg/m³ to g/cm³', 'lb/ft³ converter', 'density units', 'material density', 'specific gravity', 'bulk density'],
    [
      { label: 'kg/m³', value: 'kgm3', factor: 1 },
      { label: 'g/cm³', value: 'gcm3', factor: 1000 },
      { label: 'lb/ft³', value: 'lbft3', factor: 16.0185 },
      { label: 'lb/in³', value: 'lbin3', factor: 27679.9 },
      { label: 'g/mL', value: 'gmL', factor: 1000 },
    ],
    'Unit'
  ),

  // 22. Cooking Converter
  {
    id: 'cooking-converter',
    name: 'Cooking Converter',
    description: 'Convert between common cooking measurement units including cups, tablespoons, teaspoons, fluid ounces, and milliliters. Scale recipes with precision.',
    keywords: ['cooking converter', 'recipe converter', 'tablespoon to cup', 'teaspoon to mL', 'cooking measurements', 'baking conversion', 'cup to mL', 'kitchen converter'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Value', type: 'number', default: 1, min: 0 },
      { id: 'from', label: 'From', type: 'select', default: 'cup', options: [
        { label: 'US Cup', value: 'cup' },
        { label: 'Tablespoon (tbsp)', value: 'tbsp' },
        { label: 'Teaspoon (tsp)', value: 'tsp' },
        { label: 'Fluid Ounce (fl oz)', value: 'floz' },
        { label: 'Milliliter (mL)', value: 'mL' },
        { label: 'Liter (L)', value: 'L' },
      ] },
      { id: 'to', label: 'To', type: 'select', default: 'mL', options: [
        { label: 'US Cup', value: 'cup' },
        { label: 'Tablespoon (tbsp)', value: 'tbsp' },
        { label: 'Teaspoon (tsp)', value: 'tsp' },
        { label: 'Fluid Ounce (fl oz)', value: 'floz' },
        { label: 'Milliliter (mL)', value: 'mL' },
        { label: 'Liter (L)', value: 'L' },
      ] },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      // All in mL
      const toMl: Record<string, number> = {
        cup: 236.588,
        tbsp: 14.787,
        tsp: 4.929,
        floz: 29.574,
        mL: 1,
        L: 1000,
      };
      const from = String(inputs.from);
      const to = String(inputs.to);
      if (!toMl[from] || !toMl[to]) return [{ label: 'Result', value: 'Select valid units' }];
      const mL = val * toMl[from];
      const result = mL / toMl[to];
      return [
        { label: 'Result', value: `${fmt(result, 4)}`, highlight: true },
        { label: 'In mL', value: `${fmt(mL, 2)} mL` },
        { label: 'In Tablespoons', value: `${fmt(mL / 14.787, 2)} tbsp` },
        { label: 'In Teaspoons', value: `${fmt(mL / 4.929, 2)} tsp` },
      ];
    },
  },

  // 23. Shoe Size Converter
  {
    id: 'shoe-size-converter',
    name: 'Shoe Size Converter',
    description: 'Convert shoe sizes between US, UK, and EU sizing systems for men and women. Essential for international shoe shopping and online orders.',
    keywords: ['shoe size converter', 'shoe size chart', 'US to EU shoe size', 'UK shoe size', 'international shoe size', 'footwear sizing', 'shoe size conversion', 'shoe size comparison'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Shoe Size', type: 'number', default: 9, min: 1, max: 50, step: 0.5 },
      { id: 'from', label: 'From System', type: 'select', default: 'US_M', options: [
        { label: 'US Men', value: 'US_M' },
        { label: 'US Women', value: 'US_W' },
        { label: 'UK', value: 'UK' },
        { label: 'EU', value: 'EU' },
      ] },
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ] },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      const from = String(inputs.from);
      // Convert to EU first (approximate)
      let eu: number;
      if (from === 'US_M') eu = val + 33;
      else if (from === 'US_W') eu = val + 31 + 2; // US Women -> US Men offset + base
      else if (from === 'UK') eu = val + 33 + 1; // UK = US_M - 1 approximately
      else eu = val; // EU
      const usMen = eu - 33;
      const usWomen = usMen + 1.5;
      const uk = usMen - 1;
      return [
        { label: 'EU Size', value: fmt(eu, 1), highlight: true },
        { label: 'US Men', value: fmt(usMen, 1) },
        { label: 'US Women', value: fmt(usWomen, 1) },
        { label: 'UK Size', value: fmt(uk, 1) },
      ];
    },
  },

  // 24. Clothing Size Converter
  {
    id: 'clothing-size-converter',
    name: 'Clothing Size Converter',
    description: 'Convert clothing sizes between US, UK, and EU sizing systems for dresses, shirts, and pants. Helpful for international fashion shopping.',
    keywords: ['clothing size converter', 'dress size', 'US to EU clothing', 'international sizing', 'fashion size chart', 'shirt size', 'pants size', 'garment size'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Size Number', type: 'number', default: 8, min: 0, max: 60 },
      { id: 'from', label: 'From System', type: 'select', default: 'US', options: [
        { label: 'US', value: 'US' },
        { label: 'UK', value: 'UK' },
        { label: 'EU', value: 'EU' },
      ] },
      { id: 'type', label: 'Clothing Type', type: 'select', default: 'dress', options: [
        { label: 'Dress/Women\'s', value: 'dress' },
        { label: 'Men\'s Shirt', value: 'shirt' },
      ] },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      const from = String(inputs.from);
      const type = String(inputs.type);
      if (type === 'dress') {
        // Women's dress sizes
        let us: number;
        if (from === 'US') us = val;
        else if (from === 'UK') us = val + 2;
        else us = val - 28; // EU to US approx
        const uk = us - 2;
        const eu = us + 28;
        return [
          { label: 'US Size', value: fmt(us, 0), highlight: true },
          { label: 'UK Size', value: fmt(uk, 0) },
          { label: 'EU Size', value: fmt(eu, 0) },
        ];
      } else {
        // Men's shirt (neck size in inches / cm)
        let usInch: number;
        if (from === 'US') usInch = val;
        else if (from === 'UK') usInch = val;
        else usInch = val / 2.54; // EU cm to US inches
        const ukInch = usInch;
        const euCm = usInch * 2.54;
        return [
          { label: 'US Size (inches)', value: fmt(usInch, 1), highlight: true },
          { label: 'UK Size (inches)', value: fmt(ukInch, 1) },
          { label: 'EU Size (cm)', value: fmt(euCm, 1) },
        ];
      }
    },
  },

  // 25. Roman Numeral Converter
  {
    id: 'roman-numeral-converter',
    name: 'Roman Numeral Converter',
    description: 'Convert between Roman numerals and Arabic (decimal) numbers. Supports values from 1 to 3999. Great for history, clock faces, and academic purposes.',
    keywords: ['Roman numeral converter', 'Roman to Arabic', 'Arabic to Roman', 'Roman numerals', 'numeral system', 'ancient numbers', 'Roman numbers', 'Latin numerals'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'mode', label: 'Conversion Direction', type: 'select', default: 'toRoman', options: [
        { label: 'Number → Roman', value: 'toRoman' },
        { label: 'Roman → Number', value: 'fromRoman' },
      ] },
      { id: 'value', label: 'Value', type: 'text', default: '42', placeholder: 'Number or Roman numeral' },
    ],
    compute: (inputs) => {
      const mode = String(inputs.mode);
      const val = String(inputs.value).trim().toUpperCase();
      if (!val) return [{ label: 'Result', value: 'Enter a value' }];

      if (mode === 'toRoman') {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1 || num > 3999) return [{ label: 'Result', value: 'Enter a number 1-3999' }];
        const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
        let roman = '';
        let n = num;
        for (let i = 0; i < vals.length; i++) {
          while (n >= vals[i]) { roman += syms[i]; n -= vals[i]; }
        }
        return [
          { label: 'Roman Numeral', value: roman, highlight: true },
          { label: 'Arabic Number', value: `${num}` },
        ];
      } else {
        const romanMap: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        let result = 0;
        for (let i = 0; i < val.length; i++) {
          const current = romanMap[val[i]];
          if (!current) return [{ label: 'Result', value: 'Invalid Roman numeral' }];
          const next = romanMap[val[i + 1]];
          if (next && next > current) {
            result -= current;
          } else {
            result += current;
          }
        }
        return [
          { label: 'Arabic Number', value: `${result}`, highlight: true },
          { label: 'Roman Numeral', value: val },
        ];
      }
    },
  },

  // 26. Number to Words Converter
  {
    id: 'number-words-converter',
    name: 'Number to Words Converter',
    description: 'Convert numbers to English words. Useful for check writing, legal documents, and educational purposes. Supports numbers up to trillions.',
    keywords: ['number to words', 'spell number', 'check writing', 'number name', 'write number in words', 'currency words', 'amount in words', 'number spelling'],
    category: 'conversion',
    icon: 'ArrowLeftRight',
    fields: [
      { id: 'value', label: 'Number', type: 'number', default: 1234.56, min: 0, max: 999999999999 },
    ],
    compute: (inputs) => {
      const num = Number(inputs.value);
      if (isNaN(num) || num < 0 || num >= 1e12) return [{ label: 'Result', value: 'Enter a number 0 - 999,999,999,999' }];

      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      function convertBelow1000(n: number): string {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertBelow1000(n % 100) : '');
      }

      const intPart = Math.floor(num);
      const decPart = Math.round((num - intPart) * 100);
      let result = '';

      if (intPart === 0) {
        result = 'Zero';
      } else {
        const groups = [
          { value: 1000000000, name: 'Billion' },
          { value: 1000000, name: 'Million' },
          { value: 1000, name: 'Thousand' },
        ];
        let remaining = intPart;
        for (const g of groups) {
          if (remaining >= g.value) {
            result += convertBelow1000(Math.floor(remaining / g.value)) + ' ' + g.name + ' ';
            remaining %= g.value;
          }
        }
        if (remaining > 0) {
          result += convertBelow1000(remaining);
        }
      }

      result = result.trim();
      if (decPart > 0) {
        result += ` and ${decPart}/100`;
      }

      return [
        { label: 'In Words', value: result, highlight: true },
        { label: 'Number', value: `${num}` },
        { label: 'For Check Writing', value: `${result}${decPart > 0 ? ' Dollars' : ' Dollars and 00/100'}` },
      ];
    },
  },

];
