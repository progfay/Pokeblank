<script lang="ts">
  interface Props {
    value: string;
    onchange: (value: string) => void;
    onsubmit: () => void;
  }

  let { value, onchange, onsubmit }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      onsubmit();
    }
  }
</script>

<input
  class="input answer-input"
  type="text"
  {value}
  oninput={(e) => onchange((e.target as HTMLInputElement).value)}
  onkeydown={handleKeydown}
  placeholder="こたえを入力"
  autocomplete="off"
  autocorrect="off"
  autocapitalize="none"
  spellcheck="false"
  inputmode="text"
/>

<style>
  .answer-input {
    height: 48px;
    font-size: 18px;
    text-align: center;
  }

  .answer-input::placeholder {
    text-align: center;
    font-size: var(--text-body-lg-size);
  }
</style>
