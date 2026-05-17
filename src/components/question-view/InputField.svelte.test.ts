import { mount } from "svelte";
import { describe, expect, it, vi } from "vitest";
import InputField from "./InputField.svelte";

describe("InputField", () => {
  it("renders input element", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(InputField, {
      target: div,
      props: { value: "", onchange: vi.fn(), onsubmit: vi.fn() },
    });
    expect(div.querySelector("input")).not.toBeNull();
    div.remove();
  });

  it("calls onsubmit on Enter key", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onsubmit = vi.fn();
    mount(InputField, {
      target: div,
      props: { value: "", onchange: vi.fn(), onsubmit },
    });
    const input = div.querySelector("input")!;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(onsubmit).toHaveBeenCalled();
    div.remove();
  });

  it("does not call onsubmit during IME composition", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onsubmit = vi.fn();
    mount(InputField, {
      target: div,
      props: { value: "", onchange: vi.fn(), onsubmit },
    });
    const input = div.querySelector("input")!;
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }),
    );
    expect(onsubmit).not.toHaveBeenCalled();
    div.remove();
  });
});
