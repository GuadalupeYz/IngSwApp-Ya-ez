import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Workbox } from 'workbox-window';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

// Registro del service worker generado por Workbox (solo en el build de producción)
if (!isDevMode() && 'serviceWorker' in navigator) {
  const wb = new Workbox('sw.js');
  wb.addEventListener('activated', (event) => {
    if (!event.isUpdate) {
      console.log('Service worker de Workbox activo: la app ya funciona sin conexión');
    }
  });
  wb.register();
}
