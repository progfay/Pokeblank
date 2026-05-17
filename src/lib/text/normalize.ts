declare const normalizedBrand: unique symbol;
export type Normalized = string & { readonly [normalizedBrand]: true };

const HIRAGANA_TO_KATAKANA_OFFSET = 0x60;
const HALFWIDTH_TO_FULLWIDTH_OFFSET = 0xfee0;

export function normalize(raw: string): Normalized {
  return raw
    .replace(/[ぁ-ゖ]/g, (c) =>
      String.fromCodePoint(c.codePointAt(0)! + HIRAGANA_TO_KATAKANA_OFFSET),
    )
    .replace(/[!-~]/g, (c) =>
      String.fromCodePoint(c.toUpperCase().codePointAt(0)! + HALFWIDTH_TO_FULLWIDTH_OFFSET),
    ) as Normalized;
}
