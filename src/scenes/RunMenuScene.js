import Phaser from 'phaser';
import { DEFAULT_CHECKPOINT } from '../systems/SaveStore.js';
import { addAudioMenuButton, addMenuButton } from '../ui/MenuButton.js';

const BUTTON_OPTIONS = { width: 340 };

export class RunMenuScene extends Phaser.Scene {
  constructor() {
    super('RunMenuScene');
  }

  create({ mode = 'pause', checkpointId = DEFAULT_CHECKPOINT } = {}) {
    const { width, height } = this.scale.gameSize;
    const centerX = width / 2;
    const paused = mode === 'pause';

    this.add.rectangle(centerX, height / 2, width, height, 0x080e17, 0.72);
    this.add.rectangle(centerX, height / 2, 382, 300, 0x0e1721, 0.96).setStrokeStyle(1, 0x47636c);
    this.add.text(centerX, paused ? 62 : 103, paused ? 'Pausa' : 'Harry se quedó sin salud', {
      fontFamily: 'Georgia, serif',
      fontSize: '29px',
      color: '#eef0ed',
    }).setOrigin(0.5);

    let transitioning = false;
    const transition = action => {
      if (transitioning) return;
      transitioning = true;
      action();
    };
    const resume = () => transition(() => {
      this.scene.resume('MovementScene');
      this.scene.stop();
    });
    const retry = () => transition(() => {
      this.scene.stop('MovementScene');
      this.scene.start('MovementScene', { checkpointId });
    });
    const goToMainMenu = () => transition(() => {
      this.scene.stop('MovementScene');
      this.scene.start('StartScene');
    });

    if (paused) {
      addMenuButton(this, centerX, 117, 'Continuar', resume, { ...BUTTON_OPTIONS, primary: true });
      addMenuButton(this, centerX, 171, 'Reiniciar desde punto de control', retry, BUTTON_OPTIONS);
      addAudioMenuButton(this, centerX, 225, BUTTON_OPTIONS);
      addMenuButton(this, centerX, 279, 'Menú principal', goToMainMenu, BUTTON_OPTIONS);
      this.input.keyboard.on('keydown-ESC', event => {
        if (!event.repeat) resume();
      });
      return;
    }

    addMenuButton(this, centerX, 164, 'Reintentar desde punto de control', retry, { ...BUTTON_OPTIONS, primary: true });
    addMenuButton(this, centerX, 218, 'Menú principal', goToMainMenu, BUTTON_OPTIONS);
    this.add.text(centerX, 272, 'Pulsa R para volver a intentarlo', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#bac5cd',
    }).setOrigin(0.5);
    this.input.keyboard.on('keydown-R', event => {
      if (!event.repeat) retry();
    });
  }
}
