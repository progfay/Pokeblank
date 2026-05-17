import { writeFile } from "node:fs/promises";

const ENDPOINT = "https://graphql.pokeapi.co/v1beta2";

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
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});

if (!res.ok) {
  console.error("Fetch failed:", res.status, await res.text());
  process.exit(1);
}

const { data, errors } = await res.json();
if (errors) {
  console.error("GraphQL errors:", JSON.stringify(errors, null, 2));
  process.exit(1);
}

const entries = (
  data.pokemonspecies as {
    id: number;
    pokemonspeciesnames: { name: string }[];
  }[]
)
  .map((s) => ({ id: s.id, name: s.pokemonspeciesnames[0]?.name ?? null }))
  .filter((e): e is { id: number; name: string } => e.name !== null)
  .sort((a, b) => a.id - b.id);

for (const [i, { id }] of entries.entries()) {
  if (id !== i + 1) {
    console.error(`id mismatch at index ${i}: expected ${i + 1}, got ${id}`);
    process.exit(1);
  }
}

const pokedex: string[] = entries.map(({ name }) => name);

await writeFile("src/data/pokedex.json", JSON.stringify(pokedex));
await writeFile(
  "src/data/pokedex.json.d.ts",
  `declare module './pokedex.json' {
  const pokedex: readonly string[];
  export default pokedex;
}
`,
);
console.log(`Done: ${pokedex.length} Pokémon`);
