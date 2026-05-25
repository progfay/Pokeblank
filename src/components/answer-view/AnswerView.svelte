<script lang="ts">
  import type { Question, PokedexEntry } from '../../lib/quiz/question.ts';
  import PokedexLink from './PokedexLink.svelte';
  import { Share, ArrowRight, Check } from '@lucide/svelte';
  import Logo from '../Logo.svelte';

  const base = import.meta.env.BASE_URL;

  interface Props {
    question: Question;
    matchingEntries: readonly PokedexEntry[];
    wasCorrect: boolean;
    matchedEntry: PokedexEntry | null;
    onnext: () => void;
  }

  let { question, matchingEntries, wasCorrect, matchedEntry, onnext }: Props = $props();

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  function handleShare() {
    const pattern = question.letters.map(l => l.kind === 'revealed' ? l.value : '◯').join('');
    const text = `このポケモンは？\n\n${pattern}\n\n${window.location.href}`;
    navigator.share({ title: 'Pokéblank', text, url: window.location.href });
  }
</script>

{#if canShare}
  <button class="btn btn-ghost share-fab" onclick={handleShare} aria-label="共有">
    <Share size={16} strokeWidth={1.5} aria-hidden="true" />
  </button>
{/if}

<button class="btn btn-ghost next-fab" onclick={onnext} aria-label="次の問題へ">
  <span>Next</span>
  <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
</button>

<header class="topbar">
  <h1 class="brand">
    <a href={base}>
      <Logo />
      Pokéblank
    </a>
  </h1>
</header>

<main class="result-body">
  <div class="verdict">
    <span class="verdict-label" class:verdict-ok={wasCorrect} class:verdict-pass={!wasCorrect}>
      {#if wasCorrect}
        <Check size={12} strokeWidth={2} aria-hidden="true" />
        <span>Correct</span>
      {:else}
        <span>Skipped</span>
      {/if}
    </span>

    <div class="word">
      {#each question.letters as letter}
        {#if letter.kind === 'revealed'}
          <span class="tile tile-shown">{letter.value}</span>
        {:else if letter.kind === 'hint-revealed'}
          <span class="tile tile-hint">{letter.value}</span>
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

<style>
  .result-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: var(--space-5);
    padding-bottom: calc(var(--space-4) + 44px + var(--space-3) + env(safe-area-inset-bottom, 0px));
    gap: var(--space-6);
    overflow: hidden;
  }

  .verdict {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding-top: 0;
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

  .next-fab {
    position: absolute;
    right: var(--space-4);
    bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    height: 44px;
    padding: 0 var(--space-4);
    font-size: var(--text-body-size);
    font-weight: var(--font-weight-medium);
  }

  .share-fab {
    position: absolute;
    left: var(--space-4);
    bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    width: 44px;
    height: 44px;
    padding: 0;
  }
</style>
