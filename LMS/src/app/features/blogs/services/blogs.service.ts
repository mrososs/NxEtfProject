import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { blog } from '../model/blog.model';

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  private _http = inject(HttpClient);
  getBlogs(): Observable<blog[]> {
    return this._http
      .get<{ blog: blog[] }>('assets/data/blog.data.json')
      .pipe(map((response) => response.blog));
  }
  getBlogDetails(id: number): Observable<blog | undefined> {
    return this.getBlogs().pipe(
      map((blog) => blog.find((blo) => blo.id === id))
    );
  }
}
