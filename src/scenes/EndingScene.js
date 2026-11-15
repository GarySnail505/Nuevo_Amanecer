import Phaser from 'phaser';
import { Harry } from '../entities/Harry.js';
import { FlashlightSystem } from '../systems/FlashlightSystem.js';
import { markGameCompleted } from '../systems/SaveStore.js';
import { addMenuButton } from '../ui/MenuButton.js';
import { drawPainting } from '../ui/PaintingArt.js';
import { TouchControls } from '../ui/TouchControls.js';

const FLOOR_Y = 285;
const BARRIER_X = 286;
const MICHAEL_X = 520;
const RESCUE_LINES = [
  { speaker: 'Michael', line: 'Pensé que no ibas a encontrarme.' },
  { speaker: 'Harry', line: 'Te dije que siempre volvería.' },
];
const DAWN_LINES = [
  { speaker: 'Michael', line: '¿Ya terminó?' },
  { speaker: 'Harry', line: 'Por ahora... estamos juntos.' },
];

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create() {
    this.stage = 'interior';
    this.dialogue = null;
    this.barrierOpen = false;
    this.illuminationMs = 0;
    this.leaving = false;
    this.memoriesOpen = false;

    this.drawInterior();
    const floor = this.add.zone(320, FLOOR_Y + 40, 640, 80);
    this.physics.add.existing(floor, true);
    this.harry = new Harry(this, 86, FLOOR_Y - 15).setDepth(3);
    this.physics.add.collider(this.harry, floor);
    this.physics.world.setBounds(0, 0, 640, 360);

    this.barrierArt = this.add.graphics().setDepth(2);
    this.barrierArt.fillStyle(0x17131f);
    this.barrierArt.fillTriangle(258, FLOOR_Y, 284, 172, 316, FLOOR_Y);
    this.barrierArt.fillTriangle(270, FLOOR_Y, 300, 193, 321, FLOOR_Y);
    this.barrierArt.lineStyle(3, 0x4c364f).lineBetween(273, 266, 290, 218);
    this.barrierArt.lineBetween(298, 275, 299, 231);
    this.barrierBody = this.add.zone(BARRIER_X, 228, 38, 114);
    this.physics.add.existing(this.barrierBody, true);
    this.physics.add.collider(this.harry, this.barrierBody);

    this.michael = this.drawMichael(MICHAEL_X, FLOOR_Y).setDepth(2);
    this.restraints = this.add.graphics().setDepth(3);
    this.restraints.lineStyle(3, 0x574257).lineBetween(MICHAEL_X - 18, 248, MICHAEL_X + 13, 270);
    this.restraints.lineBetween(MICHAEL_X - 16, 272, MICHAEL_X + 15, 255);

    this.flashlight = new FlashlightSystem(this, this.harry);
    this.flashlight.toggle();
    this.touchControls = new TouchControls(this, {
      onFlashlight: () => this.toggleFlashlight(),
    });

    this.instructions = this.add.text(320, 320, 'Mantén la luz sobre la sombra y avanza.', {
      fontFamily: 'monospace', fontSize: '15px', color: '#d6cad7',
    }).setOrigin(0.5).setDepth(4);

    this.input.keyboard.on('keydown-J', event => {
      if (!event.repeat) this.toggleFlashlight();
    });
    this.input.on('pointerdown', pointer => {
      if (!pointer.wasTouch && pointer.button === 0) this.toggleFlashlight();
    });
    this.input.keyboard.on('keydown-ENTER', event => {
      if (!event.repeat) this.advanceDialogue();
    });
    if (this.cache.audio.exists('rencor-ambience')) {
      this.ambience = this.sound.add('rencor-ambience', { loop: true, volume: 0.21 });
      this.ambience.play();
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.ambience.destroy();
        this.ambience = null;
      });
    }
    this.cameras.main.fadeIn(520, 12, 9, 16);
  }

  update(_time, delta) {
    if (this.stage !== 'interior') return;

    this.harry.updateMovement({
      leftDown: this.touchControls.leftDown,
      rightDown: this.touchControls.rightDown,
      jumpRequested: this.touchControls.consumeJump(),
    });
    // El tramo final usa la luz para guiar. Mantiene su reserva durante el rescate.
    this.flashlight.update(0, false);
    if (!this.barrierOpen) {
      this.updateBarrier(delta);
    }
    if (this.barrierOpen && Math.abs(this.harry.x - MICHAEL_X) <= 30 && this.harry.body.blocked.down) {
      this.startRescue();
    }
  }

  toggleFlashlight() {
    if (this.stage === 'interior') this.flashlight.toggle();
  }

  updateBarrier(delta) {
    if (!this.flashlight.illuminates(BARRIER_X, FLOOR_Y - 19)) {
      this.illuminationMs = 0;
      this.barrierArt.setAlpha(1);
      return;
    }

    this.illuminationMs += delta;
    this.barrierArt.setAlpha(1 - Math.min(1, this.illuminationMs / 360));
    if (this.illuminationMs >= 360) {
      this.barrierOpen = true;
      this.barrierBody.body.enable = false;
      this.barrierArt.destroy();
      this.instructions.setText('Acércate a Michael.');
    }
  }

  startRescue() {
    this.stage = 'rescue';
    this.harry.setVelocity(0).setImmovable(true);
    this.harry.body.setAllowGravity(false);
    this.touchControls.destroy();
    this.flashlight.beam.setVisible(false);
    this.instructions.destroy();
    if (this.ambience) {
      this.tweens.add({ targets: this.ambience, volume: 0, duration: 850, onComplete: () => this.ambience.stop() });
    }
    this.tweens.add({ targets: this.restraints, alpha: 0, duration: 380 });
    this.tweens.add({ targets: this.michael, x: MICHAEL_X - 12, duration: 400, ease: 'Sine.Out' });
    this.showDialogue(RESCUE_LINES, 0, 'Salir con Michael', () => this.startDawn());
  }

  showDialogue(lines, index, lastLabel, onFinish) {
    const { speaker, line } = lines[index];
    const buttonLabel = index === lines.length - 1 ? lastLabel : 'Continuar';
    const panel = this.add.container(0, 0, [
      this.add.rectangle(320, 61, 600, 104, 0x151322, 0.94).setStrokeStyle(1, 0x715669),
      this.add.text(37, 23, speaker, { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#e3be9f' }),
      this.add.text(37, 51, line, {
        fontFamily: 'Georgia, serif', fontSize: '18px', color: '#f6edf0',
        wordWrap: { width: 360 },
      }),
      addMenuButton(this, 503, 76, buttonLabel, () => this.advanceDialogue(), { width: 188, primary: true }).container,
    ]).setDepth(12);
    this.dialogue = { lines, index, lastLabel, onFinish, panel };
  }

  advanceDialogue() {
    if (!this.dialogue) return;

    const { lines, index, lastLabel, onFinish, panel } = this.dialogue;
    this.dialogue = null;
    panel.destroy();
    if (index === lines.length - 1) {
      onFinish();
    } else {
      this.showDialogue(lines, index + 1, lastLabel, onFinish);
    }
  }

  startDawn() {
    this.stage = 'dawn';
    const { light, silhouette, fog, dust } = this.drawExterior();
    this.cameras.main.fadeIn(820, 12, 9, 16);
    this.tweens.add({ targets: light, alpha: 1, duration: 2200, ease: 'Sine.InOut' });
    this.tweens.add({ targets: silhouette, alpha: 0, scaleX: 0.84, duration: 1450, delay: 940, ease: 'Sine.In' });
    this.tweens.add({ targets: fog, alpha: 0, x: -82, duration: 2200, delay: 380 });
    this.tweens.add({ targets: dust, alpha: 0.88, y: -25, delay: 1020, duration: 600, yoyo: true });
    this.time.delayedCall(2580, () => this.showDialogue(DAWN_LINES, 0, 'Terminar', () => this.finish()));
  }

  finish() {
    this.stage = 'finished';
    markGameCompleted();
    const { width, height } = this.scale.gameSize;
    const centerX = width / 2;

    // Imagen del título con la misma escala y alineación que en StartScene
    const titleImage = this.add.image(centerX, 110, 'game-title')
      .setOrigin(0.5)
      .setScale(0.5)
      .setDepth(11);

    const goToMainMenu = () => {
      if (this.leaving || this.memoriesOpen) return;
      this.leaving = true;
      this.scene.start('StartScene');
    };
    const openMemories = () => {
      if (this.leaving || this.memoriesOpen) return;
      this.memoriesOpen = true;
      this.events.once(Phaser.Scenes.Events.RESUME, () => { this.memoriesOpen = false; });
      this.scene.pause();
      this.scene.launch('MemoriesScene', { returnTo: 'EndingScene' });
    };
    addMenuButton(this, 208, 321, 'Menú principal', goToMainMenu, { width: 200, primary: true }).container.setDepth(12);
    addMenuButton(this, 432, 321, 'Recuerdos', openMemories, { width: 200 }).container.setDepth(12);
  }

  drawInterior() {
    const art = this.add.graphics();
    art.fillStyle(0x201a2b).fillRect(0, 0, 640, 360);
    art.fillStyle(0x30243a).fillEllipse(320, 142, 716, 345);
    art.fillStyle(0x3d2d43).fillEllipse(388, 192, 532, 265);
    art.fillStyle(0x261e30).fillTriangle(0, 0, 111, 0, 26, 285);
    art.fillTriangle(539, 0, 640, 0, 612, 288);

    // Los marcos y muebles deformados reaparecen como fragmentos de los recuerdos.
    art.fillStyle(0x69516b).fillRect(414, 121, 77, 106);
    art.fillStyle(0x2d2335).fillRect(420, 128, 65, 100);
    art.fillStyle(0x625064).fillRect(70, 218, 109, 12).fillRect(70, 194, 6, 49).fillRect(172, 223, 6, 20);
    art.fillStyle(0x766170).fillRect(77, 209, 35, 9);
    art.lineStyle(4, 0x50394f).lineBetween(55, 60, 117, 146);
    art.lineBetween(345, 82, 381, 215);
    art.lineBetween(531, 52, 578, 175);
    art.fillStyle(0x151222).fillRect(0, FLOOR_Y, 640, 75);
    art.fillStyle(0x6f5365).fillRect(0, FLOOR_Y, 640, 3);

    drawPainting(this, 'nuestro-primer-dia', 123, 159, 70, 54).setRotation(-0.18).setAlpha(0.55);
    drawPainting(this, 'la-habitacion-de-los-dos', 316, 174, 52, 40).setRotation(0.14).setAlpha(0.58);
    drawPainting(this, 'mi-hermano', 544, 145, 67, 50).setRotation(0.21).setAlpha(0.72);
  }

  drawMichael(x, y, inSunlight = false) {
    const shirt = inSunlight ? 0x6d4d5e : 0x968291;
    const skin = inSunlight ? 0x997566 : 0xc7a490;
    const figure = this.add.graphics().setPosition(x, y);
    figure.fillStyle(0x443447).fillRect(-6, -8, 12, 5).fillRect(-6, -3, 5, 3).fillRect(1, -3, 5, 3);
    figure.fillStyle(shirt).fillRect(-6, -17, 12, 10).fillRect(-8, -14, 3, 6).fillRect(6, -14, 3, 6);
    figure.fillStyle(skin).fillRect(-5, -25, 10, 9);
    figure.fillStyle(0x443344).fillRect(-6, -27, 11, 4).fillRect(-6, -24, 3, 4);
    return figure;
  }

  drawExterior() {
    const night = this.add.graphics().setDepth(6);
    night.fillStyle(0x312738).fillRect(0, 0, 640, 360);
    night.fillStyle(0x51404d).fillRect(0, 135, 640, 160);

    const light = this.add.graphics().setDepth(7).setAlpha(0);
    light.fillStyle(0x7c5c71).fillRect(0, 0, 640, 360);
    light.fillStyle(0xb5797c).fillRect(0, 103, 640, 257);
    light.fillStyle(0xe5a384).fillRect(0, 159, 640, 201);
    light.fillStyle(0xf2bc91).fillRect(0, 190, 640, 170);
    light.fillStyle(0xffd9a1, 0.42).fillCircle(449, 217, 76);
    light.fillStyle(0xffe1a9).fillCircle(449, 217, 47);
    light.fillStyle(0xffe0ad, 0.18).fillTriangle(9, 100, 449, 206, 100, 153);
    light.fillTriangle(14, 212, 452, 213, 55, 242);
    light.fillTriangle(620, 74, 451, 209, 620, 132);

    const horizon = this.add.graphics().setDepth(8);
    horizon.fillStyle(0x675466).fillTriangle(0, 247, 110, 199, 232, 247);
    horizon.fillTriangle(151, 249, 329, 218, 418, 249).fillTriangle(442, 249, 573, 200, 640, 243);
    horizon.fillStyle(0x403a4c).fillRect(58, 197, 90, 53).fillTriangle(50, 198, 103, 163, 157, 198);
    horizon.fillStyle(0x9a726f).fillRect(74, 204, 8, 12).fillRect(126, 204, 8, 12);
    horizon.fillStyle(0x5c4c5d).fillRect(0, 247, 640, 113);
    horizon.fillStyle(0x443948).fillTriangle(0, 360, 196, 265, 518, 360).fillRect(0, 339, 640, 21);

    const silhouette = this.add.graphics().setPosition(239, 244).setDepth(9);
    silhouette.fillStyle(0x322536).fillEllipse(0, -44, 132, 91);
    silhouette.fillTriangle(-55, -49, -72, -109, -24, -65).fillTriangle(20, -63, 51, -119, 54, -51);
    silhouette.fillTriangle(-59, -37, -112, -3, -31, -14).fillTriangle(51, -34, 105, 2, 26, -8);
    silhouette.fillStyle(0x9e666e).fillEllipse(-21, -51, 14, 6).fillEllipse(20, -56, 13, 6);

    const fog = this.add.graphics().setAlpha(0.56).setDepth(9);
    fog.fillStyle(0x9a889f).fillEllipse(208, 251, 640, 28).fillEllipse(473, 269, 405, 21);
    fog.fillStyle(0xc4a2a5).fillEllipse(106, 278, 396, 18);

    const dust = this.add.graphics().setAlpha(0).setDepth(10);
    dust.fillStyle(0xe1a586);
    for (let index = 0; index < 18; index += 1) {
      dust.fillRect(178 + (index * 37) % 145, 146 + (index * 29) % 98, 2 + index % 3, 2);
    }

    this.add.image(401, 289, this.harry.texture.key).setScale(1.2).setDepth(11);
    this.drawMichael(425, 306, true).setDepth(11).setScale(1.1);
    return { light, silhouette, fog, dust };
  }
}
