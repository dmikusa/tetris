import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
  background: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    this.background = this.add.image(512, 384, 'menu-background');
    this.background.setDisplaySize(1024, 768);

    this.title = this.add
      .text(512, 240, 'Main Menu', {
        fontFamily: '"Press Start 2P"',
        fontSize: 38,
        color: '#1FA4E8',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Add button to launch Tetris game
    const playButton = this.add
      .text(512, 300, 'Play Tetris', {
        fontFamily: '"Press Start 2P"',
        fontSize: 18,
        color: '#F28C28',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    playButton.on('pointerover', () => {
      playButton.setColor('#B85412');
    });

    playButton.on('pointerout', () => {
      playButton.setColor('#F28C28');
    });

    EventBus.emit('current-scene-ready', this);
  }
}
