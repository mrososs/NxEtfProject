import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  catchError,
  throwError,
  tap,
  map,
} from 'rxjs';
// import { DialogService } from './dialog.service';
// import { ToastService } from './toast.service';

export interface Enrollment {
  id: number;
  courseId: number;
  userId: number;
  enrollmentDate: string;
  status: string;
  course?: {
    id: number;
    title: string;
    description: string;
    img: string;
    level: string;
    duration: string;
    instructor: string;
    launchUrl?: string;
  };
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: Enrollment | null;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private _http = inject(HttpClient);
  // private _dialogService = inject(DialogService);
  // private _toastService = inject(ToastService);
  private readonly baseUrl = 'api/Enrollment';

  // BehaviorSubject to track enrolled courses
  private _enrolledCourses = new BehaviorSubject<Enrollment[]>([]);
  public enrolledCourses$ = this._enrolledCourses.asObservable();

  constructor() {
    // Load enrolled courses on service initialization
    this.loadEnrolledCourses();
  }

  /**
   * Get all enrolled courses for the current user
   */
  getEnrolledCourses(): Observable<Enrollment[]> {
    const headers = this.getAuthHeaders();
    return this._http.get<Enrollment[]>(this.baseUrl, { headers }).pipe(
      tap((enrollments) => {
        this._enrolledCourses.next(enrollments);
        console.log('Enrolled courses loaded:', enrollments);
      }),
      catchError((error) => {
        console.error('Error fetching enrolled courses:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Enroll in a course
   */
  enrollInCourse(courseId: number): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}?courseId=${courseId}`;

    return this._http.post<EnrollmentResponse>(url, {}, { headers }).pipe(
      tap((response) => {
        console.log('Enrollment API response:', response);
        // TODO: Show success toast when ToastService is available
        console.log('تم التسجيل في الدورة بنجاح');
        // Reload enrolled courses after successful enrollment
        this.loadEnrolledCourses();
      }),
      map((response) => {
        // Handle different response structures
        if (response.success !== undefined) {
          return response as EnrollmentResponse;
        } else {
          // Default success response
          return {
            success: true,
            message: 'تم التسجيل بنجاح',
            data: response.data || null,
          } as EnrollmentResponse;
        }
      }),
      catchError((error) => {
        console.error('Error enrolling in course:', error);
        // TODO: Show error toast when ToastService is available
        console.error('حدث خطأ أثناء التسجيل في الدورة');
        return throwError(() => error);
      })
    );
  }

  /**
   * Unenroll from a course (delete enrollment)
   */
  unenrollFromCourse(enrollmentId: number): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/${enrollmentId}`;

    return this._http.delete(url, { headers, observe: 'response' }).pipe(
      tap((response) => {
        console.log('Unenroll API response:', response);
        // 204 No Content means successful deletion
        if (response.status === 204) {
          console.log('Successfully unenrolled from course:', enrollmentId);
          // TODO: Show success toast when ToastService is available
          console.log('تم إلغاء التسجيل بنجاح');
          // Reload enrolled courses after successful unenrollment
          this.loadEnrolledCourses();
        }
      }),
      map((response) => {
        // Handle 204 No Content response
        if (response.status === 204) {
          return {
            success: true,
            message: 'تم إلغاء التسجيل بنجاح',
            data: null,
          } as EnrollmentResponse;
        }

        // Handle other successful responses
        return {
          success: true,
          message: 'تم إلغاء التسجيل بنجاح',
          data: null,
        } as EnrollmentResponse;
      }),
      catchError((error) => {
        console.error('Error unenrolling from course:', error);
        // TODO: Show error toast when ToastService is available
        console.error('حدث خطأ أثناء إلغاء التسجيل');
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user is enrolled in a specific course
   */
  isEnrolledInCourse(courseId: number): boolean {
    const enrolledCourses = this._enrolledCourses.value;
    const isEnrolled = enrolledCourses.some(
      (enrollment) => enrollment.courseId === courseId
    );

    console.log('=== IS ENROLLED IN COURSE CHECK ===');
    console.log('Course ID:', courseId);
    console.log('Enrolled Courses:', enrolledCourses);
    console.log('Is Enrolled:', isEnrolled);
    console.log('===================================');

    return isEnrolled;
  }

  /**
   * Get enrolled course by ID
   */
  getEnrolledCourse(courseId: number): Enrollment | undefined {
    const enrolledCourses = this._enrolledCourses.value;
    return enrolledCourses.find(
      (enrollment) => enrollment.courseId === courseId
    );
  }

  /**
   * Load enrolled courses and update the BehaviorSubject
   */
  private loadEnrolledCourses(): void {
    this.getEnrolledCourses().subscribe({
      next: (enrollments) => {
        this._enrolledCourses.next(enrollments);
      },
      error: (error) => {
        console.error('Failed to load enrolled courses:', error);
        // Keep existing enrollments on error
      },
    });
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  /**
   * Refresh enrolled courses (public method for manual refresh)
   */
  refreshEnrolledCourses(): void {
    this.loadEnrolledCourses();
  }

  /**
   * Get current enrolled courses value
   */
  getCurrentEnrolledCourses(): Enrollment[] {
    return this._enrolledCourses.value;
  }
}
