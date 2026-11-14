import Phaser from 'phaser';
import musicUrl from '../assets/audio/exploration-music.mp3';
import jumpUrl from '../assets/audio/harry-jump.wav';
import hurtUrl from '../assets/audio/harry-hurt.wav';
import discoveryUrl from '../assets/audio/painting-discovery.wav';

const MUSIC_VOLUME = 0.42;
const QUIET_VOLUME = 0.12;
const FADE_MS = 550;

export function preloadExplorationAudio(scene) {
  scene.load.audio('exploration-music', musicUrl);
  scene.load.audio('harry-jump', jumpUrl);
  scene.load.audio('harry-hurt', hurtUrl);
  scene.load.audio('painting-discovery', discoveryUrl);
}

export class ExplorationAudio {
  constructor(scene, { withMusic = true } = {}) {
    this.scene = scene;
    this.musicVolume = MUSIC_VOLUME;
    this.targetVolume = MUSIC_VOLUME;
    this.music = withMusic ? this.createSound('exploration-music', { loop: true, volume: MUSIC_VOLUME }) : null;
    this.jump = this.createSound('harry-jump', { volume: 0.52 });
    this.hurt = this.createSound('harry-hurt', { volume: 0.55 });
    this.discovery = this.createSound('painting-discovery', { volume: 0.43 });

    if (this.music) {
      // El juego sigue actualizando el audio aunque el nivel se pause para leer.
      scene.game.events.on(Phaser.Core.Events.STEP, this.update, this);
      if (scene.sound.locked) {
        scene.sound.once(Phaser.Sound.Events.UNLOCKED, this.startMusic, this);
      } else {
        this.startMusic();
      }
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  createSound(key, config) {
    return this.scene.cache.audio.exists(key) ? this.scene.sound.add(key, config) : null;
  }

  startMusic() {
    this.music.play({ volume: this.musicVolume });
  }

  setQuiet(quiet) {
    this.targetVolume = quiet ? QUIET_VOLUME : MUSIC_VOLUME;
  }

  update(_time, delta) {
    const remaining = this.targetVolume - this.musicVolume;
    if (remaining === 0) return;

    const maxStep = (MUSIC_VOLUME - QUIET_VOLUME) * delta / FADE_MS;
    this.musicVolume = Math.abs(remaining) <= maxStep
      ? this.targetVolume
      : this.musicVolume + Math.sign(remaining) * maxStep;
    if (!this.scene.sound.locked) this.music.setVolume(this.musicVolume);
  }

  playJump() {
    if (!this.scene?.sound.locked) this.jump?.play();
  }

  playHurt() {
    if (!this.scene?.sound.locked) this.hurt?.play();
  }

  playDiscovery() {
    if (!this.scene?.sound.locked) this.discovery?.play();
  }

  destroy() {
    if (!this.scene) return;

    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.scene.game.events.off(Phaser.Core.Events.STEP, this.update, this);
    this.scene.sound.off(Phaser.Sound.Events.UNLOCKED, this.startMusic, this);
    for (const sound of [this.music, this.jump, this.hurt, this.discovery]) {
      sound?.destroy();
    }
    this.scene = null;
  }
}
