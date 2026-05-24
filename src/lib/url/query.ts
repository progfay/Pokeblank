import { segment } from "../text/segment.ts";
import type { Pokedex, PokedexEntry, Question } from "../quiz/question.ts";

const CHARS = "q8bU_sHzY3fRmGkD6cNvJwA0e5TlPi7aOXxnhjV4BgKrWo2EI9dZMtSFuLCpQy-";

function toBase64n(n: number): string {
  return CHARS[Math.floor(n / 4096)] + CHARS[Math.floor(n / 64) % 64] + CHARS[n % 64];
}

function fromBase64n(s: string): number | null {
  if (s.length !== 3) return null;
  let value = 0;
  for (const c of s) {
    const idx = CHARS.indexOf(c);
    if (idx === -1) return null;
    value = value * 64 + idx;
  }
  return value;
}

export function encodeQuestion(pokedexNumber: number, question: Question): string {
  let mask = 0;
  for (let i = 0; i < question.letters.length; i++) {
    if (question.letters[i].kind === "revealed") mask |= 1 << i;
  }
  const value = (mask << 11) | (pokedexNumber - 1);
  return toBase64n(value);
}

export function decodeQuestion(
  encoded: string,
  pokedex: Pokedex,
): { entry: PokedexEntry; question: Question } | null {
  const value = fromBase64n(encoded);
  if (value === null) return null;

  const pokedexNumber = (value & 0x7ff) + 1;
  const mask = value >> 11;

  if (mask === 0) return null;

  const entry = pokedex.find(([n]) => n === pokedexNumber);
  if (!entry) return null;

  const graphemes = segment(entry[1]);
  if (mask >= 1 << graphemes.length) return null;

  return {
    entry,
    question: {
      letters: graphemes.map((value, i) => ({
        kind: mask & (1 << i) ? "revealed" : "masked",
        value,
      })),
    },
  };
}

export const SET_SIZE = 5;
const SET_ENCODED_LENGTH = SET_SIZE * 3;

export type RestoredSet = readonly { entry: PokedexEntry; question: Question }[];

export function encodeSet(items: readonly { pokedexNumber: number; question: Question }[]): string {
  return items.map((item) => encodeQuestion(item.pokedexNumber, item.question)).join("");
}

export function decodeSet(encoded: string, pokedex: Pokedex): RestoredSet | null {
  if (encoded.length !== SET_ENCODED_LENGTH) return null;
  const results: { entry: PokedexEntry; question: Question }[] = [];
  for (let i = 0; i < SET_SIZE; i++) {
    const chunk = encoded.slice(i * 3, i * 3 + 3);
    const decoded = decodeQuestion(chunk, pokedex);
    if (decoded === null) return null;
    results.push(decoded);
  }
  return results;
}
