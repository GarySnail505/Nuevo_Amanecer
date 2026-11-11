import Phaser from 'phaser';

const TEXTURE_KEY = 'harry-prototype';
const SPRITE_WIDTH = 20;
const SPRITE_HEIGHT = 30;
const WALK_SPEED = 170;
const JUMP_SPEED = 370;

function createHarryTexture(scene) {
  if (scene.textures.exists(TEXTURE_KEY)) {
    return;
  }

  const graphics = scene.make.graphics({ add: false });

  // Silueta temporal con botas, abrigo, rostro y bufanda.
  graphics.fillStyle(0x516170);
  graphics.fillRect(2, 23, 16, 5);
  graphics.fillRect(2, 28, 7, 2);
  graphics.fillRect(11, 28, 7, 2);
  graphics.fillStyle(0x617c91);
  graphics.fillRect(4, 12, 12, 12);
  graphics.fillRect(2, 14, 3, 7);
  graphics.fillRect(15, 14, 3, 7);
  graphics.fillStyle(0xc2a082);
  graphics.fillRect(6, 3, 10, 9);
  graphics.fillStyle(0x30282d);
  graphics.fillRect(5, 0, 11, 4);
  graphics.fillRect(5, 4, 3, 5);
  graphics.fillRect(13, 6, 2, 2);
  graphics.fillStyle(0xb97252);
  graphics.fillRect(5, 11, 12, 3);
  graphics.fillRect(5, 14, 3, 5);

  graphics.generateTexture(TEXTURE_KEY, SPRITE_WIDTH, SPRITE_HEIGHT);
  scene.textures.get(TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
  graphics.destroy();
}

export class Harry extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    createHarryTexture(scene);
    super(scene, x, y, TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBodySize(16, SPRITE_HEIGHT);
    this.setCollideWorldBounds(true);

    this.keys = scene.input.keyboard.addKeys({
      a: 'A',
      d: 'D',
      left: 'LEFT',
      right: 'RIGHT',
      jump: 'SPACE',
    });
  }

  updateMovement() {
    const { a, d, left, right, jump } = this.keys;
    const moveLeft = a.isDown || left.isDown;
    const moveRight = d.isDown || right.isDown;
    const direction = Number(moveRight) - Number(moveLeft);

    this.setVelocityX(direction * WALK_SPEED);
    if (direction !== 0) {
      this.setFlipX(direction < 0);
    }

    const jumpPressed = Phaser.Input.Keyboard.JustDown(jump);
    const grounded = this.body.blocked.down || this.body.touching.down;
    if (jumpPressed && grounded) {
      this.setVelocityY(-JUMP_SPEED);
    }
  }
}