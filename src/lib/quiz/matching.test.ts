import { describe, expect, it } from "vitest";
import { segment } from "../text/segment.ts";
import { findAllMatchingPokedexEntries, matchesPattern } from "./matching.ts";
import { generateQuestion } from "./question.ts";
import { POKEDEX_FIXTURE, withMockedRandom } from "./test-fixtures.ts";

const POKEDEX = POKEDEX_FIXTURE;

describe("matchesPattern", () => {
  it("source pokemon always matches its own question", () => {
    const q = withMockedRandom(0, () => generateQuestion([25, "ピカチュウ"]));
    expect(matchesPattern(segment("ピカチュウ"), q)).toBe(true);
  });

  it("returns false for different length", () => {
    const q = withMockedRandom(0, () => generateQuestion([25, "ピカチュウ"])); // 5 chars
    expect(matchesPattern(segment("ア"), q)).toBe(false);
    expect(matchesPattern(segment("アイウエオカ"), q)).toBe(false);
  });

  it("returns false when revealed chars do not match", () => {
    // question with all revealed (hand-craft)
    const q = {
      letters: [
        { kind: "revealed" as const, value: "ア" },
        { kind: "masked" as const, value: "イ" },
      ],
    };
    expect(matchesPattern(["ウ", "エ"], q)).toBe(false);
    expect(matchesPattern(["ア", "エ"], q)).toBe(true);
  });
});

describe("findAllMatchingPokedexEntries", () => {
  it("always includes source pokemon", () => {
    const q = withMockedRandom(0, () => generateQuestion([25, "ピカチュウ"]));
    const matches = findAllMatchingPokedexEntries(POKEDEX, q);
    expect(matches.some(([id]) => id === 25)).toBe(true);
  });

  it("excludes pokemon with different length", () => {
    const q = withMockedRandom(0, () => generateQuestion([25, "ピカチュウ"])); // 5 chars
    const matches = findAllMatchingPokedexEntries(POKEDEX, q);
    expect(matches.some(([id]) => id === 1)).toBe(false); // フシギダネ is 5 chars too but different
  });

  it("returns only matching entries", () => {
    const q = {
      letters: [
        { kind: "masked" as const, value: "ピ" },
        { kind: "masked" as const, value: "カ" },
        { kind: "revealed" as const, value: "チ" },
        { kind: "revealed" as const, value: "ュ" },
        { kind: "revealed" as const, value: "ウ" },
      ],
    };
    const matches = findAllMatchingPokedexEntries(POKEDEX, q);
    // ピカチュウ and ライチュウ both end in チュウ and are 5 chars
    expect(matches.map(([id]) => id)).toContain(25);
    expect(matches.map(([id]) => id)).toContain(26);
    expect(matches.map(([id]) => id)).not.toContain(1);
  });
});
