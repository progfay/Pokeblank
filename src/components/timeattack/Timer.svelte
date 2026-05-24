<script lang="ts">
  import { onMount } from 'svelte';
  import type { PenaltyPopup } from '../../lib/stores/timeattack.svelte.ts';

  interface Props {
    startTimeMs: number | null;
    penaltyTotalMs: number;
    currentIndex: number;
    totalQuestions: number;
    popups: readonly PenaltyPopup[];
    ondismiss: (id: number) => void;
  }

  let { startTimeMs, penaltyTotalMs, currentIndex, totalQuestions, popups, ondismiss }: Props =
    $props();

  let now = $state(typeof performance !== 'undefined' ? performance.now() : 0);

  onMount(() => {
    let rafId = 0;
    function tick() {
      now = performance.now();
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  });

  const displayMs = $derived(
    startTimeMs !== null ? (now - startTimeMs) + penaltyTotalMs : penaltyTotalMs
  );

  function formatTime(ms: number): string {
    const totalCs = Math.max(0, Math.floor(ms / 10));
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }
</script>

<div class="timer-overlay" aria-live="off">
  <div class="timer-progress">{currentIndex + 1} / {totalQuestions}</div>
  <div class="timer-value" aria-label="経過時間">{formatTime(displayMs)}</div>
  <div class="popups" aria-hidden="true">
    {#each popups as p (p.id)}
      <span class="popup" onanimationend={() => ondismiss(p.id)}>{p.label}</span>
    {/each}
  </div>
</div>

<style>
  .timer-overlay {
    position: absolute;
    top: env(safe-area-inset-top, 0);
    left: 50%;
    transform: translateX(-50%);
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 5;
    gap: var(--space-2);
  }

  .timer-progress {
    font-size: var(--text-caption-size);
    line-height: 1;
    color: var(--color-text-subtle);
    font-family: var(--font-mono);
    font-feature-settings: "tnum";
    letter-spacing: 0.08em;
  }

  .timer-value {
    font-size: var(--text-body-lg-size);
    line-height: 1;
    font-weight: var(--font-weight-semibold);
    font-family: var(--font-mono);
    font-feature-settings: "tnum";
    color: var(--color-text);
    letter-spacing: 0.04em;
  }

  .popups {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
  }

  .popup {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: var(--color-warning-bg);
    color: var(--color-warning-fg);
    border: 1px solid var(--color-warning-border);
    font-size: var(--text-caption-size);
    font-weight: var(--font-weight-semibold);
    font-family: var(--font-mono);
    line-height: 1.4;
    animation: popup-fade 800ms linear forwards;
    white-space: nowrap;
  }

  @keyframes popup-fade {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    15% {
      transform: translateY(-3px);
      opacity: 1;
    }
    100% {
      transform: translateY(-24px);
      opacity: 0;
    }
  }
</style>
