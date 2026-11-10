import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    const { width, height } = this.scale.gameSize;
    const centerX = width / 2;

    this.add.image(centerX, height / 2, 'orphanage-facade');

    this.add.text(centerX, 64, 'Un nuevo amanecer', {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      color: '#eef0ed',
    }).setOrigin(0.5);

    this.add.text(centerX, height - 24, 'ESCENA DE INICIO · PROTOTIPO', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#bac5cd',
    }).setOrigin(0.5);
  }
}
