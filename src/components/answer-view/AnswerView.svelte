<script lang="ts">
  import type { Question, PokedexEntry } from '../../lib/quiz/question.ts';
  import PokedexLink from './PokedexLink.svelte';

  interface Props {
    question: Question;
    matchingEntries: readonly PokedexEntry[];
    wasCorrect: boolean;
    matchedEntry: PokedexEntry | null;
    onnext: () => void;
  }

  let { question, matchingEntries, wasCorrect, matchedEntry, onnext }: Props = $props();
</script>

<header class="topbar">
  <span class="brand">Pokeblank</span>
</header>

<main class="result-body">
  <div class="verdict">
    <span class="verdict-label" class:verdict-ok={wasCorrect} class:verdict-pass={!wasCorrect}>
      {#if wasCorrect}
        <!-- Lucide check, stroke 2 -->
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>正解</span>
      {:else}
        <span>Skipped</span>
      {/if}
    </span>

    <div class="word">
      {#each question.letters as letter}
        {#if letter.kind === 'revealed'}
          <span class="tile tile-shown">{letter.value}</span>
        {:else}
          <span class="tile tile-hidden" aria-hidden="true">◯</span>
        {/if}
      {/each}
    </div>
  </div>

  <section class="matches">
    <header class="matches-head">
      <span class="matches-title">該当ポケモン</span>
      <span class="matches-count">{matchingEntries.length}</span>
    </header>
    <ul class="matches-list">
      {#each matchingEntries as entry (entry[0])}
        <li>
          <PokedexLink
            {entry}
            isPicked={matchedEntry !== null && matchedEntry[0] === entry[0]}
          />
        </li>
      {/each}
    </ul>
  </section>
</main>

<button class="btn btn-ghost next-fab" onclick={onnext} aria-label="次の問題へ" autofocus>
  <span>次の問題</span>
  <!-- Lucide arrow-right, stroke 1.5 -->
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
</button>

<style>
  .result-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: var(--space-5);
    padding-bottom: calc(var(--space-4) + 44px + var(--space-3));
    gap: var(--space-6);
    overflow: hidden;
  }

  .verdict {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding-top: var(--space-4);
    flex-shrink: 0;
  }

  .verdict-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-caption-size);
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: var(--font-weight-semibold);
  }

  .verdict-ok { color: var(--color-success-fg); }
  .verdict-pass { color: var(--color-text-subtle); }

  .matches {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .matches-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: var(--space-3) var(--space-1) var(--space-2);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .matches-title {
    font-size: var(--text-caption-size);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-subtle);
  }

  .matches-count {
    font-size: var(--text-body-size);
    font-weight: var(--font-weight-semibold);
    font-feature-settings: "tnum";
    color: var(--color-text-muted);
  }

  .matches-list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1 1 auto;
  }

  .matches-list li + li {
    border-top: 1px solid var(--color-border);
  }

  .matches-list::-webkit-scrollbar { width: 8px; }
  .matches-list::-webkit-scrollbar-track { background: transparent; }
  .matches-list::-webkit-scrollbar-thumb {
    background: var(--color-border-strong);
    border-radius: 9999px;
    border: 2px solid var(--color-bg);
  }

  .next-fab {
    position: absolute;
    right: var(--space-4);
    bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    height: 44px;
    padding: 0 var(--space-4);
    font-size: var(--text-body-size);
    font-weight: var(--font-weight-medium);
  }
</style>
