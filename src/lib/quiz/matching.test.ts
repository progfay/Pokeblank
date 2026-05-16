import { describe, expect, it, vi } from "vitest";
import { segment } from "../text/segment.ts";
import { findAllMatchingPokedexEntries, matchesPattern } from "./matching.ts";
import { generateQuestion } from "./question.ts";

const POKEDEX = [
  [25, "ピカチュウ"],
  [26, "ライチュウ"],
  [1, "フシギダネ"],
] as const;

describe("matchesPattern", () => {
  it("source pokemon always matches its own question", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const q = generateQuestion([25, "ピカチュウ"]);
    vi.restoreAllMocks();
    expect(matchesPattern(segment("ピカチュウ"), q)).toBe(true);
  });

  it("returns false for different length", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const q = generateQuestion([25, "ピカチュウ"]); // 5 chars
    vi.restoreAllMocks();
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
    vi.spyOn(Math, "random").mockReturnValue(0);
    const q = generateQuestion([25, "ピカチュウ"]);
    vi.restoreAllMocks();
    const matches = findAllMatchingPokedexEntries(POKEDEX, q);
    expect(matches.some(([id]) => id === 25)).toBe(true);
  });

  it("excludes pokemon with different length", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const q = generateQuestion([25, "ピカチュウ"]); // 5 chars
    vi.restoreAllMocks();
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
