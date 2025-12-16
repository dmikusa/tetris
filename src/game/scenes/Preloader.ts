import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, 'background');

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game
    this.load.setPath('assets');

    this.load.image('menu-background', '7signal_blocks_start_1024x768.jpg');
    this.load.image('game-background', 'arcade_bg_1024x768.png');
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Load the custom font and wait for it to be ready
    document.fonts
      .load('12px "Press Start 2P"')
      .then(() => {
        this.scene.start('MainMenu');
      })
      .catch(() => {
        // Fallback: start anyway if font fails to load
        this.scene.start('MainMenu');
      });
  }
}
