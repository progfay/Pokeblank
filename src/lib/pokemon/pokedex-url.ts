export function pokedexUrl(pokedexNumber: number): string {
  return `https://zukan.pokemon.co.jp/detail/${String(pokedexNumber).padStart(4, '0')}`;
}
