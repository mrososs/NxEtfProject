import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCourse, Course } from '../model/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseApiService {
  private _http = inject(HttpClient);

  /**
   * Get all courses from the API
   * @param lang Language parameter (default: 'ar')
   * @returns Observable of ApiCourse array
   */
  getAllCourses(lang = 'ar'): Observable<ApiCourse[]> {
    return this._http.get<ApiCourse[]>(`Course?lang=${lang}`);
  }

  /**
   * Get a single course by ID
   * @param id Course ID
   * @param lang Language parameter (default: 'ar')
   * @returns Observable of ApiCourse
   */
  getCourseById(id: number, lang = 'ar'): Observable<ApiCourse> {
    return this._http.get<ApiCourse>(`Course/${id}?lang=${lang}`);
  }

  /**
   * Transform API course data to UI course format
   * @param apiCourse API course data
   * @returns Course object for UI display
   */
  transformApiCourseToUiCourse(apiCourse: ApiCourse): Course {
    return {
      id: apiCourse.id,
      title: apiCourse.title,
      description: apiCourse.description,
      launchUrl: apiCourse.launchUrl,
      uploadedAt: apiCourse.uploadedAt,
      // Default values for UI display
      img: 'assets/img/homePagecourse.png', // Default image
      lectures: 12, // Default lectures count
      level: 'مبتدئ', // Default level
      rating: 4.5, // Default rating
      reviews: '1.2k', // Default reviews
      instructor: {
        name: 'الأستاذ أحمد',
        avatar: 'assets/img/instructor-avatar.png',
      },
      path: apiCourse.launchUrl || '',
      buttonText: 'البدء بالمنهج',
    };
  }
}
