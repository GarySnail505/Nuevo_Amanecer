import Phaser from 'phaser';
import { getLevel } from '../data/levels.js';
import { DEFAULT_CHECKPOINT } from '../systems/SaveStore.js';
import { addAudioMenuButton, addMenuButton } from '../ui/MenuButton.js';

const BUTTON_OPTIONS = { width: 340 };

export class RunMenuScene extends Phaser.Scene {
  constructor() {
    // Identificador único de la escena de menú superpuesto.
    super('RunMenuScene');
  }

  // El método create recibe datos inyectados por la escena que la llamó (MovementScene).
  // mode indica pausa, derrota o el paso al siguiente nivel.
  create({ mode = 'pause', levelId, nextLevelId, checkpointId = DEFAULT_CHECKPOINT } = {}) {
    const { width, height } = this.scale.gameSize;
    const centerX = width / 2;

    if (mode === 'passage') {
      this.createPassageMenu(centerX, height, levelId, nextLevelId);
      return;
    }

    const paused = mode === 'pause';

    // Fondo semitransparente para oscurecer el juego de fondo sin ocultarlo por completo
    this.add.rectangle(centerX, height / 2, width, height, 0x080e17, 0.72);

    // Caja principal del menú
    this.add.rectangle(centerX, height / 2, 382, paused ? 330 : 300, 0x0e1721, 0.96).setStrokeStyle(1, 0x47636c);

    // Título del menú
    this.add.text(centerX, paused ? 47 : 103, paused ? 'Pausa' : 'Harry se quedó sin salud', {
      fontFamily: 'Georgia, serif',
      fontSize: '29px',
      color: '#eef0ed',
    }).setOrigin(0.5); // Centra el texto en sus coordenadas X e Y.

    // Banderas de estado para evitar que el jugador "haga spam" de clics
    // y active múltiples transiciones de escena al mismo tiempo
    let transitioning = false;
    let openingMemories = false;

    // Función contenedora que bloquea la ejecución de múltiples acciones simultáneas
    const transition = action => {
      if (transitioning || openingMemories) return;
      transitioning = true;
      action();
    };

    // Funciones de acción para los botones:

    // Reanudar: Despierta a MovementScene (que estaba pausada) y destruye este menú
    const resume = () => transition(() => {
      this.scene.resume('MovementScene');
      this.scene.stop();
    });

    // Reintentar: Detiene por completo MovementScene y la vuelve a arrancar limpia,
    // pasándole el último punto de control guardado
    const retry = () => transition(() => {
      this.scene.stop('MovementScene');
      this.scene.start('MovementScene', { levelId, checkpointId });
    });

    // Menú principal: Detiene el nivel actual y vuelve a la escena de inicio del juego
    const goToMainMenu = () => transition(() => {
      this.scene.stop('MovementScene');
      this.scene.start('StartScene');
    });

    // MENÚ DE PAUSA
    if (paused) {
      // Abre la galería de coleccionables por encima del menú de pausa
      const openMemories = () => {
        if (transitioning || openingMemories) return;
        openingMemories = true;
        this.scene.pause();
        this.scene.launch('MemoriesScene', { returnTo: 'RunMenuScene' });
      };

      const resetMemories = () => { openingMemories = false; };

      // Escuchadores de eventos para coordinar el retorno desde MemoriesScene
      this.events.on(Phaser.Scenes.Events.RESUME, resetMemories);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.events.off(Phaser.Scenes.Events.RESUME, resetMemories);
      });

      // Construcción de botones usando las funciones auxiliares de MenuButton.js
      addMenuButton(this, centerX, 104, 'Continuar', resume, { ...BUTTON_OPTIONS, primary: true });
      addMenuButton(this, centerX, 156, 'Reiniciar desde punto de control', retry, BUTTON_OPTIONS);
      addMenuButton(this, centerX, 208, 'Recuerdos', openMemories, BUTTON_OPTIONS);
      addAudioMenuButton(this, centerX, 260, BUTTON_OPTIONS);
      addMenuButton(this, centerX, 312, 'Menú principal', goToMainMenu, BUTTON_OPTIONS);

      // Tecla 'ESC' para quitar la pausa rápidamente.
      this.input.keyboard.on('keydown-ESC', event => {
        if (!event.repeat) resume();
      });
      return;
    }

    // PANTALLA DE GAME OVER
    // Si la ejecución llega aquí, es porque mode es distinto de 'pause'.

    addMenuButton(this, centerX, 164, 'Reintentar desde punto de control', retry, { ...BUTTON_OPTIONS, primary: true });
    addMenuButton(this, centerX, 218, 'Menú principal', goToMainMenu, BUTTON_OPTIONS);

    // Instrucción visual para el jugador.
    this.add.text(centerX, 272, 'Pulsa R para volver a intentarlo', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#bac5cd',
    }).setOrigin(0.5);

    // Tecla 'R' para revivir
    this.input.keyboard.on('keydown-R', event => {
      if (!event.repeat) retry();
    });
  }

  createPassageMenu(centerX, height, levelId, nextLevelId) {
    const level = getLevel(levelId);
    const next = nextLevelId && getLevel(nextLevelId);
    this.add.rectangle(centerX, height / 2, centerX * 2, height, 0x080e17, 0.82);
    this.add.rectangle(centerX, height / 2, 520, 230, 0x0e1721).setStrokeStyle(1, 0x47636c);
    this.add.text(centerX, 113, next ? next.title : 'El umbral de Rencor', {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#eef0ed',
    }).setOrigin(0.5);
    this.add.text(centerX, 167, level.exitText, {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#bac5cd', align: 'center',
      wordWrap: { width: 440 },
    }).setOrigin(0.5);

    let leaving = false;
    const leave = () => {
      if (leaving) return;
      leaving = true;
      this.scene.stop('MovementScene');
      if (next) {
        this.scene.start('MovementScene', { levelId: next.id });
      } else {
        this.scene.start('StartScene');
      }
    };
    addMenuButton(this, centerX, 236, next ? 'Entrar' : 'Volver al menú', leave, { primary: true });
    this.input.keyboard.on('keydown-ENTER', event => {
      if (!event.repeat) leave();
    });
  }
}
