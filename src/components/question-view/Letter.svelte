<script lang="ts">
  import type { Letter } from '../../lib/quiz/question.ts';
  import { isSmallKana } from '../../lib/text/small-kana.ts';

  interface Props {
    letter: Letter;
    index: number;
    onreveal: (index: number) => void;
  }

  let { letter, index, onreveal }: Props = $props();

  const kind = $derived(
    letter.kind === 'revealed' ? 'shown' : letter.kind === 'hint-revealed' ? 'hint' : 'hidden'
  );

  // Only flag revealed letters: marking masked tiles would leak whether the
  // hidden character is a small kana.
  const small = $derived(kind !== 'hidden' && isSmallKana(letter.value));
</script>

{#if kind === 'hidden'}
  <button
    class="tile tile-hidden"
    onclick={() => onreveal(index)}
    aria-label="ヒントを開示"
  >◯</button>
{:else}
  <span class="tile tile-{kind}" class:tile-small={small}>{letter.value}</span>
{/if}
