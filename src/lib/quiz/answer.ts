import type { ValidatedInput } from "../text/validation.ts";
import type { PokedexEntry } from "./question.ts";

export type AnswerResult =
  | { kind: "correct"; matchedPokemon: PokedexEntry }
  | { kind: "incorrect" };

export function checkAnswer(
  input: ValidatedInput,
  matchingEntries: readonly PokedexEntry[],
): AnswerResult {
  const matched = matchingEntries.find(([, name]) => name === input);
  if (matched !== undefined) return { kind: "correct", matchedPokemon: matched };
  return { kind: "incorrect" };
}
