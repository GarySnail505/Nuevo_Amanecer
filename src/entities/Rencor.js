import { RencorFight } from '../systems/RencorFight.js';

const INSTRUCTIONS = {
  waiting: 'Observa sus extremidades.',
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
    this.weakPoint = { x: x - 28, y: floor - 25 };
    this.fight = new RencorFight();
    this.started = false;
    this.bodyArt = scene.add.graphics();
    this.attackArt = scene.add.graphics().setDepth(2);
    this.drawBody();

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
    return this.fight.isOpen;
  }

  update(delta, harry, flashlight, damageHarry) {
    if (!this.started && harry.x < this.x - 218) return;
    if (!this.started) {
      this.started = true;
      this.status.setVisible(true);
      this.bar.setVisible(true);
      this.barFill.setVisible(true);
      if (this.scene.cache.audio.exists('rencor-ambience')) {
        this.music = this.scene.sound.add('rencor-ambience', { loop: true, volume: 0.38 });
        this.music.play();
      }
    }

    const oldPhase = this.fight.phase;
    this.fight.update(delta, {
      playerX: harry.x,
      hitsWeakPoint: flashlight.illuminates(this.weakPoint.x, this.weakPoint.y),
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
      if (phase === 'opening' && this.music) {
        this.scene.tweens.add({ targets: this.music, volume: 0, duration: 800,
          onComplete: () => this.stopMusic() });
      }
      this.drawBody();
    }
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

  drawBody() {
    const { x, floor, bodyArt, weakPoint } = this;
    bodyArt.clear();
    bodyArt.fillStyle(0x281722).fillEllipse(x + 6, floor - 112, 146, 219);
    bodyArt.fillStyle(0x392432).fillEllipse(x + 10, floor - 124, 122, 188);
    bodyArt.fillStyle(0x583949).fillTriangle(x - 56, floor - 143, x - 46, floor - 231, x - 9, floor - 181);
    bodyArt.fillTriangle(x + 27, floor - 179, x + 62, floor - 223, x + 61, floor - 142);
    bodyArt.lineStyle(4, 0x634455).lineBetween(x - 48, floor - 103, x + 45, floor - 177);
    bodyArt.fillStyle(0xa97678).fillRect(x - 34, floor - 148, 15, 5).fillRect(x + 15, floor - 157, 12, 4);
    bodyArt.fillStyle(0x281722).fillTriangle(x - 108, floor, x - 52, floor - 104, x - 20, floor);
    if (this.isOpen) {
      bodyArt.fillStyle(0xb4836a).fillEllipse(x, floor - 36, 50, 72);
      bodyArt.fillStyle(0x100c15).fillEllipse(x, floor - 33, 40, 66);
    } else if (this.fight.phase === 'exposed') {
      bodyArt.fillStyle(0x9f6357).fillCircle(weakPoint.x, weakPoint.y, 15);
      bodyArt.fillStyle(0xf7cd87).fillCircle(weakPoint.x, weakPoint.y, 8);
    }
  }

  drawAttack() {
    const { attackArt, floor, x, fight } = this;
    attackArt.clear();
    const width = fight.strikeHalfWidth;
    if (fight.phase === 'telegraph') {
      attackArt.fillStyle(0xdc897b, 0.42).fillRect(fight.strikeX - width, floor - 5, width * 2, 5);
      attackArt.lineStyle(2, 0xffb19c).lineBetween(fight.strikeX - width, floor - 5, fight.strikeX + width, floor - 5);
    } else if (fight.phase === 'strike') {
      attackArt.fillStyle(0x61404e, 0.94).fillTriangle(x - 18, floor - 178,
        fight.strikeX - width, floor, fight.strikeX + width, floor - 20);
      attackArt.fillStyle(0xe3a68d, 0.75).fillEllipse(fight.strikeX, floor - 4, width * 2, 9);
    }
  }
}
