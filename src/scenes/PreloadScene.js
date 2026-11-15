import Phaser from 'phaser';
import facadeUrl from '../assets/fachada-provisional.svg?no-inline';
import titleLogoUrl from '../assets/TituloInicio.png';
import menuMusicUrl from '../assets/audio/soundtrackInicio.mp3';
import { preloadExplorationAudio } from '../systems/ExplorationAudio.js';
import introVideoUrl from '../assets/video/Intro.mp4';
import { preloadRencorAudio } from '../systems/RencorAudio.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.svg('orphanage-facade', facadeUrl);
    this.load.image('game-title', titleLogoUrl);
    this.load.audio('menu-music', menuMusicUrl);
    this.load.video('intro-video', introVideoUrl, false);

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