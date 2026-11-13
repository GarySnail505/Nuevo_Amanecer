import Phaser from 'phaser';
import { DEFAULT_CHECKPOINT } from '../systems/SaveStore.js';
import { addMenuButton } from '../ui/MenuButton.js';

// Arreglo que contiene la secuencia narrativa de la introducción
const CALL = [
    { speaker: 'Enfermera', line: 'Harry, tienes una llamada.' },
    { speaker: 'Michael', line: '«Ayúdame, Harry... él... volvió...»' },
    { speaker: 'La llamada se corta', line: 'Harry vuelve al orfanato para buscar a Michael.' },
];

export class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    create() {
        // Llama al método auxiliar que dibuja la habitación del hospital
        this.drawHospital();

        const { width, height } = this.scale.gameSize;

        // Instancia la imagen de la fachada del orfanato
        const exterior = this.add.image(width / 2, height / 2, 'orphanage-facade').setVisible(false);

        // Etiqueta de ubicación cinematográfica en la esquina superior izquierda
        const location = this.add.text(30, 24, 'Hospital · Noche', {
            fontFamily: 'Georgia, serif', fontSize: '24px', color: '#dce9e8',
        });

        // Caja de texto para mostrar los diálogos
        this.add.rectangle(320, 281, 600, 134, 0x0b121c, 0.96).setStrokeStyle(1, 0x526c78);

        const speaker = this.add.text(40, 226, CALL[0].speaker, {
            fontFamily: 'Georgia, serif', fontSize: '20px', color: '#a8c9c8',
        });
        const line = this.add.text(40, 253, CALL[0].line, {
            fontFamily: 'monospace', fontSize: '17px', color: '#eef0ed',
        });

        let beat = 0;
        let leaving = false;

        // Función de transición hacia el juego principal
        const enterOrphanage = () => {
            if (leaving) return;
            leaving = true;
            // Inicia MovementScene, pasándole el punto de control base ('entrada') como punto de spawn
            this.scene.start('MovementScene', { checkpointId: DEFAULT_CHECKPOINT });
        };

        // Función que avanza el diálogo o cambia la escena según el índice
        const nextBeat = () => {
            if (leaving) return;

            if (beat === CALL.length - 1) {
                enterOrphanage();
                return;
            }

            // Avanza al siguiente diálogo y actualiza los textos en pantalla
            beat += 1;
            speaker.setText(CALL[beat].speaker);
            line.setText(CALL[beat].line);

            if (beat === CALL.length - 1) {
                // Muestra la imagen de la niebla y el orfanato, que tapa el dibujo del hospital
                exterior.setVisible(true);
                location.setText('Orfanato · Noche');
                next.label.setText('Ir al orfanato');
            }
        };

        // Creación de botones
        const next = addMenuButton(this, 511, 315, 'Continuar', nextBeat, { width: 176, primary: true });
        addMenuButton(this, 349, 315, 'Omitir', enterOrphanage, { width: 122 });

        // Tecla ENTER permite avanzar los diálogos rápidamente sin usar el ratón
        this.input.keyboard.on('keydown-ENTER', event => {
            if (!event.repeat) nextBeat();
        });
    }

    // Método auxiliar que dibuja la escena del hospital
    drawHospital() {
        const { width, height } = this.scale.gameSize;
        const art = this.add.graphics();

        art.fillStyle(0x182630).fillRect(0, 0, width, height);
        art.fillStyle(0x111c26).fillRect(0, 214, width, height - 214);
        art.fillStyle(0x3a4c58).fillRect(0, 209, width, 5);

        art.fillStyle(0x4b626f).fillRect(375, 37, 185, 116);
        art.fillStyle(0x142534).fillRect(382, 44, 171, 102);

        art.fillStyle(0x8eaeb4).fillRect(510, 58, 20, 14).fillRect(514, 54, 12, 22);

        art.fillStyle(0x334d5b).fillRect(382, 122, 47, 24).fillRect(429, 110, 40, 36).fillRect(493, 119, 60, 27);

        art.fillStyle(0x4b626f).fillRect(466, 44, 4, 102).fillRect(382, 92, 171, 4);

        // Mobiliario de la habitación del hospital de Harry.

        art.fillStyle(0x4b626f).fillRect(85, 124, 8, 87).fillRect(88, 184, 255, 12).fillRect(335, 164, 8, 47);
        art.fillStyle(0x66818a).fillRect(93, 166, 242, 18);
        art.fillStyle(0xb3c4c7).fillRect(103, 151, 62, 15);
        art.fillStyle(0x53767c).fillRect(169, 158, 158, 22).fillRect(310, 174, 17, 24);

        art.fillStyle(0x6e8a92).fillRect(307, 66, 3, 90).fillRect(297, 66, 23, 3);
        art.fillStyle(0x97b5b8).fillRect(313, 73, 10, 21);

        art.fillStyle(0x566873).fillRect(459, 188, 84, 8).fillRect(463, 196, 5, 21).fillRect(534, 196, 5, 21);
        art.fillStyle(0x253643).fillRect(473, 173, 46, 15).fillRect(469, 165, 53, 8);
        art.fillStyle(0xb2c0ab).fillRect(495, 176, 7, 4);
    }
}