import { describe, expect, it } from "vitest";
import { checkAnswer } from "./answer.ts";
import type { ValidatedInput } from "../text/validation.ts";
import { ENTRIES_FIXTURE } from "./test-fixtures.ts";

const asValidated = (s: string) => s as ValidatedInput;

const ENTRIES = ENTRIES_FIXTURE;

describe("checkAnswer", () => {
  it("returns correct when name matches first entry", () => {
    const result = checkAnswer(asValidated("ピカチュウ"), ENTRIES);
    expect(result.kind).toBe("correct");
    if (result.kind === "correct") {
      expect(result.matchedPokemon[0]).toBe(25);
    }
  });

  it("returns correct when name matches second entry", () => {
    const result = checkAnswer(asValidated("ライチュウ"), ENTRIES);
    expect(result.kind).toBe("correct");
    if (result.kind === "correct") {
      expect(result.matchedPokemon[0]).toBe(26);
    }
  });

  it("returns incorrect when name does not match", () => {
    const result = checkAnswer(asValidated("フシギダネ"), ENTRIES);
    expect(result.kind).toBe("incorrect");
  });

  it("returns incorrect for empty entries", () => {
    const result = checkAnswer(asValidated("ピカチュウ"), []);
    expect(result.kind).toBe("incorrect");
  });
});
