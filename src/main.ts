import "./styles.css";
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

type StrokeKind = "border" | "road";
type Tool = StrokeKind | "capital" | "town";
type RenderStyle = "terrain" | "height" | "relief";

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

let state = loadState();
let grid: Grid | null = null;
let heights: Uint8Array | null = null;
let currentStroke: Stroke | null = null;
let activePointerId: number | null = null;
let actionHistory: Array<{type: "stroke" | "settlement"; id: string}> = [];
let deferredInstallPrompt: Event | null = null;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

app.innerHTML = `
  <div class="shell ${state.creationMode ? "creation" : ""}" id="shell">
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
          <option value="height">Height</option>
          <option value="relief">Relief</option>
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
      <button class="button glass" id="creationToggle" type="button"></button>
      <button class="button glass creation-only" id="toolsToggle" type="button">Tools</button>
      <button class="button glass" id="installButton" type="button" hidden>Install</button>
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
const creationToggle = document.querySelector<HTMLButtonElement>("#creationToggle")!;
const toolsToggle = document.querySelector<HTMLButtonElement>("#toolsToggle")!;
const installButton = document.querySelector<HTMLButtonElement>("#installButton")!;
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
const rasterCanvas = document.createElement("canvas");
const rasterContext = rasterCanvas.getContext("2d", {willReadFrequently: true});

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
  updateModeUi();
  updateToolButtons();
}

function bindEvents(): void {
  window.addEventListener("resize", () => {
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
    renderBaseMap();
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
  const scale = Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT);
  const cssWidth = WORLD_WIDTH * scale;
  const cssHeight = WORLD_HEIGHT * scale;
  const left = (rect.width - cssWidth) / 2;
  const top = (rect.height - cssHeight) / 2;

  for (const canvas of [mapCanvas, editCanvas]) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(WORLD_WIDTH * dpr);
    canvas.height = Math.round(WORLD_HEIGHT * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    const context = canvas.getContext("2d");
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function renderAll(): void {
  renderBaseMap();
  renderEditLayer();
}

function renderBaseMap(): void {
  if (!grid || !heights || !rasterContext) return;

  rasterCanvas.width = grid.cellsX;
  rasterCanvas.height = grid.cellsY;
  const imageData = rasterContext.createImageData(grid.cellsX, grid.cellsY);

  for (let index = 0; index < heights.length; index++) {
    const height = heights[index] ?? 0;
    const shade = getHillshade(index, height);
    const [red, green, blue] = colorForHeight(height, shade);
    const offset = index * 4;
    imageData.data[offset] = red;
    imageData.data[offset + 1] = green;
    imageData.data[offset + 2] = blue;
    imageData.data[offset + 3] = 255;
  }

  rasterContext.putImageData(imageData, 0, 0);

  const context = mapCanvas.getContext("2d")!;
  context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  context.imageSmoothingEnabled = true;
  context.drawImage(rasterCanvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawCoastGlow(context);
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
    const value = Math.round((height / 100) * 255);
    return [value, value, value];
  }

  if (state.renderStyle === "relief") {
    const value = minmax(Math.round(36 + height * 2.15 + shade), 0, 255);
    const blue = height < 20 ? minmax(value + 34, 0, 255) : minmax(value - 26, 0, 255);
    return [value, minmax(value + 10, 0, 255), blue];
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
  context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawOverlay(context, [...state.strokes, ...(currentStroke ? [currentStroke] : [])], state.settlements);
}

function drawOverlay(context: CanvasRenderingContext2D, strokes: Stroke[], settlements: Settlement[]): void {
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.width;
    context.globalAlpha = stroke.kind === "road" ? 0.86 : 0.94;
    context.setLineDash(stroke.kind === "road" ? [] : [stroke.width * 2.8, stroke.width * 1.4]);
    context.beginPath();
    context.moveTo(stroke.points[0][0], stroke.points[0][1]);
    for (const point of stroke.points.slice(1)) context.lineTo(point[0], point[1]);
    context.stroke();
  }

  context.setLineDash([]);
  context.globalAlpha = 1;
  for (const settlement of settlements) {
    if (settlement.kind === "capital") drawStar(context, settlement.x, settlement.y);
    else drawTown(context, settlement.x, settlement.y);
  }
  context.restore();
}

function drawStar(context: CanvasRenderingContext2D, x: number, y: number): void {
  const outer = 14;
  const inner = 6;
  context.save();
  context.fillStyle = "#f9f3c7";
  context.strokeStyle = "#2d2518";
  context.lineWidth = 2.4;
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

function drawTown(context: CanvasRenderingContext2D, x: number, y: number): void {
  context.save();
  context.fillStyle = "#f8f0ce";
  context.strokeStyle = "#2d2518";
  context.lineWidth = 2.2;
  context.beginPath();
  context.arc(x, y, 8, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function onPointerDown(event: PointerEvent): void {
  if (!state.creationMode) return;
  event.preventDefault();
  activePointerId = event.pointerId;
  editCanvas.setPointerCapture(event.pointerId);

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
  renderEditLayer();
}

function onPointerMove(event: PointerEvent): void {
  if (!currentStroke || event.pointerId !== activePointerId) return;
  event.preventDefault();
  const point = eventToWorldPoint(event);
  const last = currentStroke.points[currentStroke.points.length - 1];
  if (distance(last, point) < 2) return;
  currentStroke.points.push(point);
  renderEditLayer();
}

function onPointerUp(event: PointerEvent): void {
  if (event.pointerId !== activePointerId) return;
  editCanvas.releasePointerCapture(event.pointerId);
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
  renderEditLayer();
}

function eventToWorldPoint(event: PointerEvent): Point {
  const rect = editCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * WORLD_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * WORLD_HEIGHT;
  return clampPoint([x, y], WORLD_WIDTH, WORLD_HEIGHT);
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
  exportCanvas.width = WORLD_WIDTH;
  exportCanvas.height = WORLD_HEIGHT;
  const context = exportCanvas.getContext("2d")!;
  context.drawImage(mapCanvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawOverlay(context, state.strokes, state.settlements);

  const link = document.createElement("a");
  link.download = `fantasy-map-${state.seed}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

function updateModeUi(): void {
  shell.classList.toggle("creation", state.creationMode);
  creationToggle.textContent = state.creationMode ? "Exit" : "Creation";
  editCanvas.style.pointerEvents = state.creationMode ? "auto" : "none";
  if (!state.creationMode) editorDrawer.classList.remove("open");
  renderEditLayer();
}

function updateToolButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach(button => {
    button.classList.toggle("active", button.dataset.tool === state.activeTool);
  });
  statusPill.textContent = state.creationMode ? state.activeTool : statusPill.textContent;
}
