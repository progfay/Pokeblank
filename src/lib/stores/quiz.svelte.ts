import { normalize } from '../text/normalize.ts';
import { validate } from '../text/validation.ts';
import { MESSAGES } from '../constants/messages.ts';
import {
  generateQuestion,
  pickRandomPokemon,
  withRevealed,
  type PokedexEntry,
  type Question,
} from '../quiz/question.ts';
import { checkAnswer } from '../quiz/answer.ts';
import { findAllMatchingPokedexEntries } from '../quiz/matching.ts';

export function createQuizStore(pokedex: readonly PokedexEntry[], specialChars: readonly string[]) {
  function newRound(): Question {
    return generateQuestion(pickRandomPokemon(pokedex));
  }

  function resolveMatches() {
    return findAllMatchingPokedexEntries(pokedex, question);
  }

  let mode = $state<'question' | 'answer'>('question');
  let question = $state<Question>(newRound());
  let rawInput = $state('');
  let error = $state<string | null>(null);
  let matchingEntries = $state<readonly PokedexEntry[]>([]);
  let wasCorrect = $state(false);

  return {
    get mode() { return mode; },
    get question() { return question; },
    get rawInput() { return rawInput; },
    get error() { return error; },
    get matchingEntries() { return matchingEntries; },
    get wasCorrect() { return wasCorrect; },

    onInputChange(value: string) {
      rawInput = value;
      error = null;
    },

    handleSubmit() {
      const normalized = normalize(rawInput);
      const validated = validate(normalized, specialChars);
      if (validated === null) {
        error = MESSAGES.ERROR_INVALID_INPUT;
        return;
      }
      error = null;
      matchingEntries = resolveMatches();
      const result = checkAnswer(validated, matchingEntries);
      wasCorrect = result.kind === 'correct';
      mode = 'answer';
    },

    handlePass() {
      matchingEntries = resolveMatches();
      wasCorrect = false;
      mode = 'answer';
    },

    handleReveal(index: number) {
      question = withRevealed(question, index);
    },

    handleNext() {
      question = newRound();
      rawInput = '';
      error = null;
      matchingEntries = [];
      wasCorrect = false;
      mode = 'question';
    },
  };
}
