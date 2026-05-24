<script lang="ts">
  import { Copy, X, Check } from '@lucide/svelte';

  interface Props {
    url: string;
    onclose: () => void;
  }

  let { url, onclose }: Props = $props();

  let copied = $state(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      // ignore
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="modal-overlay">
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="share-modal-title"
    tabindex="-1"
  >
    <header class="modal-head">
      <h2 id="share-modal-title" class="modal-title">URL を共有</h2>
      <button class="btn btn-ghost btn-sm modal-close" onclick={onclose} aria-label="閉じる">
        <X size={16} strokeWidth={1.5} />
      </button>
    </header>
    <p class="modal-desc">URL はクリップボードにコピー済みです。コピーできなかった場合は下のボタンから再度コピーしてください。</p>
    <div class="url-row">
      <input class="input url-input" type="text" value={url} readonly />
      <button class="btn btn-secondary" onclick={handleCopy} aria-label="URL をコピー">
        {#if copied}
          <Check size={16} strokeWidth={2} />
        {:else}
          <Copy size={16} strokeWidth={1.5} />
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--color-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-5);
    z-index: 100;
  }

  .modal {
    width: 100%;
    max-width: 420px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .modal-title {
    margin: 0;
    font-size: var(--text-h3-size);
    line-height: var(--text-h3-lh);
    font-weight: var(--font-weight-semibold);
  }

  .modal-close {
    width: 28px;
    padding: 0;
  }

  .modal-desc {
    margin: 0;
    font-size: var(--text-body-size);
    line-height: var(--text-body-lh);
    color: var(--color-text-muted);
  }

  .url-row {
    display: flex;
    gap: var(--space-2);
  }

  .url-input {
    height: 40px;
    font-size: var(--text-body-size);
    flex: 1;
  }
</style>
