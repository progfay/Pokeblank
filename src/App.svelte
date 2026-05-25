<script lang="ts">
  import pokedexData from './data/pokedex.json';
  import AnswerView from './components/answer-view/AnswerView.svelte';
  import QuestionView from './components/question-view/QuestionView.svelte';
  import { createQuizStore } from './lib/stores/quiz.svelte.ts';
  import type { PokedexEntry } from './lib/quiz/question.ts';

  const pokedex: readonly PokedexEntry[] = pokedexData.map((name, i) => [i + 1, name] as const);
  const quiz = createQuizStore(pokedex);
</script>

<div class="screen">
  {#if quiz.mode === 'question'}
    <QuestionView
      question={quiz.question}
      rawInput={quiz.rawInput}
      error={quiz.error}
      oninputchange={(v) => quiz.onInputChange(v)}
      onsubmit={() => quiz.handleSubmit()}
      onpass={() => quiz.handlePass()}
      onreveal={(i) => quiz.handleReveal(i)}
    />
  {:else}
    <AnswerView
      question={quiz.question}
      matchingEntries={quiz.matchingEntries}
      wasCorrect={quiz.wasCorrect}
      matchedEntry={quiz.matchedEntry}
      onnext={() => quiz.handleNext()}
    />
  {/if}
</div>
