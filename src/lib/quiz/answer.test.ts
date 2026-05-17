import { describe, expect, it } from "vitest";
import { checkAnswer } from "./answer.ts";
import type { Normalized } from "../text/normalize.ts";

const asNormalized = (s: string) => s as Normalized;

const ENTRIES = [
  [25, "ピカチュウ"],
  [26, "ライチュウ"],
] as const;

const POKEDEX = [
  [1, "フシギダネ"],
  ...ENTRIES,
] as const;

const NAME_SET = new Set(POKEDEX.map(([, name]) => name));

describe("checkAnswer", () => {
  it("returns correct when name matches first entry", () => {
    const result = checkAnswer(asNormalized("ピカチュウ"), NAME_SET, ENTRIES);
    expect(result.kind).toBe("correct");
    if (result.kind === "correct") {
      expect(result.matchedPokemon[0]).toBe(25);
    }
  });

  it("returns correct when name matches second entry", () => {
    const result = checkAnswer(asNormalized("ライチュウ"), NAME_SET, ENTRIES);
    expect(result.kind).toBe("correct");
    if (result.kind === "correct") {
      expect(result.matchedPokemon[0]).toBe(26);
    }
  });

  it("returns incorrect when name exists in pokedex but not in matching entries", () => {
    const result = checkAnswer(asNormalized("フシギダネ"), NAME_SET, ENTRIES);
    expect(result.kind).toBe("incorrect");
  });

  it("returns not-a-pokemon when name does not exist in pokedex", () => {
    const result = checkAnswer(asNormalized("ピカチューム"), NAME_SET, ENTRIES);
    expect(result.kind).toBe("not-a-pokemon");
  });

  it("returns not-a-pokemon for empty pokedex", () => {
    const result = checkAnswer(asNormalized("ピカチュウ"), new Set(), []);
    expect(result.kind).toBe("not-a-pokemon");
  });
});
