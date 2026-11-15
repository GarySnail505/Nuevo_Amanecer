import { RencorFight } from '../systems/RencorFight.js';
import { addRencorSprite, RENCOR_ATTACK, RENCOR_DEAD, RENCOR_HURT, RENCOR_MOVE } from './RencorSprite.js';

const SPRITE_HEIGHT = 272;

const INSTRUCTIONS = {
  waiting: 'Observa su mirada.',
  telegraph: '¡Esquiva la zona marcada!',
  strike: 'Aléjate del impacto.',
  exposed: 'Ilumina la zona dorada.',
  opening: 'Acércate a la abertura.',
};

export class Rencor {
  constructor(scene, x, floor) {
    this.scene = scene;
    this.x = x;
    this.floor = floor;
    this.fight = new RencorFight();
    this.started = false;
    this.sprite = addRencorSprite(scene, x, floor, SPRITE_HEIGHT);
    this.weakPoint = { x: x - 44, y: floor - 25 };
    this.weakPointArt = scene.add.graphics().setDepth(2);
    this.attackArt = scene.add.graphics().setDepth(2);
    this.updateSprite('waiting', false);

    this.status = scene.add.text(240, 142, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#f3d5c1', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3).setVisible(false);
    this.bar = scene.add.rectangle(240, 161, 204, 6, 0x352836)
      .setScrollFactor(0).setDepth(3).setVisible(false);
    this.barFill = scene.add.rectangle(138, 161, 204, 6, 0xcd9d68)
      .setOrigin(0, 0.5).setScale(1, 1).setScrollFactor(0).setDepth(4).setVisible(false);

    scene.events.on('pause', this.pauseMusic, this);
    scene.events.on('resume', this.resumeMusic, this);
    scene.events.once('shutdown', () => {
      scene.events.off('pause', this.pauseMusic, this);
      scene.events.off('resume', this.resumeMusic, this);
      this.stopMusic();
    });
  }

  get isOpen() {
    return this.fight.isOpen && !this.sprite.anims.isPlaying;
  }

  update(delta, harry, flashlight, damageHarry) {
    if (!this.started && harry.x < this.x - 218) return;
    if (!this.started) {
      this.started = true;
      this.scene.physics.add.collider(harry, this.sprite);
      this.status.setVisible(true);
      this.bar.setVisible(true);
      this.barFill.setVisible(true);
      if (this.scene.cache.audio.exists('rencor-ambience')) {
        this.music = this.scene.sound.add('rencor-ambience', { loop: true, volume: 0.38 });
        this.music.play();
      }
    }

    const oldPhase = this.fight.phase;
    const hitsWeakPoint = flashlight.illuminates(this.weakPoint.x, this.weakPoint.y);
    this.fight.update(delta, {
      playerX: harry.x,
      hitsWeakPoint,
      onStrike: (x, halfWidth) => {
        this.play('rencor-strike', 0.42);
        const body = harry.body;
        if (body.right > x - halfWidth && body.left < x + halfWidth && body.bottom > this.floor - 35) {
          damageHarry(x);
        }
      },
    });

    const phase = this.fight.phase;
    if (phase !== oldPhase) {
      if (phase === 'telegraph') this.play('rencor-warning', 0.48);
      if (phase === 'opening') {
        this.sprite.play(RENCOR_DEAD);
        this.sprite.body.enable = false;
        if (this.music) {
          this.scene.tweens.add({ targets: this.music, volume: 0, duration: 800,
            onComplete: () => this.stopMusic() });
        }
      }
      this.drawWeakPoint();
    }
    this.updateSprite(phase, hitsWeakPoint);
    this.status.setText(INSTRUCTIONS[phase]);
    this.barFill.setScale(1 - this.fight.lightRatio, 1);
    this.drawAttack();
  }

  play(key, volume) {
    if (this.scene.cache.audio.exists(key)) this.scene.sound.play(key, { volume });
  }

  pauseMusic() {
    this.music?.pause();
  }

  resumeMusic() {
    this.music?.resume();
  }

  stopMusic() {
    this.music?.destroy();
    this.music = undefined;
  }

  updateSprite(phase, hitsWeakPoint) {
    if (phase === 'opening') return;

    let animation = RENCOR_MOVE;
    if (phase === 'strike') animation = RENCOR_ATTACK;
    if (phase === 'exposed' && hitsWeakPoint) animation = RENCOR_HURT;
    if (animation !== this.spriteAnimation) {
      this.spriteAnimation = animation;
      this.sprite.play(animation);
    }
  }

  drawWeakPoint() {
    const { weakPointArt, weakPoint } = this;
    weakPointArt.clear();
    if (this.fight.phase === 'exposed') {
      weakPointArt.fillStyle(0x9f6357).fillCircle(weakPoint.x, weakPoint.y, 15);
      weakPointArt.fillStyle(0xf7cd87).fillCircle(weakPoint.x, weakPoint.y, 8);
    }
  }

  drawAttack() {
    const { attackArt, floor, fight } = this;
    attackArt.clear();
    const width = fight.strikeHalfWidth;
    if (fight.phase === 'telegraph') {
      attackArt.fillStyle(0xdc897b, 0.42).fillRect(fight.strikeX - width, floor - 5, width * 2, 5);
      attackArt.lineStyle(2, 0xffb19c).lineBetween(fight.strikeX - width, floor - 5, fight.strikeX + width, floor - 5);
    } else if (fight.phase === 'strike') {
      attackArt.fillStyle(0xe3a68d, 0.75).fillEllipse(fight.strikeX, floor - 4, width * 2, 9);
    }
  }
}
