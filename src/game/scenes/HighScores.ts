import { GameObjects, Scene } from 'phaser';
import { HighScoreManager } from '../../controller/HighScoreManager';

/**
 * HighScores scene displays the top scores
 */
export class HighScores extends Scene {
  background!: GameObjects.Image;
  title!: GameObjects.Text;
  backButton!: GameObjects.Text;
  private keydownHandler!: (event: KeyboardEvent) => void;

  constructor() {
    super('HighScores');
  }

  create(): void {
    // Add background image (same as main menu)
    this.background = this.add.image(512, 384, 'menu-background');
    this.background.setDisplaySize(1024, 768);

    // Title text - positioned at same height as main menu
    this.title = this.add
      .text(512, 240, 'High Scores', {
        fontFamily: '"Press Start 2P"',
        fontSize: '35px',
        color: '#1FA4E8',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Get high scores
    const highScores = HighScoreManager.getHighScores();

    // Display high scores - start below the title
    const startY = 310;
    const lineHeight = 45;

    if (highScores.length === 0) {
      // No high scores yet
      this.add
        .text(512, startY + 80, 'No scores yet!', {
          fontFamily: '"Press Start 2P"',
          fontSize: '20px',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5);
    } else {
      // Display each high score
      highScores.forEach((entry, index) => {
        const rank = index + 1;
        const y = startY + index * lineHeight;

        // Format: "#. XXX....SCORE"
        const rankText = `${rank}.`;
        const initials = entry.initials || 'AAA';
        const scoreText = `${entry.score}`;

        // Calculate dots needed based on initials length and score digits
        // Base dots (for 3-char initials and 1-digit score) = 17
        const initialsLength = initials.length;
        const scoreDigits = scoreText.length;
        const dotCount = 21 - initialsLength - scoreDigits;
        const initialsWithDots = `${initials} ${'\u00b7'.repeat(Math.max(0, dotCount))}`;

        // Rank in blue
        this.add
          .text(325, y, rankText, {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#1FA4E8',
          })
          .setOrigin(0, 0.5);

        // Initials and dots in white
        this.add
          .text(365, y, initialsWithDots, {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#ffffff',
          })
          .setOrigin(0, 0.5);

        // Score in white, right-aligned
        this.add
          .text(700, y, scoreText, {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#ffffff',
          })
          .setOrigin(1, 0.5);
      });
    }

    // Back button
    this.backButton = this.add
      .text(512, 650, 'Back to Menu', {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        color: '#F28C28',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    this.backButton.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    this.backButton.on('pointerover', () => {
      this.backButton.setColor('#B85412');
    });

    this.backButton.on('pointerout', () => {
      this.backButton.setColor('#F28C28');
    });

    // Setup native keyboard listener for clearing high scores (C key)
    this.keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        HighScoreManager.clearHighScores();
        // Restart scene to refresh display
        this.scene.restart();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }

  shutdown(): void {
    // Clean up keyboard listener
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
  }
}
