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

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
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
  }

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
          // No profile exists, stay in create mode
          this.isEditMode = false;
          this.profileForm.reset();
          this.userCourses = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
        // If error occurs, stay in create mode
        this.isEditMode = false;
        this.profileForm.reset();
        this.userCourses = [];
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Add form fields only (no image)
      formData.append('FirstName', this.profileForm.get('firstName')?.value);
      formData.append('MiddleName', this.profileForm.get('middleName')?.value);
      formData.append('LastName', this.profileForm.get('lastName')?.value);
      formData.append(
        'Description',
        this.profileForm.get('description')?.value
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

          // Refresh profile data to get updated information
          this.refreshProfileData();

          // Refresh the page after successful operation
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: (error) => {
          console.error('Profile operation failed:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء حفظ الملف الشخصي',
          });
          this.isLoading = false;
          // Redirect will be handled by ProfileService
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
