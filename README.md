# Fantasy World Map

Installable web app for generating Azgaar-style fantasy heightmaps, rendering them as a richer fantasy atlas, and drawing custom political layers on top of the plain world map.

## Features

- Procedural heightmap templates ported from Azgaar's Fantasy Map Generator.
- Precreated heightmap PNG support from Azgaar's public heightmap set.
- High-resolution, Google Earth-inspired terrain raster generated from Azgaar-style height fields with smooth biomes, relief shading, lakes, rivers, beaches, and coastal water depth.
- Colored elevation and physical-map views with bathymetry, hypsometric land color, relief shading, and subtle contour lines.
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
