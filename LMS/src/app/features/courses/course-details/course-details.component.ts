import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { CourseTrackerService } from '../services/course-tracker.service';
import { ScormCommunicationService } from '../services/scorm-communication.service';
import { EnrollmentService, Enrollment } from '../services/enrollment.service';
import { Course } from '../model/course.model';
import { CourseProgress } from '../model/course-tracker.model';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  notHelpful: number;
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

interface CourseApiResponse {
  id: number;
  title: string;
  description: string;
  launchUrl: string;
  uploadedAt: string;
  reviews: any[];
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
  private _homePageService = inject(HomePageService);
  private _courseTrackerService = inject(CourseTrackerService);
  private _scormCommunicationService = inject(ScormCommunicationService);
  private _enrollmentService = inject(EnrollmentService);
  private _messageService = inject(MessageService);
  private _http = inject(HttpClient);
  private _sanitizer = inject(DomSanitizer);

  course!: Course;
  courseDetails!: CourseDetails;
  loading = true;
  error = false;
  courseId!: number;
  courseProgress!: CourseProgress;
  trackingInitialized = false;
  courseWindow: Window | null = null;

  // Course API Response
  courseApiData: CourseApiResponse | null = null;
  showIframe = false;
  iframeUrl: SafeResourceUrl | null = null;

  // Enrollment properties
  isEnrolled = false;
  enrollmentLoading = false;

  // Certificate properties
  certificateAvailable = false;
  certificateLoading = false;

  // Mock data for the comprehensive design
  reviews: Review[] = [
    {
      id: 1,
      name: 'أحمد محمد',
      avatar: 'assets/img/instructor-avatar.png',
      rating: 5,
      text: 'دورة ممتازة ومفيدة جداً، تعلمت الكثير من المعلومات القيمة في مجال الارشاد السياحي.',
      date: '2024-01-15',
      helpful: 12,
      notHelpful: 2,
    },
    {
      id: 2,
      name: 'سارة أحمد',
      avatar: 'assets/img/instructor-avatar.png',
      rating: 5,
      text: 'المحتوى منظم بشكل رائع والشرح واضح ومفصل. أنصح الجميع بهذه الدورة.',
      date: '2024-01-10',
      helpful: 8,
      notHelpful: 1,
    },
    {
      id: 3,
      name: 'محمد علي',
      avatar: 'assets/img/instructor-avatar.png',
      rating: 4,
      text: 'دورة جيدة جداً، ساعدتني في فهم أساسيات الارشاد السياحي.',
      date: '2024-01-05',
      helpful: 5,
      notHelpful: 0,
    },
  ];

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

  courseUnits: CourseUnit[] = [
    {
      id: 1,
      title: 'مقدمة في الارشاد السياحي',
      duration: '20 دقيقة',
      isExpanded: false,
      lessons: [
        { id: 1, title: 'ما هو الارشاد السياحي؟', duration: '5 دقائق' },
        { id: 2, title: 'أهمية الارشاد السياحي', duration: '8 دقائق' },
        { id: 3, title: 'مهارات المرشد السياحي', duration: '7 دقائق' },
      ],
    },
    {
      id: 2,
      title: 'التواصل مع السياح',
      duration: '30 دقيقة',
      isExpanded: false,
      lessons: [
        { id: 4, title: 'أساسيات التواصل', duration: '10 دقائق' },
        { id: 5, title: 'التعامل مع الثقافات المختلفة', duration: '12 دقائق' },
        { id: 6, title: 'حل المشاكل والمواقف الصعبة', duration: '8 دقائق' },
      ],
    },
    {
      id: 3,
      title: 'المعالم السياحية',
      duration: '45 دقيقة',
      isExpanded: false,
      lessons: [
        { id: 7, title: 'أنواع المعالم السياحية', duration: '15 دقيقة' },
        { id: 8, title: 'كيفية تقديم المعلومات', duration: '20 دقيقة' },
        { id: 9, title: 'التفاعل مع الزوار', duration: '10 دقائق' },
      ],
    },
  ];

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

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.courseId = +params['id'];
      this.loadCourseDetails();
      this.loadCourseProgress();
      this.loadCourseFromApi();

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
  }

  private loadCourseDetails(): void {
    this.loading = true;
    this.error = false;

    // Load course basic info
    this._homePageService.getCourseByIdFromApi(this.courseId, 'ar').subscribe({
      next: (course: Course) => {
        this.course = course;

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

  private loadCourseFromApi(): void {
    // Call the specific API endpoint
    const apiUrl = `api/Course/${this.courseId}`;

    this._http.get<CourseApiResponse>(apiUrl).subscribe({
      next: (data: CourseApiResponse) => {
        this.courseApiData = data;
        console.log('Course API Data:', data);
      },
      error: (err) => {
        console.error('Error fetching course from API:', err);
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

        // Initialize tracking when course is loaded
        this.initializeCourseTracking();
      },
      error: (err) => {
        console.error('Error fetching course details from API:', err);
        // Continue with mock data if API fails
        this.loading = false;
        this.initializeCourseTracking();
      },
    });
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

  private loadCourseProgress(): void {
    this._courseTrackerService.getCourseProgress(this.courseId).subscribe({
      next: (progress: CourseProgress) => {
        this.courseProgress = progress;
        console.log('=== COURSE PROGRESS LOADED ===');
        console.log('Progress:', progress);
        console.log('Status:', progress?.status);
        console.log('Completion Percentage:', progress?.completionPercentage);
        console.log('==============================');
        this.checkCertificateAvailability();
      },
      error: (err) => {
        console.error('Error loading course progress:', err);
        // Set default progress if API fails
        this.courseProgress = {
          courseId: this.courseId,
          userId: 1,
          elements: [],
          lastUpdated: new Date(),
          completionPercentage: 0,
          status: 'not_started',
        };
      },
    });
  }

  private checkCertificateAvailability(): void {
    this._courseTrackerService.isCertificateAvailable(this.courseId).subscribe({
      next: (available) => {
        this.certificateAvailable = available;
        console.log('Certificate available:', available);
      },
      error: (err) => {
        console.error('Error checking certificate availability:', err);
        this.certificateAvailable = false;
      },
    });
  }

  private async initializeCourseTracking(): Promise<void> {
    if (!this.trackingInitialized && this.course?.launchUrl) {
      try {
        await this._scormCommunicationService.initializeCourseTracking(
          this.courseId
        );
        this.trackingInitialized = true;
        console.log('Course tracking initialized successfully');

        // Subscribe to progress updates
        this._courseTrackerService.courseProgress$.subscribe((progress) => {
          if (progress && progress.courseId === this.courseId) {
            this.courseProgress = progress;
            console.log('Course progress updated:', progress);
          }
        });
      } catch (err) {
        console.error('Error initializing course tracking:', err);
      }
    }
  }

  // Launch course in iframe
  launchCourseInIframe(): void {
    if (this.courseApiData?.launchUrl) {
      // Add SCORM wrapper script to the course URL
      const courseUrl = this.courseApiData.launchUrl;
      const urlWithScript = this.addScormWrapperToUrl(courseUrl);

      this.iframeUrl =
        this._sanitizer.bypassSecurityTrustResourceUrl(urlWithScript);
      this.showIframe = true;
      console.log(
        'Launching course in iframe with SCORM wrapper:',
        urlWithScript
      );

      // Initialize SCORM communication after iframe loads
      setTimeout(() => {
        if (this.courseId) {
          console.log(
            'Initializing SCORM communication for course:',
            this.courseId
          );
          // Get the iframe window reference
          const iframe = document.querySelector('iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            this._scormCommunicationService.initializeScormCommunication(
              this.courseId,
              iframe.contentWindow
            );
          }
        }
      }, 3000); // Wait 3 seconds for iframe to load
    } else {
      console.error('No launch URL available for this course');
    }
  }

  // Close iframe
  closeIframe(): void {
    this.showIframe = false;
    this.iframeUrl = null;
  }

  // Add SCORM wrapper script to course URL
  private addScormWrapperToUrl(courseUrl: string): string {
    // Use the SCORM wrapper HTML page
    const wrapperUrl = `/assets/scorm-course-wrapper.html?courseUrl=${encodeURIComponent(
      courseUrl
    )}&courseId=${this.courseId}`;
    return wrapperUrl;
  }

  // Inject SCORM wrapper script into iframe
  private injectScormWrapper(iframe: HTMLIFrameElement): void {
    try {
      // Try to access iframe document (may fail due to CORS)
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        // Create script element for SCORM wrapper
        const script = iframeDoc.createElement('script');
        script.src = '/assets/scorm-wrapper.js';
        script.onload = () => {
          console.log('SCORM wrapper script loaded successfully');
        };
        script.onerror = () => {
          console.error('Failed to load SCORM wrapper script');
        };

        // Add script to iframe head
        iframeDoc.head.appendChild(script);
        console.log('SCORM wrapper script injected into iframe');
      } else {
        // If we can't access iframe document (CORS), send message to iframe
        console.log(
          'Cannot access iframe document, sending SCORM wrapper URL via postMessage'
        );
        iframe.contentWindow?.postMessage(
          {
            type: 'load_scorm_wrapper',
            scriptUrl: '/assets/scorm-wrapper.js',
          },
          '*'
        );
      }
    } catch (error) {
      console.error('Error injecting SCORM wrapper:', error);
      // Fallback: send message to iframe
      console.log('Fallback: sending SCORM wrapper URL via postMessage');
      iframe.contentWindow?.postMessage(
        {
          type: 'load_scorm_wrapper',
          scriptUrl: '/assets/scorm-wrapper.js',
        },
        '*'
      );
    }
  }

  // Launch course in new window (fallback)
  launchCourse(): void {
    if (this.courseApiData?.launchUrl) {
      // Initialize tracking before launching
      this.initializeCourseTracking();

      console.log('Launching SCORM course:', this.courseApiData.launchUrl);

      // Open the SCORM course in a new tab
      this.courseWindow = window.open(this.courseApiData.launchUrl, '_blank');

      if (this.courseWindow) {
        // Initialize SCORM communication
        this._scormCommunicationService.initializeScormCommunication(
          this.courseId,
          this.courseWindow
        );

        // Set up window close listener to refresh progress
        this.courseWindow.addEventListener('beforeunload', () => {
          this.loadCourseProgress();
        });
      }
    } else {
      console.error('No launch URL available for this course');
    }
  }

  /**
   * Get the full SCORM course URL
   * @returns The complete URL to the SCORM course index.html
   */
  getScormCourseUrl(): string {
    if (this.courseApiData?.launchUrl) {
      return this.courseApiData.launchUrl;
    }
    return '';
  }

  /**
   * Check if the course has a valid launch URL
   * @returns True if the course can be launched
   */
  canLaunchCourse(): boolean {
    return !!this.courseApiData?.launchUrl;
  }

  /**
   * Get course progress status
   * @returns The current progress status
   */
  getProgressStatus(): string {
    if (!this.courseProgress) return 'not_started';
    return this.courseProgress.status || 'not_started';
  }

  /**
   * Get course completion percentage
   * @returns The completion percentage
   */
  getCompletionPercentage(): number {
    console.log('=== GET COMPLETION PERCENTAGE ===');
    console.log('Course Progress:', this.courseProgress);
    console.log(
      'Completion Percentage:',
      this.courseProgress?.completionPercentage
    );
    console.log('=================================');

    if (!this.courseProgress) return 0;
    return this.courseProgress.completionPercentage || 0;
  }

  /**
   * Get progress status text in Arabic
   * @returns Arabic text for the progress status
   */
  getProgressStatusText(): string {
    const status = this.getProgressStatus();
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
    if (this.newReview.rating > 0 && this.newReview.text.trim()) {
      const reviewData: ReviewRequest = {
        courseId: this.courseId,
        comment: this.newReview.text.trim(),
        reviewRating: this.newReview.rating,
      };

      // Post review to API
      this._homePageService.postCourseReview(reviewData).subscribe({
        next: (response: ReviewResponse) => {
          if (response.success) {
            // Add review to local list
            const review: Review = {
              id: this.reviews.length + 1,
              name: 'مستخدم جديد',
              avatar: 'assets/img/instructor-avatar.png',
              rating: this.newReview.rating,
              text: this.newReview.text,
              date: new Date().toISOString().split('T')[0],
              helpful: 0,
              notHelpful: 0,
            };
            this.reviews.unshift(review);
            this.newReview = { rating: 0, text: '' };

            console.log('Review posted successfully:', response.message);
          } else {
            console.error('Failed to post review:', response.message);
          }
        },
        error: (error) => {
          console.error('Error posting review:', error);
        },
      });
    }
  }

  /**
   * Get average rating
   */
  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  /**
   * Get total reviews count
   */
  getTotalReviews(): number {
    return this.reviews.length;
  }

  /**
   * Reload course details
   */
  loadCourse(): void {
    this.loadCourseDetails();
  }

  /**
   * Refresh course progress from CourseTracker API
   */
  refreshCourseProgress(): void {
    if (this.courseId) {
      this._courseTrackerService.getCourseProgress(this.courseId).subscribe({
        next: (progress) => {
          this.courseProgress = progress;
          console.log('Course progress refreshed:', progress);

          // Show success message
          this._messageService.add({
            severity: 'success',
            summary: 'تم تحديث التقدم',
            detail: 'تم تحديث تقدم الدورة بنجاح',
          });
        },
        error: (err) => {
          console.error('Error refreshing course progress:', err);
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ في تحديث التقدم',
            detail: 'حدث خطأ أثناء تحديث تقدم الدورة',
          });
        },
      });
    }
  }

  /**
   * Get tracked elements for display
   */
  getTrackedElements(): any[] {
    if (!this.courseProgress?.elements) return [];

    return this.courseProgress.elements.map((element) => ({
      name: this.getElementDisplayName(element.name),
      value: element.value,
      type: element.type,
      timestamp: element.timestamp,
    }));
  }

  /**
   * Get display name for SCORM element
   */
  private getElementDisplayName(elementName: string): string {
    const elementNames: { [key: string]: string } = {
      lesson_status: 'حالة الدرس',
      lesson_location: 'موقع الدرس',
      score: 'الدرجة',
      total_time: 'الوقت الإجمالي',
      suspend_data: 'بيانات الإيقاف المؤقت',
      completion_percentage: 'نسبة الإكمال',
      checkpoint: 'نقطة التحقق',
    };

    return elementNames[elementName] || elementName;
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
  }

  /**
   * Update enrollment status manually
   */
  private updateEnrollmentStatus(): void {
    // Force refresh and check status
    this._enrollmentService.refreshEnrolledCourses();
    setTimeout(() => {
      this.isEnrolled = this._enrollmentService.isEnrolledInCourse(
        this.courseId
      );
      console.log('Updated enrollment status:', this.isEnrolled);
    }, 500);
  }

  /**
   * Enroll in the course
   */
  enrollInCourse(): void {
    console.log('=== ENROLL IN COURSE CALLED ===');
    console.log('Course ID:', this.courseId);
    console.log('Is Enrolled:', this.isEnrolled);
    console.log('================================');

    if (this.isEnrolled) {
      this._messageService.add({
        severity: 'info',
        summary: 'معلومات',
        detail: 'أنت مسجل بالفعل في هذه الدورة',
      });
      return;
    }

    this.enrollmentLoading = true;
    this._enrollmentService.enrollInCourse(this.courseId).subscribe({
      next: (response) => {
        this.enrollmentLoading = false;
        console.log('Enrollment response in component:', response);

        if (response.success) {
          // Update enrollment status immediately
          this.isEnrolled = true;

          // Force refresh enrollment status and update UI
          this.updateEnrollmentStatus();

          // Add initial 10% progress when enrolling
          this.addInitialProgress();

          this._messageService.add({
            severity: 'success',
            summary: 'نجح التسجيل',
            detail: 'تم تسجيلك في الدورة بنجاح! يمكنك الآن بدء الدورة',
          });

          // Automatically launch course after successful enrollment
          setTimeout(() => {
            this.checkAndLaunchCourse();
          }, 1500);
        } else {
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ في التسجيل',
            detail: response.message || 'حدث خطأ أثناء التسجيل في الدورة',
          });
        }
      },
      error: (error) => {
        this.enrollmentLoading = false;
        console.error('Error enrolling in course:', error);

        // Check if it's actually a success (HTTP 200 but caught as error)
        if (error.status === 200 || error.statusText === 'OK') {
          this.isEnrolled = true;
          this.updateEnrollmentStatus();

          this._messageService.add({
            severity: 'success',
            summary: 'نجح التسجيل',
            detail: 'تم تسجيلك في الدورة بنجاح! يمكنك الآن بدء الدورة',
          });

          setTimeout(() => {
            this.checkAndLaunchCourse();
          }, 1500);
        } else {
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ في التسجيل',
            detail: 'حدث خطأ أثناء التسجيل في الدورة',
          });
        }
      },
    });
  }

  /**
   * Get button text based on enrollment status
   */
  getButtonText(): string {
    console.log('=== GET BUTTON TEXT ===');
    console.log('Enrollment Loading:', this.enrollmentLoading);
    console.log('Is Enrolled:', this.isEnrolled);
    console.log('Course Progress:', this.courseProgress);
    console.log('Course Progress Status:', this.courseProgress?.status);
    console.log('========================');

    if (this.enrollmentLoading) {
      return 'جاري التسجيل...';
    }

    if (this.isEnrolled) {
      // Check if user has progress
      if (this.courseProgress && this.courseProgress.status !== 'not_started') {
        return 'اكمل الدورة';
      } else {
        return 'ابدأ الدورة';
      }
    } else {
      return 'سجل في الدورة';
    }
  }

  /**
   * Add initial 10% progress when user enrolls
   */
  private addInitialProgress(): void {
    console.log('Adding initial 10% progress for course:', this.courseId);

    // Use the GET API to track progress
    this._courseTrackerService
      .trackProgressWithGet(this.courseId, 10)
      .subscribe({
        next: (response) => {
          console.log(
            'Initial progress tracked successfully with GET API:',
            response
          );
          // Reload course progress to update UI
          setTimeout(() => {
            this.loadCourseProgress();
          }, 1000);
        },
        error: (error) => {
          console.error('Error tracking initial progress with GET API:', error);
        },
      });

    // Also track lesson status
    this._courseTrackerService
      .trackLessonStatus(this.courseId, 'incomplete')
      .subscribe({
        next: (response) => {
          console.log('Initial lesson status tracked:', response);
        },
        error: (error) => {
          console.error('Error tracking initial lesson status:', error);
        },
      });
  }

  /**
   * Start course (enroll first if not enrolled)
   */
  startCourse(): void {
    console.log('=== START COURSE CALLED ===');
    console.log('Course ID:', this.courseId);
    console.log('Is Enrolled:', this.isEnrolled);
    console.log('============================');

    if (!this.isEnrolled) {
      console.log('User not enrolled, calling enrollInCourse()');
      this.enrollInCourse();
    } else {
      console.log('User already enrolled, calling checkAndLaunchCourse()');
      // Check if user has progress and resume from checkpoint
      this.checkAndLaunchCourse();
    }
  }

  /**
   * Check course progress and launch accordingly
   */
  private checkAndLaunchCourse(): void {
    if (this.courseProgress && this.courseProgress.status !== 'not_started') {
      // User has progress, resume from checkpoint
      this._messageService.add({
        severity: 'info',
        summary: 'استئناف الدورة',
        detail: 'سيتم استئناف الدورة من آخر نقطة توقف',
      });
      this.launchCourseInIframe();
    } else {
      // No progress, start from beginning
      this._messageService.add({
        severity: 'info',
        summary: 'بدء الدورة',
        detail: 'سيتم بدء الدورة من البداية',
      });
      this.launchCourseInIframe();
    }
  }

  /**
   * Download course certificate
   */
  downloadCertificate(): void {
    if (!this.certificateAvailable) {
      this._messageService.add({
        severity: 'warn',
        summary: 'الشهادة غير متاحة',
        detail: 'يجب إكمال الدورة بنسبة 100% لتحميل الشهادة',
      });
      return;
    }

    this.certificateLoading = true;
    this._courseTrackerService
      .downloadCourseCertificate(this.courseId)
      .subscribe({
        next: (blob) => {
          this.certificateLoading = false;

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-course-${this.courseId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this._messageService.add({
            severity: 'success',
            summary: 'تم تحميل الشهادة',
            detail: 'تم تحميل شهادة إتمام الدورة بنجاح',
          });
        },
        error: (error) => {
          this.certificateLoading = false;
          console.error('Error downloading certificate:', error);

          this._messageService.add({
            severity: 'error',
            summary: 'خطأ في تحميل الشهادة',
            detail: 'حدث خطأ أثناء تحميل الشهادة. يرجى المحاولة مرة أخرى.',
          });
        },
      });
  }

  /**
   * Check if certificate button should be shown
   */
  shouldShowCertificateButton(): boolean {
    return (
      this.certificateAvailable &&
      this.courseProgress &&
      this.courseProgress.status === 'completed' &&
      this.courseProgress.completionPercentage >= 100
    );
  }
}
