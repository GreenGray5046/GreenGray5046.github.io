import { Calculator } from '../calc-types';
import { mathCalculators } from './math';
import { cipherCalculators } from './cipher';
import { financeCalculators } from './finance';
import { healthCalculators } from './health';
import { conversionCalculators } from './conversion';
import { physicsCalculators } from './physics';
import { chemistryCalculators } from './chemistry';
import { engineeringCalculators } from './engineering';
import { everydayCalculators } from './everyday';
import { textCalculators } from './text';
import { colorCalculators } from './color';
import { seoCalculators } from './seo';

const allCalcArrays: Calculator[][] = [
  mathCalculators,
  cipherCalculators,
  financeCalculators,
  healthCalculators,
  conversionCalculators,
  physicsCalculators,
  chemistryCalculators,
  engineeringCalculators,
  everydayCalculators,
  textCalculators,
  colorCalculators,
  seoCalculators,
];

export const allCalculators: Calculator[] = allCalcArrays.flat();

export const calculatorMap = new Map<string, Calculator>(
  allCalculators.map(c => [c.id, c])
);

export function searchCalculators(query: string): Calculator[] {
  const q = query.toLowerCase().trim();
  if (!q) return allCalculators;
  return allCalculators.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.keywords.some(k => k.toLowerCase().includes(q)) ||
    c.category.toLowerCase().includes(q)
  );
}

export function getCalculatorsByCategory(category: string): Calculator[] {
  return allCalculators.filter(c => c.category === category);
}
