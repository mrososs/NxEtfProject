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
    console.log('=== INITIALIZING SCORM COMMUNICATION ===');
    console.log('Course ID:', courseId);
    console.log('Course Window:', courseWindow);
    console.log('=========================================');

    this._currentCourseId = courseId;

    // Set up message listener for SCORM communication
    this._messageListener = (event: MessageEvent) => {
      console.log('=== MESSAGE EVENT RECEIVED ===');
      console.log('Event source:', event.source);
      console.log('Course window:', courseWindow);
      console.log('Sources match:', event.source === courseWindow);
      console.log('Event data:', event.data);
      console.log('===============================');

      if (event.source === courseWindow) {
        this.handleScormMessage(courseId, event.data);
      }
    };

    window.addEventListener('message', this._messageListener);

    // Send initialization message to SCORM course
    const initMessage = {
      type: 'scorm_init',
      courseId: courseId,
      apiEndpoint:
        'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/CourseTracker',
    };

    console.log('Sending initialization message:', initMessage);
    courseWindow.postMessage(initMessage, '*');

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
    console.log('=== SCORM MESSAGE RECEIVED ===');
    console.log('Course ID:', courseId);
    console.log('Message Type:', data.type);
    console.log('Full Message Data:', data);
    console.log('================================');

    switch (data.type) {
      case 'scorm_tracking':
        this.trackScormElement(courseId, data.element, data.value);
        break;
      case 'scorm_complete':
        this.handleCourseCompletion(courseId, data);
        break;
      case 'scorm_error':
        this.handleScormError(courseId, data);
        break;
      case 'scorm_checkpoint':
        this.handleCheckpoint(courseId, data);
        break;
      case 'scorm_progress':
        this.handleProgressUpdate(courseId, data);
        break;
      case 'scorm_ready':
        this.handleScormReady(courseId, data);
        break;
      case 'scorm_exit':
        this.handleScormExit(courseId, data);
        break;
      case 'scorm_student_info':
        this.handleStudentInfo(courseId, data);
        break;
      case 'scorm_custom_element':
        this.handleCustomElement(courseId, data);
        break;
      case 'scorm_unload':
        this.handleScormUnload(courseId, data);
        break;
      default:
        console.log('Unknown SCORM message type:', data.type);
        break;
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
    console.log('=== TRACKING SCORM ELEMENT ===');
    console.log(`Course ID: ${courseId}`);
    console.log(`Element: ${element}`);
    console.log(`Value: ${value}`);
    console.log('===============================');

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

      case 'progress': {
        const percentage = parseInt(value) || 0;
        console.log('=== TRACKING PROGRESS ===');
        console.log('Course ID:', courseId);
        console.log('Progress Percentage:', percentage);
        console.log('=========================');

        // Send progress data directly to CourseTracker API
        this.sendProgressToAPI(courseId, percentage);
        this.updateProgress();
        break;
      }

      case 'completion_percentage': {
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
      }

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
              next: (response) => {
                console.log('100% completion tracked:', response);

                // Send completion notification with certificate info
                this._scormDataSubject.next({
                  type: 'course_completed',
                  courseId: courseId,
                  data: {
                    ...data,
                    certificateAvailable:
                      data.data?.certificateAvailable || true,
                    completionDate: new Date().toISOString(),
                  },
                });
              },
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
   * Send progress data directly to CourseTracker API
   */
  private sendProgressToAPI(courseId: number, percentage: number): void {
    const progressData = {
      element: 'progress',
      courseId: courseId,
      value: percentage.toString(),
    };

    console.log('Sending progress to CourseTracker API:', progressData);

    // Use the course tracker service to send progress
    this._courseTrackerService
      .trackCustomElement(courseId, 'progress', percentage.toString())
      .subscribe({
        next: (response) => {
          console.log('Progress sent to CourseTracker API:', response);
        },
        error: (error) => {
          console.error('Error sending progress to CourseTracker API:', error);
        },
      });
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

  /**
   * Handle SCORM ready message
   * @param courseId - The course ID
   * @param data - Ready data
   */
  private handleScormReady(courseId: number, data: any): void {
    console.log('SCORM ready:', data);

    // Send initialization confirmation
    this.sendMessageToIframe({
      type: 'scorm_init_confirmed',
      courseId: courseId,
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Handle SCORM exit message
   * @param courseId - The course ID
   * @param data - Exit data
   */
  private handleScormExit(courseId: number, data: any): void {
    console.log('SCORM exit:', data);

    // Update progress when course is exited
    this.updateProgress();
  }

  /**
   * Handle student info message
   * @param courseId - The course ID
   * @param data - Student info data
   */
  private handleStudentInfo(courseId: number, data: any): void {
    console.log('Student info:', data);

    // Track student information if needed
    this._courseTrackerService
      .trackCustomElement(courseId, data.data.element, data.data.value)
      .subscribe({
        next: (response) => console.log('Student info tracked:', response),
        error: (err) => console.error('Error tracking student info:', err),
      });
  }

  /**
   * Handle custom element message
   * @param courseId - The course ID
   * @param data - Custom element data
   */
  private handleCustomElement(courseId: number, data: any): void {
    console.log('Custom element:', data);

    // Track custom element
    this._courseTrackerService
      .trackCustomElement(courseId, data.data.element, data.data.value)
      .subscribe({
        next: (response) => console.log('Custom element tracked:', response),
        error: (err) => console.error('Error tracking custom element:', err),
      });
  }

  /**
   * Handle SCORM unload message
   * @param courseId - The course ID
   * @param data - Unload data
   */
  private handleScormUnload(courseId: number, data: any): void {
    console.log('SCORM unload:', data);

    // Final progress update
    this.updateProgress();

    // Clean up communication
    this.cleanup();
  }
}
