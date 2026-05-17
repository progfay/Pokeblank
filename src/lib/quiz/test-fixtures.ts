import { vi } from "vitest";

export const POKEDEX_FIXTURE = [
  [25, "ピカチュウ"],
  [26, "ライチュウ"],
  [1, "フシギダネ"],
] as const;

export const ENTRIES_FIXTURE = [
  [25, "ピカチュウ"],
  [26, "ライチュウ"],
] as const;

export function withMockedRandom<T>(seed: number, fn: () => T): T {
  vi.spyOn(Math, "random").mockReturnValue(seed);
  try {
    return fn();
  } finally {
    vi.restoreAllMocks();
  }
}
