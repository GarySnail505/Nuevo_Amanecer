import { saveAudioMuted } from '../systems/SaveStore.js';

export function addMenuButton(scene, x, y, title, onPress, { width = 224, enabled = true, primary = false } = {}) {
  const fill = primary ? 0x31535a : 0x192633;
  const background = scene.add.rectangle(0, 0, width, 46, enabled ? fill : 0x141d26)
    .setStrokeStyle(1, primary ? 0x6a9492 : 0x42525f);
  const label = scene.add.text(0, 0, title, {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: enabled ? '#eef0ed' : '#8c9aa4',
  }).setOrigin(0.5);

  if (enabled) {
    background.setInteractive({ useHandCursor: true });
    background.on('pointerover', () => background.setFillStyle(primary ? 0x406a72 : 0x283d4c));
    background.on('pointerout', () => background.setFillStyle(fill));
    background.on('pointerup', pointer => {
      if (pointer.wasTouch || pointer.button === 0) {
        onPress();
      }
    });
  }

  return { container: scene.add.container(x, y, [background, label]), label };
}

export function addAudioMenuButton(scene, x, y, options) {
  const audioLabel = () => scene.sound.mute ? 'Audio apagado' : 'Audio activado';
  const button = addMenuButton(scene, x, y, audioLabel(), () => {
    const muted = !scene.sound.mute;
    scene.sound.mute = muted;
    saveAudioMuted(muted);
    button.label.setText(audioLabel());
  }, options);

  return button;
}
