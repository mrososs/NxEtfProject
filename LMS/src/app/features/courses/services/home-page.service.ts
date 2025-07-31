import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { types } from '../model/types.model';
import { Course, ApiCourse } from '../model/course.model';
import {
  Instructor,
  ApiInstructor,
  ApiInstructorResponse,
  InstructorQueryParams,
} from '../model/instructor.model';
import { CourseApiService } from './course-api.service';
import { InstructorApiService } from './instructor-api.service';

@Injectable({
  providedIn: 'root',
})
export class HomePageService {
  private _http = inject(HttpClient);
  private _courseApiService = inject(CourseApiService);
  private _instructorApiService = inject(InstructorApiService);

  getTypes(): Observable<types[]> {
    return this._http.get<types[]>('../../../../assets/data/types.data.json');
  }

  // Get courses from API only
  getCoursesFromApi(lang = 'ar'): Observable<Course[]> {
    return this._courseApiService
      .getAllCourses(lang)
      .pipe(
        map((apiCourses: ApiCourse[]) =>
          apiCourses.map((apiCourse) =>
            this._courseApiService.transformApiCourseToUiCourse(apiCourse)
          )
        )
      );
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

  // Get instructors from API with pagination and filtering
  getInstructorsFromApi(
    params: InstructorQueryParams = {}
  ): Observable<Instructor[]> {
    return this._instructorApiService
      .getAllInstructors(params)
      .pipe(
        map((apiResponse: ApiInstructorResponse) =>
          this._instructorApiService.transformApiInstructorResponseToUiInstructors(
            apiResponse
          )
        )
      );
  }

  // Get first 3 top-rated instructors for course-instructor component
  getTopInstructors(): Observable<Instructor[]> {
    return this.getInstructorsFromApi({
      page: 1,
      pageSize: 3,
      sortBy: 'StarRanking',
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

  // Get courses from local JSON file (kept for backward compatibility)
  getCourses(): Observable<Course[]> {
    return this._http
      .get<{ courses: Course[] }>('../../../../assets/data/courses.data.json')
      .pipe(
        map((response) => response.courses) // Extract the courses array
      );
  }

  // Get courses from both API and local data (combined) - kept for backward compatibility
  getAllCourses(lang = 'ar'): Observable<Course[]> {
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
