import { GameState, GameStatus, Piece, TetrominoType, RotationState } from '../model/types';
import { PieceBag } from '../model/PieceBag';
import { SHAPES } from '../model/shapes';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT, FIELD_VISIBLE_HEIGHT } from '../model/constants';
import { GravitySystem } from './GravitySystem';
import { CollisionDetector } from './CollisionDetector';
import { LockDelaySystem } from './LockDelaySystem';
import { RotationSystem } from './RotationSystem';
import { LineClearSystem } from './LineClearSystem';
import { ScoringSystem } from './ScoringSystem';
import { LevelSystem } from './LevelSystem';

/**
 * Spawn positions for each tetromino type
 * Based on Tetris guideline specification
 */
const SPAWN_POSITIONS: Record<TetrominoType, { x: number; y: number }> = {
  [TetrominoType.I]: { x: 3, y: 21 }, // Centered (4-wide piece)
  [TetrominoType.O]: { x: 4, y: 21 }, // Centered (2-wide piece)
  [TetrominoType.T]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.S]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.Z]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.J]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.L]: { x: 3, y: 21 }, // Rounded left (3-wide)
};

/**
 * Game controller manages game logic and state
 * Implements the Controller layer in MVC architecture
 */
export class GameController {
  private state: GameState;
  private pieceBag: PieceBag;
  private gravitySystem: GravitySystem;
  private collisionDetector: CollisionDetector;
  private lockDelaySystem: LockDelaySystem;
  private rotationSystem: RotationSystem;
  private lineClearSystem: LineClearSystem;
  private scoringSystem: ScoringSystem;
  private levelSystem: LevelSystem;
  private isSoftDropping = false;

  /**
   * Creates a new game controller
   * @param seed - Optional seed for deterministic piece generation (testing)
   */
  constructor(seed?: number) {
    this.pieceBag = new PieceBag(seed);
    this.state = this.createInitialState();
    this.collisionDetector = new CollisionDetector();
    this.lockDelaySystem = new LockDelaySystem(() => this.lockPiece());
    this.gravitySystem = new GravitySystem(this.state.level, () => this.moveDown());
    this.rotationSystem = new RotationSystem();
    this.lineClearSystem = new LineClearSystem();
    this.scoringSystem = new ScoringSystem();
    this.levelSystem = new LevelSystem();
  }

  /**
   * Gets the current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Creates the initial game state
   */
  private createInitialState(): GameState {
    // Create empty matrix
    const matrix: (TetrominoType | null)[][] = [];
    for (let y = 0; y < FIELD_TOTAL_HEIGHT; y++) {
      matrix[y] = [];
      for (let x = 0; x < FIELD_WIDTH; x++) {
        matrix[y][x] = null;
      }
    }

    return {
      matrix,
      playfield: matrix,
      activePiece: null,
      currentPiece: {
        type: 'T' as TetrominoType,
        rotation: 0 as RotationState,
        position: { x: 0, y: 0 },
      },
      score: 0,
      level: 1,
      linesCleared: 0,
      status: GameStatus.Playing,
      isGameOver: false,
    };
  }

  /**
   * Spawns the next piece from the bag
   * @returns true if spawn succeeded, false if top-out occurred
   */
  spawnNextPiece(): boolean {
    if (this.state.status === GameStatus.GameOver) {
      return false;
    }

    // Get next piece from bag
    const type = this.pieceBag.next();
    const spawnPos = SPAWN_POSITIONS[type];

    // Create piece at spawn position with rotation 0
    const newPiece: Piece = {
      type,
      position: { x: spawnPos.x, y: spawnPos.y },
      rotation: 0,
    };

    // Check for spawn overlap (top-out condition 1)
    if (this.checkOverlap(newPiece)) {
      this.triggerGameOver();
      return false;
    }

    // Set active piece
    this.state.activePiece = newPiece;

    // Immediately drop piece one row
    this.state.activePiece.position.y++;

    return true;
  }

  /**
   * Moves the active piece down by one row
   * @returns true if movement succeeded, false if blocked
   */
  moveDown(): boolean {
    if (!this.state.activePiece || this.state.status !== GameStatus.Playing) {
      return false;
    }

    // Check if can move down using collision detector
    if (!this.collisionDetector.canMoveDown(this.state.activePiece, this.state.matrix)) {
      // Cannot move down - start lock delay
      this.gravitySystem.stop();
      this.lockDelaySystem.start();
      return false;
    }

    // Move is valid, update position
    this.state.activePiece.position.y++;

    // Award soft drop bonus if player is soft dropping
    if (this.isSoftDropping) {
      const bonus = this.scoringSystem.calculateSoftDropBonus(1);
      this.scoringSystem.addScore(bonus);
      this.state.score = this.scoringSystem.getScore();
    }

    // Reset lock delay if piece was on ground and moved down (step reset)
    if (this.lockDelaySystem.isLockDelayActive()) {
      this.lockDelaySystem.reset(true);
    }

    // Check if piece is now on ground again
    if (!this.collisionDetector.canMoveDown(this.state.activePiece, this.state.matrix)) {
      this.gravitySystem.stop();
      this.lockDelaySystem.start();
    }

    return true;
  }

  /**
   * Moves the active piece left by one column
   * @returns true if movement succeeded, false if blocked
   */
  moveLeft(): boolean {
    if (!this.state.activePiece || this.state.status !== GameStatus.Playing) {
      return false;
    }

    if (!this.collisionDetector.canMoveLeft(this.state.activePiece, this.state.matrix)) {
      return false;
    }

    this.state.activePiece.position.x--;

    // Reset lock delay on movement (move reset mode)
    if (this.lockDelaySystem.isLockDelayActive()) {
      this.lockDelaySystem.reset(false);
    }

    return true;
  }

  /**
   * Moves the active piece right by one column
   * @returns true if movement succeeded, false if blocked
   */
  moveRight(): boolean {
    if (!this.state.activePiece || this.state.status !== GameStatus.Playing) {
      return false;
    }

    if (!this.collisionDetector.canMoveRight(this.state.activePiece, this.state.matrix)) {
      return false;
    }

    this.state.activePiece.position.x++;

    // Reset lock delay on movement (move reset mode)
    if (this.lockDelaySystem.isLockDelayActive()) {
      this.lockDelaySystem.reset(false);
    }

    return true;
  }

  /**
   * Starts soft drop - accelerated downward movement
   * The piece falls faster while soft drop is active
   */
  softDropStart(): void {
    if (!this.state.activePiece || this.state.status !== GameStatus.Playing) {
      return;
    }

    // Set soft drop flag to award bonus points
    this.isSoftDropping = true;

    // Move down immediately
    this.moveDown();
  }

  /**
   * Ends soft drop - returns to normal gravity speed
   */
  softDropEnd(): void {
    // Clear soft drop flag
    this.isSoftDropping = false;
  }

  /**
   * Hard drop - instantly drops the piece to the lowest valid position and locks it
   * @returns The number of rows dropped (for scoring)
   */
  hardDrop(): number {
    if (!this.state.activePiece || this.state.status !== GameStatus.Playing) {
      return 0;
    }

    const startY = this.state.activePiece.position.y;
    let dropDistance = 0;

    // Keep moving down until we can't anymore
    while (this.moveDown()) {
      dropDistance++;
    }

    // Calculate actual drop distance (difference in position)
    const finalY = this.state.activePiece.position.y;
    dropDistance = finalY - startY;

    // Add hard drop bonus (2 points per cell)
    if (dropDistance > 0) {
      const bonus = this.scoringSystem.calculateHardDropBonus(dropDistance);
      this.scoringSystem.addScore(bonus);
      this.state.score = this.scoringSystem.getScore();
    }

    // Stop lock delay system and gravity before immediate lock
    this.lockDelaySystem.stop();
    this.gravitySystem.stop();

    // Lock the piece immediately (bypass lock delay)
    // Note: lockPiece() will spawn next piece and restart gravity
    this.lockPiece();

    return dropDistance;
  }

  /**
   * Rotates the active piece clockwise
   * @returns true if rotation succeeded, false if blocked
   */
  rotateClockwise(): boolean {
    if (!this.state.activePiece || this.state.status !== GameStatus.Playing) {
      return false;
    }

    const result = this.rotationSystem.rotateClockwise(this.state.activePiece, this.state.matrix);

    if (result.success && result.piece) {
      this.state.activePiece = result.piece;

      // Reset lock delay on successful rotation (move reset mode)
      if (this.lockDelaySystem.isLockDelayActive()) {
        this.lockDelaySystem.reset(false);
      }

      return true;
    }

    return false;
  }

  /**
   * Rotates the active piece counterclockwise
   * @returns true if rotation succeeded, false if blocked
   */
  rotateCounterclockwise(): boolean {
    if (!this.state.activePiece || this.state.status !== GameStatus.Playing) {
      return false;
    }

    const result = this.rotationSystem.rotateCounterclockwise(
      this.state.activePiece,
      this.state.matrix
    );

    if (result.success && result.piece) {
      this.state.activePiece = result.piece;

      // Reset lock delay on successful rotation (move reset mode)
      if (this.lockDelaySystem.isLockDelayActive()) {
        this.lockDelaySystem.reset(false);
      }

      return true;
    }

    return false;
  }

  /**
   * Locks the current piece into the playfield matrix
   */
  private lockPiece(): void {
    if (!this.state.activePiece) {
      return;
    }

    const piece = this.state.activePiece;
    const shape = SHAPES[piece.type][piece.rotation];

    // Check for lock-out condition (piece locks above visible playfield)
    if (this.isLockOut(piece)) {
      this.triggerGameOver();
      return;
    }

    // Transfer piece minos to matrix
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const fieldX = piece.position.x + x;
          const fieldY = piece.position.y + y;

          if (fieldX >= 0 && fieldX < FIELD_WIDTH && fieldY >= 0 && fieldY < FIELD_TOTAL_HEIGHT) {
            this.state.matrix[fieldY][fieldX] = piece.type;
          }
        }
      }
    }

    // Clear active piece
    this.state.activePiece = null;

    // Check for block-out condition (any cell above row 40)
    if (this.isBlockOut()) {
      this.triggerGameOver();
      return;
    }

    // Check for completed lines and clear them
    const affectedRows = this.lineClearSystem.getAffectedRows(piece.position.y, 4);
    const clearResult = this.lineClearSystem.checkAndClearLines(this.state.matrix, affectedRows);

    // Update score and level if lines were cleared
    if (clearResult.linesCleared > 0) {
      // Calculate and add score
      const points = this.scoringSystem.calculateScore(clearResult.linesCleared, this.state.level);
      this.scoringSystem.addScore(points);
      this.state.score = this.scoringSystem.getScore();

      // Update lines cleared count
      this.state.linesCleared += clearResult.linesCleared;

      // Check for level up
      const leveledUp = this.levelSystem.addLines(clearResult.linesCleared);
      if (leveledUp) {
        this.state.level = this.levelSystem.getCurrentLevel();
        // Update gravity speed for new level
        this.gravitySystem.setLevel(this.state.level);
      }
    }

    // Spawn next piece
    const spawnSuccess = this.spawnNextPiece();

    // Only restart gravity if spawn succeeded
    if (spawnSuccess) {
      this.gravitySystem.start();
    }
  }

  /**
   * Checks if a piece overlaps with existing blocks in the playfield
   * @param piece - The piece to check
   * @returns true if overlap detected, false if position is clear
   */
  private checkOverlap(piece: Piece): boolean {
    return this.collisionDetector.checkCollision(piece, this.state.matrix);
  }

  /**
   * Starts a new game
   */
  startGame(): void {
    this.gravitySystem.stop();
    this.lockDelaySystem.stop();

    // Reset the existing state object rather than creating a new one
    // This ensures references to the state object remain valid

    // Clear the matrix
    for (let y = 0; y < FIELD_TOTAL_HEIGHT; y++) {
      for (let x = 0; x < FIELD_WIDTH; x++) {
        this.state.matrix[y][x] = null;
      }
    }

    // Reset scoring and level systems
    this.scoringSystem.reset();
    this.levelSystem.reset();

    // Reset game state properties
    this.state.activePiece = null;
    this.state.score = 0;
    this.state.level = 1;
    this.state.linesCleared = 0;
    this.state.status = GameStatus.Playing;
    this.state.isGameOver = false;

    this.gravitySystem.setLevel(this.state.level);
    this.spawnNextPiece();
    this.gravitySystem.start(); // Start gravity after first piece spawns
  }

  /**
   * Resets the piece bag with optional seed
   * @param seed - Optional seed for deterministic generation
   */
  resetBag(seed?: number): void {
    this.pieceBag.reset(seed);
  }

  /**
   * Gets the gravity system instance
   */
  getGravitySystem(): GravitySystem {
    return this.gravitySystem;
  }

  /**
   * Pauses the game
   */
  pause(): void {
    if (this.state.status === GameStatus.Playing) {
      this.state.status = GameStatus.Paused;
      this.gravitySystem.pause();
    }
  }

  /**
   * Resumes the game
   */
  resume(): void {
    if (this.state.status === GameStatus.Paused) {
      this.state.status = GameStatus.Playing;
      this.gravitySystem.resume();
    }
  }

  /**
   * Gets the collision detector instance
   */
  getCollisionDetector(): CollisionDetector {
    return this.collisionDetector;
  }

  /**
   * Gets the lock delay system instance
   */
  getLockDelaySystem(): LockDelaySystem {
    return this.lockDelaySystem;
  }

  /**
   * Gets the rotation system instance
   */
  getRotationSystem(): RotationSystem {
    return this.rotationSystem;
  }

  /**
   * Gets the line clear system instance
   */
  getLineClearSystem(): LineClearSystem {
    return this.lineClearSystem;
  }

  /**
   * Checks if a piece locks out (locks completely above visible playfield)
   * Top-out condition 2: Piece locks at row 19 or above (visible area is rows 20-39)
   * @param piece - The piece being locked
   * @returns true if any part of the piece is above row 20, false otherwise
   */
  private isLockOut(piece: Piece): boolean {
    const shape = SHAPES[piece.type][piece.rotation];
    const visibleStartRow = FIELD_TOTAL_HEIGHT - FIELD_VISIBLE_HEIGHT; // Row 20

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const fieldY = piece.position.y + y;
          // If any mino is above the visible area (row < 20), it's a lock-out
          if (fieldY < visibleStartRow) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Checks if any blocks are pushed above the playfield boundary
   * Top-out condition 3: Block pushed above row 40 (extremely rare)
   * @returns true if any cell at row -1 or above is filled, false otherwise
   */
  private isBlockOut(): boolean {
    // Since our matrix has indices 0-39, block-out would mean a piece somehow
    // got placed at a negative row or row >= FIELD_TOTAL_HEIGHT
    // This is prevented by bounds checking in lockPiece, so this is just a safety check

    // In Tetris guideline, this checks if stack height exceeds total playfield height
    // Since we already bounds-check during locking (fieldY >= 0 && fieldY < FIELD_TOTAL_HEIGHT),
    // this condition is technically impossible in our implementation
    // We'll keep this method for completeness but it will always return false
    return false;
  }

  /**
   * Triggers game over state
   * Sets game status, stops gravity, and sets isGameOver flag
   */
  private triggerGameOver(): void {
    this.state.status = GameStatus.GameOver;
    this.state.isGameOver = true;
    this.gravitySystem.stop();
    this.lockDelaySystem.stop();
  }
}
