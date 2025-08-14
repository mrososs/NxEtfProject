import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';
import {
  EnrollmentService,
  Enrollment,
} from '../courses/services/enrollment.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BannerComponent } from '../../shared/components/banner/banner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    BannerComponent,
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  userCourses: any[] = [];
  enrolledCourses: Enrollment[] = [];
  enrollmentLoading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private enrollmentService: EnrollmentService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadEnrolledCourses();
  }

  /**
   * Check if we're currently preventing API calls due to recent redirect
   */
  isInRedirectPreventionMode(): boolean {
    return this.profileService.isInRedirectPreventionMode();
  }

  /**
   * Check if we're currently preventing API calls due to 500 error
   */
  isIn500ErrorMode(): boolean {
    return this.profileService.isIn500ErrorMode();
  }

  /**
   * Load user profile with redirect prevention handling
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.isEditMode = true;
          this.profileForm.patchValue({
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            description: profile.description || '',
          });

          // Handle courses data
          if (profile.courses && Array.isArray(profile.courses)) {
            this.userCourses = profile.courses;
            console.log('User courses loaded:', this.userCourses);
          }
        } else {
          // No profile exists, 500 error occurred, or API call was skipped to prevent infinite loop
          this.isEditMode = false;
          this.profileForm.reset();
          this.userCourses = [];

          // Show appropriate message based on the situation
          if (this.isIn500ErrorMode()) {
            this.messageService.add({
              severity: 'warn',
              summary: 'تنبيه',
              detail:
                'حدث خطأ في الخادم. يرجى إدخال بيانات الملف الشخصي للمتابعة',
            });
          } else {
            this.messageService.add({
              severity: 'info',
              summary: 'معلومات',
              detail: 'يرجى إدخال بيانات الملف الشخصي للمتابعة',
            });
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;

        // For any error, stay in create mode and show appropriate message
        this.isEditMode = false;
        this.profileForm.reset();
        this.userCourses = [];

        // Show different messages based on error type
        if (error.status === 500) {
          this.messageService.add({
            severity: 'warn',
            summary: 'تنبيه',
            detail:
              'حدث خطأ في الخادم. يرجى إدخال بيانات الملف الشخصي للمتابعة',
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'معلومات',
            detail: 'يرجى إدخال بيانات الملف الشخصي للمتابعة',
          });
        }
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Add form fields as FormData (not JSON)
      formData.append(
        'FirstName',
        this.profileForm.get('firstName')?.value || ''
      );
      formData.append(
        'MiddleName',
        this.profileForm.get('middleName')?.value || ''
      );
      formData.append(
        'LastName',
        this.profileForm.get('lastName')?.value || ''
      );
      formData.append(
        'Description',
        this.profileForm.get('description')?.value || ''
      );

      // Note: Image upload removed as per requirements

      // Use the simplified postProfile method
      this.profileService.postProfile(formData).subscribe({
        next: (response) => {
          // Save user name to localStorage for homepage display
          const firstName = this.profileForm.get('firstName')?.value;
          const lastName = this.profileForm.get('lastName')?.value;
          if (firstName && lastName) {
            const fullName = `${firstName} ${lastName}`.trim();
            localStorage.setItem('userFullName', fullName);
            localStorage.setItem('userFirstName', firstName);
            localStorage.setItem('userLastName', lastName);
            console.log(
              'User name saved to localStorage after profile update:',
              fullName
            );
          }

          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: this.isEditMode
              ? 'تم تحديث الملف الشخصي بنجاح'
              : 'تم إنشاء الملف الشخصي بنجاح',
          });

          // Reset redirect flags to allow normal API calls again
          this.profileService.resetRedirectFlags();

          // Refresh profile data to get updated information
          this.refreshProfileData();

          // Refresh the page after successful operation
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: (error) => {
          console.error('Profile operation failed:', error);
          this.isLoading = false;

          // Handle different error types with specific messages
          if (error.status === 500) {
            this.messageService.add({
              severity: 'warn',
              summary: 'تنبيه',
              detail:
                'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى أو التأكد من صحة البيانات',
            });
          } else if (error.status === 401 || error.status === 403) {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ في المصادقة',
              detail: 'يرجى إعادة تسجيل الدخول',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'حدث خطأ أثناء حفظ الملف الشخصي',
            });
          }

          // Redirect will be handled by ProfileService for auth errors
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Refresh profile data from cache
   */
  private refreshProfileData(): void {
    this.profileService.refreshProfile().subscribe({
      next: (profile) => {
        if (profile) {
          // Update form with fresh data
          this.profileForm.patchValue({
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            description: profile.description || '',
          });

          // Update courses data
          if (profile.courses && Array.isArray(profile.courses)) {
            this.userCourses = profile.courses;
            console.log('User courses refreshed:', this.userCourses);
          }
        }
      },
      error: (error) => {
        console.error('Error refreshing profile:', error);
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['minlength']) {
        return `يجب أن يكون الحقل على الأقل ${field.errors['minlength'].requiredLength} أحرف`;
      }
    }
    return '';
  }

  /**
   * Load enrolled courses
   */
  loadEnrolledCourses(): void {
    this.enrollmentLoading = true;
    this.enrollmentService.getEnrolledCourses().subscribe({
      next: (enrollments) => {
        this.enrolledCourses = enrollments;
        this.enrollmentLoading = false;
        console.log('Enrolled courses loaded:', enrollments);
      },
      error: (error) => {
        console.error('Error loading enrolled courses:', error);
        this.enrollmentLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ في تحميل الدورات المسجلة',
        });
      },
    });
  }

  /**
   * Delete enrollment from a course
   */
  deleteEnrollment(enrollmentId: number): void {
    this.enrollmentService.unenrollFromCourse(enrollmentId).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: 'تم حذف التسجيل من الدورة بنجاح',
          });
          // Refresh enrolled courses
          this.loadEnrolledCourses();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: response.message || 'حدث خطأ في حذف التسجيل',
          });
        }
      },
      error: (error) => {
        console.error('Error deleting enrollment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ في حذف التسجيل من الدورة',
        });
      },
    });
  }

  /**
   * Launch a course using the provided URL
   */
  launchCourse(launchUrl: string): void {
    if (launchUrl) {
      // Open course in new tab/window
      window.open(launchUrl, '_blank');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'رابط الدورة غير متاح',
      });
    }
  }
}
