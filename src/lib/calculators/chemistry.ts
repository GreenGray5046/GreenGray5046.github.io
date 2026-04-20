import { Calculator, fmt, fmtSci } from '../calc-types';

// ── Periodic table data (atomic number → symbol & molar mass in g/mol) ──
const ELEMENTS: Record<string, { symbol: string; name: string; mass: number }> = {
  H: { symbol: 'H', name: 'Hydrogen', mass: 1.00794 },
  He: { symbol: 'He', name: 'Helium', mass: 4.002602 },
  Li: { symbol: 'Li', name: 'Lithium', mass: 6.941 },
  Be: { symbol: 'Be', name: 'Beryllium', mass: 9.012182 },
  B: { symbol: 'B', name: 'Boron', mass: 10.811 },
  C: { symbol: 'C', name: 'Carbon', mass: 12.0107 },
  N: { symbol: 'N', name: 'Nitrogen', mass: 14.0067 },
  O: { symbol: 'O', name: 'Oxygen', mass: 15.9994 },
  F: { symbol: 'F', name: 'Fluorine', mass: 18.9984032 },
  Ne: { symbol: 'Ne', name: 'Neon', mass: 20.1797 },
  Na: { symbol: 'Na', name: 'Sodium', mass: 22.98976928 },
  Mg: { symbol: 'Mg', name: 'Magnesium', mass: 24.305 },
  Al: { symbol: 'Al', name: 'Aluminium', mass: 26.9815386 },
  Si: { symbol: 'Si', name: 'Silicon', mass: 28.0855 },
  P: { symbol: 'P', name: 'Phosphorus', mass: 30.973762 },
  S: { symbol: 'S', name: 'Sulfur', mass: 32.065 },
  Cl: { symbol: 'Cl', name: 'Chlorine', mass: 35.453 },
  Ar: { symbol: 'Ar', name: 'Argon', mass: 39.948 },
  K: { symbol: 'K', name: 'Potassium', mass: 39.0983 },
  Ca: { symbol: 'Ca', name: 'Calcium', mass: 40.078 },
  Sc: { symbol: 'Sc', name: 'Scandium', mass: 44.955912 },
  Ti: { symbol: 'Ti', name: 'Titanium', mass: 47.867 },
  V: { symbol: 'V', name: 'Vanadium', mass: 50.9415 },
  Cr: { symbol: 'Cr', name: 'Chromium', mass: 51.9961 },
  Mn: { symbol: 'Mn', name: 'Manganese', mass: 54.938045 },
  Fe: { symbol: 'Fe', name: 'Iron', mass: 55.845 },
  Co: { symbol: 'Co', name: 'Cobalt', mass: 58.933195 },
  Ni: { symbol: 'Ni', name: 'Nickel', mass: 58.6934 },
  Cu: { symbol: 'Cu', name: 'Copper', mass: 63.546 },
  Zn: { symbol: 'Zn', name: 'Zinc', mass: 65.38 },
  Ga: { symbol: 'Ga', name: 'Gallium', mass: 69.723 },
  Ge: { symbol: 'Ge', name: 'Germanium', mass: 72.64 },
  As: { symbol: 'As', name: 'Arsenic', mass: 74.9216 },
  Se: { symbol: 'Se', name: 'Selenium', mass: 78.96 },
  Br: { symbol: 'Br', name: 'Bromine', mass: 79.904 },
  Kr: { symbol: 'Kr', name: 'Krypton', mass: 83.798 },
  Rb: { symbol: 'Rb', name: 'Rubidium', mass: 85.4678 },
  Sr: { symbol: 'Sr', name: 'Strontium', mass: 87.62 },
  Y: { symbol: 'Y', name: 'Yttrium', mass: 88.90585 },
  Zr: { symbol: 'Zr', name: 'Zirconium', mass: 91.224 },
  Nb: { symbol: 'Nb', name: 'Niobium', mass: 92.90638 },
  Mo: { symbol: 'Mo', name: 'Molybdenum', mass: 95.96 },
  Ru: { symbol: 'Ru', name: 'Ruthenium', mass: 101.07 },
  Rh: { symbol: 'Rh', name: 'Rhodium', mass: 102.9055 },
  Pd: { symbol: 'Pd', name: 'Palladium', mass: 106.42 },
  Ag: { symbol: 'Ag', name: 'Silver', mass: 107.8682 },
  Cd: { symbol: 'Cd', name: 'Cadmium', mass: 112.411 },
  In: { symbol: 'In', name: 'Indium', mass: 114.818 },
  Sn: { symbol: 'Sn', name: 'Tin', mass: 118.71 },
  Sb: { symbol: 'Sb', name: 'Antimony', mass: 121.76 },
  Te: { symbol: 'Te', name: 'Tellurium', mass: 127.6 },
  I: { symbol: 'I', name: 'Iodine', mass: 126.90447 },
  Xe: { symbol: 'Xe', name: 'Xenon', mass: 131.293 },
  Cs: { symbol: 'Cs', name: 'Caesium', mass: 132.9054519 },
  Ba: { symbol: 'Ba', name: 'Barium', mass: 137.327 },
  La: { symbol: 'La', name: 'Lanthanum', mass: 138.90547 },
  Ce: { symbol: 'Ce', name: 'Cerium', mass: 140.116 },
  Pr: { symbol: 'Pr', name: 'Praseodymium', mass: 140.90765 },
  Nd: { symbol: 'Nd', name: 'Neodymium', mass: 144.242 },
  Sm: { symbol: 'Sm', name: 'Samarium', mass: 150.36 },
  Eu: { symbol: 'Eu', name: 'Europium', mass: 151.964 },
  Gd: { symbol: 'Gd', name: 'Gadolinium', mass: 157.25 },
  Tb: { symbol: 'Tb', name: 'Terbium', mass: 158.92535 },
  Dy: { symbol: 'Dy', name: 'Dysprosium', mass: 162.5 },
  Ho: { symbol: 'Ho', name: 'Holmium', mass: 164.93032 },
  Er: { symbol: 'Er', name: 'Erbium', mass: 167.259 },
  Tm: { symbol: 'Tm', name: 'Thulium', mass: 168.93421 },
  Yb: { symbol: 'Yb', name: 'Ytterbium', mass: 173.054 },
  Lu: { symbol: 'Lu', name: 'Lutetium', mass: 174.9668 },
  Hf: { symbol: 'Hf', name: 'Hafnium', mass: 178.49 },
  Ta: { symbol: 'Ta', name: 'Tantalum', mass: 180.94788 },
  W: { symbol: 'W', name: 'Tungsten', mass: 183.84 },
  Re: { symbol: 'Re', name: 'Rhenium', mass: 186.207 },
  Os: { symbol: 'Os', name: 'Osmium', mass: 190.23 },
  Ir: { symbol: 'Ir', name: 'Iridium', mass: 192.217 },
  Pt: { symbol: 'Pt', name: 'Platinum', mass: 195.084 },
  Au: { symbol: 'Au', name: 'Gold', mass: 196.966569 },
  Hg: { symbol: 'Hg', name: 'Mercury', mass: 200.59 },
  Tl: { symbol: 'Tl', name: 'Thallium', mass: 204.3833 },
  Pb: { symbol: 'Pb', name: 'Lead', mass: 207.2 },
  Bi: { symbol: 'Bi', name: 'Bismuth', mass: 208.9804 },
  Th: { symbol: 'Th', name: 'Thorium', mass: 232.03806 },
  Pa: { symbol: 'Pa', name: 'Protactinium', mass: 231.03588 },
  U: { symbol: 'U', name: 'Uranium', mass: 238.02891 },
};

/**
 * Parse a chemical formula like "H2SO4" or "Ca(OH)2" into element–count pairs.
 * Returns null if the formula contains an unknown element.
 */
function parseFormula(formula: string): { elem: string; count: number }[] | null {
  const tokens: { elem: string; count: number }[] = [];
  const stack: { elem: string; count: number }[][] = [[]];
  let i = 0;
  const s = formula.trim();

  while (i < s.length) {
    if (s[i] === '(') {
      stack.push([]);
      i++;
    } else if (s[i] === ')') {
      i++;
      let numStr = '';
      while (i < s.length && /\d/.test(s[i])) { numStr += s[i]; i++; }
      const mult = numStr ? parseInt(numStr, 10) : 1;
      const group = stack.pop()!;
      for (const t of group) {
        t.count *= mult;
        stack[stack.length - 1].push(t);
      }
    } else if (/[A-Z]/.test(s[i])) {
      let sym = s[i]; i++;
      while (i < s.length && /[a-z]/.test(s[i])) { sym += s[i]; i++; }
      let numStr = '';
      while (i < s.length && /\d/.test(s[i])) { numStr += s[i]; i++; }
      const count = numStr ? parseInt(numStr, 10) : 1;
      if (!ELEMENTS[sym]) return null;
      stack[stack.length - 1].push({ elem: sym, count });
    } else {
      return null; // unexpected character
    }
  }
  if (stack.length !== 1) return null;
  return stack[0];
}

// ── Electron configuration helper ──
const ORBITALS: [number, string][] = [
  [1, '1s'], [2, '2s'], [2, '2p'], [3, '3s'], [3, '3p'], [4, '4s'], [3, '3d'],
  [4, '4p'], [5, '5s'], [4, '4d'], [5, '5p'], [6, '6s'], [4, '4f'], [5, '5d'],
  [6, '6p'], [7, '7s'], [5, '5f'], [6, '6d'], [7, '7p'],
];
const ORBITAL_MAX: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };

function electronConfig(z: number): string {
  let remaining = z;
  const parts: string[] = [];
  for (const [, label] of ORBITALS) {
    if (remaining <= 0) break;
    const sub = label.slice(-1) as 's' | 'p' | 'd' | 'f';
    const max = ORBITAL_MAX[sub];
    const electrons = Math.min(remaining, max);
    parts.push(`${label}${electrons}`);
    remaining -= electrons;
  }
  return parts.join(' ');
}

// ── Noble gas abbreviations ──
const NOBLE_GAS_CONFIG: Record<number, string> = {
  2: '[He]', 10: '[Ne]', 18: '[Ar]', 36: '[Kr]', 54: '[Xe]', 86: '[Rn]',
};

function electronConfigNoble(z: number): string {
  let remaining = z;
  let lastNobleZ = 0;
  let nobleLabel = '';
  for (const nz of [2, 10, 18, 36, 54, 86]) {
    if (nz < z) { lastNobleZ = nz; nobleLabel = NOBLE_GAS_CONFIG[nz]; }
  }
  if (!nobleLabel) return electronConfig(z);
  remaining = z - lastNobleZ;
  const parts: string[] = [];
  for (const [, label] of ORBITALS) {
    if (remaining <= 0) break;
    const principal = parseInt(label, 10);
    if (principal < parseInt(Object.keys(NOBLE_GAS_CONFIG).find(k => parseInt(k) === lastNobleZ) || '1', 10) - 1) continue;
    // skip orbitals already in noble gas
    const sub = label.slice(-1) as 's' | 'p' | 'd' | 'f';
    const max = ORBITAL_MAX[sub];
    // We need to know how many electrons this orbital has in the noble gas
    // Simpler: just rebuild from remaining, starting after noble gas
  }
  // Simpler approach: generate full config, then replace
  const full = electronConfig(z);
  const nobleFull = electronConfig(lastNobleZ);
  const suffix = full.slice(nobleFull.length).trim();
  return suffix ? `${nobleLabel} ${suffix}` : nobleLabel;
}

export const chemistryCalculators: Calculator[] = [

  // ──────────────────────────────────────────────────────────────────
  // 1. Molar Mass Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'molar-mass-calculator',
    name: 'Molar Mass Calculator',
    description: 'Calculate the molar mass (molecular weight) of any chemical compound from its formula. Supports parentheses, e.g. Ca(OH)2, Fe2(SO4)3, Al2O3.',
    keywords: ['molar mass', 'molecular weight', 'formula weight', 'gram formula mass', 'molar mass calculator', 'compound mass', 'atomic weight sum', 'chemical formula weight'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'formula', label: 'Chemical Formula', type: 'text', placeholder: 'e.g. H2SO4, Ca(OH)2', default: 'H2SO4' },
    ],
    compute: (inputs) => {
      const formula = String(inputs.formula || '').trim();
      if (!formula) return [{ label: 'Error', value: 'Enter a chemical formula' }];
      const parsed = parseFormula(formula);
      if (!parsed) return [{ label: 'Error', value: 'Invalid formula or unknown element' }];
      let totalMass = 0;
      const breakdown: string[] = [];
      for (const { elem, count } of parsed) {
        const el = ELEMENTS[elem];
        if (!el) return [{ label: 'Error', value: `Unknown element: ${elem}` }];
        const contrib = el.mass * count;
        totalMass += contrib;
        breakdown.push(`${elem}${count > 1 ? count : ''}: ${fmt(el.mass, 4)} × ${count} = ${fmt(contrib, 4)}`);
      }
      return [
        { label: 'Molar Mass', value: `${fmt(totalMass, 4)} g/mol`, highlight: true },
        { label: 'Breakdown', value: breakdown.join('\n') },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. Dilution Calculator (M1V1 = M2V2)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'dilution-calculator',
    name: 'Solution Dilution Calculator',
    description: 'Use the dilution formula M₁V₁ = M₂V₂ to calculate the volume or concentration needed when diluting a solution. Ideal for preparing lab solutions from stock concentrations.',
    keywords: ['dilution calculator', 'solution dilution', 'M1V1=M2V2', 'stock solution', 'dilution factor', 'serial dilution', 'concentration dilution', 'lab dilution'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'm1', label: 'Initial Concentration (M₁)', type: 'number', default: 6, min: 0, suffix: 'M' },
      { id: 'v1', label: 'Initial Volume (V₁)', type: 'number', default: 0, min: 0, suffix: 'L', placeholder: 'Leave 0 to solve' },
      { id: 'm2', label: 'Final Concentration (M₂)', type: 'number', default: 1, min: 0, suffix: 'M' },
      { id: 'v2', label: 'Final Volume (V₂)', type: 'number', default: 1, min: 0, suffix: 'L', placeholder: 'Leave 0 to solve' },
    ],
    compute: (inputs) => {
      const m1 = Number(inputs.m1) || 0;
      const v1 = Number(inputs.v1) || 0;
      const m2 = Number(inputs.m2) || 0;
      const v2 = Number(inputs.v2) || 0;

      const given = [m1 > 0, v1 > 0, m2 > 0, v2 > 0].filter(Boolean).length;
      if (given < 3) return [{ label: 'Error', value: 'Provide at least 3 of the 4 values' }];

      if (v1 === 0 && m1 > 0 && m2 > 0 && v2 > 0) {
        const result = (m2 * v2) / m1;
        return [
          { label: 'Initial Volume (V₁)', value: `${fmt(result, 4)} L`, highlight: true },
          { label: 'Verification', value: `M₁V₁ = ${fmt(m1 * result, 4)}, M₂V₂ = ${fmt(m2 * v2, 4)}` },
        ];
      }
      if (v2 === 0 && m1 > 0 && v1 > 0 && m2 > 0) {
        const result = (m1 * v1) / m2;
        return [
          { label: 'Final Volume (V₂)', value: `${fmt(result, 4)} L`, highlight: true },
          { label: 'Water to Add', value: `${fmt(result - v1, 4)} L` },
        ];
      }
      if (m1 === 0 && v1 > 0 && m2 > 0 && v2 > 0) {
        const result = (m2 * v2) / v1;
        return [
          { label: 'Initial Concentration (M₁)', value: `${fmt(result, 4)} M`, highlight: true },
        ];
      }
      if (m2 === 0 && m1 > 0 && v1 > 0 && v2 > 0) {
        const result = (m1 * v1) / v2;
        return [
          { label: 'Final Concentration (M₂)', value: `${fmt(result, 4)} M`, highlight: true },
          { label: 'Dilution Factor', value: fmt(m1 / ((m1 * v1) / v2), 4) },
        ];
      }
      return [{ label: 'Verification', value: `M₁V₁ = ${fmt(m1 * v1, 4)}, M₂V₂ = ${fmt(m2 * v2, 4)}` }];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. Molarity Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'molarity-calculator',
    name: 'Molarity Calculator',
    description: 'Calculate molar concentration (molarity) from moles of solute and volume of solution, or solve for any missing variable. M = n / V.',
    keywords: ['molarity calculator', 'concentration', 'molar concentration', 'moles per liter', 'solution concentration', 'molarity formula', 'solute concentration', 'M = mol/L'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'moles', label: 'Moles of Solute (n)', type: 'number', default: 0.5, min: 0, suffix: 'mol' },
      { id: 'volume', label: 'Volume of Solution (V)', type: 'number', default: 1, min: 0, suffix: 'L' },
    ],
    compute: (inputs) => {
      const n = Number(inputs.moles) || 0;
      const v = Number(inputs.volume) || 0;
      if (v <= 0) return [{ label: 'Error', value: 'Volume must be greater than zero' }];
      const M = n / v;
      return [
        { label: 'Molarity (M)', value: `${fmt(M, 6)} mol/L`, highlight: true },
        { label: 'Millimolarity', value: `${fmt(M * 1000, 4)} mmol/L` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. pH Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'ph-calculator',
    name: 'pH Calculator',
    description: 'Calculate pH from hydrogen ion concentration [H⁺] or find [H⁺] from pH. Uses pH = -log₁₀[H⁺]. Supports strong acid and weak acid approximations.',
    keywords: ['pH calculator', 'acidity', 'hydrogen ion concentration', 'pH formula', 'strong acid pH', 'pH from concentration', 'logarithmic pH', 'acidic solution'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'mode', label: 'Calculation Mode', type: 'select', options: [
        { label: 'From [H⁺] to pH', value: 'h_to_ph' },
        { label: 'From pH to [H⁺]', value: 'ph_to_h' },
      ], default: 'h_to_ph' },
      { id: 'h_conc', label: 'Hydrogen Ion Concentration [H⁺]', type: 'number', default: 0.001, min: 0, step: 0.0001, suffix: 'mol/L' },
      { id: 'ph_value', label: 'pH Value', type: 'number', default: 3, min: 0, max: 14, step: 0.01 },
    ],
    compute: (inputs) => {
      const mode = String(inputs.mode || 'h_to_ph');
      if (mode === 'h_to_ph') {
        const h = Number(inputs.h_conc) || 0;
        if (h <= 0) return [{ label: 'Error', value: 'Concentration must be positive' }];
        const ph = -Math.log10(h);
        const poh = 14 - ph;
        const oh = Math.pow(10, -poh);
        return [
          { label: 'pH', value: fmt(ph, 4), highlight: true },
          { label: 'pOH', value: fmt(poh, 4) },
          { label: '[OH⁻]', value: `${fmtSci(oh, 4)} mol/L` },
          { label: 'Acid/Base', value: ph < 7 ? 'Acidic' : ph > 7 ? 'Basic' : 'Neutral' },
        ];
      } else {
        const ph = Number(inputs.ph_value);
        if (ph < 0 || ph > 14) return [{ label: 'Error', value: 'pH must be between 0 and 14' }];
        const h = Math.pow(10, -ph);
        const poh = 14 - ph;
        const oh = Math.pow(10, -poh);
        return [
          { label: '[H⁺]', value: `${fmtSci(h, 4)} mol/L`, highlight: true },
          { label: '[OH⁻]', value: `${fmtSci(oh, 4)} mol/L` },
          { label: 'pOH', value: fmt(poh, 4) },
        ];
      }
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. pOH Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'poh-calculator',
    name: 'pOH Calculator',
    description: 'Calculate pOH from hydroxide ion concentration [OH⁻] or find [OH⁻] from pOH. Uses pOH = -log₁₀[OH⁻] with pH + pOH = 14 at 25°C.',
    keywords: ['pOH calculator', 'basicity', 'hydroxide ion', 'pOH formula', 'base strength', 'pOH from concentration', 'alkaline solution', 'OH- concentration'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'mode', label: 'Calculation Mode', type: 'select', options: [
        { label: 'From [OH⁻] to pOH', value: 'oh_to_poh' },
        { label: 'From pOH to [OH⁻]', value: 'poh_to_oh' },
      ], default: 'oh_to_poh' },
      { id: 'oh_conc', label: 'Hydroxide Ion Concentration [OH⁻]', type: 'number', default: 0.0001, min: 0, step: 0.00001, suffix: 'mol/L' },
      { id: 'poh_value', label: 'pOH Value', type: 'number', default: 4, min: 0, max: 14, step: 0.01 },
    ],
    compute: (inputs) => {
      const mode = String(inputs.mode || 'oh_to_poh');
      if (mode === 'oh_to_poh') {
        const oh = Number(inputs.oh_conc) || 0;
        if (oh <= 0) return [{ label: 'Error', value: 'Concentration must be positive' }];
        const poh = -Math.log10(oh);
        const ph = 14 - poh;
        const h = Math.pow(10, -ph);
        return [
          { label: 'pOH', value: fmt(poh, 4), highlight: true },
          { label: 'pH', value: fmt(ph, 4) },
          { label: '[H⁺]', value: `${fmtSci(h, 4)} mol/L` },
          { label: 'Acid/Base', value: ph < 7 ? 'Acidic' : ph > 7 ? 'Basic' : 'Neutral' },
        ];
      } else {
        const poh = Number(inputs.poh_value);
        if (poh < 0 || poh > 14) return [{ label: 'Error', value: 'pOH must be between 0 and 14' }];
        const oh = Math.pow(10, -poh);
        const ph = 14 - poh;
        const h = Math.pow(10, -ph);
        return [
          { label: '[OH⁻]', value: `${fmtSci(oh, 4)} mol/L`, highlight: true },
          { label: '[H⁺]', value: `${fmtSci(h, 4)} mol/L` },
          { label: 'pH', value: fmt(ph, 4) },
        ];
      }
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 6. Ideal Gas Law Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'ideal-gas-law-calculator',
    name: 'Ideal Gas Law Calculator',
    description: 'Solve the ideal gas equation PV = nRT for pressure, volume, moles, or temperature. Uses R = 0.08206 L·atm/(mol·K) or 8.314 J/(mol·K).',
    keywords: ['ideal gas law', 'PV=nRT', 'gas pressure', 'gas volume', 'ideal gas calculator', 'molar gas volume', 'gas constant', 'universal gas equation'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'solveFor', label: 'Solve For', type: 'select', options: [
        { label: 'Pressure (P)', value: 'P' },
        { label: 'Volume (V)', value: 'V' },
        { label: 'Moles (n)', value: 'n' },
        { label: 'Temperature (T)', value: 'T' },
      ], default: 'P' },
      { id: 'pressure', label: 'Pressure (P)', type: 'number', default: 1, min: 0, suffix: 'atm' },
      { id: 'volume', label: 'Volume (V)', type: 'number', default: 22.414, min: 0, suffix: 'L' },
      { id: 'moles', label: 'Moles (n)', type: 'number', default: 1, min: 0, suffix: 'mol' },
      { id: 'temperature', label: 'Temperature (T)', type: 'number', default: 273.15, min: 0, suffix: 'K' },
    ],
    compute: (inputs) => {
      const solveFor = String(inputs.solveFor || 'P');
      const P = Number(inputs.pressure) || 0;
      const V = Number(inputs.volume) || 0;
      const n = Number(inputs.moles) || 0;
      const T = Number(inputs.temperature) || 0;
      const R = 0.08206; // L·atm/(mol·K)

      if (solveFor === 'P') {
        if (V <= 0 || n <= 0 || T <= 0) return [{ label: 'Error', value: 'V, n, and T must be positive' }];
        const result = (n * R * T) / V;
        return [
          { label: 'Pressure (P)', value: `${fmt(result, 4)} atm`, highlight: true },
          { label: 'Pressure (kPa)', value: `${fmt(result * 101.325, 4)} kPa` },
        ];
      }
      if (solveFor === 'V') {
        if (P <= 0 || n <= 0 || T <= 0) return [{ label: 'Error', value: 'P, n, and T must be positive' }];
        const result = (n * R * T) / P;
        return [
          { label: 'Volume (V)', value: `${fmt(result, 4)} L`, highlight: true },
          { label: 'Volume (mL)', value: `${fmt(result * 1000, 4)} mL` },
        ];
      }
      if (solveFor === 'n') {
        if (P <= 0 || V <= 0 || T <= 0) return [{ label: 'Error', value: 'P, V, and T must be positive' }];
        const result = (P * V) / (R * T);
        return [
          { label: 'Moles (n)', value: `${fmt(result, 6)} mol`, highlight: true },
          { label: 'Molecules', value: `${fmtSci(result * 6.022e23, 4)}` },
        ];
      }
      // T
      if (P <= 0 || V <= 0 || n <= 0) return [{ label: 'Error', value: 'P, V, and n must be positive' }];
      const result = (P * V) / (n * R);
      return [
        { label: 'Temperature (T)', value: `${fmt(result, 4)} K`, highlight: true },
        { label: 'Temperature (°C)', value: `${fmt(result - 273.15, 4)} °C` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 7. Boyle's Law Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'boyles-law-calculator',
    name: "Boyle's Law Calculator",
    description: "Calculate pressure-volume relationships at constant temperature using Boyle's Law: P₁V₁ = P₂V₂. Find any missing variable for an ideal gas isothermal process.",
    keywords: ["Boyle's law", 'pressure volume', 'isothermal process', 'P1V1=P2V2', 'gas compression', 'gas expansion', 'inverse pressure volume', 'Mariotte law'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'p1', label: 'Initial Pressure (P₁)', type: 'number', default: 1, min: 0, suffix: 'atm' },
      { id: 'v1', label: 'Initial Volume (V₁)', type: 'number', default: 10, min: 0, suffix: 'L' },
      { id: 'p2', label: 'Final Pressure (P₂)', type: 'number', default: 2, min: 0, suffix: 'atm' },
      { id: 'v2', label: 'Final Volume (V₂)', type: 'number', default: 0, min: 0, suffix: 'L', placeholder: 'Leave 0 to solve' },
    ],
    compute: (inputs) => {
      const p1 = Number(inputs.p1) || 0;
      const v1 = Number(inputs.v1) || 0;
      const p2 = Number(inputs.p2) || 0;
      const v2 = Number(inputs.v2) || 0;

      if (v2 === 0 && p1 > 0 && v1 > 0 && p2 > 0) {
        const result = (p1 * v1) / p2;
        return [
          { label: 'Final Volume (V₂)', value: `${fmt(result, 4)} L`, highlight: true },
          { label: 'Verification', value: `P₁V₁ = ${fmt(p1 * v1, 4)}, P₂V₂ = ${fmt(p2 * result, 4)}` },
        ];
      }
      if (p2 === 0 && p1 > 0 && v1 > 0 && v2 > 0) {
        const result = (p1 * v1) / v2;
        return [
          { label: 'Final Pressure (P₂)', value: `${fmt(result, 4)} atm`, highlight: true },
        ];
      }
      if (v1 === 0 && p1 > 0 && p2 > 0 && v2 > 0) {
        const result = (p2 * v2) / p1;
        return [{ label: 'Initial Volume (V₁)', value: `${fmt(result, 4)} L`, highlight: true }];
      }
      if (p1 === 0 && v1 > 0 && p2 > 0 && v2 > 0) {
        const result = (p2 * v2) / v1;
        return [{ label: 'Initial Pressure (P₁)', value: `${fmt(result, 4)} atm`, highlight: true }];
      }
      return [{ label: 'Error', value: 'Provide at least 3 of the 4 values' }];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 8. Charles's Law Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'charles-law-calculator',
    name: "Charles's Law Calculator",
    description: "Calculate volume-temperature relationships at constant pressure using Charles's Law: V₁/T₁ = V₂/T₂. Temperature must be in Kelvin.",
    keywords: ["Charles's law", 'volume temperature', 'isobaric process', 'V1/T1=V2/T2', 'gas thermal expansion', 'constant pressure', 'V-T relationship', 'Gay-Lussac law'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'v1', label: 'Initial Volume (V₁)', type: 'number', default: 10, min: 0, suffix: 'L' },
      { id: 't1', label: 'Initial Temperature (T₁)', type: 'number', default: 273.15, min: 0, suffix: 'K' },
      { id: 'v2', label: 'Final Volume (V₂)', type: 'number', default: 0, min: 0, suffix: 'L', placeholder: 'Leave 0 to solve' },
      { id: 't2', label: 'Final Temperature (T₂)', type: 'number', default: 373.15, min: 0, suffix: 'K' },
    ],
    compute: (inputs) => {
      const v1 = Number(inputs.v1) || 0;
      const t1 = Number(inputs.t1) || 0;
      const v2 = Number(inputs.v2) || 0;
      const t2 = Number(inputs.t2) || 0;

      if (v2 === 0 && v1 > 0 && t1 > 0 && t2 > 0) {
        const result = (v1 * t2) / t1;
        return [
          { label: 'Final Volume (V₂)', value: `${fmt(result, 4)} L`, highlight: true },
          { label: 'Volume Change', value: `${fmt(result - v1, 4)} L` },
        ];
      }
      if (t2 === 0 && v1 > 0 && t1 > 0 && v2 > 0) {
        const result = (v2 * t1) / v1;
        return [
          { label: 'Final Temperature (T₂)', value: `${fmt(result, 4)} K`, highlight: true },
          { label: 'In °C', value: `${fmt(result - 273.15, 4)} °C` },
        ];
      }
      if (v1 === 0 && t1 > 0 && v2 > 0 && t2 > 0) {
        const result = (v2 * t1) / t2;
        return [{ label: 'Initial Volume (V₁)', value: `${fmt(result, 4)} L`, highlight: true }];
      }
      if (t1 === 0 && v1 > 0 && v2 > 0 && t2 > 0) {
        const result = (v1 * t2) / v2;
        return [{ label: 'Initial Temperature (T₁)', value: `${fmt(result, 4)} K`, highlight: true }];
      }
      return [{ label: 'Error', value: 'Provide at least 3 of the 4 values (with T > 0)' }];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 9. Avogadro's Number Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'avogadro-calculator',
    name: "Avogadro's Number Calculator",
    description: "Convert between moles and number of molecules/atoms using Avogadro's number (6.022 × 10²³). Also converts between mass, moles, and molecules.",
    keywords: ["Avogadro's number", 'mole conversion', '6.022e23', 'molecules to moles', 'moles to molecules', 'mole particle conversion', 'Avogadro constant', 'particles per mole'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'mode', label: 'Conversion Mode', type: 'select', options: [
        { label: 'Moles → Molecules', value: 'mol_to_mol' },
        { label: 'Molecules → Moles', value: 'mol_to_mol_rev' },
        { label: 'Mass → Moles (need molar mass)', value: 'mass_to_mol' },
        { label: 'Moles → Mass (need molar mass)', value: 'mol_to_mass' },
      ], default: 'mol_to_mol' },
      { id: 'moles', label: 'Moles', type: 'number', default: 1, min: 0, suffix: 'mol' },
      { id: 'molecules', label: 'Number of Molecules', type: 'number', default: 6.022e23, min: 0 },
      { id: 'mass', label: 'Mass', type: 'number', default: 18, min: 0, suffix: 'g' },
      { id: 'molarMass', label: 'Molar Mass', type: 'number', default: 18.015, min: 0, suffix: 'g/mol' },
    ],
    compute: (inputs) => {
      const mode = String(inputs.mode || 'mol_to_mol');
      const NA = 6.02214076e23;

      if (mode === 'mol_to_mol') {
        const n = Number(inputs.moles) || 0;
        return [
          { label: 'Molecules', value: fmtSci(n * NA, 4), highlight: true },
          { label: 'Atoms/Particles', value: fmtSci(n * NA, 4) },
        ];
      }
      if (mode === 'mol_to_mol_rev') {
        const mol = Number(inputs.molecules) || 0;
        const result = mol / NA;
        return [
          { label: 'Moles', value: `${fmtSci(result, 6)} mol`, highlight: true },
        ];
      }
      if (mode === 'mass_to_mol') {
        const mass = Number(inputs.mass) || 0;
        const mm = Number(inputs.molarMass) || 0;
        if (mm <= 0) return [{ label: 'Error', value: 'Molar mass must be positive' }];
        const n = mass / mm;
        return [
          { label: 'Moles', value: `${fmt(n, 6)} mol`, highlight: true },
          { label: 'Molecules', value: fmtSci(n * NA, 4) },
        ];
      }
      // mol_to_mass
      const n = Number(inputs.moles) || 0;
      const mm = Number(inputs.molarMass) || 0;
      return [
        { label: 'Mass', value: `${fmt(n * mm, 4)} g`, highlight: true },
        { label: 'Molecules', value: fmtSci(n * NA, 4) },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 10. Stoichiometry Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'stoichiometry-calculator',
    name: 'Stoichiometry Calculator',
    description: 'Calculate reaction stoichiometry from mole ratios. Enter known and unknown species mole amounts and their balanced coefficient ratio to find the unknown quantity.',
    keywords: ['stoichiometry', 'reaction yield', 'mole ratio', 'limiting reactant', 'stoichiometric calculation', 'balanced equation ratio', 'chemical reaction calculator', 'reaction stoichiometry'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'knownMoles', label: 'Known Species Moles', type: 'number', default: 2, min: 0, suffix: 'mol' },
      { id: 'knownCoeff', label: 'Known Species Coefficient', type: 'number', default: 1, min: 1 },
      { id: 'unknownCoeff', label: 'Unknown Species Coefficient', type: 'number', default: 2, min: 1 },
    ],
    compute: (inputs) => {
      const knownMoles = Number(inputs.knownMoles) || 0;
      const knownCoeff = Number(inputs.knownCoeff) || 1;
      const unknownCoeff = Number(inputs.unknownCoeff) || 1;
      if (knownCoeff <= 0) return [{ label: 'Error', value: 'Known coefficient must be positive' }];

      const unknownMoles = knownMoles * (unknownCoeff / knownCoeff);
      const ratio = unknownCoeff / knownCoeff;
      return [
        { label: 'Unknown Species Moles', value: `${fmt(unknownMoles, 6)} mol`, highlight: true },
        { label: 'Mole Ratio', value: `${knownCoeff} : ${unknownCoeff} = ${fmt(ratio, 6)}` },
        { label: 'Molecules of Unknown', value: fmtSci(unknownMoles * 6.022e23, 4) },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 11. Percent Yield Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'yield-calculator',
    name: 'Percent Yield Calculator',
    description: 'Calculate percent yield from actual yield and theoretical yield. Percent yield = (actual / theoretical) × 100%. Essential for evaluating reaction efficiency.',
    keywords: ['percent yield', 'actual yield', 'theoretical yield', 'reaction efficiency', 'yield calculation', 'synthesis yield', 'product yield', 'experimental yield'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'actual', label: 'Actual Yield', type: 'number', default: 4.5, min: 0, suffix: 'g' },
      { id: 'theoretical', label: 'Theoretical Yield', type: 'number', default: 5.0, min: 0, suffix: 'g' },
    ],
    compute: (inputs) => {
      const actual = Number(inputs.actual) || 0;
      const theoretical = Number(inputs.theoretical) || 0;
      if (theoretical <= 0) return [{ label: 'Error', value: 'Theoretical yield must be positive' }];
      const pct = (actual / theoretical) * 100;
      return [
        { label: 'Percent Yield', value: `${fmt(pct, 2)}%`, highlight: true },
        { label: 'Yield Fraction', value: fmt(actual / theoretical, 6) },
        { label: 'Lost Product', value: `${fmt(theoretical - actual, 4)} g` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 12. Electron Configuration Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'electron-configuration-calculator',
    name: 'Electron Configuration Calculator',
    description: 'Generate the ground-state electron configuration for any element by atomic number (1–118). Follows the Aufbau principle, Hund\'s rule, and shows noble gas shorthand.',
    keywords: ['electron configuration', 'orbital notation', 'aufbau principle', 'electron arrangement', 'ground state configuration', 'noble gas shorthand', 'orbital filling', 'quantum numbers'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'atomicNumber', label: 'Atomic Number (Z)', type: 'number', default: 26, min: 1, max: 118, step: 1 },
    ],
    compute: (inputs) => {
      const z = Math.round(Number(inputs.atomicNumber) || 1);
      if (z < 1 || z > 118) return [{ label: 'Error', value: 'Atomic number must be 1–118' }];

      const full = electronConfig(z);
      const noble = electronConfigNoble(z);

      // Count valence electrons (outermost shell)
      const shells: Record<number, number> = {};
      const parts = full.split(' ');
      for (const part of parts) {
        const match = part.match(/^(\d)([spdf])(\d+)$/);
        if (match) {
          const shell = parseInt(match[1]);
          shells[shell] = (shells[shell] || 0) + parseInt(match[3]);
        }
      }
      const maxShell = Math.max(...Object.keys(shells).map(Number));
      const valence = shells[maxShell] || 0;

      return [
        { label: 'Full Configuration', value: full, highlight: true },
        { label: 'Noble Gas Notation', value: noble },
        { label: 'Total Electrons', value: z },
        { label: 'Valence Shell', value: `n = ${maxShell}, ${valence} electrons` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 13. Enthalpy Calculator (Hess's Law)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'enthalpy-calculator',
    name: 'Enthalpy Change Calculator',
    description: "Calculate enthalpy change (ΔH) using Hess's Law from the sum of product enthalpies minus reactant enthalpies. ΔH = ΣH(products) - ΣH(reactants).",
    keywords: ['enthalpy calculator', 'heat of reaction', "Hess's law", 'enthalpy change', 'ΔH', 'thermodynamic enthalpy', 'standard enthalpy', 'reaction enthalpy', 'heat absorbed released'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'hProducts', label: 'Sum of Product Enthalpies (ΣH_products)', type: 'number', default: -970, suffix: 'kJ/mol' },
      { id: 'hReactants', label: 'Sum of Reactant Enthalpies (ΣH_reactants)', type: 'number', default: -500, suffix: 'kJ/mol' },
    ],
    compute: (inputs) => {
      const hp = Number(inputs.hProducts) || 0;
      const hr = Number(inputs.hReactants) || 0;
      const dH = hp - hr;
      return [
        { label: 'ΔH (Enthalpy Change)', value: `${fmt(dH, 4)} kJ/mol`, highlight: true },
        { label: 'Reaction Type', value: dH < 0 ? 'Exothermic (releases heat)' : dH > 0 ? 'Endothermic (absorbs heat)' : 'Thermoneutral' },
        { label: 'Energy Released/Absorbed', value: `${fmt(Math.abs(dH), 4)} kJ per mol reaction` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 14. Gibbs Free Energy Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'gibbs-free-energy-calculator',
    name: 'Gibbs Free Energy Calculator',
    description: 'Calculate Gibbs free energy change: ΔG = ΔH - TΔS. Determines reaction spontaneity at a given temperature. Negative ΔG means spontaneous.',
    keywords: ['Gibbs free energy', 'spontaneity', 'thermodynamics', 'ΔG = ΔH - TΔS', 'Gibbs energy', 'spontaneous reaction', 'free energy change', 'reaction spontaneity predictor'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'dH', label: 'Enthalpy Change (ΔH)', type: 'number', default: -92.2, suffix: 'kJ/mol' },
      { id: 'temperature', label: 'Temperature (T)', type: 'number', default: 298.15, min: 0, suffix: 'K' },
      { id: 'dS', label: 'Entropy Change (ΔS)', type: 'number', default: -0.199, suffix: 'kJ/(mol·K)' },
    ],
    compute: (inputs) => {
      const dH = Number(inputs.dH) || 0;
      const T = Number(inputs.temperature) || 0;
      const dS = Number(inputs.dS) || 0;
      if (T <= 0) return [{ label: 'Error', value: 'Temperature must be positive (Kelvin)' }];

      const dG = dH - T * dS;
      const equilibriumTemp = dS !== 0 ? dH / dS : Infinity;

      return [
        { label: 'ΔG (Gibbs Free Energy)', value: `${fmt(dG, 4)} kJ/mol`, highlight: true },
        { label: 'Spontaneity', value: dG < 0 ? 'Spontaneous (ΔG < 0)' : dG > 0 ? 'Non-spontaneous (ΔG > 0)' : 'At equilibrium (ΔG = 0)' },
        { label: 'TΔS Contribution', value: `${fmt(T * dS, 4)} kJ/mol` },
        ...(dS !== 0 ? [{ label: 'Equilibrium Temperature', value: `${fmt(equilibriumTemp, 2)} K` }] : []),
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 15. Reaction Rate Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'reaction-rate-calculator',
    name: 'Reaction Rate Law Calculator',
    description: 'Calculate reaction rate using the rate law: Rate = k[A]ᵐ[B]ⁿ. Supports first-order, second-order, and general rate law calculations with any number of reactants.',
    keywords: ['reaction rate', 'rate constant', 'rate law', 'rate equation', 'first order', 'second order', 'reaction kinetics', 'order of reaction', 'rate expression'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'k', label: 'Rate Constant (k)', type: 'number', default: 0.05, min: 0, step: 0.001 },
      { id: 'concA', label: 'Concentration [A]', type: 'number', default: 2, min: 0, suffix: 'M' },
      { id: 'orderA', label: 'Order with respect to A (m)', type: 'number', default: 1, min: 0, step: 1 },
      { id: 'concB', label: 'Concentration [B]', type: 'number', default: 3, min: 0, suffix: 'M' },
      { id: 'orderB', label: 'Order with respect to B (n)', type: 'number', default: 0, min: 0, step: 1 },
    ],
    compute: (inputs) => {
      const k = Number(inputs.k) || 0;
      const a = Number(inputs.concA) || 0;
      const m = Number(inputs.orderA) || 0;
      const b = Number(inputs.concB) || 0;
      const n = Number(inputs.orderB) || 0;

      const rate = k * Math.pow(a, m) * Math.pow(b, n);
      const overallOrder = m + n;

      return [
        { label: 'Reaction Rate', value: `${fmtSci(rate, 4)} M/s`, highlight: true },
        { label: 'Rate Law', value: `Rate = k[A]^${m}${n > 0 ? `[B]^${n}` : ''}` },
        { label: 'Overall Order', value: overallOrder },
        { label: 'Rate Constant (k)', value: fmt(k, 6) },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 16. Oxidation State Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'oxidation-state-calculator',
    name: 'Oxidation State Calculator',
    description: 'Calculate the oxidation state of a specific element in a compound when you know the oxidation states of all other elements. Based on the rule that the sum of oxidation states equals the overall charge.',
    keywords: ['oxidation state', 'oxidation number', 'redox', 'oxidation state rules', 'element oxidation', 'ionic charge', 'compound oxidation', 'redox chemistry'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'totalCharge', label: 'Overall Compound Charge', type: 'number', default: 0, step: 1 },
      { id: 'knownSum', label: 'Sum of Known Oxidation States', type: 'number', default: -8, step: 0.5 },
      { id: 'unknownCount', label: 'Number of Atoms with Unknown OS', type: 'number', default: 2, min: 1, step: 1 },
    ],
    compute: (inputs) => {
      const charge = Number(inputs.totalCharge) || 0;
      const knownSum = Number(inputs.knownSum) || 0;
      const count = Math.round(Number(inputs.unknownCount) || 1);
      if (count <= 0) return [{ label: 'Error', value: 'Must have at least 1 atom' }];

      const totalUnknown = charge - knownSum;
      const perAtom = totalUnknown / count;

      return [
        { label: 'Oxidation State per Atom', value: fmt(perAtom, 2), highlight: true },
        { label: 'Total Oxidation Contribution', value: fmt(totalUnknown, 2) },
        { label: 'Verification', value: `Known sum (${fmt(knownSum, 2)}) + ${count} × (${fmt(perAtom, 2)}) = ${fmt(knownSum + totalUnknown, 2)} = charge (${fmt(charge, 2)})` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 17. Solubility Product (Ksp) Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'solubility-calculator',
    name: 'Solubility Product (Ksp) Calculator',
    description: 'Calculate the solubility product constant Ksp from ion concentrations, or determine molar solubility from Ksp. Supports different stoichiometries: AB, AB₂, A₂B types.',
    keywords: ['solubility product', 'Ksp', 'precipitation', 'molar solubility', 'ion product', 'dissolution equilibrium', 'sparingly soluble', 'Ksp calculation'],
    category: 'chemistry',
    icon: 'FlaskConical',
    fields: [
      { id: 'mode', label: 'Calculation Mode', type: 'select', options: [
        { label: 'From Ion Concentrations → Ksp', value: 'ions_to_ksp' },
        { label: 'From Ksp → Molar Solubility', value: 'ksp_to_sol' },
      ], default: 'ions_to_ksp' },
      { id: 'compoundType', label: 'Compound Type', type: 'select', options: [
        { label: 'AB type (e.g. AgCl)', value: 'AB' },
        { label: 'AB₂ type (e.g. CaF₂)', value: 'AB2' },
        { label: 'A₂B type (e.g. Ag₂CrO₄)', value: 'A2B' },
      ], default: 'AB' },
      { id: 'concA', label: 'Cation Concentration [A]', type: 'number', default: 1.3e-5, min: 0, suffix: 'M' },
      { id: 'concB', label: 'Anion Concentration [B]', type: 'number', default: 1.3e-5, min: 0, suffix: 'M' },
      { id: 'ksp', label: 'Ksp Value', type: 'number', default: 1.8e-10, min: 0 },
    ],
    compute: (inputs) => {
      const mode = String(inputs.mode || 'ions_to_ksp');
      const type = String(inputs.compoundType || 'AB');

      if (mode === 'ions_to_ksp') {
        const a = Number(inputs.concA) || 0;
        const b = Number(inputs.concB) || 0;
        let ksp: number;
        if (type === 'AB') ksp = a * b;
        else if (type === 'AB2') ksp = a * b * b;
        else ksp = a * a * b; // A2B
        return [
          { label: 'Ksp', value: fmtSci(ksp, 4), highlight: true },
          { label: 'pKsp', value: fmt(-Math.log10(ksp), 4) },
        ];
      }

      // ksp_to_sol
      const ksp = Number(inputs.ksp) || 0;
      if (ksp <= 0) return [{ label: 'Error', value: 'Ksp must be positive' }];
      let s: number;
      if (type === 'AB') s = Math.sqrt(ksp);
      else if (type === 'AB2') s = Math.cbrt(ksp / 4);
      else s = Math.cbrt(ksp / 4); // A2B: Ksp = 4s³
      return [
        { label: 'Molar Solubility (s)', value: `${fmtSci(s, 4)} mol/L`, highlight: true },
        ...(type === 'AB' ? [
          { label: '[A⁺] = [B⁻]', value: `${fmtSci(s, 4)} M` },
        ] : type === 'AB2' ? [
          { label: '[A²⁺]', value: `${fmtSci(s, 4)} M` },
          { label: '[B⁻]', value: `${fmtSci(2 * s, 4)} M` },
        ] : [
          { label: '[A⁺]', value: `${fmtSci(2 * s, 4)} M` },
          { label: '[B²⁻]', value: `${fmtSci(s, 4)} M` },
        ]),
      ];
    },
  },

];
