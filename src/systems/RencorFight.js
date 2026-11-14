const WAIT_MS = 550;
const TELEGRAPH_MS = 760;
const STRIKE_MS = 240;
const EXPOSED_MS = 2100;
const LIGHT_REQUIRED_MS = 2700;
const STRIKE_HALF_WIDTH = 49;

export class RencorFight {
  constructor() {
    this.phase = 'waiting';
    this.remainingMs = WAIT_MS;
    this.strikeX = null;
    this.strikeHalfWidth = STRIKE_HALF_WIDTH;
    this.completedStrikes = 0;
    this.lightExposureMs = 0;
  }

  get lightRatio() {
    return this.lightExposureMs / LIGHT_REQUIRED_MS;
  }

  get isOpen() {
    return this.phase === 'opening';
  }

  update(deltaMs, { playerX, hitsWeakPoint, onStrike }) {
    // Consume cada porción del fotograma en la fase a la que pertenece.
    let elapsed = deltaMs;
    while (elapsed > 0 && !this.isOpen) {
      const step = Math.min(elapsed, this.remainingMs);
      if (this.phase === 'exposed' && hitsWeakPoint) {
        this.lightExposureMs = Math.min(LIGHT_REQUIRED_MS, this.lightExposureMs + step);
        if (this.lightExposureMs === LIGHT_REQUIRED_MS) {
          this.phase = 'opening';
          this.remainingMs = 0;
          return;
        }
      }

      this.remainingMs -= step;
      elapsed -= step;
      if (this.remainingMs === 0) {
        this.advancePhase(playerX, onStrike);
      }
    }
  }

  advancePhase(playerX, onStrike) {
    switch (this.phase) {
      case 'waiting':
        this.phase = 'telegraph';
        this.remainingMs = TELEGRAPH_MS;
        this.strikeX = playerX;
        break;
      case 'telegraph':
        this.phase = 'strike';
        this.remainingMs = STRIKE_MS;
        this.completedStrikes += 1;
        onStrike?.(this.strikeX, this.strikeHalfWidth);
        break;
      case 'strike':
        // El primer golpe da tiempo para reconocer la señal y esquivar.
        this.phase = this.completedStrikes === 1 ? 'waiting' : 'exposed';
        this.remainingMs = this.phase === 'waiting' ? WAIT_MS : EXPOSED_MS;
        break;
      case 'exposed':
        this.phase = 'waiting';
        this.remainingMs = WAIT_MS;
        break;
    }
  }
}
