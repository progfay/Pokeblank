declare const normalizedBrand: unique symbol;
export type Normalized = string & { readonly [normalizedBrand]: true };

const HIRAGANA_TO_KATAKANA_OFFSET = 0x60;

export function normalize(raw: string): Normalized {
  return raw.replace(/[ぁ-ゖ]/g, (c) =>
    String.fromCodePoint(c.codePointAt(0)! + HIRAGANA_TO_KATAKANA_OFFSET),
  ) as Normalized;
}
