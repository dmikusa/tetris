/**
 * Keyboard key codes used for controls
 */
export enum KeyCode {
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowDown = 'ArrowDown',
  ArrowUp = 'ArrowUp',
  KeyZ = 'z',
  KeyX = 'x',
  Control = 'Control',
}

/**
 * Game actions that can be triggered by input
 */
export enum GameAction {
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  SoftDrop = 'SoftDrop',
  HardDrop = 'HardDrop',
  RotateClockwise = 'RotateClockwise',
  RotateCounterclockwise = 'RotateCounterclockwise',
}

/**
 * Configuration for Delayed Auto Shift (DAS)
 */
export const DAS_CONFIG = {
  INITIAL_DELAY: 170, // milliseconds before repeat begins
  REPEAT_RATE: 50, // milliseconds between repeated movements
} as const;

/**
 * State for tracking a single key's DAS
 */
interface DASState {
  /** Whether the key is currently pressed */
  isPressed: boolean;
  /** Timestamp when the key was first pressed */
  pressStartTime: number;
  /** Timestamp of the last repeated action */
  lastRepeatTime: number;
}

/**
 * Callback interface for game actions
 */
export interface InputCallbacks {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDropStart: () => void;
  onSoftDropEnd: () => void;
  onHardDrop: () => void;
  onRotateClockwise: () => void;
  onRotateCounterclockwise: () => void;
}

/**
 * Input controller manages keyboard input for Tetris controls
 * Implements Delayed Auto Shift (DAS) for smooth key repeat
 */
export class InputController {
  private callbacks: InputCallbacks;
  private dasState: Map<KeyCode, DASState>;
  private keydownHandler: (e: KeyboardEvent) => void;
  private keyupHandler: (e: KeyboardEvent) => void;
  private updateInterval: number | null = null;
  private isActive: boolean = false;

  /**
   * Creates a new input controller
   * @param callbacks - Callbacks for game actions
   */
  constructor(callbacks: InputCallbacks) {
    this.callbacks = callbacks;
    this.dasState = new Map();

    // Initialize DAS state for each control key (only keys that support DAS)
    this.initializeDASState(KeyCode.ArrowLeft);
    this.initializeDASState(KeyCode.ArrowRight);
    this.initializeDASState(KeyCode.ArrowDown);

    // Bind event handlers
    this.keydownHandler = this.onKeyDown.bind(this);
    this.keyupHandler = this.onKeyUp.bind(this);
  }

  /**
   * Initializes DAS state for a key
   */
  private initializeDASState(key: KeyCode): void {
    this.dasState.set(key, {
      isPressed: false,
      pressStartTime: 0,
      lastRepeatTime: 0,
    });
  }

  /**
   * Starts listening for keyboard input
   */
  start(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);

    // Start update loop for DAS
    this.updateInterval = window.setInterval(() => this.update(), 16); // ~60fps
  }

  /**
   * Stops listening for keyboard input
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);

    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Reset all DAS states
    this.dasState.forEach((state) => {
      state.isPressed = false;
      state.pressStartTime = 0;
      state.lastRepeatTime = 0;
    });
  }

  /**
   * Handles keydown events
   */
  private onKeyDown(event: KeyboardEvent): void {
    const key = event.key as KeyCode;

    // Check if this is a key we care about
    if (
      key !== KeyCode.ArrowLeft &&
      key !== KeyCode.ArrowRight &&
      key !== KeyCode.ArrowDown &&
      key !== KeyCode.ArrowUp &&
      key !== KeyCode.KeyZ &&
      key !== KeyCode.KeyX &&
      key !== KeyCode.Control
    ) {
      return;
    }

    // Prevent default browser behavior
    event.preventDefault();

    // Handle instant actions (no DAS)
    if (key === KeyCode.ArrowUp || key === KeyCode.KeyZ || key === KeyCode.KeyX || key === KeyCode.Control) {
      // Prevent browser key repeat for instant actions
      if (event.repeat) {
        return;
      }
      this.executeAction(key);
      return;
    }

    const state = this.dasState.get(key);
    if (!state) {
      return;
    }

    // If key is already pressed, ignore (browser key repeat)
    if (state.isPressed) {
      return;
    }

    // Mark key as pressed
    state.isPressed = true;
    state.pressStartTime = Date.now();
    state.lastRepeatTime = Date.now();

    // Execute immediate action on first press
    this.executeAction(key);
  }

  /**
   * Handles keyup events
   */
  private onKeyUp(event: KeyboardEvent): void {
    const key = event.key as KeyCode;

    // Check if this is a key we care about
    if (
      key !== KeyCode.ArrowLeft &&
      key !== KeyCode.ArrowRight &&
      key !== KeyCode.ArrowDown &&
      key !== KeyCode.ArrowUp &&
      key !== KeyCode.KeyZ &&
      key !== KeyCode.KeyX &&
      key !== KeyCode.Control
    ) {
      return;
    }

    event.preventDefault();

    // Instant actions don't have DAS state
    if (key === KeyCode.ArrowUp || key === KeyCode.KeyZ || key === KeyCode.KeyX || key === KeyCode.Control) {
      return;
    }

    const state = this.dasState.get(key);
    if (!state) {
      return;
    }

    // Mark key as released
    state.isPressed = false;

    // Handle soft drop end
    if (key === KeyCode.ArrowDown) {
      this.callbacks.onSoftDropEnd();
    }
  }

  /**
   * Update loop for DAS (Delayed Auto Shift)
   * Called every frame to handle key repeat
   */
  private update(): void {
    const now = Date.now();

    this.dasState.forEach((state, key) => {
      if (!state.isPressed) {
        return;
      }

      // Skip hard drop (no repeat)
      if (key === KeyCode.ArrowUp) {
        return;
      }

      const timeSincePress = now - state.pressStartTime;
      const timeSinceLastRepeat = now - state.lastRepeatTime;

      // Check if we're past the initial delay
      if (timeSincePress >= DAS_CONFIG.INITIAL_DELAY) {
        // Check if it's time for another repeat
        if (timeSinceLastRepeat >= DAS_CONFIG.REPEAT_RATE) {
          this.executeAction(key);
          state.lastRepeatTime = now;
        }
      }
    });
  }

  /**
   * Executes the appropriate action for a key press
   */
  private executeAction(key: KeyCode): void {
    switch (key) {
      case KeyCode.ArrowLeft:
        this.callbacks.onMoveLeft();
        break;
      case KeyCode.ArrowRight:
        this.callbacks.onMoveRight();
        break;
      case KeyCode.ArrowDown:
        this.callbacks.onSoftDropStart();
        break;
      case KeyCode.ArrowUp:
        this.callbacks.onHardDrop();
        break;
      case KeyCode.KeyZ:
        this.callbacks.onRotateCounterclockwise();
        break;
      case KeyCode.KeyX:
      case KeyCode.Control:
        this.callbacks.onRotateClockwise();
        break;
    }
  }

  /**
   * Checks if a specific key is currently pressed
   * @param key - The key to check
   * @returns true if the key is pressed, false otherwise
   */
  isKeyPressed(key: KeyCode): boolean {
    const state = this.dasState.get(key);
    return state ? state.isPressed : false;
  }

  /**
   * Cleans up resources
   */
  destroy(): void {
    this.stop();
  }
}
