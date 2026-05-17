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

  let vh = $state(
    typeof window !== 'undefined'
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 0
  );

  $effect(() => {
    const vv = window.visualViewport;
    const update = () => {
      vh = vv?.height ?? window.innerHeight;
    };
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  });
</script>

<div class="screen" style={vh ? `height: ${vh}px` : undefined}>
  {#if quiz.mode === 'question'}
    <QuestionView
      question={quiz.question}
      rawInput={quiz.rawInput}
      error={quiz.error}
      hintIndices={quiz.hintIndices}
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
