import { segment } from '../text/segment.ts';

export type Letter = {
  readonly kind: 'masked' | 'revealed';
  readonly value: string;
};

export type Question = {
  readonly letters: readonly Letter[];
};

export type PokedexEntry = readonly [pokedexNumber: number, name: string];
export type Pokedex = readonly PokedexEntry[];

export function pickRandomPokemon(pokedex: Pokedex): PokedexEntry {
  return pokedex[Math.floor(Math.random() * pokedex.length)];
}

export function generateQuestion(entry: PokedexEntry): Question {
  const graphemes = segment(entry[1]);
  const total = graphemes.length;
  if (total < 2) throw new Error(`Pokemon name too short: ${entry[1]}`);

  const maxRevealed = Math.floor(total / 2);
  const revealedCount = Math.floor(Math.random() * maxRevealed) + 1;

  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const revealedSet = new Set(indices.slice(0, revealedCount));

  return {
    letters: graphemes.map((value, i) => ({
      kind: revealedSet.has(i) ? 'revealed' : 'masked',
      value,
    })),
  };
}

export function withRevealed(question: Question, letterIndex: number): Question {
  return {
    letters: question.letters.map((letter, i) =>
      i === letterIndex ? { ...letter, kind: 'revealed' } : letter
    ),
  };
}
