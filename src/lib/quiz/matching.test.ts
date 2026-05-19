import { describe, expect, it, vi } from "vitest";
import { segment } from "../text/segment.ts";
import { matchesPattern } from "./matching.ts";
import { generateQuestion } from "./question.ts";

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
    const q = {
      letters: [
        { kind: "revealed" as const, value: "ア" },
        { kind: "masked" as const, value: "イ" },
      ],
    };
    expect(matchesPattern(["ウ", "エ"], q)).toBe(false);
    expect(matchesPattern(["ア", "エ"], q)).toBe(true);
  });

  it("ignores hint-revealed chars when not strict", () => {
    const q = {
      letters: [
        { kind: "revealed" as const, value: "ア" },
        { kind: "hint-revealed" as const, value: "イ" },
      ],
    };
    expect(matchesPattern(["ア", "ウ"], q)).toBe(true);
  });

  it("enforces hint-revealed chars when strict", () => {
    const q = {
      letters: [
        { kind: "revealed" as const, value: "ア" },
        { kind: "hint-revealed" as const, value: "イ" },
      ],
    };
    expect(matchesPattern(["ア", "ウ"], q, true)).toBe(false);
    expect(matchesPattern(["ア", "イ"], q, true)).toBe(true);
  });
});
