import { normalize } from '../text/normalize.ts';
import {
  generateQuestion,
  pickRandomPokemon,
  type PokedexEntry,
  type Question,
} from '../quiz/question.ts';
import { checkAnswer } from '../quiz/answer.ts';
import { findAllMatchingPokedexEntries, findMatchingEntries, segmentPokedex } from '../quiz/matching.ts';
import { withRevealed } from '../quiz/question.ts';

export function createQuizStore(pokedex: readonly PokedexEntry[]) {
  const segmentedPokedex = segmentPokedex(pokedex);
  const nameSet = new Set(pokedex.map(([, name]) => name));

  function newRound(): Question {
    return generateQuestion(pickRandomPokemon(pokedex));
  }

  let mode = $state<'question' | 'answer'>('question');
  let question = $state<Question>(newRound());
  let rawInput = $state('');
  let error = $state<string | null>(null);
  let matchingEntries = $state<readonly PokedexEntry[]>([]);
  let wasCorrect = $state(false);
  let matchedEntry = $state<PokedexEntry | null>(null);

  return {
    get mode() { return mode; },
    get question() { return question; },
    get rawInput() { return rawInput; },
    get error() { return error; },
    get matchingEntries() { return matchingEntries; },
    get wasCorrect() { return wasCorrect; },
    get matchedEntry() { return matchedEntry; },

    onInputChange(value: string) {
      rawInput = value;
      error = null;
    },

    handleSubmit() {
      const normalized = normalize(rawInput);
      const { all, strict: strictEntries } = findMatchingEntries(segmentedPokedex, question);
      const result = checkAnswer(normalized, nameSet, strictEntries);
      if (result.kind === 'not-a-pokemon') {
        error = '未知のポケモンです';
        return;
      }
      if (result.kind === 'incorrect') {
        error = 'パターンにマッチしません';
        return;
      }
      error = null;
      matchingEntries = all;
      wasCorrect = true;
      matchedEntry = result.matchedPokemon;
      mode = 'answer';
    },

    handlePass() {
      matchingEntries = findAllMatchingPokedexEntries(segmentedPokedex, question);
      wasCorrect = false;
      matchedEntry = null;
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
      matchedEntry = null;
      mode = 'question';
    },
  };
}
