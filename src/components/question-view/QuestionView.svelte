<script lang="ts">
  import type { Question } from '../../lib/quiz/question.ts';
  import InputField from './InputField.svelte';
  import Letter from './Letter.svelte';
  import SpecialKeyboard from './SpecialKeyboard.svelte';

  interface Props {
    question: Question;
    specialChars: readonly string[];
    rawInput: string;
    error: string | null;
    oninputchange: (value: string) => void;
    onsubmit: () => void;
    onpass: () => void;
    onreveal: (index: number) => void;
  }

  let {
    question,
    specialChars,
    rawInput,
    error,
    oninputchange,
    onsubmit,
    onpass,
    onreveal,
  }: Props = $props();
</script>

<div class="view">
  <h1 class="title">ポケブランク</h1>

  <div class="letters">
    {#each question.letters as letter, i}
      <Letter {letter} index={i} {onreveal} />
    {/each}
  </div>

  <InputField
    value={rawInput}
    {error}
    onchange={oninputchange}
    {onsubmit}
  />

  <SpecialKeyboard
    chars={specialChars}
    onpress={(char) => oninputchange(rawInput + char)}
  />

  <div class="actions">
    <button class="btn-submit" onclick={onsubmit}>答える</button>
    <button class="btn-pass" onclick={onpass}>パス</button>
  </div>
</div>

<style>
  .view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 2rem;
  }

  .title {
    font-size: 1.5rem;
    text-align: center;
    color: var(--color-primary);
  }

  .letters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-submit,
  .btn-pass {
    flex: 1;
    padding: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    border-radius: var(--radius);
    cursor: pointer;
    border: none;
  }

  .btn-submit {
    background: var(--color-primary);
    color: white;
  }

  .btn-pass {
    background: var(--color-surface);
    color: var(--color-muted);
    border: 1px solid var(--color-border);
  }
</style>
