<script lang="ts">
  import { untrack } from 'svelte';
  import type { Question } from '../../lib/quiz/question.ts';
  import InputField from './InputField.svelte';
  import Letter from './Letter.svelte';
  import { Send, AlertCircle, Lightbulb, SkipForward } from '@lucide/svelte';
  import Logo from '../Logo.svelte';

  const base = import.meta.env.BASE_URL;

  interface Props {
    question: Question;
    rawInput: string;
    error: string | null;
    oninputchange: (value: string) => void;
    onsubmit: () => void;
    onpass: () => void;
    onreveal: (index: number) => void;
  }

  let {
    question,
    rawInput,
    error,
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
        <Send size={18} strokeWidth={1.5} />
      </button>
    </div>

    <p class="answer-feedback" class:is-shown={!!error} role="alert" aria-live="polite">
      {#if error}
        <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
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
            {onreveal}
          />
        {/each}
      </div>
    {/key}
  </div>

  <p class="tip">
    <Lightbulb size={12} strokeWidth={1.5} color="var(--color-info-fg)" aria-hidden="true" />
    隠れてる文字をタップするとヒントが見れるよ
  </p>
</main>

<header class="topbar">
  <h1 class="brand">
    <a href={base}>
      <Logo />
      Pokéblank
    </a>
  </h1>
  <button class="btn btn-ghost btn-sm" onclick={onpass} aria-label="Skip">
    <SkipForward size={14} strokeWidth={1.5} />
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
    order: -2;
    flex: 0 0 auto;
    padding-top: var(--space-6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .answer-zone {
    order: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 0 0 auto;
    margin-top: auto;
    padding-bottom: env(safe-area-inset-bottom, 0px);
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

  .answer-feedback :global(svg) {
    flex-shrink: 0;
  }

  .tip {
    order: -1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: var(--text-caption-size);
    line-height: var(--text-caption-lh);
    color: var(--color-text-muted);
  }

  h1.brand {
    margin: 0;

    a {
      color: inherit;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.4em;
    }
  }
</style>
