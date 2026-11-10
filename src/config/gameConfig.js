import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { StartScene } from '../scenes/StartScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1018',
  scale: {
    width: 640,
    height: 360,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, StartScene],
};
