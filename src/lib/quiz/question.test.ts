import { describe, expect, it, vi } from 'vitest';
import { generateQuestion, pickRandomPokemon, withRevealed } from './question.ts';

const POKEDEX = [
  [25, 'ピカチュウ'],
  [26, 'ライチュウ'],
] as const;

describe('pickRandomPokemon', () => {
  it('returns first entry when random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickRandomPokemon(POKEDEX)).toEqual([25, 'ピカチュウ']);
    vi.restoreAllMocks();
  });

  it('returns last entry when random approaches 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(pickRandomPokemon(POKEDEX)).toEqual([26, 'ライチュウ']);
    vi.restoreAllMocks();
  });
});

describe('generateQuestion', () => {
  it('throws for names shorter than 2 graphemes', () => {
    expect(() => generateQuestion([0, 'ア'])).toThrow();
  });

  it('generates letters equal to name length', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const q = generateQuestion([25, 'ピカチュウ']); // 5 chars
    expect(q.letters).toHaveLength(5);
    vi.restoreAllMocks();
  });

  it('all letters have correct values', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const q = generateQuestion([25, 'ピカチュウ']);
    const values = q.letters.map(l => l.value);
    expect(values).toEqual(['ピ', 'カ', 'チ', 'ュ', 'ウ']);
    vi.restoreAllMocks();
  });

  it('reveals at least 1 and at most floor(n/2) letters', () => {
    for (const seed of [0, 0.1, 0.3, 0.5, 0.7, 0.9]) {
      vi.spyOn(Math, 'random').mockReturnValue(seed);
      const q = generateQuestion([25, 'ピカチュウ']); // 5 chars, max revealed = 2
      const revealed = q.letters.filter(l => l.kind === 'revealed').length;
      expect(revealed).toBeGreaterThanOrEqual(1);
      expect(revealed).toBeLessThanOrEqual(2);
      vi.restoreAllMocks();
    }
  });

  it('applies rule: 2-char name reveals exactly 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const q = generateQuestion([0, 'アア']); // 2 chars, floor(2/2)=1 max
    const revealed = q.letters.filter(l => l.kind === 'revealed').length;
    expect(revealed).toBe(1);
    vi.restoreAllMocks();
  });
});

describe('withRevealed', () => {
  it('changes masked letter to revealed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const q = generateQuestion([25, 'ピカチュウ']);
    vi.restoreAllMocks();

    const maskedIdx = q.letters.findIndex(l => l.kind === 'masked');
    if (maskedIdx >= 0) {
      const updated = withRevealed(q, maskedIdx);
      expect(updated.letters[maskedIdx].kind).toBe('revealed');
    }
  });

  it('preserves value when revealing', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const q = generateQuestion([25, 'ピカチュウ']);
    vi.restoreAllMocks();

    const maskedIdx = q.letters.findIndex(l => l.kind === 'masked');
    if (maskedIdx >= 0) {
      const updated = withRevealed(q, maskedIdx);
      expect(updated.letters[maskedIdx].value).toBe(q.letters[maskedIdx].value);
    }
  });

  it('does not mutate original question', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const q = generateQuestion([25, 'ピカチュウ']);
    vi.restoreAllMocks();
    const origKind = q.letters[0].kind;
    withRevealed(q, 0);
    expect(q.letters[0].kind).toBe(origKind);
  });
});
