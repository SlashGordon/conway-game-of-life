import { GameOfLife } from './GameOfLife.js';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private game: GameOfLife;

  // Cyberpunk color palette
  private readonly backgroundColor = '#0a0a0f';
  private readonly gridColor = 'rgba(0, 240, 255, 0.08)';
  private readonly cellColors = ['#00f0ff', '#00e5f0', '#00d4e0', '#7b2dff'];
  private readonly glowColor = 'rgba(0, 240, 255, 0.4)';
  private readonly secondaryGlow = 'rgba(255, 0, 228, 0.2)';

  constructor(canvas: HTMLCanvasElement, game: GameOfLife, cellSize: number = 15) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.game = game;
    this.cellSize = cellSize;

    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const { rows, cols } = this.game.getDimensions();
    this.canvas.width = cols * this.cellSize;
    this.canvas.height = rows * this.cellSize;
  }

  /**
   * Render the current state of the game
   */
  render(): void {
    const { rows, cols } = this.game.getDimensions();

    // Clear canvas with gradient background
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
    );
    gradient.addColorStop(0, '#12121a');
    gradient.addColorStop(1, '#0a0a0f');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, rows * this.cellSize);
      this.ctx.stroke();
    }

    for (let y = 0; y <= rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(cols * this.cellSize, y * this.cellSize);
      this.ctx.stroke();
    }

    // Draw cells with glow effect
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (this.game.getCell(row, col)) {
          this.drawCell(row, col);
        }
      }
    }
  }

  private drawCell(row: number, col: number): void {
    const x = col * this.cellSize;
    const y = row * this.cellSize;
    const padding = Math.max(1, this.cellSize * 0.1);
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;

    // Outer glow
    if (this.cellSize >= 6) {
      const glowGradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, this.cellSize * 1.2
      );
      glowGradient.addColorStop(0, this.glowColor);
      glowGradient.addColorStop(0.5, this.secondaryGlow);
      glowGradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(
        x - this.cellSize * 0.3,
        y - this.cellSize * 0.3,
        this.cellSize * 1.6,
        this.cellSize * 1.6
      );
    }

    // Main cell with gradient
    const cellGradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
    cellGradient.addColorStop(0, '#00f0ff');
    cellGradient.addColorStop(0.5, '#00e0ff');
    cellGradient.addColorStop(1, '#7b2dff');
    
    this.ctx.fillStyle = cellGradient;
    this.ctx.fillRect(
      x + padding,
      y + padding,
      this.cellSize - padding * 2,
      this.cellSize - padding * 2
    );

    // Inner highlight
    if (this.cellSize >= 8) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(
        x + padding + 1,
        y + padding + 1,
        (this.cellSize - padding * 2) * 0.3,
        (this.cellSize - padding * 2) * 0.3
      );
    }
  }

  /**
   * Convert canvas coordinates to grid coordinates
   */
  getGridPosition(canvasX: number, canvasY: number): { row: number; col: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (canvasX - rect.left) * scaleX;
    const y = (canvasY - rect.top) * scaleY;

    return {
      row: Math.floor(y / this.cellSize),
      col: Math.floor(x / this.cellSize)
    };
  }

  /**
   * Get the cell size
   */
  getCellSize(): number {
    return this.cellSize;
  }
}
