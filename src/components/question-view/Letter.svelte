<script lang="ts">
  import type { Letter } from '../../lib/quiz/question.ts';

  interface Props {
    letter: Letter;
    index: number;
    isHint: boolean;
    onreveal: (index: number) => void;
  }

  let { letter, index, isHint, onreveal }: Props = $props();

  const kind = $derived(
    letter.kind === 'revealed' ? 'shown' : isHint ? 'hint' : 'hidden'
  );
</script>

{#if kind === 'hidden'}
  <button
    class="tile tile-hidden"
    onclick={() => onreveal(index)}
    aria-label="ヒントを開示"
  >◯</button>
{:else}
  <span class="tile tile-{kind}">{letter.value}</span>
{/if}
