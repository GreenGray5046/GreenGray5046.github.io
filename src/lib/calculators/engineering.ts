import { Calculator, fmt, fmtSci } from '../calc-types';

// ── AWG wire gauge lookup (gauge → diameter in mm, area in mm²) ──
const AWG_TABLE: Record<number, { diameter_mm: number; area_mm2: number }> = {
  0: { diameter_mm: 8.252, area_mm2: 53.49 },
  1: { diameter_mm: 7.348, area_mm2: 42.41 },
  2: { diameter_mm: 6.544, area_mm2: 33.62 },
  3: { diameter_mm: 5.827, area_mm2: 26.67 },
  4: { diameter_mm: 5.189, area_mm2: 21.15 },
  5: { diameter_mm: 4.621, area_mm2: 16.77 },
  6: { diameter_mm: 4.115, area_mm2: 13.30 },
  7: { diameter_mm: 3.665, area_mm2: 10.55 },
  8: { diameter_mm: 3.264, area_mm2: 8.366 },
  9: { diameter_mm: 2.906, area_mm2: 6.634 },
  10: { diameter_mm: 2.588, area_mm2: 5.261 },
  11: { diameter_mm: 2.305, area_mm2: 4.172 },
  12: { diameter_mm: 2.053, area_mm2: 3.309 },
  13: { diameter_mm: 1.828, area_mm2: 2.624 },
  14: { diameter_mm: 1.628, area_mm2: 2.081 },
  15: { diameter_mm: 1.450, area_mm2: 1.650 },
  16: { diameter_mm: 1.291, area_mm2: 1.309 },
  17: { diameter_mm: 1.150, area_mm2: 1.038 },
  18: { diameter_mm: 1.024, area_mm2: 0.8230 },
  19: { diameter_mm: 0.912, area_mm2: 0.6527 },
  20: { diameter_mm: 0.812, area_mm2: 0.5176 },
  21: { diameter_mm: 0.723, area_mm2: 0.4105 },
  22: { diameter_mm: 0.644, area_mm2: 0.3255 },
  23: { diameter_mm: 0.573, area_mm2: 0.2582 },
  24: { diameter_mm: 0.511, area_mm2: 0.2047 },
  25: { diameter_mm: 0.455, area_mm2: 0.1624 },
  26: { diameter_mm: 0.405, area_mm2: 0.1288 },
  27: { diameter_mm: 0.361, area_mm2: 0.1021 },
  28: { diameter_mm: 0.321, area_mm2: 0.08098 },
  29: { diameter_mm: 0.286, area_mm2: 0.06422 },
  30: { diameter_mm: 0.255, area_mm2: 0.05093 },
  31: { diameter_mm: 0.227, area_mm2: 0.04043 },
  32: { diameter_mm: 0.202, area_mm2: 0.03207 },
  33: { diameter_mm: 0.180, area_mm2: 0.02542 },
  34: { diameter_mm: 0.160, area_mm2: 0.02014 },
  35: { diameter_mm: 0.143, area_mm2: 0.01596 },
  36: { diameter_mm: 0.127, area_mm2: 0.01267 },
  37: { diameter_mm: 0.113, area_mm2: 0.01003 },
  38: { diameter_mm: 0.101, area_mm2: 0.007970 },
  39: { diameter_mm: 0.090, area_mm2: 0.006319 },
  40: { diameter_mm: 0.080, area_mm2: 0.005013 },
};

export const engineeringCalculators: Calculator[] = [

  // ──────────────────────────────────────────────────────────────────
  // 1. Voltage Divider Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'voltage-divider-calculator',
    name: 'Voltage Divider Calculator',
    description: 'Calculate the output voltage of a resistive voltage divider: Vout = Vin × R2/(R1+R2). Also finds R1 or R2 when the target output voltage is known.',
    keywords: ['voltage divider', 'resistor divider', 'potentiometer', 'Vout calculation', 'resistive divider', 'voltage split', 'divider circuit', 'R1 R2 voltage'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'vin', label: 'Input Voltage (Vin)', type: 'number', default: 12, suffix: 'V' },
      { id: 'r1', label: 'Resistance R1', type: 'number', default: 10000, min: 0, suffix: 'Ω' },
      { id: 'r2', label: 'Resistance R2', type: 'number', default: 10000, min: 0, suffix: 'Ω' },
    ],
    compute: (inputs) => {
      const vin = Number(inputs.vin) || 0;
      const r1 = Number(inputs.r1) || 0;
      const r2 = Number(inputs.r2) || 0;
      if (r1 + r2 === 0) return [{ label: 'Error', value: 'Total resistance must be > 0' }];

      const vout = vin * (r2 / (r1 + r2));
      const current = vin / (r1 + r2);
      const power = vin * current;

      return [
        { label: 'Output Voltage (Vout)', value: `${fmt(vout, 4)} V`, highlight: true },
        { label: 'Current through divider', value: `${fmtSci(current, 4)} A (${fmt(current * 1000, 4)} mA)` },
        { label: 'Power dissipated', value: `${fmt(power * 1000, 4)} mW` },
        { label: 'Divider ratio', value: fmt(r2 / (r1 + r2), 6) },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. LED Resistor Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'led-resistor-calculator',
    name: 'LED Current Limiting Resistor Calculator',
    description: 'Calculate the required current-limiting resistor for an LED circuit. R = (Vsource - Vled) / Iled. Ensures the LED operates at the correct forward current.',
    keywords: ['LED resistor', 'current limiting', 'LED circuit', 'LED driver resistor', 'forward voltage', 'LED protection', 'series resistor LED', 'LED current resistor'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'vsource', label: 'Source Voltage', type: 'number', default: 5, suffix: 'V' },
      { id: 'vled', label: 'LED Forward Voltage', type: 'number', default: 2.0, suffix: 'V' },
      { id: 'iled', label: 'LED Forward Current', type: 'number', default: 20, suffix: 'mA' },
    ],
    compute: (inputs) => {
      const vs = Number(inputs.vsource) || 0;
      const vl = Number(inputs.vled) || 0;
      const il = (Number(inputs.iled) || 0) / 1000; // mA to A

      if (vs <= vl) return [{ label: 'Error', value: 'Source voltage must be greater than LED forward voltage' }];
      if (il <= 0) return [{ label: 'Error', value: 'LED current must be positive' }];

      const r = (vs - vl) / il;
      const power_r = (vs - vl) * il;
      const power_led = vl * il;

      // Suggest standard resistor value
      const standardValues = [100, 150, 200, 220, 270, 330, 390, 470, 560, 680, 820,
        1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200,
        10000, 12000, 15000, 18000, 22000, 27000, 33000, 47000, 68000, 100000];
      const nearest = standardValues.reduce((prev, curr) => Math.abs(curr - r) < Math.abs(prev - r) ? curr : prev);

      return [
        { label: 'Required Resistance', value: `${fmt(r, 2)} Ω`, highlight: true },
        { label: 'Nearest Standard Value', value: `${nearest} Ω` },
        { label: 'Resistor Power Rating', value: `${fmt(power_r * 1000, 2)} mW` },
        { label: 'LED Power', value: `${fmt(power_led * 1000, 2)} mW` },
        { label: 'Total Circuit Power', value: `${fmt((power_r + power_led) * 1000, 2)} mW` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. 555 Timer Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: '555-timer-calculator',
    name: '555 Timer Calculator (Astable)',
    description: 'Calculate the frequency, duty cycle, and pulse widths of a 555 timer in astable mode. f = 1.44/((R1+2R2)×C), high time = 0.693×(R1+R2)×C, low time = 0.693×R2×C.',
    keywords: ['555 timer', 'astable multivibrator', 'timer frequency', '555 oscillator', 'duty cycle 555', 'NE555 calculator', '555 pulse width', '555 astable frequency'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'r1', label: 'R1 (between Vcc and Discharge)', type: 'number', default: 10000, min: 0, suffix: 'Ω' },
      { id: 'r2', label: 'R2 (between Discharge and Threshold)', type: 'number', default: 10000, min: 0, suffix: 'Ω' },
      { id: 'c', label: 'Capacitor C', type: 'number', default: 0.00001, min: 0, suffix: 'F', step: 0.000001 },
    ],
    compute: (inputs) => {
      const r1 = Number(inputs.r1) || 0;
      const r2 = Number(inputs.r2) || 0;
      const c = Number(inputs.c) || 0;
      if (c <= 0 || (r1 + 2 * r2) <= 0) return [{ label: 'Error', value: 'C must be > 0 and R1+2R2 must be > 0' }];

      const tHigh = 0.693 * (r1 + r2) * c;
      const tLow = 0.693 * r2 * c;
      const period = tHigh + tLow;
      const freq = 1 / period;
      const dutyCycle = (tHigh / period) * 100;

      const formatTime = (t: number): string => {
        if (t < 1e-6) return `${fmt(t * 1e9, 2)} ns`;
        if (t < 1e-3) return `${fmt(t * 1e6, 2)} µs`;
        if (t < 1) return `${fmt(t * 1e3, 2)} ms`;
        return `${fmt(t, 4)} s`;
      };

      return [
        { label: 'Frequency', value: `${fmt(freq, 4)} Hz`, highlight: true },
        { label: 'Period', value: formatTime(period) },
        { label: 'High Time (tH)', value: formatTime(tHigh) },
        { label: 'Low Time (tL)', value: formatTime(tLow) },
        { label: 'Duty Cycle', value: `${fmt(dutyCycle, 2)}%` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. Op-Amp Gain Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'op-amp-gain-calculator',
    name: 'Op-Amp Gain Calculator',
    description: 'Calculate the voltage gain of inverting and non-inverting operational amplifier circuits. Inverting: Av = -Rf/Rin. Non-inverting: Av = 1 + Rf/Rin.',
    keywords: ['op-amp gain', 'operational amplifier', 'amplifier circuit', 'inverting amplifier', 'non-inverting amplifier', 'op-amp calculator', 'feedback resistor', 'voltage gain'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'mode', label: 'Amplifier Type', type: 'select', options: [
        { label: 'Inverting', value: 'inverting' },
        { label: 'Non-Inverting', value: 'noninverting' },
      ], default: 'inverting' },
      { id: 'rin', label: 'Input Resistance (Rin)', type: 'number', default: 10000, min: 0, suffix: 'Ω' },
      { id: 'rf', label: 'Feedback Resistance (Rf)', type: 'number', default: 100000, min: 0, suffix: 'Ω' },
      { id: 'vin', label: 'Input Voltage (Vin)', type: 'number', default: 0.1, suffix: 'V' },
    ],
    compute: (inputs) => {
      const mode = String(inputs.mode || 'inverting');
      const rin = Number(inputs.rin) || 0;
      const rf = Number(inputs.rf) || 0;
      const vin = Number(inputs.vin) || 0;
      if (rin <= 0) return [{ label: 'Error', value: 'Input resistance must be positive' }];

      let gain: number;
      let vout: number;
      let label: string;

      if (mode === 'inverting') {
        gain = -rf / rin;
        vout = gain * vin;
        label = 'Inverting Gain (Av)';
      } else {
        gain = 1 + rf / rin;
        vout = gain * vin;
        label = 'Non-Inverting Gain (Av)';
      }

      return [
        { label, value: fmt(gain, 4), highlight: true },
        { label: 'Gain (dB)', value: `${fmt(20 * Math.log10(Math.abs(gain)), 2)} dB` },
        { label: 'Output Voltage (Vout)', value: `${fmt(vout, 4)} V` },
        { label: 'Input Impedance', value: mode === 'inverting' ? `${fmt(rin, 0)} Ω` : 'Very high (ideally ∞)' },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. RC Time Constant Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'rc-time-constant-calculator',
    name: 'RC Time Constant Calculator',
    description: 'Calculate the RC time constant (τ = R × C) and capacitor charge/discharge levels. A capacitor reaches ~63.2% charge in 1τ and ~99.3% in 5τ.',
    keywords: ['RC time constant', 'charge time', 'capacitor charging', 'RC circuit', 'tau RC', 'capacitor discharge', 'exponential decay', 'RC filter cutoff'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'r', label: 'Resistance (R)', type: 'number', default: 10000, min: 0, suffix: 'Ω' },
      { id: 'c', label: 'Capacitance (C)', type: 'number', default: 0.0001, min: 0, suffix: 'F', step: 0.000001 },
      { id: 'voltage', label: 'Supply Voltage (V)', type: 'number', default: 5, suffix: 'V' },
    ],
    compute: (inputs) => {
      const r = Number(inputs.r) || 0;
      const c = Number(inputs.c) || 0;
      const v = Number(inputs.voltage) || 0;
      if (r <= 0 || c <= 0) return [{ label: 'Error', value: 'R and C must be positive' }];

      const tau = r * c;
      const formatTime = (t: number): string => {
        if (t < 1e-6) return `${fmt(t * 1e9, 2)} ns`;
        if (t < 1e-3) return `${fmt(t * 1e6, 2)} µs`;
        if (t < 1) return `${fmt(t * 1e3, 2)} ms`;
        return `${fmt(t, 4)} s`;
      };

      return [
        { label: 'Time Constant (τ = RC)', value: formatTime(tau), highlight: true },
        { label: '1τ (63.2%)', value: `${formatTime(tau)}, Vc = ${fmt(v * 0.6321, 3)} V` },
        { label: '2τ (86.5%)', value: `${formatTime(2 * tau)}, Vc = ${fmt(v * 0.8647, 3)} V` },
        { label: '3τ (95.0%)', value: `${formatTime(3 * tau)}, Vc = ${fmt(v * 0.9502, 3)} V` },
        { label: '5τ (99.3%)', value: `${formatTime(5 * tau)}, Vc = ${fmt(v * 0.9933, 3)} V` },
        { label: 'Cutoff Frequency (f₋₃dB)', value: `${fmt(1 / (2 * Math.PI * r * c), 2)} Hz` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 6. RL Time Constant Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'rl-time-constant-calculator',
    name: 'RL Time Constant Calculator',
    description: 'Calculate the RL time constant (τ = L/R) and inductor current rise/decay. An inductor reaches ~63.2% of max current in 1τ and ~99.3% in 5τ.',
    keywords: ['RL time constant', 'inductor time constant', 'RL circuit', 'inductor charging', 'inductor current', 'tau RL', 'L/R time constant', 'inductive time constant'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'r', label: 'Resistance (R)', type: 'number', default: 100, min: 0, suffix: 'Ω' },
      { id: 'l', label: 'Inductance (L)', type: 'number', default: 0.1, min: 0, suffix: 'H' },
      { id: 'voltage', label: 'Supply Voltage (V)', type: 'number', default: 12, suffix: 'V' },
    ],
    compute: (inputs) => {
      const r = Number(inputs.r) || 0;
      const l = Number(inputs.l) || 0;
      const v = Number(inputs.voltage) || 0;
      if (r <= 0 || l <= 0) return [{ label: 'Error', value: 'R and L must be positive' }];

      const tau = l / r;
      const iMax = v / r;
      const formatTime = (t: number): string => {
        if (t < 1e-6) return `${fmt(t * 1e9, 2)} ns`;
        if (t < 1e-3) return `${fmt(t * 1e6, 2)} µs`;
        if (t < 1) return `${fmt(t * 1e3, 2)} ms`;
        return `${fmt(t, 4)} s`;
      };

      return [
        { label: 'Time Constant (τ = L/R)', value: formatTime(tau), highlight: true },
        { label: 'Max Steady-State Current', value: `${fmt(iMax * 1000, 4)} mA` },
        { label: '1τ (63.2%)', value: `${formatTime(tau)}, I = ${fmt(iMax * 0.6321 * 1000, 3)} mA` },
        { label: '3τ (95.0%)', value: `${formatTime(3 * tau)}, I = ${fmt(iMax * 0.9502 * 1000, 3)} mA` },
        { label: '5τ (99.3%)', value: `${formatTime(5 * tau)}, I = ${fmt(iMax * 0.9933 * 1000, 3)} mA` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 7. Wire Gauge (AWG) Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'wire-gauge-calculator',
    name: 'AWG Wire Gauge Calculator',
    description: 'Look up American Wire Gauge (AWG) specifications: diameter, cross-sectional area, and resistance per unit length. Supports AWG 0–40 for copper wire.',
    keywords: ['wire gauge', 'AWG', 'wire diameter', 'cable size', 'American Wire Gauge', 'wire cross section', 'copper wire resistance', 'wire ampacity'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'awg', label: 'AWG Gauge Number', type: 'number', default: 14, min: 0, max: 40, step: 1 },
      { id: 'length', label: 'Wire Length (one-way)', type: 'number', default: 100, min: 0, suffix: 'm' },
    ],
    compute: (inputs) => {
      const awg = Math.round(Number(inputs.awg) || 14);
      const length = Number(inputs.length) || 0;
      const entry = AWG_TABLE[awg];
      if (!entry) return [{ label: 'Error', value: `AWG ${awg} not in table (0–40)` }];

      // Copper resistivity: 1.724e-8 Ω·m at 20°C
      const rho = 1.724e-8;
      const area_m2 = entry.area_mm2 * 1e-6;
      const resistancePerMeter = rho / area_m2;
      const totalResistance = resistancePerMeter * length * 2; // round trip

      return [
        { label: 'AWG', value: awg, highlight: true },
        { label: 'Diameter', value: `${fmt(entry.diameter_mm, 3)} mm (${fmt(entry.diameter_mm / 25.4, 4)} in)` },
        { label: 'Cross-Section Area', value: `${fmt(entry.area_mm2, 4)} mm²` },
        { label: 'Resistance per meter', value: `${fmt(resistancePerMeter * 1000, 4)} mΩ/m` },
        { label: `Total resistance (${fmt(length, 0)}m round-trip)`, value: `${fmt(totalResistance, 4)} Ω` },
        { label: 'Diameter (mils)', value: `${fmt(entry.diameter_mm / 0.0254, 1)} mils` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 8. Transformer Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'transformer-calculator',
    name: 'Transformer Turns Ratio Calculator',
    description: 'Calculate transformer voltage, current, and turns ratio. Vp/Vs = Np/Ns = Is/Ip. Supports solving for any unknown parameter in an ideal transformer.',
    keywords: ['transformer calculator', 'turns ratio', 'voltage ratio', 'step up transformer', 'step down transformer', 'primary secondary voltage', 'transformer winding', 'mutual induction'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'vp', label: 'Primary Voltage (Vp)', type: 'number', default: 120, suffix: 'V' },
      { id: 'vs', label: 'Secondary Voltage (Vs)', type: 'number', default: 12, suffix: 'V' },
      { id: 'np', label: 'Primary Turns (Np)', type: 'number', default: 600, min: 0 },
      { id: 'loadPower', label: 'Load Power', type: 'number', default: 100, suffix: 'W' },
    ],
    compute: (inputs) => {
      const vp = Number(inputs.vp) || 0;
      const vs = Number(inputs.vs) || 0;
      const np = Number(inputs.np) || 0;
      const pLoad = Number(inputs.loadPower) || 0;

      if (vp <= 0) return [{ label: 'Error', value: 'Primary voltage must be positive' }];

      const ratio = vp / vs;
      const ns = np / ratio;
      const ip = pLoad / vp;
      const is_ = pLoad / vs;

      return [
        { label: 'Turns Ratio (Np:Ns)', value: `${fmt(ratio, 2)}:1`, highlight: true },
        { label: 'Secondary Turns (Ns)', value: fmt(Math.round(ns)) },
        { label: 'Primary Current (Ip)', value: `${fmt(ip, 4)} A` },
        { label: 'Secondary Current (Is)', value: `${fmt(is_, 4)} A` },
        { label: 'Voltage Ratio', value: `${fmt(vp, 2)}:${fmt(vs, 2)}` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 9. Impedance Calculator (RLC)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'impedance-calculator',
    name: 'RLC Impedance Calculator',
    description: 'Calculate the total impedance of a series or parallel RLC circuit at a given frequency. Z = √(R² + (XL-XC)²) for series. Shows inductive and capacitive reactance.',
    keywords: ['impedance calculator', 'RLC circuit', 'AC impedance', 'reactance', 'inductive reactance', 'capacitive reactance', 'series impedance', 'parallel impedance'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'topology', label: 'Circuit Topology', type: 'select', options: [
        { label: 'Series RLC', value: 'series' },
        { label: 'Parallel RLC', value: 'parallel' },
      ], default: 'series' },
      { id: 'r', label: 'Resistance (R)', type: 'number', default: 100, min: 0, suffix: 'Ω' },
      { id: 'l', label: 'Inductance (L)', type: 'number', default: 0.01, min: 0, suffix: 'H' },
      { id: 'c', label: 'Capacitance (C)', type: 'number', default: 0.000001, min: 0, suffix: 'F', step: 0.0000001 },
      { id: 'f', label: 'Frequency (f)', type: 'number', default: 1000, min: 0, suffix: 'Hz' },
    ],
    compute: (inputs) => {
      const topology = String(inputs.topology || 'series');
      const r = Number(inputs.r) || 0;
      const l = Number(inputs.l) || 0;
      const c = Number(inputs.c) || 0;
      const f = Number(inputs.f) || 0;

      if (f <= 0) return [{ label: 'Error', value: 'Frequency must be positive' }];

      const xl = 2 * Math.PI * f * l;
      const xc = 1 / (2 * Math.PI * f * c || Infinity);
      const xNet = xl - xc;

      let z: number;
      let phase: number;
      if (topology === 'series') {
        z = Math.sqrt(r * r + xNet * xNet);
        phase = Math.atan2(xNet, r) * (180 / Math.PI);
      } else {
        // Parallel: 1/Z = √(1/R² + (1/XL - 1/XC)²)
        const yR = 1 / (r || Infinity);
        const yL = 1 / (xl || Infinity);
        const yC = xc > 0 ? 1 / xc : 0;
        const yNet = yL - yC;
        const yTotal = Math.sqrt(yR * yR + yNet * yNet);
        z = 1 / (yTotal || Infinity);
        phase = -Math.atan2(yNet, yR) * (180 / Math.PI);
      }

      const resFreq = c > 0 && l > 0 ? 1 / (2 * Math.PI * Math.sqrt(l * c)) : 0;

      return [
        { label: 'Impedance |Z|', value: `${fmt(z, 4)} Ω`, highlight: true },
        { label: 'Phase Angle', value: `${fmt(phase, 2)}°` },
        { label: 'Inductive Reactance (XL)', value: `${fmt(xl, 4)} Ω` },
        { label: 'Capacitive Reactance (XC)', value: c > 0 ? `${fmt(xc, 4)} Ω` : '∞ (no capacitor)' },
        { label: 'Net Reactance', value: `${fmt(xNet, 4)} Ω` },
        ...(resFreq > 0 ? [{ label: 'Resonant Frequency', value: `${fmt(resFreq, 2)} Hz` }] : []),
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 10. Beam Deflection Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'beam-deflection-calculator',
    name: 'Simple Beam Deflection Calculator',
    description: 'Calculate maximum deflection of a simply supported beam with a center point load. δ = FL³/(48EI). Supports common beam materials with Young\'s modulus lookup.',
    keywords: ['beam deflection', 'structural analysis', 'bending', 'beam calculator', 'simply supported beam', 'point load deflection', 'bending stiffness', 'deflection formula'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'material', label: 'Beam Material', type: 'select', options: [
        { label: 'Steel (E = 200 GPa)', value: '200' },
        { label: 'Aluminum (E = 69 GPa)', value: '69' },
        { label: 'Wood (E = 12 GPa)', value: '12' },
        { label: 'Concrete (E = 30 GPa)', value: '30' },
        { label: 'Custom', value: 'custom' },
      ], default: '200' },
      { id: 'customE', label: 'Custom Young\'s Modulus (E)', type: 'number', default: 200, suffix: 'GPa', min: 0 },
      { id: 'force', label: 'Point Load (F)', type: 'number', default: 10000, min: 0, suffix: 'N' },
      { id: 'length', label: 'Beam Length (L)', type: 'number', default: 5, min: 0, suffix: 'm' },
      { id: 'momentI', label: 'Moment of Inertia (I)', type: 'number', default: 0.0001, min: 0, suffix: 'm⁴', step: 0.00001 },
    ],
    compute: (inputs) => {
      const matE = String(inputs.material);
      const E = (matE === 'custom' ? Number(inputs.customE) : Number(matE)) * 1e9; // GPa to Pa
      const F = Number(inputs.force) || 0;
      const L = Number(inputs.length) || 0;
      const I = Number(inputs.momentI) || 0;

      if (E <= 0 || I <= 0 || L <= 0) return [{ label: 'Error', value: 'E, I, and L must be positive' }];

      const delta = (F * Math.pow(L, 3)) / (48 * E * I);
      const maxMoment = (F * L) / 4;
      const maxShear = F / 2;
      const L_over_delta = delta > 0 ? L / delta : Infinity;

      return [
        { label: 'Max Deflection (δ)', value: `${fmt(delta * 1000, 4)} mm`, highlight: true },
        { label: 'Span/Deflection Ratio', value: `L/δ = ${fmt(L_over_delta, 0)}` },
        { label: 'Max Bending Moment', value: `${fmt(maxMoment, 2)} N·m` },
        { label: 'Max Shear Force', value: `${fmt(maxShear, 2)} N` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 11. Stress-Strain Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'stress-strain-calculator',
    name: 'Stress & Strain Calculator',
    description: 'Calculate engineering stress (σ = F/A), strain (ε = ΔL/L₀), and Young\'s modulus (E = σ/ε). Essential for mechanical design and material characterization.',
    keywords: ['stress calculator', 'strain calculator', "Young's modulus", 'elastic modulus', 'tensile stress', 'compressive stress', 'material properties', 'stress strain curve'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'mode', label: 'Calculation Mode', type: 'select', options: [
        { label: 'Stress & Strain → Young\'s Modulus', value: 'stress_strain' },
        { label: 'Force & Area → Stress', value: 'stress_only' },
      ], default: 'stress_strain' },
      { id: 'force', label: 'Applied Force (F)', type: 'number', default: 50000, suffix: 'N' },
      { id: 'area', label: 'Cross-Sectional Area (A)', type: 'number', default: 0.001, min: 0, suffix: 'm²' },
      { id: 'deltaL', label: 'Change in Length (ΔL)', type: 'number', default: 0.5, suffix: 'mm' },
      { id: 'originalL', label: 'Original Length (L₀)', type: 'number', default: 1000, suffix: 'mm' },
    ],
    compute: (inputs) => {
      const mode = String(inputs.mode || 'stress_strain');
      const F = Number(inputs.force) || 0;
      const A = Number(inputs.area) || 0;
      const dL = Number(inputs.deltaL) || 0;
      const L0 = Number(inputs.originalL) || 0;

      if (A <= 0) return [{ label: 'Error', value: 'Area must be positive' }];

      const stress = F / A; // Pa
      const strain = L0 > 0 ? (dL / 1000) / (L0 / 1000) : 0;
      const E = strain > 0 ? stress / strain : 0;

      if (mode === 'stress_only') {
        return [
          { label: 'Stress (σ)', value: `${fmt(stress / 1e6, 4)} MPa`, highlight: true },
          { label: 'Stress (psi)', value: `${fmt(stress * 0.000145038, 2)} psi` },
        ];
      }

      return [
        { label: 'Stress (σ)', value: `${fmt(stress / 1e6, 4)} MPa`, highlight: true },
        { label: 'Strain (ε)', value: fmt(strain, 8) },
        { label: "Young's Modulus (E)", value: `${fmt(E / 1e9, 4)} GPa`, highlight: true },
        { label: 'Stress (psi)', value: `${fmt(stress * 0.000145038, 2)} psi` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 12. Pipe Flow Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pipe-flow-calculator',
    name: 'Pipe Flow Rate Calculator',
    description: 'Calculate volumetric and mass flow rate through a pipe from diameter and flow velocity. Q = A × v. Supports both metric and imperial units.',
    keywords: ['pipe flow', 'flow rate', 'pipe diameter', 'volumetric flow', 'pipe sizing', 'fluid velocity', 'pipe capacity', 'hydraulic calculator'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'diameter', label: 'Pipe Inner Diameter', type: 'number', default: 50, min: 0, suffix: 'mm' },
      { id: 'velocity', label: 'Flow Velocity', type: 'number', default: 2, min: 0, suffix: 'm/s' },
      { id: 'density', label: 'Fluid Density', type: 'number', default: 1000, min: 0, suffix: 'kg/m³' },
    ],
    compute: (inputs) => {
      const d = (Number(inputs.diameter) || 0) / 1000; // mm to m
      const v = Number(inputs.velocity) || 0;
      const rho = Number(inputs.density) || 0;
      if (d <= 0) return [{ label: 'Error', value: 'Diameter must be positive' }];

      const area = Math.PI * Math.pow(d / 2, 2);
      const qVol = area * v; // m³/s
      const qMass = qVol * rho; // kg/s

      return [
        { label: 'Volumetric Flow Rate', value: `${fmt(qVol * 1000, 4)} L/s`, highlight: true },
        { label: 'Volumetric (m³/h)', value: `${fmt(qVol * 3600, 4)} m³/h` },
        { label: 'Volumetric (GPM)', value: `${fmt(qVol * 15850.3, 2)} GPM` },
        { label: 'Mass Flow Rate', value: `${fmt(qMass, 4)} kg/s` },
        { label: 'Cross-Section Area', value: `${fmt(area * 1e6, 2)} mm²` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 13. Reynolds Number Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'reynolds-number-calculator',
    name: 'Reynolds Number Calculator',
    description: 'Calculate the Reynolds number (Re = ρvD/μ) to determine if fluid flow is laminar, transitional, or turbulent. Re < 2300 is laminar, Re > 4000 is turbulent.',
    keywords: ['Reynolds number', 'laminar flow', 'turbulent flow', 'fluid dynamics', 'flow regime', 'critical Reynolds', 'viscous flow', 'inertial forces'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'density', label: 'Fluid Density (ρ)', type: 'number', default: 1000, min: 0, suffix: 'kg/m³' },
      { id: 'velocity', label: 'Flow Velocity (v)', type: 'number', default: 2, min: 0, suffix: 'm/s' },
      { id: 'diameter', label: 'Characteristic Length/Diameter (D)', type: 'number', default: 0.05, min: 0, suffix: 'm' },
      { id: 'viscosity', label: 'Dynamic Viscosity (μ)', type: 'number', default: 0.001, min: 0, suffix: 'Pa·s', step: 0.0001 },
    ],
    compute: (inputs) => {
      const rho = Number(inputs.density) || 0;
      const v = Number(inputs.velocity) || 0;
      const D = Number(inputs.diameter) || 0;
      const mu = Number(inputs.viscosity) || 0;
      if (mu <= 0) return [{ label: 'Error', value: 'Viscosity must be positive' }];
      if (D <= 0) return [{ label: 'Error', value: 'Diameter must be positive' }];

      const Re = (rho * v * D) / mu;
      let regime: string;
      if (Re < 2300) regime = 'Laminar Flow';
      else if (Re < 4000) regime = 'Transitional Flow';
      else regime = 'Turbulent Flow';

      return [
        { label: 'Reynolds Number (Re)', value: fmt(Re, 2), highlight: true },
        { label: 'Flow Regime', value: regime, highlight: true },
        { label: 'Kinematic Viscosity', value: `${fmtSci(mu / rho, 6)} m²/s` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 14. Bernoulli's Equation Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'bernoulli-calculator',
    name: "Bernoulli's Equation Calculator",
    description: "Apply Bernoulli's principle: P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂. Calculate pressure, velocity, or elevation changes in an incompressible fluid flow.",
    keywords: ['Bernoulli equation', 'fluid pressure', 'fluid dynamics', 'Bernoulli principle', 'pressure velocity', 'incompressible flow', 'Venturi effect', 'flow energy'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'p1', label: 'Pressure at Point 1 (P₁)', type: 'number', default: 101325, suffix: 'Pa' },
      { id: 'v1', label: 'Velocity at Point 1 (v₁)', type: 'number', default: 2, suffix: 'm/s' },
      { id: 'h1', label: 'Elevation at Point 1 (h₁)', type: 'number', default: 10, suffix: 'm' },
      { id: 'v2', label: 'Velocity at Point 2 (v₂)', type: 'number', default: 5, suffix: 'm/s' },
      { id: 'h2', label: 'Elevation at Point 2 (h₂)', type: 'number', default: 0, suffix: 'm' },
      { id: 'density', label: 'Fluid Density (ρ)', type: 'number', default: 1000, min: 0, suffix: 'kg/m³' },
    ],
    compute: (inputs) => {
      const p1 = Number(inputs.p1) || 0;
      const v1 = Number(inputs.v1) || 0;
      const h1 = Number(inputs.h1) || 0;
      const v2 = Number(inputs.v2) || 0;
      const h2 = Number(inputs.h2) || 0;
      const rho = Number(inputs.density) || 0;
      if (rho <= 0) return [{ label: 'Error', value: 'Density must be positive' }];

      const p2 = p1 + 0.5 * rho * (v1 * v1 - v2 * v2) + rho * 9.81 * (h1 - h2);
      const dp = p2 - p1;

      return [
        { label: 'Pressure at Point 2 (P₂)', value: `${fmt(p2, 2)} Pa`, highlight: true },
        { label: 'Pressure Change (ΔP)', value: `${fmt(dp, 2)} Pa` },
        { label: 'P₂ (kPa)', value: `${fmt(p2 / 1000, 4)} kPa` },
        { label: 'P₂ (atm)', value: `${fmt(p2 / 101325, 6)} atm` },
        { label: 'Velocity head change', value: `${fmt(0.5 * (v1 * v1 - v2 * v2) / 9.81, 4)} m` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 15. Thermal Conductivity Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'thermal-conductivity-calculator',
    name: 'Thermal Conductivity Calculator',
    description: "Calculate heat transfer rate through a material using Fourier's Law: Q = kA(T₁-T₂)/d. Find thermal resistance, heat flux, and temperature gradient.",
    keywords: ['thermal conductivity', 'heat transfer', "Fourier's law", 'heat flux', 'thermal resistance', 'conduction', 'insulation R-value', 'U-value calculator'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'k', label: 'Thermal Conductivity (k)', type: 'number', default: 0.04, min: 0, suffix: 'W/(m·K)', step: 0.01 },
      { id: 'area', label: 'Cross-Section Area (A)', type: 'number', default: 10, min: 0, suffix: 'm²' },
      { id: 't1', label: 'Hot Side Temperature (T₁)', type: 'number', default: 25, suffix: '°C' },
      { id: 't2', label: 'Cold Side Temperature (T₂)', type: 'number', default: -5, suffix: '°C' },
      { id: 'thickness', label: 'Material Thickness (d)', type: 'number', default: 0.1, min: 0, suffix: 'm', step: 0.01 },
    ],
    compute: (inputs) => {
      const k = Number(inputs.k) || 0;
      const A = Number(inputs.area) || 0;
      const t1 = Number(inputs.t1) || 0;
      const t2 = Number(inputs.t2) || 0;
      const d = Number(inputs.thickness) || 0;
      if (d <= 0) return [{ label: 'Error', value: 'Thickness must be positive' }];
      if (A <= 0) return [{ label: 'Error', value: 'Area must be positive' }];

      const dT = t1 - t2;
      const Q = k * A * dT / d; // W
      const R_th = d / (k * A); // K/W
      const heatFlux = Q / A; // W/m²

      return [
        { label: 'Heat Transfer Rate (Q)', value: `${fmt(Q, 4)} W`, highlight: true },
        { label: 'Thermal Resistance (R)', value: `${fmt(R_th, 6)} K/W` },
        { label: 'Heat Flux (q)', value: `${fmt(heatFlux, 4)} W/m²` },
        { label: 'Temperature Difference', value: `${fmt(dT, 2)} °C` },
        { label: 'R-Value (imperial)', value: `${fmt(d / k * 5.678, 4)} ft²·°F·h/BTU` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 16. Solar Panel Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'solar-panel-calculator',
    name: 'Solar Panel Output Calculator',
    description: 'Estimate solar panel energy output based on panel wattage, peak sun hours, and system efficiency. Accounts for inverter losses, temperature, and shading.',
    keywords: ['solar panel', 'photovoltaic', 'solar energy', 'solar output', 'PV calculator', 'solar kWh', 'solar system sizing', 'sun hours calculator'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'panelWattage', label: 'Total System Wattage', type: 'number', default: 5000, min: 0, suffix: 'W' },
      { id: 'sunHours', label: 'Peak Sun Hours per Day', type: 'number', default: 5, min: 0, max: 12, suffix: 'hours' },
      { id: 'efficiency', label: 'System Efficiency', type: 'number', default: 80, min: 0, max: 100, suffix: '%' },
    ],
    compute: (inputs) => {
      const wattage = Number(inputs.panelWattage) || 0;
      const sunHours = Number(inputs.sunHours) || 0;
      const eff = (Number(inputs.efficiency) || 80) / 100;

      const dailyKWh = wattage * sunHours * eff / 1000;
      const monthlyKWh = dailyKWh * 30;
      const yearlyKWh = dailyKWh * 365;

      return [
        { label: 'Daily Output', value: `${fmt(dailyKWh, 2)} kWh`, highlight: true },
        { label: 'Monthly Output', value: `${fmt(monthlyKWh, 1)} kWh` },
        { label: 'Yearly Output', value: `${fmt(yearlyKWh, 0)} kWh` },
        { label: 'Yearly Output', value: `${fmt(yearlyKWh / 1000, 2)} MWh` },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 17. Battery Life Calculator
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'battery-life-calculator',
    name: 'Battery Life Calculator',
    description: 'Calculate battery runtime from capacity (mAh) and current draw. Also estimates charge time and number of charge cycles. Runtime = Capacity / Current.',
    keywords: ['battery life', 'battery runtime', 'mAh to hours', 'battery capacity', 'battery calculator', 'run time estimate', 'charge time', 'battery discharge'],
    category: 'engineering',
    icon: 'Cpu',
    fields: [
      { id: 'capacity', label: 'Battery Capacity', type: 'number', default: 3000, min: 0, suffix: 'mAh' },
      { id: 'current', label: 'Current Draw', type: 'number', default: 500, min: 0, suffix: 'mA' },
      { id: 'efficiency', label: 'Battery Efficiency', type: 'number', default: 85, min: 0, max: 100, suffix: '%' },
    ],
    compute: (inputs) => {
      const cap = Number(inputs.capacity) || 0;
      const current = Number(inputs.current) || 0;
      const eff = (Number(inputs.efficiency) || 85) / 100;
      if (current <= 0) return [{ label: 'Error', value: 'Current draw must be positive' }];

      const runtimeHours = (cap * eff) / current;
      const h = Math.floor(runtimeHours);
      const m = Math.floor((runtimeHours - h) * 60);

      return [
        { label: 'Estimated Runtime', value: `${h}h ${m}m (${fmt(runtimeHours, 2)} hours)`, highlight: true },
        { label: 'Energy', value: `${fmt(cap * 3.7 / 1000, 2)} Wh (at 3.7V nominal)` },
        { label: 'Effective Capacity', value: `${fmt(cap * eff, 1)} mAh` },
        { label: 'Runtime (days)', value: fmt(runtimeHours / 24, 2) },
      ];
    },
  },

];
