import { normalize } from '../text/normalize.ts';
import { validate } from '../text/validation.ts';
import {
  generateQuestion,
  pickRandomPokemon,
  type PokedexEntry,
  type Question,
} from '../quiz/question.ts';
import { checkAnswer } from '../quiz/answer.ts';
import { findAllMatchingPokedexEntries } from '../quiz/matching.ts';

export function createQuizStore(pokedex: readonly PokedexEntry[], specialChars: readonly string[]) {
  function newRound(): Question {
    return generateQuestion(pickRandomPokemon(pokedex));
  }

  let mode = $state<'question' | 'answer'>('question');
  let question = $state<Question>(newRound());
  let rawInput = $state('');
  let error = $state<string | null>(null);
  let matchingEntries = $state<readonly PokedexEntry[]>([]);
  let wasCorrect = $state(false);
  let hintIndices = $state(new Set<number>());
  let matchedEntry = $state<PokedexEntry | null>(null);

  return {
    get mode() { return mode; },
    get question() { return question; },
    get rawInput() { return rawInput; },
    get error() { return error; },
    get matchingEntries() { return matchingEntries; },
    get wasCorrect() { return wasCorrect; },
    get hintIndices() { return hintIndices; },
    get matchedEntry() { return matchedEntry; },

    onInputChange(value: string) {
      rawInput = value;
      error = null;
    },

    handleSubmit() {
      const normalized = normalize(rawInput);
      const validated = validate(normalized, specialChars);
      if (validated === null) {
        error = 'カタカナで入力してください';
        return;
      }
      error = null;
      matchingEntries = findAllMatchingPokedexEntries(pokedex, question);
      const result = checkAnswer(validated, matchingEntries);
      wasCorrect = result.kind === 'correct';
      matchedEntry = result.kind === 'correct' ? result.matchedPokemon : null;
      mode = 'answer';
    },

    handlePass() {
      matchingEntries = findAllMatchingPokedexEntries(pokedex, question);
      wasCorrect = false;
      matchedEntry = null;
      mode = 'answer';
    },

    handleReveal(index: number) {
      if (hintIndices.has(index)) return;
      const next = new Set(hintIndices);
      next.add(index);
      hintIndices = next;
    },

    handleNext() {
      question = newRound();
      rawInput = '';
      error = null;
      matchingEntries = [];
      wasCorrect = false;
      hintIndices = new Set();
      matchedEntry = null;
      mode = 'question';
    },
  };
}
