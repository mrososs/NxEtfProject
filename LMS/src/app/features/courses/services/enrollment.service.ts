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
  data?: Enrollment;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private _http = inject(HttpClient);
  private readonly baseUrl = 'http://etfapi.itechpro-eg.com/api/Enrollment';

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

    return this._http.post<any>(url, {}, { headers }).pipe(
      tap((response) => {
        console.log('Enrollment API response:', response);
        // Reload enrolled courses after successful enrollment
        this.loadEnrolledCourses();
      }),
      map((response) => {
        // Handle different response structures
        if (response.success !== undefined) {
          return response as EnrollmentResponse;
        } else if (response.status === 200 || response.statusCode === 200) {
          // If API returns 200 but no success field, treat as success
          return {
            success: true,
            message: 'تم التسجيل بنجاح',
            data: response.data || null,
          } as EnrollmentResponse;
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
        return throwError(() => error);
      })
    );
  }

  /**
   * Unenroll from a course (delete enrollment)
   */
  unenrollFromCourse(enrollmentId: number): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}?id=${enrollmentId}`;

    return this._http.delete<EnrollmentResponse>(url, { headers }).pipe(
      tap((response) => {
        if (response.success) {
          console.log('Successfully unenrolled from course:', enrollmentId);
          // Reload enrolled courses after successful unenrollment
          this.loadEnrolledCourses();
        }
      }),
      catchError((error) => {
        console.error('Error unenrolling from course:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user is enrolled in a specific course
   */
  isEnrolledInCourse(courseId: number): boolean {
    const enrolledCourses = this._enrolledCourses.value;
    return enrolledCourses.some(
      (enrollment) => enrollment.courseId === courseId
    );
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
