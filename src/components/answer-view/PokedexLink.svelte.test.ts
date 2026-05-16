import { mount } from "svelte";
import { describe, expect, it } from "vitest";
import PokedexLink from "./PokedexLink.svelte";

describe("PokedexLink", () => {
  it("generates zero-padded 4-digit URL for single-digit id", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(PokedexLink, {
      target: div,
      props: { entry: [1, "フシギダネ"] as const },
    });
    const a = div.querySelector("a")!;
    expect(a.getAttribute("href")).toContain("/detail/0001");
    div.remove();
  });

  it("generates zero-padded URL for two-digit id", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(PokedexLink, {
      target: div,
      props: { entry: [25, "ピカチュウ"] as const },
    });
    const a = div.querySelector("a")!;
    expect(a.getAttribute("href")).toContain("/detail/0025");
    div.remove();
  });

  it("shows pokemon name as link text", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(PokedexLink, {
      target: div,
      props: { entry: [25, "ピカチュウ"] as const },
    });
    expect(div.textContent).toContain("ピカチュウ");
    div.remove();
  });

  it("does not pad 4-digit id", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(PokedexLink, {
      target: div,
      props: { entry: [1025, "テラパゴス"] as const },
    });
    const a = div.querySelector("a")!;
    expect(a.getAttribute("href")).toContain("/detail/1025");
    div.remove();
  });

  it("opens in new tab", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(PokedexLink, {
      target: div,
      props: { entry: [25, "ピカチュウ"] as const },
    });
    const a = div.querySelector("a")!;
    expect(a.getAttribute("target")).toBe("_blank");
    div.remove();
  });
});
