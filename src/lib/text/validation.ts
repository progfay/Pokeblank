import { segment } from './segment.ts';
import type { Normalized } from './normalize.ts';

declare const validatedBrand: unique symbol;
export type ValidatedInput = Normalized & { readonly [validatedBrand]: true };

export function validate(
  normalized: Normalized,
  allowedSpecialChars: readonly string[]
): ValidatedInput | null {
  const graphemes = segment(normalized);
  if (graphemes.length === 0) return null;
  const valid = graphemes.every(
    g => /^[゠-ヿ]$/.test(g) || allowedSpecialChars.includes(g)
  );
  return valid ? (normalized as ValidatedInput) : null;
}
