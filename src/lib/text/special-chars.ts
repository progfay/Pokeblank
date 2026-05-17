const HIRAGANA_START = 0x3040;
const HIRAGANA_END = 0x309f;
const KATAKANA_START = 0x30a0;
const KATAKANA_END = 0x30ff;

export function isSpecialChar(grapheme: string): boolean {
  const cp = grapheme.codePointAt(0);
  if (cp === undefined) return false;
  if (cp >= HIRAGANA_START && cp <= HIRAGANA_END) return false;
  if (cp >= KATAKANA_START && cp <= KATAKANA_END) return false;
  return true;
}
