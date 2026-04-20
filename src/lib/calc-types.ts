export type FieldType = 'number' | 'text' | 'select' | 'textarea' | 'checkbox' | 'color';

export interface CalcField {
  id: string;
  label: string;
  type: FieldType;
  default?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  rows?: number;
}

export interface CalcResult {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface Calculator {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  category: string;
  icon: string;
  fields: CalcField[];
  compute: (inputs: Record<string, string | number | boolean>) => CalcResult[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'math', name: 'Math', icon: 'Calculator', description: 'Algebra, calculus, statistics & more', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'cipher', name: 'Cipher & Encoding', icon: 'Lock', description: 'Decode ciphers, encode messages, hash tools', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'finance', name: 'Finance', icon: 'DollarSign', description: 'Loans, investments, taxes & ROI', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'health', name: 'Health & Fitness', icon: 'Heart', description: 'BMI, calories, body metrics', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'conversion', name: 'Unit Conversion', icon: 'ArrowLeftRight', description: 'Length, weight, temperature & more', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'physics', name: 'Physics', icon: 'Atom', description: 'Force, energy, waves & mechanics', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'chemistry', name: 'Chemistry', icon: 'FlaskConical', description: 'Moles, pH, gas laws & reactions', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'engineering', name: 'Engineering', icon: 'Cpu', description: 'Electrical, mechanical & civil tools', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'everyday', name: 'Everyday', icon: 'Home', description: 'Age, fuel, cooking & home projects', color: 'bg-stone-50 text-stone-700 border-stone-200' },
  { id: 'text', name: 'Text & String', icon: 'Type', description: 'Word count, format, convert text', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'color', name: 'Color & Design', icon: 'Palette', description: 'Color conversion, contrast & palettes', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'seo', name: 'SEO & Web', icon: 'Globe', description: 'Keyword density, readability & bandwidth', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

export function fmt(n: number, decimals = 6): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 'N/A';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
  const s = n.toFixed(decimals);
  return s.replace(/\.?0+$/, '') || '0';
}

export function fmtSci(n: number, decimals = 6): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 'N/A';
  if (Math.abs(n) < 1e-4 || Math.abs(n) >= 1e10) return n.toExponential(decimals > 2 ? 4 : decimals);
  return fmt(n, decimals);
}
