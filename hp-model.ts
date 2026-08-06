// The HP model: a protein is a chain of residues, each either Hydrophobic
// (avoids water) or Polar (fine with water). Folding it onto a 2D grid as a
// self-avoiding walk lets a simple contact-counting score stand in for how
// much hydrophobic surface area gets buried away from water.

export type Residue = "H" | "P";
export type Coord = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";

// A pedagogical sequence, not a real protein: long enough that the fold isn't
// obvious by eye, short enough that a visitor can place every residue by hand
// and that the optimal-fold search (optimal-fold.ts) finishes instantly.
export const SEQUENCE: Residue[] = [
  "H", "P", "P", "H", "H", "P", "P", "H", "H", "P", "P", "H", "P", "H",
];

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

export function applyDirection(coord: Coord, dir: Direction): Coord {
  switch (dir) {
    case "up":
      return { x: coord.x, y: coord.y - 1 };
    case "down":
      return { x: coord.x, y: coord.y + 1 };
    case "left":
      return { x: coord.x - 1, y: coord.y };
    case "right":
      return { x: coord.x + 1, y: coord.y };
  }
}

function key(c: Coord): string {
  return `${c.x},${c.y}`;
}

export function canPlace(path: Coord[], dir: Direction): boolean {
  if (path.length === 0) return true;
  const last = path[path.length - 1];
  const next = applyDirection(last, dir);
  const occupied = new Set(path.map(key));
  return !occupied.has(key(next));
}

// Sum of -1 for every pair of residues that are adjacent on the grid but not
// adjacent in the chain, where both are hydrophobic. This is the simplified
// stand-in for "buried away from water" that drives the whole explainer.
export function computeEnergy(path: Coord[], sequence: Residue[]): number {
  let energy = 0;
  for (let i = 0; i < path.length; i++) {
    if (sequence[i] !== "H") continue;
    for (let j = i + 2; j < path.length; j++) {
      if (sequence[j] !== "H") continue;
      const dx = Math.abs(path[i].x - path[j].x);
      const dy = Math.abs(path[i].y - path[j].y);
      if (dx + dy === 1) energy -= 1;
    }
  }
  return energy;
}

export function countRemainingH(sequence: Residue[], fromIndex: number): number {
  let count = 0;
  for (let i = fromIndex; i < sequence.length; i++) {
    if (sequence[i] === "H") count += 1;
  }
  return count;
}
