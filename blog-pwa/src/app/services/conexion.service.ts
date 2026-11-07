import { Injectable, signal } from '@angular/core';

/** Indica si el dispositivo tiene conexión (para mostrar el modo offline). */
@Injectable({ providedIn: 'root' })
export class ConexionService {
  readonly online = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));
  }
}
