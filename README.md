# Conway's Game of Life

An interactive Conway's Game of Life simulator built with TypeScript and HTML5 Canvas, featuring a cyberpunk aesthetic with glow effects and neon colors.

## [▶ Play it live](https://slashgordon.github.io/game-of-life/)

## Features

- **Interactive grid** — click or drag to draw cells
- **Scroll to zoom** — mouse wheel adjusts cell size
- **Resizable grid** — drag edges to expand or shrink the simulation area
- **Speed control** — adjustable from 1 to 60 fps
- **Grid size slider** — 10×10 up to 200×200
- **Keyboard shortcuts** — Space (play/pause), N (step), C (clear), R (random), Arrow keys (speed)
- **Customizable rules** — toggle birth/survival neighbor counts via checkboxes
- **Rule presets** — Conway (B3/S23), HighLife, Day & Night, Seeds, Life 3-4, Diamoeba
- **Pattern stamps** — Glider and Gosper Glider Gun

## Rules

The Game of Life is governed by four simple rules:

1. **Underpopulation** — any live cell with fewer than two live neighbors dies
2. **Survival** — any live cell with two or three live neighbors lives on
3. **Overpopulation** — any live cell with more than three live neighbors dies
4. **Reproduction** — any dead cell with exactly three live neighbors becomes alive

## Architecture

```
src/
├── GameOfLife.ts      # Pure simulation engine (grid + rules)
├── CanvasRenderer.ts  # Canvas rendering with glow/gradient effects
└── index.ts           # UI controller (buttons, sliders, mouse/keyboard events)
```

## Getting Started

```bash
# Install dependencies
npm install

# Build
npm run build

# Start dev server
npm run dev
```

Then open `http://localhost:3000` in your browser.

## License

MIT
