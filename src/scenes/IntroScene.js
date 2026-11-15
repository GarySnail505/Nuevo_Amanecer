import Phaser from 'phaser';
import { DEFAULT_CHECKPOINT, startNewRun } from '../systems/SaveStore.js';
import { addMenuButton } from '../ui/MenuButton.js';

export class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    create() {
        const { width, height } = this.scale.gameSize;
        let leaving = false;

        // Fondo negro por si el video tarda un instante en arrancar
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

        const enterOrphanage = () => {
            if (leaving) return;
            leaving = true;
            if (video) {
                video.stop();
                video.destroy();
                video = null;
            }
            startNewRun();
            this.scene.start('MovementScene', { checkpointId: DEFAULT_CHECKPOINT });
        };

        let video = null;
        if (this.cache.video.exists('intro-video')) {
            video = this.add.video(width / 2, height / 2, 'intro-video');

            // Función que fuerza el ajuste al lienzo cuando el <video> carga sus metadatos
            const fitToScreen = () => {
                if (!video) return;
                video.setDisplaySize(width, height);
                video.setPosition(width / 2, height / 2);
            };

            video.on('created', fitToScreen);
            video.on('play', fitToScreen);
            video.once('complete', enterOrphanage);

            // Iniciar reproducción y forzar estado de audio
            video.play(false);
            video.setMute(this.sound.mute);
            video.setVolume(1);
            fitToScreen();
        } else {
            enterOrphanage();
            return;
        }

        // Botón discreto para omitir la cinemática
        addMenuButton(this, width - 82, height - 30, 'Omitir', enterOrphanage, { width: 124 }).container.setDepth(10);

        // Tecla ESC o ENTER para omitir rápidamente
        this.input.keyboard.on('keydown-ESC', event => {
            if (!event.repeat) enterOrphanage();
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (video) {
                video.stop();
                video.destroy();
            }
        });
    }
}