/**
 * Conway's Game of Life
 * 
 * Rules:
 * 1. Any live cell with fewer than two live neighbors dies (underpopulation)
 * 2. Any live cell with two or three live neighbors lives on
 * 3. Any live cell with more than three live neighbors dies (overpopulation)
 * 4. Any dead cell with exactly three live neighbors becomes alive (reproduction)
 */

export class GameOfLife {
  private grid: boolean[][];
  private readonly rows: number;
  private readonly cols: number;
  
  // Rules: which neighbor counts cause birth (for dead cells) or survival (for live cells)
  private birthRule: Set<number> = new Set([3]);        // Default: dead cell becomes alive with 3 neighbors
  private survivalRule: Set<number> = new Set([2, 3]);  // Default: live cell survives with 2 or 3 neighbors

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.grid = this.createEmptyGrid();
  }

  /**
   * Set custom birth rule (neighbor counts that cause a dead cell to become alive)
   */
  setBirthRule(counts: number[]): void {
    this.birthRule = new Set(counts);
  }

  /**
   * Set custom survival rule (neighbor counts that allow a live cell to survive)
   */
  setSurvivalRule(counts: number[]): void {
    this.survivalRule = new Set(counts);
  }

  /**
   * Get current birth rule
   */
  getBirthRule(): number[] {
    return Array.from(this.birthRule).sort();
  }

  /**
   * Get current survival rule
   */
  getSurvivalRule(): number[] {
    return Array.from(this.survivalRule).sort();
  }

  private createEmptyGrid(): boolean[][] {
    return Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => false)
    );
  }

  /**
   * Get the current state of a cell
   */
  getCell(row: number, col: number): boolean {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return false;
    }
    return this.grid[row][col];
  }

  /**
   * Set the state of a cell
   */
  setCell(row: number, col: number, alive: boolean): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = alive;
    }
  }

  /**
   * Toggle the state of a cell
   */
  toggleCell(row: number, col: number): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = !this.grid[row][col];
    }
  }

  /**
   * Count the number of live neighbors for a cell
   */
  private countNeighbors(row: number, col: number): number {
    let count = 0;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (this.getCell(newRow, newCol)) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Compute the next generation
   */
  nextGeneration(): void {
    const newGrid = this.createEmptyGrid();

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const neighbors = this.countNeighbors(row, col);
        const isAlive = this.grid[row][col];

        if (isAlive) {
          // Live cell survives if neighbor count is in survival rule
          newGrid[row][col] = this.survivalRule.has(neighbors);
        } else {
          // Dead cell becomes alive if neighbor count is in birth rule
          newGrid[row][col] = this.birthRule.has(neighbors);
        }
      }
    }

    this.grid = newGrid;
  }

  /**
   * Clear the entire grid
   */
  clear(): void {
    this.grid = this.createEmptyGrid();
  }

  /**
   * Randomize the grid
   */
  randomize(probability: number = 0.3): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = Math.random() < probability;
      }
    }
  }

  /**
   * Add a glider pattern at the specified position
   */
  addGlider(startRow: number, startCol: number): void {
    const glider = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ];

    for (let row = 0; row < glider.length; row++) {
      for (let col = 0; col < glider[row].length; col++) {
        if (glider[row][col]) {
          this.setCell(startRow + row, startCol + col, true);
        }
      }
    }
  }

  /**
   * Add a glider gun (Gosper glider gun) at the specified position
   */
  addGliderGun(startRow: number, startCol: number): void {
    const pattern = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];

    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col]) {
          this.setCell(startRow + row, startCol + col, true);
        }
      }
    }
  }

  /**
   * Get the total population (number of live cells)
   */
  getPopulation(): number {
    let count = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col]) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Get grid dimensions
   */
  getDimensions(): { rows: number; cols: number } {
    return { rows: this.rows, cols: this.cols };
  }

  /**
   * Get the entire grid state
   */
  getGrid(): boolean[][] {
    return this.grid.map(row => [...row]);
  }
}
