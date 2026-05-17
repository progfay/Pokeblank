import { mount } from "svelte";
import { describe, expect, it, vi } from "vitest";
import SpecialKeyboard from "./SpecialKeyboard.svelte";

describe("SpecialKeyboard", () => {
  it("renders buttons only for ♀ and ♂, filtering other chars", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(SpecialKeyboard, {
      target: div,
      props: { chars: ["♀", "♂", "２"], onpress: vi.fn() },
    });
    const buttons = div.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    div.remove();
  });

  it("calls onpress with correct char on click", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const onpress = vi.fn();
    mount(SpecialKeyboard, {
      target: div,
      props: { chars: ["♀"], onpress },
    });
    (div.querySelector("button") as HTMLButtonElement).click();
    expect(onpress).toHaveBeenCalledWith("♀");
    div.remove();
  });

  it("renders nothing when chars is empty", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(SpecialKeyboard, {
      target: div,
      props: { chars: [], onpress: vi.fn() },
    });
    expect(div.querySelector("button")).toBeNull();
    div.remove();
  });

  it("renders nothing when chars contains no ♀ or ♂", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mount(SpecialKeyboard, {
      target: div,
      props: { chars: ["２", "Z"], onpress: vi.fn() },
    });
    expect(div.querySelector("button")).toBeNull();
    div.remove();
  });
});
