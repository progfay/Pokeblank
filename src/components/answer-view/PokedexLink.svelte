<script lang="ts">
  import type { PokedexEntry } from '../../lib/quiz/question.ts';
  import { pokedexUrl } from '../../lib/pokemon/pokedex-url.ts';
  import { ExternalLink } from '@lucide/svelte';

  interface Props {
    entry: PokedexEntry;
    isPicked: boolean;
  }

  let { entry, isPicked }: Props = $props();

  const url = $derived(pokedexUrl(entry[0]));
  const num = $derived(String(entry[0]).padStart(4, '0'));
</script>

<a class="match-row" class:match-row-picked={isPicked} href={url} target="_blank" rel="noreferrer noopener">
  <span class="match-num">{num}</span>
  <span class="match-name">{entry[1]}</span>
  <span class="match-ext" aria-hidden="true">
    <ExternalLink size={13} strokeWidth={1.5} />
  </span>
</a>

<style>
  .match-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-1);
    color: var(--color-text);
    text-decoration: none;
    transition: background-color var(--duration-fast) var(--ease-out);
  }

  .match-row:hover {
    background: var(--color-surface-muted);
  }

  .match-num {
    font-family: var(--font-mono);
    font-size: var(--text-caption-size);
    line-height: var(--text-caption-lh);
    color: var(--color-text-subtle);
    font-feature-settings: "tnum";
    min-width: 36px;
  }

  .match-name {
    font-size: var(--text-body-lg-size);
    line-height: var(--text-body-lg-lh);
    font-weight: var(--font-weight-medium);
  }

  .match-row-picked .match-name {
    color: var(--color-success-fg);
  }

  .match-ext {
    color: var(--color-text-subtle);
    display: inline-flex;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .match-row:hover .match-ext {
    color: var(--color-accent-hover);
  }
</style>
