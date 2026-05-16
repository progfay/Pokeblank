import { describe, expect, it } from "vitest";
import { segment } from "./segment.ts";

describe("segment", () => {
  it("splits ASCII string into individual chars", () => {
    expect(segment("abc")).toEqual(["a", "b", "c"]);
  });

  it("splits katakana string", () => {
    expect(segment("ピカチュウ")).toEqual(["ピ", "カ", "チ", "ュ", "ウ"]);
  });

  it("treats special chars as single grapheme", () => {
    expect(segment("ニドラン♀")).toEqual(["ニ", "ド", "ラ", "ン", "♀"]);
  });

  it("handles empty string", () => {
    expect(segment("")).toEqual([]);
  });

  it("handles fullwidth chars", () => {
    expect(segment("ポリゴン２")).toEqual(["ポ", "リ", "ゴ", "ン", "２"]);
  });
});
