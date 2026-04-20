import { Calculator, fmt, fmtSci } from '../calc-types';

export const financeCalculators: Calculator[] = [
  // 1. Mortgage Calculator
  {
    id: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    description: 'Calculate monthly mortgage payments, total interest paid, and full amortization breakdown for home loans. Supports fixed-rate mortgages with adjustable terms and interest rates.',
    keywords: ['mortgage calculator', 'home loan', 'monthly payment', 'house payment', 'mortgage payment', 'principal and interest', 'amortization schedule', 'fixed rate mortgage'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'loanAmount', label: 'Loan Amount', type: 'number', default: 300000, min: 0, step: 1000, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'number', default: 6.5, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'number', default: 30, min: 1, max: 50, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const P = Number(inputs.loanAmount);
      const annualRate = Number(inputs.interestRate) / 100;
      const years = Number(inputs.loanTerm);
      const r = annualRate / 12;
      const n = years * 12;
      if (P <= 0 || r <= 0 || n <= 0) return [{ label: 'Monthly Payment', value: 'N/A' }];
      const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPaid = M * n;
      const totalInterest = totalPaid - P;
      return [
        { label: 'Monthly Payment', value: fmt(M, 2), highlight: true },
        { label: 'Total Payment', value: fmt(totalPaid, 2) },
        { label: 'Total Interest', value: fmt(totalInterest, 2) },
        { label: 'Interest-to-Principal Ratio', value: fmt(totalInterest / P * 100, 2) + '%' },
      ];
    },
  },

  // 2. Auto Loan Calculator
  {
    id: 'auto-loan-calculator',
    name: 'Auto Loan Calculator',
    description: 'Calculate monthly car payments, total interest, and cost of auto financing. Factor in down payment, trade-in value, sales tax, and loan term for accurate vehicle financing estimates.',
    keywords: ['auto loan', 'car payment', 'vehicle financing', 'car loan calculator', 'auto financing', 'vehicle loan', 'car loan interest', 'new car payment'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'vehiclePrice', label: 'Vehicle Price', type: 'number', default: 35000, min: 0, step: 500, prefix: '$' },
      { id: 'downPayment', label: 'Down Payment', type: 'number', default: 5000, min: 0, step: 500, prefix: '$' },
      { id: 'tradeIn', label: 'Trade-In Value', type: 'number', default: 0, min: 0, step: 500, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'number', default: 5.9, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'number', default: 5, min: 1, max: 10, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const price = Number(inputs.vehiclePrice);
      const down = Number(inputs.downPayment);
      const trade = Number(inputs.tradeIn);
      const P = price - down - trade;
      const annualRate = Number(inputs.interestRate) / 100;
      const years = Number(inputs.loanTerm);
      const r = annualRate / 12;
      const n = years * 12;
      if (P <= 0) return [{ label: 'Monthly Payment', value: '$0.00', highlight: true }];
      if (r === 0) {
        const M = P / n;
        return [
          { label: 'Monthly Payment', value: fmt(M, 2), highlight: true },
          { label: 'Total Payment', value: fmt(P, 2) },
          { label: 'Total Interest', value: '$0.00' },
          { label: 'Loan Amount', value: fmt(P, 2) },
        ];
      }
      const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPaid = M * n;
      const totalInterest = totalPaid - P;
      return [
        { label: 'Monthly Payment', value: fmt(M, 2), highlight: true },
        { label: 'Loan Amount', value: fmt(P, 2) },
        { label: 'Total Payment', value: fmt(totalPaid, 2) },
        { label: 'Total Interest', value: fmt(totalInterest, 2) },
      ];
    },
  },

  // 3. Compound Interest Calculator
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    description: 'Calculate compound interest with various compounding frequencies: daily, monthly, quarterly, or annually. See how interest-on-interest grows your investment over time.',
    keywords: ['compound interest', 'interest on interest', 'compounding frequency', 'compound growth', 'investment compound', 'annual percentage yield', 'APY', 'compound rate'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'principal', label: 'Initial Principal', type: 'number', default: 10000, min: 0, step: 100, prefix: '$' },
      { id: 'rate', label: 'Annual Interest Rate', type: 'number', default: 5, min: 0, max: 100, step: 0.1, suffix: '%' },
      { id: 'years', label: 'Time Period', type: 'number', default: 10, min: 0, max: 100, step: 1, suffix: ' years' },
      { id: 'compounding', label: 'Compounding Frequency', type: 'select', default: '12', options: [
        { label: 'Annually (1/yr)', value: '1' },
        { label: 'Semi-Annually (2/yr)', value: '2' },
        { label: 'Quarterly (4/yr)', value: '4' },
        { label: 'Monthly (12/yr)', value: '12' },
        { label: 'Daily (365/yr)', value: '365' },
      ]},
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', default: 0, min: 0, step: 50, prefix: '$' },
    ],
    compute: (inputs) => {
      const P = Number(inputs.principal);
      const r = Number(inputs.rate) / 100;
      const t = Number(inputs.years);
      const n = Number(inputs.compounding);
      const PMT = Number(inputs.monthlyContribution);
      // A = P(1 + r/n)^(nt)
      const compoundFactor = Math.pow(1 + r / n, n * t);
      const futureValuePrincipal = P * compoundFactor;
      // Future value of series of monthly contributions compounded at rate r/n per period
      // Contributions are monthly, so we need to handle this carefully
      // FV of monthly contributions = PMT * [((1 + r/n)^(nt) - 1) / (r/n)] * adjustment for monthly vs compounding period
      let futureValueContributions = 0;
      if (PMT > 0 && r > 0) {
        const monthlyRate = r / 12;
        const totalMonths = t * 12;
        futureValueContributions = PMT * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
      } else if (PMT > 0) {
        futureValueContributions = PMT * t * 12;
      }
      const totalFutureValue = futureValuePrincipal + futureValueContributions;
      const totalContributions = P + PMT * t * 12;
      const totalInterest = totalFutureValue - totalContributions;
      const apy = r > 0 ? (Math.pow(1 + r / n, n) - 1) * 100 : 0;
      return [
        { label: 'Future Value', value: fmt(totalFutureValue, 2), highlight: true },
        { label: 'Total Principal', value: fmt(totalContributions, 2) },
        { label: 'Total Interest Earned', value: fmt(totalInterest, 2) },
        { label: 'Annual Percentage Yield (APY)', value: fmt(apy, 4) + '%' },
      ];
    },
  },

  // 4. Simple Interest Calculator
  {
    id: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    description: 'Calculate simple interest on a principal amount at a fixed rate. Simple interest does not compound — ideal for short-term loans, bonds, and flat-rate financing.',
    keywords: ['simple interest', 'flat rate interest', 'simple interest formula', 'interest only', 'non-compounding interest', 'straight interest', 'I equals PRT'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'principal', label: 'Principal Amount', type: 'number', default: 10000, min: 0, step: 100, prefix: '$' },
      { id: 'rate', label: 'Annual Interest Rate', type: 'number', default: 5, min: 0, max: 100, step: 0.1, suffix: '%' },
      { id: 'years', label: 'Time Period', type: 'number', default: 5, min: 0, max: 100, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const P = Number(inputs.principal);
      const R = Number(inputs.rate) / 100;
      const T = Number(inputs.years);
      const interest = P * R * T;
      const totalAmount = P + interest;
      return [
        { label: 'Simple Interest', value: fmt(interest, 2), highlight: true },
        { label: 'Total Amount (Principal + Interest)', value: fmt(totalAmount, 2) },
        { label: 'Daily Interest', value: fmt(interest / (T * 365), 4) },
        { label: 'Monthly Interest', value: fmt(interest / (T * 12), 2) },
      ];
    },
  },

  // 5. ROI Calculator
  {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    description: 'Calculate Return on Investment (ROI) to measure investment profitability. Compare gains against costs to evaluate the efficiency of any investment or business venture.',
    keywords: ['ROI', 'return on investment', 'investment return', 'profitability ratio', 'investment efficiency', 'gain to cost ratio', 'investment performance', 'net return'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'investmentCost', label: 'Investment Cost', type: 'number', default: 50000, min: 0, step: 100, prefix: '$' },
      { id: 'finalValue', label: 'Final Value / Return', type: 'number', default: 75000, min: 0, step: 100, prefix: '$' },
      { id: 'holdingPeriod', label: 'Holding Period', type: 'number', default: 3, min: 0, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const cost = Number(inputs.investmentCost);
      const final = Number(inputs.finalValue);
      const years = Number(inputs.holdingPeriod);
      if (cost === 0) return [{ label: 'ROI', value: 'N/A' }];
      const netProfit = final - cost;
      const roi = (netProfit / cost) * 100;
      const annualizedROI = years > 0 ? (Math.pow(final / cost, 1 / years) - 1) * 100 : 0;
      return [
        { label: 'ROI', value: fmt(roi, 2) + '%', highlight: true },
        { label: 'Net Profit', value: fmt(netProfit, 2) },
        { label: 'Annualized ROI', value: fmt(annualizedROI, 2) + '%' },
      ];
    },
  },

  // 6. NPV Calculator
  {
    id: 'npv-calculator',
    name: 'Net Present Value Calculator',
    description: 'Calculate Net Present Value (NPV) of a series of cash flows using a discount rate. Essential for DCF analysis and capital budgeting decisions — a tool most competitors lack.',
    keywords: ['NPV', 'net present value', 'discounted cash flow', 'DCF', 'capital budgeting', 'discount rate', 'present value of cash flows', 'investment appraisal'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'discountRate', label: 'Discount Rate', type: 'number', default: 10, min: 0, max: 100, step: 0.5, suffix: '%' },
      { id: 'initialInvestment', label: 'Initial Investment (Year 0)', type: 'number', default: 100000, min: 0, step: 1000, prefix: '$' },
      { id: 'cashFlows', label: 'Annual Cash Flows (comma-separated, Year 1 to N)', type: 'text', default: '30000,35000,40000,35000,30000', placeholder: 'e.g. 30000,35000,40000,35000,30000' },
    ],
    compute: (inputs) => {
      const r = Number(inputs.discountRate) / 100;
      const initial = Number(inputs.initialInvestment);
      const cfStr = String(inputs.cashFlows);
      const cashFlows = cfStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      let npv = -initial;
      cashFlows.forEach((cf, i) => {
        npv += cf / Math.pow(1 + r, i + 1);
      });
      const totalInflow = cashFlows.reduce((a, b) => a + b, 0);
      const profitabilityIndex = initial > 0 ? (npv + initial) / initial : 0;
      return [
        { label: 'Net Present Value (NPV)', value: fmt(npv, 2), highlight: true },
        { label: 'Total Cash Inflows', value: fmt(totalInflow, 2) },
        { label: 'Profitability Index', value: fmt(profitabilityIndex, 4) },
        { label: 'Investment Decision', value: npv > 0 ? 'Accept (NPV > 0)' : npv === 0 ? 'Neutral (NPV = 0)' : 'Reject (NPV < 0)' },
      ];
    },
  },

  // 7. IRR Calculator
  {
    id: 'irr-calculator',
    name: 'Internal Rate of Return Calculator',
    description: 'Calculate the Internal Rate of Return (IRR) for a series of cash flows. IRR is the discount rate that makes NPV zero — critical for comparing investment opportunities.',
    keywords: ['IRR', 'internal rate of return', 'discount rate', 'hurdle rate', 'investment comparison', 'yield on investment', 'breakeven discount rate', 'NPV zero rate'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'initialInvestment', label: 'Initial Investment (Year 0)', type: 'number', default: 100000, min: 0, step: 1000, prefix: '$' },
      { id: 'cashFlows', label: 'Annual Cash Flows (comma-separated, Year 1 to N)', type: 'text', default: '30000,35000,40000,35000,30000', placeholder: 'e.g. 30000,35000,40000,35000,30000' },
    ],
    compute: (inputs) => {
      const initial = Number(inputs.initialInvestment);
      const cfStr = String(inputs.cashFlows);
      const cashFlows = [-initial, ...cfStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))];
      // Newton-Raphson method for IRR
      let irr = 0.1; // initial guess
      for (let iter = 0; iter < 1000; iter++) {
        let npv = 0;
        let dnpv = 0;
        for (let t = 0; t < cashFlows.length; t++) {
          npv += cashFlows[t] / Math.pow(1 + irr, t);
          dnpv += -t * cashFlows[t] / Math.pow(1 + irr, t + 1);
        }
        if (Math.abs(dnpv) < 1e-12) break;
        const newIrr = irr - npv / dnpv;
        if (Math.abs(newIrr - irr) < 1e-10) { irr = newIrr; break; }
        irr = newIrr;
      }
      const totalInflow = cashFlows.slice(1).reduce((a, b) => a + b, 0);
      return [
        { label: 'Internal Rate of Return (IRR)', value: fmt(irr * 100, 4) + '%', highlight: true },
        { label: 'Total Cash Inflows', value: fmt(totalInflow, 2) },
        { label: 'Net Profit', value: fmt(totalInflow - initial, 2) },
        { label: 'Number of Periods', value: cashFlows.length - 1 },
      ];
    },
  },

  // 8. Payback Period Calculator
  {
    id: 'payback-period-calculator',
    name: 'Payback Period Calculator',
    description: 'Calculate how long it takes for an investment to recover its initial cost. Payback period analysis helps evaluate risk and liquidity of investment projects.',
    keywords: ['payback period', 'break even time', 'investment recovery', 'payback analysis', 'cost recovery', 'investment payback', 'breakeven period', 'capital recovery time'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'initialInvestment', label: 'Initial Investment', type: 'number', default: 100000, min: 0, step: 1000, prefix: '$' },
      { id: 'annualCashFlow', label: 'Annual Cash Flow', type: 'number', default: 25000, min: 0, step: 100, prefix: '$' },
    ],
    compute: (inputs) => {
      const investment = Number(inputs.initialInvestment);
      const cashFlow = Number(inputs.annualCashFlow);
      if (cashFlow <= 0) return [{ label: 'Payback Period', value: 'Never (no cash inflow)', highlight: true }];
      const payback = investment / cashFlow;
      const years = Math.floor(payback);
      const months = Math.round((payback - years) * 12);
      return [
        { label: 'Payback Period', value: fmt(payback, 2) + ' years', highlight: true },
        { label: 'Approximately', value: `${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}` },
        { label: 'Annual ROI', value: fmt(cashFlow / investment * 100, 2) + '%' },
      ];
    },
  },

  // 9. Break-Even Calculator
  {
    id: 'break-even-calculator',
    name: 'Break-Even Calculator',
    description: 'Calculate the break-even point where total revenue equals total costs. Essential for business planning, pricing strategy, and determining minimum sales volume.',
    keywords: ['break even', 'break even analysis', 'BEP', 'break even point', 'cost volume profit', 'CVP analysis', 'contribution margin', 'fixed and variable costs'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'fixedCosts', label: 'Fixed Costs', type: 'number', default: 50000, min: 0, step: 100, prefix: '$' },
      { id: 'pricePerUnit', label: 'Selling Price per Unit', type: 'number', default: 50, min: 0, step: 1, prefix: '$' },
      { id: 'variableCostPerUnit', label: 'Variable Cost per Unit', type: 'number', default: 30, min: 0, step: 1, prefix: '$' },
    ],
    compute: (inputs) => {
      const FC = Number(inputs.fixedCosts);
      const P = Number(inputs.pricePerUnit);
      const VC = Number(inputs.variableCostPerUnit);
      const contribution = P - VC;
      if (contribution <= 0) return [{ label: 'Break-Even Point', value: 'Never (contribution margin ≤ 0)', highlight: true }];
      const bepUnits = FC / contribution;
      const bepRevenue = bepUnits * P;
      const contributionMarginRatio = contribution / P * 100;
      return [
        { label: 'Break-Even Point (Units)', value: fmt(bepUnits, 0), highlight: true },
        { label: 'Break-Even Revenue', value: fmt(bepRevenue, 2) },
        { label: 'Contribution Margin per Unit', value: fmt(contribution, 2) },
        { label: 'Contribution Margin Ratio', value: fmt(contributionMarginRatio, 2) + '%' },
      ];
    },
  },

  // 10. Salary Calculator
  {
    id: 'salary-calculator',
    name: 'Salary Calculator',
    description: 'Convert between hourly, daily, weekly, bi-weekly, semi-monthly, monthly, and annual salary. Understand your true earnings across different pay periods.',
    keywords: ['salary calculator', 'hourly to salary', 'annual salary', 'wage conversion', 'pay period conversion', 'salary breakdown', 'gross income', 'income calculator'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'amount', label: 'Salary Amount', type: 'number', default: 75000, min: 0, step: 1000, prefix: '$' },
      { id: 'payPeriod', label: 'Pay Period', type: 'select', default: 'annual', options: [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Bi-Weekly', value: 'biweekly' },
        { label: 'Semi-Monthly', value: 'semimonthly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Annual', value: 'annual' },
      ]},
      { id: 'hoursPerWeek', label: 'Hours per Week', type: 'number', default: 40, min: 1, max: 168, step: 1 },
      { id: 'daysPerWeek', label: 'Working Days per Week', type: 'number', default: 5, min: 1, max: 7, step: 1 },
    ],
    compute: (inputs) => {
      const amount = Number(inputs.amount);
      const period = String(inputs.payPeriod);
      const hpw = Number(inputs.hoursPerWeek);
      const dpw = Number(inputs.daysPerWeek);
      // Convert to annual first
      let annual: number;
      switch (period) {
        case 'hourly': annual = amount * hpw * 52; break;
        case 'daily': annual = amount * dpw * 52; break;
        case 'weekly': annual = amount * 52; break;
        case 'biweekly': annual = amount * 26; break;
        case 'semimonthly': annual = amount * 24; break;
        case 'monthly': annual = amount * 12; break;
        default: annual = amount;
      }
      const hourly = annual / (hpw * 52);
      const daily = annual / (dpw * 52);
      const weekly = annual / 52;
      const biweekly = annual / 26;
      const semimonthly = annual / 24;
      const monthly = annual / 12;
      return [
        { label: 'Hourly', value: fmt(hourly, 2) },
        { label: 'Daily', value: fmt(daily, 2) },
        { label: 'Weekly', value: fmt(weekly, 2) },
        { label: 'Bi-Weekly', value: fmt(biweekly, 2) },
        { label: 'Semi-Monthly', value: fmt(semimonthly, 2) },
        { label: 'Monthly', value: fmt(monthly, 2) },
        { label: 'Annual', value: fmt(annual, 2), highlight: true },
      ];
    },
  },

  // 11. Hourly to Salary Calculator
  {
    id: 'hourly-to-salary-calculator',
    name: 'Hourly to Salary Calculator',
    description: 'Quickly convert an hourly wage to equivalent annual, monthly, and weekly salary. Factor in overtime and working hours to see your true earning potential.',
    keywords: ['hourly to salary', 'wage conversion', 'hourly rate to salary', 'wage to annual', 'hourly wage conversion', 'pay rate conversion'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'hourlyRate', label: 'Hourly Rate', type: 'number', default: 25, min: 0, step: 0.5, prefix: '$' },
      { id: 'hoursPerWeek', label: 'Hours per Week', type: 'number', default: 40, min: 1, max: 168, step: 1 },
      { id: 'weeksPerYear', label: 'Weeks per Year', type: 'number', default: 52, min: 1, max: 52, step: 1 },
    ],
    compute: (inputs) => {
      const rate = Number(inputs.hourlyRate);
      const hpw = Number(inputs.hoursPerWeek);
      const wpy = Number(inputs.weeksPerYear);
      const weekly = rate * hpw;
      const annual = weekly * wpy;
      const monthly = annual / 12;
      const daily = rate * (hpw / 5);
      const biweekly = weekly * 2;
      return [
        { label: 'Annual Salary', value: fmt(annual, 2), highlight: true },
        { label: 'Monthly Salary', value: fmt(monthly, 2) },
        { label: 'Bi-Weekly Pay', value: fmt(biweekly, 2) },
        { label: 'Weekly Pay', value: fmt(weekly, 2) },
        { label: 'Daily Pay (5-day week)', value: fmt(daily, 2) },
      ];
    },
  },

  // 12. Tip Calculator
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tip amounts and split bills among multiple people. Supports custom tip percentages and quick tip presets for restaurants, bars, and services.',
    keywords: ['tip calculator', 'gratuity', 'split bill', 'restaurant tip', 'tip percentage', 'bill splitter', 'dinner split', 'service tip'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'billAmount', label: 'Bill Amount', type: 'number', default: 85, min: 0, step: 1, prefix: '$' },
      { id: 'tipPercent', label: 'Tip Percentage', type: 'number', default: 18, min: 0, max: 100, step: 1, suffix: '%' },
      { id: 'splitCount', label: 'Split Between', type: 'number', default: 1, min: 1, max: 100, step: 1, suffix: ' people' },
    ],
    compute: (inputs) => {
      const bill = Number(inputs.billAmount);
      const tipPct = Number(inputs.tipPercent);
      const split = Number(inputs.splitCount);
      const tip = bill * tipPct / 100;
      const total = bill + tip;
      const perPerson = total / split;
      const tipPerPerson = tip / split;
      return [
        { label: 'Tip Amount', value: fmt(tip, 2) },
        { label: 'Total (Bill + Tip)', value: fmt(total, 2), highlight: true },
        { label: 'Per Person Total', value: fmt(perPerson, 2) },
        { label: 'Per Person Tip', value: fmt(tipPerPerson, 2) },
      ];
    },
  },

  // 13. Discount Calculator
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    description: 'Calculate sale price after discount, or find the original price from a discounted price. Supports single and multiple discounts for shopping and retail analysis.',
    keywords: ['discount calculator', 'sale price', 'percent off', 'price reduction', 'markdown calculator', 'retail discount', 'clearance price', 'discount amount'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'originalPrice', label: 'Original Price', type: 'number', default: 100, min: 0, step: 1, prefix: '$' },
      { id: 'discountPercent', label: 'Discount Percentage', type: 'number', default: 25, min: 0, max: 100, step: 1, suffix: '%' },
    ],
    compute: (inputs) => {
      const price = Number(inputs.originalPrice);
      const disc = Number(inputs.discountPercent);
      const savings = price * disc / 100;
      const salePrice = price - savings;
      return [
        { label: 'Sale Price', value: fmt(salePrice, 2), highlight: true },
        { label: 'You Save', value: fmt(savings, 2) },
        { label: 'Discount Fraction', value: fmt(disc, 0) + '% off' },
      ];
    },
  },

  // 14. Markup Calculator
  {
    id: 'markup-calculator',
    name: 'Markup Calculator',
    description: 'Calculate selling price from cost and markup percentage, or find markup from cost and price. Understand the difference between markup and margin for pricing strategy.',
    keywords: ['markup calculator', 'cost to price', 'markup percentage', 'pricing strategy', 'cost plus pricing', 'markup margin', 'selling price from cost', 'markup vs margin'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'cost', label: 'Cost', type: 'number', default: 60, min: 0, step: 1, prefix: '$' },
      { id: 'markupPercent', label: 'Markup Percentage', type: 'number', default: 50, min: 0, max: 10000, step: 1, suffix: '%' },
    ],
    compute: (inputs) => {
      const cost = Number(inputs.cost);
      const markup = Number(inputs.markupPercent);
      const markupAmount = cost * markup / 100;
      const sellingPrice = cost + markupAmount;
      const profitMargin = sellingPrice > 0 ? (markupAmount / sellingPrice) * 100 : 0;
      return [
        { label: 'Selling Price', value: fmt(sellingPrice, 2), highlight: true },
        { label: 'Markup Amount', value: fmt(markupAmount, 2) },
        { label: 'Profit Margin', value: fmt(profitMargin, 2) + '%' },
      ];
    },
  },

  // 15. Margin Calculator
  {
    id: 'margin-calculator',
    name: 'Margin Calculator',
    description: 'Calculate profit margin, gross margin, and markup from cost and revenue. Understand the relationship between margin and markup for better business pricing decisions.',
    keywords: ['margin calculator', 'profit margin', 'gross margin', 'net margin', 'margin percentage', 'profitability', 'revenue to profit', 'margin vs markup'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'cost', label: 'Cost', type: 'number', default: 60, min: 0, step: 1, prefix: '$' },
      { id: 'revenue', label: 'Revenue / Selling Price', type: 'number', default: 100, min: 0, step: 1, prefix: '$' },
    ],
    compute: (inputs) => {
      const cost = Number(inputs.cost);
      const revenue = Number(inputs.revenue);
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const markup = cost > 0 ? (profit / cost) * 100 : 0;
      return [
        { label: 'Profit', value: fmt(profit, 2) },
        { label: 'Profit Margin', value: fmt(margin, 2) + '%', highlight: true },
        { label: 'Markup', value: fmt(markup, 2) + '%' },
      ];
    },
  },

  // 16. Inflation Calculator
  {
    id: 'inflation-calculator',
    name: 'Inflation Calculator',
    description: 'Adjust money for inflation to understand purchasing power changes over time. Calculate the real value of money factoring in CPI and inflation rates — a niche tool most sites lack.',
    keywords: ['inflation calculator', 'purchasing power', 'CPI adjustment', 'real vs nominal', 'inflation rate', 'cost of living increase', 'dollar devaluation', 'historical inflation'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'currentAmount', label: 'Current Amount', type: 'number', default: 1000, min: 0, step: 100, prefix: '$' },
      { id: 'inflationRate', label: 'Average Annual Inflation Rate', type: 'number', default: 3, min: 0, max: 100, step: 0.1, suffix: '%' },
      { id: 'years', label: 'Number of Years', type: 'number', default: 10, min: 0, max: 100, step: 1 },
    ],
    compute: (inputs) => {
      const amount = Number(inputs.currentAmount);
      const rate = Number(inputs.inflationRate) / 100;
      const years = Number(inputs.years);
      const futureCost = amount * Math.pow(1 + rate, years);
      const purchasingPower = amount / Math.pow(1 + rate, years);
      const totalInflation = ((futureCost / amount) - 1) * 100;
      const realValueLost = amount - purchasingPower;
      return [
        { label: 'Equivalent Cost in Future', value: fmt(futureCost, 2), highlight: true },
        { label: 'Purchasing Power of Current $', value: fmt(purchasingPower, 2) },
        { label: 'Cumulative Inflation', value: fmt(totalInflation, 2) + '%' },
        { label: 'Real Value Lost', value: fmt(realValueLost, 2) },
      ];
    },
  },

  // 17. Retirement Calculator
  {
    id: 'retirement-calculator',
    name: 'Retirement Calculator',
    description: 'Project your retirement savings growth based on current savings, monthly contributions, and expected returns. Plan your nest egg and see if you are on track for retirement.',
    keywords: ['retirement calculator', 'retirement savings', 'nest egg', 'retirement planning', 'retirement fund', 'financial independence', 'savings projection', 'retirement goal'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'currentAge', label: 'Current Age', type: 'number', default: 30, min: 18, max: 100, step: 1 },
      { id: 'retirementAge', label: 'Retirement Age', type: 'number', default: 65, min: 18, max: 100, step: 1 },
      { id: 'currentSavings', label: 'Current Savings', type: 'number', default: 50000, min: 0, step: 1000, prefix: '$' },
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', default: 1000, min: 0, step: 50, prefix: '$' },
      { id: 'annualReturn', label: 'Expected Annual Return', type: 'number', default: 7, min: 0, max: 50, step: 0.5, suffix: '%' },
    ],
    compute: (inputs) => {
      const currentAge = Number(inputs.currentAge);
      const retAge = Number(inputs.retirementAge);
      const current = Number(inputs.currentSavings);
      const monthly = Number(inputs.monthlyContribution);
      const rate = Number(inputs.annualReturn) / 100;
      const years = retAge - currentAge;
      if (years <= 0) return [{ label: 'Retirement Savings', value: 'Retirement age must be greater than current age', highlight: true }];
      const monthlyRate = rate / 12;
      const months = years * 12;
      let fvCurrent = current;
      let fvContributions = 0;
      if (rate > 0) {
        fvCurrent = current * Math.pow(1 + monthlyRate, months);
        fvContributions = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
      } else {
        fvContributions = monthly * months;
      }
      const total = fvCurrent + fvContributions;
      const totalContributed = current + monthly * months;
      const totalGrowth = total - totalContributed;
      const monthlyWithdrawal25 = total * 0.04 / 12; // 4% rule
      return [
        { label: 'Projected Retirement Savings', value: fmt(total, 2), highlight: true },
        { label: 'Total Contributions', value: fmt(totalContributed, 2) },
        { label: 'Investment Growth', value: fmt(totalGrowth, 2) },
        { label: 'Monthly Withdrawal (4% Rule)', value: fmt(monthlyWithdrawal25, 2) },
        { label: 'Years to Retirement', value: years },
      ];
    },
  },

  // 18. 401k Calculator
  {
    id: '401k-calculator',
    name: '401(k) Calculator',
    description: 'Project your 401(k) balance with employer matching contributions. Factor in annual raises, contribution limits, and employer match to optimize your retirement savings strategy.',
    keywords: ['401k calculator', '401k contribution', 'employer match', 'retirement account', '401k growth', 'employer matching', 'pre-tax contribution', '401k projection'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'currentBalance', label: 'Current 401(k) Balance', type: 'number', default: 50000, min: 0, step: 1000, prefix: '$' },
      { id: 'annualSalary', label: 'Annual Salary', type: 'number', default: 80000, min: 0, step: 1000, prefix: '$' },
      { id: 'contributionPercent', label: 'Your Contribution', type: 'number', default: 10, min: 0, max: 100, step: 1, suffix: '%' },
      { id: 'employerMatchPercent', label: 'Employer Match', type: 'number', default: 5, min: 0, max: 100, step: 0.5, suffix: '%' },
      { id: 'annualReturn', label: 'Expected Annual Return', type: 'number', default: 7, min: 0, max: 50, step: 0.5, suffix: '%' },
      { id: 'years', label: 'Years to Retirement', type: 'number', default: 30, min: 1, max: 60, step: 1 },
    ],
    compute: (inputs) => {
      const balance = Number(inputs.currentBalance);
      const salary = Number(inputs.annualSalary);
      const contribPct = Number(inputs.contributionPercent) / 100;
      const matchPct = Number(inputs.employerMatchPercent) / 100;
      const rate = Number(inputs.annualReturn) / 100;
      const yrs = Number(inputs.years);
      const annualContrib = salary * contribPct;
      const employerContrib = salary * matchPct;
      const totalAnnualContrib = annualContrib + employerContrib;
      // FV of current balance
      const fvBalance = balance * Math.pow(1 + rate, yrs);
      // FV of annual contributions (end of year)
      const fvContrib = rate > 0
        ? totalAnnualContrib * (Math.pow(1 + rate, yrs) - 1) / rate
        : totalAnnualContrib * yrs;
      const total = fvBalance + fvContrib;
      const totalYouContrib = annualContrib * yrs;
      const totalEmployerContrib = employerContrib * yrs;
      return [
        { label: 'Projected 401(k) Balance', value: fmt(total, 2), highlight: true },
        { label: 'Your Total Contributions', value: fmt(totalYouContrib, 2) },
        { label: 'Employer Total Match', value: fmt(totalEmployerContrib, 2) },
        { label: 'Investment Growth', value: fmt(total - totalYouContrib - totalEmployerContrib - balance, 2) },
        { label: 'Monthly Contribution (You)', value: fmt(annualContrib / 12, 2) },
        { label: 'Monthly Employer Match', value: fmt(employerContrib / 12, 2) },
      ];
    },
  },

  // 19. Roth IRA Calculator
  {
    id: 'roth-ira-calculator',
    name: 'Roth IRA Calculator',
    description: 'Project Roth IRA growth with after-tax contributions and tax-free withdrawals. See how tax-free compounding over decades maximizes your retirement savings potential.',
    keywords: ['Roth IRA', 'after-tax retirement', 'tax-free growth', 'Roth IRA contribution', 'tax-free withdrawal', 'Roth IRA limits', 'retirement tax planning', 'Roth conversion'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'currentBalance', label: 'Current Roth IRA Balance', type: 'number', default: 20000, min: 0, step: 1000, prefix: '$' },
      { id: 'annualContribution', label: 'Annual Contribution', type: 'number', default: 7000, min: 0, step: 500, prefix: '$' },
      { id: 'annualReturn', label: 'Expected Annual Return', type: 'number', default: 8, min: 0, max: 50, step: 0.5, suffix: '%' },
      { id: 'years', label: 'Years to Retirement', type: 'number', default: 30, min: 1, max: 60, step: 1 },
      { id: 'taxBracket', label: 'Current Tax Bracket', type: 'number', default: 24, min: 0, max: 50, step: 1, suffix: '%' },
    ],
    compute: (inputs) => {
      const balance = Number(inputs.currentBalance);
      const annual = Number(inputs.annualContribution);
      const rate = Number(inputs.annualReturn) / 100;
      const yrs = Number(inputs.years);
      const taxBracket = Number(inputs.taxBracket) / 100;
      const fvBalance = balance * Math.pow(1 + rate, yrs);
      const fvContrib = rate > 0
        ? annual * (Math.pow(1 + rate, yrs) - 1) / rate
        : annual * yrs;
      const totalTaxFree = fvBalance + fvContrib;
      const totalContributions = balance + annual * yrs;
      const totalGrowth = totalTaxFree - totalContributions;
      // Compare with taxable account
      const taxableFvBalance = balance * Math.pow(1 + rate * (1 - taxBracket * 0.15), yrs); // rough drag
      const taxSavings = totalTaxFree * taxBracket * 0.3; // rough estimate of tax saved on withdrawals
      return [
        { label: 'Projected Tax-Free Balance', value: fmt(totalTaxFree, 2), highlight: true },
        { label: 'Total Contributions', value: fmt(totalContributions, 2) },
        { label: 'Tax-Free Growth', value: fmt(totalGrowth, 2) },
        { label: 'Effective Annual Return After Tax Drag (Traditional)', value: fmt(rate * (1 - taxBracket * 0.15) * 100, 2) + '%' },
        { label: 'Estimated Tax Savings vs Traditional', value: fmt(taxSavings, 2) },
      ];
    },
  },

  // 20. Annuity Calculator
  {
    id: 'annuity-calculator',
    name: 'Annuity Calculator',
    description: 'Calculate periodic annuity payments from a present value or future value. Supports ordinary annuity and annuity-due calculations for retirement and insurance planning.',
    keywords: ['annuity calculator', 'annuity payment', 'periodic payment', 'ordinary annuity', 'annuity due', 'present value annuity', 'future value annuity', 'pension payment'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'presentValue', label: 'Present Value / Lump Sum', type: 'number', default: 500000, min: 0, step: 1000, prefix: '$' },
      { id: 'rate', label: 'Annual Interest Rate', type: 'number', default: 5, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'periods', label: 'Number of Periods', type: 'number', default: 240, min: 1, max: 600, step: 1, suffix: ' months' },
      { id: 'type', label: 'Annuity Type', type: 'select', default: 'ordinary', options: [
        { label: 'Ordinary (end of period)', value: 'ordinary' },
        { label: 'Annuity Due (beginning of period)', value: 'due' },
      ]},
    ],
    compute: (inputs) => {
      const PV = Number(inputs.presentValue);
      const r = Number(inputs.rate) / 100 / 12;
      const n = Number(inputs.periods);
      const isDue = String(inputs.type) === 'due';
      let PMT: number;
      if (r === 0) {
        PMT = PV / n;
      } else {
        PMT = PV * r / (1 - Math.pow(1 + r, -n));
        if (isDue) PMT = PMT / (1 + r);
      }
      const totalPaid = PMT * n;
      const totalInterest = totalPaid - PV;
      return [
        { label: 'Periodic Payment', value: fmt(PMT, 2), highlight: true },
        { label: 'Total Payments', value: fmt(totalPaid, 2) },
        { label: 'Total Interest', value: fmt(totalInterest, 2) },
        { label: 'Interest-to-Principal Ratio', value: PV > 0 ? fmt(totalInterest / PV * 100, 2) + '%' : '0%' },
      ];
    },
  },

  // 21. Present Value Calculator
  {
    id: 'present-value-calculator',
    name: 'Present Value Calculator',
    description: 'Calculate the present value of a future sum of money using a discount rate. Understand the time value of money — what a future amount is worth in today\'s dollars.',
    keywords: ['present value', 'PV', 'time value of money', 'discounted value', 'present worth', 'discount factor', 'TVM', 'present value formula'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'futureValue', label: 'Future Value', type: 'number', default: 100000, min: 0, step: 1000, prefix: '$' },
      { id: 'rate', label: 'Discount Rate', type: 'number', default: 5, min: 0, max: 100, step: 0.5, suffix: '%' },
      { id: 'years', label: 'Number of Years', type: 'number', default: 10, min: 0, max: 100, step: 1 },
      { id: 'compounding', label: 'Compounding', type: 'select', default: '12', options: [
        { label: 'Annually', value: '1' },
        { label: 'Semi-Annually', value: '2' },
        { label: 'Quarterly', value: '4' },
        { label: 'Monthly', value: '12' },
        { label: 'Daily', value: '365' },
      ]},
    ],
    compute: (inputs) => {
      const FV = Number(inputs.futureValue);
      const r = Number(inputs.rate) / 100;
      const t = Number(inputs.years);
      const n = Number(inputs.compounding);
      const PV = FV / Math.pow(1 + r / n, n * t);
      const discountFactor = 1 / Math.pow(1 + r / n, n * t);
      return [
        { label: 'Present Value', value: fmt(PV, 2), highlight: true },
        { label: 'Discount Factor', value: fmt(discountFactor, 6) },
        { label: 'Value Lost to Time', value: fmt(FV - PV, 2) },
      ];
    },
  },

  // 22. Future Value Calculator
  {
    id: 'future-value-calculator',
    name: 'Future Value Calculator',
    description: 'Calculate the future value of a current investment with compound interest. See how your money grows over time with different rates and compounding periods.',
    keywords: ['future value', 'FV', 'investment growth', 'compound growth', 'time value of money', 'future worth', 'investment projection', 'FV formula'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'presentValue', label: 'Present Value', type: 'number', default: 10000, min: 0, step: 100, prefix: '$' },
      { id: 'rate', label: 'Annual Interest Rate', type: 'number', default: 7, min: 0, max: 100, step: 0.5, suffix: '%' },
      { id: 'years', label: 'Number of Years', type: 'number', default: 20, min: 0, max: 100, step: 1 },
      { id: 'compounding', label: 'Compounding', type: 'select', default: '12', options: [
        { label: 'Annually', value: '1' },
        { label: 'Semi-Annually', value: '2' },
        { label: 'Quarterly', value: '4' },
        { label: 'Monthly', value: '12' },
        { label: 'Daily', value: '365' },
      ]},
    ],
    compute: (inputs) => {
      const PV = Number(inputs.presentValue);
      const r = Number(inputs.rate) / 100;
      const t = Number(inputs.years);
      const n = Number(inputs.compounding);
      const FV = PV * Math.pow(1 + r / n, n * t);
      const growth = FV - PV;
      const multiplier = FV / PV;
      return [
        { label: 'Future Value', value: fmt(FV, 2), highlight: true },
        { label: 'Total Growth', value: fmt(growth, 2) },
        { label: 'Growth Multiplier', value: fmt(multiplier, 4) + 'x' },
        { label: 'Total Return', value: fmt(growth / PV * 100, 2) + '%' },
      ];
    },
  },

  // 23. Amortization Calculator
  {
    id: 'amortization-calculator',
    name: 'Amortization Calculator',
    description: 'Generate a loan amortization schedule summary showing the breakdown of principal vs interest payments over the loan term. Understand how your loan balance decreases over time.',
    keywords: ['amortization', 'loan schedule', 'principal vs interest', 'amortization schedule', 'loan payoff schedule', 'payment breakdown', 'principal reduction', 'loan balance over time'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'loanAmount', label: 'Loan Amount', type: 'number', default: 250000, min: 0, step: 1000, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'number', default: 6, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'number', default: 30, min: 1, max: 50, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const P = Number(inputs.loanAmount);
      const annualRate = Number(inputs.interestRate) / 100;
      const years = Number(inputs.loanTerm);
      const r = annualRate / 12;
      const n = years * 12;
      if (P <= 0 || r <= 0 || n <= 0) return [{ label: 'Monthly Payment', value: 'N/A' }];
      const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      // Calculate key amortization milestones
      let balance = P;
      let totalInterest = 0;
      let totalPrincipal = 0;
      const halfN = Math.floor(n / 2);
      let balanceAtHalf = 0;
      let interestAtHalf = 0;
      for (let month = 1; month <= n; month++) {
        const interestPayment = balance * r;
        const principalPayment = M - interestPayment;
        totalInterest += interestPayment;
        totalPrincipal += principalPayment;
        balance -= principalPayment;
        if (month === halfN) {
          balanceAtHalf = balance;
          interestAtHalf = totalInterest;
        }
      }
      // First month breakdown
      const firstMonthInterest = P * r;
      const firstMonthPrincipal = M - firstMonthInterest;
      // Last month breakdown
      const lastMonthPrincipal = M - (balance + M - M * Math.pow(1 + r, 1)) * r;
      return [
        { label: 'Monthly Payment', value: fmt(M, 2), highlight: true },
        { label: 'Total Interest Paid', value: fmt(totalInterest, 2) },
        { label: 'Total Principal Paid', value: fmt(totalPrincipal, 2) },
        { label: 'First Month: Principal', value: fmt(firstMonthPrincipal, 2) },
        { label: 'First Month: Interest', value: fmt(firstMonthInterest, 2) },
        { label: 'Balance at Midpoint (Month ' + halfN + ')', value: fmt(Math.max(0, balanceAtHalf), 2) },
        { label: 'Interest Paid by Midpoint', value: fmt(interestAtHalf, 2) },
      ];
    },
  },

  // 24. Debt Payoff Calculator
  {
    id: 'debt-payoff-calculator',
    name: 'Debt Payoff Calculator',
    description: 'Calculate how long it will take to pay off debt with fixed monthly payments. See total interest paid and your debt-free date — supports snowball and avalanche method planning.',
    keywords: ['debt payoff', 'debt free date', 'snowball method', 'avalanche method', 'debt elimination', 'payoff timeline', 'debt reduction', 'accelerated payoff'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'debtAmount', label: 'Total Debt Amount', type: 'number', default: 25000, min: 0, step: 500, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'number', default: 18, min: 0, max: 100, step: 0.5, suffix: '%' },
      { id: 'monthlyPayment', label: 'Monthly Payment', type: 'number', default: 500, min: 0, step: 25, prefix: '$' },
    ],
    compute: (inputs) => {
      const P = Number(inputs.debtAmount);
      const r = Number(inputs.interestRate) / 100 / 12;
      const PMT = Number(inputs.monthlyPayment);
      if (P <= 0) return [{ label: 'Payoff Time', value: 'No debt!', highlight: true }];
      if (PMT <= 0) return [{ label: 'Payoff Time', value: 'N/A', highlight: true }];
      if (r > 0 && PMT <= P * r) {
        return [
          { label: 'Warning', value: 'Payment too low — interest exceeds payment!', highlight: true },
          { label: 'Minimum Payment Needed', value: fmt(P * r, 2) },
        ];
      }
      let months: number;
      if (r === 0) {
        months = Math.ceil(P / PMT);
      } else {
        months = Math.ceil(Math.log(PMT / (PMT - P * r)) / Math.log(1 + r));
      }
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      let balance = P;
      let totalInterest = 0;
      for (let i = 0; i < months; i++) {
        const interest = balance * r;
        totalInterest += interest;
        balance = balance - PMT + interest;
        if (balance <= 0) break;
      }
      const totalPaid = PMT * months;
      return [
        { label: 'Time to Pay Off', value: `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`, highlight: true },
        { label: 'Total Months', value: months },
        { label: 'Total Interest Paid', value: fmt(totalInterest, 2) },
        { label: 'Total Amount Paid', value: fmt(totalPaid, 2) },
      ];
    },
  },

  // 25. Credit Card Payoff Calculator
  {
    id: 'credit-card-payoff-calculator',
    name: 'Credit Card Payoff Calculator',
    description: 'Calculate how long to pay off credit card debt and total interest costs. Compare minimum payments vs fixed payments to see interest savings and accelerate your debt freedom.',
    keywords: ['credit card payoff', 'minimum payment', 'interest savings', 'credit card debt', 'card balance payoff', 'minimum vs fixed payment', 'credit card interest', 'balance payoff strategy'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'balance', label: 'Credit Card Balance', type: 'number', default: 5000, min: 0, step: 100, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate (APR)', type: 'number', default: 24.99, min: 0, max: 100, step: 0.1, suffix: '%' },
      { id: 'monthlyPayment', label: 'Monthly Payment', type: 'number', default: 200, min: 0, step: 25, prefix: '$' },
      { id: 'minPaymentPercent', label: 'Minimum Payment %', type: 'number', default: 2, min: 0, max: 10, step: 0.5, suffix: '%' },
    ],
    compute: (inputs) => {
      const P = Number(inputs.balance);
      const r = Number(inputs.interestRate) / 100 / 12;
      const PMT = Number(inputs.monthlyPayment);
      const minPct = Number(inputs.minPaymentPercent) / 100;
      if (P <= 0) return [{ label: 'Payoff Status', value: 'No balance!', highlight: true }];
      // Fixed payment calculation
      if (r > 0 && PMT <= P * r) {
        return [
          { label: 'Warning', value: 'Payment too low — interest exceeds payment!', highlight: true },
          { label: 'Minimum Needed', value: fmt(P * r + 1, 2) },
        ];
      }
      const fixedMonths = r === 0 ? Math.ceil(P / PMT) : Math.ceil(Math.log(PMT / (PMT - P * r)) / Math.log(1 + r));
      let fixedInterest = 0;
      let bal = P;
      for (let i = 0; i < fixedMonths; i++) {
        const interest = bal * r;
        fixedInterest += interest;
        bal = bal - PMT + interest;
        if (bal <= 0) break;
      }
      // Minimum payment calculation
      let minMonths = 0;
      let minInterest = 0;
      let minBal = P;
      while (minBal > 0 && minMonths < 1200) {
        const minPay = Math.max(minBal * minPct, 25); // minimum $25 or percentage
        const interest = minBal * r;
        minInterest += interest;
        minBal = minBal - minPay + interest;
        minMonths++;
        if (minPay <= interest) break;
      }
      const savings = minInterest - fixedInterest;
      return [
        { label: 'Payoff with Fixed Payment', value: `${fixedMonths} months (${Math.floor(fixedMonths/12)} yr ${fixedMonths%12} mo)`, highlight: true },
        { label: 'Interest with Fixed Payment', value: fmt(fixedInterest, 2) },
        { label: 'Payoff with Minimum Payment', value: `${minMonths} months (${Math.floor(minMonths/12)} yr ${minMonths%12} mo)` },
        { label: 'Interest with Minimum Payment', value: fmt(minInterest, 2) },
        { label: 'Interest Savings', value: fmt(savings, 2) },
      ];
    },
  },

  // 26. Capital Gains Tax Calculator
  {
    id: 'capital-gains-tax-calculator',
    name: 'Capital Gains Tax Calculator',
    description: 'Estimate capital gains tax on investment profits. Compare short-term vs long-term capital gains rates and calculate after-tax proceeds — a niche tool most sites overlook.',
    keywords: ['capital gains tax', 'investment tax', 'long term gains', 'short term gains', 'capital gains rate', 'tax on investments', 'stock sale tax', 'after tax proceeds'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'purchasePrice', label: 'Purchase Price (Cost Basis)', type: 'number', default: 50000, min: 0, step: 100, prefix: '$' },
      { id: 'salePrice', label: 'Sale Price', type: 'number', default: 85000, min: 0, step: 100, prefix: '$' },
      { id: 'holdingPeriod', label: 'Holding Period', type: 'select', default: 'long', options: [
        { label: 'Short-term (≤ 1 year)', value: 'short' },
        { label: 'Long-term (> 1 year)', value: 'long' },
      ]},
      { id: 'taxBracket', label: 'Income Tax Bracket', type: 'select', default: '22', options: [
        { label: '10%', value: '10' },
        { label: '12%', value: '12' },
        { label: '22%', value: '22' },
        { label: '24%', value: '24' },
        { label: '32%', value: '32' },
        { label: '35%', value: '35' },
        { label: '37%', value: '37' },
      ]},
    ],
    compute: (inputs) => {
      const cost = Number(inputs.purchasePrice);
      const sale = Number(inputs.salePrice);
      const isLongTerm = String(inputs.holdingPeriod) === 'long';
      const bracket = Number(inputs.taxBracket);
      const gain = sale - cost;
      if (gain <= 0) {
        return [
          { label: 'Capital Gain/Loss', value: fmt(gain, 2) },
          { label: 'Tax Owed', value: '$0.00 (capital loss)' },
          { label: 'After-Tax Proceeds', value: fmt(sale, 2), highlight: true },
        ];
      }
      // Long-term capital gains rates based on bracket
      let ltcgRate: number;
      if (bracket <= 12) ltcgRate = 0;
      else if (bracket <= 22) ltcgRate = 15;
      else ltcgRate = 20;
      // Additional 3.8% NIIT for high earners
      const niit = bracket >= 32 ? 3.8 : 0;
      const effectiveRate = isLongTerm ? ltcgRate + niit : bracket;
      const tax = gain * effectiveRate / 100;
      const afterTax = sale - tax;
      return [
        { label: 'Capital Gain', value: fmt(gain, 2), highlight: true },
        { label: 'Tax Rate Applied', value: fmt(effectiveRate, 1) + '%' },
        { label: 'Capital Gains Tax', value: fmt(tax, 2) },
        { label: 'After-Tax Proceeds', value: fmt(afterTax, 2) },
        { label: 'Tax Type', value: isLongTerm ? 'Long-term' : 'Short-term (ordinary income rate)' },
      ];
    },
  },

  // 27. Depreciation Calculator
  {
    id: 'depreciation-calculator',
    name: 'Depreciation Calculator',
    description: 'Calculate asset depreciation using straight-line or declining balance methods. Essential for accounting, tax planning, and understanding asset value decline over time.',
    keywords: ['depreciation', 'straight line depreciation', 'declining balance', 'asset depreciation', 'book value', 'double declining balance', 'depreciation schedule', 'MACRS'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'assetCost', label: 'Asset Cost', type: 'number', default: 50000, min: 0, step: 1000, prefix: '$' },
      { id: 'salvageValue', label: 'Salvage Value', type: 'number', default: 5000, min: 0, step: 500, prefix: '$' },
      { id: 'usefulLife', label: 'Useful Life', type: 'number', default: 5, min: 1, max: 50, step: 1, suffix: ' years' },
      { id: 'method', label: 'Depreciation Method', type: 'select', default: 'straight', options: [
        { label: 'Straight-Line', value: 'straight' },
        { label: 'Double Declining Balance', value: 'ddb' },
      ]},
    ],
    compute: (inputs) => {
      const cost = Number(inputs.assetCost);
      const salvage = Number(inputs.salvageValue);
      const life = Number(inputs.usefulLife);
      const method = String(inputs.method);
      const depreciable = cost - salvage;
      const results: { label: string; value: string | number; highlight?: boolean }[] = [];
      if (method === 'straight') {
        const annualDep = depreciable / life;
        results.push(
          { label: 'Annual Depreciation', value: fmt(annualDep, 2), highlight: true },
          { label: 'Depreciable Amount', value: fmt(depreciable, 2) },
          { label: 'Depreciation Rate', value: fmt(1 / life * 100, 2) + '%' },
        );
        // Show yearly schedule summary
        let bookValue = cost;
        for (let y = 1; y <= Math.min(life, 5); y++) {
          bookValue -= annualDep;
          results.push({ label: `Year ${y} Book Value`, value: fmt(Math.max(bookValue, salvage), 2) });
        }
        if (life > 5) results.push({ label: `... Year ${life} Book Value`, value: fmt(salvage, 2) });
      } else {
        // Double declining balance
        const rate = 2 / life;
        let bookValue = cost;
        let totalDep = 0;
        results.push(
          { label: 'DDB Rate', value: fmt(rate * 100, 2) + '%' },
        );
        for (let y = 1; y <= Math.min(life, 5); y++) {
          let dep = bookValue * rate;
          if (bookValue - dep < salvage) dep = bookValue - salvage;
          if (dep < 0) dep = 0;
          bookValue -= dep;
          totalDep += dep;
          results.push({ label: `Year ${y} Depreciation`, value: fmt(dep, 2) });
        }
        if (life > 5) {
          // Calculate remaining years
          for (let y = 6; y <= life; y++) {
            let dep = bookValue * rate;
            if (bookValue - dep < salvage) dep = bookValue - salvage;
            if (dep < 0) dep = 0;
            bookValue -= dep;
            totalDep += dep;
          }
          results.push({ label: `... Year ${life} Book Value`, value: fmt(Math.max(bookValue, salvage), 2) });
        }
        results.splice(1, 0, { label: 'Total Depreciation (5yr shown)', value: fmt(totalDep, 2), highlight: true });
      }
      return results;
    },
  },

  // 28. Lease Calculator
  {
    id: 'lease-calculator',
    name: 'Lease Calculator',
    description: 'Calculate monthly lease payments for vehicles and equipment. Factor in MSRP, residual value, money factor, and lease term to understand your total lease cost.',
    keywords: ['lease calculator', 'lease payment', 'money factor', 'auto lease', 'car lease', 'residual value', 'lease cost', 'capitalized cost'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'msrp', label: 'MSRP / Vehicle Price', type: 'number', default: 40000, min: 0, step: 500, prefix: '$' },
      { id: 'negotiatedPrice', label: 'Negotiated Price', type: 'number', default: 37000, min: 0, step: 500, prefix: '$' },
      { id: 'downPayment', label: 'Down Payment', type: 'number', default: 3000, min: 0, step: 500, prefix: '$' },
      { id: 'residualPercent', label: 'Residual Value', type: 'number', default: 55, min: 0, max: 100, step: 1, suffix: '%' },
      { id: 'moneyFactor', label: 'Money Factor', type: 'number', default: 0.0025, min: 0, max: 0.01, step: 0.0001 },
      { id: 'leaseTerm', label: 'Lease Term', type: 'number', default: 36, min: 12, max: 60, step: 1, suffix: ' months' },
    ],
    compute: (inputs) => {
      const msrp = Number(inputs.msrp);
      const price = Number(inputs.negotiatedPrice);
      const down = Number(inputs.downPayment);
      const resPct = Number(inputs.residualPercent) / 100;
      const mf = Number(inputs.moneyFactor);
      const term = Number(inputs.leaseTerm);
      const residualValue = msrp * resPct;
      const capitalizedCost = price - down;
      const depreciation = capitalizedCost - residualValue;
      const monthlyDepreciation = depreciation / term;
      const monthlyRentCharge = (capitalizedCost + residualValue) * mf;
      const monthlyPayment = monthlyDepreciation + monthlyRentCharge;
      const totalPayments = monthlyPayment * term;
      const totalCost = totalPayments + down;
      const effectiveAPR = mf * 2400;
      return [
        { label: 'Monthly Lease Payment', value: fmt(monthlyPayment, 2), highlight: true },
        { label: 'Monthly Depreciation', value: fmt(monthlyDepreciation, 2) },
        { label: 'Monthly Rent Charge', value: fmt(monthlyRentCharge, 2) },
        { label: 'Residual Value', value: fmt(residualValue, 2) },
        { label: 'Total Lease Cost', value: fmt(totalCost, 2) },
        { label: 'Effective APR', value: fmt(effectiveAPR, 2) + '%' },
      ];
    },
  },

  // 29. Rent vs Buy Calculator
  {
    id: 'rent-vs-buy-calculator',
    name: 'Rent vs Buy Calculator',
    description: 'Compare the total cost of renting vs buying a home over time. Factor in mortgage, taxes, appreciation, investment returns on savings, and closing costs for a comprehensive analysis.',
    keywords: ['rent vs buy', 'buying a home', 'renting vs buying', 'home ownership cost', 'rent or buy', 'housing decision', 'buy vs rent analysis', 'total cost of ownership'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'homePrice', label: 'Home Price', type: 'number', default: 400000, min: 0, step: 5000, prefix: '$' },
      { id: 'downPaymentPercent', label: 'Down Payment', type: 'number', default: 20, min: 0, max: 100, step: 1, suffix: '%' },
      { id: 'mortgageRate', label: 'Mortgage Rate', type: 'number', default: 6.5, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'number', default: 30, min: 1, max: 50, step: 1, suffix: ' years' },
      { id: 'annualAppreciation', label: 'Home Appreciation Rate', type: 'number', default: 3, min: 0, max: 20, step: 0.5, suffix: '%' },
      { id: 'monthlyRent', label: 'Monthly Rent', type: 'number', default: 2000, min: 0, step: 100, prefix: '$' },
      { id: 'investmentReturn', label: 'Investment Return (if renting)', type: 'number', default: 7, min: 0, max: 30, step: 0.5, suffix: '%' },
      { id: 'years', label: 'Time Horizon', type: 'number', default: 10, min: 1, max: 30, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const homePrice = Number(inputs.homePrice);
      const downPct = Number(inputs.downPaymentPercent) / 100;
      const mortRate = Number(inputs.mortgageRate) / 100;
      const loanYears = Number(inputs.loanTerm);
      const appreciation = Number(inputs.annualAppreciation) / 100;
      const rent = Number(inputs.monthlyRent);
      const investReturn = Number(inputs.investmentReturn) / 100;
      const years = Number(inputs.years);
      // Buying costs
      const downPayment = homePrice * downPct;
      const loanAmount = homePrice - downPayment;
      const monthlyRate = mortRate / 12;
      const n = loanYears * 12;
      const monthlyMortgage = loanAmount > 0 && monthlyRate > 0
        ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
        : loanAmount / n;
      const propertyTaxMonthly = homePrice * 0.012 / 12; // ~1.2% annual
      const insuranceMonthly = homePrice * 0.005 / 12; // ~0.5% annual
      const maintenanceMonthly = homePrice * 0.01 / 12; // ~1% annual
      const totalMonthlyBuy = monthlyMortgage + propertyTaxMonthly + insuranceMonthly + maintenanceMonthly;
      // Future home value
      const futureHomeValue = homePrice * Math.pow(1 + appreciation, years);
      // Remaining mortgage balance
      let remainingBalance = loanAmount;
      for (let m = 0; m < years * 12; m++) {
        const interest = remainingBalance * monthlyRate;
        remainingBalance -= (monthlyMortgage - interest);
      }
      remainingBalance = Math.max(0, remainingBalance);
      const homeEquity = futureHomeValue - remainingBalance;
      const totalBuyCost = totalMonthlyBuy * years * 12 + downPayment;
      const netBuyCost = totalBuyCost - homeEquity;
      // Renting costs
      const totalRentCost = rent * 12 * years; // simplified (no rent increase)
      // Investment of down payment + monthly savings
      const investMonthlyRate = investReturn / 12;
      const fvDownPayment = downPayment * Math.pow(1 + investMonthlyRate, years * 12);
      const monthlySavings = totalMonthlyBuy - rent;
      let fvSavings = 0;
      if (monthlySavings > 0 && investMonthlyRate > 0) {
        fvSavings = monthlySavings * (Math.pow(1 + investMonthlyRate, years * 12) - 1) / investMonthlyRate;
      }
      const investmentPortfolio = fvDownPayment + fvSavings;
      const netRentCost = totalRentCost - investmentPortfolio;
      return [
        { label: 'Net Cost of Buying', value: fmt(netBuyCost, 2), highlight: true },
        { label: 'Net Cost of Renting', value: fmt(netRentCost, 2), highlight: true },
        { label: 'Home Equity at Year ' + years, value: fmt(homeEquity, 2) },
        { label: 'Investment Portfolio (if renting)', value: fmt(investmentPortfolio, 2) },
        { label: 'Total Buy Payments', value: fmt(totalBuyCost, 2) },
        { label: 'Total Rent Payments', value: fmt(totalRentCost, 2) },
        { label: 'Verdict', value: netBuyCost < netRentCost ? 'Buying is better by ' + fmt(netRentCost - netBuyCost, 2) : 'Renting is better by ' + fmt(netBuyCost - netRentCost, 2) },
      ];
    },
  },

  // 30. Down Payment Calculator
  {
    id: 'down-payment-calculator',
    name: 'Down Payment Calculator',
    description: 'Calculate the down payment needed for a home purchase at different percentages. See monthly payment differences and plan your savings to reach your down payment goal.',
    keywords: ['down payment', 'home down payment', 'deposit', 'down payment savings', 'down payment percent', 'house deposit', 'earnest money', 'closing costs'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'homePrice', label: 'Home Price', type: 'number', default: 400000, min: 0, step: 5000, prefix: '$' },
      { id: 'downPaymentPercent', label: 'Down Payment Percentage', type: 'number', default: 20, min: 0, max: 100, step: 1, suffix: '%' },
      { id: 'interestRate', label: 'Mortgage Rate', type: 'number', default: 6.5, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'number', default: 30, min: 1, max: 50, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const price = Number(inputs.homePrice);
      const pct = Number(inputs.downPaymentPercent) / 100;
      const rate = Number(inputs.interestRate) / 100;
      const years = Number(inputs.loanTerm);
      const downPayment = price * pct;
      const loanAmount = price - downPayment;
      const r = rate / 12;
      const n = years * 12;
      let monthlyPayment = 0;
      if (loanAmount > 0 && r > 0) {
        monthlyPayment = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else if (loanAmount > 0) {
        monthlyPayment = loanAmount / n;
      }
      // PMI estimate if < 20% down
      const pmi = pct < 0.2 ? loanAmount * 0.005 / 12 : 0;
      const totalWithPMI = monthlyPayment + pmi;
      // Compare at different down payment levels
      const down10 = price * 0.10;
      const loan10 = price - down10;
      const monthly10 = loan10 > 0 && r > 0 ? loan10 * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
      const pmi10 = loan10 * 0.007 / 12;
      return [
        { label: 'Down Payment Required', value: fmt(downPayment, 2), highlight: true },
        { label: 'Loan Amount', value: fmt(loanAmount, 2) },
        { label: 'Monthly Payment (P&I)', value: fmt(monthlyPayment, 2) },
        { label: 'Estimated PMI (if < 20%)', value: fmt(pmi, 2) },
        { label: 'Total Monthly (P&I + PMI)', value: fmt(totalWithPMI, 2) },
        { label: 'At 10% Down: Payment + PMI', value: fmt(monthly10 + pmi10, 2) },
        { label: 'At 20% Down: Payment (no PMI)', value: fmt(price * 0.8 > 0 && r > 0 ? price * 0.8 * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0, 2) },
      ];
    },
  },

  // 31. FHA Loan Calculator
  {
    id: 'fha-loan-calculator',
    name: 'FHA Loan Calculator',
    description: 'Calculate FHA loan payments including upfront and annual MIP premiums. FHA loans allow lower down payments and credit scores — understand the true cost with mortgage insurance.',
    keywords: ['FHA loan', 'FHA mortgage', 'MIP premium', 'FHA loan payment', 'FHA mortgage insurance', 'first time homebuyer', 'low down payment FHA', 'FHA upfront MIP'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'homePrice', label: 'Home Price', type: 'number', default: 300000, min: 0, step: 5000, prefix: '$' },
      { id: 'downPaymentPercent', label: 'Down Payment', type: 'number', default: 3.5, min: 3.5, max: 100, step: 0.5, suffix: '%' },
      { id: 'interestRate', label: 'FHA Interest Rate', type: 'number', default: 6.25, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'number', default: 30, min: 1, max: 30, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const price = Number(inputs.homePrice);
      const downPct = Number(inputs.downPaymentPercent) / 100;
      const rate = Number(inputs.interestRate) / 100;
      const years = Number(inputs.loanTerm);
      const downPayment = price * downPct;
      const baseLoan = price - downPayment;
      // FHA upfront MIP: 1.75% of base loan
      const upfrontMIP = baseLoan * 0.0175;
      const totalLoan = baseLoan + upfrontMIP;
      const r = rate / 12;
      const n = years * 12;
      const monthlyPI = totalLoan > 0 && r > 0
        ? totalLoan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        : totalLoan / n;
      // Annual MIP: 0.55% for > 5yr, >95% LTV; 0.50% for ≤95% LTV
      const ltv = totalLoan / price;
      const annualMIPRate = ltv > 0.95 ? 0.0055 : 0.005;
      const monthlyMIP = totalLoan * annualMIPRate / 12;
      const totalMonthly = monthlyPI + monthlyMIP;
      const totalCost = totalMonthly * n + downPayment;
      const totalMIP = upfrontMIP + monthlyMIP * n;
      return [
        { label: 'Total Monthly Payment (P&I + MIP)', value: fmt(totalMonthly, 2), highlight: true },
        { label: 'Monthly Principal & Interest', value: fmt(monthlyPI, 2) },
        { label: 'Monthly MIP', value: fmt(monthlyMIP, 2) },
        { label: 'Upfront MIP (added to loan)', value: fmt(upfrontMIP, 2) },
        { label: 'Down Payment', value: fmt(downPayment, 2) },
        { label: 'Total Loan Amount (with upfront MIP)', value: fmt(totalLoan, 2) },
        { label: 'Total MIP Paid Over Life', value: fmt(totalMIP, 2) },
      ];
    },
  },

  // 32. VA Loan Calculator
  {
    id: 'va-loan-calculator',
    name: 'VA Loan Calculator',
    description: 'Calculate VA loan payments including the VA funding fee. VA loans offer zero down payment and no PMI for eligible veterans, active duty, and surviving spouses.',
    keywords: ['VA loan', 'veterans loan', 'no down payment mortgage', 'VA funding fee', 'VA home loan', 'military mortgage', 'VA entitlement', 'VA loan payment'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'homePrice', label: 'Home Price', type: 'number', default: 400000, min: 0, step: 5000, prefix: '$' },
      { id: 'downPaymentPercent', label: 'Down Payment', type: 'number', default: 0, min: 0, max: 100, step: 0.5, suffix: '%' },
      { id: 'interestRate', label: 'VA Interest Rate', type: 'number', default: 6, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'number', default: 30, min: 1, max: 30, step: 1, suffix: ' years' },
      { id: 'firstUse', label: 'First-Time VA Loan Use', type: 'select', default: 'yes', options: [
        { label: 'Yes (first use)', value: 'yes' },
        { label: 'No (subsequent use)', value: 'no' },
      ]},
      { id: 'disabled', label: 'Exempt from Funding Fee (VA disability)', type: 'select', default: 'no', options: [
        { label: 'No', value: 'no' },
        { label: 'Yes (exempt)', value: 'yes' },
      ]},
    ],
    compute: (inputs) => {
      const price = Number(inputs.homePrice);
      const downPct = Number(inputs.downPaymentPercent) / 100;
      const rate = Number(inputs.interestRate) / 100;
      const years = Number(inputs.loanTerm);
      const isFirst = String(inputs.firstUse) === 'yes';
      const isExempt = String(inputs.disabled) === 'yes';
      const downPayment = price * downPct;
      const baseLoan = price - downPayment;
      // VA funding fee
      let fundingFeeRate: number;
      if (isExempt) {
        fundingFeeRate = 0;
      } else if (downPct >= 0.1) {
        fundingFeeRate = isFirst ? 0.0125 : 0.015;
      } else if (downPct >= 0.05) {
        fundingFeeRate = isFirst ? 0.015 : 0.015;
      } else {
        fundingFeeRate = isFirst ? 0.0225 : 0.0325;
      }
      const fundingFee = baseLoan * fundingFeeRate;
      const totalLoan = baseLoan + fundingFee;
      const r = rate / 12;
      const n = years * 12;
      const monthlyPayment = totalLoan > 0 && r > 0
        ? totalLoan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        : totalLoan / n;
      const totalCost = monthlyPayment * n + downPayment;
      return [
        { label: 'Monthly Payment', value: fmt(monthlyPayment, 2), highlight: true },
        { label: 'VA Funding Fee', value: fmt(fundingFee, 2) },
        { label: 'Total Loan Amount', value: fmt(totalLoan, 2) },
        { label: 'Down Payment', value: fmt(downPayment, 2) },
        { label: 'Total Cost Over Loan Life', value: fmt(totalCost, 2) },
        { label: 'Funding Fee Rate', value: fmt(fundingFeeRate * 100, 2) + '%' },
      ];
    },
  },

  // 33. Savings Goal Calculator
  {
    id: 'savings-goal-calculator',
    name: 'Savings Goal Calculator',
    description: 'Calculate how much you need to save monthly to reach your financial goal. Factor in interest, current savings, and timeline to create an achievable savings plan.',
    keywords: ['savings goal', 'monthly savings', 'target amount', 'savings plan', 'goal calculator', 'savings target', 'monthly deposit needed', 'financial goal'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'goalAmount', label: 'Savings Goal', type: 'number', default: 100000, min: 0, step: 1000, prefix: '$' },
      { id: 'currentSavings', label: 'Current Savings', type: 'number', default: 10000, min: 0, step: 500, prefix: '$' },
      { id: 'timeframe', label: 'Time Frame', type: 'number', default: 5, min: 1, max: 50, step: 1, suffix: ' years' },
      { id: 'annualReturn', label: 'Expected Annual Return', type: 'number', default: 5, min: 0, max: 50, step: 0.5, suffix: '%' },
    ],
    compute: (inputs) => {
      const goal = Number(inputs.goalAmount);
      const current = Number(inputs.currentSavings);
      const years = Number(inputs.timeframe);
      const rate = Number(inputs.annualReturn) / 100;
      const months = years * 12;
      const monthlyRate = rate / 12;
      // FV of current savings
      const fvCurrent = current * Math.pow(1 + monthlyRate, months);
      // Remaining goal
      const remaining = goal - fvCurrent;
      let monthlySavings: number;
      if (remaining <= 0) {
        monthlySavings = 0;
      } else if (monthlyRate > 0) {
        monthlySavings = remaining * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
      } else {
        monthlySavings = remaining / months;
      }
      const totalContributions = current + monthlySavings * months;
      const totalGrowth = goal - totalContributions;
      return [
        { label: 'Monthly Savings Needed', value: fmt(monthlySavings, 2), highlight: true },
        { label: 'FV of Current Savings', value: fmt(fvCurrent, 2) },
        { label: 'Additional Amount Needed', value: fmt(Math.max(0, remaining), 2) },
        { label: 'Total Contributions', value: fmt(totalContributions, 2) },
        { label: 'Interest Earned', value: fmt(Math.max(0, totalGrowth), 2) },
      ];
    },
  },

  // 34. CD Calculator
  {
    id: 'cd-calculator',
    name: 'Certificate of Deposit Calculator',
    description: 'Calculate earnings on a Certificate of Deposit (CD). See total interest earned and annual percentage yield (APY) for different CD terms and compounding frequencies.',
    keywords: ['CD calculator', 'certificate of deposit', 'CD interest', 'CD rate', 'CD yield', 'CD maturity', 'APY calculator', 'savings CD'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'deposit', label: 'Initial Deposit', type: 'number', default: 10000, min: 0, step: 100, prefix: '$' },
      { id: 'rate', label: 'Annual Interest Rate (APR)', type: 'number', default: 4.5, min: 0, max: 20, step: 0.1, suffix: '%' },
      { id: 'term', label: 'CD Term', type: 'number', default: 12, min: 1, max: 120, step: 1, suffix: ' months' },
      { id: 'compounding', label: 'Compounding', type: 'select', default: 'daily', options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
      ]},
    ],
    compute: (inputs) => {
      const deposit = Number(inputs.deposit);
      const rate = Number(inputs.rate) / 100;
      const termMonths = Number(inputs.term);
      const compounding = String(inputs.compounding);
      const years = termMonths / 12;
      let n: number;
      switch (compounding) {
        case 'daily': n = 365; break;
        case 'monthly': n = 12; break;
        case 'quarterly': n = 4; break;
        default: n = 365;
      }
      const maturityValue = deposit * Math.pow(1 + rate / n, n * years);
      const interestEarned = maturityValue - deposit;
      const apy = (Math.pow(1 + rate / n, n) - 1) * 100;
      return [
        { label: 'Maturity Value', value: fmt(maturityValue, 2), highlight: true },
        { label: 'Interest Earned', value: fmt(interestEarned, 2) },
        { label: 'Annual Percentage Yield (APY)', value: fmt(apy, 4) + '%' },
        { label: 'Effective Annual Rate', value: fmt(apy, 4) + '%' },
      ];
    },
  },

  // 35. Loan Comparison Calculator
  {
    id: 'loan-comparison-calculator',
    name: 'Loan Comparison Calculator',
    description: 'Compare two loans side by side to find the best option. Analyze monthly payments, total interest, and total cost to make informed borrowing decisions.',
    keywords: ['loan comparison', 'compare mortgages', 'loan analyzer', 'compare loans', 'loan options', 'mortgage comparison', 'interest cost comparison', 'best loan choice'],
    category: 'finance',
    icon: 'DollarSign',
    fields: [
      { id: 'loanAmount', label: 'Loan Amount', type: 'number', default: 300000, min: 0, step: 1000, prefix: '$' },
      { id: 'rate1', label: 'Loan A: Interest Rate', type: 'number', default: 6.5, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'term1', label: 'Loan A: Term', type: 'number', default: 30, min: 1, max: 50, step: 1, suffix: ' years' },
      { id: 'rate2', label: 'Loan B: Interest Rate', type: 'number', default: 5.75, min: 0, max: 50, step: 0.1, suffix: '%' },
      { id: 'term2', label: 'Loan B: Term', type: 'number', default: 15, min: 1, max: 50, step: 1, suffix: ' years' },
    ],
    compute: (inputs) => {
      const P = Number(inputs.loanAmount);
      const r1 = Number(inputs.rate1) / 100 / 12;
      const n1 = Number(inputs.term1) * 12;
      const r2 = Number(inputs.rate2) / 100 / 12;
      const n2 = Number(inputs.term2) * 12;
      const calcLoan = (r: number, n: number) => {
        if (P <= 0 || n <= 0) return { monthly: 0, total: 0, interest: 0 };
        if (r === 0) return { monthly: P / n, total: P, interest: 0 };
        const monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const total = monthly * n;
        return { monthly, total, interest: total - P };
      };
      const loanA = calcLoan(r1, n1);
      const loanB = calcLoan(r2, n2);
      const savings = loanA.total - loanB.total;
      return [
        { label: 'Loan A Monthly Payment', value: fmt(loanA.monthly, 2) },
        { label: 'Loan A Total Interest', value: fmt(loanA.interest, 2) },
        { label: 'Loan A Total Cost', value: fmt(loanA.total, 2) },
        { label: 'Loan B Monthly Payment', value: fmt(loanB.monthly, 2) },
        { label: 'Loan B Total Interest', value: fmt(loanB.interest, 2) },
        { label: 'Loan B Total Cost', value: fmt(loanB.total, 2) },
        { label: 'Total Savings (Lower Cost Loan)', value: fmt(Math.abs(savings), 2), highlight: true },
        { label: 'Better Option', value: loanA.total <= loanB.total ? 'Loan A' : 'Loan B' },
      ];
    },
  },
];
