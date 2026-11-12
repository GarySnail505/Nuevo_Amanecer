const TEXT_STYLE = {
  fontFamily: 'monospace',
  fontSize: '14px',
  color: '#eef0ed',
};
const ENERGY_BAR_WIDTH = 140;

export class GameHud {
  constructor(scene, health, checkpointId) {
    const right = scene.scale.gameSize.width - 20;
    const barX = right - ENERGY_BAR_WIDTH;

    scene.add.text(20, 18, 'Prueba de combate', {
      fontFamily: 'Georgia, serif',
      fontSize: '25px',
      color: '#eef0ed',
    }).setScrollFactor(0).setDepth(3);

    this.checkpointLabel = scene.add.text(20, 51, '', { ...TEXT_STYLE, color: '#bde2dc' })
      .setScrollFactor(0).setDepth(3);
    scene.add.text(20, 74, 'Esc · Pausa', { ...TEXT_STYLE, color: '#bac5cd' })
      .setScrollFactor(0).setDepth(3);

    this.energyLabel = scene.add.text(right, 23, '', TEXT_STYLE)
      .setOrigin(1, 0).setScrollFactor(0).setDepth(3);
    scene.add.rectangle(barX, 45, ENERGY_BAR_WIDTH, 7, 0x34434f)
      .setOrigin(0).setScrollFactor(0).setDepth(3);
    this.energyFill = scene.add.rectangle(barX, 45, ENERGY_BAR_WIDTH, 7, 0xe7c688)
      .setOrigin(0).setScrollFactor(0).setDepth(3);

    this.healthLabel = scene.add.text(right, 62, '', { ...TEXT_STYLE, color: '#efb1b2' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(3);
    this.setEnergy(1, false);
    this.setHealth(health);
    this.setCheckpoint(checkpointId);
  }

  setEnergy(ratio, charging) {
    this.energyFill.setScale(ratio, 1);
    const label = charging && ratio < 1 ? 'Recargando' : 'Energía';
    this.energyLabel.setText(`${label} ${Math.ceil(ratio * 100)}%`);
  }

  setHealth({ current, maxHealth }) {
    this.healthLabel.setText(`Salud ${current}/${maxHealth}`);
  }

  setCheckpoint(checkpointId) {
    const label = checkpointId === 'recarga' ? 'Recarga' : 'Entrada';
    this.checkpointLabel.setText(`Punto de control · ${label}`);
  }
}
