import { Calculator, CalcResult, fmt } from '../calc-types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function fleschKincaidReadingEase(text: string): number {
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  if (words.length === 0) return 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);
  const wordCount = words.length;
  let syllableCount = 0;
  for (const w of words) syllableCount += countSyllables(w);
  return 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
}

function fleschKincaidGradeLevel(text: string): number {
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  if (words.length === 0) return 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);
  const wordCount = words.length;
  let syllableCount = 0;
  for (const w of words) syllableCount += countSyllables(w);
  return 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
}

function readingLevel(ease: number): string {
  if (ease >= 90) return 'Very Easy (5th grade)';
  if (ease >= 80) return 'Easy (6th grade)';
  if (ease >= 70) return 'Fairly Easy (7th grade)';
  if (ease >= 60) return 'Standard (8th-9th grade)';
  if (ease >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (ease >= 30) return 'Difficult (College)';
  return 'Very Difficult (College Graduate)';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${fmt(bytes / Math.pow(k, i), 2)} ${sizes[i]}`;
}

// ── Calculators ──────────────────────────────────────────────────────────────

export const seoCalculators: Calculator[] = [
  // 1. Keyword Density Calculator
  {
    id: 'keyword-density-calculator',
    name: 'Keyword Density Calculator',
    description: 'Calculate keyword density and frequency from your text content. Analyze SEO keyword distribution, frequency, and prominence for optimization.',
    keywords: ['keyword density', 'SEO keyword', 'keyword frequency', 'keyword analysis', 'keyword optimization', 'SEO analysis', 'content optimization'],
    category: 'seo',
    icon: 'Globe',
    fields: [
      { id: 'text', label: 'Page Content', type: 'textarea', placeholder: 'Paste your webpage content here...', rows: 8 },
      { id: 'keyword', label: 'Target Keyword', type: 'text', placeholder: 'Enter target keyword...' },
      { id: 'topN', label: 'Show Top N Keywords', type: 'number', default: 10, min: 1, max: 50 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const keyword = String(inputs.keyword ?? '').trim().toLowerCase();
      const topN = Number(inputs.topN) || 10;
      if (!text.trim()) return [{ label: 'Result', value: 'Paste content to analyze' }];

      const words = text.match(/\b[a-zA-Z']+\b/g) || [];
      const totalWords = words.length;
      const freq: Record<string, number> = {};
      for (const w of words) {
        const key = w.toLowerCase();
        freq[key] = (freq[key] || 0) + 1;
      }

      // Also count 2-word phrases
      const phraseFreq: Record<string, number> = {};
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = (words[i] + ' ' + words[i + 1]).toLowerCase();
        phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
      }

      const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

      const topWordsList = sorted.map(([w, c]) => `${w}: ${c} (${fmt((c / totalWords) * 100, 2)}%)`).join('\n');

      const results: CalcResult[] = [
        { label: 'Total Words', value: totalWords },
        { label: 'Unique Words', value: Object.keys(freq).length },
      ];

      // If keyword specified, show its density
      if (keyword) {
        const keywordCount = freq[keyword] || 0;
        const density = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
        // Also check phrase
        const phraseCount = phraseFreq[keyword] || 0;
        const phraseDensity = totalWords > 0 ? (phraseCount / totalWords) * 100 : 0;
        const recommendation = density < 1 ? 'Too low — consider adding more occurrences' :
          density > 3 ? 'Too high — risk of keyword stuffing' : 'Good density range (1-3%)';
        results.push(
          { label: 'Keyword Occurrences', value: keywordCount, highlight: true },
          { label: 'Keyword Density', value: `${fmt(density, 2)}%`, highlight: true },
          { label: 'Phrase Occurrences (2-word)', value: phraseCount },
          { label: 'Phrase Density', value: `${fmt(phraseDensity, 2)}%` },
          { label: 'Recommendation', value: recommendation },
        );
      }

      results.push({ label: `Top ${topN} Words`, value: topWordsList || '(none)' });
      return results;
    },
  },

  // 2. Readability Score Calculator
  {
    id: 'readability-score-calculator',
    name: 'Readability Score Calculator',
    description: 'Calculate Flesch-Kincaid readability score and grade level. Measure text complexity, reading ease, and appropriate audience level.',
    keywords: ['readability score', 'Flesch-Kincaid', 'reading level', 'grade level', 'reading ease', 'text complexity', 'readability index'],
    category: 'seo',
    icon: 'Globe',
    fields: [
      { id: 'text', label: 'Text Content', type: 'textarea', placeholder: 'Paste text to analyze readability...', rows: 8 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      if (!text.trim()) return [{ label: 'Result', value: 'Paste text to analyze' }];

      const words = text.match(/\b[a-zA-Z]+\b/g) || [];
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const wordCount = words.length;
      const sentenceCount = Math.max(sentences.length, 1);
      let syllableCount = 0;
      for (const w of words) syllableCount += countSyllables(w);

      const readingEase = fleschKincaidReadingEase(text);
      const gradeLevel = fleschKincaidGradeLevel(text);
      const avgWordsPerSentence = wordCount / sentenceCount;
      const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;

      // Gunning Fog Index
      const complexWords = words.filter(w => countSyllables(w) >= 3).length;
      const gunningFog = wordCount > 0 ? 0.4 * (avgWordsPerSentence + (complexWords / wordCount) * 100) : 0;

      return [
        { label: 'Flesch Reading Ease', value: fmt(readingEase, 1), highlight: true },
        { label: 'Reading Level', value: readingLevel(readingEase), highlight: true },
        { label: 'Flesch-Kincaid Grade', value: fmt(gradeLevel, 1) },
        { label: 'Gunning Fog Index', value: fmt(gunningFog, 1) },
        { label: 'Total Words', value: wordCount },
        { label: 'Total Sentences', value: sentenceCount },
        { label: 'Total Syllables', value: syllableCount },
        { label: 'Avg Words/Sentence', value: fmt(avgWordsPerSentence, 1) },
        { label: 'Avg Syllables/Word', value: fmt(avgSyllablesPerWord, 2) },
        { label: 'Complex Words (3+ syllables)', value: complexWords },
      ];
    },
  },

  // 3. Domain Age Calculator
  {
    id: 'domain-age-calculator',
    name: 'Domain Age Calculator',
    description: 'Calculate the age of a domain from its registration date. Domain age is an important SEO metric and trust signal for search engines.',
    keywords: ['domain age', 'domain registration', 'SEO metric', 'domain trust', 'domain history', 'website age', 'domain authority'],
    category: 'seo',
    icon: 'Globe',
    fields: [
      { id: 'registrationDate', label: 'Registration Date', type: 'text', placeholder: 'YYYY-MM-DD', default: '' },
    ],
    compute: (inputs) => {
      const dateStr = String(inputs.registrationDate ?? '').trim();
      if (!dateStr) return [{ label: 'Result', value: 'Enter registration date (YYYY-MM-DD)' }];

      const regDate = new Date(dateStr);
      if (isNaN(regDate.getTime())) return [{ label: 'Error', value: 'Invalid date format. Use YYYY-MM-DD' }];

      const now = new Date();
      if (regDate > now) return [{ label: 'Error', value: 'Registration date cannot be in the future' }];

      const diffMs = now.getTime() - regDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffYears = diffDays / 365.25;
      const years = Math.floor(diffYears);
      const months = Math.floor((diffYears - years) * 12);
      const remainingDays = diffDays - Math.floor(diffYears * 365.25);

      const trustLevel = diffYears >= 10 ? 'High Trust — Very Established' :
        diffYears >= 5 ? 'Good Trust — Well Established' :
        diffYears >= 2 ? 'Moderate Trust — Building Authority' :
        diffYears >= 1 ? 'Low Trust — Still New' : 'Very Low Trust — Sandbox Risk';

      return [
        { label: 'Domain Age', value: `${years} years, ${months} months, ${remainingDays} days`, highlight: true },
        { label: 'Total Days', value: diffDays },
        { label: 'Total Years', value: fmt(diffYears, 2) },
        { label: 'Registration Date', value: regDate.toLocaleDateString() },
        { label: 'Trust Level', value: trustLevel, highlight: true },
      ];
    },
  },

  // 4. Page Load Estimator
  {
    id: 'page-load-estimator',
    name: 'Page Load Estimator',
    description: 'Estimate page load time based on page size and connection speed. Optimize website speed and improve Core Web Vitals scores.',
    keywords: ['page load time', 'website speed', 'load time estimator', 'Core Web Vitals', 'page speed', 'website performance', 'load time optimization'],
    category: 'seo',
    icon: 'Globe',
    fields: [
      { id: 'pageSize', label: 'Total Page Size (KB)', type: 'number', default: 1500, min: 1, max: 100000 },
      {
        id: 'connectionSpeed',
        label: 'Connection Speed',
        type: 'select',
        default: '4g',
        options: [
          { label: '3G (1.6 Mbps)', value: '3g' },
          { label: '4G (9 Mbps)', value: '4g' },
          { label: 'Broadband (25 Mbps)', value: 'broadband' },
          { label: 'Fast Broadband (50 Mbps)', value: 'fast' },
          { label: 'Very Fast (100 Mbps)', value: 'veryfast' },
        ],
      },
      { id: 'httpRequests', label: 'Number of HTTP Requests', type: 'number', default: 50, min: 1, max: 500 },
    ],
    compute: (inputs) => {
      const pageSizeKB = Number(inputs.pageSize) || 1500;
      const connection = String(inputs.connectionSpeed ?? '4g');
      const httpRequests = Number(inputs.httpRequests) || 50;

      // Speeds in KB/s
      const speeds: Record<string, number> = {
        '3g': 200, // 1.6 Mbps
        '4g': 1125, // 9 Mbps
        'broadband': 3125, // 25 Mbps
        'fast': 6250, // 50 Mbps
        'veryfast': 12500, // 100 Mbps
      };

      const speedKBps = speeds[connection] || 1125;
      const downloadTime = pageSizeKB / speedKBps;
      // Latency estimate: ~100ms per request for first, ~50ms for concurrent
      const latencyEstimate = 0.1 + (httpRequests * 0.05); // rough estimate
      const totalTime = downloadTime + latencyEstimate;
      const pageSizeMB = pageSizeKB / 1024;

      // Google recommendation: under 3 seconds
      const rating = totalTime < 1 ? 'Excellent (<1s)' :
        totalTime < 3 ? 'Good (<3s)' :
        totalTime < 5 ? 'Needs Improvement (3-5s)' : 'Poor (>5s)';

      const recommendation = pageSizeMB > 3 ? 'Page size is large. Consider compressing images and minifying CSS/JS.' :
        httpRequests > 100 ? 'Too many HTTP requests. Consider bundling resources.' :
        totalTime < 3 ? 'Page loads within recommended time.' : 'Consider optimizing page resources.';

      return [
        { label: 'Estimated Load Time', value: `${fmt(totalTime, 2)} seconds`, highlight: true },
        { label: 'Download Time', value: `${fmt(downloadTime, 2)} seconds` },
        { label: 'Latency Estimate', value: `${fmt(latencyEstimate, 2)} seconds` },
        { label: 'Page Size', value: `${fmt(pageSizeMB, 2)} MB` },
        { label: 'Connection Speed', value: `${fmt(speedKBps / 125, 1)} Mbps` },
        { label: 'Performance Rating', value: rating, highlight: true },
        { label: 'Recommendation', value: recommendation },
      ];
    },
  },

  // 5. Bandwidth Calculator
  {
    id: 'bandwidth-calculator',
    name: 'Bandwidth Calculator',
    description: 'Calculate monthly bandwidth and data transfer requirements for your website. Plan hosting needs based on traffic and page size.',
    keywords: ['bandwidth calculator', 'data transfer', 'monthly bandwidth', 'hosting bandwidth', 'traffic estimation', 'data transfer limit', 'website bandwidth'],
    category: 'seo',
    icon: 'Globe',
    fields: [
      { id: 'pageSize', label: 'Average Page Size (KB)', type: 'number', default: 1500, min: 1 },
      { id: 'pageViews', label: 'Monthly Page Views', type: 'number', default: 50000, min: 1 },
      { id: 'growthFactor', label: 'Growth Buffer (%)', type: 'number', default: 30, min: 0, max: 200 },
    ],
    compute: (inputs) => {
      const pageSizeKB = Number(inputs.pageSize) || 1500;
      const pageViews = Number(inputs.pageViews) || 50000;
      const growthFactor = Number(inputs.growthFactor) || 30;

      const monthlyGB = (pageSizeKB * pageViews) / (1024 * 1024);
      const withGrowth = monthlyGB * (1 + growthFactor / 100);
      const dailyGB = withGrowth / 30;
      const bandwidthMbps = (withGrowth * 8 * 1024) / (30 * 24 * 3600);

      const hostingRecommendation = withGrowth < 10 ? 'Shared hosting should suffice' :
        withGrowth < 100 ? 'Consider VPS or cloud hosting' :
        withGrowth < 1000 ? 'Dedicated server or CDN recommended' : 'Enterprise infrastructure required';

      return [
        { label: 'Monthly Bandwidth', value: `${fmt(monthlyGB, 2)} GB`, highlight: true },
        { label: 'With Growth Buffer', value: `${fmt(withGrowth, 2)} GB`, highlight: true },
        { label: 'Daily Average', value: `${fmt(dailyGB, 2)} GB` },
        { label: 'Sustained Bandwidth', value: `${fmt(bandwidthMbps, 2)} Mbps` },
        { label: 'Hosting Recommendation', value: hostingRecommendation },
      ];
    },
  },

  // 6. Meta Description Length Checker
  {
    id: 'meta-description-length-checker',
    name: 'Meta Description Length Checker',
    description: 'Check meta description length for optimal SERP display. Ensure your SEO meta descriptions are within Google\'s recommended character limits.',
    keywords: ['meta description', 'SEO meta', 'SERP snippet', 'meta tag', 'search snippet', 'meta description length', 'SEO optimization'],
    category: 'seo',
    icon: 'Globe',
    fields: [
      { id: 'description', label: 'Meta Description', type: 'textarea', placeholder: 'Enter your meta description text...', rows: 4 },
    ],
    compute: (inputs) => {
      const desc = String(inputs.description ?? '');
      const length = desc.length;
      const isOptimal = length >= 120 && length <= 158;
      const isAcceptable = length >= 50 && length <= 160;
      const status = isOptimal ? 'Optimal ✓' :
        length < 50 ? 'Too Short ✗' :
        length > 160 ? 'Too Long — Will Be Truncated ✗' :
        length < 120 ? 'Acceptable — Could Be Longer' : 'Acceptable — Near Limit';

      const pixelWidth = length * 6; // Rough estimate: ~6px per character
      const truncationPoint = 158;

      const results: CalcResult[] = [
        { label: 'Character Count', value: length, highlight: true },
        { label: 'Status', value: status, highlight: isOptimal },
        { label: 'Optimal Range', value: '120-158 characters' },
        { label: 'Pixel Width (est.)', value: `${pixelWidth}px (max ~920px)` },
      ];

      if (length > truncationPoint) {
        const truncated = desc.slice(0, truncationPoint - 3) + '...';
        results.push({ label: 'Google Will Show', value: truncated });
      } else {
        results.push({ label: 'Full Description Shown', value: 'Yes ✓' });
      }

      if (length < 120) {
        results.push({ label: 'Suggestion', value: `Add ${120 - length} more characters for optimal length` });
      } else if (length > 158) {
        results.push({ label: 'Suggestion', value: `Remove ${length - 158} characters to avoid truncation` });
      }

      return results;
    },
  },

  // 7. Title Tag Length Checker
  {
    id: 'title-tag-length-checker',
    name: 'Title Tag Length Checker',
    description: 'Check title tag length for optimal SEO and SERP display. Ensure page titles are within Google\'s recommended pixel width and character limits.',
    keywords: ['title tag', 'SEO title', 'page title length', 'meta title', 'SERP title', 'title optimization', 'HTML title'],
    category: 'seo',
    icon: 'Globe',
    fields: [
      { id: 'title', label: 'Page Title', type: 'text', placeholder: 'Enter your page title...', default: '' },
    ],
    compute: (inputs) => {
      const title = String(inputs.title ?? '');
      const length = title.length;
      const isOptimal = length >= 30 && length <= 60;
      const pixelWidth = length * 7; // Rough: ~7px per character average
      const maxPixelWidth = 580; // Google desktop limit approx

      const status = isOptimal ? 'Optimal ✓' :
        length < 30 ? 'Too Short — Not Descriptive Enough ✗' :
        length > 60 ? 'Too Long — Will Be Truncated ✗' : 'Acceptable';

      const results: CalcResult[] = [
        { label: 'Character Count', value: length, highlight: true },
        { label: 'Status', value: status, highlight: isOptimal },
        { label: 'Optimal Range', value: '30-60 characters' },
        { label: 'Pixel Width (est.)', value: `${pixelWidth}px (max ~580px)` },
        { label: 'Word Count', value: title.split(/\s+/).filter(w => w).length },
      ];

      if (pixelWidth > maxPixelWidth) {
        const truncated = title.slice(0, 57) + '...';
        results.push({ label: 'Google Will Show', value: truncated });
      } else {
        results.push({ label: 'Full Title Shown', value: 'Yes ✓' });
      }

      if (length < 30) {
        results.push({ label: 'Suggestion', value: `Add ${30 - length} more characters for better SEO` });
      } else if (length > 60) {
        results.push({ label: 'Suggestion', value: `Remove ${length - 60} characters to avoid truncation` });
      }

      return results;
    },
  },
];
