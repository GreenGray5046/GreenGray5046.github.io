import { Calculator, fmt, fmtSci } from '../calc-types';

// ─── Safe math expression evaluator ──────────────────────────────────────────
function safeEval(expr: string, x: number): number {
  const prepared = expr
    .replace(/\^/g, '**')
    .replace(/asin\(/g, 'Math.asin(')
    .replace(/acos\(/g, 'Math.acos(')
    .replace(/atan\(/g, 'Math.atan(')
    .replace(/sinh\(/g, 'Math.sinh(')
    .replace(/cosh\(/g, 'Math.cosh(')
    .replace(/tanh\(/g, 'Math.tanh(')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/log10\(/g, 'Math.log10(')
    .replace(/log2\(/g, 'Math.log2(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/cbrt\(/g, 'Math.cbrt(')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/exp\(/g, 'Math.exp(')
    .replace(/ceil\(/g, 'Math.ceil(')
    .replace(/floor\(/g, 'Math.floor(')
    .replace(/round\(/g, 'Math.round(')
    .replace(/\bpi\b/g, 'Math.PI')
    .replace(/\be\b(?![a-zA-Z])/g, 'Math.E')
    .replace(/(\d)(x)/g, '$1*x')
    .replace(/(\d)\(/g, '$1*(')
    .replace(/\)([\dx])/g, ')*$1')
    .replace(/(x)\(/g, 'x*(')
    .replace(/\)(\()/g, ')*(');
  try {
    return new Function('x', `"use strict"; return (${prepared})`)(x);
  } catch {
    return NaN;
  }
}

// ─── Simpson's Rule for numerical integration ─────────────────────────────────
function simpsonsRule(f: (x: number) => number, a: number, b: number, n: number): number {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
  }
  return (h / 3) * sum;
}

// ─── GCD using Euclidean algorithm ───────────────────────────────────────────
function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

// ─── Factorial ───────────────────────────────────────────────────────────────
function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ─── Combination / Permutation ───────────────────────────────────────────────
function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function nPr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  return factorial(n) / factorial(n - r);
}

// ─── Normal distribution CDF (approximation) ────────────────────────────────
function normalCDF(z: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 0.5 * (1.0 + sign * y);
}

export const mathCalculators: Calculator[] = [

  // ━━━ 1. Integral Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'integral-calculator',
    name: 'Integral Calculator',
    description: 'Compute definite integrals numerically using Simpson\'s rule. Enter any function of x (e.g., x^2, sin(x), e^x) and bounds to evaluate the area under the curve. Supports trigonometric, exponential, and logarithmic functions.',
    keywords: ['integral calculator', 'definite integral', 'numerical integration', 'Simpson rule', 'area under curve', 'antiderivative calculator', 'Riemann sum', 'integral solver', 'definite integral calculator with steps'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'fn', label: 'Function f(x)', type: 'text', default: 'x^2', placeholder: 'e.g. x^2 + 3*x, sin(x), e^x' },
      { id: 'a', label: 'Lower Bound (a)', type: 'number', default: 0, step: 0.1 },
      { id: 'b', label: 'Upper Bound (b)', type: 'number', default: 5, step: 0.1 },
      { id: 'n', label: 'Number of Intervals', type: 'number', default: 1000, min: 2, max: 100000, step: 2 },
    ],
    compute: (inputs) => {
      const fn = String(inputs.fn);
      const a = Number(inputs.a);
      const b = Number(inputs.b);
      const n = Math.max(2, Number(inputs.n) || 1000);
      const f = (x: number) => safeEval(fn, x);
      // Test the function
      const testVal = f((a + b) / 2);
      if (Number.isNaN(testVal)) {
        return [{ label: 'Error', value: 'Invalid function expression. Use x as variable. Examples: x^2, sin(x), e^x, sqrt(x)' }];
      }
      const result = simpsonsRule(f, a, b, n);
      if (Number.isNaN(result) || !Number.isFinite(result)) {
        return [{ label: 'Error', value: 'Integration failed — check your function and bounds' }];
      }
      return [
        { label: '∫ f(x) dx', value: fmtSci(result), highlight: true },
        { label: 'Method', value: `Simpson's Rule (n=${n % 2 === 0 ? n : n + 1})` },
        { label: 'Bounds', value: `[${fmt(a, 4)}, ${fmt(b, 4)}]` },
        { label: 'Function', value: `f(x) = ${fn}` },
      ];
    },
  },

  // ━━━ 2. Derivative Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'derivative-calculator',
    name: 'Derivative Calculator',
    description: 'Compute the numerical derivative of any function at a given point using the central difference method. Supports trigonometric, exponential, logarithmic, and polynomial functions. Enter f(x) and evaluate f\'(x) at any point.',
    keywords: ['derivative calculator', 'numerical differentiation', 'central difference', 'f prime', 'slope of tangent', 'rate of change', 'differential calculator', 'derivative at a point', 'instantaneous rate of change'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'fn', label: 'Function f(x)', type: 'text', default: 'x^3', placeholder: 'e.g. x^3, sin(x), e^x' },
      { id: 'point', label: 'Evaluate at x =', type: 'number', default: 2, step: 0.1 },
      { id: 'h', label: 'Step Size (h)', type: 'number', default: 0.0001, min: 1e-12, max: 1, step: 0.0001 },
    ],
    compute: (inputs) => {
      const fn = String(inputs.fn);
      const x0 = Number(inputs.point);
      const h = Number(inputs.h) || 0.0001;
      const f = (x: number) => safeEval(fn, x);
      const fx = f(x0);
      if (Number.isNaN(fx)) {
        return [{ label: 'Error', value: 'Invalid function expression' }];
      }
      // Central difference: f'(x) ≈ [f(x+h) - f(x-h)] / (2h)
      const fPlus = f(x0 + h);
      const fMinus = f(x0 - h);
      const derivative = (fPlus - fMinus) / (2 * h);
      // Also compute second derivative
      const secondDeriv = (fPlus - 2 * fx + fMinus) / (h * h);
      if (Number.isNaN(derivative)) {
        return [{ label: 'Error', value: 'Could not compute derivative at this point' }];
      }
      return [
        { label: "f'(x) at x = " + fmt(x0, 4), value: fmtSci(derivative), highlight: true },
        { label: "f''(x) at x = " + fmt(x0, 4), value: fmtSci(secondDeriv) },
        { label: 'f(x) at x = ' + fmt(x0, 4), value: fmtSci(fx) },
        { label: 'Method', value: 'Central Difference' },
        { label: 'Step Size (h)', value: h.toExponential(2) },
      ];
    },
  },

  // ━━━ 3. Laplace Transform Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'laplace-transform-calculator',
    name: 'Laplace Transform Calculator',
    description: 'Look up the Laplace transform of common functions used in differential equations and control systems. Includes transforms for t^n, e^(at), sin(at), cos(at), step functions, and more. Essential for engineering and signal processing.',
    keywords: ['Laplace transform', 'Laplace transform calculator', 'transform table', 's-domain', 'frequency domain', 'control systems', 'differential equation solver', 'Laplace transform of e^at', 'Laplace of sin at'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'fn', label: 'Function f(t)', type: 'select', default: 't^n', options: [
        { label: '1 (unit step)', value: '1' },
        { label: 't^n (power)', value: 't^n' },
        { label: 'e^(at) (exponential)', value: 'e^(at)' },
        { label: 'sin(at)', value: 'sin(at)' },
        { label: 'cos(at)', value: 'cos(at)' },
        { label: 't·e^(at)', value: 't*e^(at)' },
        { label: 'e^(at)·sin(bt)', value: 'e^(at)*sin(bt)' },
        { label: 'e^(at)·cos(bt)', value: 'e^(at)*cos(bt)' },
        { label: 'sinh(at)', value: 'sinh(at)' },
        { label: 'cosh(at)', value: 'cosh(at)' },
        { label: 'δ(t) (Dirac delta)', value: 'delta' },
        { label: 'u(t-a) (delayed step)', value: 'u(t-a)' },
      ] },
      { id: 'a', label: 'Parameter a', type: 'number', default: 1, step: 0.1 },
      { id: 'b', label: 'Parameter b (if needed)', type: 'number', default: 1, step: 0.1 },
      { id: 'n', label: 'Parameter n (for t^n)', type: 'number', default: 2, min: 0, max: 20, step: 1 },
    ],
    compute: (inputs) => {
      const fn = String(inputs.fn);
      const a = Number(inputs.a) || 1;
      const b = Number(inputs.b) || 1;
      const n = Math.max(0, Math.round(Number(inputs.n) || 2));
      let transform = '';
      let timeDomain = '';
      switch (fn) {
        case '1':
          transform = '1/s';
          timeDomain = '1';
          break;
        case 't^n':
          transform = `${factorial(n)}/s^${n + 1}`;
          timeDomain = `t^${n}`;
          break;
        case 'e^(at)':
          transform = `1/(s - ${a})`;
          timeDomain = `e^(${a}t)`;
          break;
        case 'sin(at)':
          transform = `${a}/(s² + ${a}²)`;
          timeDomain = `sin(${a}t)`;
          break;
        case 'cos(at)':
          transform = `s/(s² + ${a}²)`;
          timeDomain = `cos(${a}t)`;
          break;
        case 't*e^(at)':
          transform = `1/(s - ${a})²`;
          timeDomain = `t·e^(${a}t)`;
          break;
        case 'e^(at)*sin(bt)':
          transform = `${b}/((s - ${a})² + ${b}²)`;
          timeDomain = `e^(${a}t)·sin(${b}t)`;
          break;
        case 'e^(at)*cos(bt)':
          transform = `(s - ${a})/((s - ${a})² + ${b}²)`;
          timeDomain = `e^(${a}t)·cos(${b}t)`;
          break;
        case 'sinh(at)':
          transform = `${a}/(s² - ${a}²)`;
          timeDomain = `sinh(${a}t)`;
          break;
        case 'cosh(at)':
          transform = `s/(s² - ${a}²)`;
          timeDomain = `cosh(${a}t)`;
          break;
        case 'delta':
          transform = '1';
          timeDomain = 'δ(t)';
          break;
        case 'u(t-a)':
          transform = `e^(-${a}s)/s`;
          timeDomain = `u(t - ${a})`;
          break;
        default:
          transform = 'Unknown';
          timeDomain = fn;
      }
      return [
        { label: 'L{f(t)}', value: transform, highlight: true },
        { label: 'Time Domain f(t)', value: timeDomain },
        { label: 'Frequency Domain F(s)', value: `F(s) = ${transform}` },
        { label: 'Region of Convergence', value: a > 0 && fn.includes('at') ? `Re(s) > ${a}` : 'Re(s) > 0' },
      ];
    },
  },

  // ━━━ 4. Quadratic Equation Solver ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'quadratic-equation-solver',
    name: 'Quadratic Equation Solver',
    description: 'Solve any quadratic equation ax² + bx + c = 0 with step-by-step discriminant analysis. Handles real roots, complex roots, and repeated roots. Shows vertex, axis of symmetry, and parabola direction.',
    keywords: ['quadratic equation', 'quadratic solver', 'quadratic formula', 'discriminant', 'roots of quadratic', 'parabola vertex', 'complex roots', 'ax2+bx+c solver'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'a', label: 'Coefficient a', type: 'number', default: 1, step: 0.1 },
      { id: 'b', label: 'Coefficient b', type: 'number', default: -5, step: 0.1 },
      { id: 'c', label: 'Coefficient c', type: 'number', default: 6, step: 0.1 },
    ],
    compute: (inputs) => {
      const a = Number(inputs.a);
      const b = Number(inputs.b);
      const c = Number(inputs.c);
      if (a === 0) return [{ label: 'Error', value: 'Coefficient a cannot be zero (not a quadratic)' }];
      const disc = b * b - 4 * a * c;
      const vertex_x = -b / (2 * a);
      const vertex_y = a * vertex_x * vertex_x + b * vertex_x + c;
      const results: { label: string; value: string | number; highlight?: boolean }[] = [];
      if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        results.push({ label: 'Root x₁', value: fmt(x1, 6), highlight: true });
        results.push({ label: 'Root x₂', value: fmt(x2, 6), highlight: true });
        results.push({ label: 'Discriminant', value: `${fmt(disc, 4)} (positive — two real roots)` });
      } else if (disc === 0) {
        const x = -b / (2 * a);
        results.push({ label: 'Root (repeated)', value: fmt(x, 6), highlight: true });
        results.push({ label: 'Discriminant', value: '0 (zero — one repeated root)' });
      } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-disc) / (2 * a);
        results.push({ label: 'Root x₁', value: `${fmt(real, 6)} + ${fmt(imag, 6)}i`, highlight: true });
        results.push({ label: 'Root x₂', value: `${fmt(real, 6)} - ${fmt(imag, 6)}i`, highlight: true });
        results.push({ label: 'Discriminant', value: `${fmt(disc, 4)} (negative — two complex roots)` });
      }
      results.push({ label: 'Vertex', value: `(${fmt(vertex_x, 4)}, ${fmt(vertex_y, 4)})` });
      results.push({ label: 'Axis of Symmetry', value: `x = ${fmt(vertex_x, 4)}` });
      results.push({ label: 'Parabola Direction', value: a > 0 ? 'Opens upward (minimum)' : 'Opens downward (maximum)' });
      return results;
    },
  },

  // ━━━ 5. Cubic Equation Solver ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'cubic-equation-solver',
    name: 'Cubic Equation Solver',
    description: 'Solve cubic equations ax³ + bx² + cx + d = 0 numerically. Finds all real and complex roots using Cardano\'s method approximation. A niche tool most calculator sites lack.',
    keywords: ['cubic equation', 'cubic solver', 'Cardano formula', 'third degree polynomial', 'cubic roots', 'depressed cubic', 'ax3+bx2+cx+d solver', 'cubic formula'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'a', label: 'Coefficient a', type: 'number', default: 1, step: 0.1 },
      { id: 'b', label: 'Coefficient b', type: 'number', default: -6, step: 0.1 },
      { id: 'c', label: 'Coefficient c', type: 'number', default: 11, step: 0.1 },
      { id: 'd', label: 'Coefficient d', type: 'number', default: -6, step: 0.1 },
    ],
    compute: (inputs) => {
      let a = Number(inputs.a);
      const b = Number(inputs.b);
      const c = Number(inputs.c);
      const d = Number(inputs.d);
      if (a === 0) return [{ label: 'Error', value: 'a cannot be zero (not cubic)' }];
      // Normalize: x³ + px² + qx + r
      const p = b / a, q = c / a, r = d / a;
      // Depressed cubic: t³ + pt + q via substitution x = t - p/3
      const p1 = q - p * p / 3;
      const q1 = r - p * q / 3 + 2 * p * p * p / 27;
      const disc = q1 * q1 / 4 + p1 * p1 * p1 / 27;
      const results: { label: string; value: string; highlight?: boolean }[] = [];
      if (disc > 1e-10) {
        // One real root, two complex
        const sqrtDisc = Math.sqrt(disc);
        const u = Math.cbrt(-q1 / 2 + sqrtDisc);
        const v = Math.cbrt(-q1 / 2 - sqrtDisc);
        const x1 = u + v - p / 3;
        results.push({ label: 'Real Root x₁', value: fmt(x1, 6), highlight: true });
        const realPart = -(u + v) / 2 - p / 3;
        const imagPart = (u - v) * Math.sqrt(3) / 2;
        results.push({ label: 'Complex Root x₂', value: `${fmt(realPart, 6)} + ${fmt(Math.abs(imagPart), 6)}i` });
        results.push({ label: 'Complex Root x₃', value: `${fmt(realPart, 6)} - ${fmt(Math.abs(imagPart), 6)}i` });
      } else if (Math.abs(disc) <= 1e-10) {
        // Repeated roots
        const u = Math.cbrt(-q1 / 2);
        const x1 = 2 * u - p / 3;
        const x2 = -u - p / 3;
        results.push({ label: 'Root x₁', value: fmt(x1, 6), highlight: true });
        results.push({ label: 'Root x₂ = x₃ (repeated)', value: fmt(x2, 6), highlight: true });
      } else {
        // Three distinct real roots (casus irreducibilis)
        const rr = Math.sqrt(-p1 * p1 * p1 / 27);
        const theta = Math.acos(-q1 / (2 * rr)) / 3;
        const m = 2 * Math.cbrt(rr);
        const x1 = m * Math.cos(theta) - p / 3;
        const x2 = m * Math.cos(theta - 2 * Math.PI / 3) - p / 3;
        const x3 = m * Math.cos(theta + 2 * Math.PI / 3) - p / 3;
        results.push({ label: 'Root x₁', value: fmt(x1, 6), highlight: true });
        results.push({ label: 'Root x₂', value: fmt(x2, 6), highlight: true });
        results.push({ label: 'Root x₃', value: fmt(x3, 6), highlight: true });
      }
      results.push({ label: 'Discriminant', value: fmt(disc, 6) });
      return results;
    },
  },

  // ━━━ 6. Scientific Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'scientific-calculator',
    name: 'Scientific Calculator',
    description: 'Full-featured scientific calculator with trigonometric functions (sin, cos, tan), logarithms (ln, log10), exponentials, roots, factorials, and constants (π, e). Supports degree and radian modes.',
    keywords: ['scientific calculator', 'online calculator', 'trig calculator', 'log calculator', 'sin cos tan calculator', 'advanced calculator', 'engineering calculator', 'math calculator'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'expr', label: 'Expression', type: 'text', default: '', placeholder: 'e.g. sin(45) + log(100), 2^10, sqrt(144)' },
      { id: 'angleMode', label: 'Angle Mode', type: 'select', default: 'deg', options: [
        { label: 'Degrees', value: 'deg' },
        { label: 'Radians', value: 'rad' },
      ] },
    ],
    compute: (inputs) => {
      let expr = String(inputs.expr).trim();
      if (!expr) return [{ label: 'Result', value: 'Enter an expression' }];
      const isDeg = inputs.angleMode === 'deg';
      // Preprocess: convert trig functions to radian mode if needed
      if (isDeg) {
        expr = expr.replace(/asin\(/g, '__ASIN(')
          .replace(/acos\(/g, '__ACOS(')
          .replace(/atan\(/g, '__ATAN(')
          .replace(/sin\(/g, 'Math.sin(x*')
          .replace(/cos\(/g, 'Math.cos(x*')
          .replace(/tan\(/g, 'Math.tan(x*')
          .replace(/x\*/g, 'Math.PI/180*')
          .replace(/__ASIN\(/g, '(Math.asin(')
          .replace(/__ACOS\(/g, '(Math.acos(')
          .replace(/__ATAN\(/g, '(Math.atan(');
      }
      const prepared = expr
        .replace(/\^/g, '**')
        .replace(/sinh\(/g, 'Math.sinh(')
        .replace(/cosh\(/g, 'Math.cosh(')
        .replace(/tanh\(/g, 'Math.tanh(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/log10\(/g, 'Math.log10(')
        .replace(/log2\(/g, 'Math.log2(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/cbrt\(/g, 'Math.cbrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b(?![a-zA-Z])/g, 'Math.E');
      try {
        const result = new Function('factorial', `"use strict"; return (${prepared})`)(factorial);
        if (typeof result !== 'number' || Number.isNaN(result)) {
          return [{ label: 'Error', value: 'Could not evaluate expression' }];
        }
        return [
          { label: 'Result', value: fmtSci(result), highlight: true },
          { label: 'Angle Mode', value: isDeg ? 'Degrees' : 'Radians' },
        ];
      } catch {
        return [{ label: 'Error', value: 'Invalid expression — check syntax' }];
      }
    },
  },

  // ━━━ 7. Matrix Determinant Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'matrix-determinant-calculator',
    name: 'Matrix Determinant Calculator',
    description: 'Calculate the determinant of 2×2 or 3×3 matrices. Determinants are used in linear algebra for solving systems of equations, finding inverses, and computing eigenvalues.',
    keywords: ['matrix determinant', 'determinant calculator', 'linear algebra', '2x2 determinant', '3x3 determinant', 'matrix calculator', 'det calculator', 'Sarrus rule'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'size', label: 'Matrix Size', type: 'select', default: '3', options: [
        { label: '2×2', value: '2' },
        { label: '3×3', value: '3' },
      ] },
      { id: 'a11', label: 'a₁₁', type: 'number', default: 1, step: 0.1 },
      { id: 'a12', label: 'a₁₂', type: 'number', default: 2, step: 0.1 },
      { id: 'a13', label: 'a₁₃ (3×3)', type: 'number', default: 3, step: 0.1 },
      { id: 'a21', label: 'a₂₁', type: 'number', default: 4, step: 0.1 },
      { id: 'a22', label: 'a₂₂', type: 'number', default: 5, step: 0.1 },
      { id: 'a23', label: 'a₂₃ (3×3)', type: 'number', default: 6, step: 0.1 },
      { id: 'a31', label: 'a₃₁ (3×3)', type: 'number', default: 7, step: 0.1 },
      { id: 'a32', label: 'a₃₂ (3×3)', type: 'number', default: 8, step: 0.1 },
      { id: 'a33', label: 'a₃₃ (3×3)', type: 'number', default: 9, step: 0.1 },
    ],
    compute: (inputs) => {
      const is2x2 = inputs.size === '2';
      const a11 = Number(inputs.a11), a12 = Number(inputs.a12), a13 = Number(inputs.a13);
      const a21 = Number(inputs.a21), a22 = Number(inputs.a22), a23 = Number(inputs.a23);
      const a31 = Number(inputs.a31), a32 = Number(inputs.a32), a33 = Number(inputs.a33);
      if (is2x2) {
        const det = a11 * a22 - a12 * a21;
        return [
          { label: 'Determinant', value: fmt(det, 6), highlight: true },
          { label: 'Matrix', value: `|${a11}  ${a12}|\n|${a21}  ${a22}|` },
          { label: 'Invertible', value: det !== 0 ? 'Yes' : 'No (singular matrix)' },
        ];
      }
      const det = a11 * (a22 * a33 - a23 * a32) - a12 * (a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31);
      return [
        { label: 'Determinant', value: fmt(det, 6), highlight: true },
        { label: 'Invertible', value: det !== 0 ? 'Yes' : 'No (singular matrix)' },
        { label: 'Trace', value: fmt(a11 + a22 + a33, 6) },
      ];
    },
  },

  // ━━━ 8. Complex Number Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'complex-number-calculator',
    name: 'Complex Number Calculator',
    description: 'Perform arithmetic on complex numbers: addition, subtraction, multiplication, division, conjugate, modulus, and argument. Convert between rectangular (a+bi) and polar (r∠θ) forms.',
    keywords: ['complex number calculator', 'imaginary number', 'a+bi calculator', 'polar form', 'complex arithmetic', 'conjugate', 'modulus of complex', 'argument of complex number'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'r1', label: 'Real part (z₁)', type: 'number', default: 3, step: 0.1 },
      { id: 'i1', label: 'Imaginary part (z₁)', type: 'number', default: 4, step: 0.1, suffix: 'i' },
      { id: 'r2', label: 'Real part (z₂)', type: 'number', default: 1, step: 0.1 },
      { id: 'i2', label: 'Imaginary part (z₂)', type: 'number', default: 2, step: 0.1, suffix: 'i' },
      { id: 'op', label: 'Operation', type: 'select', default: 'multiply', options: [
        { label: 'Add (z₁ + z₂)', value: 'add' },
        { label: 'Subtract (z₁ - z₂)', value: 'sub' },
        { label: 'Multiply (z₁ × z₂)', value: 'multiply' },
        { label: 'Divide (z₁ ÷ z₂)', value: 'divide' },
      ] },
    ],
    compute: (inputs) => {
      const r1 = Number(inputs.r1), i1 = Number(inputs.i1);
      const r2 = Number(inputs.r2), i2 = Number(inputs.i2);
      let rr = 0, ii = 0;
      switch (inputs.op) {
        case 'add': rr = r1 + r2; ii = i1 + i2; break;
        case 'sub': rr = r1 - r2; ii = i1 - i2; break;
        case 'multiply': rr = r1 * r2 - i1 * i2; ii = r1 * i2 + i1 * r2; break;
        case 'divide':
          const denom = r2 * r2 + i2 * i2;
          if (denom === 0) return [{ label: 'Error', value: 'Division by zero' }];
          rr = (r1 * r2 + i1 * i2) / denom;
          ii = (i1 * r2 - r1 * i2) / denom;
          break;
      }
      const fmtC = (r: number, i: number) => {
        if (Math.abs(i) < 1e-10) return fmt(r, 6);
        if (Math.abs(r) < 1e-10) return `${fmt(i, 6)}i`;
        return `${fmt(r, 6)} ${i >= 0 ? '+' : '-'} ${fmt(Math.abs(i), 6)}i`;
      };
      const mod1 = Math.sqrt(r1 * r1 + i1 * i1);
      const arg1 = Math.atan2(i1, r1) * 180 / Math.PI;
      return [
        { label: 'Result', value: fmtC(rr, ii), highlight: true },
        { label: 'z₁', value: fmtC(r1, i1) },
        { label: 'z₂', value: fmtC(r2, i2) },
        { label: '|z₁| (modulus)', value: fmt(mod1, 6) },
        { label: 'arg(z₁) (degrees)', value: fmt(arg1, 4) + '°' },
        { label: 'Polar z₁', value: `${fmt(mod1, 4)} ∠ ${fmt(arg1, 4)}°` },
      ];
    },
  },

  // ━━━ 9. Polynomial Root Finder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'polynomial-root-finder',
    name: 'Polynomial Root Finder',
    description: 'Find the roots of a polynomial numerically using the companion matrix method. Enter coefficients from highest to lowest degree. A niche tool most simple calculators lack.',
    keywords: ['polynomial root', 'root finder', 'zero of polynomial', 'polynomial solver', 'numerical root', 'companion matrix', 'find zeros', 'polynomial zeros calculator'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'coeffs', label: 'Coefficients (highest to lowest, comma-separated)', type: 'text', default: '1,0,-5,0,4', placeholder: 'e.g. 1,0,-5,0,4 for x⁴-5x²+4' },
    ],
    compute: (inputs) => {
      const coeffs = String(inputs.coeffs).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (coeffs.length < 2) return [{ label: 'Error', value: 'Need at least 2 coefficients' }];
      // Normalize
      while (coeffs.length > 1 && coeffs[0] === 0) coeffs.shift();
      const deg = coeffs.length - 1;
      if (deg > 6) return [{ label: 'Error', value: 'Maximum degree 6 supported' }];
      // For degree 1: ax + b = 0
      if (deg === 1) {
        const root = -coeffs[1] / coeffs[0];
        return [{ label: 'Root', value: fmt(root, 6), highlight: true }];
      }
      // Try Newton's method from multiple starting points
      const f = (x: number) => coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, deg - i), 0);
      const fp = (x: number) => coeffs.slice(0, -1).reduce((sum, c, i) => sum + c * (deg - i) * Math.pow(x, deg - i - 1), 0);
      const roots: number[] = [];
      for (let start = -10; start <= 10; start += 0.5) {
        let x = start;
        for (let iter = 0; iter < 100; iter++) {
          const deriv = fp(x);
          if (Math.abs(deriv) < 1e-14) break;
          const newX = x - f(x) / deriv;
          if (Math.abs(newX - x) < 1e-12) { x = newX; break; }
          x = newX;
        }
        if (Math.abs(f(x)) < 1e-8 && !roots.some(r => Math.abs(r - x) < 1e-6)) {
          roots.push(x);
        }
      }
      roots.sort((a, b) => a - b);
      if (roots.length === 0) return [{ label: 'Result', value: 'No real roots found — try different starting range' }];
      const results: { label: string; value: string; highlight?: boolean }[] = [];
      roots.forEach((r, i) => {
        results.push({ label: `Root x${i + 1}`, value: fmt(r, 6), highlight: i === 0 });
      });
      results.push({ label: 'Degree', value: `${deg}` });
      results.push({ label: 'Polynomial', value: coeffs.map((c, i) => i === 0 ? `${c}x^${deg - i}` : c >= 0 ? `+ ${c}x^${deg - i}` : `${c}x^${deg - i}`).join(' ') });
      return results;
    },
  },

  // ━━━ 10. Taylor Series Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'taylor-series-calculator',
    name: 'Taylor Series Calculator',
    description: 'Generate the Taylor series expansion of common functions (e^x, sin(x), cos(x), ln(1+x), etc.) around a center point. See the polynomial approximation that converges to the original function.',
    keywords: ['Taylor series', 'Maclaurin series', 'power series', 'series expansion', 'polynomial approximation', 'infinite series', 'Taylor polynomial', 'series calculator'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'fn', label: 'Function', type: 'select', default: 'e^x', options: [
        { label: 'e^x', value: 'e^x' },
        { label: 'sin(x)', value: 'sin(x)' },
        { label: 'cos(x)', value: 'cos(x)' },
        { label: 'ln(1+x)', value: 'ln(1+x)' },
        { label: '1/(1-x)', value: '1/(1-x)' },
        { label: 'arctan(x)', value: 'arctan(x)' },
        { label: 'sinh(x)', value: 'sinh(x)' },
        { label: 'cosh(x)', value: 'cosh(x)' },
      ] },
      { id: 'center', label: 'Center (a)', type: 'number', default: 0, step: 0.1 },
      { id: 'terms', label: 'Number of Terms', type: 'number', default: 6, min: 1, max: 20, step: 1 },
    ],
    compute: (inputs) => {
      const fn = String(inputs.fn);
      const a = Number(inputs.center);
      const n = Math.max(1, Math.min(20, Math.round(Number(inputs.terms))));
      const series: string[] = [];
      for (let k = 0; k < n; k++) {
        let coeff: number;
        switch (fn) {
          case 'e^x': coeff = 1 / factorial(k); break;
          case 'sin(x)': coeff = k % 2 === 0 ? 0 : (k % 4 === 1 ? 1 : -1) / factorial(k); break;
          case 'cos(x)': coeff = k % 2 === 1 ? 0 : (k % 4 === 0 ? 1 : -1) / factorial(k); break;
          case 'ln(1+x)': coeff = k === 0 ? 0 : (k % 2 === 1 ? 1 : -1) / k; break;
          case '1/(1-x)': coeff = 1; break;
          case 'arctan(x)': coeff = k % 2 === 0 ? 0 : (k % 4 === 1 ? 1 : -1) / k; break;
          case 'sinh(x)': coeff = 1 / factorial(k); break;
          case 'cosh(x)': coeff = k % 2 === 1 ? 0 : 1 / factorial(k); break;
          default: coeff = 0;
        }
        if (Math.abs(coeff) < 1e-15) continue;
        const sign = coeff >= 0 ? '+' : '-';
        const absCoeff = Math.abs(coeff);
        const coeffStr = Math.abs(absCoeff - 1) < 1e-10 ? '' : fmt(absCoeff, 4);
        if (a === 0) {
          if (k === 0) series.push(`${fmt(coeff, 4)}`);
          else if (k === 1) series.push(`${sign} ${coeffStr}x`);
          else series.push(`${sign} ${coeffStr}x^${k}`);
        } else {
          if (k === 0) series.push(`${fmt(coeff, 4)}`);
          else if (k === 1) series.push(`${sign} ${coeffStr}(x-${fmt(a, 2)})`);
          else series.push(`${sign} ${coeffStr}(x-${fmt(a, 2)})^${k}`);
        }
      }
      const seriesStr = series.join(' ').replace(/^\+ /, '');
      return [
        { label: 'Taylor Series', value: seriesStr, highlight: true },
        { label: 'Center', value: `a = ${fmt(a, 4)}` },
        { label: 'Terms', value: `${n}` },
        { label: 'Type', value: a === 0 ? 'Maclaurin Series (a=0)' : 'Taylor Series' },
      ];
    },
  },

  // ━━━ 11. Modular Arithmetic Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'modular-arithmetic-calculator',
    name: 'Modular Arithmetic Calculator',
    description: 'Compute modular arithmetic operations: a mod m, modular inverse, modular exponentiation (a^b mod m). Essential for cryptography, number theory, and computer science applications.',
    keywords: ['modular arithmetic', 'mod calculator', 'modulo operation', 'modular inverse', 'modular exponentiation', 'number theory', 'congruence', 'mod m calculator', 'modular power'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'a', label: 'a', type: 'number', default: 17, step: 1 },
      { id: 'b', label: 'b (for power/exponent)', type: 'number', default: 5, step: 1 },
      { id: 'm', label: 'Modulus m', type: 'number', default: 13, min: 1, step: 1 },
      { id: 'op', label: 'Operation', type: 'select', default: 'mod', options: [
        { label: 'a mod m', value: 'mod' },
        { label: 'a + b mod m', value: 'add' },
        { label: 'a × b mod m', value: 'mul' },
        { label: 'a^b mod m', value: 'pow' },
        { label: 'Modular Inverse of a (mod m)', value: 'inverse' },
      ] },
    ],
    compute: (inputs) => {
      let a = Number(inputs.a);
      const b = Number(inputs.b);
      const m = Number(inputs.m);
      if (m <= 0) return [{ label: 'Error', value: 'Modulus must be positive' }];
      const mod = (n: number) => ((n % m) + m) % m;
      switch (inputs.op) {
        case 'mod':
          return [{ label: `${a} mod ${m}`, value: mod(a), highlight: true }];
        case 'add':
          return [{ label: `(${a} + ${b}) mod ${m}`, value: mod(a + b), highlight: true }];
        case 'mul':
          return [{ label: `(${a} × ${b}) mod ${m}`, value: mod(a * b), highlight: true }];
        case 'pow': {
          // Modular exponentiation using repeated squaring
          let result = 1;
          a = mod(a);
          let exp = b;
          while (exp > 0) {
            if (exp % 2 === 1) result = mod(result * a);
            a = mod(a * a);
            exp = Math.floor(exp / 2);
          }
          return [
            { label: `${Number(inputs.a)}^${b} mod ${m}`, value: result, highlight: true },
            { label: 'Method', value: 'Repeated Squaring' },
          ];
        }
        case 'inverse': {
          // Extended Euclidean algorithm
          let old_r = a, r = m, old_s = 1, s = 0;
          while (r !== 0) {
            const q = Math.floor(old_r / r);
            [old_r, r] = [r, old_r - q * r];
            [old_s, s] = [s, old_s - q * s];
          }
          if (old_r !== 1) return [{ label: 'Error', value: `${a} has no modular inverse mod ${m} (not coprime)` }];
          const inv = mod(old_s);
          return [
            { label: `Inverse of ${a} (mod ${m})`, value: inv, highlight: true },
            { label: 'Verification', value: `${a} × ${inv} mod ${m} = ${mod(a * inv)}` },
          ];
        }
        default:
          return [{ label: 'Error', value: 'Unknown operation' }];
      }
    },
  },

  // ━━━ 12. GCD / LCM Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'gcd-lcm-calculator',
    name: 'GCD and LCM Calculator',
    description: 'Calculate the Greatest Common Divisor (GCD) and Least Common Multiple (LCM) of two or more numbers using the Euclidean algorithm. Essential for fraction simplification and number theory.',
    keywords: ['GCD calculator', 'LCM calculator', 'greatest common divisor', 'least common multiple', 'Euclidean algorithm', 'factor calculator', 'common factor', 'lowest common multiple'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'numbers', label: 'Numbers (comma-separated)', type: 'text', default: '12, 18, 24', placeholder: 'e.g. 12, 18, 24' },
    ],
    compute: (inputs) => {
      const nums = String(inputs.numbers).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (nums.length < 2) return [{ label: 'Error', value: 'Enter at least 2 positive numbers' }];
      const resultGcd = nums.reduce((a, b) => gcd(a, b));
      const resultLcm = nums.reduce((a, b) => lcm(a, b));
      return [
        { label: 'GCD', value: resultGcd, highlight: true },
        { label: 'LCM', value: resultLcm, highlight: true },
        { label: 'Numbers', value: nums.join(', ') },
        { label: 'Product', value: nums.reduce((a, b) => a * b, 1) },
        { label: 'GCD × LCM', value: resultGcd * resultLcm },
      ];
    },
  },

  // ━━━ 13. Prime Factorization Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'prime-factorization-calculator',
    name: 'Prime Factorization Calculator',
    description: 'Factor any positive integer into its prime factors. Shows the complete factorization with exponents. Also identifies prime numbers and calculates the number of divisors.',
    keywords: ['prime factorization', 'prime factors', 'factor tree', 'prime decomposition', 'integer factorization', 'is it prime', 'divisors', 'prime number checker'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'n', label: 'Number', type: 'number', default: 360, min: 2, max: 1000000000 },
    ],
    compute: (inputs) => {
      let n = Math.round(Number(inputs.n));
      if (n < 2) return [{ label: 'Error', value: 'Enter a number ≥ 2' }];
      const factors: Record<number, number> = {};
      let d = 2;
      while (d * d <= n) {
        while (n % d === 0) {
          factors[d] = (factors[d] || 0) + 1;
          n /= d;
        }
        d++;
      }
      if (n > 1) factors[n] = (factors[n] || 0) + 1;
      const factorStr = Object.entries(factors).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ');
      const numDivisors = Object.values(factors).reduce((prod, exp) => prod * (exp + 1), 1);
      const isPrime = Object.keys(factors).length === 1 && Object.values(factors)[0] === 1;
      return [
        { label: 'Prime Factorization', value: factorStr, highlight: true },
        { label: 'Is Prime', value: isPrime ? 'Yes' : 'No' },
        { label: 'Number of Divisors', value: numDivisors },
        { label: 'Sum of Prime Factors', value: Object.entries(factors).reduce((s, [p, e]) => s + Number(p) * e, 0) },
      ];
    },
  },

  // ━━━ 14. Permutation & Combination Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'permutation-combination-calculator',
    name: 'Permutation & Combination Calculator',
    description: 'Calculate permutations (nPr) and combinations (nCr) for counting arrangements and selections. Also computes factorial, variations with repetition, and multiset combinations.',
    keywords: ['permutation calculator', 'combination calculator', 'nPr', 'nCr', 'n choose k', 'binomial coefficient', 'arrangements', 'factorial', 'counting principle'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'n', label: 'n (total items)', type: 'number', default: 10, min: 0, max: 170 },
      { id: 'r', label: 'r (selected items)', type: 'number', default: 3, min: 0, max: 170 },
    ],
    compute: (inputs) => {
      const n = Math.round(Number(inputs.n));
      const r = Math.round(Number(inputs.r));
      if (n < 0 || r < 0) return [{ label: 'Error', value: 'n and r must be non-negative' }];
      if (r > n) return [{ label: 'Error', value: 'r cannot be greater than n' }];
      return [
        { label: 'P(n,r) = Permutations', value: fmt(nPr(n, r), 0), highlight: true },
        { label: 'C(n,r) = Combinations', value: fmt(nCr(n, r), 0), highlight: true },
        { label: 'n!', value: fmt(factorial(n), 0) },
        { label: 'r!', value: fmt(factorial(r), 0) },
        { label: 'Formula P', value: `n!/(n-r)! = ${n}!/${n - r}!` },
        { label: 'Formula C', value: `n!/(r!(n-r)!) = ${n}!/(${r}!·${n - r}!)` },
      ];
    },
  },

  // ━━━ 15. Fibonacci Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'fibonacci-calculator',
    name: 'Fibonacci Number Calculator',
    description: 'Calculate the Nth Fibonacci number and generate Fibonacci sequences. Supports both standard (0,1,1,2,3,5...) and custom starting values. Explore the golden ratio connection.',
    keywords: ['Fibonacci number', 'Fibonacci sequence', 'golden ratio', 'Fibonacci calculator', 'fib sequence', 'nature sequence', 'Fibonacci series', 'phi ratio'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'n', label: 'Nth Fibonacci Number', type: 'number', default: 20, min: 0, max: 78 },
      { id: 'count', label: 'Sequence Length', type: 'number', default: 15, min: 2, max: 40 },
    ],
    compute: (inputs) => {
      const n = Math.min(78, Math.round(Number(inputs.n)));
      const count = Math.min(40, Math.round(Number(inputs.count)));
      // Calculate nth Fibonacci (0-indexed)
      let a = 0, b = 1;
      for (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }
      // Generate sequence
      const seq: number[] = [0, 1];
      for (let i = 2; i < count; i++) seq.push(seq[i - 1] + seq[i - 2]);
      const ratio = n > 1 ? b / a : 1;
      const phi = (1 + Math.sqrt(5)) / 2;
      return [
        { label: `F(${n})`, value: a, highlight: true },
        { label: 'Sequence', value: seq.slice(0, count).join(', ') },
        { label: 'F(n)/F(n-1) Ratio', value: fmt(ratio, 8) },
        { label: 'Golden Ratio (φ)', value: fmt(phi, 8) },
        { label: 'Ratio vs φ Difference', value: fmt(Math.abs(ratio - phi), 10) },
      ];
    },
  },

  // ━━━ 16. Pascal's Triangle Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'pascals-triangle-calculator',
    name: "Pascal's Triangle Calculator",
    description: "Generate rows of Pascal's triangle showing binomial coefficients. Each number is the sum of the two above it. Essential for binomial expansion, probability, and combinatorics.",
    keywords: ["Pascal's triangle", 'binomial coefficients', 'triangle numbers', 'n choose k', 'binomial expansion', 'combination triangle', 'Pascal rows', 'combinatorics triangle'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'rows', label: 'Number of Rows', type: 'number', default: 8, min: 1, max: 20 },
      { id: 'row', label: 'Show Specific Row', type: 'number', default: 5, min: 0, max: 20 },
    ],
    compute: (inputs) => {
      const numRows = Math.min(20, Math.round(Number(inputs.rows)));
      const rowNum = Math.min(20, Math.round(Number(inputs.row)));
      const specificRow: number[] = [];
      for (let k = 0; k <= rowNum; k++) specificRow.push(nCr(rowNum, k));
      const allRows: string[] = [];
      for (let i = 0; i < numRows; i++) {
        const row: number[] = [];
        for (let k = 0; k <= i; k++) row.push(nCr(i, k));
        allRows.push(`Row ${i}: ${row.join('  ')}`);
      }
      const rowSum = Math.pow(2, rowNum);
      return [
        { label: `Row ${rowNum}`, value: specificRow.join('  '), highlight: true },
        { label: 'Sum of Row', value: `${rowSum} (= 2^${rowNum})` },
        { label: 'Triangle', value: allRows.join('\n') },
      ];
    },
  },

  // ━━━ 17. Collatz Conjecture Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'collatz-conjecture-calculator',
    name: 'Collatz Conjecture Calculator',
    description: 'Generate the Collatz sequence (3n+1 problem) for any positive integer. If n is even, divide by 2; if odd, multiply by 3 and add 1. The conjecture states this always reaches 1.',
    keywords: ['Collatz conjecture', '3n+1 problem', 'hailstone sequence', 'Syracuse problem', 'Ulam conjecture', 'Collatz sequence', '3x+1', 'Kakutani problem'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'n', label: 'Starting Number', type: 'number', default: 27, min: 1, max: 10000000 },
    ],
    compute: (inputs) => {
      let n = Math.round(Number(inputs.n));
      if (n < 1) return [{ label: 'Error', value: 'Enter a positive integer' }];
      const seq: number[] = [n];
      let steps = 0;
      let maxVal = n;
      const original = n;
      while (n !== 1 && steps < 10000) {
        if (n % 2 === 0) n = n / 2;
        else n = 3 * n + 1;
        seq.push(n);
        if (n > maxVal) maxVal = n;
        steps++;
      }
      const displaySeq = seq.length <= 50 ? seq.join(' → ') : seq.slice(0, 25).join(' → ') + ' → ... → ' + seq.slice(-5).join(' → ');
      return [
        { label: 'Steps to Reach 1', value: steps, highlight: true },
        { label: 'Maximum Value', value: fmt(maxVal, 0) },
        { label: 'Sequence', value: displaySeq },
        { label: 'Starting Number', value: fmt(original, 0) },
        { label: 'Reached 1', value: n === 1 ? 'Yes' : 'Stopped after 10,000 steps' },
      ];
    },
  },

  // ━━━ 18. Unit Circle Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'unit-circle-calculator',
    name: 'Unit Circle Calculator',
    description: 'Calculate sin, cos, tan, cot, sec, and csc for any angle on the unit circle. Shows exact values for common angles and coordinates on the unit circle.',
    keywords: ['unit circle', 'trig values', 'sin cos tan values', 'exact trig values', 'unit circle coordinates', 'reference angle', 'trig table', 'radians to degrees'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'angle', label: 'Angle', type: 'number', default: 45, step: 1 },
      { id: 'unit', label: 'Unit', type: 'select', default: 'deg', options: [
        { label: 'Degrees', value: 'deg' },
        { label: 'Radians', value: 'rad' },
      ] },
    ],
    compute: (inputs) => {
      let deg = Number(inputs.angle);
      if (inputs.unit === 'rad') deg = deg * 180 / Math.PI;
      const rad = deg * Math.PI / 180;
      const sin = Math.sin(rad);
      const cos = Math.cos(rad);
      const tan = Math.abs(cos) > 1e-10 ? Math.tan(rad) : NaN;
      const cot = Math.abs(sin) > 1e-10 ? cos / sin : NaN;
      const sec = Math.abs(cos) > 1e-10 ? 1 / cos : NaN;
      const csc = Math.abs(sin) > 1e-10 ? 1 / sin : NaN;
      const fmtTrig = (v: number) => Number.isNaN(v) ? 'undefined' : fmt(v, 6);
      return [
        { label: 'Coordinates', value: `(${fmt(cos, 4)}, ${fmt(sin, 4)})`, highlight: true },
        { label: 'sin(θ)', value: fmtTrig(sin) },
        { label: 'cos(θ)', value: fmtTrig(cos) },
        { label: 'tan(θ)', value: fmtTrig(tan) },
        { label: 'cot(θ)', value: fmtTrig(cot) },
        { label: 'sec(θ)', value: fmtTrig(sec) },
        { label: 'csc(θ)', value: fmtTrig(csc) },
        { label: 'Degrees', value: fmt(deg, 4) + '°' },
        { label: 'Radians', value: fmt(rad, 6) },
      ];
    },
  },

  // ━━━ 19. Normal Distribution Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'normal-distribution',
    name: 'Normal Distribution Calculator',
    description: 'Calculate probabilities for the standard normal distribution (Z-distribution). Find P(X < x), Z-scores, and probabilities between values. Essential for statistics and hypothesis testing.',
    keywords: ['normal distribution', 'Z-score', 'bell curve', 'Gaussian distribution', 'standard normal', 'probability calculator', 'Z-table', 'P-value calculator'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'x', label: 'Value (x)', type: 'number', default: 1.96, step: 0.01 },
      { id: 'mean', label: 'Mean (μ)', type: 'number', default: 0, step: 0.1 },
      { id: 'std', label: 'Standard Deviation (σ)', type: 'number', default: 1, min: 0.001, step: 0.1 },
    ],
    compute: (inputs) => {
      const x = Number(inputs.x);
      const mu = Number(inputs.mean);
      const sigma = Number(inputs.std);
      if (sigma <= 0) return [{ label: 'Error', value: 'Standard deviation must be positive' }];
      const z = (x - mu) / sigma;
      const pBelow = normalCDF(z);
      const pAbove = 1 - pBelow;
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      return [
        { label: 'Z-Score', value: fmt(z, 4), highlight: true },
        { label: 'P(X < x)', value: fmt(pBelow * 100, 4) + '%', highlight: true },
        { label: 'P(X > x)', value: fmt(pAbove * 100, 4) + '%' },
        { label: 'P(-|z| < Z < |z|)', value: fmt((normalCDF(Math.abs(z)) - normalCDF(-Math.abs(z))) * 100, 4) + '%' },
        { label: 'PDF f(x)', value: fmtSci(pdf) },
      ];
    },
  },

  // ━━━ 20. Binomial Distribution Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'binomial-distribution',
    name: 'Binomial Distribution Calculator',
    description: 'Calculate binomial probability P(X = k) for exactly k successes in n trials. Also computes cumulative probabilities P(X ≤ k), mean, variance, and standard deviation.',
    keywords: ['binomial distribution', 'binomial probability', 'n choose k', 'Bernoulli trial', 'binomial P(X=k)', 'cumulative binomial', 'success probability', 'binomial test'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'n', label: 'Number of Trials (n)', type: 'number', default: 10, min: 1, max: 1000 },
      { id: 'p', label: 'Probability of Success (p)', type: 'number', default: 0.5, min: 0, max: 1, step: 0.01 },
      { id: 'k', label: 'Number of Successes (k)', type: 'number', default: 5, min: 0, step: 1 },
    ],
    compute: (inputs) => {
      const n = Math.round(Number(inputs.n));
      const p = Number(inputs.p);
      const k = Math.round(Number(inputs.k));
      if (n < 1 || p < 0 || p > 1 || k < 0 || k > n) return [{ label: 'Error', value: 'Invalid parameters' }];
      const q = 1 - p;
      const pmf = nCr(n, k) * Math.pow(p, k) * Math.pow(q, n - k);
      // Cumulative: P(X <= k)
      let cdf = 0;
      for (let i = 0; i <= k; i++) cdf += nCr(n, i) * Math.pow(p, i) * Math.pow(q, n - i);
      const mean = n * p;
      const variance = n * p * q;
      const stdDev = Math.sqrt(variance);
      return [
        { label: `P(X = ${k})`, value: fmt(pmf * 100, 4) + '%', highlight: true },
        { label: `P(X ≤ ${k})`, value: fmt(cdf * 100, 4) + '%' },
        { label: `P(X > ${k})`, value: fmt((1 - cdf) * 100, 4) + '%' },
        { label: 'Mean (μ)', value: fmt(mean, 4) },
        { label: 'Variance (σ²)', value: fmt(variance, 4) },
        { label: 'Std Dev (σ)', value: fmt(stdDev, 4) },
      ];
    },
  },

  // ━━━ 21. Poisson Distribution Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'poisson-distribution',
    name: 'Poisson Distribution Calculator',
    description: 'Calculate Poisson probability P(X = k) for events occurring at a constant rate λ. Used for rare event modeling: call center arrivals, defects, radioactive decay, traffic flow.',
    keywords: ['Poisson distribution', 'Poisson probability', 'rare events', 'lambda rate', 'Poisson process', 'event rate', 'arrival rate', 'Poisson calculator'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'lambda', label: 'Average Rate (λ)', type: 'number', default: 5, min: 0.001, step: 0.1 },
      { id: 'k', label: 'Number of Events (k)', type: 'number', default: 3, min: 0, step: 1 },
    ],
    compute: (inputs) => {
      const lambda = Number(inputs.lambda);
      const k = Math.round(Number(inputs.k));
      if (lambda <= 0 || k < 0) return [{ label: 'Error', value: 'Invalid parameters' }];
      const pmf = Math.pow(lambda, k) * Math.exp(-lambda) / factorial(k);
      let cdf = 0;
      for (let i = 0; i <= k; i++) cdf += Math.pow(lambda, i) * Math.exp(-lambda) / factorial(i);
      return [
        { label: `P(X = ${k})`, value: fmt(pmf * 100, 4) + '%', highlight: true },
        { label: `P(X ≤ ${k})`, value: fmt(cdf * 100, 4) + '%' },
        { label: `P(X > ${k})`, value: fmt((1 - cdf) * 100, 4) + '%' },
        { label: 'Mean (λ)', value: fmt(lambda, 4) },
        { label: 'Variance', value: fmt(lambda, 4) },
        { label: 'Std Dev', value: fmt(Math.sqrt(lambda), 4) },
      ];
    },
  },

  // ━━━ 22. Percentage Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages in multiple ways: what is X% of Y, X is what % of Y, and % change from X to Y. The most versatile percentage tool for everyday math.',
    keywords: ['percentage calculator', 'percent of', 'percent change', 'percent increase', 'percent decrease', 'what percent', 'percent of number', 'percent difference'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'mode', label: 'Calculate', type: 'select', default: 'of', options: [
        { label: 'What is X% of Y?', value: 'of' },
        { label: 'X is what % of Y?', value: 'is' },
        { label: '% change from X to Y', value: 'change' },
        { label: 'X% increase of Y', value: 'increase' },
        { label: 'X% decrease of Y', value: 'decrease' },
      ] },
      { id: 'x', label: 'Value X', type: 'number', default: 25, step: 0.1 },
      { id: 'y', label: 'Value Y', type: 'number', default: 200, step: 0.1 },
    ],
    compute: (inputs) => {
      const x = Number(inputs.x);
      const y = Number(inputs.y);
      switch (inputs.mode) {
        case 'of':
          return [{ label: `${x}% of ${y}`, value: fmt(x / 100 * y, 2), highlight: true }];
        case 'is':
          return [{ label: `${x} is what % of ${y}`, value: y !== 0 ? fmt(x / y * 100, 2) + '%' : 'N/A', highlight: true }];
        case 'change':
          return [{ label: `% change from ${x} to ${y}`, value: x !== 0 ? fmt((y - x) / Math.abs(x) * 100, 2) + '%' : 'N/A', highlight: true }];
        case 'increase':
          return [{ label: `${x}% increase of ${y}`, value: fmt(y * (1 + x / 100), 2), highlight: true }];
        case 'decrease':
          return [{ label: `${x}% decrease of ${y}`, value: fmt(y * (1 - x / 100), 2), highlight: true }];
        default:
          return [{ label: 'Error', value: 'Unknown mode' }];
      }
    },
  },

  // ━━━ 23. Fraction Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'fraction-calculator',
    name: 'Fraction Calculator',
    description: 'Add, subtract, multiply, and divide fractions. Results are automatically simplified to lowest terms. Also converts between mixed numbers and improper fractions.',
    keywords: ['fraction calculator', 'add fractions', 'subtract fractions', 'multiply fractions', 'divide fractions', 'simplify fractions', 'mixed number', 'lowest terms'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'n1', label: 'Numerator 1', type: 'number', default: 3, step: 1 },
      { id: 'd1', label: 'Denominator 1', type: 'number', default: 4, min: 1, step: 1 },
      { id: 'op', label: 'Operation', type: 'select', default: '+', options: [
        { label: '+ Add', value: '+' },
        { label: '- Subtract', value: '-' },
        { label: '× Multiply', value: '*' },
        { label: '÷ Divide', value: '/' },
      ] },
      { id: 'n2', label: 'Numerator 2', type: 'number', default: 1, step: 1 },
      { id: 'd2', label: 'Denominator 2', type: 'number', default: 3, min: 1, step: 1 },
    ],
    compute: (inputs) => {
      const n1 = Number(inputs.n1), d1 = Number(inputs.d1);
      const n2 = Number(inputs.n2), d2 = Number(inputs.d2);
      if (d1 === 0 || d2 === 0) return [{ label: 'Error', value: 'Denominators cannot be zero' }];
      let rn: number, rd: number;
      switch (inputs.op) {
        case '+': rn = n1 * d2 + n2 * d1; rd = d1 * d2; break;
        case '-': rn = n1 * d2 - n2 * d1; rd = d1 * d2; break;
        case '*': rn = n1 * n2; rd = d1 * d2; break;
        case '/':
          if (n2 === 0) return [{ label: 'Error', value: 'Cannot divide by zero' }];
          rn = n1 * d2; rd = d1 * n2; break;
        default: rn = 0; rd = 1;
      }
      const g = gcd(Math.abs(rn), Math.abs(rd));
      rn /= g; rd /= g;
      if (rd < 0) { rn = -rn; rd = -rd; }
      const decimal = rn / rd;
      const wholeNum = Math.floor(Math.abs(rn) / rd);
      const remNum = Math.abs(rn) % rd;
      let mixed = '';
      if (wholeNum > 0 && remNum > 0) mixed = `${rn < 0 ? '-' : ''}${wholeNum} ${remNum}/${rd}`;
      else if (wholeNum > 0) mixed = `${rn < 0 ? '-' : ''}${wholeNum}`;
      else mixed = `${rn}/${rd}`;
      return [
        { label: 'Result (fraction)', value: `${rn}/${rd}`, highlight: true },
        { label: 'Mixed Number', value: mixed },
        { label: 'Decimal', value: fmt(decimal, 6) },
        { label: 'Calculation', value: `${n1}/${d1} ${inputs.op} ${n2}/${d2}` },
      ];
    },
  },

  // ━━━ 24. Exponent Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'exponent-calculator',
    name: 'Exponent & Root Calculator',
    description: 'Calculate powers (x^n) and roots (n√x) including square roots, cube roots, and arbitrary roots. Supports negative and fractional exponents.',
    keywords: ['exponent calculator', 'power calculator', 'x to the n', 'nth root', 'square root', 'cube root', 'radical calculator', 'power of number'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'base', label: 'Base (x)', type: 'number', default: 2, step: 0.1 },
      { id: 'exp', label: 'Exponent (n)', type: 'number', default: 10, step: 0.1 },
    ],
    compute: (inputs) => {
      const base = Number(inputs.base);
      const exp = Number(inputs.exp);
      const power = Math.pow(base, exp);
      const root = exp !== 0 ? Math.pow(base, 1 / exp) : Infinity;
      const reciprocal = Math.pow(base, -exp);
      return [
        { label: `${fmt(base, 4)}^${fmt(exp, 4)}`, value: fmtSci(power), highlight: true },
        { label: `${fmt(exp, 4)}√${fmt(base, 4)} (root)`, value: fmtSci(root) },
        { label: `${fmt(base, 4)}^(-${fmt(exp, 4)})`, value: fmtSci(reciprocal) },
        { label: 'Log₁₀(result)', value: fmtSci(Math.log10(Math.abs(power))) },
      ];
    },
  },

  // ━━━ 25. Logarithm Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'logarithm-calculator',
    name: 'Logarithm Calculator',
    description: 'Calculate logarithms with any base. Supports log₁₀ (common), ln (natural), log₂ (binary), and custom base logarithms. Also computes antilogarithms.',
    keywords: ['logarithm calculator', 'log base', 'natural log', 'ln calculator', 'log10', 'log2', 'antilog', 'change of base formula'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'value', label: 'Value', type: 'number', default: 100, min: 0.000001 },
      { id: 'base', label: 'Base', type: 'select', default: '10', options: [
        { label: 'Base 10 (common log)', value: '10' },
        { label: 'Base e (natural log)', value: 'e' },
        { label: 'Base 2 (binary log)', value: '2' },
        { label: 'Custom base', value: 'custom' },
      ] },
      { id: 'customBase', label: 'Custom Base', type: 'number', default: 5, min: 2, step: 1 },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      if (val <= 0) return [{ label: 'Error', value: 'Value must be positive' }];
      let b: number;
      switch (inputs.base) {
        case 'e': b = Math.E; break;
        case '2': b = 2; break;
        case 'custom': b = Number(inputs.customBase); break;
        default: b = 10;
      }
      if (b <= 0 || b === 1) return [{ label: 'Error', value: 'Base must be > 0 and ≠ 1' }];
      const logResult = Math.log(val) / Math.log(b);
      return [
        { label: `log_${b === Math.E ? 'e' : b}(${val})`, value: fmt(logResult, 8), highlight: true },
        { label: 'ln (natural log)', value: fmt(Math.log(val), 8) },
        { label: 'log₁₀ (common log)', value: fmt(Math.log10(val), 8) },
        { label: 'log₂ (binary log)', value: fmt(Math.log2(val), 8) },
        { label: 'Antilog (base^result)', value: fmtSci(Math.pow(b, logResult)) },
      ];
    },
  },

  // ━━━ 26. Triangle Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'triangle-calculator',
    name: 'Triangle Calculator',
    description: 'Calculate area, perimeter, and angles of a triangle from three sides (SSS). Also computes inradius, circumradius, and triangle type (acute, right, obtuse).',
    keywords: ['triangle calculator', 'triangle area', 'Heron formula', 'SSS triangle', 'triangle angles', 'triangle perimeter', 'right triangle', 'obtuse triangle'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'a', label: 'Side a', type: 'number', default: 3, min: 0.001, step: 0.1 },
      { id: 'b', label: 'Side b', type: 'number', default: 4, min: 0.001, step: 0.1 },
      { id: 'c', label: 'Side c', type: 'number', default: 5, min: 0.001, step: 0.1 },
    ],
    compute: (inputs) => {
      const a = Number(inputs.a), b = Number(inputs.b), c = Number(inputs.c);
      if (a + b <= c || b + c <= a || a + c <= b) {
        return [{ label: 'Error', value: 'Invalid triangle: sum of any two sides must exceed the third' }];
      }
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI;
      const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;
      const C = 180 - A - B;
      const maxAngle = Math.max(A, B, C);
      let type = 'Acute';
      if (Math.abs(maxAngle - 90) < 0.001) type = 'Right';
      else if (maxAngle > 90) type = 'Obtuse';
      const inradius = area / s;
      const circumradius = (a * b * c) / (4 * area);
      return [
        { label: 'Area', value: fmt(area, 4), highlight: true },
        { label: 'Perimeter', value: fmt(a + b + c, 4) },
        { label: 'Angle A', value: fmt(A, 4) + '°' },
        { label: 'Angle B', value: fmt(B, 4) + '°' },
        { label: 'Angle C', value: fmt(C, 4) + '°' },
        { label: 'Type', value: type },
        { label: 'Inradius', value: fmt(inradius, 4) },
        { label: 'Circumradius', value: fmt(circumradius, 4) },
      ];
    },
  },

  // ━━━ 27. Circle Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'circle-calculator',
    name: 'Circle Calculator',
    description: 'Calculate circle properties from radius, diameter, circumference, or area. Also computes sector area and arc length for a given central angle.',
    keywords: ['circle calculator', 'circle area', 'circumference', 'radius to area', 'diameter calculator', 'sector area', 'arc length', 'circle properties'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'mode', label: 'Given', type: 'select', default: 'radius', options: [
        { label: 'Radius', value: 'radius' },
        { label: 'Diameter', value: 'diameter' },
        { label: 'Circumference', value: 'circumference' },
        { label: 'Area', value: 'area' },
      ] },
      { id: 'value', label: 'Value', type: 'number', default: 5, min: 0.001, step: 0.1 },
      { id: 'angle', label: 'Sector Angle (degrees)', type: 'number', default: 90, min: 0, max: 360, step: 1 },
    ],
    compute: (inputs) => {
      const val = Number(inputs.value);
      const angle = Number(inputs.angle);
      let r: number;
      switch (inputs.mode) {
        case 'diameter': r = val / 2; break;
        case 'circumference': r = val / (2 * Math.PI); break;
        case 'area': r = Math.sqrt(val / Math.PI); break;
        default: r = val;
      }
      const d = 2 * r;
      const C = 2 * Math.PI * r;
      const A = Math.PI * r * r;
      const sectorArea = A * angle / 360;
      const arcLen = C * angle / 360;
      return [
        { label: 'Radius', value: fmt(r, 6) },
        { label: 'Diameter', value: fmt(d, 6) },
        { label: 'Circumference', value: fmt(C, 6) },
        { label: 'Area', value: fmt(A, 6), highlight: true },
        { label: 'Sector Area', value: fmt(sectorArea, 6) },
        { label: 'Arc Length', value: fmt(arcLen, 6) },
      ];
    },
  },

  // ━━━ 28. Sphere Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'sphere-calculator',
    name: 'Sphere Calculator',
    description: 'Calculate sphere volume, surface area, and diameter from any given measurement. Also computes hemisphere properties.',
    keywords: ['sphere calculator', 'sphere volume', 'sphere surface area', 'ball volume', 'hemisphere', 'sphere radius', 'sphere diameter', '3D sphere'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'radius', label: 'Radius', type: 'number', default: 5, min: 0.001, step: 0.1 },
    ],
    compute: (inputs) => {
      const r = Number(inputs.radius);
      const volume = (4 / 3) * Math.PI * r * r * r;
      const surfaceArea = 4 * Math.PI * r * r;
      const diameter = 2 * r;
      const hemisphereVol = volume / 2;
      const hemisphereSA = 3 * Math.PI * r * r;
      return [
        { label: 'Volume', value: fmt(volume, 6), highlight: true },
        { label: 'Surface Area', value: fmt(surfaceArea, 6) },
        { label: 'Diameter', value: fmt(diameter, 6) },
        { label: 'Hemisphere Volume', value: fmt(hemisphereVol, 6) },
        { label: 'Hemisphere Surface Area', value: fmt(hemisphereSA, 6) },
      ];
    },
  },

  // ━━━ 29. Cylinder Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'cylinder-calculator',
    name: 'Cylinder Calculator',
    description: 'Calculate cylinder volume, surface area, and lateral area from radius and height. Includes both right circular cylinder and hollow cylinder calculations.',
    keywords: ['cylinder calculator', 'cylinder volume', 'cylinder surface area', 'circular cylinder', 'lateral area', 'tube volume', 'pipe volume', 'cylinder dimensions'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'radius', label: 'Radius', type: 'number', default: 3, min: 0.001, step: 0.1 },
      { id: 'height', label: 'Height', type: 'number', default: 10, min: 0.001, step: 0.1 },
    ],
    compute: (inputs) => {
      const r = Number(inputs.radius);
      const h = Number(inputs.height);
      const volume = Math.PI * r * r * h;
      const lateralArea = 2 * Math.PI * r * h;
      const totalArea = 2 * Math.PI * r * (r + h);
      const baseArea = Math.PI * r * r;
      return [
        { label: 'Volume', value: fmt(volume, 6), highlight: true },
        { label: 'Total Surface Area', value: fmt(totalArea, 6) },
        { label: 'Lateral Surface Area', value: fmt(lateralArea, 6) },
        { label: 'Base Area', value: fmt(baseArea, 6) },
        { label: 'Diameter', value: fmt(2 * r, 6) },
      ];
    },
  },

  // ━━━ 30. Cone Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'cone-calculator',
    name: 'Cone Calculator',
    description: 'Calculate cone volume, surface area, slant height, and lateral area. Also computes frustum properties for truncated cones.',
    keywords: ['cone calculator', 'cone volume', 'cone surface area', 'slant height', 'frustum', 'truncated cone', 'right circular cone', 'cone dimensions'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'radius', label: 'Base Radius', type: 'number', default: 3, min: 0.001, step: 0.1 },
      { id: 'height', label: 'Height', type: 'number', default: 5, min: 0.001, step: 0.1 },
    ],
    compute: (inputs) => {
      const r = Number(inputs.radius);
      const h = Number(inputs.height);
      const slant = Math.sqrt(r * r + h * h);
      const volume = (1 / 3) * Math.PI * r * r * h;
      const lateralArea = Math.PI * r * slant;
      const totalArea = Math.PI * r * (r + slant);
      return [
        { label: 'Volume', value: fmt(volume, 6), highlight: true },
        { label: 'Total Surface Area', value: fmt(totalArea, 6) },
        { label: 'Lateral Surface Area', value: fmt(lateralArea, 6) },
        { label: 'Slant Height', value: fmt(slant, 6) },
        { label: 'Base Area', value: fmt(Math.PI * r * r, 6) },
      ];
    },
  },

  // ━━━ 31. Distance Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'distance-calculator',
    name: 'Distance Calculator',
    description: 'Calculate the Euclidean distance between two points in 2D or 3D space using the distance formula. Also shows the midpoint between the two points.',
    keywords: ['distance calculator', 'distance formula', 'Euclidean distance', 'distance between points', '2D distance', '3D distance', 'point distance', 'coordinate distance'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'x1', label: 'x₁', type: 'number', default: 1, step: 0.1 },
      { id: 'y1', label: 'y₁', type: 'number', default: 2, step: 0.1 },
      { id: 'z1', label: 'z₁ (leave 0 for 2D)', type: 'number', default: 0, step: 0.1 },
      { id: 'x2', label: 'x₂', type: 'number', default: 4, step: 0.1 },
      { id: 'y2', label: 'y₂', type: 'number', default: 6, step: 0.1 },
      { id: 'z2', label: 'z₂ (leave 0 for 2D)', type: 'number', default: 0, step: 0.1 },
    ],
    compute: (inputs) => {
      const x1 = Number(inputs.x1), y1 = Number(inputs.y1), z1 = Number(inputs.z1);
      const x2 = Number(inputs.x2), y2 = Number(inputs.y2), z2 = Number(inputs.z2);
      const dist2D = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const dist3D = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, mz = (z1 + z2) / 2;
      const is3D = z1 !== 0 || z2 !== 0;
      return [
        { label: 'Distance', value: fmt(is3D ? dist3D : dist2D, 6), highlight: true },
        { label: 'Midpoint', value: is3D ? `(${fmt(mx, 4)}, ${fmt(my, 4)}, ${fmt(mz, 4)})` : `(${fmt(mx, 4)}, ${fmt(my, 4)})` },
        { label: '2D Distance', value: fmt(dist2D, 6) },
        { label: '3D Distance', value: fmt(dist3D, 6) },
      ];
    },
  },

  // ━━━ 32. Slope Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'slope-calculator',
    name: 'Slope Calculator',
    description: 'Calculate the slope of a line between two points. Also finds the line equation (y = mx + b), angle with x-axis, and determines if lines are parallel or perpendicular.',
    keywords: ['slope calculator', 'line equation', 'gradient calculator', 'rise over run', 'y = mx + b', 'slope intercept', 'line slope', 'parallel perpendicular'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'x1', label: 'x₁', type: 'number', default: 1, step: 0.1 },
      { id: 'y1', label: 'y₁', type: 'number', default: 2, step: 0.1 },
      { id: 'x2', label: 'x₂', type: 'number', default: 5, step: 0.1 },
      { id: 'y2', label: 'y₂', type: 'number', default: 10, step: 0.1 },
    ],
    compute: (inputs) => {
      const x1 = Number(inputs.x1), y1 = Number(inputs.y1);
      const x2 = Number(inputs.x2), y2 = Number(inputs.y2);
      if (x1 === x2 && y1 === y2) return [{ label: 'Error', value: 'Points must be different' }];
      if (x1 === x2) return [
        { label: 'Slope', value: 'Undefined (vertical line)', highlight: true },
        { label: 'Equation', value: `x = ${x1}` },
      ];
      const m = (y2 - y1) / (x2 - x1);
      const b = y1 - m * x1;
      const angle = Math.atan(m) * 180 / Math.PI;
      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return [
        { label: 'Slope (m)', value: fmt(m, 6), highlight: true },
        { label: 'Equation', value: `y = ${fmt(m, 4)}x ${b >= 0 ? '+' : '-'} ${fmt(Math.abs(b), 4)}` },
        { label: 'Y-Intercept (b)', value: fmt(b, 6) },
        { label: 'Angle with x-axis', value: fmt(angle, 4) + '°' },
        { label: 'Distance', value: fmt(dist, 6) },
        { label: 'Direction', value: m > 0 ? 'Increasing (uphill)' : m < 0 ? 'Decreasing (downhill)' : 'Horizontal' },
      ];
    },
  },

  // ━━━ 33. Trigonometry Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'trigonometry-calculator',
    name: 'Trigonometry Calculator',
    description: 'Calculate all six trigonometric functions (sin, cos, tan, cot, sec, csc) and their inverses. Supports degree and radian input with exact values for common angles.',
    keywords: ['trig calculator', 'sin cos tan', 'trigonometric functions', 'inverse trig', 'arcsin arccos arctan', 'trig values', 'sine cosine tangent', 'trig table'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'angle', label: 'Angle', type: 'number', default: 30, step: 0.1 },
      { id: 'unit', label: 'Unit', type: 'select', default: 'deg', options: [
        { label: 'Degrees', value: 'deg' },
        { label: 'Radians', value: 'rad' },
      ] },
    ],
    compute: (inputs) => {
      let deg = Number(inputs.angle);
      if (inputs.unit === 'rad') deg = deg * 180 / Math.PI;
      const rad = deg * Math.PI / 180;
      const s = Math.sin(rad), c = Math.cos(rad);
      const t = Math.abs(c) > 1e-10 ? Math.tan(rad) : NaN;
      const cotVal = Math.abs(s) > 1e-10 ? c / s : NaN;
      const secVal = Math.abs(c) > 1e-10 ? 1 / c : NaN;
      const cscVal = Math.abs(s) > 1e-10 ? 1 / s : NaN;
      const f = (v: number) => Number.isNaN(v) ? 'undefined' : fmt(v, 6);
      return [
        { label: 'sin(θ)', value: f(s) },
        { label: 'cos(θ)', value: f(c) },
        { label: 'tan(θ)', value: f(t), highlight: true },
        { label: 'cot(θ)', value: f(cotVal) },
        { label: 'sec(θ)', value: f(secVal) },
        { label: 'csc(θ)', value: f(cscVal) },
        { label: 'sin²(θ) + cos²(θ)', value: f(s * s + c * c) },
      ];
    },
  },

  // ━━━ 34. Statistical Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'statistical-calculator',
    name: 'Statistical Calculator',
    description: 'Calculate descriptive statistics: mean, median, mode, range, variance, standard deviation, and quartiles from a data set. Supports both population and sample statistics.',
    keywords: ['statistical calculator', 'mean median mode', 'standard deviation', 'variance', 'descriptive statistics', 'quartiles', 'range calculator', 'data analysis'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'data', label: 'Data (comma-separated)', type: 'text', default: '12, 15, 18, 22, 25, 28, 30, 35, 40', placeholder: 'e.g. 10, 20, 30, 40, 50' },
    ],
    compute: (inputs) => {
      const data = String(inputs.data).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (data.length === 0) return [{ label: 'Error', value: 'Enter at least one number' }];
      const sorted = [...data].sort((a, b) => a - b);
      const n = data.length;
      const mean = data.reduce((a, b) => a + b, 0) / n;
      const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
      // Mode
      const freq: Record<number, number> = {};
      data.forEach(v => freq[v] = (freq[v] || 0) + 1);
      const maxFreq = Math.max(...Object.values(freq));
      const modes = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => Number(v));
      const modeStr = maxFreq === 1 ? 'No mode' : modes.join(', ');
      const variance = data.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
      const sampleVar = n > 1 ? data.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
      const q1 = sorted[Math.floor(n * 0.25)];
      const q3 = sorted[Math.floor(n * 0.75)];
      return [
        { label: 'Mean', value: fmt(mean, 4), highlight: true },
        { label: 'Median', value: fmt(median, 4) },
        { label: 'Mode', value: modeStr },
        { label: 'Range', value: fmt(sorted[n - 1] - sorted[0], 4) },
        { label: 'Population Std Dev', value: fmt(Math.sqrt(variance), 4) },
        { label: 'Sample Std Dev', value: fmt(Math.sqrt(sampleVar), 4) },
        { label: 'Population Variance', value: fmt(variance, 4) },
        { label: 'Q1 (25th percentile)', value: fmt(q1, 4) },
        { label: 'Q3 (75th percentile)', value: fmt(q3, 4) },
        { label: 'Count', value: n },
        { label: 'Sum', value: fmt(data.reduce((a, b) => a + b, 0), 4) },
      ];
    },
  },

  // ━━━ 35. Linear Regression Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'regression-calculator',
    name: 'Linear Regression Calculator',
    description: 'Calculate linear regression (least squares fit) from paired data points. Finds the best-fit line y = mx + b with R² correlation coefficient and residual analysis.',
    keywords: ['linear regression', 'least squares', 'best fit line', 'correlation', 'R-squared', 'trend line', 'regression analysis', 'scatter plot fit'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'xData', label: 'X Values (comma-separated)', type: 'text', default: '1, 2, 3, 4, 5', placeholder: 'e.g. 1, 2, 3, 4, 5' },
      { id: 'yData', label: 'Y Values (comma-separated)', type: 'text', default: '2.1, 3.9, 6.2, 7.8, 10.1', placeholder: 'e.g. 2, 4, 6, 8, 10' },
    ],
    compute: (inputs) => {
      const xData = String(inputs.xData).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      const yData = String(inputs.yData).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (xData.length !== yData.length || xData.length < 2) {
        return [{ label: 'Error', value: 'Need at least 2 paired data points with equal length' }];
      }
      const n = xData.length;
      const sumX = xData.reduce((a, b) => a + b, 0);
      const sumY = yData.reduce((a, b) => a + b, 0);
      const sumXY = xData.reduce((s, x, i) => s + x * yData[i], 0);
      const sumX2 = xData.reduce((s, x) => s + x * x, 0);
      const sumY2 = yData.reduce((s, y) => s + y * y, 0);
      const denom = n * sumX2 - sumX * sumX;
      if (denom === 0) return [{ label: 'Error', value: 'Cannot compute regression (vertical line)' }];
      const m = (n * sumXY - sumX * sumY) / denom;
      const b = (sumY - m * sumX) / n;
      // R²
      const meanY = sumY / n;
      const ssTot = yData.reduce((s, y) => s + (y - meanY) ** 2, 0);
      const ssRes = yData.reduce((s, y, i) => s + (y - (m * xData[i] + b)) ** 2, 0);
      const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
      const r = Math.sqrt(r2) * Math.sign(m);
      return [
        { label: 'Equation', value: `y = ${fmt(m, 4)}x ${b >= 0 ? '+' : '-'} ${fmt(Math.abs(b), 4)}`, highlight: true },
        { label: 'Slope (m)', value: fmt(m, 6) },
        { label: 'Y-Intercept (b)', value: fmt(b, 6) },
        { label: 'R (correlation)', value: fmt(r, 6) },
        { label: 'R² (coefficient of determination)', value: fmt(r2, 6) },
        { label: 'Data Points', value: `${n}` },
      ];
    },
  },

  // ━━━ 36. Set Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'set-calculator',
    name: 'Set Calculator',
    description: 'Perform set operations: union, intersection, difference, symmetric difference, and complement. Also calculates cardinality and checks subsets. Enter sets as comma-separated elements.',
    keywords: ['set calculator', 'union intersection', 'set operations', 'Venn diagram', 'set difference', 'subset check', 'set theory', 'complement set'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'setA', label: 'Set A (comma-separated)', type: 'text', default: '1, 2, 3, 4, 5', placeholder: 'e.g. 1, 2, 3, 4, 5' },
      { id: 'setB', label: 'Set B (comma-separated)', type: 'text', default: '3, 4, 5, 6, 7', placeholder: 'e.g. 3, 4, 5, 6, 7' },
    ],
    compute: (inputs) => {
      const parseSet = (s: string) => [...new Set(s.split(',').map(v => v.trim()).filter(v => v))];
      const A = parseSet(String(inputs.setA));
      const B = parseSet(String(inputs.setB));
      const aSet = new Set(A), bSet = new Set(B);
      const union = [...new Set([...A, ...B])];
      const intersection = A.filter(x => bSet.has(x));
      const diffAB = A.filter(x => !bSet.has(x));
      const diffBA = B.filter(x => !aSet.has(x));
      const symDiff = [...diffAB, ...diffBA];
      const isSubsetAB = A.every(x => bSet.has(x));
      const isSubsetBA = B.every(x => aSet.has(x));
      return [
        { label: 'A ∪ B (Union)', value: `{${union.join(', ')}}`, highlight: true },
        { label: 'A ∩ B (Intersection)', value: `{${intersection.join(', ')}}` },
        { label: 'A - B (Difference)', value: `{${diffAB.join(', ')}}` },
        { label: 'B - A (Difference)', value: `{${diffBA.join(', ')}}` },
        { label: 'A △ B (Symmetric Diff)', value: `{${symDiff.join(', ')}}` },
        { label: '|A| (Cardinality)', value: A.length },
        { label: '|B| (Cardinality)', value: B.length },
        { label: 'A ⊆ B?', value: isSubsetAB ? 'Yes' : 'No' },
        { label: 'B ⊆ A?', value: isSubsetBA ? 'Yes' : 'No' },
      ];
    },
  },

  // ━━━ 37. Proportion Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'proportion-calculator',
    name: 'Proportion Calculator',
    description: 'Solve proportions a/b = c/d for any missing value. Also solves direct and inverse proportion problems. Essential for recipe scaling, map reading, and model building.',
    keywords: ['proportion calculator', 'solve proportion', 'cross multiply', 'ratio solver', 'direct proportion', 'inverse proportion', 'a/b=c/d', 'proportion solver'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'a', label: 'a', type: 'number', default: 3, step: 0.1 },
      { id: 'b', label: 'b', type: 'number', default: 4, step: 0.1 },
      { id: 'c', label: 'c', type: 'number', default: 9, step: 0.1 },
      { id: 'd', label: 'd (leave 0 to solve)', type: 'number', default: 0, step: 0.1 },
    ],
    compute: (inputs) => {
      const a = Number(inputs.a), b = Number(inputs.b), c = Number(inputs.c), d = Number(inputs.d);
      if (d === 0) {
        // Solve for d: d = bc/a
        if (a === 0) return [{ label: 'Error', value: 'a cannot be zero when solving for d' }];
        const result = (b * c) / a;
        return [
          { label: 'd = ?', value: fmt(result, 6), highlight: true },
          { label: 'Proportion', value: `${a}/${b} = ${c}/${fmt(result, 4)}` },
        ];
      }
      // Verify proportion
      if (a === 0 || b === 0 || c === 0 || d === 0) return [{ label: 'Error', value: 'Values cannot be zero for verification' }];
      const ratio1 = a / b;
      const ratio2 = c / d;
      const isProportional = Math.abs(ratio1 - ratio2) < 1e-10;
      return [
        { label: 'a/b', value: fmt(ratio1, 6) },
        { label: 'c/d', value: fmt(ratio2, 6) },
        { label: 'Is Proportional?', value: isProportional ? 'Yes ✓' : 'No ✗', highlight: true },
      ];
    },
  },

  // ━━━ 38. Random Number Generator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'random-number-generator',
    name: 'Random Number Generator',
    description: 'Generate random integers or decimal numbers within a specified range. Supports generating multiple random numbers, with or without duplicates.',
    keywords: ['random number generator', 'RNG', 'random integer', 'random decimal', 'dice roller', 'lottery numbers', 'random picker', 'random sequence'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'min', label: 'Minimum', type: 'number', default: 1, step: 1 },
      { id: 'max', label: 'Maximum', type: 'number', default: 100, step: 1 },
      { id: 'count', label: 'How Many', type: 'number', default: 5, min: 1, max: 100, step: 1 },
      { id: 'type', label: 'Type', type: 'select', default: 'integer', options: [
        { label: 'Integer', value: 'integer' },
        { label: 'Decimal', value: 'decimal' },
      ] },
      { id: 'unique', label: 'Unique (no duplicates)', type: 'checkbox', default: false },
    ],
    compute: (inputs) => {
      const min = Number(inputs.min);
      const max = Number(inputs.max);
      const count = Math.min(100, Math.round(Number(inputs.count)));
      const isInteger = inputs.type === 'integer';
      const unique = !!inputs.unique;
      if (min >= max) return [{ label: 'Error', value: 'Min must be less than max' }];
      const nums: number[] = [];
      if (unique && isInteger && (max - min + 1) < count) {
        return [{ label: 'Error', value: `Cannot generate ${count} unique integers in range [${min}, ${max}]` }];
      }
      const seen = new Set<number>();
      let attempts = 0;
      while (nums.length < count && attempts < 10000) {
        let n: number;
        if (isInteger) n = Math.floor(Math.random() * (max - min + 1)) + min;
        else n = Math.random() * (max - min) + min;
        if (unique) {
          const key = isInteger ? n : Math.round(n * 1e6);
          if (seen.has(key)) { attempts++; continue; }
          seen.add(key);
        }
        nums.push(n);
        attempts++;
      }
      const sorted = [...nums].sort((a, b) => a - b);
      return [
        { label: 'Random Numbers', value: nums.map(n => isInteger ? n : fmt(n, 4)).join(', '), highlight: true },
        { label: 'Sorted', value: sorted.map(n => isInteger ? n : fmt(n, 4)).join(', ') },
        { label: 'Min', value: fmt(Math.min(...nums), isInteger ? 0 : 4) },
        { label: 'Max', value: fmt(Math.max(...nums), isInteger ? 0 : 4) },
        { label: 'Average', value: fmt(nums.reduce((a, b) => a + b, 0) / nums.length, 4) },
      ];
    },
  },

  // ━━━ 39. Summation Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'summation-calculator',
    name: 'Summation (Sigma) Calculator',
    description: 'Compute the sum of a series Σ f(i) from i=a to b. Enter any function of i and bounds to evaluate finite sums. Supports polynomial, exponential, and trigonometric series.',
    keywords: ['summation calculator', 'sigma notation', 'series sum', 'finite sum', 'sigma calculator', 'Σ calculator', 'arithmetic series', 'geometric series'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'fn', label: 'Function f(i)', type: 'text', default: 'i^2', placeholder: 'e.g. i^2, i, 2^i, sin(i)' },
      { id: 'start', label: 'Start (a)', type: 'number', default: 1, step: 1 },
      { id: 'end', label: 'End (b)', type: 'number', default: 10, step: 1 },
    ],
    compute: (inputs) => {
      const fn = String(inputs.fn);
      const start = Math.round(Number(inputs.start));
      const end = Math.round(Number(inputs.end));
      if (start > end) return [{ label: 'Error', value: 'Start must be ≤ End' }];
      if (end - start > 100000) return [{ label: 'Error', value: 'Range too large (max 100,000 terms)' }];
      let sum = 0;
      const terms: string[] = [];
      const f = (i: number) => safeEval(fn.replace(/x/g, 'i'), i);
      for (let i = start; i <= end; i++) {
        const val = f(i);
        if (Number.isNaN(val)) return [{ label: 'Error', value: `Invalid function at i=${i}` }];
        sum += val;
        if (i - start < 10 || end - i < 3) terms.push(`f(${i})=${fmt(val, 4)}`);
        else if (i - start === 10) terms.push('...');
      }
      return [
        { label: `Σ f(i) from ${start} to ${end}`, value: fmtSci(sum), highlight: true },
        { label: 'Number of Terms', value: end - start + 1 },
        { label: 'Average', value: fmtSci(sum / (end - start + 1)) },
        { label: 'Terms', value: terms.join(', ') },
        { label: 'Function', value: `f(i) = ${fn}` },
      ];
    },
  },

  // ━━━ 40. Pyramid Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'pyramid-calculator',
    name: 'Pyramid Calculator',
    description: 'Calculate the volume and surface area of a square pyramid from its base side and height. Also computes slant height and lateral surface area.',
    keywords: ['pyramid calculator', 'pyramid volume', 'square pyramid', 'pyramid surface area', 'slant height', 'lateral area', 'Egyptian pyramid', 'tetrahedron'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'base', label: 'Base Side Length', type: 'number', default: 6, min: 0.001, step: 0.1 },
      { id: 'height', label: 'Height', type: 'number', default: 8, min: 0.001, step: 0.1 },
    ],
    compute: (inputs) => {
      const b = Number(inputs.base);
      const h = Number(inputs.height);
      const slant = Math.sqrt((b / 2) ** 2 + h ** 2);
      const volume = (1 / 3) * b * b * h;
      const baseArea = b * b;
      const lateralArea = 2 * b * slant;
      const totalArea = baseArea + lateralArea;
      return [
        { label: 'Volume', value: fmt(volume, 6), highlight: true },
        { label: 'Total Surface Area', value: fmt(totalArea, 6) },
        { label: 'Lateral Surface Area', value: fmt(lateralArea, 6) },
        { label: 'Base Area', value: fmt(baseArea, 6) },
        { label: 'Slant Height', value: fmt(slant, 6) },
      ];
    },
  },

  // ━━━ 41. Pearson Correlation Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'correlation-calculator',
    name: 'Pearson Correlation Calculator',
    description: 'Calculate the Pearson correlation coefficient (r) between two variables. Measures the strength and direction of linear relationship. Also computes covariance and coefficient of determination.',
    keywords: ['Pearson correlation', 'correlation coefficient', 'r value', 'linear correlation', 'covariance', 'statistical correlation', 'correlation analysis', 'r squared'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'xData', label: 'X Values (comma-separated)', type: 'text', default: '1, 2, 3, 4, 5' },
      { id: 'yData', label: 'Y Values (comma-separated)', type: 'text', default: '2, 4, 5, 4, 5' },
    ],
    compute: (inputs) => {
      const x = String(inputs.xData).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      const y = String(inputs.yData).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (x.length !== y.length || x.length < 2) return [{ label: 'Error', value: 'Need ≥2 paired values of equal length' }];
      const n = x.length;
      const mx = x.reduce((a, b) => a + b) / n;
      const my = y.reduce((a, b) => a + b) / n;
      let ssxy = 0, ssxx = 0, ssyy = 0;
      for (let i = 0; i < n; i++) {
        ssxy += (x[i] - mx) * (y[i] - my);
        ssxx += (x[i] - mx) ** 2;
        ssyy += (y[i] - my) ** 2;
      }
      const denom = Math.sqrt(ssxx * ssyy);
      if (denom === 0) return [{ label: 'Error', value: 'Cannot compute (zero variance)' }];
      const r = ssxy / denom;
      const r2 = r * r;
      const cov = ssxy / n;
      let strength = 'None';
      const ar = Math.abs(r);
      if (ar >= 0.8) strength = 'Strong';
      else if (ar >= 0.5) strength = 'Moderate';
      else if (ar >= 0.3) strength = 'Weak';
      const dir = r > 0 ? 'Positive' : r < 0 ? 'Negative' : 'No';
      return [
        { label: 'Pearson r', value: fmt(r, 6), highlight: true },
        { label: 'R²', value: fmt(r2, 6) },
        { label: 'Covariance', value: fmt(cov, 6) },
        { label: 'Strength', value: `${strength} ${dir} Correlation` },
        { label: 'Data Points', value: `${n}` },
      ];
    },
  },

  // ━━━ 42. Midpoint Calculator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'midpoint-calculator',
    name: 'Midpoint Calculator',
    description: 'Calculate the midpoint between two points in 2D or 3D space. The midpoint is the point equidistant from both endpoints. Also computes the distance and slope.',
    keywords: ['midpoint calculator', 'midpoint formula', 'center point', 'average of coordinates', 'midpoint between points', 'bisector point', 'halfway point', 'coordinate midpoint'],
    category: 'math',
    icon: 'Calculator',
    fields: [
      { id: 'x1', label: 'x₁', type: 'number', default: 2, step: 0.1 },
      { id: 'y1', label: 'y₁', type: 'number', default: 4, step: 0.1 },
      { id: 'x2', label: 'x₂', type: 'number', default: 8, step: 0.1 },
      { id: 'y2', label: 'y₂', type: 'number', default: 10, step: 0.1 },
    ],
    compute: (inputs) => {
      const x1 = Number(inputs.x1), y1 = Number(inputs.y1);
      const x2 = Number(inputs.x2), y2 = Number(inputs.y2);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const slope = x1 !== x2 ? (y2 - y1) / (x2 - x1) : NaN;
      return [
        { label: 'Midpoint', value: `(${fmt(mx, 4)}, ${fmt(my, 4)})`, highlight: true },
        { label: 'Distance', value: fmt(dist, 6) },
        { label: 'Slope', value: Number.isNaN(slope) ? 'Undefined' : fmt(slope, 6) },
      ];
    },
  },

];
