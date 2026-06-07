import { describe, expect, it } from "vitest";
import { isSmallKana } from "./small-kana.ts";

describe("isSmallKana", () => {
  it("returns true for youon (拗音)", () => {
    for (const c of "ャュョ") {
      expect(isSmallKana(c)).toBe(true);
    }
  });

  it("returns true for small vowels (小母音)", () => {
    for (const c of "ァィゥェォ") {
      expect(isSmallKana(c)).toBe(true);
    }
  });

  it("returns true for sokuon (促音) and ヮヵヶ", () => {
    for (const c of "ッヮヵヶ") {
      expect(isSmallKana(c)).toBe(true);
    }
  });

  it("returns true for small hiragana", () => {
    for (const c of "ぁぃぅぇぉっゃゅょゎゕゖ") {
      expect(isSmallKana(c)).toBe(true);
    }
  });

  it("returns false for normal kana", () => {
    for (const c of "カチウヤユヨアツ") {
      expect(isSmallKana(c)).toBe(false);
    }
  });

  it("returns false for empty string", () => {
    expect(isSmallKana("")).toBe(false);
  });
});
