import { mount } from "svelte";
import { describe, expect, it, vi } from "vitest";
import QuestionView from "./QuestionView.svelte";
import type { Question } from "../../lib/quiz/question.ts";

const question: Question = {
  letters: [
    { kind: "revealed", value: "フ" },
    { kind: "masked", value: "シ" },
    { kind: "masked", value: "ギ" },
  ],
};

describe("QuestionView", () => {
  it("renders input field", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(QuestionView, {
      target: div,
      props: {
        question,
        rawInput: "",
        error: null,
        oninputchange: vi.fn(),
        onsubmit: vi.fn(),
        onpass: vi.fn(),
        onreveal: vi.fn(),
      },
    });
    expect(div.querySelector("input")).not.toBeNull();
    div.remove();
  });

  it("submit button is disabled when input is empty", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(QuestionView, {
      target: div,
      props: {
        question,
        rawInput: "",
        error: null,
        oninputchange: vi.fn(),
        onsubmit: vi.fn(),
        onpass: vi.fn(),
        onreveal: vi.fn(),
      },
    });
    const btn = div.querySelector<HTMLButtonElement>('[aria-label="解答を送信"]')!;
    expect(btn.disabled).toBe(true);
    div.remove();
  });

  it("submit button is enabled when input has content", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(QuestionView, {
      target: div,
      props: {
        question,
        rawInput: "フシギダネ",
        error: null,
        oninputchange: vi.fn(),
        onsubmit: vi.fn(),
        onpass: vi.fn(),
        onreveal: vi.fn(),
      },
    });
    const btn = div.querySelector<HTMLButtonElement>('[aria-label="解答を送信"]')!;
    expect(btn.disabled).toBe(false);
    div.remove();
  });

  it("shows error message when error is set", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(QuestionView, {
      target: div,
      props: {
        question,
        rawInput: "",
        error: "未知のポケモンです",
        oninputchange: vi.fn(),
        onsubmit: vi.fn(),
        onpass: vi.fn(),
        onreveal: vi.fn(),
      },
    });
    expect(div.querySelector('[role="alert"]')?.textContent).toContain("未知のポケモンです");
    div.remove();
  });

  it("calls onpass when Skip button is clicked", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onpass = vi.fn();
    mount(QuestionView, {
      target: div,
      props: {
        question,
        rawInput: "",
        error: null,
        oninputchange: vi.fn(),
        onsubmit: vi.fn(),
        onpass,
        onreveal: vi.fn(),
      },
    });
    div
      .querySelector<HTMLButtonElement>('[aria-label="Skip"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onpass).toHaveBeenCalled();
    div.remove();
  });

  it("calls onreveal with letter index when masked letter is clicked", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onreveal = vi.fn();
    mount(QuestionView, {
      target: div,
      props: {
        question,
        rawInput: "",
        error: null,
        oninputchange: vi.fn(),
        onsubmit: vi.fn(),
        onpass: vi.fn(),
        onreveal,
      },
    });
    // index 0 (フ) は revealed なので buttons なし。最初の masked button は index 1 (シ)
    div
      .querySelector<HTMLButtonElement>('[aria-label="ヒントを開示"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onreveal).toHaveBeenCalledWith(1);
    div.remove();
  });

  it("calls onsubmit when submit button is clicked", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onsubmit = vi.fn();
    mount(QuestionView, {
      target: div,
      props: {
        question,
        rawInput: "フシギダネ",
        error: null,
        oninputchange: vi.fn(),
        onsubmit,
        onpass: vi.fn(),
        onreveal: vi.fn(),
      },
    });
    div
      .querySelector<HTMLButtonElement>('[aria-label="解答を送信"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onsubmit).toHaveBeenCalled();
    div.remove();
  });
});
