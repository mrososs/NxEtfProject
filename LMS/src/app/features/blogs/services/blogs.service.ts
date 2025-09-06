import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { blog, BlogPost, BlogResponse } from '../model/blog.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  private _http = inject(HttpClient);

  // Get all blogs from the API
  getBlogs(): Observable<BlogPost[]> {
    return this._http
      .get<BlogResponse>(`/api/Blog/blog`)
      .pipe(map((response) => response.posts.$values));
  }

  // Get blog details by slug
  getBlogDetails(archiveSlug: string, postSlug: string): Observable<BlogPost> {
    return this._http.get<BlogPost>(
      `/api/Blog/${archiveSlug}/${postSlug}`
    );
  }

  // Legacy methods for backward compatibility
  getBlogsLegacy(): Observable<blog[]> {
    return this._http
      .get<{ blog: blog[] }>('assets/data/blog.data.json')
      .pipe(map((response) => response.blog));
  }

  getBlogDetailsLegacy(id: number): Observable<blog | undefined> {
    return this.getBlogsLegacy().pipe(
      map((blog) => blog.find((blo) => blo.id === id))
    );
  }
}
