import Phaser from 'phaser';
import { Harry } from '../entities/Harry.js';
import { Shadow } from '../entities/Shadow.js';
import { FlashlightSystem } from '../systems/FlashlightSystem.js';
import { HealthSystem } from '../systems/HealthSystem.js';
import { CHECKPOINTS, DEFAULT_CHECKPOINT, saveCheckpoint } from '../systems/SaveStore.js';
import { GameHud } from '../ui/GameHud.js';
import { TouchControls } from '../ui/TouchControls.js';

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
const RECHARGE_POINTS = [CHECKPOINTS.recarga.x, 1060];
const RECHARGE_HALF_WIDTH = 24;
const HARRY_MAX_HEALTH = 3;
const CONTACT_DAMAGE = 1;
const INVULNERABILITY_MS = 1000;
const KNOCKBACK_MS = 170;
const KNOCKBACK_SPEED = 185;

export class MovementScene extends Phaser.Scene {
  constructor() {
    super('MovementScene');
  }

  // Se instancian objetos, se configura físicas y la cámara
  create({ checkpointId = DEFAULT_CHECKPOINT } = {}) {
    this.checkpointId = Object.hasOwn(CHECKPOINTS, checkpointId) ? checkpointId : DEFAULT_CHECKPOINT;
    this.playTime = 0;
    this.runMenuOpen = false;

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
    const spawn = CHECKPOINTS[this.checkpointId];
    this.harry = new Harry(this, spawn.x, spawn.y);

    // Se usa collider para el manejo de colisiones entre la hitbox de Harry y alguna plataforma
    this.physics.add.collider(this.harry, platforms);

    // Configuración de la cámara principal
    const camera = this.cameras.main;

    // Se limita la cámara para que no muestre más allá de los bordes del nivel
    camera.setBounds(0, 0, WORLD_WIDTH, height);

    // Se configura la cámara para que siga a Harry y se envía el valor de 0.14 y 1 a los parámetros
    // lerpX y lerpY para que el seguimiento de la cámara sea suave
    camera.startFollow(this.harry, true, 0.14, 1);

    this.createFlashlightDemo();
    this.createCombatDemo(platforms);

    this.hud = new GameHud(this, this.health, this.checkpointId);
    this.touchControls = new TouchControls(this, {
      onFlashlight: () => this.toggleFlashlight(),
      onPause: () => this.openRunMenu('pause'),
    });

    this.input.keyboard.on('keydown-ESC', event => {
      if (!event.repeat) {
        this.openRunMenu('pause');
      }
    });
    this.events.on(Phaser.Scenes.Events.RESUME, this.resumeRun, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, this.resumeRun, this);
    });

    saveCheckpoint(this.checkpointId);
  }

  // update() es el Game Loop principal de la escena. Se ejecuta a ~60 fotogramas por segundo.
  update(_time, delta) {
    if (this.runMenuOpen) {
      return;
    }

    this.playTime += delta;
    const jumpRequested = this.touchControls.consumeJump();
    if (this.playTime >= this.knockbackUntil) {
      this.harry.updateMovement({
        leftDown: this.touchControls.leftDown,
        rightDown: this.touchControls.rightDown,
        jumpRequested,
      });
    }

    const atRechargePoint = RECHARGE_POINTS.some(x => this.isOnRechargePad(x));
    if (this.checkpointId !== 'recarga' && this.isOnRechargePad(CHECKPOINTS.recarga.x)) {
      this.checkpointId = 'recarga';
      saveCheckpoint(this.checkpointId);
      this.hud.setCheckpoint(this.checkpointId);
    }
    this.flashlight.update(delta, atRechargePoint);

    for (const marker of this.revealMarkers) {
      marker.setVisible(this.flashlight.illuminates(marker.x, marker.y));
    }

    this.hud.setEnergy(this.flashlight.energyRatio, atRechargePoint && !this.flashlight.isOn);
    this.updateCombat(this.playTime, delta);
  }

  isOnRechargePad(x) {
    return this.harry.body.bottom >= FLOOR_TOP && Math.abs(this.harry.x - x) <= RECHARGE_HALF_WIDTH;
  }

  createFlashlightDemo() {
    for (const x of RECHARGE_POINTS) {
      this.add.rectangle(x, FLOOR_TOP + 4, RECHARGE_HALF_WIDTH * 2, 8, 0x73b3ae);
      const label = x === CHECKPOINTS.recarga.x ? 'Recarga · Punto de control' : 'Recarga';
      this.add.text(x, FLOOR_TOP + 12, label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#bde2dc',
      }).setOrigin(0.5, 0);
    }

    this.flashlight = new FlashlightSystem(this, this.harry);
    this.revealMarkers = [[238, 290], [675, 288], [1256, 235]].map(([x, y]) => (
      this.add.rectangle(x, y, 18, 18, 0x66513b)
        .setStrokeStyle(2, 0xf0ce8d)
        .setAngle(45)
        .setDepth(2)
        .setVisible(false)
    ));

    this.input.keyboard.addKey('J').on('down', this.toggleFlashlight, this);
    this.input.on('pointerdown', pointer => {
      if (!pointer.wasTouch && pointer.button === 0) {
        this.toggleFlashlight();
      }
    });
  }

  toggleFlashlight() {
    if (!this.runMenuOpen) {
      this.flashlight.toggle();
    }
  }

  createCombatDemo(platforms) {
    this.health = new HealthSystem(HARRY_MAX_HEALTH, INVULNERABILITY_MS);
    this.knockbackUntil = 0;
    this.shadow = new Shadow(this, 516, FLOOR_TOP - 19, { left: 420, right: 542 });
    this.physics.add.collider(this.shadow, platforms);
  }

  updateCombat(time, delta) {
    // La luz se evalúa antes del contacto para interrumpir el daño en el mismo fotograma.
    const illuminated = this.flashlight.illuminates(this.shadow.x, this.shadow.y);
    this.shadow.updateBehavior(delta, illuminated);

    // La intersección detecta el daño sin marcar a Harry como apoyado sobre la criatura.
    const touchesShadow = this.shadow.canDamage
      && this.physics.world.intersects(this.harry.body, this.shadow.body);
    if (touchesShadow && this.health.takeDamage(CONTACT_DAMAGE, time)) {
      const direction = this.harry.body.center.x < this.shadow.body.center.x ? -1 : 1;
      this.knockbackUntil = time + KNOCKBACK_MS;
      this.harry.setVelocity(direction * KNOCKBACK_SPEED, -130);
      this.hud.setHealth(this.health);

      if (this.health.isDepleted) {
        this.openRunMenu('defeat');
      }
    }

    this.harry.setAlpha(this.health.isInvulnerable(time) ? 0.55 : 1);
  }

  openRunMenu(mode) {
    if (this.runMenuOpen) {
      return;
    }

    this.runMenuOpen = true;
    this.touchControls.setEnabled(false);
    this.scene.pause();
    this.scene.launch('RunMenuScene', { mode, checkpointId: this.checkpointId });
  }

  resumeRun() {
    this.runMenuOpen = false;
    this.touchControls.setEnabled(true);
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
