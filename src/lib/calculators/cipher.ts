import { Calculator, fmt, fmtSci } from '../calc-types';

// ─── Helper functions ────────────────────────────────────────────────────────

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function modInverse(a: number, m: number): number {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return -1;
}

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};

const MORSE_REVERSE: Record<string, string> = {};
for (const [k, v] of Object.entries(MORSE_MAP)) {
  MORSE_REVERSE[v] = k;
}

const NATO_MAP: Record<string, string> = {
  'A': 'Alfa', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo',
  'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliett',
  'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar',
  'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee',
  'Z': 'Zulu', '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
  '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Niner',
};

// ADFGVX polybius labels
const ADFGVX_LABELS = ['A', 'D', 'F', 'G', 'V', 'X'];

// ─── Simple hash functions for demonstration ─────────────────────────────────

function simpleHash(text: string, seed: number): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(16).padStart(16, '0');
}

function simpleHash256(text: string): string {
  // Produce a 64-char hex string from multiple hash rounds (demo only, not real SHA-256)
  const parts: string[] = [];
  for (let seed = 0; seed < 4; seed++) {
    let h = 0x811c9dc5 ^ (seed * 0x01000193);
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
    parts.push((h >>> 0).toString(16).padStart(8, '0'));
  }
  return parts.join('');
}

// ─── Playfair helpers ────────────────────────────────────────────────────────

function buildPlayfairSquare(key: string): string[] {
  const seen = new Set<string>();
  const square: string[] = [];
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // J merged into I
  const cleanKey = key.toUpperCase().replace(/J/g, 'I');
  for (const ch of cleanKey + alphabet) {
    if (!seen.has(ch) && alphabet.includes(ch)) {
      seen.add(ch);
      square.push(ch);
    }
  }
  return square;
}

function playfairProcess(text: string, square: string[], encrypt: boolean): string {
  const cleanText = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  if (!cleanText) return '';
  // Build digraphs, inserting X between repeated letters
  const digraphs: string[] = [];
  let i = 0;
  while (i < cleanText.length) {
    let a = cleanText[i];
    let b = i + 1 < cleanText.length ? cleanText[i + 1] : 'X';
    if (a === b) { b = 'X'; i++; } else { i += 2; }
    digraphs.push(a + b);
  }
  const dir = encrypt ? 1 : -1;
  let result = '';
  for (const dg of digraphs) {
    const a = dg[0], b = dg[1];
    const rowA = Math.floor(square.indexOf(a) / 5), colA = square.indexOf(a) % 5;
    const rowB = Math.floor(square.indexOf(b) / 5), colB = square.indexOf(b) % 5;
    if (rowA === rowB) {
      result += square[rowA * 5 + mod(colA + dir, 5)];
      result += square[rowB * 5 + mod(colB + dir, 5)];
    } else if (colA === colB) {
      result += square[mod(rowA + dir, 5) * 5 + colA];
      result += square[mod(rowB + dir, 5) * 5 + colB];
    } else {
      result += square[rowA * 5 + colB];
      result += square[rowB * 5 + colA];
    }
  }
  return result;
}

// ─── ADFGVX helpers ──────────────────────────────────────────────────────────

function buildAdfgvxSquare(key: string): string[][] {
  const seen = new Set<string>();
  const square: string[][] = [[], [], [], [], [], []];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const cleanKey = key.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const pool = cleanKey + chars;
  let idx = 0;
  for (const ch of pool) {
    if (!seen.has(ch) && chars.includes(ch)) {
      seen.add(ch);
      square[Math.floor(idx / 6)].push(ch);
      idx++;
      if (idx >= 36) break;
    }
  }
  // Fill remaining if key was short
  for (const ch of chars) {
    if (idx >= 36) break;
    if (!seen.has(ch)) {
      seen.add(ch);
      square[Math.floor(idx / 6)].push(ch);
      idx++;
    }
  }
  return square;
}

function adfgvxEncode(text: string, square: string[][]): string {
  const result: string[] = [];
  for (const ch of text.toUpperCase().replace(/[^A-Z0-9]/g, '')) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (square[r] && square[r][c] === ch) {
          result.push(ADFGVX_LABELS[r] + ADFGVX_LABELS[c]);
        }
      }
    }
  }
  return result.join('');
}

function adfgvxColumnarTransposition(text: string, key: string): string {
  if (!key) return text;
  const keyUpper = key.toUpperCase();
  const keyLen = keyUpper.length;
  // Determine column order
  const indexed = keyUpper.split('').map((ch, i) => ({ ch, i }));
  indexed.sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i);
  const order = indexed.map(x => x.i);
  // Fill rows
  const rows: string[] = [];
  for (let i = 0; i < text.length; i += keyLen) {
    rows.push(text.slice(i, i + keyLen));
  }
  // Read columns in sorted order
  let result = '';
  for (const col of order) {
    for (const row of rows) {
      if (col < row.length) result += row[col];
    }
  }
  return result;
}

function adfgvxColumnarReverse(text: string, key: string): string {
  if (!key) return text;
  const keyUpper = key.toUpperCase();
  const keyLen = keyUpper.length;
  const indexed = keyUpper.split('').map((ch, i) => ({ ch, i }));
  indexed.sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i);
  const order = indexed.map(x => x.i);
  const numRows = Math.ceil(text.length / keyLen);
  // Determine column lengths
  const colLens: number[] = new Array(keyLen).fill(0);
  let pos = 0;
  for (const col of order) {
    const fullRows = Math.floor(text.length / keyLen);
    const extra = text.length % keyLen;
    const isLongCol = Array.from({ length: keyLen }, (_, i) => i)
      .sort((a, b) => {
        const ca = keyUpper[a], cb = keyUpper[b];
        return ca.localeCompare(cb) || a - b;
      })
      .indexOf(col) < extra;
    colLens[col] = fullRows + (isLongCol ? 1 : 0);
  }
  // Reconstruct columns
  const cols: string[] = new Array(keyLen).fill('');
  pos = 0;
  for (const col of order) {
    cols[col] = text.slice(pos, pos + colLens[col]);
    pos += colLens[col];
  }
  // Read row by row
  let result = '';
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < keyLen; c++) {
      if (r < cols[c].length) result += cols[c][r];
    }
  }
  return result;
}

function adfgvxDecode(ciphertext: string, square: string[][]): string {
  let result = '';
  for (let i = 0; i < ciphertext.length; i += 2) {
    const r = ADFGVX_LABELS.indexOf(ciphertext[i]);
    const c = ADFGVX_LABELS.indexOf(ciphertext[i + 1]);
    if (r >= 0 && c >= 0 && square[r] && square[r][c]) {
      result += square[r][c];
    }
  }
  return result;
}

// ─── Calculator Definitions ──────────────────────────────────────────────────

export const cipherCalculators: Calculator[] = [

  // ━━━ 1. Caesar Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'caesar-cipher-decoder',
    name: 'Caesar Cipher Encoder & Decoder',
    description: 'Encode or decode messages using the Caesar cipher, a classic substitution cipher that shifts each letter by a fixed number of positions in the alphabet. Supports custom shift values from 1-25 for ROT-N encryption and decryption.',
    keywords: ['Caesar cipher', 'Caesar shift', 'rotation cipher', 'Julius Caesar cipher', 'shift cipher decoder', 'ROT-N', 'letter shift encryption', 'Caesar decode'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to encode or decode...', rows: 4 },
      { id: 'shift', label: 'Shift Amount', type: 'number', default: 3, min: 1, max: 25 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const shift = Number(inputs.shift) || 3;
      const encrypt = inputs.mode !== 'decrypt';
      const effectiveShift = encrypt ? shift : -shift;
      let result = '';
      for (const ch of text) {
        if (/[A-Z]/.test(ch)) {
          result += String.fromCharCode(mod(ch.charCodeAt(0) - 65 + effectiveShift, 26) + 65);
        } else if (/[a-z]/.test(ch)) {
          result += String.fromCharCode(mod(ch.charCodeAt(0) - 97 + effectiveShift, 26) + 97);
        } else {
          result += ch;
        }
      }
      return [
        { label: 'Mode', value: encrypt ? 'Encrypt' : 'Decrypt' },
        { label: 'Shift', value: shift },
        { label: 'Result', value: result, highlight: true },
      ];
    },
  },

  // ━━━ 2. Vigenère Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'vigenere-cipher-decoder',
    name: 'Vigenère Cipher Encoder & Decoder',
    description: 'Encrypt and decrypt messages using the Vigenère cipher, a polyalphabetic substitution cipher that uses a keyword to determine shift values. More secure than simple Caesar cipher, resistant to frequency analysis.',
    keywords: ['Vigenère cipher', 'polyalphabetic cipher', 'Vigenere decode', 'keyword cipher', 'Vigenere encrypt', 'tabula recta', 'polyalphabetic substitution', 'Vigenere key'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'keyword', label: 'Keyword', type: 'text', default: 'SECRET', placeholder: 'Enter keyword (letters only)' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const keyword = String(inputs.keyword).toUpperCase().replace(/[^A-Z]/g, '') || 'A';
      const encrypt = inputs.mode !== 'decrypt';
      let result = '';
      let ki = 0;
      for (const ch of text) {
        if (/[A-Za-z]/.test(ch)) {
          const isUpper = /[A-Z]/.test(ch);
          const base = isUpper ? 65 : 97;
          const shift = keyword.charCodeAt(ki % keyword.length) - 65;
          ki++;
          const offset = ch.charCodeAt(0) - base;
          const shifted = encrypt ? mod(offset + shift, 26) : mod(offset - shift, 26);
          result += String.fromCharCode(shifted + base);
        } else {
          result += ch;
        }
      }
      return [
        { label: 'Keyword', value: keyword },
        { label: 'Mode', value: encrypt ? 'Encrypt' : 'Decrypt' },
        { label: 'Result', value: result, highlight: true },
      ];
    },
  },

  // ━━━ 3. ROT13 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'rot13-decoder',
    name: 'ROT13 Cipher Encoder & Decoder',
    description: 'Apply ROT13 transformation to text — a simple letter rotation cipher that shifts letters by 13 positions. Since 13 is half of 26, encoding and decoding are the same operation. Commonly used for obscuring spoilers online.',
    keywords: ['ROT13', 'rotate 13', 'letter rotation', 'Caesar 13', 'ROT-13', 'spoiler cipher', 'simple rotation cipher', '13 shift'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to encode/decode with ROT13...', rows: 4 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      let result = '';
      for (const ch of text) {
        if (/[A-Z]/.test(ch)) {
          result += String.fromCharCode(mod(ch.charCodeAt(0) - 65 + 13, 26) + 65);
        } else if (/[a-z]/.test(ch)) {
          result += String.fromCharCode(mod(ch.charCodeAt(0) - 97 + 13, 26) + 97);
        } else {
          result += ch;
        }
      }
      return [
        { label: 'ROT13 Result', value: result, highlight: true },
        { label: 'Note', value: 'ROT13 is its own inverse — apply again to decode' },
      ];
    },
  },

  // ━━━ 4. Atbash Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'atbash-cipher-decoder',
    name: 'Atbash Cipher Encoder & Decoder',
    description: 'Encode or decode text with the Atbash cipher, an ancient Hebrew substitution cipher that mirrors the alphabet (A↔Z, B↔Y, etc.). Like ROT13, encoding and decoding are the same operation.',
    keywords: ['Atbash cipher', 'Hebrew cipher', 'mirror alphabet', 'reverse alphabet cipher', 'Atbash decoder', 'biblical cipher', 'Atbash encode', 'alphabet mirror'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text for Atbash cipher...', rows: 4 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      let result = '';
      for (const ch of text) {
        if (/[A-Z]/.test(ch)) {
          result += String.fromCharCode(90 - (ch.charCodeAt(0) - 65));
        } else if (/[a-z]/.test(ch)) {
          result += String.fromCharCode(122 - (ch.charCodeAt(0) - 97));
        } else {
          result += ch;
        }
      }
      return [
        { label: 'Atbash Result', value: result, highlight: true },
        { label: 'Note', value: 'Atbash is its own inverse — apply again to decode' },
      ];
    },
  },

  // ━━━ 5. Affine Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'affine-cipher-decoder',
    name: 'Affine Cipher Encoder & Decoder',
    description: 'Encrypt or decrypt using the Affine cipher E(x) = (ax + b) mod 26. A monoalphabetic substitution cipher combining multiplication and addition. Valid values of a must be coprime with 26 (1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25).',
    keywords: ['Affine cipher', 'monoalphabetic substitution', 'affine encryption', 'affine decode', 'modular arithmetic cipher', 'coprime cipher', 'affine function cipher'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'a', label: 'Key a (multiplier)', type: 'number', default: 5, min: 1, max: 25 },
      { id: 'b', label: 'Key b (offset)', type: 'number', default: 8, min: 0, max: 25 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      let a = Number(inputs.a) || 5;
      const b = Number(inputs.b) || 0;
      const encrypt = inputs.mode !== 'decrypt';
      const validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
      if (!validA.includes(a)) {
        return [
          { label: 'Error', value: `Key 'a' = ${a} is not coprime with 26. Valid values: ${validA.join(', ')}` },
        ];
      }
      const aInv = modInverse(a, 26);
      let result = '';
      for (const ch of text) {
        if (/[A-Z]/.test(ch)) {
          const x = ch.charCodeAt(0) - 65;
          const y = encrypt ? mod(a * x + b, 26) : mod(aInv * (x - b), 26);
          result += String.fromCharCode(y + 65);
        } else if (/[a-z]/.test(ch)) {
          const x = ch.charCodeAt(0) - 97;
          const y = encrypt ? mod(a * x + b, 26) : mod(aInv * (x - b), 26);
          result += String.fromCharCode(y + 97);
        } else {
          result += ch;
        }
      }
      return [
        { label: 'Formula', value: encrypt ? `E(x) = (${a}x + ${b}) mod 26` : `D(y) = ${aInv}(y - ${b}) mod 26` },
        { label: 'Mode', value: encrypt ? 'Encrypt' : 'Decrypt' },
        { label: 'Result', value: result, highlight: true },
      ];
    },
  },

  // ━━━ 6. Base64 Encoder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder & Decoder',
    description: 'Convert text to and from Base64 encoding. Base64 represents binary data as ASCII text using a 64-character alphabet, commonly used for email encoding, data URLs, and embedding binary data in JSON or XML.',
    keywords: ['Base64 encode', 'Base64 decode', 'binary to text', 'Base64 converter', 'MIME encoding', 'data URL encoding', 'radix64', 'btoa atob'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or Base64 string...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encode', options: [
        { label: 'Encode', value: 'encode' },
        { label: 'Decode', value: 'decode' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isEncode = inputs.mode !== 'decode';
      try {
        let result: string;
        if (isEncode) {
          result = btoa(unescape(encodeURIComponent(text)));
        } else {
          result = decodeURIComponent(escape(atob(text)));
        }
        return [
          { label: 'Mode', value: isEncode ? 'Encode (Text → Base64)' : 'Decode (Base64 → Text)' },
          { label: 'Result', value: result, highlight: true },
        ];
      } catch (e) {
        return [
          { label: 'Error', value: isEncode ? 'Failed to encode text' : 'Invalid Base64 input — cannot decode' },
        ];
      }
    },
  },

  // ━━━ 7. Morse Code Translator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'morse-code-translator',
    name: 'Morse Code Translator',
    description: 'Translate text to Morse code and Morse code back to text. Supports letters A-Z, digits 0-9, and common punctuation. Uses standard International Morse Code with dots (.) and dashes (-).',
    keywords: ['Morse code', 'dots and dashes', 'telegraph code', 'SOS', 'Morse translator', 'International Morse', 'Samuel Morse', 'dit dah'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or Morse code (use spaces between letters, / between words)...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'text-to-morse', options: [
        { label: 'Text → Morse', value: 'text-to-morse' },
        { label: 'Morse → Text', value: 'morse-to-text' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isTextToMorse = inputs.mode !== 'morse-to-text';
      if (isTextToMorse) {
        const result = text.toUpperCase().split('').map(ch => {
          if (ch === ' ') return '/';
          return MORSE_MAP[ch] || '';
        }).filter(Boolean).join(' ');
        return [
          { label: 'Morse Code', value: result, highlight: true },
          { label: 'Note', value: 'Space separates letters; / separates words' },
        ];
      } else {
        const words = text.trim().split(/\s*\/\s*/);
        const result = words.map(word => {
          return word.trim().split(/\s+/).map(code => MORSE_REVERSE[code] || '?').join('');
        }).join(' ');
        return [
          { label: 'Decoded Text', value: result, highlight: true },
        ];
      }
    },
  },

  // ━━━ 8. Binary Translator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'binary-translator',
    name: 'Binary Translator',
    description: 'Convert text to binary representation (8-bit ASCII) and binary back to text. Each character is represented as an 8-bit binary number with spaces between bytes.',
    keywords: ['binary translator', 'text to binary', 'binary to text', 'ASCII binary', '01101000', 'binary code', 'binary converter', 'bit representation'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or binary (space-separated 8-bit groups)...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'text-to-binary', options: [
        { label: 'Text → Binary', value: 'text-to-binary' },
        { label: 'Binary → Text', value: 'binary-to-text' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isTextToBinary = inputs.mode !== 'binary-to-text';
      if (isTextToBinary) {
        const result = Array.from(text).map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        return [
          { label: 'Binary', value: result, highlight: true },
          { label: 'Bit Length', value: text.length * 8 },
        ];
      } else {
        try {
          const bytes = text.trim().split(/\s+/);
          const result = bytes.map(b => String.fromCharCode(parseInt(b, 2))).join('');
          return [
            { label: 'Text', value: result, highlight: true },
          ];
        } catch {
          return [{ label: 'Error', value: 'Invalid binary input' }];
        }
      }
    },
  },

  // ━━━ 9. Hex Translator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'hex-translator',
    name: 'Hexadecimal Translator',
    description: 'Convert text to hexadecimal and hexadecimal back to text. Each character is represented as a two-digit hex number (base-16). Commonly used in programming, color codes, and data representation.',
    keywords: ['hexadecimal translator', 'text to hex', 'hex to text', 'hex encoder', 'base 16', 'hex dump', 'hex string', 'hex converter'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or hex string (space-separated)...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'text-to-hex', options: [
        { label: 'Text → Hex', value: 'text-to-hex' },
        { label: 'Hex → Text', value: 'hex-to-text' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isTextToHex = inputs.mode !== 'hex-to-text';
      if (isTextToHex) {
        const result = Array.from(text).map(ch => ch.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()).join(' ');
        return [
          { label: 'Hexadecimal', value: result, highlight: true },
        ];
      } else {
        try {
          const bytes = text.trim().split(/\s+/);
          const result = bytes.map(h => String.fromCharCode(parseInt(h, 16))).join('');
          return [
            { label: 'Text', value: result, highlight: true },
          ];
        } catch {
          return [{ label: 'Error', value: 'Invalid hexadecimal input' }];
        }
      }
    },
  },

  // ━━━ 10. ASCII Converter ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'ascii-converter',
    name: 'ASCII Code Converter',
    description: 'Convert characters to their ASCII code values and vice versa. Look up the decimal, hexadecimal, and binary representation of any character in the ASCII table. Supports extended ASCII range.',
    keywords: ['ASCII converter', 'character code', 'ASCII table', 'ASCII value', 'char to int', 'ASCII lookup', 'Unicode code point', 'character encoding'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'input', label: 'Input', type: 'text', default: '', placeholder: 'Enter text or ASCII codes (comma-separated)...' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'text-to-ascii', options: [
        { label: 'Text → ASCII Codes', value: 'text-to-ascii' },
        { label: 'ASCII Codes → Text', value: 'ascii-to-text' },
      ]},
    ],
    compute: (inputs) => {
      const input = String(inputs.input);
      const isTextToAscii = inputs.mode !== 'ascii-to-text';
      if (isTextToAscii) {
        const codes = Array.from(input).map(ch => ch.charCodeAt(0));
        const results: { label: string; value: string | number; highlight?: boolean }[] = [
          { label: 'Decimal', value: codes.join(', '), highlight: true },
          { label: 'Hexadecimal', value: codes.map(c => '0x' + c.toString(16).toUpperCase().padStart(2, '0')).join(', ') },
          { label: 'Binary', value: codes.map(c => c.toString(2).padStart(8, '0')).join(', ') },
          { label: 'Character Count', value: input.length },
        ];
        return results;
      } else {
        try {
          const codes = input.split(/[,;\s]+/).map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 127);
          const result = codes.map(c => String.fromCharCode(c)).join('');
          return [
            { label: 'Text', value: result, highlight: true },
            { label: 'Characters Decoded', value: codes.length },
          ];
        } catch {
          return [{ label: 'Error', value: 'Invalid ASCII code input' }];
        }
      }
    },
  },

  // ━━━ 11. URL Encoder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'url-encoder',
    name: 'URL Encoder & Decoder',
    description: 'Encode or decode URLs using percent-encoding (RFC 3986). Converts reserved and special characters to %XX format for safe inclusion in URLs, query strings, and form data.',
    keywords: ['URL encoding', 'percent encoding', 'URI encode', 'URL decode', 'query string encoding', 'RFC 3986', 'encodeURIComponent', 'form encoding'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter URL or encoded string...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encode', options: [
        { label: 'Encode', value: 'encode' },
        { label: 'Decode', value: 'decode' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isEncode = inputs.mode !== 'decode';
      try {
        const result = isEncode ? encodeURIComponent(text) : decodeURIComponent(text);
        return [
          { label: 'Mode', value: isEncode ? 'Encode' : 'Decode' },
          { label: 'Result', value: result, highlight: true },
        ];
      } catch {
        return [{ label: 'Error', value: isEncode ? 'Encoding failed' : 'Invalid percent-encoded string' }];
      }
    },
  },

  // ━━━ 12. HTML Entity Encoder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'html-entity-encoder',
    name: 'HTML Entity Encoder & Decoder',
    description: 'Encode special characters to HTML entities and decode HTML entities back to text. Converts <, >, &, quotes and other characters to their HTML entity equivalents for safe embedding in web pages.',
    keywords: ['HTML entities', 'HTML special characters', 'escape HTML', 'HTML encode', 'unescape HTML', 'ampersand encoding', 'XSS prevention', 'HTML sanitization'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or HTML entities...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encode', options: [
        { label: 'Encode', value: 'encode' },
        { label: 'Decode', value: 'decode' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isEncode = inputs.mode !== 'decode';
      if (isEncode) {
        const result = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        return [
          { label: 'HTML Encoded', value: result, highlight: true },
        ];
      } else {
        const result = text
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
          .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
        return [
          { label: 'Decoded Text', value: result, highlight: true },
        ];
      }
    },
  },

  // ━━━ 13. MD5 Hash Generator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'md5-hash-generator',
    name: 'Hash Generator (MD5-style)',
    description: 'Generate a 128-bit hash digest from any text input. This implements a fast non-cryptographic hash function producing MD5-length output. For security-critical applications, use server-side cryptographic hashing.',
    keywords: ['MD5 hash', 'message digest', 'checksum', 'hash function', 'MD5 generator', 'hash digest', 'string hash', 'data integrity'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to hash...', rows: 4 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const hash128 = simpleHash(text, 0) + simpleHash(text, 1);
      return [
        { label: 'Hash (128-bit hex)', value: hash128, highlight: true },
        { label: 'Hash Length', value: `${hash128.length} hex chars (${hash128.length * 4} bits)` },
        { label: 'Note', value: 'Demo hash — not a cryptographic MD5 implementation' },
      ];
    },
  },

  // ━━━ 14. SHA-256 Hash Generator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'sha256-hash-generator',
    name: 'Hash Generator (SHA-256-style)',
    description: 'Generate a 256-bit hash digest from any text. Produces a 64-character hexadecimal output similar to SHA-256. Uses a non-cryptographic demonstration hash — use proper crypto libraries for security.',
    keywords: ['SHA-256', 'secure hash', 'cryptographic hash', 'SHA2', 'hash generator', '256-bit hash', 'digital fingerprint', 'tamper detection'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to hash...', rows: 4 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const hash256 = simpleHash256(text);
      return [
        { label: 'Hash (256-bit hex)', value: hash256, highlight: true },
        { label: 'Hash Length', value: `${hash256.length} hex chars (${hash256.length * 4} bits)` },
        { label: 'Note', value: 'Demo hash — not a cryptographic SHA-256 implementation' },
      ];
    },
  },

  // ━━━ 15. XOR Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'xor-cipher',
    name: 'XOR Cipher Encoder & Decoder',
    description: 'Encrypt or decrypt text using the XOR (exclusive OR) cipher with a repeating key. XOR is symmetric — the same operation encrypts and decrypts. Each byte is XORed with the corresponding key byte.',
    keywords: ['XOR cipher', 'exclusive or cipher', 'XOR encryption', 'XOR decrypt', 'bitwise XOR', 'repeating key XOR', 'simple XOR', 'XOR decode'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'key', label: 'Key', type: 'text', default: 'KEY', placeholder: 'Enter encryption key' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt (text → hex)', value: 'encrypt' },
        { label: 'Decrypt (hex → text)', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const key = String(inputs.key);
      if (!key) return [{ label: 'Error', value: 'A key is required for XOR cipher' }];
      const isEncrypt = inputs.mode !== 'decrypt';
      if (isEncrypt) {
        const result = Array.from(text).map((ch, i) => {
          const xored = ch.charCodeAt(0) ^ key.charCodeAt(i % key.length);
          return xored.toString(16).padStart(2, '0');
        }).join(' ').toUpperCase();
        return [
          { label: 'XOR Encrypted (hex)', value: result, highlight: true },
        ];
      } else {
        try {
          const hexBytes = text.trim().split(/\s+/);
          const result = hexBytes.map((hex, i) => {
            const byte = parseInt(hex, 16);
            return String.fromCharCode(byte ^ key.charCodeAt(i % key.length));
          }).join('');
          return [
            { label: 'XOR Decrypted', value: result, highlight: true },
          ];
        } catch {
          return [{ label: 'Error', value: 'Invalid hex input for decryption' }];
        }
      }
    },
  },

  // ━━━ 16. Playfair Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'playfair-cipher',
    name: 'Playfair Cipher Encoder & Decoder',
    description: 'Encrypt or decrypt messages using the Playfair cipher, a digraph substitution cipher that encrypts pairs of letters using a 5×5 key square. Invented by Charles Wheatstone in 1854, it was used extensively in military communications.',
    keywords: ['Playfair cipher', 'digraph cipher', 'Playfair square', 'Wheatstone cipher', '5x5 cipher', 'digraph substitution', 'military cipher', 'Playfair decode'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text (letters only)...', rows: 4 },
      { id: 'key', label: 'Key', type: 'text', default: 'PLAYFAIR', placeholder: 'Enter keyword' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const key = String(inputs.key) || 'PLAYFAIR';
      const encrypt = inputs.mode !== 'decrypt';
      const square = buildPlayfairSquare(key);
      const result = playfairProcess(text, square, encrypt);
      return [
        { label: 'Key Square', value: Array.from({ length: 5 }, (_, r) => square.slice(r * 5, r * 5 + 5).join(' ')).join(' | ') },
        { label: 'Mode', value: encrypt ? 'Encrypt' : 'Decrypt' },
        { label: 'Result', value: result, highlight: true },
        { label: 'Note', value: 'J is replaced by I; X inserted between repeated letters' },
      ];
    },
  },

  // ━━━ 17. Rail Fence Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'rail-fence-cipher',
    name: 'Rail Fence Cipher Encoder & Decoder',
    description: 'Encrypt or decrypt using the rail fence cipher, a transposition cipher that writes text in a zigzag pattern across multiple rails then reads off each row. The number of rails determines the cipher strength.',
    keywords: ['Rail fence', 'zigzag cipher', 'transposition cipher', 'rail fence decode', 'zigzag encryption', 'multiple rails', 'rail cipher', 'fence cipher'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'rails', label: 'Number of Rails', type: 'number', default: 3, min: 2, max: 20 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const rails = Math.max(2, Number(inputs.rails) || 3);
      const encrypt = inputs.mode !== 'decrypt';
      if (encrypt) {
        // Build zigzag pattern
        const fence: string[][] = Array.from({ length: rails }, () => []);
        let rail = 0;
        let dir = 1;
        for (const ch of text) {
          fence[rail].push(ch);
          if (rail === 0) dir = 1;
          if (rail === rails - 1) dir = -1;
          rail += dir;
        }
        const result = fence.flat().join('');
        return [
          { label: 'Rails', value: rails },
          { label: 'Result', value: result, highlight: true },
        ];
      } else {
        // Decrypt rail fence
        const n = text.length;
        const fence: string[][] = Array.from({ length: rails }, () => []);
        // Determine the length of each rail
        const railLens: number[] = new Array(rails).fill(0);
        let rail = 0;
        let dir = 1;
        for (let i = 0; i < n; i++) {
          railLens[rail]++;
          if (rail === 0) dir = 1;
          if (rail === rails - 1) dir = -1;
          rail += dir;
        }
        // Fill rails from ciphertext
        let idx = 0;
        for (let r = 0; r < rails; r++) {
          for (let c = 0; c < railLens[r]; c++) {
            fence[r].push(text[idx++]);
          }
        }
        // Read zigzag
        const result: string[] = [];
        const counters = new Array(rails).fill(0);
        rail = 0;
        dir = 1;
        for (let i = 0; i < n; i++) {
          result.push(fence[rail][counters[rail]++]);
          if (rail === 0) dir = 1;
          if (rail === rails - 1) dir = -1;
          rail += dir;
        }
        return [
          { label: 'Rails', value: rails },
          { label: 'Result', value: result.join(''), highlight: true },
        ];
      }
    },
  },

  // ━━━ 18. Substitution Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'substitution-cipher',
    name: 'Simple Substitution Cipher',
    description: 'Encrypt or decrypt using a custom substitution alphabet. Provide a 26-character key representing the substitution for A through Z. Each letter in the plaintext is replaced by the corresponding letter in the key.',
    keywords: ['substitution cipher', 'alphabet substitution', 'custom alphabet', 'monoalphabetic cipher', 'replace alphabet', 'substitution key', 'letter replacement cipher'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'alphabet', label: 'Substitution Alphabet (26 chars)', type: 'text', default: 'QWERTYUIOPASDFGHJKLZXCVBNM', placeholder: 'Enter 26 unique letters' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const alpha = String(inputs.alphabet).toUpperCase().replace(/[^A-Z]/g, '');
      const encrypt = inputs.mode !== 'decrypt';
      if (alpha.length !== 26 || new Set(alpha).size !== 26) {
        return [
          { label: 'Error', value: `Substitution alphabet must be exactly 26 unique letters. Got ${alpha.length} chars, ${new Set(alpha).size} unique.` },
        ];
      }
      const plainAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const fromAlpha = encrypt ? plainAlpha : alpha;
      const toAlpha = encrypt ? alpha : plainAlpha;
      let result = '';
      for (const ch of text) {
        if (/[A-Z]/.test(ch)) {
          result += toAlpha[fromAlpha.indexOf(ch)];
        } else if (/[a-z]/.test(ch)) {
          result += toAlpha[fromAlpha.indexOf(ch.toUpperCase())].toLowerCase();
        } else {
          result += ch;
        }
      }
      return [
        { label: 'Plain Alphabet', value: plainAlpha },
        { label: 'Cipher Alphabet', value: alpha },
        { label: 'Mode', value: encrypt ? 'Encrypt' : 'Decrypt' },
        { label: 'Result', value: result, highlight: true },
      ];
    },
  },

  // ━━━ 19. ADFGVX Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'adfgvx-cipher',
    name: 'ADFGVX Cipher Encoder & Decoder',
    description: 'Encrypt or decrypt using the ADFGVX cipher, a WWI-era German fractionation cipher that combines a Polybius square substitution with columnar transposition. Uses the letters A, D, F, G, V, X to represent coordinates.',
    keywords: ['ADFGVX cipher', 'WWI cipher', 'fractionation cipher', 'Polybius square', 'columnar transposition', 'German cipher', 'ADFGVX decode', 'Nebel cipher'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text (letters and digits)...', rows: 4 },
      { id: 'key', label: 'Transposition Key', type: 'text', default: 'CIPHER', placeholder: 'Enter keyword for columnar transposition' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const key = String(inputs.key) || 'CIPHER';
      const encrypt = inputs.mode !== 'decrypt';
      const square = buildAdfgvxSquare(key);
      if (encrypt) {
        const substituted = adfgvxEncode(text, square);
        const transposed = adfgvxColumnarTransposition(substituted, key);
        return [
          { label: 'After Substitution', value: substituted },
          { label: 'After Transposition', value: transposed, highlight: true },
        ];
      } else {
        const untransposed = adfgvxColumnarReverse(text.toUpperCase().replace(/[^ADFGVX]/g, ''), key);
        const decoded = adfgvxDecode(untransposed, square);
        return [
          { label: 'After Reverse Transposition', value: untransposed },
          { label: 'Decoded Text', value: decoded, highlight: true },
        ];
      }
    },
  },

  // ━━━ 20. Octal Translator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'octal-translator',
    name: 'Octal Translator',
    description: 'Convert text to octal (base-8) representation and octal back to text. Each character is represented as a 3-digit octal number. Octal encoding is commonly used in Unix file permissions and legacy systems.',
    keywords: ['octal translator', 'text to octal', 'base 8', 'octal converter', 'octal decode', 'base8 encoding', 'octal representation', 'chmod octal'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or octal codes (space-separated)...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'text-to-octal', options: [
        { label: 'Text → Octal', value: 'text-to-octal' },
        { label: 'Octal → Text', value: 'octal-to-text' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isTextToOctal = inputs.mode !== 'octal-to-text';
      if (isTextToOctal) {
        const result = Array.from(text).map(ch => ch.charCodeAt(0).toString(8).padStart(3, '0')).join(' ');
        return [
          { label: 'Octal', value: result, highlight: true },
        ];
      } else {
        try {
          const codes = text.trim().split(/\s+/);
          const result = codes.map(c => String.fromCharCode(parseInt(c, 8))).join('');
          return [
            { label: 'Text', value: result, highlight: true },
          ];
        } catch {
          return [{ label: 'Error', value: 'Invalid octal input' }];
        }
      }
    },
  },

  // ━━━ 21. Reverse Text ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'reverse-text-cipher',
    name: 'Reverse Text Cipher',
    description: 'Reverse the order of characters in text. Create mirrored or backwards text instantly. Supports options for reversing characters, words, or lines. Fun for creating mirrored messages and puzzles.',
    keywords: ['reverse text', 'backwards text', 'mirror text', 'text reverser', 'flip text', 'reverse string', 'backwards generator', 'reverse words'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to reverse...', rows: 4 },
      { id: 'mode', label: 'Reverse Mode', type: 'select', default: 'characters', options: [
        { label: 'Reverse Characters', value: 'characters' },
        { label: 'Reverse Words', value: 'words' },
        { label: 'Reverse Lines', value: 'lines' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const mode = String(inputs.mode) || 'characters';
      let result: string;
      if (mode === 'words') {
        result = text.split(/(\s+)/).reverse().join('');
      } else if (mode === 'lines') {
        result = text.split('\n').reverse().join('\n');
      } else {
        result = Array.from(text).reverse().join('');
      }
      return [
        { label: 'Reversed Text', value: result, highlight: true },
        { label: 'Mode', value: mode === 'characters' ? 'Characters reversed' : mode === 'words' ? 'Words reversed' : 'Lines reversed' },
      ];
    },
  },

  // ━━━ 22. Pig Latin Translator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'pig-latin-translator',
    name: 'Pig Latin Translator',
    description: 'Translate English text to Pig Latin and back. Rules: words starting with a consonant move the consonant cluster to the end and add "ay"; words starting with a vowel just add "way". A playful language game and simple cipher.',
    keywords: ['Pig Latin', 'secret language', 'Igpay Atinlay', 'pig latin translator', 'pig latin decoder', 'language game', 'pig latin rules', 'childhood cipher'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to translate...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'to-pig-latin', options: [
        { label: 'English → Pig Latin', value: 'to-pig-latin' },
        { label: 'Pig Latin → English', value: 'from-pig-latin' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isToPigLatin = inputs.mode !== 'from-pig-latin';
      const vowels = 'aeiouAEIOU';
      if (isToPigLatin) {
        const result = text.split(/(\s+)/).map(word => {
          if (!/[a-zA-Z]/.test(word)) return word;
          const punct = word.match(/^[^a-zA-Z]*|[a-zA-Z]*[^a-zA-Z]*$/g) || [];
          const core = word.replace(/^[^a-zA-Z]+/, '').replace(/[^a-zA-Z]+$/, '');
          if (!core) return word;
          const isCapitalized = core[0] === core[0].toUpperCase();
          const lower = core.toLowerCase();
          if (vowels.includes(lower[0])) {
            return lower + 'way';
          }
          const match = lower.match(/^[^aeiou]+/);
          const cluster = match ? match[0] : '';
          const rest = lower.slice(cluster.length);
          const pig = rest + cluster + 'ay';
          return isCapitalized ? pig[0].toUpperCase() + pig.slice(1) : pig;
        }).join('');
        return [
          { label: 'Pig Latin', value: result, highlight: true },
        ];
      } else {
        const result = text.split(/(\s+)/).map(word => {
          if (!/[a-zA-Z]/.test(word)) return word;
          const lower = word.toLowerCase().replace(/[^a-z]/g, '');
          if (!lower) return word;
          const isCapitalized = word[0] === word[0].toUpperCase();
          let decoded = lower;
          if (lower.endsWith('way')) {
            decoded = lower.slice(0, -3);
          } else if (lower.endsWith('ay')) {
            const stem = lower.slice(0, -2);
            // Try each vowel position
            for (let i = stem.length - 1; i >= 1; i--) {
              if (vowels.includes(stem[i])) {
                const cluster = stem.slice(i);
                const rest = stem.slice(0, i);
                decoded = cluster + rest;
                break;
              }
            }
          }
          return isCapitalized ? decoded[0].toUpperCase() + decoded.slice(1) : decoded;
        }).join('');
        return [
          { label: 'English', value: result, highlight: true },
        ];
      }
    },
  },

  // ━━━ 23. ROT47 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'rot47-decoder',
    name: 'ROT47 Cipher Encoder & Decoder',
    description: 'Apply ROT47 transformation to text — rotates ASCII characters in the range 33-126 by 47 positions. Unlike ROT13 which only affects letters, ROT47 shifts all visible ASCII characters including numbers, symbols, and punctuation.',
    keywords: ['ROT47', 'ASCII rotation', 'ROT-47', 'ASCII cipher', 'ROT47 decode', 'ROT47 encoder', 'full ASCII rotation', 'printable ASCII shift'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to encode/decode with ROT47...', rows: 4 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      let result = '';
      for (const ch of text) {
        const code = ch.charCodeAt(0);
        if (code >= 33 && code <= 126) {
          result += String.fromCharCode(mod(code - 33 + 47, 94) + 33);
        } else {
          result += ch;
        }
      }
      return [
        { label: 'ROT47 Result', value: result, highlight: true },
        { label: 'Note', value: 'ROT47 is its own inverse — apply again to decode' },
      ];
    },
  },

  // ━━━ 24. Character Frequency ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'character-frequency',
    name: 'Character Frequency Analyzer',
    description: 'Analyze the frequency of each character in text — essential for breaking substitution ciphers. Shows letter counts, percentages, and compares against standard English letter frequencies for cryptanalysis.',
    keywords: ['frequency analysis', 'letter frequency', 'cryptanalysis', 'cipher analysis', 'character count', 'etaoin shrdlu', 'frequency distribution', 'cipher breaking'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to analyze...', rows: 6 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const letterCounts: Record<string, number> = {};
      let totalLetters = 0;
      for (const ch of text.toUpperCase()) {
        if (/[A-Z]/.test(ch)) {
          letterCounts[ch] = (letterCounts[ch] || 0) + 1;
          totalLetters++;
        }
      }
      const englishFreq: Record<string, number> = {
        E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1,
        R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2,
        G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.2, X: 0.2,
        Q: 0.1, Z: 0.1,
      };
      const sorted = Object.entries(letterCounts).sort((a, b) => b[1] - a[1]);
      const freqTable = sorted.map(([ch, count]) => {
        const pct = ((count / totalLetters) * 100).toFixed(1);
        const eng = englishFreq[ch]?.toFixed(1) || '0.0';
        return `${ch}: ${count} (${pct}%) [EN: ${eng}%]`;
      }).join('\n');
      const topThree = sorted.slice(0, 3).map(([ch]) => ch).join(', ');
      return [
        { label: 'Total Letters', value: totalLetters },
        { label: 'Unique Letters', value: Object.keys(letterCounts).length },
        { label: 'Top 3 Letters', value: topThree || 'None' },
        { label: 'Frequency Table', value: freqTable || 'No letters found' },
        { label: 'Most Likely Shift (if Caesar)', value: totalLetters > 0 && sorted.length > 0 ? `Try shift = ${(sorted[0][0].charCodeAt(0) - 69 + 26) % 26} (assuming E→${sorted[0][0]})` : 'N/A' },
      ];
    },
  },

  // ━━━ 25. NATO Phonetic Alphabet ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'nato-phonetic-alphabet',
    name: 'NATO Phonetic Alphabet Converter',
    description: 'Convert text to the NATO phonetic alphabet (Alfa, Bravo, Charlie...) used in aviation, military, and radio communications to spell out words clearly. Also converts NATO words back to text.',
    keywords: ['NATO alphabet', 'phonetic alphabet', 'military alphabet', 'aviation alphabet', 'radio alphabet', 'ICAO alphabet', 'spelling alphabet', 'Alfa Bravo Charlie'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to convert to NATO phonetic alphabet...', rows: 4 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const nato = Array.from(text.toUpperCase()).map(ch => {
        if (NATO_MAP[ch]) return NATO_MAP[ch];
        if (ch === ' ') return '/';
        return ch;
      }).join('  ');
      return [
        { label: 'NATO Phonetic', value: nato, highlight: true },
        { label: 'Word Count', value: text.split(/\s+/).filter(Boolean).length },
      ];
    },
  },

  // ━━━ 26. Bacon's Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bacon-cipher',
    name: "Bacon's Cipher Encoder & Decoder",
    description: "Encode or decode messages using Bacon's cipher, a steganographic method invented by Francis Bacon that uses two different typefaces (represented as A and B) to encode letters as 5-bit binary sequences.",
    keywords: ['Bacon cipher', 'Francis Bacon', 'steganography', 'biliteral cipher', 'Baconian cipher', 'two typeface cipher', 'A/B encoding', 'Bacon decode'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt (text → A/B)', value: 'encrypt' },
        { label: 'Decrypt (A/B → text)', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const encrypt = inputs.mode !== 'decrypt';
      // Bacon's alphabet: 24 letters (I=J, U=V merged in original)
      const baconAlphabet = 'ABCDEFGHIKLMNOPQRSTUWXYZ'; // 24 letters
      if (encrypt) {
        const result = Array.from(text.toUpperCase()).map(ch => {
          const idx = baconAlphabet.indexOf(ch);
          if (idx === -1) return '';
          return idx.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B');
        }).filter(Boolean).join(' ');
        return [
          { label: "Bacon's Cipher", value: result, highlight: true },
          { label: 'Note', value: 'Uses 24-letter Baconian alphabet (I=J, U=V merged)' },
        ];
      } else {
        const clean = text.toUpperCase().replace(/[^AB]/g, '');
        let result = '';
        for (let i = 0; i + 4 < clean.length; i += 5) {
          const group = clean.slice(i, i + 5);
          const bits = group.replace(/A/g, '0').replace(/B/g, '1');
          const idx = parseInt(bits, 2);
          if (idx < baconAlphabet.length) {
            result += baconAlphabet[idx];
          } else {
            result += '?';
          }
        }
        return [
          { label: 'Decoded Text', value: result, highlight: true },
        ];
      }
    },
  },

  // ━━━ 27. Autokey Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'autokey-cipher',
    name: 'Autokey Cipher Encoder & Decoder',
    description: 'Encrypt or decrypt using the Autokey cipher, a polyalphabetic cipher where the plaintext itself is appended to the keyword, eliminating the repeating key pattern vulnerability of the Vigenère cipher. Invented by Blaise de Vigenère.',
    keywords: ['Autokey cipher', 'autoclave cipher', 'Vigenère autokey', 'self-key cipher', 'running key', 'Vigenere improvement', 'autokey decode', 'Blaise de Vigenère'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'keyword', label: 'Keyword', type: 'text', default: 'QUEEN', placeholder: 'Enter keyword' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const keyword = String(inputs.keyword).toUpperCase().replace(/[^A-Z]/g, '') || 'A';
      const encrypt = inputs.mode !== 'decrypt';
      const letters = text.replace(/[^A-Za-z]/g, '');
      if (!letters) return [{ label: 'Result', value: '' }];

      if (encrypt) {
        // Key = keyword + plaintext
        const fullKey = keyword + letters.toUpperCase();
        let result = '';
        let ki = 0;
        for (const ch of text) {
          if (/[A-Za-z]/.test(ch)) {
            const isUpper = /[A-Z]/.test(ch);
            const base = isUpper ? 65 : 97;
            const shift = fullKey.charCodeAt(ki) - 65;
            ki++;
            const offset = ch.charCodeAt(0) - base;
            result += String.fromCharCode(mod(offset + shift, 26) + base);
          } else {
            result += ch;
          }
        }
        return [
          { label: 'Full Key Used', value: fullKey.slice(0, letters.length + keyword.length) },
          { label: 'Result', value: result, highlight: true },
        ];
      } else {
        // Decrypt: key = keyword + already-decrypted plaintext
        let result = '';
        const decryptedLetters: number[] = [];
        let ki = 0;
        for (const ch of text) {
          if (/[A-Za-z]/.test(ch)) {
            const isUpper = /[A-Z]/.test(ch);
            const base = isUpper ? 65 : 97;
            let keyChar: number;
            if (ki < keyword.length) {
              keyChar = keyword.charCodeAt(ki) - 65;
            } else {
              keyChar = decryptedLetters[ki - keyword.length];
            }
            const offset = ch.charCodeAt(0) - base;
            const decrypted = mod(offset - keyChar, 26);
            decryptedLetters.push(decrypted);
            ki++;
            result += String.fromCharCode(decrypted + (isUpper ? 65 : 97));
          } else {
            result += ch;
          }
        }
        return [
          { label: 'Decrypted Text', value: result, highlight: true },
        ];
      }
    },
  },

  // ━━━ 28. Beaufort Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'beaufort-cipher',
    name: 'Beaufort Cipher Encoder & Decoder',
    description: 'Encrypt or decrypt using the Beaufort cipher, a reciprocal polyalphabetic cipher similar to Vigenère but using subtraction: E(x) = (K - P) mod 26. Like the Atbash cipher, encryption and decryption are identical operations.',
    keywords: ['Beaufort cipher', 'reciprocal cipher', 'Francis Beaufort', 'Beaufort decode', 'polyalphabetic subtraction', 'Vigenère variant', 'self-reciprocal cipher', 'Beaufort encrypt'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'keyword', label: 'Keyword', type: 'text', default: 'BEAUFORT', placeholder: 'Enter keyword' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const keyword = String(inputs.keyword).toUpperCase().replace(/[^A-Z]/g, '') || 'A';
      // Beaufort is reciprocal: same operation for encrypt and decrypt
      let result = '';
      let ki = 0;
      for (const ch of text) {
        if (/[A-Za-z]/.test(ch)) {
          const isUpper = /[A-Z]/.test(ch);
          const base = isUpper ? 65 : 97;
          const k = keyword.charCodeAt(ki % keyword.length) - 65;
          ki++;
          const p = ch.charCodeAt(0) - base;
          const enc = mod(k - p, 26);
          result += String.fromCharCode(enc + base);
        } else {
          result += ch;
        }
      }
      return [
        { label: 'Keyword', value: keyword },
        { label: 'Result', value: result, highlight: true },
        { label: 'Note', value: 'Beaufort is reciprocal — encryption and decryption use the same operation' },
      ];
    },
  },

  // ━━━ 29. Running Key Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'running-key-cipher',
    name: 'Running Key Cipher',
    description: 'Encrypt or decrypt using a running key cipher, which uses a long text (like a book passage) as the key instead of a short keyword. This eliminates the repeating key pattern, making it more resistant to Kasiski examination.',
    keywords: ['running key cipher', 'book cipher', 'long key cipher', 'Kasiski resistant', 'running key decode', 'non-repeating key', 'text-based key', 'running key Vigenère'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to encrypt/decrypt...', rows: 4 },
      { id: 'runningKey', label: 'Running Key (long text)', type: 'textarea', default: '', placeholder: 'Enter a long key text (at least as long as the message)...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const runningKey = String(inputs.runningKey).toUpperCase().replace(/[^A-Z]/g, '') || 'A';
      const encrypt = inputs.mode !== 'decrypt';
      let result = '';
      let ki = 0;
      for (const ch of text) {
        if (/[A-Za-z]/.test(ch)) {
          const isUpper = /[A-Z]/.test(ch);
          const base = isUpper ? 65 : 97;
          const shift = runningKey.charCodeAt(ki % runningKey.length) - 65;
          ki++;
          const offset = ch.charCodeAt(0) - base;
          const shifted = encrypt ? mod(offset + shift, 26) : mod(offset - shift, 26);
          result += String.fromCharCode(shifted + base);
        } else {
          result += ch;
        }
      }
      const keyUsed = ki;
      return [
        { label: 'Key Characters Used', value: keyUsed },
        { label: 'Key Length Available', value: runningKey.length },
        { label: 'Key Sufficient', value: runningKey.length >= keyUsed ? 'Yes' : 'No — key was repeated' },
        { label: 'Result', value: result, highlight: true },
      ];
    },
  },

  // ━━━ 30. Book Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'book-cipher',
    name: 'Book Cipher Encoder & Decoder',
    description: 'Encode or decode messages using a book cipher, where words or letters are referenced by their position (page, line, word/letter number) in a shared text. A classic espionage cipher that requires both parties to have the same key text.',
    keywords: ['book cipher', 'Ottendorf cipher', 'espionage cipher', 'page line word', 'reference cipher', 'book code', 'dictionary cipher', 'book decode'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text to encode...', rows: 4 },
      { id: 'bookText', label: 'Key Text (Book)', type: 'textarea', default: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.', placeholder: 'Enter the key text (shared book passage)...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encode', options: [
        { label: 'Encode (text → word positions)', value: 'encode' },
        { label: 'Decode (word positions → text)', value: 'decode' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const bookText = String(inputs.bookText);
      const isEncode = inputs.mode !== 'decode';
      if (isEncode) {
        // Encode: find each word's position in the book text
        const bookWords = bookText.toLowerCase().split(/\s+/);
        const words = text.split(/\s+/);
        const result = words.map(word => {
          const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');
          const idx = bookWords.findIndex(w => w.toLowerCase().replace(/[^a-z]/g, '') === lowerWord);
          if (idx === -1) return '?';
          return String(idx + 1); // 1-based index
        }).join(' ');
        const found = (result.match(/\d+/g) || []).length;
        return [
          { label: 'Word Positions (1-based)', value: result, highlight: true },
          { label: 'Words Found', value: `${found}/${words.length}` },
          { label: 'Book Word Count', value: bookWords.length },
          { label: 'Note', value: 'Positions are 1-based word indices in the key text' },
        ];
      } else {
        // Decode: convert positions to words
        const positions = text.trim().split(/[\s,;]+/).map(Number).filter(n => !isNaN(n) && n > 0);
        const bookWords = bookText.split(/\s+/);
        const result = positions.map(pos => bookWords[pos - 1] || '?').join(' ');
        return [
          { label: 'Decoded Text', value: result, highlight: true },
          { label: 'Positions Decoded', value: positions.length },
        ];
      }
    },
  },

  // ━━━ 31. Base32 Encoder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'base32-encoder',
    name: 'Base32 Encoder & Decoder',
    description: 'Convert text to and from Base32 encoding using the RFC 4648 alphabet (A-Z, 2-7). Base32 is case-insensitive and commonly used for TOTP secrets, DNSSEC, and other systems where case sensitivity is problematic.',
    keywords: ['Base32 encode', 'Base32 decode', 'RFC 4648', 'case-insensitive encoding', 'TOTP secret', 'Base32 converter', 'Crockford Base32', 'DNSSEC encoding'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or Base32 string...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encode', options: [
        { label: 'Encode', value: 'encode' },
        { label: 'Decode', value: 'decode' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const isEncode = inputs.mode !== 'decode';
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      if (isEncode) {
        const bytes: number[] = [];
        for (let i = 0; i < text.length; i++) {
          bytes.push(text.charCodeAt(i));
        }
        let bits = bytes.map(b => b.toString(2).padStart(8, '0')).join('');
        // Pad to multiple of 5
        while (bits.length % 5 !== 0) bits += '0';
        let result = '';
        for (let i = 0; i < bits.length; i += 5) {
          result += alphabet[parseInt(bits.slice(i, i + 5), 2)];
        }
        // Add padding
        const padLen = [0, 6, 4, 3, 1][bytes.length % 5];
        result += '='.repeat(padLen);
        return [
          { label: 'Base32 Encoded', value: result, highlight: true },
        ];
      } else {
        try {
          const clean = text.toUpperCase().replace(/[=\s]/g, '');
          let bits = '';
          for (const ch of clean) {
            const idx = alphabet.indexOf(ch);
            if (idx === -1) return [{ label: 'Error', value: `Invalid Base32 character: ${ch}` }];
            bits += idx.toString(2).padStart(5, '0');
          }
          // Remove padding bits
          const byteLen = Math.floor(bits.length / 8);
          let result = '';
          for (let i = 0; i < byteLen; i++) {
            result += String.fromCharCode(parseInt(bits.slice(i * 8, i * 8 + 8), 2));
          }
          return [
            { label: 'Decoded Text', value: result, highlight: true },
          ];
        } catch {
          return [{ label: 'Error', value: 'Invalid Base32 input' }];
        }
      }
    },
  },

  // ━━━ 32. Caesar Brute Force ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'caesar-brute-force',
    name: 'Caesar Cipher Brute Force Decoder',
    description: 'Automatically try all 25 possible Caesar cipher shifts and display all results. Essential for cracking unknown Caesar-encrypted messages by scanning each rotation for recognizable words.',
    keywords: ['Caesar brute force', 'Caesar crack', 'break Caesar cipher', 'all shifts', 'rotation attack', 'exhaustive search', 'Caesar solver', 'cipher breaker'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Encrypted Text', type: 'textarea', default: '', placeholder: 'Enter Caesar-encrypted text to crack...', rows: 4 },
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const shifts: string[] = [];
      for (let shift = 1; shift <= 25; shift++) {
        let decoded = '';
        for (const ch of text) {
          if (/[A-Z]/.test(ch)) {
            decoded += String.fromCharCode(mod(ch.charCodeAt(0) - 65 - shift, 26) + 65);
          } else if (/[a-z]/.test(ch)) {
            decoded += String.fromCharCode(mod(ch.charCodeAt(0) - 97 - shift, 26) + 97);
          } else {
            decoded += ch;
          }
        }
        shifts.push(`Shift ${shift.toString().padStart(2, ' ')}: ${decoded}`);
      }
      return [
        { label: 'All Possible Decryptions', value: shifts.join('\n'), highlight: true },
        { label: 'Tip', value: 'Look for the shift that produces readable English text' },
      ];
    },
  },

  // ━━━ 33. Polybius Square ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'polybius-square',
    name: 'Polybius Square Encoder & Decoder',
    description: 'Encode or decode using the Polybius Square cipher, an ancient Greek encryption method that maps letters to coordinate pairs (1-5). Each letter is represented by a two-digit number indicating its row and column in a 5×5 grid.',
    keywords: ['Polybius square', 'coordinate cipher', 'Greek cipher', 'Polybius decode', '5x5 grid cipher', 'number cipher', 'two-digit cipher', 'Polybius encoder'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or coordinate pairs...', rows: 4 },
      { id: 'key', label: 'Key (optional)', type: 'text', default: '', placeholder: 'Optional key to rearrange the square' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const key = String(inputs.key).toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
      const encrypt = inputs.mode !== 'decrypt';
      // Build square
      const seen = new Set<string>();
      const square: string[] = [];
      const alpha = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
      for (const ch of key + alpha) {
        if (!seen.has(ch) && alpha.includes(ch)) {
          seen.add(ch);
          square.push(ch);
        }
      }
      if (encrypt) {
        const result = Array.from(text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')).map(ch => {
          const idx = square.indexOf(ch);
          if (idx === -1) return '';
          const row = Math.floor(idx / 5) + 1;
          const col = idx % 5 + 1;
          return `${row}${col}`;
        }).filter(Boolean).join(' ');
        return [
          { label: 'Square Layout', value: Array.from({ length: 5 }, (_, r) => square.slice(r * 5, r * 5 + 5).join(' ')).join(' | ') },
          { label: 'Coordinates', value: result, highlight: true },
        ];
      } else {
        const digits = text.replace(/\D/g, '');
        let result = '';
        for (let i = 0; i + 1 < digits.length; i += 2) {
          const row = parseInt(digits[i]) - 1;
          const col = parseInt(digits[i + 1]) - 1;
          if (row >= 0 && row < 5 && col >= 0 && col < 5) {
            result += square[row * 5 + col];
          } else {
            result += '?';
          }
        }
        return [
          { label: 'Decoded Text', value: result, highlight: true },
        ];
      }
    },
  },

  // ━━━ 34. Tap Code ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'tap-code',
    name: 'Tap Code Encoder & Decoder',
    description: 'Encode or decode using the Tap Code cipher, used by POWs to communicate through walls. Similar to Polybius Square but uses a different 5×5 grid layout (K omitted) and signals are separated by pauses. Taps represent row and column numbers.',
    keywords: ['tap code', 'POW cipher', 'knock code', 'prisoner cipher', 'tap cipher', 'Wallace Fardo', 'military tap code', 'knock signal cipher'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text or tap code (comma-separated row.col pairs)...', rows: 4 },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt (text → tap code)', value: 'encrypt' },
        { label: 'Decrypt (tap code → text)', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text);
      const encrypt = inputs.mode !== 'decrypt';
      // Tap code grid (K omitted, C used for both C and K)
      const grid = [
        ['A', 'B', 'C', 'D', 'E'],
        ['F', 'G', 'H', 'I', 'J'],
        ['L', 'M', 'N', 'O', 'P'],
        ['Q', 'R', 'S', 'T', 'U'],
        ['V', 'W', 'X', 'Y', 'Z'],
      ];
      if (encrypt) {
        const result = Array.from(text.toUpperCase().replace(/K/g, 'C').replace(/[^A-Z]/g, '')).map(ch => {
          for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
              if (grid[r][c] === ch) return `${r + 1}.${c + 1}`;
            }
          }
          return '';
        }).filter(Boolean).join('  ');
        return [
          { label: 'Tap Code', value: result, highlight: true },
          { label: 'Grid', value: grid.map(r => r.join(' ')).join(' | ') },
          { label: 'Note', value: 'K is replaced by C; format is row.column' },
        ];
      } else {
        const pairs = text.trim().split(/\s+/);
        const result = pairs.map(pair => {
          const [r, c] = pair.split(/[.,:]/).map(Number);
          if (r >= 1 && r <= 5 && c >= 1 && c <= 5) return grid[r - 1][c - 1];
          return '?';
        }).join('');
        return [
          { label: 'Decoded Text', value: result, highlight: true },
        ];
      }
    },
  },

  // ━━━ 35. Columnar Transposition Cipher ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'columnar-transposition',
    name: 'Columnar Transposition Cipher',
    description: 'Encrypt or decrypt using columnar transposition, where text is written in rows under a keyword and read off by columns in alphabetical order of the keyword letters. A classic transposition cipher used in military communications.',
    keywords: ['columnar transposition', 'transposition cipher', 'column cipher', 'keyword transposition', 'columnar decode', 'permutation cipher', 'keyed columnar', 'transposition decode'],
    category: 'cipher',
    icon: 'Lock',
    fields: [
      { id: 'text', label: 'Text', type: 'textarea', default: '', placeholder: 'Enter text...', rows: 4 },
      { id: 'key', label: 'Key', type: 'text', default: 'ZEBRA', placeholder: 'Enter keyword (no repeated letters for best results)' },
      { id: 'mode', label: 'Mode', type: 'select', default: 'encrypt', options: [
        { label: 'Encrypt', value: 'encrypt' },
        { label: 'Decrypt', value: 'decrypt' },
      ]},
    ],
    compute: (inputs) => {
      const text = String(inputs.text).replace(/\s+/g, '');
      const key = String(inputs.key).toUpperCase().replace(/[^A-Z]/g, '') || 'A';
      const encrypt = inputs.mode !== 'decrypt';
      const keyLen = key.length;
      // Determine column order
      const indexed = key.split('').map((ch, i) => ({ ch, i }));
      indexed.sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i);
      const order = indexed.map(x => x.i);

      if (encrypt) {
        const numRows = Math.ceil(text.length / keyLen);
        const padded = text.padEnd(numRows * keyLen, 'X');
        const grid: string[][] = [];
        for (let r = 0; r < numRows; r++) {
          grid.push(padded.slice(r * keyLen, (r + 1) * keyLen).split(''));
        }
        const result = order.map(col => grid.map(row => row[col]).join('')).join('');
        return [
          { label: 'Column Order', value: order.map(o => o + 1).join(', ') },
          { label: 'Grid Size', value: `${numRows} rows × ${keyLen} columns` },
          { label: 'Result', value: result, highlight: true },
        ];
      } else {
        const numRows = Math.ceil(text.length / keyLen);
        const fullCols = text.length % keyLen || keyLen;
        const colLens = Array.from({ length: keyLen }, (_, i) =>
          order.indexOf(i) < fullCols ? numRows : numRows - 1
        );
        let pos = 0;
        const cols: string[] = [];
        for (const colIdx of order) {
          const len = colLens[colIdx];
          cols.push(text.slice(pos, pos + len));
          pos += len;
        }
        let result = '';
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < keyLen; c++) {
            if (r < cols[c].length) result += cols[c][r];
          }
        }
        return [
          { label: 'Decrypted Text', value: result, highlight: true },
        ];
      }
    },
  },

];
