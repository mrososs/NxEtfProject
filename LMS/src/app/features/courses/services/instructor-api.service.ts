import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiInstructor,
  ApiInstructorResponse,
  Instructor,
  InstructorQueryParams,
} from '../model/instructor.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InstructorApiService {
  private _http = inject(HttpClient);

  /**
   * Get all instructors with pagination and filtering
   * @param params Query parameters for pagination and filtering
   * @returns Observable of ApiInstructorResponse
   */
  getAllInstructors(
    params: InstructorQueryParams = {}
  ): Observable<ApiInstructorResponse> {
    let httpParams = new HttpParams();

    // Add query parameters
    if (params.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.mainSkill)
      httpParams = httpParams.set('mainSkill', params.mainSkill);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    console.log('Instructors API request params:', httpParams.toString());

    return this._http
      .get<any>('Trainer', {
        params: httpParams,
        headers,
      })
      .pipe(
        map((response: any) => {
          // Log the response structure for debugging
          console.log('Instructors API response structure:', response);
          console.log('Query parameters used:', httpParams.toString());

          // Handle different API response structures
          let apiResponse: ApiInstructorResponse;

          if (response && Array.isArray(response)) {
            // Direct array response
            apiResponse = {
              data: response,
              count: response.length,
              pageNumber: 1,
              pageSize: response.length,
              totalPages: 1,
            };
          } else if (response && Array.isArray(response.data)) {
            // Standard paginated response
            apiResponse = {
              data: response.data,
              count: response.count || response.data.length,
              pageNumber: response.pageNumber || 1,
              pageSize: response.pageSize || response.data.length,
              totalPages: response.totalPages || 1,
            };
          } else if (response && Array.isArray(response.instructors)) {
            // Response with instructors property
            apiResponse = {
              data: response.instructors,
              count: response.count || response.instructors.length,
              pageNumber: response.pageNumber || 1,
              pageSize: response.pageSize || response.instructors.length,
              totalPages: response.totalPages || 1,
            };
          } else {
            // Fallback to empty response
            console.warn(
              'Unknown API response structure for instructors:',
              response
            );
            apiResponse = {
              data: [],
              count: 0,
              pageNumber: 1,
              pageSize: 10,
              totalPages: 0,
            };
          }

          return apiResponse;
        })
      );
  }

  /**
   * Get a single instructor by ID
   * @param id Instructor ID
   * @returns Observable of ApiInstructor
   */
  getInstructorById(id: number): Observable<ApiInstructor> {
    return this._http.get<ApiInstructor>(`Trainer/${id}`);
  }

  /**
   * Transform API instructor data to UI instructor format
   * @param apiInstructor API instructor data
   * @returns Instructor object for UI display
   */
  transformApiInstructorToUiInstructor(
    apiInstructor: ApiInstructor
  ): Instructor {
    return {
      id: apiInstructor.id,
      name: apiInstructor.name,
      title: apiInstructor.title,
      mainSkill: apiInstructor.mainSkill,
      numberOfCourses: apiInstructor.numberOfCourses,
      numberOfStudents: apiInstructor.numberOfStudents,
      starRanking: apiInstructor.starRanking || 0, // Default to 0 if missing
      about: apiInstructor.about,
      channels: apiInstructor.channels,
      // UI-specific defaults
      avatar: 'assets/img/instructor-avatar.png',
      isFeatured: (apiInstructor.starRanking || 0) >= 4.5,
    };
  }

  /**
   * Transform API instructor response to UI instructor array
   * @param apiResponse API instructor response
   * @returns Array of Instructor objects for UI display
   */
  transformApiInstructorResponseToUiInstructors(
    apiResponse: ApiInstructorResponse
  ): Instructor[] {
    return apiResponse.data.map((apiInstructor) =>
      this.transformApiInstructorToUiInstructor(apiInstructor)
    );
  }
}
