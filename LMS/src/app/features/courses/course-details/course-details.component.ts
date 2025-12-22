import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  HomePageService,
  CourseDetails,
  ReviewRequest,
  ReviewResponse,
} from '../services/home-page.service';
import { EnrollmentService } from '../services/enrollment.service';
import { Course, Lesson } from '../model/course.model';
import { CourseTracker } from '../model/course-tracker.model';
import {
  CertificateService,
  CertificateData,
} from '../services/certificate.service';
import {
  AnalyticsService,
  CourseType,
} from '../../../core/services/analytics.service';

interface Review {
  id: number;
  comment: string;
  reviewRating: number;
  courseId?: number;
  userId?: string;
  reactions?: any;
  userName?: string;
  userImage?: string;
  isEditable?: boolean;
}

interface LearningObjective {
  id: number;
  text: string;
  icon: string;
}

interface CourseRequirement {
  id: number;
  text: string;
  icon: string;
}

interface CourseBenefit {
  id: number;
  text: string;
  icon: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  isExpanded: boolean;
}

interface CourseUnit {
  id: number;
  title: string;
  duration: string;
  isExpanded: boolean;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: number;
  title: string;
  duration: string;
}

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss',
})
export class CourseDetailsComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _homePageService = inject(HomePageService);
  private _enrollmentService = inject(EnrollmentService);
  private _messageService = inject(MessageService);
  private _cdr = inject(ChangeDetectorRef);
  private _certificateService = inject(CertificateService);
  private _analyticsService = inject(AnalyticsService);

  course!: Course;
  courseDetails!: CourseDetails;
  courseTracker?: CourseTracker;
  loading = true;
  error = false;
  courseId!: number;

  // Enrollment properties
  isEnrolled = false;
  enrollmentLoading = false;

  // Course completion properties
  courseCompleted = false;
  courseCompletionLoading = false;

  // Certificate properties
  certificateLoading = false;
  userName = '';

  // Reviews from API
  reviews: Review[] = [];

  learningObjectives: LearningObjective[] = [
    {
      id: 1,
      text: 'فهم أساسيات الارشاد السياحي وأهميته',
      icon: 'pi pi-check-circle',
    },
    {
      id: 2,
      text: 'تعلم مهارات التواصل مع السياح',
      icon: 'pi pi-check-circle',
    },
    {
      id: 3,
      text: 'اكتساب المعرفة بالمعالم السياحية',
      icon: 'pi pi-check-circle',
    },
    {
      id: 4,
      text: 'تطوير مهارات التخطيط للجولات السياحية',
      icon: 'pi pi-check-circle',
    },
    {
      id: 5,
      text: 'فهم الثقافات المختلفة وكيفية التعامل معها',
      icon: 'pi pi-check-circle',
    },
  ];

  courseRequirements: CourseRequirement[] = [
    { id: 1, text: 'لا توجد متطلبات مسبقة', icon: 'pi pi-info-circle' },
    { id: 2, text: 'الرغبة في التعلم والتطوير', icon: 'pi pi-heart' },
    { id: 3, text: 'إمكانية الوصول للإنترنت', icon: 'pi pi-wifi' },
    { id: 4, text: 'الوقت الكافي للدراسة', icon: 'pi pi-clock' },
  ];

  courseBenefits: CourseBenefit[] = [
    { id: 1, text: 'شهادة إتمام الدورة', icon: 'pi pi-certificate' },
    { id: 2, text: 'الوصول الدائم للمحتوى', icon: 'pi pi-infinity' },
    { id: 3, text: 'دعم فني متواصل', icon: 'pi pi-headset' },
    { id: 4, text: 'مجتمع تعليمي نشط', icon: 'pi pi-users' },
  ];

  courseUnits: CourseUnit[] = [];

  faqs: FAQ[] = [
    {
      id: 1,
      question: 'هل يمكنني الوصول للدورة بعد الانتهاء منها؟',
      answer: 'نعم، يمكنك الوصول للدورة ومحتواها في أي وقت بعد التسجيل.',
      isExpanded: false,
    },
    {
      id: 2,
      question: 'هل توجد شهادة إتمام للدورة؟',
      answer: 'نعم، ستحصل على شهادة إتمام معتمدة بعد الانتهاء من جميع الوحدات.',
      isExpanded: false,
    },
    {
      id: 3,
      question: 'هل يمكنني التواصل مع المدرب؟',
      answer: 'نعم، يمكنك التواصل مع المدرب من خلال منصة التعلم.',
      isExpanded: false,
    },
  ];

  newReview = {
    rating: 0,
    text: '',
  };

  // Edit review properties
  editingReview: Review | null = null;
  editReview = {
    rating: 0,
    text: '',
  };

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.courseId = +params['id'];
      this.loadCourseDetails();
      this.loadUserName();

      // Load enrolled courses first, then check enrollment status
      this._enrollmentService.getEnrolledCourses().subscribe({
        next: (enrollments) => {
          console.log('Enrolled courses loaded in component:', enrollments);
          this.checkEnrollmentStatus();
        },
        error: (error) => {
          console.error('Error loading enrolled courses:', error);
          this.checkEnrollmentStatus(); // Check anyway
        },
      });
    });

    // Configure toast position to bottom-right
    this._messageService.messageObserver.subscribe(() => {
      // This ensures toasts appear in bottom-right
    });
  }

  private loadCourseDetails(): void {
    this.loading = true;
    this.error = false;

    // Load course basic info
    this._homePageService.getCourseByIdFromApi(this.courseId, 'ar').subscribe({
      next: (course: Course) => {
        this.course = course;
        console.log('Course loaded with reviews:', course.reviews);

        // Load reviews from course data
        this.loadReviewsFromCourse();

        // Load course units from API response
        this.updateCourseUnits();

        // Load course details from new API
        this.loadCourseDetailsFromApi();
      },
      error: (err) => {
        console.error('Error fetching course details:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  private loadCourseDetailsFromApi(): void {
    this._homePageService.getCourseDetails(this.courseId).subscribe({
      next: (details: CourseDetails) => {
        this.courseDetails = details;

        // Update learning objectives from API response
        this.updateLearningObjectives();

        // Update FAQs from API response
        this.updateFAQs();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching course details from API:', err);
        // Continue with mock data if API fails
        this.loading = false;
      },
    });
  }

  /**
   * Load reviews from course data
   */
  private loadReviewsFromCourse(): void {
    if (this.course?.reviews && Array.isArray(this.course.reviews)) {
      this.reviews = this.course.reviews.map((review: any) => ({
        id: review.id || Math.random(), // Use random ID if id is 0
        comment: review.comment || '',
        reviewRating: Math.round(review.reviewRating) || 0, // Round to integer
        courseId: review.courseId,
        userId: review.user?.userId || review.userId,
        reactions: review.reactions,
        userName: this.getUserNameForReview(review),
        userImage: this.getUserImageForReview(review),
        isEditable: this.isReviewEditable(review),
      }));
      console.log('Reviews loaded from course data:', this.reviews);
    } else {
      this.reviews = [];
      console.log('No reviews found in course data');
    }
  }

  private updateLearningObjectives(): void {
    if (this.courseDetails?.whatYouWillLearnAr) {
      // Parse the learning objectives from the API response
      const objectives = this.courseDetails.whatYouWillLearnAr
        .split('\n')
        .filter((obj) => obj.trim())
        .map((obj, index) => ({
          id: index + 1,
          text: obj.trim(),
          icon: 'pi pi-check-circle',
        }));

      if (objectives.length > 0) {
        this.learningObjectives = objectives;
      }
    }
  }

  private updateFAQs(): void {
    if (this.courseDetails?.faq && this.courseDetails.faq.length > 0) {
      this.faqs = this.courseDetails.faq.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.body,
        isExpanded: false,
      }));
    }
  }

  /**
   * Update course units from API response
   */
  private updateCourseUnits(): void {
    if (this.course?.lessons && this.course.lessons.length > 0) {
      // Create a single unit containing all lessons from the API
      const totalDuration = this.calculateTotalDuration(this.course.lessons);

      this.courseUnits = [
        {
          id: 1,
          title: 'محتوى الدورة',
          duration: totalDuration,
          isExpanded: true, // Expand by default to show lessons
          lessons: this.course.lessons.map((lesson: Lesson) => ({
            id: lesson.id,
            title: lesson.title,
            duration: this.formatDuration(lesson.duration),
          })),
        },
      ];

      console.log('Course units updated from API:', this.courseUnits);
    } else {
      // Fallback to empty array if no lessons
      this.courseUnits = [];
      console.log('No lessons found in course data');
    }
  }

  /**
   * Calculate total duration from lessons
   */
  private calculateTotalDuration(lessons: Lesson[]): string {
    let totalMinutes = 0;

    lessons.forEach((lesson) => {
      const duration = this.parseDuration(lesson.duration);
      totalMinutes += duration;
    });

    return this.formatTotalDuration(totalMinutes);
  }

  /**
   * Parse duration string to minutes
   */
  private parseDuration(duration: string): number {
    // Handle format like "00:10:00" (HH:MM:SS)
    if (duration.includes(':')) {
      const parts = duration.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours * 60 + minutes;
      } else if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        return minutes + (seconds > 0 ? 1 : 0); // Round up if there are seconds
      }
    }

    // Handle format like "10 دقائق" or "10 minutes"
    const match = duration.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }

    return 0;
  }

  /**
   * Format duration in minutes to readable string
   */
  private formatDuration(duration: string): string {
    const minutes = this.parseDuration(duration);
    if (minutes === 0) return ''; // Return empty string for 0 duration
    if (minutes === 1) return '1 دقيقة';
    if (minutes < 60) return `${minutes} دقيقة`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return hours === 1 ? '1 ساعة' : `${hours} ساعة`;
    }

    return `${hours} ساعة و ${remainingMinutes} دقيقة`;
  }

  /**
   * Format total duration
   */
  private formatTotalDuration(totalMinutes: number): string {
    if (totalMinutes === 0) return ''; // Return empty string for 0 total duration
    if (totalMinutes === 1) return '1 دقيقة';
    if (totalMinutes < 60) return `${totalMinutes} دقيقة`;

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (remainingMinutes === 0) {
      return hours === 1 ? '1 ساعة' : `${hours} ساعة`;
    }

    return `${hours} ساعة و ${remainingMinutes} دقيقة`;
  }

  /**
   * Toggle FAQ expansion
   */
  toggleFAQ(faq: FAQ): void {
    faq.isExpanded = !faq.isExpanded;
  }

  /**
   * Toggle course unit expansion
   */
  toggleUnit(index: number): void {
    this.courseUnits[index].isExpanded = !this.courseUnits[index].isExpanded;
  }

  /**
   * Submit a new review
   */
  submitReview(): void {
    if (this.hasUserReviewed()) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'لقد قمت بتقييم هذه الدورة مسبقاً. يمكنك تعديل تقييمك الحالي.',
        life: 3000,
      });
      return;
    }

    if (this.newReview.rating > 0 && this.newReview.text.trim()) {
      const ratingValue = this.newReview.rating;
      const reviewData: ReviewRequest = {
        courseId: this.courseId,
        comment: this.newReview.text.trim(),
        reviewRating: this.newReview.rating,
      };

      // Post review to API
      this._homePageService.postCourseReview(reviewData).subscribe({
        next: (response: ReviewResponse) => {
          if (response.success) {
            // Add review to local list with the response data
            const newReview: Review = {
              id: response.id || this.reviews.length + 1,
              comment: this.newReview.text.trim(),
              reviewRating: this.newReview.rating,
              courseId: this.courseId,
              userId: response.userId,
              reactions: response.reactions,
              userName: this.userName,
              userImage:
                localStorage.getItem('userProfileImage') ||
                'assets/img/default-avatar.png',
              isEditable: true,
            };
            this.reviews.unshift(newReview);
            this.newReview = { rating: 0, text: '' };

            this._messageService.add({
              severity: 'success',
              summary: 'تم إضافة التقييم',
              detail: 'تم إضافة تقييمك بنجاح',
              life: 3000,
            });

            console.log('Review posted successfully:', response);

            this._analyticsService.trackCourseRated(
              this.courseId.toString(),
              this.course?.title || 'Unknown Course',
              ratingValue
            );
          } else {
            this._messageService.add({
              severity: 'error',
              summary: 'خطأ في إضافة التقييم',
              detail: response.message || 'حدث خطأ أثناء إضافة التقييم',
              life: 5000,
            });
            console.error('Failed to post review:', response.message);
          }
        },
        error: (error) => {
          console.error('Error posting review:', error);
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ في إضافة التقييم',
            detail: 'حدث خطأ أثناء إضافة التقييم',
            life: 5000,
          });
        },
      });
    } else {
      this._messageService.add({
        severity: 'warning',
        summary: 'تحذير',
        detail: 'يرجى إدخال التقييم والتعليق',
        life: 3000,
      });
    }
  }

  /**
   * Get average rating
   */
  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce(
      (sum, review) => sum + review.reviewRating,
      0
    );
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  /**
   * Get total reviews count
   */
  getTotalReviews(): number {
    return this.reviews.length;
  }

  /**
   * Track by function for reviews
   */
  trackByReviewId(index: number, review: Review): any {
    return review.id || index;
  }

  /**
   * Start editing a review
   */
  startEditReview(review: Review): void {
    this.editingReview = review;
    this.editReview = {
      rating: review.reviewRating,
      text: review.comment,
    };
  }

  /**
   * Cancel editing review
   */
  cancelEditReview(): void {
    this.editingReview = null;
    this.editReview = { rating: 0, text: '' };
  }

  /**
   * Save edited review
   */
  saveEditReview(): void {
    if (
      !this.editingReview ||
      this.editReview.rating <= 0 ||
      !this.editReview.text.trim()
    ) {
      this._messageService.add({
        severity: 'warning',
        summary: 'تحذير',
        detail: 'يرجى إدخال التقييم والتعليق',
        life: 3000,
      });
      return;
    }

    // Update the review in the local list
    const reviewIndex = this.reviews.findIndex(
      (r) => r.id === this.editingReview!.id
    );
    const updatedRating = this.editReview.rating;
    if (reviewIndex !== -1) {
      this.reviews[reviewIndex].reviewRating = updatedRating;
      this.reviews[reviewIndex].comment = this.editReview.text.trim();
    }

    // Reset editing state
    this.editingReview = null;
    this.editReview = { rating: 0, text: '' };

    this._messageService.add({
      severity: 'success',
      summary: 'تم التحديث',
      detail: 'تم تحديث التقييم بنجاح',
      life: 3000,
    });

    this._analyticsService.trackCourseRated(
      this.courseId.toString(),
      this.course?.title || 'Unknown Course',
      updatedRating
    );
  }

  /**
   * Delete a review
   */
  deleteReview(review: Review): void {
    const reviewIndex = this.reviews.findIndex((r) => r.id === review.id);
    if (reviewIndex !== -1) {
      this.reviews.splice(reviewIndex, 1);

      this._messageService.add({
        severity: 'success',
        summary: 'تم الحذف',
        detail: 'تم حذف التقييم بنجاح',
        life: 3000,
      });
    }
  }

  /**
   * Reload course details
   */
  loadCourse(): void {
    this.loadCourseDetails();
  }

  /**
   * Get course intro text (Arabic)
   */
  getCourseIntro(): string {
    return this.courseDetails?.introAr || this.course?.description || '';
  }

  /**
   * Get why choose this course text (Arabic)
   */
  getWhyChooseText(): string {
    return this.courseDetails?.whyChooseAr || '';
  }

  /**
   * Get suitable for text (Arabic)
   */
  getSuitableForText(): string {
    return this.courseDetails?.suitableForAr || '';
  }

  /**
   * Check if user is enrolled in this course
   */
  private checkEnrollmentStatus(): void {
    this.isEnrolled = this._enrollmentService.isEnrolledInCourse(this.courseId);
    console.log('=== ENROLLMENT STATUS CHECK ===');
    console.log('Course ID:', this.courseId);
    console.log('Is Enrolled:', this.isEnrolled);
    console.log('===============================');

    // If enrolled, load course tracker data and completion status
    if (this.isEnrolled) {
      this.loadCourseTracker();
      this.loadCourseCompletionStatus();
    }
  }

  /**
   * Load course tracker data for enrolled course
   */
  private loadCourseTracker(): void {
    this._homePageService.getCourseTracker(this.courseId).subscribe({
      next: (tracker: CourseTracker) => {
        this.courseTracker = tracker;
        console.log('Course tracker loaded:', tracker);
      },
      error: (error) => {
        console.error('Error loading course tracker:', error);
        // Don't show error to user, just log it
      },
    });
  }

  /**
   * Load course completion status
   */
  private loadCourseCompletionStatus(): void {
    this.courseCompletionLoading = true;
    this._homePageService.isCourseCompleted(this.courseId).subscribe({
      next: (isCompleted: boolean) => {
        this.courseCompleted = isCompleted;
        this.courseCompletionLoading = false;
        console.log('Course completion status loaded:', isCompleted);
      },
      error: (error) => {
        console.error('Error loading course completion status:', error);
        this.courseCompletionLoading = false;
        // Don't show error to user, just log it
      },
    });
  }

  /**
   * Update enrollment status manually
   */
  private updateEnrollmentStatus(): void {
    // Force refresh enrolled courses
    this._enrollmentService.refreshEnrolledCourses();

    // Subscribe to enrolled courses to get the updated status
    this._enrollmentService.getEnrolledCourses().subscribe({
      next: () => {
        // Update local status based on actual enrolled courses
        this.isEnrolled = this._enrollmentService.isEnrolledInCourse(
          this.courseId
        );

        // Load course tracker and completion status if enrolled
        if (this.isEnrolled) {
          this.loadCourseTracker();
          this.loadCourseCompletionStatus();
        }

        this._cdr.detectChanges();
        console.log('Updated enrollment status:', this.isEnrolled);
      },
      error: (error) => {
        console.error('Error updating enrollment status:', error);
        // Fallback: check status anyway
        this.isEnrolled = this._enrollmentService.isEnrolledInCourse(
          this.courseId
        );

        // Load course tracker and completion status if enrolled
        if (this.isEnrolled) {
          this.loadCourseTracker();
          this.loadCourseCompletionStatus();
        }

        this._cdr.detectChanges();
      },
    });
  }

  /**
   * Enroll in the course
   */
  enrollInCourse(): void {
    if (this.isEnrolled) {
      this._messageService.add({
        severity: 'info',
        summary: 'معلومات',
        detail: 'أنت مسجل بالفعل في هذه الدورة',
        life: 5000,
      });
      return;
    }

    this.enrollmentLoading = true;
    this._enrollmentService.enrollInCourse(this.courseId).subscribe({
      next: (response) => {
        this.enrollmentLoading = false;

        if (response.success) {
          // Update enrollment status immediately
          this.isEnrolled = true;

          // Force change detection first
          this._cdr.detectChanges();
          console.log(
            'Enrollment successful, updating UI. isEnrolled:',
            this.isEnrolled
          );

          // Track enrollment event in Google Tag Manager
          this._analyticsService.trackCourseEnrolled(
            this.courseId.toString(),
            this.course?.title || 'Unknown Course',
            this.course?.courseLevel || this.course?.level || 'Unknown',
            this.getCourseType(),
            this.course?.rating
          );

          // Force update the enrollment service (this will further update status)
          this.updateEnrollmentStatus();

          this._messageService.add({
            severity: 'success',
            summary: 'نجح التسجيل',
            detail: 'تم تسجيلك في الدورة بنجاح!',
            life: 5000,
          });
        } else {
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ في التسجيل',
            detail: response.message || 'حدث خطأ أثناء التسجيل في الدورة',
            life: 5000,
          });
        }
      },
      error: (error) => {
        this.enrollmentLoading = false;

        // Check if it's actually a success (HTTP 200 but caught as error)
        if (error.status === 200 || error.statusText === 'OK') {
          // Update enrollment status immediately
          this.isEnrolled = true;

          // Force change detection first
          this._cdr.detectChanges();
          console.log(
            'Enrollment successful (via error handler), updating UI. isEnrolled:',
            this.isEnrolled
          );

          // Track enrollment event in Google Tag Manager
          this._analyticsService.trackCourseEnrolled(
            this.courseId.toString(),
            this.course?.title || 'Unknown Course',
            this.course?.courseLevel || this.course?.level || 'Unknown',
            this.getCourseType(),
            this.course?.rating
          );

          // Force update the enrollment service (this will further update status)
          this.updateEnrollmentStatus();

          this._messageService.add({
            severity: 'success',
            summary: 'نجح التسجيل',
            detail: 'تم تسجيلك في الدورة بنجاح!',
            life: 5000,
          });
        } else {
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ في التسجيل',
            detail: 'حدث خطأ أثناء التسجيل في الدورة',
            life: 5000,
          });
        }
      },
    });
  }

  /**
   * Get button text based on enrollment status
   */
  getButtonText(): string {
    if (this.enrollmentLoading) {
      return 'جاري التسجيل...';
    }

    if (this.isEnrolled) {
      // Check if course is completed
      if (this.courseCompleted) {
        return 'تم الانتهاء من الدورة';
      }
      // Check if course has been started (has tracker data)
      if (
        this.courseTracker &&
        this.courseTracker.data &&
        this.courseTracker.data !== 'not attempted'
      ) {
        return 'كمل الدورة';
      }
      return 'ابدأ الدورة';
    } else {
      return 'سجل في الدورة';
    }
  }

  /**
   * Start course (enroll first if not enrolled)
   */
  startCourse(): void {
    if (!this.isEnrolled) {
      this.enrollInCourse();
    } else if (this.courseCompleted) {
      // If course is completed, scroll to certificate section
      this.scrollToCertificateSection();
    } else {
      // Open course in new window with SCORM player
      this.openCourseInNewWindow();
    }
  }

  /**
   * Open course in new window with SCORM player
   */
  private openCourseInNewWindow(): void {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'لم يتم العثور على رمز المصادقة',
        life: 5000,
      });
      return;
    }

    // Construct URL with query parameters
    const scormPlayerUrl =
      'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/scormplayer';
    const urlWithParams = `${scormPlayerUrl}?token=${encodeURIComponent(
      token
    )}&courseId=${this.courseId}`;

    // Open in new window
    const newWindow = window.open(
      urlWithParams,
      '_blank',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );

    if (!newWindow) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail:
          'تم منع فتح النافذة الجديدة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.',
        life: 5000,
      });
    } else {
      this._messageService.add({
        severity: 'success',
        summary: 'تم فتح الدورة',
        detail: 'تم فتح الدورة في نافذة جديدة',
        life: 3000,
      });
    }
  }

  /**
   * Get course image with fallback to default
   */
  getCourseImage(): string {
    return this.course?.img || 'assets/img/homePagecourse.png';
  }

  /**
   * Get course progress percentage
   */
  getCourseProgress(): number {
    if (!this.courseTracker) return 0;

    // If course is completed (from API), return 100%
    if (this.courseCompleted) return 100;

    // If course tracker indicates completion, return 100%
    if (this.courseTracker.isCompleted) return 100;

    // If data indicates some progress, return a reasonable percentage
    // This depends on how the SCORM data is structured
    if (
      this.courseTracker.data &&
      this.courseTracker.data !== 'not attempted'
    ) {
      // Parse progress from data if available, otherwise return 50% as started
      return 50;
    }

    return 0;
  }

  /**
   * Check if course is completed
   */
  isCourseCompleted(): boolean {
    return this.courseTracker?.isCompleted || false;
  }

  /**
   * Get course status text
   */
  getCourseStatusText(): string {
    if (!this.isEnrolled) return '';
    if (!this.courseTracker) return 'جاري التحميل...';

    if (this.courseTracker.isCompleted) {
      return 'مكتملة';
    } else if (
      this.courseTracker.data &&
      this.courseTracker.data !== 'not attempted'
    ) {
      return 'في التقدم';
    } else {
      return 'لم تبدأ';
    }
  }

  /**
   * Get course completion status text
   */
  getCourseCompletionStatusText(): string {
    if (!this.isEnrolled) return '';
    if (this.courseCompletionLoading) return 'جاري التحميل...';

    return this.courseCompleted ? 'مكتملة' : 'غير مكتملة';
  }

  /**
   * Get course completion status icon
   */
  getCourseCompletionStatusIcon(): string {
    if (!this.isEnrolled) return '';
    if (this.courseCompletionLoading) return 'pi pi-spinner pi-spin';

    return this.courseCompleted ? 'pi pi-check-circle' : 'pi pi-clock';
  }

  /**
   * Get course completion status class
   */
  getCourseCompletionStatusClass(): string {
    if (!this.isEnrolled) return '';
    if (this.courseCompletionLoading) return 'loading';

    return this.courseCompleted ? 'completed' : 'in-progress';
  }

  /**
   * Get total number of lessons
   */
  getTotalLessons(): number {
    return this.course?.lessons?.length || 0;
  }

  /**
   * Get total course duration
   */
  getTotalCourseDuration(): string {
    if (!this.course?.lessons || this.course.lessons.length === 0) {
      return '';
    }

    return this.calculateTotalDuration(this.course.lessons);
  }

  /**
   * Load user name from localStorage or profile
   */
  private loadUserName(): void {
    // Try to get user name from localStorage first
    const storedUserName = localStorage.getItem('userFullName');
    if (storedUserName) {
      this.userName = storedUserName;
      return;
    }

    // Try to get first and last name separately
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    if (firstName && lastName) {
      this.userName = `${firstName} ${lastName}`;
      return;
    } else if (firstName) {
      this.userName = firstName;
      return;
    }

    // Fallback to a default name
    this.userName = 'المستخدم';
  }

  /**
   * Get user name for review
   */
  private getUserNameForReview(review: any): string {
    // If review has user object with name information
    if (review.user && review.user.firstName) {
      const firstName = review.user.firstName || '';
      const lastName = review.user.lastName || '';
      const middleName = review.user.middleName || '';

      // Build full name
      let fullName = firstName;
      if (middleName) {
        fullName += ` ${middleName}`;
      }
      if (lastName) {
        fullName += ` ${lastName}`;
      }

      return fullName.trim() || 'المستخدم';
    }

    // If it's a new review (no userId or matches current user), use current user name
    if (!review.userId || this.isCurrentUserReview(review)) {
      return this.userName || 'المستخدم';
    }

    // For other users, use default
    return 'مستخدم آخر';
  }

  /**
   * Get user image for review
   */
  private getUserImageForReview(review: any): string {
    // If review has user object with image information
    if (review.user && review.user.image) {
      return review.user.image;
    }

    // If it's a new review (no userId or matches current user), use current user image
    if (!review.userId || this.isCurrentUserReview(review)) {
      return (
        localStorage.getItem('userProfileImage') ||
        'assets/img/default-avatar.png'
      );
    }

    // For other users, use default image
    return 'assets/img/default-avatar.png';
  }

  /**
   * Check if review is editable by current user
   */
  private isReviewEditable(review: any): boolean {
    // Check if this review belongs to current user
    return this.isCurrentUserReview(review);
  }

  /**
   * Check if review belongs to current user
   */
  private isCurrentUserReview(review: any): boolean {
    const currentUserId = localStorage.getItem('userId');

    // Check if review has user object with userId
    if (review.user && review.user.userId) {
      return !!(currentUserId && currentUserId === review.user.userId);
    }

    // Fallback to old userId field
    // Fallback to old userId field
    if (currentUserId && review.userId && currentUserId === review.userId) {
      return true;
    }

    // CHECK BY NAME as requested by user (since userId might be missing/unreliable)
    // Note: This relies on unique names which might not be guaranteed, but is required per specific user request.
    if (review.user && review.user.name && this.userName) {
      return review.user.name.trim() === this.userName.trim();
    }

    return false;
  }

  /**
   * Check if current user has already reviewed the course
   */
  hasUserReviewed(): boolean {
    return this.reviews.some((review) => !!review.isEditable);
  }

  /**
   * Download course completion certificate
   */
  downloadCertificate(): void {
    if (!this.courseCompleted) {
      this._messageService.add({
        severity: 'warning',
        summary: 'تحذير',
        detail: 'يجب إكمال الدورة أولاً للحصول على الشهادة',
        life: 5000,
      });
      return;
    }

    this.certificateLoading = true;

    const certificateData: CertificateData = {
      userName: this.userName,
      courseName: this.course?.title || 'الدورة التدريبية',
      completionDate: this._certificateService.getCurrentDateInArabic(),
      message:
        'تهانينا على إتمامك هذه الدورة التدريبية بنجاح. نتمنى لك التوفيق في مسيرتك المهنية.',
    };

    this._certificateService
      .generateCertificate(certificateData)
      .then(() => {
        this.certificateLoading = false;

        // Track course completion event in Google Tag Manager
        this._analyticsService.trackCourseCompleted(
          this.courseId.toString(),
          this.course?.title || 'Unknown Course'
        );

        this._analyticsService.trackCertificatePrint(
          this.courseId.toString(),
          this.course?.title || 'Unknown Course'
        );

        // Track certificate download for API analytics
        this._analyticsService
          .trackCertificateDownload(this.courseId)
          .subscribe({
            next: () => {
              // Successfully tracked
            },
            error: (error) => {
              // Silently handle errors to not disrupt user experience
              console.error('Error tracking certificate download:', error);
            },
          });

        this._messageService.add({
          severity: 'success',
          summary: 'تم تحميل الشهادة',
          detail: 'تم تحميل شهادة إتمام الدورة بنجاح',
          life: 5000,
        });
      })
      .catch((error) => {
        this.certificateLoading = false;
        console.error('Error downloading certificate:', error);
        this._messageService.add({
          severity: 'error',
          summary: 'خطأ في تحميل الشهادة',
          detail: error.message || 'حدث خطأ أثناء تحميل الشهادة',
          life: 5000,
        });
      });
  }

  /**
   * Get button CSS class based on course status
   */
  getButtonClass(): string {
    if (this.enrollmentLoading) {
      return 'btn btn-primary btn-lg launch-btn me-3';
    }

    if (this.isEnrolled) {
      if (this.courseCompleted) {
        return 'btn btn-success btn-lg launch-btn me-3';
      }
      return 'btn btn-primary btn-lg launch-btn me-3';
    } else {
      return 'btn btn-primary btn-lg launch-btn me-3';
    }
  }

  /**
   * Scroll to certificate section
   */
  private scrollToCertificateSection(): void {
    const certificateSection = document.querySelector('.certificate-section');
    if (certificateSection) {
      certificateSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      // If certificate section is not found, show message
      this._messageService.add({
        severity: 'info',
        summary: 'معلومات',
        detail: 'قسم الشهادة غير متاح حالياً',
        life: 3000,
      });
    }
  }

  /**
   * Derive course type for analytics tracking
   */
  private getCourseType(): CourseType {
    const priceValue = this.course?.price;

    if (typeof priceValue === 'number') {
      return priceValue > 0 ? 'paid' : 'free';
    }

    const priceText = priceValue?.toLowerCase?.() ?? '';

    if (
      !priceText ||
      priceText.includes('free') ||
      priceText.includes('مجاني')
    ) {
      return 'free';
    }

    if (priceText.includes('premium')) {
      return 'premium';
    }

    return 'paid';
  }
}
