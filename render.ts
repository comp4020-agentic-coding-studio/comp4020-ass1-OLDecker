// Draws a folded chain (grid coordinates + H/P sequence) as an SVG: connected,
// colour-coded beads in a viewBox that fits whatever's been placed so far, so
// it scales cleanly at both a 390px phone width and a 1920px desktop one.
import type { Coord, Residue } from "./hp-model";

const CELL = 40;
const RADIUS = 12;
const PADDING = 1;

const SVG_NS = "http://www.w3.org/2000/svg";

export function renderFold(container: SVGSVGElement, path: Coord[], sequence: Residue[]): void {
  while (container.firstChild) container.removeChild(container.firstChild);

  if (path.length === 0) return;

  const xs = path.map((c) => c.x);
  const ys = path.map((c) => c.y);
  const minX = Math.min(...xs) - PADDING;
  const maxX = Math.max(...xs) + PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxY = Math.max(...ys) + PADDING;

  const width = (maxX - minX) * CELL;
  const height = (maxY - minY) * CELL;
  container.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const toPixel = (c: Coord) => ({
    px: (c.x - minX) * CELL,
    py: (c.y - minY) * CELL,
  });

  for (let i = 0; i < path.length - 1; i++) {
    const a = toPixel(path[i]);
    const b = toPixel(path[i + 1]);
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", String(a.px));
    line.setAttribute("y1", String(a.py));
    line.setAttribute("x2", String(b.px));
    line.setAttribute("y2", String(b.py));
    line.setAttribute("class", "fold-backbone");
    container.appendChild(line);
  }

  path.forEach((coord, i) => {
    const { px, py } = toPixel(coord);
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(px));
    circle.setAttribute("cy", String(py));
    circle.setAttribute("r", String(RADIUS));
    circle.setAttribute("class", sequence[i] === "H" ? "residue residue-h" : "residue residue-p");
    const title = document.createElementNS(SVG_NS, "title");
    title.textContent = `Residue ${i + 1}: ${sequence[i] === "H" ? "hydrophobic" : "polar"}`;
    circle.appendChild(title);
    container.appendChild(circle);
  });
}
