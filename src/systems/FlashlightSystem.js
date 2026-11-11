import Phaser from 'phaser';
// Configuración de energía y dimensiones de la linterna
const MAX_ENERGY = 100;
const DRAIN_PER_SECOND = 20;
const RECHARGE_PER_SECOND = 40;
const BEAM_RANGE = 180;
const BEAM_HALF_HEIGHT = 48;
const BEAM_OFFSET_X = 9;
const BEAM_OFFSET_Y = -4;

export class FlashlightSystem {
  constructor(scene, harry) {
    // Guarda una referencia al personaje y configura el estado inicial
    this.harry = harry;
    this.isOn = false;
    this.energy = MAX_ENERGY;
    // Crea un triángulo que representa el área de iluminación
    this.cone = new Phaser.Geom.Triangle(0, 0, BEAM_RANGE, -BEAM_HALF_HEIGHT, BEAM_RANGE, BEAM_HALF_HEIGHT);
    // Crea el gráfico de la linterna y lo oculta inicialmente
    this.beam = scene.add.graphics().setDepth(1).setVisible(false);
    this.beam.fillStyle(0xffdb91, 0.18).fillTriangleShape(this.cone);
    this.beam.fillStyle(0xffe9b5, 0.12).fillTriangle(0, 0, BEAM_RANGE, -18, BEAM_RANGE, 18);
  }
// Devuelve la proporción de energía disponible entre 0 y 1
  get energyRatio() {
    return this.energy / MAX_ENERGY;
  }
// Enciende o apaga la linterna, siempre que tenga energía
  toggle() {
    this.isOn = !this.isOn && this.energy > 0;
  }

  update(deltaMs, canRecharge) {
    // Convierte el tiempo transcurrido de milisegundos a segundos
    const seconds = deltaMs / 1000;
    // Si la linterna está encendida, consume energía
    if (this.isOn) {
      this.energy = Math.max(0, this.energy - DRAIN_PER_SECOND * seconds);
      // Apaga automáticamente la linterna cuando se queda sin energía
      if (this.energy === 0) {
        this.isOn = false;
      }
    } else if (canRecharge) {
      // Recupera energía cuando está apagada y Harry está en una zona de recarga
      this.energy = Math.min(MAX_ENERGY, this.energy + RECHARGE_PER_SECOND * seconds);
    }
    // Determina la dirección de la luz según hacia dónde mira Harry
    const direction = this.harry.flipX ? -1 : 1;
    this.beam.setScale(direction, 1);
    this.beam.setPosition(this.harry.x + direction * BEAM_OFFSET_X, this.harry.y + BEAM_OFFSET_Y);
    this.beam.setVisible(this.isOn);
  }

  illuminates(x, y) {
    if (!this.isOn) {
      return false;
    }

    // Convierte el punto del escenario al espacio local del triángulo.
    const localX = (x - this.beam.x) * this.beam.scaleX;
    const localY = y - this.beam.y;
    return Phaser.Geom.Triangle.Contains(this.cone, localX, localY);
  }
}
