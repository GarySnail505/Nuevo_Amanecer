import Phaser from 'phaser';
import facadeUrl from '../assets/fachada-provisional.svg?no-inline';
import { preloadExplorationAudio } from '../systems/ExplorationAudio.js';
import { preloadRencorAudio } from '../systems/RencorAudio.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.svg('orphanage-facade', facadeUrl);
    preloadExplorationAudio(this);
    preloadRencorAudio(this);
  }

  create() {
    if (this.textures.exists('orphanage-facade')) {
      this.scene.start('StartScene');
      return;
    }

    this.add.text(this.scale.width / 2, this.scale.height / 2, 'No se pudo cargar el escenario.', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#e5e8eb',
    }).setOrigin(0.5);
  }
}
