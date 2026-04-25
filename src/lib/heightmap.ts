import Alea from "alea";
import {findGridCell, type Grid} from "./grid";
import {heightmapTemplates, precreatedHeightmaps, type HeightmapId, type HeightmapTemplateId} from "./templates";
import {createTypedArray, d3Range, getNumberInRange, leastIndex, lim, mean, minmax, P, rand} from "./utils";

type Tool = "Hill" | "Pit" | "Range" | "Trough" | "Strait" | "Mask" | "Invert" | "Add" | "Multiply" | "Smooth";

const getBlobPower = (cells: number): number => {
  const blobPowerMap: Record<number, number> = {
    1000: 0.93,
    2000: 0.95,
    5000: 0.97,
    10000: 0.98,
    20000: 0.99,
    30000: 0.991,
    40000: 0.993,
    50000: 0.994,
    60000: 0.995,
    70000: 0.9955,
    80000: 0.996,
    90000: 0.9964,
    100000: 0.9973
  };
  return blobPowerMap[cells] || 0.98;
};

const getLinePower = (cells: number): number => {
  const linePowerMap: Record<number, number> = {
    1000: 0.75,
    2000: 0.77,
    5000: 0.79,
    10000: 0.81,
    20000: 0.82,
    30000: 0.83,
    40000: 0.84,
    50000: 0.86,
    60000: 0.87,
    70000: 0.88,
    80000: 0.91,
    90000: 0.92,
    100000: 0.93
  };

  return linePowerMap[cells] || 0.81;
};

export class HeightmapGenerator {
  private grid: Grid | null = null;
  private heights: Uint8Array | null = null;
  private blobPower = 0;
  private linePower = 0;

  setGraph(graph: Grid): void {
    const {cellsDesired, cells, points} = graph;
    this.heights = cells.h
      ? Uint8Array.from(cells.h)
      : (createTypedArray({
          maxValue: 100,
          length: points.length
        }) as Uint8Array);
    this.blobPower = getBlobPower(cellsDesired);
    this.linePower = getLinePower(cellsDesired);
    this.grid = graph;
  }

  async generate(graph: Grid, id: HeightmapId, seed: string): Promise<Uint8Array> {
    Math.random = Alea(seed);
    const isTemplate = id in heightmapTemplates;
    const heights = isTemplate
      ? this.fromTemplate(graph, id as HeightmapTemplateId)
      : await this.fromPrecreated(graph, id);

    this.clearData();
    return heights;
  }

  fromTemplate(graph: Grid, id: HeightmapTemplateId): Uint8Array {
    const templateString = heightmapTemplates[id]?.template || "";
    const steps = templateString.split("\n");
    if (!steps.length) throw new Error(`Heightmap template has no steps: ${id}`);

    this.setGraph(graph);
    for (const step of steps) {
      const elements = step.trim().split(" ");
      if (elements.length < 2) throw new Error(`Invalid heightmap template step: ${step}`);
      this.addStep(...(elements as [Tool, string, string, string, string]));
    }

    return Uint8Array.from(this.heights ?? []);
  }

  getHeights(): Uint8Array | null {
    return this.heights;
  }

  private clearData(): void {
    this.heights = null;
    this.grid = null;
  }

  private getPointInRange(range: string, length: number): number | undefined {
    if (typeof range !== "string") return undefined;
    const min = parseInt(range.split("-")[0], 10) / 100 || 0;
    const max = parseInt(range.split("-")[1], 10) / 100 || min;
    return rand(min * length, max * length);
  }

  private addHill(count: string, height: string, rangeX: string, rangeY: string): void {
    const addOneHill = () => {
      if (!this.heights || !this.grid) return;
      const change = new Uint8Array(this.heights.length);
      let limit = 0;
      let start = 0;
      const h = lim(getNumberInRange(height));

      do {
        const x = this.getPointInRange(rangeX, this.grid.width);
        const y = this.getPointInRange(rangeY, this.grid.height);
        if (x === undefined || y === undefined) return;
        start = findGridCell(x, y, this.grid);
        limit++;
      } while (this.heights[start] + h > 90 && limit < 50);

      change[start] = h;
      const queue = [start];

      while (queue.length) {
        const q = queue.shift() as number;
        for (const cell of this.grid.cells.c[q]) {
          if (change[cell]) continue;
          change[cell] = change[q] ** this.blobPower * (Math.random() * 0.2 + 0.9);
          if (change[cell] > 1) queue.push(cell);
        }
      }

      this.heights = this.heights.map((item, index) => lim(item + change[index]));
    };

    const desiredHillCount = getNumberInRange(count);
    for (let index = 0; index < desiredHillCount; index++) addOneHill();
  }

  private addPit(count: string, height: string, rangeX: string, rangeY: string): void {
    const addOnePit = () => {
      if (!this.heights || !this.grid) return;
      const used = new Uint8Array(this.heights.length);
      let limit = 0;
      let start = 0;
      let h = lim(getNumberInRange(height));

      do {
        const x = this.getPointInRange(rangeX, this.grid.width);
        const y = this.getPointInRange(rangeY, this.grid.height);
        if (x === undefined || y === undefined) return;
        start = findGridCell(x, y, this.grid);
        limit++;
      } while (this.heights[start] < 20 && limit < 50);

      const queue = [start];
      while (queue.length) {
        const q = queue.shift() as number;
        h = h ** this.blobPower * (Math.random() * 0.2 + 0.9);
        if (h < 1) return;

        this.grid.cells.c[q].forEach(cell => {
          if (used[cell] || this.heights === null) return;
          this.heights[cell] = lim(this.heights[cell] - h * (Math.random() * 0.2 + 0.9));
          used[cell] = 1;
          queue.push(cell);
        });
      }
    };

    const desiredPitCount = getNumberInRange(count);
    for (let index = 0; index < desiredPitCount; index++) addOnePit();
  }

  private addRange(
    count: string,
    height: string,
    rangeX: string,
    rangeY: string,
    startCellId?: number,
    endCellId?: number
  ): void {
    if (!this.heights || !this.grid) return;

    const addOneRange = () => {
      if (!this.heights || !this.grid) return;

      const used = new Uint8Array(this.heights.length);
      let h = lim(getNumberInRange(height));

      const getRange = (cur: number, end: number) => {
        const range = [cur];
        const points = this.grid!.points;
        used[cur] = 1;

        while (cur !== end) {
          let min = Infinity;
          this.grid!.cells.c[cur].forEach(cell => {
            if (used[cell]) return;
            let diff = (points[end][0] - points[cell][0]) ** 2 + (points[end][1] - points[cell][1]) ** 2;
            if (Math.random() > 0.85) diff = diff / 2;
            if (diff < min) {
              min = diff;
              cur = cell;
            }
          });
          if (min === Infinity) return range;
          range.push(cur);
          used[cur] = 1;
        }

        return range;
      };

      if (rangeX && rangeY) {
        const startX = this.getPointInRange(rangeX, this.grid.width) as number;
        const startY = this.getPointInRange(rangeY, this.grid.height) as number;

        let dist = 0;
        let limit = 0;
        let endY = 0;
        let endX = 0;

        do {
          endX = Math.random() * this.grid.width * 0.8 + this.grid.width * 0.1;
          endY = Math.random() * this.grid.height * 0.7 + this.grid.height * 0.15;
          dist = Math.abs(endY - startY) + Math.abs(endX - startX);
          limit++;
        } while ((dist < this.grid.width / 8 || dist > this.grid.width / 3) && limit < 50);

        startCellId = findGridCell(startX, startY, this.grid);
        endCellId = findGridCell(endX, endY, this.grid);
      }

      const range = getRange(startCellId as number, endCellId as number);

      let queue = range.slice();
      let ring = 0;
      while (queue.length) {
        const frontier = queue.slice();
        queue = [];
        ring++;
        frontier.forEach(cell => {
          if (!this.heights) return;
          this.heights[cell] = lim(this.heights[cell] + h * (Math.random() * 0.3 + 0.85));
        });
        h = h ** this.linePower - 1;
        if (h < 2) break;
        frontier.forEach(frontierCell => {
          this.grid!.cells.c[frontierCell].forEach(cell => {
            if (!used[cell]) {
              queue.push(cell);
              used[cell] = 1;
            }
          });
        });
      }

      range.forEach((currentCell, distanceFromStart) => {
        if (distanceFromStart % 6 !== 0) return;
        let cur = currentCell;
        for (const _level of d3Range(ring)) {
          const index = leastIndex(this.grid!.cells.c[cur], (a, b) => this.heights![a] - this.heights![b]);
          if (index === undefined) continue;
          const min = this.grid!.cells.c[cur][index];
          this.heights![min] = (this.heights![cur] * 2 + this.heights![min]) / 3;
          cur = min;
        }
      });
    };

    const desiredRangeCount = getNumberInRange(count);
    for (let index = 0; index < desiredRangeCount; index++) addOneRange();
  }

  private addTrough(
    count: string,
    height: string,
    rangeX: string,
    rangeY: string,
    startCellId?: number,
    endCellId?: number
  ): void {
    const addOneTrough = () => {
      if (!this.heights || !this.grid) return;

      const used = new Uint8Array(this.heights.length);
      let h = lim(getNumberInRange(height));

      const getRange = (cur: number, end: number) => {
        const range = [cur];
        const points = this.grid!.points;
        used[cur] = 1;

        while (cur !== end) {
          let min = Infinity;
          this.grid!.cells.c[cur].forEach(cell => {
            if (used[cell]) return;
            let diff = (points[end][0] - points[cell][0]) ** 2 + (points[end][1] - points[cell][1]) ** 2;
            if (Math.random() > 0.8) diff = diff / 2;
            if (diff < min) {
              min = diff;
              cur = cell;
            }
          });
          if (min === Infinity) return range;
          range.push(cur);
          used[cur] = 1;
        }

        return range;
      };

      if (rangeX && rangeY) {
        let limit = 0;
        let startX = 0;
        let startY = 0;
        let dist = 0;
        let endX = 0;
        let endY = 0;

        do {
          startX = this.getPointInRange(rangeX, this.grid.width) as number;
          startY = this.getPointInRange(rangeY, this.grid.height) as number;
          startCellId = findGridCell(startX, startY, this.grid);
          limit++;
        } while (this.heights[startCellId] < 20 && limit < 50);

        limit = 0;
        do {
          endX = Math.random() * this.grid.width * 0.8 + this.grid.width * 0.1;
          endY = Math.random() * this.grid.height * 0.7 + this.grid.height * 0.15;
          dist = Math.abs(endY - startY) + Math.abs(endX - startX);
          limit++;
        } while ((dist < this.grid.width / 8 || dist > this.grid.width / 2) && limit < 50);

        endCellId = findGridCell(endX, endY, this.grid);
      }

      const range = getRange(startCellId as number, endCellId as number);

      let queue = range.slice();
      let ring = 0;
      while (queue.length) {
        const frontier = queue.slice();
        queue = [];
        ring++;
        frontier.forEach(cell => {
          this.heights![cell] = lim(this.heights![cell] - h * (Math.random() * 0.3 + 0.85));
        });
        h = h ** this.linePower - 1;
        if (h < 2) break;
        frontier.forEach(frontierCell => {
          this.grid!.cells.c[frontierCell].forEach(cell => {
            if (!used[cell]) {
              queue.push(cell);
              used[cell] = 1;
            }
          });
        });
      }

      range.forEach((currentCell, distanceFromStart) => {
        if (distanceFromStart % 6 !== 0) return;
        let cur = currentCell;
        for (const _level of d3Range(ring)) {
          const index = leastIndex(this.grid!.cells.c[cur], (a, b) => this.heights![a] - this.heights![b]);
          if (index === undefined) continue;
          const min = this.grid!.cells.c[cur][index];
          this.heights![min] = (this.heights![cur] * 2 + this.heights![min]) / 3;
          cur = min;
        }
      });
    };

    const desiredTroughCount = getNumberInRange(count);
    for (let index = 0; index < desiredTroughCount; index++) addOneTrough();
  }

  private addStrait(width: string, direction = "vertical"): void {
    if (!this.heights || !this.grid) return;
    const desiredWidth = Math.min(getNumberInRange(width), this.grid.cellsX / 3);
    if (desiredWidth < 1 && P(desiredWidth)) return;

    const used = new Uint8Array(this.heights.length);
    const vertical = direction === "vertical";
    const startX = vertical ? Math.floor(Math.random() * this.grid.width * 0.4 + this.grid.width * 0.3) : 5;
    const startY = vertical ? 5 : Math.floor(Math.random() * this.grid.height * 0.4 + this.grid.height * 0.3);
    const endX = vertical
      ? Math.floor(this.grid.width - startX - this.grid.width * 0.1 + Math.random() * this.grid.width * 0.2)
      : this.grid.width - 5;
    const endY = vertical
      ? this.grid.height - 5
      : Math.floor(this.grid.height - startY - this.grid.height * 0.1 + Math.random() * this.grid.height * 0.2);

    const start = findGridCell(startX, startY, this.grid);
    const end = findGridCell(endX, endY, this.grid);

    const getRange = (cur: number, target: number) => {
      const range = [];
      const points = this.grid!.points;
      while (cur !== target) {
        let min = Infinity;
        this.grid!.cells.c[cur].forEach(cell => {
          let diff = (points[target][0] - points[cell][0]) ** 2 + (points[target][1] - points[cell][1]) ** 2;
          if (Math.random() > 0.8) diff = diff / 2;
          if (diff < min) {
            min = diff;
            cur = cell;
          }
        });
        range.push(cur);
      }
      return range;
    };

    let range = getRange(start, end);
    const query: number[] = [];
    const step = 0.1 / desiredWidth;

    for (let index = 0; index < desiredWidth; index++) {
      const exponent = 0.9 - step * desiredWidth;
      range.forEach(rangeCell => {
        this.grid!.cells.c[rangeCell].forEach(cell => {
          if (used[cell]) return;
          used[cell] = 1;
          query.push(cell);
          this.heights![cell] **= exponent;
          if (this.heights![cell] > 100) this.heights![cell] = 5;
        });
      });
      range = query.slice();
    }
  }

  private modify(range: string, add: number, mult: number, power?: number): void {
    if (!this.heights) return;
    const min = range === "land" ? 20 : range === "all" ? 0 : +range.split("-")[0];
    const max = range === "land" || range === "all" ? 100 : +range.split("-")[1];
    const isLand = min === 20;

    this.heights = this.heights.map(height => {
      if (height < min || height > max) return height;
      if (add) height = isLand ? Math.max(height + add, 20) : height + add;
      if (mult !== 1) height = isLand ? (height - 20) * mult + 20 : height * mult;
      if (power) height = isLand ? (height - 20) ** power + 20 : height ** power;
      return lim(height);
    });
  }

  private smooth(factor = 2, add = 0): void {
    if (!this.heights || !this.grid) return;
    this.heights = this.heights.map((height, index) => {
      const values = [height];
      this.grid!.cells.c[index].forEach(cell => values.push(this.heights![cell]));
      if (factor === 1) return mean(values) + add;
      return lim((height * (factor - 1) + mean(values) + add) / factor);
    });
  }

  private mask(power = 1): void {
    if (!this.heights || !this.grid) return;
    const factor = power ? Math.abs(power) : 1;

    this.heights = this.heights.map((height, index) => {
      const [x, y] = this.grid!.points[index];
      const nx = (2 * x) / this.grid!.width - 1;
      const ny = (2 * y) / this.grid!.height - 1;
      let distance = (1 - nx ** 2) * (1 - ny ** 2);
      if (power < 0) distance = 1 - distance;
      const masked = height * distance;
      return lim((height * (factor - 1) + masked) / factor);
    });
  }

  private invert(count: number, axes: string): void {
    if (!P(count) || !this.heights || !this.grid) return;
    const invertX = axes !== "y";
    const invertY = axes !== "x";
    const {cellsX, cellsY} = this.grid;

    this.heights = this.heights.map((_height, index) => {
      const x = index % cellsX;
      const y = Math.floor(index / cellsX);
      const nx = invertX ? cellsX - x - 1 : x;
      const ny = invertY ? cellsY - y - 1 : y;
      const invertedIndex = nx + ny * cellsX;
      return this.heights![invertedIndex];
    });
  }

  private addStep(tool: Tool, a2: string, a3: string, a4: string, a5: string): void {
    if (tool === "Hill") return this.addHill(a2, a3, a4, a5);
    if (tool === "Pit") return this.addPit(a2, a3, a4, a5);
    if (tool === "Range") return this.addRange(a2, a3, a4, a5);
    if (tool === "Trough") return this.addTrough(a2, a3, a4, a5);
    if (tool === "Strait") return this.addStrait(a2, a3);
    if (tool === "Mask") return this.mask(+a2);
    if (tool === "Invert") return this.invert(+a2, a3);
    if (tool === "Add") return this.modify(a3, +a2, 1);
    if (tool === "Multiply") return this.modify(a3, 0, +a2);
    if (tool === "Smooth") return this.smooth(+a2);
  }

  private getHeightsFromImageData(imageData: Uint8ClampedArray): void {
    if (!this.heights) return;
    for (let index = 0; index < this.heights.length; index++) {
      const lightness = imageData[index * 4] / 255;
      const powered = lightness < 0.2 ? lightness : 0.2 + (lightness - 0.2) ** 0.8;
      this.heights[index] = minmax(Math.floor(powered * 100), 0, 100);
    }
  }

  private fromPrecreated(graph: Grid, id: HeightmapId): Promise<Uint8Array> {
    if (!(id in precreatedHeightmaps)) throw new Error(`Unknown precreated heightmap: ${id}`);

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const {cellsX, cellsY} = graph;
      canvas.width = cellsX;
      canvas.height = cellsY;

      const image = new Image();
      const base = import.meta.env.BASE_URL || "./";
      image.src = `${base.replace(/\/?$/, "/")}heightmaps/${id}.png`;
      image.onload = () => {
        if (!context) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        this.heights = this.heights || new Uint8Array(cellsX * cellsY);
        context.drawImage(image, 0, 0, cellsX, cellsY);
        const imageData = context.getImageData(0, 0, cellsX, cellsY);
        this.setGraph(graph);
        this.getHeightsFromImageData(imageData.data);
        resolve(Uint8Array.from(this.heights ?? []));
      };
      image.onerror = () => reject(new Error(`Could not load heightmap image: ${id}`));
    });
  }
}
