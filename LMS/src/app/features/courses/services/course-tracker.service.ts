import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
      element: 'progress',
      courseId: courseId,
      value: percentage.toString(),
    };
    return this.postCourseTracker(request);
  }

  /**
   * Track progress using GET API
   * @param courseId - The course ID
   * @param percentage - The completion percentage (0-100)
   * @returns Observable of tracking response
   */
  trackProgressWithGet(courseId: number, percentage: number): Observable<any> {
    const getUrl = `/api/CourseTracker?element=progress&courseId=${courseId}&value=${percentage}`;
    console.log('Tracking progress with GET API:', getUrl);

    return this._http.get<any>(getUrl).pipe(
      map((response) => {
        console.log('GET API progress tracking response:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Error tracking progress with GET API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get course progress summary
   * @param courseId - The course ID
   * @returns Observable of course progress
   */
  getCourseProgress(courseId: number): Observable<CourseProgress> {
    // Try to get progress from GET API first
    return new Observable((observer) => {
      // Get progress from GET API
      this.getProgressFromAPI(courseId).subscribe({
        next: (progress) => {
          this._progressSubject.next(progress);
          observer.next(progress);
          observer.complete();
        },
        error: (err) => {
          console.error('Error getting course progress from GET API:', err);
          // Fallback to getting all elements
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
            error: (err2) => {
              console.error('Error getting course progress:', err2);
              // Return mock progress if API fails
              const mockProgress = this.createMockProgress(courseId);
              this._progressSubject.next(mockProgress);
              observer.next(mockProgress);
              observer.complete();
            },
          });
        },
      });
    });
  }

  /**
   * Get progress directly from GET API
   * @param courseId - The course ID
   * @returns Observable of course progress
   */
  private getProgressFromAPI(courseId: number): Observable<CourseProgress> {
    return this._http
      .get<any>(`/api/CourseTracker?element=progress&courseId=${courseId}`)
      .pipe(
        map((response) => {
          console.log('GET API response for progress:', response);
          const progress: CourseProgress = {
            courseId: courseId,
            userId: 1, // Default user ID
            elements: [
              {
                id: '1',
                name: 'progress',
                type: 'custom',
                value: response.value || '0',
                timestamp: new Date(),
              },
            ],
            lastUpdated: new Date(),
            completionPercentage: parseInt(response.value) || 0,
            status:
              parseInt(response.value) > 0 ? 'in_progress' : 'not_started',
          };
          return progress;
        }),
        catchError((error) => {
          console.error('Error fetching progress from GET API:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get all tracked elements for a course
   * @param courseId - The course ID
   * @returns Observable of tracked elements
   */
  private getAllCourseElements(courseId: number): Observable<ScormElement[]> {
    // Call the GET API to get progress for this course
    return this._http
      .get<any>(`/api/CourseTracker?element=progress&courseId=${courseId}`)
      .pipe(
        map((response) => {
          console.log('GET API response:', response);
          // Convert response to ScormElement format
          const elements: ScormElement[] = [
            {
              id: '1',
              name: 'progress',
              type: 'custom',
              value: response.value || '0',
              timestamp: new Date(),
            },
            {
              id: '2',
              name: 'lesson_status',
              type: 'lesson_status',
              value: 'incomplete',
              timestamp: new Date(),
            },
          ];
          return elements;
        }),
        catchError((error) => {
          console.error('Error fetching course progress from GET API:', error);
          // Return mock data as fallback
          const mockElements: ScormElement[] = [
            {
              id: '1',
              name: 'lesson_status',
              type: 'lesson_status',
              value: 'not_attempted',
              timestamp: new Date(),
            },
            {
              id: '2',
              name: 'progress',
              type: 'custom',
              value: '0',
              timestamp: new Date(),
            },
          ];
          return of(mockElements);
        })
      );
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
    console.log('=== CALCULATING PROGRESS FROM ELEMENTS ===');
    console.log('Course ID:', courseId);
    console.log('Elements:', elements);
    console.log('==========================================');

    let completionPercentage = 0;
    let status: 'not_started' | 'in_progress' | 'completed' | 'failed' =
      'not_started';

    // Find completion percentage (look for both 'progress' and 'completion_percentage')
    const progressElement = elements.find(
      (el) => el.name === 'progress' || el.name === 'completion_percentage'
    );
    if (progressElement) {
      completionPercentage = parseInt(progressElement.value) || 0;
      console.log('Found progress element:', progressElement);
      console.log('Completion percentage:', completionPercentage);
    } else {
      console.log('No progress element found');
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

  /**
   * Get course certificate
   * @param courseId - The course ID
   * @returns Observable of certificate data
   */
  getCourseCertificate(courseId: number): Observable<any> {
    return this._http.get(`/api/CourseTracker/certificate/${courseId}`).pipe(
      catchError((error) => {
        console.error('Error fetching course certificate:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download course certificate
   * @param courseId - The course ID
   * @returns Observable of certificate download response
   */
  downloadCourseCertificate(courseId: number): Observable<Blob> {
    return this._http
      .get(`/api/CourseTracker/certificate/${courseId}/download`, {
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          console.error('Error downloading course certificate:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if course is completed and certificate is available
   * @param courseId - The course ID
   * @returns Observable of certificate availability
   */
  isCertificateAvailable(courseId: number): Observable<boolean> {
    return this.getCourseProgress(courseId).pipe(
      map((progress) => {
        return (
          progress?.status === 'completed' &&
          progress?.completionPercentage >= 100
        );
      }),
      catchError(() => of(false))
    );
  }
}
