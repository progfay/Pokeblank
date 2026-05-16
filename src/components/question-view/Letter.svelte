<script lang="ts">
  import type { Letter } from '../../lib/quiz/question.ts';

  interface Props {
    letter: Letter;
    index: number;
    onreveal: (index: number) => void;
  }

  let { letter, index, onreveal }: Props = $props();
</script>

{#if letter.kind === 'revealed'}
  <span class="letter revealed">{letter.value}</span>
{:else}
  <button
    class="letter masked"
    ondblclick={() => onreveal(index)}
    aria-label="ヒントを開示"
  >◯</button>
{/if}

<style>
  .letter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2.5rem;
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: var(--radius);
  }

  .revealed {
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .masked {
    color: var(--color-primary);
    background: var(--color-surface);
    border: 2px solid var(--color-primary);
    cursor: pointer;
    font-family: inherit;
    user-select: none;
    -webkit-user-select: none;
  }

  .masked:active {
    opacity: 0.7;
  }
</style>
