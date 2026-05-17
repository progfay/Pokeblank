<script lang="ts">
  import pokedexData from './data/pokedex.json';
  import specialCharsData from './data/special-chars.json';
  import AnswerView from './components/answer-view/AnswerView.svelte';
  import QuestionView from './components/question-view/QuestionView.svelte';
  import { createQuizStore } from './lib/stores/quiz.svelte.ts';
  import type { PokedexEntry } from './lib/quiz/question.ts';

  const pokedex = pokedexData as readonly PokedexEntry[];
  const specialChars = specialCharsData as readonly string[];
  const quiz = createQuizStore(pokedex, specialChars);
</script>

{#if quiz.mode === 'question'}
  <QuestionView
    question={quiz.question}
    {specialChars}
    rawInput={quiz.rawInput}
    error={quiz.error}
    oninputchange={(v) => quiz.onInputChange(v)}
    onsubmit={() => quiz.handleSubmit()}
    onpass={() => quiz.handlePass()}
    onreveal={(i) => quiz.handleReveal(i)}
  />
{:else}
  <AnswerView
    matchingEntries={quiz.matchingEntries}
    wasCorrect={quiz.wasCorrect}
    onnext={() => quiz.handleNext()}
  />
{/if}
