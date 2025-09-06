import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category } from '../model/category.model';
import { CategoryNamesService } from './category-names.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _http = inject(HttpClient);
  private _categoryNamesService = inject(CategoryNamesService);

  // Get all categories from the API
  getCategories(): Observable<Category[]> {
    return this._http.get<Category[]>('/api/Course/categories');
  }

  // Get courses by category ID
  getCoursesByCategory(categoryId: number): Observable<Category[]> {
    return this._http
      .get<Category[]>(`/api/Course/categories`)
      .pipe(
        map((categories) =>
          categories.filter((cat) => cat.categoryId === categoryId)
        )
      );
  }

  // Get unique category IDs
  getUniqueCategoryIds(): Observable<number[]> {
    return this.getCategories().pipe(
      map((categories) => {
        const uniqueIds = [...new Set(categories.map((cat) => cat.categoryId))];
        return uniqueIds.sort((a, b) => a - b);
      })
    );
  }

  // Get category names from API
  getCategoryNames(): Observable<{ [key: number]: string }> {
    // Get from dedicated categories API
    return this._categoryNamesService.getCategoryNames();
  }

  // Get courses count by category from the courses API
  getCoursesCountByCategory(): Observable<{ [key: number]: number }> {
    return this.getCategories().pipe(
      map((courses) => {
        // Count courses by categoryId
        const categoryCounts: { [key: number]: number } = {};

        courses.forEach((course) => {
          if (course.categoryId) {
            categoryCounts[course.categoryId] =
              (categoryCounts[course.categoryId] || 0) + 1;
          }
        });

        console.log('Courses count by category:', categoryCounts);
        return categoryCounts;
      })
    );
  }
}
