import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'posts' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage) },
  { path: 'posts', canActivate: [authGuard], loadComponent: () => import('./pages/posts/posts.page').then((m) => m.PostsPage) },
  {
    path: 'nuevo-post',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/nuevo-post/nuevo-post.page').then((m) => m.NuevoPostPage),
  },
  { path: '**', redirectTo: 'posts' },
];
