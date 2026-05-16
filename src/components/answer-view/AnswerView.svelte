<script lang="ts">
  import type { PokedexEntry } from '../../lib/quiz/question.ts';
  import PokedexLink from './PokedexLink.svelte';

  interface Props {
    matchingEntries: readonly PokedexEntry[];
    wasCorrect: boolean;
    onnext: () => void;
  }

  let { matchingEntries, wasCorrect, onnext }: Props = $props();
</script>

<div class="view">
  <div class="result" class:correct={wasCorrect} class:incorrect={!wasCorrect}>
    {wasCorrect ? '正解！' : 'パス'}
  </div>

  <div class="entries">
    <p class="label">該当ポケモン（{matchingEntries.length} 体）</p>
    <ul>
      {#each matchingEntries as entry}
        <li><PokedexLink {entry} /></li>
      {/each}
    </ul>
  </div>

  <button class="btn-next" onclick={onnext}>次の問題へ</button>
</div>

<style>
  .view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 2rem;
  }

  .result {
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    padding: 1rem;
    border-radius: var(--radius);
  }

  .correct {
    background: #1a4a2e;
    color: #4ade80;
  }

  .incorrect {
    background: var(--color-surface);
    color: var(--color-muted);
  }

  .label {
    font-size: 0.85rem;
    color: var(--color-muted);
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-next {
    padding: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
  }
</style>
