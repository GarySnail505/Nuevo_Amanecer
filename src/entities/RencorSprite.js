const SOURCE_TEXTURE = 'rencor-source';
const SPRITE_TEXTURE = 'rencor';
const GRID_SIZE = 4;
const LAST_FRAME = 15;

export const RENCOR_MOVE = 'rencor-move';
export const RENCOR_ATTACK = 'rencor-atack';
export const RENCOR_HURT = 'rencor-hurt';
export const RENCOR_DEAD = 'rencor-dead';

// La cuadrícula original tiene márgenes desiguales. Estos límites separan
// las poses y sus centros mantienen el torso quieto entre fotogramas.
const COLUMN_EDGES = [0, 206, 376, 546, 742];
const COLUMN_ANCHORS = [132, 302, 472, 642];
const ROW_EDGES = [40, 206, 369, 529, 696];
const ROW_BASELINES = [201, 365, 528, 694];
const ART_SCALE = 0.88;
const ORIGIN_X = 0.6;

export function preloadRencorSprite(scene, url) {
  scene.load.image(SOURCE_TEXTURE, url);
}

export function registerRencorAnimations(scene) {
  const { textures, anims } = scene;
  if (anims.exists(RENCOR_MOVE)) return true;
  if (!textures.exists(SOURCE_TEXTURE)) return false;

  const image = textures.get(SOURCE_TEXTURE).getSourceImage();
  if (image.width < COLUMN_EDGES[GRID_SIZE] || image.height < ROW_EDGES[GRID_SIZE]) return false;

  const frameWidth = Math.floor(image.width / GRID_SIZE);
  const frameHeight = Math.floor(image.height / GRID_SIZE);
  const sheet = textures.createCanvas(SPRITE_TEXTURE, frameWidth * GRID_SIZE, frameHeight * GRID_SIZE);
  const context = sheet.context;
  context.imageSmoothingEnabled = false;

  for (let frame = 0; frame <= LAST_FRAME; frame += 1) {
    const column = frame % GRID_SIZE;
    const row = Math.floor(frame / GRID_SIZE);
    const sourceX = COLUMN_EDGES[column];
    const sourceY = ROW_EDGES[row];
    const sourceWidth = COLUMN_EDGES[column + 1] - sourceX;
    const sourceHeight = ROW_EDGES[row + 1] - sourceY;
    const frameX = column * frameWidth;
    const frameY = row * frameHeight;
    const targetX = frameX + Math.round(frameWidth * ORIGIN_X - (COLUMN_ANCHORS[column] - sourceX) * ART_SCALE);
    const targetY = frameY + Math.round(frameHeight - (ROW_BASELINES[row] - sourceY) * ART_SCALE);

    context.save();
    context.beginPath();
    context.rect(frameX, frameY, frameWidth, frameHeight);
    context.clip();
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight,
      targetX, targetY, Math.round(sourceWidth * ART_SCALE), Math.round(sourceHeight * ART_SCALE));
    context.restore();
    sheet.add(frame, 0, frameX, frameY, frameWidth, frameHeight);
  }

  sheet.refresh();
  textures.remove(SOURCE_TEXTURE);

  for (const { key, start, frameRate, repeat } of [
    { key: RENCOR_MOVE, start: 0, frameRate: 6, repeat: -1 },
    { key: RENCOR_ATTACK, start: 4, frameRate: 16, repeat: 0 },
    { key: RENCOR_HURT, start: 8, frameRate: 8, repeat: 0 },
    { key: RENCOR_DEAD, start: 12, frameRate: 6, repeat: 0 },
  ]) {
    anims.create({ key, frameRate, repeat, frames: anims.generateFrameNumbers(SPRITE_TEXTURE, { start, end: start + 3 }) });
  }
  return true;
}

export function addRencorSprite(scene, x, floor, height, { collisionEnabled = true } = {}) {
  const sprite = scene.add.sprite(x, floor, SPRITE_TEXTURE, 0).setOrigin(ORIGIN_X, 1);
  sprite.setScale(height / sprite.height);
  scene.physics.add.existing(sprite, true);
  const { body, displayWidth, displayHeight } = sprite;
  // El cuerpo queda bajo el torso. El haz y los tentáculos quedan fuera.
  body.setSize(displayWidth * 0.24, displayHeight * 0.48, false);
  body.setOffset(displayWidth * 0.50, displayHeight * 0.52);
  body.enable = collisionEnabled;
  return sprite;
}
