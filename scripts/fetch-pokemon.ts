import { writeFile } from 'node:fs/promises';
import { segment } from '../src/lib/text/segment.ts';
import { isSpecialChar } from '../src/lib/text/special-chars.ts';

const ENDPOINT = 'https://graphql.pokeapi.co/v1beta2';

const query = `{
  pokemonspecies(
    where: { pokemons: { is_default: { _eq: true } } }
    order_by: { id: asc }
  ) {
    id
    pokemonspeciesnames(where: { language_id: { _eq: 1 } }) {
      name
    }
  }
}`;

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});

if (!res.ok) {
  console.error('Fetch failed:', res.status, await res.text());
  process.exit(1);
}

const { data, errors } = await res.json();
if (errors) {
  console.error('GraphQL errors:', JSON.stringify(errors, null, 2));
  process.exit(1);
}

type Entry = [number, string];
const pokedex: Entry[] = (
  data.pokemonspecies as {
    id: number;
    pokemonspeciesnames: { name: string }[];
  }[]
)
  .map(s => {
    const nameEntry = s.pokemonspeciesnames[0];
    return nameEntry ? ([s.id, nameEntry.name] as Entry) : null;
  })
  .filter((e): e is Entry => e !== null);

const specialCharsSet = new Set<string>();
for (const [, name] of pokedex) {
  for (const g of segment(name)) {
    if (isSpecialChar(g)) specialCharsSet.add(g);
  }
}
const specialChars = [...specialCharsSet].sort(
  (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0)
);

await writeFile('src/data/pokedex.json', JSON.stringify(pokedex));
await writeFile(
  'src/data/pokedex.json.d.ts',
  `declare module './pokedex.json' {
  export type PokedexEntry = readonly [pokedexNumber: number, name: string];
  const pokedex: readonly PokedexEntry[];
  export default pokedex;
}
`
);
await writeFile('src/data/special-chars.json', JSON.stringify(specialChars));
await writeFile(
  'src/data/special-chars.json.d.ts',
  `declare module './special-chars.json' {
  const specialChars: readonly string[];
  export default specialChars;
}
`
);

console.log(`Done: ${pokedex.length} Pokémon, ${specialChars.length} special chars`);
console.log('Special chars:', specialChars.join(' '));
