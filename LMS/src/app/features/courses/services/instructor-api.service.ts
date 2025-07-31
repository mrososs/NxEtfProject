import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiInstructor,
  ApiInstructorResponse,
  Instructor,
  InstructorQueryParams,
} from '../model/instructor.model';

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

    return this._http.get<ApiInstructorResponse>('Trainer', {
      params: httpParams,
    });
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
      starRanking: apiInstructor.starRanking,
      about: apiInstructor.about,
      channels: apiInstructor.channels,
      // UI-specific defaults
      avatar: 'assets/img/instructor-avatar.png',
      isFeatured: apiInstructor.starRanking >= 4.5,
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
