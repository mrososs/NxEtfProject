import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { Category } from '../model/category.model';

export interface CategoryName {
  id: number;
  name: string;
  nameAr: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryNamesService {
  private _http = inject(HttpClient);

  // Get category names from API
  getCategoryNames(): Observable<{ [key: number]: string }> {
    // Get from the dedicated categories endpoint
    return this._http.get<CategoryName[]>('/api/Categories').pipe(
      map((categories) => {
        const categoryNames: { [key: number]: string } = {};
        categories.forEach((cat) => {
          // Use Arabic name if available, otherwise use English name
          categoryNames[cat.id] = cat.nameAr || cat.name;
        });
        return categoryNames;
      }),
      catchError((error) => {
        console.error(
          'Error loading category names from /api/Categories:',
          error
        );
        // Fallback: return empty object to use generic names
        return of({});
      })
    );
  }

  // Alternative: Get category names from the existing course categories endpoint
  getCategoryNamesFromCourses(): Observable<{ [key: number]: string }> {
    return this._http.get<Category[]>('/api/Course/categories').pipe(
      map((courses) => {
        // Extract unique categoryIds and their corresponding category names
        const categoryMap = new Map<number, string>();

        courses.forEach((course) => {
          if (course.categoryId && !categoryMap.has(course.categoryId)) {
            // Use the category name from API if available, otherwise use categoryId
            if (course.category && course.category.trim() !== '') {
              categoryMap.set(course.categoryId, course.category);
            } else {
              // If category is null or empty, use generic name based on categoryId
              categoryMap.set(course.categoryId, `فئة ${course.categoryId}`);
            }
          }
        });

        // Convert Map to object
        const categoryNames: { [key: number]: string } = {};
        categoryMap.forEach((name, id) => {
          categoryNames[id] = name;
        });

        return categoryNames;
      }),
      catchError((error) => {
        console.error('Error getting category names from courses:', error);
        return of({});
      })
    );
  }
}
