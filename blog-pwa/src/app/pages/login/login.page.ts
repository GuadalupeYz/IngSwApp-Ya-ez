import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonNote, IonTitle, IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput, IonButton, IonNote],
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>Blog UM</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2>Iniciar sesión</h2>
      <p>Usá un usuario de la app JHipster (por ejemplo <b>admin</b> / <b>admin</b>).</p>
      <form (ngSubmit)="ingresar()">
        <ion-list>
          <ion-item>
            <ion-input label="Usuario" labelPlacement="floating" name="usuario" [(ngModel)]="usuario" required />
          </ion-item>
          <ion-item>
            <ion-input label="Contraseña" labelPlacement="floating" type="password" name="clave" [(ngModel)]="clave" required />
          </ion-item>
        </ion-list>
        @if (error()) {
          <ion-note color="danger">{{ error() }}</ion-note>
        }
        <ion-button expand="block" type="submit" class="ion-margin-top" [disabled]="cargando()">Ingresar</ion-button>
      </form>
    </ion-content>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  usuario = '';
  clave = '';
  readonly error = signal('');
  readonly cargando = signal(false);

  async ingresar() {
    this.error.set('');
    this.cargando.set(true);
    try {
      await this.auth.login(this.usuario, this.clave);
      await this.router.navigateByUrl('/posts');
    } catch (e: any) {
      this.error.set(e?.status === 401 ? 'Usuario o contraseña incorrectos' : 'No se pudo conectar con la API');
    } finally {
      this.cargando.set(false);
    }
  }
}
