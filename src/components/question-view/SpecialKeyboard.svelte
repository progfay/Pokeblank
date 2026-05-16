<script lang="ts">
  interface Props {
    chars: readonly string[];
    onpress: (char: string) => void;
  }

  let { chars, onpress }: Props = $props();
</script>

{#if chars.length > 0}
  <div class="keyboard">
    <p class="label">特殊文字</p>
    <div class="keys">
      {#each chars as char}
        <button class="key" onclick={() => onpress(char)}>{char}</button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .keyboard {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    font-size: 0.75rem;
    color: var(--color-muted);
  }

  .keys {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .key {
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0 0.5rem;
    font-size: 1rem;
    font-family: inherit;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .key:active {
    background: var(--color-primary);
  }
</style>
