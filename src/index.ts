import { GameOfLife } from './GameOfLife.js';
import { CanvasRenderer } from './CanvasRenderer.js';

class GameController {
  private game: GameOfLife;
  private renderer: CanvasRenderer;
  private isRunning: boolean = false;
  private generation: number = 0;
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  private frameInterval: number = 100; // 10 fps default

  // UI Elements
  private startBtn!: HTMLButtonElement;
  private stopBtn!: HTMLButtonElement;
  private stepBtn!: HTMLButtonElement;
  private clearBtn!: HTMLButtonElement;
  private randomBtn!: HTMLButtonElement;
  private gliderBtn!: HTMLButtonElement;
  private generationDisplay!: HTMLElement;
  private populationDisplay!: HTMLElement;
  private speedDisplay!: HTMLElement;
  private speedDisplay2!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private speedRange!: HTMLInputElement;
  private gridSizeRange!: HTMLInputElement;
  private gridSizeValue!: HTMLElement;
  private gridSizeValue2!: HTMLElement;
  private cellSize: number = 12;

  constructor() {
    // Initialize game with 40 rows and 60 columns
    this.game = new GameOfLife(40, 60);
    
    // Get canvas and create renderer
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.renderer = new CanvasRenderer(this.canvas, this.game, 12);

    this.initializeUI();
    this.setupEventListeners();
    this.render();
  }

  private initializeUI(): void {
    this.startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    this.stepBtn = document.getElementById('stepBtn') as HTMLButtonElement;
    this.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
    this.randomBtn = document.getElementById('randomBtn') as HTMLButtonElement;
    this.gliderBtn = document.getElementById('gliderBtn') as HTMLButtonElement;
    this.generationDisplay = document.getElementById('generation')!;
    this.populationDisplay = document.getElementById('population')!;
    this.speedDisplay = document.getElementById('speedValue1')!;
    this.speedDisplay2 = document.getElementById('speedValue2')!;
    this.speedDisplay.textContent = (1000 / this.frameInterval).toString();
    this.speedDisplay2.textContent = (1000 / this.frameInterval).toString();
    this.speedRange = document.getElementById('speedRange') as HTMLInputElement;
    this.gridSizeRange = document.getElementById('gridSizeRange') as HTMLInputElement;
    this.gridSizeValue = document.getElementById('gridSizeValue')!;
    this.gridSizeValue2 = document.getElementById('gridSizeValue2')!;
  }

  private setupEventListeners(): void {
    // Button controls
    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn.addEventListener('click', () => this.stop());
    this.stepBtn.addEventListener('click', () => this.step());
    this.clearBtn.addEventListener('click', () => this.clear());
    this.randomBtn.addEventListener('click', () => this.randomize());
    this.gliderBtn.addEventListener('click', () => this.addGlider());
    this.speedRange.addEventListener('input', () => this.updateSpeed());
    this.gridSizeRange.addEventListener('input', () => this.updateGridSize());

    // Rule controls
    this.setupRuleControls();

    // Setup resize handles
    this.setupResizeHandles();

    // Canvas mouse events
    let isDrawing = false;
    let lastCell = { row: -1, col: -1 };

    this.canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const pos = this.renderer.getGridPosition(e.clientX, e.clientY);
      this.game.toggleCell(pos.row, pos.col);
      lastCell = pos;
      this.render();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      
      const pos = this.renderer.getGridPosition(e.clientX, e.clientY);
      if (pos.row !== lastCell.row || pos.col !== lastCell.col) {
        this.game.setCell(pos.row, pos.col, true);
        lastCell = pos;
        this.render();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      isDrawing = false;
    });

    // Mouse wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Scroll up - zoom in (larger cells)
        this.zoomIn();
      } else {
        // Scroll down - zoom out (smaller cells)
        this.zoomOut();
      }
    }, { passive: false });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.isRunning ? this.stop() : this.start();
          break;
        case 'n':
        case 'N':
          this.step();
          break;
        case 'c':
        case 'C':
          this.clear();
          break;
        case 'r':
        case 'R':
          this.randomize();
          break;
        case 'ArrowUp':
          this.increaseSpeed();
          break;
        case 'ArrowDown':
          this.decreaseSpeed();
          break;
      }
    });
  }

  private updateSpeed(): void {
    const speed = parseInt(this.speedRange.value);
    this.frameInterval = 1000 / speed;
    this.speedDisplay.textContent = speed.toString();
    this.speedDisplay2.textContent = speed.toString();
  }

  private setupRuleControls(): void {
    const presetSelect = document.getElementById('rulePreset') as HTMLSelectElement;
    const birthRulesContainer = document.getElementById('birthRules')!;
    const survivalRulesContainer = document.getElementById('survivalRules')!;

    const presets: { [key: string]: { birth: number[]; survival: number[] } } = {
      'conway': { birth: [3], survival: [2, 3] },
      'highlife': { birth: [3, 6], survival: [2, 3] },
      'daynight': { birth: [3, 6, 7, 8], survival: [3, 4, 6, 7, 8] },
      'seeds': { birth: [2], survival: [] },
      'life34': { birth: [3, 4], survival: [3, 4] },
      'diamoeba': { birth: [3, 5, 6, 7, 8], survival: [5, 6, 7, 8] }
    };

    const updateCheckboxUI = () => {
      const birthRule = this.game.getBirthRule();
      const survivalRule = this.game.getSurvivalRule();

      birthRulesContainer.querySelectorAll('label').forEach(label => {
        const input = label.querySelector('input') as HTMLInputElement;
        const count = parseInt(input.dataset.count || '0');
        input.checked = birthRule.includes(count);
        label.classList.toggle('checked', input.checked);
      });

      survivalRulesContainer.querySelectorAll('label').forEach(label => {
        const input = label.querySelector('input') as HTMLInputElement;
        const count = parseInt(input.dataset.count || '0');
        input.checked = survivalRule.includes(count);
        label.classList.toggle('checked', input.checked);
      });
    };

    const updateRulesFromCheckboxes = () => {
      const birthCounts: number[] = [];
      const survivalCounts: number[] = [];

      birthRulesContainer.querySelectorAll('input:checked').forEach(input => {
        birthCounts.push(parseInt((input as HTMLInputElement).dataset.count || '0'));
      });

      survivalRulesContainer.querySelectorAll('input:checked').forEach(input => {
        survivalCounts.push(parseInt((input as HTMLInputElement).dataset.count || '0'));
      });

      this.game.setBirthRule(birthCounts);
      this.game.setSurvivalRule(survivalCounts);
      presetSelect.value = 'custom';
    };

    presetSelect.addEventListener('change', () => {
      const preset = presets[presetSelect.value];
      if (preset) {
        this.game.setBirthRule(preset.birth);
        this.game.setSurvivalRule(preset.survival);
        updateCheckboxUI();
      }
    });

    birthRulesContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (e) => {
        const label = (e.target as HTMLElement).closest('label')!;
        label.classList.toggle('checked', (e.target as HTMLInputElement).checked);
        updateRulesFromCheckboxes();
      });
    });

    survivalRulesContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (e) => {
        const label = (e.target as HTMLElement).closest('label')!;
        label.classList.toggle('checked', (e.target as HTMLInputElement).checked);
        updateRulesFromCheckboxes();
      });
    });
  }
  
  private updateGridSize(): void {
    const size = parseInt(this.gridSizeRange.value);
    this.gridSizeValue.textContent = size.toString();
    this.gridSizeValue2.textContent = size.toString();
    this.stop();
    this.game = new GameOfLife(size, size);
    this.cellSize = Math.max(4, 600 / size);
    this.renderer = new CanvasRenderer(this.canvas, this.game, this.cellSize);
    this.generation = 0;
    this.render();
  }

  private zoomIn(): void {
    this.cellSize = Math.min(40, this.cellSize + 2);
    this.renderer = new CanvasRenderer(this.canvas, this.game, this.cellSize);
    this.render();
  }

  private zoomOut(): void {
    this.cellSize = Math.max(4, this.cellSize - 2);
    this.renderer = new CanvasRenderer(this.canvas, this.game, this.cellSize);
    this.render();
  }

  private setupResizeHandles(): void {
    const resizeRight = document.getElementById('resizeRight')!;
    const resizeBottom = document.getElementById('resizeBottom')!;
    const resizeCorner = document.getElementById('resizeCorner')!;

    let isResizing = false;
    let resizeType: 'right' | 'bottom' | 'corner' = 'corner';
    let startX = 0;
    let startY = 0;
    let startRows = 0;
    let startCols = 0;

    const startResize = (e: MouseEvent, type: 'right' | 'bottom' | 'corner') => {
      isResizing = true;
      resizeType = type;
      startX = e.clientX;
      startY = e.clientY;
      const dims = this.game.getDimensions();
      startRows = dims.rows;
      startCols = dims.cols;
      e.preventDefault();
    };

    resizeRight.addEventListener('mousedown', (e) => startResize(e, 'right'));
    resizeBottom.addEventListener('mousedown', (e) => startResize(e, 'bottom'));
    resizeCorner.addEventListener('mousedown', (e) => startResize(e, 'corner'));

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const cellDeltaX = Math.round(deltaX / this.cellSize);
      const cellDeltaY = Math.round(deltaY / this.cellSize);

      let newCols = startCols;
      let newRows = startRows;

      if (resizeType === 'right' || resizeType === 'corner') {
        newCols = Math.max(10, Math.min(200, startCols + cellDeltaX));
      }
      if (resizeType === 'bottom' || resizeType === 'corner') {
        newRows = Math.max(10, Math.min(200, startRows + cellDeltaY));
      }

      const dims = this.game.getDimensions();
      if (newRows !== dims.rows || newCols !== dims.cols) {
        this.resizeGrid(newRows, newCols);
      }
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }

  private resizeGrid(rows: number, cols: number): void {
    const oldGrid = this.game.getGrid();
    this.game = new GameOfLife(rows, cols);
    
    // Preserve existing cells
    for (let row = 0; row < Math.min(oldGrid.length, rows); row++) {
      for (let col = 0; col < Math.min(oldGrid[row].length, cols); col++) {
        if (oldGrid[row][col]) {
          this.game.setCell(row, col, true);
        }
      }
    }
    
    this.renderer = new CanvasRenderer(this.canvas, this.game, this.cellSize);
    this.gridSizeValue.textContent = cols.toString();
    this.gridSizeValue2.textContent = rows.toString();
    this.render();
  }

  private start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startBtn.classList.add('active');
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  private stop(): void {
    this.isRunning = false;
    this.startBtn.classList.remove('active');
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private step(): void {
    this.game.nextGeneration();
    this.generation++;
    this.render();
  }

  private clear(): void {
    this.stop();
    this.game.clear();
    this.generation = 0;
    this.render();
  }

  private randomize(): void {
    this.stop();
    this.game.randomize(0.25);
    this.generation = 0;
    this.render();
  }

  private addGlider(): void {
    // Add glider at a random position
    const { rows, cols } = this.game.getDimensions();
    const startRow = Math.floor(Math.random() * (rows - 5)) + 1;
    const startCol = Math.floor(Math.random() * (cols - 5)) + 1;
    this.game.addGlider(startRow, startCol);
    this.render();
  }

  private increaseSpeed(): void {
    this.frameInterval = Math.max(16, this.frameInterval - 20); // Min ~60fps
    this.updateSpeedDisplay();
  }

  private decreaseSpeed(): void {
    this.frameInterval = Math.min(1000, this.frameInterval + 20); // Min 1fps
    this.updateSpeedDisplay();
  }

  private updateSpeedDisplay(): void {
    const fps = Math.round(1000 / this.frameInterval);
    this.speedDisplay.textContent = fps.toString();
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed >= this.frameInterval) {
      this.game.nextGeneration();
      this.generation++;
      this.render();
      this.lastFrameTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private render(): void {
    this.renderer.render();
    this.updateStats();
  }

  private updateStats(): void {
    this.generationDisplay.textContent = this.generation.toString();
    this.populationDisplay.textContent = this.game.getPopulation().toString();
  }
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GameController();
});
