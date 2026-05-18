import { mount } from "svelte";
import { describe, expect, it, vi } from "vitest";
import AnswerView from "./AnswerView.svelte";
import type { PokedexEntry, Question } from "../../lib/quiz/question.ts";

const question: Question = {
  letters: [
    { kind: "revealed", value: "フ" },
    { kind: "masked", value: "シ" },
    { kind: "revealed", value: "ダ" },
  ],
};

const entries: readonly PokedexEntry[] = [
  [1, "フシギダネ"],
  [2, "フシギソウ"],
];

describe("AnswerView", () => {
  it("shows Correct when wasCorrect is true", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(AnswerView, {
      target: div,
      props: { question, matchingEntries: entries, wasCorrect: true, matchedEntry: entries[0], onnext: vi.fn() },
    });
    expect(div.textContent).toContain("Correct");
    div.remove();
  });

  it("shows Skipped when wasCorrect is false", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(AnswerView, {
      target: div,
      props: { question, matchingEntries: entries, wasCorrect: false, matchedEntry: null, onnext: vi.fn() },
    });
    expect(div.textContent).toContain("Skipped");
    div.remove();
  });

  it("renders one list item per matching entry", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(AnswerView, {
      target: div,
      props: { question, matchingEntries: entries, wasCorrect: true, matchedEntry: entries[0], onnext: vi.fn() },
    });
    expect(div.querySelectorAll("li")).toHaveLength(entries.length);
    div.remove();
  });

  it("shows all matching pokemon names", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(AnswerView, {
      target: div,
      props: { question, matchingEntries: entries, wasCorrect: true, matchedEntry: entries[0], onnext: vi.fn() },
    });
    expect(div.textContent).toContain("フシギダネ");
    expect(div.textContent).toContain("フシギソウ");
    div.remove();
  });

  it("calls onnext when Next button is clicked", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onnext = vi.fn();
    mount(AnswerView, {
      target: div,
      props: { question, matchingEntries: entries, wasCorrect: false, matchedEntry: null, onnext },
    });
    div.querySelector<HTMLButtonElement>('[aria-label="次の問題へ"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onnext).toHaveBeenCalled();
    div.remove();
  });

  it("highlights matched entry", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(AnswerView, {
      target: div,
      props: {
        question,
        matchingEntries: entries,
        wasCorrect: true,
        matchedEntry: entries[0], // フシギダネ
        onnext: vi.fn(),
      },
    });
    const picked = div.querySelectorAll(".match-row-picked");
    expect(picked).toHaveLength(1);
    expect(picked[0].textContent).toContain("フシギダネ");
    div.remove();
  });
});
