import { describe, expect, it } from "vitest";
import { canPlace, computeEnergy, type Coord, type Residue } from "../hp-model";
import { findOptimalFold } from "../optimal-fold";

// These test the mechanic itself — the contract the fold board's buttons and
// energy readout are built on — rather than simulating clicks against the DOM.

describe("canPlace", () => {
  it("allows placing onto an unoccupied neighbouring cell", () => {
    const path: Coord[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    expect(canPlace(path, "right")).toBe(true);
  });

  it("rejects placing back onto an already-occupied cell", () => {
    const path: Coord[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    expect(canPlace(path, "left")).toBe(false);
  });
});

describe("computeEnergy", () => {
  it("counts a buried H-H contact between non-adjacent residues that fold next to each other", () => {
    const sequence: Residue[] = ["H", "H", "P", "H"];
    const path: Coord[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    // Residue 0 (H) and residue 3 (H) end up grid-adjacent despite being
    // three apart in the chain — exactly the "buried away from water" case.
    expect(computeEnergy(path, sequence)).toBe(-1);
  });

  it("scores a straight, unfolded chain as zero", () => {
    const sequence: Residue[] = ["H", "H", "H", "H"];
    const path: Coord[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    expect(computeEnergy(path, sequence)).toBe(0);
  });
});

describe("findOptimalFold", () => {
  it("finds the one-bend fold that buries the first and last residue for an all-hydrophobic chain", () => {
    const result = findOptimalFold(["H", "H", "H", "H"]);
    expect(result.energy).toBe(-1);
    expect(result.path).toHaveLength(4);
  });

  it("scores an all-polar chain as zero, since there's nothing to bury", () => {
    const result = findOptimalFold(["P", "P", "P", "P"]);
    expect(result.energy).toBe(0);
  });
});
