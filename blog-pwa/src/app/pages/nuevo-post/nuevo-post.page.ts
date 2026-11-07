import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonNote,
  IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/angular';
import { BlogApiService } from '../../services/blog-api.service';
import { Blog } from '../../services/models';

@Component({
  selector: 'app-nuevo-post',
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonList, IonItem,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/posts" text="Volver" /></ion-buttons>
        <ion-title>Nuevo post</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form (ngSubmit)="guardar()">
        <ion-list>
          <ion-item>
            <ion-input label="Título" labelPlacement="floating" name="titulo" [(ngModel)]="titulo" required />
          </ion-item>
          <ion-item>
            <ion-textarea label="Contenido" labelPlacement="floating" name="contenido" [(ngModel)]="contenido" [autoGrow]="true" required />
          </ion-item>
          <ion-item>
            <ion-select label="Blog" name="blog" [(ngModel)]="blogId" placeholder="Elegí un blog">
              @for (blog of blogs(); track blog.id) {
                <ion-select-option [value]="blog.id">{{ blog.name }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
        </ion-list>
        @if (error()) {
          <ion-note color="danger">{{ error() }}</ion-note>
        }
        <ion-button expand="block" type="submit" class="ion-margin-top" [disabled]="!titulo || !contenido || guardando()">
          Publicar
        </ion-button>
      </form>
    </ion-content>
  `,
})
export class NuevoPostPage {
  private readonly api = inject(BlogApiService);
  private readonly router = inject(Router);
  readonly blogs = signal<Blog[]>([]);
  readonly error = signal('');
  readonly guardando = signal(false);
  titulo = '';
  contenido = '';
  blogId: number | null = null;

  constructor() {
    this.api.getBlogs().subscribe((blogs) => this.blogs.set(blogs));
  }

  guardar() {
    this.guardando.set(true);
    this.error.set('');
    this.api
      .createPost({
        title: this.titulo,
        content: this.contenido,
        date: new Date().toISOString(),
        blog: this.blogId ? { id: this.blogId, name: '' } : null,
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/posts'),
        error: () => {
          this.error.set('No se pudo publicar el post.');
          this.guardando.set(false);
        },
      });
  }
}
