<script lang="ts">
  import type { PokedexEntry } from '../../lib/quiz/question.ts';
  import { pokedexUrl } from '../../lib/pokemon/pokedex-url.ts';

  interface Props {
    entry: PokedexEntry;
  }

  let { entry }: Props = $props();

  const url = $derived(pokedexUrl(entry[0]));
</script>

<a href={url} target="_blank" rel="noopener noreferrer" class="link">
  {entry[1]}
</a>

<style>
  .link {
    color: var(--color-primary);
    text-decoration: none;
    font-size: 1rem;
  }

  .link:hover {
    text-decoration: underline;
  }
</style>
