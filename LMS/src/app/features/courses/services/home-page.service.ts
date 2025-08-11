import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  map,
  Observable,
  switchMap,
  BehaviorSubject,
  combineLatest,
  shareReplay,
  startWith,
  distinctUntilChanged,
  catchError,
  throwError,
} from 'rxjs';
import { types } from '../model/types.model';
import { Course, ApiCourse, CourseFilter } from '../model/course.model';
import {
  Instructor,
  ApiInstructor,
  ApiInstructorResponse,
  InstructorQueryParams,
} from '../model/instructor.model';
import { CourseApiService } from './course-api.service';
import { InstructorApiService } from './instructor-api.service';
import { HttpHeaders } from '@angular/common/http';

export interface CourseDetails {
  id: number;
  intro: string;
  introAr: string;
  whatYouWillLearn: string;
  whatYouWillLearnAr: string;
  whyChoose: string;
  whyChooseAr: string;
  suitableFor: string;
  suitableForAr: string;
  faq: CourseFAQ[];
  courseId: number;
  course: string;
}

export interface CourseFAQ {
  id: number;
  question: string;
  body: string;
  courseDetailsId: number;
  courseDetails: string;
}

export interface ReviewRequest {
  courseId: number;
  comment: string;
  reviewRating: number;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class HomePageService {
  private _http = inject(HttpClient);
  private _courseApiService = inject(CourseApiService);
  private _instructorApiService = inject(InstructorApiService);

  // BehaviorSubject to track current filters
  private _currentFilters = new BehaviorSubject<CourseFilter>({});
  public currentFilters$ = this._currentFilters.asObservable();

  // Separate observables for different course types
  private _allCourses$ = this._courseApiService.getAllCourses('ar').pipe(
    map((response: any) => {
      console.log('All courses API response structure:', response);
      let apiCourses: ApiCourse[];
      if (Array.isArray(response)) {
        apiCourses = response;
      } else if (response && Array.isArray(response.data)) {
        apiCourses = response.data;
      } else if (response && Array.isArray(response.courses)) {
        apiCourses = response.courses;
      } else {
        console.warn(
          'Unknown API response structure for all courses:',
          response
        );
        apiCourses = [];
      }
      return apiCourses.map((apiCourse) =>
        this._courseApiService.transformApiCourseToUiCourse(apiCourse)
      );
    }),
    shareReplay(1) // Cache the result and share it
  );

  private _filteredCourses$ = this.currentFilters$.pipe(
    startWith({}),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
    ),
    switchMap((filters) => this.getFilteredCoursesFromApi('ar', filters)),
    shareReplay(1) // Cache the result and share it
  );

  getTypes(): Observable<types[]> {
    return this._http.get<types[]>('../../../../assets/data/types.data.json');
  }

  // Get all courses (cached)
  getAllCourses(): Observable<Course[]> {
    return this._allCourses$;
  }

  // Get filtered courses (cached)
  getFilteredCourses(): Observable<Course[]> {
    return this._filteredCourses$;
  }

  // Get courses from API only
  getCoursesFromApi(lang = 'ar'): Observable<Course[]> {
    return this._courseApiService.getAllCourses(lang).pipe(
      map((response: any) => {
        // Log the response structure for debugging
        console.log('Courses API response structure:', response);

        // Handle different API response structures
        let apiCourses: ApiCourse[];

        if (Array.isArray(response)) {
          // Direct array response
          apiCourses = response;
        } else if (response && Array.isArray(response.data)) {
          // Response with data property
          apiCourses = response.data;
        } else if (response && Array.isArray(response.courses)) {
          // Response with courses property
          apiCourses = response.courses;
        } else {
          // Fallback to empty array if structure is unknown
          console.warn('Unknown API response structure for courses:', response);
          apiCourses = [];
        }

        return apiCourses.map((apiCourse) =>
          this._courseApiService.transformApiCourseToUiCourse(apiCourse)
        );
      })
    );
  }

  // Get filtered courses from API
  getFilteredCoursesFromApi(
    lang = 'ar',
    filter?: CourseFilter
  ): Observable<Course[]> {
    return this._courseApiService.getAllCourses(lang, filter).pipe(
      map((response: any) => {
        console.log('Filtered courses API response structure:', response);

        // Handle different API response structures
        let apiCourses: ApiCourse[];

        if (Array.isArray(response)) {
          apiCourses = response;
        } else if (response && Array.isArray(response.data)) {
          apiCourses = response.data;
        } else if (response && Array.isArray(response.courses)) {
          apiCourses = response.courses;
        } else {
          console.warn(
            'Unknown API response structure for filtered courses:',
            response
          );
          apiCourses = [];
        }

        return apiCourses.map((apiCourse) =>
          this._courseApiService.transformApiCourseToUiCourse(apiCourse)
        );
      })
    );
  }

  // Update current filters
  updateFilters(filters: Partial<CourseFilter>): void {
    const currentFilters = this._currentFilters.value;
    const newFilters = { ...currentFilters, ...filters };
    console.log('Updating filters:', { currentFilters, newFilters });
    this._currentFilters.next(newFilters);
  }

  // Search courses by text
  searchCourses(searchTerm: string, lang = 'ar'): Observable<Course[]> {
    const filter: CourseFilter = { search: searchTerm };
    return this.getFilteredCoursesFromApi(lang, filter);
  }

  // Filter courses by category
  filterCoursesByCategory(
    categories: string[],
    lang = 'ar'
  ): Observable<Course[]> {
    const filter: CourseFilter = { category: categories };
    return this.getFilteredCoursesFromApi(lang, filter);
  }

  // Filter courses by level
  filterCoursesByLevel(levels: string[], lang = 'ar'): Observable<Course[]> {
    const filter: CourseFilter = { level: levels };
    return this.getFilteredCoursesFromApi(lang, filter);
  }

  // Filter courses by instructor
  filterCoursesByInstructor(
    instructors: string[],
    lang = 'ar'
  ): Observable<Course[]> {
    const filter: CourseFilter = { instructor: instructors };
    return this.getFilteredCoursesFromApi(lang, filter);
  }

  // Get a single course by ID from API
  getCourseByIdFromApi(id: number, lang = 'ar'): Observable<Course> {
    return this._courseApiService
      .getCourseById(id, lang)
      .pipe(
        map((apiCourse: ApiCourse) =>
          this._courseApiService.transformApiCourseToUiCourse(apiCourse)
        )
      );
  }

  /**
   * Get course details from API
   * @param courseId The course ID
   * @returns Observable of course details
   */
  getCourseDetails(courseId: number): Observable<CourseDetails> {
    const url = `http://etfapi.itechpro-eg.com/api/Course/${courseId}/details`;
    return this._http.get<CourseDetails>(url).pipe(
      catchError((error) => {
        console.error('Error fetching course details:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Post a review for a course
   * @param reviewData The review data to post
   * @returns Observable of review response
   */
  postCourseReview(reviewData: ReviewRequest): Observable<ReviewResponse> {
    const url = 'http://etfapi.itechpro-eg.com/api/Course/review';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this._http.post<ReviewResponse>(url, reviewData, { headers }).pipe(
      catchError((error) => {
        console.error('Error posting review:', error);
        return throwError(() => error);
      })
    );
  }

  // Get instructors from API with pagination and filtering
  getInstructorsFromApi(
    params: InstructorQueryParams = {}
  ): Observable<Instructor[]> {
    return this._instructorApiService.getAllInstructors(params).pipe(
      map((apiResponse: ApiInstructorResponse) => {
        try {
          return this._instructorApiService.transformApiInstructorResponseToUiInstructors(
            apiResponse
          );
        } catch (error) {
          console.error('Error transforming instructor data:', error);
          return [];
        }
      })
    );
  }

  // Get first 3 top-rated instructors for course-instructor component
  getTopInstructors(): Observable<Instructor[]> {
    return this.getInstructorsFromApi({
      page: 1,
      pageSize: 3,
      sortBy: 'Id', // Use 'Id' as shown in Swagger documentation
      sortDir: 'desc',
    });
  }

  // Get a single instructor by ID from API
  getInstructorByIdFromApi(id: number): Observable<Instructor> {
    return this._instructorApiService
      .getInstructorById(id)
      .pipe(
        map((apiInstructor: ApiInstructor) =>
          this._instructorApiService.transformApiInstructorToUiInstructor(
            apiInstructor
          )
        )
      );
  }

  // Get instructor details (kept for backward compatibility)
  getInstructorDetails(id: number): Observable<Instructor | undefined> {
    return this.getInstructorsFromApi().pipe(
      map((instructors) => instructors.find((inst) => inst.id === id))
    );
  }

  // Debug method to test API endpoints
  debugApiEndpoints(): void {
    console.log('=== API Debugging ===');

    // Test courses API
    this._courseApiService.getAllCourses('ar').subscribe({
      next: (courses) => {
        console.log('✅ Courses API working:', courses);
      },
      error: (error) => {
        console.error('❌ Courses API error:', error);
      },
    });

    // Test instructors API
    this._instructorApiService
      .getAllInstructors({
        page: 1,
        pageSize: 3,
        sortBy: 'Id',
        sortDir: 'desc',
      })
      .subscribe({
        next: (instructors) => {
          console.log('✅ Instructors API working:', instructors);
        },
        error: (error) => {
          console.error('❌ Instructors API error:', error);
        },
      });
  }

  // Get courses from local JSON file (kept for backward compatibility)
  getCourses(): Observable<Course[]> {
    return this._http
      .get<{ courses: Course[] }>('../../../../assets/data/courses.data.json')
      .pipe(
        map((response) => response.courses) // Extract the courses array
      );
  }

  // Get courses from both API and local data (combined) - kept for backward compatibility
  getAllCoursesCombined(lang = 'ar'): Observable<Course[]> {
    return this.getCoursesFromApi(lang).pipe(
      switchMap((apiCourses) =>
        this.getCourses().pipe(
          map((localCourses) => [...apiCourses, ...localCourses])
        )
      )
    );
  }

  // Get instructors from local JSON file (kept for backward compatibility)
  getInstructors(): Observable<Instructor[]> {
    return this._http
      .get<{ instructors: Instructor[] }>(
        '../../../../assets/data/instructor.data.json'
      )
      .pipe(
        map((response) => response.instructors) // Extract the instructors array
      );
  }
}
