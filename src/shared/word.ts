export interface WordAtOffset {
  surface: string;
  start: number;
  end: number;
}

const ENGLISH_WORD_RE = /^[A-Za-z]+(?:'[A-Za-z]+)?$/;

// Common Chinese surname pinyin patterns (single and compound surnames)
const CHINESE_SURNAME_PATTERNS = [
  /^(zh|ch|sh|[bcdfghjklmnpqrstwxyz])(ang|eng|ing|ong|an|en|in|un|ian|uan|üan|üe|ie|iu|ui|ou|ao|ai|ei|er|v)?$/i,
  /^(li|zhang|wang|liu|chen|yang|huang|zhao|wu|zhou|xu|sun|ma|zhu|hu|guo|he|gao|lin|luo|zheng|liang|xie|song|tang|feng|yu|dong|pan|cao|peng|cai|jiang|wei|su|cheng|qian|deng|fan|fu|shen|han|jiang|hong|hu|jin|lei|liao|ling|qi|qiu|shi|tan|wan|wen|wu|xiang|xiao|yan|yao|yi|yin|yuan|zeng|zhai|zheng|zhong|zou)$/i,
];

// Patterns that look like pinyin or name abbreviations
const PINYIN_LIKE_RE = /^[bcdfghjklmnpqrstwxyz][a-z]{0,3}$/i; // Very short consonant-start tokens like "zs", "lm"
const ALL_CAPS_ABBREVIATION_RE = /^[A-Z]{2,4}$/; // Name abbreviations like "ZS", "LXM", "WJL"
const PINYIN_SYLLABLE_COUNT_RE = /^([bcdfghjklmnpqrstwxyz][a-z]*[aeiou]){1,2}$/i; // 1-2 syllable pinyin-like

// Common English words that might match pinyin patterns but are legitimate English
const ENGLISH_FALSE_POSITIVES = new Set([
  'be', 'he', 'she', 'we', 'me', 'go', 'no', 'so', 'do', 'to', 'up', 'if', 'in', 'on', 'at', 'by', 'my', 'hi',
  'can', 'man', 'men', 'sun', 'run', 'fun', 'but', 'put', 'get', 'let', 'set', 'sit', 'hit', 'bit', 'fit', 'pit',
  'not', 'hot', 'got', 'lot', 'pot', 'dot', 'cat', 'bat', 'rat', 'fat', 'hat', 'mat', 'sat', 'pat', 'eat', 'tea',
  'see', 'bee', 'fee', 'lee', 'too', 'zoo', 'boo', 'moo', 'roo', 'loo', 'coo', 'woo',
  'yes', 'way', 'say', 'day', 'may', 'ray', 'lay', 'pay', 'bay', 'gay', 'hay', 'jay', 'nay', 'key', 'eye',
  'air', 'ear', 'car', 'far', 'bar', 'war', 'tar', 'par', 'mar', 'star', 'door', 'floor', 'poor', 'boar', 'boor',
  'continue', 'received', 'worked', 'running', 'look', 'charge', 'replied', 'file', 'docs', 'grew', 'package',
  'yesterday', 'revenue', 'grew', 'fourth', 'quarter', 'fiscal', 'year', 'twenty', 'twentyfive', 'in', 'of',
  'hello', 'world', 'example', 'test', 'name', 'time', 'good', 'bad', 'new', 'old', 'long', 'little', 'great',
]);

/**
 * Checks if a string looks like Chinese pinyin or a name abbreviation.
 * This helps avoid false positives when identifying English words.
 */
function isLikelyPinyinOrNameAbbreviation(surface: string): boolean {
  const lower = surface.toLowerCase();
  
  // Don't flag common English words even if they match pinyin-like patterns
  if (ENGLISH_FALSE_POSITIVES.has(lower)) {
    return false;
  }
  
  // Check for very short consonant-based tokens (likely initials/abbreviations)
  // But exclude common 2-letter English words
  if (PINYIN_LIKE_RE.test(surface) && surface.length <= 4) {
    // Exclude common English words of length 2-3
    if (surface.length <= 3 && /^[aeiou]/i.test(surface)) {
      return false; // Words starting with vowel are likely English
    }
    return true;
  }
  
  // Check for all-caps short abbreviations (common for Chinese names)
  if (ALL_CAPS_ABBREVIATION_RE.test(surface)) {
    return true;
  }
  
  // Check if it matches common Chinese surname patterns
  if (CHINESE_SURNAME_PATTERNS.some(pattern => pattern.test(lower))) {
    return true;
  }
  
  // Check for pinyin-like syllable patterns (1-2 syllables, no complex clusters)
  // Be more restrictive: require it to not have typical English word endings
  if (PINYIN_SYLLABLE_COUNT_RE.test(surface) && surface.length <= 6) {
    // Exclude words with common English suffixes
    if (/^(ing|ed|ly|er|est|ness|tion|ment|able|ible)$/.test(lower)) {
      return false;
    }
    return true;
  }
  
  return false;
}

export function normalizeSingleEnglishWord(surface: string): string {
  const compact = surface.trim().replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
  if (!ENGLISH_WORD_RE.test(compact)) {
    return "";
  }
  
  // Reject pinyin-like or name abbreviation patterns
  if (isLikelyPinyinOrNameAbbreviation(compact)) {
    return "";
  }
  
  return compact;
}

function isWordCharacter(char: string | undefined): boolean {
  return Boolean(char && /[A-Za-z']/u.test(char));
}

function isAlphaNumeric(char: string | undefined): boolean {
  return Boolean(char && /[A-Za-z0-9]/u.test(char));
}

function isEnglishLikeWord(surface: string): boolean {
  return ENGLISH_WORD_RE.test(surface);
}

function isStructuralTechnicalBoundaryCharacter(char: string | undefined): boolean {
  return Boolean(char && /[_@/\\-]/u.test(char));
}

function isDotEmbeddedInTechnicalToken(text: string, start: number, end: number): boolean {
  return (
    text[start - 1] === "." ||
    (text[end] === "." && isAlphaNumeric(text[end + 1]))
  );
}

function isUrlSchemeBoundary(text: string, start: number, end: number): boolean {
  return (
    (text[end] === ":" && text[end + 1] === "/") ||
    (text[start - 1] === "/" && text[start - 2] === ":")
  );
}

function isEmbeddedInTechnicalToken(text: string, start: number, end: number): boolean {
  return (
    isAlphaNumeric(text[start - 1]) ||
    isAlphaNumeric(text[end]) ||
    isStructuralTechnicalBoundaryCharacter(text[start - 1]) ||
    isStructuralTechnicalBoundaryCharacter(text[end]) ||
    isDotEmbeddedInTechnicalToken(text, start, end) ||
    isUrlSchemeBoundary(text, start, end)
  );
}

function isLikelyTechnicalToken(text: string): boolean {
  const compact = normalizeSelectionText(text);

  if (!compact || /\s/.test(compact)) {
    return false;
  }

  return (
    /^(https?:\/\/|www\.)/i.test(compact) ||
    compact.startsWith(".") ||
    /[@_\\/]/.test(compact) ||
    /[A-Za-z]+\d|\d+[A-Za-z]/.test(compact) ||
    compact.includes(".")
  );
}

export function normalizeSelectionText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function isSingleEnglishWord(surface: string): boolean {
  return Boolean(normalizeSingleEnglishWord(surface));
}

export function countEnglishWords(text: string): number {
  return normalizeSelectionText(text).match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
}

export function isEnglishSelectionText(text: string): boolean {
  const compact = normalizeSelectionText(text);

  if (!compact || compact.length > 360 || /[\u4e00-\u9fff]/u.test(compact)) {
    return false;
  }

  if (/[@#][A-Za-z0-9_]/.test(compact)) {
    return false;
  }

  if (!/[A-Za-z]+(?:'[A-Za-z]+)?/.test(compact)) {
    return false;
  }

  if (isLikelyTechnicalToken(compact)) {
    return false;
  }

  // Reject pinyin-like or name abbreviation patterns for single-word selections
  const wordMatch = compact.match(/^[A-Za-z]+(?:'[A-Za-z]+)?$/);
  if (wordMatch && isLikelyPinyinOrNameAbbreviation(wordMatch[0])) {
    return false;
  }

  return true;
}

export function extractWordAtOffset(text: string, offset: number): WordAtOffset | null {
  if (!text) {
    return null;
  }

  let cursor = Math.min(Math.max(offset, 0), text.length - 1);

  if (!isWordCharacter(text[cursor])) {
    if (cursor > 0 && isWordCharacter(text[cursor - 1])) {
      cursor -= 1;
    } else if (cursor + 1 < text.length && isWordCharacter(text[cursor + 1])) {
      cursor += 1;
    } else {
      return null;
    }
  }

  let start = cursor;
  let end = cursor + 1;

  while (start > 0 && isWordCharacter(text[start - 1])) {
    start -= 1;
  }

  while (end < text.length && isWordCharacter(text[end])) {
    end += 1;
  }

  if (isEmbeddedInTechnicalToken(text, start, end)) {
    return null;
  }

  const surface = text.slice(start, end);

  if (!isEnglishLikeWord(surface)) {
    return null;
  }

  return { surface, start, end };
}
