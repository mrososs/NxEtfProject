import { Injectable } from '@angular/core';
import { CourseTrackerService } from './course-tracker.service';
import { BehaviorSubject } from 'rxjs';

export interface ScormMessage {
  type: string;
  courseId: number;
  element?: string;
  value?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ScormCommunicationService {
  private _courseTrackerService: CourseTrackerService;
  private _currentCourseId: number | null = null;
  private _iframeElement: HTMLIFrameElement | null = null;
  private _messageListener: ((event: MessageEvent) => void) | null = null;
  private _scormDataSubject = new BehaviorSubject<any>(null);

  // Observable for SCORM data updates
  public scormData$ = this._scormDataSubject.asObservable();

  constructor(courseTrackerService: CourseTrackerService) {
    this._courseTrackerService = courseTrackerService;
  }

  /**
   * Initialize SCORM communication for a course
   * @param courseId - The course ID
   * @param courseWindow - The window containing the SCORM course
   */
  initializeScormCommunication(courseId: number, courseWindow: Window): void {
    this._currentCourseId = courseId;

    // Set up message listener for SCORM communication
    this._messageListener = (event: MessageEvent) => {
      if (event.source === courseWindow) {
        this.handleScormMessage(courseId, event.data);
      }
    };

    window.addEventListener('message', this._messageListener);

    // Send initialization message to SCORM course
    courseWindow.postMessage(
      {
        type: 'scorm_init',
        courseId: courseId,
        apiEndpoint: '/api/CourseTracker',
      },
      '*'
    );

    console.log('SCORM communication initialized for course:', courseId);
  }

  /**
   * Initialize SCORM communication for iframe
   * @param courseId - The course ID
   * @param iframeElement - The iframe element containing the SCORM course
   */
  initializeIframeScormCommunication(
    courseId: number,
    iframeElement: HTMLIFrameElement
  ): void {
    this._currentCourseId = courseId;
    this._iframeElement = iframeElement;

    // Set up message listener for SCORM communication
    this._messageListener = (event: MessageEvent) => {
      if (event.source === iframeElement.contentWindow) {
        this.handleScormMessage(courseId, event.data);
      }
    };

    window.addEventListener('message', this._messageListener);

    // Wait for iframe to load, then send initialization message
    iframeElement.addEventListener('load', () => {
      setTimeout(() => {
        this.sendMessageToIframe({
          type: 'scorm_init',
          courseId: courseId,
          apiEndpoint: '/api/CourseTracker',
        });
      }, 1000); // Give iframe time to initialize
    });

    console.log('SCORM iframe communication initialized for course:', courseId);
  }

  /**
   * Handle messages from SCORM course
   * @param courseId - The course ID
   * @param data - The message data from SCORM
   */
  private handleScormMessage(courseId: number, data: any): void {
    console.log('Received SCORM message:', data);

    if (data.type === 'scorm_tracking') {
      this.trackScormElement(courseId, data.element, data.value);
    } else if (data.type === 'scorm_complete') {
      this.handleCourseCompletion(courseId, data);
    } else if (data.type === 'scorm_error') {
      this.handleScormError(courseId, data);
    } else if (data.type === 'scorm_checkpoint') {
      this.handleCheckpoint(courseId, data);
    } else if (data.type === 'scorm_progress') {
      this.handleProgressUpdate(courseId, data);
    }
  }

  /**
   * Track SCORM element
   * @param courseId - The course ID
   * @param element - The SCORM element name
   * @param value - The element value
   */
  private trackScormElement(
    courseId: number,
    element: string,
    value: string
  ): void {
    console.log(`Tracking SCORM element: ${element} = ${value}`);

    switch (element) {
      case 'lesson_status':
        this._courseTrackerService
          .trackLessonStatus(courseId, value)
          .subscribe({
            next: (response) => {
              console.log('Lesson status tracked:', response);
              this.updateProgress();
            },
            error: (err) => console.error('Error tracking lesson status:', err),
          });
        break;

      case 'lesson_location':
        this._courseTrackerService
          .trackLessonLocation(courseId, value)
          .subscribe({
            next: (response) => {
              console.log('Lesson location tracked:', response);
              this.updateProgress();
            },
            error: (err) =>
              console.error('Error tracking lesson location:', err),
          });
        break;

      case 'score':
        this._courseTrackerService.trackScore(courseId, value).subscribe({
          next: (response) => {
            console.log('Score tracked:', response);
            this.updateProgress();
          },
          error: (err) => console.error('Error tracking score:', err),
        });
        break;

      case 'total_time':
        this._courseTrackerService.trackTotalTime(courseId, value).subscribe({
          next: (response) => {
            console.log('Total time tracked:', response);
            this.updateProgress();
          },
          error: (err) => console.error('Error tracking total time:', err),
        });
        break;

      case 'suspend_data':
        this._courseTrackerService.trackSuspendData(courseId, value).subscribe({
          next: (response) => {
            console.log('Suspend data tracked:', response);
            this.updateProgress();
          },
          error: (err) => console.error('Error tracking suspend data:', err),
        });
        break;

      case 'completion_percentage':
        const percentage = parseInt(value) || 0;
        this._courseTrackerService
          .trackCompletionPercentage(courseId, percentage)
          .subscribe({
            next: (response) => {
              console.log('Completion percentage tracked:', response);
              this.updateProgress();
            },
            error: (err) =>
              console.error('Error tracking completion percentage:', err),
          });
        break;

      default:
        // Handle custom elements
        this._courseTrackerService
          .trackCustomElement(courseId, element, value)
          .subscribe({
            next: (response) => {
              console.log('Custom element tracked:', response);
              this.updateProgress();
            },
            error: (err) =>
              console.error('Error tracking custom element:', err),
          });
        break;
    }
  }

  /**
   * Handle course completion
   * @param courseId - The course ID
   * @param data - Completion data
   */
  private handleCourseCompletion(courseId: number, data: any): void {
    console.log('Course completed:', data);

    // Track final status
    this._courseTrackerService
      .trackLessonStatus(courseId, 'completed')
      .subscribe({
        next: (response) => {
          console.log('Course completion tracked:', response);
          this.updateProgress();

          // Track 100% completion
          this._courseTrackerService
            .trackCompletionPercentage(courseId, 100)
            .subscribe({
              next: (response) =>
                console.log('100% completion tracked:', response),
              error: (err) =>
                console.error('Error tracking 100% completion:', err),
            });
        },
        error: (err) => console.error('Error tracking course completion:', err),
      });
  }

  /**
   * Handle SCORM errors
   * @param courseId - The course ID
   * @param data - Error data
   */
  private handleScormError(courseId: number, data: any): void {
    console.error('SCORM error:', data);

    // Track error status
    this._courseTrackerService.trackLessonStatus(courseId, 'failed').subscribe({
      next: (response) => {
        console.log('Error status tracked:', response);
        this.updateProgress();
      },
      error: (err) => console.error('Error tracking error status:', err),
    });
  }

  /**
   * Handle checkpoint data
   * @param courseId - The course ID
   * @param data - Checkpoint data
   */
  private handleCheckpoint(courseId: number, data: any): void {
    console.log('Checkpoint received:', data);

    const checkpointData = JSON.stringify(data);
    this._courseTrackerService
      .trackCheckpoint(courseId, checkpointData)
      .subscribe({
        next: (response) => {
          console.log('Checkpoint tracked:', response);
          this.updateProgress();
        },
        error: (err) => console.error('Error tracking checkpoint:', err),
      });
  }

  /**
   * Handle progress updates
   * @param courseId - The course ID
   * @param data - Progress data
   */
  private handleProgressUpdate(courseId: number, data: any): void {
    console.log('Progress update received:', data);

    if (data.percentage !== undefined) {
      this._courseTrackerService
        .trackCompletionPercentage(courseId, data.percentage)
        .subscribe({
          next: (response) => {
            console.log('Progress tracked:', response);
            this.updateProgress();
          },
          error: (err) => console.error('Error tracking progress:', err),
        });
    }
  }

  /**
   * Update progress in the course tracker service
   */
  private updateProgress(): void {
    if (this._currentCourseId) {
      this._courseTrackerService
        .getCourseProgress(this._currentCourseId)
        .subscribe({
          next: (progress) => {
            this._courseTrackerService.updateProgress(progress);
            this._scormDataSubject.next(progress);
          },
          error: (err) => console.error('Error updating progress:', err),
        });
    }
  }

  /**
   * Send message to SCORM course
   * @param courseWindow - The SCORM course window
   * @param message - The message to send
   */
  sendMessageToScorm(courseWindow: Window, message: any): void {
    courseWindow.postMessage(message, '*');
  }

  /**
   * Send message to iframe
   * @param message - The message to send
   */
  sendMessageToIframe(message: any): void {
    if (this._iframeElement && this._iframeElement.contentWindow) {
      this._iframeElement.contentWindow.postMessage(message, '*');
    }
  }

  /**
   * Get SCORM tracking data
   * @param courseId - The course ID
   * @param element - The element to get
   * @returns Promise with the tracking data
   */
  async getScormTrackingData(
    courseId: number,
    element: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this._courseTrackerService.getCourseTracker(element, courseId).subscribe({
        next: (data) => resolve(data),
        error: (err) => reject(err),
      });
    });
  }

  /**
   * Initialize course tracking
   * @param courseId - The course ID
   * @returns Promise with initialization response
   */
  async initializeCourseTracking(courseId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._courseTrackerService.initializeCourseTracking(courseId).subscribe({
        next: (response) => resolve(response),
        error: (err) => reject(err),
      });
    });
  }

  /**
   * Clean up SCORM communication
   */
  cleanup(): void {
    if (this._messageListener) {
      window.removeEventListener('message', this._messageListener);
      this._messageListener = null;
    }
    this._currentCourseId = null;
    this._iframeElement = null;
    console.log('SCORM communication cleaned up');
  }

  /**
   * Get current course ID
   * @returns Current course ID or null
   */
  getCurrentCourseId(): number | null {
    return this._currentCourseId;
  }

  /**
   * Check if SCORM communication is active
   * @returns True if communication is active
   */
  isActive(): boolean {
    return this._currentCourseId !== null && this._messageListener !== null;
  }
}
