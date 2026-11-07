import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Blog, Post } from './models';

/** Consume la API REST de la app JHipster del blog. */
@Injectable({ providedIn: 'root' })
export class BlogApiService {
  private readonly http = inject(HttpClient);

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${API_URL}/posts`, { params: { sort: 'date,desc', size: 50 } });
  }

  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${API_URL}/blogs`);
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${API_URL}/posts`, post);
  }
}
