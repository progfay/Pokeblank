import { describe, expect, it } from "vitest";
import { normalize } from "./normalize.ts";

describe("normalize", () => {
  it("converts hiragana to katakana", () => {
    expect(normalize("ぴかちゅう")).toBe("ピカチュウ");
  });

  it("leaves katakana unchanged", () => {
    expect(normalize("ピカチュウ")).toBe("ピカチュウ");
  });

  it("leaves special chars unchanged", () => {
    expect(normalize("ニドラン♀")).toBe("ニドラン♀");
  });

  it("handles mixed hiragana and katakana", () => {
    expect(normalize("ぴかチュウ")).toBe("ピカチュウ");
  });

  it("converts small hiragana", () => {
    expect(normalize("ぁぃぅぇぉ")).toBe("ァィゥェォ");
  });
});
