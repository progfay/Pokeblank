import { describe, expect, it } from "vitest";
import { normalize } from "./normalize.ts";

describe("normalize", () => {
  it("converts hiragana to katakana", () => {
    expect(normalize("ぴかちゅう")).toBe("ピカチュウ");
  });

  it("leaves katakana unchanged", () => {
    expect(normalize("ピカチュウ")).toBe("ピカチュウ");
  });

  it("leaves ♀ and ♂ unchanged", () => {
    expect(normalize("ニドラン♀")).toBe("ニドラン♀");
    expect(normalize("ニドラン♂")).toBe("ニドラン♂");
  });

  it("converts halfwidth digit to fullwidth", () => {
    expect(normalize("ポリゴン2")).toBe("ポリゴン２");
  });

  it("converts halfwidth colon to fullwidth", () => {
    expect(normalize("タイプ:ヌル")).toBe("タイプ：ヌル");
  });

  it("converts halfwidth ASCII letter to fullwidth uppercase", () => {
    expect(normalize("ポリゴンZ")).toBe("ポリゴンＺ");
    expect(normalize("ポリゴンz")).toBe("ポリゴンＺ");
  });

  it("handles mixed hiragana and katakana", () => {
    expect(normalize("ぴかチュウ")).toBe("ピカチュウ");
  });

  it("converts small hiragana", () => {
    expect(normalize("ぁぃぅぇぉ")).toBe("ァィゥェォ");
  });
});
