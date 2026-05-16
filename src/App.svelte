<script lang="ts">
  import pokedexData from './data/pokedex.json';
  import specialCharsData from './data/special-chars.json';
  import AnswerView from './components/answer-view/AnswerView.svelte';
  import QuestionView from './components/question-view/QuestionView.svelte';
  import { normalize } from './lib/text/normalize.ts';
  import { validate } from './lib/text/validation.ts';
  import {
    generateQuestion,
    pickRandomPokemon,
    withRevealed,
    type PokedexEntry,
    type Question,
  } from './lib/quiz/question.ts';
  import { checkAnswer } from './lib/quiz/answer.ts';
  import { findAllMatchingPokedexEntries } from './lib/quiz/matching.ts';

  const pokedex = pokedexData as readonly PokedexEntry[];
  const specialChars = specialCharsData as readonly string[];

  function newRound() {
    const entry = pickRandomPokemon(pokedex);
    return { question: generateQuestion(entry) };
  }

  const initial = newRound();

  let mode = $state<'question' | 'answer'>('question');
  let question = $state<Question>(initial.question);
  let rawInput = $state('');
  let error = $state<string | null>(null);
  let matchingEntries = $state<readonly PokedexEntry[]>([]);
  let wasCorrect = $state(false);

  function handleSubmit() {
    const normalized = normalize(rawInput);
    const validated = validate(normalized, specialChars);
    if (validated === null) {
      error = 'カタカナで入力してください';
      return;
    }
    error = null;

    const matches = findAllMatchingPokedexEntries(pokedex, question);
    matchingEntries = matches;

    const result = checkAnswer(validated, matches);
    wasCorrect = result.kind === 'correct';
    mode = 'answer';
  }

  function handlePass() {
    matchingEntries = findAllMatchingPokedexEntries(pokedex, question);
    wasCorrect = false;
    mode = 'answer';
  }

  function handleReveal(index: number) {
    question = withRevealed(question, index);
  }

  function handleNext() {
    const next = newRound();
    question = next.question;
    rawInput = '';
    error = null;
    matchingEntries = [];
    wasCorrect = false;
    mode = 'question';
  }
</script>

{#if mode === 'question'}
  <QuestionView
    {question}
    {specialChars}
    {rawInput}
    {error}
    oninputchange={(v) => { rawInput = v; error = null; }}
    onsubmit={handleSubmit}
    onpass={handlePass}
    onreveal={handleReveal}
  />
{:else}
  <AnswerView
    {matchingEntries}
    {wasCorrect}
    onnext={handleNext}
  />
{/if}
