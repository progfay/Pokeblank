import { normalize } from "../text/normalize.ts";
import { checkAnswer } from "../quiz/answer.ts";
import { findMatchingEntries, segmentPokedex } from "../quiz/matching.ts";
import {
  generateQuestion,
  pickRandomPokemon,
  withRevealed,
  type PokedexEntry,
  type Question,
} from "../quiz/question.ts";
import { decodeSet, encodeSet, SET_SIZE } from "../url/query.ts";

export type TimeAttackPhase = "start" | "playing" | "result";

export type SetQuestion = {
  readonly entry: PokedexEntry;
  readonly initialQuestion: Question;
};

export type PerQuestionState = {
  readonly hintUsed: boolean;
  readonly skipped: boolean;
  readonly currentQuestion: Question;
  readonly elapsedMs: number | null;
};

export type PenaltyPopup = {
  readonly id: number;
  readonly label: "+10s" | "+30s";
};

export const CORRECT_ANIMATION_MS = 300;

function generateRandomSet(pokedex: readonly PokedexEntry[]): readonly SetQuestion[] {
  const items: SetQuestion[] = [];
  for (let i = 0; i < SET_SIZE; i++) {
    const entry = pickRandomPokemon(pokedex);
    items.push({ entry, initialQuestion: generateQuestion(entry) });
  }
  return items;
}

function writeUrl(items: readonly SetQuestion[]): void {
  if (typeof window === "undefined") return;
  const encoded = encodeSet(
    items.map(({ entry, initialQuestion }) => ({
      pokedexNumber: entry[0],
      question: initialQuestion,
    })),
  );
  window.history.replaceState(null, "", window.location.pathname + "?q=" + encoded);
}

export function createTimeAttackStore(pokedex: readonly PokedexEntry[]) {
  const segmentedPokedex = segmentPokedex(pokedex);
  const nameSet = new Set(pokedex.map(([, name]) => name));

  let initialItems: readonly SetQuestion[];

  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q !== null) {
      const restored = decodeSet(q, pokedex);
      if (restored !== null) {
        initialItems = restored.map(({ entry, question }) => ({
          entry,
          initialQuestion: question,
        }));
      } else {
        initialItems = generateRandomSet(pokedex);
      }
    } else {
      initialItems = generateRandomSet(pokedex);
    }
  } else {
    initialItems = generateRandomSet(pokedex);
  }

  writeUrl(initialItems);

  let phase = $state<TimeAttackPhase>("start");
  let questions = $state<readonly SetQuestion[]>(initialItems);
  let currentIndex = $state(0);
  let perQuestion = $state<readonly PerQuestionState[]>(
    initialItems.map((it) => ({
      hintUsed: false,
      skipped: false,
      currentQuestion: it.initialQuestion,
      elapsedMs: null,
    })),
  );
  let rawInput = $state("");
  let error = $state<string | null>(null);
  let startTimeMs = $state<number | null>(null);
  let currentQuestionStartMs: number | null = null;
  let penaltyTotalMs = $state(0);
  let finalTotalMs = $state(0);
  let popups = $state<readonly PenaltyPopup[]>([]);
  let popupIdCounter = 0;
  let correctAnimation = $state(false);
  let correctTimeoutId: ReturnType<typeof setTimeout> | null = null;

  function advance(): void {
    const nowMs = performance.now();
    if (currentQuestionStartMs !== null) {
      updatePerQuestion(currentIndex, { elapsedMs: nowMs - currentQuestionStartMs });
    }
    if (currentIndex < SET_SIZE - 1) {
      currentIndex += 1;
      currentQuestionStartMs = nowMs;
      rawInput = "";
      error = null;
      return;
    }
    const elapsed = startTimeMs !== null ? nowMs - startTimeMs : 0;
    finalTotalMs = elapsed + penaltyTotalMs;
    phase = "result";
  }

  function clearCorrectTimeout(): void {
    if (correctTimeoutId !== null) {
      clearTimeout(correctTimeoutId);
      correctTimeoutId = null;
    }
    correctAnimation = false;
  }

  function pushPopup(label: PenaltyPopup["label"]): void {
    popupIdCounter += 1;
    popups = [...popups, { id: popupIdCounter, label }];
  }

  function updatePerQuestion(index: number, patch: Partial<PerQuestionState>): void {
    perQuestion = perQuestion.map((it, i) => (i === index ? { ...it, ...patch } : it));
  }

  return {
    get phase() {
      return phase;
    },
    get questions() {
      return questions;
    },
    get currentIndex() {
      return currentIndex;
    },
    get currentQuestion() {
      return perQuestion[currentIndex].currentQuestion;
    },
    get rawInput() {
      return rawInput;
    },
    get error() {
      return error;
    },
    get startTimeMs() {
      return startTimeMs;
    },
    get penaltyTotalMs() {
      return penaltyTotalMs;
    },
    get perQuestion() {
      return perQuestion;
    },
    get finalTotalMs() {
      return finalTotalMs;
    },
    get popups() {
      return popups;
    },
    get correctAnimation() {
      return correctAnimation;
    },

    handleStart(): void {
      const t = performance.now();
      startTimeMs = t;
      currentQuestionStartMs = t;
      phase = "playing";
    },

    onInputChange(value: string): void {
      if (correctAnimation) return;
      rawInput = value;
      error = null;
    },

    handleSubmit(): void {
      if (correctAnimation) return;
      const normalized = normalize(rawInput);
      const matchingAll = findMatchingEntries(
        segmentedPokedex,
        questions[currentIndex].initialQuestion,
      );
      const result = checkAnswer(normalized, nameSet, matchingAll);
      if (result.kind === "not-a-pokemon") {
        error = "未知のポケモンです";
        return;
      }
      if (result.kind === "incorrect") {
        error = "パターンにマッチしません";
        return;
      }
      error = null;
      correctAnimation = true;
      correctTimeoutId = setTimeout(() => {
        correctTimeoutId = null;
        correctAnimation = false;
        advance();
      }, CORRECT_ANIMATION_MS);
    },

    handleReveal(letterIndex: number): void {
      if (correctAnimation) return;
      const next = withRevealed(perQuestion[currentIndex].currentQuestion, letterIndex);
      updatePerQuestion(currentIndex, { currentQuestion: next, hintUsed: true });
      penaltyTotalMs += 10_000;
      pushPopup("+10s");
    },

    handleSkip(): void {
      if (correctAnimation) return;
      updatePerQuestion(currentIndex, { skipped: true });
      penaltyTotalMs += 30_000;
      pushPopup("+30s");
      advance();
    },

    handleRetry(): void {
      clearCorrectTimeout();
      const newItems = generateRandomSet(pokedex);
      questions = newItems;
      perQuestion = newItems.map((it) => ({
        hintUsed: false,
        skipped: false,
        currentQuestion: it.initialQuestion,
        elapsedMs: null,
      }));
      currentIndex = 0;
      rawInput = "";
      error = null;
      startTimeMs = null;
      currentQuestionStartMs = null;
      penaltyTotalMs = 0;
      finalTotalMs = 0;
      popups = [];
      writeUrl(newItems);
      phase = "start";
    },

    dismissPopup(id: number): void {
      popups = popups.filter((p) => p.id !== id);
    },

    getMatchingEntriesFor(index: number): readonly PokedexEntry[] {
      return findMatchingEntries(segmentedPokedex, questions[index].initialQuestion);
    },
  };
}
