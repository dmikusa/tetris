import Phaser from 'phaser';
import { FIELD_WIDTH, FIELD_VISIBLE_HEIGHT, FIELD_TOTAL_HEIGHT } from '../../model/constants';
import { Matrix } from '../../model/types';

/**
 * Visual constants for the playfield
 */
const CELL_SIZE = 30; // pixels per cell
const GRID_LINE_WIDTH = 1;
const GRID_LINE_COLOR = 0x444444;
const EMPTY_CELL_COLOR = 0x1a1a1a;
const BACKGROUND_COLOR = 0x000000;

/**
 * Main game scene that renders the Tetris playfield
 */
export class GameScene extends Phaser.Scene {
  private playfieldContainer!: Phaser.GameObjects.Container;
  private cellGraphics: Phaser.GameObjects.Graphics[][] = [];
  // @ts-expect-error - not used at the moment, but that's OK
  private matrix: Matrix;

  constructor() {
    super({ key: 'GameScene' });
    // Initialize empty matrix
    this.matrix = Array(FIELD_TOTAL_HEIGHT)
      .fill(null)
      .map(() => Array(FIELD_WIDTH).fill(null));
  }

  create(): void {
    // Set background color
    this.cameras.main.setBackgroundColor(BACKGROUND_COLOR);

    // Calculate playfield position to center it
    const playfieldWidth = FIELD_WIDTH * CELL_SIZE;
    const playfieldHeight = FIELD_VISIBLE_HEIGHT * CELL_SIZE;
    const startX = (this.cameras.main.width - playfieldWidth) / 2;
    const startY = (this.cameras.main.height - playfieldHeight) / 2;

    // Create container for the playfield
    this.playfieldContainer = this.add.container(startX, startY);

    // Render the grid
    this.renderPlayfield();
  }

  /**
   * Renders the visible playfield (rows 21-40 in the matrix, displayed as 1-20)
   */
  private renderPlayfield(): void {
    // Clear existing graphics
    this.cellGraphics = [];

    // Render only the visible rows (buffer rows 0-19 are hidden)
    for (let row = 0; row < FIELD_VISIBLE_HEIGHT; row++) {
      this.cellGraphics[row] = [];

      for (let col = 0; col < FIELD_WIDTH; col++) {
        const graphics = this.add.graphics();

        // Position for this cell
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        // Draw cell background
        graphics.fillStyle(EMPTY_CELL_COLOR, 1);
        graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Draw cell border
        graphics.lineStyle(GRID_LINE_WIDTH, GRID_LINE_COLOR, 1);
        graphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

        // Add to container
        this.playfieldContainer.add(graphics);
        this.cellGraphics[row][col] = graphics;
      }
    }
  }

  /**
   * Update method called every frame
   */
  update(): void {
    // Empty for now, will be used for game logic later
  }
}
