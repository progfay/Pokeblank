declare module './pokedex.json' {
  export type PokedexEntry = readonly [pokedexNumber: number, name: string];
  const pokedex: readonly PokedexEntry[];
  export default pokedex;
}
