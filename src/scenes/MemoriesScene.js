import Phaser from 'phaser';
import { PAINTINGS } from '../data/paintings.js';
import { loadSave } from '../systems/SaveStore.js';
import { addMenuButton } from '../ui/MenuButton.js';
import { drawPainting } from '../ui/PaintingArt.js';

const HEADING_STYLE = { fontFamily: 'Georgia, serif', fontSize: '28px', color: '#eef0ed' };
const TITLE_STYLE = { fontFamily: 'Georgia, serif', fontSize: '19px', color: '#eef0ed' };
const HINT_STYLE = { fontFamily: 'monospace', fontSize: '14px', color: '#aebdc7' };
const PAINTINGS_PER_PAGE = 2;
const PAGE_COUNT = Math.max(1, Math.ceil(PAINTINGS.length / PAINTINGS_PER_PAGE));

export class MemoriesScene extends Phaser.Scene {
    constructor() {
        super('MemoriesScene');
    }

    // El método create recibe un objeto de configuración inyectado por la escena que lo llamó
    create({ returnTo = 'StartScene', paintingId } = {}) {
        this.returnTo = returnTo;

        // Cargamos los IDs de las pinturas descubiertas
        this.discovered = new Set(loadSave().paintings);

        this.closing = false;
        this.panel = null;
        this.galleryPage = 0;

        // Busca si se solicitó abrir una pintura específica y se valida que realmente esté descubierta
        const painting = PAINTINGS.find(entry => entry.id === paintingId && this.discovered.has(entry.id));

        if (painting) {
            // Si hay una pintura solicitada, instanciamos el "Modo Lectura" de ese recuerdo
            this.showReader(painting, 'Continuar', () => this.close());
        } else {
            // Si no, mostramos la primera página de la galería.
            this.showGallery();
        }

        this.input.keyboard.on('keydown-ESC', event => {
            if (!event.repeat) this.goBack();
        });
        this.input.keyboard.on('keydown-LEFT', event => {
            if (!event.repeat) this.changePage(-1);
        });
        this.input.keyboard.on('keydown-RIGHT', event => {
            if (!event.repeat) this.changePage(1);
        });
    }

    // Construye la página actual de la galería con los cuadros descubiertos y ocultos.
    showGallery() {
        const centerX = this.scale.gameSize.width / 2;
        const panel = this.replacePanel();

        this.showingGallery = true;
        this.goBack = () => this.close();

        panel.add(this.add.text(centerX, 35, 'Recuerdos', HEADING_STYLE).setOrigin(0.5));
        panel.add(this.add.text(centerX, 59, `Página ${this.galleryPage + 1} de ${PAGE_COUNT}`, HINT_STYLE)
            .setOrigin(0.5));

        const firstIndex = this.galleryPage * PAINTINGS_PER_PAGE;
        const pagePaintings = PAINTINGS.slice(firstIndex, firstIndex + PAINTINGS_PER_PAGE);
        pagePaintings.forEach((painting, index) => {
            const x = centerX + (index - (pagePaintings.length - 1) / 2) * 272;

            panel.add(this.add.rectangle(x, 176, 260, 212, 0x15212c).setStrokeStyle(1, 0x3c515d));

            // Si el jugador aún no ha descubierto una pintura se dibuja un marco vacío y un texto de pista
            if (!this.discovered.has(painting.id)) {
                panel.add([
                    this.add.rectangle(x, 133, 140, 104, 0x0e1721).setStrokeStyle(1, 0x3c515d),
                    this.add.rectangle(x, 133, 100, 64, 0x101b26).setStrokeStyle(2, 0x283845),
                    this.add.text(x, 204, 'Recuerdo sin descubrir', HINT_STYLE).setOrigin(0.5),
                ]);
                return;
            }


            const open = () => this.showReader(painting, 'Volver a recuerdos', () => this.showGallery());

            panel.add([
                drawPainting(this, painting.id, x, 133, 140, 104),
                this.add.text(x, 204, painting.title, TITLE_STYLE).setOrigin(0.5),
                addMenuButton(this, x, 251, 'Leer recuerdo', open, { width: 212 }).container,
            ]);
        });

        panel.add([
            addMenuButton(this, centerX - 216, 316, 'Anterior', () => this.changePage(-1), {
                width: 130, enabled: this.galleryPage > 0,
            }).container,
            addMenuButton(this, centerX, 316, 'Volver', this.goBack).container,
            addMenuButton(this, centerX + 216, 316, 'Siguiente', () => this.changePage(1), {
                width: 130, enabled: this.galleryPage < PAGE_COUNT - 1,
            }).container,
        ]);
    }

    changePage(direction) {
        const nextPage = this.galleryPage + direction;
        if (this.showingGallery && !this.closing && nextPage >= 0 && nextPage < PAGE_COUNT) {
            this.galleryPage = nextPage;
            this.showGallery();
        }
    }

    // Construye la vista de "Modo Lectura" para revisar la historia de una pintura específica
    showReader(painting, backLabel, goBack) {
        const centerX = this.scale.gameSize.width / 2;
        const panel = this.replacePanel();

        this.showingGallery = false;
        this.goBack = goBack;

        panel.add([
            this.add.text(centerX, 54, painting.title, HEADING_STYLE).setOrigin(0.5),

            drawPainting(this, painting.id, centerX - 154, 173, 208, 155),

            this.add.text(centerX - 26, 93, 'Michael', { ...HINT_STYLE, color: '#e7c688' }),

            // Fragmento narrativo.
            this.add.text(centerX - 26, 116, painting.fragment, {
                fontFamily: 'Georgia, serif', fontSize: '18px', color: '#e3e9eb', lineSpacing: 6,
                wordWrap: { width: 276, useAdvancedWrap: true },
            }),

            addMenuButton(this, centerX, 316, backLabel, goBack, { primary: true }).container,
        ]);
    }

    // Función auxiliar para destruir la UI antigua y crear el contenedor base vacío
    replacePanel() {
        this.panel?.destroy();

        const { width, height } = this.scale.gameSize;

        // Crea un nuevo Container global con el fondo oscuro y la caja central del menú
        this.panel = this.add.container(0, 0, [
            this.add.rectangle(width / 2, height / 2, width, height, 0x080e17),
            this.add.rectangle(width / 2, height / 2, 600, 332, 0x101b26).setStrokeStyle(1, 0x47636c),
        ]);

        return this.panel;
    }

    // Finaliza esta escena superpuesta y reanuda el juego o menú subyacente
    close() {
        if (this.closing) return;
        this.closing = true;

        // Despierta la escena que haya llamado a los recuerdos (StartScene o MovementScene).
        this.scene.resume(this.returnTo);
        // Destruye y detiene MemoriesScene por completo, liberando memoria
        this.scene.stop();
    }
}
