import "./styles.css";
import Alea from "alea";
import {generateGrid, type Grid} from "./lib/grid";
import {HeightmapGenerator} from "./lib/heightmap";
import {
  allHeightmaps,
  heightmapTemplates,
  precreatedHeightmaps,
  type HeightmapId
} from "./lib/templates";
import {clampPoint, distance, minmax, type Point} from "./lib/utils";

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 700;
const STORAGE_KEY = "fantasy-world-map-state-v1";
const SEA_LEVEL = 20;
const TERRAIN_RASTER_SCALE = 4;

type StrokeKind = "border" | "road";
type Tool = StrokeKind | "capital" | "town";
type RenderStyle = "terrain" | "height" | "relief";
type Biome =
  | "deep-ocean"
  | "ocean"
  | "shallows"
  | "lake"
  | "beach"
  | "marsh"
  | "desert"
  | "savanna"
  | "grassland"
  | "woodland"
  | "forest"
  | "rainforest"
  | "taiga"
  | "tundra"
  | "highland"
  | "mountain"
  | "snow";

const BIOME_PALETTE: Record<Biome, [number, number, number]> = {
  "deep-ocean": [9, 33, 55],
  ocean: [21, 72, 102],
  shallows: [66, 132, 136],
  lake: [42, 105, 125],
  beach: [210, 197, 138],
  marsh: [91, 127, 78],
  desert: [198, 166, 99],
  savanna: [158, 154, 89],
  grassland: [91, 145, 84],
  woodland: [70, 126, 78],
  forest: [48, 103, 68],
  rainforest: [34, 98, 70],
  taiga: [73, 111, 96],
  tundra: [143, 150, 126],
  highland: [124, 128, 86],
  mountain: [125, 111, 92],
  snow: [232, 231, 218]
};

const ELEVATION_STOPS: Array<[number, [number, number, number]]> = [
  [0, [6, 28, 61]],
  [8, [18, 69, 111]],
  [16, [56, 131, 151]],
  [SEA_LEVEL, [102, 178, 176]],
  [23, [226, 207, 135]],
  [32, [132, 171, 89]],
  [48, [86, 139, 75]],
  [62, [154, 147, 91]],
  [76, [151, 113, 83]],
  [88, [190, 179, 155]],
  [100, [248, 246, 230]]
];

const RELIEF_STOPS: Array<[number, [number, number, number]]> = [
  [0, [8, 31, 56]],
  [12, [27, 86, 118]],
  [SEA_LEVEL, [75, 145, 143]],
  [24, [217, 198, 132]],
  [36, [112, 157, 86]],
  [54, [89, 128, 78]],
  [68, [143, 131, 85]],
  [82, [135, 103, 82]],
  [100, [232, 229, 213]]
];

interface Stroke {
  id: string;
  kind: StrokeKind;
  color: string;
  width: number;
  points: Point[];
}

interface Settlement {
  id: string;
  kind: "capital" | "town";
  x: number;
  y: number;
}

interface StoredState {
  seed: string;
  heightmapId: HeightmapId;
  cellsDesired: number;
  renderStyle: RenderStyle;
  setupPanelOpen: boolean;
  creationMode: boolean;
  activeTool: Tool;
  borderColor: string;
  roadColor: string;
  borderWidth: number;
  roadWidth: number;
  snapRoads: boolean;
  strokes: Stroke[];
  settlements: Settlement[];
}

const defaultState: StoredState = {
  seed: "20260425",
  heightmapId: "continents",
  cellsDesired: 20000,
  renderStyle: "terrain",
  setupPanelOpen: false,
  creationMode: false,
  activeTool: "border",
  borderColor: "#b92e3a",
  roadColor: "#7c5a2b",
  borderWidth: 5,
  roadWidth: 4,
  snapRoads: true,
  strokes: [],
  settlements: []
};

interface Viewport {
  scale: number;
  x: number;
  y: number;
}

interface TerrainCell {
  path: Path2D;
  color: string;
  height: number;
  point: Point;
  biome: Biome;
  moisture: number;
  temperature: number;
  ruggedness: number;
  isCoast: boolean;
  isLake: boolean;
}

interface River {
  id: string;
  cells: number[];
  points: Point[];
  width: number;
}

interface NaturalSymbol {
  id: string;
  kind: "tree" | "peak" | "hill" | "marsh" | "reef";
  x: number;
  y: number;
  size: number;
  angle: number;
  color: string;
}

interface AtlasData {
  lakeCells: Set<number>;
  riverCells: Set<number>;
  coastCells: Set<number>;
  rivers: River[];
  symbols: NaturalSymbol[];
  texture: NaturalSymbol[];
}

let state = loadState();
let grid: Grid | null = null;
let heights: Uint8Array | null = null;
let currentStroke: Stroke | null = null;
let activePointerId: number | null = null;
let actionHistory: Array<{type: "stroke" | "settlement"; id: string}> = [];
let deferredInstallPrompt: Event | null = null;
let terrainCells: TerrainCell[] = [];
let heightField = new Float32Array();
let moistureField = new Float32Array();
let temperatureField = new Float32Array();
let ruggednessField = new Float32Array();
let lakeField = new Float32Array();
let terrainRasterCanvas = document.createElement("canvas");
let atlas: AtlasData = {
  lakeCells: new Set(),
  riverCells: new Set(),
  coastCells: new Set(),
  rivers: [],
  symbols: [],
  texture: []
};
let viewport: Viewport = {scale: 1, x: 0, y: 0};
let minScale = 1;
let fitScale = 1;
let stageSize = {width: 0, height: 0};
let viewportInitialized = false;
let activePointers = new Map<number, Point>();
let gesture:
  | {type: "pan"; last: Point}
  | {type: "pinch"; distance: number; scale: number; center: Point; worldCenter: Point}
  | {type: "draw"}
  | null = null;
let lastOrientation = getOrientation();

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

updateViewportVars();

app.innerHTML = `
  <div class="shell ${state.creationMode ? "creation" : ""} ${state.setupPanelOpen ? "setup-open" : ""}" id="shell">
    <header class="topbar" id="topbar">
      <div class="field compact">
        <span>Template</span>
        <select id="heightmapSelect"></select>
      </div>
      <div class="field seed-field">
        <span>Seed</span>
        <input id="seedInput" inputmode="numeric" autocomplete="off" />
      </div>
      <div class="field compact">
        <span>Detail</span>
        <select id="detailSelect">
          <option value="10000">10k</option>
          <option value="20000">20k</option>
          <option value="30000">30k</option>
          <option value="50000">50k</option>
        </select>
      </div>
      <div class="field compact">
        <span>View</span>
        <select id="renderSelect">
          <option value="terrain">Terrain</option>
          <option value="height">Elevation</option>
          <option value="relief">Physical</option>
        </select>
      </div>
      <button class="button primary" id="generateButton" type="button">Generate</button>
      <button class="button" id="randomButton" type="button">Random</button>
    </header>

    <main class="map-stage" id="mapStage" aria-label="Fantasy world map editor">
      <canvas id="mapCanvas"></canvas>
      <canvas id="editCanvas"></canvas>
      <div class="loading" id="loading">Generating terrain</div>
      <div class="status-pill" id="statusPill"></div>
    </main>

    <nav class="floatbar" aria-label="Map actions">
      <button class="button glass" id="setupToggle" type="button"></button>
      <button class="button glass" id="creationToggle" type="button"></button>
      <button class="button glass creation-only" id="toolsToggle" type="button">Tools</button>
      <button class="button glass" id="installButton" type="button" hidden>Install</button>
    </nav>

    <nav class="zoombar" aria-label="Map zoom controls">
      <button class="button glass icon-button" id="zoomOutButton" type="button" aria-label="Zoom out">-</button>
      <button class="button glass fit-button" id="zoomFitButton" type="button">Fit</button>
      <button class="button glass icon-button" id="zoomInButton" type="button" aria-label="Zoom in">+</button>
    </nav>

    <section class="editor-drawer" id="editorDrawer" aria-label="Creation tools">
      <div class="drawer-grip"></div>
      <div class="tool-grid" role="group" aria-label="Tool">
        <button class="tool-button" data-tool="border" type="button">Border</button>
        <button class="tool-button" data-tool="road" type="button">Road</button>
        <button class="tool-button" data-tool="capital" type="button">Capital</button>
        <button class="tool-button" data-tool="town" type="button">Town</button>
      </div>
      <div class="drawer-fields">
        <label class="field">
          <span>Border color</span>
          <input id="borderColor" type="color" />
        </label>
        <label class="field">
          <span>Border width</span>
          <input id="borderWidth" type="range" min="1" max="18" step="1" />
        </label>
        <label class="field">
          <span>Road color</span>
          <input id="roadColor" type="color" />
        </label>
        <label class="field">
          <span>Road width</span>
          <input id="roadWidth" type="range" min="1" max="14" step="1" />
        </label>
      </div>
      <label class="toggle-row">
        <input id="snapRoads" type="checkbox" />
        <span>Snap roads</span>
      </label>
      <div class="drawer-actions">
        <button class="button" id="undoButton" type="button">Undo</button>
        <button class="button" id="clearButton" type="button">Clear</button>
        <button class="button" id="exportButton" type="button">PNG</button>
      </div>
    </section>
  </div>
`;

const shell = document.querySelector<HTMLDivElement>("#shell")!;
const mapStage = document.querySelector<HTMLElement>("#mapStage")!;
const mapCanvas = document.querySelector<HTMLCanvasElement>("#mapCanvas")!;
const editCanvas = document.querySelector<HTMLCanvasElement>("#editCanvas")!;
const loading = document.querySelector<HTMLDivElement>("#loading")!;
const statusPill = document.querySelector<HTMLDivElement>("#statusPill")!;
const editorDrawer = document.querySelector<HTMLElement>("#editorDrawer")!;
const setupToggle = document.querySelector<HTMLButtonElement>("#setupToggle")!;
const creationToggle = document.querySelector<HTMLButtonElement>("#creationToggle")!;
const toolsToggle = document.querySelector<HTMLButtonElement>("#toolsToggle")!;
const installButton = document.querySelector<HTMLButtonElement>("#installButton")!;
const zoomOutButton = document.querySelector<HTMLButtonElement>("#zoomOutButton")!;
const zoomFitButton = document.querySelector<HTMLButtonElement>("#zoomFitButton")!;
const zoomInButton = document.querySelector<HTMLButtonElement>("#zoomInButton")!;
const seedInput = document.querySelector<HTMLInputElement>("#seedInput")!;
const heightmapSelect = document.querySelector<HTMLSelectElement>("#heightmapSelect")!;
const detailSelect = document.querySelector<HTMLSelectElement>("#detailSelect")!;
const renderSelect = document.querySelector<HTMLSelectElement>("#renderSelect")!;
const generateButton = document.querySelector<HTMLButtonElement>("#generateButton")!;
const randomButton = document.querySelector<HTMLButtonElement>("#randomButton")!;
const borderColor = document.querySelector<HTMLInputElement>("#borderColor")!;
const roadColor = document.querySelector<HTMLInputElement>("#roadColor")!;
const borderWidth = document.querySelector<HTMLInputElement>("#borderWidth")!;
const roadWidth = document.querySelector<HTMLInputElement>("#roadWidth")!;
const snapRoads = document.querySelector<HTMLInputElement>("#snapRoads")!;
const undoButton = document.querySelector<HTMLButtonElement>("#undoButton")!;
const clearButton = document.querySelector<HTMLButtonElement>("#clearButton")!;
const exportButton = document.querySelector<HTMLButtonElement>("#exportButton")!;

const generator = new HeightmapGenerator();

populateHeightmapSelect();
hydrateControls();
bindEvents();
resizeCanvases();
void regenerateMap();

function loadState(): StoredState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {...defaultState};

  try {
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      ...defaultState,
      ...parsed,
      strokes: Array.isArray(parsed.strokes) ? parsed.strokes : [],
      settlements: Array.isArray(parsed.settlements) ? parsed.settlements : []
    };
  } catch {
    return {...defaultState};
  }
}

function saveState(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populateHeightmapSelect(): void {
  const templateOptions = Object.entries(heightmapTemplates)
    .map(([id, item]) => `<option value="${id}">${item.name}</option>`)
    .join("");
  const precreatedOptions = Object.entries(precreatedHeightmaps)
    .map(([id, item]) => `<option value="${id}">${item.name}</option>`)
    .join("");

  heightmapSelect.innerHTML = `
    <optgroup label="Procedural">${templateOptions}</optgroup>
    <optgroup label="Precreated">${precreatedOptions}</optgroup>
  `;
}

function hydrateControls(): void {
  seedInput.value = state.seed;
  heightmapSelect.value = state.heightmapId;
  detailSelect.value = String(state.cellsDesired);
  renderSelect.value = state.renderStyle;
  borderColor.value = state.borderColor;
  roadColor.value = state.roadColor;
  borderWidth.value = String(state.borderWidth);
  roadWidth.value = String(state.roadWidth);
  snapRoads.checked = state.snapRoads;
  if (isCompactLandscape()) state.setupPanelOpen = false;
  updateSetupUi();
  updateModeUi();
  updateToolButtons();
}

function bindEvents(): void {
  window.addEventListener("resize", () => {
    updateViewportVars();
    const orientation = getOrientation();
    if (orientation !== lastOrientation) {
      lastOrientation = orientation;
      if (orientation === "landscape" && isCompactViewport()) {
        state.setupPanelOpen = false;
        saveState();
      }
      updateSetupUi();
    }
    resizeCanvases();
    renderAll();
  });

  window.visualViewport?.addEventListener("resize", () => {
    updateViewportVars();
    resizeCanvases();
    renderAll();
  });

  generateButton.addEventListener("click", () => {
    state.seed = seedInput.value.trim() || state.seed;
    state.heightmapId = heightmapSelect.value as HeightmapId;
    state.cellsDesired = Number(detailSelect.value);
    state.renderStyle = renderSelect.value as RenderStyle;
    saveState();
    void regenerateMap();
  });

  randomButton.addEventListener("click", () => {
    state.seed = String(Math.floor(Math.random() * 1e9));
    seedInput.value = state.seed;
    saveState();
    void regenerateMap();
  });

  heightmapSelect.addEventListener("change", () => {
    state.heightmapId = heightmapSelect.value as HeightmapId;
    saveState();
    void regenerateMap();
  });

  detailSelect.addEventListener("change", () => {
    state.cellsDesired = Number(detailSelect.value);
    saveState();
    void regenerateMap();
  });

  renderSelect.addEventListener("change", () => {
    state.renderStyle = renderSelect.value as RenderStyle;
    saveState();
    buildTerrainCells();
    renderBaseMap();
  });

  setupToggle.addEventListener("click", () => {
    state.setupPanelOpen = !state.setupPanelOpen;
    saveState();
    updateSetupUi();
  });

  creationToggle.addEventListener("click", () => {
    state.creationMode = !state.creationMode;
    if (!state.creationMode) editorDrawer.classList.remove("open");
    saveState();
    updateModeUi();
  });

  toolsToggle.addEventListener("click", () => {
    editorDrawer.classList.toggle("open");
  });

  document.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach(button => {
    button.addEventListener("click", () => {
      state.activeTool = button.dataset.tool as Tool;
      saveState();
      updateToolButtons();
    });
  });

  borderColor.addEventListener("input", () => {
    state.borderColor = borderColor.value;
    saveState();
  });

  roadColor.addEventListener("input", () => {
    state.roadColor = roadColor.value;
    saveState();
  });

  borderWidth.addEventListener("input", () => {
    state.borderWidth = Number(borderWidth.value);
    saveState();
  });

  roadWidth.addEventListener("input", () => {
    state.roadWidth = Number(roadWidth.value);
    saveState();
  });

  snapRoads.addEventListener("change", () => {
    state.snapRoads = snapRoads.checked;
    saveState();
  });

  undoButton.addEventListener("click", undoLastAction);
  clearButton.addEventListener("click", clearCreationLayer);
  exportButton.addEventListener("click", exportPng);

  zoomOutButton.addEventListener("click", () => zoomAt([stageSize.width / 2, stageSize.height / 2], 1 / 1.7));
  zoomInButton.addEventListener("click", () => zoomAt([stageSize.width / 2, stageSize.height / 2], 1.7));
  zoomFitButton.addEventListener("click", () => fitMap());

  mapStage.addEventListener(
    "wheel",
    event => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      zoomAt(eventToStagePoint(event), factor);
    },
    {passive: false}
  );

  editCanvas.addEventListener("pointerdown", onPointerDown);
  editCanvas.addEventListener("pointermove", onPointerMove);
  editCanvas.addEventListener("pointerup", onPointerUp);
  editCanvas.addEventListener("pointercancel", onPointerUp);

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    const prompt = deferredInstallPrompt as Event & {prompt?: () => Promise<void>};
    if (!prompt?.prompt) return;
    await prompt.prompt();
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const base = import.meta.env.BASE_URL || "./";
      navigator.serviceWorker.register(`${base.replace(/\/?$/, "/")}sw.js`).catch(() => undefined);
    });
  }
}

async function regenerateMap(): Promise<void> {
  loading.classList.add("visible");
  statusPill.textContent = "Generating";

  try {
    await new Promise(requestAnimationFrame);
    grid = generateGrid(state.seed, WORLD_WIDTH, WORLD_HEIGHT, state.cellsDesired);
    heights = await generator.generate(grid, state.heightmapId, state.seed);
    grid.cells.h = heights;
    buildTerrainCells();
    fitMap(false);
    renderBaseMap();
    renderEditLayer();
    const name = allHeightmaps[state.heightmapId]?.name || state.heightmapId;
    statusPill.textContent = `${name} / ${state.seed}`;
  } catch (error) {
    console.error(error);
    statusPill.textContent = "Generation failed";
  } finally {
    loading.classList.remove("visible");
  }
}

function resizeCanvases(): void {
  const rect = mapStage.getBoundingClientRect();
  const oldCenter = viewportInitialized ? screenToWorld([stageSize.width / 2, stageSize.height / 2]) : null;
  stageSize = {width: rect.width, height: rect.height};
  minScale = Math.min(stageSize.width / WORLD_WIDTH, stageSize.height / WORLD_HEIGHT);
  fitScale = getHomeScale();

  for (const canvas of [mapCanvas, editCanvas]) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(stageSize.width * dpr);
    canvas.height = Math.round(stageSize.height * dpr);
    canvas.style.width = `${stageSize.width}px`;
    canvas.style.height = `${stageSize.height}px`;
    canvas.style.left = "0";
    canvas.style.top = "0";
    const context = canvas.getContext("2d");
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if (!viewportInitialized) {
    fitMap(false);
    viewportInitialized = true;
    return;
  }

  if (oldCenter) {
    viewport.scale = minmax(viewport.scale, minScale, getMaxScale());
    viewport.x = stageSize.width / 2 - oldCenter[0] * viewport.scale;
    viewport.y = stageSize.height / 2 - oldCenter[1] * viewport.scale;
    clampViewport();
  }
}

function renderAll(): void {
  renderBaseMap();
  renderEditLayer();
}

function renderBaseMap(): void {
  const context = mapCanvas.getContext("2d")!;
  prepareScreenContext(context);
  drawTerrain(context, viewport, true);
}

function buildTerrainCells(): void {
  if (!grid || !heights) return;
  const lakeCells = generateLakeCells();
  const rivers = generateRivers(lakeCells);
  const riverCells = new Set<number>();
  for (const river of rivers) river.cells.forEach(cell => riverCells.add(cell));
  const coastCells = getCoastCells(lakeCells);
  atlas = {lakeCells, riverCells, coastCells, rivers, symbols: [], texture: []};
  heightField = new Float32Array(heights.length);
  moistureField = new Float32Array(heights.length);
  temperatureField = new Float32Array(heights.length);
  ruggednessField = new Float32Array(heights.length);
  lakeField = new Float32Array(heights.length);
  terrainCells = [];

  for (let index = 0; index < heights.length; index++) {
    const vertexIds = grid.cells.v[index];
    if (!vertexIds?.length) continue;
    const path = new Path2D();
    const first = grid.vertices.p[vertexIds[0]];
    if (!first) continue;
    path.moveTo(first[0], first[1]);

    for (const vertexId of vertexIds.slice(1)) {
      const point = grid.vertices.p[vertexId];
      if (point) path.lineTo(point[0], point[1]);
    }

    path.closePath();
    const height = heights[index] ?? 0;
    const shade = getHillshade(index, height);
    const isLake = lakeCells.has(index);
    const isCoast = coastCells.has(index);
    const moisture = getMoisture(index, isLake, riverCells.has(index), isCoast);
    const temperature = getTemperature(index, height);
    const ruggedness = getRuggedness(index, height);
    const biome = getBiome(height, moisture, temperature, ruggedness, isLake, isCoast);
    const [red, green, blue] = colorForCell(index, height, shade, biome, moisture, temperature, ruggedness);
    heightField[index] = height;
    moistureField[index] = moisture;
    temperatureField[index] = temperature;
    ruggednessField[index] = ruggedness;
    lakeField[index] = isLake ? 1 : 0;
    terrainCells.push({
      path,
      color: `rgb(${red} ${green} ${blue})`,
      height,
      point: grid.points[index],
      biome,
      moisture,
      temperature,
      ruggedness,
      isCoast,
      isLake
    });
  }

  atlas.symbols = generateNaturalSymbols();
  atlas.texture = generateTextureSymbols();
  buildTerrainRaster();
}

function drawTerrain(context: CanvasRenderingContext2D, view: Viewport, cull: boolean): void {
  const width = cull ? stageSize.width : context.canvas.width;
  const height = cull ? stageSize.height : context.canvas.height;
  drawSeaBackdrop(context, width, height);
  context.save();
  context.translate(view.x, view.y);
  context.scale(view.scale, view.scale);

  const bounds = getVisibleWorldBounds(view, 60, cull);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(terrainRasterCanvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  if (state.renderStyle !== "height") {
    drawMapTexture(context, view, bounds, cull);
    drawRiversLayer(context, bounds, cull);
    drawNaturalSymbols(context, view, bounds, cull);
  } else {
    drawCoastGlow(context);
  }

  context.restore();
  drawScreenAtmosphere(context, width, height);
}

function buildTerrainRaster(): void {
  if (!grid || !heightField.length) return;

  const rasterWidth = Math.round(WORLD_WIDTH * TERRAIN_RASTER_SCALE);
  const rasterHeight = Math.round(WORLD_HEIGHT * TERRAIN_RASTER_SCALE);
  terrainRasterCanvas.width = rasterWidth;
  terrainRasterCanvas.height = rasterHeight;

  const context = terrainRasterCanvas.getContext("2d", {alpha: false});
  if (!context) return;

  const rasterHeightField = smoothGridField(heightField, 3);
  const rasterMoistureField = smoothGridField(moistureField, 2);
  const rasterTemperatureField = smoothGridField(temperatureField, 2);
  const rasterRuggednessField = smoothGridField(ruggednessField, 1);
  const rasterLakeField = smoothGridField(lakeField, 1);
  const image = context.createImageData(rasterWidth, rasterHeight);
  const data = image.data;
  const cellsX = grid.cellsX;
  const cellsY = grid.cellsY;
  const maxX = cellsX - 1;
  const maxY = cellsY - 1;
  const spacing = grid.spacing;

  for (let py = 0; py < rasterHeight; py++) {
    const worldY = (py + 0.5) / TERRAIN_RASTER_SCALE;
    for (let px = 0; px < rasterWidth; px++) {
      const worldX = (px + 0.5) / TERRAIN_RASTER_SCALE;
      const warpX = (valueNoise2(worldX, worldY, 180, 57) - 0.5) * 15 + (valueNoise2(worldX, worldY, 54, 59) - 0.5) * 4;
      const warpY = (valueNoise2(worldX + 90, worldY - 70, 170, 63) - 0.5) * 15 + (valueNoise2(worldX, worldY, 48, 65) - 0.5) * 4;
      const sampleX = minmax(worldX + warpX, 0, WORLD_WIDTH - 0.01);
      const sampleY = minmax(worldY + warpY, 0, WORLD_HEIGHT - 0.01);
      const gx = minmax(sampleX / spacing - 0.5, 0, maxX);
      const gy = minmax(sampleY / spacing - 0.5, 0, maxY);
      const x0 = Math.floor(gx);
      const x1 = Math.min(x0 + 1, maxX);
      const y0 = Math.floor(gy);
      const y1 = Math.min(y0 + 1, maxY);
      const tx = smoothstep(gx - x0);
      const ty = smoothstep(gy - y0);
      const row0 = y0 * cellsX;
      const row1 = y1 * cellsX;
      const i00 = Math.min(row0 + x0, rasterHeightField.length - 1);
      const i10 = Math.min(row0 + x1, rasterHeightField.length - 1);
      const i01 = Math.min(row1 + x0, rasterHeightField.length - 1);
      const i11 = Math.min(row1 + x1, rasterHeightField.length - 1);

      const h00 = rasterHeightField[i00];
      const h10 = rasterHeightField[i10];
      const h01 = rasterHeightField[i01];
      const h11 = rasterHeightField[i11];
      let sampledHeight = bilerp(h00, h10, h01, h11, tx, ty);
      const moisture = bilerp(
        rasterMoistureField[i00],
        rasterMoistureField[i10],
        rasterMoistureField[i01],
        rasterMoistureField[i11],
        tx,
        ty
      );
      const temperature = bilerp(
        rasterTemperatureField[i00],
        rasterTemperatureField[i10],
        rasterTemperatureField[i01],
        rasterTemperatureField[i11],
        tx,
        ty
      );
      const ruggedness = bilerp(
        rasterRuggednessField[i00],
        rasterRuggednessField[i10],
        rasterRuggednessField[i01],
        rasterRuggednessField[i11],
        tx,
        ty
      );
      const lake = bilerp(rasterLakeField[i00], rasterLakeField[i10], rasterLakeField[i01], rasterLakeField[i11], tx, ty);
      const largeTexture = valueNoise2(worldX, worldY, 92, 3);
      const fineTexture = valueNoise2(worldX, worldY, 23, 9);
      const ridgeTexture = valueNoise2(worldX + worldY * 0.38, worldY - worldX * 0.22, 42, 15);
      const surfaceTexture = valueNoise2(worldX + 310, worldY - 240, 9, 29);
      sampledHeight += (largeTexture - 0.5) * 1.8 + (fineTexture - 0.5) * 1.15 + (surfaceTexture - 0.5) * 0.45;

      const west = h00 + (h01 - h00) * ty;
      const east = h10 + (h11 - h10) * ty;
      const north = h00 + (h10 - h00) * tx;
      const south = h01 + (h11 - h01) * tx;
      const shade = minmax((west - east) * 2.2 + (north - south) * 1.45, -24, 26);
      const isLake = lake > 0.32;
      const isCoast = sampledHeight >= SEA_LEVEL && sampledHeight < SEA_LEVEL + 5;
      const biome = getBiome(sampledHeight, moisture, temperature, ruggedness, isLake, isCoast);
      const color = colorForSample(
        worldX,
        worldY,
        sampledHeight,
        moisture,
        temperature,
        ruggedness,
        biome,
        shade,
        largeTexture,
        fineTexture,
        ridgeTexture,
        surfaceTexture
      );
      const offset = (py * rasterWidth + px) * 4;
      data[offset] = (color >> 16) & 255;
      data[offset + 1] = (color >> 8) & 255;
      data[offset + 2] = color & 255;
      data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
}

function colorForSample(
  x: number,
  y: number,
  height: number,
  moisture: number,
  temperature: number,
  ruggedness: number,
  biome: Biome,
  shade: number,
  largeTexture: number,
  fineTexture: number,
  ridgeTexture: number,
  surfaceTexture: number
): number {
  if (state.renderStyle === "height") {
    return colorForElevationView(height, shade, largeTexture, fineTexture);
  }

  if (state.renderStyle === "relief") {
    return colorForReliefView(height, moisture, temperature, shade, largeTexture, fineTexture, ridgeTexture);
  }

  if (height < SEA_LEVEL || biome === "lake") {
    const depth = biome === "lake" ? minmax((34 - height) / 18, 0, 1) : minmax((SEA_LEVEL - height) / SEA_LEVEL, 0, 1);
    const shallow = biome === "lake" ? [63, 127, 137] : [69, 139, 142];
    const deep = biome === "lake" ? [28, 75, 104] : [7, 31, 56];
    const surface = (largeTexture - 0.5) * 13 + (fineTexture - 0.5) * 7;
    const glint = Math.max(0, 1 - Math.abs(ridgeTexture - 0.58) * 9) * 11;
    const r = shallow[0] + (deep[0] - shallow[0]) * depth + surface + glint * 0.4;
    const g = shallow[1] + (deep[1] - shallow[1]) * depth + surface + glint;
    const b = shallow[2] + (deep[2] - shallow[2]) * depth + surface + glint * 1.2;
    return packRgb(r + shade * 0.16, g + shade * 0.18, b + shade * 0.2);
  }

  const base = BIOME_PALETTE[biome];
  const landRise = minmax((height - SEA_LEVEL) / 76, 0, 1);
  const beach = 1 - smoothstep(minmax((height - SEA_LEVEL) / 5.6, 0, 1));
  const highSnow = biome === "snow" ? 1 : smoothstep(minmax((height - 82) / 15, 0, 1)) * (1 - temperature);
  const canopy = ["woodland", "forest", "rainforest", "taiga"].includes(biome) ? 1 : 0;
  const dryGrass = ["desert", "savanna", "grassland", "highland"].includes(biome) ? 1 : 0;
  const texture =
    (largeTexture - 0.5) * (dryGrass ? 18 : 12) +
    (fineTexture - 0.5) * (canopy ? 14 : 9) +
    (ridgeTexture - 0.5) * (ruggedness > 14 || height > 62 ? 21 : 7) +
    (surfaceTexture - 0.5) * (canopy ? 13 : 8);
  const relief = shade * (1.08 + landRise * 0.7 + Math.min(ruggedness, 28) * 0.018);
  const latitudeHaze = (Math.abs(y / WORLD_HEIGHT - 0.52) - 0.2) * 10;

  let r = base[0] + texture + relief + landRise * 6 - moisture * 3 + latitudeHaze;
  let g = base[1] + texture * 0.8 + relief + moisture * 8 - landRise * 1.5;
  let b = base[2] + texture * 0.55 + relief * 0.82 + temperature * 2 - landRise * 4;

  if (beach > 0) {
    r = r + (218 - r) * beach * 0.85;
    g = g + (203 - g) * beach * 0.85;
    b = b + (142 - b) * beach * 0.85;
  }

  if (highSnow > 0) {
    r = r + (238 - r) * highSnow * 0.72;
    g = g + (237 - g) * highSnow * 0.72;
    b = b + (222 - b) * highSnow * 0.72;
  }

  const cloudlessSatelliteVariation = valueNoise2(x + 180, y - 70, 155, 27) - 0.5;
  r += cloudlessSatelliteVariation * 9;
  g += cloudlessSatelliteVariation * 7;
  b += cloudlessSatelliteVariation * 5;

  return packRgb(r, g, b);
}

function colorForElevationView(height: number, shade: number, largeTexture: number, fineTexture: number): number {
  const base = colorFromStops(ELEVATION_STOPS, height);
  const water = height < SEA_LEVEL;
  const contour = contourStrength(height, water ? 4 : 10, water ? 0.18 : 0.28);
  const majorContour = contourStrength(height, water ? 12 : 25, water ? 0.22 : 0.36);
  const coast = 1 - smoothstep(Math.abs(height - SEA_LEVEL) / 1.35);
  const tint = (largeTexture - 0.5) * 8 + (fineTexture - 0.5) * 4 + shade * (water ? 0.24 : 0.7);
  const line = contour * 16 + majorContour * 20;
  const highlight = majorContour * 4 + coast * 22;
  const r = base[0] + tint - line + highlight;
  const g = base[1] + tint - line * 0.85 + highlight;
  const b = base[2] + tint - line * 0.65 + (water ? highlight * 0.35 : highlight * 0.2);
  return packRgb(r, g, b);
}

function colorForReliefView(
  height: number,
  moisture: number,
  temperature: number,
  shade: number,
  largeTexture: number,
  fineTexture: number,
  ridgeTexture: number
): number {
  const base = colorFromStops(RELIEF_STOPS, height);
  const water = height < SEA_LEVEL;
  const landRise = minmax((height - SEA_LEVEL) / 76, 0, 1);
  const relief = shade * (water ? 0.32 : 1.6 + landRise * 0.45);
  const surface = (largeTexture - 0.5) * (water ? 9 : 12) + (fineTexture - 0.5) * (water ? 5 : 8);
  const ridge = Math.max(0, ridgeTexture - 0.48) * (height > 60 ? 30 : 12);
  const vegetation = water ? 0 : moisture * 7 - temperature * 2;
  const snow = smoothstep((height - 84) / 10);
  const r = base[0] + relief + surface + ridge + landRise * 4 + snow * 22;
  const g = base[1] + relief + surface * 0.8 + vegetation + snow * 22;
  const b = base[2] + relief * 0.85 + surface * 0.6 - landRise * 4 + (water ? 10 : 0) + snow * 24;
  return packRgb(r, g, b);
}

function colorFromStops(stops: Array<[number, [number, number, number]]>, value: number): [number, number, number] {
  if (value <= stops[0][0]) return stops[0][1];
  for (let index = 1; index < stops.length; index++) {
    const [stopValue, stopColor] = stops[index];
    const [previousValue, previousColor] = stops[index - 1];
    if (value <= stopValue) return mix(previousColor, stopColor, (value - previousValue) / (stopValue - previousValue));
  }
  return stops[stops.length - 1][1];
}

function contourStrength(value: number, interval: number, width: number): number {
  const offset = ((value % interval) + interval) % interval;
  const edgeDistance = Math.min(offset, interval - offset);
  return 1 - smoothstep(edgeDistance / width);
}

function smoothGridField(source: Float32Array, passes: number): Float32Array {
  if (!grid || !source.length) return source;
  const cellsX = grid.cellsX;
  const cellsY = grid.cellsY;
  let current = new Float32Array(source);
  let next = new Float32Array(source.length);

  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < cellsY; y++) {
      for (let x = 0; x < cellsX; x++) {
        const index = y * cellsX + x;
        if (index >= source.length) continue;
        let total = current[index] * 5;
        let weight = 5;

        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if (ox === 0 && oy === 0) continue;
            const nx = x + ox;
            const ny = y + oy;
            if (nx < 0 || nx >= cellsX || ny < 0 || ny >= cellsY) continue;
            const neighbor = ny * cellsX + nx;
            if (neighbor >= source.length) continue;
            const neighborWeight = ox === 0 || oy === 0 ? 2 : 1;
            total += current[neighbor] * neighborWeight;
            weight += neighborWeight;
          }
        }

        next[index] = total / weight;
      }
    }

    const swap = current;
    current = next;
    next = swap;
  }

  return current;
}

function packRgb(red: number, green: number, blue: number): number {
  return (
    (minmax(Math.round(red), 0, 255) << 16) |
    (minmax(Math.round(green), 0, 255) << 8) |
    minmax(Math.round(blue), 0, 255)
  );
}

function bilerp(v00: number, v10: number, v01: number, v11: number, tx: number, ty: number): number {
  const north = v00 + (v10 - v00) * tx;
  const south = v01 + (v11 - v01) * tx;
  return north + (south - north) * ty;
}

function smoothstep(t: number): number {
  const clamped = minmax(t, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function valueNoise2(x: number, y: number, scale: number, salt: number): number {
  const gx = x / scale;
  const gy = y / scale;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const tx = smoothstep(gx - x0);
  const ty = smoothstep(gy - y0);
  const v00 = latticeHash(x0, y0, salt);
  const v10 = latticeHash(x0 + 1, y0, salt);
  const v01 = latticeHash(x0, y0 + 1, salt);
  const v11 = latticeHash(x0 + 1, y0 + 1, salt);
  return bilerp(v00, v10, v01, v11, tx, ty);
}

function latticeHash(x: number, y: number, salt: number): number {
  let hash = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(salt, 2147483647);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295;
}

function generateLakeCells(): Set<number> {
  if (!grid || !heights) return new Set();
  const rng = Alea(`${state.seed}:${state.heightmapId}:lakes`) as () => number;
  const candidates = grid.cells.i
    .filter(index => {
      const height = heights![index];
      if (height < SEA_LEVEL || height > 35) return false;
      if (grid!.cells.b[index]) return false;
      if (grid!.points[index][0] < 25 || grid!.points[index][0] > WORLD_WIDTH - 25) return false;
      if (grid!.points[index][1] < 25 || grid!.points[index][1] > WORLD_HEIGHT - 25) return false;
      return !touchesSea(index, new Set());
    })
    .sort((a, b) => hash01(a, 2) - hash01(b, 2));

  const lakeCells = new Set<number>();
  const lakeCount = Math.min(10, Math.max(3, Math.round(grid.cellsDesired / 6000)));

  for (const seedCell of candidates) {
    if (lakeCells.size > grid.cellsDesired * 0.012) break;
    if (lakeCells.has(seedCell)) continue;
    if (rng() > 0.45) continue;

    const targetSize = 6 + Math.floor(rng() * 34);
    const queue = [seedCell];
    const local = new Set<number>();

    while (queue.length && local.size < targetSize) {
      const cell = queue.shift() as number;
      if (local.has(cell) || lakeCells.has(cell)) continue;
      const height = heights[cell];
      if (height < SEA_LEVEL || height > 38) continue;
      if (touchesSea(cell, lakeCells)) continue;

      local.add(cell);
      const neighbors = [...grid.cells.c[cell]].sort((a, b) => {
        const ah = heights![a] + hash01(a, 3) * 5;
        const bh = heights![b] + hash01(b, 3) * 5;
        return ah - bh;
      });
      for (const neighbor of neighbors) {
        if (!local.has(neighbor) && !lakeCells.has(neighbor) && rng() > 0.18) queue.push(neighbor);
      }
    }

    if (local.size >= 4) local.forEach(cell => lakeCells.add(cell));
    if ([...lakeCells].length > lakeCount * 28) break;
  }

  return lakeCells;
}

function generateRivers(lakeCells: Set<number>): River[] {
  if (!grid || !heights) return [];
  const rng = Alea(`${state.seed}:${state.heightmapId}:rivers`) as () => number;
  const sources = grid.cells.i
    .filter(index => heights![index] > 54 && !lakeCells.has(index) && !grid!.cells.b[index])
    .sort((a, b) => {
      const scoreA = heights![a] + getRuggedness(a, heights![a]) * 1.8 + hash01(a, 7) * 18;
      const scoreB = heights![b] + getRuggedness(b, heights![b]) * 1.8 + hash01(b, 7) * 18;
      return scoreB - scoreA;
    });

  const rivers: River[] = [];
  const used = new Set<number>();
  const desired = Math.min(22, Math.max(8, Math.round(grid.cellsDesired / 2400)));

  for (const source of sources) {
    if (rivers.length >= desired) break;
    if (used.has(source) || rng() < 0.28) continue;

    const cells = traceRiver(source, lakeCells, used, rng);
    if (cells.length < 9) continue;

    cells.forEach(cell => used.add(cell));
    const points = meanderPath(cells.map(cell => grid!.points[cell]), rng, 2.5 + rng() * 4);
    rivers.push({
      id: `river-${rivers.length + 1}`,
      cells,
      points,
      width: minmax(1.2 + cells.length / 24, 1.4, 5.6)
    });
  }

  return rivers;
}

function traceRiver(
  source: number,
  lakeCells: Set<number>,
  used: Set<number>,
  rng: () => number
): number[] {
  if (!grid || !heights) return [];
  const cells: number[] = [];
  const visited = new Set<number>();
  let current = source;

  for (let step = 0; step < 150; step++) {
    if (visited.has(current)) break;
    visited.add(current);
    cells.push(current);

    const height = heights[current];
    if (height < SEA_LEVEL || lakeCells.has(current)) break;

    const neighbors = grid.cells.c[current].filter(cell => !visited.has(cell));
    if (!neighbors.length) break;

    let best = neighbors[0];
    let bestScore = Infinity;
    for (const neighbor of neighbors) {
      const [x, y] = grid.points[neighbor];
      const edgePull = Math.min(x, WORLD_WIDTH - x, y, WORLD_HEIGHT - y) / 90;
      const channelPull = used.has(neighbor) ? -8 : 0;
      const lakePull = lakeCells.has(neighbor) ? -12 : 0;
      const score = heights[neighbor] + edgePull + channelPull + lakePull + rng() * 6;
      if (score < bestScore) {
        bestScore = score;
        best = neighbor;
      }
    }

    if (heights[best] > height + 5 && rng() > 0.18) break;
    current = best;
  }

  return cells;
}

function getCoastCells(lakeCells: Set<number>): Set<number> {
  if (!grid || !heights) return new Set();
  const coast = new Set<number>();
  for (const index of grid.cells.i) {
    if (heights[index] < SEA_LEVEL || lakeCells.has(index)) continue;
    if (touchesSea(index, lakeCells)) coast.add(index);
  }
  return coast;
}

function touchesSea(index: number, lakeCells: Set<number>): boolean {
  if (!grid || !heights) return false;
  return grid.cells.c[index].some(neighbor => heights![neighbor] < SEA_LEVEL && !lakeCells.has(neighbor));
}

function getMoisture(index: number, isLake: boolean, isRiver: boolean, isCoast: boolean): number {
  if (!grid || !heights) return 0;
  if (isLake) return 1;
  const [x, y] = grid.points[index];
  const latitudeWetness = 0.22 + Math.sin((y / WORLD_HEIGHT) * Math.PI) * 0.34;
  const seaInfluence = isCoast ? 0.22 : 0;
  const riverInfluence = isRiver ? 0.32 : 0;
  const lowlandMist = heights[index] < 34 ? 0.12 : 0;
  const noise = (hash01(index, 11) - 0.5) * 0.34 + (hash01(Math.floor(x / 9) + Math.floor(y / 9) * 137, 12) - 0.5) * 0.22;
  return minmax(latitudeWetness + seaInfluence + riverInfluence + lowlandMist + noise, 0, 1);
}

function getTemperature(index: number, height: number): number {
  if (!grid) return 0.5;
  const [, y] = grid.points[index];
  const latitude = Math.abs(y / WORLD_HEIGHT - 0.52) * 1.55;
  const altitude = Math.max(0, height - 45) * 0.012;
  const noise = (hash01(index, 13) - 0.5) * 0.12;
  return minmax(1 - latitude - altitude + noise, 0, 1);
}

function getRuggedness(index: number, height: number): number {
  if (!grid || !heights) return 0;
  const diffs = grid.cells.c[index].map(cell => Math.abs((heights![cell] ?? height) - height));
  return diffs.length ? Math.max(...diffs) : 0;
}

function getBiome(
  height: number,
  moisture: number,
  temperature: number,
  ruggedness: number,
  isLake: boolean,
  isCoast: boolean
): Biome {
  if (isLake) return "lake";
  if (height < 8) return "deep-ocean";
  if (height < 17) return "ocean";
  if (height < SEA_LEVEL) return "shallows";
  if (height < 24 && isCoast) return "beach";
  if (height < 29 && moisture > 0.68) return "marsh";
  if (height > 86 || (height > 78 && temperature < 0.34)) return "snow";
  if (height > 74 || ruggedness > 22) return "mountain";
  if (height > 61) return moisture > 0.48 ? "highland" : "mountain";
  if (temperature < 0.18) return "tundra";
  if (temperature < 0.34) return moisture > 0.45 ? "taiga" : "tundra";
  if (moisture < 0.18) return "desert";
  if (moisture < 0.31) return temperature > 0.58 ? "savanna" : "grassland";
  if (moisture > 0.78 && temperature > 0.62) return "rainforest";
  if (moisture > 0.58) return temperature > 0.38 ? "forest" : "taiga";
  if (moisture > 0.42) return "woodland";
  return "grassland";
}

function colorForCell(
  index: number,
  height: number,
  shade: number,
  biome: Biome,
  moisture: number,
  temperature: number,
  ruggedness: number
): [number, number, number] {
  if (state.renderStyle !== "terrain") return colorForHeight(height, shade);

  let base = BIOME_PALETTE[biome];
  const landRise = height >= SEA_LEVEL ? minmax((height - SEA_LEVEL) / 72, 0, 1) : 0;
  const variation = (hash01(index, 17) - 0.5) * 18 + (moisture - 0.5) * 10 + (temperature - 0.5) * 7;
  const relief = shade * (biome === "mountain" || biome === "snow" ? 1.45 : 0.92) + landRise * 10 - ruggedness * 0.12;
  return base.map(channel => minmax(Math.round(channel + variation + relief), 0, 255)) as [number, number, number];
}

function drawSeaBackdrop(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#143946");
  gradient.addColorStop(0.46, "#112f3f");
  gradient.addColorStop(1, "#0c202b");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function getVisibleWorldBounds(view: Viewport, pad: number, cull: boolean): [number, number, number, number] {
  const width = cull ? stageSize.width : WORLD_WIDTH * view.scale;
  const height = cull ? stageSize.height : WORLD_HEIGHT * view.scale;
  return [(-view.x - pad) / view.scale, (-view.y - pad) / view.scale, (width - view.x + pad) / view.scale, (height - view.y + pad) / view.scale];
}

function isPointInBounds([x, y]: Point, [left, top, right, bottom]: [number, number, number, number]): boolean {
  return x >= left && x <= right && y >= top && y <= bottom;
}

function drawMapTexture(
  context: CanvasRenderingContext2D,
  view: Viewport,
  bounds: [number, number, number, number],
  cull: boolean
): void {
  context.save();
  context.globalAlpha = view.scale < fitScale * 2.2 ? 0.08 : 0.15;
  for (const mark of atlas.texture) {
    if (cull && !isPointInBounds([mark.x, mark.y], bounds)) continue;
    context.fillStyle = mark.color;
    context.beginPath();
    context.ellipse(mark.x, mark.y, mark.size, mark.size * 0.55, mark.angle, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawCoastlines(
  context: CanvasRenderingContext2D,
  bounds: [number, number, number, number],
  cull: boolean
): void {
  context.save();
  context.lineJoin = "round";
  context.lineCap = "round";
  for (const cell of terrainCells) {
    if (!cell.isCoast || (cull && !isPointInBounds(cell.point, bounds))) continue;
    context.strokeStyle = "rgba(255, 238, 166, 0.46)";
    context.lineWidth = 2.2;
    context.stroke(cell.path);
    context.strokeStyle = "rgba(42, 82, 91, 0.28)";
    context.lineWidth = 5;
    context.stroke(cell.path);
  }
  context.restore();
}

function drawRiversLayer(
  context: CanvasRenderingContext2D,
  bounds: [number, number, number, number],
  cull: boolean
): void {
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const river of atlas.rivers) {
    if (cull && !river.points.some(point => isPointInBounds(point, bounds))) continue;
    drawSmoothPath(context, river.points, `rgba(15, 56, 82, 0.45)`, river.width + 2.6);
    drawSmoothPath(context, river.points, `rgba(74, 145, 163, 0.9)`, river.width);
    drawSmoothPath(context, river.points, `rgba(184, 228, 222, 0.42)`, Math.max(0.7, river.width * 0.28));
  }
  context.restore();
}

function drawNaturalSymbols(
  context: CanvasRenderingContext2D,
  view: Viewport,
  bounds: [number, number, number, number],
  cull: boolean
): void {
  const detail = view.scale / fitScale;
  context.save();
  for (const symbol of atlas.symbols) {
    if (detail < 1.16) continue;
    if (cull && !isPointInBounds([symbol.x, symbol.y], bounds)) continue;
    if ((symbol.kind === "tree" || symbol.kind === "marsh") && detail < 1.62 && hash01(Number(symbol.id.split("-").pop()) || 0, 22) > 0.18) {
      continue;
    }
    if ((symbol.kind === "peak" || symbol.kind === "hill") && detail < 1.34 && symbol.size < 9.5) continue;

    if (symbol.kind === "tree") drawTree(context, symbol);
    else if (symbol.kind === "peak" || symbol.kind === "hill") drawPeak(context, symbol);
    else if (symbol.kind === "marsh") drawMarsh(context, symbol);
    else drawReef(context, symbol);
  }
  context.restore();
}

function drawTree(context: CanvasRenderingContext2D, symbol: NaturalSymbol): void {
  context.save();
  context.translate(symbol.x, symbol.y);
  context.rotate(symbol.angle);
  context.globalAlpha = 0.56;
  context.fillStyle = symbol.color;
  context.beginPath();
  context.ellipse(0, 0, symbol.size * 1.1, symbol.size * 0.55, 0, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 0.24;
  context.fillStyle = "rgba(8, 45, 25, 0.74)";
  context.beginPath();
  context.ellipse(symbol.size * 0.18, -symbol.size * 0.12, symbol.size * 0.52, symbol.size * 0.22, 0.2, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawPeak(context: CanvasRenderingContext2D, symbol: NaturalSymbol): void {
  const s = symbol.size;
  context.save();
  context.translate(symbol.x, symbol.y);
  context.rotate(symbol.angle * 0.25);
  context.globalAlpha = 0.62;
  context.strokeStyle = symbol.color;
  context.lineWidth = Math.max(1.1, s * 0.16);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-s * 0.9, s * 0.28);
  context.quadraticCurveTo(-s * 0.22, -s * 0.58, s * 0.82, s * 0.06);
  context.stroke();
  context.globalAlpha = 0.32;
  context.strokeStyle = "rgba(255, 249, 223, 0.7)";
  context.lineWidth = Math.max(0.7, s * 0.08);
  context.beginPath();
  context.moveTo(-s * 0.52, s * 0.02);
  context.quadraticCurveTo(-s * 0.16, -s * 0.38, s * 0.36, -s * 0.1);
  context.stroke();
  context.restore();
}

function drawMarsh(context: CanvasRenderingContext2D, symbol: NaturalSymbol): void {
  context.save();
  context.translate(symbol.x, symbol.y);
  context.rotate(symbol.angle);
  context.strokeStyle = symbol.color;
  context.lineWidth = 1.2;
  for (let i = -1; i <= 1; i++) {
    context.beginPath();
    context.moveTo(i * symbol.size * 0.45, symbol.size * 0.5);
    context.quadraticCurveTo(i * symbol.size * 0.2, 0, i * symbol.size * 0.55, -symbol.size * 0.55);
    context.stroke();
  }
  context.restore();
}

function drawReef(context: CanvasRenderingContext2D, symbol: NaturalSymbol): void {
  context.save();
  context.strokeStyle = symbol.color;
  context.lineWidth = 1.2;
  context.beginPath();
  context.arc(symbol.x, symbol.y, symbol.size, symbol.angle, symbol.angle + Math.PI * 1.35);
  context.stroke();
  context.restore();
}

function drawScreenAtmosphere(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.2, width / 2, height / 2, Math.max(width, height) * 0.76);
  gradient.addColorStop(0, "rgba(255, 247, 218, 0)");
  gradient.addColorStop(1, "rgba(3, 18, 19, 0.16)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function generateNaturalSymbols(): NaturalSymbol[] {
  const symbols: NaturalSymbol[] = [];
  const treeLimit = Math.min(1300, Math.max(420, Math.round((grid?.cellsDesired || 20000) / 18)));
  const peakLimit = Math.min(340, Math.max(120, Math.round((grid?.cellsDesired || 20000) / 90)));
  let trees = 0;
  let peaks = 0;

  for (let index = 0; index < terrainCells.length; index++) {
    const cell = terrainCells[index];
    const [x, y] = cell.point;
    const jitter: Point = [(hash01(index, 31) - 0.5) * 7, (hash01(index, 32) - 0.5) * 7];
    const px = x + jitter[0];
    const py = y + jitter[1];
    const roll = hash01(index, 33);

    if (
      trees < treeLimit &&
      ["woodland", "forest", "rainforest", "taiga"].includes(cell.biome) &&
      roll < (cell.biome === "rainforest" ? 0.34 : cell.biome === "forest" ? 0.24 : 0.16)
    ) {
      const color =
        cell.biome === "taiga"
          ? "rgba(47, 91, 79, 0.76)"
          : cell.biome === "rainforest"
            ? "rgba(24, 89, 56, 0.74)"
            : "rgba(38, 98, 58, 0.72)";
      symbols.push({
        id: `tree-${index}`,
        kind: "tree",
        x: px,
        y: py,
        size: 2.7 + hash01(index, 34) * 2.4,
        angle: hash01(index, 35) * Math.PI * 2,
        color
      });
      trees++;
      continue;
    }

    if (
      peaks < peakLimit &&
      ["mountain", "snow", "highland"].includes(cell.biome) &&
      roll < (cell.biome === "mountain" || cell.biome === "snow" ? 0.22 : 0.09)
    ) {
      symbols.push({
        id: `peak-${index}`,
        kind: cell.biome === "highland" ? "hill" : "peak",
        x: px,
        y: py,
        size: 4.6 + minmax(cell.height - 58, 0, 36) * 0.16 + hash01(index, 36) * 3,
        angle: (hash01(index, 37) - 0.5) * 0.5,
        color: cell.biome === "snow" ? "rgba(215, 211, 196, 0.76)" : "rgba(111, 95, 77, 0.72)"
      });
      peaks++;
      continue;
    }

    if (cell.biome === "marsh" && roll < 0.16) {
      symbols.push({
        id: `marsh-${index}`,
        kind: "marsh",
        x: px,
        y: py,
        size: 3 + hash01(index, 38) * 2.2,
        angle: hash01(index, 39) * Math.PI,
        color: "rgba(57, 92, 69, 0.42)"
      });
      continue;
    }

    if (cell.biome === "shallows" && atlas.coastCells.size && roll < 0.045) {
      symbols.push({
        id: `reef-${index}`,
        kind: "reef",
        x: px,
        y: py,
        size: 2.8 + hash01(index, 40) * 3.5,
        angle: hash01(index, 41) * Math.PI * 2,
        color: "rgba(225, 219, 158, 0.32)"
      });
    }
  }

  return symbols;
}

function generateTextureSymbols(): NaturalSymbol[] {
  const marks: NaturalSymbol[] = [];
  const limit = Math.min(2600, Math.max(1000, Math.round((grid?.cellsDesired || 20000) / 9)));

  for (let index = 0; index < terrainCells.length && marks.length < limit; index++) {
    const cell = terrainCells[index];
    if (cell.height < SEA_LEVEL || cell.isLake) continue;
    const roll = hash01(index, 51);
    if (roll > 0.16) continue;

    const color =
      cell.biome === "desert" || cell.biome === "beach"
        ? "rgba(103, 79, 45, 0.22)"
        : cell.biome === "mountain" || cell.biome === "highland"
          ? "rgba(44, 35, 28, 0.22)"
          : "rgba(19, 57, 43, 0.18)";

    marks.push({
      id: `texture-${index}`,
      kind: "hill",
      x: cell.point[0] + (hash01(index, 52) - 0.5) * 9,
      y: cell.point[1] + (hash01(index, 53) - 0.5) * 9,
      size: 0.9 + hash01(index, 54) * 2.8,
      angle: hash01(index, 55) * Math.PI,
      color
    });
  }

  return marks;
}

function meanderPath(points: Point[], rng: () => number, intensity: number): Point[] {
  if (points.length < 2) return points;
  const meandered: Point[] = [points[0]];
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const next = points[index];
    const dx = next[0] - previous[0];
    const dy = next[1] - previous[1];
    const length = Math.max(1, Math.hypot(dx, dy));
    const normal: Point = [-dy / length, dx / length];
    const offset = (rng() - 0.5) * intensity;
    meandered.push([
      (previous[0] + next[0]) / 2 + normal[0] * offset,
      (previous[1] + next[1]) / 2 + normal[1] * offset
    ]);
    meandered.push(next);
  }
  return meandered;
}

function drawSmoothPath(context: CanvasRenderingContext2D, points: Point[], color: string, width: number): void {
  if (points.length < 2) return;
  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);

  if (points.length === 2) {
    context.lineTo(points[1][0], points[1][1]);
  } else {
    for (let index = 1; index < points.length - 1; index++) {
      const midpoint: Point = [(points[index][0] + points[index + 1][0]) / 2, (points[index][1] + points[index + 1][1]) / 2];
      context.quadraticCurveTo(points[index][0], points[index][1], midpoint[0], midpoint[1]);
    }
    const last = points[points.length - 1];
    context.lineTo(last[0], last[1]);
  }

  context.stroke();
  context.restore();
}

function hash01(value: number, salt: number): number {
  const raw = Math.sin(value * 127.1 + salt * 311.7) * 43758.5453123;
  return raw - Math.floor(raw);
}

function drawCoastGlow(context: CanvasRenderingContext2D): void {
  if (!grid || !heights || state.renderStyle === "height") return;
  context.save();
  context.globalAlpha = 0.16;
  context.fillStyle = "#fff8d4";
  const radius = Math.max(1.4, grid.spacing * 0.28);
  for (let index = 0; index < heights.length; index++) {
    if (heights[index] < 19 || heights[index] > 23) continue;
    const [x, y] = grid.points[index];
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function getHillshade(index: number, height: number): number {
  if (!grid || !heights || state.renderStyle === "height") return 0;
  const x = index % grid.cellsX;
  const y = Math.floor(index / grid.cellsX);
  const east = x < grid.cellsX - 1 ? heights[index + 1] : height;
  const south = y < grid.cellsY - 1 ? heights[index + grid.cellsX] : height;
  return minmax((height - east) * 1.6 + (height - south) * 1.1, -22, 22);
}

function colorForHeight(height: number, shade: number): [number, number, number] {
  if (state.renderStyle === "height") {
    const base = colorFromStops(ELEVATION_STOPS, height);
    const contour = contourStrength(height, height < SEA_LEVEL ? 4 : 10, height < SEA_LEVEL ? 0.18 : 0.28);
    return base.map(channel => minmax(Math.round(channel + shade * 0.55 - contour * 14), 0, 255)) as [number, number, number];
  }

  if (state.renderStyle === "relief") {
    const base = colorFromStops(RELIEF_STOPS, height);
    return base.map(channel => minmax(Math.round(channel + shade), 0, 255)) as [number, number, number];
  }

  let base: [number, number, number];
  if (height < 8) base = mix([17, 52, 78], [25, 80, 106], height / 8);
  else if (height < 20) base = mix([25, 80, 106], [75, 133, 142], (height - 8) / 12);
  else if (height < 24) base = mix([205, 190, 127], [182, 188, 116], (height - 20) / 4);
  else if (height < 45) base = mix([101, 152, 94], [73, 128, 88], (height - 24) / 21);
  else if (height < 65) base = mix([73, 128, 88], [133, 132, 82], (height - 45) / 20);
  else if (height < 82) base = mix([133, 132, 82], [139, 111, 84], (height - 65) / 17);
  else base = mix([174, 163, 140], [245, 242, 228], (height - 82) / 18);

  return base.map(channel => minmax(Math.round(channel + shade), 0, 255)) as [number, number, number];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  const clamped = minmax(t, 0, 1);
  return [
    Math.round(a[0] + (b[0] - a[0]) * clamped),
    Math.round(a[1] + (b[1] - a[1]) * clamped),
    Math.round(a[2] + (b[2] - a[2]) * clamped)
  ];
}

function renderEditLayer(): void {
  const context = editCanvas.getContext("2d")!;
  prepareScreenContext(context);
  context.save();
  context.translate(viewport.x, viewport.y);
  context.scale(viewport.scale, viewport.scale);
  drawOverlay(context, [...state.strokes, ...(currentStroke ? [currentStroke] : [])], state.settlements, viewport.scale);
  context.restore();
}

function drawOverlay(
  context: CanvasRenderingContext2D,
  strokes: Stroke[],
  settlements: Settlement[],
  viewScale = 1
): void {
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    const width = stroke.width / Math.max(viewScale, 0.15);
    const outline = 2.2 / Math.max(viewScale, 0.15);
    if (stroke.kind === "road") {
      context.globalAlpha = 0.92;
      drawSmoothPath(context, stroke.points, "rgba(255, 247, 214, 0.82)", width + outline);
      drawSmoothPath(context, stroke.points, "rgba(78, 54, 34, 0.38)", width + outline * 0.35);
      drawSmoothPath(context, stroke.points, stroke.color, width * 0.78);
    } else {
      context.globalAlpha = 0.96;
      context.setLineDash([width * 2.4, width * 1.15]);
      drawSmoothPath(context, stroke.points, "rgba(255, 250, 226, 0.74)", width + outline * 1.2);
      drawSmoothPath(context, stroke.points, stroke.color, width);
      context.setLineDash([]);
    }
  }

  context.setLineDash([]);
  context.globalAlpha = 1;
  for (const settlement of settlements) {
    const symbolScale = minmax(1 / viewScale, 0.56, 2.8);
    if (settlement.kind === "capital") drawStar(context, settlement.x, settlement.y, symbolScale);
    else drawTown(context, settlement.x, settlement.y, symbolScale);
  }
  context.restore();
}

function drawStar(context: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
  const outer = 14 * scale;
  const inner = 6 * scale;
  context.save();
  context.fillStyle = "#f9f3c7";
  context.strokeStyle = "#2d2518";
  context.lineWidth = 2.4 * scale;
  context.shadowColor = "rgba(20, 13, 6, 0.38)";
  context.shadowBlur = 3 * scale;
  context.shadowOffsetY = 1 * scale;
  context.beginPath();
  for (let index = 0; index < 10; index++) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.stroke();
  context.fill();
  context.restore();
}

function drawTown(context: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
  context.save();
  context.fillStyle = "#f8f0ce";
  context.strokeStyle = "#2d2518";
  context.lineWidth = 2.2 * scale;
  context.shadowColor = "rgba(20, 13, 6, 0.32)";
  context.shadowBlur = 2.6 * scale;
  context.shadowOffsetY = 1 * scale;
  context.beginPath();
  context.arc(x, y, 8 * scale, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function onPointerDown(event: PointerEvent): void {
  event.preventDefault();
  const stagePoint = eventToStagePoint(event);
  activePointers.set(event.pointerId, stagePoint);
  editCanvas.setPointerCapture(event.pointerId);

  if (activePointers.size === 2) {
    currentStroke = null;
    activePointerId = null;
    beginPinchGesture();
    renderEditLayer();
    return;
  }

  if (!state.creationMode) {
    gesture = {type: "pan", last: stagePoint};
    return;
  }

  activePointerId = event.pointerId;
  const point = eventToWorldPoint(event);
  if (state.activeTool === "capital" || state.activeTool === "town") {
    const settlement: Settlement = {
      id: crypto.randomUUID(),
      kind: state.activeTool,
      x: point[0],
      y: point[1]
    };
    state.settlements.push(settlement);
    actionHistory.push({type: "settlement", id: settlement.id});
    saveState();
    renderEditLayer();
    return;
  }

  currentStroke = {
    id: crypto.randomUUID(),
    kind: state.activeTool,
    color: state.activeTool === "road" ? state.roadColor : state.borderColor,
    width: state.activeTool === "road" ? state.roadWidth : state.borderWidth,
    points: [point]
  };
  gesture = {type: "draw"};
  renderEditLayer();
}

function onPointerMove(event: PointerEvent): void {
  if (!activePointers.has(event.pointerId)) return;
  event.preventDefault();
  const stagePoint = eventToStagePoint(event);
  activePointers.set(event.pointerId, stagePoint);

  if (activePointers.size >= 2) {
    if (gesture?.type !== "pinch") beginPinchGesture();
    updatePinchGesture();
    return;
  }

  if (gesture?.type === "pan") {
    viewport.x += stagePoint[0] - gesture.last[0];
    viewport.y += stagePoint[1] - gesture.last[1];
    gesture.last = stagePoint;
    clampViewport();
    renderAll();
    return;
  }

  if (!currentStroke || event.pointerId !== activePointerId) return;
  const point = eventToWorldPoint(event);
  const last = currentStroke.points[currentStroke.points.length - 1];
  if (distance(last, point) < 2 / viewport.scale) return;
  currentStroke.points.push(point);
  renderEditLayer();
}

function onPointerUp(event: PointerEvent): void {
  activePointers.delete(event.pointerId);
  editCanvas.releasePointerCapture(event.pointerId);

  if (gesture?.type === "pinch") {
    gesture = null;
    if (activePointers.size === 1 && !state.creationMode) {
      gesture = {type: "pan", last: [...activePointers.values()][0]};
    }
    return;
  }

  if (gesture?.type === "pan") {
    gesture = null;
    return;
  }

  if (event.pointerId !== activePointerId) return;
  activePointerId = null;

  if (!currentStroke) return;
  if (currentStroke.points.length > 1) {
    if (currentStroke.kind === "road" && state.snapRoads) {
      currentStroke.points[0] = snapToSettlement(currentStroke.points[0]);
      currentStroke.points[currentStroke.points.length - 1] = snapToSettlement(
        currentStroke.points[currentStroke.points.length - 1]
      );
    }
    currentStroke.points = simplifyStroke(currentStroke.points);
    state.strokes.push(currentStroke);
    actionHistory.push({type: "stroke", id: currentStroke.id});
    saveState();
  }

  currentStroke = null;
  gesture = null;
  renderEditLayer();
}

function eventToStagePoint(event: PointerEvent | WheelEvent): Point {
  const rect = editCanvas.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}

function eventToWorldPoint(event: PointerEvent): Point {
  return clampPoint(screenToWorld(eventToStagePoint(event)), WORLD_WIDTH, WORLD_HEIGHT);
}

function snapToSettlement(point: Point): Point {
  let nearest: Settlement | null = null;
  let nearestDistance = Infinity;

  for (const settlement of state.settlements) {
    const settlementDistance = distance(point, [settlement.x, settlement.y]);
    if (settlementDistance < nearestDistance) {
      nearest = settlement;
      nearestDistance = settlementDistance;
    }
  }

  return nearest && nearestDistance < 36 ? [nearest.x, nearest.y] : point;
}

function simplifyStroke(points: Point[]): Point[] {
  if (points.length < 4) return points;
  const simplified = [points[0]];
  for (let index = 1; index < points.length - 1; index++) {
    if (distance(simplified[simplified.length - 1], points[index]) >= 3) simplified.push(points[index]);
  }
  simplified.push(points[points.length - 1]);
  return simplified;
}

function undoLastAction(): void {
  const action = actionHistory.pop();
  if (!action) return;
  if (action.type === "stroke") state.strokes = state.strokes.filter(stroke => stroke.id !== action.id);
  else state.settlements = state.settlements.filter(settlement => settlement.id !== action.id);
  saveState();
  renderEditLayer();
}

function clearCreationLayer(): void {
  if (!state.strokes.length && !state.settlements.length) return;
  if (!window.confirm("Clear current creation layer?")) return;
  state.strokes = [];
  state.settlements = [];
  currentStroke = null;
  actionHistory = [];
  saveState();
  renderEditLayer();
}

function exportPng(): void {
  const exportCanvas = document.createElement("canvas");
  const exportScale = 2;
  exportCanvas.width = WORLD_WIDTH * exportScale;
  exportCanvas.height = WORLD_HEIGHT * exportScale;
  const context = exportCanvas.getContext("2d")!;
  const savedStageSize = {...stageSize};
  const fullView = {scale: exportScale, x: 0, y: 0};
  stageSize = {width: exportCanvas.width, height: exportCanvas.height};
  drawTerrain(context, fullView, false);
  context.save();
  context.scale(exportScale, exportScale);
  drawOverlay(context, state.strokes, state.settlements, exportScale);
  context.restore();
  stageSize = savedStageSize;

  const link = document.createElement("a");
  link.download = `fantasy-map-${state.seed}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

function updateSetupUi(): void {
  shell.classList.toggle("setup-open", state.setupPanelOpen);
  setupToggle.textContent = state.setupPanelOpen ? "Hide" : "Setup";
  setupToggle.ariaLabel = state.setupPanelOpen ? "Hide setup panel" : "Show setup panel";
}

function updateModeUi(): void {
  shell.classList.toggle("creation", state.creationMode);
  creationToggle.textContent = state.creationMode ? "Exit" : "Create";
  creationToggle.ariaLabel = state.creationMode ? "Exit creation mode" : "Enter creation mode";
  editCanvas.style.pointerEvents = "auto";
  if (!state.creationMode) editorDrawer.classList.remove("open");
  renderEditLayer();
}

function updateToolButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach(button => {
    button.classList.toggle("active", button.dataset.tool === state.activeTool);
  });
  statusPill.textContent = state.creationMode ? state.activeTool : statusPill.textContent;
}

function prepareScreenContext(context: CanvasRenderingContext2D): void {
  const dpr = window.devicePixelRatio || 1;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, stageSize.width, stageSize.height);
}

function fitMap(shouldRender = true): void {
  fitScale = getHomeScale();
  viewport = {
    scale: fitScale,
    x: (stageSize.width - WORLD_WIDTH * fitScale) / 2,
    y: (stageSize.height - WORLD_HEIGHT * fitScale) / 2
  };
  viewportInitialized = true;
  if (shouldRender) renderAll();
}

function zoomAt(stagePoint: Point, factor: number): void {
  const before = screenToWorld(stagePoint);
  const maxScale = getMaxScale();
  viewport.scale = minmax(viewport.scale * factor, minScale, maxScale);
  viewport.x = stagePoint[0] - before[0] * viewport.scale;
  viewport.y = stagePoint[1] - before[1] * viewport.scale;
  clampViewport();
  renderAll();
}

function getHomeScale(): number {
  const contain = Math.min(stageSize.width / WORLD_WIDTH, stageSize.height / WORLD_HEIGHT);
  const cover = Math.max(stageSize.width / WORLD_WIDTH, stageSize.height / WORLD_HEIGHT);
  if (!Number.isFinite(contain) || contain <= 0) return 1;
  if (!isCompactViewport()) return contain;
  return minmax(cover, contain, TERRAIN_RASTER_SCALE * 0.8);
}

function getMaxScale(): number {
  return Math.max(fitScale, Math.min(fitScale * 8, TERRAIN_RASTER_SCALE));
}

function clampViewport(): void {
  viewport.scale = minmax(viewport.scale, minScale, getMaxScale());
  const mapWidth = WORLD_WIDTH * viewport.scale;
  const mapHeight = WORLD_HEIGHT * viewport.scale;

  viewport.x =
    mapWidth <= stageSize.width
      ? (stageSize.width - mapWidth) / 2
      : minmax(viewport.x, stageSize.width - mapWidth, 0);

  viewport.y =
    mapHeight <= stageSize.height
      ? (stageSize.height - mapHeight) / 2
      : minmax(viewport.y, stageSize.height - mapHeight, 0);
}

function screenToWorld(point: Point): Point {
  return [(point[0] - viewport.x) / viewport.scale, (point[1] - viewport.y) / viewport.scale];
}

function beginPinchGesture(): void {
  const [a, b] = [...activePointers.values()];
  if (!a || !b) return;
  const center: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  gesture = {
    type: "pinch",
    distance: Math.max(distance(a, b), 1),
    scale: viewport.scale,
    center,
    worldCenter: screenToWorld(center)
  };
}

function updatePinchGesture(): void {
  if (gesture?.type !== "pinch") return;
  const [a, b] = [...activePointers.values()];
  if (!a || !b) return;
  const center: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const nextDistance = Math.max(distance(a, b), 1);
  viewport.scale = minmax(gesture.scale * (nextDistance / gesture.distance), minScale, getMaxScale());
  viewport.x = center[0] - gesture.worldCenter[0] * viewport.scale;
  viewport.y = center[1] - gesture.worldCenter[1] * viewport.scale;
  clampViewport();
  renderAll();
}

function getOrientation(): "landscape" | "portrait" {
  return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
}

function isCompactViewport(): boolean {
  return window.innerWidth <= 920 || window.innerHeight <= 560;
}

function isCompactLandscape(): boolean {
  return getOrientation() === "landscape" && isCompactViewport();
}

function updateViewportVars(): void {
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-vw", `${viewportWidth}px`);
  document.documentElement.style.setProperty("--app-vh", `${viewportHeight}px`);
}
