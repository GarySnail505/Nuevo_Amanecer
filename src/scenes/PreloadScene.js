import Phaser from 'phaser';
import facadeUrl from '../assets/fachada-provisional.svg?no-inline';
import titleLogoUrl from '../assets/TituloInicio.png';
import menuMusicUrl from '../assets/audio/soundtrackInicio.mp3';
import rencorSpriteUrl from '../assets/sprites/spritesRencor.png';
import { preloadRencorSprite, registerRencorAnimations } from '../entities/RencorSprite.js';
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

    preloadRencorSprite(this, rencorSpriteUrl);
    preloadExplorationAudio(this);
    preloadRencorAudio(this);
  }

  create() {
    const hasFacade = this.textures.exists('orphanage-facade');
    if (hasFacade && registerRencorAnimations(this)) {
      this.scene.start('StartScene');
      return;
    }

    const message = hasFacade ? 'No se pudo cargar el sprite de Rencor.' : 'No se pudo cargar el escenario.';
    this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#e5e8eb',
    }).setOrigin(0.5);
  }
}
