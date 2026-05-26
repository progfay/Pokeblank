<script lang="ts">
  import type { PokedexEntry } from '../../lib/quiz/question.ts';
  import type {
    SetQuestion,
    PerQuestionState,
  } from '../../lib/stores/timeattack.svelte.ts';
  import PokedexLink from '../answer-view/PokedexLink.svelte';
  import ShareModal from './ShareModal.svelte';
  import { Share, ArrowRight, SkipForward, Check, ChevronDown } from '@lucide/svelte';
  import Logo from '../Logo.svelte';

  const base = import.meta.env.BASE_URL;

  interface Props {
    finalTotalMs: number;
    questions: readonly SetQuestion[];
    perQuestion: readonly PerQuestionState[];
    getMatchingEntries: (index: number) => readonly PokedexEntry[];
    onretry: () => void;
  }

  let { finalTotalMs, questions, perQuestion, getMatchingEntries, onretry }: Props = $props();

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  let shareModalUrl = $state<string | null>(null);

  function formatTime(ms: number | null): string {
    if (ms === null) return '—';
    const totalCs = Math.max(0, Math.floor(ms / 10));
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  async function handleShare() {
    const url = window.location.href;
    const text = `Pokéblank Time Attack: ${formatTime(finalTotalMs)}\n${url}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Pokéblank', text, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may fail, modal still allows manual copy */
    }
    shareModalUrl = url;
  }
</script>

<header class="topbar">
  <h1 class="brand">
    <a href={base}>
      <Logo />
      Pokéblank
    </a>
  </h1>
</header>

<main class="result-stage">
  <section class="time-display">
    <span class="time-label">Total Time</span>
    <div class="time-value">{formatTime(finalTotalMs)}</div>
  </section>

  <ol class="question-list">
    {#each questions as q, i (i)}
      {@const pq = perQuestion[i]}
      <li class="question-item">
        <details>
          <summary class="qi-summary">
            <div class="qi-head">
              <span class="qi-num">Q{i + 1}</span>
              {#if pq.skipped}
                <span class="badge badge-skip">
                  <SkipForward size={11} strokeWidth={2} aria-hidden="true" />
                  Skipped
                </span>
              {:else}
                <span class="badge badge-ok">
                  <Check size={11} strokeWidth={2} aria-hidden="true" />
                  Cleared
                </span>
              {/if}
              <span class="qi-time">{formatTime(pq.elapsedMs)}</span>
              <span class="qi-chevron" aria-hidden="true">
                <ChevronDown size={16} strokeWidth={1.5} />
              </span>
            </div>

            <div class="qi-pattern word">
              {#each pq.currentQuestion.letters as letter}
                {#if letter.kind === 'revealed'}
                  <span class="tile tile-shown tile-sm">{letter.value}</span>
                {:else if letter.kind === 'hint-revealed'}
                  <span class="tile tile-hint tile-sm">{letter.value}</span>
                {:else}
                  <span class="tile tile-hidden tile-sm" aria-hidden="true">◯</span>
                {/if}
              {/each}
            </div>
          </summary>

          <ul class="qi-matches">
            {#each getMatchingEntries(i) as entry (entry[0])}
              <li>
                <PokedexLink {entry} isPicked={pq.answeredEntry !== null && entry[0] === pq.answeredEntry[0]} />
              </li>
            {/each}
          </ul>
        </details>
      </li>
    {/each}
  </ol>
</main>

<footer class="result-footer">
  {#if canShare}
    <button class="btn btn-ghost share-btn" onclick={handleShare} aria-label="共有">
      <Share size={16} strokeWidth={1.5} aria-hidden="true" />
    </button>
  {/if}
  <button class="btn btn-ghost retry-btn" onclick={onretry} aria-label="New Game">
    <span>New Game</span>
    <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
  </button>
</footer>

{#if shareModalUrl !== null}
  <ShareModal url={shareModalUrl} onclose={() => (shareModalUrl = null)} />
{/if}

<style>
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

  .result-stage {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: var(--space-5);
    padding-bottom: var(--space-5);
    gap: var(--space-5);
  }

  .time-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .time-label {
    font-size: var(--text-caption-size);
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--color-text-subtle);
    font-weight: var(--font-weight-semibold);
  }

  .time-value {
    font-size: 40px;
    line-height: 1;
    font-weight: var(--font-weight-semibold);
    font-family: var(--font-mono);
    font-feature-settings: "tnum";
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .question-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .question-item {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    overflow: hidden;
  }

  details > summary {
    list-style: none;
    cursor: pointer;
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  details > summary::-webkit-details-marker {
    display: none;
  }

  details > summary::marker {
    display: none;
    content: '';
  }

  .qi-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .qi-num {
    font-size: var(--text-caption-size);
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--color-text-subtle);
    font-weight: var(--font-weight-semibold);
    font-family: var(--font-mono);
    min-width: 28px;
  }

  .qi-time {
    margin-left: auto;
    font-size: var(--text-body-size);
    line-height: 1;
    font-weight: var(--font-weight-medium);
    font-family: var(--font-mono);
    font-feature-settings: "tnum";
    color: var(--color-text-muted);
  }

  .qi-chevron {
    display: inline-flex;
    color: var(--color-text-subtle);
    transition: transform var(--duration-base) var(--ease-out);
  }

  details[open] .qi-chevron {
    transform: rotate(180deg);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: var(--text-caption-size);
    line-height: 1.4;
    font-weight: var(--font-weight-semibold);
    border: 1px solid transparent;
  }

  .badge-ok {
    background: var(--color-success-bg);
    color: var(--color-success-fg);
    border-color: var(--color-success-border);
  }

  .badge-skip {
    background: var(--color-error-bg);
    color: var(--color-error-fg);
    border-color: var(--color-error-border);
  }

  .qi-pattern {
    margin: 0;
  }

  .qi-pattern :global(.tile-sm) {
    min-width: 36px;
    height: 44px;
    font-size: 22px;
  }

  .qi-matches {
    list-style: none;
    margin: 0;
    padding: 0 var(--space-4) var(--space-3);
    border-top: 1px solid var(--color-border);
  }

  .qi-matches li + li {
    border-top: 1px solid var(--color-border);
  }

  .result-footer {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
  }

  .share-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    flex-shrink: 0;
  }

  .retry-btn {
    height: 44px;
    padding: 0 var(--space-4);
    font-size: var(--text-body-size);
    font-weight: var(--font-weight-medium);
    margin-left: auto;
  }
</style>
