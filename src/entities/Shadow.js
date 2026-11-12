import Phaser from 'phaser';

const TEXTURE_KEY = 'shadow-prototype';
const SPRITE_WIDTH = 26;
const SPRITE_HEIGHT = 38;
const PATROL_SPEED = 42;
const LIGHT_EXPOSURE_MS = 1200;

function createShadowTexture(scene) {
  if (scene.textures.exists(TEXTURE_KEY)) {
    return;
  }

  const graphics = scene.make.graphics({ add: false });

  // Contorno escalonado para distinguir la silueta del fondo oscuro.
  graphics.fillStyle(0x748295);
  graphics.fillRect(9, 0, 8, 3);
  graphics.fillRect(6, 3, 14, 4);
  graphics.fillRect(4, 7, 18, 11);
  graphics.fillRect(6, 18, 14, 3);
  graphics.fillRect(4, 21, 18, 6);
  graphics.fillRect(2, 27, 22, 6);
  graphics.fillRect(2, 33, 7, 4);
  graphics.fillRect(11, 33, 5, 5);
  graphics.fillRect(18, 33, 6, 3);

  graphics.fillStyle(0x303346);
  graphics.fillRect(10, 2, 6, 4);
  graphics.fillRect(7, 5, 12, 4);
  graphics.fillRect(6, 9, 14, 8);
  graphics.fillRect(8, 17, 10, 7);
  graphics.fillRect(6, 23, 14, 7);
  graphics.fillRect(4, 29, 18, 3);
  graphics.fillRect(4, 32, 3, 3);
  graphics.fillRect(12, 32, 3, 4);
  graphics.fillRect(19, 32, 3, 2);

  graphics.fillStyle(0xd8d9f0);
  graphics.fillRect(8, 11, 3, 2);
  graphics.fillRect(15, 11, 3, 2);

  graphics.generateTexture(TEXTURE_KEY, SPRITE_WIDTH, SPRITE_HEIGHT);
  scene.textures.get(TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
  graphics.destroy();
}

export class Shadow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, { left, right }) {
    createShadowTexture(scene);
    super(scene, x, y, TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBodySize(20, SPRITE_HEIGHT);
    this.setCollideWorldBounds(true);

    this.patrolLeft = left;
    this.patrolRight = right;
    this.direction = -1;
    this.illuminated = false;
    this.exposureMs = 0;
    this.setVelocityX(-PATROL_SPEED);
  }

  get canDamage() {
    return this.active && !this.illuminated;
  }

  updateBehavior(deltaMs, illuminated) {
    if (!this.active) {
      return;
    }

    this.illuminated = illuminated;
    if (illuminated) {
      this.setVelocityX(0);
      this.exposureMs += deltaMs;
      if (this.exposureMs >= LIGHT_EXPOSURE_MS) {
        this.disableBody(true, true);
        return;
      }

      this.setAlpha(0.84 - 0.49 * (this.exposureMs / LIGHT_EXPOSURE_MS));
      return;
    }

    if (this.x <= this.patrolLeft) {
      this.direction = 1;
    } else if (this.x >= this.patrolRight) {
      this.direction = -1;
    }
    this.setAlpha(1);
    this.setVelocityX(this.direction * PATROL_SPEED);
  }
}
