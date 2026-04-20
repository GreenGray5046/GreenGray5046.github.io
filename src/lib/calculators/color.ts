import { Calculator, CalcResult, fmt } from '../calc-types';

// ── Color Helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return [
    Math.round(255 * (1 - c) * (1 - k)),
    Math.round(255 * (1 - m) * (1 - k)),
    Math.round(255 * (1 - y) * (1 - k)),
  ];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);
  return [c * 100, m * 100, y * 100, k * 100];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, v * 100];
}

// WCAG 2.0 relative luminance
function relativeLuminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Color blindness simulation matrices (simplified)
function simulateColorBlindness(r: number, g: number, b: number, type: string): [number, number, number] {
  // Normalize to 0-1
  const rn = r / 255, gn = g / 255, bn = b / 255;
  let rr: number, gg: number, bb: number;
  switch (type) {
    case 'protanopia':
      rr = 0.567 * rn + 0.433 * gn + 0.000 * bn;
      gg = 0.558 * rn + 0.442 * gn + 0.000 * bn;
      bb = 0.000 * rn + 0.242 * gn + 0.758 * bn;
      break;
    case 'deuteranopia':
      rr = 0.625 * rn + 0.375 * gn + 0.000 * bn;
      gg = 0.700 * rn + 0.300 * gn + 0.000 * bn;
      bb = 0.000 * rn + 0.300 * gn + 0.700 * bn;
      break;
    case 'tritanopia':
      rr = 0.950 * rn + 0.050 * gn + 0.000 * bn;
      gg = 0.000 * rn + 0.433 * gn + 0.567 * bn;
      bb = 0.000 * rn + 0.475 * gn + 0.525 * bn;
      break;
    case 'achromatopsia':
      const gray = 0.299 * rn + 0.587 * gn + 0.114 * bn;
      rr = gray; gg = gray; bb = gray;
      break;
    default:
      rr = rn; gg = gn; bb = bn;
  }
  return [
    Math.round(Math.min(255, Math.max(0, rr * 255))),
    Math.round(Math.min(255, Math.max(0, gg * 255))),
    Math.round(Math.min(255, Math.max(0, bb * 255))),
  ];
}

function parseColorInput(input: string): [number, number, number] | null {
  const trimmed = input.trim().toLowerCase();
  // Hex
  if (/^#?[0-9a-f]{3}([0-9a-f]{3})?$/.test(trimmed.replace(/^#/, ''))) {
    return hexToRgb(trimmed);
  }
  // rgb(r, g, b)
  const rgbMatch = trimmed.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }
  // hsl(h, s%, l%)
  const hslMatch = trimmed.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/);
  if (hslMatch) {
    return hslToRgb(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]));
  }
  return null;
}

// ── Calculators ──────────────────────────────────────────────────────────────

export const colorCalculators: Calculator[] = [
  // 1. Hex to RGB Converter
  {
    id: 'hex-to-rgb-converter',
    name: 'Hex to RGB Converter',
    description: 'Convert hex color codes to RGB values. Transform hexadecimal color codes to red, green, blue decimal values for CSS and design tools.',
    keywords: ['hex to RGB', 'color converter', 'hex color', 'hexadecimal to RGB', 'color code converter', 'hex to decimal color', 'CSS color'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'hex', label: 'Hex Color', type: 'color', default: '#3b82f6' },
    ],
    compute: (inputs) => {
      const hex = String(inputs.hex ?? '#000000');
      const rgb = hexToRgb(hex);
      if (!rgb) return [{ label: 'Error', value: 'Invalid hex color' }];
      const [r, g, b] = rgb;
      const [h, s, l] = rgbToHsl(r, g, b);
      return [
        { label: 'RGB', value: `rgb(${r}, ${g}, ${b})`, highlight: true },
        { label: 'Red', value: r },
        { label: 'Green', value: g },
        { label: 'Blue', value: b },
        { label: 'HSL', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)` },
        { label: 'CSS rgb()', value: `rgb(${r}, ${g}, ${b})` },
      ];
    },
  },

  // 2. RGB to Hex Converter
  {
    id: 'rgb-to-hex-converter',
    name: 'RGB to Hex Converter',
    description: 'Convert RGB color values to hexadecimal color codes. Transform red, green, blue values to hex for web design and CSS.',
    keywords: ['RGB to hex', 'color code converter', 'RGB to hexadecimal', 'decimal to hex color', 'color conversion', 'web color', 'CSS hex'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'r', label: 'Red', type: 'number', default: 59, min: 0, max: 255 },
      { id: 'g', label: 'Green', type: 'number', default: 130, min: 0, max: 255 },
      { id: 'b', label: 'Blue', type: 'number', default: 246, min: 0, max: 255 },
    ],
    compute: (inputs) => {
      const r = Number(inputs.r) || 0;
      const g = Number(inputs.g) || 0;
      const b = Number(inputs.b) || 0;
      const hex = rgbToHex(r, g, b);
      const [h, s, l] = rgbToHsl(r, g, b);
      return [
        { label: 'Hex', value: hex, highlight: true },
        { label: 'Short Hex', value: hex.replace(/^#(..)(..)(..)$/, (_, r2, g2, b2) => '#' + r2[0] + r2[1] === r2[0] + r2[0] && g2[0] + g2[1] === g2[0] + g2[0] && b2[0] + b2[1] === b2[0] + b2[0] ? r2[0] + g2[0] + b2[0] : hex.slice(1)) },
        { label: 'HSL', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)` },
        { label: 'CSS hex', value: hex },
      ];
    },
  },

  // 3. HSL to RGB Converter
  {
    id: 'hsl-to-rgb-converter',
    name: 'HSL to RGB Converter',
    description: 'Convert HSL (hue, saturation, lightness) color values to RGB. Transform HSL color model to red, green, blue for screen display.',
    keywords: ['HSL to RGB', 'hue saturation lightness', 'HSL converter', 'color space converter', 'HSL color model', 'color transformation', 'HSL values'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'h', label: 'Hue (°)', type: 'number', default: 217, min: 0, max: 360 },
      { id: 's', label: 'Saturation (%)', type: 'number', default: 91, min: 0, max: 100 },
      { id: 'l', label: 'Lightness (%)', type: 'number', default: 60, min: 0, max: 100 },
    ],
    compute: (inputs) => {
      const h = Number(inputs.h) || 0;
      const s = Number(inputs.s) || 0;
      const l = Number(inputs.l) || 0;
      const [r, g, b] = hslToRgb(h, s, l);
      const hex = rgbToHex(r, g, b);
      return [
        { label: 'RGB', value: `rgb(${r}, ${g}, ${b})`, highlight: true },
        { label: 'Red', value: r },
        { label: 'Green', value: g },
        { label: 'Blue', value: b },
        { label: 'Hex', value: hex, highlight: true },
        { label: 'CSS rgb()', value: `rgb(${r}, ${g}, ${b})` },
      ];
    },
  },

  // 4. RGB to HSL Converter
  {
    id: 'rgb-to-hsl-converter',
    name: 'RGB to HSL Converter',
    description: 'Convert RGB color values to HSL (hue, saturation, lightness). Transform screen colors to the HSL color model for intuitive color selection.',
    keywords: ['RGB to HSL', 'color space converter', 'RGB to HSL converter', 'hue saturation lightness', 'color model', 'HSL values', 'color transformation'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'r', label: 'Red', type: 'number', default: 59, min: 0, max: 255 },
      { id: 'g', label: 'Green', type: 'number', default: 130, min: 0, max: 255 },
      { id: 'b', label: 'Blue', type: 'number', default: 246, min: 0, max: 255 },
    ],
    compute: (inputs) => {
      const r = Number(inputs.r) || 0;
      const g = Number(inputs.g) || 0;
      const b = Number(inputs.b) || 0;
      const [h, s, l] = rgbToHsl(r, g, b);
      const [hv, sv, vv] = rgbToHsv(r, g, b);
      return [
        { label: 'HSL', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)`, highlight: true },
        { label: 'Hue', value: `${fmt(h, 1)}°` },
        { label: 'Saturation', value: `${fmt(s, 1)}%` },
        { label: 'Lightness', value: `${fmt(l, 1)}%` },
        { label: 'HSV', value: `hsv(${fmt(hv, 1)}, ${fmt(sv, 1)}%, ${fmt(vv, 1)}%)` },
        { label: 'CSS HSL', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)` },
      ];
    },
  },

  // 5. Color Converter (Universal)
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Universal color converter supporting hex, RGB, HSL, HSV, and CMYK formats. Convert between any CSS color format instantly.',
    keywords: ['color converter', 'color format', 'CSS color', 'universal color converter', 'hex RGB HSL', 'color transformation', 'color code'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'color', label: 'Color', type: 'color', default: '#3b82f6' },
    ],
    compute: (inputs) => {
      const colorStr = String(inputs.color ?? '#000000');
      const rgb = parseColorInput(colorStr);
      if (!rgb) return [{ label: 'Error', value: 'Invalid color format' }];
      const [r, g, b] = rgb;
      const hex = rgbToHex(r, g, b);
      const [h, s, l] = rgbToHsl(r, g, b);
      const [hv, sv, vv] = rgbToHsv(r, g, b);
      const [c, m, y, k] = rgbToCmyk(r, g, b);
      return [
        { label: 'Hex', value: hex, highlight: true },
        { label: 'RGB', value: `rgb(${r}, ${g}, ${b})`, highlight: true },
        { label: 'HSL', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)` },
        { label: 'HSV/HSB', value: `hsv(${fmt(hv, 1)}, ${fmt(sv, 1)}%, ${fmt(vv, 1)}%)` },
        { label: 'CMYK', value: `cmyk(${fmt(c, 1)}%, ${fmt(m, 1)}%, ${fmt(y, 1)}%, ${fmt(k, 1)}%)` },
        { label: 'CSS hex', value: hex },
        { label: 'CSS rgb', value: `rgb(${r}, ${g}, ${b})` },
        { label: 'CSS hsl', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)` },
      ];
    },
  },

  // 6. Contrast Ratio Calculator
  {
    id: 'contrast-ratio-calculator',
    name: 'Contrast Ratio Calculator',
    description: 'Calculate WCAG 2.0 contrast ratio between two colors. Check AA and AAA accessibility compliance for text and UI elements.',
    keywords: ['contrast ratio', 'WCAG', 'accessibility', 'AA AAA compliance', 'color contrast', 'WCAG 2.0', 'accessible design', 'ADA compliance'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'foreground', label: 'Foreground (Text) Color', type: 'color', default: '#000000' },
      { id: 'background', label: 'Background Color', type: 'color', default: '#ffffff' },
    ],
    compute: (inputs) => {
      const fgStr = String(inputs.foreground ?? '#000000');
      const bgStr = String(inputs.background ?? '#ffffff');
      const fgRgb = hexToRgb(fgStr);
      const bgRgb = hexToRgb(bgStr);
      if (!fgRgb || !bgRgb) return [{ label: 'Error', value: 'Invalid color' }];
      const [fr, fg, fb] = fgRgb;
      const [br, bg2, bb] = bgRgb;
      const fgLum = relativeLuminance(fr, fg, fb);
      const bgLum = relativeLuminance(br, bg2, bb);
      const ratio = contrastRatio(fgLum, bgLum);
      const aaNormal = ratio >= 4.5 ? 'PASS ✓' : 'FAIL ✗';
      const aaLarge = ratio >= 3 ? 'PASS ✓' : 'FAIL ✗';
      const aaaNormal = ratio >= 7 ? 'PASS ✓' : 'FAIL ✗';
      const aaaLarge = ratio >= 4.5 ? 'PASS ✓' : 'FAIL ✗';
      return [
        { label: 'Contrast Ratio', value: `${fmt(ratio, 2)}:1`, highlight: true },
        { label: 'AA Normal Text (≥4.5:1)', value: aaNormal, highlight: ratio >= 4.5 },
        { label: 'AA Large Text (≥3:1)', value: aaLarge, highlight: ratio >= 3 },
        { label: 'AAA Normal Text (≥7:1)', value: aaaNormal, highlight: ratio >= 7 },
        { label: 'AAA Large Text (≥4.5:1)', value: aaaLarge, highlight: ratio >= 4.5 },
        { label: 'Foreground Luminance', value: fmt(fgLum, 4) },
        { label: 'Background Luminance', value: fmt(bgLum, 4) },
      ];
    },
  },

  // 7. Color Blindness Simulator
  {
    id: 'color-blindness-simulator',
    name: 'Color Blindness Simulator',
    description: 'Simulate how colors appear to people with different types of color blindness. Test protanopia, deuteranopia, tritanopia, and achromatopsia.',
    keywords: ['color blindness', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia', 'color vision deficiency', 'accessibility simulation', 'daltonism'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'color', label: 'Color', type: 'color', default: '#ff6b35' },
    ],
    compute: (inputs) => {
      const colorStr = String(inputs.color ?? '#ff6b35');
      const rgb = hexToRgb(colorStr);
      if (!rgb) return [{ label: 'Error', value: 'Invalid color' }];
      const [r, g, b] = rgb;
      const types = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as const;
      const names: Record<string, string> = {
        protanopia: 'Protanopia (Red-Blind)',
        deuteranopia: 'Deuteranopia (Green-Blind)',
        tritanopia: 'Tritanopia (Blue-Blind)',
        achromatopsia: 'Achromatopsia (Total)',
      };
      const results: CalcResult[] = [
        { label: 'Original Color', value: `rgb(${r}, ${g}, ${b}) — ${colorStr}` },
      ];
      for (const type of types) {
        const [sr, sg, sb] = simulateColorBlindness(r, g, b, type);
        const hex = rgbToHex(sr, sg, sb);
        results.push({ label: names[type], value: `${hex} — rgb(${sr}, ${sg}, ${sb})` });
      }
      return results;
    },
  },

  // 8. CMYK to RGB Converter
  {
    id: 'cmyk-to-rgb-converter',
    name: 'CMYK to RGB Converter',
    description: 'Convert CMYK (cyan, magenta, yellow, key) print color values to RGB screen colors. Bridge print and digital color workflows.',
    keywords: ['CMYK to RGB', 'print color', 'CMYK converter', 'cyan magenta yellow key', 'print to screen', 'CMYK RGB conversion', 'offset printing color'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'c', label: 'Cyan (%)', type: 'number', default: 100, min: 0, max: 100, step: 1 },
      { id: 'm', label: 'Magenta (%)', type: 'number', default: 0, min: 0, max: 100, step: 1 },
      { id: 'y', label: 'Yellow (%)', type: 'number', default: 0, min: 0, max: 100, step: 1 },
      { id: 'k', label: 'Key/Black (%)', type: 'number', default: 0, min: 0, max: 100, step: 1 },
    ],
    compute: (inputs) => {
      const c = Number(inputs.c) || 0;
      const m = Number(inputs.m) || 0;
      const y = Number(inputs.y) || 0;
      const k = Number(inputs.k) || 0;
      const [r, g, b] = cmykToRgb(c, m, y, k);
      const hex = rgbToHex(r, g, b);
      const [h, s, l] = rgbToHsl(r, g, b);
      return [
        { label: 'RGB', value: `rgb(${r}, ${g}, ${b})`, highlight: true },
        { label: 'Hex', value: hex, highlight: true },
        { label: 'Red', value: r },
        { label: 'Green', value: g },
        { label: 'Blue', value: b },
        { label: 'HSL', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)` },
      ];
    },
  },

  // 9. Gradient Generator
  {
    id: 'gradient-generator',
    name: 'Gradient Generator',
    description: 'Generate CSS gradient code between two colors. Create linear and radial gradients with customizable direction for web design.',
    keywords: ['gradient generator', 'CSS gradient', 'color gradient', 'linear gradient', 'radial gradient', 'gradient CSS code', 'color transition'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'color1', label: 'Start Color', type: 'color', default: '#3b82f6' },
      { id: 'color2', label: 'End Color', type: 'color', default: '#ec4899' },
      {
        id: 'direction',
        label: 'Direction',
        type: 'select',
        default: 'to right',
        options: [
          { label: 'To Right →', value: 'to right' },
          { label: 'To Left ←', value: 'to left' },
          { label: 'To Bottom ↓', value: 'to bottom' },
          { label: 'To Top ↑', value: 'to top' },
          { label: 'To Bottom Right ↘', value: 'to bottom right' },
          { label: 'To Bottom Left ↙', value: 'to bottom left' },
          { label: '45deg', value: '45deg' },
          { label: '90deg', value: '90deg' },
          { label: '135deg', value: '135deg' },
          { label: '180deg', value: '180deg' },
        ],
      },
      {
        id: 'type',
        label: 'Gradient Type',
        type: 'select',
        default: 'linear',
        options: [
          { label: 'Linear', value: 'linear' },
          { label: 'Radial', value: 'radial' },
        ],
      },
    ],
    compute: (inputs) => {
      const c1 = String(inputs.color1 ?? '#3b82f6');
      const c2 = String(inputs.color2 ?? '#ec4899');
      const direction = String(inputs.direction ?? 'to right');
      const type = String(inputs.type ?? 'linear');
      let css: string;
      if (type === 'linear') {
        css = `linear-gradient(${direction}, ${c1}, ${c2})`;
      } else {
        css = `radial-gradient(circle, ${c1}, ${c2})`;
      }
      return [
        { label: 'CSS Gradient', value: css, highlight: true },
        { label: 'CSS Property', value: `background: ${css};` },
        { label: 'Tailwind Class (approx)', value: `bg-gradient-to-${direction.includes('right') ? 'r' : direction.includes('left') ? 'l' : direction.includes('bottom') ? 'b' : 't'} ${c1.replace('#', 'from-[')}] ${c2.replace('#', 'to-[')}]` },
      ];
    },
  },

  // 10. Color Palette Generator
  {
    id: 'color-palette-generator',
    name: 'Color Palette Generator',
    description: 'Generate harmonious color palettes from a base color. Create complementary, analogous, triadic, and split-complementary color schemes.',
    keywords: ['color palette', 'complementary colors', 'color scheme', 'color harmony', 'analogous colors', 'triadic colors', 'design palette'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'baseColor', label: 'Base Color', type: 'color', default: '#3b82f6' },
      {
        id: 'scheme',
        label: 'Color Scheme',
        type: 'select',
        default: 'complementary',
        options: [
          { label: 'Complementary', value: 'complementary' },
          { label: 'Analogous', value: 'analogous' },
          { label: 'Triadic', value: 'triadic' },
          { label: 'Split-Complementary', value: 'split-complementary' },
          { label: 'Tetradic (Square)', value: 'tetradic' },
        ],
      },
    ],
    compute: (inputs) => {
      const colorStr = String(inputs.baseColor ?? '#3b82f6');
      const scheme = String(inputs.scheme ?? 'complementary');
      const rgb = hexToRgb(colorStr);
      if (!rgb) return [{ label: 'Error', value: 'Invalid color' }];
      const [r, g, b] = rgb;
      const [h, s, l] = rgbToHsl(r, g, b);

      function hslColor(hue: number, sat: number, light: number): string {
        const [rr, gg, bb] = hslToRgb(((hue % 360) + 360) % 360, sat, light);
        return rgbToHex(rr, gg, bb);
      }

      const colors: { label: string; hex: string }[] = [{ label: 'Base', hex: colorStr }];

      switch (scheme) {
        case 'complementary':
          colors.push({ label: 'Complementary', hex: hslColor(h + 180, s, l) });
          break;
        case 'analogous':
          colors.push({ label: 'Analogous -30°', hex: hslColor(h - 30, s, l) });
          colors.push({ label: 'Analogous +30°', hex: hslColor(h + 30, s, l) });
          break;
        case 'triadic':
          colors.push({ label: 'Triadic +120°', hex: hslColor(h + 120, s, l) });
          colors.push({ label: 'Triadic +240°', hex: hslColor(h + 240, s, l) });
          break;
        case 'split-complementary':
          colors.push({ label: 'Split +150°', hex: hslColor(h + 150, s, l) });
          colors.push({ label: 'Split +210°', hex: hslColor(h + 210, s, l) });
          break;
        case 'tetradic':
          colors.push({ label: 'Tetradic +90°', hex: hslColor(h + 90, s, l) });
          colors.push({ label: 'Tetradic +180°', hex: hslColor(h + 180, s, l) });
          colors.push({ label: 'Tetradic +270°', hex: hslColor(h + 270, s, l) });
          break;
      }

      return colors.map((c, i) => ({
        label: c.label,
        value: c.hex,
        highlight: i === 0,
      }));
    },
  },

  // 11. Color Mixer
  {
    id: 'color-mixer',
    name: 'Color Mixer',
    description: 'Mix two colors together with adjustable blend ratio. Blend colors to find intermediate hues and create smooth color transitions.',
    keywords: ['color mixer', 'blend colors', 'color blend', 'mix colors', 'color average', 'intermediate color', 'color combination'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'color1', label: 'Color 1', type: 'color', default: '#3b82f6' },
      { id: 'color2', label: 'Color 2', type: 'color', default: '#ef4444' },
      { id: 'ratio', label: 'Blend Ratio (%)', type: 'number', default: 50, min: 0, max: 100, step: 1 },
    ],
    compute: (inputs) => {
      const c1Str = String(inputs.color1 ?? '#3b82f6');
      const c2Str = String(inputs.color2 ?? '#ef4444');
      const ratio = (Number(inputs.ratio) ?? 50) / 100;
      const rgb1 = hexToRgb(c1Str);
      const rgb2 = hexToRgb(c2Str);
      if (!rgb1 || !rgb2) return [{ label: 'Error', value: 'Invalid color' }];
      const mr = Math.round(rgb1[0] * (1 - ratio) + rgb2[0] * ratio);
      const mg = Math.round(rgb1[1] * (1 - ratio) + rgb2[1] * ratio);
      const mb = Math.round(rgb1[2] * (1 - ratio) + rgb2[2] * ratio);
      const hex = rgbToHex(mr, mg, mb);
      const [h, s, l] = rgbToHsl(mr, mg, mb);
      return [
        { label: 'Mixed Color (Hex)', value: hex, highlight: true },
        { label: 'Mixed Color (RGB)', value: `rgb(${mr}, ${mg}, ${mb})` },
        { label: 'Mixed Color (HSL)', value: `hsl(${fmt(h, 1)}, ${fmt(s, 1)}%, ${fmt(l, 1)}%)` },
        { label: 'Blend Ratio', value: `${fmt(ratio * 100, 0)}% Color 2` },
      ];
    },
  },

  // 12. Shade & Tint Generator
  {
    id: 'shade-tint-generator',
    name: 'Shade & Tint Generator',
    description: 'Generate shades (darker) and tints (lighter) of any color. Create color variations for design systems, UI themes, and palettes.',
    keywords: ['color shades', 'color tints', 'color variations', 'lighten color', 'darken color', 'color scale', 'design system colors'],
    category: 'color',
    icon: 'Palette',
    fields: [
      { id: 'color', label: 'Base Color', type: 'color', default: '#3b82f6' },
      { id: 'steps', label: 'Steps', type: 'number', default: 5, min: 2, max: 10 },
    ],
    compute: (inputs) => {
      const colorStr = String(inputs.color ?? '#3b82f6');
      const steps = Number(inputs.steps) || 5;
      const rgb = hexToRgb(colorStr);
      if (!rgb) return [{ label: 'Error', value: 'Invalid color' }];
      const [r, g, b] = rgb;
      const [h, s, l] = rgbToHsl(r, g, b);
      const results: CalcResult[] = [];

      // Generate tints (lighter) - from current to white
      for (let i = steps; i >= 1; i--) {
        const newL = l + (100 - l) * (i / (steps + 1));
        const [rr, gg, bb] = hslToRgb(h, s, newL);
        results.push({ label: `Tint +${i}`, value: rgbToHex(rr, gg, bb) });
      }

      // Base color
      results.push({ label: 'Base', value: colorStr, highlight: true });

      // Generate shades (darker) - from current to black
      for (let i = 1; i <= steps; i++) {
        const newL = l * (1 - i / (steps + 1));
        const [rr, gg, bb] = hslToRgb(h, s, newL);
        results.push({ label: `Shade -${i}`, value: rgbToHex(rr, gg, bb) });
      }

      return results;
    },
  },
];
