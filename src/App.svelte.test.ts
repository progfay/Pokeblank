import { flushSync, mount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.svelte";

// Math.random = 0 のとき:
//   pickRandomPokemon → index 0 → フシギダネ（5文字）
//   revealCount = Math.floor(0 × 2) + 1 = 1
//   shuffleIndices(5) → [1,2,3,4,0] → revealed index = 1 (シ)
//   出題パターン: [◯, シ, ◯, ◯, ◯]

function typeAnswer(div: HTMLElement, text: string) {
  const input = div.querySelector<HTMLInputElement>("input")!;
  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  flushSync();
}

describe("App", () => {
  let div: HTMLElement;

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    div = document.createElement("div");
    document.body.appendChild(div);
    mount(App, { target: div });
  });

  afterEach(() => {
    div.remove();
    vi.restoreAllMocks();
  });

  it("shows question view on initial render", () => {
    expect(div.querySelector("input")).not.toBeNull();
    expect(div.textContent).toContain("◯");
  });

  it("shows Skipped after clicking Skip", () => {
    div.querySelector<HTMLButtonElement>('[aria-label="Skip"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    flushSync();
    expect(div.textContent).toContain("Skipped");
  });

  it("returns to question view after Next from answer view", () => {
    div.querySelector<HTMLButtonElement>('[aria-label="Skip"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    flushSync();
    div.querySelector<HTMLButtonElement>('[aria-label="次の問題へ"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    flushSync();
    expect(div.querySelector("input")).not.toBeNull();
    expect(div.textContent).toContain("◯");
  });

  it("shows error for unknown pokemon name", () => {
    typeAnswer(div, "アテスト");
    expect(div.querySelector('[role="alert"]')?.textContent).toContain("未知のポケモンです");
  });

  it("shows error when answer does not match pattern", () => {
    // ピカチュウ (4文字) は有効なポケモン名だがフシギダネ (5文字) のパターンと長さが合わない
    typeAnswer(div, "ピカチュウ");
    expect(div.querySelector('[role="alert"]')?.textContent).toContain("パターンにマッチしません");
  });

  it("shows Correct after submitting correct answer", () => {
    typeAnswer(div, "フシギダネ");
    expect(div.textContent).toContain("Correct");
  });

  it("reveals a letter when masked tile is clicked", () => {
    const before = div.querySelectorAll('[aria-label="ヒントを開示"]').length;
    div.querySelector<HTMLButtonElement>('[aria-label="ヒントを開示"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    flushSync();
    const after = div.querySelectorAll('[aria-label="ヒントを開示"]').length;
    expect(after).toBe(before - 1);
  });
});
