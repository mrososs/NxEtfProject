import { Injectable } from '@angular/core';
import { CourseTrackerService } from './course-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class ScormCommunicationService {
  constructor(private courseTrackerService: CourseTrackerService) {}

  /**
   * Initialize SCORM communication for a course
   * @param courseId - The course ID
   * @param courseWindow - The window containing the SCORM course
   */
  initializeScormCommunication(courseId: number, courseWindow: Window): void {
    // Set up message listener for SCORM communication
    window.addEventListener('message', (event) => {
      if (event.source === courseWindow) {
        this.handleScormMessage(courseId, event.data);
      }
    });

    // Send initialization message to SCORM course
    courseWindow.postMessage(
      {
        type: 'scorm_init',
        courseId: courseId,
        apiEndpoint: '/api/CourseTracker',
      },
      '*'
    );
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
    switch (element) {
      case 'lesson_status':
        this.courseTrackerService.trackLessonStatus(courseId, value).subscribe({
          next: (response) => console.log('Lesson status tracked:', response),
          error: (err) => console.error('Error tracking lesson status:', err),
        });
        break;

      case 'lesson_location':
        this.courseTrackerService
          .trackLessonLocation(courseId, value)
          .subscribe({
            next: (response) =>
              console.log('Lesson location tracked:', response),
            error: (err) =>
              console.error('Error tracking lesson location:', err),
          });
        break;

      case 'score':
        this.courseTrackerService.trackScore(courseId, value).subscribe({
          next: (response) => console.log('Score tracked:', response),
          error: (err) => console.error('Error tracking score:', err),
        });
        break;

      case 'total_time':
        this.courseTrackerService.trackTotalTime(courseId, value).subscribe({
          next: (response) => console.log('Total time tracked:', response),
          error: (err) => console.error('Error tracking total time:', err),
        });
        break;

      case 'suspend_data':
        this.courseTrackerService.trackSuspendData(courseId, value).subscribe({
          next: (response) => console.log('Suspend data tracked:', response),
          error: (err) => console.error('Error tracking suspend data:', err),
        });
        break;

      default:
        // Handle custom elements
        this.courseTrackerService
          .trackCustomElement(courseId, element, value)
          .subscribe({
            next: (response) =>
              console.log('Custom element tracked:', response),
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
    this.courseTrackerService
      .trackLessonStatus(courseId, 'completed')
      .subscribe({
        next: (response) => {
          console.log('Course completion tracked:', response);
          // You can add additional logic here like showing a completion message
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
    this.courseTrackerService.trackLessonStatus(courseId, 'failed').subscribe({
      next: (response) => console.log('Error status tracked:', response),
      error: (err) => console.error('Error tracking error status:', err),
    });
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
      this.courseTrackerService.getCourseTracker(element, courseId).subscribe({
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
      this.courseTrackerService.initializeCourseTracking(courseId).subscribe({
        next: (response) => resolve(response),
        error: (err) => reject(err),
      });
    });
  }
}
