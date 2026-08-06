import { SEQUENCE, DIRECTIONS, canPlace, applyDirection, computeEnergy, type Coord, type Direction } from "./hp-model";
import { findOptimalFold } from "./optimal-fold";
import { renderFold } from "./render";

const board = document.querySelector<SVGSVGElement>('[data-testid="fold-board"]');
const energyReadout = document.querySelector<HTMLElement>('[data-testid="energy-readout"]');
const progressReadout = document.querySelector<HTMLElement>('[data-testid="progress-readout"]');
const undoButton = document.querySelector<HTMLButtonElement>('[data-testid="undo"]');
const resetButton = document.querySelector<HTMLButtonElement>('[data-testid="reset"]');
const revealButton = document.querySelector<HTMLButtonElement>('[data-testid="reveal-optimal"]');
const comparison = document.querySelector<HTMLElement>('[data-testid="comparison"]');
const comparisonNote = document.querySelector<HTMLElement>('[data-testid="comparison-note"]');
const yourFoldBoard = document.querySelector<SVGSVGElement>('[data-testid="your-fold-board"]');
const yourEnergy = document.querySelector<HTMLElement>('[data-testid="your-energy"]');
const optimalFoldBoard = document.querySelector<SVGSVGElement>('[data-testid="optimal-fold-board"]');
const optimalEnergy = document.querySelector<HTMLElement>('[data-testid="optimal-energy"]');

const directionButtons = new Map<Direction, HTMLButtonElement>();
for (const dir of DIRECTIONS) {
  const button = document.querySelector<HTMLButtonElement>(`[data-testid="dir-${dir}"]`);
  if (button) directionButtons.set(dir, button);
}

let path: Coord[] = [{ x: 0, y: 0 }];

function isComplete(): boolean {
  return path.length === SEQUENCE.length;
}

function render(): void {
  if (board) renderFold(board, path, SEQUENCE);

  if (energyReadout) energyReadout.textContent = String(computeEnergy(path, SEQUENCE));
  if (progressReadout) {
    progressReadout.textContent = `(residue ${path.length} of ${SEQUENCE.length} placed)`;
  }

  for (const [dir, button] of directionButtons) {
    button.disabled = isComplete() || !canPlace(path, dir);
  }
  if (undoButton) undoButton.disabled = path.length <= 1;
  if (revealButton) revealButton.disabled = !isComplete();
}

function place(dir: Direction): void {
  if (isComplete() || !canPlace(path, dir)) return;
  path = [...path, applyDirection(path[path.length - 1], dir)];
  render();
}

function undo(): void {
  if (path.length <= 1) return;
  path = path.slice(0, -1);
  hideComparison();
  render();
}

function reset(): void {
  path = [{ x: 0, y: 0 }];
  hideComparison();
  render();
}

function hideComparison(): void {
  if (comparison) comparison.hidden = true;
  if (comparisonNote) comparisonNote.hidden = true;
}

function revealOptimal(): void {
  if (!isComplete()) return;
  const optimal = findOptimalFold(SEQUENCE);

  if (yourFoldBoard) renderFold(yourFoldBoard, path, SEQUENCE);
  if (yourEnergy) yourEnergy.textContent = `Energy: ${computeEnergy(path, SEQUENCE)}`;
  if (optimalFoldBoard) renderFold(optimalFoldBoard, optimal.path, SEQUENCE);
  if (optimalEnergy) optimalEnergy.textContent = `Energy: ${optimal.energy}`;

  if (comparison) comparison.hidden = false;
  if (comparisonNote) comparisonNote.hidden = false;
}

for (const [dir, button] of directionButtons) {
  button.addEventListener("click", () => place(dir));
}
undoButton?.addEventListener("click", undo);
resetButton?.addEventListener("click", reset);
revealButton?.addEventListener("click", revealOptimal);

const KEY_DIRECTIONS: Record<string, Direction> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

window.addEventListener("keydown", (event) => {
  if (event.key === "Backspace") {
    event.preventDefault();
    undo();
    return;
  }

  const dir = KEY_DIRECTIONS[event.key.toLowerCase()];
  if (!dir) return;
  event.preventDefault();
  place(dir);
});

render();
