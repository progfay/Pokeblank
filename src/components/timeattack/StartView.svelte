<script lang="ts">
  import { Play, Share } from '@lucide/svelte';
  import ShareModal from './ShareModal.svelte';
  import Logo from '../Logo.svelte';

  const base = import.meta.env.BASE_URL;

  interface Props {
    onstart: () => void;
  }

  let { onstart }: Props = $props();

  let shareModalUrl = $state<string | null>(null);

  async function handleShare() {
    const url = window.location.href;
    const text = `Pokéblank Time Attack\nこの 5 問でタイムを競おう\n${url}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Pokéblank', text });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* fallback modal still allows manual copy */
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

<main class="start-stage">
  <div class="start-content">
    <h2 class="start-title">Time Attack</h2>

    <button class="btn btn-primary btn-lg start-btn" onclick={onstart}>
      <Play size={18} strokeWidth={1.5} aria-hidden="true" />
      Start
    </button>

    <button class="btn btn-secondary share-btn" onclick={handleShare}>
      <Share size={16} strokeWidth={1.5} aria-hidden="true" />
      Share
    </button>
  </div>
</main>

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

  .start-stage {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-5);
  }

  .start-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
  }

  .start-title {
    margin: 0;
    font-size: var(--text-display-size);
    line-height: var(--text-display-lh);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--tracking-tight);
  }

  .start-btn {
    min-width: 200px;
  }

  .share-btn {
    height: 40px;
    min-width: 200px;
  }
</style>
