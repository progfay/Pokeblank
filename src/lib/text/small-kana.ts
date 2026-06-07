const SMALL_KANA = new Set("ァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖ");

export function isSmallKana(grapheme: string): boolean {
  return grapheme.length === 1 && SMALL_KANA.has(grapheme);
}
