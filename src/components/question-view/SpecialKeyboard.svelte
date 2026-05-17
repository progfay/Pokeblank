<script lang="ts">
  interface Props {
    chars: readonly string[];
    onpress: (char: string) => void;
  }

  let { chars, onpress }: Props = $props();

  const SHOWN_CHARS = new Set(['♀', '♂']);
  const visibleChars = $derived(chars.filter((c) => SHOWN_CHARS.has(c)));
</script>

{#if visibleChars.length > 0}
  <div class="keypad">
    {#each visibleChars as char}
      <button class="key" onclick={() => onpress(char)}>{char}</button>
    {/each}
  </div>
{/if}

<style>
  .keypad {
    display: flex;
    gap: var(--space-2);
    justify-content: center;
  }

  .key {
    min-width: 44px;
    height: 36px;
    padding: 0 var(--space-3);
    font-size: var(--text-body-lg-size);
    font-family: inherit;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out),
                border-color var(--duration-fast) var(--ease-out);
  }

  .key:hover {
    background: var(--color-surface-muted);
    border-color: var(--color-border-strong);
  }
</style>
