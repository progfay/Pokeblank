import { segment } from "../text/segment.ts";
import type { Pokedex, PokedexEntry, Question } from "./question.ts";

export type SegmentedEntry = {
  readonly entry: PokedexEntry;
  readonly graphemes: readonly string[];
};

export function segmentPokedex(pokedex: Pokedex): readonly SegmentedEntry[] {
  return pokedex.map((entry) => ({ entry, graphemes: segment(entry[1]) }));
}

export function matchesPattern(candidateGraphemes: readonly string[], question: Question): boolean {
  const { letters } = question;
  if (candidateGraphemes.length !== letters.length) return false;
  return letters.every((letter, i) => {
    if (letter.kind === "revealed") return candidateGraphemes[i] === letter.value;
    return true;
  });
}

export function findMatchingEntries(
  segmentedPokedex: readonly SegmentedEntry[],
  question: Question,
): readonly PokedexEntry[] {
  return segmentedPokedex
    .filter(({ graphemes }) => matchesPattern(graphemes, question))
    .map(({ entry }) => entry);
}
