import { describe, expect, it } from "vitest";
import { decodeQuestion, decodeSet, encodeQuestion, encodeSet } from "./query.ts";
import type { Pokedex, Question } from "../quiz/question.ts";

const POKEDEX: Pokedex = [
  [1, "フシギダネ"],
  [25, "ピカチュウ"],
  [26, "ライチュウ"],
  [150, "ミュウツー"],
  [151, "ミュウ"],
];

function makeQuestion(name: string, revealedIndices: readonly number[]): Question {
  const graphemes = [...new Intl.Segmenter().segment(name)].map((s) => s.segment);
  return {
    letters: graphemes.map((value, i) => ({
      kind: revealedIndices.includes(i) ? "revealed" : "masked",
      value,
    })),
  };
}

describe("encodeQuestion / decodeQuestion roundtrip", () => {
  it("encodes then decodes back to same entry/question", () => {
    const question = makeQuestion("ピカチュウ", [0, 2]);
    const encoded = encodeQuestion(25, question);
    const decoded = decodeQuestion(encoded, POKEDEX);
    expect(decoded).not.toBeNull();
    expect(decoded?.entry).toEqual([25, "ピカチュウ"]);
    expect(decoded?.question.letters.map((l) => l.kind)).toEqual([
      "revealed",
      "masked",
      "revealed",
      "masked",
      "masked",
    ]);
  });

  it("decodes to 3-char string", () => {
    const question = makeQuestion("ピカチュウ", [0]);
    expect(encodeQuestion(25, question)).toHaveLength(3);
  });
});

describe("decodeQuestion validation", () => {
  it("returns null for wrong length", () => {
    expect(decodeQuestion("ab", POKEDEX)).toBeNull();
    expect(decodeQuestion("abcd", POKEDEX)).toBeNull();
  });

  it("returns null for invalid base64n chars", () => {
    expect(decodeQuestion("!!!", POKEDEX)).toBeNull();
  });

  it("returns null when mask is 0 (no revealed letters)", () => {
    const value = 25 - 1;
    const CHARS = "q8bU_sHzY3fRmGkD6cNvJwA0e5TlPi7aOXxnhjV4BgKrWo2EI9dZMtSFuLCpQy-";
    const encoded =
      CHARS[Math.floor(value / 4096)] + CHARS[Math.floor(value / 64) % 64] + CHARS[value % 64];
    expect(decodeQuestion(encoded, POKEDEX)).toBeNull();
  });

  it("returns null when pokedex number is out of range", () => {
    const question = makeQuestion("ピカチュウ", [0]);
    const encoded = encodeQuestion(9999, question);
    expect(decodeQuestion(encoded, POKEDEX)).toBeNull();
  });

  it("returns null when mask exceeds name length", () => {
    // ミュウ is 3 graphemes. Forge a question with 4 letters (extra bit set).
    const tooLong: Question = {
      letters: [
        { kind: "revealed", value: "ミ" },
        { kind: "revealed", value: "ュ" },
        { kind: "revealed", value: "ウ" },
        { kind: "revealed", value: "X" },
      ],
    };
    const encoded = encodeQuestion(151, tooLong);
    expect(decodeQuestion(encoded, POKEDEX)).toBeNull();
  });
});

describe("encodeSet / decodeSet roundtrip", () => {
  it("encodes 5 questions to 15 chars", () => {
    const items = [
      { pokedexNumber: 1, question: makeQuestion("フシギダネ", [0]) },
      { pokedexNumber: 25, question: makeQuestion("ピカチュウ", [0, 2]) },
      { pokedexNumber: 26, question: makeQuestion("ライチュウ", [1]) },
      { pokedexNumber: 150, question: makeQuestion("ミュウツー", [0, 4]) },
      { pokedexNumber: 151, question: makeQuestion("ミュウ", [0]) },
    ];
    const encoded = encodeSet(items);
    expect(encoded).toHaveLength(15);

    const decoded = decodeSet(encoded, POKEDEX);
    expect(decoded).not.toBeNull();
    expect(decoded).toHaveLength(5);
    expect(decoded?.[0].entry).toEqual([1, "フシギダネ"]);
    expect(decoded?.[4].entry).toEqual([151, "ミュウ"]);
  });
});

describe("decodeSet validation", () => {
  it("returns null for length other than 15", () => {
    expect(decodeSet("", POKEDEX)).toBeNull();
    expect(decodeSet("abc", POKEDEX)).toBeNull();
    expect(decodeSet("a".repeat(14), POKEDEX)).toBeNull();
    expect(decodeSet("a".repeat(16), POKEDEX)).toBeNull();
  });

  it("returns null when any single question fails to decode", () => {
    const items = [
      { pokedexNumber: 25, question: makeQuestion("ピカチュウ", [0]) },
      { pokedexNumber: 25, question: makeQuestion("ピカチュウ", [1]) },
      { pokedexNumber: 25, question: makeQuestion("ピカチュウ", [2]) },
      { pokedexNumber: 25, question: makeQuestion("ピカチュウ", [3]) },
      { pokedexNumber: 25, question: makeQuestion("ピカチュウ", [4]) },
    ];
    const validEncoded = encodeSet(items);
    expect(decodeSet(validEncoded, POKEDEX)).not.toBeNull();

    // Corrupt the 3rd question (index 6..8) to point to a non-existing pokedex number
    const corruptedEncoded =
      validEncoded.slice(0, 6) +
      encodeQuestion(9999, makeQuestion("ピカチュウ", [0])) +
      validEncoded.slice(9);
    expect(decodeSet(corruptedEncoded, POKEDEX)).toBeNull();
  });

  it("returns null with invalid base64n chars", () => {
    expect(decodeSet("!".repeat(15), POKEDEX)).toBeNull();
  });
});
