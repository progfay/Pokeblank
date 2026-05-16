export function isSpecialChar(grapheme: string): boolean {
  const cp = grapheme.codePointAt(0);
  if (cp === undefined) return false;
  if (cp >= 0x3040 && cp <= 0x309f) return false; // hiragana
  if (cp >= 0x30a0 && cp <= 0x30ff) return false; // katakana
  return true;
}
