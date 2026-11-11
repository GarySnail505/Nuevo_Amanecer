import Phaser from 'phaser';
import { MovementScene } from '../scenes/MovementScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { StartScene } from '../scenes/StartScene.js';
//Configuración principal del juego
export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1018',
//Configuración de dimensiones y escalado
  scale: {
    width: 640,
    height: 360,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
//Configuración del motor de físicas
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 } },
  },
  //orden de ejecución
  scene: [PreloadScene, StartScene, MovementScene],
};
