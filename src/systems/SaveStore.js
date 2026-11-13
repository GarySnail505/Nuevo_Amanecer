const STORAGE_KEY = 'un-nuevo-amanecer:save:v1';
const SAVE_VERSION = 1;
const LEVEL_ID = 'prototipo';

// Object.freeze bloquea el objeto para que no se le puedan añadir, eliminar o modificar propiedades
export const CHECKPOINTS = Object.freeze({
  entrada: Object.freeze({ x: 96, y: 282 }),
  recarga: Object.freeze({ x: 350, y: 297 }),
});

export const DEFAULT_CHECKPOINT = 'entrada';

// Retorna la estructura base de un archivo de guardado limpio
function emptySave() {
  return { progress: null, audioMuted: false, paintings: [] };
}

let memorySave = emptySave();
let storageUnavailable = false;

// Valida que el ID solicitado realmente exista en nuestro diccionario de CHECKPOINTS
function isCheckpointId(checkpointId) {
  return typeof checkpointId === 'string' && Object.hasOwn(CHECKPOINTS, checkpointId);
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

export function saveCheckpoint(checkpointId) {
  if (!isCheckpointId(checkpointId)) {
    return loadSave();
  }

  return updateSave({ progress: { level: LEVEL_ID, checkpointId } });
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