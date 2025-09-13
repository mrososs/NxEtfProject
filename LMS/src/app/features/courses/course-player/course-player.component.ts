import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HomePageService } from '../services/home-page.service';
import { Course } from '../model/course.model';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="course-player-container mt-5">
      <!-- Header with course info and back button -->
      <div class="course-header">
        <div class="course-info">
          @if (course()) {
          <h1 class="course-title">{{ course()?.title }}</h1>
          <p class="course-description">{{ course()?.description }}</p>
          }
        </div>
        <div class="course-actions">
          <p-button
            icon="pi pi-arrow-left"
            label="العودة لتفاصيل الدورة"
            [outlined]="true"
            (click)="goBackToCourseDetails()"
            class="back-button"
          >
          </p-button>
        </div>
      </div>

      <!-- Course content area -->
      <div class="course-content">
        @if (loading()) {
        <div class="loading-container">
          <p-progressSpinner strokeWidth="3" size="50"></p-progressSpinner>
          <p>جاري تحميل الدورة...</p>
        </div>
        } @else if (error()) {
        <div class="error-container">
          <i class="pi pi-exclamation-triangle error-icon"></i>
          <h3>حدث خطأ في تحميل الدورة</h3>
          <p>{{ errorMessage() }}</p>
          <p-button
            label="إعادة المحاولة"
            icon="pi pi-refresh"
            (click)="loadCourseContent()"
            severity="secondary"
          >
          </p-button>
        </div>
        } @else if (courseContent()) {
        <div class="iframe-container" [innerHTML]="courseContent()"></div>
        }
      </div>
    </div>

    <p-toast position="bottom-right"></p-toast>
  `,
  styles: [
    `
      .course-player-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f8f9fa;
      }

      .course-header {
        background: white;
        padding: 1rem 2rem;
        border-bottom: 1px solid #e9ecef;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }

      .course-info {
        flex: 1;
      }

      .course-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
      }

      .course-description {
        margin: 0;
        color: #6c757d;
        font-size: 0.9rem;
      }

      .course-actions {
        flex-shrink: 0;
      }

      .back-button {
        margin-left: 1rem;
      }

      .course-content {
        flex: 1;
        display: flex;
        position: relative;
        overflow: hidden;
      }

      .loading-container,
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        text-align: center;
        padding: 2rem;
      }

      .loading-container p {
        margin-top: 1rem;
        color: #6c757d;
        font-size: 1.1rem;
      }

      .error-container {
        color: #dc3545;
      }

      .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #dc3545;
      }

      .error-container h3 {
        margin: 0 0 1rem 0;
        color: #dc3545;
      }

      .error-container p {
        margin: 0 0 1.5rem 0;
        color: #6c757d;
      }

      .iframe-container {
        flex: 1;
        width: 100%;
        height: 100%;
      }

      .iframe-container :deep(iframe) {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
      }

      .iframe-container :deep(body) {
        margin: 0;
        padding: 0;
        height: 100%;
      }

      /* RTL Support */
      [dir='rtl'] .course-header {
        direction: rtl;
      }

      [dir='rtl'] .back-button {
        margin-left: 0;
        margin-right: 1rem;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .course-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
        }

        .course-actions {
          width: 100%;
          display: flex;
          justify-content: flex-start;
        }

        .course-title {
          font-size: 1.25rem;
        }

        .back-button {
          margin: 0;
        }
      }
    `,
  ],
})
export class CoursePlayerComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _homePageService = inject(HomePageService);
  private _sanitizer = inject(DomSanitizer);
  private _messageService = inject(MessageService);

  // Signals for reactive state management
  loading = signal(true);
  error = signal(false);
  errorMessage = signal('');
  courseContent = signal<SafeHtml | null>(null);
  course = signal<Course | null>(null);

  private courseId!: number;

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.courseId = +params['id'];
      this.loadCourseInfo();
      this.loadCourseContent();
    });
  }

  /**
   * Load basic course information
   */
  private loadCourseInfo(): void {
    this._homePageService.getCourseByIdFromApi(this.courseId, 'ar').subscribe({
      next: (course: Course) => {
        this.course.set(course);
      },
      error: (error) => {
        console.error('Error loading course info:', error);
        // Don't show error for course info, focus on content loading
      },
    });
  }

  /**
   * Load course content from launch API
   */
  loadCourseContent(): void {
    this.loading.set(true);
    this.error.set(false);
    this.errorMessage.set('');

    this._homePageService.launchCourse(this.courseId).subscribe({
      next: (htmlContent: string) => {
        try {
          // Sanitize the HTML content for security
          const sanitizedContent =
            this._sanitizer.bypassSecurityTrustHtml(htmlContent);
          this.courseContent.set(sanitizedContent);
          this.loading.set(false);

          this._messageService.add({
            severity: 'success',
            summary: 'تم تحميل الدورة',
            detail: 'تم تحميل محتوى الدورة بنجاح',
            life: 3000,
          });
        } catch (error) {
          console.error('Error processing course content:', error);
          this.handleError('حدث خطأ في معالجة محتوى الدورة');
        }
      },
      error: (error) => {
        console.error('Error launching course:', error);
        let errorMsg = 'فشل في تحميل محتوى الدورة';

        if (error.status === 404) {
          errorMsg = 'الدورة غير موجودة أو غير متاحة';
        } else if (error.status === 403) {
          errorMsg = 'ليس لديك صلاحية للوصول لهذه الدورة';
        } else if (error.status === 0) {
          errorMsg = 'مشكلة في الاتصال بالخادم';
        }

        this.handleError(errorMsg);
      },
    });
  }

  /**
   * Handle error state
   */
  private handleError(message: string): void {
    this.loading.set(false);
    this.error.set(true);
    this.errorMessage.set(message);

    this._messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 5000,
    });
  }

  /**
   * Navigate back to course details
   */
  goBackToCourseDetails(): void {
    this._router.navigate(['/courses', this.courseId]);
  }
}
