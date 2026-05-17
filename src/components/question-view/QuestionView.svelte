<script lang="ts">
  import { untrack } from 'svelte';
  import type { Question } from '../../lib/quiz/question.ts';
  import InputField from './InputField.svelte';
  import Letter from './Letter.svelte';

  interface Props {
    question: Question;
    rawInput: string;
    error: string | null;
    hintIndices: Set<number>;
    oninputchange: (value: string) => void;
    onsubmit: () => void;
    onpass: () => void;
    onreveal: (index: number) => void;
  }

  let {
    question,
    rawInput,
    error,
    hintIndices,
    oninputchange,
    onsubmit,
    onpass,
    onreveal,
  }: Props = $props();

  let shakeKey = $state(0);

  $effect(() => {
    if (error) {
      untrack(() => { shakeKey += 1; });
    }
  });

  const canSubmit = $derived(rawInput.trim().length > 0);
</script>

<main class="stage">
  <div class="answer-zone field" data-state={error ? 'error' : undefined}>
    <div class="input-row">
      <InputField
        value={rawInput}
        onchange={oninputchange}
        {onsubmit}
      />
      <button
        class="btn btn-primary submit-btn"
        onclick={onsubmit}
        disabled={!canSubmit}
        aria-label="解答を送信"
      >
        <!-- Lucide send, stroke 1.5 -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2 11 13"></path>
          <path d="M22 2 15 22l-4-9-9-4 20-7Z"></path>
        </svg>
      </button>
    </div>

    <p class="answer-feedback" class:is-shown={!!error} role="alert" aria-live="polite">
      {#if error}
        <!-- Lucide alert-circle, stroke 2 -->
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{error}</span>
      {:else}
        &nbsp;
      {/if}
    </p>
  </div>

  <div class="word-wrap">
    {#key shakeKey}
      <div class="word" class:word-shake={error !== null}>
        {#each question.letters as letter, i}
          <Letter
            {letter}
            index={i}
            isHint={hintIndices.has(i)}
            {onreveal}
          />
        {/each}
      </div>
    {/key}
  </div>

  <p class="tip">
    <!-- Lucide lightbulb, stroke 1.5 -->
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
    隠れてる文字をタップするとヒントが見れるよ
  </p>
</main>

<header class="topbar">
  <span class="brand">Pokéblank</span>
  <button class="btn btn-ghost btn-sm" onclick={onpass} aria-label="Skip">
    <!-- Lucide skip-forward, stroke 1.5 -->
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5 4 15 12 5 20 5 4"></polygon>
      <line x1="19" y1="4" x2="19" y2="20"></line>
    </svg>
    <span>Skip</span>
  </button>
</header>

<style>
  .stage {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: var(--space-5);
    gap: var(--space-6);
    justify-content: flex-start;
  }

  .word-wrap {
    order: -1;
    flex: 0 0 auto;
    padding-top: var(--space-6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .answer-zone {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 0 0 auto;
  }

  .input-row {
    display: flex;
    gap: var(--space-2);
    align-items: stretch;
  }

  .submit-btn {
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    padding: 0;
  }

  .answer-feedback {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
    width: 100%;
    font-size: var(--text-body-size);
    line-height: var(--text-body-lh);
    color: var(--color-error-fg);
    visibility: hidden;
    min-height: 20px;
  }

  .answer-feedback.is-shown {
    visibility: visible;
  }

  .answer-feedback svg {
    flex-shrink: 0;
  }

  .tip {
    margin: auto 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: var(--text-caption-size);
    line-height: var(--text-caption-lh);
    color: var(--color-text-subtle);
  }
</style>
