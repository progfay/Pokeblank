import type { Normalized } from "../text/normalize.ts";
import type { PokedexEntry } from "./question.ts";

export type AnswerResult =
  | { kind: "correct"; matchedPokemon: PokedexEntry }
  | { kind: "not-a-pokemon" }
  | { kind: "incorrect" };

export function checkAnswer(
  input: Normalized,
  nameSet: ReadonlySet<string>,
  matchingEntries: readonly PokedexEntry[],
): AnswerResult {
  const matched = matchingEntries.find(([, name]) => name === input);
  if (matched !== undefined) return { kind: "correct", matchedPokemon: matched };

  if (!nameSet.has(input)) return { kind: "not-a-pokemon" };

  return { kind: "incorrect" };
}
