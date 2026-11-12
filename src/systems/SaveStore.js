const STORAGE_KEY = 'un-nuevo-amanecer:save:v1';
const SAVE_VERSION = 1;
const LEVEL_ID = 'prototipo';

export const CHECKPOINTS = Object.freeze({
  entrada: Object.freeze({ x: 96, y: 282 }),
  recarga: Object.freeze({ x: 350, y: 297 }),
});

export const DEFAULT_CHECKPOINT = 'entrada';

function emptySave() {
  return { progress: null, audioMuted: false, paintings: [] };
}

let memorySave = emptySave();
let storageUnavailable = false;

function isCheckpointId(checkpointId) {
  return typeof checkpointId === 'string' && Object.hasOwn(CHECKPOINTS, checkpointId);
}

function parseSave(raw) {
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    return emptySave();
  }

  if (saved?.version !== SAVE_VERSION) {
    return emptySave();
  }

  const { progress, audioMuted, paintings } = saved;
  return {
    progress: progress?.level === LEVEL_ID && isCheckpointId(progress.checkpointId)
      ? { level: LEVEL_ID, checkpointId: progress.checkpointId }
      : null,
    audioMuted: audioMuted === true,
    paintings: Array.isArray(paintings)
      ? [...new Set(paintings.filter(id => typeof id === 'string' && id !== '' && id.trim() === id))]
      : [],
  };
}

function snapshot() {
  return {
    ...memorySave,
    progress: memorySave.progress && { ...memorySave.progress },
    paintings: [...memorySave.paintings],
  };
}

export function loadSave() {
  if (!storageUnavailable) {
    try {
      memorySave = parseSave(globalThis.localStorage.getItem(STORAGE_KEY));
    } catch {
      storageUnavailable = true;
    }
  }

  return snapshot();
}

function updateSave(changes) {
  memorySave = { ...loadSave(), ...changes };
  if (!storageUnavailable) {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SAVE_VERSION, ...memorySave }));
    } catch {
      storageUnavailable = true;
    }
  }

  return snapshot();
}

export function saveCheckpoint(checkpointId) {
  if (!isCheckpointId(checkpointId)) {
    return loadSave();
  }

  return updateSave({ progress: { level: LEVEL_ID, checkpointId } });
}

export function saveAudioMuted(muted) {
  return typeof muted === 'boolean' ? updateSave({ audioMuted: muted }) : loadSave();
}
