import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiCourse,
  Course,
  CourseFilter,
  CourseDetails,
  FAQ,
} from '../model/course.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CourseApiService {
  private _http = inject(HttpClient);

  /**
   * Get all courses from the API with optional filtering
   * @param lang Language parameter (default: 'ar')
   * @param filter Optional filter object
   * @returns Observable of ApiCourse array
   */
  getAllCourses(lang = 'ar', filter?: CourseFilter): Observable<ApiCourse[]> {
    let httpParams = new HttpParams();

    // Add language parameter
    httpParams = httpParams.set('lang', lang);

    // Add filter parameter as JSON object
    if (filter) {
      const filterObj: any = {};

      // Text search
      if (filter.search) {
        filterObj.search = filter.search;
      }

      // Category filter
      if (filter.category && filter.category.length > 0) {
        filterObj.category = filter.category;
      }

      // Level filter
      if (filter.level && filter.level.length > 0) {
        filterObj.level = filter.level;
      }

      // Instructor filter
      if (filter.instructor && filter.instructor.length > 0) {
        filterObj.instructor = filter.instructor;
      }

      // Price filter
      if (filter.price) {
        if (filter.price.min !== undefined) {
          filterObj.priceMin = filter.price.min;
        }
        if (filter.price.max !== undefined) {
          filterObj.priceMax = filter.price.max;
        }
      }

      // Rating filter
      if (filter.rating !== undefined) {
        filterObj.rating = filter.rating;
      }

      // Duration filter
      if (filter.duration) {
        if (filter.duration.min !== undefined) {
          filterObj.durationMin = filter.duration.min;
        }
        if (filter.duration.max !== undefined) {
          filterObj.durationMax = filter.duration.max;
        }
      }

      // Language filter
      if (filter.language) {
        filterObj.language = filter.language;
      }

      // Free courses filter
      if (filter.isFree !== undefined) {
        filterObj.isFree = filter.isFree;
      }

      // Featured courses filter
      if (filter.isFeatured !== undefined) {
        filterObj.isFeatured = filter.isFeatured;
      }

      // Only add filter parameter if there are actual filters
      if (Object.keys(filterObj).length > 0) {
        const filterString = JSON.stringify(filterObj);
        httpParams = httpParams.set('filter', filterString);
        console.log('Sending filter object to API:', filterString);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    console.log('Course API request params:', httpParams.toString());
    console.log('Full URL will be:', `api/Course?${httpParams.toString()}`);

    return this._http
      .get<any>(`api/Course`, {
        headers,
        params: httpParams,
      })
      .pipe(
        map((response: any) => {
          console.log('Raw courses API response:', response);

          // Handle different API response structures
          if (Array.isArray(response)) {
            return response;
          } else if (response && Array.isArray(response.data)) {
            return response.data;
          } else if (response && Array.isArray(response.courses)) {
            return response.courses;
          } else {
            console.warn(
              'Unknown API response structure for courses:',
              response
            );
            return [];
          }
        })
      );
  }

  /**
   * Get a single course by ID
   * @param id Course ID
   * @param lang Language parameter (default: 'ar')
   * @returns Observable of ApiCourse
   */
  getCourseById(id: number, lang = 'ar'): Observable<ApiCourse> {
    return this._http.get<ApiCourse>(`api/Course/${id}?lang=${lang}`);
  }

  /**
   * Transform API course data to UI course format
   * @param apiCourse API course data
   * @returns Course object for UI display
   */
  transformApiCourseToUiCourse(apiCourse: ApiCourse): Course {
    return {
      // API properties
      id: apiCourse.id,
      title: apiCourse.title,
      description: apiCourse.description,
      launchUrl: apiCourse.launchUrl,
      uploadedAt: apiCourse.uploadedAt,
      reviews: apiCourse.reviews || [], // Use reviews from API or empty array
      trainerName: apiCourse.trainerName || null, // Use trainer name from API
      courseLevel: apiCourse.courseLevel || '', // Use course level from API
      categories: apiCourse.categories || [], // Use categories from API
      tags: apiCourse.tags || [], // Use tags from API
      faQs: apiCourse.faQs || [], // Use FAQs from API
      courseDetails: apiCourse.courseDetails || {
        // Default course details if not provided
        id: 0,
        intro: '',
        whatYouWillLearn: '',
        whyChoose: '',
        suitableFor: '',
      },

      // UI properties for display
      img: 'assets/img/homePagecourse.png', // Default image
      lectures: 12, // Default lectures count
      level: 'مبتدئ', // Default level
      rating: 4.5, // Default rating
      instructor: {
        name: 'الأستاذ أحمد',
        avatar: 'assets/img/instructor-avatar.png',
      },
      path: apiCourse.launchUrl || '',
      buttonText: 'البدء بالمنهج',
    };
  }
}
