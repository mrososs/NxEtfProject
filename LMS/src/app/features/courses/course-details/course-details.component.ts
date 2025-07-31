import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HomePageService } from '../services/home-page.service';
import { CourseTrackerService } from '../services/course-tracker.service';
import { ScormCommunicationService } from '../services/scorm-communication.service';
import { Course } from '../model/course.model';
import { CourseProgress } from '../model/course-tracker.model';

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

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss',
})
export class CourseDetailsComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _homePageService = inject(HomePageService);
  private _courseTrackerService = inject(CourseTrackerService);
  private _scormCommunicationService = inject(ScormCommunicationService);

  course!: Course;
  loading = true;
  error = false;
  courseId!: number;
  courseProgress!: CourseProgress;
  trackingInitialized = false;
  courseWindow: Window | null = null;

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
      icon: 'fas fa-check-circle',
    },
    {
      id: 2,
      text: 'تعلم مهارات التواصل مع السياح',
      icon: 'fas fa-check-circle',
    },
    {
      id: 3,
      text: 'اكتساب المعرفة بالمعالم السياحية',
      icon: 'fas fa-check-circle',
    },
    {
      id: 4,
      text: 'تطوير مهارات التخطيط للجولات السياحية',
      icon: 'fas fa-check-circle',
    },
    {
      id: 5,
      text: 'فهم الثقافات المختلفة وكيفية التعامل معها',
      icon: 'fas fa-check-circle',
    },
  ];

  courseRequirements: CourseRequirement[] = [
    { id: 1, text: 'لا توجد متطلبات مسبقة', icon: 'fas fa-info-circle' },
    { id: 2, text: 'الرغبة في التعلم والتطوير', icon: 'fas fa-heart' },
    { id: 3, text: 'إمكانية الوصول للإنترنت', icon: 'fas fa-wifi' },
    { id: 4, text: 'الوقت الكافي للدراسة', icon: 'fas fa-clock' },
  ];

  courseBenefits: CourseBenefit[] = [
    { id: 1, text: 'شهادة إتمام الدورة', icon: 'fas fa-certificate' },
    { id: 2, text: 'الوصول الدائم للمحتوى', icon: 'fas fa-infinity' },
    { id: 3, text: 'دعم فني متواصل', icon: 'fas fa-headset' },
    { id: 4, text: 'مجتمع تعليمي نشط', icon: 'fas fa-users' },
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
    });
  }

  private loadCourseDetails(): void {
    this.loading = true;
    this.error = false;

    this._homePageService.getCourseByIdFromApi(this.courseId, 'ar').subscribe({
      next: (course: Course) => {
        this.course = course;
        this.loading = false;
        // Initialize tracking when course is loaded
        this.initializeCourseTracking();
      },
      error: (err) => {
        console.error('Error fetching course details:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  private loadCourseProgress(): void {
    this._courseTrackerService.getCourseProgress(this.courseId).subscribe({
      next: (progress: CourseProgress) => {
        this.courseProgress = progress;
      },
      error: (err) => {
        console.error('Error loading course progress:', err);
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
      } catch (err) {
        console.error('Error initializing course tracking:', err);
      }
    }
  }

  launchCourse(): void {
    if (this.course?.launchUrl) {
      // Initialize tracking before launching
      this.initializeCourseTracking();

      // Construct the full URL to the SCORM course
      const baseUrl = window.location.origin;
      const scormUrl = `${baseUrl}${this.course.launchUrl}`;

      console.log('Launching SCORM course:', scormUrl);

      // Open the SCORM course in a new tab
      this.courseWindow = window.open(scormUrl, '_blank');

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
    if (this.course?.launchUrl) {
      const baseUrl = window.location.origin;
      return `${baseUrl}${this.course.launchUrl}`;
    }
    return '';
  }

  /**
   * Check if the course has a valid launch URL
   * @returns True if the course can be launched
   */
  canLaunchCourse(): boolean {
    return !!this.course?.launchUrl;
  }

  /**
   * Get course progress status
   * @returns The current progress status
   */
  getProgressStatus(): string {
    if (!this.courseProgress) return 'not_started';
    return this.courseProgress.status;
  }

  /**
   * Get course completion percentage
   * @returns The completion percentage
   */
  getCompletionPercentage(): number {
    if (!this.courseProgress) return 0;
    return this.courseProgress.completionPercentage;
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
   * Submit a new review
   */
  submitReview(): void {
    if (this.newReview.rating > 0 && this.newReview.text.trim()) {
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
}
