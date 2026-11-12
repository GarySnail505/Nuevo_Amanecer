import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    // Obtiene las dimensiones del área del juego
    const { width, height } = this.scale.gameSize;
    // Calcula el centro horizontal de la pantalla
    const centerX = width / 2;

    this.add.image(centerX, height / 2, 'orphanage-facade');

    this.add.text(centerX, 64, 'Un nuevo amanecer', {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      color: '#eef0ed',
    }).setOrigin(0.5);

    // Crea el botón que permite probar el movimiento del personaje
    const button = this.add.text(centerX, 112, 'Probar movimiento', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#eef0ed',
      backgroundColor: '#324454',
      padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Evita que la escena se inicie varias veces
    let starting = false;
    const startMovement = () => {
      if (starting) return;
      starting = true;
      this.scene.start('MovementScene');
    };

    button.on('pointerover', () => button.setBackgroundColor('#405769'));
    button.on('pointerout', () => button.setBackgroundColor('#324454'));
    // Inicia el movimiento al hacer clic en el botón
    button.on('pointerup', startMovement);
    // También permite iniciar el movimiento presionando ENTER
    this.input.keyboard.once('keydown-ENTER', startMovement);

    this.add.text(centerX, height - 24, 'ESCENA DE INICIO · PROTOTIPO', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#bac5cd',
    }).setOrigin(0.5);
  }
}
