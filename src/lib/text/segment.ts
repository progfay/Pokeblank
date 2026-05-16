const segmenter = new Intl.Segmenter();

export function segment(text: string): readonly string[] {
  return [...segmenter.segment(text)].map((s) => s.segment);
}
