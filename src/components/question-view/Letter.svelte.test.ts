import { mount } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Letter from "./Letter.svelte";

describe("Letter", () => {
  it("shows value when revealed", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(Letter, {
      target: div,
      props: { letter: { kind: "revealed", value: "ピ" }, index: 0, onreveal: vi.fn() },
    });
    expect(div.textContent).toContain("ピ");
    div.remove();
  });

  it("shows value when hint-revealed", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(Letter, {
      target: div,
      props: { letter: { kind: "hint-revealed", value: "ピ" }, index: 0, onreveal: vi.fn() },
    });
    expect(div.textContent).toContain("ピ");
    div.remove();
  });

  it("shows ◯ when masked", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(Letter, {
      target: div,
      props: { letter: { kind: "masked", value: "ピ" }, index: 0, onreveal: vi.fn() },
    });
    expect(div.textContent).toContain("◯");
    div.remove();
  });

  it("does not show value when masked", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(Letter, {
      target: div,
      props: { letter: { kind: "masked", value: "ピ" }, index: 0, onreveal: vi.fn() },
    });
    expect(div.textContent).not.toContain("ピ");
    div.remove();
  });

  it("calls onreveal with index on click", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onreveal = vi.fn();
    mount(Letter, {
      target: div,
      props: { letter: { kind: "masked", value: "ピ" }, index: 3, onreveal },
    });
    const btn = div.querySelector("button")!;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onreveal).toHaveBeenCalledWith(3);
    div.remove();
  });

  it("does not render button when revealed", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(Letter, {
      target: div,
      props: { letter: { kind: "revealed", value: "ピ" }, index: 0, onreveal: vi.fn() },
    });
    expect(div.querySelector("button")).toBeNull();
    div.remove();
  });

  it("does not render button when hint-revealed", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(Letter, {
      target: div,
      props: { letter: { kind: "hint-revealed", value: "ピ" }, index: 0, onreveal: vi.fn() },
    });
    expect(div.querySelector("button")).toBeNull();
    div.remove();
  });
});
