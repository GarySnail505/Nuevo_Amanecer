import Phaser from 'phaser';
import { Harry } from '../entities/Harry.js';

// Geometría del nivel estático
const WORLD_WIDTH = 1664;
const FLOOR_TOP = 312;
const PLATFORMS = [
  { x: 210, y: 262, width: 120 },
  { x: 386, y: 218, width: 126 },
  { x: 558, y: 260, width: 140 },
  { x: 780, y: 256, width: 144 },
  { x: 977, y: 220, width: 142 },
  { x: 1180, y: 259, width: 128 },
  { x: 1360, y: 246, width: 108 },
];

export class MovementScene extends Phaser.Scene {
  constructor() {
    super('MovementScene');
  }

  // Se instancian objetos, se configura físicas y la cámara
  create() {
    // Se obtiene la altura del lienzo (canvas) configurada en el juego
    const { height } = this.scale.gameSize;

    // Se configura los límites del motor de físicas.
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, height);

    this.drawBackground();

    const platforms = this.physics.add.staticGroup();

    // Se crea el suelo base que cubre todo el ancho del mundo
    this.addPlatform(platforms, 0, FLOOR_TOP, WORLD_WIDTH, height - FLOOR_TOP);

    // Se itera sobre el arreglo de datos PLATFORMS para generar cada plataforma suspendida.
    for (const { x, y, width } of PLATFORMS) {
      this.addPlatform(platforms, x, y, width, 16);
    }

    // Se instancia a Harry pasándole el contexto de esta escena ('this') y sus coordenadas iniciales.
    this.harry = new Harry(this, 96, 282);

    // Se usa collider para el manejo de colisiones entre la hitbox de Harry y alguna plataforma
    this.physics.add.collider(this.harry, platforms);

    // Configuración de la cámara principal
    const camera = this.cameras.main;

    // Se limita la cámara para que no muestre más allá de los bordes del nivel
    camera.setBounds(0, 0, WORLD_WIDTH, height);

    // Se configura la cámara para que siga a Harry y se envía el valor de 0.14 y 1 a los parámetros
    // lerpX y lerpY para que el seguimiento de la cámara sea suave
    camera.startFollow(this.harry, true, 0.14, 1);

    // Interfaz de Usuario (UI) temporal.
    this.add.text(20, 18, 'Prueba de movimiento', {
      fontFamily: 'Georgia, serif',
      fontSize: '25px',
      color: '#eef0ed',
    }).setScrollFactor(0);

    this.add.text(20, 50, 'A / D o ← / →  Moverse    Espacio  Saltar', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#bac5cd',
    }).setScrollFactor(0);
  }

  // update() es el Game Loop principal de la escena. Se ejecuta a ~60 fotogramas por segundo.
  update() {
    this.harry.updateMovement();
  }

  // Método auxiliar para crear plataformas de manera limpia.
  addPlatform(group, x, y, width, height) {
    // Posicionamiento de las plataformas
    const surface = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x34434f);

    // Se añade al grupo de físicas estáticas.
    group.add(surface);

    // Borde decorativo superior de la plataforma.
    this.add.rectangle(x, y, width, 3, 0x899ba0).setOrigin(0);
  }

  // Dibuja el arte de fondo (Background) con formas primitivas
  drawBackground() {
    const wall = this.add.graphics();
    // Bloques de color que simulan las paredes oscuras y zócalos de los pasillos
    wall.fillStyle(0x18212d).fillRect(0, 97, WORLD_WIDTH, FLOOR_TOP - 97);
    wall.fillStyle(0x25313f).fillRect(0, 97, WORLD_WIDTH, 4);
    wall.fillStyle(0x141c27).fillRect(0, 282, WORLD_WIDTH, 30);

    // Bucle que genera objetos repetidos para realizar las pruebas y tener una referencia de la velocidad de desplazamiento
    for (let x = 72; x < WORLD_WIDTH; x += 250) {
      wall.fillStyle(0x202b38).fillRect(x, 101, 14, FLOOR_TOP - 101);
      wall.fillStyle(0x283744).fillRect(x + 76, 137, 70, 88);
      wall.fillStyle(0x111923).fillRect(x + 81, 142, 60, 78);
      wall.fillStyle(0x1e2a36).fillRect(x + 84, 145, 26, 34);
      wall.fillRect(x + 113, 182, 25, 35);
    }
  }
}