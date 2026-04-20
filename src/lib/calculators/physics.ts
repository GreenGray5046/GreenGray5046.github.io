import { Calculator, CalcResult, fmt, fmtSci } from '../calc-types';

// ─── Physical Constants ───────────────────────────────────────────────────────
const G = 6.67430e-11;   // gravitational constant (m³ kg⁻¹ s⁻²)
const g = 9.80665;       // standard gravity (m/s²)
const c = 2.99792458e8;  // speed of light (m/s)
const h = 6.62607015e-34;// Planck constant (J·s)
const k_e = 8.9875517923e9; // Coulomb constant (N·m²/C²)
const epsilon_0 = 8.8541878128e-12; // vacuum permittivity (F/m)
const R_gas = 8.314462618; // universal gas constant (J/(mol·K))
const M_earth = 5.972e24; // Earth mass (kg)
const R_earth = 6.371e6;  // Earth radius (m)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const num = (v: string | number | boolean): number => Number(v) || 0;
const rad = (deg: number): number => (deg * Math.PI) / 180;

export const physicsCalculators: Calculator[] = [
  // 1 ─── Speed Calculator ──────────────────────────────────────────────────
  {
    id: 'speed-calculator',
    name: 'Speed Calculator',
    description:
      'Calculate speed, velocity, and average rate of motion from distance and time. Supports m/s, km/h, and mph output. Ideal for kinematics problems, velocity-time analysis, and uniform motion computations in introductory mechanics.',
    keywords: [
      'speed', 'velocity', 'distance over time', 'average speed', 'rate of motion',
      'kinematics', 'uniform motion', 'scalar velocity', 'displacement per time',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'distance', label: 'Distance', type: 'number', default: 100, min: 0, step: 0.1, suffix: 'm' },
      { id: 'time', label: 'Time', type: 'number', default: 10, min: 0, step: 0.1, suffix: 's' },
    ],
    compute: (i) => {
      const d = num(i.distance), t = num(i.time);
      if (t === 0) return [{ label: 'Speed', value: 'Time cannot be zero', highlight: true }];
      const speed = d / t;
      return [
        { label: 'Speed (m/s)', value: fmt(speed), highlight: true },
        { label: 'Speed (km/h)', value: fmt(speed * 3.6) },
        { label: 'Speed (mph)', value: fmt(speed * 2.23694) },
        { label: 'Speed (ft/s)', value: fmt(speed * 3.28084) },
        { label: 'Speed (knots)', value: fmt(speed * 1.94384) },
      ];
    },
  },

  // 2 ─── Force Calculator ──────────────────────────────────────────────────
  {
    id: 'force-calculator',
    name: 'Force Calculator (Newton\'s 2nd Law)',
    description:
      'Compute net force from mass and acceleration using F = ma. Useful for dynamics, free-body diagrams, and Newtonian mechanics problems. Also derives mass or acceleration when the other two quantities are known.',
    keywords: [
      'force', 'newton', 'F=ma', 'mass times acceleration', 'net force',
      'newtons second law', 'dynamics', 'free body diagram', 'resultant force',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'mass', label: 'Mass', type: 'number', default: 10, min: 0, step: 0.1, suffix: 'kg' },
      { id: 'acceleration', label: 'Acceleration', type: 'number', default: 9.81, step: 0.1, suffix: 'm/s²' },
    ],
    compute: (i) => {
      const m = num(i.mass), a = num(i.acceleration);
      const F = m * a;
      return [
        { label: 'Force (N)', value: fmt(F), highlight: true },
        { label: 'Force (kN)', value: fmt(F / 1000) },
        { label: 'Force (lbf)', value: fmt(F * 0.224809) },
        { label: 'Weight equivalent (kgf)', value: fmt(F / g) },
      ];
    },
  },

  // 3 ─── Work Calculator ───────────────────────────────────────────────────
  {
    id: 'work-calculator',
    name: 'Work Calculator',
    description:
      'Calculate mechanical work done by a constant force over a displacement using W = Fd. Handles angle between force and displacement for dot-product work. Essential for energy transfer analysis and work-energy theorem applications.',
    keywords: [
      'work', 'mechanical work', 'force times distance', 'work energy theorem',
      'dot product work', 'energy transfer', 'joules', 'W=Fd', 'work done by force',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'force', label: 'Force', type: 'number', default: 50, min: 0, step: 0.1, suffix: 'N' },
      { id: 'displacement', label: 'Displacement', type: 'number', default: 10, min: 0, step: 0.1, suffix: 'm' },
      { id: 'angle', label: 'Angle (force to displacement)', type: 'number', default: 0, min: 0, max: 180, step: 1, suffix: '°' },
    ],
    compute: (i) => {
      const F = num(i.force), d = num(i.displacement), angle = num(i.angle);
      const W = F * d * Math.cos(rad(angle));
      return [
        { label: 'Work (J)', value: fmt(W), highlight: true },
        { label: 'Work (kJ)', value: fmt(W / 1000) },
        { label: 'Work (ft·lbf)', value: fmt(W * 0.737562) },
        { label: 'Effective force component (N)', value: fmt(F * Math.cos(rad(angle))) },
      ];
    },
  },

  // 4 ─── Power Calculator ──────────────────────────────────────────────────
  {
    id: 'power-calculator',
    name: 'Power Calculator',
    description:
      'Compute mechanical power as the rate of doing work using P = W/t. Also calculates power from force and velocity (P = Fv). Supports watts, horsepower, and BTU/hr conversions for engine and motor analysis.',
    keywords: [
      'power', 'watts', 'horsepower', 'rate of work', 'P=W/t', 'mechanical power',
      'force times velocity', 'energy per time', 'motor power', 'engine output',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'work', label: 'Work / Energy', type: 'number', default: 1000, min: 0, step: 1, suffix: 'J' },
      { id: 'time', label: 'Time', type: 'number', default: 5, min: 0, step: 0.1, suffix: 's' },
    ],
    compute: (i) => {
      const W = num(i.work), t = num(i.time);
      if (t === 0) return [{ label: 'Power', value: 'Time cannot be zero', highlight: true }];
      const P = W / t;
      return [
        { label: 'Power (W)', value: fmt(P), highlight: true },
        { label: 'Power (kW)', value: fmt(P / 1000) },
        { label: 'Power (hp)', value: fmt(P / 745.7) },
        { label: 'Power (BTU/hr)', value: fmt(P * 3.41214) },
        { label: 'Power (ft·lbf/s)', value: fmt(P * 0.737562) },
      ];
    },
  },

  // 5 ─── Energy Calculator ─────────────────────────────────────────────────
  {
    id: 'energy-calculator',
    name: 'Kinetic & Potential Energy Calculator',
    description:
      'Calculate kinetic energy (KE = ½mv²) and gravitational potential energy (PE = mgh). Covers translational kinetic energy and elevation-based potential energy for mechanical energy conservation problems and roller-coaster analysis.',
    keywords: [
      'kinetic energy', 'potential energy', 'KE=½mv²', 'PE=mgh', 'mechanical energy',
      'energy conservation', 'gravitational potential', 'translational kinetic',
      'energy transformation', 'total mechanical energy',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'mass', label: 'Mass', type: 'number', default: 5, min: 0, step: 0.1, suffix: 'kg' },
      { id: 'velocity', label: 'Velocity', type: 'number', default: 10, min: 0, step: 0.1, suffix: 'm/s' },
      { id: 'height', label: 'Height', type: 'number', default: 20, min: 0, step: 0.1, suffix: 'm' },
    ],
    compute: (i) => {
      const m = num(i.mass), v = num(i.velocity), ht = num(i.height);
      const KE = 0.5 * m * v * v;
      const PE = m * g * ht;
      return [
        { label: 'Kinetic Energy (J)', value: fmt(KE), highlight: true },
        { label: 'Potential Energy (J)', value: fmt(PE), highlight: true },
        { label: 'Total Mechanical Energy (J)', value: fmt(KE + PE) },
        { label: 'KE (kJ)', value: fmt(KE / 1000) },
        { label: 'PE (kJ)', value: fmt(PE / 1000) },
        { label: 'Speed from KE alone (m/s)', value: fmt(Math.sqrt((2 * KE) / (m || 1))) },
      ];
    },
  },

  // 6 ─── Momentum Calculator ───────────────────────────────────────────────
  {
    id: 'momentum-calculator',
    name: 'Momentum & Impulse Calculator',
    description:
      'Compute linear momentum (p = mv) and impulse (J = FΔt = Δp). Analyze collision dynamics, impulse-momentum theorem, and conservation of momentum for elastic and inelastic collision scenarios.',
    keywords: [
      'momentum', 'impulse', 'p=mv', 'impulse momentum theorem', 'collision',
      'conservation of momentum', 'linear momentum', 'force time', 'change in momentum',
      'elastic collision', 'inelastic collision',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'mass', label: 'Mass', type: 'number', default: 10, min: 0, step: 0.1, suffix: 'kg' },
      { id: 'velocity', label: 'Velocity', type: 'number', default: 5, step: 0.1, suffix: 'm/s' },
      { id: 'force', label: 'Impulse Force', type: 'number', default: 0, step: 0.1, suffix: 'N' },
      { id: 'deltaT', label: 'Impulse Duration', type: 'number', default: 0, min: 0, step: 0.1, suffix: 's' },
    ],
    compute: (i) => {
      const m = num(i.mass), v = num(i.velocity), F = num(i.force), dt = num(i.deltaT);
      const p = m * v;
      const impulse = F * dt;
      return [
        { label: 'Momentum (kg·m/s)', value: fmt(p), highlight: true },
        { label: 'Impulse (N·s)', value: fmt(impulse), highlight: true },
        { label: 'Momentum (slug·ft/s)', value: fmt(p * 0.0685218) },
        { label: 'Velocity change from impulse (m/s)', value: m > 0 ? fmt(impulse / m) : 'N/A' },
        { label: 'Kinetic Energy (J)', value: fmt(0.5 * m * v * v) },
      ];
    },
  },

  // 7 ─── Projectile Motion Calculator ──────────────────────────────────────
  {
    id: 'projectile-motion-calculator',
    name: 'Projectile Motion Calculator',
    description:
      'Calculate range, maximum height, and time of flight for projectile motion on level ground. Incorporates launch angle and initial speed for ballistic trajectory analysis, sports physics, and artillery range estimation.',
    keywords: [
      'projectile motion', 'range', 'max height', 'time of flight', 'ballistic trajectory',
      'launch angle', 'parabolic motion', 'horizontal range', 'projectile range',
      'sports physics', 'artillery calculation',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'v0', label: 'Initial Speed', type: 'number', default: 50, min: 0, step: 0.1, suffix: 'm/s' },
      { id: 'angle', label: 'Launch Angle', type: 'number', default: 45, min: 0, max: 90, step: 1, suffix: '°' },
      { id: 'gVal', label: 'Gravity', type: 'number', default: 9.81, min: 0.01, step: 0.01, suffix: 'm/s²' },
    ],
    compute: (i) => {
      const v0 = num(i.v0), angle = num(i.angle), gv = num(i.gVal) || g;
      const radA = rad(angle);
      const sin2a = Math.sin(2 * radA);
      const sinA = Math.sin(radA);
      const cosA = Math.cos(radA);
      const range = (v0 * v0 * sin2a) / gv;
      const maxH = (v0 * v0 * sinA * sinA) / (2 * gv);
      const tFlight = (2 * v0 * sinA) / gv;
      const vx = v0 * cosA;
      const vy_max = v0 * sinA;
      return [
        { label: 'Range (m)', value: fmt(range), highlight: true },
        { label: 'Maximum Height (m)', value: fmt(maxH), highlight: true },
        { label: 'Time of Flight (s)', value: fmt(tFlight), highlight: true },
        { label: 'Horizontal Velocity (m/s)', value: fmt(vx) },
        { label: 'Initial Vertical Velocity (m/s)', value: fmt(vy_max) },
        { label: 'Impact Speed (m/s)', value: fmt(v0) },
        { label: 'Range (km)', value: fmt(range / 1000) },
      ];
    },
  },

  // 8 ─── Free Fall Calculator ──────────────────────────────────────────────
  {
    id: 'free-fall-calculator',
    name: 'Free Fall Calculator',
    description:
      'Compute free-fall distance (h = ½gt²), impact velocity (v = gt), and fall time from height. Includes air-resistance-free vacuum drop analysis and variable-gravity option for planetary free fall calculations.',
    keywords: [
      'free fall', 'falling object', 'drop height', 'impact velocity', 'gravitational acceleration',
      'vacuum drop', 'terminal velocity estimate', 'fall time', 'h=½gt²',
      'planetary free fall', 'drop calculator',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'height', label: 'Drop Height', type: 'number', default: 100, min: 0, step: 0.1, suffix: 'm' },
      { id: 'gVal', label: 'Gravity', type: 'number', default: 9.81, min: 0.01, step: 0.01, suffix: 'm/s²' },
    ],
    compute: (i) => {
      const ht = num(i.height), gv = num(i.gVal) || g;
      const t = Math.sqrt((2 * ht) / gv);
      const v = gv * t;
      return [
        { label: 'Fall Time (s)', value: fmt(t), highlight: true },
        { label: 'Impact Velocity (m/s)', value: fmt(v), highlight: true },
        { label: 'Impact Velocity (km/h)', value: fmt(v * 3.6) },
        { label: 'Impact Velocity (mph)', value: fmt(v * 2.23694) },
        { label: 'Distance after 1s (m)', value: fmt(0.5 * gv * 1) },
        { label: 'Distance after 2s (m)', value: fmt(0.5 * gv * 4) },
        { label: 'Kinetic Energy at impact per kg (J/kg)', value: fmt(gv * ht) },
      ];
    },
  },

  // 9 ─── Ohm's Law Calculator ──────────────────────────────────────────────
  {
    id: 'ohms-law-calculator',
    name: "Ohm's Law Calculator",
    description:
      "Solve Ohm's law V = IR for voltage, current, or resistance. Includes power dissipation (P = IV = I²R = V²/R) for resistor circuits, LED resistor sizing, and electrical load analysis.",
    keywords: [
      'ohms law', 'V=IR', 'voltage current resistance', 'resistor calculator',
      'power dissipation', 'LED resistor', 'electrical load', 'circuit analysis',
      'wattage', 'P=IV', 'I²R loss',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'voltage', label: 'Voltage', type: 'number', default: 12, step: 0.1, suffix: 'V' },
      { id: 'current', label: 'Current', type: 'number', default: 2, step: 0.01, suffix: 'A' },
      { id: 'resistance', label: 'Resistance (0 = compute)', type: 'number', default: 0, min: 0, step: 0.1, suffix: 'Ω' },
    ],
    compute: (i) => {
      const V = num(i.voltage), I = num(i.current), R_in = num(i.resistance);
      const R = R_in === 0 ? V / (I || 1) : R_in;
      const Vc = R_in !== 0 ? I * R : V;
      const Ic = R_in !== 0 ? V / (R || 1) : I;
      const P_iv = Vc * Ic;
      return [
        { label: 'Resistance (Ω)', value: fmt(R), highlight: R_in === 0 },
        { label: 'Voltage (V)', value: fmt(Vc), highlight: R_in !== 0 },
        { label: 'Current (A)', value: fmt(Ic) },
        { label: 'Power (W)', value: fmt(P_iv), highlight: true },
        { label: 'Power (P=I²R)', value: fmt(Ic * Ic * R) },
        { label: 'Power (P=V²/R)', value: fmt((Vc * Vc) / R) },
        { label: 'Current (mA)', value: fmt(Ic * 1000) },
        { label: 'Resistance (kΩ)', value: fmt(R / 1000) },
      ];
    },
  },

  // 10 ─── Wavelength Calculator ────────────────────────────────────────────
  {
    id: 'wavelength-calculator',
    name: 'Wavelength & Wave Speed Calculator',
    description:
      'Calculate wavelength (λ = v/f), wave speed (v = fλ), and frequency from the wave equation. Supports electromagnetic waves, sound waves, and water waves with speed-of-light preset for EM spectrum analysis.',
    keywords: [
      'wavelength', 'wave speed', 'frequency', 'lambda', 'v=fλ', 'electromagnetic wave',
      'sound wave', 'EM spectrum', 'wave equation', 'periodic wave',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'waveSpeed', label: 'Wave Speed', type: 'number', default: 343, min: 0, step: 1, suffix: 'm/s' },
      { id: 'frequency', label: 'Frequency', type: 'number', default: 440, min: 0, step: 1, suffix: 'Hz' },
    ],
    compute: (i) => {
      const v = num(i.waveSpeed), f = num(i.frequency);
      if (f === 0) return [{ label: 'Wavelength', value: 'Frequency cannot be zero', highlight: true }];
      const lambda = v / f;
      const T = 1 / f;
      return [
        { label: 'Wavelength (m)', value: fmtSci(lambda), highlight: true },
        { label: 'Wavelength (cm)', value: fmtSci(lambda * 100) },
        { label: 'Wavelength (mm)', value: fmtSci(lambda * 1000) },
        { label: 'Period (s)', value: fmtSci(T) },
        { label: 'Angular Frequency ω (rad/s)', value: fmtSci(2 * Math.PI * f) },
        { label: 'Wave Number k (rad/m)', value: fmtSci((2 * Math.PI) / lambda) },
      ];
    },
  },

  // 11 ─── Frequency Calculator ─────────────────────────────────────────────
  {
    id: 'frequency-calculator',
    name: 'Frequency & Angular Frequency Calculator',
    description:
      'Compute frequency from period (f = 1/T), angular frequency (ω = 2πf), and period from frequency. Covers rotational motion, oscillatory systems, and AC circuit frequency analysis.',
    keywords: [
      'frequency', 'period', 'angular frequency', 'omega', 'hertz', 'rpm',
      'rotational speed', 'oscillation frequency', 'AC frequency', 'f=1/T',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'period', label: 'Period (T)', type: 'number', default: 0.02, min: 0, step: 0.001, suffix: 's' },
    ],
    compute: (i) => {
      const T = num(i.period);
      if (T === 0) return [{ label: 'Frequency', value: 'Period cannot be zero', highlight: true }];
      const f = 1 / T;
      const omega = 2 * Math.PI * f;
      return [
        { label: 'Frequency (Hz)', value: fmt(f), highlight: true },
        { label: 'Frequency (kHz)', value: fmt(f / 1000) },
        { label: 'Angular Frequency ω (rad/s)', value: fmt(omega) },
        { label: 'RPM', value: fmt(f * 60) },
        { label: 'Period (ms)', value: fmt(T * 1000) },
        { label: 'Cycles per minute', value: fmt(f * 60) },
      ];
    },
  },

  // 12 ─── Doppler Effect Calculator ────────────────────────────────────────
  {
    id: 'doppler-effect-calculator',
    name: 'Doppler Effect Calculator',
    description:
      'Calculate observed frequency shift due to the Doppler effect for moving source or observer. Covers sound wave Doppler shift, ambulance siren pitch change, radar gun physics, and relativistic Doppler comparison.',
    keywords: [
      'doppler effect', 'doppler shift', 'observed frequency', 'moving source',
      'ambulance siren', 'radar gun', 'redshift', 'blueshift', 'sound frequency shift',
      'approaching source', 'receding source',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'sourceFreq', label: 'Source Frequency', type: 'number', default: 440, min: 0, step: 1, suffix: 'Hz' },
      { id: 'waveSpeed', label: 'Wave Speed (sound=343)', type: 'number', default: 343, min: 1, step: 1, suffix: 'm/s' },
      { id: 'observerSpeed', label: 'Observer Speed (+ toward)', type: 'number', default: 0, step: 0.1, suffix: 'm/s' },
      { id: 'sourceSpeed', label: 'Source Speed (+ toward)', type: 'number', default: 30, step: 0.1, suffix: 'm/s' },
    ],
    compute: (i) => {
      const fs = num(i.sourceFreq), v = num(i.waveSpeed) || 343;
      const vo = num(i.observerSpeed), vs = num(i.sourceSpeed);
      const denom = v - vs;
      if (denom === 0) return [{ label: 'Observed Frequency', value: 'Denominator zero (sonic boom)', highlight: true }];
      const fObs = fs * ((v + vo) / denom);
      const shift = fObs - fs;
      return [
        { label: 'Observed Frequency (Hz)', value: fmt(fObs), highlight: true },
        { label: 'Frequency Shift (Hz)', value: fmt(shift) },
        { label: 'Observed Wavelength (m)', value: fmtSci(v / fObs) },
        { label: 'Shift as % of source', value: fmt((shift / fs) * 100) + '%' },
        { label: 'Source Mach Number', value: fmt(vs / v) },
      ];
    },
  },

  // 13 ─── Gravitational Force Calculator ───────────────────────────────────
  {
    id: 'gravitational-force-calculator',
    name: 'Gravitational Force Calculator',
    description:
      'Calculate the gravitational force between two masses using Newton\'s law of universal gravitation F = GMm/r². Supports planetary attraction, satellite orbital forces, and celestial body gravitational analysis.',
    keywords: [
      'gravitational force', 'universal gravitation', 'F=GMm/r²', 'newtons gravity',
      'planetary attraction', 'satellite gravity', 'celestial mechanics',
      'gravitational pull', 'two body problem', 'tidal force',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'm1', label: 'Mass 1', type: 'number', default: 5.972e24, step: 1e20, suffix: 'kg' },
      { id: 'm2', label: 'Mass 2', type: 'number', default: 1000, step: 1, suffix: 'kg' },
      { id: 'r', label: 'Distance (center-to-center)', type: 'number', default: 6.371e6, step: 1, suffix: 'm' },
    ],
    compute: (i) => {
      const m1 = num(i.m1), m2 = num(i.m2), r = num(i.r);
      if (r === 0) return [{ label: 'Force', value: 'Distance cannot be zero', highlight: true }];
      const F = (G * m1 * m2) / (r * r);
      return [
        { label: 'Gravitational Force (N)', value: fmtSci(F), highlight: true },
        { label: 'Force (kN)', value: fmtSci(F / 1000) },
        { label: 'Gravitational Field at m2 (m/s²)', value: fmtSci((G * m1) / (r * r)) },
        { label: 'Force (lbf)', value: fmtSci(F * 0.224809) },
      ];
    },
  },

  // 14 ─── Escape Velocity Calculator ───────────────────────────────────────
  {
    id: 'escape-velocity-calculator',
    name: 'Escape Velocity Calculator',
    description:
      'Compute escape velocity v = √(2GM/r) for a planet or celestial body. Includes presets for Earth, Moon, Mars, and Jupiter. Essential for rocket science, orbital mechanics, and interplanetary mission planning.',
    keywords: [
      'escape velocity', 'rocket speed', 'orbital escape', 'v=√(2GM/r)',
      'planetary escape', 'rocket science', 'interplanetary mission',
      'launch velocity', 'gravitational well', 'celestial body escape',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'M', label: 'Body Mass', type: 'number', default: 5.972e24, step: 1e20, suffix: 'kg' },
      { id: 'r', label: 'Body Radius', type: 'number', default: 6.371e6, step: 1, suffix: 'm' },
    ],
    compute: (i) => {
      const M = num(i.M), r = num(i.r);
      if (r === 0) return [{ label: 'Escape Velocity', value: 'Radius cannot be zero', highlight: true }];
      const vEsc = Math.sqrt((2 * G * M) / r);
      const vOrb = Math.sqrt((G * M) / r);
      return [
        { label: 'Escape Velocity (m/s)', value: fmtSci(vEsc), highlight: true },
        { label: 'Escape Velocity (km/s)', value: fmt(vEsc / 1000) },
        { label: 'Escape Velocity (mph)', value: fmtSci(vEsc * 2.23694) },
        { label: 'Circular Orbit Velocity (m/s)', value: fmtSci(vOrb) },
        { label: 'Circular Orbit Velocity (km/s)', value: fmt(vOrb / 1000) },
        { label: 'Ratio (escape/orbital)', value: fmt(vEsc / vOrb) },
      ];
    },
  },

  // 15 ─── Orbital Velocity Calculator ──────────────────────────────────────
  {
    id: 'orbital-velocity-calculator',
    name: 'Orbital Velocity Calculator',
    description:
      'Calculate circular orbital speed v = √(GM/r), orbital period T = 2π√(r³/GM), and centripetal acceleration for satellites. Covers LEO, GEO, and arbitrary altitude orbits with Earth presets.',
    keywords: [
      'orbital velocity', 'circular orbit', 'satellite speed', 'v=√(GM/r)',
      'orbital period', 'LEO', 'GEO', 'geostationary', 'satellite orbit',
      'centripetal acceleration', 'kepler third law',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'M', label: 'Central Body Mass', type: 'number', default: 5.972e24, step: 1e20, suffix: 'kg' },
      { id: 'r', label: 'Orbital Radius', type: 'number', default: 6.771e6, step: 1, suffix: 'm' },
    ],
    compute: (i) => {
      const M = num(i.M), r = num(i.r);
      if (r === 0) return [{ label: 'Orbital Velocity', value: 'Radius cannot be zero', highlight: true }];
      const v = Math.sqrt((G * M) / r);
      const T = 2 * Math.PI * Math.sqrt((r * r * r) / (G * M));
      const a_c = (v * v) / r;
      const altitude = r - R_earth;
      return [
        { label: 'Orbital Velocity (m/s)', value: fmtSci(v), highlight: true },
        { label: 'Orbital Velocity (km/s)', value: fmt(v / 1000) },
        { label: 'Orbital Period (s)', value: fmtSci(T) },
        { label: 'Orbital Period (hours)', value: fmt(T / 3600) },
        { label: 'Centripetal Acceleration (m/s²)', value: fmtSci(a_c) },
        { label: 'Altitude above Earth (km)', value: fmt(altitude / 1000) },
      ];
    },
  },

  // 16 ─── Simple Pendulum Calculator ───────────────────────────────────────
  {
    id: 'simple-pendulum-calculator',
    name: 'Simple Pendulum Calculator',
    description:
      'Calculate the period and frequency of a simple pendulum using T = 2π√(L/g). Covers small-angle approximation, pendulum length from period, and grandfathers clock regulation analysis.',
    keywords: [
      'simple pendulum', 'pendulum period', 'T=2π√(L/g)', 'pendulum length',
      'oscillation period', 'grandfather clock', 'small angle approximation',
      'pendulum frequency', 'gravity pendulum', 'bob swing',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'length', label: 'Pendulum Length', type: 'number', default: 1, min: 0, step: 0.01, suffix: 'm' },
      { id: 'gVal', label: 'Gravity', type: 'number', default: 9.81, min: 0.01, step: 0.01, suffix: 'm/s²' },
    ],
    compute: (i) => {
      const L = num(i.length), gv = num(i.gVal) || g;
      const T = 2 * Math.PI * Math.sqrt(L / gv);
      const f = 1 / T;
      const omega = 2 * Math.PI * f;
      return [
        { label: 'Period (s)', value: fmt(T), highlight: true },
        { label: 'Frequency (Hz)', value: fmt(f), highlight: true },
        { label: 'Angular Frequency ω (rad/s)', value: fmt(omega) },
        { label: 'Period (ms)', value: fmt(T * 1000) },
        { label: 'Length for T=1s (m)', value: fmt((gv * 1) / (4 * Math.PI * Math.PI)) },
        { label: 'Length for T=2s (m)', value: fmt((gv * 4) / (4 * Math.PI * Math.PI)) },
      ];
    },
  },

  // 17 ─── Spring Calculator ────────────────────────────────────────────────
  {
    id: 'spring-calculator',
    name: 'Spring Force & Energy Calculator (Hooke\'s Law)',
    description:
      'Compute spring force using Hooke\'s law (F = kx), elastic potential energy (PE = ½kx²), and simple harmonic motion period (T = 2π√(m/k)). Covers spring constant determination and oscillation analysis.',
    keywords: [
      'hookes law', 'spring constant', 'F=kx', 'elastic potential energy',
      'spring energy', 'simple harmonic motion', 'SHM', 'oscillation period',
      'spring stiffness', 'restoring force', 'spring compression',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'k', label: 'Spring Constant (k)', type: 'number', default: 200, min: 0, step: 1, suffix: 'N/m' },
      { id: 'x', label: 'Displacement (x)', type: 'number', default: 0.1, step: 0.01, suffix: 'm' },
      { id: 'mass', label: 'Attached Mass (for SHM)', type: 'number', default: 2, min: 0, step: 0.1, suffix: 'kg' },
    ],
    compute: (i) => {
      const k = num(i.k), x = num(i.x), m = num(i.mass);
      const F = k * x;
      const PE = 0.5 * k * x * x;
      const T = m > 0 ? 2 * Math.PI * Math.sqrt(m / k) : 0;
      const f = T > 0 ? 1 / T : 0;
      const omega = Math.sqrt(k / (m || 1));
      return [
        { label: 'Spring Force (N)', value: fmt(F), highlight: true },
        { label: 'Elastic PE (J)', value: fmt(PE), highlight: true },
        { label: 'SHM Period (s)', value: fmt(T) },
        { label: 'SHM Frequency (Hz)', value: fmt(f) },
        { label: 'Angular Frequency ω (rad/s)', value: fmt(omega) },
        { label: 'Max Velocity (m/s)', value: fmt(omega * Math.abs(x)) },
        { label: 'Max Acceleration (m/s²)', value: fmt(omega * omega * Math.abs(x)) },
      ];
    },
  },

  // 18 ─── Pressure Calculator ──────────────────────────────────────────────
  {
    id: 'pressure-calculator',
    name: 'Pressure & Hydrostatic Pressure Calculator',
    description:
      'Compute pressure from force and area (P = F/A), hydrostatic pressure (P = ρgh), and absolute pressure at depth. Covers atmospheric pressure, gauge pressure, and fluid column pressure for hydraulics and diving calculations.',
    keywords: [
      'pressure', 'P=F/A', 'hydrostatic pressure', 'fluid pressure', 'depth pressure',
      'gauge pressure', 'atmospheric pressure', 'pascal', 'hydraulic pressure',
      'diving pressure', 'water column pressure',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'force', label: 'Force', type: 'number', default: 100, min: 0, step: 1, suffix: 'N' },
      { id: 'area', label: 'Area', type: 'number', default: 0.01, min: 0, step: 0.001, suffix: 'm²' },
      { id: 'depth', label: 'Fluid Depth (for hydrostatic)', type: 'number', default: 10, min: 0, step: 0.1, suffix: 'm' },
      { id: 'density', label: 'Fluid Density', type: 'number', default: 1000, min: 0, step: 1, suffix: 'kg/m³' },
    ],
    compute: (i) => {
      const F = num(i.force), A = num(i.area), depth = num(i.depth), rho = num(i.density);
      const P_mech = A > 0 ? F / A : 0;
      const P_hydro = rho * g * depth;
      const P_atm = 101325;
      const P_abs = P_atm + P_hydro;
      return [
        { label: 'Mechanical Pressure (Pa)', value: fmtSci(P_mech), highlight: true },
        { label: 'Mechanical Pressure (kPa)', value: fmt(P_mech / 1000) },
        { label: 'Hydrostatic Pressure (Pa)', value: fmtSci(P_hydro), highlight: true },
        { label: 'Hydrostatic Pressure (atm)', value: fmt(P_hydro / P_atm) },
        { label: 'Absolute Pressure at depth (Pa)', value: fmtSci(P_abs) },
        { label: 'Absolute Pressure at depth (atm)', value: fmt(P_abs / P_atm) },
        { label: 'Pressure (psi)', value: fmt(P_mech * 0.000145038) },
        { label: 'Pressure (bar)', value: fmt(P_mech / 100000) },
      ];
    },
  },

  // 19 ─── Buoyancy Calculator ──────────────────────────────────────────────
  {
    id: 'buoyancy-calculator',
    name: 'Buoyancy Calculator (Archimedes\' Principle)',
    description:
      'Calculate buoyant force using Archimedes\' principle (F_b = ρ_fluid × V_displaced × g). Determines whether objects float or sink, submerged volume fraction, and apparent weight in fluid for ship stability and density experiments.',
    keywords: [
      'buoyancy', 'archimedes principle', 'buoyant force', 'float or sink',
      'displaced volume', 'apparent weight', 'ship stability', 'density',
      'submerged fraction', 'fluid displacement', 'upthrust',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'fluidDensity', label: 'Fluid Density', type: 'number', default: 1000, min: 0, step: 1, suffix: 'kg/m³' },
      { id: 'volume', label: 'Displaced Volume', type: 'number', default: 0.5, min: 0, step: 0.01, suffix: 'm³' },
      { id: 'objectMass', label: 'Object Mass', type: 'number', default: 400, min: 0, step: 1, suffix: 'kg' },
    ],
    compute: (i) => {
      const rhoF = num(i.fluidDensity), V = num(i.volume), m = num(i.objectMass);
      const Fb = rhoF * V * g;
      const W = m * g;
      const netForce = W - Fb;
      const objDensity = V > 0 ? m / V : 0;
      const subFraction = objDensity > 0 && rhoF > 0 ? Math.min(objDensity / rhoF, 1) : 0;
      const floats = Fb >= W;
      return [
        { label: 'Buoyant Force (N)', value: fmt(Fb), highlight: true },
        { label: 'Weight (N)', value: fmt(W) },
        { label: 'Net Force (N, + sinks)', value: fmt(netForce), highlight: true },
        { label: 'Object Density (kg/m³)', value: fmt(objDensity) },
        { label: 'Submerged Fraction', value: fmt(subFraction * 100) + '%' },
        { label: 'Floats?', value: floats ? 'Yes ☑' : 'No ☒' },
        { label: 'Apparent Weight in Fluid (N)', value: fmt(Math.max(netForce, 0)) },
      ];
    },
  },

  // 20 ─── Specific Heat Calculator ─────────────────────────────────────────
  {
    id: 'specific-heat-calculator',
    name: 'Specific Heat & Heat Energy Calculator',
    description:
      'Calculate heat energy using Q = mcΔT. Solve for specific heat capacity, temperature change, or mass. Includes presets for water, iron, copper, and aluminum. Essential for calorimetry and thermal physics problems.',
    keywords: [
      'specific heat', 'heat energy', 'Q=mcΔT', 'calorimetry', 'heat capacity',
      'thermal energy', 'temperature change', 'water specific heat', 'copper',
      'aluminum', 'iron', 'phase change',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'mass', label: 'Mass', type: 'number', default: 1, min: 0, step: 0.01, suffix: 'kg' },
      { id: 'specificHeat', label: 'Specific Heat Capacity', type: 'number', default: 4186, min: 0, step: 1, suffix: 'J/(kg·K)' },
      { id: 'deltaT', label: 'Temperature Change (ΔT)', type: 'number', default: 50, step: 0.1, suffix: '°C' },
    ],
    compute: (i) => {
      const m = num(i.mass), c_val = num(i.specificHeat), dT = num(i.deltaT);
      const Q = m * c_val * dT;
      return [
        { label: 'Heat Energy (J)', value: fmtSci(Q), highlight: true },
        { label: 'Heat Energy (kJ)', value: fmt(Q / 1000) },
        { label: 'Heat Energy (kcal)', value: fmt(Q / 4184) },
        { label: 'Heat Energy (BTU)', value: fmt(Q / 1055.06) },
        { label: 'Heat Energy (kWh)', value: fmtSci(Q / 3600000) },
        { label: 'Power to heat in 1 min (W)', value: fmt(Q / 60) },
      ];
    },
  },

  // 21 ─── Thermal Expansion Calculator ─────────────────────────────────────
  {
    id: 'thermal-expansion-calculator',
    name: 'Thermal Expansion Calculator',
    description:
      'Calculate linear expansion (ΔL = L₀αΔT) and volumetric expansion (ΔV = V₀βΔT). Covers thermal expansion coefficients for steel, aluminum, glass, and concrete. Essential for bridge design, bimetallic strips, and thermal stress analysis.',
    keywords: [
      'thermal expansion', 'linear expansion', 'volumetric expansion', 'expansion coefficient',
      'thermal stress', 'bimetallic strip', 'bridge expansion joint',
      'steel expansion', 'aluminum expansion', 'ΔL=L₀αΔT',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'L0', label: 'Initial Length', type: 'number', default: 10, min: 0, step: 0.1, suffix: 'm' },
      { id: 'alpha', label: 'Linear Exp. Coeff. (α)', type: 'number', default: 12e-6, step: 1e-7, suffix: '/°C' },
      { id: 'deltaT', label: 'Temperature Change (ΔT)', type: 'number', default: 100, step: 1, suffix: '°C' },
      { id: 'V0', label: 'Initial Volume (for vol. exp.)', type: 'number', default: 1, min: 0, step: 0.01, suffix: 'm³' },
    ],
    compute: (i) => {
      const L0 = num(i.L0), alpha = num(i.alpha), dT = num(i.deltaT), V0 = num(i.V0);
      const dL = L0 * alpha * dT;
      const Lf = L0 + dL;
      const beta = 3 * alpha; // approximate for isotropic solids
      const dV = V0 * beta * dT;
      const Vf = V0 + dV;
      return [
        { label: 'Linear Expansion ΔL (m)', value: fmtSci(dL), highlight: true },
        { label: 'Linear Expansion ΔL (mm)', value: fmt(dL * 1000) },
        { label: 'Final Length (m)', value: fmt(Lf) },
        { label: 'Volumetric Expansion ΔV (m³)', value: fmtSci(dV), highlight: true },
        { label: 'Volumetric Expansion ΔV (cm³)', value: fmt(dV * 1e6) },
        { label: 'Final Volume (m³)', value: fmt(Vf) },
        { label: 'Linear Strain', value: fmtSci(dL / L0) },
      ];
    },
  },

  // 22 ─── Coulomb's Law Calculator ─────────────────────────────────────────
  {
    id: 'coulombs-law-calculator',
    name: "Coulomb's Law Calculator",
    description:
      "Calculate electrostatic force between two point charges using Coulomb's law F = kq₁q₂/r². Covers attractive and repulsive forces, electric field strength, and charge interaction analysis for electrostatics problems.",
    keywords: [
      'coulombs law', 'electrostatic force', 'F=kq₁q₂/r²', 'point charge',
      'electric force', 'charge interaction', 'attractive force', 'repulsive force',
      'coulomb constant', 'electric field', 'static electricity',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'q1', label: 'Charge 1 (q₁)', type: 'number', default: 1e-6, step: 1e-8, suffix: 'C' },
      { id: 'q2', label: 'Charge 2 (q₂)', type: 'number', default: 2e-6, step: 1e-8, suffix: 'C' },
      { id: 'r', label: 'Distance', type: 'number', default: 0.5, min: 0, step: 0.01, suffix: 'm' },
    ],
    compute: (i) => {
      const q1 = num(i.q1), q2 = num(i.q2), r = num(i.r);
      if (r === 0) return [{ label: 'Force', value: 'Distance cannot be zero', highlight: true }];
      const F = (k_e * Math.abs(q1) * Math.abs(q2)) / (r * r);
      const type = (q1 * q2) >= 0 ? 'Repulsive' : 'Attractive';
      const E1 = (k_e * Math.abs(q2)) / (r * r);
      const E2 = (k_e * Math.abs(q1)) / (r * r);
      return [
        { label: 'Force Magnitude (N)', value: fmtSci(F), highlight: true },
        { label: 'Force Type', value: type, highlight: true },
        { label: 'Force (mN)', value: fmtSci(F * 1000) },
        { label: 'Electric Field at q₁ due to q₂ (V/m)', value: fmtSci(E1) },
        { label: 'Electric Field at q₂ due to q₁ (V/m)', value: fmtSci(E2) },
        { label: 'Potential Energy (J)', value: fmtSci((k_e * q1 * q2) / r) },
      ];
    },
  },

  // 23 ─── Capacitor Calculator ─────────────────────────────────────────────
  {
    id: 'capacitor-calculator',
    name: 'Capacitor Calculator',
    description:
      'Calculate parallel-plate capacitance (C = εA/d), stored energy (U = ½CV²), and charge (Q = CV). Covers vacuum and dielectric-filled capacitors, electric field between plates, and energy density analysis.',
    keywords: [
      'capacitor', 'capacitance', 'C=εA/d', 'stored energy', 'U=½CV²',
      'parallel plate', 'dielectric', 'electric field', 'charge storage',
      'energy density', 'farad', 'RC circuit',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'area', label: 'Plate Area', type: 'number', default: 0.01, min: 0, step: 0.001, suffix: 'm²' },
      { id: 'separation', label: 'Plate Separation', type: 'number', default: 0.001, min: 0, step: 0.0001, suffix: 'm' },
      { id: 'dielectric', label: 'Dielectric Constant (εᵣ)', type: 'number', default: 1, min: 1, step: 0.1 },
      { id: 'voltage', label: 'Voltage', type: 'number', default: 12, step: 0.1, suffix: 'V' },
    ],
    compute: (i) => {
      const A = num(i.area), d = num(i.separation), er = num(i.dielectric) || 1, V = num(i.voltage);
      if (d === 0) return [{ label: 'Capacitance', value: 'Separation cannot be zero', highlight: true }];
      const C = (epsilon_0 * er * A) / d;
      const Q = C * V;
      const U = 0.5 * C * V * V;
      const E_field = V / d;
      const u_density = 0.5 * epsilon_0 * er * E_field * E_field;
      return [
        { label: 'Capacitance (F)', value: fmtSci(C), highlight: true },
        { label: 'Capacitance (μF)', value: fmt(C * 1e6) },
        { label: 'Capacitance (nF)', value: fmt(C * 1e9) },
        { label: 'Capacitance (pF)', value: fmt(C * 1e12) },
        { label: 'Charge (C)', value: fmtSci(Q) },
        { label: 'Stored Energy (J)', value: fmtSci(U) },
        { label: 'Electric Field (V/m)', value: fmtSci(E_field) },
        { label: 'Energy Density (J/m³)', value: fmtSci(u_density) },
      ];
    },
  },

  // 24 ─── Inductor Calculator ──────────────────────────────────────────────
  {
    id: 'inductor-calculator',
    name: 'Inductor Calculator',
    description:
      'Calculate inductor voltage (V = L·di/dt), stored energy (U = ½LI²), and inductive reactance (X_L = 2πfL). Covers solenoid inductance, back-EMF, and AC circuit impedance for coil and transformer design.',
    keywords: [
      'inductor', 'inductance', 'V=L·di/dt', 'U=½LI²', 'inductive reactance',
      'solenoid', 'back EMF', 'coil energy', 'transformer design',
      'AC impedance', 'henry', 'magnetic energy',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'inductance', label: 'Inductance (L)', type: 'number', default: 0.1, min: 0, step: 0.01, suffix: 'H' },
      { id: 'current', label: 'Current (I)', type: 'number', default: 5, step: 0.1, suffix: 'A' },
      { id: 'di_dt', label: 'Current Change Rate (di/dt)', type: 'number', default: 100, step: 1, suffix: 'A/s' },
      { id: 'frequency', label: 'AC Frequency', type: 'number', default: 60, min: 0, step: 1, suffix: 'Hz' },
    ],
    compute: (i) => {
      const L = num(i.inductance), I = num(i.current), didt = num(i.di_dt), f = num(i.frequency);
      const V_ind = L * didt;
      const U = 0.5 * L * I * I;
      const X_L = 2 * Math.PI * f * L;
      const I_ac = X_L > 0 ? 120 / X_L : 0; // assuming 120V source
      return [
        { label: 'Induced Voltage (V)', value: fmt(V_ind), highlight: true },
        { label: 'Stored Energy (J)', value: fmt(U), highlight: true },
        { label: 'Stored Energy (mJ)', value: fmt(U * 1000) },
        { label: 'Inductive Reactance X_L (Ω)', value: fmt(X_L) },
        { label: 'Inductive Reactance X_L (kΩ)', value: fmt(X_L / 1000) },
        { label: 'Current at 120V AC (A)', value: fmt(I_ac) },
        { label: 'Phase Angle (ideal)', value: '90° (current lags)' },
      ];
    },
  },

  // 25 ─── RC Circuit Calculator ────────────────────────────────────────────
  {
    id: 'rc-circuit-calculator',
    name: 'RC Circuit Time Constant Calculator',
    description:
      'Calculate RC time constant (τ = RC), charging/discharging voltages and currents, and cutoff frequency for low-pass and high-pass RC filters. Essential for timing circuits, signal filtering, and transient response analysis.',
    keywords: [
      'RC circuit', 'time constant', 'τ=RC', 'charging capacitor', 'discharging capacitor',
      'cutoff frequency', 'low pass filter', 'high pass filter', 'transient response',
      'timing circuit', 'exponential decay',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'resistance', label: 'Resistance (R)', type: 'number', default: 1000, min: 0, step: 1, suffix: 'Ω' },
      { id: 'capacitance', label: 'Capacitance (C)', type: 'number', default: 0.0001, min: 0, step: 0.000001, suffix: 'F' },
      { id: 'V0', label: 'Source Voltage', type: 'number', default: 5, step: 0.1, suffix: 'V' },
    ],
    compute: (i) => {
      const R = num(i.resistance), C = num(i.capacitance), V0 = num(i.V0);
      const tau = R * C;
      const f_cutoff = 1 / (2 * Math.PI * R * C);
      const t_5tau = 5 * tau;
      const V_1tau = V0 * (1 - Math.exp(-1)); // charging at 1τ
      const V_5tau = V0 * (1 - Math.exp(-5)); // charging at 5τ
      return [
        { label: 'Time Constant τ (s)', value: fmtSci(tau), highlight: true },
        { label: 'Time Constant τ (ms)', value: fmt(tau * 1000) },
        { label: 'Cutoff Frequency (Hz)', value: fmt(f_cutoff), highlight: true },
        { label: 'Cutoff Frequency (kHz)', value: fmt(f_cutoff / 1000) },
        { label: 'Voltage at 1τ (charging) (V)', value: fmt(V_1tau) + ` (${fmt((V_1tau / V0) * 100)}%)` },
        { label: 'Voltage at 5τ ≈ fully charged (V)', value: fmt(V_5tau) },
        { label: 'Time to ~full charge (5τ) (s)', value: fmtSci(t_5tau) },
        { label: 'Energy Stored at full charge (J)', value: fmtSci(0.5 * C * V0 * V0) },
      ];
    },
  },

  // 26 ─── RL Circuit Calculator ────────────────────────────────────────────
  {
    id: 'rl-circuit-calculator',
    name: 'RL Circuit Time Constant Calculator',
    description:
      'Calculate RL time constant (τ = L/R), current rise/decay, and inductor voltage during transients. Covers DC RL circuit step response, motor inrush current estimation, and relay coil timing.',
    keywords: [
      'RL circuit', 'time constant', 'τ=L/R', 'inductor current', 'transient response',
      'DC step response', 'motor inrush', 'relay coil', 'current rise',
      'inductive time constant', 'back EMF decay',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'inductance', label: 'Inductance (L)', type: 'number', default: 0.1, min: 0, step: 0.01, suffix: 'H' },
      { id: 'resistance', label: 'Resistance (R)', type: 'number', default: 10, min: 0, step: 0.1, suffix: 'Ω' },
      { id: 'V0', label: 'Source Voltage', type: 'number', default: 12, step: 0.1, suffix: 'V' },
    ],
    compute: (i) => {
      const L = num(i.inductance), R = num(i.resistance), V0 = num(i.V0);
      if (R === 0) return [{ label: 'Time Constant', value: 'Resistance cannot be zero', highlight: true }];
      const tau = L / R;
      const I_max = V0 / R;
      const I_1tau = I_max * (1 - Math.exp(-1));
      const I_5tau = I_max * (1 - Math.exp(-5));
      const V_L_1tau = V0 * Math.exp(-1);
      return [
        { label: 'Time Constant τ (s)', value: fmtSci(tau), highlight: true },
        { label: 'Time Constant τ (ms)', value: fmt(tau * 1000) },
        { label: 'Steady-State Current (A)', value: fmt(I_max), highlight: true },
        { label: 'Current at 1τ (A)', value: fmt(I_1tau) + ` (${fmt((I_1tau / I_max) * 100)}%)` },
        { label: 'Current at 5τ ≈ steady state (A)', value: fmt(I_5tau) },
        { label: 'Inductor Voltage at 1τ (V)', value: fmt(V_L_1tau) },
        { label: 'Time to ~steady state (5τ) (s)', value: fmtSci(5 * tau) },
        { label: 'Power at steady state (W)', value: fmt(V0 * I_max) },
      ];
    },
  },

  // 27 ─── Snell's Law Calculator ───────────────────────────────────────────
  {
    id: 'snells-law-calculator',
    name: "Snell's Law & Refraction Calculator",
    description:
      "Calculate refracted angle using Snell's law (n₁sinθ₁ = n₂sinθ₂). Detects total internal reflection, computes critical angle, and includes refractive index presets for glass, water, diamond, and air. Essential for optics and lens design.",
    keywords: [
      'snells law', 'refraction', 'refractive index', 'total internal reflection',
      'critical angle', 'n₁sinθ₁=n₂sinθ₂', 'light bending', 'optics',
      'glass refraction', 'water refraction', 'diamond', 'fiber optics',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'n1', label: 'Refractive Index 1 (n₁)', type: 'number', default: 1.5, min: 1, step: 0.01 },
      { id: 'theta1', label: 'Angle of Incidence (θ₁)', type: 'number', default: 30, min: 0, max: 90, step: 1, suffix: '°' },
      { id: 'n2', label: 'Refractive Index 2 (n₂)', type: 'number', default: 1.0, min: 1, step: 0.01 },
    ],
    compute: (i) => {
      const n1 = num(i.n1), t1 = num(i.theta1), n2 = num(i.n2);
      const sinT1 = Math.sin(rad(t1));
      const sinT2 = (n1 * sinT1) / n2;
      const criticalAngle = n1 > n2 ? Math.asin(n2 / n1) * (180 / Math.PI) : null;
      const results: CalcResult[] = [];
      if (sinT2 > 1) {
        results.push({ label: 'Result', value: 'Total Internal Reflection', highlight: true });
        if (criticalAngle !== null) {
          results.push({ label: 'Critical Angle', value: fmt(criticalAngle) + '°', highlight: true });
        }
      } else {
        const t2 = Math.asin(sinT2) * (180 / Math.PI);
        results.push({ label: 'Refracted Angle θ₂ (°)', value: fmt(t2), highlight: true });
      }
      if (criticalAngle !== null) {
        results.push({ label: 'Critical Angle (°)', value: fmt(criticalAngle) });
      } else {
        results.push({ label: 'Critical Angle', value: 'N/A (n₁ ≤ n₂)' });
      }
      results.push(
        { label: 'sin(θ₁)', value: fmt(sinT1) },
        { label: 'sin(θ₂)', value: fmt(Math.min(sinT2, 1)) },
        { label: 'n₁/n₂', value: fmt(n1 / n2) },
        { label: 'Speed in medium 1 (c/n₁)', value: fmtSci(c / n1) + ' m/s' },
        { label: 'Speed in medium 2 (c/n₂)', value: fmtSci(c / n2) + ' m/s' },
      );
      return results;
    },
  },

  // 28 ─── Lens Calculator ──────────────────────────────────────────────────
  {
    id: 'lens-calculator',
    name: 'Thin Lens Calculator',
    description:
      'Calculate image distance, magnification, and image nature using the thin lens equation (1/f = 1/dₒ + 1/dᵢ). Handles converging and diverging lenses, real and virtual images, and magnification for optics and vision correction.',
    keywords: [
      'thin lens', 'lens equation', '1/f=1/do+1/di', 'focal length', 'image distance',
      'magnification', 'converging lens', 'diverging lens', 'real image',
      'virtual image', 'vision correction', 'optics',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'focalLength', label: 'Focal Length (f, +conv/−div)', type: 'number', default: 10, step: 0.1, suffix: 'cm' },
      { id: 'objectDist', label: 'Object Distance (dₒ)', type: 'number', default: 30, min: 0, step: 0.1, suffix: 'cm' },
    ],
    compute: (i) => {
      const f = num(i.focalLength), d_o = num(i.objectDist);
      if (d_o === 0) return [{ label: 'Result', value: 'Object distance cannot be zero', highlight: true }];
      const d_i = 1 / (1 / f - 1 / d_o);
      const M = -d_i / d_o;
      const isReal = d_i > 0;
      const isUpright = M > 0;
      const absM = Math.abs(M);
      let sizeDesc = absM > 1 ? 'Enlarged' : absM < 1 ? 'Diminished' : 'Same size';
      return [
        { label: 'Image Distance dᵢ (cm)', value: fmt(d_i), highlight: true },
        { label: 'Magnification (M)', value: fmt(M), highlight: true },
        { label: 'Image Type', value: isReal ? 'Real' : 'Virtual', highlight: true },
        { label: 'Orientation', value: isUpright ? 'Upright' : 'Inverted' },
        { label: 'Size', value: sizeDesc },
        { label: 'Absolute Magnification |M|', value: fmt(absM) },
        { label: 'Image Distance (m)', value: fmt(d_i / 100) },
        { label: 'Lens Power (diopters)', value: fmt(100 / f) },
      ];
    },
  },

  // 29 ─── De Broglie Wavelength Calculator ─────────────────────────────────
  {
    id: 'de-broglie-wavelength-calculator',
    name: 'de Broglie Wavelength Calculator',
    description:
      'Calculate the de Broglie wavelength (λ = h/p) for particles and objects, demonstrating wave-particle duality. Compare thermal de Broglie wavelength and electron diffraction scales. A quantum mechanics essential for physics students.',
    keywords: [
      'de broglie wavelength', 'wave particle duality', 'λ=h/p', 'quantum wavelength',
      'matter wave', 'electron wavelength', 'thermal de broglie',
      'quantum mechanics', 'particle wave', 'diffraction wavelength',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'mass', label: 'Mass', type: 'number', default: 9.109e-31, step: 1e-33, suffix: 'kg' },
      { id: 'velocity', label: 'Velocity', type: 'number', default: 1e6, min: 0, step: 1000, suffix: 'm/s' },
    ],
    compute: (i) => {
      const m = num(i.mass), v = num(i.velocity);
      if (m === 0 || v === 0) return [{ label: 'Wavelength', value: 'Mass and velocity must be non-zero', highlight: true }];
      const p = m * v;
      const lambda = h / p;
      const KE = 0.5 * m * v * v;
      const KE_eV = KE / 1.602e-19;
      return [
        { label: 'de Broglie Wavelength (m)', value: fmtSci(lambda), highlight: true },
        { label: 'Wavelength (nm)', value: fmtSci(lambda * 1e9) },
        { label: 'Wavelength (pm)', value: fmtSci(lambda * 1e12) },
        { label: 'Wavelength (Å)', value: fmtSci(lambda * 1e10) },
        { label: 'Momentum (kg·m/s)', value: fmtSci(p) },
        { label: 'Kinetic Energy (J)', value: fmtSci(KE) },
        { label: 'Kinetic Energy (eV)', value: fmtSci(KE_eV) },
        { label: 'Compare: visible light (400-700 nm)', value: lambda > 400e-9 ? 'Longer than visible' : 'Shorter than visible' },
      ];
    },
  },

  // 30 ─── Photoelectric Effect Calculator ──────────────────────────────────
  {
    id: 'photoelectric-effect-calculator',
    name: 'Photoelectric Effect Calculator',
    description:
      'Calculate kinetic energy of photoelectrons (KE = hf − φ), stopping potential, and threshold frequency for the photoelectric effect. Demonstrates Einstein\'s photon theory and quantized light interaction with metals.',
    keywords: [
      'photoelectric effect', 'KE=hf−φ', 'work function', 'stopping potential',
      'threshold frequency', 'photon energy', 'Einstein photoelectric',
      'quantized light', 'photoelectron', 'metal emission', 'photon theory',
    ],
    category: 'physics',
    icon: 'Atom',
    fields: [
      { id: 'wavelength', label: 'Light Wavelength', type: 'number', default: 400, min: 1, step: 1, suffix: 'nm' },
      { id: 'workFunction', label: 'Work Function (φ)', type: 'number', default: 2.3, min: 0, step: 0.1, suffix: 'eV' },
    ],
    compute: (i) => {
      const lambda = num(i.wavelength) * 1e-9; // convert nm to m
      const phi_eV = num(i.workFunction);
      const f = c / lambda;
      const E_photon_J = h * f;
      const E_photon_eV = E_photon_J / 1.602e-19;
      const KE_eV = E_photon_eV - phi_eV;
      const KE_J = KE_eV * 1.602e-19;
      const V_stop = KE_eV; // stopping potential in volts = KE in eV
      const f_threshold = (phi_eV * 1.602e-19) / h;
      const lambda_threshold = c / f_threshold;
      const emitted = KE_eV > 0;
      return [
        { label: 'Photon Energy (eV)', value: fmt(E_photon_eV), highlight: true },
        { label: 'Photon Energy (J)', value: fmtSci(E_photon_J) },
        { label: 'Frequency (Hz)', value: fmtSci(f) },
        { label: 'KE of Photoelectron (eV)', value: emitted ? fmt(KE_eV) : '0 (no emission)', highlight: true },
        { label: 'KE of Photoelectron (J)', value: emitted ? fmtSci(KE_J) : '0' },
        { label: 'Stopping Potential (V)', value: emitted ? fmt(V_stop) : 'N/A' },
        { label: 'Threshold Frequency (Hz)', value: fmtSci(f_threshold) },
        { label: 'Threshold Wavelength (nm)', value: fmt(lambda_threshold * 1e9) },
        { label: 'Emission?', value: emitted ? 'Yes ☑ — electrons emitted' : 'No ☒ — below threshold' },
      ];
    },
  },
];
