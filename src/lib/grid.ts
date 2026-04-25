import Alea from "alea";
import Delaunator from "delaunator";
import {createTypedArray, rn, type Point} from "./utils";
import {type Cells, type Vertices, Voronoi} from "./voronoi";

export interface Grid {
  spacing: number;
  cellsDesired: number;
  boundary: Point[];
  points: Point[];
  cellsX: number;
  cellsY: number;
  seed: string | number;
  width: number;
  height: number;
  cells: Cells;
  vertices: Vertices;
}

const getBoundaryPoints = (width: number, height: number, spacing: number): Point[] => {
  const offset = rn(-1 * spacing);
  const boundarySpacing = spacing * 2;
  const effectiveWidth = width - offset * 2;
  const effectiveHeight = height - offset * 2;
  const numberX = Math.ceil(effectiveWidth / boundarySpacing) - 1;
  const numberY = Math.ceil(effectiveHeight / boundarySpacing) - 1;
  const points: Point[] = [];

  for (let i = 0.5; i < numberX; i++) {
    const x = Math.ceil((effectiveWidth * i) / numberX + offset);
    points.push([x, offset], [x, effectiveHeight + offset]);
  }

  for (let i = 0.5; i < numberY; i++) {
    const y = Math.ceil((effectiveHeight * i) / numberY + offset);
    points.push([offset, y], [effectiveWidth + offset, y]);
  }

  return points;
};

const getJitteredGrid = (width: number, height: number, spacing: number): Point[] => {
  const radius = spacing / 2;
  const jittering = radius * 0.9;
  const doubleJittering = jittering * 2;
  const jitter = () => Math.random() * doubleJittering - jittering;

  const points: Point[] = [];
  for (let y = radius; y < height; y += spacing) {
    for (let x = radius; x < width; x += spacing) {
      const xj = Math.min(rn(x + jitter(), 2), width);
      const yj = Math.min(rn(y + jitter(), 2), height);
      points.push([xj, yj]);
    }
  }
  return points;
};

const placePoints = (
  graphWidth: number,
  graphHeight: number,
  cellsDesired: number
): Pick<Grid, "spacing" | "cellsDesired" | "boundary" | "points" | "cellsX" | "cellsY"> => {
  const spacing = rn(Math.sqrt((graphWidth * graphHeight) / cellsDesired), 2);
  const boundary = getBoundaryPoints(graphWidth, graphHeight, spacing);
  const points = getJitteredGrid(graphWidth, graphHeight, spacing);
  const cellCountX = Math.floor((graphWidth + 0.5 * spacing - 1e-10) / spacing);
  const cellCountY = Math.floor((graphHeight + 0.5 * spacing - 1e-10) / spacing);

  return {
    spacing,
    cellsDesired,
    boundary,
    points,
    cellsX: cellCountX,
    cellsY: cellCountY
  };
};

export const calculateVoronoi = (points: Point[], boundary: Point[]): {cells: Cells; vertices: Vertices} => {
  const allPoints = points.concat(boundary);
  const delaunay = Delaunator.from(allPoints);
  const voronoi = new Voronoi(delaunay, allPoints, points.length);

  const cells = voronoi.cells;
  cells.i = createTypedArray({maxValue: points.length, length: points.length}).map((_, index) => index) as Uint32Array;

  return {cells, vertices: voronoi.vertices};
};

export const generateGrid = (
  seed: string,
  graphWidth: number,
  graphHeight: number,
  cellsDesired: number
): Grid => {
  Math.random = Alea(seed);
  const {spacing, boundary, points, cellsX, cellsY} = placePoints(graphWidth, graphHeight, cellsDesired);
  const {cells, vertices} = calculateVoronoi(points, boundary);

  return {
    spacing,
    cellsDesired,
    boundary,
    points,
    cellsX,
    cellsY,
    cells,
    vertices,
    seed,
    width: graphWidth,
    height: graphHeight
  };
};

export const findGridCell = (x: number, y: number, grid: Grid): number => {
  return (
    Math.floor(Math.min(y / grid.spacing, grid.cellsY - 1)) * grid.cellsX +
    Math.floor(Math.min(x / grid.spacing, grid.cellsX - 1))
  );
};
