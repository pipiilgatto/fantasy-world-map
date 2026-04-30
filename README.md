# Fantasy World Map

Installable web app for generating Azgaar-style fantasy terrain and rendering it as a mobile-friendly shaded relief map with custom political layers.

## Features

- Procedural heightmap templates ported from Azgaar's Fantasy Map Generator.
- Precreated heightmap PNG support from Azgaar's public heightmap set.
- Single shaded relief map renderer with bathymetry, hypsometric land color, relief shading, snow caps, coastlines, rivers, and subtle contour lines.
- Crisp zoom and pan with progressive natural detail instead of visible Voronoi cells.
- Mobile creation mode with a hidden drawer for borders, capitals, towns, and roads.
- Smoothed, screen-stable borders and cased roads with settlement snapping.
- Local persistence for drawing layers.
- PNG export.
- PWA manifest and service worker for Android installation.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

The Vite config uses `base: "./"` so the built app can be served from a GitHub Pages project path.

## GitHub Pages

After pushing the repository, serve the `dist` folder from a `gh-pages` branch. One simple option is:

```bash
npm run build
npx gh-pages -d dist
```

## Source Attribution

Heightmap templates, precreated heightmap metadata/assets, and the heightmap operation logic are adapted from:

- https://github.com/Azgaar/Fantasy-Map-Generator
- https://azgaar.github.io/Fantasy-Map-Generator/
