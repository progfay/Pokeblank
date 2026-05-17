import { describe, expect, it } from "vitest";
import { checkAnswer } from "./answer.ts";
import type { ValidatedInput } from "../text/validation.ts";

const asValidated = (s: string) => s as ValidatedInput;

const ENTRIES = [
  [25, "ピカチュウ"],
  [26, "ライチュウ"],
] as const;

const POKEDEX = [
  [1, "フシギダネ"],
  ...ENTRIES,
] as const;

describe("checkAnswer", () => {
  it("returns correct when name matches first entry", () => {
    const result = checkAnswer(asValidated("ピカチュウ"), POKEDEX, ENTRIES);
    expect(result.kind).toBe("correct");
    if (result.kind === "correct") {
      expect(result.matchedPokemon[0]).toBe(25);
    }
  });

  it("returns correct when name matches second entry", () => {
    const result = checkAnswer(asValidated("ライチュウ"), POKEDEX, ENTRIES);
    expect(result.kind).toBe("correct");
    if (result.kind === "correct") {
      expect(result.matchedPokemon[0]).toBe(26);
    }
  });

  it("returns incorrect when name exists in pokedex but not in matching entries", () => {
    const result = checkAnswer(asValidated("フシギダネ"), POKEDEX, ENTRIES);
    expect(result.kind).toBe("incorrect");
  });

  it("returns not-a-pokemon when name does not exist in pokedex", () => {
    const result = checkAnswer(asValidated("ピカチューム"), POKEDEX, ENTRIES);
    expect(result.kind).toBe("not-a-pokemon");
  });

  it("returns not-a-pokemon for empty pokedex", () => {
    const result = checkAnswer(asValidated("ピカチュウ"), [], []);
    expect(result.kind).toBe("not-a-pokemon");
  });
});
