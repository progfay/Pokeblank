import { segment } from "../text/segment.ts";
import type { Pokedex, PokedexEntry, Question } from "./question.ts";

export function matchesPattern(
  candidateGraphemes: readonly string[],
  question: Question,
  strict = false,
): boolean {
  const { letters } = question;
  if (candidateGraphemes.length !== letters.length) return false;
  return letters.every((letter, i) => {
    if (letter.kind === "revealed") return candidateGraphemes[i] === letter.value;
    if (strict && letter.kind === "hint-revealed") return candidateGraphemes[i] === letter.value;
    return true;
  });
}

export function findAllMatchingPokedexEntries(
  pokedex: Pokedex,
  question: Question,
  strict = false,
): readonly PokedexEntry[] {
  return pokedex.filter((entry) => matchesPattern(segment(entry[1]), question, strict));
}
