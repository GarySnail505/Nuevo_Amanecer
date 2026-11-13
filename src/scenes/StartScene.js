import Phaser from 'phaser';
import { loadSave } from '../systems/SaveStore.js';
import { addAudioMenuButton, addMenuButton } from '../ui/MenuButton.js';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    // Obtiene las dimensiones del área del juego configuradas en Phaser
    const { width, height } = this.scale.gameSize;
    // Calcula el centro horizontal de la pantalla para alinear elementos fácilmente
    const centerX = width / 2;

    // Carga el estado guardado del jugador al iniciar el juego
    const save = loadSave();
    // Extrae el último checkpoint alcanzado
    const savedCheckpoint = save.progress?.checkpointId;

    // Aplicamos la preferencia de audio guardada al sistema global de sonido de Phaser
    this.sound.mute = save.audioMuted;

    // Dibuja la imagen de fondo
    this.add.image(centerX, height / 2, 'orphanage-facade');

    // Título principal del juego
    this.add.text(centerX, 49, 'Un nuevo amanecer', {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      color: '#eef0ed',
    }).setOrigin(0.5);

    // Evita que la escena se inicie varias veces si el jugador
    // hace clic repetidamente en "Iniciar" o "Recuerdos" antes de que termine la transición
    let starting = false;
    let openingMemories = false;

    // Función de arranque del juego
    const enterGame = checkpointId => {
      if (starting || openingMemories) return;
      starting = true;

      if (checkpointId) {
        // Si hay un checkpoint guardado (Continuar), se inicia directamente en nivel almacenado
        this.scene.start('MovementScene', { checkpointId });
      } else {
        // Si es una partida nueva (Iniciar), se muestra primero la introducción narrativa
        this.scene.start('IntroScene');
      }
    };

    // Función para abrir la galería de coleccionables
    const openMemories = () => {
      if (starting || openingMemories) return;
      openingMemories = true;
      this.scene.pause(); // Pausamos el menú principal.
      this.scene.launch('MemoriesScene', { returnTo: 'StartScene' });
    };

    // Restablece la bandera cuando el jugador cierra la galería de recuerdos
    const resetMemories = () => { openingMemories = false; };
    this.events.on(Phaser.Scenes.Events.RESUME, resetMemories);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, resetMemories);
    });

    // Subtítulo indicador en la parte inferior de la pantalla
    this.add.text(centerX, height - 17, 'ESCENA DE INICIO · PROTOTIPO', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#bac5cd',
    }).setOrigin(0.5);

    // Configuración del panel lateral derecho (Menú principal)
    const menuX = width - 129;

    const menu = this.add.container(0, 0, [
      this.add.rectangle(menuX, 206, 246, 254, 0x0b111b, 0.88).setStrokeStyle(1, 0x3c515d),
    ]);

    // Oculta los controles y muestra el menú principal
    const showMenu = () => {
      controls.setVisible(false);
      menu.setVisible(true);
    };

    // Creamos el contenedor de controles
    const controls = this.createControls(centerX, showMenu);

    menu.add([
      addMenuButton(this, menuX, 106, 'Iniciar', () => enterGame(), { primary: true }).container,
      addMenuButton(this, menuX, 156, 'Continuar', () => enterGame(savedCheckpoint), { enabled: Boolean(savedCheckpoint) }).container,
      addMenuButton(this, menuX, 206, 'Recuerdos', openMemories).container,
      addAudioMenuButton(this, menuX, 256).container,
      addMenuButton(this, menuX, 306, 'Controles', () => {
        menu.setVisible(false);
        controls.setVisible(true);
      }).container,
    ]);

    // Tecla ENTER para iniciar rápido
    this.input.keyboard.on('keydown-ENTER', event => {
      if (!event.repeat && !controls.visible) {
        enterGame(savedCheckpoint);
      }
    });

    // Tecla ESC para retroceder desde la pantalla de controles al menú principal
    this.input.keyboard.on('keydown-ESC', event => {
      if (!event.repeat && controls.visible) {
        showMenu();
      }
    });
  }

  // Método auxiliar para construir el panel de instrucciones de controles.
  createControls(centerX, onBack) {
    const headingStyle = { fontFamily: 'Georgia, serif', fontSize: '20px', color: '#eef0ed' };
    const bodyStyle = { fontFamily: 'monospace', fontSize: '15px', color: '#c4d1d9', lineSpacing: 8 };

    return this.add.container(0, 0, [
      this.add.rectangle(centerX, 179, 540, 288, 0x0b111b, 0.98).setStrokeStyle(1, 0x47636c),
      this.add.text(centerX, 67, 'Controles', {
        fontFamily: 'Georgia, serif', fontSize: '29px', color: '#eef0ed',
      }).setOrigin(0.5),

      // Columnas de instrucciones para Escritorio y Móvil
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