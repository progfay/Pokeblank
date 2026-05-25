<script lang="ts">
  import pokedexData from './data/pokedex.json';
  import QuestionView from './components/question-view/QuestionView.svelte';
  import StartView from './components/timeattack/StartView.svelte';
  import Timer from './components/timeattack/Timer.svelte';
  import ResultView from './components/timeattack/ResultView.svelte';
  import { createTimeAttackStore } from './lib/stores/timeattack.svelte.ts';
  import type { PokedexEntry } from './lib/quiz/question.ts';
  import { Check } from '@lucide/svelte';

  const pokedex: readonly PokedexEntry[] = pokedexData.map((name, i) => [i + 1, name] as const);
  const store = createTimeAttackStore(pokedex);
</script>

<div class="screen">
  {#if store.phase === 'start'}
    <StartView onstart={() => store.handleStart()} />
  {:else if store.phase === 'playing'}
    <QuestionView
      question={store.currentQuestion}
      rawInput={store.rawInput}
      error={store.error}
      oninputchange={(v) => store.onInputChange(v)}
      onsubmit={() => store.handleSubmit()}
      onpass={() => store.handleSkip()}
      onreveal={(i) => store.handleReveal(i)}
    />
    <Timer
      startTimeMs={store.startTimeMs}
      penaltyTotalMs={store.penaltyTotalMs}
      currentIndex={store.currentIndex}
      totalQuestions={store.questions.length}
      popups={store.popups}
      ondismiss={(id) => store.dismissPopup(id)}
    />
    {#if store.correctAnimation}
      <div class="correct-pop" aria-hidden="true">
        <Check size={96} strokeWidth={3} />
      </div>
    {/if}
  {:else}
    <ResultView
      finalTotalMs={store.finalTotalMs}
      questions={store.questions}
      perQuestion={store.perQuestion}
      getMatchingEntries={(i) => store.getMatchingEntriesFor(i)}
      onretry={() => store.handleRetry()}
    />
  {/if}
</div>

<style>
  .correct-pop {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    color: var(--color-success-fg);
    z-index: 20;
    animation: correct-pop 300ms var(--ease-out) forwards;
    filter: drop-shadow(0 0 24px color-mix(in oklab, var(--color-success-fg) 60%, transparent));
  }

  @keyframes correct-pop {
    0% {
      transform: scale(0.6);
      opacity: 0;
    }
    35% {
      transform: scale(1.15);
      opacity: 1;
    }
    65% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>
