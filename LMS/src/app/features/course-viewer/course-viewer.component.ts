import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ScormCommunicationService } from '../courses/services/scorm-communication.service';
import { CourseTrackerService } from '../courses/services/course-tracker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-viewer.component.html',
  styleUrl: './course-viewer.component.scss',
})
export class CourseViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('courseIframe', { static: false })
  courseIframe!: ElementRef<HTMLIFrameElement>;

  courseUrl: SafeResourceUrl;
  courseId: number | null = null;
  courseProgress: any = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private scormCommunicationService: ScormCommunicationService,
    private courseTrackerService: CourseTrackerService
  ) {
    // Get course ID from route params
    this.route.params.subscribe((params) => {
      this.courseId = +params['id'] || null;
      console.log('Course ID from route:', this.courseId);
    });

    // Get folder from query params for SCORM path
    const folder = this.route.snapshot.queryParamMap.get('folder');
    const path = folder
      ? `/assets/courses/${folder}/scormcontent/index.html`
      : '/assets/scorm-course-example.html'; // Use the example course for testing

    this.courseUrl = this.sanitizer.bypassSecurityTrustResourceUrl(path);
    console.log('Course URL:', path);
  }

  ngOnInit(): void {
    // Subscribe to SCORM data updates
    const scormSubscription =
      this.scormCommunicationService.scormData$.subscribe((data) => {
        if (data) {
          console.log('SCORM data updated:', data);
          // You can add UI updates here based on SCORM data
        }
      });

    // Subscribe to course progress updates
    const progressSubscription =
      this.courseTrackerService.courseProgress$.subscribe((progress) => {
        if (progress) {
          console.log('Course progress updated:', progress);
          // You can add UI updates here based on progress
        }
      });

    this.subscriptions.push(scormSubscription, progressSubscription);
  }

  ngAfterViewInit(): void {
    // Initialize SCORM communication after iframe is available
    if (this.courseId && this.courseIframe) {
      setTimeout(() => {
        this.initializeScormCommunication();
      }, 1000); // Give iframe time to load
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Clean up SCORM communication
    this.scormCommunicationService.cleanup();
  }

  /**
   * Initialize SCORM communication for the iframe
   */
  private initializeScormCommunication(): void {
    if (this.courseId && this.courseIframe?.nativeElement) {
      console.log(
        'Initializing SCORM communication for course:',
        this.courseId
      );

      // Initialize SCORM communication with iframe
      this.scormCommunicationService.initializeIframeScormCommunication(
        this.courseId,
        this.courseIframe.nativeElement
      );

      // Initialize course tracking
      this.courseTrackerService
        .initializeCourseTracking(this.courseId)
        .subscribe({
          next: (response) => {
            console.log('Course tracking initialized:', response);
          },
          error: (err) => {
            console.error('Error initializing course tracking:', err);
          },
        });
    }
  }

  /**
   * Handle iframe load event
   */
  onIframeLoad(): void {
    console.log('Course iframe loaded');

    // Re-initialize SCORM communication when iframe loads
    if (this.courseId && this.courseIframe?.nativeElement) {
      setTimeout(() => {
        this.initializeScormCommunication();
      }, 500);
    }
  }

  /**
   * Get course progress
   */
  getCourseProgress(): void {
    if (this.courseId) {
      this.courseTrackerService.getCourseProgress(this.courseId).subscribe({
        next: (progress) => {
          this.courseProgress = progress;
          console.log('Current course progress:', progress);
        },
        error: (err) => {
          console.error('Error getting course progress:', err);
        },
      });
    }
  }

  /**
   * Get status text in Arabic
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'not_started':
        return 'لم تبدأ بعد';
      case 'in_progress':
        return 'قيد التقدم';
      case 'completed':
        return 'مكتملة';
      case 'failed':
        return 'فشلت';
      default:
        return 'غير معروف';
    }
  }
}
