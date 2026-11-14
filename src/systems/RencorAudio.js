import ambienceUrl from '../assets/audio/rencor-ambience.wav';
import strikeUrl from '../assets/audio/rencor-strike.wav';
import warningUrl from '../assets/audio/rencor-warning.wav';

export function preloadRencorAudio(scene) {
  scene.load.audio('rencor-ambience', ambienceUrl);
  scene.load.audio('rencor-warning', warningUrl);
  scene.load.audio('rencor-strike', strikeUrl);
}
