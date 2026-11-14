import Phaser from 'phaser';
import { getLevel, LEVELS } from '../data/levels.js';
import { PAINTINGS } from '../data/paintings.js';
import { Harry } from '../entities/Harry.js';
import { Shadow } from '../entities/Shadow.js';
import { FlashlightSystem } from '../systems/FlashlightSystem.js';
import { HealthSystem } from '../systems/HealthSystem.js';
import { DEFAULT_CHECKPOINT, loadSave, rememberPainting, saveCheckpoint } from '../systems/SaveStore.js';
import { GameHud } from '../ui/GameHud.js';
import { drawPainting } from '../ui/PaintingArt.js';
import { TouchControls } from '../ui/TouchControls.js';

const FLOOR_TOP = 312;
const POINT_RADIUS = 26;
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
  create({ levelId, checkpointId = DEFAULT_CHECKPOINT } = {}) {
    this.level = getLevel(levelId);
    this.checkpointId = Object.hasOwn(this.level.checkpoints, checkpointId) ? checkpointId : DEFAULT_CHECKPOINT;
    this.playTime = 0;
    this.overlayOpen = false;

    // Se obtiene la altura del lienzo (canvas) configurada en el juego
    const { height } = this.scale.gameSize;

    // Se configura los límites del motor de físicas.
    this.physics.world.setBounds(0, 0, this.level.width, height);

    this.drawBackground();

    const platforms = this.physics.add.staticGroup();

    for (const { x, width } of this.level.ground) {
      this.addPlatform(platforms, { x, y: FLOOR_TOP, width, height: height - FLOOR_TOP });
    }
    this.litPlatforms = [];
    for (const platform of this.level.platforms) {
      const elements = this.addPlatform(platforms, platform);
      if (platform.lit) this.litPlatforms.push(elements);
    }
    this.crumbling = (this.level.crumbling ?? []).map(platform => {
      const elements = this.addPlatform(platforms, platform);
      elements.edge.setFillStyle(0xb2866e);
      return elements;
    });
    this.createLevelMarkers();

    // Se instancia a Harry pasándole el contexto de esta escena ('this') y sus coordenadas iniciales.
    const spawn = this.level.checkpoints[this.checkpointId];
    this.harry = new Harry(this, spawn.x, spawn.y);

    // Se usa collider para el manejo de colisiones entre la hitbox de Harry y alguna plataforma
    this.physics.add.collider(this.harry, platforms);

    // Configuración de la cámara principal
    const camera = this.cameras.main;

    // Se limita la cámara para que no muestre más allá de los bordes del nivel
    camera.setBounds(0, 0, this.level.width, height);

    // Se configura la cámara para que siga a Harry y se envía el valor de 0.14 y 1 a los parámetros
    // lerpX y lerpY para que el seguimiento de la cámara sea suave
    camera.startFollow(this.harry, true, 0.14, 1);

    this.createFlashlightDemo();
    this.createCombatDemo(platforms);
    this.discoveredPaintings = new Set(loadSave().paintings);
    this.paintings = PAINTINGS.filter(painting => painting.levelId === this.level.id).map(({ id, x, y }) => ({
      id,
      x,
      y,
      art: drawPainting(this, id, x, y, 24, 20).setDepth(2).setVisible(false),
    }));

    this.hud = new GameHud(this, this.health, this.checkpointId, this.level);
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

    saveCheckpoint(this.level.id, this.checkpointId);
  }

  // update() es el Game Loop principal de la escena. Se ejecuta a ~60 fotogramas por segundo.
  update(_time, delta) {
    if (this.overlayOpen) {
      return;
    }

    if (this.harry.body.bottom >= this.scale.gameSize.height) {
      this.health.deplete();
      this.hud.setHealth(this.health);
      this.openRunMenu('defeat');
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

    const atRechargePoint = this.level.recharge.some(x => this.isOnRechargePad(x));
    this.updateCheckpoint();
    this.flashlight.update(delta, atRechargePoint);
    this.hud.setEnergy(this.flashlight.energyRatio, atRechargePoint && !this.flashlight.isOn);
    this.updatePlatforms();
    if (this.updatePaintings()) {
      return;
    }
    this.updateCombat(this.playTime, delta);
    if (!this.overlayOpen && this.isNear(this.level.exit)) {
      const nextLevel = LEVELS[LEVELS.indexOf(this.level) + 1];
      this.openOverlay('RunMenuScene', { mode: 'passage', levelId: this.level.id, nextLevelId: nextLevel?.id });
    }
  }

  isNear({ x, y }) {
    return Math.abs(this.harry.x - x) <= POINT_RADIUS && Math.abs(this.harry.y - y) <= 16;
  }

  updateCheckpoint() {
    const reached = Object.entries(this.level.checkpoints).find(([id, point]) => (
      id !== DEFAULT_CHECKPOINT && id !== this.checkpointId && this.isNear(point)
    ));
    if (reached) {
      [this.checkpointId] = reached;
      saveCheckpoint(this.level.id, this.checkpointId);
      this.hud.setCheckpoint(this.checkpointId);
    }
  }

  updatePaintings() {
    for (const { id, x, y, art } of this.paintings) {
      // Evalúa si el punto (x,y) de la pintura actual está dentro del alcance del haz de la linterna
      const illuminated = this.flashlight.illuminates(x, y);

      // La pintura solo es visible si está siendo iluminada en este instante
      art.setVisible(illuminated);

      // Si es iluminada y no estaba en el registro de descubiertas (Set), se procesa el hallazgo
      if (illuminated && !this.discoveredPaintings.has(id)) {
        rememberPainting(id);
        // Pausa el movimiento y abre la escena modal del recuerdo para mostrar el texto narrativo
        this.discoveredPaintings.add(id);
        this.openOverlay('MemoriesScene', { returnTo: 'MovementScene', paintingId: id });
        return true;
      }
    }
    return false;
  }

  // Se verifica si Harry está sobre una zona de recarga
  isOnRechargePad(x) {
    return this.harry.body.bottom >= FLOOR_TOP && Math.abs(this.harry.x - x) <= RECHARGE_HALF_WIDTH;
  }

  createFlashlightDemo() {
    // Dibuja los puntos de recarga configurados para el nivel.
    for (const x of this.level.recharge) {
      this.add.rectangle(x, FLOOR_TOP + 4, RECHARGE_HALF_WIDTH * 2, 8, 0x73b3ae);
      const isCheckpoint = Object.values(this.level.checkpoints).some(point => point.x === x);
      const label = isCheckpoint ? 'Recarga · Punto de control' : 'Recarga';
      this.add.text(x, FLOOR_TOP + 12, label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#bde2dc',
      }).setOrigin(0.5, 0);
    }

    // Lógica de consumo y orientación de la linterna
    this.flashlight = new FlashlightSystem(this, this.harry);

    // Asignación de la tecla J y clic izq. para enceder/apagar la linterna
    this.input.keyboard.addKey('J').on('down', this.toggleFlashlight, this);
    this.input.on('pointerdown', pointer => {
      if (!pointer.wasTouch && pointer.button === 0) {
        this.toggleFlashlight();
      }
    });
  }

  // Se bloquea el encendido o apagaod de la linterna si hay un menú abierto
  toggleFlashlight() {
    if (!this.overlayOpen) {
      this.flashlight.toggle();
    }
  }

  createCombatDemo(platforms) {
    this.health = new HealthSystem(HARRY_MAX_HEALTH, INVULNERABILITY_MS);
    this.knockbackUntil = 0;
    this.enemies = this.level.enemies.map(({ x, y, ...behavior }) => {
      const enemy = new Shadow(this, x, y, behavior);
      this.physics.add.collider(enemy, platforms);
      return enemy;
    });
  }

  updateCombat(time, delta) {
    // La luz se evalúa antes del contacto para interrumpir el daño en el mismo fotograma.
    for (const enemy of this.enemies) {
      const illuminated = this.flashlight.illuminates(enemy.x, enemy.y);
      enemy.updateBehavior(delta, illuminated, this.harry);

      // La intersección detecta el daño sin marcar a Harry como apoyado sobre la criatura.
      if (enemy.canDamage && this.physics.world.intersects(this.harry.body, enemy.body)) {
        this.damageHarry(enemy.body.center.x, time);
      }
    }
    this.updateHazards(time);
    this.harry.setAlpha(this.health.isInvulnerable(time) ? 0.55 : 1);
  }

  damageHarry(sourceX, time) {
    if (!this.health.takeDamage(CONTACT_DAMAGE, time)) {
      return;
    }

    const direction = this.harry.body.center.x < sourceX ? -1 : 1;
    this.knockbackUntil = time + KNOCKBACK_MS;
    this.harry.setVelocity(direction * KNOCKBACK_SPEED, -130);
    this.hud.setHealth(this.health);
    if (this.health.isDepleted) {
      this.openRunMenu('defeat');
    }
  }

  openRunMenu(mode) {
    this.openOverlay('RunMenuScene', { mode, levelId: this.level.id, checkpointId: this.checkpointId });
  }

  // Evita abrir múltiples menús simultáneamente, se desactiva los controles si un menú está abierto
  // y se pausa la ejecución de MovementScene
  openOverlay(sceneKey, data) {
    if (this.overlayOpen) {
      return;
    }

    this.overlayOpen = true;
    this.touchControls.setEnabled(false);
    this.scene.pause();
    this.scene.launch(sceneKey, data);
  }

  // Restaura controles y estado
  resumeRun() {
    this.overlayOpen = false;
    this.touchControls.setEnabled(true);
  }

  // Método auxiliar para crear plataformas de manera limpia.
  addPlatform(group, { x, y, width, height = 16, lit = false }) {
    // Posicionamiento de las plataformas
    const surface = this.add.rectangle(x + width / 2, y + height / 2, width, height, this.level.palette.platform);

    // Se añade al grupo de físicas estáticas.
    group.add(surface);

    // Borde decorativo superior de la plataforma.
    const edge = this.add.rectangle(x, y, width, 3, this.level.palette.edge).setOrigin(0);
    if (lit) {
      surface.setVisible(false);
      edge.setVisible(false);
      surface.body.enable = false;
    }
    return { surface, edge, x, y, width };
  }

  updatePlatforms() {
    for (const { surface, edge } of this.litPlatforms) {
      if (!surface.visible && this.flashlight.illuminates(surface.x, surface.y)) {
        surface.setVisible(true);
        edge.setVisible(true);
        surface.body.enable = true;
      }
    }

    const { left, right, bottom, velocity } = this.harry.body;
    for (const platform of this.crumbling) {
      const { surface, edge, x, y, width } = platform;
      if (!platform.triggered && Math.abs(bottom - y) < 1 && velocity.y >= 0 && right > x && left < x + width) {
        platform.triggered = true;
        edge.setFillStyle(0xe7a879);
        this.time.delayedCall(420, () => {
          surface.body.enable = false;
          surface.setVisible(false);
          edge.setVisible(false);
        });
      }
    }
  }

  createLevelMarkers() {
    const { x, y } = this.level.exit;
    if (this.level.id === 'nivel-5') {
      const silhouette = this.add.graphics();
      silhouette.fillStyle(0x1a101e).fillEllipse(x + 8, 219, 154, 151);
      silhouette.fillStyle(0x362331).fillTriangle(x - 72, 302, x - 28, 189, x + 11, 302);
      silhouette.fillTriangle(x - 6, 302, x + 56, 182, x + 77, 302);
    }
    this.add.rectangle(x, y - 13, 38, 56, this.level.palette.trim).setStrokeStyle(2, this.level.palette.edge);
    this.add.text(x, y + 22, this.level.id === 'nivel-5' ? 'Umbral' : 'Salida', {
      fontFamily: 'monospace', fontSize: '14px', color: '#eef0ed',
    }).setOrigin(0.5, 0);

    this.hazards = (this.level.hazards ?? []).map(hazard => {
      const { x, y, width, height, kind } = hazard;
      const shape = this.add.graphics();
      const color = kind === 'embers' ? 0xd89262 : 0xc192b1;
      shape.fillStyle(color);
      for (let offset = 0; offset < width - 8; offset += 12) {
        const foot = y + height;
        shape.fillTriangle(x + offset, foot, x + offset + 5, y + offset % 6, x + offset + 9, foot);
      }
      return { ...hazard, shape };
    });
  }

  updateHazards(time) {
    const body = this.harry.body;
    for (const { x, y, width, height, kind, shape } of this.hazards) {
      const cycle = (time + x) % 1900;
      const centerX = x + width / 2;
      const suppressed = kind === 'hands' && this.flashlight.illuminates(centerX, y + height / 2);
      const active = kind === 'embers' || (cycle >= 780 && cycle < 1350 && !suppressed);
      shape.setAlpha(active ? 1 : cycle < 780 && !suppressed ? 0.45 : 0.18);
      if (active && body.right > x && body.left < x + width && body.bottom > y && body.top < y + height) {
        this.damageHarry(centerX, time);
      }
    }
  }

  // Dibuja el arte de fondo (Background) con formas primitivas
  drawBackground() {
    const wall = this.add.graphics();
    const { palette, width } = this.level;
    this.cameras.main.setBackgroundColor(palette.sky);
    // Bloques de color que simulan las paredes oscuras y zócalos de los pasillos
    wall.fillStyle(palette.wall).fillRect(0, 97, width, FLOOR_TOP - 97);
    wall.fillStyle(palette.trim).fillRect(0, 97, width, 4);
    wall.fillStyle(palette.base).fillRect(0, 282, width, 30);

    // Bucle que genera objetos repetidos para realizar las pruebas y tener una referencia de la velocidad de desplazamiento
    for (let x = 72; x < width; x += 250) {
      wall.fillStyle(palette.trim).fillRect(x, 101, 14, FLOOR_TOP - 101);
      wall.fillStyle(palette.accent).fillRect(x + 76, 137, 70, 88);
      wall.fillStyle(palette.sky).fillRect(x + 81, 142, 60, 78);
      wall.fillStyle(palette.base).fillRect(x + 84, 145, 26, 34);
      wall.fillRect(x + 113, 182, 25, 35);
      this.drawRoomDetails(wall, x, palette);
    }
  }

  drawRoomDetails(wall, x, palette) {
    switch (this.level.id) {
      case 'nivel-2':
        wall.fillStyle(palette.trim).fillRect(x + 24, 238, 119, 6)
          .fillRect(x + 28, 244, 7, 22).fillRect(x + 133, 244, 7, 22);
        break;
      case 'nivel-3':
        wall.fillStyle(palette.sky).fillTriangle(x + 45, 271, x + 63, 125, x + 93, 272);
        wall.fillStyle(palette.accent).fillRect(x + 25, 270, 145, 6);
        break;
      case 'nivel-4':
        wall.lineStyle(4, palette.accent).lineBetween(x + 13, 278, x + 61, 119)
          .lineBetween(x + 61, 119, x + 152, 159);
        break;
      case 'nivel-5':
        wall.fillStyle(palette.accent).fillTriangle(x + 21, 102, x + 169, 102, x + 115, 225);
        break;
    }
  }
}
