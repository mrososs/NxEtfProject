import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CourseTrackerRequest,
  CourseTrackerResponse,
  ScormElement,
  CourseProgress,
} from '../model/course-tracker.model';

@Injectable({
  providedIn: 'root',
})
export class CourseTrackerService {
  private _http = inject(HttpClient);

  /**
   * Get course tracking data for a specific element and course
   * @param element - The SCORM element to track (e.g., 'lesson_status', 'score')
   * @param courseId - The course ID
   * @returns Observable of tracking data
   */
  getCourseTracker(element: string, courseId: number): Observable<string> {
    return this._http.get<string>(
      `CourseTracker?element=${element}&courseId=${courseId}`
    );
  }

  /**
   * Post course tracking data
   * @param request - The tracking request data
   * @returns Observable of tracking response
   */
  postCourseTracker(
    request: CourseTrackerRequest
  ): Observable<CourseTrackerResponse> {
    return this._http.post<CourseTrackerResponse>('CourseTracker', request);
  }

  /**
   * Track lesson status
   * @param courseId - The course ID
   * @param status - The lesson status (not_attempted, incomplete, completed, failed, passed)
   * @returns Observable of tracking response
   */
  trackLessonStatus(
    courseId: number,
    status: string
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'lesson_status',
      courseId: courseId,
      value: status,
    };
    return this.postCourseTracker(request);
  }

  /**
   * Track lesson location (bookmark)
   * @param courseId - The course ID
   * @param location - The lesson location/bookmark
   * @returns Observable of tracking response
   */
  trackLessonLocation(
    courseId: number,
    location: string
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'lesson_location',
      courseId: courseId,
      value: location,
    };
    return this.postCourseTracker(request);
  }

  /**
   * Track score
   * @param courseId - The course ID
   * @param score - The score value
   * @returns Observable of tracking response
   */
  trackScore(
    courseId: number,
    score: string
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'score',
      courseId: courseId,
      value: score,
    };
    return this.postCourseTracker(request);
  }

  /**
   * Track total time spent
   * @param courseId - The course ID
   * @param time - The time spent in format "HHHH:MM:SS.SS"
   * @returns Observable of tracking response
   */
  trackTotalTime(
    courseId: number,
    time: string
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'total_time',
      courseId: courseId,
      value: time,
    };
    return this.postCourseTracker(request);
  }

  /**
   * Track suspend data (custom progress data)
   * @param courseId - The course ID
   * @param suspendData - The suspend data string
   * @returns Observable of tracking response
   */
  trackSuspendData(
    courseId: number,
    suspendData: string
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'suspend_data',
      courseId: courseId,
      value: suspendData,
    };
    return this.postCourseTracker(request);
  }

  /**
   * Track custom element
   * @param courseId - The course ID
   * @param element - The custom element name
   * @param value - The element value
   * @returns Observable of tracking response
   */
  trackCustomElement(
    courseId: number,
    element: string,
    value: string
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: element,
      courseId: courseId,
      value: value,
    };
    return this.postCourseTracker(request);
  }

  /**
   * Get course progress summary
   * @param courseId - The course ID
   * @returns Observable of course progress
   */
  getCourseProgress(courseId: number): Observable<CourseProgress> {
    // This would typically call a different endpoint that returns progress summary
    // For now, we'll return a mock implementation
    return new Observable((observer) => {
      // Mock implementation - in real scenario, this would call an API
      const mockProgress: CourseProgress = {
        courseId: courseId,
        userId: 1, // Mock user ID
        elements: [],
        lastUpdated: new Date(),
        completionPercentage: 0,
        status: 'not_started',
      };
      observer.next(mockProgress);
      observer.complete();
    });
  }

  /**
   * Initialize course tracking
   * @param courseId - The course ID
   * @returns Observable of initialization response
   */
  initializeCourseTracking(
    courseId: number
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'lesson_status',
      courseId: courseId,
      value: 'not_attempted',
    };
    return this.postCourseTracker(request);
  }
}
