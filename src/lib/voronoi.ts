import type Delaunator from "delaunator";
import type {Point} from "./utils";

export type Vertices = {p: Point[]; v: number[][]; c: number[][]};

export type Cells = {
  v: number[][];
  c: number[][];
  b: number[];
  i: Uint32Array;
  h?: Uint8Array;
};

export class Voronoi {
  cells: Cells = {v: [], c: [], b: [], i: new Uint32Array()};
  vertices: Vertices = {p: [], v: [], c: []};

  constructor(
    private delaunay: Delaunator<Float64Array>,
    private points: Point[],
    private pointsN: number
  ) {
    for (let edge = 0; edge < this.delaunay.triangles.length; edge++) {
      const point = this.delaunay.triangles[this.nextHalfedge(edge)];

      if (point < this.pointsN && !this.cells.c[point]) {
        const edges = this.edgesAroundPoint(edge);
        this.cells.v[point] = edges.map(item => this.triangleOfEdge(item));
        this.cells.c[point] = edges
          .map(item => this.delaunay.triangles[item])
          .filter(cell => cell < this.pointsN);
        this.cells.b[point] = edges.length > this.cells.c[point].length ? 1 : 0;
      }

      const triangle = this.triangleOfEdge(edge);
      if (!this.vertices.p[triangle]) {
        this.vertices.p[triangle] = this.triangleCenter(triangle);
        this.vertices.v[triangle] = this.trianglesAdjacentToTriangle(triangle);
        this.vertices.c[triangle] = this.pointsOfTriangle(triangle);
      }
    }
  }

  private pointsOfTriangle(triangleIndex: number): [number, number, number] {
    return this.edgesOfTriangle(triangleIndex).map(edge => this.delaunay.triangles[edge]) as [
      number,
      number,
      number
    ];
  }

  private trianglesAdjacentToTriangle(triangleIndex: number): number[] {
    const triangles = [];
    for (const edge of this.edgesOfTriangle(triangleIndex)) {
      const opposite = this.delaunay.halfedges[edge];
      triangles.push(this.triangleOfEdge(opposite));
    }
    return triangles;
  }

  private edgesAroundPoint(start: number): [number, number, number] {
    const result = [];
    let incoming = start;
    do {
      result.push(incoming);
      const outgoing = this.nextHalfedge(incoming);
      incoming = this.delaunay.halfedges[outgoing];
    } while (incoming !== -1 && incoming !== start && result.length < 20);
    return result as [number, number, number];
  }

  private triangleCenter(triangleIndex: number): Point {
    const vertices = this.pointsOfTriangle(triangleIndex).map(point => this.points[point]);
    return this.circumcenter(vertices[0], vertices[1], vertices[2]);
  }

  private edgesOfTriangle(triangleIndex: number): [number, number, number] {
    return [3 * triangleIndex, 3 * triangleIndex + 1, 3 * triangleIndex + 2];
  }

  private triangleOfEdge(edge: number): number {
    return Math.floor(edge / 3);
  }

  private nextHalfedge(edge: number): number {
    return edge % 3 === 2 ? edge - 2 : edge + 1;
  }

  private circumcenter(a: Point, b: Point, c: Point): Point {
    const [ax, ay] = a;
    const [bx, by] = b;
    const [cx, cy] = c;
    const ad = ax * ax + ay * ay;
    const bd = bx * bx + by * by;
    const cd = cx * cx + cy * cy;
    const divisor = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    return [
      Math.floor((ad * (by - cy) + bd * (cy - ay) + cd * (ay - by)) / divisor),
      Math.floor((ad * (cx - bx) + bd * (ax - cx) + cd * (bx - ax)) / divisor)
    ];
  }
}
