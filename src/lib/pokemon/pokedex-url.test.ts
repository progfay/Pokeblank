import { describe, expect, it } from "vitest";
import { pokedexUrl } from "./pokedex-url.ts";

describe("pokedexUrl", () => {
  it("pads single-digit numbers to 4 digits", () => {
    expect(pokedexUrl(1)).toBe("https://zukan.pokemon.co.jp/detail/0001");
  });

  it("pads three-digit numbers to 4 digits", () => {
    expect(pokedexUrl(25)).toBe("https://zukan.pokemon.co.jp/detail/0025");
  });

  it("does not pad 4-digit numbers", () => {
    expect(pokedexUrl(1000)).toBe("https://zukan.pokemon.co.jp/detail/1000");
  });
});
