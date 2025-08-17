import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
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
  private _progressSubject = new BehaviorSubject<CourseProgress | null>(null);

  // Observable for course progress updates
  public courseProgress$ = this._progressSubject.asObservable();

  /**
   * Get course tracking data for a specific element and course
   * @param element - The SCORM element to track (e.g., 'lesson_status', 'score')
   * @param courseId - The course ID
   * @returns Observable of tracking data
   */
  getCourseTracker(element: string, courseId: number): Observable<string> {
    return this._http.get<string>(
      `/api/CourseTracker?element=${element}&courseId=${courseId}`
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
    return this._http.post<CourseTrackerResponse>(
      '/api/CourseTracker',
      request
    );
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
   * Track checkpoint data
   * @param courseId - The course ID
   * @param checkpointData - The checkpoint data
   * @returns Observable of tracking response
   */
  trackCheckpoint(
    courseId: number,
    checkpointData: string
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'checkpoint',
      courseId: courseId,
      value: checkpointData,
    };
    return this.postCourseTracker(request);
  }

  /**
   * Track course completion percentage
   * @param courseId - The course ID
   * @param percentage - The completion percentage (0-100)
   * @returns Observable of tracking response
   */
  trackCompletionPercentage(
    courseId: number,
    percentage: number
  ): Observable<CourseTrackerResponse> {
    const request: CourseTrackerRequest = {
      element: 'completion_percentage',
      courseId: courseId,
      value: percentage.toString(),
    };
    return this.postCourseTracker(request);
  }

  /**
   * Get course progress summary
   * @param courseId - The course ID
   * @returns Observable of course progress
   */
  getCourseProgress(courseId: number): Observable<CourseProgress> {
    // Try to get progress from API first
    return new Observable((observer) => {
      // Get all tracked elements for this course
      this.getAllCourseElements(courseId).subscribe({
        next: (elements) => {
          const progress = this.calculateProgressFromElements(
            courseId,
            elements
          );
          this._progressSubject.next(progress);
          observer.next(progress);
          observer.complete();
        },
        error: (err) => {
          console.error('Error getting course progress:', err);
          // Return mock progress if API fails
          const mockProgress = this.createMockProgress(courseId);
          this._progressSubject.next(mockProgress);
          observer.next(mockProgress);
          observer.complete();
        },
      });
    });
  }

  /**
   * Get all tracked elements for a course
   * @param courseId - The course ID
   * @returns Observable of tracked elements
   */
  private getAllCourseElements(courseId: number): Observable<ScormElement[]> {
    // This would typically call an API endpoint that returns all elements for a course
    // For now, we'll return a mock implementation
    return new Observable((observer) => {
      const mockElements: ScormElement[] = [
        {
          id: '1',
          name: 'lesson_status',
          type: 'lesson_status',
          value: 'incomplete',
          timestamp: new Date(),
        },
        {
          id: '2',
          name: 'completion_percentage',
          type: 'custom',
          value: '25',
          timestamp: new Date(),
        },
      ];
      observer.next(mockElements);
      observer.complete();
    });
  }

  /**
   * Calculate progress from tracked elements
   * @param courseId - The course ID
   * @param elements - The tracked elements
   * @returns CourseProgress object
   */
  private calculateProgressFromElements(
    courseId: number,
    elements: ScormElement[]
  ): CourseProgress {
    let completionPercentage = 0;
    let status: 'not_started' | 'in_progress' | 'completed' | 'failed' =
      'not_started';

    // Find completion percentage
    const completionElement = elements.find(
      (el) => el.name === 'completion_percentage'
    );
    if (completionElement) {
      completionPercentage = parseInt(completionElement.value) || 0;
    }

    // Find lesson status
    const statusElement = elements.find((el) => el.name === 'lesson_status');
    if (statusElement) {
      switch (statusElement.value) {
        case 'completed':
        case 'passed':
          status = 'completed';
          completionPercentage = 100;
          break;
        case 'failed':
          status = 'failed';
          break;
        case 'incomplete':
        case 'in_progress':
          status = 'in_progress';
          break;
        default:
          status = 'not_started';
      }
    }

    return {
      courseId,
      userId: 1, // Mock user ID
      elements,
      lastUpdated: new Date(),
      completionPercentage,
      status,
    };
  }

  /**
   * Create mock progress for fallback
   * @param courseId - The course ID
   * @returns Mock CourseProgress object
   */
  private createMockProgress(courseId: number): CourseProgress {
    return {
      courseId,
      userId: 1,
      elements: [],
      lastUpdated: new Date(),
      completionPercentage: 0,
      status: 'not_started',
    };
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

  /**
   * Update progress in the subject
   * @param progress - The updated progress
   */
  updateProgress(progress: CourseProgress): void {
    this._progressSubject.next(progress);
  }

  /**
   * Get current progress value
   * @returns Current progress or null
   */
  getCurrentProgress(): CourseProgress | null {
    return this._progressSubject.value;
  }
}
