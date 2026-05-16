declare const normalizedBrand: unique symbol;
export type Normalized = string & { readonly [normalizedBrand]: true };

export function normalize(raw: string): Normalized {
  return raw.replace(/[ぁ-ゖ]/g, c =>
    String.fromCodePoint(c.codePointAt(0)! + 0x60)
  ) as Normalized;
}
