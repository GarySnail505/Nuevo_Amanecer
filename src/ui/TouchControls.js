export class TouchControls {
  constructor(scene, { onFlashlight, onPause }) {
    this.enabled = false;
    this.jumpQueued = false;
    this.pressedPointers = new Map();

    const touchAvailable = navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer: coarse)').matches;
    if (!touchAvailable || !scene.scale.parent) {
      return;
    }

    this.scene = scene;
    this.gameElement = scene.scale.parent;
    this.abortController = new AbortController();
    this.container = document.createElement('div');
    this.container.className = 'touch-controls';
    this.container.setAttribute('role', 'group');
    this.container.setAttribute('aria-label', 'Controles táctiles');

    const directions = this.addGroup();
    this.addButton(directions, '←', 'Mover a la izquierda', { direction: 'left' });
    this.addButton(directions, '→', 'Mover a la derecha', { direction: 'right' });

    const actions = this.addGroup();
    this.addButton(actions, 'Salto', 'Saltar', { onPress: () => { this.jumpQueued = true; } });
    this.addButton(actions, 'Luz', 'Activar o apagar linterna', { onTap: onFlashlight });
    this.addButton(actions, 'Pausa', 'Pausar', { onTap: onPause });

    const options = { signal: this.abortController.signal };
    window.addEventListener('blur', () => this.clearInput(), options);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.clearInput();
      }
    }, options);

    this.gameElement.after(this.container);
    this.gameElement.classList.add('game-with-touch-controls');
    scene.scale.getParentBounds();
    scene.scale.refresh();
    this.setEnabled(true);

    scene.events.once('shutdown', this.destroy, this);
    scene.events.once('destroy', this.destroy, this);
  }

  get leftDown() {
    return this.isDirectionHeld('left');
  }

  get rightDown() {
    return this.isDirectionHeld('right');
  }

  consumeJump() {
    const jumpQueued = this.jumpQueued;
    this.jumpQueued = false;
    return jumpQueued;
  }

  setEnabled(enabled) {
    if (!this.container || enabled === this.enabled) {
      return;
    }

    this.enabled = enabled;
    this.container.hidden = !enabled;
    this.clearInput();
  }

  destroy() {
    if (!this.container) {
      return;
    }

    this.setEnabled(false);
    this.abortController.abort();
    this.container.remove();
    this.container = null;
    this.gameElement.classList.remove('game-with-touch-controls');
    this.scene.events.off('shutdown', this.destroy, this);
    this.scene.events.off('destroy', this.destroy, this);
    this.scene.scale.getParentBounds();
    this.scene.scale.refresh();
  }

  addGroup() {
    const group = document.createElement('div');
    group.className = 'touch-controls-group';
    this.container.append(group);
    return group;
  }

  addButton(group, text, label, { direction, onPress, onTap }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    group.append(button);

    const options = { signal: this.abortController.signal };
    button.addEventListener('pointerdown', event => {
      if (!this.enabled || event.button !== 0) {
        return;
      }

      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      this.pressedPointers.set(event.pointerId, { button, direction });
      onPress?.();
    }, options);

    button.addEventListener('pointerup', event => {
      const pointer = this.pressedPointers.get(event.pointerId);
      this.pressedPointers.delete(event.pointerId);
      if (pointer?.button !== button || !this.enabled || !onTap) {
        return;
      }

      const { left, right, top, bottom } = button.getBoundingClientRect();
      if (event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom) {
        onTap();
      }
    }, options);

    const release = event => this.pressedPointers.delete(event.pointerId);
    button.addEventListener('pointercancel', release, options);
    button.addEventListener('lostpointercapture', release, options);
    button.addEventListener('click', event => {
      // Las activaciones por teclado o asistencia no tienen una secuencia de puntero.
      if (event.detail === 0 && this.enabled) {
        (onPress ?? onTap)?.();
      }
    }, options);
  }

  isDirectionHeld(direction) {
    for (const pointer of this.pressedPointers.values()) {
      if (pointer.direction === direction) {
        return true;
      }
    }

    return false;
  }

  clearInput() {
    this.jumpQueued = false;
    for (const [pointerId, { button }] of this.pressedPointers) {
      if (button.hasPointerCapture(pointerId)) {
        button.releasePointerCapture(pointerId);
      }
    }
    this.pressedPointers.clear();
  }
}
