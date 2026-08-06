// Finds the true minimum-energy fold of an HP sequence by exhaustive
// backtracking search, pruned with a branch-and-bound cutoff. This is what
// the "reveal optimal fold" button runs: it's the shape water actually finds,
// against which the visitor can compare their own attempt.
import { applyDirection, DIRECTIONS, countRemainingH, type Coord, type Direction, type Residue } from "./hp-model";

function key(c: Coord): string {
  return `${c.x},${c.y}`;
}

export type FoldResult = { path: Coord[]; energy: number };

export function findOptimalFold(sequence: Residue[]): FoldResult {
  const origin: Coord = { x: 0, y: 0 };
  const path: Coord[] = [origin];
  const occupied = new Map<string, number>([[key(origin), 0]]);

  let best: FoldResult = { path: [origin], energy: 0 };

  function contactDelta(index: number, coord: Coord): number {
    let delta = 0;
    const neighbours: Coord[] = [
      { x: coord.x + 1, y: coord.y },
      { x: coord.x - 1, y: coord.y },
      { x: coord.x, y: coord.y + 1 },
      { x: coord.x, y: coord.y - 1 },
    ];
    for (const n of neighbours) {
      const otherIndex = occupied.get(key(n));
      if (otherIndex === undefined) continue;
      if (Math.abs(index - otherIndex) < 2) continue;
      if (sequence[index] === "H" && sequence[otherIndex] === "H") delta -= 1;
    }
    return delta;
  }

  function search(index: number, energy: number) {
    if (index === sequence.length) {
      if (energy < best.energy) best = { path: [...path], energy };
      return;
    }

    const remainingH = countRemainingH(sequence, index);
    if (energy - remainingH >= best.energy && best.path.length === sequence.length) {
      return;
    }

    // Fixing the very first step breaks the four-fold rotational symmetry of
    // the empty grid without changing which energy value is reachable.
    const dirs: Direction[] = index === 1 ? ["right"] : DIRECTIONS;

    for (const dir of dirs) {
      const last = path[path.length - 1];
      const next = applyDirection(last, dir);
      if (occupied.has(key(next))) continue;

      const delta = contactDelta(index, next);
      path.push(next);
      occupied.set(key(next), index);

      search(index + 1, energy + delta);

      path.pop();
      occupied.delete(key(next));
    }
  }

  search(1, 0);
  return best;
}
