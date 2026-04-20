import { Calculator, CalcResult, fmt, fmtSci } from '../calc-types';

export const everydayCalculators: Calculator[] = [

  // 1. Age Calculator
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate your exact age in years, months, and days from your date of birth. Find out how old you are precisely with this free online age calculator — perfect for birthdays, retirement planning, or legal age verification.',
    keywords: ['age', 'birthday', 'date of birth', 'how old am I', 'exact age', 'years months days'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'birthDate', label: 'Date of Birth', type: 'text', placeholder: 'YYYY-MM-DD' },
      { id: 'targetDate', label: 'Target Date (optional)', type: 'text', placeholder: 'YYYY-MM-DD (default: today)' },
    ],
    compute: (inputs) => {
      const birthStr = String(inputs.birthDate);
      const targetStr = inputs.targetDate ? String(inputs.targetDate) : '';
      const birth = new Date(birthStr);
      const target = targetStr ? new Date(targetStr) : new Date();
      if (isNaN(birth.getTime())) return [{ label: 'Error', value: 'Invalid birth date' }];
      if (isNaN(target.getTime())) return [{ label: 'Error', value: 'Invalid target date' }];

      let years = target.getFullYear() - birth.getFullYear();
      let months = target.getMonth() - birth.getMonth();
      let days = target.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const totalHours = totalDays * 24;

      return [
        { label: 'Age', value: `${years} years, ${months} months, ${days} days`, highlight: true },
        { label: 'Total Days', value: fmt(totalDays) },
        { label: 'Total Weeks', value: fmt(totalWeeks) },
        { label: 'Total Months', value: fmt(years * 12 + months) },
        { label: 'Total Hours', value: fmt(totalHours) },
        { label: 'Next Birthday', value: (() => {
          const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
          if (nextBday <= target) nextBday.setFullYear(nextBday.getFullYear() + 1);
          const diff = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
          return `${diff} days away`;
        })() },
      ];
    },
  },

  // 2. Date Difference Calculator
  {
    id: 'date-difference-calculator',
    name: 'Date Difference Calculator',
    description: 'Calculate the exact number of days, weeks, months, and years between two dates. This free date duration calculator is ideal for project timelines, contract periods, pregnancy due dates, and event planning.',
    keywords: ['date difference', 'days between dates', 'date duration', 'time between', 'date gap', 'elapsed time'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'startDate', label: 'Start Date', type: 'text', placeholder: 'YYYY-MM-DD' },
      { id: 'endDate', label: 'End Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    ],
    compute: (inputs) => {
      const start = new Date(String(inputs.startDate));
      const end = new Date(String(inputs.endDate));
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return [{ label: 'Error', value: 'Invalid date(s)' }];

      const diffMs = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor(diffMs / (1000 * 60));

      // Approximate months and years
      const years = Math.floor(totalDays / 365.25);
      const remainingAfterYears = totalDays - Math.floor(years * 365.25);
      const months = Math.floor(remainingAfterYears / 30.44);

      return [
        { label: 'Difference', value: `${years} years, ${months} months`, highlight: true },
        { label: 'Total Days', value: fmt(totalDays), highlight: true },
        { label: 'Total Weeks', value: fmt(totalWeeks) },
        { label: 'Total Months (approx)', value: fmt(totalDays / 30.44, 1) },
        { label: 'Total Hours', value: fmt(totalHours) },
        { label: 'Total Minutes', value: fmt(totalMinutes) },
        { label: 'Include Weekends', value: `${fmt(Math.ceil(totalDays / 7) * 2)} weekend days (approx)` },
      ];
    },
  },

  // 3. Date Add/Subtract Calculator
  {
    id: 'date-add-calculator',
    name: 'Date Add / Subtract Calculator',
    description: 'Add or subtract days, weeks, months, or years from any date. This free online date calculator helps you find future or past dates for deadlines, shipping estimates, subscription renewals, and project milestones.',
    keywords: ['add days', 'subtract days', 'date offset', 'future date', 'past date', 'date math', 'deadline calculator'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'startDate', label: 'Start Date', type: 'text', placeholder: 'YYYY-MM-DD' },
      { id: 'operation', label: 'Operation', type: 'select', options: [
        { label: 'Add', value: 'add' },
        { label: 'Subtract', value: 'subtract' },
      ] },
      { id: 'years', label: 'Years', type: 'number', default: 0, min: 0, max: 100 },
      { id: 'months', label: 'Months', type: 'number', default: 0, min: 0, max: 1200 },
      { id: 'weeks', label: 'Weeks', type: 'number', default: 0, min: 0, max: 5200 },
      { id: 'days', label: 'Days', type: 'number', default: 0, min: 0, max: 36500 },
    ],
    compute: (inputs) => {
      const startStr = String(inputs.startDate);
      const start = new Date(startStr);
      if (isNaN(start.getTime())) return [{ label: 'Error', value: 'Invalid start date' }];

      const op = String(inputs.operation) === 'subtract' ? -1 : 1;
      const y = Number(inputs.years) || 0;
      const m = Number(inputs.months) || 0;
      const w = Number(inputs.weeks) || 0;
      const d = Number(inputs.days) || 0;

      const result = new Date(start);
      result.setFullYear(result.getFullYear() + op * y);
      result.setMonth(result.getMonth() + op * m);
      result.setDate(result.getDate() + op * (w * 7 + d));

      const totalDaysAdded = op * (y * 365 + m * 30 + w * 7 + d);

      return [
        { label: 'Result Date', value: result.toISOString().split('T')[0], highlight: true },
        { label: 'Day of Week', value: result.toLocaleDateString('en-US', { weekday: 'long' }) },
        { label: 'Start Date', value: start.toISOString().split('T')[0] },
        { label: 'Operation', value: op === 1 ? 'Add' : 'Subtract' },
        { label: 'Approx Total Days Offset', value: fmt(totalDaysAdded) },
      ];
    },
  },

  // 4. Fuel Cost Calculator
  {
    id: 'fuel-cost-calculator',
    name: 'Fuel Cost Calculator',
    description: 'Estimate the fuel cost for any road trip or daily commute. Enter distance, fuel efficiency (MPG), and gas price per gallon to calculate total fuel expense. Perfect for budgeting travel, comparing routes, or planning long-distance drives.',
    keywords: ['fuel cost', 'gas cost', 'trip cost', 'fuel expense', 'gas price', 'road trip cost', 'commute cost'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'distance', label: 'Trip Distance', type: 'number', min: 0, step: 1, suffix: 'miles' },
      { id: 'mpg', label: 'Fuel Efficiency (MPG)', type: 'number', min: 0, step: 0.1, suffix: 'mpg' },
      { id: 'gasPrice', label: 'Gas Price', type: 'number', min: 0, step: 0.01, prefix: '$', suffix: '/gallon' },
    ],
    compute: (inputs) => {
      const distance = Number(inputs.distance) || 0;
      const mpg = Number(inputs.mpg) || 0;
      const gasPrice = Number(inputs.gasPrice) || 0;
      if (mpg === 0) return [{ label: 'Error', value: 'MPG cannot be zero' }];

      const gallonsNeeded = distance / mpg;
      const totalCost = gallonsNeeded * gasPrice;
      const costPerMile = gasPrice / mpg;

      return [
        { label: 'Total Fuel Cost', value: `$${fmt(totalCost, 2)}`, highlight: true },
        { label: 'Gallons Needed', value: `${fmt(gallonsNeeded, 2)} gal` },
        { label: 'Cost Per Mile', value: `$${fmt(costPerMile, 4)}` },
        { label: 'Round Trip Cost', value: `$${fmt(totalCost * 2, 2)}` },
        { label: 'Weekly Commute (5 days)', value: `$${fmt(totalCost * 5, 2)}` },
        { label: 'Monthly Commute (22 days)', value: `$${fmt(totalCost * 22, 2)}` },
      ];
    },
  },

  // 5. Gas Mileage Calculator
  {
    id: 'gas-mileage-calculator',
    name: 'Gas Mileage Calculator (MPG)',
    description: 'Calculate your vehicle\'s fuel efficiency in miles per gallon (MPG) or liters per 100km. Enter miles driven and gallons used to find your real-world gas mileage. Track fuel economy for better budgeting and vehicle maintenance.',
    keywords: ['MPG', 'gas mileage', 'fuel efficiency', 'fuel economy', 'miles per gallon', 'liters per 100km'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'milesDriven', label: 'Miles Driven', type: 'number', min: 0, step: 0.1, suffix: 'miles' },
      { id: 'gallonsUsed', label: 'Gallons Used', type: 'number', min: 0, step: 0.001, suffix: 'gallons' },
      { id: 'gasPrice', label: 'Gas Price (optional)', type: 'number', min: 0, step: 0.01, prefix: '$', suffix: '/gal' },
    ],
    compute: (inputs) => {
      const miles = Number(inputs.milesDriven) || 0;
      const gallons = Number(inputs.gallonsUsed) || 0;
      const gasPrice = Number(inputs.gasPrice) || 0;
      if (gallons === 0) return [{ label: 'Error', value: 'Gallons cannot be zero' }];

      const mpg = miles / gallons;
      const lp100k = 235.215 / mpg; // conversion factor
      const kmPerLiter = mpg * 0.425144;

      const results: CalcResult[] = [
        { label: 'Fuel Efficiency (MPG)', value: `${fmt(mpg, 2)} mpg`, highlight: true },
        { label: 'Liters per 100km', value: `${fmt(lp100k, 2)} L/100km` },
        { label: 'Kilometers per Liter', value: `${fmt(kmPerLiter, 2)} km/L` },
      ];

      if (gasPrice > 0) {
        const costPerMile = gasPrice / mpg;
        results.push({ label: 'Cost Per Mile', value: `$${fmt(costPerMile, 4)}` });
        results.push({ label: 'Cost of This Trip', value: `$${fmt(gallons * gasPrice, 2)}` });
      }

      return results;
    },
  },

  // 6. Cooking Scaler
  {
    id: 'cooking-scaler',
    name: 'Recipe Scaler / Cooking Scaler',
    description: 'Scale recipe ingredients up or down for any serving size. Perfect for meal prep, dinner parties, or adjusting family recipes. Enter the original servings, desired servings, and ingredient amounts to get precise scaled measurements.',
    keywords: ['recipe scaler', 'cooking scaler', 'scale recipe', 'ingredient converter', 'servings calculator', 'meal prep'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'originalServings', label: 'Original Servings', type: 'number', min: 1, step: 1 },
      { id: 'desiredServings', label: 'Desired Servings', type: 'number', min: 1, step: 1 },
      { id: 'ingredient1', label: 'Ingredient 1 Amount', type: 'number', min: 0, step: 0.01 },
      { id: 'unit1', label: 'Unit', type: 'select', options: [
        { label: 'cups', value: 'cups' }, { label: 'tbsp', value: 'tbsp' }, { label: 'tsp', value: 'tsp' },
        { label: 'oz', value: 'oz' }, { label: 'grams', value: 'g' }, { label: 'ml', value: 'ml' },
        { label: 'lbs', value: 'lbs' }, { label: 'pieces', value: 'pcs' },
      ] },
      { id: 'ingredient2', label: 'Ingredient 2 Amount', type: 'number', min: 0, step: 0.01 },
      { id: 'unit2', label: 'Unit', type: 'select', options: [
        { label: 'cups', value: 'cups' }, { label: 'tbsp', value: 'tbsp' }, { label: 'tsp', value: 'tsp' },
        { label: 'oz', value: 'oz' }, { label: 'grams', value: 'g' }, { label: 'ml', value: 'ml' },
        { label: 'lbs', value: 'lbs' }, { label: 'pieces', value: 'pcs' },
      ] },
      { id: 'ingredient3', label: 'Ingredient 3 Amount', type: 'number', min: 0, step: 0.01 },
      { id: 'unit3', label: 'Unit', type: 'select', options: [
        { label: 'cups', value: 'cups' }, { label: 'tbsp', value: 'tbsp' }, { label: 'tsp', value: 'tsp' },
        { label: 'oz', value: 'oz' }, { label: 'grams', value: 'g' }, { label: 'ml', value: 'ml' },
        { label: 'lbs', value: 'lbs' }, { label: 'pieces', value: 'pcs' },
      ] },
    ],
    compute: (inputs) => {
      const orig = Number(inputs.originalServings) || 1;
      const desired = Number(inputs.desiredServings) || 1;
      if (orig === 0) return [{ label: 'Error', value: 'Original servings cannot be zero' }];

      const ratio = desired / orig;

      const results: CalcResult[] = [
        { label: 'Scale Factor', value: `${fmt(ratio, 4)}x`, highlight: true },
        { label: 'From / To Servings', value: `${orig} → ${desired}` },
      ];

      for (let i = 1; i <= 3; i++) {
        const amt = Number(inputs[`ingredient${i}`]) || 0;
        const unit = String(inputs[`unit${i}`] || '');
        if (amt > 0) {
          results.push({ label: `Ingredient ${i} Scaled`, value: `${fmt(amt * ratio, 2)} ${unit}` });
        }
      }

      return results;
    },
  },

  // 7. Paint Calculator
  {
    id: 'paint-calculator',
    name: 'Paint Calculator',
    description: 'Calculate how much paint you need for a room. Enter room dimensions, number of doors and windows, and coats desired to estimate gallons of paint required. Essential tool for home improvement, interior design, and DIY painting projects.',
    keywords: ['paint calculator', 'how much paint', 'paint coverage', 'room paint', 'interior paint estimate', 'gallons of paint'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'roomLength', label: 'Room Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'roomWidth', label: 'Room Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'roomHeight', label: 'Room Height', type: 'number', min: 0, step: 0.1, suffix: 'ft', default: 8 },
      { id: 'doors', label: 'Number of Doors', type: 'number', min: 0, step: 1, default: 1 },
      { id: 'windows', label: 'Number of Windows', type: 'number', min: 0, step: 1, default: 2 },
      { id: 'coats', label: 'Number of Coats', type: 'number', min: 1, step: 1, default: 2 },
    ],
    compute: (inputs) => {
      const length = Number(inputs.roomLength) || 0;
      const width = Number(inputs.roomWidth) || 0;
      const height = Number(inputs.roomHeight) || 8;
      const doors = Number(inputs.doors) || 0;
      const windows = Number(inputs.windows) || 0;
      const coats = Number(inputs.coats) || 1;

      const wallArea = 2 * (length + width) * height;
      const doorArea = doors * 20; // standard door ~20 sq ft
      const windowArea = windows * 15; // standard window ~15 sq ft
      const ceilingArea = length * width;
      const paintableArea = wallArea - doorArea - windowArea;
      const coveragePerGallon = 350; // sq ft per gallon

      const wallGallons = (paintableArea * coats) / coveragePerGallon;
      const ceilingGallons = (ceilingArea * coats) / coveragePerGallon;

      return [
        { label: 'Wall Paint Needed', value: `${fmt(wallGallons, 2)} gallons`, highlight: true },
        { label: 'Ceiling Paint Needed', value: `${fmt(ceilingGallons, 2)} gallons` },
        { label: 'Total Paint (walls + ceiling)', value: `${fmt(wallGallons + ceilingGallons, 2)} gallons` },
        { label: 'Total Wall Area', value: `${fmt(wallArea)} sq ft` },
        { label: 'Door & Window Deduction', value: `${fmt(doorArea + windowArea)} sq ft` },
        { label: 'Paintable Wall Area', value: `${fmt(paintableArea)} sq ft` },
        { label: 'Ceiling Area', value: `${fmt(ceilingArea)} sq ft` },
        { label: 'Coverage Rate', value: `${coveragePerGallon} sq ft/gallon` },
      ];
    },
  },

  // 8. Carpet Calculator
  {
    id: 'carpet-calculator',
    name: 'Carpet Calculator',
    description: 'Estimate how much carpet you need for any room. Calculate carpet square footage and yardage including waste allowance for pattern matching and cutting. Essential for flooring projects, home renovation, and carpet installation planning.',
    keywords: ['carpet calculator', 'carpet estimate', 'flooring calculator', 'carpet yardage', 'room carpet', 'square yards carpet'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'roomLength', label: 'Room Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'roomWidth', label: 'Room Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'wastePercent', label: 'Waste Allowance', type: 'number', min: 0, max: 50, step: 1, default: 10, suffix: '%' },
      { id: 'pricePerSqFt', label: 'Price per sq ft (optional)', type: 'number', min: 0, step: 0.01, prefix: '$' },
    ],
    compute: (inputs) => {
      const length = Number(inputs.roomLength) || 0;
      const width = Number(inputs.roomWidth) || 0;
      const waste = Number(inputs.wastePercent) || 0;
      const price = Number(inputs.pricePerSqFt) || 0;

      const areaSqFt = length * width;
      const wasteArea = areaSqFt * (waste / 100);
      const totalSqFt = areaSqFt + wasteArea;
      const totalSqYd = totalSqFt / 9;

      const results: CalcResult[] = [
        { label: 'Room Area', value: `${fmt(areaSqFt, 2)} sq ft`, highlight: true },
        { label: 'With Waste Allowance', value: `${fmt(totalSqFt, 2)} sq ft`, highlight: true },
        { label: 'In Square Yards', value: `${fmt(totalSqYd, 2)} sq yd` },
        { label: 'Waste Amount', value: `${fmt(wasteArea, 2)} sq ft` },
      ];

      if (price > 0) {
        results.push({ label: 'Estimated Cost', value: `$${fmt(totalSqFt * price, 2)}`, highlight: true });
      }

      return results;
    },
  },

  // 9. Tile Calculator
  {
    id: 'tile-calculator',
    name: 'Tile Calculator',
    description: 'Calculate how many tiles you need for a floor or wall project. Enter area dimensions and tile size to get tile count including waste allowance. Perfect for bathroom tile, kitchen backsplash, and flooring renovation projects.',
    keywords: ['tile calculator', 'how many tiles', 'floor tile', 'wall tile', 'backsplash calculator', 'tile estimate'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'areaLength', label: 'Area Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'areaWidth', label: 'Area Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'tileLength', label: 'Tile Length', type: 'number', min: 0, step: 0.1, suffix: 'inches' },
      { id: 'tileWidth', label: 'Tile Width', type: 'number', min: 0, step: 0.1, suffix: 'inches' },
      { id: 'wastePercent', label: 'Waste Allowance', type: 'number', min: 0, max: 50, step: 1, default: 10, suffix: '%' },
      { id: 'pricePerTile', label: 'Price per Tile (optional)', type: 'number', min: 0, step: 0.01, prefix: '$' },
    ],
    compute: (inputs) => {
      const areaL = Number(inputs.areaLength) || 0;
      const areaW = Number(inputs.areaWidth) || 0;
      const tileL = Number(inputs.tileLength) || 0;
      const tileW = Number(inputs.tileWidth) || 0;
      const waste = Number(inputs.wastePercent) || 0;
      const price = Number(inputs.pricePerTile) || 0;

      if (tileL === 0 || tileW === 0) return [{ label: 'Error', value: 'Tile dimensions cannot be zero' }];

      const areaSqFt = areaL * areaW;
      const tileSqFt = (tileL / 12) * (tileW / 12);
      const tilesNeeded = Math.ceil(areaSqFt / tileSqFt);
      const tilesWithWaste = Math.ceil(tilesNeeded * (1 + waste / 100));

      const results: CalcResult[] = [
        { label: 'Tiles Needed (exact)', value: fmt(tilesNeeded) },
        { label: 'Tiles to Purchase (with waste)', value: fmt(tilesWithWaste), highlight: true },
        { label: 'Area', value: `${fmt(areaSqFt, 2)} sq ft` },
        { label: 'Tile Size', value: `${tileL}" × ${tileW}"` },
        { label: 'Tiles per sq ft', value: fmt(1 / tileSqFt, 2) },
      ];

      if (price > 0) {
        results.push({ label: 'Estimated Cost', value: `$${fmt(tilesWithWaste * price, 2)}`, highlight: true });
      }

      return results;
    },
  },

  // 10. Mulch Calculator
  {
    id: 'mulch-calculator',
    name: 'Mulch Calculator',
    description: 'Calculate how much mulch you need for your garden or landscape bed. Enter the area dimensions and desired depth to estimate cubic yards, cubic feet, or bags of mulch. Great for garden planning, landscaping projects, and weed control.',
    keywords: ['mulch calculator', 'how much mulch', 'mulch estimate', 'cubic yards mulch', 'garden mulch', 'landscape mulch'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'areaLength', label: 'Bed Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'areaWidth', label: 'Bed Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'depth', label: 'Mulch Depth', type: 'number', min: 0, step: 0.5, default: 3, suffix: 'inches' },
      { id: 'pricePerCuYd', label: 'Price per Cubic Yard (optional)', type: 'number', min: 0, step: 1, prefix: '$' },
    ],
    compute: (inputs) => {
      const length = Number(inputs.areaLength) || 0;
      const width = Number(inputs.areaWidth) || 0;
      const depthIn = Number(inputs.depth) || 0;
      const price = Number(inputs.pricePerCuYd) || 0;

      const depthFt = depthIn / 12;
      const cubicFeet = length * width * depthFt;
      const cubicYards = cubicFeet / 27;
      const bags2cf = Math.ceil(cubicFeet / 2); // standard 2 cu ft bag
      const bags3cf = Math.ceil(cubicFeet / 3); // standard 3 cu ft bag

      const results: CalcResult[] = [
        { label: 'Cubic Yards Needed', value: `${fmt(cubicYards, 2)} cu yd`, highlight: true },
        { label: 'Cubic Feet Needed', value: `${fmt(cubicFeet, 2)} cu ft` },
        { label: 'Bags (2 cu ft each)', value: fmt(bags2cf) },
        { label: 'Bags (3 cu ft each)', value: fmt(bags3cf) },
        { label: 'Coverage Area', value: `${fmt(length * width)} sq ft` },
      ];

      if (price > 0) {
        results.push({ label: 'Estimated Cost', value: `$${fmt(cubicYards * price, 2)}`, highlight: true });
      }

      return results;
    },
  },

  // 11. Concrete Calculator
  {
    id: 'concrete-calculator',
    name: 'Concrete Calculator',
    description: 'Calculate how much concrete you need for a slab, footing, or column. Enter dimensions to estimate cubic yards and bags of concrete required. Essential for DIY concrete projects, driveway pours, patios, and foundation work.',
    keywords: ['concrete calculator', 'how much concrete', 'concrete slab', 'cubic yards concrete', 'concrete estimate', 'concrete bags'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'slabLength', label: 'Slab Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'slabWidth', label: 'Slab Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'slabThickness', label: 'Slab Thickness', type: 'number', min: 0, step: 0.5, default: 4, suffix: 'inches' },
      { id: 'pricePerCuYd', label: 'Price per Cubic Yard (optional)', type: 'number', min: 0, step: 1, prefix: '$' },
    ],
    compute: (inputs) => {
      const length = Number(inputs.slabLength) || 0;
      const width = Number(inputs.slabWidth) || 0;
      const thicknessIn = Number(inputs.slabThickness) || 0;
      const price = Number(inputs.pricePerCuYd) || 0;

      const thicknessFt = thicknessIn / 12;
      const cubicFeet = length * width * thicknessFt;
      const cubicYards = cubicFeet / 27;
      const bags60 = Math.ceil(cubicFeet / 0.45); // 60 lb bag ≈ 0.45 cu ft
      const bags80 = Math.ceil(cubicFeet / 0.6); // 80 lb bag ≈ 0.6 cu ft

      const results: CalcResult[] = [
        { label: 'Cubic Yards Needed', value: `${fmt(cubicYards, 2)} cu yd`, highlight: true },
        { label: 'Cubic Feet Needed', value: `${fmt(cubicFeet, 2)} cu ft` },
        { label: '60 lb Bags', value: fmt(bags60) },
        { label: '80 lb Bags', value: fmt(bags80) },
        { label: 'Slab Area', value: `${fmt(length * width)} sq ft` },
      ];

      if (price > 0) {
        results.push({ label: 'Estimated Cost', value: `$${fmt(cubicYards * price, 2)}`, highlight: true });
      }

      return results;
    },
  },

  // 12. Gravel Calculator
  {
    id: 'gravel-calculator',
    name: 'Gravel Calculator',
    description: 'Estimate how much gravel you need for a driveway, pathway, or drainage project. Calculate gravel volume in cubic yards and estimated weight in tons. Ideal for driveway resurfacing, French drains, and landscaping gravel projects.',
    keywords: ['gravel calculator', 'how much gravel', 'driveway gravel', 'gravel estimate', 'cubic yards gravel', 'gravel tons'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'areaLength', label: 'Area Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'areaWidth', label: 'Area Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'depth', label: 'Gravel Depth', type: 'number', min: 0, step: 0.5, default: 3, suffix: 'inches' },
      { id: 'density', label: 'Gravel Density', type: 'number', min: 0, step: 0.01, default: 1.35, suffix: 'tons/cu yd' },
      { id: 'pricePerTon', label: 'Price per Ton (optional)', type: 'number', min: 0, step: 1, prefix: '$' },
    ],
    compute: (inputs) => {
      const length = Number(inputs.areaLength) || 0;
      const width = Number(inputs.areaWidth) || 0;
      const depthIn = Number(inputs.depth) || 0;
      const density = Number(inputs.density) || 1.35;
      const price = Number(inputs.pricePerTon) || 0;

      const depthFt = depthIn / 12;
      const cubicFeet = length * width * depthFt;
      const cubicYards = cubicFeet / 27;
      const tons = cubicYards * density;

      const results: CalcResult[] = [
        { label: 'Cubic Yards Needed', value: `${fmt(cubicYards, 2)} cu yd`, highlight: true },
        { label: 'Estimated Weight', value: `${fmt(tons, 2)} tons`, highlight: true },
        { label: 'Cubic Feet', value: `${fmt(cubicFeet, 2)} cu ft` },
        { label: 'Coverage Area', value: `${fmt(length * width)} sq ft` },
      ];

      if (price > 0) {
        results.push({ label: 'Estimated Cost', value: `$${fmt(tons * price, 2)}`, highlight: true });
      }

      return results;
    },
  },

  // 13. Deck Calculator
  {
    id: 'deck-calculator',
    name: 'Deck Calculator',
    description: 'Calculate the number of decking boards needed for your deck project. Enter deck dimensions and board size to estimate materials including waste allowance. Perfect for planning a new deck build, deck resurfacing, or composite decking projects.',
    keywords: ['deck calculator', 'decking boards', 'deck material', 'deck estimate', 'composite decking', 'deck boards needed'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'deckLength', label: 'Deck Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'deckWidth', label: 'Deck Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'boardWidth', label: 'Board Width', type: 'number', min: 0, step: 0.25, default: 5.5, suffix: 'inches' },
      { id: 'boardLength', label: 'Board Length', type: 'number', min: 0, step: 1, default: 12, suffix: 'ft' },
      { id: 'spacing', label: 'Gap Between Boards', type: 'number', min: 0, step: 0.0625, default: 0.125, suffix: 'inches' },
      { id: 'wastePercent', label: 'Waste Allowance', type: 'number', min: 0, max: 50, step: 1, default: 10, suffix: '%' },
    ],
    compute: (inputs) => {
      const deckL = Number(inputs.deckLength) || 0;
      const deckW = Number(inputs.deckWidth) || 0;
      const boardW = Number(inputs.boardWidth) || 5.5;
      const boardL = Number(inputs.boardLength) || 12;
      const gap = Number(inputs.spacing) || 0.125;
      const waste = Number(inputs.wastePercent) || 0;

      const deckAreaSqFt = deckL * deckW;
      const boardCoverageInches = boardW + gap;
      const boardsPerRow = Math.ceil((deckW * 12) / boardCoverageInches);
      const rowsNeeded = Math.ceil(deckL / boardL);
      const totalBoards = boardsPerRow * rowsNeeded;
      const boardsWithWaste = Math.ceil(totalBoards * (1 + waste / 100));
      const linearFeet = boardsWithWaste * boardL;

      return [
        { label: 'Boards Needed (with waste)', value: fmt(boardsWithWaste), highlight: true },
        { label: 'Boards Needed (exact)', value: fmt(totalBoards) },
        { label: 'Total Linear Feet', value: `${fmt(linearFeet)} ft` },
        { label: 'Deck Area', value: `${fmt(deckAreaSqFt, 2)} sq ft` },
        { label: 'Boards per Row', value: fmt(boardsPerRow) },
        { label: 'Rows Needed', value: fmt(rowsNeeded) },
        { label: 'Board Coverage', value: `${boardW}" board + ${gap}" gap` },
      ];
    },
  },

  // 14. Fence Calculator
  {
    id: 'fence-calculator',
    name: 'Fence Calculator',
    description: 'Calculate fencing materials needed for your project. Estimate the number of fence posts, rails, and pickets based on fence length and style. Essential for privacy fence, picket fence, and chain-link fence planning.',
    keywords: ['fence calculator', 'fence material', 'fence posts', 'picket fence', 'privacy fence', 'fence estimate'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'fenceLength', label: 'Total Fence Length', type: 'number', min: 0, step: 1, suffix: 'ft' },
      { id: 'postSpacing', label: 'Post Spacing', type: 'number', min: 1, step: 0.5, default: 8, suffix: 'ft' },
      { id: 'fenceHeight', label: 'Fence Height', type: 'number', min: 1, step: 0.5, default: 6, suffix: 'ft' },
      { id: 'railRows', label: 'Number of Rail Rows', type: 'number', min: 1, step: 1, default: 3 },
      { id: 'picketWidth', label: 'Picket Width', type: 'number', min: 0, step: 0.25, default: 3.5, suffix: 'inches' },
      { id: 'picketGap', label: 'Picket Gap', type: 'number', min: 0, step: 0.125, default: 0, suffix: 'inches' },
    ],
    compute: (inputs) => {
      const length = Number(inputs.fenceLength) || 0;
      const spacing = Number(inputs.postSpacing) || 8;
      const height = Number(inputs.fenceHeight) || 6;
      const rails = Number(inputs.railRows) || 3;
      const picketW = Number(inputs.picketWidth) || 3.5;
      const picketGap = Number(inputs.picketGap) || 0;

      const posts = Math.ceil(length / spacing) + 1;
      const sections = posts - 1;
      const totalRails = sections * rails;
      const railLengthFt = spacing;

      const picketPitch = (picketW + picketGap) / 12;
      const picketsPerSection = picketPitch > 0 ? Math.ceil(spacing / picketPitch) : 0;
      const totalPickets = picketsPerSection * sections;

      const concreteBags = posts; // roughly 1 bag per post

      return [
        { label: 'Posts Needed', value: fmt(posts), highlight: true },
        { label: 'Sections', value: fmt(sections) },
        { label: 'Total Rails', value: `${fmt(totalRails)} (${rails} per section, ${railLengthFt} ft each)` },
        { label: 'Total Pickets', value: fmt(totalPickets), highlight: true },
        { label: 'Concrete Bags (for posts)', value: `~${fmt(concreteBags)}` },
        { label: 'Post Length Needed', value: `${fmt(height + 2)} ft each (2ft in ground)` },
      ];
    },
  },

  // 15. Roof Calculator
  {
    id: 'roof-calculator',
    name: 'Roofing Calculator',
    description: 'Estimate roofing shingles needed for your roof. Calculate roof area, number of shingle bundles, and roofing squares based on roof dimensions and pitch. Essential for roof replacement, shingle estimation, and roofing material planning.',
    keywords: ['roofing calculator', 'roof shingles', 'roofing squares', 'shingle calculator', 'roof estimate', 'roof replacement'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'roofLength', label: 'Roof Base Length', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'roofWidth', label: 'Roof Base Width', type: 'number', min: 0, step: 0.1, suffix: 'ft' },
      { id: 'pitch', label: 'Roof Pitch (rise/run)', type: 'select', options: [
        { label: '2/12 (flat)', value: '2' }, { label: '4/12 (low)', value: '4' },
        { label: '6/12 (medium)', value: '6' }, { label: '8/12 (steep)', value: '8' },
        { label: '10/12 (very steep)', value: '10' }, { label: '12/12 (extreme)', value: '12' },
      ] },
      { id: 'wastePercent', label: 'Waste Allowance', type: 'number', min: 0, max: 50, step: 1, default: 15, suffix: '%' },
    ],
    compute: (inputs) => {
      const length = Number(inputs.roofLength) || 0;
      const width = Number(inputs.roofWidth) || 0;
      const pitchRise = Number(inputs.pitch) || 6;
      const waste = Number(inputs.wastePercent) || 0;

      // Calculate roof area using pitch multiplier
      const pitchMultiplier = Math.sqrt((pitchRise / 12) ** 2 + 1);
      const baseArea = length * width;
      const roofArea = baseArea * pitchMultiplier * 2; // both sides (assuming gable roof)
      const roofAreaWithWaste = roofArea * (1 + waste / 100);
      const squares = roofAreaWithWaste / 100;
      const bundles = Math.ceil(squares * 3); // 3 bundles per square

      return [
        { label: 'Roof Area', value: `${fmt(roofArea, 2)} sq ft`, highlight: true },
        { label: 'Roof Area (with waste)', value: `${fmt(roofAreaWithWaste, 2)} sq ft` },
        { label: 'Roofing Squares', value: `${fmt(squares, 1)} squares`, highlight: true },
        { label: 'Shingle Bundles', value: fmt(bundles) },
        { label: 'Pitch Multiplier', value: fmt(pitchMultiplier, 4) },
        { label: 'Underlayment (rolls)', value: `~${Math.ceil(roofAreaWithWaste / 400)}` },
        { label: 'Base Area', value: `${fmt(baseArea)} sq ft` },
      ];
    },
  },

  // 16. Wire Gauge Calculator
  {
    id: 'awg-wire-gauge-everyday',
    name: 'AWG Wire Gauge Reference',
    description: 'Convert American Wire Gauge (AWG) to wire diameter in inches and millimeters, and cross-sectional area. Look up wire properties including resistance per 1000 feet. Essential for electrical wiring, circuit design, and cable selection.',
    keywords: ['AWG', 'wire gauge', 'wire size', 'wire diameter', 'wire area', 'American Wire Gauge', 'cable gauge'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'awg', label: 'AWG Gauge Number', type: 'number', min: 0, max: 40, step: 1, default: 12 },
    ],
    compute: (inputs) => {
      const n = Number(inputs.awg);
      if (n < 0 || n > 40 || !Number.isInteger(n)) return [{ label: 'Error', value: 'AWG must be 0–40 integer' }];

      // AWG formula: diameter = 0.005 inches × 92^((36-n)/39)
      const diameterIn = 0.005 * Math.pow(92, (36 - n) / 39);
      const diameterMm = diameterIn * 25.4;
      const areaKcmil = Math.pow(diameterIn, 2) * 1000; // circular mils × 1000
      const areaMm2 = Math.PI * Math.pow(diameterMm / 2, 2);
      // Approximate resistance: ohms per 1000 ft at 20°C for copper
      const resistivityCopper = 10.371; // ohm·cmil/ft
      const resistancePerKft = n === 0 ? 0.0983 : resistivityCopper / (areaKcmil * 1000 / 1000);
      // More accurate: use known formula
      const resistance = 0.09827 * Math.pow(92, (2 * n - 72) / 39); // ohms per 1000 ft

      // Current capacity (approximate, copper, 60°C insulation)
      const ampacityMap: Record<number, number> = {
        0: 125, 1: 110, 2: 95, 3: 85, 4: 70, 5: 62, 6: 55, 7: 48,
        8: 40, 9: 35, 10: 30, 11: 26, 12: 20, 13: 17, 14: 15,
        15: 12, 16: 10, 17: 8, 18: 7, 19: 5, 20: 4,
      };
      const ampacity = ampacityMap[n] || Math.max(1, Math.round(3 * Math.pow(0.792, n)));

      return [
        { label: 'AWG', value: `${n}`, highlight: true },
        { label: 'Diameter', value: `${fmtSci(diameterIn, 4)} in (${fmtSci(diameterMm, 4)} mm)` },
        { label: 'Cross-Section Area', value: `${fmt(areaKcmil, 2)} kcmil (${fmt(areaMm2, 4)} mm²)` },
        { label: 'Resistance (Cu)', value: `${fmt(resistance, 4)} Ω / 1000 ft` },
        { label: 'Resistance (Cu)', value: `${fmt(resistance * 3.281, 4)} Ω / km` },
        { label: 'Approx Ampacity (60°C)', value: `${ampacity} A` },
      ];
    },
  },

  // 17. Electricity Cost Calculator
  {
    id: 'electricity-cost-calculator',
    name: 'Electricity Cost Calculator',
    description: 'Calculate the cost of running any appliance or device. Enter wattage, daily usage hours, and electricity rate to find daily, monthly, and yearly electricity costs. Great for energy budgeting, comparing appliances, and reducing your electric bill.',
    keywords: ['electricity cost', 'appliance cost', 'energy cost', 'kWh calculator', 'power cost', 'electric bill estimate'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'wattage', label: 'Appliance Wattage', type: 'number', min: 0, step: 1, suffix: 'watts' },
      { id: 'hoursPerDay', label: 'Hours Used Per Day', type: 'number', min: 0, max: 24, step: 0.5, default: 8 },
      { id: 'ratePerKWh', label: 'Electricity Rate', type: 'number', min: 0, step: 0.001, default: 0.12, prefix: '$', suffix: '/kWh' },
    ],
    compute: (inputs) => {
      const wattage = Number(inputs.wattage) || 0;
      const hours = Number(inputs.hoursPerDay) || 0;
      const rate = Number(inputs.ratePerKWh) || 0.12;

      const dailyKWh = (wattage / 1000) * hours;
      const monthlyKWh = dailyKWh * 30;
      const yearlyKWh = dailyKWh * 365;

      const dailyCost = dailyKWh * rate;
      const monthlyCost = monthlyKWh * rate;
      const yearlyCost = yearlyKWh * rate;

      return [
        { label: 'Daily Energy', value: `${fmt(dailyKWh, 3)} kWh` },
        { label: 'Monthly Energy', value: `${fmt(monthlyKWh, 2)} kWh` },
        { label: 'Yearly Energy', value: `${fmt(yearlyKWh, 1)} kWh` },
        { label: 'Daily Cost', value: `$${fmt(dailyCost, 2)}` },
        { label: 'Monthly Cost', value: `$${fmt(monthlyCost, 2)}`, highlight: true },
        { label: 'Yearly Cost', value: `$${fmt(yearlyCost, 2)}`, highlight: true },
        { label: 'Cost Per Hour', value: `$${fmt((wattage / 1000) * rate, 4)}` },
      ];
    },
  },

  // 18. Savings Goal Calculator
  {
    id: 'monthly-savings-goal-calculator',
    name: 'Savings Goal Calculator',
    description: 'Figure out how much to save each month to reach your savings goal. Enter your target amount, timeline, and current savings to get a monthly savings plan. Perfect for emergency funds, vacation funds, down payment goals, and financial planning.',
    keywords: ['savings goal', 'monthly savings', 'savings plan', 'how much to save', 'savings target', 'emergency fund'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'goalAmount', label: 'Savings Goal', type: 'number', min: 0, step: 100, prefix: '$' },
      { id: 'currentSavings', label: 'Current Savings', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'months', label: 'Time Period', type: 'number', min: 1, step: 1, suffix: 'months' },
      { id: 'annualRate', label: 'Annual Interest Rate', type: 'number', min: 0, max: 30, step: 0.1, default: 4, suffix: '%' },
    ],
    compute: (inputs) => {
      const goal = Number(inputs.goalAmount) || 0;
      const current = Number(inputs.currentSavings) || 0;
      const months = Number(inputs.months) || 1;
      const annualRate = Number(inputs.annualRate) || 0;

      const monthlyRate = annualRate / 100 / 12;
      const shortfall = goal - current;

      let monthlyPayment: number;
      if (monthlyRate === 0) {
        monthlyPayment = shortfall / months;
      } else {
        // Future value of current savings
        const fvCurrent = current * Math.pow(1 + monthlyRate, months);
        // PMT formula: need monthly payment so FV of payments + FV of current = goal
        monthlyPayment = (goal - fvCurrent) * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
      }

      const totalContributed = monthlyPayment * months;
      const interestEarned = goal - current - totalContributed;

      if (monthlyPayment < 0) {
        return [
          { label: 'Goal Already Achievable', value: 'Your current savings will exceed the goal', highlight: true },
          { label: 'Surplus at End', value: `$${fmt(current * Math.pow(1 + monthlyRate, months) - goal, 2)}` },
        ];
      }

      return [
        { label: 'Monthly Savings Needed', value: `$${fmt(monthlyPayment, 2)}`, highlight: true },
        { label: 'Total Contributions', value: `$${fmt(totalContributed, 2)}` },
        { label: 'Interest Earned', value: `$${fmt(interestEarned, 2)}` },
        { label: 'Current Savings Gap', value: `$${fmt(shortfall, 2)}` },
        { label: 'Weekly Savings', value: `$${fmt(monthlyPayment / 4.33, 2)}` },
        { label: 'Daily Savings', value: `$${fmt(monthlyPayment / 30, 2)}` },
      ];
    },
  },

  // 19. College Savings Calculator
  {
    id: 'college-savings-calculator',
    name: 'College Savings Calculator (529 Plan)',
    description: 'Project your 529 plan or college savings growth over time. Estimate how much your college fund will be worth by enrollment, or how much to contribute monthly. Plan for tuition, room & board with this education savings estimator.',
    keywords: ['college savings', '529 plan', 'education fund', 'tuition calculator', 'college fund', 'education savings'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'currentBalance', label: 'Current 529 Balance', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', min: 0, step: 50, prefix: '$' },
      { id: 'yearsToCollege', label: 'Years Until College', type: 'number', min: 0, step: 1, default: 10, suffix: 'years' },
      { id: 'annualReturn', label: 'Expected Annual Return', type: 'number', min: 0, max: 30, step: 0.1, default: 7, suffix: '%' },
      { id: 'annualCost', label: 'Annual College Cost (today)', type: 'number', min: 0, step: 1000, default: 25000, prefix: '$' },
      { id: 'collegeYears', label: 'Years of College', type: 'number', min: 1, max: 8, step: 1, default: 4 },
      { id: 'inflationRate', label: 'Tuition Inflation Rate', type: 'number', min: 0, max: 20, step: 0.1, default: 5, suffix: '%' },
    ],
    compute: (inputs) => {
      const balance = Number(inputs.currentBalance) || 0;
      const monthly = Number(inputs.monthlyContribution) || 0;
      const years = Number(inputs.yearsToCollege) || 0;
      const returnRate = Number(inputs.annualReturn) || 0;
      const annualCost = Number(inputs.annualCost) || 0;
      const collegeYrs = Number(inputs.collegeYears) || 4;
      const inflation = Number(inputs.inflationRate) || 0;

      const monthlyRate = returnRate / 100 / 12;
      const totalMonths = years * 12;

      // Future value of current balance
      const fvBalance = balance * Math.pow(1 + monthlyRate, totalMonths);
      // Future value of monthly contributions
      const fvContributions = monthlyRate > 0
        ? monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
        : monthly * totalMonths;
      const totalSaved = fvBalance + fvContributions;
      const totalContributed = balance + monthly * totalMonths;
      const interestEarned = totalSaved - totalContributed;

      // Future cost of college with tuition inflation
      let totalCollegeCost = 0;
      for (let y = 0; y < collegeYrs; y++) {
        totalCollegeCost += annualCost * Math.pow(1 + inflation / 100, years + y);
      }

      const shortfall = totalCollegeCost - totalSaved;
      const coveragePercent = totalCollegeCost > 0 ? (totalSaved / totalCollegeCost) * 100 : 0;

      return [
        { label: 'Projected Savings at College', value: `$${fmt(totalSaved, 0)}`, highlight: true },
        { label: 'Total College Cost (future)', value: `$${fmt(totalCollegeCost, 0)}`, highlight: true },
        { label: 'Coverage', value: `${fmt(coveragePercent, 1)}%`, highlight: true },
        { label: 'Interest Earned', value: `$${fmt(interestEarned, 0)}` },
        { label: 'Total Contributions', value: `$${fmt(totalContributed, 0)}` },
        { label: shortfall > 0 ? 'Shortfall' : 'Surplus', value: `$${fmt(Math.abs(shortfall), 0)}`, highlight: shortfall > 0 },
        { label: 'First Year Cost (future)', value: `$${fmt(annualCost * Math.pow(1 + inflation / 100, years), 0)}` },
      ];
    },
  },

  // 20. Net Worth Calculator
  {
    id: 'net-worth-calculator',
    name: 'Net Worth Calculator',
    description: 'Calculate your personal net worth by subtracting total liabilities from total assets. Track your financial health by entering cash, investments, property, and debts. Essential for financial planning, loan applications, and wealth tracking.',
    keywords: ['net worth', 'assets minus liabilities', 'financial health', 'wealth calculator', 'personal net worth', 'balance sheet'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'cash', label: 'Cash & Savings', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'investments', label: 'Investments', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'realEstate', label: 'Real Estate Value', type: 'number', min: 0, step: 1000, default: 0, prefix: '$' },
      { id: 'vehicles', label: 'Vehicles', type: 'number', min: 0, step: 1000, default: 0, prefix: '$' },
      { id: 'otherAssets', label: 'Other Assets', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'mortgage', label: 'Mortgage Balance', type: 'number', min: 0, step: 1000, default: 0, prefix: '$' },
      { id: 'studentLoans', label: 'Student Loans', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'carLoans', label: 'Car Loans', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'creditCards', label: 'Credit Card Debt', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
      { id: 'otherDebts', label: 'Other Debts', type: 'number', min: 0, step: 100, default: 0, prefix: '$' },
    ],
    compute: (inputs) => {
      const cash = Number(inputs.cash) || 0;
      const investments = Number(inputs.investments) || 0;
      const realEstate = Number(inputs.realEstate) || 0;
      const vehicles = Number(inputs.vehicles) || 0;
      const otherAssets = Number(inputs.otherAssets) || 0;
      const mortgage = Number(inputs.mortgage) || 0;
      const studentLoans = Number(inputs.studentLoans) || 0;
      const carLoans = Number(inputs.carLoans) || 0;
      const creditCards = Number(inputs.creditCards) || 0;
      const otherDebts = Number(inputs.otherDebts) || 0;

      const totalAssets = cash + investments + realEstate + vehicles + otherAssets;
      const totalLiabilities = mortgage + studentLoans + carLoans + creditCards + otherDebts;
      const netWorth = totalAssets - totalLiabilities;
      const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

      return [
        { label: 'Net Worth', value: `$${fmt(netWorth, 0)}`, highlight: true },
        { label: 'Total Assets', value: `$${fmt(totalAssets, 0)}` },
        { label: 'Total Liabilities', value: `$${fmt(totalLiabilities, 0)}` },
        { label: 'Debt-to-Asset Ratio', value: `${fmt(debtToAssetRatio, 1)}%` },
        { label: 'Liquid Assets', value: `$${fmt(cash + investments, 0)}` },
        { label: 'Net Worth Status', value: netWorth >= 0 ? 'Positive ✓' : 'Negative — Liabilities exceed assets' },
      ];
    },
  },

  // 21. Debt Payoff Calculator
  {
    id: 'debt-free-date-calculator',
    name: 'Debt Payoff Calculator',
    description: 'Calculate your debt-free date based on balance, interest rate, and monthly payment. See how extra payments can accelerate payoff and save interest. Perfect for credit card payoff, loan elimination, and debt freedom planning.',
    keywords: ['debt payoff', 'debt free date', 'loan payoff', 'credit card payoff', 'extra payment', 'debt elimination'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'balance', label: 'Current Balance', type: 'number', min: 0, step: 100, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'number', min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'monthlyPayment', label: 'Monthly Payment', type: 'number', min: 0, step: 10, prefix: '$' },
      { id: 'extraPayment', label: 'Extra Monthly Payment', type: 'number', min: 0, step: 10, default: 0, prefix: '$' },
    ],
    compute: (inputs) => {
      const balance = Number(inputs.balance) || 0;
      const rate = Number(inputs.interestRate) || 0;
      const payment = Number(inputs.monthlyPayment) || 0;
      const extra = Number(inputs.extraPayment) || 0;

      const monthlyRate = rate / 100 / 12;
      const totalPayment = payment + extra;

      if (totalPayment <= balance * monthlyRate && monthlyRate > 0) {
        return [{ label: 'Error', value: 'Payment must exceed monthly interest. Increase payment amount.', highlight: true }];
      }

      // Calculate payoff months
      const calcPayoff = (pmt: number): { months: number; totalPaid: number; totalInterest: number } => {
        if (monthlyRate === 0) {
          const m = Math.ceil(balance / pmt);
          return { months: m, totalPaid: m * pmt, totalInterest: 0 };
        }
        let remaining = balance;
        let totalPaid = 0;
        let months = 0;
        while (remaining > 0 && months < 600) {
          const interest = remaining * monthlyRate;
          const principal = pmt - interest;
          if (principal <= 0) return { months: Infinity, totalPaid: Infinity, totalInterest: Infinity };
          remaining -= principal;
          totalPaid += pmt;
          months++;
          if (remaining < 0) {
            totalPaid += remaining; // overpayment adjustment
            remaining = 0;
          }
        }
        return { months, totalPaid, totalInterest: totalPaid - balance };
      };

      const standard = calcPayoff(payment);
      const accelerated = calcPayoff(totalPayment);
      const interestSaved = standard.totalInterest - accelerated.totalInterest;
      const monthsSaved = standard.months - accelerated.months;

      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + accelerated.months);

      return [
        { label: 'Payoff Time', value: `${accelerated.months} months (${fmt(accelerated.months / 12, 1)} years)`, highlight: true },
        { label: 'Debt-Free Date', value: payoffDate.toISOString().split('T')[0], highlight: true },
        { label: 'Total Interest Paid', value: `$${fmt(accelerated.totalInterest, 2)}` },
        { label: 'Total Amount Paid', value: `$${fmt(accelerated.totalPaid, 2)}` },
        { label: 'Months Saved (vs minimum)', value: monthsSaved > 0 ? `${fmt(monthsSaved)} months` : 'N/A' },
        { label: 'Interest Saved (vs minimum)', value: interestSaved > 0 ? `$${fmt(interestSaved, 2)}` : 'N/A' },
      ];
    },
  },

  // 22. Loan Comparison Calculator
  {
    id: 'loan-options-comparison-calculator',
    name: 'Loan Comparison Calculator',
    description: 'Compare two loan options side by side — different rates, terms, or amounts. See total cost, monthly payments, and interest for each option to make informed borrowing decisions. Ideal for mortgage comparison, auto loan shopping, and refinancing analysis.',
    keywords: ['loan comparison', 'compare loans', 'mortgage comparison', 'auto loan comparison', 'refinance calculator', 'loan options'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'amount1', label: 'Loan A — Amount', type: 'number', min: 0, step: 1000, prefix: '$' },
      { id: 'rate1', label: 'Loan A — Rate', type: 'number', min: 0, max: 30, step: 0.1, suffix: '%' },
      { id: 'term1', label: 'Loan A — Term', type: 'number', min: 1, step: 1, suffix: 'months' },
      { id: 'amount2', label: 'Loan B — Amount', type: 'number', min: 0, step: 1000, prefix: '$' },
      { id: 'rate2', label: 'Loan B — Rate', type: 'number', min: 0, max: 30, step: 0.1, suffix: '%' },
      { id: 'term2', label: 'Loan B — Term', type: 'number', min: 1, step: 1, suffix: 'months' },
    ],
    compute: (inputs) => {
      const amt1 = Number(inputs.amount1) || 0;
      const r1 = Number(inputs.rate1) || 0;
      const t1 = Number(inputs.term1) || 1;
      const amt2 = Number(inputs.amount2) || 0;
      const r2 = Number(inputs.rate2) || 0;
      const t2 = Number(inputs.term2) || 1;

      const calcLoan = (principal: number, annualRate: number, months: number) => {
        const mr = annualRate / 100 / 12;
        if (mr === 0) {
          return { payment: principal / months, totalPaid: principal, totalInterest: 0 };
        }
        const payment = principal * (mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1);
        const totalPaid = payment * months;
        return { payment, totalPaid, totalInterest: totalPaid - principal };
      };

      const loanA = calcLoan(amt1, r1, t1);
      const loanB = calcLoan(amt2, r2, t2);

      const winner = loanA.totalPaid <= loanB.totalPaid ? 'A' : 'B';
      const savings = Math.abs(loanA.totalPaid - loanB.totalPaid);

      return [
        { label: 'Loan A — Monthly Payment', value: `$${fmt(loanA.payment, 2)}` },
        { label: 'Loan A — Total Interest', value: `$${fmt(loanA.totalInterest, 2)}` },
        { label: 'Loan A — Total Paid', value: `$${fmt(loanA.totalPaid, 2)}` },
        { label: 'Loan B — Monthly Payment', value: `$${fmt(loanB.payment, 2)}` },
        { label: 'Loan B — Total Interest', value: `$${fmt(loanB.totalInterest, 2)}` },
        { label: 'Loan B — Total Paid', value: `$${fmt(loanB.totalPaid, 2)}` },
        { label: 'Better Option (total cost)', value: `Loan ${winner}`, highlight: true },
        { label: 'Total Savings', value: `$${fmt(savings, 2)}`, highlight: true },
        { label: 'Monthly Payment Difference', value: `$${fmt(Math.abs(loanA.payment - loanB.payment), 2)}` },
      ];
    },
  },

  // 23. Currency Exchange Calculator
  {
    id: 'currency-exchange-calculator',
    name: 'Currency Exchange Calculator',
    description: 'Convert between major world currencies using approximate exchange rates. Quick reference for USD, EUR, GBP, JPY, CAD, AUD, and more. Note: rates are approximate and for estimation only — use live rates for actual transactions.',
    keywords: ['currency exchange', 'currency converter', 'forex', 'exchange rate', 'money conversion', 'foreign exchange'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'amount', label: 'Amount', type: 'number', min: 0, step: 0.01, default: 100 },
      { id: 'fromCurrency', label: 'From Currency', type: 'select', options: [
        { label: 'USD — US Dollar', value: 'USD' },
        { label: 'EUR — Euro', value: 'EUR' },
        { label: 'GBP — British Pound', value: 'GBP' },
        { label: 'JPY — Japanese Yen', value: 'JPY' },
        { label: 'CAD — Canadian Dollar', value: 'CAD' },
        { label: 'AUD — Australian Dollar', value: 'AUD' },
        { label: 'CHF — Swiss Franc', value: 'CHF' },
        { label: 'CNY — Chinese Yuan', value: 'CNY' },
        { label: 'INR — Indian Rupee', value: 'INR' },
      ] },
      { id: 'toCurrency', label: 'To Currency', type: 'select', options: [
        { label: 'USD — US Dollar', value: 'USD' },
        { label: 'EUR — Euro', value: 'EUR' },
        { label: 'GBP — British Pound', value: 'GBP' },
        { label: 'JPY — Japanese Yen', value: 'JPY' },
        { label: 'CAD — Canadian Dollar', value: 'CAD' },
        { label: 'AUD — Australian Dollar', value: 'AUD' },
        { label: 'CHF — Swiss Franc', value: 'CHF' },
        { label: 'CNY — Chinese Yuan', value: 'CNY' },
        { label: 'INR — Indian Rupee', value: 'INR' },
      ] },
    ],
    compute: (inputs) => {
      const amount = Number(inputs.amount) || 0;
      const from = String(inputs.fromCurrency || 'USD');
      const to = String(inputs.toCurrency || 'EUR');

      // Approximate rates to USD (as of early 2025)
      const ratesToUSD: Record<string, number> = {
        USD: 1,
        EUR: 1.08,
        GBP: 1.27,
        JPY: 0.0067,
        CAD: 0.74,
        AUD: 0.65,
        CHF: 1.12,
        CNY: 0.14,
        INR: 0.012,
      };

      const fromToUSD = ratesToUSD[from] || 1;
      const toToUSD = ratesToUSD[to] || 1;
      const rate = fromToUSD / toToUSD;
      const result = amount * rate;

      return [
        { label: `${amount} ${from} equals`, value: `${fmt(result, 2)} ${to}`, highlight: true },
        { label: 'Exchange Rate', value: `1 ${from} = ${fmt(rate, 6)} ${to}` },
        { label: 'Inverse Rate', value: `1 ${to} = ${fmt(1 / rate, 6)} ${from}` },
        { label: 'Note', value: 'Rates are approximate. Use live rates for transactions.' },
      ];
    },
  },

  // 24. Time Zone Converter
  {
    id: 'time-zone-converter',
    name: 'Time Zone Converter',
    description: 'Convert time between major world time zones. Enter a time and source zone to see the equivalent time in other zones. Essential for scheduling international meetings, travel planning, and global team coordination.',
    keywords: ['time zone converter', 'time zone', 'world clock', 'time difference', 'international time', 'meeting scheduler'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'hour', label: 'Hour', type: 'number', min: 0, max: 23, step: 1, default: 12 },
      { id: 'minute', label: 'Minute', type: 'number', min: 0, max: 59, step: 1, default: 0 },
      { id: 'fromZone', label: 'From Time Zone', type: 'select', options: [
        { label: 'UTC', value: '0' }, { label: 'EST (UTC-5)', value: '-5' },
        { label: 'CST (UTC-6)', value: '-6' }, { label: 'MST (UTC-7)', value: '-7' },
        { label: 'PST (UTC-8)', value: '-8' }, { label: 'GMT (UTC+0)', value: '0' },
        { label: 'CET (UTC+1)', value: '1' }, { label: 'EET (UTC+2)', value: '2' },
        { label: 'IST (UTC+5:30)', value: '5.5' }, { label: 'CST China (UTC+8)', value: '8' },
        { label: 'JST (UTC+9)', value: '9' }, { label: 'AEST (UTC+10)', value: '10' },
        { label: 'NZST (UTC+12)', value: '12' },
      ] },
      { id: 'toZone', label: 'To Time Zone', type: 'select', options: [
        { label: 'UTC', value: '0' }, { label: 'EST (UTC-5)', value: '-5' },
        { label: 'CST (UTC-6)', value: '-6' }, { label: 'MST (UTC-7)', value: '-7' },
        { label: 'PST (UTC-8)', value: '-8' }, { label: 'GMT (UTC+0)', value: '0' },
        { label: 'CET (UTC+1)', value: '1' }, { label: 'EET (UTC+2)', value: '2' },
        { label: 'IST (UTC+5:30)', value: '5.5' }, { label: 'CST China (UTC+8)', value: '8' },
        { label: 'JST (UTC+9)', value: '9' }, { label: 'AEST (UTC+10)', value: '10' },
        { label: 'NZST (UTC+12)', value: '12' },
      ] },
    ],
    compute: (inputs) => {
      const hour = Number(inputs.hour) || 0;
      const minute = Number(inputs.minute) || 0;
      const fromOffset = Number(inputs.fromZone || 0);
      const toOffset = Number(inputs.toZone || 0);

      const diff = toOffset - fromOffset;
      let resultHour = hour + diff;
      let dayShift = 0;
      if (resultHour >= 24) { resultHour -= 24; dayShift = 1; }
      if (resultHour < 0) { resultHour += 24; dayShift = -1; }

      const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
      };

      const dayLabel = dayShift > 0 ? ' (next day)' : dayShift < 0 ? ' (previous day)' : '';

      return [
        { label: 'Converted Time', value: `${formatTime(Math.floor(resultHour), minute)}${dayLabel}`, highlight: true },
        { label: 'Time Difference', value: `${diff >= 0 ? '+' : ''}${fmt(diff)} hours` },
        { label: 'From', value: `${formatTime(hour, minute)} (UTC${fromOffset >= 0 ? '+' : ''}${fromOffset})` },
        { label: 'To', value: `${formatTime(Math.floor(resultHour), minute)} (UTC${toOffset >= 0 ? '+' : ''}${toOffset})` },
      ];
    },
  },

  // 25. Countdown Calculator
  {
    id: 'countdown-calculator',
    name: 'Countdown Calculator',
    description: 'Calculate the number of days, hours, and minutes until a specific future date. Perfect for counting down to vacations, weddings, graduations, holidays, product launches, or any important event.',
    keywords: ['countdown', 'days until', 'countdown timer', 'event countdown', 'how many days', 'days remaining'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'targetDate', label: 'Target Date', type: 'text', placeholder: 'YYYY-MM-DD' },
      { id: 'eventName', label: 'Event Name (optional)', type: 'text', placeholder: 'e.g., Vacation' },
    ],
    compute: (inputs) => {
      const targetStr = String(inputs.targetDate);
      const target = new Date(targetStr);
      const now = new Date();
      if (isNaN(target.getTime())) return [{ label: 'Error', value: 'Invalid date' }];

      const diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        const daysPast = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
        return [
          { label: 'Status', value: 'This date has already passed', highlight: true },
          { label: 'Days Ago', value: fmt(daysPast) },
        ];
      }

      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const weeks = Math.floor(totalDays / 7);
      const months = Math.floor(totalDays / 30.44);

      const eventName = inputs.eventName ? String(inputs.eventName) : 'Target date';

      return [
        { label: `Days until ${eventName}`, value: fmt(totalDays), highlight: true },
        { label: 'Weeks', value: `${fmt(weeks)} weeks and ${fmt(totalDays % 7)} days` },
        { label: 'Months (approx)', value: fmt(months, 1) },
        { label: 'Total Hours', value: fmt(totalHours) },
        { label: 'Total Minutes', value: fmt(totalMinutes) },
        { label: 'Target Day of Week', value: target.toLocaleDateString('en-US', { weekday: 'long' }) },
      ];
    },
  },

  // 26. Dog Age Calculator
  {
    id: 'dog-age-calculator',
    name: 'Dog Age Calculator',
    description: 'Convert dog years to human equivalent years using the modern age conversion formula. Accounts for the fact that dogs age faster in their first two years. Works for small, medium, and large dog breeds with different life expectancies.',
    keywords: ['dog age', 'dog years', 'dog years to human years', 'dog age calculator', 'puppy age', 'canine age'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'dogYears', label: 'Dog Age (years)', type: 'number', min: 0, step: 0.5, suffix: 'years' },
      { id: 'dogMonths', label: 'Additional Months', type: 'number', min: 0, max: 11, step: 1, default: 0, suffix: 'months' },
      { id: 'size', label: 'Dog Size', type: 'select', options: [
        { label: 'Small (under 20 lbs)', value: 'small' },
        { label: 'Medium (20–50 lbs)', value: 'medium' },
        { label: 'Large (50–100 lbs)', value: 'large' },
        { label: 'Giant (over 100 lbs)', value: 'giant' },
      ] },
    ],
    compute: (inputs) => {
      const years = Number(inputs.dogYears) || 0;
      const months = Number(inputs.dogMonths) || 0;
      const size = String(inputs.size || 'medium');
      const totalYears = years + months / 12;

      // Modern conversion: first year = 15, second year = 9, each subsequent year varies by size
      let humanYears: number;
      if (totalYears <= 1) {
        humanYears = totalYears * 15;
      } else if (totalYears <= 2) {
        humanYears = 15 + (totalYears - 1) * 9;
      } else {
        const rates: Record<string, number> = { small: 4, medium: 5, large: 6, giant: 7 };
        const rate = rates[size] || 5;
        humanYears = 15 + 9 + (totalYears - 2) * rate;
      }

      // Life expectancy by size
      const lifeExp: Record<string, number> = { small: 16, medium: 13, large: 11, giant: 9 };
      const expectancy = lifeExp[size] || 13;
      const lifePercent = (totalYears / expectancy) * 100;

      // Life stage
      const lifeStage = totalYears < 0.5 ? 'Puppy' : totalYears < 2 ? 'Adolescent' : totalYears < 5 ? 'Adult' : totalYears < expectancy * 0.75 ? 'Mature' : 'Senior';

      return [
        { label: 'Human Equivalent Age', value: `${fmt(humanYears, 1)} years`, highlight: true },
        { label: 'Dog Age', value: `${years} years, ${months} months` },
        { label: 'Dog Size', value: size.charAt(0).toUpperCase() + size.slice(1) },
        { label: 'Life Stage', value: lifeStage },
        { label: 'Life Expectancy', value: `~${expectancy} years` },
        { label: 'Life Progress', value: `${fmt(lifePercent, 1)}%` },
      ];
    },
  },

  // 27. Cat Age Calculator
  {
    id: 'cat-age-calculator',
    name: 'Cat Age Calculator',
    description: 'Convert cat years to human equivalent years using the modern feline age conversion. Cats mature rapidly in their first two years, then age more slowly. Calculate your cat\'s human age, life stage, and remaining life expectancy.',
    keywords: ['cat age', 'cat years', 'cat years to human years', 'cat age calculator', 'kitten age', 'feline age'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'catYears', label: 'Cat Age (years)', type: 'number', min: 0, step: 0.5, suffix: 'years' },
      { id: 'catMonths', label: 'Additional Months', type: 'number', min: 0, max: 11, step: 1, default: 0, suffix: 'months' },
      { id: 'indoor', label: 'Indoor Cat', type: 'checkbox', default: true },
    ],
    compute: (inputs) => {
      const years = Number(inputs.catYears) || 0;
      const months = Number(inputs.catMonths) || 0;
      const indoor = Boolean(inputs.indoor);
      const totalYears = years + months / 12;

      // Modern conversion: first year = 15, second year = 9, each subsequent year ≈ 4
      let humanYears: number;
      if (totalYears <= 1) {
        humanYears = totalYears * 15;
      } else if (totalYears <= 2) {
        humanYears = 15 + (totalYears - 1) * 9;
      } else {
        humanYears = 15 + 9 + (totalYears - 2) * 4;
      }

      const expectancy = indoor ? 17 : 12;
      const lifePercent = (totalYears / expectancy) * 100;
      const lifeStage = totalYears < 0.5 ? 'Kitten' : totalYears < 2 ? 'Junior' : totalYears < 6 ? 'Adult' : totalYears < 10 ? 'Mature' : totalYears < 14 ? 'Senior' : 'Geriatric';

      return [
        { label: 'Human Equivalent Age', value: `${fmt(humanYears, 1)} years`, highlight: true },
        { label: 'Cat Age', value: `${years} years, ${months} months` },
        { label: 'Indoor/Outdoor', value: indoor ? 'Indoor' : 'Outdoor' },
        { label: 'Life Stage', value: lifeStage },
        { label: 'Life Expectancy', value: `~${expectancy} years (${indoor ? 'indoor' : 'outdoor'})` },
        { label: 'Life Progress', value: `${fmt(lifePercent, 1)}%` },
      ];
    },
  },

  // 28. Screen Size Calculator
  {
    id: 'screen-size-calculator',
    name: 'Screen Size Calculator',
    description: 'Calculate screen diagonal size from width and height in inches. Also computes screen area, pixels per inch (PPI), and aspect ratio. Perfect for comparing monitors, TVs, phones, and laptop displays.',
    keywords: ['screen size', 'diagonal calculator', 'PPI', 'pixels per inch', 'monitor size', 'display size', 'aspect ratio'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'screenWidth', label: 'Screen Width', type: 'number', min: 0, step: 0.1, suffix: 'inches' },
      { id: 'screenHeight', label: 'Screen Height', type: 'number', min: 0, step: 0.1, suffix: 'inches' },
      { id: 'pixelWidth', label: 'Resolution Width (optional)', type: 'number', min: 0, step: 1, suffix: 'px' },
      { id: 'pixelHeight', label: 'Resolution Height (optional)', type: 'number', min: 0, step: 1, suffix: 'px' },
    ],
    compute: (inputs) => {
      const w = Number(inputs.screenWidth) || 0;
      const h = Number(inputs.screenHeight) || 0;
      const pw = Number(inputs.pixelWidth) || 0;
      const ph = Number(inputs.pixelHeight) || 0;

      if (w === 0 || h === 0) return [{ label: 'Error', value: 'Width and height required' }];

      const diagonal = Math.sqrt(w * w + h * h);
      const area = w * h;

      // Find GCD for aspect ratio
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const g = gcd(Math.round(w * 100), Math.round(h * 100));
      const aspectW = Math.round(w * 100) / g;
      const aspectH = Math.round(h * 100) / g;

      const results: CalcResult[] = [
        { label: 'Diagonal Size', value: `${fmt(diagonal, 2)} inches`, highlight: true },
        { label: 'Screen Area', value: `${fmt(area, 2)} sq in` },
        { label: 'Width × Height', value: `${fmt(w, 2)}" × ${fmt(h, 2)}"` },
        { label: 'Approx Aspect Ratio', value: `${fmt(aspectW, 2)}:${fmt(aspectH, 2)}` },
      ];

      if (pw > 0 && ph > 0) {
        const ppi = Math.sqrt(pw * pw + ph * ph) / diagonal;
        const totalPixels = pw * ph;
        results.push({ label: 'Pixels Per Inch (PPI)', value: fmt(ppi, 2), highlight: true });
        results.push({ label: 'Total Pixels', value: `${fmt(totalPixels)} (${fmt(totalPixels / 1e6, 2)} MP)` });
        results.push({ label: 'Resolution', value: `${pw} × ${ph}` });
      }

      return results;
    },
  },

  // 29. Battery Life Calculator
  {
    id: 'device-battery-life-calculator',
    name: 'Battery Life Calculator',
    description: 'Calculate battery runtime from battery capacity (mAh) and device current draw (mA). Estimate how long a battery will last for phones, laptops, IoT devices, and electronics. Essential for battery selection and power management.',
    keywords: ['battery life', 'battery runtime', 'battery capacity', 'mAh calculator', 'battery duration', 'power consumption'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'capacity', label: 'Battery Capacity', type: 'number', min: 0, step: 1, suffix: 'mAh' },
      { id: 'currentDraw', label: 'Current Draw', type: 'number', min: 0, step: 0.1, suffix: 'mA' },
      { id: 'efficiency', label: 'Efficiency', type: 'number', min: 50, max: 100, step: 1, default: 90, suffix: '%' },
    ],
    compute: (inputs) => {
      const capacity = Number(inputs.capacity) || 0;
      const draw = Number(inputs.currentDraw) || 0;
      const efficiency = Number(inputs.efficiency) || 90;

      if (draw === 0) return [{ label: 'Error', value: 'Current draw cannot be zero' }];

      const effectiveCapacity = capacity * (efficiency / 100);
      const runtimeHours = effectiveCapacity / draw;
      const runtimeMinutes = runtimeHours * 60;

      const days = Math.floor(runtimeHours / 24);
      const hours = Math.floor(runtimeHours % 24);
      const mins = Math.floor((runtimeHours * 60) % 60);

      const formatRuntime = () => {
        if (days > 0) return `${days}d ${hours}h ${mins}m`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${fmt(runtimeMinutes, 1)} minutes`;
      };

      return [
        { label: 'Estimated Runtime', value: formatRuntime(), highlight: true },
        { label: 'Runtime (hours)', value: `${fmt(runtimeHours, 2)} hours` },
        { label: 'Runtime (minutes)', value: `${fmt(runtimeMinutes, 1)} min` },
        { label: 'Effective Capacity', value: `${fmt(effectiveCapacity, 1)} mAh` },
        { label: 'Nominal Capacity', value: `${fmt(capacity)} mAh` },
        { label: 'Efficiency Factor', value: `${efficiency}%` },
      ];
    },
  },

  // 30. Solar Panel Calculator
  {
    id: 'home-solar-panel-calculator',
    name: 'Solar Panel Output Calculator',
    description: 'Estimate solar panel energy output based on panel wattage, number of panels, peak sun hours, and system efficiency. Calculate daily, monthly, and annual kWh production. Essential for solar energy planning, off-grid sizing, and ROI estimation.',
    keywords: ['solar panel', 'solar output', 'solar energy', 'solar calculator', 'kWh solar', 'photovoltaic', 'solar estimate'],
    category: 'everyday',
    icon: 'Home',
    fields: [
      { id: 'panelWattage', label: 'Panel Wattage', type: 'number', min: 0, step: 1, default: 400, suffix: 'W' },
      { id: 'numPanels', label: 'Number of Panels', type: 'number', min: 1, step: 1, default: 10 },
      { id: 'peakSunHours', label: 'Peak Sun Hours/Day', type: 'number', min: 0, max: 12, step: 0.5, default: 5, suffix: 'hours' },
      { id: 'efficiency', label: 'System Efficiency', type: 'number', min: 50, max: 100, step: 1, default: 80, suffix: '%' },
      { id: 'electricityRate', label: 'Electricity Rate (optional)', type: 'number', min: 0, step: 0.01, default: 0.12, prefix: '$', suffix: '/kWh' },
    ],
    compute: (inputs) => {
      const wattage = Number(inputs.panelWattage) || 0;
      const panels = Number(inputs.numPanels) || 0;
      const sunHours = Number(inputs.peakSunHours) || 0;
      const efficiency = Number(inputs.efficiency) || 80;
      const rate = Number(inputs.electricityRate) || 0;

      const systemSizeKw = (wattage * panels) / 1000;
      const dailyKWh = systemSizeKw * sunHours * (efficiency / 100);
      const monthlyKWh = dailyKWh * 30;
      const annualKWh = dailyKWh * 365;

      const results: CalcResult[] = [
        { label: 'System Size', value: `${fmt(systemSizeKw, 2)} kW`, highlight: true },
        { label: 'Daily Output', value: `${fmt(dailyKWh, 2)} kWh`, highlight: true },
        { label: 'Monthly Output', value: `${fmt(monthlyKWh, 1)} kWh` },
        { label: 'Annual Output', value: `${fmt(annualKWh, 0)} kWh` },
        { label: 'Total Panel Area (approx)', value: `~${fmt(panels * wattage / 17.5, 0)} sq ft` },
        { label: 'Efficiency Loss', value: `${100 - efficiency}%` },
      ];

      if (rate > 0) {
        const annualSavings = annualKWh * rate;
        results.push({ label: 'Annual Savings', value: `$${fmt(annualSavings, 0)}`, highlight: true });
        results.push({ label: 'Monthly Savings', value: `$${fmt(monthlyKWh * rate, 2)}` });
        results.push({ label: 'Daily Savings', value: `$${fmt(dailyKWh * rate, 2)}` });
      }

      return results;
    },
  },

];
