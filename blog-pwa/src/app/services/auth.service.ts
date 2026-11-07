import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api.config';

const TOKEN_KEY = 'blog-pwa-token';

/** Login contra JHipster: POST /api/authenticate devuelve un JWT. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ id_token: string }>(`${API_URL}/authenticate`, { username, password, rememberMe: true }),
    );
    localStorage.setItem(TOKEN_KEY, res.id_token);
    this.token.set(res.id_token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }

  isLoggedIn(): boolean {
    return this.token() !== null;
  }
}
