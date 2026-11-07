import { DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonRefresher, IonRefresherContent, IonSpinner,
  IonTitle, IonToolbar, RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, cloudOfflineOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { BlogApiService } from '../../services/blog-api.service';
import { ConexionService } from '../../services/conexion.service';
import { Post } from '../../services/models';

@Component({
  selector: 'app-posts',
  imports: [
    DatePipe, SlicePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent,
    IonRefresher, IonRefresherContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonFab, IonFabButton, IonSpinner, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Posts</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="salir()" aria-label="Cerrar sesión"><ion-icon slot="icon-only" name="log-out-outline" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
      @if (!conexion.online()) {
        <ion-toolbar color="warning">
          <ion-title size="small"><ion-icon name="cloud-offline-outline" /> Sin conexión: mostrando datos guardados</ion-title>
        </ion-toolbar>
      }
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)"><ion-refresher-content /></ion-refresher>

      @if (cargando()) {
        <div class="ion-text-center ion-padding"><ion-spinner /></div>
      } @else if (error()) {
        <p class="ion-padding">{{ error() }}</p>
      } @else if (posts().length === 0) {
        <p class="ion-padding">Todavía no hay posts. Creá el primero con el botón +.</p>
      }

      @for (post of posts(); track post.id) {
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ post.title }}</ion-card-title>
            <ion-card-subtitle>
              {{ post.date | date: 'dd/MM/yyyy HH:mm' }}
              @if (post.blog) { <ion-badge color="medium" class="ion-margin-start">{{ post.blog.name }}</ion-badge> }
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>{{ post.content | slice: 0 : 200 }}</ion-card-content>
        </ion-card>
      }

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button routerLink="/nuevo-post" [disabled]="!conexion.online()" aria-label="Nuevo post">
          <ion-icon name="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class PostsPage {
  private readonly api = inject(BlogApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly conexion = inject(ConexionService);
  readonly posts = signal<Post[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    addIcons({ add, cloudOfflineOutline, logOutOutline });
  }

  ionViewWillEnter() {
    this.cargar();
  }

  cargar(fin?: () => void) {
    this.error.set('');
    this.api
      .getPosts()
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          fin?.();
        }),
      )
      .subscribe({
        next: (posts) => this.posts.set(posts),
        error: (e) => {
          if (e?.status === 401) {
            this.salir();
          } else {
            this.error.set('No se pudieron cargar los posts (¿está levantada la app JHipster?).');
          }
        },
      });
  }

  refrescar(event: RefresherCustomEvent) {
    this.cargar(() => event.target.complete());
  }

  salir() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
