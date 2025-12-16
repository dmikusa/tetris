import Phaser from 'phaser';
import { FIELD_WIDTH, FIELD_VISIBLE_HEIGHT, FIELD_TOTAL_HEIGHT } from '../../model/constants';
import { TetrominoType } from '../../model/types';
import { GameController } from '../../controller/GameController';
import { InputController } from '../../controller/InputController';
import { COLORS } from '../../model/colors';
import { SHAPES } from '../../model/shapes';

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
  private gameController!: GameController;
  private inputController!: InputController;
  private background!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Add background image
    this.background = this.add.image(512, 384, 'game-background');
    this.background.setDisplaySize(1024, 768);
    this.background.setDepth(-1);

    // Set background color (as fallback)
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

    // Initialize game controller
    this.gameController = new GameController();

    // Initialize input controller with callbacks
    this.inputController = new InputController({
      onMoveLeft: () => this.gameController.moveLeft(),
      onMoveRight: () => this.gameController.moveRight(),
      onSoftDropStart: () => this.gameController.softDropStart(),
      onSoftDropEnd: () => this.gameController.softDropEnd(),
      onHardDrop: () => this.gameController.hardDrop(),
      onRotateClockwise: () => this.gameController.rotateClockwise(),
      onRotateCounterclockwise: () => this.gameController.rotateCounterclockwise(),
    });

    // Start input handling
    this.inputController.start();

    // Start the game
    this.gameController.startGame();
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
    // Get current game state
    const state = this.gameController.getState();

    // Render the playfield
    this.renderState(state);
  }

  /**
   * Renders the current game state
   */
  private renderState(state: ReturnType<typeof this.gameController.getState>): void {
    // Clear all cells
    for (let row = 0; row < FIELD_VISIBLE_HEIGHT; row++) {
      for (let col = 0; col < FIELD_WIDTH; col++) {
        const graphics = this.cellGraphics[row][col];
        graphics.clear();

        // Position for this cell
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        // Draw cell background
        graphics.fillStyle(EMPTY_CELL_COLOR, 1);
        graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Draw cell border
        graphics.lineStyle(GRID_LINE_WIDTH, GRID_LINE_COLOR, 1);
        graphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    // Render locked pieces from matrix (only visible rows)
    for (let row = 0; row < FIELD_VISIBLE_HEIGHT; row++) {
      for (let col = 0; col < FIELD_WIDTH; col++) {
        const matrixRow = row + (FIELD_TOTAL_HEIGHT - FIELD_VISIBLE_HEIGHT);
        const cellType = state.matrix[matrixRow][col];

        if (cellType !== null) {
          this.renderCell(row, col, cellType);
        }
      }
    }

    // Render active piece
    if (state.activePiece) {
      const piece = state.activePiece;
      const shape = SHAPES[piece.type][piece.rotation];
      const { x: pieceX, y: pieceY } = piece.position;

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] === 1) {
            const fieldX = pieceX + x;
            const fieldY = pieceY + y;

            // Convert to visible row (0-19)
            const visibleRow = fieldY - (FIELD_TOTAL_HEIGHT - FIELD_VISIBLE_HEIGHT);

            // Only render if in visible area
            if (
              visibleRow >= 0 &&
              visibleRow < FIELD_VISIBLE_HEIGHT &&
              fieldX >= 0 &&
              fieldX < FIELD_WIDTH
            ) {
              this.renderCell(visibleRow, fieldX, piece.type);
            }
          }
        }
      }
    }
  }

  /**
   * Renders a single cell with the appropriate color
   */
  private renderCell(row: number, col: number, type: TetrominoType): void {
    const graphics = this.cellGraphics[row][col];
    const colorHex = COLORS[type];
    const color = parseInt(colorHex.replace('#', ''), 16);

    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;

    graphics.clear();

    // Draw filled cell
    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);

    // Draw border
    graphics.lineStyle(GRID_LINE_WIDTH, GRID_LINE_COLOR, 1);
    graphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
  }

  /**
   * Clean up when scene is destroyed
   */
  shutdown(): void {
    if (this.inputController) {
      this.inputController.destroy();
    }
  }
}
