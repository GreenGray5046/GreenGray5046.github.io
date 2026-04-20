import { Calculator, CalcResult } from '../calc-types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function caesarShift(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return Math.abs(hash).toString(36);
}

function xorEncrypt(text: string, key: string): string {
  if (!key) return text;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function textToHex(text: string): string {
  return text
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join(' ');
}

function hexToText(hex: string): string {
  return hex
    .trim()
    .split(/\s+/)
    .map((h) => String.fromCharCode(parseInt(h, 16)))
    .join('');
}

const ASCII_FONTS: Record<string, Record<string, string>> = {
  block: {
    A: ' ███ \n█   █\n█████\n█   █\n█   █',
    B: '████ \n█   █\n████ \n█   █\n████ ',
    C: ' ████\n█    \n█    \n█    \n ████',
    D: '████ \n█   █\n█   █\n█   █\n████ ',
    E: '█████\n█    \n████ \n█    \n█████',
    F: '█████\n█    \n████ \n█    \n█    ',
    G: ' ████\n█    \n█  ██\n█   █\n ████',
    H: '█   █\n█   █\n█████\n█   █\n█   █',
    I: '█████\n  █  \n  █  \n  █  \n█████',
    J: '█████\n   █ \n   █ \n█  █ \n ██  ',
    K: '█  █ \n█ █  \n██   \n█ █  \n█  █ ',
    L: '█    \n█    \n█    \n█    \n█████',
    M: '█   █\n██ ██\n█ █ █\n█   █\n█   █',
    N: '█   █\n██  █\n█ █ █\n█  ██\n█   █',
    O: ' ███ \n█   █\n█   █\n█   █\n ███ ',
    P: '████ \n█   █\n████ \n█    \n█    ',
    Q: ' ███ \n█   █\n█ █ █\n█  ██\n ████',
    R: '████ \n█   █\n████ \n█ █  \n█  █ ',
    S: ' ████\n█    \n ███ \n    █\n████ ',
    T: '█████\n  █  \n  █  \n  █  \n  █  ',
    U: '█   █\n█   █\n█   █\n█   █\n ███ ',
    V: '█   █\n█   █\n█   █\n █ █ \n  █  ',
    W: '█   █\n█   █\n█ █ █\n██ ██\n█   █',
    X: '█   █\n █ █ \n  █  \n █ █ \n█   █',
    Y: '█   █\n █ █ \n  █  \n  █  \n  █  ',
    Z: '█████\n   █ \n  █  \n █   \n█████',
    ' ': '     \n     \n     \n     \n     ',
    '!': '  █  \n  █  \n  █  \n     \n  █  ',
    '.': '     \n     \n     \n     \n  █  ',
    ',': '     \n     \n     \n  █  \n █   ',
    '?': ' ███ \n   █ \n  █  \n     \n  █  ',
    '0': ' ███ \n█  ██\n█ █ █\n██  █\n ███ ',
    '1': '  █  \n ██  \n  █  \n  █  \n█████',
    '2': ' ███ \n█   █\n  ██ \n █   \n█████',
    '3': '████ \n    █\n ███ \n    █\n████ ',
    '4': '█  █ \n█  █ \n█████\n   █ \n   █ ',
    '5': '█████\n█    \n████ \n    █\n████ ',
    '6': ' ███ \n█    \n████ \n█   █\n ███ ',
    '7': '█████\n    █\n   █ \n  █  \n  █  ',
    '8': ' ███ \n█   █\n ███ \n█   █\n ███ ',
    '9': ' ███ \n█   █\n ████\n    █\n ███ ',
  },
};

function textToAsciiArt(text: string): string {
  const font = ASCII_FONTS.block;
  const upper = text.toUpperCase();
  const chars = upper.split('');
  const lines: string[] = ['', '', '', '', ''];

  for (const ch of chars) {
    const glyph = font[ch] || font[' '] || '     \n     \n     \n     \n     ';
    const glyphLines = glyph.split('\n');
    for (let i = 0; i < 5; i++) {
      lines[i] += (lines[i] ? '  ' : '') + (glyphLines[i] || '     ');
    }
  }

  return lines.join('\n');
}

// ── Calculators ──────────────────────────────────────────────────────────────

export const textCalculators: Calculator[] = [
  // 1. Word Counter
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs in your text. Essential word count tool for writers, students, and SEO professionals.',
    keywords: ['word counter', 'word count', 'character count', 'sentence count', 'paragraph count', 'text statistics', 'word frequency'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Paste or type your text here...', rows: 8 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      if (!text.trim()) return [{ label: 'Result', value: 'Enter some text to count' }];
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      const readingTime = Math.max(1, Math.ceil(words.length / 200));
      const speakingTime = Math.max(1, Math.ceil(words.length / 130));
      return [
        { label: 'Words', value: words.length, highlight: true },
        { label: 'Characters', value: characters },
        { label: 'Characters (no spaces)', value: charactersNoSpaces },
        { label: 'Sentences', value: sentences.length },
        { label: 'Paragraphs', value: paragraphs.length || 1 },
        { label: 'Reading Time', value: `${readingTime} min` },
        { label: 'Speaking Time', value: `${speakingTime} min` },
      ];
    },
  },

  // 2. Character Counter
  {
    id: 'character-counter',
    name: 'Character Counter',
    description: 'Count characters with and without spaces. Perfect letter counter for Twitter, SMS, and character-limited fields.',
    keywords: ['character counter', 'letter count', 'character limit', 'text length', 'char count', 'SMS counter', 'Twitter counter'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Type or paste your text...', rows: 8 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const withSpaces = text.length;
      const withoutSpaces = text.replace(/\s/g, '').length;
      const letters = (text.match(/[a-zA-Z]/g) || []).length;
      const digits = (text.match(/[0-9]/g) || []).length;
      const spaces = (text.match(/\s/g) || []).length;
      const punctuation = (text.match(/[^\w\s]/g) || []).length;
      return [
        { label: 'Total Characters', value: withSpaces, highlight: true },
        { label: 'Without Spaces', value: withoutSpaces, highlight: true },
        { label: 'Letters', value: letters },
        { label: 'Digits', value: digits },
        { label: 'Spaces', value: spaces },
        { label: 'Punctuation', value: punctuation },
      ];
    },
  },

  // 3. Line Counter
  {
    id: 'line-counter',
    name: 'Line Counter',
    description: 'Count total lines, blank lines, and non-blank lines in your text. Useful for code and document analysis.',
    keywords: ['line counter', 'line count', 'text lines', 'blank lines', 'code lines', 'line number', 'document lines'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Paste your text or code...', rows: 8 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      if (!text) return [{ label: 'Lines', value: 0 }];
      const lines = text.split('\n');
      const totalLines = lines.length;
      const blankLines = lines.filter(l => l.trim() === '').length;
      const nonBlankLines = totalLines - blankLines;
      const longestLine = Math.max(...lines.map(l => l.length));
      return [
        { label: 'Total Lines', value: totalLines, highlight: true },
        { label: 'Non-blank Lines', value: nonBlankLines },
        { label: 'Blank Lines', value: blankLines },
        { label: 'Longest Line (chars)', value: longestLine },
      ];
    },
  },

  // 4. Case Converter
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between UPPER CASE, lower case, Title Case, Sentence case, and more. Essential text formatting tool.',
    keywords: ['case converter', 'uppercase', 'lowercase', 'title case', 'sentence case', 'capitalize', 'text transform'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Enter text to convert...', rows: 6 },
      {
        id: 'caseType',
        label: 'Conversion Type',
        type: 'select',
        options: [
          { label: 'UPPER CASE', value: 'upper' },
          { label: 'lower case', value: 'lower' },
          { label: 'Title Case', value: 'title' },
          { label: 'Sentence case', value: 'sentence' },
          { label: 'tOGGLE cASE', value: 'toggle' },
          { label: 'AlTeRnAtInG cAsE', value: 'alternating' },
        ],
        default: 'upper',
      },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const caseType = String(inputs.caseType ?? 'upper');
      let result = '';
      switch (caseType) {
        case 'upper':
          result = text.toUpperCase();
          break;
        case 'lower':
          result = text.toLowerCase();
          break;
        case 'title':
          result = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          break;
        case 'sentence':
          result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
          break;
        case 'toggle':
          result = text
            .split('')
            .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
            .join('');
          break;
        case 'alternating':
          result = text
            .split('')
            .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
            .join('');
          break;
        default:
          result = text;
      }
      return [
        { label: 'Converted Text', value: result, highlight: true },
      ];
    },
  },

  // 5. Reverse Text
  {
    id: 'reverse-text',
    name: 'Reverse Text',
    description: 'Reverse text characters or word order. Create mirror text, backwards writing, or reverse word sequences.',
    keywords: ['reverse text', 'backwards text', 'mirror text', 'reverse words', 'text reversal', 'flip text', 'backwards generator'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Enter text to reverse...', rows: 6 },
      {
        id: 'mode',
        label: 'Reverse Mode',
        type: 'select',
        options: [
          { label: 'Reverse Characters', value: 'chars' },
          { label: 'Reverse Words', value: 'words' },
          { label: 'Reverse Lines', value: 'lines' },
        ],
        default: 'chars',
      },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const mode = String(inputs.mode ?? 'chars');
      let result = '';
      switch (mode) {
        case 'chars':
          result = text.split('').reverse().join('');
          break;
        case 'words':
          result = text.split(/\s+/).reverse().join(' ');
          break;
        case 'lines':
          result = text.split('\n').reverse().join('\n');
          break;
        default:
          result = text;
      }
      return [{ label: 'Reversed Text', value: result, highlight: true }];
    },
  },

  // 6. Remove Duplicates
  {
    id: 'remove-duplicates',
    name: 'Remove Duplicate Lines',
    description: 'Remove duplicate lines from text. Deduplicate lists and keep only unique lines. Great for cleaning up data lists.',
    keywords: ['remove duplicates', 'deduplicate', 'unique lines', 'remove duplicate lines', 'dedupe', 'unique list', 'distinct lines'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text (one item per line)', type: 'textarea', placeholder: 'Enter lines with potential duplicates...', rows: 8 },
      { id: 'caseSensitive', label: 'Case-sensitive comparison', type: 'checkbox', default: false },
      { id: 'trimLines', label: 'Trim whitespace from lines', type: 'checkbox', default: true },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const caseSensitive = Boolean(inputs.caseSensitive);
      const trimLines = Boolean(inputs.trimLines);
      const lines = text.split('\n');
      const processed = trimLines ? lines.map((l) => l.trim()) : lines;
      const seen = new Set<string>();
      const unique: string[] = [];
      let dupes = 0;
      for (const line of processed) {
        const key = caseSensitive ? line : line.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(line);
        } else {
          dupes++;
        }
      }
      return [
        { label: 'Unique Lines', value: unique.join('\n'), highlight: true },
        { label: 'Original Line Count', value: lines.length },
        { label: 'Unique Line Count', value: unique.length },
        { label: 'Duplicates Removed', value: dupes },
      ];
    },
  },

  // 7. Sort Lines
  {
    id: 'sort-lines',
    name: 'Sort Lines',
    description: 'Sort lines alphabetically, numerically, or in reverse order. Alphabetize lists and organize text data easily.',
    keywords: ['sort lines', 'alphabetize', 'sort text', 'sort alphabetically', 'numerical sort', 'reverse sort', 'organize list'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text (one item per line)', type: 'textarea', placeholder: 'Enter lines to sort...', rows: 8 },
      {
        id: 'sortOrder',
        label: 'Sort Order',
        type: 'select',
        options: [
          { label: 'Alphabetical (A-Z)', value: 'alpha-asc' },
          { label: 'Alphabetical (Z-A)', value: 'alpha-desc' },
          { label: 'Numerical (low-high)', value: 'num-asc' },
          { label: 'Numerical (high-low)', value: 'num-desc' },
          { label: 'By Length (short-long)', value: 'len-asc' },
          { label: 'By Length (long-short)', value: 'len-desc' },
        ],
        default: 'alpha-asc',
      },
      { id: 'caseSensitive', label: 'Case-sensitive sort', type: 'checkbox', default: false },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const sortOrder = String(inputs.sortOrder ?? 'alpha-asc');
      const caseSensitive = Boolean(inputs.caseSensitive);
      let lines = text.split('\n');
      const comparator = (() => {
        switch (sortOrder) {
          case 'alpha-asc':
            return (a: string, b: string) => {
              const cmp = caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase());
              return cmp;
            };
          case 'alpha-desc':
            return (a: string, b: string) => {
              const cmp = caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase());
              return cmp;
            };
          case 'num-asc':
            return (a: string, b: string) => (parseFloat(a) || 0) - (parseFloat(b) || 0);
          case 'num-desc':
            return (a: string, b: string) => (parseFloat(b) || 0) - (parseFloat(a) || 0);
          case 'len-asc':
            return (a: string, b: string) => a.length - b.length;
          case 'len-desc':
            return (a: string, b: string) => b.length - a.length;
          default:
            return (a: string, b: string) => a.localeCompare(b);
        }
      })();
      lines.sort(comparator);
      return [{ label: 'Sorted Lines', value: lines.join('\n'), highlight: true }];
    },
  },

  // 8. Find and Replace
  {
    id: 'find-and-replace',
    name: 'Find and Replace',
    description: 'Find and replace text patterns in bulk. Supports case-sensitive and regex matching for powerful text replacement.',
    keywords: ['find and replace', 'text replace', 'bulk replace', 'search replace', 'text substitution', 'replace all', 'regex replace'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Enter your text...', rows: 6 },
      { id: 'find', label: 'Find', type: 'text', placeholder: 'Text to find' },
      { id: 'replace', label: 'Replace with', type: 'text', placeholder: 'Replacement text' },
      { id: 'caseSensitive', label: 'Case-sensitive', type: 'checkbox', default: false },
      { id: 'useRegex', label: 'Use Regular Expression', type: 'checkbox', default: false },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const find = String(inputs.find ?? '');
      const replace = String(inputs.replace ?? '');
      const caseSensitive = Boolean(inputs.caseSensitive);
      const useRegex = Boolean(inputs.useRegex);
      if (!find) return [{ label: 'Result', value: 'Enter text to find' }];
      try {
        let result: string;
        let count: number;
        if (useRegex) {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(find, flags);
          const matches = text.match(regex);
          count = matches ? matches.length : 0;
          result = text.replace(regex, replace);
        } else {
          const escFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(escFind, flags);
          const matches = text.match(regex);
          count = matches ? matches.length : 0;
          result = text.replace(regex, replace);
        }
        return [
          { label: 'Replacements Made', value: count },
          { label: 'Result', value: result, highlight: true },
        ];
      } catch (e) {
        return [{ label: 'Error', value: `Invalid regex: ${(e as Error).message}` }];
      }
    },
  },

  // 9. Text Diff
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts side by side and highlight the differences. Essential text comparison and difference checker tool.',
    keywords: ['text diff', 'text comparison', 'difference checker', 'compare text', 'text compare', 'diff tool', 'text difference'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text1', label: 'Original Text', type: 'textarea', placeholder: 'Enter original text...', rows: 6 },
      { id: 'text2', label: 'Modified Text', type: 'textarea', placeholder: 'Enter modified text...', rows: 6 },
    ],
    compute: (inputs) => {
      const text1 = String(inputs.text1 ?? '');
      const text2 = String(inputs.text2 ?? '');
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      const maxLen = Math.max(lines1.length, lines2.length);
      const added: string[] = [];
      const removed: string[] = [];
      const common: string[] = [];
      for (let i = 0; i < maxLen; i++) {
        const l1 = lines1[i] ?? '';
        const l2 = lines2[i] ?? '';
        if (l1 === l2) {
          common.push(l1);
        } else {
          if (l1) removed.push(`Line ${i + 1}: ${l1}`);
          if (l2) added.push(`Line ${i + 1}: ${l2}`);
        }
      }
      const charDiff = text2.length - text1.length;
      return [
        { label: 'Lines in Original', value: lines1.length },
        { label: 'Lines in Modified', value: lines2.length },
        { label: 'Common Lines', value: common.length },
        { label: 'Lines Removed', value: removed.length },
        { label: 'Lines Added', value: added.length },
        { label: 'Character Difference', value: `${charDiff >= 0 ? '+' : ''}${charDiff}` },
        { label: 'Removed', value: removed.length ? removed.join('\n') : '(none)' },
        { label: 'Added', value: added.length ? added.join('\n') : '(none)' },
      ];
    },
  },

  // 10. Lorem Ipsum Generator
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder lorem ipsum text for design and development. Create dummy text paragraphs, sentences, or words.',
    keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'filler text', 'mock text', 'lipsum', 'dummy content'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'count', label: 'Count', type: 'number', default: 3, min: 1, max: 50 },
      {
        id: 'unit',
        label: 'Unit',
        type: 'select',
        options: [
          { label: 'Paragraphs', value: 'paragraphs' },
          { label: 'Sentences', value: 'sentences' },
          { label: 'Words', value: 'words' },
        ],
        default: 'paragraphs',
      },
    ],
    compute: (inputs) => {
      const count = Number(inputs.count) || 3;
      const unit = String(inputs.unit ?? 'paragraphs');
      const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

      function randomSentence(): string {
        const len = 8 + Math.floor(Math.random() * 12);
        const words: string[] = [];
        for (let i = 0; i < len; i++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        return words.join(' ') + '.';
      }

      function randomParagraph(): string {
        const sentCount = 3 + Math.floor(Math.random() * 4);
        const sents: string[] = [];
        for (let i = 0; i < sentCount; i++) sents.push(randomSentence());
        return sents.join(' ');
      }

      let result = '';
      switch (unit) {
        case 'paragraphs': {
          const paras: string[] = [];
          for (let i = 0; i < count; i++) paras.push(randomParagraph());
          result = paras.join('\n\n');
          break;
        }
        case 'sentences': {
          const sents: string[] = [];
          for (let i = 0; i < count; i++) sents.push(randomSentence());
          result = sents.join(' ');
          break;
        }
        case 'words': {
          const words: string[] = [];
          for (let i = 0; i < count; i++) words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
          result = words.join(' ');
          break;
        }
      }
      return [{ label: 'Generated Text', value: result, highlight: true }];
    },
  },

  // 11. Random Password Generator
  {
    id: 'random-password-generator',
    name: 'Random Password Generator',
    description: 'Generate secure random passwords with customizable length and character sets. Create strong passwords for online security.',
    keywords: ['password generator', 'secure password', 'random password', 'strong password', 'password creator', 'password strength', 'online security'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'length', label: 'Password Length', type: 'number', default: 16, min: 4, max: 128 },
      { id: 'uppercase', label: 'Include Uppercase (A-Z)', type: 'checkbox', default: true },
      { id: 'lowercase', label: 'Include Lowercase (a-z)', type: 'checkbox', default: true },
      { id: 'numbers', label: 'Include Numbers (0-9)', type: 'checkbox', default: true },
      { id: 'symbols', label: 'Include Symbols (!@#$)', type: 'checkbox', default: true },
      { id: 'count', label: 'Number of Passwords', type: 'number', default: 1, min: 1, max: 20 },
    ],
    compute: (inputs) => {
      const length = Number(inputs.length) || 16;
      const useUpper = Boolean(inputs.uppercase);
      const useLower = Boolean(inputs.lowercase);
      const useNumbers = Boolean(inputs.numbers);
      const useSymbols = Boolean(inputs.symbols);
      const count = Number(inputs.count) || 1;

      let charset = '';
      if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (useNumbers) charset += '0123456789';
      if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

      const passwords: string[] = [];
      for (let p = 0; p < count; p++) {
        let pw = '';
        for (let i = 0; i < length; i++) {
          pw += charset[Math.floor(Math.random() * charset.length)];
        }
        passwords.push(pw);
      }

      const entropy = Math.round(length * Math.log2(charset.length));
      const strength = entropy >= 100 ? 'Very Strong' : entropy >= 60 ? 'Strong' : entropy >= 36 ? 'Moderate' : 'Weak';

      const results: CalcResult[] = passwords.map((pw, i) => ({
        label: count > 1 ? `Password ${i + 1}` : 'Generated Password',
        value: pw,
        highlight: i === 0,
      }));
      results.push({ label: 'Entropy (bits)', value: entropy });
      results.push({ label: 'Strength', value: strength, highlight: true });
      return results;
    },
  },

  // 12. UUID Generator
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate random UUID/GUID identifiers. Create universally unique identifiers for databases, APIs, and distributed systems.',
    keywords: ['UUID generator', 'GUID', 'unique identifier', 'UUID v4', 'random UUID', 'universal unique identifier', 'distributed ID'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'count', label: 'Number of UUIDs', type: 'number', default: 1, min: 1, max: 50 },
      { id: 'uppercase', label: 'Uppercase', type: 'checkbox', default: false },
      { id: 'noDashes', label: 'Remove dashes', type: 'checkbox', default: false },
    ],
    compute: (inputs) => {
      const count = Number(inputs.count) || 1;
      const uppercase = Boolean(inputs.uppercase);
      const noDashes = Boolean(inputs.noDashes);
      const uuids: string[] = [];
      for (let i = 0; i < count; i++) {
        let uuid = generateUUID();
        if (noDashes) uuid = uuid.replace(/-/g, '');
        if (uppercase) uuid = uuid.toUpperCase();
        uuids.push(uuid);
      }
      return uuids.map((uuid, i) => ({
        label: count > 1 ? `UUID ${i + 1}` : 'Generated UUID',
        value: uuid,
        highlight: i === 0,
      }));
    },
  },

  // 13. Slug Generator
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Generate URL-friendly slugs from any text. Create SEO-optimized permalinks and URL-safe strings for web development.',
    keywords: ['slug generator', 'URL slug', 'permalink', 'SEO slug', 'URL safe', 'web slug', 'clean URL'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'text', placeholder: 'Enter text to slugify...' },
      { id: 'separator', label: 'Separator', type: 'select', default: '-', options: [
        { label: 'Hyphen (-)', value: '-' },
        { label: 'Underscore (_)', value: '_' },
        { label: 'Dot (.)', value: '.' },
      ]},
      { id: 'lowercase', label: 'Lowercase', type: 'checkbox', default: true },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const separator = String(inputs.separator ?? '-');
      const lowercase = Boolean(inputs.lowercase);
      let slug = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove non-alphanumeric
        .trim()
        .replace(/[\s-]+/g, separator);
      if (lowercase) slug = slug.toLowerCase();
      return [{ label: 'Generated Slug', value: slug || '(empty)', highlight: true }];
    },
  },

  // 14. Regex Tester
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expression patterns against text in real-time. Highlight matches and capture groups for pattern matching and validation.',
    keywords: ['regex tester', 'regular expression', 'pattern matching', 'regex validator', 'regex cheat sheet', 'regex match', 'pattern test'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'pattern', label: 'Regex Pattern', type: 'text', placeholder: 'e.g. \\d+\\.\\d+' },
      { id: 'text', label: 'Test String', type: 'textarea', placeholder: 'Enter text to test against...', rows: 4 },
      {
        id: 'flags',
        label: 'Flags',
        type: 'select',
        default: 'g',
        options: [
          { label: 'Global (g)', value: 'g' },
          { label: 'Global + Case-insensitive (gi)', value: 'gi' },
          { label: 'Multiline (gm)', value: 'gm' },
          { label: 'All (gim)', value: 'gim' },
          { label: 'None', value: '' },
        ],
      },
    ],
    compute: (inputs) => {
      const pattern = String(inputs.pattern ?? '');
      const text = String(inputs.text ?? '');
      const flags = String(inputs.flags ?? 'g');
      if (!pattern) return [{ label: 'Result', value: 'Enter a regex pattern' }];
      try {
        const regex = new RegExp(pattern, flags);
        const matches: string[] = [];
        let match: RegExpExecArray | null;
        if (flags.includes('g')) {
          const re = new RegExp(pattern, flags);
          while ((match = re.exec(text)) !== null) {
            matches.push(match[0]);
            if (match[0].length === 0) { re.lastIndex++; }
          }
        } else {
          match = regex.exec(text);
          if (match) matches.push(match[0]);
        }
        const highlighted = text.replace(regex, '⟨$&⟩');
        return [
          { label: 'Matches Found', value: matches.length, highlight: true },
          { label: 'Matched Values', value: matches.length ? matches.join(', ') : '(no matches)' },
          { label: 'Highlighted Text', value: highlighted },
        ];
      } catch (e) {
        return [{ label: 'Error', value: `Invalid regex: ${(e as Error).message}` }];
      }
    },
  },

  // 15. JSON Formatter
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and pretty-print JSON data. Minify or beautify JSON with proper indentation for readability.',
    keywords: ['JSON formatter', 'JSON validator', 'pretty print JSON', 'beautify JSON', 'minify JSON', 'JSON lint', 'JSON editor'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'json', label: 'JSON Input', type: 'textarea', placeholder: 'Paste your JSON here...', rows: 8 },
      {
        id: 'action',
        label: 'Action',
        type: 'select',
        default: 'beautify',
        options: [
          { label: 'Beautify (2 spaces)', value: 'beautify2' },
          { label: 'Beautify (4 spaces)', value: 'beautify4' },
          { label: 'Minify', value: 'minify' },
        ],
      },
    ],
    compute: (inputs) => {
      const jsonStr = String(inputs.json ?? '').trim();
      const action = String(inputs.action ?? 'beautify2');
      if (!jsonStr) return [{ label: 'Result', value: 'Paste JSON to format' }];
      try {
        const parsed = JSON.parse(jsonStr);
        let result: string;
        switch (action) {
          case 'beautify2':
            result = JSON.stringify(parsed, null, 2);
            break;
          case 'beautify4':
            result = JSON.stringify(parsed, null, 4);
            break;
          case 'minify':
            result = JSON.stringify(parsed);
            break;
          default:
            result = JSON.stringify(parsed, null, 2);
        }
        const originalSize = new Blob([jsonStr]).size;
        const newSize = new Blob([result]).size;
        return [
          { label: 'Status', value: 'Valid JSON ✓', highlight: true },
          { label: 'Formatted JSON', value: result, highlight: true },
          { label: 'Original Size', value: `${originalSize} bytes` },
          { label: 'Output Size', value: `${newSize} bytes` },
        ];
      } catch (e) {
        return [
          { label: 'Status', value: 'Invalid JSON ✗' },
          { label: 'Error', value: (e as Error).message },
        ];
      }
    },
  },

  // 16. CSV to JSON Converter
  {
    id: 'csv-to-json-converter',
    name: 'CSV to JSON Converter',
    description: 'Convert CSV data to JSON format. Transform tabular data into structured JSON arrays for APIs and data processing.',
    keywords: ['CSV to JSON', 'data converter', 'tabular data', 'CSV parser', 'spreadsheet to JSON', 'comma separated values', 'data transformation'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'csv', label: 'CSV Input', type: 'textarea', placeholder: 'name,age,city\nAlice,30,NYC\nBob,25,LA', rows: 8 },
      { id: 'delimiter', label: 'Delimiter', type: 'select', default: ',', options: [
        { label: 'Comma (,)', value: ',' },
        { label: 'Semicolon (;)', value: ';' },
        { label: 'Tab', value: '\t' },
        { label: 'Pipe (|)', value: '|' },
      ]},
    ],
    compute: (inputs) => {
      const csv = String(inputs.csv ?? '').trim();
      const delimiter = String(inputs.delimiter ?? ',');
      if (!csv) return [{ label: 'Result', value: 'Paste CSV data to convert' }];
      try {
        const lines = csv.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) return [{ label: 'Error', value: 'CSV must have a header row and at least one data row' }];
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        const records: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
          const record: Record<string, string> = {};
          headers.forEach((h, idx) => {
            record[h] = values[idx] ?? '';
          });
          records.push(record);
        }
        const json = JSON.stringify(records, null, 2);
        return [
          { label: 'JSON Output', value: json, highlight: true },
          { label: 'Columns', value: headers.length },
          { label: 'Rows', value: records.length },
        ];
      } catch (e) {
        return [{ label: 'Error', value: (e as Error).message }];
      }
    },
  },

  // 17. Text to ASCII Art
  {
    id: 'text-to-ascii-art',
    name: 'Text to ASCII Art',
    description: 'Convert text into ASCII art banner characters. Create block-style text art for terminals, comments, and creative projects.',
    keywords: ['ASCII art', 'text art', 'banner text', 'ASCII banner', 'figlet', 'block text', 'terminal art'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text (max 10 chars)', type: 'text', placeholder: 'HELLO', default: 'HELLO' },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? 'HELLO').slice(0, 10);
      const art = textToAsciiArt(text);
      return [{ label: 'ASCII Art', value: art, highlight: true }];
    },
  },

  // 18. Anagram Generator
  {
    id: 'anagram-generator',
    name: 'Anagram Generator',
    description: 'Find all possible anagrams and letter rearrangements of a word. Discover word anagrams and permutations for puzzles and word games.',
    keywords: ['anagram generator', 'anagram finder', 'word anagram', 'letter rearrangement', 'word puzzle', 'scrabble helper', 'permutation'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'word', label: 'Word', type: 'text', placeholder: 'Enter a word...', default: 'listen' },
      { id: 'maxResults', label: 'Max Results', type: 'number', default: 20, min: 1, max: 100 },
    ],
    compute: (inputs) => {
      const word = String(inputs.word ?? '').toLowerCase().trim();
      const maxResults = Number(inputs.maxResults) || 20;
      if (!word) return [{ label: 'Result', value: 'Enter a word' }];
      if (word.length > 8) return [{ label: 'Result', value: 'Word too long (max 8 characters for performance)' }];

      // Generate permutations
      const results = new Set<string>();
      function permute(str: string, prefix: string) {
        if (results.size >= maxResults) return;
        if (str.length === 0) {
          if (prefix !== word) results.add(prefix);
          return;
        }
        for (let i = 0; i < str.length; i++) {
          permute(str.slice(0, i) + str.slice(i + 1), prefix + str[i]);
        }
      }
      permute(word, '');
      const sorted = Array.from(results).sort().slice(0, maxResults);
      return [
        { label: 'Anagrams Found', value: results.size, highlight: true },
        { label: 'Anagrams', value: sorted.join('\n') },
      ];
    },
  },

  // 19. Word Frequency Counter
  {
    id: 'word-frequency-counter',
    name: 'Word Frequency Counter',
    description: 'Analyze word frequency and distribution in text. Count how often each word appears for text analysis and SEO keyword research.',
    keywords: ['word frequency', 'word analysis', 'text analysis', 'keyword frequency', 'word distribution', 'text statistics', 'word count analysis'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Paste text to analyze word frequency...', rows: 8 },
      { id: 'caseSensitive', label: 'Case-sensitive', type: 'checkbox', default: false },
      { id: 'topN', label: 'Show Top N Words', type: 'number', default: 20, min: 1, max: 100 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const caseSensitive = Boolean(inputs.caseSensitive);
      const topN = Number(inputs.topN) || 20;
      if (!text.trim()) return [{ label: 'Result', value: 'Enter text to analyze' }];
      const words = text.match(/\b[a-zA-Z']+\b/g) || [];
      const freq: Record<string, number> = {};
      for (const w of words) {
        const key = caseSensitive ? w : w.toLowerCase();
        freq[key] = (freq[key] || 0) + 1;
      }
      const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);
      const totalWords = words.length;
      const uniqueWords = Object.keys(freq).length;
      const result = sorted.map(([word, count]) => `${word}: ${count} (${((count / totalWords) * 100).toFixed(1)}%)`).join('\n');
      return [
        { label: 'Total Words', value: totalWords },
        { label: 'Unique Words', value: uniqueWords, highlight: true },
        { label: 'Top Words', value: result, highlight: true },
      ];
    },
  },

  // 20. Text Encrypt / Decrypt
  {
    id: 'text-encrypt-decrypt',
    name: 'Text Encrypt & Decrypt',
    description: 'Encrypt and decrypt text using simple ciphers. Caesar cipher, XOR encryption, and hex encoding for basic message encryption.',
    keywords: ['text encryption', 'text decryption', 'message encryption', 'Caesar cipher', 'XOR cipher', 'encode decode', 'cipher text'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Enter text to encrypt/decrypt...', rows: 6 },
      { id: 'key', label: 'Key / Shift', type: 'text', placeholder: 'Encryption key or shift number' },
      {
        id: 'method',
        label: 'Method',
        type: 'select',
        default: 'caesar-encrypt',
        options: [
          { label: 'Caesar Cipher - Encrypt', value: 'caesar-encrypt' },
          { label: 'Caesar Cipher - Decrypt', value: 'caesar-decrypt' },
          { label: 'XOR Cipher - Encrypt', value: 'xor-encrypt' },
          { label: 'XOR Cipher - Decrypt', value: 'xor-decrypt' },
          { label: 'Hex Encode', value: 'hex-encode' },
          { label: 'Hex Decode', value: 'hex-decode' },
        ],
      },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const key = String(inputs.key ?? '3');
      const method = String(inputs.method ?? 'caesar-encrypt');
      if (!text) return [{ label: 'Result', value: 'Enter text to process' }];
      try {
        let result: string;
        switch (method) {
          case 'caesar-encrypt': {
            const shift = parseInt(key) || 3;
            result = caesarShift(text, shift);
            break;
          }
          case 'caesar-decrypt': {
            const shift = parseInt(key) || 3;
            result = caesarShift(text, -shift);
            break;
          }
          case 'xor-encrypt': {
            if (!key) return [{ label: 'Error', value: 'XOR cipher requires a key' }];
            const encrypted = xorEncrypt(text, key);
            result = textToHex(encrypted);
            break;
          }
          case 'xor-decrypt': {
            if (!key) return [{ label: 'Error', value: 'XOR cipher requires a key' }];
            const decoded = hexToText(text);
            result = xorEncrypt(decoded, key);
            break;
          }
          case 'hex-encode':
            result = textToHex(text);
            break;
          case 'hex-decode':
            result = hexToText(text);
            break;
          default:
            result = text;
        }
        return [{ label: 'Result', value: result, highlight: true }];
      } catch (e) {
        return [{ label: 'Error', value: (e as Error).message }];
      }
    },
  },

  // 21. String Length Calculator
  {
    id: 'string-length-calculator',
    name: 'String Length Calculator',
    description: 'Calculate string length in characters, bytes, and UTF-8 encoding. Essential for database field sizing and API payload validation.',
    keywords: ['string length', 'byte length', 'UTF-8 length', 'character count', 'byte size', 'string size', 'encoding length'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'String', type: 'textarea', placeholder: 'Enter string to measure...', rows: 6 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const charLength = text.length;
      // UTF-8 byte length
      const utf8Length = new TextEncoder().encode(text).length;
      // UTF-16 code units
      const utf16Length = text.length * 2;
      // Code points (handles surrogate pairs)
      const codePoints = Array.from(text).length;
      return [
        { label: 'Characters (UTF-16 units)', value: charLength, highlight: true },
        { label: 'Code Points (visible chars)', value: codePoints },
        { label: 'UTF-8 Bytes', value: utf8Length, highlight: true },
        { label: 'UTF-16 Bytes', value: utf16Length },
        { label: 'ASCII Compatible', value: charLength === utf8Length ? 'Yes' : 'No (contains multi-byte chars)' },
      ];
    },
  },

  // 22. Text Truncator
  {
    id: 'text-truncator',
    name: 'Text Truncator',
    description: 'Truncate text to a specified length with customizable ellipsis. Smart text shortening that preserves word boundaries.',
    keywords: ['text truncator', 'truncate string', 'ellipsis', 'shorten text', 'text limiter', 'string trim', 'text clip'],
    category: 'text',
    icon: 'Type',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', placeholder: 'Enter text to truncate...', rows: 6 },
      { id: 'maxLength', label: 'Max Length', type: 'number', default: 50, min: 1, max: 10000 },
      { id: 'suffix', label: 'Suffix (Ellipsis)', type: 'text', default: '...' },
      { id: 'preserveWords', label: 'Preserve Word Boundaries', type: 'checkbox', default: true },
    ],
    compute: (inputs) => {
      const text = String(inputs.text ?? '');
      const maxLength = Number(inputs.maxLength) || 50;
      const suffix = String(inputs.suffix ?? '...');
      const preserveWords = Boolean(inputs.preserveWords);
      if (text.length <= maxLength) {
        return [
          { label: 'Truncated Text', value: text, highlight: true },
          { label: 'Status', value: 'Text is within the limit (no truncation needed)' },
        ];
      }
      let truncated = text.slice(0, maxLength - suffix.length);
      if (preserveWords) {
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) truncated = truncated.slice(0, lastSpace);
      }
      truncated = truncated.trimEnd() + suffix;
      return [
        { label: 'Truncated Text', value: truncated, highlight: true },
        { label: 'Original Length', value: text.length },
        { label: 'Truncated Length', value: truncated.length },
        { label: 'Characters Saved', value: text.length - truncated.length },
      ];
    },
  },
];
