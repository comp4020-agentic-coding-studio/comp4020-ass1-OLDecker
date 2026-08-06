import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// The core interaction contract: the visitor does something (places a
// residue) and what they see changes (the board, the energy readout). These
// assert the shipped markup actually carries that interaction, complementing
// spec/fold-model.test.ts's tests of the underlying mechanic.
const doc = new JSDOM(readFileSync(resolve("dist/index.html"), "utf8")).window.document;

describe("fold interaction", () => {
  it("has a direction control for each of the four moves", () => {
    for (const dir of ["up", "down", "left", "right"]) {
      const button = doc.querySelector(`[data-testid="dir-${dir}"]`);
      expect(button, `missing direction control for ${dir}`).toBeTruthy();
      expect(button?.tagName).toBe("BUTTON");
    }
  });

  it("has a live energy readout the visitor's moves update", () => {
    expect(doc.querySelector('[data-testid="energy-readout"]')).toBeTruthy();
  });

  it("has an undo and a reset control", () => {
    expect(doc.querySelector('[data-testid="undo"]')).toBeTruthy();
    expect(doc.querySelector('[data-testid="reset"]')).toBeTruthy();
  });

  it("has a reveal-optimal control for comparing against the true minimum fold", () => {
    expect(doc.querySelector('[data-testid="reveal-optimal"]')).toBeTruthy();
  });

  it("renders the fold as an accessible image, not a bare canvas", () => {
    const board = doc.querySelector('[data-testid="fold-board"]');
    expect(board?.getAttribute("role")).toBe("img");
    expect(board?.getAttribute("aria-label")).toBeTruthy();
  });
});
