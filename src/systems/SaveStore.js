import { getLevel } from '../data/levels.js';

const STORAGE_KEY = 'un-nuevo-amanecer:save:v1';
const SAVE_VERSION = 1;

export const DEFAULT_CHECKPOINT = 'entrada';

// Retorna la estructura base de un archivo de guardado limpio
function emptySave() {
  return { progress: null, audioMuted: false, paintings: [] };
}

let memorySave = emptySave();
let storageUnavailable = false;

// Valida que el ID solicitado realmente exista en nuestro diccionario de CHECKPOINTS
function isCheckpointId(level, checkpointId) {
  return typeof checkpointId === 'string' && Object.hasOwn(level.checkpoints, checkpointId);
}

// Deserializa y sanitiza los datos provenientes de localStorage
function parseSave(raw) {
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    return emptySave();
  }

  // Control de versiones: si la versión no coincide, se descarta el archivo para evitar cuelgues
  if (saved?.version !== SAVE_VERSION) {
    return emptySave();
  }

  // Valida que el progreso almacenado apunte al nivel actual y a un checkpoint válido
  const { progress, audioMuted, paintings } = saved;
  const levelId = progress?.level === 'prototipo' ? 'nivel-1' : progress?.level;
  const level = getLevel(levelId);
  return {
    progress: level.id === levelId && isCheckpointId(level, progress.checkpointId)
      ? { level: level.id, checkpointId: progress.checkpointId }
      : null,
    audioMuted: audioMuted === true,
    paintings: Array.isArray(paintings)
      ? [...new Set(paintings.filter(id => typeof id === 'string' && id !== '' && id.trim() === id))]
      : [],
  };
}

// Retorna una copia del estado en memoria en lugar de la referencia original
// para guardar el progreso y los coleccionables
function snapshot() {
  return {
    ...memorySave,
    progress: memorySave.progress && { ...memorySave.progress },
    paintings: [...memorySave.paintings],
  };
}

// Carga los datos desde el almacenamiento del navegador hacia la memoria RAM
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

// Actualiza el estado en memoria y luego sincroniza esos cambios hacia localStorage
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

// Se exportan los métodos para que el resto del juego los pueda usar

export function saveCheckpoint(levelId, checkpointId) {
  const level = getLevel(levelId);
  if (level.id !== levelId || !isCheckpointId(level, checkpointId)) {
    return loadSave();
  }

  return updateSave({ progress: { level: level.id, checkpointId } });
}

export function saveAudioMuted(muted) {
  return typeof muted === 'boolean' ? updateSave({ audioMuted: muted }) : loadSave();
}

export function rememberPainting(paintingId) {
  const save = loadSave();
  // Se valida que el id debe ser un string válido, no vacío, sin espacios extraños,
  // y no debe estar ya guardado en el arreglo de pinturas
  if (typeof paintingId !== 'string' || !paintingId || paintingId.trim() !== paintingId
    || save.paintings.includes(paintingId)) {
    return save;
  }

  // Agrega la nueva pintura al final del arreglo
  return updateSave({ paintings: [...save.paintings, paintingId] });
}
