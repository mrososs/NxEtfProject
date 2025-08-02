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
import { FileUploadModule } from 'primeng/fileupload';
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
    FileUploadModule,
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
  profileImage: File | null = null;
  profileImageUrl: string | null = null;

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
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.isEditMode = true;
          this.profileForm.patchValue({
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            description: profile.description || '',
          });
          this.profileImageUrl = profile.imageUrl || null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
        // Redirect will be handled by ProfileService
        // If no profile exists, stay in create mode
      },
    });
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.profileImage = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Add form fields
      formData.append('FirstName', this.profileForm.get('firstName')?.value);
      formData.append('MiddleName', this.profileForm.get('middleName')?.value);
      formData.append('LastName', this.profileForm.get('lastName')?.value);
      formData.append(
        'Description',
        this.profileForm.get('description')?.value
      );

      // Add image if selected
      if (this.profileImage) {
        formData.append('Image', this.profileImage);
      }

      const operation = this.isEditMode
        ? this.profileService.updateProfile(formData)
        : this.profileService.createProfile(formData);

      operation.subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: this.isEditMode
              ? 'تم تحديث الملف الشخصي بنجاح'
              : 'تم إنشاء الملف الشخصي بنجاح',
          });

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
}
