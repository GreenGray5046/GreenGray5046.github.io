import { Calculator, fmt, fmtSci } from '../calc-types';

export const healthCalculators: Calculator[] = [

  // 1. BMI Calculator
  {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    description: 'Calculate your Body Mass Index (BMI) to determine if you are underweight, normal weight, overweight, or obese based on your height and weight.',
    keywords: ['BMI', 'body mass index', 'weight status', 'obesity index', 'weight classification', 'healthy weight range', 'BMI score', 'body weight assessment'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'weight', label: 'Weight', type: 'number', default: 70, min: 1, max: 500, suffix: 'kg' },
      { id: 'height', label: 'Height', type: 'number', default: 170, min: 50, max: 300, suffix: 'cm' },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      const h = Number(inputs.height) / 100;
      if (h <= 0 || w <= 0) return [{ label: 'BMI', value: 'N/A' }];
      const bmi = w / (h * h);
      let category = '';
      if (bmi < 16) category = 'Severely Underweight';
      else if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal Weight';
      else if (bmi < 30) category = 'Overweight';
      else if (bmi < 35) category = 'Obese Class I';
      else if (bmi < 40) category = 'Obese Class II';
      else category = 'Obese Class III';
      return [
        { label: 'BMI', value: fmt(bmi, 1), highlight: true },
        { label: 'Category', value: category },
        { label: 'Healthy Weight Range', value: `${fmt(18.5 * h * h, 1)} – ${fmt(25 * h * h, 1)} kg` },
      ];
    },
  },

  // 2. BMR Calculator (Mifflin-St Jeor)
  {
    id: 'bmr-calculator',
    name: 'BMR Calculator',
    description: 'Calculate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation to determine how many calories your body burns at rest for basic life-sustaining functions.',
    keywords: ['BMR', 'basal metabolic rate', 'metabolism', 'resting metabolism', 'calories at rest', 'Mifflin-St Jeor', 'metabolic rate', 'energy at rest'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weight', label: 'Weight', type: 'number', default: 70, min: 1, max: 500, suffix: 'kg' },
      { id: 'height', label: 'Height', type: 'number', default: 170, min: 50, max: 300, suffix: 'cm' },
      { id: 'age', label: 'Age', type: 'number', default: 30, min: 1, max: 120, suffix: 'years' },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      const h = Number(inputs.height);
      const a = Number(inputs.age);
      if (w <= 0 || h <= 0 || a <= 0) return [{ label: 'BMR', value: 'N/A' }];
      let bmr: number;
      if (inputs.gender === 'female') {
        bmr = 10 * w + 6.25 * h - 5 * a - 161;
      } else {
        bmr = 10 * w + 6.25 * h - 5 * a + 5;
      }
      return [
        { label: 'BMR', value: `${fmt(bmr, 0)} kcal/day`, highlight: true },
        { label: 'BMR (kJ/day)', value: fmt(bmr * 4.184, 0) },
        { label: 'Method', value: 'Mifflin-St Jeor' },
      ];
    },
  },

  // 3. TDEE Calculator
  {
    id: 'tdee-calculator',
    name: 'TDEE Calculator',
    description: 'Calculate your Total Daily Energy Expenditure (TDEE) based on your BMR and activity level to plan calorie intake for weight loss, maintenance, or muscle gain.',
    keywords: ['TDEE', 'daily calories', 'energy expenditure', 'total daily energy expenditure', 'calorie maintenance', 'activity multiplier', 'Harris-Benedict', 'daily burn rate'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weight', label: 'Weight', type: 'number', default: 70, min: 1, max: 500, suffix: 'kg' },
      { id: 'height', label: 'Height', type: 'number', default: 170, min: 50, max: 300, suffix: 'cm' },
      { id: 'age', label: 'Age', type: 'number', default: 30, min: 1, max: 120, suffix: 'years' },
      { id: 'activity', label: 'Activity Level', type: 'select', default: '1.55', options: [
        { label: 'Sedentary (little/no exercise)', value: '1.2' },
        { label: 'Lightly Active (1-3 days/week)', value: '1.375' },
        { label: 'Moderately Active (3-5 days/week)', value: '1.55' },
        { label: 'Very Active (6-7 days/week)', value: '1.725' },
        { label: 'Extra Active (athlete/physical job)', value: '1.9' },
      ] },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      const h = Number(inputs.height);
      const a = Number(inputs.age);
      const activity = Number(inputs.activity);
      if (w <= 0 || h <= 0 || a <= 0) return [{ label: 'TDEE', value: 'N/A' }];
      const bmr = inputs.gender === 'female'
        ? 10 * w + 6.25 * h - 5 * a - 161
        : 10 * w + 6.25 * h - 5 * a + 5;
      const tdee = bmr * activity;
      return [
        { label: 'BMR', value: `${fmt(bmr, 0)} kcal/day` },
        { label: 'TDEE', value: `${fmt(tdee, 0)} kcal/day`, highlight: true },
        { label: 'Weight Loss (0.5 kg/week)', value: `${fmt(tdee - 500, 0)} kcal/day` },
        { label: 'Weight Gain (0.5 kg/week)', value: `${fmt(tdee + 500, 0)} kcal/day` },
      ];
    },
  },

  // 4. Body Fat Calculator (Navy Method)
  {
    id: 'body-fat-calculator',
    name: 'Body Fat Calculator',
    description: 'Estimate your body fat percentage using the U.S. Navy method, which uses circumference measurements of waist, neck, and hip (for women) to calculate adiposity.',
    keywords: ['body fat percentage', 'Navy method', 'adiposity', 'body composition', 'fat percentage', 'Navy body fat', 'circumference method', 'lean mass estimate'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'height', label: 'Height', type: 'number', default: 170, min: 50, max: 300, suffix: 'cm' },
      { id: 'waist', label: 'Waist Circumference', type: 'number', default: 85, min: 30, max: 200, suffix: 'cm' },
      { id: 'neck', label: 'Neck Circumference', type: 'number', default: 38, min: 15, max: 80, suffix: 'cm' },
      { id: 'hip', label: 'Hip Circumference (females only)', type: 'number', default: 95, min: 30, max: 200, suffix: 'cm' },
    ],
    compute: (inputs) => {
      const height = Number(inputs.height);
      const waist = Number(inputs.waist);
      const neck = Number(inputs.neck);
      const hip = Number(inputs.hip);
      if (height <= 0 || waist <= 0 || neck <= 0) return [{ label: 'Body Fat', value: 'N/A' }];
      let bf: number;
      if (inputs.gender === 'female') {
        if (hip <= 0) return [{ label: 'Body Fat', value: 'Enter hip circumference' }];
        bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
      } else {
        bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
      }
      bf = Math.max(0, Math.min(bf, 70));
      let category = '';
      if (inputs.gender === 'male') {
        if (bf < 6) category = 'Essential Fat';
        else if (bf < 14) category = 'Athletic';
        else if (bf < 18) category = 'Fitness';
        else if (bf < 25) category = 'Average';
        else category = 'Obese';
      } else {
        if (bf < 14) category = 'Essential Fat';
        else if (bf < 21) category = 'Athletic';
        else if (bf < 25) category = 'Fitness';
        else if (bf < 32) category = 'Average';
        else category = 'Obese';
      }
      return [
        { label: 'Body Fat Percentage', value: `${fmt(bf, 1)}%`, highlight: true },
        { label: 'Category', value: category },
      ];
    },
  },

  // 5. Ideal Weight Calculator
  {
    id: 'ideal-weight-calculator',
    name: 'Ideal Weight Calculator',
    description: 'Calculate your ideal body weight using multiple formulas (Devine, Robinson, Miller, Hamwi) based on height and gender to find your target healthy weight.',
    keywords: ['ideal weight', 'healthy weight', 'target weight', 'ideal body weight', 'Devine formula', 'Robinson formula', 'Hamwi formula', 'desirable weight'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'height', label: 'Height', type: 'number', default: 170, min: 50, max: 300, suffix: 'cm' },
    ],
    compute: (inputs) => {
      const h = Number(inputs.height);
      const inchesOver60 = Math.max(0, h / 2.54 - 60);
      if (h <= 0) return [{ label: 'Ideal Weight', value: 'N/A' }];
      let devine: number, robinson: number, miller: number, hamwi: number;
      if (inputs.gender === 'male') {
        devine = 50 + 2.3 * inchesOver60;
        robinson = 52 + 1.9 * inchesOver60;
        miller = 56.2 + 1.41 * inchesOver60;
        hamwi = 48 + 2.7 * inchesOver60;
      } else {
        devine = 45.5 + 2.3 * inchesOver60;
        robinson = 49 + 1.7 * inchesOver60;
        miller = 53.1 + 1.36 * inchesOver60;
        hamwi = 45.5 + 2.2 * inchesOver60;
      }
      const avg = (devine + robinson + miller + hamwi) / 4;
      return [
        { label: 'Average Ideal Weight', value: `${fmt(avg, 1)} kg`, highlight: true },
        { label: 'Devine Formula', value: `${fmt(devine, 1)} kg` },
        { label: 'Robinson Formula', value: `${fmt(robinson, 1)} kg` },
        { label: 'Miller Formula', value: `${fmt(miller, 1)} kg` },
        { label: 'Hamwi Formula', value: `${fmt(hamwi, 1)} kg` },
      ];
    },
  },

  // 6. Calorie Calculator
  {
    id: 'calorie-calculator',
    name: 'Calorie Calculator',
    description: 'Calculate your daily calorie needs based on your BMR, activity level, and weight goals. Supports weight loss, maintenance, and muscle gain calorie targets.',
    keywords: ['calorie calculator', 'daily calories', 'caloric needs', 'calorie intake', 'daily calorie needs', 'weight loss calories', 'bulking calories', 'cutting calories'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weight', label: 'Weight', type: 'number', default: 70, min: 1, max: 500, suffix: 'kg' },
      { id: 'height', label: 'Height', type: 'number', default: 170, min: 50, max: 300, suffix: 'cm' },
      { id: 'age', label: 'Age', type: 'number', default: 30, min: 1, max: 120, suffix: 'years' },
      { id: 'activity', label: 'Activity Level', type: 'select', default: '1.55', options: [
        { label: 'Sedentary', value: '1.2' },
        { label: 'Lightly Active', value: '1.375' },
        { label: 'Moderately Active', value: '1.55' },
        { label: 'Very Active', value: '1.725' },
        { label: 'Extra Active', value: '1.9' },
      ] },
      { id: 'goal', label: 'Goal', type: 'select', default: 'maintain', options: [
        { label: 'Lose Weight (0.5 kg/week)', value: 'lose' },
        { label: 'Maintain Weight', value: 'maintain' },
        { label: 'Gain Weight (0.5 kg/week)', value: 'gain' },
      ] },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      const h = Number(inputs.height);
      const a = Number(inputs.age);
      const act = Number(inputs.activity);
      if (w <= 0 || h <= 0 || a <= 0) return [{ label: 'Calories', value: 'N/A' }];
      const bmr = inputs.gender === 'female'
        ? 10 * w + 6.25 * h - 5 * a - 161
        : 10 * w + 6.25 * h - 5 * a + 5;
      const tdee = bmr * act;
      let target = tdee;
      if (inputs.goal === 'lose') target = tdee - 500;
      else if (inputs.goal === 'gain') target = tdee + 500;
      return [
        { label: 'Daily Calories', value: `${fmt(target, 0)} kcal`, highlight: true },
        { label: 'BMR', value: `${fmt(bmr, 0)} kcal` },
        { label: 'TDEE', value: `${fmt(tdee, 0)} kcal` },
        { label: 'Target', value: inputs.goal === 'lose' ? 'Weight Loss' : inputs.goal === 'gain' ? 'Weight Gain' : 'Maintenance' },
      ];
    },
  },

  // 7. Macro Calculator
  {
    id: 'macro-calculator',
    name: 'Macro Calculator',
    description: 'Calculate your optimal macronutrient breakdown (protein, carbs, fat) based on your daily calorie needs and chosen diet ratio. Supports IIFYM, keto, and balanced ratios.',
    keywords: ['macro calculator', 'protein carbs fat', 'IIFYM', 'macronutrient ratio', 'macro breakdown', 'keto macros', 'flexible dieting', 'macro split'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'calories', label: 'Daily Calories', type: 'number', default: 2000, min: 500, max: 10000, suffix: 'kcal' },
      { id: 'ratio', label: 'Macro Split', type: 'select', default: 'balanced', options: [
        { label: 'Balanced (30/40/30)', value: 'balanced' },
        { label: 'Low Fat (30/55/15)', value: 'lowfat' },
        { label: 'Low Carb (35/25/40)', value: 'lowcarb' },
        { label: 'Keto (25/5/70)', value: 'keto' },
        { label: 'High Protein (40/35/25)', value: 'highprotein' },
      ] },
    ],
    compute: (inputs) => {
      const cal = Number(inputs.calories);
      if (cal <= 0) return [{ label: 'Macros', value: 'N/A' }];
      let pPct: number, cPct: number, fPct: number;
      switch (inputs.ratio) {
        case 'lowfat': pPct = 0.30; cPct = 0.55; fPct = 0.15; break;
        case 'lowcarb': pPct = 0.35; cPct = 0.25; fPct = 0.40; break;
        case 'keto': pPct = 0.25; cPct = 0.05; fPct = 0.70; break;
        case 'highprotein': pPct = 0.40; cPct = 0.35; fPct = 0.25; break;
        default: pPct = 0.30; cPct = 0.40; fPct = 0.30;
      }
      const proteinG = (cal * pPct) / 4;
      const carbG = (cal * cPct) / 4;
      const fatG = (cal * fPct) / 9;
      return [
        { label: 'Protein', value: `${fmt(proteinG, 0)} g (${fmt(pPct * 100, 0)}%)`, highlight: true },
        { label: 'Carbohydrates', value: `${fmt(carbG, 0)} g (${fmt(cPct * 100, 0)}%)`, highlight: true },
        { label: 'Fat', value: `${fmt(fatG, 0)} g (${fmt(fPct * 100, 0)}%)`, highlight: true },
        { label: 'Total Calories', value: `${fmt(proteinG * 4 + carbG * 4 + fatG * 9, 0)} kcal` },
      ];
    },
  },

  // 8. Water Intake Calculator
  {
    id: 'water-intake-calculator',
    name: 'Water Intake Calculator',
    description: 'Calculate your recommended daily water intake based on body weight, activity level, and climate. Stay properly hydrated for optimal health and performance.',
    keywords: ['water intake', 'hydration calculator', 'daily water', 'water consumption', 'fluid intake', 'hydration needs', 'drinking water', 'water requirement'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'weight', label: 'Body Weight', type: 'number', default: 70, min: 10, max: 500, suffix: 'kg' },
      { id: 'activity', label: 'Activity Level', type: 'select', default: 'moderate', options: [
        { label: 'Sedentary', value: 'sedentary' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Active', value: 'active' },
        { label: 'Very Active', value: 'very_active' },
      ] },
      { id: 'climate', label: 'Climate', type: 'select', default: 'temperate', options: [
        { label: 'Cold', value: 'cold' },
        { label: 'Temperate', value: 'temperate' },
        { label: 'Hot', value: 'hot' },
      ] },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      if (w <= 0) return [{ label: 'Water Intake', value: 'N/A' }];
      let base = w * 0.033;
      if (inputs.activity === 'active') base *= 1.2;
      else if (inputs.activity === 'very_active') base *= 1.4;
      if (inputs.climate === 'hot') base *= 1.15;
      else if (inputs.climate === 'cold') base *= 0.95;
      return [
        { label: 'Daily Water Intake', value: `${fmt(base, 1)} liters`, highlight: true },
        { label: 'In Milliliters', value: `${fmt(base * 1000, 0)} mL` },
        { label: 'In Ounces', value: `${fmt(base * 33.814, 0)} fl oz` },
        { label: 'Glasses (250mL each)', value: `${fmt(base * 4, 0)} glasses` },
      ];
    },
  },

  // 9. Pregnancy Due Date Calculator
  {
    id: 'pregnancy-due-date-calculator',
    name: 'Pregnancy Due Date Calculator',
    description: 'Calculate your estimated due date and current week of pregnancy based on the first day of your last menstrual period (LMP). Uses Naegele\'s rule for EDD estimation.',
    keywords: ['due date', 'pregnancy calculator', 'expected delivery', 'EDD', 'gestational age', 'Naegele rule', 'pregnancy week', 'trimester'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'lmp', label: 'First Day of Last Period', type: 'text', default: '', placeholder: 'YYYY-MM-DD' },
    ],
    compute: (inputs) => {
      const lmpStr = String(inputs.lmp);
      const lmp = new Date(lmpStr);
      if (isNaN(lmp.getTime())) return [{ label: 'Due Date', value: 'Enter a valid date (YYYY-MM-DD)' }];
      const dueDate = new Date(lmp);
      dueDate.setDate(dueDate.getDate() + 280);
      const now = new Date();
      const diffMs = now.getTime() - lmp.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      let trimester = '';
      if (weeks < 13) trimester = 'First Trimester';
      else if (weeks < 27) trimester = 'Second Trimester';
      else trimester = 'Third Trimester';
      return [
        { label: 'Estimated Due Date', value: dueDate.toISOString().split('T')[0], highlight: true },
        { label: 'Current Week', value: `${weeks} weeks, ${days} days` },
        { label: 'Trimester', value: trimester },
        { label: 'Days Until Due', value: `${Math.max(0, Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))} days` },
      ];
    },
  },

  // 10. Ovulation Calculator
  {
    id: 'ovulation-calculator',
    name: 'Ovulation Calculator',
    description: 'Predict your ovulation date and fertile window based on your menstrual cycle length and last period date. Helps identify the most fertile days for conception.',
    keywords: ['ovulation', 'fertile window', 'conception date', 'ovulation predictor', 'fertility calendar', 'fertile days', 'menstrual cycle', 'luteal phase'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'lmp', label: 'First Day of Last Period', type: 'text', default: '', placeholder: 'YYYY-MM-DD' },
      { id: 'cycleLength', label: 'Cycle Length', type: 'number', default: 28, min: 20, max: 45, suffix: 'days' },
    ],
    compute: (inputs) => {
      const lmpStr = String(inputs.lmp);
      const lmp = new Date(lmpStr);
      const cycle = Number(inputs.cycleLength);
      if (isNaN(lmp.getTime()) || cycle <= 0) return [{ label: 'Ovulation Date', value: 'Enter valid date and cycle length' }];
      const ovulationDay = new Date(lmp);
      ovulationDay.setDate(ovulationDay.getDate() + cycle - 14);
      const fertileStart = new Date(ovulationDay);
      fertileStart.setDate(fertileStart.getDate() - 5);
      const fertileEnd = new Date(ovulationDay);
      fertileEnd.setDate(fertileEnd.getDate() + 1);
      const nextPeriod = new Date(lmp);
      nextPeriod.setDate(nextPeriod.getDate() + cycle);
      return [
        { label: 'Estimated Ovulation', value: ovulationDay.toISOString().split('T')[0], highlight: true },
        { label: 'Fertile Window Start', value: fertileStart.toISOString().split('T')[0] },
        { label: 'Fertile Window End', value: fertileEnd.toISOString().split('T')[0] },
        { label: 'Next Period Expected', value: nextPeriod.toISOString().split('T')[0] },
      ];
    },
  },

  // 11. Blood Alcohol Content Calculator (Widmark)
  {
    id: 'blood-alcohol-calculator',
    name: 'Blood Alcohol Calculator',
    description: 'Estimate your Blood Alcohol Content (BAC) using the Widmark formula. Accounts for gender, body weight, number of drinks, and time elapsed since drinking began.',
    keywords: ['BAC', 'blood alcohol', 'intoxication level', 'Widmark formula', 'blood alcohol content', 'alcohol calculator', 'drink driving', 'legal limit', 'breathalyzer estimate'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weight', label: 'Body Weight', type: 'number', default: 70, min: 30, max: 300, suffix: 'kg' },
      { id: 'drinks', label: 'Number of Standard Drinks', type: 'number', default: 2, min: 0, max: 30, suffix: 'drinks' },
      { id: 'hours', label: 'Hours Since First Drink', type: 'number', default: 1, min: 0, max: 24, step: 0.5, suffix: 'hrs' },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      const drinks = Number(inputs.drinks);
      const hours = Number(inputs.hours);
      if (w <= 0 || drinks < 0) return [{ label: 'BAC', value: 'N/A' }];
      const alcoholG = drinks * 14;
      const r = inputs.gender === 'male' ? 0.68 : 0.55;
      const bac = (alcoholG / (w * 1000 * r)) * 100 - 0.015 * hours;
      const bacClamped = Math.max(0, bac);
      let status = '';
      if (bacClamped < 0.02) status = 'Sober / Minimal Effect';
      else if (bacClamped < 0.05) status = 'Mild Relaxation';
      else if (bacClamped < 0.08) status = 'Reduced Inhibition';
      else if (bacClamped < 0.10) status = 'Legally Impaired (US)';
      else if (bacClamped < 0.15) status = 'Significant Impairment';
      else if (bacClamped < 0.30) status = 'Severe Impairment';
      else status = 'Life Threatening';
      return [
        { label: 'Estimated BAC', value: `${fmt(bacClamped, 3)}%`, highlight: true },
        { label: 'Status', value: status },
        { label: 'Legal Limit (US)', value: '0.08%' },
        { label: 'Time to Sober (est.)', value: `${fmt(Math.max(0, bacClamped / 0.015), 1)} hours` },
      ];
    },
  },

  // 12. Heart Rate Zone Calculator
  {
    id: 'heart-rate-zone-calculator',
    name: 'Heart Rate Zone Calculator',
    description: 'Calculate your heart rate training zones based on your age and resting heart rate using the Karvonen formula. Identify fat-burning, cardio, and peak zones.',
    keywords: ['heart rate zones', 'training zones', 'cardio zones', 'Karvonen formula', 'target heart rate', 'exercise intensity', 'fat burning zone', 'max heart rate'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'age', label: 'Age', type: 'number', default: 30, min: 1, max: 120, suffix: 'years' },
      { id: 'restingHR', label: 'Resting Heart Rate', type: 'number', default: 65, min: 30, max: 120, suffix: 'bpm' },
    ],
    compute: (inputs) => {
      const age = Number(inputs.age);
      const rhr = Number(inputs.restingHR);
      if (age <= 0 || rhr <= 0) return [{ label: 'Heart Rate Zones', value: 'N/A' }];
      const mhr = 220 - age;
      const hrReserve = mhr - rhr;
      const zones = [
        { name: 'Zone 1 – Recovery', low: 0.50, high: 0.60 },
        { name: 'Zone 2 – Fat Burn', low: 0.60, high: 0.70 },
        { name: 'Zone 3 – Aerobic', low: 0.70, high: 0.80 },
        { name: 'Zone 4 – Anaerobic', low: 0.80, high: 0.90 },
        { name: 'Zone 5 – VO2 Max', low: 0.90, high: 1.00 },
      ];
      const results: { label: string; value: string; highlight?: boolean }[] = [
        { label: 'Max Heart Rate', value: `${mhr} bpm`, highlight: true },
      ];
      for (const z of zones) {
        const low = Math.round(rhr + hrReserve * z.low);
        const high = Math.round(rhr + hrReserve * z.high);
        results.push({ label: z.name, value: `${low} – ${high} bpm` });
      }
      return results;
    },
  },

  // 13. Pace Calculator
  {
    id: 'pace-calculator',
    name: 'Pace Calculator',
    description: 'Calculate your running pace, finish time, or distance. Convert between min/km and min/mile to plan your training runs and race strategy.',
    keywords: ['pace calculator', 'running pace', 'min per mile', 'min per km', 'running speed', 'race pace', 'finish time', 'run time'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'distance', label: 'Distance', type: 'number', default: 5, min: 0.01, max: 1000, step: 0.01, suffix: 'km' },
      { id: 'timeMinutes', label: 'Time (minutes)', type: 'number', default: 25, min: 0, max: 9999, suffix: 'min' },
      { id: 'timeSeconds', label: 'Time (seconds)', type: 'number', default: 0, min: 0, max: 59, suffix: 'sec' },
    ],
    compute: (inputs) => {
      const dist = Number(inputs.distance);
      const mins = Number(inputs.timeMinutes);
      const secs = Number(inputs.timeSeconds);
      if (dist <= 0) return [{ label: 'Pace', value: 'N/A' }];
      const totalMin = mins + secs / 60;
      if (totalMin <= 0) return [{ label: 'Pace', value: 'N/A' }];
      const pacePerKm = totalMin / dist;
      const pacePerMi = pacePerKm * 1.60934;
      const speedKmh = dist / (totalMin / 60);
      const paceKmMin = Math.floor(pacePerKm);
      const paceKmSec = Math.round((pacePerKm - paceKmMin) * 60);
      const paceMiMin = Math.floor(pacePerMi);
      const paceMiSec = Math.round((pacePerMi - paceMiMin) * 60);
      return [
        { label: 'Pace (min/km)', value: `${paceKmMin}:${paceKmSec.toString().padStart(2, '0')}`, highlight: true },
        { label: 'Pace (min/mi)', value: `${paceMiMin}:${paceMiSec.toString().padStart(2, '0')}` },
        { label: 'Speed', value: `${fmt(speedKmh, 1)} km/h` },
        { label: 'Speed (mph)', value: `${fmt(speedKmh / 1.60934, 1)} mph` },
      ];
    },
  },

  // 14. VO2 Max Calculator
  {
    id: 'vo2-max-calculator',
    name: 'VO2 Max Calculator',
    description: 'Estimate your VO2 max (maximal oxygen consumption) using the Cooper 12-minute run test or the Rockport walking test. A key indicator of cardiovascular fitness.',
    keywords: ['VO2 max', 'aerobic capacity', 'oxygen consumption', 'cardiovascular fitness', 'Cooper test', 'Rockport test', 'maximal oxygen uptake', 'endurance fitness'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'method', label: 'Test Method', type: 'select', default: 'cooper', options: [
        { label: 'Cooper 12-min Run', value: 'cooper' },
        { label: 'Rockport Walk', value: 'rockport' },
      ] },
      { id: 'distance', label: '12-min Run Distance (Cooper)', type: 'number', default: 2400, min: 100, max: 6000, suffix: 'm' },
      { id: 'walkTime', label: '1-Mile Walk Time (Rockport)', type: 'number', default: 15, min: 5, max: 60, suffix: 'min' },
      { id: 'walkHR', label: 'End Heart Rate (Rockport)', type: 'number', default: 130, min: 40, max: 220, suffix: 'bpm' },
      { id: 'gender', label: 'Gender (Rockport)', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'age', label: 'Age (Rockport)', type: 'number', default: 30, min: 10, max: 100, suffix: 'years' },
    ],
    compute: (inputs) => {
      if (inputs.method === 'cooper') {
        const d = Number(inputs.distance);
        if (d <= 0) return [{ label: 'VO2 Max', value: 'N/A' }];
        const vo2 = (d - 504.9) / 44.73;
        let rating = '';
        // Simplified rating for males age 20-29
        if (vo2 >= 52) rating = 'Superior';
        else if (vo2 >= 47) rating = 'Excellent';
        else if (vo2 >= 42) rating = 'Good';
        else if (vo2 >= 37) rating = 'Fair';
        else rating = 'Poor';
        return [
          { label: 'VO2 Max', value: `${fmt(vo2, 1)} mL/kg/min`, highlight: true },
          { label: 'Fitness Rating', value: rating },
        ];
      } else {
        const time = Number(inputs.walkTime);
        const hr = Number(inputs.walkHR);
        const age = Number(inputs.age);
        if (time <= 0 || hr <= 0 || age <= 0) return [{ label: 'VO2 Max', value: 'N/A' }];
        let vo2: number;
        if (inputs.gender === 'female') {
          vo2 = 139.168 - (0.388 * age) - (0.075 * 2.20462 * 70) - (3.265 * time) - (0.1575 * hr);
        } else {
          vo2 = 139.168 - (0.388 * age) - (0.075 * 2.20462 * 70) - (3.265 * time) - (0.1575 * hr) + 6.318;
        }
        vo2 = Math.max(0, vo2);
        return [
          { label: 'VO2 Max', value: `${fmt(vo2, 1)} mL/kg/min`, highlight: true },
        ];
      }
    },
  },

  // 15. Lean Body Mass Calculator
  {
    id: 'lean-body-mass-calculator',
    name: 'Lean Body Mass Calculator',
    description: 'Calculate your lean body mass (LBM) using the Boer, James, and Hume formulas. Lean body mass represents fat-free mass including muscles, bones, and organs.',
    keywords: ['lean body mass', 'LBM', 'fat-free mass', 'lean mass', 'muscle mass estimate', 'Boer formula', 'James formula', 'Hume formula'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weight', label: 'Weight', type: 'number', default: 70, min: 1, max: 500, suffix: 'kg' },
      { id: 'height', label: 'Height', type: 'number', default: 170, min: 50, max: 300, suffix: 'cm' },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      const h = Number(inputs.height);
      if (w <= 0 || h <= 0) return [{ label: 'LBM', value: 'N/A' }];
      let boer: number, james: number, hume: number;
      if (inputs.gender === 'male') {
        boer = 0.407 * w + 0.267 * h - 19.2;
        james = 1.1 * w - 128 * (w / (h / 100)) ** 2;
        hume = 0.32810 * w + 0.33929 * h - 29.5336;
      } else {
        boer = 0.252 * w + 0.473 * h - 48.3;
        james = 1.07 * w - 148 * (w / (h / 100)) ** 2;
        hume = 0.29569 * w + 0.41813 * h - 43.2933;
      }
      const avg = (boer + james + hume) / 3;
      const bodyFatPct = ((w - avg) / w) * 100;
      return [
        { label: 'Lean Body Mass (avg)', value: `${fmt(avg, 1)} kg`, highlight: true },
        { label: 'Boer Formula', value: `${fmt(boer, 1)} kg` },
        { label: 'James Formula', value: `${fmt(james, 1)} kg` },
        { label: 'Hume Formula', value: `${fmt(hume, 1)} kg` },
        { label: 'Estimated Body Fat', value: `${fmt(bodyFatPct, 1)}%` },
      ];
    },
  },

  // 16. Waist-to-Hip Ratio Calculator
  {
    id: 'waist-hip-ratio-calculator',
    name: 'Waist-to-Hip Ratio Calculator',
    description: 'Calculate your waist-to-hip ratio (WHR) to assess body shape and health risk. A key indicator of visceral fat distribution and cardiovascular disease risk.',
    keywords: ['waist to hip ratio', 'WHR', 'body shape index', 'apple shape', 'pear shape', 'visceral fat', 'waist circumference', 'abdominal obesity'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'gender', label: 'Gender', type: 'select', default: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'waist', label: 'Waist Circumference', type: 'number', default: 85, min: 30, max: 200, suffix: 'cm' },
      { id: 'hip', label: 'Hip Circumference', type: 'number', default: 95, min: 30, max: 200, suffix: 'cm' },
    ],
    compute: (inputs) => {
      const waist = Number(inputs.waist);
      const hip = Number(inputs.hip);
      if (waist <= 0 || hip <= 0) return [{ label: 'WHR', value: 'N/A' }];
      const whr = waist / hip;
      let risk = '';
      if (inputs.gender === 'male') {
        if (whr < 0.90) risk = 'Low Risk';
        else if (whr < 1.00) risk = 'Moderate Risk';
        else risk = 'High Risk';
      } else {
        if (whr < 0.80) risk = 'Low Risk';
        else if (whr < 0.85) risk = 'Moderate Risk';
        else risk = 'High Risk';
      }
      const shape = (inputs.gender === 'male' && whr < 1.0) || (inputs.gender === 'female' && whr < 0.85) ? 'Pear Shape (healthier)' : 'Apple Shape (higher risk)';
      return [
        { label: 'Waist-to-Hip Ratio', value: fmt(whr, 3), highlight: true },
        { label: 'Health Risk', value: risk },
        { label: 'Body Shape', value: shape },
      ];
    },
  },

  // 17. Protein Calculator
  {
    id: 'protein-calculator',
    name: 'Protein Calculator',
    description: 'Calculate your recommended daily protein intake based on body weight, activity level, and fitness goals. Essential for muscle building, recovery, and overall health.',
    keywords: ['protein calculator', 'daily protein', 'protein intake', 'protein needs', 'protein per kg', 'amino acids', 'muscle protein', 'protein RDA'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'weight', label: 'Body Weight', type: 'number', default: 70, min: 10, max: 500, suffix: 'kg' },
      { id: 'goal', label: 'Goal', type: 'select', default: 'maintain', options: [
        { label: 'Sedentary (0.8 g/kg)', value: 'sedentary' },
        { label: 'Maintenance (1.0 g/kg)', value: 'maintain' },
        { label: 'Active/Endurance (1.4 g/kg)', value: 'active' },
        { label: 'Muscle Building (1.8 g/kg)', value: 'build' },
        { label: 'Athlete (2.2 g/kg)', value: 'athlete' },
      ] },
    ],
    compute: (inputs) => {
      const w = Number(inputs.weight);
      if (w <= 0) return [{ label: 'Protein', value: 'N/A' }];
      let gPerKg: number;
      switch (inputs.goal) {
        case 'sedentary': gPerKg = 0.8; break;
        case 'active': gPerKg = 1.4; break;
        case 'build': gPerKg = 1.8; break;
        case 'athlete': gPerKg = 2.2; break;
        default: gPerKg = 1.0;
      }
      const protein = w * gPerKg;
      return [
        { label: 'Daily Protein', value: `${fmt(protein, 0)} g`, highlight: true },
        { label: 'Per kg Body Weight', value: `${gPerKg} g/kg` },
        { label: 'Calories from Protein', value: `${fmt(protein * 4, 0)} kcal` },
      ];
    },
  },

  // 18. Carb Calculator
  {
    id: 'carb-calculator',
    name: 'Carb Calculator',
    description: 'Calculate your recommended daily carbohydrate intake based on total calories and chosen percentage. Supports keto, low-carb, moderate, and high-carb diets.',
    keywords: ['carb calculator', 'carbohydrate intake', 'daily carbs', 'carb needs', 'net carbs', 'low carb diet', 'carb percentage', 'glycogen fueling'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'calories', label: 'Daily Calories', type: 'number', default: 2000, min: 500, max: 10000, suffix: 'kcal' },
      { id: 'carbPct', label: 'Carb Percentage', type: 'select', default: '45', options: [
        { label: 'Keto (5%)', value: '5' },
        { label: 'Low Carb (20%)', value: '20' },
        { label: 'Moderate (35%)', value: '35' },
        { label: 'Standard (45%)', value: '45' },
        { label: 'High Carb (60%)', value: '60' },
        { label: 'Endurance (70%)', value: '70' },
      ] },
    ],
    compute: (inputs) => {
      const cal = Number(inputs.calories);
      const pct = Number(inputs.carbPct) / 100;
      if (cal <= 0) return [{ label: 'Carbs', value: 'N/A' }];
      const carbG = (cal * pct) / 4;
      return [
        { label: 'Daily Carbohydrates', value: `${fmt(carbG, 0)} g`, highlight: true },
        { label: 'Percentage of Calories', value: `${fmt(pct * 100, 0)}%` },
        { label: 'Calories from Carbs', value: `${fmt(carbG * 4, 0)} kcal` },
        { label: 'Per Meal (4 meals)', value: `${fmt(carbG / 4, 0)} g` },
      ];
    },
  },

  // 19. Fibromyalgia Impact Calculator (FIQR)
  {
    id: 'fibromyalgia-calculator',
    name: 'Fibromyalgia Impact Calculator',
    description: 'Calculate the Revised Fibromyalgia Impact Questionnaire (FIQR) score to assess the severity and impact of fibromyalgia symptoms on daily functioning and quality of life.',
    keywords: ['fibromyalgia score', 'FIQR', 'fibromyalgia impact', 'fibromyalgia severity', 'chronic pain assessment', 'fibromyalgia questionnaire', 'pain impact score', 'tender points'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'function1', label: 'Difficulty doing daily tasks', type: 'number', default: 3, min: 0, max: 10 },
      { id: 'function2', label: 'Difficulty walking several blocks', type: 'number', default: 3, min: 0, max: 10 },
      { id: 'function3', label: 'Difficulty doing chores', type: 'number', default: 3, min: 0, max: 10 },
      { id: 'symptom1', label: 'Pain severity', type: 'number', default: 5, min: 0, max: 10 },
      { id: 'symptom2', label: 'Fatigue severity', type: 'number', default: 5, min: 0, max: 10 },
      { id: 'symptom3', label: 'Morning tiredness', type: 'number', default: 5, min: 0, max: 10 },
      { id: 'overall1', label: 'Overall impact', type: 'number', default: 5, min: 0, max: 10 },
      { id: 'overall2', label: 'Difficulty working', type: 'number', default: 5, min: 0, max: 10 },
      { id: 'overall3', label: 'Difficulty thinking clearly', type: 'number', default: 5, min: 0, max: 10 },
    ],
    compute: (inputs) => {
      const f1 = Number(inputs.function1);
      const f2 = Number(inputs.function2);
      const f3 = Number(inputs.function3);
      const s1 = Number(inputs.symptom1);
      const s2 = Number(inputs.symptom2);
      const s3 = Number(inputs.symptom3);
      const o1 = Number(inputs.overall1);
      const o2 = Number(inputs.overall2);
      const o3 = Number(inputs.overall3);
      const functionScore = (f1 + f2 + f3) / 3;
      const symptomScore = (s1 + s2 + s3) / 3;
      const overallScore = (o1 + o2 + o3) / 3;
      const fiqr = (functionScore + symptomScore + overallScore) * (10 / 3);
      let severity = '';
      if (fiqr < 30) severity = 'Mild Impact';
      else if (fiqr < 50) severity = 'Moderate Impact';
      else if (fiqr < 70) severity = 'Severe Impact';
      else severity = 'Very Severe Impact';
      return [
        { label: 'FIQR Total Score', value: fmt(fiqr, 1), highlight: true },
        { label: 'Function Domain', value: fmt(functionScore * (10 / 3), 1) },
        { label: 'Symptom Domain', value: fmt(symptomScore * (10 / 3), 1) },
        { label: 'Overall Impact Domain', value: fmt(overallScore * (10 / 3), 1) },
        { label: 'Severity', value: severity },
      ];
    },
  },

  // 20. Sleep Calculator
  {
    id: 'sleep-calculator',
    name: 'Sleep Calculator',
    description: 'Calculate optimal bedtime or wake-up time based on 90-minute sleep cycles. Wake up refreshed by aligning your alarm with the end of a sleep cycle rather than deep sleep.',
    keywords: ['sleep calculator', 'sleep cycles', 'bedtime calculator', 'wake up time', 'sleep cycle', '90 minute cycle', 'circadian rhythm', 'optimal sleep'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'mode', label: 'Calculate', type: 'select', default: 'wake', options: [
        { label: 'Wake-up Time → Bedtimes', value: 'wake' },
        { label: 'Bedtime → Wake-up Times', value: 'bed' },
      ] },
      { id: 'time', label: 'Time (HH:MM, 24h)', type: 'text', default: '07:00', placeholder: 'e.g., 07:00' },
    ],
    compute: (inputs) => {
      const timeStr = String(inputs.time);
      const parts = timeStr.split(':');
      if (parts.length !== 2) return [{ label: 'Result', value: 'Enter time as HH:MM' }];
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return [{ label: 'Result', value: 'Enter valid time (HH:MM)' }];
      }
      const totalMin = hours * 60 + minutes;
      const cycleMin = 90;
      const fallAsleepMin = 15;
      const results: { label: string; value: string; highlight?: boolean }[] = [];
      if (inputs.mode === 'wake') {
        // Given wake time, suggest bedtimes
        for (let cycles = 6; cycles >= 3; cycles--) {
          const bedMin = totalMin - cycles * cycleMin - fallAsleepMin;
          const adjusted = ((bedMin % 1440) + 1440) % 1440;
          const h = Math.floor(adjusted / 60);
          const m = adjusted % 60;
          results.push({
            label: `${cycles} cycles (${cycles * 1.5}h sleep)`,
            value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
            highlight: cycles === 6,
          });
        }
      } else {
        // Given bedtime, suggest wake times
        for (let cycles = 3; cycles <= 6; cycles++) {
          const wakeMin = totalMin + cycles * cycleMin + fallAsleepMin;
          const adjusted = ((wakeMin % 1440) + 1440) % 1440;
          const h = Math.floor(adjusted / 60);
          const m = adjusted % 60;
          results.push({
            label: `${cycles} cycles (${cycles * 1.5}h sleep)`,
            value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
            highlight: cycles === 6,
          });
        }
      }
      return results;
    },
  },

  // 21. Blood Pressure Calculator
  {
    id: 'blood-pressure-calculator',
    name: 'Blood Pressure Calculator',
    description: 'Classify your blood pressure reading according to AHA/ACC guidelines. Determine if your systolic and diastolic values fall in normal, elevated, or hypertensive ranges.',
    keywords: ['blood pressure', 'hypertension', 'systolic diastolic', 'BP category', 'AHA blood pressure', 'high blood pressure', 'prehypertension', 'hypotension'],
    category: 'health',
    icon: 'Heart',
    fields: [
      { id: 'systolic', label: 'Systolic (top number)', type: 'number', default: 120, min: 50, max: 300, suffix: 'mmHg' },
      { id: 'diastolic', label: 'Diastolic (bottom number)', type: 'number', default: 80, min: 30, max: 200, suffix: 'mmHg' },
    ],
    compute: (inputs) => {
      const sys = Number(inputs.systolic);
      const dia = Number(inputs.diastolic);
      if (sys <= 0 || dia <= 0) return [{ label: 'Category', value: 'N/A' }];
      let category = '';
      let advice = '';
      if (sys < 90 || dia < 60) {
        category = 'Low Blood Pressure (Hypotension)';
        advice = 'May cause dizziness or fainting. Consult a doctor if symptomatic.';
      } else if (sys < 120 && dia < 80) {
        category = 'Normal';
        advice = 'Your blood pressure is within the healthy range.';
      } else if (sys >= 120 && sys <= 129 && dia < 80) {
        category = 'Elevated';
        advice = 'Your blood pressure is slightly above normal. Lifestyle changes recommended.';
      } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
        category = 'High Blood Pressure (Stage 1 Hypertension)';
        advice = 'Consult your doctor. Lifestyle changes and possibly medication.';
      } else if (sys >= 140 || dia >= 90) {
        category = 'High Blood Pressure (Stage 2 Hypertension)';
        advice = 'Medical attention recommended. Medication likely needed.';
      }
      if (sys > 180 || dia > 120) {
        category = 'Hypertensive Crisis';
        advice = 'Seek emergency medical attention immediately!';
      }
      const pulsePressure = sys - dia;
      const map = dia + (pulsePressure / 3);
      return [
        { label: 'Category', value: category, highlight: true },
        { label: 'Advice', value: advice },
        { label: 'Pulse Pressure', value: `${pulsePressure} mmHg` },
        { label: 'Mean Arterial Pressure', value: `${fmt(map, 0)} mmHg` },
      ];
    },
  },

];
