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
  private gameOverOverlay?: Phaser.GameObjects.Container;
  private gameOverText?: Phaser.GameObjects.Text;
  private statsText?: Phaser.GameObjects.Text;
  private restartText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private linesText?: Phaser.GameObjects.Text;
  private nextQueueContainer?: Phaser.GameObjects.Container;
  private readonly NEXT_PREVIEW_COUNT = 1;
  private readonly NEXT_CELL_SIZE = 20; // Smaller cells for preview

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
    const startX = (this.cameras.main.width - playfieldWidth) / 2 - 5;
    const startY = (this.cameras.main.height - playfieldHeight) / 2 - 60;

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

    // Create game info display (score, level, lines)
    this.createGameInfo();

    // Create next queue preview
    this.createNextQueue();

    // Create game over overlay (initially hidden)
    this.createGameOverOverlay();
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

    // Update game info display
    if (this.scoreText) {
      this.scoreText.setText(`${state.score}`);
    }
    if (this.levelText) {
      this.levelText.setText(`${state.level}`);
    }
    if (this.linesText) {
      this.linesText.setText(`${state.linesCleared}`);
    }

    // Update next queue preview
    this.renderNextQueue();

    // Show/hide game over overlay based on game state
    if (this.gameOverOverlay) {
      this.gameOverOverlay.setVisible(state.isGameOver);

      // Update stats if game is over
      if (state.isGameOver && this.statsText) {
        this.statsText.setText([
          `Score: ${state.score}`,
          `Level: ${state.level}`,
          `Lines: ${state.linesCleared}`,
        ]);
      }
    }
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
   * Creates the game info display showing score, level, and lines
   */
  private createGameInfo(): void {
    // Position text in the UI boxes visible in the background image
    // Coordinates are based on the arcade_bg_1024x768.png layout

    // HIGH SCORE box (top left) - content area center
    this.scoreText = this.add.text(170, 210, '0', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.scoreText.setOrigin(0.5, 0.5); // Center the text

    // LEVEL box (bottom left) - content area center
    this.levelText = this.add.text(170, 355, '1', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.levelText.setOrigin(0.5, 0.5); // Center the text

    // LINES box (bottom right) - content area center
    this.linesText = this.add.text(855, 355, '0', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.linesText.setOrigin(0.5, 0.5); // Center the text
  }

  /**
   * Creates the container for the next queue preview
   */
  private createNextQueue(): void {
    // Position for NEXT box (top right based on background image)
    // Positioned to center vertically in the empty area below the "NEXT" label
    const nextBoxX = 855;
    const nextBoxY = 210;

    // Create container for all next queue pieces
    this.nextQueueContainer = this.add.container(nextBoxX, nextBoxY);
  }

  /**
   * Renders the next queue preview showing upcoming pieces
   */
  private renderNextQueue(): void {
    if (!this.nextQueueContainer) {
      return;
    }

    // Clear previous preview
    this.nextQueueContainer.removeAll(true);

    // Get next pieces from game controller
    const nextPieces = this.gameController.getNextPieces(this.NEXT_PREVIEW_COUNT);

    // Render each piece in the queue
    nextPieces.forEach((pieceType, index) => {
      this.renderNextPiece(pieceType, index);
    });
  }

  /**
   * Renders a single piece in the next queue
   * @param pieceType - The type of piece to render
   * @param index - Position in the queue (0 = next, 1 = second, etc.)
   */
  private renderNextPiece(pieceType: TetrominoType, index: number): void {
    if (!this.nextQueueContainer) {
      return;
    }

    // Get the shape for rotation 0 (spawn orientation)
    const shape = SHAPES[pieceType][0];
    const colorHex = COLORS[pieceType];
    const color = parseInt(colorHex.replace('#', ''), 16);

    // Calculate vertical offset for this piece (stack them vertically)
    const verticalSpacing = 60; // Space between pieces
    const yOffset = index * verticalSpacing;

    // Find the bounds of the piece to center it
    let minX = 4,
      maxX = 0,
      minY = 4,
      maxY = 0;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Calculate centering offset
    const pieceWidth = (maxX - minX + 1) * this.NEXT_CELL_SIZE;
    const pieceHeight = (maxY - minY + 1) * this.NEXT_CELL_SIZE;
    const centerOffsetX = -pieceWidth / 2;
    const centerOffsetY = -pieceHeight / 2;

    // Render each mino of the piece
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const graphics = this.add.graphics();

          // Position relative to piece bounds
          const cellX = (x - minX) * this.NEXT_CELL_SIZE + centerOffsetX;
          const cellY = (y - minY) * this.NEXT_CELL_SIZE + centerOffsetY + yOffset;

          // Draw filled cell
          graphics.fillStyle(color, 1);
          graphics.fillRect(cellX, cellY, this.NEXT_CELL_SIZE, this.NEXT_CELL_SIZE);

          // Draw border
          graphics.lineStyle(1, GRID_LINE_COLOR, 1);
          graphics.strokeRect(cellX, cellY, this.NEXT_CELL_SIZE, this.NEXT_CELL_SIZE);

          // Add to next queue container
          this.nextQueueContainer.add(graphics);
        }
      }
    }
  }

  /**
   * Creates the game over overlay with semi-transparent background and text
   */
  private createGameOverOverlay(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Create container for all game over elements
    this.gameOverOverlay = this.add.container(0, 0);
    this.gameOverOverlay.setDepth(1000); // Render on top of everything
    this.gameOverOverlay.setVisible(false); // Hidden by default

    // Semi-transparent dark background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.gameOverOverlay.add(overlay);

    // Game Over text
    this.gameOverText = this.add.text(centerX, centerY - 100, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '64px',
      color: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 4,
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverOverlay.add(this.gameOverText);

    // Stats text
    this.statsText = this.add.text(centerX, centerY, '', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
    });
    this.statsText.setOrigin(0.5);
    this.gameOverOverlay.add(this.statsText);

    // Restart instructions
    this.restartText = this.add.text(centerX, centerY + 100, 'Press SPACE to restart', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffff00',
    });
    this.restartText.setOrigin(0.5);
    this.gameOverOverlay.add(this.restartText);

    // Add keyboard listener for restart
    this.input.keyboard?.on('keydown-SPACE', () => {
      const state = this.gameController.getState();
      if (state.isGameOver) {
        this.gameController.startGame();
      }
    });
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
