import { GameObjects, Scene } from 'phaser';

/**
 * InitialsEntry scene allows players to enter their initials for a high score
 */
export class InitialsEntry extends Scene {
  private initials: string[] = ['A', 'A', 'A'];
  private currentIndex: number = 0;
  private initialsTexts: GameObjects.Text[] = [];
  private score: number = 0;
  private onComplete?: (initials: string) => void;

  constructor() {
    super('InitialsEntry');
  }

  /**
   * Initialize the scene with score and callback
   */
  init(data: { score: number; onComplete: (initials: string) => void }): void {
    this.score = data.score;
    this.onComplete = data.onComplete;
    this.initials = ['A', 'A', 'A'];
    this.currentIndex = 0;
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Semi-transparent dark background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Congratulations text
    this.add
      .text(centerX, centerY - 150, 'HIGH SCORE!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#1FA4E8',
      })
      .setOrigin(0.5);

    // Score display
    this.add
      .text(centerX, centerY - 90, `Score: ${this.score}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Instructions
    this.add
      .text(centerX, centerY - 40, 'Enter your initials:', {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Create initials input display
    const spacing = 60;
    const startX = centerX - spacing;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * spacing;
      const y = centerY + 20;

      // Character display
      const text = this.add
        .text(x, y, this.initials[i], {
          fontFamily: '"Press Start 2P"',
          fontSize: '48px',
          color: i === this.currentIndex ? '#F28C28' : '#ffffff',
        })
        .setOrigin(0.5);

      this.initialsTexts.push(text);

      // Underline
      const graphics = this.add.graphics();
      graphics.lineStyle(3, i === this.currentIndex ? 0xf28c28 : 0xffffff);
      graphics.lineBetween(x - 20, y + 35, x + 20, y + 35);
    }

    // Controls instructions
    this.add
      .text(centerX, centerY + 100, 'UP/DOWN: Change letter', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 130, 'LEFT/RIGHT: Move cursor', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 160, 'ENTER: Confirm', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Setup keyboard input
    this.setupKeyboard();
  }

  private setupKeyboard(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.changeCharacter(1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.changeCharacter(-1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.moveCursor(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.moveCursor(1);
          break;
        case 'Enter':
          event.preventDefault();
          this.confirm();
          break;
        default:
          // Allow direct character input (A-Z, 0-9)
          if (/^[A-Z0-9]$/i.test(event.key)) {
            this.setCharacter(event.key.toUpperCase());
            this.moveCursor(1);
          }
          break;
      }
    });
  }

  private changeCharacter(direction: number): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const currentChar = this.initials[this.currentIndex];
    let index = chars.indexOf(currentChar);

    index = (index + direction + chars.length) % chars.length;
    this.initials[this.currentIndex] = chars[index];
    this.updateDisplay();
  }

  private setCharacter(char: string): void {
    this.initials[this.currentIndex] = char;
    this.updateDisplay();
  }

  private moveCursor(direction: number): void {
    this.currentIndex = (this.currentIndex + direction + 3) % 3;
    this.updateDisplay();
  }

  private updateDisplay(): void {
    this.initialsTexts.forEach((text, i) => {
      text.setText(this.initials[i]);
      text.setColor(i === this.currentIndex ? '#F28C28' : '#ffffff');
    });
  }

  private confirm(): void {
    const initialsString = this.initials.join('');
    if (this.onComplete) {
      this.onComplete(initialsString);
    }
    this.scene.stop();
  }

  shutdown(): void {
    this.input.keyboard?.removeAllListeners('keydown');
  }
}
