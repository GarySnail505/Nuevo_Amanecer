export class HealthSystem {
  constructor(maxHealth, invulnerabilityMs) {
    this.maxHealth = maxHealth;
    this.current = maxHealth;
    this.invulnerabilityMs = invulnerabilityMs;
    this.invulnerableUntilMs = -Infinity;
  }

  get isDepleted() {
    return this.current === 0;
  }

  isInvulnerable(timeMs) {
    return timeMs < this.invulnerableUntilMs;
  }

  takeDamage(amount, timeMs) {
    if (this.isDepleted || this.isInvulnerable(timeMs)) {
      return false;
    }

    this.current = Math.max(0, this.current - amount);
    this.invulnerableUntilMs = timeMs + this.invulnerabilityMs;
    return true;
  }
}
