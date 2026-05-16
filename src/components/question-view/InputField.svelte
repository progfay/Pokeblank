<script lang="ts">
  interface Props {
    value: string;
    error: string | null;
    onchange: (value: string) => void;
    onsubmit: () => void;
  }

  let { value, error, onchange, onsubmit }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      onsubmit();
    }
  }
</script>

<div class="field">
  <input
    type="text"
    {value}
    oninput={(e) => onchange((e.target as HTMLInputElement).value)}
    onkeydown={handleKeydown}
    placeholder="ポケモン名を入力"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="none"
    spellcheck="false"
  />
  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-family: inherit;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    outline: none;
  }

  input:focus {
    border-color: var(--color-primary);
  }

  .error {
    color: var(--color-primary);
    font-size: 0.85rem;
  }
</style>
