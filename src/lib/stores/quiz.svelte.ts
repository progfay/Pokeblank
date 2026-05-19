import { normalize } from "../text/normalize.ts";
import {
  generateQuestion,
  pickRandomPokemon,
  type PokedexEntry,
  type Question,
} from "../quiz/question.ts";
import { checkAnswer } from "../quiz/answer.ts";
import { findMatchingEntries, segmentPokedex } from "../quiz/matching.ts";
import { withRevealed } from "../quiz/question.ts";
import { decodeQuestion, encodeQuestion } from "../url/query.ts";

function updateUrl(pokedexNumber: number, question: Question): void {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", "?q=" + encodeQuestion(pokedexNumber, question));
}

export function createQuizStore(pokedex: readonly PokedexEntry[]) {
  const segmentedPokedex = segmentPokedex(pokedex);
  const nameSet = new Set(pokedex.map(([, name]) => name));

  const restored =
    typeof window !== "undefined"
      ? decodeQuestion(new URLSearchParams(window.location.search).get("q") ?? "", pokedex)
      : null;

  const initialEntry = restored?.entry ?? pickRandomPokemon(pokedex);
  const initialQuestion = restored?.question ?? generateQuestion(initialEntry);

  let currentEntry = $state<PokedexEntry>(initialEntry);
  let mode = $state<"question" | "answer">("question");
  let question = $state<Question>(initialQuestion);
  let rawInput = $state("");
  let error = $state<string | null>(null);
  let matchingEntries = $state<readonly PokedexEntry[]>([]);
  let wasCorrect = $state(false);
  let matchedEntry = $state<PokedexEntry | null>(null);

  updateUrl(initialEntry[0], initialQuestion);

  return {
    get mode() {
      return mode;
    },
    get question() {
      return question;
    },
    get rawInput() {
      return rawInput;
    },
    get error() {
      return error;
    },
    get matchingEntries() {
      return matchingEntries;
    },
    get wasCorrect() {
      return wasCorrect;
    },
    get matchedEntry() {
      return matchedEntry;
    },

    onInputChange(value: string) {
      rawInput = value;
      error = null;
    },

    handleSubmit() {
      const normalized = normalize(rawInput);
      const { all, strict: strictEntries } = findMatchingEntries(segmentedPokedex, question);
      const result = checkAnswer(normalized, nameSet, strictEntries);
      if (result.kind === "not-a-pokemon") {
        error = "未知のポケモンです";
        return;
      }
      if (result.kind === "incorrect") {
        error = "パターンにマッチしません";
        return;
      }
      error = null;
      matchingEntries = all;
      wasCorrect = true;
      matchedEntry = result.matchedPokemon;
      mode = "answer";
    },

    handlePass() {
      matchingEntries = findMatchingEntries(segmentedPokedex, question).all;
      wasCorrect = false;
      matchedEntry = null;
      mode = "answer";
    },

    handleReveal(index: number) {
      question = withRevealed(question, index);
    },

    handleNext() {
      currentEntry = pickRandomPokemon(pokedex);
      question = generateQuestion(currentEntry);
      updateUrl(currentEntry[0], question);
      rawInput = "";
      error = null;
      matchingEntries = [];
      wasCorrect = false;
      matchedEntry = null;
      mode = "question";
    },
  };
}
