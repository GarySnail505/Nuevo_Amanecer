import Phaser from 'phaser';
import { DEFAULT_CHECKPOINT, loadSave } from '../systems/SaveStore.js';
import { addAudioMenuButton, addMenuButton } from '../ui/MenuButton.js';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    // Obtiene las dimensiones del área del juego
    const { width, height } = this.scale.gameSize;
    // Calcula el centro horizontal de la pantalla
    const centerX = width / 2;
    const save = loadSave();
    const savedCheckpoint = save.progress?.checkpointId;
    this.sound.mute = save.audioMuted;

    this.add.image(centerX, height / 2, 'orphanage-facade');

    this.add.text(centerX, 64, 'Un nuevo amanecer', {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      color: '#eef0ed',
    }).setOrigin(0.5);

    // Evita que la escena se inicie varias veces
    let starting = false;
    const startMovement = checkpointId => {
      if (starting) return;
      starting = true;
      this.scene.start('MovementScene', { checkpointId });
    };

    this.add.text(centerX, height - 24, 'ESCENA DE INICIO · PROTOTIPO', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#bac5cd',
    }).setOrigin(0.5);

    const menuX = width - 129;
    const menu = this.add.container(0, 0, [
      this.add.rectangle(menuX, 200, 246, 226, 0x0b111b, 0.88).setStrokeStyle(1, 0x3c515d),
    ]);
    const showMenu = () => {
      controls.setVisible(false);
      menu.setVisible(true);
    };
    const controls = this.createControls(centerX, showMenu);
    menu.add([
      addMenuButton(this, menuX, 119, 'Iniciar', () => startMovement(DEFAULT_CHECKPOINT), { primary: true }).container,
      addMenuButton(this, menuX, 173, 'Continuar', () => startMovement(savedCheckpoint), { enabled: Boolean(savedCheckpoint) }).container,
      addAudioMenuButton(this, menuX, 227).container,
      addMenuButton(this, menuX, 281, 'Controles', () => {
        menu.setVisible(false);
        controls.setVisible(true);
      }).container,
    ]);

    this.input.keyboard.on('keydown-ENTER', event => {
      if (!event.repeat && !controls.visible) {
        startMovement(savedCheckpoint ?? DEFAULT_CHECKPOINT);
      }
    });
    this.input.keyboard.on('keydown-ESC', event => {
      if (!event.repeat && controls.visible) {
        showMenu();
      }
    });
  }

  createControls(centerX, onBack) {
    const headingStyle = { fontFamily: 'Georgia, serif', fontSize: '20px', color: '#eef0ed' };
    const bodyStyle = { fontFamily: 'monospace', fontSize: '15px', color: '#c4d1d9', lineSpacing: 8 };
    return this.add.container(0, 0, [
      this.add.rectangle(centerX, 179, 540, 288, 0x0b111b, 0.98).setStrokeStyle(1, 0x47636c),
      this.add.text(centerX, 67, 'Controles', {
        fontFamily: 'Georgia, serif', fontSize: '29px', color: '#eef0ed',
      }).setOrigin(0.5),
      this.add.text(82, 101, 'Teclado y ratón', headingStyle),
      this.add.text(342, 101, 'Pantalla táctil', headingStyle),
      this.add.text(82, 135, [
        'A / D o ← / → · Moverse',
        'Espacio · Saltar',
        'J o clic izquierdo · Luz',
        'Esc · Pausa',
      ], bodyStyle),
      this.add.text(342, 135, [
        'Flechas · Moverse',
        'Salto · Saltar',
        'Luz · Linterna',
        'Pausa · Menú de pausa',
      ], bodyStyle),
      addMenuButton(this, centerX, 282, 'Volver', onBack, { width: 200 }).container,
    ]).setVisible(false);
  }
}
